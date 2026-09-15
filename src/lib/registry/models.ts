import type { Json, JsonObject } from "./json";
import type {
  ClassificationState,
  ConnectorType,
  EvidenceLevel,
  TechnologyFamily,
} from "./types";

export type { Json, JsonObject };

export type SourceListItem = {
  id: string;
  jurisdiction_id: string;
  jurisdiction_name: string | null;
  jurisdiction_uf: string | null;
  name: string;
  slug: string;
  base_url: string | null;
  functional_family: string | null;
  technology_family: string | null;
  vendor_name: string | null;
  product_name: string | null;
  vendor_evidence_level: string | null;
  vendor_confidence: number | null;
  public_access: boolean;
  active: boolean;
  pncp_overlap: boolean;
  comprasgov_overlap: boolean;
  discovery_strategy: string | null;
  connector_type: string | null;
  connector_version: string | null;
  classification_state: string | null;
  first_seen_at: string | null;
  last_verified_at: string | null;
  notes: string | null;
};

export type FamilyCount = {
  family: string;
  count: number;
  adapter_ready_count: number;
  verified_count: number;
  connector_types: string[];
};

export type RegistryMetrics = {
  sources_total: number;
  sources_verified: number;
  sources_unknown_family: number;
  sources_by_family: Array<{ family: string; count: number }>;
  adapter_reuse_ratio: number;
  jurisdictions_covered: number;
  sources_with_public_api: number;
};

export type RegistryStats = RegistryMetrics;

export type SourceDetail = SourceListItem & {
  capabilities: JsonObject[];
  endpoints: JsonObject[];
  evidence: JsonObject[];
  observations: JsonObject[];
  last_run: JsonObject | null;
  last_run_matches: JsonObject[];
  history: JsonObject[];
  connector_config: JsonObject | null;
  health: JsonObject[];
  alerts: JsonObject[];
  relationships: JsonObject[];
  rate_policy: JsonObject | null;
  channels: DiscoveryChannelRow[];
};

export type DiscoveryChannelRow = {
  id: string;
  source_system_id: string;
  channel_type: string;
  label: string;
  list_url: string | null;
  detail_url_pattern: string | null;
  connector_type: string | null;
  readiness: string;
  ingest_status: string;
  captcha_constraint: string | null;
  notes: string | null;
  claim_kind: string;
  data_origin: string;
  last_success_at: string | null;
};

export type SourceListFilters = {
  q?: string;
  uf?: string;
  family?: TechnologyFamily | string;
  evidence?: EvidenceLevel | string;
  state?: ClassificationState | string;
};

export type FamilySummary = FamilyCount & {
  adapter: ConnectorType | null;
  census_pending: boolean;
};

export type AlertRecord = {
  id: string;
  alert_type: string;
  title: string;
  message: string;
  detail: string | null;
  source_system_id: string | null;
  source_name: string | null;
  created_at: string;
  claim_kind: string;
};

export type JurisdictionRecord = {
  id: string;
  type: string;
  ibge_code: string | null;
  uf: string | null;
  name: string;
  cnpj: string | null;
  parent_id: string | null;
  active: boolean;
};

export type MatrixCell = {
  present: boolean;
};

export type CapabilityMatrixRow = {
  source_id: string;
  source_name: string;
  cells: Record<string, MatrixCell>;
};

export type CapabilityMatrix = {
  capabilities: string[];
  rows: CapabilityMatrixRow[];
};

export type FamilyCandidateRow = {
  technology_family: string;
  vendor_name: string | null;
  product_name: string | null;
  verified_sources: number;
  strong_sources: number;
  weak_sources: number;
  unknown_sources: number;
  source_count: number;
  source_ids: string[];
  connector_types: string[];
  adapter_candidate: string | null;
  technical_matches: number;
  shared_signatures: string[];
  commercial_adapter: "GO" | "NO-GO";
  generic_reuse: "GO" | "NO-GO";
  confidence: number;
  rationale: string;
  claim_kind: string;
};

export type Milestone3Metrics = {
  families_verified: number;
  sources_per_family: Array<{ family: string; count: number; verified: number }>;
  adapter_reuse_ratio: number;
  sources_per_adapter: Array<{ adapter: string; count: number }>;
  vendor_confidence_distribution: Array<{ level: string; count: number }>;
  schema_similarity: Array<{
    left_id: string;
    right_id: string;
    jaccard: number;
    same_hash: boolean;
    note: string;
  }>;
  pncp_overlap_sources: number;
  pncp_overlap_ratio: number;
  local_only_records: number;
  historical_vendor_changes: number;
  commercial_adapter_verdict: "GO" | "NO-GO";
  generic_reuse_verdict: "GO" | "NO-GO";
  chosen_family: string | null;
  chosen_adapter: string | null;
};

