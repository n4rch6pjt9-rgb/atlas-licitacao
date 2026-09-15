/**
 * Deterministic object normalization for grouping — never replaces the official text.
 */

const NOISE = [
  "contratacao de empresa para",
  "contratacao de",
  "aquisicao de",
  "aquisicao",
  "contratacao",
  "pregao eletronico para",
  "pregao eletronico",
  "pregao",
  "sistema de registro de precos",
  "registro de precos",
  "srp",
  "objeto",
  "edital",
  "processo administrativo",
  "processo",
  "visando a",
  "visando",
  "para atendimento",
  "destinado a",
  "destinados a",
  "conforme",
  "nº",
  "n°",
  "no.",
];

const PHRASE_SYNONYMS: Array<[RegExp, string]> = [
  [/aparelho(?:s)? de academia/g, "equipamento_esportivo"],
  [/equipamento(?:s)? de academia/g, "equipamento_esportivo"],
  [/material(?:is)? esportivo(?:s)?/g, "equipamento_esportivo"],
  [/equipamento(?:s)? esportivo(?:s)?/g, "equipamento_esportivo"],
  [/kit(?:s)? esportivo(?:s)?/g, "equipamento_esportivo"],
  [/\bacademia\b/g, "equipamento_esportivo"],
  [/merenda escolar/g, "alimentacao_escolar"],
  [/\bmerenda\b/g, "alimentacao_escolar"],
  [/generos alimenticio(?:s)?/g, "alimentacao_escolar"],
  [/alimentacao escolar/g, "alimentacao_escolar"],
  [/\bdiesel\b/g, "combustivel"],
  [/\bgasolina\b/g, "combustivel"],
  [/combustive(?:l|is)/g, "combustivel"],
];

export type NormalizedObject = {
  raw: string;
  normalized: string;
  tokens: string[];
  synonym_bucket: string | null;
};

export function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

export function compactText(value: string | null | undefined): string {
  return stripAccents(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeObject(raw: string | null | undefined): NormalizedObject {
  const original = (raw ?? "").trim();
  let text = compactText(original);
  for (const phrase of NOISE) {
    text = text.replaceAll(phrase, " ");
  }
  text = text.replace(/\b(19|20)\d{2}\b/g, " ").replace(/\b\d+\b/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  let bucket: string | null = null;
  for (const [pattern, replacement] of PHRASE_SYNONYMS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      bucket = replacement;
      pattern.lastIndex = 0;
      text = text.replace(pattern, replacement);
    }
    pattern.lastIndex = 0;
  }
  text = text.replace(/\s+/g, " ").trim();
  const tokens = text.split(" ").filter((token) => token.length > 2);
  return {
    raw: original,
    normalized: text,
    tokens,
    synonym_bucket: bucket,
  };
}

export function tokenJaccard(left: string[], right: string[]): number {
  const a = new Set(left);
  const b = new Set(right);
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const token of a) if (b.has(token)) inter += 1;
  return inter / (a.size + b.size - inter);
}

export function objectsGroupTogether(a: NormalizedObject, b: NormalizedObject): boolean {
  if (a.synonym_bucket && b.synonym_bucket) {
    return a.synonym_bucket === b.synonym_bucket;
  }
  return tokenJaccard(a.tokens, b.tokens) >= 0.55;
}

export function recurrenceGroupKey(args: {
  organizationId: string;
  catalogCode?: string | null;
  normalized: NormalizedObject;
}): string {
  if (args.catalogCode && args.catalogCode.trim()) {
    return `${args.organizationId}|CAT:${args.catalogCode.trim()}`;
  }
  const bucket = args.normalized.synonym_bucket ?? args.normalized.normalized;
  return `${args.organizationId}|OBJ:${bucket}`;
}
