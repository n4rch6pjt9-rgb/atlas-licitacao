import type {
  AccessType,
  AlertType,
  Capability,
  ClassificationState,
  ConnectorType,
  DiscoveryStrategy,
  EndpointType,
  EvidenceLevel,
  EvidenceType,
  FunctionalFamily,
  HealthState,
  JurisdictionType,
  LinkStatus,
  LocalOnlyState,
  ObservationType,
  PaginationType,
  PortalPresence,
  RelationType,
  SignatureType,
  TechnologyFamily,
  CapabilitySupportState,
  DiscoveryChannelType,
} from "./types";

export const TECHNOLOGY_LABELS: Record<TechnologyFamily, string> = {
  PNCP: "Portal Nacional de Contratações Públicas",
  COMPRAS_GOV: "Compras.gov",
  PARADIGMA_WBC: "Paradigma / WBC",
  SCPI_FIORILLI: "Fiorilli SCPI",
  LICITAR_DIGITAL: "Licitar Digital",
  PORTAL_COMPRAS_PUBLICAS: "Portal de Compras Públicas",
  LICITANET: "Licitanet",
  BLL: "BLL",
  BBMNET: "BBMNET",
  BANCO_DO_BRASIL: "Licitações-e (BB)",
  BNC: "BNC",
  COMPRASBR: "ComprasBR / SIGA (AZ)",
  SISTEMA_PROPRIO: "Sistema próprio",
  GENERIC_JSON_API: "API JSON genérica",
  GENERIC_REST_API: "REST genérica",
  GENERIC_JSF: "JSF genérico",
  GENERIC_STRUTS_ACTION: "Action / Struts genérico",
  GENERIC_ASP: "ASP genérico",
  GENERIC_SSR: "SSR genérico",
  GENERIC_SPA: "SPA genérico",
  UNKNOWN: "Desconhecida",
};

export const FUNCTIONAL_LABELS: Record<FunctionalFamily, string> = {
  PROCUREMENT_TRANSACTIONAL: "Transacional",
  PROCUREMENT_DISCOVERY: "Descoberta",
  PLANNING: "Planejamento",
  PRICE_RESEARCH: "Pesquisa de preços",
  ARP: "ARP",
  CONTRACTS: "Contratos",
  SUPPLIERS: "Fornecedores",
  TRANSPARENCY_HUB: "Hub de transparência",
  MULTI_FUNCTION: "Multifunção",
  UNKNOWN: "Desconhecida",
};

export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  VERIFIED: "Verificado",
  STRONG_INDICATION: "Indício forte",
  WEAK_INDICATION: "Indício fraco",
  UNKNOWN: "Desconhecido",
};

export const STATE_LABELS: Record<ClassificationState, string> = {
  DISCOVERED: "Descoberto",
  OBSERVED: "Observado",
  FINGERPRINTED: "Fingerprintado",
  CLASSIFIED: "Classificado",
  ADAPTER_READY: "Adapter pronto",
  INGESTING: "Ingerindo",
  DEGRADED: "Degradado",
  DISABLED: "Desativado",
};

export const HEALTH_LABELS: Record<HealthState, string> = {
  HEALTHY: "Saudável",
  DEGRADED: "Degradado",
  FAILING: "Falho",
  SCHEMA_CHANGED: "Schema alterado",
  PARSER_DEGRADED: "Parser degradado",
  DISABLED: "Desativado",
  UNKNOWN: "Desconhecido",
};

export const CAPABILITY_SUPPORT_LABELS: Record<CapabilitySupportState, string> = {
  SUPPORTED: "Suportada",
  PARTIAL: "Parcial",
  NOT_SUPPORTED: "Não suportada",
  UNKNOWN: "Desconhecida",
  DEGRADED: "Degradada",
};

export const DISCOVERY_CHANNEL_LABELS: Record<DiscoveryChannelType, string> = {
  PROCESS: "Processos",
  DIRECT_BUY: "Compra direta",
  LOCATION: "Busca por localização",
  PLANNING: "Planejamento",
  ARP: "ARP",
  CONTRACT: "Contratos",
  OTHER: "Outro canal",
};

export const CHANNEL_READINESS_LABELS: Record<string, string> = {
  READY: "Pronto para ingestão",
  OBSERVED: "Observado",
  BLOCKED: "Bloqueado",
  NOT_READY: "Não pronto",
};

