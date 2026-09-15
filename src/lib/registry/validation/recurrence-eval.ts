import { objectsGroupTogether, type NormalizedObject } from "../object-normalize.ts";
import { computeRecurrence, type RecurrencePurchase, type RecurrenceResult } from "../recurrence.ts";
import { afterT, assertNoTemporalLeakage, daysBetween, visibleAt } from "./cohorts.ts";
import { classifyRecurrenceFalsePositive, type FalsePositiveReason } from "./taxonomy.ts";

export const FOLLOW_THROUGH_WINDOWS = [30, 60, 90, 180] as const;
export type FollowThroughWindow = (typeof FOLLOW_THROUGH_WINDOWS)[number];

export type RecurrenceSeries = {
  id: string;
  organization_id: string;
  category: string;
  data_origin: string;
  purchases: RecurrencePurchase[];
};

export type BaselineKind = "AT_LEAST_ONE_LAST_YEAR" | "AT_LEAST_TWO_24M" | "LAST_PURCHASE_WITHIN_180D";

export type WilsonInterval = {
  n: number;
  successes: number;
  point: number | null;
  low: number | null;
  high: number | null;
};

export function wilsonInterval(successes: number, n: number, z = 1.96): WilsonInterval {
  if (n <= 0) return { n: 0, successes: 0, point: null, low: null, high: null };
  const p = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = p + z2 / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
  return {
    n,
    successes,
    point: p,
    low: Math.max(0, (center - margin) / denom),
    high: Math.min(1, (center + margin) / denom),
  };
}

export function baselineFires(
  purchases: RecurrencePurchase[],
  t: string,
  kind: BaselineKind,
): boolean {
  const visible = visibleAt(purchases, t);
  if (visible.length === 0) return false;
  const tMs = new Date(t).getTime();
  if (kind === "AT_LEAST_ONE_LAST_YEAR") {
    const start = tMs - 365 * 86_400_000;
    return visible.some((row) => new Date(row.occurred_at).getTime() >= start);
  }
  if (kind === "AT_LEAST_TWO_24M") {
    const start = tMs - 730 * 86_400_000;
    return visible.filter((row) => new Date(row.occurred_at).getTime() >= start).length >= 2;
  }
  const last = visible.reduce((acc, row) => (row.occurred_at > acc ? row.occurred_at : acc), visible[0].occurred_at);
  return daysBetween(last, t) <= 180;
}

export type SeriesFollowThrough = {
  series_id: string;
  organization_id: string;
  category: string;
  data_origin: string;
  t: string;
  leakage: boolean;
  signal: RecurrenceResult;
  baselines: Record<BaselineKind, boolean>;
  follow_through: Record<FollowThroughWindow, boolean>;
  days_to_event: number | null;
  false_positive_180d: FalsePositiveReason | null;
};

function futureSameGroup(
  seed: NormalizedObject | undefined,
  future: RecurrencePurchase[],
): RecurrencePurchase[] {
  if (!seed) return [];
  return future.filter((row) => objectsGroupTogether(seed, row.normalized));
}

export function evaluateSeriesAtT(series: RecurrenceSeries, t: string): SeriesFollowThrough {
  const visible = visibleAt(series.purchases, t);
  const leak = assertNoTemporalLeakage(
    visible.map((row) => ({ occurred_at: row.occurred_at, id: row.canonical_id })),
    t,
  );
  const signal = computeRecurrence({ purchases: visible, now: t, windowMonths: 36 });
  const future = afterT(series.purchases, t);
  const seed = visible[0]?.normalized;
  const hits = futureSameGroup(seed, future);
  const daysTo = hits.length > 0 ? daysBetween(t, hits[0].occurred_at) : null;
  const follow_through = {
    30: daysTo != null && daysTo <= 30,
    60: daysTo != null && daysTo <= 60,
    90: daysTo != null && daysTo <= 90,
    180: daysTo != null && daysTo <= 180,
  } as Record<FollowThroughWindow, boolean>;
  const groupedInconsistently =
    visible.length >= 2 &&
    visible.some((row) => !objectsGroupTogether(visible[0].normalized, row.normalized));
  const false_positive_180d =
    signal.signal_level === "HIGH" && !follow_through[180]
      ? classifyRecurrenceFalsePositive({
          signal_level: signal.signal_level,
          median_interval_days: signal.median_interval_days,
          window_days: 180,
          grouped_inconsistently: groupedInconsistently,
          org_unresolved: series.organization_id.startsWith("org_name_"),
          seasonality: signal.seasonality,
        })
      : null;
  return {
    series_id: series.id,
    organization_id: series.organization_id,
    category: series.category,
    data_origin: series.data_origin,
    t,
    leakage: leak.ok === false,
    signal,
    baselines: {
      AT_LEAST_ONE_LAST_YEAR: baselineFires(series.purchases, t, "AT_LEAST_ONE_LAST_YEAR"),
      AT_LEAST_TWO_24M: baselineFires(series.purchases, t, "AT_LEAST_TWO_24M"),
      LAST_PURCHASE_WITHIN_180D: baselineFires(series.purchases, t, "LAST_PURCHASE_WITHIN_180D"),
    },
    follow_through,
    days_to_event: daysTo,
    false_positive_180d,
  };
}

