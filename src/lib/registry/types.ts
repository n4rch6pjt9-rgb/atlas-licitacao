export const JURISDICTION_TYPES = [
  "UNION",
  "STATE",
  "MUNICIPALITY",
  "DISTRICT",
  "PUBLIC_ENTITY",
  "CONSORTIUM",
  "OTHER",
] as const;
export type JurisdictionType = (typeof JURISDICTION_TYPES)[number];

export const FUNCTIONAL_FAMILIES = [
  "PROCUREMENT_TRANSACTIONAL",
  "PROCUREMENT_DISCOVERY",
  "PLANNING",
  "PRICE_RESEARCH",
  "ARP",
  "CONTRACTS",
  "SUPPLIERS",
  "TRANSPARENCY_HUB",
  "MULTI_FUNCTION",
  "UNKNOWN",
] as const;
export type FunctionalFamily = (typeof FUNCTIONAL_FAMILIES)[number];

export const TECHNOLOGY_FAMILIES = [
  "PNCP",
  "COMPRAS_GOV",
  "PARADIGMA_WBC",
  "SCPI_FIORILLI",
  "LICITAR_DIGITAL",
  "PORTAL_COMPRAS_PUBLICAS",
  "LICITANET",
  "BLL",
  "BBMNET",
  "BANCO_DO_BRASIL",
  "BNC",
  "COMPRASBR",
  "SISTEMA_PROPRIO",
  "GENERIC_JSON_API",
  "GENERIC_REST_API",
  "GENERIC_JSF",
  "GENERIC_STRUTS_ACTION",
  "GENERIC_ASP",
  "GENERIC_SSR",
  "GENERIC_SPA",
  "UNKNOWN",
] as const;
export type TechnologyFamily = (typeof TECHNOLOGY_FAMILIES)[number];

export const VENDOR_FAMILIES = new Set<TechnologyFamily>([
  "PARADIGMA_WBC",
  "SCPI_FIORILLI",
  "LICITAR_DIGITAL",
  "PORTAL_COMPRAS_PUBLICAS",
  "LICITANET",
  "BLL",
  "BBMNET",
  "BANCO_DO_BRASIL",
  "BNC",
  "COMPRASBR",
]);

export const FRAMEWORK_FAMILIES = new Set<TechnologyFamily>([
  "GENERIC_JSON_API",
  "GENERIC_REST_API",
  "GENERIC_JSF",
  "GENERIC_STRUTS_ACTION",
  "GENERIC_ASP",
  "GENERIC_SSR",
  "GENERIC_SPA",
]);

export const EVIDENCE_LEVELS = [
  "VERIFIED",
  "STRONG_INDICATION",
  "WEAK_INDICATION",
  "UNKNOWN",
] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

