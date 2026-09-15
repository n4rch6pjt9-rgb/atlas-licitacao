/**
 * Gate 7.5 seed: origin tags, cohorts, labeled samples, fixture metrics.
 * Does not call live HTTP. Live ingest runs on first /validacao open.
 */
import type { Sql } from "@/lib/db";
import { classifyLocalOnly } from "./coverage.ts";
import { G75_AS_OF, G75_COHORTS, G75_NOW } from "./validation/cohorts.ts";
import {
  G75_OBJECT_PAIRS,
  g75AlertEvents,
  g75AlertRules,
  g75AttentionRows,
  g75LabeledLinks,
  g75LateMatches,
  g75PcaPgcSides,
  g75RecurrenceSeries,
  lateMatchesFromSourceRecords,
  mergeRecurrenceSeries,
  seriesFromProcurements,
} from "./validation/fixtures.ts";
import { evaluateAlerts } from "./validation/alert-quality.ts";
import { auditAttention, rankedFromStored, type RankedOpportunity } from "./validation/attention-audit.ts";
import { decideM8, PROJECT_STATE } from "./validation/m8-decision.ts";
import { liveOnly } from "./validation/origin.ts";
import { auditObjectPair, relateAll } from "./validation/pca-pgc.ts";
import { hardenConfirmedLink } from "./planning-link.ts";
import { labelLinks, precisionReport, reprocessLinks } from "./validation/planning-precision.ts";
import { evaluateRecurrence } from "./validation/recurrence-eval.ts";
import { errorEvent } from "./validation/taxonomy.ts";
import { evaluateMatchWindow, type LateMatchRow } from "./validation/window-eval.ts";

async function persistMetric(
  sql: Sql,
  name: string,
  origin: string,
  value: number | null,
  payload: unknown,
): Promise<void> {
  await sql.query(
    `insert into validation_metric (id, metric_name, origin_scope, value_num, payload, calculated_at)
     values ($1,$2,$3,$4,$5::jsonb,now())
     on conflict (metric_name, origin_scope) do update set
       value_num = excluded.value_num,
       payload = excluded.payload,
       calculated_at = now()`,
    [`vm_${name}_${origin}`, name, origin, value, JSON.stringify(payload)],
  );
}

async function persistError(
  sql: Sql,
  ev: ReturnType<typeof errorEvent>,
): Promise<void> {
  await sql.query(
    `insert into error_taxonomy_event (id, code, entity_type, entity_id, notes, data_origin)
     values ($1,$2,$3,$4,$5,$6)
     on conflict (id) do update set notes = excluded.notes, observed_at = now()`,
    [ev.id, ev.code, ev.entity_type, ev.entity_id, ev.notes, ev.data_origin],
  );
}

export async function tagExistingOrigins(sql: Sql): Promise<number> {
  await sql.query(
    `update planning_record set data_origin = 'GOLDEN'
     where id in (select entity_id from golden_case where entity_type = 'planning_record')`,
  );
  await sql.query(
    `update arp_record set data_origin = 'GOLDEN'
     where id in (select entity_id from golden_case where entity_type = 'arp_record')`,
  );
  await sql.query(
    `update canonical_procurement set data_origin = 'GOLDEN'
     where id in (select entity_id from golden_case where entity_type = 'canonical_procurement')`,
  );
  await sql.query(
    `update opportunity set data_origin = 'GOLDEN'
     where id in (select entity_id from golden_case where entity_type = 'opportunity')`,
  );
  await sql.query(
    `update canonical_procurement set data_origin = 'SYNTHETIC'
     where id like 'can_m7_%' and data_origin = 'UNKNOWN'`,
  );
  await sql.query(
    `update opportunity o set data_origin = c.data_origin
     from canonical_procurement c
     where o.canonical_procurement_id = c.id
       and o.data_origin = 'UNKNOWN'
       and c.data_origin <> 'UNKNOWN'`,
  );
  await sql.query(
    `update recurrence_signal set data_origin = 'SYNTHETIC' where data_origin = 'UNKNOWN'`,
  );
  await sql.query(
    `update source_record set data_origin = 'LIVE'
     where source_system_id like 'src_pcp_%' and data_origin in ('UNKNOWN')`,
  );
  await sql.query(
    `update source_record set data_origin = 'FIXTURE'
     where (source_system_id like 'src_bll%' or ingestion_mode in ('RECORDED_FIXTURE','MANUAL_FIXTURE'))
       and data_origin = 'UNKNOWN'`,
  );
  const tagged = await sql.query<{ n: number }>(
    `select count(*)::int as n from source_record where data_origin <> 'UNKNOWN'`,
  );
  return tagged[0]?.n ?? 0;
}

