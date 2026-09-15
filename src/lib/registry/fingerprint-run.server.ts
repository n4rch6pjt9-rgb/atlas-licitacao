import { randomUUID } from "node:crypto";
import type { Sql } from "@/lib/db";
import { classifySource } from "./classify";
import { payloadHash } from "./hash";
import { publicRequest } from "./http.server";
import { extractObservations } from "./observations";
import {
  applyClassificationToSource,
  getSourceById,
  insertAlert,
  insertFingerprintRun,
  insertObservations,
  insertSourceRecord,
  listObservationsForSource,
  listSignatures,
  loadEvidenceInputs,
} from "./queries.server";
import { detectSchemaDrift, schemaFingerprint } from "./schema-fingerprint";
import {
  FRAMEWORK_FAMILIES,
  VENDOR_FAMILIES,
  type FingerprintSignature,
  type Observation,
  type SignatureType,
  type TechnologyFamily,
} from "./types";

export type FingerprintRunResult = {
  run_id: string;
  source_id: string;
  status: string;
  candidate_family: string | null;
  technology_family: string | null;
  score: number;
  evidence_count: number;
  strong_evidence_count: number;
  error: string | null;
  fetch_errors: string[];
  schema_alerts: string[];
};

type PublicFetch = {
  url: string;
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  html?: string;
  json?: unknown;
  robotsTxt?: string;
  error?: string;
  latency_ms: number;
};

