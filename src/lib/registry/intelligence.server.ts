import type { Sql } from "@/lib/db";
import {
  alertEventKey,
  changePriority,
  explainAlertReason,
  leadClass,
  ruleMatchesEvent,
  shouldAlertForChange,
  type AlertRuleDef,
} from "./alerts.ts";
import {
  ATTENTION_SCORE_VERSION,
  ATTENTION_WEIGHTS_V1,
  dataQualityFromGaps,
  deadlineUrgencyComponent,
  explainableAttentionScore,
  freshnessComponent,
  leadAttentionComponent,
  valueComponent,
} from "./attention.ts";
import { classifyLocalOnly, percentile, toOpportunityEarlyKind } from "./coverage.ts";
import { payloadHash } from "./hash.ts";
import type {
  AlertEventRow,
  AlertRuleRow,
  ArpListRow,
  FutureDemandRow,
  ItemDetail,
  ItemListRow,
  IntelligenceSearch,
  Milestone7Metrics,
  OpportunityDetail,
  OpportunityListRow,
  OrgDetail,
  OrgListRow,
  PlanningListRow,
  RecurrenceRow,
} from "./models.ts";
import { normalizeObject, recurrenceGroupKey } from "./object-normalize.ts";
import { digitsCnpj, resolveOrgIdentity } from "./org-identity.ts";
import {
  hardenConfirmedLink,
  linkPlanningToProcurement,
  planningConversion,
  type PlanningCandidate,
  type ProcurementCandidate,
} from "./planning-link.ts";
import { computeRecurrence, RECURRENCE_MODEL_VERSION, type RecurrencePurchase } from "./recurrence.ts";
import { schemaFingerprint } from "./schema-fingerprint.ts";

const NOW = "2026-09-14T20:00:00.000Z";

function jsonSafe<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, inner) => {
      if (typeof inner === "bigint") return Number(inner);
      if (inner instanceof Date) return inner.toISOString();
      return inner;
    }),
  ) as T;
}

