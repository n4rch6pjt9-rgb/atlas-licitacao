/**
 * PCP publicKey semantics — Milestone 6 gate.
 *
 * Never persist or log a full key. Fingerprint only.
 * A/B may enter connector_config. C/D must not.
 */

import { sha256 } from "./hash.ts";

export const PUBLIC_KEY_SEMANTICS = [
  "PUBLIC_TENANT_IDENTIFIER",
  "PUBLIC_CLIENT_KEY",
  "PRIVATE_CREDENTIAL",
  "UNKNOWN",
] as const;
export type PublicKeySemantics = (typeof PUBLIC_KEY_SEMANTICS)[number];

export const VALUE_CLASSIFICATIONS = ["PUBLIC", "INTERNAL", "SECRET"] as const;
export type ValueClassification = (typeof VALUE_CLASSIFICATIONS)[number];

export const CONNECTOR_READINESS = [
  "LIVE",
  "FIXTURE",
  "CONFIG_PENDING",
  "DEGRADED",
  "AUTH_REQUIRED",
  "CANDIDATE_CONFIG",
] as const;
export type ConnectorReadiness = (typeof CONNECTOR_READINESS)[number];

export const INGESTION_MODES = [
  "LIVE_PUBLIC_API",
  "PUBLIC_EXPORT",
  "PUBLIC_HTML",
  "RECORDED_FIXTURE",
  "MANUAL_FIXTURE",
  "DOCUMENTATION_SAMPLE",
  "UNKNOWN",
] as const;
export type IngestionMode = (typeof INGESTION_MODES)[number];

export const CONFIG_HEALTH = [
  "CONFIG_INVALID",
  "AUTH_SEMANTICS_CHANGED",
  "SOURCE_DEGRADED",
  "UNKNOWN",
] as const;
export type ConfigHealth = (typeof CONFIG_HEALTH)[number];

export type PublicKeyEvidence = {
  inOfficialDocs: boolean;
  docsDescribeAsVerificationKey: boolean;
  docsRequireRequestingAccess: boolean;
  presentInPublicSpaHtmlOrJs: boolean;
  requiredByEndpoint: boolean;
  documentedSampleWorks: boolean;
  buyerPathIdentifiesBuyingUnit: boolean;
  httpAuthErrorWithoutKey: boolean;
};

export type PublicKeyVerdict = {
  semantics: PublicKeySemantics;
  classification: ValueClassification;
  allowedInPublicConnectorConfig: boolean;
  readiness: ConnectorReadiness;
  rationale: string;
  claim: "FATO_VERIFICADO" | "INFERENCIA" | "PENDENTE_DE_VALIDACAO";
};

/** Official apipcp /publico and compras.api /v1 — observed 2026-09-14. */
export const PCP_APIPCP_PUBLICKEY_EVIDENCE: PublicKeyEvidence = {
  inOfficialDocs: true,
  docsDescribeAsVerificationKey: true,
  docsRequireRequestingAccess: true,
  presentInPublicSpaHtmlOrJs: false,
  requiredByEndpoint: true,
  documentedSampleWorks: false,
  buyerPathIdentifiesBuyingUnit: true,
  httpAuthErrorWithoutKey: true,
};

export function classifyPublicKey(evidence: PublicKeyEvidence): PublicKeyVerdict {
  if (evidence.presentInPublicSpaHtmlOrJs && !evidence.httpAuthErrorWithoutKey) {
    return {
      semantics: evidence.buyerPathIdentifiesBuyingUnit
        ? "PUBLIC_TENANT_IDENTIFIER"
        : "PUBLIC_CLIENT_KEY",
      classification: "PUBLIC",
      allowedInPublicConnectorConfig: true,
      readiness: "CANDIDATE_CONFIG",
      rationale:
        "Identificador publicado no frontend público. Candidato a config, não a adapter de marca.",
      claim: "FATO_VERIFICADO",
    };
  }
  if (
    evidence.requiredByEndpoint &&
    evidence.httpAuthErrorWithoutKey &&
    !evidence.presentInPublicSpaHtmlOrJs &&
    !evidence.documentedSampleWorks
  ) {
    return {
      semantics: "PRIVATE_CREDENTIAL",
      classification: "SECRET",
      allowedInPublicConnectorConfig: false,
      readiness: "AUTH_REQUIRED",
      rationale:
        "publicKey é chave de verificação exigida pela API de integração do comprador. Não aparece no HTML/JS da SPA pública. Amostra da documentação retorna erro de autenticação. Não persistir em connector_config de discovery público.",
      claim: "FATO_VERIFICADO",
    };
  }
  if (evidence.requiredByEndpoint && !evidence.presentInPublicSpaHtmlOrJs) {
    return {
      semantics: "UNKNOWN",
      classification: "INTERNAL",
      allowedInPublicConnectorConfig: false,
      readiness: "CONFIG_PENDING",
      rationale: "Semântica ainda não comprovada como identificador público de tenant.",
      claim: "PENDENTE_DE_VALIDACAO",
    };
  }
  return {
    semantics: "UNKNOWN",
    classification: "INTERNAL",
    allowedInPublicConnectorConfig: false,
    readiness: "CONFIG_PENDING",
    rationale: "Evidência insuficiente.",
    claim: "PENDENTE_DE_VALIDACAO",
  };
}

export function fingerprintKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return sha256(trimmed).slice(0, 16);
}

export function redactKey(url: string): string {
  return url.replace(/([?&]publicKey=)[^&]*/gi, "$1[redacted]");
}

export function classifyAuthError(status: number, bodyText: string): ConfigHealth {
  const text = bodyText.toLowerCase();
  if (status === 400 && /autentic/i.test(text)) return "CONFIG_INVALID";
  if (status === 401 || status === 403) return "AUTH_SEMANTICS_CHANGED";
  if (status >= 500) return "SOURCE_DEGRADED";
  return "UNKNOWN";
}

export function mayPersistPublicKey(
  verdict: PublicKeyVerdict,
  classification: ValueClassification,
): boolean {
  return (
    verdict.allowedInPublicConnectorConfig &&
    classification === "PUBLIC" &&
    (verdict.semantics === "PUBLIC_TENANT_IDENTIFIER" ||
      verdict.semantics === "PUBLIC_CLIENT_KEY")
  );
}