export type RecurrenceEvalReport = {
  metric_name: "RECURRENCE_SIGNAL_FOLLOW_THROUGH";
  t: string;
  origin_scope: string;
  series_n: number;
  signals_generated: number;
  high_or_medium: number;
  windows: Record<
    FollowThroughWindow,
    {
      engine: WilsonInterval;
      baseline_one_last_year: WilsonInterval;
      baseline_two_24m: WilsonInterval;
      baseline_last_180d: WilsonInterval;
    }
  >;
  median_days_to_event: number | null;
  engine_beats_best_baseline_90d: boolean | null;
  false_positives: Array<{ series_id: string; reason: FalsePositiveReason }>;
  leakage_count: number;
  sample_too_small: boolean;
  notes: string;
};

function median(values: number[]): number | null {
  const sorted = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function intervalFor(
  rows: SeriesFollowThrough[],
  predicate: (row: SeriesFollowThrough) => boolean,
  window: FollowThroughWindow,
): WilsonInterval {
  const selected = rows.filter(predicate);
  const successes = selected.filter((row) => row.follow_through[window]).length;
  return wilsonInterval(successes, selected.length);
}

export function evaluateRecurrence(args: {
  series: RecurrenceSeries[];
  t: string;
  origin_scope: string;
}): RecurrenceEvalReport {
  const rows = args.series.map((series) => evaluateSeriesAtT(series, args.t));
  const engineFired = (row: SeriesFollowThrough) =>
    row.signal.signal_level === "HIGH" || row.signal.signal_level === "MEDIUM";
  const windows = {} as RecurrenceEvalReport["windows"];
  for (const w of FOLLOW_THROUGH_WINDOWS) {
    windows[w] = {
      engine: intervalFor(rows, engineFired, w),
      baseline_one_last_year: intervalFor(
        rows,
        (row) => row.baselines.AT_LEAST_ONE_LAST_YEAR,
        w,
      ),
      baseline_two_24m: intervalFor(rows, (row) => row.baselines.AT_LEAST_TWO_24M, w),
      baseline_last_180d: intervalFor(
        rows,
        (row) => row.baselines.LAST_PURCHASE_WITHIN_180D,
        w,
      ),
    };
  }
  const engine90 = windows[90].engine.point;
  const bestBaseline = Math.max(
    windows[90].baseline_one_last_year.point ?? 0,
    windows[90].baseline_two_24m.point ?? 0,
    windows[90].baseline_last_180d.point ?? 0,
  );
  const nEngine = windows[90].engine.n;
  const sample_too_small = nEngine < 30;
  const days = rows.map((row) => row.days_to_event).filter((n): n is number => n != null);
  return {
    metric_name: "RECURRENCE_SIGNAL_FOLLOW_THROUGH",
    t: args.t,
    origin_scope: args.origin_scope,
    series_n: rows.length,
    signals_generated: rows.filter(engineFired).length,
    high_or_medium: rows.filter(engineFired).length,
    windows,
    median_days_to_event: median(days),
    engine_beats_best_baseline_90d:
      engine90 == null || nEngine < 8 ? null : engine90 > bestBaseline + 0.05,
    false_positives: rows
      .filter((row) => row.false_positive_180d)
      .map((row) => ({ series_id: row.series_id, reason: row.false_positive_180d as FalsePositiveReason })),
    leakage_count: rows.filter((row) => row.leakage).length,
    sample_too_small,
    notes: sample_too_small
      ? `n=${nEngine} sinais MEDIUM/HIGH. Amostra insuficiente para justificar complexidade extra do motor. Não é acurácia de previsão.`
      : "Follow-through de sinal de recorrência. Não é acurácia de previsão de nova licitação.",
  };
}
