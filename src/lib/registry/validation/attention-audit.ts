import {
  ATTENTION_SCORE_VERSION,
  ATTENTION_WEIGHTS_V1,
  explainableAttentionScore,
  type AttentionInput,
  type AttentionKey,
} from "../attention.ts";

export type RankedOpportunity = {
  id: string;
  object: string | null;
  organization_name: string | null;
  data_origin: string;
  input: AttentionInput;
  data_confidence: number;
};

export type AttentionAuditRow = {
  id: string;
  score: number;
  data_confidence: number;
  components: Record<AttentionKey, number>;
  top_component: AttentionKey;
  absurd: boolean;
  absurd_reason: string | null;
};

function scoreOf(row: RankedOpportunity, drop?: AttentionKey): number {
  const input = { ...row.input };
  if (drop) input[drop] = 0;
  return explainableAttentionScore(input, row.data_confidence).final_score;
}

function isAbsurd(row: RankedOpportunity, score: number): { absurd: boolean; reason: string | null } {
  if (score >= 70 && row.input.data_quality < 0.25 && row.input.source_confidence < 0.25) {
    return { absurd: true, reason: "score alto com data_confidence baixo — ranking estrutural, não qualidade" };
  }
  if (score >= 80 && row.input.freshness < 0.2 && row.input.deadline_urgency < 0.2 && row.input.lead_time < 0.2) {
    return { absurd: true, reason: "score alto sem frescor, prazo ou antecedência" };
  }
  return { absurd: false, reason: null };
}

export type AblationResult = {
  dropped: AttentionKey;
  top10_retention: number;
  mean_abs_delta: number;
};

export type AttentionAuditReport = {
  score_version: typeof ATTENTION_SCORE_VERSION;
  weights: typeof ATTENTION_WEIGHTS_V1;
  n: number;
  origin_scope: string;
  ranking: AttentionAuditRow[];
  top10: AttentionAuditRow[];
  bottom: AttentionAuditRow[];
  absurd_count: number;
  bad_cases: AttentionAuditRow[];
  ablation: AblationResult[];
  dominant_component: AttentionKey | null;
  notes: string;
};

const INPUT_KEYS: AttentionKey[] = [
  "freshness",
  "lead_time",
  "deadline_urgency",
  "organization_recurrence",
  "category_relevance",
  "planning_confirmation",
  "estimated_value",
  "data_quality",
  "source_confidence",
];

export function rankedFromStored(args: {
  id: string;
  object: string | null;
  organization_name: string | null;
  data_origin: string;
  data_confidence: number;
  components: Record<string, unknown> | null;
}): RankedOpportunity | null {
  if (!args.components) return null;
  const input = {} as AttentionInput;
  for (const key of INPUT_KEYS) {
    const n = Number(args.components[key]);
    if (!Number.isFinite(n)) return null;
    input[key] = n;
  }
  return {
    id: args.id,
    object: args.object,
    organization_name: args.organization_name,
    data_origin: args.data_origin,
    input,
    data_confidence: args.data_confidence,
  };
}

export function collectBadAttentionCases(rows: AttentionAuditRow[]): AttentionAuditRow[] {
  return rows.filter((row) => row.absurd);
}

export function auditAttention(args: {
  rows: RankedOpportunity[];
  origin_scope: string;
}): AttentionAuditReport {
  const scored = args.rows.map((row) => {
    const explained = explainableAttentionScore(row.input, row.data_confidence);
    const top = (Object.keys(explained.weighted) as AttentionKey[]).sort(
      (a, b) => explained.weighted[b] - explained.weighted[a],
    )[0];
    const absurd = isAbsurd(row, explained.final_score);
    return {
      id: row.id,
      score: explained.final_score,
      data_confidence: explained.data_confidence,
      components: explained.components,
      top_component: top,
      absurd: absurd.absurd,
      absurd_reason: absurd.reason,
    } satisfies AttentionAuditRow;
  });
  scored.sort((a, b) => b.score - a.score);
  const fullTop10 = new Set(scored.slice(0, 10).map((row) => row.id));
  const keys = Object.keys(ATTENTION_WEIGHTS_V1) as AttentionKey[];
  const ablation: AblationResult[] = keys.map((dropped) => {
    const reranked = args.rows
      .map((row) => ({ id: row.id, score: scoreOf(row, dropped) }))
      .sort((a, b) => a.score === b.score ? 0 : b.score - a.score);
    const ablatedTop = reranked.slice(0, 10).map((row) => row.id);
    const retained = ablatedTop.filter((id) => fullTop10.has(id)).length;
    const deltas = args.rows.map((row) => Math.abs(scoreOf(row) - scoreOf(row, dropped)));
    const mean = deltas.length === 0 ? 0 : deltas.reduce((a, b) => a + b, 0) / deltas.length;
    return { dropped, top10_retention: retained / Math.max(1, Math.min(10, args.rows.length)), mean_abs_delta: mean };
  });
  ablation.sort((a, b) => b.mean_abs_delta - a.mean_abs_delta);
  const bad_cases = collectBadAttentionCases(scored);
  return {
    score_version: ATTENTION_SCORE_VERSION,
    weights: ATTENTION_WEIGHTS_V1,
    n: scored.length,
    origin_scope: args.origin_scope,
    ranking: scored,
    top10: scored.slice(0, 10),
    bottom: scored.slice(-10).reverse(),
    absurd_count: bad_cases.length,
    bad_cases,
    ablation,
    dominant_component: ablation[0]?.dropped ?? null,
    notes:
      "Attention v1 é atenção estrutural, não é probabilidade de vitória. Pesos não foram alterados. Casos ruins coletados sem recalibrar. Uma versão v2 só existiria se a evidência obrigasse — Gate 7.5 não aplica.",
  };
}