export const CONNECTOR_LABELS: Record<ConnectorType, string> = {
  GENERIC_JSON: "generic-json",
  GENERIC_ACTION: "generic-action",
  GENERIC_JSF: "generic-jsf",
  EXTERNAL_LINK_HUB: "external-link-hub",
  PLANNING_ONLY: "planning-only",
  NONE: "nenhum",
};

export const CAPABILITY_LABELS: Record<Capability, string> = {
  DISCOVER_PROCUREMENTS: "Descoberta",
  PROCUREMENT_DETAIL: "Detalhe",
  ITEMS: "Itens",
  DOCUMENTS: "Documentos",
  RESULTS: "Resultados",
  SUPPLIERS: "Fornecedores",
  ARP: "ARP",
  ARP_ITEMS: "Itens ARP",
  ARP_BALANCE: "Saldo ARP",
  ARP_ADHESIONS: "Adesões ARP",
  CONTRACTS: "Contratos",
  PLANNING: "Planejamento",
  PRICE_RESEARCH: "Pesquisa de preços",
  LEGISLATION: "Legislação",
  CATALOG: "Catálogo",
  SEARCH: "Busca",
  DOWNLOAD: "Download",
  HISTORY: "Histórico",
};

export const CLAIM_LABELS = {
  FATO_VERIFICADO: "Fato verificado",
  INFERENCIA: "Inferência",
  PENDENTE_DE_VALIDACAO: "Pendente de validação",
} as const;

export const OBSERVATION_LABELS: Record<ObservationType, string> = {
  SERVER_HEADER: "Header de servidor",
  COOKIE_NAME: "Cookie",
  ROUTE: "Rota",
  CONTENT_TYPE: "Content-Type",
  PAGE_SUFFIX: "Sufixo de página",
  HTML_TITLE: "Título HTML",
  META_GENERATOR: "Meta generator",
  SCRIPT_PATH: "Script",
  CSS_PATH: "Stylesheet",
  FORM_ACTION: "Action de formulário",
  INPUT_NAME: "Nome de input",
  JS_GLOBAL: "Global JS",
  JSON_FIELD: "Campo JSON",
  JSON_SHAPE: "Forma JSON",
  ROBOTS: "robots.txt",
  PAGE_TEXT: "Texto de página",
  PARAMETER_NAME: "Parâmetro",
  PAGINATION_PATTERN: "Paginação",
  OTHER: "Outro",
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  OFFICIAL_DOCUMENT: "Documento oficial",
  PUBLIC_CONTRACT: "Contrato público",
  OFFICIAL_MANUAL: "Manual oficial",
  VENDOR_REFERENCE: "Referência do fornecedor",
  HTML_SIGNATURE: "Assinatura HTML",
  JS_ASSET: "Asset JS",
  HTTP_HEADER: "Header HTTP",
  COOKIE: "Cookie",
  ROUTE_SIGNATURE: "Assinatura de rota",
  JSON_SCHEMA: "Schema JSON",
  FORM_ACTION: "Action de formulário",
  ROBOTS: "robots.txt",
  SITEMAP: "Sitemap",
  OTHER: "Outro",
};

export const SIGNATURE_TYPE_LABELS: Record<SignatureType, string> = {
  URL_PATH: "Caminho de URL",
  FORM_ACTION: "Action de formulário",
  JSON_FIELD: "Campo JSON",
  JSON_SHAPE: "Forma JSON",
  COOKIE_NAME: "Cookie",
  HEADER: "Header",
  HTML_META: "Meta HTML",
  SCRIPT_PATH: "Script",
  CSS_PATH: "Stylesheet",
  JS_GLOBAL: "Global JS",
  SERVER_HEADER: "Header de servidor",
  PAGE_TEXT: "Texto de página",
  FILE_NAMING: "Nome de arquivo",
  PARAMETER_NAME: "Parâmetro",
  PAGINATION_PATTERN: "Paginação",
  ROUTE_SIGNATURE: "Assinatura de rota",
  PAGE_SUFFIX: "Sufixo de página",
};

export const PAGINATION_LABELS: Record<PaginationType, string> = {
  PAGE_NUMBER: "Número de página",
  OFFSET_LIMIT: "Offset / limit",
  CURSOR: "Cursor",
  NEXT_LINK: "Link next",
  DATATABLES: "DataTables",
  JSF_VIEWSTATE: "JSF ViewState",
  SERVER_SIDE_FORM: "Formulário server-side",
  UNKNOWN: "Desconhecida",
};

export const ACCESS_LABELS: Record<AccessType, string> = {
  PUBLIC: "Público",
  AUTH_REQUIRED: "Autenticação exigida",
  UNKNOWN: "Desconhecido",
};

