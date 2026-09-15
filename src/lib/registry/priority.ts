/**
 * Milestone 5/6 — versioned, explainable source-family priority.
 *
 * v1/v2 share the same documented weighted sum. It is NOT a physical law.
 * The conceptual product question is:
 *   (coverage gain × freshness × volume × reuse × reliability)
 *   / (integration cost + maintenance risk)
 * Linearised into configurable components so the UI can answer
 * "why is this family first?" without a hidden formula.
 *
 * estimated_volume is UNCAPTURED volume, not catalog size.
 * A family already ingested at scale scores lower remaining volume.
 *
 * v2 does not change weights. It changes the inputs: live records/day,
 * observed overlap, lead, reliability. v1 remains stored.
 */

export const PRIORITY_SCORE_VERSION = "v1" as const;
export const PRIORITY_SCORE_VERSION_V2 = "v2" as const;

export const PRIORITY_WEIGHTS_V1 = {
  coverage_gap: 0.18,
  estimated_volume: 0.14,
  lead_time: 0.16,
  technical_reuse: 0.12,
  source_reliability: 0.08,
  evidence_confidence: 0.1,
  public_access: 0.08,
  historical_depth: 0.04,
  maintenance_risk_inverted: 0.05,
  integration_cost_inverted: 0.05,
} as const;

export const PRIORITY_WEIGHTS_V2 = { ...PRIORITY_WEIGHTS_V1 };

export type PriorityV1Key = keyof typeof PRIORITY_WEIGHTS_V1;

export const ADAPTER_FITS = [
  "GENERIC_JSON_FIT",
  "GENERIC_ACTION_FIT",
  "GENERIC_JSF_FIT",
  "NEEDS_NEW_GENERIC_CAPABILITY",
  "NEEDS_VENDOR_ADAPTER",
  "UNSUITABLE",
] as const;
export type AdapterFit = (typeof ADAPTER_FITS)[number];

export type PriorityV1Input = {
  coverage_gap: number;
  estimated_volume: number;
  lead_time: number;
  technical_reuse: number;
  source_reliability: number;
  evidence_confidence: number;
  public_access: number;
  historical_depth: number;
  maintenance_risk: number;
  integration_cost: number;
};

export type ExplainableScore = {
  score_version: string;
  components: Record<PriorityV1Key, number>;
  weights: Record<PriorityV1Key, number>;
  weighted: Record<PriorityV1Key, number>;
  final_score: number;
  rationale: string;
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function priorityWeightsSum(weights: Record<string, number> = PRIORITY_WEIGHTS_V1): number {
  return Object.values(weights).reduce((acc, n) => acc + n, 0);
}

export function leadTimeComponent(medianHours: number | null): number {
  if (medianHours == null || !Number.isFinite(medianHours)) return 0.3;
  return clamp01(medianHours / 48);
}

export function overlapGap(ratio: number | null, hasSample: boolean): number {
  if (!hasSample) return 0.55;
  return clamp01(1 - (ratio ?? 0));
}

export function explainablePriorityScore(
  input: PriorityV1Input,
  weights: Record<PriorityV1Key, number> = PRIORITY_WEIGHTS_V1,
  scoreVersion: string = PRIORITY_SCORE_VERSION,
): ExplainableScore {
  const components: Record<PriorityV1Key, number> = {
    coverage_gap: clamp01(input.coverage_gap),
    estimated_volume: clamp01(input.estimated_volume),
    lead_time: clamp01(input.lead_time),
    technical_reuse: clamp01(input.technical_reuse),
    source_reliability: clamp01(input.source_reliability),
    evidence_confidence: clamp01(input.evidence_confidence),
    public_access: clamp01(input.public_access),
    historical_depth: clamp01(input.historical_depth),
    maintenance_risk_inverted: clamp01(1 - input.maintenance_risk),
    integration_cost_inverted: clamp01(1 - input.integration_cost),
  };
  const weighted = {} as Record<PriorityV1Key, number>;
  let sum = 0;
  (Object.keys(PRIORITY_WEIGHTS_V1) as PriorityV1Key[]).forEach((key) => {
    const w = weights[key] ?? 0;
    const value = components[key] * w;
    weighted[key] = Math.round(value * 10000) / 10000;
    sum += value;
  });
  const final_score = Math.round(sum * 1000) / 10;
  const top = (Object.keys(components) as PriorityV1Key[])
    .map((key) => ({ key, value: weighted[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((row) => `${row.key} ${row.value.toFixed(3)}`)
    .join(", ");
  return {
    score_version: scoreVersion,
    components,
    weights: { ...weights },
    weighted,
    final_score,
    rationale: `${scoreVersion} ponderado. Maiores contribuições: ${top}. Volume = ganho ainda não capturado, não tamanho de catálogo.`,
  };
}

export function adapterFitReuse(fit: AdapterFit | string | null): number {
  switch (fit) {
    case "GENERIC_JSON_FIT":
    case "GENERIC_ACTION_FIT":
    case "GENERIC_JSF_FIT":
      return 0.95;
    case "NEEDS_NEW_GENERIC_CAPABILITY":
      return 0.35;
    case "NEEDS_VENDOR_ADAPTER":
      return 0.12;
    case "UNSUITABLE":
      return 0.05;
    default:
      return 0.2;
  }
}
