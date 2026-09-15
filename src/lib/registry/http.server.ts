/**
 * Conservative public GET/HEAD client for passive fingerprinting.
 * Never sends credentials. Never POST. Timeouts and body caps are hard.
 */

export const HTTP_TIMEOUT_MS = 8000;
export const HTTP_MAX_BODY_BYTES = 512_000;
export const HTTP_MAX_RETRIES = 2;
export const HTTP_USER_AGENT =
  "AtlasPortalRegistry/1.0 (passive public fingerprint)";

const BLOCKED_REQUEST_HEADERS = new Set([
  "authorization",
  "proxy-authorization",
  "cookie",
  "x-api-key",
  "x-auth-token",
  "x-access-token",
]);

export type PublicHttpResponse = {
  ok: boolean;
  status: number;
  url: string;
  headers: Record<string, string>;
  text: string;
  json: unknown | null;
};

export type PublicHttpOptions = {
  method?: "GET" | "HEAD";
  headers?: Record<string, string>;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeHeaders(
  input?: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {
    "user-agent": HTTP_USER_AGENT,
    accept: "text/html,application/json;q=0.9,*/*;q=0.8",
  };
  if (!input) return out;
  for (const [rawKey, value] of Object.entries(input)) {
    const key = rawKey.toLowerCase();
    if (BLOCKED_REQUEST_HEADERS.has(key)) continue;
    if (key === "user-agent") continue;
    out[rawKey] = value;
  }
  return out;
}

function headersToRecord(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}

function isRetryableError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof Error && err.name === "AbortError") return true;
  if (err instanceof TypeError) return true;
  if (
    err instanceof Error &&
    /timeout|network|fetch|ECONN|ENOTFOUND|EAI_AGAIN|ECONNRESET/i.test(
      err.message,
    )
  ) {
    return true;
  }
  return false;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return String(err);
}

async function readLimitedBody(res: Response): Promise<string> {
  if (!res.body) {
    const fallback = await res.arrayBuffer();
    return Buffer.from(fallback).subarray(0, HTTP_MAX_BODY_BYTES).toString("utf8");
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value || value.byteLength === 0) continue;
    const remaining = HTTP_MAX_BODY_BYTES - received;
    if (remaining <= 0) {
      try {
        await reader.cancel();
      } catch {
        // ignore cancel failures
      }
      break;
    }
    if (value.byteLength > remaining) {
      chunks.push(value.subarray(0, remaining));
      received += remaining;
      try {
        await reader.cancel();
      } catch {
        // ignore
      }
      break;
    }
    chunks.push(value);
    received += value.byteLength;
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf8");
}

function parseJson(text: string, contentType: string | undefined): unknown | null {
  const looksJson =
    (contentType ?? "").toLowerCase().includes("json") ||
    /^\s*[[{]/.test(text);
  if (!looksJson || !text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function parseResponse(res: Response, method: "GET" | "HEAD"): Promise<PublicHttpResponse> {
  const headers = headersToRecord(res.headers);
  const text = method === "HEAD" ? "" : await readLimitedBody(res);
  return {
    ok: res.ok,
    status: res.status,
    url: res.url,
    headers,
    text,
    json: parseJson(text, headers["content-type"]),
  };
}

export async function publicRequest(
  url: string,
  options: PublicHttpOptions = {},
): Promise<PublicHttpResponse> {
  const method = options.method ?? "GET";
  if (method !== "GET" && method !== "HEAD") {
    throw new Error("fingerprint http only allows GET/HEAD");
  }
  const headers = sanitizeHeaders(options.headers);
  let lastError: unknown;

  for (let attempt = 0; attempt <= HTTP_MAX_RETRIES; attempt += 1) {
    try {
      const res = await fetch(url, {
        method,
        headers,
        redirect: "follow",
        signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
      });
      if (res.status >= 500 && attempt < HTTP_MAX_RETRIES) {
        await sleep(200 * 2 ** attempt);
        continue;
      }
      return await parseResponse(res, method);
    } catch (err) {
      lastError = err;
      if (attempt < HTTP_MAX_RETRIES && isRetryableError(err)) {
        await sleep(200 * 2 ** attempt);
        continue;
      }
      throw new Error(`public ${method} ${url} failed: ${errorMessage(err)}`);
    }
  }

  throw new Error(`public ${method} ${url} failed: ${errorMessage(lastError)}`);
}

export function publicGet(
  url: string,
  headers?: Record<string, string>,
): Promise<PublicHttpResponse> {
  return publicRequest(url, { method: "GET", headers });
}

export function publicHead(
  url: string,
  headers?: Record<string, string>,
): Promise<PublicHttpResponse> {
  return publicRequest(url, { method: "HEAD", headers });
}