export const EVIDENCE_TYPES = [
  "OFFICIAL_DOCUMENT",
  "PUBLIC_CONTRACT",
  "OFFICIAL_MANUAL",
  "VENDOR_REFERENCE",
  "HTML_SIGNATURE",
  "JS_ASSET",
  "HTTP_HEADER",
  "COOKIE",
  "ROUTE_SIGNATURE",
  "JSON_SCHEMA",
  "FORM_ACTION",
  "ROBOTS",
  "SITEMAP",
  "OTHER",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const SIGNATURE_TYPES = [
  "URL_PATH",
  "FORM_ACTION",
  "JSON_FIELD",
  "JSON_SHAPE",
  "COOKIE_NAME",
  "HEADER",
  "HTML_META",
  "SCRIPT_PATH",
  "CSS_PATH",
  "JS_GLOBAL",
  "SERVER_HEADER",
  "PAGE_TEXT",
  "FILE_NAMING",
  "PARAMETER_NAME",
  "PAGINATION_PATTERN",
  "ROUTE_SIGNATURE",
  "PAGE_SUFFIX",
] as const;
export type SignatureType = (typeof SIGNATURE_TYPES)[number];

export const CAPABILITIES = [
  "DISCOVER_PROCUREMENTS",
  "PROCUREMENT_DETAIL",
  "ITEMS",
  "DOCUMENTS",
  "RESULTS",
  "SUPPLIERS",
  "ARP",
  "ARP_ITEMS",
  "ARP_BALANCE",
  "ARP_ADHESIONS",
  "CONTRACTS",
  "PLANNING",
  "PRICE_RESEARCH",
  "LEGISLATION",
  "CATALOG",
  "SEARCH",
  "DOWNLOAD",
  "HISTORY",
] as const;
export type Capability = (typeof CAPABILITIES)[number];

export const ACCESS_TYPES = ["PUBLIC", "AUTH_REQUIRED", "UNKNOWN"] as const;
export type AccessType = (typeof ACCESS_TYPES)[number];

export const ENDPOINT_TYPES = [
  "JSON_API",
  "REST",
  "FORM_POST",
  "HTML_LIST",
  "HTML_DETAIL",
  "FILE_DOWNLOAD",
  "AJAX",
  "GRAPHQL",
  "OTHER",
] as const;
export type EndpointType = (typeof ENDPOINT_TYPES)[number];

export const PAGINATION_TYPES = [
  "PAGE_NUMBER",
  "OFFSET_LIMIT",
  "CURSOR",
  "NEXT_LINK",
  "DATATABLES",
  "JSF_VIEWSTATE",
  "SERVER_SIDE_FORM",
  "UNKNOWN",
] as const;
export type PaginationType = (typeof PAGINATION_TYPES)[number];

export const DISCOVERY_STRATEGIES = [
  "PUBLIC_JSON_API",
  "PUBLIC_REST_API",
  "HTML_LIST",
  "FORM_SEARCH",
  "JSF_POSTBACK",
  "STRUTS_ACTION",
  "SITEMAP",
  "RSS",
  "FILE_EXPORT",
  "EXTERNAL_LINK_HUB",
  "UNKNOWN",
] as const;
export type DiscoveryStrategy = (typeof DISCOVERY_STRATEGIES)[number];

export const DISCOVERY_CHANNEL_TYPES = [
  "PROCESS",
  "DIRECT_BUY",
  "LOCATION",
  "PLANNING",
  "ARP",
  "CONTRACT",
  "OTHER",
] as const;
export type DiscoveryChannelType = (typeof DISCOVERY_CHANNEL_TYPES)[number];

export const CONNECTOR_TYPES = [
  "GENERIC_JSON",
  "GENERIC_ACTION",
  "GENERIC_JSF",
  "EXTERNAL_LINK_HUB",
  "PLANNING_ONLY",
  "NONE",
] as const;
export type ConnectorType = (typeof CONNECTOR_TYPES)[number];

export const CLASSIFICATION_STATES = [
  "DISCOVERED",
  "OBSERVED",
  "FINGERPRINTED",
  "CLASSIFIED",
  "ADAPTER_READY",
  "INGESTING",
  "DEGRADED",
  "DISABLED",
] as const;
export type ClassificationState = (typeof CLASSIFICATION_STATES)[number];

export const HEALTH_STATES = [
  "HEALTHY",
  "DEGRADED",
  "FAILING",
  "SCHEMA_CHANGED",
  "PARSER_DEGRADED",
  "DISABLED",
  "UNKNOWN",
] as const;
export type HealthState = (typeof HEALTH_STATES)[number];

export const CAPABILITY_SUPPORT_STATES = [
  "SUPPORTED",
  "PARTIAL",
  "NOT_SUPPORTED",
  "UNKNOWN",
  "DEGRADED",
] as const;
export type CapabilitySupportState = (typeof CAPABILITY_SUPPORT_STATES)[number];

export const LINK_STATUSES = [
  "CONFIRMED",
  "PROBABLE",
  "REVIEW_REQUIRED",
  "REJECTED",
  "UNMATCHED",
] as const;
export type LinkStatus = (typeof LINK_STATUSES)[number];

export const RELATION_TYPES = [
  "FRONTEND_OF",
  "LINKS_TO",
  "MIRRORS",
  "EXPORTS_TO",
  "IMPORTS_FROM",
  "REPLACED_BY",
  "LEGACY_OF",
  "PLANNING_FOR",
  "EXECUTION_FOR",
] as const;
export type RelationType = (typeof RELATION_TYPES)[number];

export const OBSERVATION_TYPES = [
  "SERVER_HEADER",
  "COOKIE_NAME",
  "ROUTE",
  "CONTENT_TYPE",
  "PAGE_SUFFIX",
  "HTML_TITLE",
  "META_GENERATOR",
  "SCRIPT_PATH",
  "CSS_PATH",
  "FORM_ACTION",
  "INPUT_NAME",
  "JS_GLOBAL",
  "JSON_FIELD",
  "JSON_SHAPE",
  "ROBOTS",
  "PAGE_TEXT",
  "PARAMETER_NAME",
  "PAGINATION_PATTERN",
  "OTHER",
] as const;
export type ObservationType = (typeof OBSERVATION_TYPES)[number];

export const ALERT_TYPES = [
  "NEW_SOURCE_DISCOVERED",
  "SOURCE_FAMILY_CONFIRMED",
  "SOURCE_VENDOR_CONFLICT",
  "SCHEMA_CHANGED",
  "PORTAL_FINGERPRINT_CHANGED",
  "ENDPOINT_DOWN",
  "ADAPTER_REUSABLE",
  "PARSER_DEGRADED",
] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

export const CLAIM_KINDS = [
  "FATO_VERIFICADO",
  "INFERENCIA",
  "PENDENTE_DE_VALIDACAO",
] as const;
export type ClaimKind = (typeof CLAIM_KINDS)[number];

export const LOCAL_ONLY_STATES = [
  "MATCHED",
  "PENDING_PNCP_MATCH",
  "LOCAL_ONLY_PROVISIONAL",
  "LOCAL_ONLY_CONFIRMED",
] as const;
export type LocalOnlyState = (typeof LOCAL_ONLY_STATES)[number];

export const PORTAL_PRESENCE = [
  "NO_PORTAL_FOUND",
  "PNCP_ONLY",
  "EXTERNAL_PLATFORM",
  "MUNICIPAL_PORTAL",
  "UNKNOWN",
] as const;
export type PortalPresence = (typeof PORTAL_PRESENCE)[number];

export type FingerprintSignature = {
  id: string;
  technology_family: TechnologyFamily;
  signature_type: SignatureType;
  key: string;
  pattern: string;
  weight: number;
  required: boolean;
  description: string;
  source_url: string | null;
  is_vendor_claim: boolean;
};

export type Observation = {
  observation_type: ObservationType;
  key: string;
  value: string;
  source_url?: string | null;
  raw_payload?: unknown;
};

export type EvidenceInput = {
  evidence_type: EvidenceType;
  evidence_level?: EvidenceLevel;
  title: string;
  description?: string;
  url?: string | null;
  observed_value?: string | null;
  expected_signature?: string | null;
};

export type SignatureMatch = {
  signature: FingerprintSignature;
  matched: boolean;
  score: number;
  observed_value: string | null;
};

export type ClassificationResult = {
  candidate_family: TechnologyFamily;
  technology_family: TechnologyFamily;
  vendor_name: string | null;
  product_name: string | null;
  evidence_level: EvidenceLevel;
  confidence: number;
  score: number;
  vendor_score: number;
  framework_score: number;
  conflict: boolean;
  conflict_reason: string | null;
  claim_kind: ClaimKind;
  matches: SignatureMatch[];
};

export type ConnectorConfig = {
  connectorType: ConnectorType;
  baseUrl: string;
  paths: Record<string, string>;
  defaultParams?: Record<string, string>;
  headers?: Record<string, string>;
  responsePath?: string;
  pagination?: {
    type: PaginationType;
    pageParam?: string;
    sizeParam?: string;
    pageSize?: number;
    startPage?: number;
  };
  normalization?: Record<string, string>;
  documents?: Record<string, string>;
  /** Skip records that do not match path=value. Generic, not a municipality fork. */
  acceptEquals?: Record<string, string>;
  /** Prefix for relative source_url values in payloads. */
  linkBase?: string;
  /** Optional regex for HTML discovery links. Default remains \.action. */
  linkPattern?: string;
  /** Public discovery surface. Same adapter, distinct channel. */
  channelType?: DiscoveryChannelType;
};

export type SourceProcurement = {
  external_id: string;
  source_system_id: string;
  process_number: string | null;
  procurement_number: string | null;
  year: number | null;
  modality: string | null;
  status: string | null;
  organization_name: string | null;
  organization_identifier: string | null;
  object: string | null;
  proposal_deadline: string | null;
  opening_at: string | null;
  source_url: string | null;
  raw_payload: unknown;
  source_channel?: DiscoveryChannelType | null;
};

export type SourceItem = {
  external_id: string;
  procurement_external_id: string;
  item_number: string | null;
  description: string | null;
  quantity: string | null;
  unit: string | null;
  estimated_unit_price: string | null;
  estimated_total_price: string | null;
  catalog_code: string | null;
  catalog_type: string | null;
  raw_payload: unknown;
};

export type SourceDocument = {
  external_id: string;
  procurement_external_id: string;
  title: string | null;
  document_type: string | null;
  url: string | null;
  published_at: string | null;
  mime_type: string | null;
  filename: string | null;
  raw_payload: unknown;
};

export type SourceResult = {
  external_id: string;
  procurement_external_id: string;
  supplier_name: string | null;
  supplier_identifier: string | null;
  status: string | null;
  awarded_value: string | null;
  raw_payload: unknown;
};

export type SourceSupplier = {
  external_id: string;
  name: string | null;
  identifier: string | null;
  raw_payload: unknown;
};

export type SourceAta = {
  external_id: string;
  number: string | null;
  year: number | null;
  object: string | null;
  source_url: string | null;
  raw_payload: unknown;
};

export type SourceContract = {
  external_id: string;
  number: string | null;
  year: number | null;
  supplier_name: string | null;
  object: string | null;
  source_url: string | null;
  raw_payload: unknown;
};

export type SourcePlanningRecord = {
  external_id: string;
  year: number | null;
  organization_name: string | null;
  object: string | null;
  estimated_value: string | null;
  source_url: string | null;
  raw_payload: unknown;
};

export type DiscoveryParams = {
  year?: number;
  status?: string;
  modality?: string;
  q?: string;
  limit?: number;
};

export type PlatformHistoryEntry = {
  id: string;
  source_system_id: string;
  technology_family: TechnologyFamily;
  vendor_name: string | null;
  product_name: string | null;
  valid_from: string;
  valid_to: string | null;
  evidence_id: string | null;
  confidence: number;
};
