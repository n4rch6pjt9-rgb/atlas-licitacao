import { normalizeObject, objectsGroupTogether, tokenJaccard } from "../object-normalize.ts";

export type PlanningSide = {
  id: string;
  origin_type: "PCA_PNCP" | "PGC_COMPRASGOV";
  organization_cnpj: string | null;
  year: number | null;
  catalog_code: string | null;
  numero_item_pncp: string | null;
  object: string | null;
  estimated_value_num: number | null;
  uasg?: string | null;
};

export type PcaPgcStatus = "CONFIRMED" | "PROBABLE" | "REVIEW_REQUIRED" | "UNRELATED";

export type PcaPgcRelation = {
  pca_planning_id: string;
  pgc_planning_id: string;
  status: PcaPgcStatus;
  match_method: string;
  match_score: number;
  matched_fields: string[];
  auto_merged: false;
};

function digits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

/**
 * PCA ≠ PGC. Never auto-merge into a single planning record.
 * A relation is evidence, not identity.
 */
export function relatePcaPgc(pca: PlanningSide, pgc: PlanningSide): PcaPgcRelation {
  const pcaCnpj = digits(pca.organization_cnpj);
  const pgcCnpj = digits(pgc.organization_cnpj);
  const matched: string[] = [];
  const sameCnpj = pcaCnpj.length === 14 && pcaCnpj === pgcCnpj;
  const sameYear = pca.year != null && pca.year === pgc.year;
  const sameCatalog = Boolean(pca.catalog_code) && pca.catalog_code === pgc.catalog_code;
  const official =
    pca.numero_item_pncp && pgc.numero_item_pncp && pca.numero_item_pncp === pgc.numero_item_pncp;

  if (official && sameCnpj) {
    return {
      pca_planning_id: pca.id,
      pgc_planning_id: pgc.id,
      status: "CONFIRMED",
      match_method: "official_item_id",
      match_score: 100,
      matched_fields: ["numero_item_pncp", "organization_cnpj"],
      auto_merged: false,
    };
  }

  if (sameCnpj && sameYear && sameCatalog) {
    return {
      pca_planning_id: pca.id,
      pgc_planning_id: pgc.id,
      status: "PROBABLE",
      match_method: "cnpj_year_catalog",
      match_score: 80,
      matched_fields: ["organization_cnpj", "year", "catalog_code"],
      auto_merged: false,
    };
  }

  const pcaNorm = normalizeObject(pca.object);
  const pgcNorm = normalizeObject(pgc.object);
  const similar = objectsGroupTogether(pcaNorm, pgcNorm) || tokenJaccard(pcaNorm.tokens, pgcNorm.tokens) >= 0.6;
  if (sameCnpj && sameYear && similar) {
    return {
      pca_planning_id: pca.id,
      pgc_planning_id: pgc.id,
      status: "REVIEW_REQUIRED",
      match_method: "cnpj_year_object",
      match_score: 55,
      matched_fields: ["organization_cnpj", "year", "object"],
      auto_merged: false,
    };
  }

  if (sameCnpj) matched.push("organization_cnpj");
  return {
    pca_planning_id: pca.id,
    pgc_planning_id: pgc.id,
    status: "UNRELATED",
    match_method: "none",
    match_score: matched.length ? 20 : 0,
    matched_fields: matched,
    auto_merged: false,
  };
}

export function relateAll(pcaRows: PlanningSide[], pgcRows: PlanningSide[]): PcaPgcRelation[] {
  const out: PcaPgcRelation[] = [];
  for (const pca of pcaRows) {
    if (pca.origin_type !== "PCA_PNCP") continue;
    let best: PcaPgcRelation | null = null;
    for (const pgc of pgcRows) {
      if (pgc.origin_type !== "PGC_COMPRASGOV") continue;
      const rel = relatePcaPgc(pca, pgc);
      if (!best || rel.match_score > best.match_score) best = rel;
    }
    if (best && best.status !== "UNRELATED") out.push(best);
  }
  return out;
}

export type ObjectPairAudit = {
  left: string;
  right: string;
  grouped: boolean;
  expected: boolean;
  error: "OBJECT_GROUPING_FALSE" | "OBJECT_GROUPING_MISS" | null;
};

export function auditObjectPair(left: string, right: string, expectedTogether: boolean): ObjectPairAudit {
  const grouped = objectsGroupTogether(normalizeObject(left), normalizeObject(right));
  let error: ObjectPairAudit["error"] = null;
  if (grouped && !expectedTogether) error = "OBJECT_GROUPING_FALSE";
  if (!grouped && expectedTogether) error = "OBJECT_GROUPING_MISS";
  return { left, right, grouped, expected: expectedTogether, error };
}