function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = num(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function iso(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function asString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

async function logJob(
  sql: Sql,
  job: string,
  rows: number,
  extra?: Record<string, unknown>,
): Promise<void> {
  await sql.query(
    `insert into job_run (id, job_name, status, started_at, finished_at, rows_affected, payload)
     values ($1,$2,'ok',now(),now(),$3,$4::jsonb)`,
    [`job_${job}_${Date.now()}`, job, rows, JSON.stringify(extra ?? {})],
  );
}

function claimForHorizon(horizon: string, earlyKind: string | null): OpportunityListRow["claim_kind"] {
  if (horizon === "EARLY" && earlyKind === "LOCAL_ONLY_CONFIRMED") return "FATO_VERIFICADO";
  if (horizon === "EARLY") return "FATO_VERIFICADO";
  if (horizon === "CURRENT") return "FATO_VERIFICADO";
  return "INFERENCIA";
}

function mapOpp(row: Record<string, unknown>): OpportunityListRow {
  const horizon = String(row.horizon ?? "CURRENT");
  const early = asString(row.early_kind);
  return {
    id: String(row.id),
    canonical_id: String(row.canonical_procurement_id ?? row.canonical_id ?? ""),
    object: asString(row.object),
    organization_name: asString(row.organization_name),
    organization_id: asString(row.organization_id),
    municipality: asString(row.municipality),
    uf: asString(row.uf),
    modality: asString(row.modality),
    status: asString(row.status),
    catalog_code: asString(row.catalog_code),
    catalog_type: asString(row.catalog_type),
    horizon,
    early_kind: early,
    publication_at: iso(row.publication_at),
    proposal_deadline: iso(row.proposal_deadline),
    opening_at: iso(row.opening_at),
    estimated_value_num: numOrNull(row.estimated_value_num),
    first_seen_local: iso(row.first_seen_local),
    first_seen_pncp: iso(row.first_seen_pncp),
    lead_time_hours: numOrNull(row.lead_time_hours),
    lead_class: asString(row.lead_class),
    sources_count: num(row.sources_count),
    attention_score: numOrNull(row.attention_score),
    data_confidence: num(row.data_confidence) || 0.5,
    claim_kind: claimForHorizon(horizon, early),
  };
}

export type OpportunityFilters = {
  q?: string;
  uf?: string;
  horizon?: string;
  earlyOnly?: boolean;
  modality?: string;
  organizationId?: string;
  catalogCode?: string;
  minValue?: number;
  sort?: "newest" | "deadline" | "attention" | "value";
  limit?: number;
};

export async function listOpportunities(
  sql: Sql,
  filters: OpportunityFilters = {},
): Promise<OpportunityListRow[]> {
  const clauses: string[] = ["1=1"];
  const params: unknown[] = [];
  const add = (sqlText: string, value: unknown) => {
    params.push(value);
    clauses.push(sqlText.replace("?", `$${params.length}`));
  };
  if (filters.uf) add("uf = ?", filters.uf);
  if (filters.horizon) add("horizon = ?", filters.horizon);
  if (filters.earlyOnly) clauses.push("horizon = 'EARLY'");
  if (filters.modality) add("modality = ?", filters.modality);
  if (filters.organizationId) add("organization_id = ?", filters.organizationId);
  if (filters.catalogCode) add("catalog_code = ?", filters.catalogCode);
  if (filters.minValue != null) add("estimated_value_num >= ?", filters.minValue);
  if (filters.q) {
    params.push(`%${filters.q}%`);
    clauses.push(
      `(coalesce(object,'') ilike $${params.length} or coalesce(organization_name,'') ilike $${params.length} or coalesce(normalized_object,'') ilike $${params.length} or coalesce(catalog_code,'') ilike $${params.length} or coalesce(municipality,'') ilike $${params.length})`,
    );
  }
  const order =
    filters.sort === "deadline"
      ? "proposal_deadline asc nulls last"
      : filters.sort === "attention"
        ? "attention_score desc nulls last"
        : filters.sort === "value"
          ? "estimated_value_num desc nulls last"
          : "coalesce(first_seen_local, publication_at, opening_at) desc nulls last";
  const limit = Math.min(filters.limit ?? 200, 400);
  const rows = await sql.query<Record<string, unknown>>(
    `select * from opportunity where ${clauses.join(" and ")} order by ${order} limit ${limit}`,
    params,
  );
  return jsonSafe(rows.map(mapOpp));
}

export async function getOpportunityDetail(sql: Sql, id: string): Promise<OpportunityDetail | null> {
  const rows = await sql.query<Record<string, unknown>>(`select * from opportunity where id = $1`, [id]);
  const row = rows[0];
  if (!row) return null;
  const base = mapOpp(row);
  const [seen, events, scoreRows, planning, recurrence] = await Promise.all([
    sql.query<Record<string, unknown>>(
      `select f.source_system_id as id, s.name, f.first_seen_at
       from first_seen_by_source f
       join source_system s on s.id = f.source_system_id
       where f.canonical_procurement_id = $1
       order by f.first_seen_at`,
      [base.canonical_id],
    ),
    sql.query<Record<string, unknown>>(
      `select e.id, e.event_type, e.source_system_id, s.name as source_name,
              e.occurred_at, e.summary, e.change_priority
       from opportunity_event e
       left join source_system s on s.id = e.source_system_id
       where e.opportunity_id = $1
       order by e.occurred_at`,
      [id],
    ),
    sql.query<Record<string, unknown>>(
      `select * from opportunity_attention_score where opportunity_id = $1 and score_version = $2`,
      [id, ATTENTION_SCORE_VERSION],
    ),
    sql.query<Record<string, unknown>>(
      `select l.planning_record_id as planning_id, p.origin_type, l.status, p.object
       from planning_procurement_link l
       join planning_record p on p.id = l.planning_record_id
       where l.canonical_procurement_id = $1`,
      [base.canonical_id],
    ),
    sql.query<Record<string, unknown>>(
      `select id, signal_level, rationale, purchase_count
       from recurrence_signal
       where organization_id = $1
       order by purchase_count desc`,
      [base.organization_id],
    ),
  ]);
  const scoreRow = scoreRows[0];
  return jsonSafe({
    ...base,
    raw_object: asString(row.raw_object),
    normalized_object: asString(row.normalized_object),
    first_seen_global: iso(row.first_seen_global),
    first_seen_comprasgov: iso(row.first_seen_comprasgov),
    sources: seen.map((item) => ({
      id: String(item.id),
      name: String(item.name ?? item.id),
      first_seen_at: iso(item.first_seen_at),
    })),
    events: events.map((item) => ({
      id: String(item.id),
      event_type: String(item.event_type),
      source_system_id: asString(item.source_system_id),
      source_name: asString(item.source_name),
      occurred_at: iso(item.occurred_at) ?? "",
      summary: String(item.summary ?? ""),
      change_priority: asString(item.change_priority),
    })),
    score: scoreRow
      ? {
          score_version: String(scoreRow.score_version),
          components: parseJson(scoreRow.components_json, {}),
          weights: parseJson(scoreRow.weights_json, {}),
          final_score: num(scoreRow.final_score),
          data_confidence: num(scoreRow.data_confidence),
          rationale: String(scoreRow.rationale ?? ""),
        }
      : null,
    planning_links: planning.map((item) => ({
      planning_id: String(item.planning_id),
      origin_type: String(item.origin_type),
      status: String(item.status),
      object: asString(item.object),
    })),
    recurrence: recurrence.map((item) => ({
      id: String(item.id),
      signal_level: String(item.signal_level),
      rationale: String(item.rationale ?? ""),
      purchase_count: num(item.purchase_count),
    })),
  });
}

export async function listPlanning(sql: Sql, origin?: string): Promise<PlanningListRow[]> {
  const params: unknown[] = [];
  let where = "";
  if (origin) {
    params.push(origin);
    where = "where p.origin_type = $1";
  }
  const rows = await sql.query<Record<string, unknown>>(
    `select p.*, s.name as source_name,
            coalesce(l.status, 'UNMATCHED') as conversion_status,
            l.canonical_procurement_id as linked_procurement_id
     from planning_record p
     join source_system s on s.id = p.source_system_id
     left join lateral (
       select status, canonical_procurement_id
       from planning_procurement_link
       where planning_record_id = p.id
       order by match_score desc nulls last
       limit 1
     ) l on true
     ${where}
     order by p.year desc, p.organization_name`,
    params,
  );
  return jsonSafe(
    rows.map((row) => ({
      id: String(row.id),
      origin_type: String(row.origin_type),
      organization_name: asString(row.organization_name),
      uf: asString(row.uf),
      year: row.year == null ? null : num(row.year),
      object: asString(row.object),
      catalog_code: asString(row.catalog_code),
      estimated_value_num: numOrNull(row.estimated_value_num),
      planned_period: asString(row.planned_period),
      source_name: asString(row.source_name),
      conversion_status: String(row.conversion_status ?? "UNMATCHED"),
      linked_procurement_id: asString(row.linked_procurement_id),
    })),
  );
}

export async function listFutureDemand(sql: Sql): Promise<FutureDemandRow[]> {
  const [plans, recs] = await Promise.all([
    listPlanning(sql),
    sql.query<Record<string, unknown>>(
      `select r.*, o.display_name, o.uf
       from recurrence_signal r
       left join organization_identity o on o.id = r.organization_id
       where r.signal_level in ('MEDIUM','HIGH')`,
    ),
  ]);
  const planned: FutureDemandRow[] = plans.map((row) => ({
    id: row.id,
    origin_type: "PLANNING_OFFICIAL",
    planning_origin: row.origin_type,
    organization_name: row.organization_name,
    uf: row.uf,
    object: row.object,
    estimated_value_num: row.estimated_value_num,
    year: row.year,
    signal_level: row.conversion_status,
    claim_kind: "FATO_VERIFICADO",
  }));
  const inferred: FutureDemandRow[] = recs.map((row) => ({
    id: String(row.id),
    origin_type: "RECURRENCE_INFERENCE",
    planning_origin: null,
    organization_name: asString(row.display_name),
    uf: asString(row.uf),
    object: asString(row.normalized_object),
    estimated_value_num: numOrNull(row.median_value),
    year: null,
    signal_level: asString(row.signal_level),
    claim_kind: "INFERENCIA",
  }));
  return jsonSafe([...planned, ...inferred]);
}

function mapRecurrence(row: Record<string, unknown>, orgName?: string | null, uf?: string | null): RecurrenceRow {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    organization_name: orgName ?? asString(row.display_name),
    uf: uf ?? asString(row.uf),
    normalized_object: asString(row.normalized_object),
    catalog_code: asString(row.catalog_code),
    purchase_count: num(row.purchase_count),
    median_interval_days: numOrNull(row.median_interval_days),
    last_purchase_at: iso(row.last_purchase_at),
    signal_level: String(row.signal_level),
    confidence: num(row.confidence),
    rationale: String(row.rationale ?? ""),
    evidence_procurement_ids: parseJson(row.evidence_procurement_ids, []),
    model_version: String(row.model_version ?? RECURRENCE_MODEL_VERSION),
  };
}

function mapArp(row: Record<string, unknown>): ArpListRow {
  return {
    id: String(row.id),
    organization_name: asString(row.organization_name),
    uf: asString(row.uf),
    object: asString(row.object),
    catalog_code: asString(row.catalog_code),
    supplier_name: asString(row.supplier_name),
    remaining_balance: numOrNull(row.remaining_balance),
    remaining_ratio: numOrNull(row.remaining_ratio),
    vigency_end: iso(row.vigency_end),
    status: String(row.status ?? "ACTIVE"),
    signals: parseJson(row.signals, []),
  };
}

export async function listRecurrence(sql: Sql): Promise<RecurrenceRow[]> {
  const rows = await sql.query<Record<string, unknown>>(
    `select r.*, o.display_name, o.uf
     from recurrence_signal r
     left join organization_identity o on o.id = r.organization_id
     order by r.purchase_count desc`,
  );
  return jsonSafe(rows.map((row) => mapRecurrence(row)));
}

export async function listArps(sql: Sql): Promise<ArpListRow[]> {
  const rows = await sql.query<Record<string, unknown>>(
    `select * from arp_record order by vigency_end nulls last`,
  );
  return jsonSafe(rows.map(mapArp));
}

export async function listOrganizations(sql: Sql): Promise<OrgListRow[]> {
  const rows = await sql.query<Record<string, unknown>>(
    `select o.*, p.procurements_12m, p.procurements_24m, p.estimated_value_12m,
            p.recurring_objects, p.active_planning_items, p.active_arps
     from organization_identity o
     left join organization_profile p on p.organization_id = o.id
     order by coalesce(p.procurements_24m,0) desc, o.display_name`,
  );
  return jsonSafe(
    rows.map((row) => ({
      id: String(row.id),
      display_name: String(row.display_name),
      cnpj: asString(row.cnpj),
      uf: asString(row.uf),
      municipality: asString(row.municipality),
      identity_method: String(row.identity_method),
      identity_status: String(row.identity_status),
      procurements_12m: num(row.procurements_12m),
      procurements_24m: num(row.procurements_24m),
      estimated_value_12m: numOrNull(row.estimated_value_12m),
      recurring_objects: num(row.recurring_objects),
      active_planning_items: num(row.active_planning_items),
      active_arps: num(row.active_arps),
    })),
  );
}

export async function getOrganization(sql: Sql, id: string): Promise<OrgDetail | null> {
  const orgs = await listOrganizations(sql);
  const base = orgs.find((row) => row.id === id);
  if (!base) return null;
  const [ident, profile, recent, planning, recurrence, arps] = await Promise.all([
    sql.query<Record<string, unknown>>(`select * from organization_identity where id = $1`, [id]),
    sql.query<Record<string, unknown>>(`select * from organization_profile where organization_id = $1`, [id]),
    listOpportunities(sql, { organizationId: id, limit: 40 }),
    sql.query<Record<string, unknown>>(
      `select p.*, s.name as source_name, coalesce(l.status,'UNMATCHED') as conversion_status,
              l.canonical_procurement_id as linked_procurement_id
       from planning_record p
       join source_system s on s.id = p.source_system_id
       left join lateral (
         select status, canonical_procurement_id from planning_procurement_link
         where planning_record_id = p.id order by match_score desc nulls last limit 1
       ) l on true
       where p.organization_id = $1`,
      [id],
    ),
    sql.query<Record<string, unknown>>(
      `select r.*, o.display_name, o.uf from recurrence_signal r
       left join organization_identity o on o.id = r.organization_id
       where r.organization_id = $1`,
      [id],
    ),
    sql.query<Record<string, unknown>>(`select * from arp_record where organization_id = $1`, [id]),
  ]);
  const identRow = ident[0] ?? {};
  const profileRow = profile[0] ?? {};
  return jsonSafe({
    ...base,
    uasg: asString(identRow.uasg),
    modalities: parseJson(profileRow.modalities_json, []),
    top_categories: parseJson(profileRow.top_categories_json, []),
    average_interval_days: numOrNull(profileRow.average_interval_days),
    sources_count: num(profileRow.sources_count),
    recent,
    planning: planning.map((row) => ({
      id: String(row.id),
      origin_type: String(row.origin_type),
      organization_name: asString(row.organization_name),
      uf: asString(row.uf),
      year: row.year == null ? null : num(row.year),
      object: asString(row.object),
      catalog_code: asString(row.catalog_code),
      estimated_value_num: numOrNull(row.estimated_value_num),
      planned_period: asString(row.planned_period),
      source_name: asString(row.source_name),
      conversion_status: String(row.conversion_status ?? "UNMATCHED"),
      linked_procurement_id: asString(row.linked_procurement_id),
    })),
    recurrence: recurrence.map((row) => mapRecurrence(row)),
    arps: arps.map(mapArp),
  });
}

export async function listItems(sql: Sql): Promise<ItemListRow[]> {
  const rows = await sql.query<Record<string, unknown>>(
    `select c.*, p.organizations_buying, p.procurements_count, p.median_price, p.latest_price,
            p.latest_price_kind, p.active_plans, p.active_arps, p.recurring_buyers
     from catalog_item c
     left join item_market_profile p on p.catalog_item_id = c.id
     order by coalesce(p.procurements_count,0) desc, c.label`,
  );
  return jsonSafe(
    rows.map((row) => ({
      id: String(row.id),
      catalog_type: String(row.catalog_type),
      catalog_code: asString(row.catalog_code),
      label: String(row.label),
      classification_method: String(row.classification_method),
      confidence: num(row.confidence),
      organizations_buying: num(row.organizations_buying),
      procurements_count: num(row.procurements_count),
      median_price: numOrNull(row.median_price),
      latest_price: numOrNull(row.latest_price),
      latest_price_kind: asString(row.latest_price_kind),
      active_plans: num(row.active_plans),
      active_arps: num(row.active_arps),
      recurring_buyers: num(row.recurring_buyers),
    })),
  );
}

export async function getItem(sql: Sql, id: string): Promise<ItemDetail | null> {
  const items = await listItems(sql);
  const base = items.find((row) => row.id === id);
  if (!base) return null;
  const cat = await sql.query<Record<string, unknown>>(`select * from catalog_item where id = $1`, [id]);
  const code = asString(cat[0]?.catalog_code);
  const [buyers, prices, planning, arps, recs] = await Promise.all([
    sql.query<Record<string, unknown>>(
      `select organization_id, organization_name as name, uf, count(*)::int as count
       from opportunity
       where catalog_code = $1 or normalized_object = $2
       group by 1,2,3
       order by count desc`,
      [code, asString(cat[0]?.normalized_label)],
    ),
    sql.query<Record<string, unknown>>(
      `select id, price_kind, source_kind, unit_price, observed_at
       from price_observation where catalog_item_id = $1 order by observed_at desc`,
      [id],
    ),
    sql.query<Record<string, unknown>>(
      `select p.*, s.name as source_name, coalesce(l.status,'UNMATCHED') as conversion_status,
              l.canonical_procurement_id as linked_procurement_id
       from planning_record p
       join source_system s on s.id = p.source_system_id
       left join lateral (
         select status, canonical_procurement_id from planning_procurement_link
         where planning_record_id = p.id order by match_score desc nulls last limit 1
       ) l on true
       where p.catalog_code = $1`,
      [code],
    ),
    sql.query<Record<string, unknown>>(`select * from arp_record where catalog_code = $1`, [code]),
    sql.query<Record<string, unknown>>(
      `select r.*, o.display_name, o.uf from recurrence_signal r
       left join organization_identity o on o.id = r.organization_id
       where r.catalog_code = $1`,
      [code],
    ),
  ]);
  return jsonSafe({
    ...base,
    buyers: buyers.map((row) => ({
      organization_id: String(row.organization_id ?? ""),
      name: String(row.name ?? "—"),
      uf: asString(row.uf),
      count: num(row.count),
    })),
    prices: prices.map((row) => ({
      id: String(row.id),
      price_kind: String(row.price_kind),
      source_kind: String(row.source_kind),
      unit_price: numOrNull(row.unit_price),
      observed_at: iso(row.observed_at) ?? "",
    })),
    planning: planning.map((row) => ({
      id: String(row.id),
      origin_type: String(row.origin_type),
      organization_name: asString(row.organization_name),
      uf: asString(row.uf),
      year: row.year == null ? null : num(row.year),
      object: asString(row.object),
      catalog_code: asString(row.catalog_code),
      estimated_value_num: numOrNull(row.estimated_value_num),
      planned_period: asString(row.planned_period),
      source_name: asString(row.source_name),
      conversion_status: String(row.conversion_status ?? "UNMATCHED"),
      linked_procurement_id: asString(row.linked_procurement_id),
    })),
    arps: arps.map(mapArp),
    recurrence: recs.map((row) => mapRecurrence(row)),
  });
}

export async function listAlertRules(sql: Sql): Promise<AlertRuleRow[]> {
  const rows = await sql.query<Record<string, unknown>>(
    `select * from alert_rule order by created_at desc`,
  );
  return jsonSafe(
    rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      event_types: parseJson(row.event_types, []),
      filters: parseJson<AlertRuleRow["filters"]>(row.filters_json, {}),
      min_change_priority: asString(row.min_change_priority),
      active: Boolean(row.active),
      created_at: iso(row.created_at) ?? "",
    })),
  );
}

