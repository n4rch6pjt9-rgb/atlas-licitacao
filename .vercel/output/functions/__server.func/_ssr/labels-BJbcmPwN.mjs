import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-C_uf36nf.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/labels-BJbcmPwN.js
var TECHNOLOGY_LABELS = {
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
	UNKNOWN: "Desconhecida"
};
var FUNCTIONAL_LABELS = {
	PROCUREMENT_TRANSACTIONAL: "Transacional",
	PROCUREMENT_DISCOVERY: "Descoberta",
	PLANNING: "Planejamento",
	PRICE_RESEARCH: "Pesquisa de preços",
	ARP: "ARP",
	CONTRACTS: "Contratos",
	SUPPLIERS: "Fornecedores",
	TRANSPARENCY_HUB: "Hub de transparência",
	MULTI_FUNCTION: "Multifunção",
	UNKNOWN: "Desconhecida"
};
var EVIDENCE_LABELS = {
	VERIFIED: "Verificado",
	STRONG_INDICATION: "Indício forte",
	WEAK_INDICATION: "Indício fraco",
	UNKNOWN: "Desconhecido"
};
var STATE_LABELS = {
	DISCOVERED: "Descoberto",
	OBSERVED: "Observado",
	FINGERPRINTED: "Fingerprintado",
	CLASSIFIED: "Classificado",
	ADAPTER_READY: "Adapter pronto",
	INGESTING: "Ingerindo",
	DEGRADED: "Degradado",
	DISABLED: "Desativado"
};
var HEALTH_LABELS = {
	HEALTHY: "Saudável",
	DEGRADED: "Degradado",
	FAILING: "Falho",
	SCHEMA_CHANGED: "Schema alterado",
	PARSER_DEGRADED: "Parser degradado",
	DISABLED: "Desativado",
	UNKNOWN: "Desconhecido"
};
var CAPABILITY_SUPPORT_LABELS = {
	SUPPORTED: "Suportada",
	PARTIAL: "Parcial",
	NOT_SUPPORTED: "Não suportada",
	UNKNOWN: "Desconhecida",
	DEGRADED: "Degradada"
};
var DISCOVERY_CHANNEL_LABELS = {
	PROCESS: "Processos",
	DIRECT_BUY: "Compra direta",
	LOCATION: "Busca por localização",
	PLANNING: "Planejamento",
	ARP: "ARP",
	CONTRACT: "Contratos",
	OTHER: "Outro canal"
};
var CHANNEL_READINESS_LABELS = {
	READY: "Pronto para ingestão",
	OBSERVED: "Observado",
	BLOCKED: "Bloqueado",
	NOT_READY: "Não pronto"
};
var CONNECTOR_LABELS = {
	GENERIC_JSON: "generic-json",
	GENERIC_ACTION: "generic-action",
	GENERIC_JSF: "generic-jsf",
	EXTERNAL_LINK_HUB: "external-link-hub",
	PLANNING_ONLY: "planning-only",
	NONE: "nenhum"
};
var CAPABILITY_LABELS = {
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
	HISTORY: "Histórico"
};
var CLAIM_LABELS = {
	FATO_VERIFICADO: "Fato verificado",
	INFERENCIA: "Inferência",
	PENDENTE_DE_VALIDACAO: "Pendente de validação"
};
var OBSERVATION_LABELS = {
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
	OTHER: "Outro"
};
var EVIDENCE_TYPE_LABELS = {
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
	OTHER: "Outro"
};
var PAGINATION_LABELS = {
	PAGE_NUMBER: "Número de página",
	OFFSET_LIMIT: "Offset / limit",
	CURSOR: "Cursor",
	NEXT_LINK: "Link next",
	DATATABLES: "DataTables",
	JSF_VIEWSTATE: "JSF ViewState",
	SERVER_SIDE_FORM: "Formulário server-side",
	UNKNOWN: "Desconhecida"
};
var ACCESS_LABELS = {
	PUBLIC: "Público",
	AUTH_REQUIRED: "Autenticação exigida",
	UNKNOWN: "Desconhecido"
};
var ENDPOINT_TYPE_LABELS = {
	JSON_API: "API JSON",
	REST: "REST",
	FORM_POST: "POST de formulário",
	HTML_LIST: "Lista HTML",
	HTML_DETAIL: "Detalhe HTML",
	FILE_DOWNLOAD: "Download de arquivo",
	AJAX: "Ajax",
	GRAPHQL: "GraphQL",
	OTHER: "Outro"
};
var DISCOVERY_STRATEGY_LABELS = {
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
	UNKNOWN: "Desconhecida"
};
var LINK_STATUS_LABELS = {
	CONFIRMED: "Confirmado",
	PROBABLE: "Provável",
	REVIEW_REQUIRED: "Revisão necessária",
	REJECTED: "Rejeitado",
	UNMATCHED: "Sem match"
};
var ALERT_TYPE_LABELS = {
	NEW_SOURCE_DISCOVERED: "Nova fonte descoberta",
	SOURCE_FAMILY_CONFIRMED: "Família confirmada",
	SOURCE_VENDOR_CONFLICT: "Conflito de fornecedor",
	SCHEMA_CHANGED: "Schema alterado",
	PORTAL_FINGERPRINT_CHANGED: "Fingerprint alterado",
	ENDPOINT_DOWN: "Endpoint fora",
	ADAPTER_REUSABLE: "Adapter reutilizável",
	PARSER_DEGRADED: "Parser degradado"
};
var JURISDICTION_LABELS = {
	UNION: "União",
	STATE: "Estado",
	MUNICIPALITY: "Município",
	DISTRICT: "Distrito",
	PUBLIC_ENTITY: "Entidade pública",
	CONSORTIUM: "Consórcio",
	OTHER: "Outro"
};
var LOCAL_ONLY_LABELS = {
	MATCHED: "Com match",
	PENDING_PNCP_MATCH: "Aguardando PNCP",
	LOCAL_ONLY_PROVISIONAL: "Local-only provisório",
	LOCAL_ONLY_CONFIRMED: "Sem match nacional após a janela — não é ausência definitiva"
};
var PORTAL_PRESENCE_LABELS = {
	NO_PORTAL_FOUND: "Sem portal encontrado",
	PNCP_ONLY: "Só PNCP",
	EXTERNAL_PLATFORM: "Plataforma externa",
	MUNICIPAL_PORTAL: "Portal municipal",
	UNKNOWN: "Desconhecida"
};
var ADAPTER_FIT_LABELS = {
	GENERIC_JSON_FIT: "generic-json",
	GENERIC_ACTION_FIT: "generic-action",
	GENERIC_JSF_FIT: "generic-jsf",
	NEEDS_NEW_GENERIC_CAPABILITY: "nova capability genérica",
	NEEDS_VENDOR_ADAPTER: "adapter de vendor",
	UNSUITABLE: "inadequado agora"
};
var EARLY_KIND_LABELS = {
	EARLY_MATCHED: "Antecipado com match",
	LOCAL_ONLY_PROVISIONAL: "Local-only provisório",
	LOCAL_ONLY_CONFIRMED: "Sem match nacional após a janela — não é ausência definitiva",
	MATURED_NO_MATCH: "Sem match nacional após a janela — não é ausência definitiva",
	PENDING_PNCP_MATCH: "Aguardando PNCP",
	PENDING_MATCH: "Aguardando match nacional"
};
var DATA_ORIGIN_LABELS = {
	LIVE: "Live",
	GOLDEN: "Golden",
	FIXTURE: "Fixture",
	SYNTHETIC: "Sintético",
	UNKNOWN: "Origem desconhecida"
};
function localOnlyUxLabel(state) {
	if (!state) return "—";
	if (state === "LOCAL_ONLY_CONFIRMED" || state === "MATURED_NO_MATCH") return EARLY_KIND_LABELS.MATURED_NO_MATCH;
	return LOCAL_ONLY_LABELS[state] ?? EARLY_KIND_LABELS[state] ?? state;
}
var PUBLIC_KEY_SEMANTICS_LABELS = {
	PUBLIC_TENANT_IDENTIFIER: "Identificador público de tenant",
	PUBLIC_CLIENT_KEY: "Chave pública de cliente",
	PRIVATE_CREDENTIAL: "Credencial privada",
	UNKNOWN: "Semântica desconhecida"
};
var VALUE_CLASSIFICATION_LABELS = {
	PUBLIC: "Público",
	INTERNAL: "Interno",
	SECRET: "Segredo"
};
var CONNECTOR_READINESS_LABELS = {
	LIVE: "Live",
	FIXTURE: "Fixture",
	CONFIG_PENDING: "Config pendente",
	DEGRADED: "Degradado",
	AUTH_REQUIRED: "Auth necessária",
	CANDIDATE_CONFIG: "Config candidata"
};
var INGESTION_MODE_LABELS = {
	LIVE_PUBLIC_API: "API pública live",
	PUBLIC_EXPORT: "Exportação pública",
	PUBLIC_HTML: "HTML público",
	RECORDED_FIXTURE: "Fixture gravada",
	MANUAL_FIXTURE: "Fixture manual",
	DOCUMENTATION_SAMPLE: "Amostra de documentação",
	UNKNOWN: "Desconhecido"
};
var HORIZON_LABELS = {
	CURRENT: "Atual",
	EARLY: "Antecipada",
	PLANNED: "Planejada",
	RECURRENT_SIGNAL: "Sinal de recorrência"
};
var SIGNAL_LEVEL_LABELS = {
	NONE: "Sem sinal",
	LOW: "Baixo",
	MEDIUM: "Médio",
	HIGH: "Alto"
};
var PLANNING_ORIGIN_LABELS = {
	PCA_PNCP: "PCA (PNCP)",
	PGC_COMPRASGOV: "PGC (Compras.gov)"
};
var CONVERSION_LABELS = {
	CONFIRMED: "Convertido",
	PROBABLE: "Provável",
	REVIEW_REQUIRED: "Revisão",
	UNMATCHED: "Ainda sem contratação"
};
var ARP_SIGNAL_LABELS = {
	ACTIVE_ARP: "ARP ativa",
	HIGH_REMAINING_BALANCE: "Saldo alto",
	LOW_REMAINING_BALANCE: "Saldo baixo",
	RECENT_ADHESION: "Adesão recente",
	NEAR_EXPIRATION: "Perto do vencimento"
};
var IDENTITY_STATUS_LABELS = {
	CONFIRMED: "Confirmada",
	PROBABLE: "Provável",
	REVIEW_REQUIRED: "Revisão necessária"
};
var PRICE_KIND_LABELS = {
	ESTIMATED: "Estimado",
	AWARDED: "Homologado",
	ARP_REGISTERED: "Preço da ARP",
	PRACTICED: "Praticado"
};
var ATTENTION_COMPONENT_LABELS = {
	freshness: "Frescor",
	lead_time: "Antecedência",
	deadline_urgency: "Urgência do prazo",
	organization_recurrence: "Recorrência do órgão",
	category_relevance: "Categoria",
	planning_confirmation: "Confirmação de planejamento",
	estimated_value: "Valor",
	data_quality: "Qualidade dos dados",
	source_confidence: "Confiança da fonte"
};
//#endregion
export { PORTAL_PRESENCE_LABELS as A, INGESTION_MODE_LABELS as C, OBSERVATION_LABELS as D, LOCAL_ONLY_LABELS as E, TECHNOLOGY_LABELS as F, VALUE_CLASSIFICATION_LABELS as I, localOnlyUxLabel as L, PUBLIC_KEY_SEMANTICS_LABELS as M, SIGNAL_LEVEL_LABELS as N, PAGINATION_LABELS as O, STATE_LABELS as P, cn as R, IDENTITY_STATUS_LABELS as S, LINK_STATUS_LABELS as T, EVIDENCE_LABELS as _, ATTENTION_COMPONENT_LABELS as a, HEALTH_LABELS as b, CHANNEL_READINESS_LABELS as c, CONNECTOR_READINESS_LABELS as d, CONVERSION_LABELS as f, ENDPOINT_TYPE_LABELS as g, DISCOVERY_STRATEGY_LABELS as h, ARP_SIGNAL_LABELS as i, PRICE_KIND_LABELS as j, PLANNING_ORIGIN_LABELS as k, CLAIM_LABELS as l, DISCOVERY_CHANNEL_LABELS as m, ADAPTER_FIT_LABELS as n, CAPABILITY_LABELS as o, DATA_ORIGIN_LABELS as p, ALERT_TYPE_LABELS as r, CAPABILITY_SUPPORT_LABELS as s, ACCESS_LABELS as t, CONNECTOR_LABELS as u, EVIDENCE_TYPE_LABELS as v, JURISDICTION_LABELS as w, HORIZON_LABELS as x, FUNCTIONAL_LABELS as y };
