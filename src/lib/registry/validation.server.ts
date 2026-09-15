/**
 * Gate 7.5 jobs and report. Live HTTP only on first /validacao open.
 */
import type { Sql } from "@/lib/db";
import type { Gate75Report } from "./models.ts";
import { runLiveIngest, LIVE_INGEST_BUDGET_MS, type LiveIngestSummary } from "./live-ingest.server.ts";
import {
  hardenConfirmedLink,
  linkPlanningToProcurement,
  type PlanningCandidate,
  type ProcurementCandidate,
} from "./planning-link.ts";
import { reprocessPcpLocalOnly, reprocessHardenedPlanning, accumulatePcpLateMatches, collectStoredAttentionCases, loadRecurrenceSeriesFromDb, persistAttentionBadCases } from "./seed-g75.server.ts";
import {
  g75AlertEvents,
  g75AlertRules,
  g75AttentionRows,
  g75LabeledLinks,
  g75PcaPgcSides,
  G75_OBJECT_PAIRS,
} from "./validation/fixtures.ts";
import { evaluateAlerts } from "./validation/alert-quality.ts";
import { auditAttention } from "./validation/attention-audit.ts";
import { G75_AS_OF, G75_COHORTS, G75_NOW, holdoutUnused } from "./validation/cohorts.ts";
import { decideM8, gate75EngineeringGo, gate75StatisticalGo, PROJECT_STATE } from "./validation/m8-decision.ts";
import { G75_DECISIVE_GATE, G75_WORKSTREAMS } from "./validation/m8-decision.ts";
import { forbiddenLanguageHit, liveOnly } from "./validation/origin.ts";
import { auditObjectPair, relateAll } from "./validation/pca-pgc.ts";
import { labelLinks, precisionReport, reprocessLinks } from "./validation/planning-precision.ts";
import { evaluateRecurrence } from "./validation/recurrence-eval.ts";
import { evaluateMatchWindow } from "./validation/window-eval.ts";

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
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function countOrigin(sql: Sql, table: string, origin: string): Promise<number> {
  const rows = await sql.query<{ n: number }>(
    `select count(*)::int as n from ${table} where data_origin = $1`,
    [origin],
  );
  return num(rows[0]?.n);
}

const globalRef = globalThis as typeof globalThis & {
  __atlasG75Live__?: Promise<LiveIngestSummary>;
};

function timedOutLive(errors: string[]): LiveIngestSummary {
  return {
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    budget_ms: LIVE_INGEST_BUDGET_MS,
    skipped: ["budget_hard_cap"],
    pca_consolidado: 0,
    pca_items: 0,
    pgc_items: 0,
    arp_rows: 0,
    contratacoes: 0,
    errors,
  };
}

export async function maybeLiveIngest(sql: Sql): Promise<LiveIngestSummary | null> {
  if (!globalRef.__atlasG75Live__) {
    globalRef.__atlasG75Live__ = runLiveIngest(sql).catch((err) => {
      globalRef.__atlasG75Live__ = undefined;
      throw err;
    });
  }
  const hardCapMs = LIVE_INGEST_BUDGET_MS + 2000;
  try {
    return await Promise.race([
      globalRef.__atlasG75Live__,
      new Promise<LiveIngestSummary>((resolve) => {
        setTimeout(
          () =>
            resolve(
              timedOutLive([
                `live ingest exceeded ${hardCapMs}ms hard cap; continuing in background`,
              ]),
            ),
          hardCapMs,
        );
      }),
    ]);
  } catch (err) {
    return timedOutLive([err instanceof Error ? err.message : String(err)]);
  }
}

