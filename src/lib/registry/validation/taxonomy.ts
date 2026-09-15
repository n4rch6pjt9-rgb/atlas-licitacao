export const ERROR_CODES = [
  "ENTITY_MATCH_ERROR",
  "CATEGORY_GROUPING_ERROR",
  "PLANNING_LINK_ERROR",
  "STALE_SOURCE",
  "MISSING_IDENTIFIER",
  "SOURCE_CONFLICT",
  "TEMPORAL_LEAKAGE",
  "WINDOW_INSUFFICIENT",
  "SEASONALITY_MISREAD",
  "OBJECT_GROUPING_FALSE",
  "OBJECT_GROUPING_MISS",
  "ORIGIN_CONTAMINATION",
  "ARP_TREATED_AS_BID",
  "PCA_PGC_AUTOMERGE",
  "FORBIDDEN_LANGUAGE",
  "INSUFFICIENT_EVIDENCE",
  "INSUFFICIENT_SAMPLE",
  "ATTENTION_ABSURD",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type ErrorTaxonomyEvent = {
  id: string;
  code: ErrorCode;
  entity_type: string;
  entity_id: string | null;
  notes: string;
  data_origin: string | null;
};

export type FalsePositiveReason =
  | "CATEGORY_GROUPING_ERROR"
  | "OBJECT_GROUPING_FALSE"
  | "ENTITY_MATCH_ERROR"
  | "SEASONALITY_MISREAD"
  | "WINDOW_INSUFFICIENT"
  | "PLANNING_CANCELLED"
  | "INSUFFICIENT_EVIDENCE";

export function classifyRecurrenceFalsePositive(args: {
  signal_level: string;
  median_interval_days: number | null;
  window_days: number;
  grouped_inconsistently: boolean;
  org_unresolved: boolean;
  seasonality: string | null;
}): FalsePositiveReason {
  if (args.org_unresolved) return "ENTITY_MATCH_ERROR";
  if (args.grouped_inconsistently) return "CATEGORY_GROUPING_ERROR";
  if (
    args.median_interval_days != null &&
    args.median_interval_days > args.window_days
  ) {
    return "WINDOW_INSUFFICIENT";
  }
  if (args.seasonality) return "SEASONALITY_MISREAD";
  return "INSUFFICIENT_EVIDENCE";
}

export function errorEvent(args: {
  code: ErrorCode;
  entity_type: string;
  entity_id?: string | null;
  notes: string;
  data_origin?: string | null;
}): ErrorTaxonomyEvent {
  return {
    id: `err_${args.code}_${args.entity_id ?? args.entity_type}`.slice(0, 80),
    code: args.code,
    entity_type: args.entity_type,
    entity_id: args.entity_id ?? null,
    notes: args.notes,
    data_origin: args.data_origin ?? null,
  };
}