export async function reprocessPcpLocalOnly(sql: Sql, now = G75_NOW): Promise<{ n: number; confirmed: number; provisional: number; pending: number }> {
  const rows = await sql.query<{
    id: string;
    first_seen_at: string | null;
    local_only_state: string | null;
    match_status: string | null;
  }>(
    `select r.id, r.first_seen_at, r.local_only_state, l.status as match_status
     from source_record r
     left join source_entity_link l
       on l.source_system_id = r.source_system_id
      and l.source_external_id = r.source_identifier
     where r.source_system_id like 'src_pcp_%'`,
  );
  let confirmed = 0;
  let provisional = 0;
  let pending = 0;
  for (const row of rows) {
    if (!row.first_seen_at) continue;
    const matched = row.match_status === "CONFIRMED";
    const next = classifyLocalOnly({ matched, firstSeenAt: row.first_seen_at, now });
    if (next === "LOCAL_ONLY_CONFIRMED") confirmed += 1;
    else if (next === "LOCAL_ONLY_PROVISIONAL") provisional += 1;
    else if (next === "PENDING_PNCP_MATCH") pending += 1;
    if (next !== row.local_only_state) {
      await sql.query(`update source_record set local_only_state = $2 where id = $1`, [row.id, next]);
    }
  }
  return { n: rows.length, confirmed, provisional, pending };
}

export async function accumulatePcpLateMatches(sql: Sql): Promise<LateMatchRow[]> {
  const rows = await sql.query<{
    id: string;
    first_seen_at: string | null;
    pncp_first_seen_at: string | null;
    match_status: string | null;
    data_origin: string | null;
  }>(
    `select r.id, r.first_seen_at, l.pncp_first_seen_at, l.status as match_status, r.data_origin
     from source_record r
     left join source_entity_link l
       on l.source_system_id = r.source_system_id
      and l.source_external_id = r.source_identifier
     where r.source_system_id like 'src_pcp_%'`,
  );
  const fromDb = lateMatchesFromSourceRecords(rows);
  const byId = new Map(g75LateMatches().map((row) => [row.id, row]));
  for (const row of fromDb) byId.set(row.id, row);
  return [...byId.values()];
}

export async function loadRecurrenceSeriesFromDb(sql: Sql) {
  const rows = await sql.query<{
    id: string;
    organization_id: string | null;
    object: string | null;
    occurred_at: string | null;
    estimated_value_num: number | null;
    data_origin: string | null;
    catalog_code: string | null;
  }>(
    `select id, organization_id, object,
            coalesce(opening_at, publication_at, created_at)::text as occurred_at,
            estimated_value_num, data_origin, catalog_code
     from canonical_procurement
     where organization_id is not null`,
  );
  const extra = seriesFromProcurements(rows, G75_AS_OF);
  return mergeRecurrenceSeries(g75RecurrenceSeries(), extra);
}

