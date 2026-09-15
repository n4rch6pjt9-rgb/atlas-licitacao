import {
  FRAMEWORK_FAMILIES,
  VENDOR_FAMILIES,
  type ConnectorType,
  type EvidenceLevel,
  type TechnologyFamily,
} from "./types.ts";

export type FamilyCandidateInput = {
  id: string;
  technology_family: string | null;
  vendor_name: string | null;
  product_name: string | null;
  vendor_evidence_level: string | null;
  connector_type: string | null;
  classification_state: string | null;
};

export type FamilyAdapterVerdict = "GO" | "NO-GO";

export type FamilyCandidate = {
  technology_family: TechnologyFamily;
  vendor_name: string | null;
  product_name: string | null;
  verified_sources: number;
  strong_sources: number;
  weak_sources: number;
  unknown_sources: number;
  source_count: number;
  source_ids: string[];
  connector_types: string[];
  adapter_candidate: ConnectorType | null;
  technical_matches: number;
  shared_signatures: string[];
  commercial_adapter: FamilyAdapterVerdict;
  generic_reuse: FamilyAdapterVerdict;
  confidence: number;
  rationale: string;
  claim_kind: "FATO_VERIFICADO" | "INFERENCIA" | "PENDENTE_DE_VALIDACAO";
};

const GENERIC_ADAPTERS = new Set<string>([
  "GENERIC_JSON",
  "GENERIC_ACTION",
  "GENERIC_JSF",
]);

function asFamily(value: string | null): TechnologyFamily {
  return (value as TechnologyFamily) || "UNKNOWN";
}

function levelOf(value: string | null): EvidenceLevel {
  if (value === "VERIFIED" || value === "STRONG_INDICATION" || value === "WEAK_INDICATION") {
    return value;
  }
  return "UNKNOWN";
}

function isGenericConnector(value: string | null): boolean {
  return Boolean(value && GENERIC_ADAPTERS.has(value));
}

/**
 * Census view: commercial family candidates from registered sources.
 * Does not invent vendors. A vendor-named adapter is GO only when the
 * generic adapter is full of municipality forks — that has not happened.
 */