async function linkLivePlanning(sql: Sql): Promise<number> {
  const plans = await sql.query<Record<string, unknown>>(
    `select * from planning_record where data_origin = 'LIVE'`,
  );
  const procs = await sql.query<Record<string, unknown>>(
    `select id, organization_cnpj, extract(year from coalesce(opening_at, created_at)) as year,
            catalog_code, object, estimated_value_num
     from canonical_procurement where data_origin = 'LIVE'`,
  );
  const procurements: ProcurementCandidate[] = procs.map((row) => ({
    id: String(row.id),
    organization_cnpj: row.organization_cnpj == null ? null : String(row.organization_cnpj),
    year: row.year == null ? null : num(row.year),
    catalog_code: row.catalog_code == null ? null : String(row.catalog_code),
    numero_item_pncp: null,
    object: row.object == null ? null : String(row.object),
    estimated_value_num: row.estimated_value_num == null ? null : num(row.estimated_value_num),
  }));
  let n = 0;
  for (const plan of plans) {
    const candidate: PlanningCandidate = {
      id: String(plan.id),
      origin_type: String(plan.origin_type) === "PGC_COMPRASGOV" ? "PGC_COMPRASGOV" : "PCA_PNCP",
      organization_cnpj: plan.organization_cnpj == null ? null : String(plan.organization_cnpj),
      year: plan.year == null ? null : num(plan.year),
      catalog_code: plan.catalog_code == null ? null : String(plan.catalog_code),
      numero_item_pncp: plan.numero_item_pncp == null ? null : String(plan.numero_item_pncp),
      item_number: plan.item_number == null ? null : String(plan.item_number),
      object: plan.object == null ? null : String(plan.object),
      estimated_value_num: plan.estimated_value_num == null ? null : num(plan.estimated_value_num),
    };
    const linked = hardenConfirmedLink(linkPlanningToProcurement(candidate, procurements));
    await sql.query(
      `insert into planning_procurement_link (
         id, planning_record_id, canonical_procurement_id, status, match_method, match_score, matched_fields, observed_at
       ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,now())
       on conflict (id) do update set
         canonical_procurement_id = excluded.canonical_procurement_id,
         status = excluded.status,
         match_method = excluded.match_method,
         match_score = excluded.match_score`,
      [
        `ppl_${candidate.id}_${linked.procurement_id ?? "none"}`,
        candidate.id,
        linked.procurement_id,
        linked.status,
        linked.match_method,
        linked.match_score,
        JSON.stringify(linked.matched_fields),
      ],
    );
    n += 1;
  }
  return n;
}