export async function listAlertEvents(sql: Sql): Promise<AlertEventRow[]> {
  const rows = await sql.query<Record<string, unknown>>(
    `select e.*, r.name as rule_name
     from alert_event e
     join alert_rule r on r.id = e.alert_rule_id
     order by e.triggered_at desc
     limit 200`,
  );
  return jsonSafe(
    rows.map((row) => {
      const reason = parseJson<AlertEventRow["reason"]>(row.reason_json, {});
      const because = Array.isArray(reason.because) ? reason.because.join("; ") : "";
      return {
        id: String(row.id),
        alert_rule_id: String(row.alert_rule_id),
        rule_name: String(row.rule_name),
        entity_type: String(row.entity_type),
        entity_id: String(row.entity_id),
        event_type: String(row.event_type),
        triggered_at: iso(row.triggered_at) ?? "",
        reason_text: String(reason.text || because || "Alerta determinístico."),
        reason,
      };
    }),
  );
}

export async function upsertAlertRule(
  sql: Sql,
  input: { id?: string; name: string; event_types: string[]; filters: Record<string, unknown>; min_change_priority?: string | null; active?: boolean },
): Promise<void> {
  const id = input.id ?? `rule_${payloadHash(input).slice(0, 12)}`;
  await sql.query(
    `insert into alert_rule (id, name, event_types, filters_json, min_change_priority, active)
     values ($1,$2,$3::jsonb,$4::jsonb,$5,$6)
     on conflict (id) do update set
       name = excluded.name,
       event_types = excluded.event_types,
       filters_json = excluded.filters_json,
       min_change_priority = excluded.min_change_priority,
       active = excluded.active`,
    [
      id,
      input.name,
      JSON.stringify(input.event_types),
      JSON.stringify(input.filters),
      input.min_change_priority ?? null,
      input.active ?? true,
    ],
  );
}