function parseFields(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function reprocessHardenedPlanning(sql: Sql): Promise<{
  demoted: number;
  demoted_to_probable: number;
  demoted_to_review: number;
  unofficial_remaining: number;
}> {
  const links = await sql.query<{
    id: string;
    planning_record_id: string;
    canonical_procurement_id: string | null;
    status: string;
    match_method: string | null;
    match_score: number | null;
    matched_fields: unknown;
  }>(
    `select id, planning_record_id, canonical_procurement_id, status, match_method, match_score, matched_fields
     from planning_procurement_link`,
  );
  let demoted = 0;
  let demoted_to_probable = 0;
  let demoted_to_review = 0;
  let unofficial_remaining = 0;
  for (const row of links) {
    const fields = parseFields(row.matched_fields);
    const hardened = hardenConfirmedLink({
      planning_id: row.planning_record_id,
      procurement_id: row.canonical_procurement_id,
      status: row.status as "CONFIRMED" | "PROBABLE" | "REVIEW_REQUIRED" | "UNMATCHED",
      match_method: row.match_method ?? "none",
      match_score: row.match_score ?? 0,
      matched_fields: fields,
    });
    if (hardened.status !== row.status || hardened.match_method !== row.match_method) {
      demoted += 1;
      if (row.status === "CONFIRMED" && hardened.status === "PROBABLE") demoted_to_probable += 1;
      if (row.status === "CONFIRMED" && hardened.status === "REVIEW_REQUIRED") demoted_to_review += 1;
      await sql.query(
        `update planning_procurement_link
         set status = $2, match_method = $3, match_score = $4, matched_fields = $5::jsonb, observed_at = now()
         where id = $1`,
        [row.id, hardened.status, hardened.match_method, hardened.match_score, JSON.stringify(hardened.matched_fields)],
      );
    }
    if (
      hardened.status === "CONFIRMED" &&
      hardened.match_method !== "official_item_id" &&
      hardened.match_method !== "cnpj_year_catalog"
    ) {
      unofficial_remaining += 1;
    }
  }

  const raw = g75LabeledLinks();
  const reprocessed = reprocessLinks(raw);
  const labeled = labelLinks(reprocessed.after);
  for (const row of labeled) {
    await sql.query(
      `insert into labeled_link_sample (
         id, planning_link_id, planning_record_id, canonical_procurement_id,
         link_status, label, protocol, data_origin, notes
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do update set
         link_status = excluded.link_status,
         label = excluded.label,
         protocol = excluded.protocol,
         notes = excluded.notes`,
      [
        row.id,
        row.id,
        row.planning_id,
        row.procurement_id,
        row.status,
        row.label,
        row.protocol,
        row.data_origin,
        row.notes,
      ],
    );
  }
  return {
    demoted: demoted + reprocessed.demoted.length,
    demoted_to_probable: demoted_to_probable + reprocessed.demoted_to_probable,
    demoted_to_review: demoted_to_review + reprocessed.demoted_to_review,
    unofficial_remaining,
  };
}

export async function collectStoredAttentionCases(sql: Sql): Promise<RankedOpportunity[]> {
  const stored = await sql.query<{
    id: string;
    object: string | null;
    organization_name: string | null;
    data_origin: string | null;
    data_confidence: number | null;
    components_json: unknown;
  }>(
    `select o.id, o.object, o.organization_name, o.data_origin, s.data_confidence, s.components_json
     from opportunity o
     join opportunity_attention_score s on s.opportunity_id = o.id
     where s.score_version = 'v1'`,
  );
  const out: RankedOpportunity[] = [];
  for (const row of stored) {
    const components =
      row.components_json && typeof row.components_json === "object" && !Array.isArray(row.components_json)
        ? (row.components_json as Record<string, unknown>)
        : typeof row.components_json === "string"
          ? (() => {
              try {
                return JSON.parse(row.components_json) as Record<string, unknown>;
              } catch {
                return null;
              }
            })()
          : null;
    const ranked = rankedFromStored({
      id: row.id,
      object: row.object,
      organization_name: row.organization_name,
      data_origin: row.data_origin ?? "UNKNOWN",
      data_confidence: Number(row.data_confidence ?? 0),
      components,
    });
    if (ranked) out.push(ranked);
  }
  return out;
}

export async function persistAttentionBadCases(sql: Sql, rows: RankedOpportunity[]): Promise<number> {
  const audit = auditAttention({ rows, origin_scope: "ALL" });
  for (const bad of audit.bad_cases) {
    await persistError(
      sql,
      errorEvent({
        code: "ATTENTION_ABSURD",
        entity_type: "opportunity",
        entity_id: bad.id,
        notes: `${bad.absurd_reason ?? "score absurdo"} · score=${bad.score} · conf=${bad.data_confidence}. Pesos v1 preservados.`,
        data_origin: "SYNTHETIC",
      }),
    );
  }
  await persistMetric(sql, "ATTENTION_BAD_CASES", "ALL", audit.absurd_count, {
    score_version: audit.score_version,
    n: audit.n,
    absurd_count: audit.absurd_count,
    cases: audit.bad_cases.map((row) => ({
      id: row.id,
      score: row.score,
      data_confidence: row.data_confidence,
      reason: row.absurd_reason,
    })),
    notes: audit.notes,
  });
  return audit.absurd_count;
}

export async function seedGate75(sql: Sql): Promise<void> {
  const existing = await sql.query<{ n: number }>(
    `select count(*)::int as n from evaluation_cohort where id = 'g75_calibration'`,
  );
  if ((existing[0]?.n ?? 0) > 0) {
    await tagExistingOrigins(sql);
    await reprocessHardenedPlanning(sql);
    const attentionRows = [...g75AttentionRows(), ...(await collectStoredAttentionCases(sql))];
    await persistAttentionBadCases(sql, attentionRows);
    return;
  }

  await tagExistingOrigins(sql);

  for (const cohort of G75_COHORTS) {
    await sql.query(
      `insert into evaluation_cohort (id, kind, window_start, window_end, notes)
       values ($1,$2,$3,$4,$5) on conflict (id) do nothing`,
      [cohort.id, cohort.kind, cohort.window_start, cohort.window_end, cohort.notes],
    );
  }

  const reprocessed = reprocessLinks(g75LabeledLinks());
  const labeled = labelLinks(reprocessed.after);
  for (const row of labeled) {
    await sql.query(
      `insert into labeled_link_sample (
         id, planning_link_id, planning_record_id, canonical_procurement_id,
         link_status, label, protocol, data_origin, notes
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do nothing`,
      [
        row.id,
        row.id,
        row.planning_id,
        row.procurement_id,
        row.status,
        row.label,
        row.protocol,
        row.data_origin,
        row.notes,
      ],
    );
  }

  const recSeries = await loadRecurrenceSeriesFromDb(sql);
  const rec = evaluateRecurrence({
    series: recSeries,
    t: G75_AS_OF,
    origin_scope: "SYNTHETIC",
  });
  await persistMetric(sql, rec.metric_name, "SYNTHETIC", rec.windows[90].engine.point, rec);

  const pcpMatches = await accumulatePcpLateMatches(sql);
  const windowLive = evaluateMatchWindow({
    rows: liveOnly(pcpMatches),
    now: G75_NOW,
    origin_scope: "LIVE",
  });
  const windowFixture = evaluateMatchWindow({
    rows: pcpMatches.filter((row) => row.data_origin === "FIXTURE"),
    now: G75_NOW,
    origin_scope: "FIXTURE",
  });
  await persistMetric(sql, windowLive.metric_name, "LIVE", windowLive.median_hours, windowLive);
  await persistMetric(sql, windowFixture.metric_name, "FIXTURE", windowFixture.median_hours, windowFixture);

  const precision = precisionReport({
    labeled,
    planned: labeled.length,
    converted: labeled.filter((row) => row.status === "CONFIRMED" || row.status === "PROBABLE").length,
    plan_to_procurement_days: [40, 70, 95, 120],
    origin_scope: "SYNTHETIC",
    reclassified_from_confirmed: reprocessed.demoted.length,
    demoted_to_probable: reprocessed.demoted_to_probable,
    demoted_to_review: reprocessed.demoted_to_review,
  });
  await persistMetric(sql, "PLANNING_LINK_PRECISION", "SYNTHETIC", precision.confirmed.point, precision);

  const attentionRows = [...g75AttentionRows(), ...(await collectStoredAttentionCases(sql))];
  const attention = auditAttention({ rows: attentionRows, origin_scope: "SYNTHETIC" });
  await persistMetric(sql, "ATTENTION_AUDIT", "SYNTHETIC", attention.absurd_count, {
    n: attention.n,
    absurd_count: attention.absurd_count,
    ablation: attention.ablation,
    notes: attention.notes,
    score_version: attention.score_version,
  });
  await persistAttentionBadCases(sql, attentionRows);

  const alerts = evaluateAlerts({
    rules: g75AlertRules(),
    events: g75AlertEvents(),
    origin_scope: "SYNTHETIC",
  });
  await persistMetric(sql, "ALERT_QUALITY", "SYNTHETIC", alerts.events_generated, alerts);

  const sides = g75PcaPgcSides();
  const relations = relateAll(sides.pca, sides.pgc);
  for (const rel of relations) {
    await sql.query(
      `insert into pca_pgc_relation (
         id, pca_planning_id, pgc_planning_id, status, match_method, match_score, matched_fields
       ) values ($1,$2,$3,$4,$5,$6,$7::jsonb)
       on conflict (pca_planning_id, pgc_planning_id) do nothing`,
      [
        `rel_${rel.pca_planning_id}_${rel.pgc_planning_id}`.slice(0, 80),
        rel.pca_planning_id,
        rel.pgc_planning_id,
        rel.status,
        rel.match_method,
        rel.match_score,
        JSON.stringify(rel.matched_fields),
      ],
    );
  }

  for (const pair of G75_OBJECT_PAIRS) {
    const audit = auditObjectPair(pair.left, pair.right, pair.expected);
    if (audit.error) {
      await persistError(
        sql,
        errorEvent({
          code: audit.error,
          entity_type: "object_pair",
          notes: `${audit.left} × ${audit.right}`,
          data_origin: "SYNTHETIC",
        }),
      );
    }
  }

  const pcp = await reprocessPcpLocalOnly(sql);
  await persistMetric(sql, "PCP_WINDOW_REPROCESS", "LIVE", pcp.n, pcp);

  const events = [
    errorEvent({
      code: "INSUFFICIENT_SAMPLE",
      entity_type: "recurrence_signal",
      notes: `Recorrência n=${rec.high_or_medium} < 30. Amostra cresceu sem tocar o holdout. Não justifica complexidade extra.`,
      data_origin: "SYNTHETIC",
    }),
    errorEvent({
      code: "WINDOW_INSUFFICIENT",
      entity_type: "source_record",
      notes: "Coorte PCP 08–14/09/2026 ainda na janela de 7 dias em 14/09. Não alterar política.",
      data_origin: "LIVE",
    }),
    errorEvent({
      code: "INSUFFICIENT_EVIDENCE",
      entity_type: "planning_procurement_link",
      notes: `${reprocessed.demoted.length} CONFIRMED sem id oficial reclassificados (${reprocessed.demoted_to_probable} → PROBABLE, ${reprocessed.demoted_to_review} → REVIEW). Não inflar match rate.`,
      data_origin: "SYNTHETIC",
    }),
  ];
  for (const ev of events) await persistError(sql, ev);

  const m8 = decideM8({
    live_pca_ingested: false,
    live_pgc_ingested: false,
    live_arp_ingested: false,
    planning_confirmed_precision: precision.confirmed.point,
    planning_confirmed_n: precision.confirmed.n,
    planning_incorrect_confirmed: precision.incorrect_confirmed,
    recurrence_n: rec.high_or_medium,
    recurrence_beats_baseline: rec.engine_beats_best_baseline_90d,
    recurrence_sample_too_small: rec.sample_too_small,
    pcp_cohort_matured: windowLive.cohort_matured,
    pcp_overlap_ratio: 0,
    window_recommendation_change: windowLive.recommendation.change,
    attention_absurd_count: attention.absurd_count,
    alerts_idempotent: alerts.idempotent,
    golden_separated: true,
    holdout_defined: true,
    error_taxonomy: true,
    document_pages_observed: 0,
    price_observations: 6,
    live_opportunities: 0,
    local_coverage_gain_after_late_match: null,
  });
  await persistMetric(sql, "M8_DECISION", "ALL", m8.go_m8 ? 1 : 0, { ...m8, project_state: PROJECT_STATE });

  await sql.query(
    `insert into evaluation_run (id, run_kind, status, started_at, finished_at, rows_affected, origin_scope, payload)
     values ('erun_g75_seed','SEED','ok',now(),now(),$1,'ALL',$2::jsonb)
     on conflict (id) do nothing`,
    [
      labeled.length,
      JSON.stringify({
        recurrence_n: rec.series_n,
        labeled: labeled.length,
        reclassified: reprocessed.demoted.length,
        demoted_to_probable: reprocessed.demoted_to_probable,
        demoted_to_review: reprocessed.demoted_to_review,
      }),
    ],
  );
  await reprocessHardenedPlanning(sql);
}
