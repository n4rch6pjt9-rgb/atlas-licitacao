import type { LinkStatus, SourceProcurement } from "./types";
import type { FieldConflict } from "./coverage.ts";

export const MATCH_METHODS = [
  "numeroControlePNCP",
  "cnpj_year_sequential",
  "process_organization",
  "number_modality_year",
  "object_dates",
  "standalone_local",
] as const;

export type MatchMethod = (typeof MATCH_METHODS)[number];

export type CanonicalCandidate = {
  canonical_entity_type: "PNCP" | "COMPRAS_GOV" | "STANDALONE";
  canonical_entity_id: string;
  numeroControlePNCP?: string | null;
  organization_cnpj?: string | null;
  year?: number | null;
  sequential?: string | null;
  process_number?: string | null;
  organization_name?: string | null;
  organization_identifier?: string | null;
  procurement_number?: string | null;
  modality?: string | null;
  object?: string | null;
  opening_at?: string | null;
  proposal_deadline?: string | null;
  status?: string | null;
  estimated_value?: string | null;
};

export type EntityLinkResult = {
  source_entity_type: "procurement";
  source_external_id: string;
  canonical_entity_type: CanonicalCandidate["canonical_entity_type"];
  canonical_entity_id: string | null;
  match_method: MatchMethod;
  match_score: number;
  status: LinkStatus;
  matched_fields: string[];
  conflicting_fields: FieldConflict[];
};

type ScoredMatch = {
  candidate: CanonicalCandidate;
  method: MatchMethod;
  score: number;
  matched_fields: string[];
  conflicting_fields: FieldConflict[];
};

