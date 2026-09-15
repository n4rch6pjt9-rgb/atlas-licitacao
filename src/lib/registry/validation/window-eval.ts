import { classifyLocalOnly, DEFAULT_COVERAGE_CONFIG, percentile } from "../coverage.ts";

export type LateMatchRow = {
  id: string;
  data_origin: string;
  first_seen_local: string;
  first_seen_pncp: string | null;
  matched: boolean;
};

export type WindowEvalReport = {
  metric_name: "TIME_TO_NATIONAL_MATCH";
  origin_scope: string;
  n: number;
  n_matched: number;
  n_unmatched: number;
  n_still_in_window: number;
  cohort_matured: boolean;
  pct_24h: number | null;
  pct_72h: number | null;
  pct_7d: number | null;
  pct_14d: number | null;
  pct_30d: number | null;
  median_hours: number | null;
  p75_hours: number | null;
  p95_hours: number | null;
  delays_hours: number[];
  recommendation: {
    keep_days: number;
    change: false;
    reason: string;
    reevaluate_after: string;
  };
  display_alias: {
    stored_state: "LOCAL_ONLY_CONFIRMED";
    ux_kind: "MATURED_NO_MATCH";
    label: string;
  };
};

function delayHours(local: string, pncp: string): number {
  return (new Date(pncp).getTime() - new Date(local).getTime()) / 3_600_000;
}

function share(delays: number[], maxHours: number): number | null {
  if (delays.length === 0) return null;
  return delays.filter((h) => h <= maxHours).length / delays.length;
}

export function evaluateMatchWindow(args: {
  rows: LateMatchRow[];
  now: string;
  origin_scope: string;
  config?: { local_only_confirmed_hours: number };
}): WindowEvalReport {
  const config = { ...DEFAULT_COVERAGE_CONFIG, ...(args.config ?? {}) };
  const delays: number[] = [];
  let unmatched = 0;
  let stillInWindow = 0;
  for (const row of args.rows) {
    if (row.matched && row.first_seen_pncp) {
      delays.push(delayHours(row.first_seen_local, row.first_seen_pncp));
      continue;
    }
    unmatched += 1;
    const state = classifyLocalOnly({
      matched: false,
      firstSeenAt: row.first_seen_local,
      now: args.now,
      config,
    });
    if (state !== "LOCAL_ONLY_CONFIRMED") stillInWindow += 1;
  }
  const matured = stillInWindow === 0 && args.rows.length > 0;
  const recKeep = 7;
  const reason = matured
    ? delays.length === 0
      ? "Coorte madura, mas sem matches nacionais observados. Manter 7 dias — não tratar ausência como irregularidade. Não alterar automaticamente."
      : `Coorte madura. Mediana ${percentile(delays, 50) ?? "—"} h até match nacional. Manter política de 7 dias até haver n live suficiente. Não alterar automaticamente.`
    : "A coorte PCP 08–14/09/2026 ainda está dentro da janela operacional em 14/09/2026. Nenhum registro dessa semana completou 7 dias. Reavaliar depois de 21/09/2026. Não encurtar a janela.";
  return {
    metric_name: "TIME_TO_NATIONAL_MATCH",
    origin_scope: args.origin_scope,
    n: args.rows.length,
    n_matched: delays.length,
    n_unmatched: unmatched,
    n_still_in_window: stillInWindow,
    cohort_matured: matured,
    pct_24h: share(delays, 24),
    pct_72h: share(delays, 72),
    pct_7d: share(delays, 168),
    pct_14d: share(delays, 336),
    pct_30d: share(delays, 720),
    median_hours: percentile(delays, 50),
    p75_hours: percentile(delays, 75),
    p95_hours: percentile(delays, 95),
    delays_hours: delays,
    recommendation: {
      keep_days: recKeep,
      change: false,
      reason,
      reevaluate_after: "2026-09-21",
    },
    display_alias: {
      stored_state: "LOCAL_ONLY_CONFIRMED",
      ux_kind: "MATURED_NO_MATCH",
      label: "Sem match nacional após a janela — não é ausência definitiva",
    },
  };
}

export function displayLocalOnlyKind(state: string | null | undefined): string {
  if (state === "LOCAL_ONLY_CONFIRMED") return "MATURED_NO_MATCH";
  return state ?? "";
}