export type CensusRow = {
  source_id: string;
  ente: string;
  uf: string | null;
  portal: string | null;
  sistema: string | null;
  vendor: string | null;
  product: string | null;
  period: string;
  evidence_level: string;
  url: string | null;
  claim_kind: string;
  technology_family: string;
  connector_type: string | null;
};

export type FamilyPriorityRow = {
  family: string;
  verified_entities: number;
  records_local: number;
  pncp_overlap_ratio: number;
  local_only: number;
  median_lead_time_hours: number | null;
  adapter: string | null;
  generic_reuse: "GO" | "NO-GO";
  commercial_adapter: "GO" | "NO-GO";
  public_access_quality: number;
  priority_score: number;
  rationale: string;
};

export type PriorityComponentMap = {
  coverage_gap: number;
  estimated_volume: number;
  lead_time: number;
  technical_reuse: number;
  source_reliability: number;
  evidence_confidence: number;
  public_access: number;
  historical_depth: number;
  maintenance_risk_inverted: number;
  integration_cost_inverted: number;
};

export type FamilyRankRow = {
  family: string;
  rank: number;
  verified_entities: number;
  records_local: number;
  pncp_overlap_ratio: number;
  comprasgov_overlap_ratio: number;
  local_only: number;
  median_lead_time_hours: number | null;
  adapter_fit: string;
  generic_reuse: "GO" | "NO-GO";
  commercial_adapter: "GO" | "NO-GO";
  estimated_records_month: number | null;
  estimation_method: string | null;
  estimation_confidence: string | null;
  uncaptured_volume: number;
  integration_cost: number;
  maintenance_risk: number;
  components: PriorityComponentMap;
  weights: PriorityComponentMap;
  final_score: number;
  score_version: string;
  rationale: string;
  window_label: string;
};

export type EarlyOpportunityRow = {
  id: string;
  canonical_id: string | null;
  object: string | null;
  organization_name: string | null;
  municipality: string | null;
  uf: string | null;
  local_source: string;
  local_source_id: string;
  first_seen_local: string | null;
  first_seen_pncp: string | null;
  lead_time_hours: number | null;
  match_status: string | null;
  local_only_state: string | null;
  kind: "EARLY_MATCHED" | "LOCAL_ONLY_PROVISIONAL" | "LOCAL_ONLY_CONFIRMED" | "PENDING_PNCP_MATCH";
};

export type CoverageWindowRow = {
  id: string;
  window_start: string;
  window_end: string;
  label: string;
  metric_version: string;
  notes: string | null;
};

export type ProbeRunRow = {
  id: string;
  source_system_id: string | null;
  family: string | null;
  url: string;
  http_status: number | null;
  latency_ms: number | null;
  content_type: string | null;
  ok: boolean;
  excerpt: string | null;
  error: string | null;
  probed_at: string | null;
};

export type Milestone5Metrics = {
  score_version: string;
  window_id: string;
  window_label: string;
  window_start: string;
  window_end: string;
  families_evaluated: number;
  families_with_technical_sample: number;
  chosen_family: string | null;
  chosen_score: number | null;
  chosen_adapter_fit: string | null;
  pcp_verified_entes: number;
  pcp_records: number;
  pcp_pncp_overlap_ratio: number;
  pcp_comprasgov_overlap_ratio: number;
  pcp_local_only: number;
  pcp_median_lead_time_hours: number | null;
  early_matched: number;
  early_provisional: number;
  early_confirmed: number;
  municipality_base_count: number;
  commercial_adapter_verdict: "GO" | "NO-GO";
  generic_reuse_verdict: "GO" | "NO-GO";
  milestone_verdict: "GO" | "NO-GO";
  ranking: FamilyRankRow[];
  probes: ProbeRunRow[];
};

export type Milestone6LiveEnte = {
  id: string;
  label: string;
  count: number;
  readiness: string | null;
};

