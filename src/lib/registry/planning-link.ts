import { normalizeObject, objectsGroupTogether, tokenJaccard } from "./object-normalize.ts";

export type PlanningCandidate = {
  id: string;
  origin_type: "PCA_PNCP" | "PGC_COMPRASGOV";
  organization_cnpj: string | null;
  year: number | null;
  catalog_code: string | null;
  numero_item_pncp: string | null;
  item_number: string | null;
  object: string | null;
  estimated_value_num: number | null;
};

export type ProcurementCandidate = {
  id: string;
  organization_cnpj: string | null;
  year: number | null;
  catalog_code: string | null;
  numero_item_pncp: string | null;
  object: string | null;
  estimated_value_num: number | null;
};

export type PlanningLinkResult = {
  planning_id: string;
  procurement_id: string | null;
  status: "CONFIRMED" | "PROBABLE" | "REVIEW_REQUIRED" | "UNMATCHED";
  match_method: string;
  match_score: number;
  matched_fields: string[];
};

function digits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

function valueClose(a: number | null, b: number | null): boolean {
  if (a == null || b == null || a <= 0 || b <= 0) return false;
  const ratio = Math.min(a, b) / Math.max(a, b);
  return ratio >= 0.6;
}

/** CONFIRMED exige id oficial PNCP ou CNPJ+ano+código de catálogo. Texto nunca confirma. */
export function hasOfficialPlanningIdentifier(args: {
  match_method: string;
  matched_fields: string[];
}): boolean {
  const fields = new Set(args.matched_fields);
  if (args.match_method === "official_item_id" || fields.has("numero_item_pncp")) return true;
  return (
    args.match_method === "cnpj_year_catalog" &&
    fields.has("catalog_code") &&
    fields.has("organization_cnpj") &&
    fields.has("year")
  );
}

/**
 * Reclassifica CONFIRMED sem identificador oficial.
 * CNPJ+ano+valor+tópico → PROBABLE. Resto → REVIEW_REQUIRED.
 * Objetivo: precisão de CONFIRMED, não quantidade de matches.
 */
export function hardenConfirmedLink(link: PlanningLinkResult): PlanningLinkResult {
  if (link.status !== "CONFIRMED") return link;
  if (hasOfficialPlanningIdentifier(link)) return link;
  const fields = new Set(link.matched_fields);
  const cnpjYearValue =
    fields.has("organization_cnpj") && fields.has("year") && fields.has("value");
  if (cnpjYearValue) {
    return {
      ...link,
      status: "PROBABLE",
      match_method: "demoted_from_confirmed_to_probable",
      match_score: Math.min(link.match_score, 88),
    };
  }
  return {
    ...link,
    status: "REVIEW_REQUIRED",
    match_method: "demoted_from_confirmed_no_official_id",
    match_score: Math.min(link.match_score, 55),
  };
}

export function linkPlanningToProcurement(
  plan: PlanningCandidate,
  procurements: ProcurementCandidate[],
): PlanningLinkResult {
  const planCnpj = digits(plan.organization_cnpj);
  const planNorm = normalizeObject(plan.object);

  let best: PlanningLinkResult = {
    planning_id: plan.id,
    procurement_id: null,
    status: "UNMATCHED",
    match_method: "none",
    match_score: 0,
    matched_fields: [],
  };

  for (const proc of procurements) {
    const matched: string[] = [];
    const procCnpj = digits(proc.organization_cnpj);
    const procNorm = normalizeObject(proc.object);
    const officialId =
      (plan.numero_item_pncp &&
        proc.numero_item_pncp &&
        plan.numero_item_pncp === proc.numero_item_pncp) ||
      (plan.item_number && proc.numero_item_pncp && plan.item_number === proc.numero_item_pncp);

    if (officialId && planCnpj && planCnpj === procCnpj) {
      matched.push("numero_item_pncp", "organization_cnpj");
      return hardenConfirmedLink({
        planning_id: plan.id,
        procurement_id: proc.id,
        status: "CONFIRMED",
        match_method: "official_item_id",
        match_score: 100,
        matched_fields: matched,
      });
    }

    const sameCnpj = planCnpj.length === 14 && planCnpj === procCnpj;
    const sameYear = plan.year != null && plan.year === proc.year;
    const sameCatalog =
      Boolean(plan.catalog_code) && plan.catalog_code === proc.catalog_code;
    const objectScore = tokenJaccard(planNorm.tokens, procNorm.tokens);
    const sameTopic = objectsGroupTogether(planNorm, procNorm);
    const sameValue = valueClose(plan.estimated_value_num, proc.estimated_value_num);

    if (sameCnpj && sameYear && sameCatalog) {
      matched.push("organization_cnpj", "year", "catalog_code");
      if (96 > best.match_score) {
        best = {
          planning_id: plan.id,
          procurement_id: proc.id,
          status: "CONFIRMED",
          match_method: "cnpj_year_catalog",
          match_score: 96,
          matched_fields: matched,
        };
      }
      continue;
    }

    // CNPJ + year + value + same topic (catalog or controlled synonym).
    // Text similarity alone never confirms.
    if (sameCnpj && sameYear && sameValue && (sameCatalog || sameTopic || objectScore >= 0.7)) {
      const fields = ["organization_cnpj", "year", "value"];
      if (sameCatalog) fields.push("catalog_code");
      else fields.push("object");
      if (88 > best.match_score) {
        best = {
          planning_id: plan.id,
          procurement_id: proc.id,
          status: "PROBABLE",
          match_method: sameTopic ? "cnpj_year_synonym_value" : "cnpj_year_object_value",
          match_score: 88,
          matched_fields: fields,
        };
      }
      continue;
    }

    if (sameCnpj && (sameCatalog || objectScore >= 0.6 || sameTopic)) {
      if (55 > best.match_score) {
        best = {
          planning_id: plan.id,
          procurement_id: proc.id,
          status: "REVIEW_REQUIRED",
          match_method: "cnpj_category",
          match_score: 55,
          matched_fields: ["organization_cnpj", sameCatalog ? "catalog_code" : "object"],
        };
      }
    }
  }

  return hardenConfirmedLink(best);
}

export function planningConversion(args: {
  planned: number;
  converted: number;
}): { planned_items: number; converted_to_procurement: number; not_yet_converted: number; conversion_rate: number } {
  const planned = Math.max(0, args.planned);
  const converted = Math.max(0, args.converted);
  return {
    planned_items: planned,
    converted_to_procurement: converted,
    not_yet_converted: Math.max(0, planned - converted),
    conversion_rate: planned === 0 ? 0 : converted / planned,
  };
}