async function fetchPublic(url: string, _timeoutMs: number): Promise<PublicFetch> {
  const started = Date.now();
  try {
    const res = await publicRequest(url, { method: "GET" });
    const contentType = res.headers["content-type"] ?? "";
    const result: PublicFetch = {
      url: res.url || url,
      status: res.status,
      ok: res.ok,
      headers: res.headers,
      latency_ms: Date.now() - started,
    };
    if (res.json != null) result.json = res.json;
    if (/robots\.txt/i.test(url)) {
      result.robotsTxt = res.text;
    } else if (result.json == null) {
      result.html = res.text;
    } else if (/html/i.test(contentType)) {
      result.html = res.text;
    }
    return result;
  } catch (err) {
    return {
      url,
      status: 0,
      ok: false,
      headers: {},
      latency_ms: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function joinUrl(base: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  try {
    return new URL(path, base).toString();
  } catch {
    return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  }
}

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toFingerprintSignatures(
  rows: Awaited<ReturnType<typeof listSignatures>>,
): FingerprintSignature[] {
  return rows.map((row) => ({
    id: row.id,
    technology_family: row.technology_family,
    signature_type: row.signature_type as SignatureType,
    key: row.key,
    pattern: row.pattern,
    weight: row.weight,
    required: row.required,
    description: row.description,
    source_url: row.source_url,
    is_vendor_claim: row.is_vendor_claim,
  }));
}

async function upsertEndpointHealth(
  sql: Sql,
  endpointId: string,
  patch: {
    status: string;
    last_success_at?: string | null;
    last_failure_at?: string | null;
    consecutive_failures?: number;
    latency_ms?: number | null;
    http_status?: number | null;
    schema_hash?: string | null;
  },
): Promise<void> {
  await sql.query(
    `insert into source_endpoint_health (
       source_endpoint_id, status, last_success_at, last_failure_at,
       consecutive_failures, latency_ms, http_status, schema_hash
     ) values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (source_endpoint_id) do update set
       status = excluded.status,
       last_success_at = coalesce(excluded.last_success_at, source_endpoint_health.last_success_at),
       last_failure_at = coalesce(excluded.last_failure_at, source_endpoint_health.last_failure_at),
       consecutive_failures = excluded.consecutive_failures,
       latency_ms = excluded.latency_ms,
       http_status = excluded.http_status,
       schema_hash = coalesce(excluded.schema_hash, source_endpoint_health.schema_hash)`,
    [
      endpointId,
      patch.status,
      patch.last_success_at ?? null,
      patch.last_failure_at ?? null,
      patch.consecutive_failures ?? 0,
      patch.latency_ms ?? null,
      patch.http_status ?? null,
      patch.schema_hash ?? null,
    ],
  );
}

async function handleJsonSchema(
  sql: Sql,
  sourceId: string,
  endpoint: { id: string; path: string | null; name: string | null },
  payload: unknown,
  schemaAlerts: string[],
): Promise<string> {
  const current = schemaFingerprint(payload);
  const previous = await sql.query<{ id: string; schema_hash: string }>(
    `select id, schema_hash from schema_fingerprint
     where source_endpoint_id = $1
     order by last_seen_at desc
     limit 1`,
    [endpoint.id],
  );
  const drift = detectSchemaDrift(previous[0]?.schema_hash ?? null, payload);

  if (previous[0] && previous[0].schema_hash === current.schema_hash) {
    await sql.query(
      `update schema_fingerprint
       set sample_count = sample_count + 1, last_seen_at = now()
       where id = $1`,
      [previous[0].id],
    );
  } else {
    await sql.query(
      `insert into schema_fingerprint (
         id, source_endpoint_id, schema_hash, field_paths, type_map, sample_count
       ) values ($1, $2, $3, $4::jsonb, $5::jsonb, 1)`,
      [
        `sf_${randomUUID()}`,
        endpoint.id,
        current.schema_hash,
        JSON.stringify(current.field_paths),
        JSON.stringify(current.type_map),
      ],
    );
  }

  await insertSourceRecord(sql, {
    source_system_id: sourceId,
    source_entity_type: "endpoint_payload",
    source_identifier: endpoint.path || endpoint.id,
    payload_hash: payloadHash(payload),
    raw_payload: payload,
  });

  if (drift.status === "SCHEMA_CHANGED") {
    schemaAlerts.push(endpoint.path || endpoint.id);
    await insertAlert(sql, {
      source_system_id: sourceId,
      alert_type: "SCHEMA_CHANGED",
      severity: "high",
      message: `Schema alterado em ${endpoint.path ?? endpoint.id}`,
      payload: {
        endpoint_id: endpoint.id,
        previous_hash: drift.previous_hash,
        current_hash: drift.current_hash,
      },
    });
    await upsertEndpointHealth(sql, endpoint.id, {
      status: "SCHEMA_CHANGED",
      last_success_at: new Date().toISOString(),
      consecutive_failures: 0,
      schema_hash: current.schema_hash,
    });
  }

  return current.schema_hash;
}

export async function runFingerprint(
  sql: Sql,
  sourceId: string,
): Promise<FingerprintRunResult> {
  const source = await getSourceById(sql, sourceId);
  if (!source) {
    throw new Error(`source not found: ${sourceId}`);
  }

  const runId = `run_${randomUUID()}`;
  const startedAt = new Date().toISOString();
  await insertFingerprintRun(sql, {
    id: runId,
    source_system_id: sourceId,
    started_at: startedAt,
    completed_at: null,
    status: "RUNNING",
    candidate_family: null,
    score: null,
    evidence_count: 0,
    strong_evidence_count: 0,
    raw_result: null,
    error: null,
  });

  const fetchErrors: string[] = [];
  const schemaAlerts: string[] = [];
  const captured: Observation[] = [];

  const policy = await sql.query<{
    max_concurrency: number;
    requests_per_second: number;
    timeout_ms: number;
  }>(`select * from source_rate_policy where source_system_id = $1`, [sourceId]);
  const timeoutMs = Number(policy[0]?.timeout_ms ?? 8000);
  const rps = Number(policy[0]?.requests_per_second ?? 1) || 1;
  const gapMs = Math.max(0, Math.round(1000 / rps));

  const endpoints = await sql.query<{
    id: string;
    name: string | null;
    path: string | null;
    http_method: string | null;
    endpoint_type: string | null;
    public: boolean;
  }>(
    `select id, name, path, http_method, endpoint_type, public
     from source_endpoint
     where source_system_id = $1`,
    [sourceId],
  );

  const urls: Array<{ url: string; endpoint?: (typeof endpoints)[number]; kind: string }> = [];
  if (source.base_url) {
    urls.push({ url: source.base_url, kind: "base" });
    const origin = originOf(source.base_url);
    if (origin) urls.push({ url: `${origin}/robots.txt`, kind: "robots" });
  }
  for (const endpoint of endpoints) {
    if (!endpoint.public) continue;
    const method = (endpoint.http_method ?? "GET").toUpperCase();
    if (method !== "GET") continue;
    if (!endpoint.path && !source.base_url) continue;
    const url = source.base_url
      ? joinUrl(source.base_url, endpoint.path || "")
      : (endpoint.path ?? "");
    if (url) urls.push({ url, endpoint, kind: "endpoint" });
  }

  const unique: typeof urls = [];
  const seen = new Set<string>();
  for (const item of urls) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    unique.push(item);
  }

  let liveFailed = 0;
  for (let i = 0; i < unique.length; i += 1) {
    const item = unique[i];
    if (i > 0 && gapMs > 0) await sleep(gapMs);
    const capturedFetch = await fetchPublic(item.url, timeoutMs);
    if (capturedFetch.error || !capturedFetch.ok) {
      liveFailed += 1;
      const message = capturedFetch.error || `HTTP ${capturedFetch.status} ${item.url}`;
      fetchErrors.push(message);
      if (item.endpoint) {
        await upsertEndpointHealth(sql, item.endpoint.id, {
          status: "FAILING",
          last_failure_at: new Date().toISOString(),
          consecutive_failures: 1,
          latency_ms: capturedFetch.latency_ms,
          http_status: capturedFetch.status || null,
        });
        await insertAlert(sql, {
          source_system_id: sourceId,
          alert_type: "ENDPOINT_DOWN",
          severity: "warning",
          message: `Endpoint público falhou: ${item.endpoint.path ?? item.url}`,
          payload: { url: item.url, status: capturedFetch.status, error: capturedFetch.error },
        });
      }
      continue;
    }

    const observations = extractObservations({
      url: capturedFetch.url,
      html: capturedFetch.html,
      headers: capturedFetch.headers,
      json: capturedFetch.json,
      robotsTxt: capturedFetch.robotsTxt,
    });
    captured.push(...observations);

    if (item.endpoint) {
      const isJson =
        capturedFetch.json !== undefined ||
        item.endpoint.endpoint_type === "JSON_API" ||
        item.endpoint.endpoint_type === "REST";
      let schemaHash: string | null = null;
      if (isJson && capturedFetch.json !== undefined) {
        schemaHash = await handleJsonSchema(
          sql,
          sourceId,
          item.endpoint,
          capturedFetch.json,
          schemaAlerts,
        );
      }
      const healthStatus = schemaAlerts.includes(item.endpoint.path || item.endpoint.id)
        ? "SCHEMA_CHANGED"
        : "HEALTHY";
      if (healthStatus !== "SCHEMA_CHANGED") {
        await upsertEndpointHealth(sql, item.endpoint.id, {
          status: healthStatus,
          last_success_at: new Date().toISOString(),
          consecutive_failures: 0,
          latency_ms: capturedFetch.latency_ms,
          http_status: capturedFetch.status,
          schema_hash: schemaHash,
        });
      }
      await sql.query(
        `update source_endpoint set last_verified_at = now(), status = $2 where id = $1`,
        [item.endpoint.id, healthStatus],
      );
    }
  }

  if (captured.length > 0) {
    await insertObservations(sql, sourceId, captured);
  }

  const stored = await listObservationsForSource(sql, sourceId);
  const signatures = toFingerprintSignatures(await listSignatures(sql));
  const evidence = await loadEvidenceInputs(sql, sourceId);
  const currentVendorFamily = VENDOR_FAMILIES.has(
    (source.technology_family ?? "UNKNOWN") as TechnologyFamily,
  )
    ? ((source.technology_family ?? "UNKNOWN") as TechnologyFamily)
    : null;

  const classification = classifySource({
    observations: stored,
    signatures,
    evidence,
    currentVendorFamily,
  });

  const evidenceCount = classification.matches.filter((m) => m.matched).length;
  const strongEvidenceCount = classification.matches.filter(
    (m) => m.matched && (m.signature.weight >= 12 || m.signature.is_vendor_claim),
  ).length;

  const applied = await applyClassificationToSource(sql, sourceId, classification);

  const mayWriteVendor =
    VENDOR_FAMILIES.has(classification.technology_family) &&
    (classification.evidence_level === "VERIFIED" ||
      classification.evidence_level === "STRONG_INDICATION");
  const mayWriteFramework = FRAMEWORK_FAMILIES.has(classification.technology_family);

  const runError =
    unique.length > 0 && liveFailed === unique.length
      ? fetchErrors[0] ?? "all public fetches failed"
      : fetchErrors.length > 0
        ? `${fetchErrors.length} fetch error(s)`
        : null;

  await insertFingerprintRun(sql, {
    id: runId,
    source_system_id: sourceId,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    status: runError && liveFailed === unique.length ? "FAILED" : "COMPLETED",
    candidate_family: classification.candidate_family,
    score: classification.score,
    evidence_count: evidenceCount,
    strong_evidence_count: strongEvidenceCount,
    raw_result: {
      classification: {
        candidate_family: classification.candidate_family,
        technology_family: classification.technology_family,
        evidence_level: classification.evidence_level,
        confidence: classification.confidence,
        score: classification.score,
        vendor_score: classification.vendor_score,
        framework_score: classification.framework_score,
        conflict: classification.conflict,
        conflict_reason: classification.conflict_reason,
        claim_kind: classification.claim_kind,
        vendor_name: classification.vendor_name,
        product_name: classification.product_name,
      },
      applied,
      may_write_vendor: mayWriteVendor,
      may_write_framework: mayWriteFramework,
      fetch_errors: fetchErrors,
      schema_alerts: schemaAlerts,
      observation_count: stored.length,
    },
    error: runError,
    matches: classification.matches.map((match) => ({
      signature_id: match.signature.id,
      matched: match.matched,
      score: match.score,
      observed_value: match.observed_value,
    })),
  });

  return {
    run_id: runId,
    source_id: sourceId,
    status: runError && liveFailed === unique.length ? "FAILED" : "COMPLETED",
    candidate_family: classification.candidate_family,
    technology_family: applied.technology_family,
    score: classification.score,
    evidence_count: evidenceCount,
    strong_evidence_count: strongEvidenceCount,
    error: runError,
    fetch_errors: fetchErrors,
    schema_alerts: schemaAlerts,
  };
}