function compact(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function digits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

function yearOf(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  const match = String(value).match(/(19|20)\d{2}/);
  return match ? match[0] : null;
}

function dayPrefix(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

function readString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function extractPncpControlNumber(source: SourceProcurement): string | null {
  const raw = asRecord(source.raw_payload);
  if (!raw) return null;
  return readString(raw, [
    "numeroControlePNCP",
    "numero_controle_pncp",
    "pncpId",
    "pncp_id",
    "idPncp",
  ]);
}

function extractCnpj(source: SourceProcurement): string | null {
  const direct = digits(source.organization_identifier);
  if (direct.length === 14) return direct;
  const raw = asRecord(source.raw_payload);
  if (!raw) return direct.length > 0 ? direct : null;
  const nested = readString(raw, [
    "orgaoCnpj",
    "cnpj",
    "organizationCnpj",
    "cnpjOrgao",
    "ni",
  ]);
  const fromRaw = digits(nested);
  return fromRaw.length > 0 ? fromRaw : direct.length > 0 ? direct : null;
}

function extractSequential(source: SourceProcurement): string | null {
  const raw = asRecord(source.raw_payload);
  if (!raw) return null;
  return readString(raw, [
    "sequencial",
    "sequencialCompra",
    "sequential",
    "numeroSequencial",
  ]);
}

function objectOverlap(a: string, b: string): number {
  const left = compact(a);
  const right = compact(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  const tokens = (text: string) =>
    new Set(text.split(" ").filter((token) => token.length > 2));
  const ta = tokens(left);
  const tb = tokens(right);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const token of ta) if (tb.has(token)) inter += 1;
  return inter / new Set([...ta, ...tb]).size;
}

function datesAlign(source: SourceProcurement, candidate: CanonicalCandidate): boolean {
  const sourceDays = [dayPrefix(source.opening_at), dayPrefix(source.proposal_deadline)].filter(
    (v): v is string => Boolean(v),
  );
  const candidateDays = [
    dayPrefix(candidate.opening_at),
    dayPrefix(candidate.proposal_deadline),
  ].filter((v): v is string => Boolean(v));
  if (sourceDays.length === 0 || candidateDays.length === 0) return false;
  return sourceDays.some((day) => candidateDays.includes(day));
}

function fieldConflicts(
  source: SourceProcurement,
  candidate: CanonicalCandidate,
  sourceId = "local",
): FieldConflict[] {
  const conflicts: FieldConflict[] = [];
  const pairs: Array<[string, string | null | undefined, string | null | undefined]> = [
    ["object", source.object, candidate.object],
    ["opening_at", dayPrefix(source.opening_at), dayPrefix(candidate.opening_at)],
    ["modality", source.modality, candidate.modality],
    ["status", source.status, candidate.status],
  ];
  for (const [field, left, right] of pairs) {
    if (!left || !right) continue;
    if (compact(left) !== compact(right)) {
      conflicts.push({
        field,
        source_a: sourceId,
        value_a: left,
        source_b: candidate.canonical_entity_id,
        value_b: right,
      });
    }
  }
  return conflicts;
}

function scoreCandidate(
  source: SourceProcurement,
  candidate: CanonicalCandidate,
  pncpId: string | null,
  cnpj: string | null,
  sequential: string | null,
): ScoredMatch | null {
  const conflicts = fieldConflicts(source, candidate, source.source_system_id);
  if (pncpId && candidate.numeroControlePNCP) {
    if (compact(pncpId) === compact(candidate.numeroControlePNCP)) {
      return {
        candidate,
        method: "numeroControlePNCP",
        score: 100,
        matched_fields: ["numeroControlePNCP"],
        conflicting_fields: conflicts,
      };
    }
  }

  const candidateCnpj = digits(
    candidate.organization_cnpj ?? candidate.organization_identifier,
  );
  const sourceYear = yearOf(source.year) ?? yearOf(source.opening_at);
  const candidateYear = yearOf(candidate.year) ?? yearOf(candidate.opening_at);
  const candidateSeq = compact(candidate.sequential);
  const sourceSeq = compact(sequential);

  if (
    cnpj &&
    candidateCnpj &&
    cnpj === candidateCnpj &&
    sourceYear &&
    candidateYear &&
    sourceYear === candidateYear &&
    sourceSeq &&
    candidateSeq &&
    sourceSeq === candidateSeq
  ) {
    return {
      candidate,
      method: "cnpj_year_sequential",
      score: 95,
      matched_fields: ["organization_cnpj", "year", "sequential"],
      conflicting_fields: conflicts,
    };
  }

  const processMatch =
    compact(source.process_number) &&
    compact(candidate.process_number) &&
    compact(source.process_number) === compact(candidate.process_number);
  const orgNameMatch =
    compact(source.organization_name) &&
    compact(candidate.organization_name) &&
    compact(source.organization_name) === compact(candidate.organization_name);
  const orgIdMatch =
    digits(source.organization_identifier).length > 0 &&
    candidateCnpj.length > 0 &&
    digits(source.organization_identifier) === candidateCnpj;

  if (processMatch && (orgNameMatch || orgIdMatch)) {
    return {
      candidate,
      method: "process_organization",
      score: 72,
      matched_fields: orgIdMatch
        ? ["process_number", "organization_identifier"]
        : ["process_number", "organization_name"],
      conflicting_fields: conflicts,
    };
  }

  const numberMatch =
    compact(source.procurement_number) &&
    compact(candidate.procurement_number) &&
    compact(source.procurement_number) === compact(candidate.procurement_number);
  const modalityMatch =
    compact(source.modality) &&
    compact(candidate.modality) &&
    compact(source.modality) === compact(candidate.modality);

  if (numberMatch && modalityMatch && sourceYear && candidateYear && sourceYear === candidateYear) {
    return {
      candidate,
      method: "number_modality_year",
      score: 65,
      matched_fields: ["procurement_number", "modality", "year"],
      conflicting_fields: conflicts,
    };
  }

  if (
    source.object &&
    candidate.object &&
    objectOverlap(source.object, candidate.object) >= 0.8 &&
    datesAlign(source, candidate)
  ) {
    return {
      candidate,
      method: "object_dates",
      score: 40,
      matched_fields: ["object", "opening_at"],
      conflicting_fields: conflicts,
    };
  }

  return null;
}

export function statusForMatch(method: MatchMethod, score: number): LinkStatus {
  if (method === "numeroControlePNCP" || method === "cnpj_year_sequential") {
    return "CONFIRMED";
  }
  if (score >= 60) return "PROBABLE";
  if (score > 0) return "REVIEW_REQUIRED";
  return "UNMATCHED";
}

function unmatched(source: SourceProcurement): EntityLinkResult {
  return {
    source_entity_type: "procurement",
    source_external_id: source.external_id,
    canonical_entity_type: "STANDALONE",
    canonical_entity_id: null,
    match_method: "standalone_local",
    match_score: 0,
    status: "UNMATCHED",
    matched_fields: [],
    conflicting_fields: [],
  };
}

/**
 * Local SourceProcurement → PNCP / Compras.gov / unmatched.
 * Only strong identifiers (PNCP control number, CNPJ+year+sequential)
 * become CONFIRMED automatically. Object similarity alone never confirms.
 */
export function resolveProcurement(
  source: SourceProcurement,
  candidates: CanonicalCandidate[],
): EntityLinkResult {
  if (candidates.length === 0) return unmatched(source);

  const pncpId = extractPncpControlNumber(source);
  const cnpj = extractCnpj(source);
  const sequential = extractSequential(source);

  const matches: ScoredMatch[] = [];
  for (const candidate of candidates) {
    const scored = scoreCandidate(source, candidate, pncpId, cnpj, sequential);
    if (scored) matches.push(scored);
  }

  if (matches.length === 0) return unmatched(source);

  matches.sort((a, b) => b.score - a.score);
  const bestScore = matches[0].score;
  const top = matches.filter((row) => row.score === bestScore);
  const uniqueIds = new Set(top.map((row) => row.candidate.canonical_entity_id));

  if (uniqueIds.size > 1) {
    return {
      source_entity_type: "procurement",
      source_external_id: source.external_id,
      canonical_entity_type: top[0].candidate.canonical_entity_type,
      canonical_entity_id: null,
      match_method: top[0].method,
      match_score: bestScore,
      status: "REVIEW_REQUIRED",
      matched_fields: top[0].matched_fields,
      conflicting_fields: top[0].conflicting_fields,
    };
  }

  const winner = top[0];
  return {
    source_entity_type: "procurement",
    source_external_id: source.external_id,
    canonical_entity_type: winner.candidate.canonical_entity_type,
    canonical_entity_id: winner.candidate.canonical_entity_id,
    match_method: winner.method,
    match_score: winner.score,
    status: statusForMatch(winner.method, winner.score),
    matched_fields: winner.matched_fields,
    conflicting_fields: winner.conflicting_fields,
  };
}
