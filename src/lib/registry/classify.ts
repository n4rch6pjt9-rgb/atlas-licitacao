import {
  FRAMEWORK_FAMILIES,
  VENDOR_FAMILIES,
  type ClassificationResult,
  type ClaimKind,
  type EvidenceInput,
  type EvidenceLevel,
  type FingerprintSignature,
  type Observation,
  type SignatureMatch,
  type TechnologyFamily,
} from "./types.ts";
import {
  confidenceFromScore,
  evidenceLevelFromScore,
  SCORE_WEIGHTS,
  weightForEvidenceType,
} from "./scoring.ts";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function observationMatches(
  observation: Observation,
  signature: FingerprintSignature,
): boolean {
  const pattern = signature.pattern;
  const haystack = [
    observation.value,
    observation.key,
    observation.observation_type,
  ]
    .filter(Boolean)
    .join(" ");
  const nHay = normalize(haystack);
  const nPat = normalize(pattern);

  if (signature.signature_type === "COOKIE_NAME") {
    return normalize(observation.key) === "cookie_name" ||
      observation.observation_type === "COOKIE_NAME"
      ? normalize(observation.value) === nPat || nHay.includes(nPat)
      : false;
  }
  if (signature.signature_type === "PAGE_SUFFIX") {
    return nHay.includes(nPat);
  }
  if (nPat.startsWith("/") || nPat.startsWith(".")) {
    return nHay.includes(nPat);
  }
  try {
    return new RegExp(pattern, "i").test(haystack);
  } catch {
    return nHay.includes(nPat);
  }
}

export function matchSignatures(
  observations: Observation[],
  signatures: FingerprintSignature[],
): SignatureMatch[] {
  return signatures.map((signature) => {
    const hit = observations.find((obs) => observationMatches(obs, signature));
    return {
      signature,
      matched: Boolean(hit),
      score: hit ? signature.weight : 0,
      observed_value: hit ? hit.value : null,
    };
  });
}

function bestFamily(
  matches: SignatureMatch[],
  allowed: Set<TechnologyFamily> | null,
): { family: TechnologyFamily; score: number } {
  const scores = new Map<TechnologyFamily, number>();
  for (const match of matches) {
    if (!match.matched) continue;
    const family = match.signature.technology_family;
    if (allowed && !allowed.has(family)) continue;
    scores.set(family, (scores.get(family) ?? 0) + match.score);
  }
  let family: TechnologyFamily = "UNKNOWN";
  let score = 0;
  for (const [candidate, value] of scores) {
    if (value > score) {
      family = candidate;
      score = value;
    }
  }
  return { family, score };
}

function vendorFromEvidence(evidence: EvidenceInput[]): {
  vendor_name: string | null;
  product_name: string | null;
  family: TechnologyFamily | null;
  score: number;
} {
  let score = 0;
  let vendor_name: string | null = null;
  let product_name: string | null = null;
  let family: TechnologyFamily | null = null;
  for (const item of evidence) {
    score += weightForEvidenceType(item.evidence_type);
    const blob = `${item.title} ${item.description ?? ""} ${item.observed_value ?? ""}`;
    const parsed = parseVendorMention(blob);
    if (parsed.family) family = parsed.family;
    if (parsed.vendor_name) vendor_name = parsed.vendor_name;
    if (parsed.product_name) product_name = parsed.product_name;
  }
  return { vendor_name, product_name, family, score };
}

const VENDOR_ALIASES: Array<{
  family: TechnologyFamily;
  vendor_name: string;
  product_name: string;
  patterns: RegExp[];
}> = [
  {
    family: "PARADIGMA_WBC",
    vendor_name: "Paradigma",
    product_name: "WBC",
    patterns: [/paradigma/i, /\bwbc\b/i],
  },
  {
    family: "SCPI_FIORILLI",
    vendor_name: "Fiorilli",
    product_name: "SCPI",
    patterns: [/fiorilli/i, /\bscpi\b/i],
  },
  {
    family: "LICITAR_DIGITAL",
    vendor_name: "Licitar Digital",
    product_name: "Licitar Digital",
    patterns: [/licitar\s*digital/i],
  },
  {
    family: "PORTAL_COMPRAS_PUBLICAS",
    vendor_name: "eCustomize",
    product_name: "Portal de Compras Públicas",
    patterns: [/portal de compras p[uú]blicas/i, /ecustomize/i],
  },
  {
    family: "LICITANET",
    vendor_name: "Licitanet",
    product_name: "Licitanet",
    patterns: [/licitanet/i],
  },
  {
    family: "BLL",
    vendor_name: "BLL",
    product_name: "Lance Eletrônico",
    patterns: [/\bbll\b/i, /bolsa de licita[cç][oõ]es/i],
  },
  {
    family: "BNC",
    vendor_name: "BNC",
    product_name: "BNC Compras",
    patterns: [/\bbnc\b/i, /bolsa nacional de compras/i],
  },
  {
    family: "BBMNET",
    vendor_name: "Bolsa Brasileira de Mercadorias",
    product_name: "BBMNET Licitações",
    patterns: [/bbmnet/i, /bolsa brasileira de mercadorias/i],
  },
  {
    family: "COMPRASBR",
    vendor_name: "A Z Informática",
    product_name: "Pregão Eletrônico SIGA / ComprasBR",
    patterns: [/comprasbr/i, /a z inform[aá]tica/i],
  },
  {
    family: "BANCO_DO_BRASIL",
    vendor_name: "Banco do Brasil",
    product_name: "Licitações-e",
    patterns: [/licita[cç][oõ]es-e/i, /licitacoes-e/i],
  },
];

