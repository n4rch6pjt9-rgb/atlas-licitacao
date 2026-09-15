import { publicGet, type PublicHttpResponse } from "../http.server.ts";
import type {
  ConnectorConfig,
  DiscoveryParams,
  PaginationType,
  SourcePlanningRecord,
  SourceProcurement,
} from "../types.ts";
import {
  applyNormalization,
  joinUrl,
  mapValue,
  type PublicProcurementSource,
} from "./contract.ts";

const ARRAY_KEYS = [
  "content",
  "conteudo",
  "data",
  "items",
  "editais",
  "resultados",
  "resultado",
  "dadosLicitacoes",
  "licitacoes",
  "result",
] as const;

const MAX_PAGES = 20;

export function extractJsonRecords(
  payload: unknown,
  responsePath?: string,
): unknown[] {
  if (responsePath) {
    const value = mapValue(payload, responsePath);
    if (Array.isArray(value)) return value;
    if (value == null) return [];
    return [value];
  }
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ARRAY_KEYS) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  for (const key of ARRAY_KEYS) {
    const inner = record[key];
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      const nested = inner as Record<string, unknown>;
      for (const innerKey of ARRAY_KEYS) {
        const value = nested[innerKey];
        if (Array.isArray(value)) return value;
      }
    }
  }
  return [payload];
}

function mergeQuery(
  config: ConnectorConfig,
  params: DiscoveryParams,
): Record<string, string> {
  const query: Record<string, string> = { ...(config.defaultParams ?? {}) };
  if (params.year != null) {
    query.year = String(params.year);
    if (query.ano === undefined) query.ano = String(params.year);
  }
  if (params.status) {
    query.status = params.status;
    if (query.situacao === undefined) query.situacao = params.status;
  }
  if (params.modality) query.modality = params.modality;
  if (params.q) query.q = params.q;
  return query;
}

function wrapError(url: string, err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  return new Error(`generic-json discover failed for ${url}: ${message}`);
}

function asAbsoluteUrl(value: string, currentUrl: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    if (/^https?:\/\//i.test(trimmed)) return new URL(trimmed).toString();
    if (!currentUrl) return null;
    return new URL(trimmed, currentUrl).toString();
  } catch {
    return null;
  }
}

function nextLinkFrom(
  payload: unknown,
  response: PublicHttpResponse,
): string | null {
  const header = response.headers.link ?? response.headers.Link;
  if (header) {
    const match = header.match(/<([^>]+)>\s*;\s*rel="?next"?/i);
    if (match?.[1]) return asAbsoluteUrl(match[1], response.url);
  }
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  for (const key of ["next", "nextUrl", "next_url", "nextPage", "next_page_url"]) {
    const value = record[key];
    if (typeof value === "string") {
      const href = asAbsoluteUrl(value, response.url);
      if (href) return href;
    }
  }
  const links = record.links ?? record._links;
  if (links && typeof links === "object" && !Array.isArray(links)) {
    const next = (links as Record<string, unknown>).next;
    if (typeof next === "string") return asAbsoluteUrl(next, response.url);
    if (next && typeof next === "object" && !Array.isArray(next)) {
      const href = (next as Record<string, unknown>).href;
      if (typeof href === "string") return asAbsoluteUrl(href, response.url);
    }
  }
  return null;
}

function paginationType(config: ConnectorConfig): PaginationType | null {
  return config.pagination?.type ?? null;
}

class GenericJsonAdapter implements PublicProcurementSource {
  readonly connectorType = "GENERIC_JSON" as const;
  readonly config: ConnectorConfig;
  private readonly sourceSystemId: string;

  constructor(config: ConnectorConfig, sourceSystemId: string) {
    this.config = config;
    this.sourceSystemId = sourceSystemId;
  }

  async *discover(
    params: DiscoveryParams,
  ): AsyncIterable<SourceProcurement> {
    const path = this.config.paths.discover;
    if (!path) {
      throw new Error("generic-json: config.paths.discover is required");
    }
    const limit = params.limit ?? 20;
    const kind = paginationType(this.config);
    if (kind === "PAGE_NUMBER") {
      yield* this.discoverByPageNumber(path, params, limit);
      return;
    }
    if (kind === "OFFSET_LIMIT") {
      yield* this.discoverByOffset(path, params, limit);
      return;
    }
    if (kind === "NEXT_LINK") {
      yield* this.discoverByNextLink(path, params, limit);
      return;
    }
    yield* this.discoverOnce(path, params, limit);
  }

  private async *discoverOnce(
    path: string,
    params: DiscoveryParams,
    limit: number,
  ): AsyncIterable<SourceProcurement> {
    const href = this.buildUrl(path, mergeQuery(this.config, params));
    const records = await this.fetchRecords(href);
    let yielded = 0;
    for (const raw of this.accept(records)) {
      if (yielded >= limit) break;
      yield this.normalize(raw, href);
      yielded += 1;
    }
  }