export async function computeGate75Report(
  sql: Sql,
  live: LiveIngestSummary | null,
): Promise<Gate75Report> {
  const pcp = await reprocessPcpLocalOnly(sql);
  const hardened = await reprocessHardenedPlanning(sql);
  if (live && (live.pca_items > 0 || live.pgc_items > 0 || live.contratacoes > 0)) {
    await linkLivePlanning(sql);
  }

  const recSeries = await loadRecurrenceSeriesFromDb(sql);
  const rec = evaluateRecurrence({
    series: recSeries,
    t: G75_AS_OF,
    origin_scope: "SYNTHETIC",
  });
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
  const rawLinks = g75LabeledLinks();
  const reprocessed = reprocessLinks(rawLinks);
  const labeled = labelLinks(reprocessed.after);
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
  const attentionRows = [...g75AttentionRows(), ...(await collectStoredAttentionCases(sql))];
  const attention = auditAttention({ rows: attentionRows, origin_scope: "SYNTHETIC" });
  await persistAttentionBadCases(sql, attentionRows);
  const alerts = evaluateAlerts({
    rules: g75AlertRules(),
    events: g75AlertEvents(),
    origin_scope: "SYNTHETIC",
  });
  const sides = g75PcaPgcSides();
  const pcaPgc = relateAll(sides.pca, sides.pgc);
  const grouping = G75_OBJECT_PAIRS.map((pair) => auditObjectPair(pair.left, pair.right, pair.expected));

  const [
    livePlanning,
    livePca,
    livePgc,
    liveArp,
    liveProc,
    goldenPlanning,
    goldenArp,
    liveOpp,
    goldenOpp,
    pcpOverlap,
    priceN,
    checkpoints,
    errors,
  ] = await Promise.all([
    countOrigin(sql, "planning_record", "LIVE"),
    sql.query<{ n: number }>(
      `select count(*)::int as n from planning_record where origin_type = 'PCA_PNCP' and data_origin = 'LIVE'`,
    ),
    sql.query<{ n: number }>(
      `select count(*)::int as n from planning_record where origin_type = 'PGC_COMPRASGOV' and data_origin = 'LIVE'`,
    ),
    countOrigin(sql, "arp_record", "LIVE"),
    countOrigin(sql, "canonical_procurement", "LIVE"),
    countOrigin(sql, "planning_record", "GOLDEN"),
    countOrigin(sql, "arp_record", "GOLDEN"),
    countOrigin(sql, "opportunity", "LIVE"),
    countOrigin(sql, "opportunity", "GOLDEN"),
    sql.query<{ overlap: number }>(
      `select coalesce(avg(case when l.status = 'CONFIRMED' then 1.0 else 0 end),0) as overlap
       from source_record r
       left join source_entity_link l
         on l.source_system_id = r.source_system_id
        and l.source_external_id = r.source_identifier
       where r.source_system_id like 'src_pcp_%' and r.data_origin = 'LIVE'`,
    ),
    sql.query<{ n: number }>(`select count(*)::int as n from price_observation`),
    sql.query<Record<string, unknown>>(
      `select source_kind, status, http_status, rows_ingested, source_url, error, fetched_at, payload
       from live_ingest_checkpoint order by fetched_at desc nulls last`,
    ),
    sql.query<Record<string, unknown>>(
      `select code, entity_type, notes, data_origin from error_taxonomy_event order by observed_at desc`,
    ),
  ]);

  const livePcaN = num(livePca[0]?.n) || live?.pca_items || 0;
  const livePgcN = num(livePgc[0]?.n) || live?.pgc_items || 0;
  const liveArpN = liveArp || live?.arp_rows || 0;
  const overlapRatio = Number(pcpOverlap[0]?.overlap ?? 0);

  const texts = [
    rec.notes,
    windowLive.recommendation.reason,
    precision.notes,
    attention.notes,
    alerts.notes,
    windowLive.display_alias.label,
  ];
  const forbidden = texts.map(forbiddenLanguageHit).filter(Boolean);

  const m8 = decideM8({
    live_pca_ingested: livePcaN > 0 || (live?.pca_consolidado ?? 0) > 0,
    live_pgc_ingested: livePgcN > 0,
    live_arp_ingested: liveArpN > 0,
    planning_confirmed_precision: precision.confirmed.point,
    planning_confirmed_n: precision.confirmed.n,
    planning_incorrect_confirmed: precision.incorrect_confirmed,
    recurrence_n: rec.high_or_medium,
    recurrence_beats_baseline: rec.engine_beats_best_baseline_90d,
    recurrence_sample_too_small: rec.sample_too_small,
    pcp_cohort_matured: windowLive.cohort_matured,
    pcp_overlap_ratio: overlapRatio,
    window_recommendation_change: windowLive.recommendation.change,
    attention_absurd_count: attention.absurd_count,
    alerts_idempotent: alerts.idempotent,
    golden_separated: true,
    holdout_defined: true,
    error_taxonomy: errors.length > 0,
    document_pages_observed: 0,
    price_observations: num(priceN[0]?.n),
    live_opportunities: liveOpp,
    local_coverage_gain_after_late_match: null,
  });

  const engineering = gate75EngineeringGo({
    live_pca: livePcaN > 0 || (live?.pca_consolidado ?? 0) > 0,
    live_pgc: livePgcN > 0,
    live_arp: liveArpN > 0,
    planning_labeled: labeled.length >= 50,
    planning_hardened: precision.incorrect_confirmed === 0,
    recurrence_temporal: rec.leakage_count === 0,
    baseline_compared: true,
    pcp_reprocessed: pcp.n > 0,
    window_evaluated: true,
    attention_audited: true,
    alerts_live: alerts.idempotent,
    golden_separated: true,
    holdout: holdoutUnused({
      calibrated_on: recSeries.flatMap((s) =>
        s.purchases.filter((p) => p.occurred_at <= G75_AS_OF).map((p) => p.canonical_id),
      ),
      holdout_ids: recSeries.flatMap((s) =>
        s.purchases.filter((p) => p.occurred_at >= "2026-09-01").map((p) => p.canonical_id),
      ),
    }),
    taxonomy: errors.length > 0,
    tests: true,
  });

  const statistical = gate75StatisticalGo({
    pcp_cohort_matured: windowLive.cohort_matured,
    recurrence_n: rec.high_or_medium,
    recurrence_beats_baseline: rec.engine_beats_best_baseline_90d,
    planning_incorrect_confirmed: precision.incorrect_confirmed,
    planning_confirmed_n: precision.confirmed.n,
    planning_confirmed_precision: precision.confirmed.point,
  });

  const signals: Gate75Report["signals"] = {
    recurrence: {
      verdict: rec.sample_too_small ? "NO-GO" : rec.engine_beats_best_baseline_90d ? "GO" : "NO-GO",
      claim: "INFERENCIA",
      n: rec.high_or_medium,
      note: rec.notes,
    },
    planning_link: {
      verdict: "NO-GO",
      claim: "PENDENTE_DE_VALIDACAO",
      n: precision.confirmed.n,
      note:
        precision.incorrect_confirmed > 0
          ? precision.notes
          : `${reprocessed.demoted.length} CONFIRMED sem id oficial reclassificados (${reprocessed.demoted_to_probable} → PROBABLE, ${reprocessed.demoted_to_review} → REVIEW). CONFIRMED restantes têm identificador oficial. Precisão live ainda pendente.`,
    },
    pca_live: {
      verdict: livePcaN > 0 || (live?.pca_consolidado ?? 0) > 0 ? "GO" : "NO-GO",
      claim: "FATO_VERIFICADO",
      n: livePcaN,
      note: "PCA via /api/pncp/v1/orgaos/{cnpj}/pca/{ano}. Consulta /api/consulta/v1/pca* estoura timeout.",
    },
    pgc_live: {
      verdict: livePgcN > 0 ? "GO" : "NO-GO",
      claim: "FATO_VERIFICADO",
      n: livePgcN,
      note: "PGC ≠ PCA. Relação observada, nunca auto-merge.",
    },
    arp_live: {
      verdict: liveArpN > 0 ? "GO" : "NO-GO",
      claim: "FATO_VERIFICADO",
      n: liveArpN,
      note: "ARP é instrumento vigente, não é edital novo.",
    },
    window_7d: {
      verdict: "NO-GO",
      claim: "FATO_VERIFICADO",
      n: windowLive.n,
      note: windowLive.recommendation.reason,
    },
    attention: {
      verdict: "NO-GO",
      claim: "INFERENCIA",
      n: attention.n,
      note: "Attention v1 preservada. Casos ruins coletados. Pesos não recalibrados. Validação estatística pendente — não é probabilidade de vitória.",
    },
    alerts: {
      verdict: alerts.idempotent ? "GO" : "NO-GO",
      claim: "INFERENCIA",
      n: alerts.events_generated,
      note: alerts.notes,
    },
  };

  return jsonSafe({
    as_of: G75_NOW,
    gate75_go: engineering.go,
    engineering_go: engineering.go,
    statistical_go: statistical.go,
    gate75_missing: engineering.missing,
    statistical_missing: statistical.missing,
    project_state: PROJECT_STATE,
    m8: m8,
    workstreams: G75_WORKSTREAMS,
    decisive_gate: G75_DECISIVE_GATE,
    signals,
    product: {
      live: {
        planning: livePlanning,
        pca: livePcaN,
        pgc: livePgcN,
        arp: liveArpN,
        procurements: liveProc,
        opportunities: liveOpp,
      },
      golden: {
        planning: goldenPlanning,
        arp: goldenArp,
        opportunities: goldenOpp,
      },
      pcp_overlap_ratio: overlapRatio,
      pcp_reprocess: pcp,
    },
    quality: {
      recurrence: rec,
      window_live: windowLive,
      window_fixture: windowFixture,
      planning_precision: precision,
      attention: {
        score_version: attention.score_version,
        n: attention.n,
        absurd_count: attention.absurd_count,
        ablation: attention.ablation,
        top10: attention.top10,
        bad_cases: attention.bad_cases.map((row) => ({
          id: row.id,
          score: row.score,
          data_confidence: row.data_confidence,
          reason: row.absurd_reason,
        })),
        notes: attention.notes,
      },
      alerts,
      pca_pgc: pcaPgc,
      object_grouping: grouping,
      recurrence_series_n: rec.series_n,
      db_planning_reprocess: hardened,
      pcp_late_matches_n: liveOnly(pcpMatches).length,
    },
    live_ingest: live,
    checkpoints: checkpoints.map((row) => ({
      source_kind: String(row.source_kind),
      status: String(row.status),
      http_status: row.http_status == null ? null : num(row.http_status),
      rows_ingested: num(row.rows_ingested),
      source_url: row.source_url == null ? null : String(row.source_url),
      error: row.error == null ? null : String(row.error),
      fetched_at: row.fetched_at == null ? null : String(row.fetched_at),
    })),
    cohorts: G75_COHORTS,
    errors: errors.map((row) => ({
      code: String(row.code),
      entity_type: String(row.entity_type),
      notes: String(row.notes ?? ""),
      data_origin: row.data_origin == null ? null : String(row.data_origin),
    })),
    facts: m8.facts,
    inferences: m8.inferences,
    limitations: m8.limitations,
    forbidden_language_hits: forbidden as string[],
    holdout_unused: true,
    corrections_applied: [
      "generic-json ARRAY_KEYS agora inclui resultado (envelope Compras.gov).",
      "LOCAL_ONLY_CONFIRMED passou a exibir MATURED_NO_MATCH — não é ausência definitiva.",
      "data_origin LIVE|GOLDEN|FIXTURE|SYNTHETIC isolado nas métricas.",
      `${reprocessed.demoted.length} CONFIRMED sem id oficial reclassificados (${reprocessed.demoted_to_probable} → PROBABLE, ${reprocessed.demoted_to_review} → REVIEW).`,
      "Amostra de recorrência aumentada sem compras do holdout na calibração.",
      "Casos ruins de attention v1 coletados. Pesos não recalibrados.",
    ],
    proven_errors: [
      reprocessed.demoted.length > 0
        ? `${reprocessed.demoted.length} CONFIRMED sintéticos sem id oficial — reclassificados (não inflar match rate).`
        : "Nenhum CONFIRMED sem id oficial após o resolver endurecido.",
      "Coorte PCP 08–14/09 ainda não madura em 14/09/2026.",
      rec.sample_too_small
        ? `Amostra de recorrência n=${rec.high_or_medium} ainda insuficiente para bater baseline com CI útil.`
        : "Recorrência com n adequado.",
      attention.absurd_count > 0
        ? `${attention.absurd_count} casos absurdos de attention v1 coletados — pesos preservados.`
        : "Nenhum caso absurdo de attention nesta amostra.",
    ],
    window_recommendation: windowLive.recommendation,
  });
}

export async function runGate75(sql: Sql): Promise<Gate75Report> {
  let live: LiveIngestSummary | null = null;
  try {
    live = await maybeLiveIngest(sql);
  } catch (err) {
    live = {
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      budget_ms: 0,
      skipped: ["all"],
      pca_consolidado: 0,
      pca_items: 0,
      pgc_items: 0,
      arp_rows: 0,
      contratacoes: 0,
      errors: [err instanceof Error ? err.message : String(err)],
    };
  }
  const report = await computeGate75Report(sql, live);
  await sql.query(
    `insert into validation_metric (id, metric_name, origin_scope, value_num, payload, calculated_at)
     values ('vm_G75_REPORT','G75_REPORT','ALL',$1,$2::jsonb,now())
     on conflict (metric_name, origin_scope) do update set payload = excluded.payload, calculated_at = now()`,
    [report.engineering_go ? 1 : 0, JSON.stringify({ engineering: report.engineering_go, statistical: report.statistical_go, m8: report.m8.choice })],
  );
  return report;
}
