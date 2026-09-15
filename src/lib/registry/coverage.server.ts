import { randomUUID } from "node:crypto";
import type { Sql } from "@/lib/db";
import {
  classifyLocalOnly,
  compareProcurementFields,
  DEFAULT_COVERAGE_CONFIG,
  integrationPriorityScore,
  leadTimeHours,
  nextRecheckAt,
  percentile,
  PRIORITY_WEIGHTS,
  recordOverlap,
} from "./coverage";
import {
  resolveProcurement,
  type CanonicalCandidate,
} from "./entity-resolution";
import { buildFamilyCandidates } from "./family-candidates";
import type {
  ComparisonRow,
  FamilyPriorityRow,
  LiveProbeRow,
  LocalOnlyRow,
  Milestone4Metrics,
  MunicipalityCensusRow,
  SearchHit,
  SourceRecordRow,
} from "./models";
import type { SourceProcurement } from "./types";

function jsonSafe<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, inner) => {
      if (typeof inner === "bigint") return Number(inner);
      if (inner instanceof Date) return inner.toISOString();
      return inner;
    }),
  ) as T;
}

function iso(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function readStr(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function excerptFromPayload(payload: unknown): string | null {
  const rec = asRecord(payload);
  return (
    readStr(rec, ["objeto", "objetoCompra", "object", "numero", "processo", "numeroControlePNCP"]) ??
    null
  );
}

export function candidateFromRecord(
  row: {
    source_identifier: string;
    source_system_id: string;
    raw_payload: unknown;
    technology_family?: string | null;
  },
): CanonicalCandidate {
  const payload = asRecord(row.raw_payload);
  const orgao = asRecord(payload.orgaoEntidade);
  const family = row.technology_family ?? "";
  const type: CanonicalCandidate["canonical_entity_type"] =
    family === "COMPRAS_GOV" || row.source_system_id === "src_br_comprasgov"
      ? "COMPRAS_GOV"
      : "PNCP";
  return {
    canonical_entity_type: type,
    canonical_entity_id: row.source_identifier,
    numeroControlePNCP: readStr(payload, [
      "numeroControlePNCP",
      "numero_controle_pncp",
      "pncpId",
    ]),
    organization_cnpj: readStr(payload, ["cnpj", "organizationCnpj", "orgaoCnpj"]) ??
      readStr(orgao, ["cnpj"]),
    organization_identifier:
      readStr(payload, ["cnpj", "organizationCnpj"]) ?? readStr(orgao, ["cnpj"]),
    organization_name:
      readStr(payload, ["orgaoNome", "organization_name", "razaoSocial"]) ??
      readStr(orgao, ["razaoSocial"]),
    year: Number(readStr(payload, ["ano", "year"]) ?? NaN) || null,
    sequential: readStr(payload, ["sequencial", "sequencialCompra", "sequential"]),
    process_number: readStr(payload, ["numero", "numeroCompra", "processo", "process_number"]),
    procurement_number: readStr(payload, ["numeroCompra", "numero", "procurement_number"]),
    modality: readStr(payload, ["modalidade", "tipo", "modality"]),
    object: readStr(payload, ["objeto", "objetoCompra", "object"]),
    opening_at: readStr(payload, ["dataAbertura", "abertura", "opening_at"]),
    status: readStr(payload, ["situacao", "status"]),
  };
}

export async function loadNationalCandidates(sql: Sql): Promise<CanonicalCandidate[]> {
  const rows = await sql.query<{
    source_identifier: string;
    source_system_id: string;
    raw_payload: unknown;
    technology_family: string | null;
  }>(
    `select r.source_identifier, r.source_system_id, r.raw_payload, s.technology_family
     from source_record r
     join source_system s on s.id = r.source_system_id
     where s.technology_family in ('PNCP', 'COMPRAS_GOV')
        or r.source_system_id in ('src_br_pncp', 'src_br_comprasgov')`,
  );
  return rows.map(candidateFromRecord);
}

export async function insertSourceEntityLink(
  sql: Sql,
  input: {
    id?: string;
    source_system_id: string;
    source_entity_type: string;
    source_external_id: string;
    canonical_entity_type: string;
    canonical_entity_id: string | null;
    match_method: string;
    match_score: number;
    status: string;
    matched_fields?: string[];
    conflicting_fields?: unknown;
    canonical_procurement_id?: string | null;
    local_first_seen_at?: string | null;
    pncp_first_seen_at?: string | null;
    lead_time_hours?: number | null;
    next_recheck_at?: string | null;
  },
): Promise<string> {
  const id = input.id ?? `link_${randomUUID()}`;
  await sql.query(
    `insert into source_entity_link (
       id, source_system_id, source_entity_type, source_external_id,
       canonical_entity_type, canonical_entity_id, match_method, match_score, status,
       matched_fields, conflicting_fields, canonical_procurement_id,
       local_first_seen_at, pncp_first_seen_at, lead_time_hours, next_recheck_at
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12,$13,$14,$15,$16)
     on conflict (source_system_id, source_entity_type, source_external_id, canonical_entity_type)
     do update set
       canonical_entity_id = excluded.canonical_entity_id,
       match_method = excluded.match_method,
       match_score = excluded.match_score,
       status = excluded.status,
       matched_fields = excluded.matched_fields,
       conflicting_fields = excluded.conflicting_fields,
       canonical_procurement_id = coalesce(excluded.canonical_procurement_id, source_entity_link.canonical_procurement_id),
       local_first_seen_at = coalesce(excluded.local_first_seen_at, source_entity_link.local_first_seen_at),
       pncp_first_seen_at = coalesce(excluded.pncp_first_seen_at, source_entity_link.pncp_first_seen_at),
       lead_time_hours = excluded.lead_time_hours,
       next_recheck_at = excluded.next_recheck_at`,
    [
      id,
      input.source_system_id,
      input.source_entity_type,
      input.source_external_id,
      input.canonical_entity_type,
      input.canonical_entity_id,
      input.match_method,
      input.match_score,
      input.status,
      JSON.stringify(input.matched_fields ?? []),
      JSON.stringify(input.conflicting_fields ?? []),
      input.canonical_procurement_id ?? null,
      input.local_first_seen_at ?? null,
      input.pncp_first_seen_at ?? null,
      input.lead_time_hours ?? null,
      input.next_recheck_at ?? null,
    ],
  );
  return id;
}

async function upsertCanonical(
  sql: Sql,
  id: string,
  source: SourceProcurement,
  extras: { municipality?: string | null; uf?: string | null; ibge?: string | null },
): Promise<void> {
  await sql.query(
    `insert into canonical_procurement (
       id, object, organization_name, organization_cnpj, municipality, uf, ibge_code,
       modality, status, opening_at, estimated_value
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     on conflict (id) do nothing`,
    [
      id,
      source.object,
      source.organization_name,
      source.organization_identifier,
      extras.municipality ?? source.organization_name,
      extras.uf ?? null,
      extras.ibge ?? null,
      source.modality,
      source.status,
      source.opening_at,
      null,
    ],
  );
}

export async function persistResolvedRecord(
  sql: Sql,
  source: SourceProcurement,
  candidates: CanonicalCandidate[],
  meta?: {
    firstSeenAt?: string | Date;
    now?: string | Date;
    uf?: string | null;
    ibge?: string | null;
  },
): Promise<void> {
  const now = meta?.now ?? new Date();
  const firstSeen = meta?.firstSeenAt ?? now;
  const resolved = resolveProcurement(source, candidates);
  const matched = resolved.status === "CONFIRMED" || resolved.status === "PROBABLE";
  const localOnly = classifyLocalOnly({
    matched,
    firstSeenAt: firstSeen,
    now,
  });

  await sql.query(
    `update source_record
     set local_only_state = $1, fetched_at = coalesce(fetched_at, now())
     where source_system_id = $2 and source_entity_type = 'procurement'
       and source_identifier = $3`,
    [localOnly, source.source_system_id, source.external_id],
  );

  let canonicalId: string | null = null;
  let pncpSeen: string | null = null;
  let lead: number | null = null;
  if (matched && resolved.canonical_entity_id) {
    canonicalId = `can_${resolved.canonical_entity_id.replace(/[^a-zA-Z0-9]/g, "_")}`;
    await upsertCanonical(sql, canonicalId, source, {
      municipality: source.organization_name,
      uf: meta?.uf ?? null,
      ibge: meta?.ibge ?? null,
    });
    const [national] = await sql.query<{ first_seen_at: unknown }>(
      `select first_seen_at from source_record
       where source_identifier = $1
         and source_system_id in ('src_br_pncp', 'src_br_comprasgov')
       order by first_seen_at asc
       limit 1`,
      [resolved.canonical_entity_id],
    );
    pncpSeen = iso(national?.first_seen_at);
    if (pncpSeen) lead = leadTimeHours(firstSeen, pncpSeen);

    const winner = candidates.find((row) => row.canonical_entity_id === resolved.canonical_entity_id);
    if (winner) {
      const conflicts = compareProcurementFields(
        source.source_system_id,
        {
          object: source.object,
          opening_at: source.opening_at,
          status: source.status,
          modality: source.modality,
        },
        winner.canonical_entity_id,
        {
          object: winner.object,
          opening_at: winner.opening_at,
          status: winner.status,
          modality: winner.modality,
        },
      );
      for (const conflict of conflicts) {
        await sql.query(
          `insert into source_comparison (
             id, canonical_id, field, source_a_id, value_a, source_b_id, value_b, observed_at, severity
           ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           on conflict (id) do nothing`,
          [
            `cmp_${canonicalId}_${conflict.field}`,
            canonicalId,
            conflict.field,
            conflict.source_a,
            conflict.value_a,
            conflict.source_b,
            conflict.value_b,
            new Date(now).toISOString(),
            "info",
          ],
        );
      }
    }
  } else {
    canonicalId = `can_local_${source.source_system_id}_${source.external_id}`.replace(
      /[^a-zA-Z0-9_]/g,
      "_",
    );
    await upsertCanonical(sql, canonicalId, source, {
      municipality: source.organization_name,
      uf: meta?.uf ?? null,
      ibge: meta?.ibge ?? null,
    });
  }

  await insertSourceEntityLink(sql, {
    source_system_id: source.source_system_id,
    source_entity_type: "procurement",
    source_external_id: source.external_id,
    canonical_entity_type: resolved.canonical_entity_type,
    canonical_entity_id: resolved.canonical_entity_id,
    match_method: resolved.match_method,
    match_score: resolved.match_score,
    status: resolved.status,
    matched_fields: resolved.matched_fields,
    conflicting_fields: resolved.conflicting_fields,
    canonical_procurement_id: canonicalId,
    local_first_seen_at: new Date(firstSeen).toISOString(),
    pncp_first_seen_at: pncpSeen,
    lead_time_hours: lead,
    next_recheck_at: matched ? null : nextRecheckAt(firstSeen, now),
  });
}

export async function resolveIngestedRecords(
  sql: Sql,
  sourceId: string,
  records: SourceProcurement[],
): Promise<void> {
  if (records.length === 0) return;
  if (sourceId === "src_br_pncp" || sourceId === "src_br_comprasgov") return;
  const [source] = await sql.query<{
    technology_family: string | null;
    jurisdiction_uf: string | null;
    ibge_code: string | null;
  }>(
    `select s.technology_family, j.uf as jurisdiction_uf, j.ibge_code
     from source_system s
     left join jurisdiction j on j.id = s.jurisdiction_id
     where s.id = $1`,
    [sourceId],
  );
  if (source?.technology_family === "PNCP" || source?.technology_family === "COMPRAS_GOV") {
    return;
  }
  const candidates = await loadNationalCandidates(sql);
  const stored = await sql.query<{ source_identifier: string; first_seen_at: unknown }>(
    `select source_identifier, first_seen_at from source_record
     where source_system_id = $1`,
    [sourceId],
  );
  const firstSeenById = new Map(
    stored.map((row) => [row.source_identifier, iso(row.first_seen_at) ?? new Date().toISOString()]),
  );
  for (const record of records) {
    await persistResolvedRecord(sql, record, candidates, {
      firstSeenAt: firstSeenById.get(record.external_id) ?? new Date(),
      uf: source?.jurisdiction_uf ?? null,
      ibge: source?.ibge_code ?? null,
    });
  }
}

export async function listMunicipalityCensus(sql: Sql): Promise<MunicipalityCensusRow[]> {
  const rows = await sql.query<Record<string, unknown>>(
    `select c.*, s.name as source_name
     from municipality_census c
     left join source_system s on s.id = c.source_system_id
     order by c.uf nulls last, c.name`,
  );
  return jsonSafe(
    rows.map((row) => ({
      id: String(row.id),
      jurisdiction_id: row.jurisdiction_id == null ? null : String(row.jurisdiction_id),
      ibge_code: row.ibge_code == null ? null : String(row.ibge_code),
      uf: row.uf == null ? null : String(row.uf),
      name: String(row.name ?? ""),
      portal_presence: String(row.portal_presence ?? "UNKNOWN"),
      source_system_id: row.source_system_id == null ? null : String(row.source_system_id),
      source_name: row.source_name == null ? null : String(row.source_name),
      evidence_level: row.evidence_level == null ? null : String(row.evidence_level),
      adapter: row.adapter == null ? null : String(row.adapter),
      discovery_capability: row.discovery_capability === true || row.discovery_capability === "t",
      active: row.active !== false && row.active !== "f",
      last_verified_at: iso(row.last_verified_at),
    })),
  );
}

export async function listLocalOnly(sql: Sql): Promise<LocalOnlyRow[]> {
  const rows = await sql.query<Record<string, unknown>>(
    `select r.id, r.source_system_id, s.name as source_name, r.source_identifier,
            r.raw_payload, r.local_only_state, r.first_seen_at, r.fetched_at, r.source_url,
            j.uf, l.next_recheck_at
     from source_record r
     join source_system s on s.id = r.source_system_id
     left join jurisdiction j on j.id = s.jurisdiction_id
     left join source_entity_link l
       on l.source_system_id = r.source_system_id
      and l.source_external_id = r.source_identifier
      and l.canonical_entity_type = 'STANDALONE'
     where r.local_only_state in ('PENDING_PNCP_MATCH', 'LOCAL_ONLY_PROVISIONAL', 'LOCAL_ONLY_CONFIRMED')
       and s.technology_family not in ('PNCP', 'COMPRAS_GOV')
     order by r.first_seen_at desc
     limit 400`,
  );
  return jsonSafe(
    rows.map((row) => {
      const payload = asRecord(row.raw_payload);
      return {
        id: String(row.id),
        source_system_id: String(row.source_system_id),
        source_name: row.source_name == null ? null : String(row.source_name),
        source_identifier: String(row.source_identifier),
        object: readStr(payload, ["objeto", "objetoCompra", "object"]),
        organization_name: readStr(payload, ["promotor", "orgaoNome", "organization_name"]),
        uf: row.uf == null ? null : String(row.uf),
        local_only_state: String(row.local_only_state ?? "PENDING_PNCP_MATCH"),
        first_seen_at: iso(row.first_seen_at),
        fetched_at: iso(row.fetched_at),
        next_recheck_at: iso(row.next_recheck_at),
        source_url: row.source_url == null ? null : String(row.source_url),
      };
    }),
  );
}

export async function listComparisons(sql: Sql): Promise<ComparisonRow[]> {
  const rows = await sql.query<Record<string, unknown>>(
    `select c.*, p.object
     from source_comparison c
     left join canonical_procurement p on p.id = c.canonical_id
     order by c.observed_at desc
     limit 200`,
  );
  return jsonSafe(
    rows.map((row) => ({
      id: String(row.id),
      canonical_id: row.canonical_id == null ? null : String(row.canonical_id),
      field: String(row.field ?? ""),
      source_a_id: row.source_a_id == null ? null : String(row.source_a_id),
      value_a: row.value_a == null ? null : String(row.value_a),
      source_b_id: row.source_b_id == null ? null : String(row.source_b_id),
      value_b: row.value_b == null ? null : String(row.value_b),
      observed_at: iso(row.observed_at),
      severity: row.severity == null ? null : String(row.severity),
      object: row.object == null ? null : String(row.object),
    })),
  );
}

export async function listLiveProbes(sql: Sql): Promise<LiveProbeRow[]> {
  const rows = await sql.query<Record<string, unknown>>(
    `select p.*, s.name as source_name
     from source_live_probe p
     left join source_system s on s.id = p.source_system_id
     order by p.probed_at desc`,
  );
  return jsonSafe(
    rows.map((row) => ({
      id: String(row.id),
      source_system_id: row.source_system_id == null ? null : String(row.source_system_id),
      source_name: row.source_name == null ? null : String(row.source_name),
      url: String(row.url ?? ""),
      http_status: row.http_status == null ? null : num(row.http_status),
      ok: row.ok === true || row.ok === "t",
      excerpt: row.excerpt == null ? null : String(row.excerpt),
      error: row.error == null ? null : String(row.error),
      probed_at: iso(row.probed_at),
    })),
  );
}

export async function listSourceRecords(sql: Sql, sourceId: string): Promise<SourceRecordRow[]> {
  const rows = await sql.query<Record<string, unknown>>(
    `select r.*, l.status as match_status, l.match_method, l.match_score,
            l.matched_fields, l.lead_time_hours
     from source_record r
     left join source_entity_link l
       on l.source_system_id = r.source_system_id
      and l.source_external_id = r.source_identifier
     where r.source_system_id = $1
     order by r.last_seen_at desc
     limit 200`,
    [sourceId],
  );
  return jsonSafe(
    rows.map((row) => {
      const matchedFields = row.matched_fields;
      return {
        id: String(row.id),
        source_system_id: String(row.source_system_id),
        source_entity_type: String(row.source_entity_type ?? "procurement"),
        source_identifier: String(row.source_identifier),
        source_url: row.source_url == null ? null : String(row.source_url),
        payload_hash: row.payload_hash == null ? null : String(row.payload_hash),
        schema_hash: row.schema_hash == null ? null : String(row.schema_hash),
        first_seen_at: iso(row.first_seen_at),
        last_seen_at: iso(row.last_seen_at),
        fetched_at: iso(row.fetched_at),
        local_only_state: row.local_only_state == null ? null : String(row.local_only_state),
        excerpt: excerptFromPayload(row.raw_payload),
        match_status: row.match_status == null ? null : String(row.match_status),
        match_method: row.match_method == null ? null : String(row.match_method),
        match_score: row.match_score == null ? null : num(row.match_score),
        matched_fields: Array.isArray(matchedFields)
          ? matchedFields.map((item) => String(item))
          : [],
        lead_time_hours: row.lead_time_hours == null ? null : num(row.lead_time_hours),
        ingestion_mode: row.ingestion_mode == null ? null : String(row.ingestion_mode),
        fetch_method: row.fetch_method == null ? null : String(row.fetch_method),
        source_channel: row.source_channel == null ? null : String(row.source_channel),
      };
    }),
  );
}

export async function searchProcurements(
  sql: Sql,
  filters: { q?: string; uf?: string; modality?: string; status?: string } = {},
): Promise<SearchHit[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filters.q?.trim()) {
    params.push(`%${filters.q.trim().toLowerCase()}%`);
    const idx = params.length;
    clauses.push(
      `(lower(coalesce(c.object, '')) like $${idx}
        or lower(coalesce(c.organization_name, '')) like $${idx}
        or lower(coalesce(c.municipality, '')) like $${idx}
        or lower(coalesce(c.catalog_code, '')) like $${idx}
        or lower(coalesce(c.normalized_object, '')) like $${idx})`,
    );
  }
  if (filters.uf) {
    params.push(filters.uf);
    clauses.push(`c.uf = $${params.length}`);
  }
  if (filters.modality) {
    params.push(filters.modality);
    clauses.push(`c.modality = $${params.length}`);
  }
  if (filters.status) {
    params.push(filters.status);
    clauses.push(`c.status = $${params.length}`);
  }
  const where = clauses.length > 0 ? `where ${clauses.join(" and ")}` : "";
  const rows = await sql.query<Record<string, unknown>>(
    `select c.*,
            (
              select string_agg(distinct s.name, ' · ')
              from source_entity_link l
              join source_system s on s.id = l.source_system_id
              where l.canonical_procurement_id = c.id
            ) as sources,
            (
              select l.status from source_entity_link l
              where l.canonical_procurement_id = c.id
              order by l.match_score desc nulls last
              limit 1
            ) as match_status,
            (
              select max(l.lead_time_hours) from source_entity_link l
              where l.canonical_procurement_id = c.id
            ) as lead_time_hours,
            (
              select r.local_only_state from source_entity_link l
              join source_record r
                on r.source_system_id = l.source_system_id
               and r.source_identifier = l.source_external_id
              where l.canonical_procurement_id = c.id
              order by r.first_seen_at asc
              limit 1
            ) as local_only_state,
            (
              select r.source_url from source_entity_link l
              join source_record r
                on r.source_system_id = l.source_system_id
               and r.source_identifier = l.source_external_id
              where l.canonical_procurement_id = c.id
                and r.source_url is not null
              limit 1
            ) as source_url,
            o.id as opportunity_id,
            o.horizon,
            o.attention_score
     from canonical_procurement c
     left join opportunity o on o.canonical_procurement_id = c.id
     ${where}
     order by c.opening_at desc nulls last, c.organization_name
     limit 200`,
    params,
  );
  return jsonSafe(
    rows.map((row) => ({
      id: String(row.id),
      object: row.object == null ? null : String(row.object),
      organization_name: row.organization_name == null ? null : String(row.organization_name),
      municipality: row.municipality == null ? null : String(row.municipality),
      uf: row.uf == null ? null : String(row.uf),
      modality: row.modality == null ? null : String(row.modality),
      status: row.status == null ? null : String(row.status),
      opening_at: iso(row.opening_at),
      estimated_value: row.estimated_value == null ? null : String(row.estimated_value),
      sources: String(row.sources ?? "")
        .split(" · ")
        .map((item) => item.trim())
        .filter(Boolean),
      match_status: row.match_status == null ? null : String(row.match_status),
      local_only_state: row.local_only_state == null ? null : String(row.local_only_state),
      lead_time_hours: row.lead_time_hours == null ? null : num(row.lead_time_hours),
      source_url: row.source_url == null ? null : String(row.source_url),
      opportunity_id: row.opportunity_id == null ? null : String(row.opportunity_id),
      horizon: row.horizon == null ? null : String(row.horizon),
      attention_score: row.attention_score == null ? null : num(row.attention_score),
    })),
  );
}

export async function milestone4Metrics(sql: Sql): Promise<Milestone4Metrics> {
  const [
    localCounts,
    linkCounts,
    localOnlyCounts,
    leadRows,
    adapters,
    censusCounts,
    declared,
    degraded,
    canonical,
    conflicts,
    familyRows,
    sources,
    probes,
  ] = await Promise.all([
    sql.query<{ family: string; n: number }>(
      `select coalesce(s.technology_family, 'UNKNOWN') as family, count(*)::int as n
       from source_record r
       join source_system s on s.id = r.source_system_id
       where s.technology_family not in ('PNCP', 'COMPRAS_GOV')
         and r.source_entity_type = 'procurement'
       group by coalesce(s.technology_family, 'UNKNOWN')`,
    ),
    sql.query<{
      pncp: number;
      compras: number;
      ambiguous: number;
      rejected: number;
    }>(
      `select
         count(distinct r.id) filter (
           where exists (
             select 1 from source_entity_link l
             where l.source_system_id = r.source_system_id
               and l.source_external_id = r.source_identifier
               and l.canonical_entity_type = 'PNCP'
               and l.status in ('CONFIRMED','PROBABLE')
           )
         )::int as pncp,
         count(distinct r.id) filter (
           where exists (
             select 1 from source_entity_link l
             where l.source_system_id = r.source_system_id
               and l.source_external_id = r.source_identifier
               and l.canonical_entity_type = 'COMPRAS_GOV'
               and l.status in ('CONFIRMED','PROBABLE')
           )
         )::int as compras,
         count(distinct r.id) filter (
           where exists (
             select 1 from source_entity_link l
             where l.source_system_id = r.source_system_id
               and l.source_external_id = r.source_identifier
               and l.status = 'REVIEW_REQUIRED'
           )
         )::int as ambiguous,
         count(distinct r.id) filter (
           where exists (
             select 1 from source_entity_link l
             where l.source_system_id = r.source_system_id
               and l.source_external_id = r.source_identifier
               and l.status = 'REJECTED'
           )
         )::int as rejected
       from source_record r
       join source_system s on s.id = r.source_system_id
       where s.technology_family not in ('PNCP', 'COMPRAS_GOV')
         and r.source_entity_type = 'procurement'`,
    ),
    sql.query<{
      pending: number;
      provisional: number;
      confirmed: number;
    }>(
      `select
         count(*) filter (where local_only_state = 'PENDING_PNCP_MATCH')::int as pending,
         count(*) filter (where local_only_state = 'LOCAL_ONLY_PROVISIONAL')::int as provisional,
         count(*) filter (where local_only_state = 'LOCAL_ONLY_CONFIRMED')::int as confirmed
       from source_record r
       join source_system s on s.id = r.source_system_id
       where s.technology_family not in ('PNCP', 'COMPRAS_GOV')`,
    ),
    sql.query<{ hours: number; source_system_id: string }>(
      `select lead_time_hours as hours, source_system_id
       from source_entity_link
       where lead_time_hours is not null`,
    ),
    sql.query<{ adapter: string; count: number }>(
      `select coalesce(nullif(connector_type, ''), 'NONE') as adapter, count(*)::int as count
       from source_system
       group by coalesce(nullif(connector_type, ''), 'NONE')
       order by count desc`,
    ),
    sql.query<{
      mapped: number;
      verified: number;
      connector: number;
      no_portal: number;
    }>(
      `select
         count(*)::int as mapped,
         count(*) filter (where evidence_level = 'VERIFIED')::int as verified,
         count(*) filter (where adapter is not null and adapter not in ('NONE', ''))::int as connector,
         count(*) filter (where portal_presence in ('NO_PORTAL_FOUND', 'PNCP_ONLY', 'UNKNOWN'))::int as no_portal
       from municipality_census`,
    ),
    sql.query<{ n: number; total: number }>(
      `select
         count(*) filter (where pncp_overlap = true)::int as n,
         count(*)::int as total
       from source_system`,
    ),
    sql.query<{ n: number }>(
      `select count(*)::int as n from source_system
       where classification_state in ('DEGRADED', 'DISABLED')`,
    ),
    sql.query<{ n: number }>(`select count(*)::int as n from canonical_procurement`),
    sql.query<{ n: number }>(`select count(*)::int as n from source_comparison`),
    sql.query<{
      family: string;
      verified: number;
      local_records: number;
      pncp_matches: number;
      local_only: number;
      public_ratio: number;
      adapter: string | null;
    }>(
      `select
         coalesce(s.technology_family, 'UNKNOWN') as family,
         count(distinct s.id) filter (where s.vendor_evidence_level = 'VERIFIED')::int as verified,
         count(distinct r.id)::int as local_records,
         count(distinct l.id) filter (where l.canonical_entity_type = 'PNCP' and l.status in ('CONFIRMED','PROBABLE'))::int as pncp_matches,
         count(distinct r.id) filter (where r.local_only_state in ('LOCAL_ONLY_PROVISIONAL','LOCAL_ONLY_CONFIRMED','PENDING_PNCP_MATCH'))::int as local_only,
         (count(distinct s.id) filter (where s.public_access)::float / nullif(count(distinct s.id), 0)) as public_ratio,
         min(nullif(s.connector_type, 'NONE')) as adapter
       from source_system s
       left join source_record r
         on r.source_system_id = s.id
        and r.source_entity_type = 'procurement'
       left join source_entity_link l
         on l.source_system_id = s.id
        and l.source_external_id = r.source_identifier
        and l.canonical_entity_type = 'PNCP'
       where s.technology_family not in ('PNCP', 'COMPRAS_GOV')
       group by coalesce(s.technology_family, 'UNKNOWN')`,
    ),
    sql.query<{
      id: string;
      technology_family: string | null;
      vendor_name: string | null;
      product_name: string | null;
      vendor_evidence_level: string | null;
      connector_type: string | null;
      classification_state: string | null;
      jurisdiction_type: string | null;
    }>(
      `select s.id, s.technology_family, s.vendor_name, s.product_name,
              s.vendor_evidence_level, s.connector_type, s.classification_state,
              j.type as jurisdiction_type
       from source_system s
       left join jurisdiction j on j.id = s.jurisdiction_id`,
    ),
    listLiveProbes(sql),
  ]);

  const localTotal = localCounts.reduce((sum, row) => sum + num(row.n), 0);
  const bllRecords = num(localCounts.find((row) => row.family === "BLL")?.n);
  const pncpMatched = num(linkCounts[0]?.pncp);
  const comprasMatched = num(linkCounts[0]?.compras);
  const overlap = recordOverlap({
    total_local_records: localTotal,
    matched_pncp_records: pncpMatched,
    matched_comprasgov_records: comprasMatched,
    local_only_records:
      num(localOnlyCounts[0]?.pending) +
      num(localOnlyCounts[0]?.provisional) +
      num(localOnlyCounts[0]?.confirmed),
    ambiguous_records: num(linkCounts[0]?.ambiguous),
    rejected_matches: num(linkCounts[0]?.rejected),
  });
  const leads = leadRows.map((row) => num(row.hours)).filter((n) => Number.isFinite(n));
  const positiveLeadSources = new Set(
    leadRows.filter((row) => num(row.hours) > 0).map((row) => row.source_system_id),
  );
  const candidates = buildFamilyCandidates(sources);
  const reuseReady = sources.filter(
    (row) =>
      row.connector_type === "GENERIC_JSON" ||
      row.connector_type === "GENERIC_ACTION" ||
      row.connector_type === "GENERIC_JSF",
  ).length;
  const adapterReuse = sources.length === 0 ? 0 : reuseReady / sources.length;
  const municipalVerified = sources.filter(
    (row) =>
      (row.jurisdiction_type === "MUNICIPALITY" || row.jurisdiction_type === "PUBLIC_ENTITY") &&
      row.vendor_evidence_level === "VERIFIED",
  ).length;
  const families5 = candidates.filter((row) => row.verified_sources >= 5).length;
  const declaredRatio =
    num(declared[0]?.total) === 0 ? 0 : num(declared[0]?.n) / num(declared[0]?.total);

  const leadByFamily = new Map<string, number[]>();
  const familyOf = new Map(sources.map((row) => [row.id, row.technology_family ?? "UNKNOWN"]));
  for (const row of leadRows) {
    const family = familyOf.get(row.source_system_id) ?? "UNKNOWN";
    const list = leadByFamily.get(family) ?? [];
    list.push(num(row.hours));
    leadByFamily.set(family, list);
  }

  const family_priorities: FamilyPriorityRow[] = familyRows
    .map((row) => {
      const candidate = candidates.find((item) => item.technology_family === row.family);
      const verified = num(row.verified);
      const local = num(row.local_records);
      const pncpRatio = local === 0 ? 0 : num(row.pncp_matches) / local;
      const generic = candidate?.generic_reuse ?? "NO-GO";
      const commercial = candidate?.commercial_adapter ?? "NO-GO";
      const publicQ = num(row.public_ratio);
      const score = integrationPriorityScore({
        number_verified_entities: Math.min(1, verified / 20),
        estimated_procurement_volume: Math.min(1, local / 200),
        current_pncp_gap: Math.max(0, 1 - pncpRatio),
        technical_reuse_probability: generic === "GO" ? 1 : publicQ > 0.5 ? 0.35 : 0.1,
        public_access_quality: publicQ,
        adapter_reuse: generic === "GO" ? 1 : row.adapter ? 0.4 : 0,
        historical_depth: 0.2,
      });
      const rationale =
        generic === "GO"
          ? "Generic reuse comprovado. Prioridade = ganho de records, não de catálogo."
          : commercial === "NO-GO"
            ? "Sem adapter comercial. Contrato público insuficiente ou escala baixa."
            : "Censo de entes ainda raso.";
      return {
        family: row.family,
        verified_entities: verified,
        records_local: local,
        pncp_overlap_ratio: pncpRatio,
        local_only: num(row.local_only),
        median_lead_time_hours: percentile(leadByFamily.get(row.family) ?? [], 50),
        adapter: row.adapter,
        generic_reuse: generic,
        commercial_adapter: commercial,
        public_access_quality: Math.round(publicQ * 1000) / 1000,
        priority_score: score,
        rationale,
      };
    })
    .sort((a, b) => b.priority_score - a.priority_score);

  const bllEntes = sources.filter((row) => row.technology_family === "BLL" && row.id !== "src_bll_platform")
    .length;
  const chosen = candidates.find((row) => row.technology_family === "BLL");
  const go =
    bllEntes >= 20 &&
    bllRecords >= 100 &&
    pncpMatched > 0 &&
    num(localOnlyCounts[0]?.provisional) + num(localOnlyCounts[0]?.confirmed) > 0 &&
    leads.length > 0 &&
    num(canonical[0]?.n) > 0;

  return jsonSafe({
    municipal_sources_verified: municipalVerified,
    active_connectors: reuseReady,
    records_ingested_local: localTotal,
    records_matched_pncp: pncpMatched,
    records_matched_comprasgov: comprasMatched,
    local_only_provisional: num(localOnlyCounts[0]?.provisional),
    local_only_confirmed: num(localOnlyCounts[0]?.confirmed),
    local_only_pending: num(localOnlyCounts[0]?.pending),
    median_lead_time_hours: percentile(leads, 50),
    p75_lead_time_hours: percentile(leads, 75),
    p95_lead_time_hours: percentile(leads, 95),
    sources_with_positive_lead: positiveLeadSources.size,
    adapter_reuse_ratio: Math.round(adapterReuse * 1000) / 1000,
    source_systems_per_adapter: adapters.map((row) => ({
      adapter: row.adapter,
      count: num(row.count),
    })),
    families_with_5plus_verified_entities: families5,
    municipalities_mapped: num(censusCounts[0]?.mapped),
    municipalities_with_verified_source: num(censusCounts[0]?.verified),
    municipalities_with_active_connector: num(censusCounts[0]?.connector),
    municipalities_without_portal: num(censusCounts[0]?.no_portal),
    canonical_procurements: num(canonical[0]?.n),
    conflicts_observed: num(conflicts[0]?.n),
    sources_degraded: num(degraded[0]?.n),
    declared_pncp_integration_ratio: declaredRatio,
    pncp_overlap_ratio: overlap.pncp_overlap_ratio,
    comprasgov_overlap_ratio: overlap.comprasgov_overlap_ratio,
    bll_entes: bllEntes,
    bll_records: bllRecords,
    ambiguous_records: overlap.ambiguous_records,
    rejected_matches: overlap.rejected_matches,
    commercial_adapter_verdict: "NO-GO",
    generic_reuse_verdict: chosen?.generic_reuse ?? "NO-GO",
    milestone_verdict: go ? "GO" : "NO-GO",
    family_priorities,
    live_probes: probes,
  });
}

export { PRIORITY_WEIGHTS, DEFAULT_COVERAGE_CONFIG };
