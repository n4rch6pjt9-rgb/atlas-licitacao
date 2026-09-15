import { collectFieldPaths, schemaFingerprint } from "./schema-fingerprint";
import type { Observation, ObservationType, PaginationType } from "./types";

export type CookieInput = {
  name: string;
  value?: string;
};

export type CaptureInput = {
  url: string;
  html?: string;
  headers?: Record<string, string>;
  cookies?: CookieInput[] | Record<string, string>;
  json?: unknown;
  robotsTxt?: string;
  sitemapXml?: string;
};

const PAGE_SUFFIXES = new Set([
  ".xhtml",
  ".jsf",
  ".faces",
  ".aspx",
  ".asp",
  ".jsp",
  ".action",
  ".do",
  ".php",
  ".html",
  ".htm",
]);

const SERVER_HEADER_NAMES = new Set([
  "server",
  "x-powered-by",
  "x-aspnet-version",
  "x-aspnetmvc-version",
  "x-runtime",
  "x-generator",
]);

const MAX_PER_TYPE = 40;

function obs(
  observation_type: ObservationType,
  key: string,
  value: string,
  source_url?: string | null,
  raw_payload?: unknown,
): Observation {
  const row: Observation = {
    observation_type,
    key,
    value,
    source_url: source_url ?? null,
  };
  if (raw_payload !== undefined) row.raw_payload = raw_payload;
  return row;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&/gi, "&")
    .replace(/</gi, "<")
    .replace(/>/gi, ">")
    .replace(/"/gi, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCharCode(parseInt(n, 16)),
    );
}

function collapseWs(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function attr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i");
  return tag.match(re)?.[1] ?? null;
}

function openTags(html: string, tagName: string): string[] {
  const re = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  return html.match(re) ?? [];
}

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    try {
      return new URL(url, "https://invalid.local");
    } catch {
      return null;
    }
  }
}

function suffixFromPath(pathname: string): string | null {
  const match = pathname.toLowerCase().match(/(\.[a-z0-9]{1,10})$/);
  if (!match) return null;
  return PAGE_SUFFIXES.has(match[1]) ? match[1] : null;
}

function normalizeCookies(
  cookies?: CookieInput[] | Record<string, string>,
): CookieInput[] {
  if (!cookies) return [];
  if (Array.isArray(cookies)) return cookies;
  return Object.entries(cookies).map(([name, value]) => ({ name, value }));
}

function cookieNameFromSetCookie(header: string): string | null {
  const name = header.split("=", 1)[0]?.trim();
  return name ? name : null;
}

function pushCapped(
  out: Observation[],
  counts: Map<ObservationType, number>,
  item: Observation,
): void {
  const value = item.value.trim();
  if (!value) return;
  const n = counts.get(item.observation_type) ?? 0;
  if (n >= MAX_PER_TYPE) return;
  counts.set(item.observation_type, n + 1);
  out.push({ ...item, value });
}

function collectFromUrl(out: Observation[], counts: Map<ObservationType, number>, url: string): void {
  const parsed = parseUrl(url);
  if (!parsed) {
    pushCapped(out, counts, obs("ROUTE", "url", url, url));
    return;
  }
  pushCapped(out, counts, obs("ROUTE", "pathname", parsed.pathname, url));
  const suffix = suffixFromPath(parsed.pathname);
  if (suffix) {
    pushCapped(out, counts, obs("PAGE_SUFFIX", "page_suffix", suffix, url));
  }
  for (const key of parsed.searchParams.keys()) {
    pushCapped(out, counts, obs("PARAMETER_NAME", "query", key, url));
  }
}