export async function setAlertRuleActive(sql: Sql, id: string, active: boolean): Promise<void> {
  await sql.query(`update alert_rule set active = $2 where id = $1`, [id, active]);
}

export async function listWatchlist(sql: Sql) {
  const rows = await sql.query<Record<string, unknown>>(
    `select * from watchlist_entry where active = true order by kind, value`,
  );
  return jsonSafe(
    rows.map((row) => ({
      id: String(row.id),
      kind: String(row.kind),
      value: String(row.value),
      label: asString(row.label),
    })),
  );
}

export async function upsertWatchlist(
  sql: Sql,
  input: { kind: string; value: string; label?: string | null },
): Promise<void> {
  const id = `wl_${input.kind}_${payloadHash(input.value).slice(0, 10)}`;
  await sql.query(
    `insert into watchlist_entry (id, kind, value, label, active)
     values ($1,$2,$3,$4,true)
     on conflict (kind, value) do update set active = true, label = excluded.label`,
    [id, input.kind, input.value, input.label ?? null],
  );
}

export async function getDigest(sql: Sql) {
  const rows = await sql.query<Record<string, unknown>>(
    `select * from daily_digest_snapshot order by digest_date desc limit 1`,
  );
  if (!rows[0]) return null;
  return jsonSafe({
    id: String(rows[0].id),
    digest_date: String(rows[0].digest_date),
    payload: parseJson(rows[0].payload, {}),
  });
}

export async function searchIntelligence(
  sql: Sql,
  filters: { q?: string; uf?: string } = {},
): Promise<IntelligenceSearch> {
  const q = filters.q?.trim() ?? "";
  const uf = filters.uf?.trim() ?? "";
  const [opportunities, planning, recurrence, organizations, procurements] = await Promise.all([
    listOpportunities(sql, { q: q || undefined, uf: uf || undefined, limit: 80 }),
    listPlanning(sql),
    listRecurrence(sql),
    listOrganizations(sql),
    (async () => {
      const { searchProcurements } = await import("./coverage.server.ts");
      return searchProcurements(sql, { q: q || undefined, uf: uf || undefined });
    })(),
  ]);
  const needle = q.toLowerCase();
  if (!needle) {
    return jsonSafe({
      procurements,
      opportunities: [],
      planning: [],
      recurrence: [],
      organizations: [],
    });
  }
  const matchText = (...parts: Array<string | null | undefined>) => {
    if (!needle) return true;
    return parts.some((part) => (part ?? "").toLowerCase().includes(needle));
  };
  const planningHits = planning.filter(
    (row) =>
      (!uf || row.uf === uf) &&
      matchText(row.object, row.organization_name, row.catalog_code, row.origin_type),
  );
  const recurrenceHits = recurrence.filter(
    (row) =>
      (!uf || row.uf === uf) &&
      matchText(row.normalized_object, row.organization_name, row.catalog_code, row.rationale),
  );
  const recOrgIds = new Set(recurrenceHits.map((row) => row.organization_id));
  return jsonSafe({
    procurements,
    opportunities,
    planning: planningHits,
    recurrence: recurrenceHits,
    organizations: organizations.filter(
      (row) =>
        (!uf || row.uf === uf) &&
        (matchText(row.display_name, row.municipality, row.cnpj, row.uf) || recOrgIds.has(row.id)),
    ),
  });
}

export async function ensureOrgIdentities(sql: Sql): Promise<number> {
  const rows = await sql.query<Record<string, unknown>>(
    `select distinct organization_name, organization_cnpj, municipality, uf, ibge_code
     from canonical_procurement
     where organization_name is not null or organization_cnpj is not null`,
  );
  let n = 0;
  for (const row of rows) {
    const ident = resolveOrgIdentity({
      display_name: String(row.organization_name ?? "Órgão"),
      cnpj: asString(row.organization_cnpj),
      municipality: asString(row.municipality),
      uf: asString(row.uf),
      ibge_code: asString(row.ibge_code),
    });
    await sql.query(
      `insert into organization_identity (
         id, display_name, cnpj, municipality, uf, ibge_code, identity_method, identity_status, observed_at
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do nothing`,
      [
        ident.id,
        ident.display_name,
        ident.cnpj ?? null,
        ident.municipality ?? null,
        ident.uf ?? null,
        ident.ibge_code ?? null,
        ident.identity_method,
        ident.identity_status,
        NOW,
      ],
    );
    if (ident.cnpj) {
      await sql.query(
        `update canonical_procurement set organization_id = $1 where organization_cnpj = $2`,
        [ident.id, ident.cnpj],
      );
    } else {
      await sql.query(
        `update canonical_procurement set organization_id = $1
         where organization_id is null and organization_name = $2 and coalesce(uf,'') = coalesce($3,'')`,
        [ident.id, ident.display_name, ident.uf ?? ""],
      );
    }
    n += 1;
  }
  return n;
}