export type Milestone6Metrics = {
  score_version: string;
  window_id: string;
  window_label: string;
  window_start: string;
  window_end: string;
  public_key_semantics: string;
  public_key_classification: string;
  public_key_allowed_in_config: boolean;
  public_key_readiness: string;
  public_key_rationale: string;
  live_entes: number;
  live_records: number;
  fixture_records: number;
  page2_distinct: boolean;
  pagination_type: string;
  shared_schema: boolean;
  schema_hashes: string[];
  items_observed: boolean;
  documents_observed: boolean;
  detail_observed: boolean;
  pcp_pncp_overlap_ratio: number;
  pcp_comprasgov_overlap_ratio: number;
  pcp_local_only: number;
  pcp_median_lead_time_hours: number | null;
  pcp_p75_lead_time_hours: number | null;
  pcp_p95_lead_time_hours: number | null;
  reliability_success_ratio: number | null;
  reliability_median_latency_ms: number | null;
  checkpoints: number;
  chosen_family: string | null;
  chosen_score: number | null;
  pcp_score: number | null;
  bll_score: number | null;
  commercial_adapter_verdict: "GO" | "NO-GO";
  generic_reuse_verdict: "GO" | "NO-GO";
  milestone_verdict: "GO" | "NO-GO";
  ranking: FamilyRankRow[];
  live_ente_rows: Milestone6LiveEnte[];
  probes: ProbeRunRow[];
};

export type LiveProbeRow = {
  id: string;
  source_system_id: string | null;
  source_name: string | null;
  url: string;
  http_status: number | null;
  ok: boolean;
  excerpt: string | null;
  error: string | null;
  probed_at: string | null;
};

export type Milestone4Metrics = {
  municipal_sources_verified: number;
  active_connectors: number;
  records_ingested_local: number;
  records_matched_pncp: number;
  records_matched_comprasgov: number;
  local_only_provisional: number;
  local_only_confirmed: number;
  local_only_pending: number;
  median_lead_time_hours: number | null;
  p75_lead_time_hours: number | null;
  p95_lead_time_hours: number | null;
  sources_with_positive_lead: number;
  adapter_reuse_ratio: number;
  source_systems_per_adapter: Array<{ adapter: string; count: number }>;
  families_with_5plus_verified_entities: number;
  municipalities_mapped: number;
  municipalities_with_verified_source: number;
  municipalities_with_active_connector: number;
  municipalities_without_portal: number;
  canonical_procurements: number;
  conflicts_observed: number;
  sources_degraded: number;
  declared_pncp_integration_ratio: number;
  pncp_overlap_ratio: number;
  comprasgov_overlap_ratio: number;
  bll_entes: number;
  bll_records: number;
  ambiguous_records: number;
  rejected_matches: number;
  commercial_adapter_verdict: "GO" | "NO-GO";
  generic_reuse_verdict: "GO" | "NO-GO";
  milestone_verdict: "GO" | "NO-GO";
  family_priorities: FamilyPriorityRow[];
  live_probes: LiveProbeRow[];
};

export type MunicipalityCensusRow = {
  id: string;
  jurisdiction_id: string | null;
  ibge_code: string | null;
  uf: string | null;
  name: string;
  portal_presence: string;
  source_system_id: string | null;
  source_name: string | null;
  evidence_level: string | null;
  adapter: string | null;
  discovery_capability: boolean;
  active: boolean;
  last_verified_at: string | null;
};

export type LocalOnlyRow = {
  id: string;
  source_system_id: string;
  source_name: string | null;
  source_identifier: string;
  object: string | null;
  organization_name: string | null;
  uf: string | null;
  local_only_state: string;
  first_seen_at: string | null;
  fetched_at: string | null;
  next_recheck_at: string | null;
  source_url: string | null;
};

export type ComparisonRow = {
  id: string;
  canonical_id: string | null;
  field: string;
  source_a_id: string | null;
  value_a: string | null;
  source_b_id: string | null;
  value_b: string | null;
  observed_at: string | null;
  severity: string | null;
  object: string | null;
};

export type SearchHit = {
  id: string;
  object: string | null;
  organization_name: string | null;
  municipality: string | null;
  uf: string | null;
  modality: string | null;
  status: string | null;
  opening_at: string | null;
  estimated_value: string | null;
  sources: string[];
  match_status: string | null;
  local_only_state: string | null;
  lead_time_hours: number | null;
  source_url: string | null;
  opportunity_id?: string | null;
  horizon?: string | null;
  attention_score?: number | null;
};

export type OpportunityListRow = {
  id: string;
  canonical_id: string;
  object: string | null;
  organization_name: string | null;
  organization_id: string | null;
  municipality: string | null;
  uf: string | null;
  modality: string | null;
  status: string | null;
  catalog_code: string | null;
  catalog_type: string | null;
  horizon: string;
  early_kind: string | null;
  publication_at: string | null;
  proposal_deadline: string | null;
  opening_at: string | null;
  estimated_value_num: number | null;
  first_seen_local: string | null;
  first_seen_pncp: string | null;
  lead_time_hours: number | null;
  lead_class: string | null;
  sources_count: number;
  attention_score: number | null;
  data_confidence: number;
  claim_kind: "FATO_VERIFICADO" | "INFERENCIA" | "PENDENTE_DE_VALIDACAO";
};