function collectFromHeaders(
  out: Observation[],
  headers: Record<string, string>,
  url: string,
): void {
  const counts = new Map<ObservationType, number>();
  for (const [rawName, rawValue] of Object.entries(headers)) {
    const name = rawName.toLowerCase();
    const value = rawValue.trim();
    if (!value) continue;
    if (SERVER_HEADER_NAMES.has(name)) {
      pushCapped(out, counts, obs("SERVER_HEADER", name, value, url));
    }
    if (name === "content-type") {
      const media = value.split(";", 1)[0]?.trim() ?? value;
      pushCapped(out, counts, obs("CONTENT_TYPE", "content_type", media, url));
    }
    if (name === "set-cookie") {
      for (const part of value.split(/,(?=[^ ;]+=)/)) {
        const cookie = cookieNameFromSetCookie(part);
        if (cookie) {
          pushCapped(out, counts, obs("COOKIE_NAME", "cookie_name", cookie, url));
        }
      }
    }
    if (name === "location") {
      const parsed = parseUrl(value);
      pushCapped(
        out,
        counts,
        obs("ROUTE", "location", parsed?.pathname ?? value, url),
      );
    }
  }
}

function collectFromCookies(
  out: Observation[],
  cookies: CookieInput[],
  url: string,
): void {
  const counts = new Map<ObservationType, number>();
  for (const cookie of cookies) {
    const name = cookie.name.trim();
    if (!name) continue;
    pushCapped(out, counts, obs("COOKIE_NAME", "cookie_name", name, url));
  }
}

const FRAMEWORK_MARKERS: Array<{
  re: RegExp;
  type: ObservationType;
  key: string;
  value: string;
}> = [
  {
    re: /javax\.faces\.ViewState/i,
    type: "INPUT_NAME",
    key: "viewstate",
    value: "javax.faces.ViewState",
  },
  {
    re: /javax\.faces\.partial/i,
    type: "PARAMETER_NAME",
    key: "jsf_partial",
    value: "javax.faces.partial",
  },
  {
    re: /PrimeFaces/i,
    type: "JS_GLOBAL",
    key: "js_global",
    value: "PrimeFaces",
  },
  {
    re: /RichFaces/i,
    type: "JS_GLOBAL",
    key: "js_global",
    value: "RichFaces",
  },
  { re: /jsf\.ajax/i, type: "JS_GLOBAL", key: "js_global", value: "jsf.ajax" },
  {
    re: /__VIEWSTATE/,
    type: "INPUT_NAME",
    key: "viewstate",
    value: "__VIEWSTATE",
  },
  {
    re: /__doPostBack/,
    type: "JS_GLOBAL",
    key: "js_global",
    value: "__doPostBack",
  },
  {
    re: /struts\.action/i,
    type: "PAGE_TEXT",
    key: "framework",
    value: "struts.action",
  },
];