export async function materializeOpportunities(sql: Sql): Promise<number> {
  await ensureOrgIdentities(sql);
  const canonical = await sql.query<Record<string, unknown>>(`select * from canonical_procurement`);
  const links = await sql.query<Record<string, unknown>>(
    `select l.*, s.technology_family, s.name as source_name, r.first_seen_at as record_first_seen,
            r.local_only_state, r.source_system_id as rec_source
     from source_entity_link l
     join source_system s on s.id = l.source_system_id
     left join source_record r
       on r.source_system_id = l.source_system_id
      and r.source_identifier = l.source_external_id
      and r.source_entity_type = 'procurement'`,
  );
  const recurrences = await sql.query<{ organization_id: string; signal_level: string }>(
    `select organization_id, max(signal_level) as signal_level from recurrence_signal group by 1`,
  );
  const recByOrg = new Map(recurrences.map((row) => [row.organization_id, row.signal_level]));
  const planningLinks = await sql.query<{ canonical_procurement_id: string; status: string }>(
    `select canonical_procurement_id, status from planning_procurement_link
     where canonical_procurement_id is not null`,
  );
  const planByCan = new Map(
    planningLinks.map((row) => [row.canonical_procurement_id, row.status]),
  );

  const byCanonical = new Map<string, Record<string, unknown>[]>();
  for (const link of links) {
    const cid = asString(link.canonical_procurement_id);
    if (!cid) continue;
    const list = byCanonical.get(cid) ?? [];
    list.push(link);
    byCanonical.set(cid, list);
  }

  let count = 0;
  for (const can of canonical) {
    const cid = String(can.id);
    const related = byCanonical.get(cid) ?? [];
    let firstLocal: string | null = null;
    let firstPncp: string | null = null;
    let firstCg: string | null = null;
    const sourceIds = new Set<string>();
    for (const link of related) {
      const seen = iso(link.record_first_seen) ?? iso(link.local_first_seen_at);
      const sid = asString(link.source_system_id);
      const family = String(link.technology_family ?? "");
      if (sid && seen) {
        sourceIds.add(sid);
        await sql.query(
          `insert into first_seen_by_source (id, canonical_procurement_id, source_system_id, first_seen_at)
           values ($1,$2,$3,$4)
           on conflict (canonical_procurement_id, source_system_id) do update set
             first_seen_at = least(first_seen_by_source.first_seen_at, excluded.first_seen_at)`,
          [`fs_${cid}_${sid}`, cid, sid, seen],
        );
      }
      if (family === "PNCP") {
        firstPncp = [firstPncp, seen, iso(link.pncp_first_seen_at)].filter(Boolean).sort()[0] ?? firstPncp;
      } else if (family === "COMPRAS_GOV") {
        firstCg = [firstCg, seen].filter(Boolean).sort()[0] ?? firstCg;
      } else if (seen) {
        firstLocal = [firstLocal, seen, iso(link.local_first_seen_at)].filter(Boolean).sort()[0] ?? firstLocal;
      }
    }
    const firstGlobal = [firstLocal, firstPncp, firstCg].filter(Boolean).sort()[0] ?? iso(can.opening_at);
    const lead =
      firstLocal && firstPncp
        ? Math.round(((new Date(firstPncp).getTime() - new Date(firstLocal).getTime()) / 3_600_000) * 100) /
          100
        : numOrNull(related.find((row) => row.lead_time_hours != null)?.lead_time_hours);
    const localOnly = related
      .map((row) => asString(row.local_only_state))
      .find((state) => state && state !== "MATCHED");
    const matchedPncp = Boolean(firstPncp);
    let earlyKind: string | null = null;
    if (lead != null && lead > 0 && matchedPncp) earlyKind = "EARLY_MATCHED";
    else if (localOnly) earlyKind = toOpportunityEarlyKind(localOnly);
    else if (!matchedPncp && firstLocal) {
      earlyKind = toOpportunityEarlyKind(
        classifyLocalOnly({ matched: false, firstSeenAt: firstLocal, now: NOW }),
      );
    }
    const horizon = earlyKind && earlyKind !== "MATCHED" ? "EARLY" : "CURRENT";

    const opening = iso(can.opening_at);
    const deadline = iso(can.proposal_deadline);
    const recent =
      (opening && new Date(opening).getTime() >= new Date("2026-08-01T00:00:00.000Z").getTime()) ||
      (deadline && new Date(deadline).getTime() >= new Date(NOW).getTime()) ||
      (firstLocal && new Date(firstLocal).getTime() >= new Date("2026-09-01T00:00:00.000Z").getTime()) ||
      horizon === "EARLY";
    if (!recent) continue;

    const object = asString(can.object);
    const normalized = normalizeObject(object);
    const orgId = asString(can.organization_id);
    const hasCnpj = Boolean(digitsCnpj(asString(can.organization_cnpj)));
    const value = numOrNull(can.estimated_value_num);
    const dataQ = dataQualityFromGaps({
      hasCnpj,
      hasValue: value != null,
      hasDeadline: Boolean(deadline),
      matchAmbiguous: related.some((row) => String(row.status) === "REVIEW_REQUIRED"),
    });
    const recLevel = orgId ? recByOrg.get(orgId) : null;
    const recComponent = recLevel === "HIGH" ? 0.9 : recLevel === "MEDIUM" ? 0.6 : recLevel === "LOW" ? 0.3 : 0.1;
    const planStatus = planByCan.get(cid);
    const planComponent = planStatus === "CONFIRMED" ? 1 : planStatus === "PROBABLE" ? 0.6 : 0.1;
    const explained = explainableAttentionScore({
      freshness: freshnessComponent(firstGlobal, NOW),
      lead_time: leadAttentionComponent(lead),
      deadline_urgency: deadlineUrgencyComponent(deadline, NOW),
      organization_recurrence: recComponent,
      category_relevance: asString(can.catalog_code) ? 0.8 : 0.35,
      planning_confirmation: planComponent,
      estimated_value: valueComponent(value),
      data_quality: dataQ,
      source_confidence: Math.min(1, sourceIds.size / 3),
    });

    const oppId = `opp_${cid}`;
    await sql.query(
      `insert into opportunity (
         id, canonical_procurement_id, organization_id, organization_name, municipality, uf,
         object, raw_object, normalized_object, catalog_code, catalog_type, modality, status,
         publication_at, proposal_deadline, opening_at, estimated_value_num, horizon, early_kind,
         first_seen_global, first_seen_local, first_seen_pncp, first_seen_comprasgov,
         lead_time_hours, lead_class, sources_count, data_confidence, attention_score,
         attention_score_version, observed_at
       ) values (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30
       )
       on conflict (canonical_procurement_id) do update set
         horizon = excluded.horizon,
         early_kind = excluded.early_kind,
         first_seen_local = excluded.first_seen_local,
         first_seen_pncp = excluded.first_seen_pncp,
         lead_time_hours = excluded.lead_time_hours,
         lead_class = excluded.lead_class,
         sources_count = excluded.sources_count,
         attention_score = excluded.attention_score,
         data_confidence = excluded.data_confidence,
         normalized_object = excluded.normalized_object`,
      [
        oppId,
        cid,
        orgId,
        asString(can.organization_name),
        asString(can.municipality),
        asString(can.uf),
        object,
        object,
        normalized.normalized,
        asString(can.catalog_code),
        asString(can.catalog_type),
        asString(can.modality),
        asString(can.status),
        iso(can.publication_at),
        deadline,
        opening,
        value,
        horizon,
        earlyKind,
        firstGlobal,
        firstLocal,
        firstPncp,
        firstCg,
        lead,
        leadClass(lead),
        sourceIds.size,
        explained.data_confidence,
        explained.final_score,
        ATTENTION_SCORE_VERSION,
        NOW,
      ],
    );
    await sql.query(
      `insert into opportunity_attention_score (
         id, opportunity_id, score_version, components_json, weights_json, final_score, data_confidence, rationale, ranked_at
       ) values ($1,$2,$3,$4::jsonb,$5::jsonb,$6,$7,$8,$9)
       on conflict (opportunity_id, score_version) do update set
         components_json = excluded.components_json,
         final_score = excluded.final_score,
         data_confidence = excluded.data_confidence,
         rationale = excluded.rationale`,
      [
        `att_${oppId}_${ATTENTION_SCORE_VERSION}`,
        oppId,
        ATTENTION_SCORE_VERSION,
        JSON.stringify(explained.components),
        JSON.stringify(explained.weights),
        explained.final_score,
        explained.data_confidence,
        explained.rationale,
        NOW,
      ],
    );

    if (firstLocal) {
      await sql.query(
        `insert into opportunity_event (id, opportunity_id, event_type, source_system_id, occurred_at, summary, observed_at)
         values ($1,$2,'OBSERVED_LOCAL',null,$3,'Observada na fonte local',$4)
         on conflict (id) do nothing`,
        [`ev_${oppId}_local`, oppId, firstLocal, NOW],
      );
    }
    if (firstPncp) {
      await sql.query(
        `insert into opportunity_event (id, opportunity_id, event_type, source_system_id, occurred_at, summary, observed_at)
         values ($1,$2,'PUBLISHED_PNCP','src_br_pncp',$3,'Publicada no PNCP',$4)
         on conflict (id) do nothing`,
        [`ev_${oppId}_pncp`, oppId, firstPncp, NOW],
      );
    }
    count += 1;
  }
  await logJob(sql, "MATERIALIZE_OPPORTUNITIES", count);
  return count;
}