export function buildFamilyCandidates(
  sources: FamilyCandidateInput[],
): FamilyCandidate[] {
  const byFamily = new Map<TechnologyFamily, FamilyCandidateInput[]>();
  for (const source of sources) {
    const family = asFamily(source.technology_family);
    const list = byFamily.get(family) ?? [];
    list.push(source);
    byFamily.set(family, list);
  }

  const rows: FamilyCandidate[] = [];
  for (const [family, list] of byFamily) {
    if (family === "UNKNOWN") continue;
    const verified = list.filter((row) => levelOf(row.vendor_evidence_level) === "VERIFIED");
    const strong = list.filter(
      (row) => levelOf(row.vendor_evidence_level) === "STRONG_INDICATION",
    );
    const weak = list.filter((row) => levelOf(row.vendor_evidence_level) === "WEAK_INDICATION");
    const unknown = list.filter((row) => levelOf(row.vendor_evidence_level) === "UNKNOWN");
    const connectors = [
      ...new Set(
        list
          .map((row) => row.connector_type)
          .filter((value): value is string => Boolean(value) && value !== "NONE"),
      ),
    ];
    const adapter_candidate = (connectors[0] as ConnectorType | undefined) ?? null;
    const genericReady = list.filter(
      (row) =>
        isGenericConnector(row.connector_type) &&
        (row.classification_state === "ADAPTER_READY" ||
          row.classification_state === "INGESTING"),
    );
    const technical_matches = genericReady.length;
    const isVendor = VENDOR_FAMILIES.has(family);
    const isFramework = FRAMEWORK_FAMILIES.has(family);

    let commercial_adapter: FamilyAdapterVerdict = "NO-GO";
    let generic_reuse: FamilyAdapterVerdict = "NO-GO";
    let rationale: string;
    let claim_kind: FamilyCandidate["claim_kind"] = "PENDENTE_DE_VALIDACAO";

    if (isFramework) {
      generic_reuse = genericReady.length >= 1 ? "GO" : "NO-GO";
      rationale =
        "Família de framework. Nunca vira adapter comercial. Reuso do adapter genérico quando houver config por fonte.";
      claim_kind = "INFERENCIA";
    } else if (!isVendor) {
      generic_reuse = genericReady.length >= 1 ? "GO" : "NO-GO";
      rationale =
        "Família nacional ou sistema próprio. Adapter comercial de fornecedor não se aplica.";
      claim_kind = verified.length > 0 ? "FATO_VERIFICADO" : "INFERENCIA";
    } else if (verified.length >= 5 && genericReady.length >= 5) {
      generic_reuse = "GO";
      commercial_adapter = "NO-GO";
      rationale =
        "Cinco ou mais fontes VERIFIED no mesmo contrato técnico público, configs distintas, adapter genérico sem forks por município. Não criar adapter de fornecedor.";
      claim_kind = "FATO_VERIFICADO";
    } else if (verified.length >= 5) {
      commercial_adapter = "NO-GO";
      generic_reuse = "NO-GO";
      rationale =
        "Família comercial com ≥5 fontes VERIFIED. Contrato técnico público ainda não está no adapter genérico (ou o genérico não foi exercitado). Não criar adapter de fornecedor até o genérico ficar cheio de exceções.";
      claim_kind = "INFERENCIA";
    } else if (genericReady.length >= 5 && verified.length >= 1) {
      generic_reuse = "GO";
      commercial_adapter = "NO-GO";
      rationale =
        "Cinco ou mais fontes no mesmo adapter genérico. Evidência comercial ainda abaixo de cinco VERIFIED para chamar o reuso de fato pleno.";
      claim_kind = "INFERENCIA";
    } else if (verified.length >= 1) {
      rationale =
        "Família comercial com evidência oficial, mas ainda sem cinco fontes no mesmo contrato técnico público reutilizável.";
      claim_kind = "INFERENCIA";
    } else {
      rationale =
        "Censo pendente. Sem evidência oficial suficiente para adapter comercial ou reuso comprovado.";
    }

    const confidence = Math.min(
      1,
      verified.length * 0.16 +
        strong.length * 0.06 +
        (genericReady.length >= 5 ? 0.2 : 0) +
        (list.length >= 5 ? 0.1 : 0),
    );

    rows.push({
      technology_family: family,
      vendor_name: list.find((row) => row.vendor_name)?.vendor_name ?? null,
      product_name: list.find((row) => row.product_name)?.product_name ?? null,
      verified_sources: verified.length,
      strong_sources: strong.length,
      weak_sources: weak.length,
      unknown_sources: unknown.length,
      source_count: list.length,
      source_ids: list.map((row) => row.id),
      connector_types: connectors,
      adapter_candidate: adapter_candidate === "NONE" ? null : adapter_candidate,
      technical_matches,
      shared_signatures: connectors,
      commercial_adapter,
      generic_reuse,
      confidence: Math.round(confidence * 1000) / 1000,
      rationale,
      claim_kind,
    });
  }

  return rows.sort((a, b) => {
    if (b.verified_sources !== a.verified_sources) return b.verified_sources - a.verified_sources;
    if (b.source_count !== a.source_count) return b.source_count - a.source_count;
    return a.technology_family.localeCompare(b.technology_family);
  });
}

export function schemaSimilarity(
  pathsA: string[],
  pathsB: string[],
): { intersection: number; union: number; jaccard: number } {
  const a = new Set(pathsA);
  const b = new Set(pathsB);
  let intersection = 0;
  for (const path of a) if (b.has(path)) intersection += 1;
  const union = new Set([...a, ...b]).size;
  return {
    intersection,
    union,
    jaccard: union === 0 ? 0 : Math.round((intersection / union) * 1000) / 1000,
  };
}

export function pickReuseFamily(candidates: FamilyCandidate[]): FamilyCandidate | null {
  return (
    candidates.find(
      (row) =>
        row.generic_reuse === "GO" &&
        row.verified_sources >= 5 &&
        VENDOR_FAMILIES.has(row.technology_family),
    ) ??
    candidates.find((row) => row.generic_reuse === "GO" && VENDOR_FAMILIES.has(row.technology_family)) ??
    null
  );
}