function collectFromHtml(
  out: Observation[],
  html: string,
  url: string,
): void {
  const counts = new Map<ObservationType, number>();

  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if (title) {
    pushCapped(
      out,
      counts,
      obs("HTML_TITLE", "title", collapseWs(decodeEntities(title)), url),
    );
  }

  for (const tag of openTags(html, "meta")) {
    const name = (attr(tag, "name") ?? attr(tag, "property") ?? "").toLowerCase();
    const content = attr(tag, "content");
    if (!content) continue;
    if (name === "generator") {
      pushCapped(
        out,
        counts,
        obs("META_GENERATOR", "generator", collapseWs(content), url),
      );
    }
  }

  for (const tag of openTags(html, "script")) {
    const src = attr(tag, "src");
    if (src) {
      pushCapped(out, counts, obs("SCRIPT_PATH", "script_src", src, url));
      const suffix = suffixFromPath(src.split("?")[0] ?? src);
      if (suffix) {
        pushCapped(out, counts, obs("PAGE_SUFFIX", "page_suffix", suffix, url));
      }
    }
  }

  for (const tag of openTags(html, "link")) {
    const rel = (attr(tag, "rel") ?? "").toLowerCase();
    const href = attr(tag, "href");
    if (href && rel.includes("stylesheet")) {
      pushCapped(out, counts, obs("CSS_PATH", "stylesheet", href, url));
    }
  }

  for (const tag of openTags(html, "form")) {
    const action = attr(tag, "action");
    if (action) {
      pushCapped(out, counts, obs("FORM_ACTION", "form_action", action, url));
      const parsed = parseUrl(action);
      const path = parsed?.pathname ?? action;
      pushCapped(out, counts, obs("ROUTE", "form_action", path, url));
      const suffix = suffixFromPath((parsed?.pathname ?? action).split("?")[0] ?? "");
      if (suffix) {
        pushCapped(out, counts, obs("PAGE_SUFFIX", "page_suffix", suffix, url));
      }
    }
  }

  for (const tag of openTags(html, "input")) {
    const name = attr(tag, "name");
    if (name) {
      pushCapped(out, counts, obs("INPUT_NAME", "input_name", name, url));
    }
  }

  const hrefRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(hrefRe)) {
    const href = match[1];
    if (!href || href.startsWith("mailto:") || href.startsWith("javascript:")) {
      continue;
    }
    const parsed = parseUrl(href);
    const path = parsed?.pathname ?? href.split("?")[0] ?? href;
    const suffix = suffixFromPath(path);
    if (suffix) {
      pushCapped(out, counts, obs("PAGE_SUFFIX", "page_suffix", suffix, url));
      pushCapped(out, counts, obs("ROUTE", "href", path, url));
    } else if (path.includes(".action") || path.startsWith("/api/")) {
      pushCapped(out, counts, obs("ROUTE", "href", path, url));
    }
  }

  const apiRe = /["'`](\/api\/[A-Za-z0-9_\-./]+)["'`]/g;
  for (const match of html.matchAll(apiRe)) {
    pushCapped(out, counts, obs("ROUTE", "api_path", match[1], url));
  }

  const actionRe = /["'`](\/[A-Za-z0-9_\-./]*\.action(?:\?[^"'`]*)?)["'`]/g;
  for (const match of html.matchAll(actionRe)) {
    const path = match[1].split("?")[0] ?? match[1];
    pushCapped(out, counts, obs("ROUTE", "action", path, url));
    pushCapped(out, counts, obs("PAGE_SUFFIX", "page_suffix", ".action", url));
  }

  for (const marker of FRAMEWORK_MARKERS) {
    if (marker.re.test(html)) {
      pushCapped(out, counts, obs(marker.type, marker.key, marker.value, url));
    }
  }
}

function collectFromJson(
  out: Observation[],
  payload: unknown,
  url: string,
): void {
  const counts = new Map<ObservationType, number>();
  const fingerprint = schemaFingerprint(payload);
  pushCapped(
    out,
    counts,
    obs("JSON_SHAPE", "schema_hash", fingerprint.schema_hash, url, {
      field_paths: fingerprint.field_paths,
      type_map: fingerprint.type_map,
    }),
  );

  const paths = collectFieldPaths(payload);
  for (const path of [...paths.keys()].sort()) {
    const leaf = path.split(".").pop() ?? path;
    const name = leaf.replace(/\[\]$/g, "");
    if (name) {
      pushCapped(out, counts, obs("JSON_FIELD", "json_field", name, url));
    }
  }
}

function collectFromRobots(
  out: Observation[],
  robotsTxt: string,
  url: string,
): void {
  const counts = new Map<ObservationType, number>();
  for (const line of robotsTxt.split(/\r?\n/)) {
    const match = line.match(/^\s*(allow|disallow)\s*:\s*(\S+)/i);
    if (!match) continue;
    const kind = match[1].toLowerCase();
    const path = match[2];
    pushCapped(out, counts, obs("ROBOTS", kind, path, url));
    if (path.startsWith("/") && path.length > 1) {
      pushCapped(out, counts, obs("ROUTE", `robots_${kind}`, path, url));
    }
  }
}

function collectFromSitemap(
  out: Observation[],
  sitemapXml: string,
  url: string,
): void {
  const counts = new Map<ObservationType, number>();
  const locRe = /<loc>\s*([^<]+)\s*<\/loc>/gi;
  for (const match of sitemapXml.matchAll(locRe)) {
    const loc = collapseWs(decodeEntities(match[1]));
    const parsed = parseUrl(loc);
    const path = parsed?.pathname ?? loc;
    pushCapped(out, counts, obs("ROUTE", "sitemap", path, url));
    const suffix = suffixFromPath(path);
    if (suffix) {
      pushCapped(out, counts, obs("PAGE_SUFFIX", "page_suffix", suffix, url));
    }
  }
}

function paginationFromJson(value: unknown): PaginationType | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    return value.length > 0 ? paginationFromJson(value[0]) : null;
  }
  const keys = new Set(
    Object.keys(value as Record<string, unknown>).map((k) => k.toLowerCase()),
  );
  const has = (...names: string[]) => names.some((n) => keys.has(n));
  if (has("draw") && (has("recordstotal") || has("recordstotal".toLowerCase()) || has("data"))) {
    return "DATATABLES";
  }
  if (has("cursor", "nextcursor", "next_cursor", "nextpagetoken", "next_page_token")) {
    return "CURSOR";
  }
  if (
    (has("offset") && has("limit")) ||
    (has("skip") && has("take", "limit"))
  ) {
    return "OFFSET_LIMIT";
  }
  if (has("page", "pagenumber", "page_number", "pagina", "numeropagina", "pageindex")) {
    return "PAGE_NUMBER";
  }
  const rec = value as Record<string, unknown>;
  const links = rec._links ?? rec.links;
  if (links && typeof links === "object" && !Array.isArray(links) && "next" in links) {
    return "NEXT_LINK";
  }
  if (typeof rec.next === "string") return "NEXT_LINK";
  return null;
}

function paginationFromUrl(url: string): PaginationType | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;
  const keys = new Set([...parsed.searchParams.keys()].map((k) => k.toLowerCase()));
  const has = (...names: string[]) => names.some((n) => keys.has(n));
  if (has("draw") && has("start", "length")) return "DATATABLES";
  if (has("cursor", "nextcursor", "page_token")) return "CURSOR";
  if (has("offset") || (has("limit") && has("start"))) return "OFFSET_LIMIT";
  if (has("page", "pagina", "p", "pagenumber")) return "PAGE_NUMBER";
  return null;
}

export function detectPagination(input: {
  url?: string;
  html?: string;
  json?: unknown;
}): PaginationType {
  const html = input.html ?? "";
  if (/javax\.faces\.ViewState/i.test(html)) return "JSF_VIEWSTATE";
  if (/name=["']__VIEWSTATE["']/.test(html) || /__doPostBack/.test(html)) {
    return "SERVER_SIDE_FORM";
  }
  if (/\bDataTable\b/i.test(html) && /["']draw["']/.test(html)) {
    return "DATATABLES";
  }
  const fromJson = input.json !== undefined ? paginationFromJson(input.json) : null;
  if (fromJson) return fromJson;
  if (input.url) {
    const fromUrl = paginationFromUrl(input.url);
    if (fromUrl) return fromUrl;
  }
  if (/<form\b/i.test(html) && /type=["']hidden["']/i.test(html)) {
    return "SERVER_SIDE_FORM";
  }
  return "UNKNOWN";
}

function dedupe(rows: Observation[]): Observation[] {
  const seen = new Set<string>();
  const out: Observation[] = [];
  for (const row of rows) {
    const key = `${row.observation_type}\0${row.key}\0${row.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

/**
 * Passive public-page extraction. Observations are facts, not vendor claims.
 * Framework markers (.xhtml, JSESSIONID, ViewState) stay GENERIC_*.
 */
export function extractObservations(input: CaptureInput): Observation[] {
  const out: Observation[] = [];
  const url = input.url;
  const counts = new Map<ObservationType, number>();

  collectFromUrl(out, counts, url);
  if (input.headers) collectFromHeaders(out, input.headers, url);
  collectFromCookies(out, normalizeCookies(input.cookies), url);
  if (input.html) collectFromHtml(out, input.html, url);
  if (input.json !== undefined) collectFromJson(out, input.json, url);
  if (input.robotsTxt) collectFromRobots(out, input.robotsTxt, url);
  if (input.sitemapXml) collectFromSitemap(out, input.sitemapXml, url);

  const pagination = detectPagination({
    url,
    html: input.html,
    json: input.json,
  });
  if (pagination !== "UNKNOWN") {
    pushCapped(
      out,
      counts,
      obs("PAGINATION_PATTERN", "pagination", pagination, url),
    );
  }

  return dedupe(out);
}