export async function refreshOrganizationProfiles(sql: Sql): Promise<number> {
  const orgs = await sql.query<Record<string, unknown>>(`select * from organization_identity`);
  let n = 0;
  for (const org of orgs) {
    const id = String(org.id);
    const stats = await sql.query<Record<string, unknown>>(
      `select
         count(*) filter (where coalesce(opening_at, publication_at, created_at) >= timestamptz '2025-09-14')::int as n12,
         count(*)::int as n24,
         coalesce(sum(estimated_value_num) filter (where coalesce(opening_at, publication_at, created_at) >= timestamptz '2025-09-14'),0) as v12
       from canonical_procurement where organization_id = $1`,
      [id],
    );
    const mods = await sql.query<{ modality: string; count: number }>(
      `select coalesce(modality,'UNKNOWN') as modality, count(*)::int as count
       from canonical_procurement where organization_id = $1 group by 1`,
      [id],
    );
    const cats = await sql.query<{ label: string; count: number }>(
      `select coalesce(catalog_code, normalized_object, 'sem categoria') as label, count(*)::int as count
       from canonical_procurement where organization_id = $1 group by 1 order by 2 desc limit 5`,
      [id],
    );
    const rec = await sql.query<{ n: number; avg_interval: number | null }>(
      `select count(*)::int as n, avg(median_interval_days) as avg_interval
       from recurrence_signal where organization_id = $1 and signal_level <> 'NONE'`,
      [id],
    );
    const plans = await sql.query<{ n: number }>(
      `select count(*)::int as n from planning_record where organization_id = $1`,
      [id],
    );
    const arps = await sql.query<{ n: number }>(
      `select count(*)::int as n from arp_record where organization_id = $1 and status = 'ACTIVE'`,
      [id],
    );
    const sources = await sql.query<{ n: number }>(
      `select count(distinct source_system_id)::int as n
       from source_entity_link l
       join canonical_procurement c on c.id = l.canonical_procurement_id
       where c.organization_id = $1`,
      [id],
    );
    await sql.query(
      `insert into organization_profile (
         organization_id, procurements_12m, procurements_24m, estimated_value_12m,
         modalities_json, top_categories_json, average_interval_days, recurring_objects, active_planning_items,
         active_arps, sources_count, refreshed_at
       ) values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9,$10,$11,$12)
       on conflict (organization_id) do update set
         procurements_12m = excluded.procurements_12m,
         procurements_24m = excluded.procurements_24m,
         estimated_value_12m = excluded.estimated_value_12m,
         modalities_json = excluded.modalities_json,
         top_categories_json = excluded.top_categories_json,
         average_interval_days = excluded.average_interval_days,
         recurring_objects = excluded.recurring_objects,
         active_planning_items = excluded.active_planning_items,
         active_arps = excluded.active_arps,
         sources_count = excluded.sources_count,
         refreshed_at = excluded.refreshed_at`,
      [
        id,
        num(stats[0]?.n12),
        num(stats[0]?.n24),
        num(stats[0]?.v12),
        JSON.stringify(mods),
        JSON.stringify(cats),
        numOrNull(rec[0]?.avg_interval),
        num(rec[0]?.n),
        num(plans[0]?.n),
        num(arps[0]?.n),
        num(sources[0]?.n),
        NOW,
      ],
    );
    n += 1;
  }
  await logJob(sql, "REFRESH_ORGANIZATION_PROFILE", n);
  return n;
}

export async function calculateRecurrence(sql: Sql): Promise<number> {
  const rows = await sql.query<Record<string, unknown>>(
    `select id, organization_id, object, catalog_code, estimated_value_num,
            coalesce(opening_at, publication_at, created_at) as occurred_at
     from canonical_procurement
     where organization_id is not null`,
  );
  const groups = new Map<string, RecurrencePurchase[]>();
  const meta = new Map<string, { org: string; catalog: string | null; normalized: string }>();
  for (const row of rows) {
    const org = String(row.organization_id);
    const normalized = normalizeObject(asString(row.object));
    const key = recurrenceGroupKey({
      organizationId: org,
      catalogCode: asString(row.catalog_code),
      normalized,
    });
    const list = groups.get(key) ?? [];
    list.push({
      canonical_id: String(row.id),
      occurred_at: iso(row.occurred_at) ?? NOW,
      value: numOrNull(row.estimated_value_num),
      normalized,
      catalog_code: asString(row.catalog_code),
    });
    groups.set(key, list);
    meta.set(key, { org, catalog: asString(row.catalog_code), normalized: normalized.normalized });
  }
  let n = 0;
  for (const [key, purchases] of groups) {
    const result = computeRecurrence({ purchases, now: NOW, windowMonths: 36 });
    if (result.signal_level === "NONE") continue;
    const info = meta.get(key);
    if (!info) continue;
    const id = `rec_${payloadHash(key).slice(0, 16)}`;
    await sql.query(
      `insert into recurrence_signal (
         id, organization_id, group_key, normalized_object, catalog_code, window_months,
         purchase_count, median_interval_days, last_purchase_at, average_value, median_value,
         seasonality, signal_level, confidence, rationale, evidence_procurement_ids, sample_size,
         model_version, observed_at
       ) values ($1,$2,$3,$4,$5,36,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16,$17,$18)
       on conflict (organization_id, group_key, model_version) do update set
         purchase_count = excluded.purchase_count,
         median_interval_days = excluded.median_interval_days,
         last_purchase_at = excluded.last_purchase_at,
         signal_level = excluded.signal_level,
         confidence = excluded.confidence,
         rationale = excluded.rationale,
         evidence_procurement_ids = excluded.evidence_procurement_ids`,
      [
        id,
        info.org,
        key,
        info.normalized,
        info.catalog,
        result.purchase_count,
        result.median_interval_days,
        result.last_purchase_at,
        result.average_value,
        result.median_value,
        result.seasonality,
        result.signal_level,
        result.confidence,
        result.rationale,
        JSON.stringify(result.evidence_procurement_ids),
        result.sample_size,
        RECURRENCE_MODEL_VERSION,
        NOW,
      ],
    );
    n += 1;
  }
  await logJob(sql, "CALCULATE_RECURRENCE", n);
  return n;
}