  private async *discoverByPageNumber(
    path: string,
    params: DiscoveryParams,
    limit: number,
  ): AsyncIterable<SourceProcurement> {
    const pagination = this.config.pagination;
    const pageParam = pagination?.pageParam ?? "page";
    const sizeParam = pagination?.sizeParam;
    const pageSize = pagination?.pageSize ?? Math.min(limit, 50);
    let page = pagination?.startPage ?? 1;
    let yielded = 0;
    for (let i = 0; i < MAX_PAGES && yielded < limit; i += 1) {
      const query = mergeQuery(this.config, params);
      query[pageParam] = String(page);
      if (sizeParam) query[sizeParam] = String(pageSize);
      const href = this.buildUrl(path, query);
      const records = await this.fetchRecords(href);
      if (records.length === 0) break;
      const accepted = this.accept(records);
      for (const raw of accepted) {
        if (yielded >= limit) return;
        yield this.normalize(raw, href);
        yielded += 1;
      }
      if (records.length < pageSize) break;
      page += 1;
    }
  }

  private async *discoverByOffset(
    path: string,
    params: DiscoveryParams,
    limit: number,
  ): AsyncIterable<SourceProcurement> {
    const pagination = this.config.pagination;
    const offsetParam = pagination?.pageParam ?? "offset";
    const sizeParam = pagination?.sizeParam ?? "limit";
    const pageSize = pagination?.pageSize ?? Math.min(limit, 50);
    let offset = pagination?.startPage ?? 0;
    let yielded = 0;
    for (let i = 0; i < MAX_PAGES && yielded < limit; i += 1) {
      const query = mergeQuery(this.config, params);
      query[offsetParam] = String(offset);
      query[sizeParam] = String(pageSize);
      const href = this.buildUrl(path, query);
      const records = await this.fetchRecords(href);
      if (records.length === 0) break;
      const accepted = this.accept(records);
      for (const raw of accepted) {
        if (yielded >= limit) return;
        yield this.normalize(raw, href);
        yielded += 1;
      }
      if (records.length < pageSize) break;
      offset += records.length;
    }
  }

  private async *discoverByNextLink(
    path: string,
    params: DiscoveryParams,
    limit: number,
  ): AsyncIterable<SourceProcurement> {
    let href: string | null = this.buildUrl(path, mergeQuery(this.config, params));
    let yielded = 0;
    const seen = new Set<string>();
    for (let i = 0; i < MAX_PAGES && href && yielded < limit; i += 1) {
      if (seen.has(href)) break;
      seen.add(href);
      const { records, response } = await this.fetchPage(href);
      if (records.length === 0) break;
      const accepted = this.accept(records);
      for (const raw of accepted) {
        if (yielded >= limit) return;
        yield this.normalize(raw, href);
        yielded += 1;
      }
      const next = nextLinkFrom(response.json, response);
      href = next && next !== href ? next : null;
    }
  }

  private buildUrl(path: string, query: Record<string, string>): string {
    const url = new URL(joinUrl(this.config.baseUrl, path));
    for (const [key, value] of Object.entries(query)) {
      if (value != null && value !== "") url.searchParams.set(key, value);
    }
    return url.toString();
  }

  private async fetchPage(href: string): Promise<{
    records: unknown[];
    response: PublicHttpResponse;
  }> {
    let response: PublicHttpResponse;
    try {
      response = await publicGet(href, this.config.headers);
    } catch (err) {
      throw wrapError(href, err);
    }
    if (!response.ok) {
      throw new Error(
        `generic-json: GET ${href} failed with HTTP ${response.status}`,
      );
    }
    if (response.json == null) {
      throw new Error(`generic-json: non-JSON response from ${href}`);
    }
    return {
      records: extractJsonRecords(response.json, this.config.responsePath),
      response,
    };
  }

  private async fetchRecords(href: string): Promise<unknown[]> {
    const { records } = await this.fetchPage(href);
    return records;
  }

  private accept(records: unknown[]): unknown[] {
    const filters = this.config.acceptEquals;
    if (!filters || Object.keys(filters).length === 0) return records;
    return records.filter((raw) => {
      for (const [path, expected] of Object.entries(filters)) {
        const value = mapValue(raw, path);
        if (String(value ?? "") !== expected) return false;
      }
      return true;
    });
  }

  private normalize(raw: unknown, href: string): SourceProcurement {
    const record = applyNormalization(
      raw,
      this.config.normalization,
      this.sourceSystemId,
      href,
    );
    const linkBase = this.config.linkBase ?? this.config.paths.linkBase;
    if (
      linkBase &&
      record.source_url &&
      record.source_url.startsWith("/")
    ) {
      return {
        ...record,
        source_url: joinUrl(linkBase, record.source_url),
      };
    }
    return record;
  }

  /**
   * Planning is not implemented by this adapter. Returning [] is not a
   * SUPPORTED PLANNING capability — callers must not infer otherwise.
   */
  async getPlanning(
    _params: DiscoveryParams,
  ): Promise<SourcePlanningRecord[]> {
    return [];
  }
}

export function createGenericJsonAdapter(
  config: ConnectorConfig,
  sourceSystemId: string,
): PublicProcurementSource {
  return new GenericJsonAdapter(config, sourceSystemId);
}
