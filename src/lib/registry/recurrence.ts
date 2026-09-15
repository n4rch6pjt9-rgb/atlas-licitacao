import { objectsGroupTogether, type NormalizedObject } from "./object-normalize.ts";

export const RECURRENCE_MODEL_VERSION = "v1" as const;

export type RecurrencePurchase = {
  canonical_id: string;
  occurred_at: string;
  value: number | null;
  normalized: NormalizedObject;
  catalog_code?: string | null;
};

export type RecurrenceResult = {
  model_version: typeof RECURRENCE_MODEL_VERSION;
  signal_level: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  purchase_count: number;
  median_interval_days: number | null;
  last_purchase_at: string | null;
  average_value: number | null;
  median_value: number | null;
  seasonality: string | null;
  confidence: number;
  sample_size: number;
  evidence_procurement_ids: string[];
  rationale: string;
  claim_kind: "FATO_VERIFICADO" | "INFERENCIA";
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function median(values: number[]): number | null {
  const sorted = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
  }
  return sorted[mid];
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdev(values: number[]): number | null {
  if (values.length < 2) return null;
  const avg = mean(values);
  if (avg == null) return null;
  const varSum = values.reduce((acc, n) => acc + (n - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(varSum);
}

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
}

export function filterWindow(
  purchases: RecurrencePurchase[],
  now: string | Date,
  windowMonths: number,
): RecurrencePurchase[] {
  const end = new Date(now).getTime();
  const start = end - windowMonths * 30.44 * 86_400_000;
  return purchases.filter((row) => {
    const t = new Date(row.occurred_at).getTime();
    return Number.isFinite(t) && t >= start && t <= end;
  });
}

export function computeRecurrence(args: {
  purchases: RecurrencePurchase[];
  now?: string | Date;
  windowMonths?: number;
}): RecurrenceResult {
  const now = args.now ?? "2026-09-14T20:00:00.000Z";
  const windowMonths = args.windowMonths ?? 36;
  const inWindow = filterWindow(args.purchases, now, windowMonths).sort(
    (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
  );
  const empty = (level: RecurrenceResult["signal_level"], rationale: string): RecurrenceResult => ({
    model_version: RECURRENCE_MODEL_VERSION,
    signal_level: level,
    purchase_count: inWindow.length,
    median_interval_days: null,
    last_purchase_at: inWindow.at(-1)?.occurred_at ?? null,
    average_value: null,
    median_value: null,
    seasonality: null,
    confidence: 0,
    sample_size: inWindow.length,
    evidence_procurement_ids: inWindow.map((row) => row.canonical_id),
    rationale,
    claim_kind: "INFERENCIA",
  });

  if (inWindow.length <= 1) {
    return empty("NONE", "Uma única compra na janela não gera sinal de recorrência.");
  }

  const seed = inWindow[0].normalized;
  const grouped = inWindow.filter((row) => objectsGroupTogether(seed, row.normalized));
  if (grouped.length < inWindow.length && grouped.length <= 1) {
    return empty("NONE", "Objetos distintos demais para agrupar automaticamente.");
  }
  const series = grouped.length >= 2 ? grouped : inWindow;
  if (series.length <= 1) {
    return empty("NONE", "Uma única compra na janela não gera sinal de recorrência.");
  }

  const intervals: number[] = [];
  for (let i = 1; i < series.length; i += 1) {
    intervals.push(daysBetween(series[i - 1].occurred_at, series[i].occurred_at));
  }
  const medianInterval = median(intervals);
  const avgInterval = mean(intervals);
  const spread = stdev(intervals);
  const cv = avgInterval && spread != null && avgInterval > 0 ? spread / avgInterval : 1;
  const values = series.map((row) => row.value).filter((n): n is number => n != null && Number.isFinite(n));
  const last = series[series.length - 1];

  let signal: RecurrenceResult["signal_level"] = "LOW";
  if (series.length === 2 && (medianInterval ?? 0) > 540) signal = "LOW";
  else if (series.length >= 5 && cv < 0.35) signal = "HIGH";
  else if (series.length >= 4 && cv < 0.4) signal = "HIGH";
  else if (series.length >= 3 && cv < 0.5) signal = "MEDIUM";
  else signal = "LOW";

  const confidence = clamp01(
    0.25 * Math.min(1, series.length / 5) + 0.45 * (1 - Math.min(1, cv)) + 0.3 * (medianInterval ? 1 : 0),
  );

  const seasonality =
    medianInterval != null && medianInterval >= 150 && medianInterval <= 210
      ? "semestral_aproximado"
      : medianInterval != null && medianInterval >= 300 && medianInterval <= 400
        ? "anual_aproximado"
        : null;

  const rationale = `Sinal ${signal.toLowerCase()} porque o órgão publicou ${series.length} processos semelhantes nos últimos ${windowMonths} meses, com intervalo mediano de ${Math.round(medianInterval ?? 0)} dias. Isso é inferência histórica, não previsão de nova licitação.`;

  return {
    model_version: RECURRENCE_MODEL_VERSION,
    signal_level: signal,
    purchase_count: series.length,
    median_interval_days: medianInterval,
    last_purchase_at: last.occurred_at,
    average_value: mean(values),
    median_value: median(values),
    seasonality,
    confidence: Math.round(confidence * 100) / 100,
    sample_size: series.length,
    evidence_procurement_ids: series.map((row) => row.canonical_id),
    rationale,
    claim_kind: "INFERENCIA",
  };
}
