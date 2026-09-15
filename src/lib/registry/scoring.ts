import type { EvidenceLevel, EvidenceType } from "./types";

/**
 * Configurable scoring weights. Do not scatter magic numbers in classifiers.
 * Calibrate empirically; this is the initial table from the engineering spec.
 */
export const SCORE_WEIGHTS = {
  OFFICIAL_DOCUMENT: 100,
  PUBLIC_CONTRACT: 100,
  OFFICIAL_MANUAL: 90,
  VENDOR_REFERENCE: 80,
  ROUTE_SIGNATURE: 40,
  JSON_SCHEMA: 35,
  ASSET_NAMESPACE: 35,
  HTML_SIGNATURE: 35,
  JS_ASSET: 25,
  FORM_ACTION: 20,
  HTTP_HEADER: 10,
  COOKIE: 5,
  GENERIC_FRAMEWORK: 5,
  VISUAL_SIMILARITY: 1,
  ROBOTS: 3,
  SITEMAP: 3,
  OTHER: 2,
} as const;

export type ScoreWeightKey = keyof typeof SCORE_WEIGHTS;

export const EVIDENCE_TYPE_WEIGHT: Record<EvidenceType, number> = {
  OFFICIAL_DOCUMENT: SCORE_WEIGHTS.OFFICIAL_DOCUMENT,
  PUBLIC_CONTRACT: SCORE_WEIGHTS.PUBLIC_CONTRACT,
  OFFICIAL_MANUAL: SCORE_WEIGHTS.OFFICIAL_MANUAL,
  VENDOR_REFERENCE: SCORE_WEIGHTS.VENDOR_REFERENCE,
  HTML_SIGNATURE: SCORE_WEIGHTS.HTML_SIGNATURE,
  JS_ASSET: SCORE_WEIGHTS.JS_ASSET,
  HTTP_HEADER: SCORE_WEIGHTS.HTTP_HEADER,
  COOKIE: SCORE_WEIGHTS.COOKIE,
  ROUTE_SIGNATURE: SCORE_WEIGHTS.ROUTE_SIGNATURE,
  JSON_SCHEMA: SCORE_WEIGHTS.JSON_SCHEMA,
  FORM_ACTION: SCORE_WEIGHTS.FORM_ACTION,
  ROBOTS: SCORE_WEIGHTS.ROBOTS,
  SITEMAP: SCORE_WEIGHTS.SITEMAP,
  OTHER: SCORE_WEIGHTS.OTHER,
};

export const LEVEL_THRESHOLDS = {
  VERIFIED: 100,
  STRONG_INDICATION: 70,
  WEAK_INDICATION: 30,
} as const;

export function evidenceLevelFromScore(score: number): EvidenceLevel {
  if (score >= LEVEL_THRESHOLDS.VERIFIED) return "VERIFIED";
  if (score >= LEVEL_THRESHOLDS.STRONG_INDICATION) return "STRONG_INDICATION";
  if (score >= LEVEL_THRESHOLDS.WEAK_INDICATION) return "WEAK_INDICATION";
  return "UNKNOWN";
}

export function confidenceFromScore(score: number): number {
  const capped = Math.max(0, Math.min(score, 120));
  return Math.round((capped / 120) * 1000) / 1000;
}

export function weightForEvidenceType(type: EvidenceType): number {
  return EVIDENCE_TYPE_WEIGHT[type] ?? SCORE_WEIGHTS.OTHER;
}
