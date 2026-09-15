import { sha256 } from "./hash.ts";

export const CHANGE_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;
export type ChangePriority = (typeof CHANGE_PRIORITIES)[number];

export const CHANGE_PRIORITY_MAP: Record<string, ChangePriority> = {
  deadline: "HIGH",
  proposal_deadline: "HIGH",
  cancellation: "HIGH",
  cancelled: "HIGH",
  suspension: "HIGH",
  suspended: "HIGH",
  reopening: "HIGH",
  status: "HIGH",
  document: "MEDIUM",
  value: "MEDIUM",
  estimated_value: "MEDIUM",
  object: "MEDIUM",
  metadata: "LOW",
  notes: "LOW",
  modality: "LOW",
};

export function changePriority(field: string): ChangePriority {
  return CHANGE_PRIORITY_MAP[field] ?? "LOW";
}

export function shouldAlertForChange(
  priority: ChangePriority,
  minPriority: ChangePriority | null | undefined,
): boolean {
  if (!minPriority) return true;
  const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  return rank[priority] >= rank[minPriority];
}

export function leadClass(hours: number | null): "EARLY" | "SAME_WINDOW" | "LATE" | null {
  if (hours == null || !Number.isFinite(hours)) return null;
  if (hours > 6) return "EARLY";
  if (hours < -6) return "LATE";
  return "SAME_WINDOW";
}

export type AlertRuleMatchInput = {
  eventType: string;
  uf?: string | null;
  municipality?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
  catalogCode?: string | null;
  object?: string | null;
  estimatedValue?: number | null;
  horizon?: string | null;
  earlyKind?: string | null;
  keywords?: string[];
};

export type AlertRuleDef = {
  id: string;
  event_types: string[];
  filters: {
    keyword?: string;
    uf?: string;
    municipality?: string;
    organization_id?: string;
    catalog_code?: string;
    min_value?: number;
    horizon?: string;
    early_only?: boolean;
  };
  min_change_priority?: ChangePriority | null;
};

export function ruleMatchesEvent(rule: AlertRuleDef, input: AlertRuleMatchInput): boolean {
  if (!rule.event_types.includes(input.eventType) && !rule.event_types.includes("*")) {
    return false;
  }
  const f = rule.filters;
  if (f.uf && f.uf !== input.uf) return false;
  if (f.municipality && f.municipality !== input.municipality) return false;
  if (f.organization_id && f.organization_id !== input.organizationId) return false;
  if (f.catalog_code && f.catalog_code !== input.catalogCode) return false;
  if (f.horizon && f.horizon !== input.horizon) return false;
  if (f.early_only && input.horizon !== "EARLY" && input.earlyKind !== "EARLY_MATCHED") {
    return false;
  }
  if (f.min_value != null && (input.estimatedValue == null || input.estimatedValue < f.min_value)) {
    return false;
  }
  if (f.keyword) {
    const needle = f.keyword.toLowerCase();
    const hay = `${input.object ?? ""} ${input.organizationName ?? ""}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  return true;
}

export function alertEventKey(args: {
  ruleId: string;
  entityType: string;
  entityId: string;
  eventType: string;
  distinguishing?: string | null;
}): string {
  return sha256(
    [args.ruleId, args.entityType, args.entityId, args.eventType, args.distinguishing ?? ""].join("|"),
  );
}

export function explainAlertReason(args: {
  ruleName: string;
  filters: AlertRuleDef["filters"];
  eventType: string;
  extra?: Record<string, string | number | null | undefined>;
}): Record<string, unknown> {
  const because: string[] = [`regra “${args.ruleName}”`, `evento ${args.eventType}`];
  if (args.filters.catalog_code) because.push(`CATMAT/CATSER ${args.filters.catalog_code}`);
  if (args.filters.uf) because.push(`UF ${args.filters.uf}`);
  if (args.filters.keyword) because.push(`termo “${args.filters.keyword}”`);
  if (args.filters.min_value) {
    because.push(`valor ≥ ${args.filters.min_value}`);
  }
  if (args.filters.early_only) because.push("oportunidade antecipada");
  if (args.extra) {
    for (const [key, value] of Object.entries(args.extra)) {
      if (value != null && value !== "") because.push(`${key}: ${value}`);
    }
  }
  return {
    because,
    filters: args.filters,
    event_type: args.eventType,
    text: `Você recebeu este alerta porque: ${because.join("; ")}.`,
  };
}
