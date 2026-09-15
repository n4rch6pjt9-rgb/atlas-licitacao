import type { LocalOnlyState } from "./types.ts";

/**
 * Documented, configurable weights for integration_priority_score.
 * Sum = 1. Calibrate empirically; do not scatter magic numbers in UI.
 */
export const PRIORITY_WEIGHTS = {
  number_verified_entities: 0.22,
  estimated_procurement_volume: 0.18,
  current_pncp_gap: 0.22,
  technical_reuse_probability: 0.16,
  public_access_quality: 0.1,
  adapter_reuse: 0.08,
  historical_depth: 0.04,
} as const;

export type PriorityWeightKey = keyof typeof PRIORITY_WEIGHTS;

export const DEFAULT_COVERAGE_CONFIG = {
  local_only_provisional_hours: 6,
  local_only_confirmed_hours: 168,
  match_confirmed_min_score: 90,
  recheck_hours: [1, 6, 24, 72, 168],
} as const;

export type CoverageConfig = {
  local_only_provisional_hours: number;
  local_only_confirmed_hours: number;
};

export type PriorityInput = {
  number_verified_entities: number;
  estimated_procurement_volume: number;
  current_pncp_gap: number;
  technical_reuse_probability: number;
  public_access_quality: number;
  adapter_reuse: number;
  historical_depth: number;
};

export type RecordOverlap = {
  total_local_records: number;
  matched_pncp_records: number;
  matched_comprasgov_records: number;
  local_only_records: number;
  ambiguous_records: number;
  rejected_matches: number;
  pncp_overlap_ratio: number;
  comprasgov_overlap_ratio: number;
};

export type FieldConflict = {
  field: string;
  source_a: string;
  value_a: string | null;
  source_b: string;
  value_b: string | null;
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function integrationPriorityScore(
  input: PriorityInput,
  weights: Record<PriorityWeightKey, number> = PRIORITY_WEIGHTS,
): number {
  let sum = 0;
  (Object.keys(PRIORITY_WEIGHTS) as PriorityWeightKey[]).forEach((key) => {
    sum += clamp01(input[key]) * (weights[key] ?? 0);
  });
  return Math.round(sum * 1000) / 1000;
}

export function classifyLocalOnly(args: {
  matched: boolean;
  firstSeenAt: string | Date;
  now?: string | Date;
  config?: CoverageConfig;
}): LocalOnlyState {
  if (args.matched) return "MATCHED";
  const now = new Date(args.now ?? Date.now()).getTime();
  const first = new Date(args.firstSeenAt).getTime();
  const hours = (now - first) / 3_600_000;
  const config = args.config ?? DEFAULT_COVERAGE_CONFIG;
  if (hours < config.local_only_provisional_hours) return "PENDING_PNCP_MATCH";
  if (hours < config.local_only_confirmed_hours) return "LOCAL_ONLY_PROVISIONAL";
  return "LOCAL_ONLY_CONFIRMED";
}

/** Opportunity early_kind uses PENDING_MATCH; coverage local-only keeps PENDING_PNCP_MATCH. */
export function toOpportunityEarlyKind(
  localOnlyState: string | null | undefined,
): "EARLY_MATCHED" | "LOCAL_ONLY_PROVISIONAL" | "LOCAL_ONLY_CONFIRMED" | "PENDING_MATCH" | null {
  if (!localOnlyState || localOnlyState === "MATCHED") return null;
  if (localOnlyState === "PENDING_PNCP_MATCH") return "PENDING_MATCH";
  if (
    localOnlyState === "EARLY_MATCHED" ||
    localOnlyState === "LOCAL_ONLY_PROVISIONAL" ||
    localOnlyState === "LOCAL_ONLY_CONFIRMED" ||
    localOnlyState === "PENDING_MATCH"
  ) {
    return localOnlyState;
  }
  return null;
}

export function leadTimeHours(
  localFirstSeenAt: string | Date,
  pncpFirstSeenAt: string | Date,
): number {
  const local = new Date(localFirstSeenAt).getTime();
  const pncp = new Date(pncpFirstSeenAt).getTime();
  return Math.round(((pncp - local) / 3_600_000) * 100) / 100;
}

export function percentile(values: number[], p: number): number | null {
  const sorted = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  if (p <= 0) return sorted[0];
  if (p >= 100) return sorted[sorted.length - 1];
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const w = idx - lo;
  return Math.round((sorted[lo] * (1 - w) + sorted[hi] * w) * 100) / 100;
}

export function recordOverlap(args: {
  total_local_records: number;
  matched_pncp_records: number;
  matched_comprasgov_records: number;
  local_only_records: number;
  ambiguous_records: number;
  rejected_matches: number;
}): RecordOverlap {
  const total = Math.max(0, args.total_local_records);
  return {
    ...args,
    pncp_overlap_ratio: total === 0 ? 0 : args.matched_pncp_records / total,
    comprasgov_overlap_ratio: total === 0 ? 0 : args.matched_comprasgov_records / total,
  };
}

export function compareProcurementFields(
  sourceAId: string,
  a: Record<string, string | null | undefined>,
  sourceBId: string,
  b: Record<string, string | null | undefined>,
): FieldConflict[] {
  const fields = ["object", "opening_at", "status", "modality", "estimated_value"];
  const out: FieldConflict[] = [];
  for (const field of fields) {
    const left = (a[field] ?? "").trim();
    const right = (b[field] ?? "").trim();
    if (!left || !right) continue;
    if (left !== right) {
      out.push({
        field,
        source_a: sourceAId,
        value_a: left,
        source_b: sourceBId,
        value_b: right,
      });
    }
  }
  return out;
}

export function nextRecheckAt(
  firstSeenAt: string | Date,
  now?: string | Date,
  cadencesHours: readonly number[] = DEFAULT_COVERAGE_CONFIG.recheck_hours,
): string | null {
  const first = new Date(firstSeenAt).getTime();
  const current = new Date(now ?? Date.now()).getTime();
  const elapsed = (current - first) / 3_600_000;
  const next = cadencesHours.find((h) => h > elapsed);
  if (next === undefined) return null;
  return new Date(first + next * 3_600_000).toISOString();
}