export type OpportunityDetail = OpportunityListRow & {
  raw_object: string | null;
  normalized_object: string | null;
  first_seen_global: string | null;
  first_seen_comprasgov: string | null;
  sources: Array<{ id: string; name: string; first_seen_at: string | null }>;
  events: Array<{
    id: string;
    event_type: string;
    source_system_id: string | null;
    source_name: string | null;
    occurred_at: string;
    summary: string;
    change_priority: string | null;
  }>;
  score: {
    score_version: string;
    components: Record<string, number>;
    weights: Record<string, number>;
    final_score: number;
    data_confidence: number;
    rationale: string;
  } | null;
  planning_links: Array<{
    planning_id: string;
    origin_type: string;
    status: string;
    object: string | null;
  }>;
  recurrence: Array<{
    id: string;
    signal_level: string;
    rationale: string;
    purchase_count: number;
  }>;
};

export type PlanningListRow = {
  id: string;
  origin_type: string;
  organization_name: string | null;
  uf: string | null;
  year: number | null;
  object: string | null;
  catalog_code: string | null;
  estimated_value_num: number | null;
  planned_period: string | null;
  source_name: string | null;
  conversion_status: string;
  linked_procurement_id: string | null;
};

export type FutureDemandRow = {
  id: string;
  origin_type: "PLANNING_OFFICIAL" | "RECURRENCE_INFERENCE" | string;
  planning_origin: string | null;
  organization_name: string | null;
  uf: string | null;
  object: string | null;
  estimated_value_num: number | null;
  year: number | null;
  signal_level: string | null;
  claim_kind: "FATO_VERIFICADO" | "INFERENCIA";
};

export type RecurrenceRow = {
  id: string;
  organization_id: string;
  organization_name: string | null;
  uf: string | null;
  normalized_object: string | null;
  catalog_code: string | null;
  purchase_count: number;
  median_interval_days: number | null;
  last_purchase_at: string | null;
  signal_level: string;
  confidence: number;
  rationale: string;
  evidence_procurement_ids: string[];
  model_version: string;
};

export type ArpListRow = {
  id: string;
  organization_name: string | null;
  uf: string | null;
  object: string | null;
  catalog_code: string | null;
  supplier_name: string | null;
  remaining_balance: number | null;
  remaining_ratio: number | null;
  vigency_end: string | null;
  status: string;
  signals: string[];
};

export type OrgListRow = {
  id: string;
  display_name: string;
  cnpj: string | null;
  uf: string | null;
  municipality: string | null;
  identity_method: string;
  identity_status: string;
  procurements_12m: number;
  procurements_24m: number;
  estimated_value_12m: number | null;
  recurring_objects: number;
  active_planning_items: number;
  active_arps: number;
};

export type OrgDetail = OrgListRow & {
  uasg: string | null;
  modalities: JsonObject[];
  top_categories: JsonObject[];
  average_interval_days: number | null;
  sources_count: number;
  recent: OpportunityListRow[];
  planning: PlanningListRow[];
  recurrence: RecurrenceRow[];
  arps: ArpListRow[];
};

export type ItemListRow = {
  id: string;
  catalog_type: string;
  catalog_code: string | null;
  label: string;
  classification_method: string;
  confidence: number;
  organizations_buying: number;
  procurements_count: number;
  median_price: number | null;
  latest_price: number | null;
  latest_price_kind: string | null;
  active_plans: number;
  active_arps: number;
  recurring_buyers: number;
};

export type ItemDetail = ItemListRow & {
  buyers: Array<{ organization_id: string; name: string; uf: string | null; count: number }>;
  prices: Array<{
    id: string;
    price_kind: string;
    source_kind: string;
    unit_price: number | null;
    observed_at: string;
  }>;
  planning: PlanningListRow[];
  arps: ArpListRow[];
  recurrence: RecurrenceRow[];
};

export type AlertRuleRow = {
  id: string;
  name: string;
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
  min_change_priority: string | null;
  active: boolean;
  created_at: string;
};

export type AlertEventRow = {
  id: string;
  alert_rule_id: string;
  rule_name: string;
  entity_type: string;
  entity_id: string;
  event_type: string;
  triggered_at: string;
  reason_text: string;
  reason: JsonObject;
};

