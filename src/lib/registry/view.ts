import { claimFromEvidence } from "./format";
import { asEnum } from "./json";
import type { SourceListItem } from "./models";
import {
  CLASSIFICATION_STATES,
  CONNECTOR_TYPES,
  EVIDENCE_LEVELS,
  FUNCTIONAL_FAMILIES,
  TECHNOLOGY_FAMILIES,
  type ClaimKind,
  type ClassificationState,
  type ConnectorType,
  type EvidenceLevel,
  type FunctionalFamily,
  type TechnologyFamily,
} from "./types";

export function asTechFamily(value: unknown): TechnologyFamily {
  return asEnum(value, TECHNOLOGY_FAMILIES, "UNKNOWN");
}

export function asFunctionalFamily(value: unknown): FunctionalFamily {
  return asEnum(value, FUNCTIONAL_FAMILIES, "UNKNOWN");
}

export function asEvidence(value: unknown): EvidenceLevel {
  return asEnum(value, EVIDENCE_LEVELS, "UNKNOWN");
}

export function asConnector(value: unknown): ConnectorType {
  return asEnum(value, CONNECTOR_TYPES, "NONE");
}

export function asState(value: unknown): ClassificationState {
  return asEnum(value, CLASSIFICATION_STATES, "DISCOVERED");
}

export function sourceClaim(source: Pick<SourceListItem, "vendor_evidence_level">): ClaimKind {
  return claimFromEvidence(asEvidence(source.vendor_evidence_level));
}

export function matchesFilters(
  source: SourceListItem,
  filters: {
    q?: string;
    uf?: string;
    family?: string;
    evidence?: string;
    state?: string;
  },
): boolean {
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    const hay = `${source.name} ${source.slug} ${source.base_url ?? ""} ${source.jurisdiction_name ?? ""}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (filters.uf && source.jurisdiction_uf !== filters.uf) return false;
  if (filters.family && source.technology_family !== filters.family) return false;
  if (filters.evidence && source.vendor_evidence_level !== filters.evidence) return false;
  if (filters.state && source.classification_state !== filters.state) return false;
  return true;
}

export function discoverMessage(result: unknown): string {
  if (!result || typeof result !== "object") return "Descoberta concluída.";
  const rec = result as Record<string, unknown>;
  if (typeof rec.error === "string" && rec.error) {
    if (/erro de configuração/i.test(rec.error) || /HTTP 400/.test(rec.error)) {
      return rec.error;
    }
    return rec.error;
  }
  if (typeof rec.message === "string" && rec.message) return rec.message;
  if (typeof rec.detail === "string" && rec.detail) return rec.detail;
  return "Descoberta concluída.";
}

export function fingerprintMessage(result: {
  candidate_family: string | null;
  technology_family: string | null;
  score: number;
  status: string;
  error: string | null;
}): string {
  if (result.error) return result.error;
  const family = result.technology_family ?? result.candidate_family ?? "UNKNOWN";
  return `${result.status}: ${family} · score ${result.score}`;
}