export async function linkPlanning(sql: Sql): Promise<number> {
  const plans = await sql.query<Record<string, unknown>>(`select * from planning_record`);
  const procs = await sql.query<Record<string, unknown>>(
    `select id, organization_cnpj, extract(year from coalesce(opening_at, created_at)) as year,
            catalog_code, object, estimated_value_num
     from canonical_procurement`,
  );
  const procurements: ProcurementCandidate[] = procs.map((row) => ({
    id: String(row.id),
    organization_cnpj: asString(row.organization_cnpj),
    year: row.year == null ? null : num(row.year),
    catalog_code: asString(row.catalog_code),
    numero_item_pncp: null,
    object: asString(row.object),
    estimated_value_num: numOrNull(row.estimated_value_num),
  }));
  let n = 0;
  for (const plan of plans) {
    const candidate: PlanningCandidate = {
      id: String(plan.id),
      origin_type: String(plan.origin_type) === "PGC_COMPRASGOV" ? "PGC_COMPRASGOV" : "PCA_PNCP",
      organization_cnpj: asString(plan.organization_cnpj),
      year: plan.year == null ? null : num(plan.year),
      catalog_code: asString(plan.catalog_code),
      numero_item_pncp: asString(plan.numero_item_pncp),
      item_number: asString(plan.item_number),
      object: asString(plan.object),
      estimated_value_num: numOrNull(plan.estimated_value_num),
    };
    const linked = hardenConfirmedLink(linkPlanningToProcurement(candidate, procurements));
    await sql.query(
      `insert into planning_procurement_link (
         id, planning_record_id, canonical_procurement_id, status, match_method, match_score, matched_fields, observed_at
       ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
       on conflict (id) do update set
         canonical_procurement_id = excluded.canonical_procurement_id,
         status = excluded.status,
         match_method = excluded.match_method,
         match_score = excluded.match_score,
         matched_fields = excluded.matched_fields`,
      [
        `ppl_${candidate.id}_${linked.procurement_id ?? "none"}`,
        candidate.id,
        linked.procurement_id,
        linked.status,
        linked.match_method,
        linked.match_score,
        JSON.stringify(linked.matched_fields),
        NOW,
      ],
    );
    n += 1;
  }
  await logJob(sql, "LINK_PLANNING", n);
  return n;
}

export async function refreshItemProfiles(sql: Sql): Promise<number> {
  const items = await sql.query<Record<string, unknown>>(`select * from catalog_item`);
  let n = 0;
  for (const item of items) {
    const id = String(item.id);
    const code = asString(item.catalog_code);
    const label = asString(item.normalized_label) ?? asString(item.label);
    const stats = await sql.query<Record<string, unknown>>(
      `select count(*)::int as n,
              count(distinct organization_id)::int as orgs
       from canonical_procurement
       where catalog_code = $1 or normalized_object = $2`,
      [code, label],
    );
    const prices = await sql.query<Record<string, unknown>>(
      `select unit_price, price_kind, observed_at from price_observation
       where catalog_item_id = $1 and unit_price is not null
       order by observed_at desc`,
      [id],
    );
    const nums = prices.map((row) => num(row.unit_price)).filter((v) => v > 0).sort((a, b) => a - b);
    const median = nums.length ? nums[Math.floor(nums.length / 2)] : null;
    const plans = await sql.query<{ n: number }>(
      `select count(*)::int as n from planning_record where catalog_code = $1`,
      [code],
    );
    const arps = await sql.query<{ n: number }>(
      `select count(*)::int as n from arp_record where catalog_code = $1 and status = 'ACTIVE'`,
      [code],
    );
    const rec = await sql.query<{ n: number }>(
      `select count(distinct organization_id)::int as n from recurrence_signal
       where catalog_code = $1 and signal_level in ('MEDIUM','HIGH')`,
      [code],
    );
    await sql.query(
      `insert into item_market_profile (
         catalog_item_id, organizations_buying, procurements_count, median_price, latest_price,
         latest_price_kind, active_plans, active_arps, recurring_buyers, refreshed_at
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       on conflict (catalog_item_id) do update set
         organizations_buying = excluded.organizations_buying,
         procurements_count = excluded.procurements_count,
         median_price = excluded.median_price,
         latest_price = excluded.latest_price,
         latest_price_kind = excluded.latest_price_kind,
         active_plans = excluded.active_plans,
         active_arps = excluded.active_arps,
         recurring_buyers = excluded.recurring_buyers,
         refreshed_at = excluded.refreshed_at`,
      [
        id,
        num(stats[0]?.orgs),
        num(stats[0]?.n),
        median,
        prices[0] ? num(prices[0].unit_price) : null,
        prices[0] ? asString(prices[0].price_kind) : null,
        num(plans[0]?.n),
        num(arps[0]?.n),
        num(rec[0]?.n),
        NOW,
      ],
    );
    n += 1;
  }
  await logJob(sql, "REFRESH_ITEM_PROFILE", n);
  return n;
}

export async function generateAlertEvents(sql: Sql): Promise<number> {
  const rules = await listAlertRules(sql);
  const active = rules.filter((row) => row.active);
  const opps = await listOpportunities(sql, { limit: 400 });
  const plans = await listPlanning(sql);
  const recs = await listRecurrence(sql);
  const arps = await listArps(sql);
  const events = await sql.query<Record<string, unknown>>(
    `select * from opportunity_event where change_priority is not null`,
  );
  let n = 0;

  const insertEvent = async (args: {
    rule: AlertRuleRow;
    entityType: string;
    entityId: string;
    eventType: string;
    distinguishing?: string;
    extra?: Record<string, string | number | null | undefined>;
  }) => {
    const key = alertEventKey({
      ruleId: args.rule.id,
      entityType: args.entityType,
      entityId: args.entityId,
      eventType: args.eventType,
      distinguishing: args.distinguishing,
    });
    const reason = explainAlertReason({
      ruleName: args.rule.name,
      filters: args.rule.filters as AlertRuleDef["filters"],
      eventType: args.eventType,
      extra: args.extra,
    });
    await sql.query(
      `insert into alert_event (id, event_key, alert_rule_id, entity_type, entity_id, event_type, triggered_at, reason_json)
       values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
       on conflict (event_key) do nothing`,
      [`al_${key.slice(0, 24)}`, key, args.rule.id, args.entityType, args.entityId, args.eventType, NOW, JSON.stringify(reason)],
    );
    n += 1;
  };

  for (const rule of active) {
    const def: AlertRuleDef = {
      id: rule.id,
      event_types: rule.event_types,
      filters: rule.filters as AlertRuleDef["filters"],
      min_change_priority: (rule.min_change_priority as "HIGH" | "MEDIUM" | "LOW") ?? null,
    };
    for (const opp of opps) {
      const input = {
        eventType: opp.horizon === "EARLY" ? "EARLY_SOURCE_ALERT" : "NEW_PROCUREMENT",
        uf: opp.uf,
        municipality: opp.municipality,
        organizationId: opp.organization_id,
        organizationName: opp.organization_name,
        catalogCode: opp.catalog_code,
        object: opp.object,
        estimatedValue: opp.estimated_value_num,
        horizon: opp.horizon,
        earlyKind: opp.early_kind,
      };
      if (ruleMatchesEvent({ ...def, event_types: def.event_types.includes("*") ? ["*"] : def.event_types }, input) ||
          ruleMatchesEvent(def, input)) {
        await insertEvent({
          rule,
          entityType: "opportunity",
          entityId: opp.id,
          eventType: input.eventType,
          extra: {
            UF: opp.uf,
            órgão: opp.organization_name,
            valor: opp.estimated_value_num,
          },
        });
      }
    }
    for (const plan of plans) {
      const input = {
        eventType: plan.origin_type === "PGC_COMPRASGOV" ? "PGC_CHANGED" : "PCA_PUBLISHED",
        uf: plan.uf,
        organizationName: plan.organization_name,
        catalogCode: plan.catalog_code,
        object: plan.object,
        estimatedValue: plan.estimated_value_num,
      };
      if (ruleMatchesEvent(def, input)) {
        await insertEvent({
          rule,
          entityType: "planning_record",
          entityId: plan.id,
          eventType: input.eventType,
          extra: { origem: plan.origin_type },
        });
      }
    }
    for (const rec of recs) {
      const input = {
        eventType: "RECURRENCE_SIGNAL",
        uf: rec.uf,
        organizationId: rec.organization_id,
        organizationName: rec.organization_name,
        catalogCode: rec.catalog_code,
        object: rec.normalized_object,
      };
      if (ruleMatchesEvent(def, input) && rec.signal_level !== "NONE") {
        await insertEvent({
          rule,
          entityType: "recurrence_signal",
          entityId: rec.id,
          eventType: "RECURRENCE_SIGNAL",
          extra: { nível: rec.signal_level },
        });
      }
    }
    for (const arp of arps) {
      if (!arp.signals.includes("NEAR_EXPIRATION") && !def.event_types.includes("ARP_NEAR_EXPIRATION")) continue;
      const input = {
        eventType: "ARP_NEAR_EXPIRATION",
        uf: arp.uf,
        organizationName: arp.organization_name,
        catalogCode: arp.catalog_code,
        object: arp.object,
      };
      if (ruleMatchesEvent(def, input) || def.event_types.includes("ARP_NEAR_EXPIRATION")) {
        if (arp.signals.includes("NEAR_EXPIRATION")) {
          await insertEvent({
            rule,
            entityType: "arp_record",
            entityId: arp.id,
            eventType: "ARP_NEAR_EXPIRATION",
            extra: { vigência: arp.vigency_end },
          });
        }
      }
    }
    for (const ev of events) {
      const field = String(ev.event_type ?? "metadata");
      const prio = (asString(ev.change_priority) as "HIGH" | "MEDIUM" | "LOW") ?? changePriority(field);
      if (!shouldAlertForChange(prio, def.min_change_priority)) continue;
      const input = {
        eventType: "PROCUREMENT_CHANGED",
        object: String(ev.summary ?? ""),
      };
      if (ruleMatchesEvent(def, input) || def.event_types.includes("PROCUREMENT_CHANGED")) {
        await insertEvent({
          rule,
          entityType: "opportunity_event",
          entityId: String(ev.id),
          eventType: "PROCUREMENT_CHANGED",
          distinguishing: prio,
          extra: { prioridade: prio, resumo: asString(ev.summary) },
        });
      }
    }
  }
  await logJob(sql, "GENERATE_ALERT_EVENTS", n);
  return n;
}

