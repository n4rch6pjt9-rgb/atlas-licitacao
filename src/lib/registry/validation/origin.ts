/**
 * Origin tagging for Gate 7.5.
 * Golden never contaminates live metrics. Absence of a tag is UNKNOWN, not LIVE.
 */

export const DATA_ORIGINS = ["LIVE", "GOLDEN", "FIXTURE", "SYNTHETIC", "UNKNOWN"] as const;
export type DataOrigin = (typeof DATA_ORIGINS)[number];

export const ORIGIN_SCOPES = ["LIVE", "GOLDEN", "FIXTURE", "SYNTHETIC", "ALL"] as const;
export type OriginScope = (typeof ORIGIN_SCOPES)[number];

export function asDataOrigin(value: string | null | undefined): DataOrigin {
  if (value && (DATA_ORIGINS as readonly string[]).includes(value)) {
    return value as DataOrigin;
  }
  return "UNKNOWN";
}

export function filterByOrigin<T extends { data_origin?: string | null }>(
  rows: T[],
  scope: OriginScope,
): T[] {
  if (scope === "ALL") return rows;
  return rows.filter((row) => asDataOrigin(row.data_origin) === scope);
}

/** Live metrics must not include golden, fixture or synthetic rows. */
export function liveOnly<T extends { data_origin?: string | null }>(rows: T[]): T[] {
  return filterByOrigin(rows, "LIVE");
}

export function goldenOnly<T extends { data_origin?: string | null }>(rows: T[]): T[] {
  return filterByOrigin(rows, "GOLDEN");
}

export function originsMixed(rows: Array<{ data_origin?: string | null }>): boolean {
  const set = new Set(rows.map((row) => asDataOrigin(row.data_origin)));
  return set.size > 1;
}

export const FORBIDDEN_SIGNAL_PHRASES = [
  "acurácia de previsão",
  "acuracia de previsao",
  "accuracy of prediction",
  "probabilidade de vitória",
  "probabilidade de vitoria",
  "win probability",
  "ausência definitiva",
  "ausencia definitiva",
  "confirmadamente ausente",
  "exclusivo do pncp",
  "exclusiva do pncp",
  "local exclusive",
] as const;

export function forbiddenLanguageHit(text: string | null | undefined): string | null {
  if (!text) return null;
  const compact = text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  for (const phrase of FORBIDDEN_SIGNAL_PHRASES) {
    const needle = phrase
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase();
    if (compact.includes(needle)) {
      const idx = compact.indexOf(needle);
      const before = compact.slice(Math.max(0, idx - 24), idx);
      if (/(nao e |nao eh |nao prova |nunca |sem |, nao | e nao | nao )$/.test(before)) continue;
      return phrase;
    }
  }
  return null;
}

export type ClaimKind = "FATO_VERIFICADO" | "INFERENCIA" | "PENDENTE_DE_VALIDACAO";

export function claimForOriginFact(origin: DataOrigin, isOfficialField: boolean): ClaimKind {
  if (origin === "LIVE" && isOfficialField) return "FATO_VERIFICADO";
  if (origin === "GOLDEN" && isOfficialField) return "FATO_VERIFICADO";
  if (!isOfficialField) return "INFERENCIA";
  return "PENDENTE_DE_VALIDACAO";
}
