/**
 * Temporal evaluation splits. A signal computed at T may only see purchases ≤ T.
 * Holdout is reserved and must not be used to calibrate rules.
 */

export const G75_AS_OF = "2026-06-30T23:59:59.000Z";
export const G75_NOW = "2026-09-14T21:00:00.000Z";

export type CohortKind = "CALIBRATION" | "VALIDATION" | "HOLDOUT" | "PCP_COHORT";

export type EvaluationCohort = {
  id: string;
  kind: CohortKind;
  window_start: string;
  window_end: string;
  notes: string;
};

export const G75_COHORTS: EvaluationCohort[] = [
  {
    id: "g75_calibration",
    kind: "CALIBRATION",
    window_start: "2024-01-01T00:00:00.000Z",
    window_end: G75_AS_OF,
    notes: "Histórico visível em T. Recurrence signals só podem usar este intervalo.",
  },
  {
    id: "g75_validation",
    kind: "VALIDATION",
    window_start: "2026-07-01T00:00:00.000Z",
    window_end: "2026-08-31T23:59:59.000Z",
    notes: "Follow-through de 30/60 dias a partir de T=2026-06-30. Não calibrar aqui.",
  },
  {
    id: "g75_holdout",
    kind: "HOLDOUT",
    window_start: "2026-09-01T00:00:00.000Z",
    window_end: "2026-12-31T23:59:59.000Z",
    notes: "Reservado. Não usar para ajustar regras nem declarar sucesso.",
  },
  {
    id: "g75_pcp_week",
    kind: "PCP_COHORT",
    window_start: "2026-09-08T00:00:00.000Z",
    window_end: "2026-09-14T23:59:59.000Z",
    notes: "150 records PCP live. Janela operacional de 7 dias ainda não madura em 14/09/2026.",
  },
];

export function inWindow(iso: string, start: string, end: string): boolean {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t >= new Date(start).getTime() && t <= new Date(end).getTime();
}

export function visibleAt<T extends { occurred_at: string }>(rows: T[], t: string): T[] {
  const end = new Date(t).getTime();
  return rows.filter((row) => {
    const ts = new Date(row.occurred_at).getTime();
    return Number.isFinite(ts) && ts <= end;
  });
}

export function afterT<T extends { occurred_at: string }>(rows: T[], t: string): T[] {
  const start = new Date(t).getTime();
  return rows.filter((row) => {
    const ts = new Date(row.occurred_at).getTime();
    return Number.isFinite(ts) && ts > start;
  });
}

export function assertNoTemporalLeakage(
  used: Array<{ occurred_at: string; id?: string }>,
  t: string,
): { ok: true } | { ok: false; leaked: string[] } {
  const end = new Date(t).getTime();
  const leaked = used
    .filter((row) => new Date(row.occurred_at).getTime() > end)
    .map((row) => row.id ?? row.occurred_at);
  if (leaked.length > 0) return { ok: false, leaked };
  return { ok: true };
}

export function holdoutUnused(args: {
  calibrated_on: string[];
  holdout_ids: string[];
}): boolean {
  const hold = new Set(args.holdout_ids);
  return args.calibrated_on.every((id) => !hold.has(id));
}

export function daysBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
}
