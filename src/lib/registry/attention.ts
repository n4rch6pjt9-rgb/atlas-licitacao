export const ATTENTION_SCORE_VERSION = "v1" as const;

export const ATTENTION_WEIGHTS_V1 = {
  freshness: 0.16,
  lead_time: 0.14,
  deadline_urgency: 0.14,
  organization_recurrence: 0.12,
  category_relevance: 0.08,
  planning_confirmation: 0.12,
  estimated_value: 0.08,
  data_quality: 0.1,
  source_confidence: 0.06,
} as const;

export type AttentionKey = keyof typeof ATTENTION_WEIGHTS_V1;

export type AttentionInput = {
  freshness: number;
  lead_time: number;
  deadline_urgency: number;
  organization_recurrence: number;
  category_relevance: number;
  planning_confirmation: number;
  estimated_value: number;
  data_quality: number;
  source_confidence: number;
};

export type ExplainableAttention = {
  score_version: typeof ATTENTION_SCORE_VERSION;
  components: Record<AttentionKey, number>;
  weights: Record<AttentionKey, number>;
  weighted: Record<AttentionKey, number>;
  final_score: number;
  data_confidence: number;
  rationale: string;
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function attentionWeightsSum(
  weights: Record<string, number> = ATTENTION_WEIGHTS_V1,
): number {
  return Object.values(weights).reduce((acc, n) => acc + n, 0);
}

export function freshnessComponent(firstSeenAt: string | null, now: string): number {
  if (!firstSeenAt) return 0.2;
  const hours = (new Date(now).getTime() - new Date(firstSeenAt).getTime()) / 3_600_000;
  if (!Number.isFinite(hours) || hours < 0) return 0.2;
  if (hours <= 6) return 1;
  if (hours <= 24) return 0.85;
  if (hours <= 72) return 0.65;
  if (hours <= 168) return 0.4;
  return 0.15;
}

export function deadlineUrgencyComponent(deadline: string | null, now: string): number {
  if (!deadline) return 0.2;
  const hours = (new Date(deadline).getTime() - new Date(now).getTime()) / 3_600_000;
  if (!Number.isFinite(hours)) return 0.2;
  if (hours < 0) return 0.05;
  if (hours <= 24) return 1;
  if (hours <= 72) return 0.85;
  if (hours <= 168) return 0.6;
  if (hours <= 336) return 0.4;
  return 0.2;
}

export function leadAttentionComponent(hours: number | null): number {
  if (hours == null || !Number.isFinite(hours) || hours <= 0) return 0.25;
  return clamp01(hours / 48);
}

export function valueComponent(value: number | null): number {
  if (value == null || !Number.isFinite(value) || value <= 0) return 0.15;
  if (value >= 1_000_000) return 1;
  if (value >= 100_000) return 0.7;
  if (value >= 20_000) return 0.45;
  return 0.25;
}

export function dataQualityFromGaps(args: {
  hasCnpj: boolean;
  hasValue: boolean;
  hasDeadline: boolean;
  matchAmbiguous: boolean;
}): number {
  let score = 0.2;
  if (args.hasCnpj) score += 0.3;
  if (args.hasValue) score += 0.2;
  if (args.hasDeadline) score += 0.2;
  if (args.matchAmbiguous) score -= 0.25;
  return clamp01(score);
}

export function explainableAttentionScore(
  input: AttentionInput,
  dataConfidence = input.data_quality,
  weights: Record<AttentionKey, number> = ATTENTION_WEIGHTS_V1,
): ExplainableAttention {
  const components = {} as Record<AttentionKey, number>;
  const weighted = {} as Record<AttentionKey, number>;
  let sum = 0;
  (Object.keys(ATTENTION_WEIGHTS_V1) as AttentionKey[]).forEach((key) => {
    const value = clamp01(input[key]);
    components[key] = value;
    const w = weights[key] ?? 0;
    weighted[key] = Math.round(value * w * 10000) / 10000;
    sum += value * w;
  });
  const final_score = Math.round(sum * 1000) / 10;
  const top = (Object.keys(components) as AttentionKey[])
    .map((key) => ({ key, value: weighted[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((row) => `${row.key} ${row.value.toFixed(3)}`)
    .join(", ");
  return {
    score_version: ATTENTION_SCORE_VERSION,
    components,
    weights: { ...weights },
    weighted,
    final_score,
    data_confidence: clamp01(dataConfidence),
    rationale: `v1 de atenção estrutural, não probabilidade de vitória. Maiores contribuições: ${top}.`,
  };
}