export type Milestone7Metrics = {
  active_opportunities: number;
  early_opportunities: number;
  planned_demand_items: number;
  pca_items: number;
  pgc_items: number;
  recurrence_signals: number;
  active_arps: number;
  alerts_triggered: number;
  organizations_profiled: number;
  catalog_items_profiled: number;
  early_opportunity_rate: number;
  median_early_lead: number | null;
  planning_conversion_rate: number;
  jobs_run: number;
  golden_cases: number;
  attention_score_version: string;
  recurrence_model_version: string;
  commercial_adapter_verdict: "GO" | "NO-GO";
  milestone_verdict: "GO" | "NO-GO";
};

export type IntelligenceSearch = {
  procurements: SearchHit[];
  opportunities: OpportunityListRow[];
  planning: PlanningListRow[];
  recurrence: RecurrenceRow[];
  organizations: OrgListRow[];
};

export type SourceRecordRow = {
  id: string;
  source_system_id: string;
  source_entity_type: string;
  source_identifier: string;
  source_url: string | null;
  payload_hash: string | null;
  schema_hash: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
  fetched_at: string | null;
  local_only_state: string | null;
  excerpt: string | null;
  match_status: string | null;
  match_method: string | null;
  match_score: number | null;
  matched_fields: string[];
  lead_time_hours: number | null;
  ingestion_mode: string | null;
  fetch_method: string | null;
  source_channel: string | null;
};

export const BRAZIL_UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export type Gate75SignalVerdict = {
  verdict: "GO" | "NO-GO";
  claim: "FATO_VERIFICADO" | "INFERENCIA" | "PENDENTE_DE_VALIDACAO";
  n: number;
  note: string;
};

export type Gate75WorkstreamRow = {
  id: string;
  title: string;
  until: string;
  status: "DONE" | "IN_PROGRESS" | "WAITING";
  notes: string;
};

export type Gate75Report = {
  as_of: string;
  gate75_go: boolean;
  engineering_go: boolean;
  statistical_go: boolean;
  gate75_missing: string[];
  statistical_missing: string[];
  project_state: string;
  m8: {
    choice: "A" | "B" | "C" | "D" | "NONE";
    go_m8: boolean;
    closest_if_forced: "A" | "B" | "C" | "D" | "NONE";
    closest_confidence: "PRELIMINARY" | "EVIDENCED";
    rationale: string;
    criteria: Record<string, string>;
    blockers: string[];
    facts: string[];
    inferences: string[];
    limitations: string[];
    m8_c_requires: string[];
  };
  workstreams: Gate75WorkstreamRow[];
  decisive_gate: { on: string; action: string };
  signals: {
    recurrence: Gate75SignalVerdict;
    planning_link: Gate75SignalVerdict;
    pca_live: Gate75SignalVerdict;
    pgc_live: Gate75SignalVerdict;
    arp_live: Gate75SignalVerdict;
    window_7d: Gate75SignalVerdict;
    attention: Gate75SignalVerdict;
    alerts: Gate75SignalVerdict;
  };
  product: {
    live: {
      planning: number;
      pca: number;
      pgc: number;
      arp: number;
      procurements: number;
      opportunities: number;
    };
    golden: {
      planning: number;
      arp: number;
      opportunities: number;
    };
    pcp_overlap_ratio: number;
    pcp_reprocess: { n: number; confirmed: number; provisional: number; pending: number };
  };
  quality: JsonObject;
  live_ingest: {
    started_at: string;
    finished_at: string;
    budget_ms: number;
    skipped: string[];
    pca_consolidado: number;
    pca_items: number;
    pgc_items: number;
    arp_rows: number;
    contratacoes: number;
    errors: string[];
  } | null;
  checkpoints: Array<{
    source_kind: string;
    status: string;
    http_status: number | null;
    rows_ingested: number;
    source_url: string | null;
    error: string | null;
    fetched_at: string | null;
  }>;
  cohorts: Array<{
    id: string;
    kind: string;
    window_start: string;
    window_end: string;
    notes: string;
  }>;
  errors: Array<{
    code: string;
    entity_type: string;
    notes: string;
    data_origin: string | null;
  }>;
  facts: string[];
  inferences: string[];
  limitations: string[];
  forbidden_language_hits: string[];
  holdout_unused: boolean;
  corrections_applied: string[];
  proven_errors: string[];
  window_recommendation: {
    keep_days: number;
    change: false;
    reason: string;
    reevaluate_after: string;
  };
};