export async function snapshotDigest(sql: Sql): Promise<void> {
  const metrics = await milestone7Metrics(sql);
  await sql.query(
    `insert into daily_digest_snapshot (id, digest_date, payload, created_at)
     values ('digest_2026-09-14','2026-09-14',$1::jsonb,$2)
     on conflict (digest_date) do update set payload = excluded.payload`,
    [JSON.stringify(metrics), NOW],
  );
}

export async function runIntelligenceJobs(sql: Sql): Promise<void> {
  await sql.query(
    `insert into attention_score_version (version, formula, weights_json, documented_at, notes)
     values ($1,$2,$3::jsonb,$4,$5)
     on conflict (version) do nothing`,
    [
      ATTENTION_SCORE_VERSION,
      "weighted_sum(freshness, lead_time, deadline_urgency, recurrence, category, planning, value, data_quality, source_confidence)",
      JSON.stringify(ATTENTION_WEIGHTS_V1),
      NOW,
      "Score de atenção estrutural. Não é probabilidade de vitória nem personalização por empresa.",
    ],
  );
  await calculateRecurrence(sql);
  await linkPlanning(sql);
  await materializeOpportunities(sql);
  await refreshOrganizationProfiles(sql);
  await refreshItemProfiles(sql);
  await generateAlertEvents(sql);
  await snapshotDigest(sql);
}

export async function milestone7Metrics(sql: Sql): Promise<Milestone7Metrics> {
  const [opp, early, plan, pca, pgc, rec, arp, alerts, orgs, items, jobs, golden, conv, lead] =
    await Promise.all([
      sql.query<{ n: number }>(`select count(*)::int as n from opportunity`),
      sql.query<{ n: number }>(`select count(*)::int as n from opportunity where horizon = 'EARLY'`),
      sql.query<{ n: number }>(`select count(*)::int as n from planning_record`),
      sql.query<{ n: number }>(`select count(*)::int as n from planning_record where origin_type = 'PCA_PNCP'`),
      sql.query<{ n: number }>(`select count(*)::int as n from planning_record where origin_type = 'PGC_COMPRASGOV'`),
      sql.query<{ n: number }>(`select count(*)::int as n from recurrence_signal where signal_level <> 'NONE'`),
      sql.query<{ n: number }>(`select count(*)::int as n from arp_record where status = 'ACTIVE'`),
      sql.query<{ n: number }>(`select count(*)::int as n from alert_event`),
      sql.query<{ n: number }>(`select count(*)::int as n from organization_profile`),
      sql.query<{ n: number }>(`select count(*)::int as n from item_market_profile`),
      sql.query<{ n: number }>(`select count(*)::int as n from job_run`),
      sql.query<{ n: number }>(`select count(*)::int as n from golden_case`),
      sql.query<{ planned: number; converted: number }>(
        `select count(*)::int as planned,
                count(*) filter (where l.status in ('CONFIRMED','PROBABLE'))::int as converted
         from planning_record p
         left join lateral (
           select status from planning_procurement_link
           where planning_record_id = p.id order by match_score desc nulls last limit 1
         ) l on true`,
      ),
      sql.query<{ hours: number }>(
        `select lead_time_hours as hours from opportunity
         where lead_time_hours is not null and lead_time_hours > 0`,
      ),
    ]);
  const conversion = planningConversion({
    planned: num(conv[0]?.planned),
    converted: num(conv[0]?.converted),
  });
  const active = num(opp[0]?.n);
  const earlyN = num(early[0]?.n);
  const go =
    active >= 1 &&
    earlyN >= 1 &&
    num(orgs[0]?.n) >= 1 &&
    num(rec[0]?.n) >= 1 &&
    num(pca[0]?.n) >= 1 &&
    num(pgc[0]?.n) >= 1 &&
    num(arp[0]?.n) >= 1 &&
    num(items[0]?.n) >= 1 &&
    num(alerts[0]?.n) >= 1 &&
    num(golden[0]?.n) >= 8;

  return jsonSafe({
    active_opportunities: active,
    early_opportunities: earlyN,
    planned_demand_items: num(plan[0]?.n),
    pca_items: num(pca[0]?.n),
    pgc_items: num(pgc[0]?.n),
    recurrence_signals: num(rec[0]?.n),
    active_arps: num(arp[0]?.n),
    alerts_triggered: num(alerts[0]?.n),
    organizations_profiled: num(orgs[0]?.n),
    catalog_items_profiled: num(items[0]?.n),
    early_opportunity_rate: active === 0 ? 0 : earlyN / active,
    median_early_lead: percentile(lead.map((row) => num(row.hours)), 50),
    planning_conversion_rate: conversion.conversion_rate,
    jobs_run: num(jobs[0]?.n),
    golden_cases: num(golden[0]?.n),
    attention_score_version: ATTENTION_SCORE_VERSION,
    recurrence_model_version: RECURRENCE_MODEL_VERSION,
    commercial_adapter_verdict: "NO-GO",
    milestone_verdict: go ? "GO" : "NO-GO",
  });
}

export { schemaFingerprint, NOW };
