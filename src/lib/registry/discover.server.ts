import type { Sql } from "@/lib/db";
import { createAdapter } from "./connectors/index";
import { payloadHash } from "./hash";
import { classifyAuthError } from "./pcp-semantics";
import { insertSourceRecord, loadConnectorConfig } from "./queries.server";
import { resolveIngestedRecords } from "./coverage.server";
import { schemaFingerprint } from "./schema-fingerprint";
import {
  PAGINATION_TYPES,
  type ConnectorConfig,
  type PaginationType,
  type SourceProcurement,
} from "./types";

export type DiscoverResult = {
  records: SourceProcurement[];
  count: number;
  error?: string;
};

function asPagination(value: unknown): ConnectorConfig["pagination"] {
  if (!value || typeof value !== "object") return undefined;
  const rec = value as Record<string, unknown>;
  const type =
    typeof rec.type === "string" &&
    (PAGINATION_TYPES as readonly string[]).includes(rec.type)
      ? (rec.type as PaginationType)
      : "UNKNOWN";
  return {
    type,
    pageParam: typeof rec.pageParam === "string" ? rec.pageParam : undefined,
    sizeParam: typeof rec.sizeParam === "string" ? rec.sizeParam : undefined,
    pageSize: typeof rec.pageSize === "number" ? rec.pageSize : undefined,
    startPage: typeof rec.startPage === "number" ? rec.startPage : undefined,
  };
}

function splitResponsePath(paths: Record<string, string>): {
  paths: Record<string, string>;
  responsePath?: string;
} {
  const { responsePath, ...rest } = paths;
  return {
    paths: rest,
    responsePath: responsePath || undefined,
  };
}

function withDiscoverPath(config: ConnectorConfig): ConnectorConfig {
  if (config.paths.discover) return config;
  const fallback =
    config.paths.search ??
    config.paths.editais ??
    config.paths.list ??
    Object.values(config.paths).find((value) => Boolean(value));
  if (!fallback) return config;
  return { ...config, paths: { ...config.paths, discover: fallback } };
}

export async function discoverSource(
  sql: Sql,
  sourceId: string,
  params: { year?: number; limit?: number } = {},
): Promise<DiscoverResult> {
  const loaded = await loadConnectorConfig(sql, sourceId);
  if (!loaded) {
    return { records: [], count: 0, error: "fonte não encontrada" };
  }
  if (loaded.connectorType === "NONE") {
    return { records: [], count: 0, error: "adapter pending" };
  }
  if (!loaded.baseUrl) {
    return { records: [], count: 0, error: "fonte sem URL base" };
  }

  const split = splitResponsePath(loaded.paths);
  const config = withDiscoverPath({
    connectorType: loaded.connectorType,
    baseUrl: loaded.baseUrl,
    paths: split.paths,
    defaultParams: loaded.defaultParams,
    headers: loaded.headers,
    responsePath: loaded.responsePath ?? split.responsePath,
    pagination: asPagination(loaded.pagination),
    normalization: loaded.normalization,
    documents: loaded.documents,
    acceptEquals: loaded.acceptEquals,
    linkBase: loaded.linkBase,
  });

  if (
    (config.connectorType === "GENERIC_JSON" ||
      config.connectorType === "GENERIC_ACTION" ||
      config.connectorType === "GENERIC_JSF") &&
    !config.paths.discover
  ) {
    return { records: [], count: 0, error: "adapter pending" };
  }

  const year = params.year ?? new Date().getFullYear();
  const limit = params.limit ?? 20;
  const records: SourceProcurement[] = [];

  try {
    const adapter = createAdapter(config, sourceId);
    for await (const record of adapter.discover({ year, limit })) {
      records.push(record);
      if (records.length >= limit) break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const httpMatch = message.match(/HTTP (\d{3})/);
    const status = httpMatch ? Number(httpMatch[1]) : 0;
    const health = status ? classifyAuthError(status, message) : null;
    const configError =
      status === 400 || health === "CONFIG_INVALID" || health === "AUTH_SEMANTICS_CHANGED";
    return {
      records: [],
      count: 0,
      error: configError
        ? `erro de configuração (HTTP ${status || "auth"}), não falha de parser: ${message}`
        : message,
    };
  }

  for (const record of records) {
    await insertSourceRecord(sql, {
      source_system_id: sourceId,
      source_entity_type: "procurement",
      source_identifier: record.external_id,
      payload_hash: payloadHash(record.raw_payload ?? record),
      schema_hash: schemaFingerprint(record.raw_payload ?? record).schema_hash,
      raw_payload: record.raw_payload ?? record,
      source_url: record.source_url,
      source_updated_at: record.opening_at ?? record.proposal_deadline ?? null,
      ingestion_mode: "LIVE_PUBLIC_API",
      fetch_method: "GENERIC_JSON",
    });
  }

  try {
    await resolveIngestedRecords(sql, sourceId, records);
  } catch {
    // Resolution is additive. Ingested raw records stay even if matching fails.
  }

  return { records, count: records.length };
}