export const ENDPOINT_TYPE_LABELS: Record<EndpointType, string> = {
  JSON_API: "API JSON",
  REST: "REST",
  FORM_POST: "POST de formulário",
  HTML_LIST: "Lista HTML",
  HTML_DETAIL: "Detalhe HTML",
  FILE_DOWNLOAD: "Download de arquivo",
  AJAX: "Ajax",
  GRAPHQL: "GraphQL",
  OTHER: "Outro",
};

export const DISCOVERY_STRATEGY_LABELS: Record<DiscoveryStrategy, string> = {
  PUBLIC_JSON_API: "API JSON pública",
  PUBLIC_REST_API: "API REST pública",
  HTML_LIST: "Lista HTML",
  FORM_SEARCH: "Busca por formulário",
  JSF_POSTBACK: "Postback JSF",
  STRUTS_ACTION: "Action Struts",
  SITEMAP: "Sitemap",
  RSS: "RSS",
  FILE_EXPORT: "Exportação de arquivo",
  EXTERNAL_LINK_HUB: "Hub de links externos",
  UNKNOWN: "Desconhecida",
};

export const LINK_STATUS_LABELS: Record<LinkStatus, string> = {
  CONFIRMED: "Confirmado",
  PROBABLE: "Provável",
  REVIEW_REQUIRED: "Revisão necessária",
  REJECTED: "Rejeitado",
  UNMATCHED: "Sem match",
};

export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  FRONTEND_OF: "Frontend de",
  LINKS_TO: "Liga a",
  MIRRORS: "Espelha",
  EXPORTS_TO: "Exporta para",
  IMPORTS_FROM: "Importa de",
  REPLACED_BY: "Substituído por",
  LEGACY_OF: "Legado de",
  PLANNING_FOR: "Planejamento de",
  EXECUTION_FOR: "Execução de",
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  NEW_SOURCE_DISCOVERED: "Nova fonte descoberta",
  SOURCE_FAMILY_CONFIRMED: "Família confirmada",
  SOURCE_VENDOR_CONFLICT: "Conflito de fornecedor",
  SCHEMA_CHANGED: "Schema alterado",
  PORTAL_FINGERPRINT_CHANGED: "Fingerprint alterado",
  ENDPOINT_DOWN: "Endpoint fora",
  ADAPTER_REUSABLE: "Adapter reutilizável",
  PARSER_DEGRADED: "Parser degradado",
};

export const JURISDICTION_LABELS: Record<JurisdictionType, string> = {
  UNION: "União",
  STATE: "Estado",
  MUNICIPALITY: "Município",
  DISTRICT: "Distrito",
  PUBLIC_ENTITY: "Entidade pública",
  CONSORTIUM: "Consórcio",
  OTHER: "Outro",
};

export const LOCAL_ONLY_LABELS: Record<LocalOnlyState, string> = {
  MATCHED: "Com match",
  PENDING_PNCP_MATCH: "Aguardando PNCP",
  LOCAL_ONLY_PROVISIONAL: "Local-only provisório",
  LOCAL_ONLY_CONFIRMED: "Sem match nacional após a janela — não é ausência definitiva",
};

export const PORTAL_PRESENCE_LABELS: Record<PortalPresence, string> = {
  NO_PORTAL_FOUND: "Sem portal encontrado",
  PNCP_ONLY: "Só PNCP",
  EXTERNAL_PLATFORM: "Plataforma externa",
  MUNICIPAL_PORTAL: "Portal municipal",
  UNKNOWN: "Desconhecida",
};

export const ADAPTER_FIT_LABELS: Record<string, string> = {
  GENERIC_JSON_FIT: "generic-json",
  GENERIC_ACTION_FIT: "generic-action",
  GENERIC_JSF_FIT: "generic-jsf",
  NEEDS_NEW_GENERIC_CAPABILITY: "nova capability genérica",
  NEEDS_VENDOR_ADAPTER: "adapter de vendor",
  UNSUITABLE: "inadequado agora",
};

export const EARLY_KIND_LABELS: Record<string, string> = {
  EARLY_MATCHED: "Antecipado com match",
  LOCAL_ONLY_PROVISIONAL: "Local-only provisório",
  LOCAL_ONLY_CONFIRMED: "Sem match nacional após a janela — não é ausência definitiva",
  MATURED_NO_MATCH: "Sem match nacional após a janela — não é ausência definitiva",
  PENDING_PNCP_MATCH: "Aguardando PNCP",
  PENDING_MATCH: "Aguardando match nacional",
};