export function parseVendorMention(text: string): {
  family: TechnologyFamily | null;
  vendor_name: string | null;
  product_name: string | null;
} {
  for (const alias of VENDOR_ALIASES) {
    if (alias.patterns.some((re) => re.test(text))) {
      return {
        family: alias.family,
        vendor_name: alias.vendor_name,
        product_name: alias.product_name,
      };
    }
  }
  return { family: null, vendor_name: null, product_name: null };
}

function claimKindFor(
  level: EvidenceLevel,
  family: TechnologyFamily,
): ClaimKind {
  if (level === "VERIFIED") return "FATO_VERIFICADO";
  if (family === "UNKNOWN") return "PENDENTE_DE_VALIDACAO";
  if (FRAMEWORK_FAMILIES.has(family)) {
    return "INFERENCIA";
  }
  if (level === "STRONG_INDICATION") return "INFERENCIA";
  return "PENDENTE_DE_VALIDACAO";
}

export type ClassifyInput = {
  observations: Observation[];
  signatures: FingerprintSignature[];
  evidence?: EvidenceInput[];
  currentVendorFamily?: TechnologyFamily | null;
};

/**
 * Observations → matches → candidate family → score → classification.
 * Framework markers never prove a commercial vendor.
 */
export function classifySource(input: ClassifyInput): ClassificationResult {
  const evidence = input.evidence ?? [];
  const matches = matchSignatures(input.observations, input.signatures);

  const framework = bestFamily(matches, FRAMEWORK_FAMILIES);
  const vendorSig = bestFamily(matches, VENDOR_FAMILIES);
  const fromEvidence = vendorFromEvidence(evidence);

  const framework_score = framework.score;
  const vendor_score = fromEvidence.score + vendorSig.score;
  const score = Math.max(framework_score, vendor_score);

  let technology_family: TechnologyFamily = "UNKNOWN";
  let candidate_family: TechnologyFamily = framework.family;
  let vendor_name: string | null = null;
  let product_name: string | null = null;
  let conflict = false;
  let conflict_reason: string | null = null;

  const evidenceLevelVendor = evidenceLevelFromScore(fromEvidence.score);

  if (
    fromEvidence.family &&
    (evidenceLevelVendor === "VERIFIED" ||
      evidenceLevelVendor === "STRONG_INDICATION")
  ) {
    technology_family = fromEvidence.family;
    candidate_family = fromEvidence.family;
    vendor_name = fromEvidence.vendor_name;
    product_name = fromEvidence.product_name;
  } else if (vendorSig.family !== "UNKNOWN" && vendorSig.score >= SCORE_WEIGHTS.ROUTE_SIGNATURE) {
    technology_family = vendorSig.family;
    candidate_family = vendorSig.family;
  } else if (framework.family !== "UNKNOWN") {
    technology_family = framework.family;
    candidate_family = framework.family;
  }

  if (
    fromEvidence.family &&
    vendorSig.family !== "UNKNOWN" &&
    fromEvidence.family !== vendorSig.family &&
    evidenceLevelVendor === "VERIFIED"
  ) {
    conflict = true;
    conflict_reason = `Documento oficial indica ${fromEvidence.family}, fingerprint técnico indica ${vendorSig.family}`;
    technology_family = fromEvidence.family;
    candidate_family = fromEvidence.family;
  }

  if (
    input.currentVendorFamily &&
    VENDOR_FAMILIES.has(input.currentVendorFamily) &&
    fromEvidence.family &&
    fromEvidence.family !== input.currentVendorFamily &&
    evidenceLevelVendor === "VERIFIED"
  ) {
    // Official replacement — not a silent overwrite; caller records history.
    vendor_name = fromEvidence.vendor_name;
    product_name = fromEvidence.product_name;
    technology_family = fromEvidence.family;
  }

  const evidence_level = fromEvidence.family
    ? evidenceLevelFromScore(fromEvidence.score)
    : evidenceLevelFromScore(
        VENDOR_FAMILIES.has(technology_family) ? vendor_score : framework_score,
      );

  if (FRAMEWORK_FAMILIES.has(technology_family) && !fromEvidence.family) {
    vendor_name = null;
    product_name = null;
  }

  return {
    candidate_family,
    technology_family,
    vendor_name,
    product_name,
    evidence_level,
    confidence: confidenceFromScore(
      fromEvidence.family ? fromEvidence.score : framework_score,
    ),
    score,
    vendor_score,
    framework_score,
    conflict,
    conflict_reason,
    claim_kind: claimKindFor(evidence_level, technology_family),
    matches,
  };
}

export function isVendorFamily(family: TechnologyFamily): boolean {
  return VENDOR_FAMILIES.has(family);
}

export function isFrameworkFamily(family: TechnologyFamily): boolean {
  return FRAMEWORK_FAMILIES.has(family);
}