export const DATA_ORIGIN_LABELS: Record<string, string> = {
  LIVE: "Live",
  GOLDEN: "Golden",
  FIXTURE: "Fixture",
  SYNTHETIC: "Sintético",
  UNKNOWN: "Origem desconhecida",
};

export function localOnlyUxLabel(state: string | null | undefined): string {
  if (!state) return "—";
  if (state === "LOCAL_ONLY_CONFIRMED" || state === "MATURED_NO_MATCH") {
    return EARLY_KIND_LABELS.MATURED_NO_MATCH;
  }
  return LOCAL_ONLY_LABELS[state as LocalOnlyState] ?? EARLY_KIND_LABELS[state] ?? state;
}

export const PUBLIC_KEY_SEMANTICS_LABELS: Record<string, string> = {
  PUBLIC_TENANT_IDENTIFIER: "Identificador público de tenant",
  PUBLIC_CLIENT_KEY: "Chave pública de cliente",
  PRIVATE_CREDENTIAL: "Credencial privada",
  UNKNOWN: "Semântica desconhecida",
};

export const VALUE_CLASSIFICATION_LABELS: Record<string, string> = {
  PUBLIC: "Público",
  INTERNAL: "Interno",
  SECRET: "Segredo",
};

export const CONNECTOR_READINESS_LABELS: Record<string, string> = {
  LIVE: "Live",
  FIXTURE: "Fixture",
  CONFIG_PENDING: "Config pendente",
  DEGRADED: "Degradado",
  AUTH_REQUIRED: "Auth necessária",
  CANDIDATE_CONFIG: "Config candidata",
};

export const INGESTION_MODE_LABELS: Record<string, string> = {
  LIVE_PUBLIC_API: "API pública live",
  PUBLIC_EXPORT: "Exportação pública",
  PUBLIC_HTML: "HTML público",
  RECORDED_FIXTURE: "Fixture gravada",
  MANUAL_FIXTURE: "Fixture manual",
  DOCUMENTATION_SAMPLE: "Amostra de documentação",
  UNKNOWN: "Desconhecido",
};

export const HORIZON_LABELS: Record<string, string> = {
  CURRENT: "Atual",
  EARLY: "Antecipada",
  PLANNED: "Planejada",
  RECURRENT_SIGNAL: "Sinal de recorrência",
};

export const LEAD_CLASS_LABELS: Record<string, string> = {
  EARLY: "Antes do PNCP",
  SAME_WINDOW: "Mesma janela",
  LATE: "Depois do PNCP",
};

export const SIGNAL_LEVEL_LABELS: Record<string, string> = {
  NONE: "Sem sinal",
  LOW: "Baixo",
  MEDIUM: "Médio",
  HIGH: "Alto",
};

export const PLANNING_ORIGIN_LABELS: Record<string, string> = {
  PCA_PNCP: "PCA (PNCP)",
  PGC_COMPRASGOV: "PGC (Compras.gov)",
};

export const CONVERSION_LABELS: Record<string, string> = {
  CONFIRMED: "Convertido",
  PROBABLE: "Provável",
  REVIEW_REQUIRED: "Revisão",
  UNMATCHED: "Ainda sem contratação",
};

export const ARP_SIGNAL_LABELS: Record<string, string> = {
  ACTIVE_ARP: "ARP ativa",
  HIGH_REMAINING_BALANCE: "Saldo alto",
  LOW_REMAINING_BALANCE: "Saldo baixo",
  RECENT_ADHESION: "Adesão recente",
  NEAR_EXPIRATION: "Perto do vencimento",
};

export const IDENTITY_STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmada",
  PROBABLE: "Provável",
  REVIEW_REQUIRED: "Revisão necessária",
};

export const PRICE_KIND_LABELS: Record<string, string> = {
  ESTIMATED: "Estimado",
  AWARDED: "Homologado",
  ARP_REGISTERED: "Preço da ARP",
  PRACTICED: "Praticado",
};

export const ATTENTION_COMPONENT_LABELS: Record<string, string> = {
  freshness: "Frescor",
  lead_time: "Antecedência",
  deadline_urgency: "Urgência do prazo",
  organization_recurrence: "Recorrência do órgão",
  category_relevance: "Categoria",
  planning_confirmation: "Confirmação de planejamento",
  estimated_value: "Valor",
  data_quality: "Qualidade dos dados",
  source_confidence: "Confiança da fonte",
};
