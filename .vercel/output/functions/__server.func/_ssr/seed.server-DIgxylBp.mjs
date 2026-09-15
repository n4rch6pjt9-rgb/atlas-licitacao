import { a as toPublicPncpUrl, i as pncpEditalUrl, n as PNCP_OFFICIAL_NAME } from "./pncp-url-CkM9bQPG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seed.server-DIgxylBp.js
/**
* Build a catalog row. Framework signatures are never vendor claims.
*/
function sig(input) {
	return {
		id: input.id,
		technology_family: input.technology_family,
		signature_type: input.signature_type,
		key: input.key ?? input.signature_type.toLowerCase(),
		pattern: input.pattern,
		weight: input.weight,
		required: input.required ?? false,
		description: input.description ?? "",
		source_url: input.source_url ?? null,
		is_vendor_claim: input.is_vendor_claim ?? false
	};
}
/**
* Generic framework markers only. Do not catalog speculative
* Paradigma / WBC / Fiorilli route signatures here.
*/
var FRAMEWORK_SIGNATURES = [
	sig({
		id: "sig_jsf_xhtml",
		technology_family: "GENERIC_JSF",
		signature_type: "PAGE_SUFFIX",
		key: "page_suffix",
		pattern: ".xhtml",
		weight: 5,
		is_vendor_claim: false,
		description: "JSF Facelets page suffix"
	}),
	sig({
		id: "sig_jsf_jsession",
		technology_family: "GENERIC_JSF",
		signature_type: "COOKIE_NAME",
		key: "cookie_name",
		pattern: "JSESSIONID",
		weight: 2,
		is_vendor_claim: false,
		description: "Servlet container session cookie (not a vendor proof)"
	}),
	sig({
		id: "sig_jsf_viewstate",
		technology_family: "GENERIC_JSF",
		signature_type: "JS_GLOBAL",
		key: "js_global",
		pattern: "javax.faces.ViewState",
		weight: 10,
		is_vendor_claim: false,
		description: "JSF ViewState hidden field / partial request marker"
	}),
	sig({
		id: "sig_action_suffix",
		technology_family: "GENERIC_STRUTS_ACTION",
		signature_type: "PAGE_SUFFIX",
		key: "page_suffix",
		pattern: ".action",
		weight: 5,
		is_vendor_claim: false,
		description: "Struts / .action page suffix"
	}),
	sig({
		id: "sig_json_api_path",
		technology_family: "GENERIC_JSON_API",
		signature_type: "ROUTE_SIGNATURE",
		key: "route",
		pattern: "/api/",
		weight: 8,
		is_vendor_claim: false,
		description: "Public /api/ route prefix"
	}),
	sig({
		id: "sig_json_content",
		technology_family: "GENERIC_JSON_API",
		signature_type: "HEADER",
		key: "content_type",
		pattern: "application/json",
		weight: 15,
		is_vendor_claim: false,
		description: "JSON Content-Type"
	}),
	sig({
		id: "sig_asp_aspx",
		technology_family: "GENERIC_ASP",
		signature_type: "PAGE_SUFFIX",
		key: "page_suffix",
		pattern: ".aspx",
		weight: 5,
		is_vendor_claim: false,
		description: "ASP.NET WebForms / MVC page suffix"
	}),
	sig({
		id: "sig_asp_viewstate",
		technology_family: "GENERIC_ASP",
		signature_type: "JS_GLOBAL",
		key: "js_global",
		pattern: "__VIEWSTATE",
		weight: 8,
		is_vendor_claim: false,
		description: "ASP.NET ViewState field"
	}),
	sig({
		id: "sig_spa_reactroot",
		technology_family: "GENERIC_SPA",
		signature_type: "JS_GLOBAL",
		key: "js_global",
		pattern: "data-reactroot",
		weight: 6,
		is_vendor_claim: false,
		description: "React mount marker"
	}),
	sig({
		id: "sig_spa_ngversion",
		technology_family: "GENERIC_SPA",
		signature_type: "JS_GLOBAL",
		key: "js_global",
		pattern: "ng-version",
		weight: 6,
		is_vendor_claim: false,
		description: "Angular version attribute"
	}),
	sig({
		id: "sig_asp_mvc_header",
		technology_family: "GENERIC_ASP",
		signature_type: "SERVER_HEADER",
		key: "header",
		pattern: "X-AspNetMvc-Version",
		weight: 8,
		is_vendor_claim: false,
		description: "Header ASP.NET MVC — framework, não fornecedor."
	})
];
/**
* Learned AFTER official vendor evidence. Never invent a vendor from HTML
* similarity alone.
*/
var LEARNED_VENDOR_SIGNATURES = [
	sig({
		id: "sig_bll_process_search",
		technology_family: "BLL",
		signature_type: "ROUTE_SIGNATURE",
		key: "pathname",
		pattern: "/Process/ProcessSearchPublic",
		weight: 40,
		is_vendor_claim: true,
		source_url: "https://bllcompras.com/Process/ProcessSearchPublic?param1=0",
		description: "Rota pública do produto BLL Compras, observada após listagem Transferegov."
	}),
	sig({
		id: "sig_bll_process_view",
		technology_family: "BLL",
		signature_type: "ROUTE_SIGNATURE",
		key: "pathname",
		pattern: "/Process/ProcessView",
		weight: 40,
		is_vendor_claim: true,
		source_url: "https://bllcompras.com/Process/ProcessSearchPublic?param1=5",
		description: "Detalhe público ProcessView no contrato HTML da BLL."
	}),
	sig({
		id: "sig_bll_host",
		technology_family: "BLL",
		signature_type: "URL_PATH",
		key: "host",
		pattern: "bllcompras.com",
		weight: 40,
		is_vendor_claim: true,
		source_url: "https://bllcompras.com/",
		description: "Host oficial da plataforma BLL Compras."
	}),
	sig({
		id: "sig_bll_direct_buy_search",
		technology_family: "BLL",
		signature_type: "ROUTE_SIGNATURE",
		key: "pathname",
		pattern: "/DirectBuy/DirectBuySearchPublic",
		weight: 40,
		is_vendor_claim: true,
		source_url: "https://bllcompras.com/DirectBuy/DirectBuySearchPublic",
		description: "Superfície pública Compra Direta da BLL. Não é filtro de ProcessSearchPublic."
	}),
	sig({
		id: "sig_bll_direct_buy_view",
		technology_family: "BLL",
		signature_type: "ROUTE_SIGNATURE",
		key: "pathname",
		pattern: "/DirectBuy/DirectBuyView",
		weight: 40,
		is_vendor_claim: true,
		source_url: "https://bllcompras.com/DirectBuy/DirectBuySearchPublic",
		description: "Detalhe público DirectBuyView. Identidade via param1 opaco, não decodificado."
	}),
	sig({
		id: "sig_bll_location_search",
		technology_family: "BLL",
		signature_type: "ROUTE_SIGNATURE",
		key: "pathname",
		pattern: "/Process/ProcessSearchPublicByLocation",
		weight: 20,
		is_vendor_claim: true,
		source_url: "https://bllcompras.com/Process/ProcessSearchPublicByLocation",
		description: "Menu público Busca por Localização. Utilidade de ingestão ainda pendente."
	}),
	sig({
		id: "sig_pcp_host",
		technology_family: "PORTAL_COMPRAS_PUBLICAS",
		signature_type: "URL_PATH",
		key: "host",
		pattern: "portaldecompraspublicas.com.br",
		weight: 40,
		is_vendor_claim: true,
		source_url: "https://www.portaldecompraspublicas.com.br/",
		description: "Host oficial do Portal de Compras Públicas (eCustomize)."
	}),
	sig({
		id: "sig_fiorilli_comprasedital",
		technology_family: "SCPI_FIORILLI",
		signature_type: "ROUTE_SIGNATURE",
		key: "pathname",
		pattern: "/comprasedital",
		weight: 40,
		is_vendor_claim: true,
		description: "Path /comprasedital citado em editais oficiais SCPI Fiorilli (Itapira, Irapuã, Urupês, Assis, Sales)."
	}),
	sig({
		id: "sig_paradigma_egov_title",
		technology_family: "PARADIGMA_WBC",
		signature_type: "PAGE_TEXT",
		key: "title",
		pattern: "Paradigma EGOV",
		weight: 40,
		is_vendor_claim: true,
		source_url: "https://wbc.pmf.sc.gov.br/",
		description: "Título público 'Paradigma EGOV' no portal municipal de Florianópolis — aprendido depois da evidência de produto, não o contrário."
	}),
	sig({
		id: "sig_paradigma_powered",
		technology_family: "PARADIGMA_WBC",
		signature_type: "PAGE_TEXT",
		key: "page_text",
		pattern: "Powered by Paradigma",
		weight: 40,
		is_vendor_claim: true,
		description: "Rodapé 'Powered by Paradigma®' em portais WBC/EGOV. Só conta após evidência comercial; não prova fornecedor sozinho."
	}),
	sig({
		id: "sig_fiorilli_css",
		technology_family: "SCPI_FIORILLI",
		signature_type: "CSS_PATH",
		key: "css_path",
		pattern: "fiorilli.css",
		weight: 40,
		is_vendor_claim: true,
		source_url: "https://scpi.assis.sp.gov.br:8079/comprasedital/",
		description: "Stylesheet fiorilli.css observado ao vivo em Assis (SCPI ExtJS). Aprendido DEPOIS da evidência institucional, não o contrário."
	}),
	sig({
		id: "sig_fiorilli_dll",
		technology_family: "SCPI_FIORILLI",
		signature_type: "ROUTE_SIGNATURE",
		key: "pathname",
		pattern: "comprasedital.dll",
		weight: 40,
		is_vendor_claim: true,
		source_url: "https://scpi.assis.sp.gov.br:8079/comprasedital/",
		description: "Endpoint comprasedital.dll do SPA ExtJS SCPI. Sem lista HTML/JSON pública no GET inicial."
	}),
	sig({
		id: "sig_paradigma_portalcss",
		technology_family: "PARADIGMA_WBC",
		signature_type: "CSS_PATH",
		key: "css_path",
		pattern: "/portal/css/portalcss",
		weight: 40,
		is_vendor_claim: true,
		source_url: "https://wbc.pmf.sc.gov.br/",
		description: "Asset compartilhado /portal/css/portalcss em Florianópolis e Barueri (ASP.NET + kendoUI, não JSF). Aprendido ao vivo após evidência de produto."
	})
];
[...FRAMEWORK_SIGNATURES, ...LEARNED_VENDOR_SIGNATURES];
var JSONB_KEYS = /* @__PURE__ */ new Set([
	"raw_metadata",
	"raw_payload",
	"request_schema",
	"response_schema",
	"raw_result",
	"field_paths",
	"type_map",
	"paths_json",
	"default_params_json",
	"headers_json",
	"pagination_config",
	"normalization_config",
	"document_config",
	"payload"
]);
async function upsert(sql, table, row, pk = "id") {
	const keys = Object.keys(row);
	const cols = keys.join(", ");
	const placeholders = keys.map((key, i) => JSONB_KEYS.has(key) ? `$${i + 1}::jsonb` : `$${i + 1}`).join(", ");
	const params = keys.map((key) => {
		const value = row[key];
		if (value === void 0) return null;
		if (JSONB_KEYS.has(key)) {
			if (value === null) return null;
			return typeof value === "string" ? value : JSON.stringify(value);
		}
		return value;
	});
	await sql.query(`insert into ${table} (${cols}) values (${placeholders}) on conflict (${pk}) do nothing`, params);
}
/**
* Extra seed signatures (unique ids). Catalog rows come from `./signatures`.
* Framework weights stay in the GENERIC_FRAMEWORK band.
* Do not treat these as vendor proof (Paradigma, Fiorilli, etc.).
*/
var EXTRA_SEED_SIGNATURES = [
	{
		id: "sig_fw_json_api_path",
		technology_family: "GENERIC_JSON_API",
		signature_type: "URL_PATH",
		key: "pathname",
		pattern: "/api/",
		weight: 10,
		required: false,
		description: "Caminho público /api/ — indica API JSON genérica, não fornecedor.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_json_content_type",
		technology_family: "GENERIC_JSON_API",
		signature_type: "HEADER",
		key: "content_type",
		pattern: "application/json",
		weight: 8,
		required: false,
		description: "Content-Type application/json em recurso público.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_json_field",
		technology_family: "GENERIC_JSON_API",
		signature_type: "JSON_FIELD",
		key: "json_field",
		pattern: "processo",
		weight: 5,
		required: false,
		description: "Campo JSON genérico observado em APIs de editais.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_jsf_xhtml",
		technology_family: "GENERIC_JSF",
		signature_type: "ROUTE_SIGNATURE",
		key: "page_suffix",
		pattern: ".xhtml",
		weight: 12,
		required: false,
		description: "Sufixo .xhtml indica JSF genérico — NÃO prova Paradigma/WBC.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_jsf_jsf",
		technology_family: "GENERIC_JSF",
		signature_type: "ROUTE_SIGNATURE",
		key: "page_suffix",
		pattern: ".jsf",
		weight: 10,
		required: false,
		description: "Sufixo .jsf — framework JSF, não produto comercial.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_jsf_faces",
		technology_family: "GENERIC_JSF",
		signature_type: "ROUTE_SIGNATURE",
		key: "page_suffix",
		pattern: ".faces",
		weight: 8,
		required: false,
		description: "Sufixo .faces — JSF genérico.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_jsf_viewstate",
		technology_family: "GENERIC_JSF",
		signature_type: "PARAMETER_NAME",
		key: "viewstate",
		pattern: "javax.faces.ViewState",
		weight: 12,
		required: false,
		description: "javax.faces.ViewState — marcador JSF, não fornecedor.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_jsf_primefaces",
		technology_family: "GENERIC_JSF",
		signature_type: "JS_GLOBAL",
		key: "js_global",
		pattern: "PrimeFaces",
		weight: 8,
		required: false,
		description: "PrimeFaces é biblioteca JSF, não identificação de vendor de compras.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_jsf_jsessionid",
		technology_family: "GENERIC_JSF",
		signature_type: "COOKIE_NAME",
		key: "cookie_name",
		pattern: "JSESSIONID",
		weight: 3,
		required: false,
		description: "JSESSIONID é cookie Java genérico — evidência fraca de framework.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_struts_action",
		technology_family: "GENERIC_STRUTS_ACTION",
		signature_type: "ROUTE_SIGNATURE",
		key: "page_suffix",
		pattern: ".action",
		weight: 15,
		required: false,
		description: "Sufixo .action — Struts/action genérico, não fornecedor.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_struts_text",
		technology_family: "GENERIC_STRUTS_ACTION",
		signature_type: "PAGE_TEXT",
		key: "framework",
		pattern: "struts.action",
		weight: 8,
		required: false,
		description: "Texto struts.action observado no HTML.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_asp_aspx",
		technology_family: "GENERIC_ASP",
		signature_type: "ROUTE_SIGNATURE",
		key: "page_suffix",
		pattern: ".aspx",
		weight: 12,
		required: false,
		description: "Sufixo .aspx — ASP.NET genérico.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_asp_viewstate",
		technology_family: "GENERIC_ASP",
		signature_type: "PARAMETER_NAME",
		key: "viewstate",
		pattern: "__VIEWSTATE",
		weight: 12,
		required: false,
		description: "__VIEWSTATE — WebForms, não produto de compras.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_asp_postback",
		technology_family: "GENERIC_ASP",
		signature_type: "JS_GLOBAL",
		key: "js_global",
		pattern: "__doPostBack",
		weight: 8,
		required: false,
		description: "__doPostBack — ASP.NET WebForms genérico.",
		source_url: null,
		is_vendor_claim: false
	},
	{
		id: "sig_fw_pncp_consulta",
		technology_family: "PNCP",
		signature_type: "URL_PATH",
		key: "pathname",
		pattern: "/api/consulta",
		weight: 20,
		required: false,
		description: "API pública de consulta do Portal Nacional de Contratações Públicas.",
		source_url: "https://pncp.gov.br/api/consulta",
		is_vendor_claim: false
	},
	{
		id: "sig_fw_pncp_editais",
		technology_family: "PNCP",
		signature_type: "URL_PATH",
		key: "pathname",
		pattern: "/app/editais/",
		weight: 20,
		required: false,
		description: "Página pública de edital. Padrão: /app/editais/{cnpj}-{unidade}-{numero}/{ano}.",
		source_url: "https://pncp.gov.br/app/editais",
		is_vendor_claim: false
	},
	{
		id: "sig_fw_comprasgov_dados",
		technology_family: "COMPRAS_GOV",
		signature_type: "URL_PATH",
		key: "pathname",
		pattern: "dadosabertos.compras.gov.br",
		weight: 20,
		required: false,
		description: "Host da API de dados abertos do Compras.gov.br.",
		source_url: "https://dadosabertos.compras.gov.br",
		is_vendor_claim: false
	}
];
var SOURCES = [
	{
		id: "src_sc_compras",
		jurisdiction_id: "jur_sc",
		name: "Compras SC",
		slug: "compras-sc",
		base_url: "https://www.compras.sc.gov.br",
		functional_family: "PROCUREMENT_DISCOVERY",
		technology_family: "GENERIC_JSON_API",
		vendor_name: null,
		product_name: null,
		vendor_evidence_level: "UNKNOWN",
		vendor_confidence: 0,
		public_access: true,
		pncp_overlap: false,
		comprasgov_overlap: false,
		discovery_strategy: "PUBLIC_JSON_API",
		connector_type: "GENERIC_JSON",
		connector_version: "1",
		classification_state: "ADAPTER_READY",
		notes: "FATO — rotas JSON públicas: GET /api/modalidades-filtro, /api/situacoes-filtro, /api/orgaos-filtro, /api/editais?ano=&situacao=. Envelope: conteudo[], pagina, porPagina, totalPaginas, totalElementos. Query page/size/pagina/porPagina NÃO altera o payload (observado 2026-09-14). Sem situacao o JSON de 2026 estoura o cap de 512KB. Família de FORNECEDOR desconhecida. NÃO classificar como Paradigma sem evidência oficial."
	},
	{
		id: "src_rj_siga",
		jurisdiction_id: "jur_rj",
		name: "SIGA RJ",
		slug: "siga-rj",
		base_url: "https://www.compras.rj.gov.br/Portal-Siga/",
		functional_family: "MULTI_FUNCTION",
		technology_family: "GENERIC_STRUTS_ACTION",
		vendor_name: null,
		product_name: "SIGA",
		vendor_evidence_level: "UNKNOWN",
		vendor_confidence: 0,
		public_access: true,
		pncp_overlap: false,
		comprasgov_overlap: false,
		discovery_strategy: "STRUTS_ACTION",
		connector_type: "GENERIC_ACTION",
		connector_version: "1",
		classification_state: "CLASSIFIED",
		notes: "FATO — rotas públicas .action observadas em 2026-09-14: /Portal-Siga/Fornecedor/buscar.action (pesquisar.action retorna 404), /Portal-Siga/AtaRegistroPreco/buscar.action, /Portal-Siga/Contrato/buscar.action, /Portal-Siga/EditaisLicitacoes/buscar.action. Família técnica GENERIC_STRUTS_ACTION. Fornecedor comercial NÃO verificado. Filtros da listagem usam POST de formulário — GET só entrega o formulário."
	},
	{
		id: "src_pa_compraspara",
		jurisdiction_id: "jur_pa",
		name: "Compras Pará (mural)",
		slug: "compraspara-pa",
		base_url: "https://www.sistemas.pa.gov.br/compraspara/public/licitacao_list.xhtml",
		functional_family: "PROCUREMENT_DISCOVERY",
		technology_family: "GENERIC_JSF",
		vendor_name: null,
		product_name: null,
		vendor_evidence_level: "UNKNOWN",
		vendor_confidence: 0,
		public_access: true,
		pncp_overlap: false,
		comprasgov_overlap: false,
		discovery_strategy: "JSF_POSTBACK",
		connector_type: "GENERIC_JSF",
		connector_version: "1",
		classification_state: "CLASSIFIED",
		notes: "FATO — sufixo .xhtml na listagem pública licitacao_list.xhtml. Classificação GENERIC_JSF — NÃO Paradigma. PENDENTE de validação de fornecedor."
	},
	{
		id: "src_pa_portal",
		jurisdiction_id: "jur_pa",
		name: "Portal Compraspará",
		slug: "compraspara-hub-pa",
		base_url: "https://www.compraspara.pa.gov.br/",
		functional_family: "TRANSPARENCY_HUB",
		technology_family: "UNKNOWN",
		vendor_name: null,
		product_name: null,
		vendor_evidence_level: "UNKNOWN",
		vendor_confidence: 0,
		public_access: true,
		pncp_overlap: false,
		comprasgov_overlap: false,
		discovery_strategy: "EXTERNAL_LINK_HUB",
		connector_type: "EXTERNAL_LINK_HUB",
		connector_version: "1",
		classification_state: "OBSERVED",
		notes: "Hub institucional de transparência. Relaciona-se ao mural JSF (src_pa_compraspara) via LINKS_TO. Família de fornecedor desconhecida."
	},
	{
		id: "src_go_comprasnet",
		jurisdiction_id: "jur_go",
		name: "COMPRASNET.GO",
		slug: "comprasnet-go",
		base_url: "https://www.comprasnet.go.gov.br/",
		functional_family: "MULTI_FUNCTION",
		technology_family: "SISTEMA_PROPRIO",
		vendor_name: "Governo de Goiás",
		product_name: "COMPRASNET.GO",
		vendor_evidence_level: "VERIFIED",
		vendor_confidence: 1,
		public_access: true,
		pncp_overlap: false,
		comprasgov_overlap: false,
		discovery_strategy: "UNKNOWN",
		connector_type: "NONE",
		connector_version: null,
		classification_state: "CLASSIFIED",
		notes: "FATO — Transferegov lista COMPRASNET.GO como sistema do Governo do Estado de Goiás (não família comercial). Product name COMPRASNET.GO. SISLOG é o nome do novo portal institucional; PENDENTE distinguir frontend vs sistema transacional."
	},
	{
		id: "src_mg_portal",
		jurisdiction_id: "jur_mg",
		name: "Portal de Compras MG",
		slug: "portal-compras-mg",
		base_url: "https://compras.mg.gov.br/",
		functional_family: "MULTI_FUNCTION",
		technology_family: "SISTEMA_PROPRIO",
		vendor_name: "Governo de Minas Gerais",
		product_name: "Portal de Compras MG",
		vendor_evidence_level: "STRONG_INDICATION",
		vendor_confidence: .7,
		public_access: true,
		pncp_overlap: false,
		comprasgov_overlap: false,
		discovery_strategy: "HTML_LIST",
		connector_type: "NONE",
		connector_version: null,
		classification_state: "OBSERVED",
		notes: "FATO institucional — compras.mg.gov.br é o Portal de Compras previsto em decreto estadual, frontend público do ecossistema SIAD. Não tratar o portal como o único sistema. Fornecedor comercial não identificado."
	},
	{
		id: "src_mg_siad",
		jurisdiction_id: "jur_mg",
		name: "SIAD-MG",
		slug: "siad-mg",
		base_url: "https://compras.mg.gov.br/",
		functional_family: "MULTI_FUNCTION",
		technology_family: "SISTEMA_PROPRIO",
		vendor_name: "Governo de Minas Gerais",
		product_name: "SIAD",
		vendor_evidence_level: "STRONG_INDICATION",
		vendor_confidence: .7,
		public_access: false,
		pncp_overlap: false,
		comprasgov_overlap: false,
		discovery_strategy: "UNKNOWN",
		connector_type: "NONE",
		connector_version: null,
		classification_state: "OBSERVED",
		notes: "SIAD (Sistema Integrado de Administração de Materiais e Serviços), instituído por decreto estadual. Sistema corporativo; acesso transacional não tratado como público. PENDENTE mapear endpoints públicos além do portal."
	},
	{
		id: "src_mg_sirp",
		jurisdiction_id: "jur_mg",
		name: "SIRP-MG",
		slug: "sirp-mg",
		base_url: "https://compras.mg.gov.br/",
		functional_family: "ARP",
		technology_family: "SISTEMA_PROPRIO",
		vendor_name: "Governo de Minas Gerais",
		product_name: "SIRP",
		vendor_evidence_level: "STRONG_INDICATION",
		vendor_confidence: .7,
		public_access: false,
		pncp_overlap: false,
		comprasgov_overlap: false,
		discovery_strategy: "UNKNOWN",
		connector_type: "NONE",
		connector_version: null,
		classification_state: "OBSERVED",
		notes: "SIRP é o módulo de Registro de Preços do SIAD, não um portal independente. Relacionar ao SIAD/Portal. Adapter próprio não justificado até evidência de API pública."
	},
	{
		id: "src_pi_central",
		jurisdiction_id: "jur_pi",
		name: "Central de Compras PI",
		slug: "central-compras-pi",
		base_url: "https://centraldecompras.sead.pi.gov.br/",
		functional_family: "TRANSPARENCY_HUB",
		technology_family: "UNKNOWN",
		vendor_name: null,
		product_name: null,
		vendor_evidence_level: "UNKNOWN",
		vendor_confidence: 0,
		public_access: true,
		pncp_overlap: false,
		comprasgov_overlap: false,
		discovery_strategy: "EXTERNAL_LINK_HUB",
		connector_type: "EXTERNAL_LINK_HUB",
		connector_version: "1",
		classification_state: "OBSERVED",
		notes: "Hub da Superintendência de Licitações e Contratos / SEAD-PI. Provável TRANSPARENCY_HUB com links para sistemas de execução. Família tecnológica PENDENTE_DE_VALIDACAO."
	},
	{
		id: "src_pr_pcae",
		jurisdiction_id: "jur_pr",
		name: "PCA-E Paraná",
		slug: "pca-e-pr",
		base_url: "https://www.planejamento.pr.gov.br/Pagina/PCA-E",
		functional_family: "PLANNING",
		technology_family: "UNKNOWN",
		vendor_name: null,
		product_name: "PCA-E",
		vendor_evidence_level: "UNKNOWN",
		vendor_confidence: 0,
		public_access: true,
		pncp_overlap: false,
		comprasgov_overlap: false,
		discovery_strategy: "FILE_EXPORT",
		connector_type: "PLANNING_ONLY",
		connector_version: "1",
		classification_state: "CLASSIFIED",
		notes: "FATO — PCA-E/SPCA-E é instrumento de planejamento (Lei 14.133 / Decreto estadual 10.086/2022), publicado pela SEPL. NÃO tratar como fonte completa de licitação."
	},
	{
		id: "src_br_pncp",
		jurisdiction_id: "jur_br",
		name: "Portal Nacional de Contratações Públicas",
		slug: "pncp",
		base_url: "https://pncp.gov.br",
		functional_family: "MULTI_FUNCTION",
		technology_family: "PNCP",
		vendor_name: null,
		product_name: "PNCP",
		vendor_evidence_level: "VERIFIED",
		vendor_confidence: 1,
		public_access: true,
		pncp_overlap: true,
		comprasgov_overlap: false,
		discovery_strategy: "PUBLIC_JSON_API",
		connector_type: "GENERIC_JSON",
		connector_version: "1",
		classification_state: "ADAPTER_READY",
		notes: "FATO — Portal Nacional de Contratações Públicas. URL pública de edital: https://pncp.gov.br/app/editais/{cnpj}-{unidade}-{numero}/{ano} (ex.: https://pncp.gov.br/app/editais/75442756000190-1-001001/2026). API de consulta em /api/consulta. Discover: /api/consulta/v1/contratacoes/publicacao. /api/consulta/v1/orgaos — PENDENTE confirmar contrato estável deste path."
	},
	{
		id: "src_br_comprasgov",
		jurisdiction_id: "jur_br",
		name: "Compras.gov.br",
		slug: "compras-gov",
		base_url: "https://dadosabertos.compras.gov.br",
		functional_family: "MULTI_FUNCTION",
		technology_family: "COMPRAS_GOV",
		vendor_name: null,
		product_name: "Compras.gov.br",
		vendor_evidence_level: "VERIFIED",
		vendor_confidence: 1,
		public_access: true,
		pncp_overlap: false,
		comprasgov_overlap: true,
		discovery_strategy: "PUBLIC_JSON_API",
		connector_type: "GENERIC_JSON",
		connector_version: "1",
		classification_state: "CLASSIFIED",
		notes: "FATO — API de dados abertos em dadosabertos.compras.gov.br (SIASG / Compras.gov). Portal institucional: https://www.gov.br/compras/pt-br. Paths de discovery específicos PENDENTE de mapeamento por módulo. NÃO declarar ADAPTER_READY sem path de discover."
	}
];
var OBSERVATIONS = [
	{
		id: "obs_sc_route_modalidades",
		source_system_id: "src_sc_compras",
		observation_type: "ROUTE",
		key: "pathname",
		value: "/api/modalidades-filtro",
		source_url: "https://www.compras.sc.gov.br/api/modalidades-filtro"
	},
	{
		id: "obs_sc_route_situacoes",
		source_system_id: "src_sc_compras",
		observation_type: "ROUTE",
		key: "pathname",
		value: "/api/situacoes-filtro",
		source_url: "https://www.compras.sc.gov.br/api/situacoes-filtro"
	},
	{
		id: "obs_sc_route_orgaos",
		source_system_id: "src_sc_compras",
		observation_type: "ROUTE",
		key: "pathname",
		value: "/api/orgaos-filtro",
		source_url: "https://www.compras.sc.gov.br/api/orgaos-filtro"
	},
	{
		id: "obs_sc_route_editais",
		source_system_id: "src_sc_compras",
		observation_type: "ROUTE",
		key: "pathname",
		value: "/api/editais",
		source_url: "https://www.compras.sc.gov.br/api/editais"
	},
	{
		id: "obs_sc_json_id",
		source_system_id: "src_sc_compras",
		observation_type: "JSON_FIELD",
		key: "json_field",
		value: "id",
		source_url: "https://www.compras.sc.gov.br/api/editais"
	},
	{
		id: "obs_sc_json_processo",
		source_system_id: "src_sc_compras",
		observation_type: "JSON_FIELD",
		key: "json_field",
		value: "processo",
		source_url: "https://www.compras.sc.gov.br/api/editais"
	},
	{
		id: "obs_sc_json_tipo",
		source_system_id: "src_sc_compras",
		observation_type: "JSON_FIELD",
		key: "json_field",
		value: "tipo",
		source_url: "https://www.compras.sc.gov.br/api/editais"
	},
	{
		id: "obs_sc_json_orgao_sigla",
		source_system_id: "src_sc_compras",
		observation_type: "JSON_FIELD",
		key: "json_field",
		value: "orgaoSigla",
		source_url: "https://www.compras.sc.gov.br/api/editais"
	},
	{
		id: "obs_sc_json_orgao_nome",
		source_system_id: "src_sc_compras",
		observation_type: "JSON_FIELD",
		key: "json_field",
		value: "orgaoNome",
		source_url: "https://www.compras.sc.gov.br/api/editais"
	},
	{
		id: "obs_sc_json_objeto",
		source_system_id: "src_sc_compras",
		observation_type: "JSON_FIELD",
		key: "json_field",
		value: "objeto",
		source_url: "https://www.compras.sc.gov.br/api/editais"
	},
	{
		id: "obs_sc_json_entrega",
		source_system_id: "src_sc_compras",
		observation_type: "JSON_FIELD",
		key: "json_field",
		value: "entregaProposta",
		source_url: "https://www.compras.sc.gov.br/api/editais"
	},
	{
		id: "obs_sc_json_abertura",
		source_system_id: "src_sc_compras",
		observation_type: "JSON_FIELD",
		key: "json_field",
		value: "abertura",
		source_url: "https://www.compras.sc.gov.br/api/editais"
	},
	{
		id: "obs_sc_json_situacao",
		source_system_id: "src_sc_compras",
		observation_type: "JSON_FIELD",
		key: "json_field",
		value: "situacao",
		source_url: "https://www.compras.sc.gov.br/api/editais"
	},
	{
		id: "obs_rj_suffix_action",
		source_system_id: "src_rj_siga",
		observation_type: "PAGE_SUFFIX",
		key: "page_suffix",
		value: ".action",
		source_url: "https://www.compras.rj.gov.br/Portal-Siga/"
	},
	{
		id: "obs_rj_route_fornecedor",
		source_system_id: "src_rj_siga",
		observation_type: "ROUTE",
		key: "pathname",
		value: "/Portal-Siga/Fornecedor/buscar.action",
		source_url: "https://www.compras.rj.gov.br/Portal-Siga/Fornecedor/buscar.action"
	},
	{
		id: "obs_rj_route_ata",
		source_system_id: "src_rj_siga",
		observation_type: "ROUTE",
		key: "pathname",
		value: "/Portal-Siga/AtaRegistroPreco/buscar.action",
		source_url: "https://www.compras.rj.gov.br/Portal-Siga/AtaRegistroPreco/buscar.action"
	},
	{
		id: "obs_rj_route_contrato",
		source_system_id: "src_rj_siga",
		observation_type: "ROUTE",
		key: "pathname",
		value: "/Portal-Siga/Contrato/buscar.action",
		source_url: "https://www.compras.rj.gov.br/Portal-Siga/Contrato/buscar.action"
	},
	{
		id: "obs_pa_suffix_xhtml",
		source_system_id: "src_pa_compraspara",
		observation_type: "PAGE_SUFFIX",
		key: "page_suffix",
		value: ".xhtml",
		source_url: "https://www.sistemas.pa.gov.br/compraspara/public/licitacao_list.xhtml"
	},
	{
		id: "obs_pa_route_list",
		source_system_id: "src_pa_compraspara",
		observation_type: "ROUTE",
		key: "pathname",
		value: "/compraspara/public/licitacao_list.xhtml",
		source_url: "https://www.sistemas.pa.gov.br/compraspara/public/licitacao_list.xhtml"
	}
];
async function rewriteUrlColumn(sql, table, column) {
	const rows = await sql.query(`select id, ${column} as url from ${table}
     where ${column} is not null and ${column} ilike '%pncp.gov.br%'`);
	for (const row of rows) {
		const next = toPublicPncpUrl(row.url);
		if (next !== row.url) await sql.query(`update ${table} set ${column} = $1 where id = $2`, [next, row.id]);
	}
}
async function repairPncpPublicUrls(sql) {
	await sql.query(`update source_system
     set name = $1,
         product_name = 'PNCP',
         base_url = 'https://pncp.gov.br',
         notes = $2
     where id = 'src_br_pncp'`, [PNCP_OFFICIAL_NAME, "FATO — Portal Nacional de Contratações Públicas. URL pública de edital: https://pncp.gov.br/app/editais/{cnpj}-{unidade}-{numero}/{ano} (ex.: https://pncp.gov.br/app/editais/75442756000190-1-001001/2026). API de consulta em /api/consulta. Discover: /api/consulta/v1/contratacoes/publicacao."]);
	await rewriteUrlColumn(sql, "source_record", "source_url");
	await rewriteUrlColumn(sql, "source_evidence", "url");
	await rewriteUrlColumn(sql, "source_observation", "source_url");
	const records = await sql.query(`select id, source_identifier, source_url from source_record
     where source_system_id = 'src_br_pncp'`);
	for (const rec of records) {
		const next = pncpEditalUrl(rec.source_identifier) ?? toPublicPncpUrl(rec.source_url);
		if (next !== rec.source_url) await sql.query(`update source_record set source_url = $1 where id = $2`, [next, rec.id]);
	}
	await upsert(sql, "source_endpoint", {
		id: "ep_pncp_editais",
		source_system_id: "src_br_pncp",
		name: "editais-publicos",
		path: "/app/editais/{cnpj}-{unidade}-{numero}/{ano}",
		http_method: "GET",
		endpoint_type: "HTML_DETAIL",
		public: true,
		pagination_type: "UNKNOWN",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "VERIFIED"
	});
	await upsert(sql, "source_discovery_channel", {
		id: "ch_pncp_process",
		source_system_id: "src_br_pncp",
		channel_type: "PROCESS",
		label: "Editais públicos",
		list_url: "https://pncp.gov.br/app/editais",
		detail_url_pattern: "https://pncp.gov.br/app/editais/{cnpj}-{unidade}-{numero}/{ano}",
		connector_type: "GENERIC_JSON",
		readiness: "READY",
		ingest_status: "ACTIVE",
		claim_kind: "FATO_VERIFICADO",
		data_origin: "GOLDEN",
		notes: "Padrão oficial do Portal Nacional de Contratações Públicas. Ex.: https://pncp.gov.br/app/editais/75442756000190-1-001001/2026. Não usar /pncp-api/ como URL pública."
	});
}
async function repairExistingSeeds(sql) {
	await sql.query(`delete from source_capability where id in ('cap_rj_planning', 'cap_pncp_planning')`);
	await sql.query(`update source_connector_config
     set paths_json = coalesce(paths_json, '{}'::jsonb) || $1::jsonb,
         default_params_json = coalesce(default_params_json, '{}'::jsonb) || $2::jsonb
     where source_system_id = 'src_sc_compras'`, [JSON.stringify({ responsePath: "conteudo" }), JSON.stringify({ situacao: "PUBLICADO" })]);
	await sql.query(`update source_endpoint
     set pagination_type = 'UNKNOWN'
     where id = 'ep_sc_editais'`);
	await sql.query(`update source_capability
     set pagination_type = 'UNKNOWN'
     where id = 'cap_sc_discover'`);
	await sql.query(`update source_connector_config
     set paths_json = coalesce(paths_json, '{}'::jsonb) || $1::jsonb
     where source_system_id = 'src_rj_siga'`, [JSON.stringify({
		discover: "/Portal-Siga/EditaisLicitacoes/buscar.action",
		suppliers: "/Portal-Siga/Fornecedor/buscar.action"
	})]);
	await sql.query(`update source_endpoint
     set path = '/Portal-Siga/Fornecedor/buscar.action'
     where id = 'ep_rj_fornecedor'`);
	await sql.query(`update source_capability
     set documented = false,
         confidence = 0.6,
         endpoint_or_url = case id
           when 'cap_rj_suppliers' then '/Portal-Siga/Fornecedor/buscar.action'
           else endpoint_or_url
         end
     where id in ('cap_rj_suppliers', 'cap_rj_arp', 'cap_rj_contracts')`);
	await sql.query(`update source_system
     set classification_state = 'CLASSIFIED',
         notes = $1
     where id = 'src_br_comprasgov'`, ["FATO — API de dados abertos em dadosabertos.compras.gov.br (SIASG / Compras.gov). Portal institucional: https://www.gov.br/compras/pt-br. Paths de discovery específicos PENDENTE de mapeamento por módulo. NÃO declarar ADAPTER_READY sem path de discover."]);
	await sql.query(`update source_system
     set notes = $1
     where id = 'src_rj_siga'`, ["FATO — rotas públicas .action observadas em 2026-09-14: /Portal-Siga/Fornecedor/buscar.action (pesquisar.action retorna 404), /Portal-Siga/AtaRegistroPreco/buscar.action, /Portal-Siga/Contrato/buscar.action, /Portal-Siga/EditaisLicitacoes/buscar.action. Família técnica GENERIC_STRUTS_ACTION. Fornecedor comercial NÃO verificado. Filtros da listagem usam POST de formulário — GET só entrega o formulário."]);
	await repairPncpPublicUrls(sql);
}
async function seedAll(sql) {
	const already = ((await sql.query("select count(*)::int as n from jurisdiction"))[0]?.n ?? 0) > 0;
	await upsert(sql, "jurisdiction", {
		id: "jur_br",
		type: "UNION",
		ibge_code: null,
		uf: null,
		name: "Brasil",
		cnpj: null,
		parent_id: null,
		active: true
	});
	await upsert(sql, "jurisdiction", {
		id: "jur_sc",
		type: "STATE",
		ibge_code: "42",
		uf: "SC",
		name: "Santa Catarina",
		cnpj: null,
		parent_id: "jur_br",
		active: true
	});
	await upsert(sql, "jurisdiction", {
		id: "jur_rj",
		type: "STATE",
		ibge_code: "33",
		uf: "RJ",
		name: "Rio de Janeiro",
		cnpj: null,
		parent_id: "jur_br",
		active: true
	});
	await upsert(sql, "jurisdiction", {
		id: "jur_go",
		type: "STATE",
		ibge_code: "52",
		uf: "GO",
		name: "Goiás",
		cnpj: null,
		parent_id: "jur_br",
		active: true
	});
	await upsert(sql, "jurisdiction", {
		id: "jur_mg",
		type: "STATE",
		ibge_code: "31",
		uf: "MG",
		name: "Minas Gerais",
		cnpj: null,
		parent_id: "jur_br",
		active: true
	});
	await upsert(sql, "jurisdiction", {
		id: "jur_pi",
		type: "STATE",
		ibge_code: "22",
		uf: "PI",
		name: "Piauí",
		cnpj: null,
		parent_id: "jur_br",
		active: true
	});
	await upsert(sql, "jurisdiction", {
		id: "jur_pr",
		type: "STATE",
		ibge_code: "41",
		uf: "PR",
		name: "Paraná",
		cnpj: null,
		parent_id: "jur_br",
		active: true
	});
	await upsert(sql, "jurisdiction", {
		id: "jur_pa",
		type: "STATE",
		ibge_code: "15",
		uf: "PA",
		name: "Pará",
		cnpj: null,
		parent_id: "jur_br",
		active: true
	});
	const catalogIds = new Set(FRAMEWORK_SIGNATURES.map((sig) => sig.id));
	const signatures = [...FRAMEWORK_SIGNATURES.map((sig) => ({
		id: sig.id,
		technology_family: sig.technology_family,
		signature_type: sig.signature_type,
		key: sig.key,
		pattern: sig.pattern,
		weight: sig.weight,
		required: sig.required,
		description: sig.description,
		source_url: sig.source_url,
		is_vendor_claim: sig.is_vendor_claim
	})), ...EXTRA_SEED_SIGNATURES.filter((sig) => !catalogIds.has(sig.id))];
	for (const sig of signatures) await upsert(sql, "fingerprint_signature", {
		id: sig.id,
		technology_family: sig.technology_family,
		signature_type: sig.signature_type,
		key: sig.key,
		pattern: sig.pattern,
		weight: sig.weight,
		required: sig.required,
		description: sig.description,
		source_url: sig.source_url,
		is_vendor_claim: sig.is_vendor_claim
	});
	if (already) {
		if (((await sql.query("select count(*)::int as n from source_system"))[0]?.n ?? 0) > 0) {
			await repairExistingSeeds(sql);
			const { seedMilestone3 } = await import("./seed-m3.server-oatlPWGO.mjs");
			await seedMilestone3(sql);
			const { seedMilestone4 } = await import("./seed-m4.server-BsBmWg3n.mjs");
			await seedMilestone4(sql);
			const { seedMilestone5 } = await import("./seed-m5.server-C1ZE9xdo.mjs");
			await seedMilestone5(sql);
			const { seedMilestone6 } = await import("./seed-m6.server-CDsUyzF1.mjs");
			await seedMilestone6(sql);
			const { seedMilestone7 } = await import("./seed-m7.server-CqzYmzzC.mjs");
			await seedMilestone7(sql);
			const { seedGate75 } = await import("./seed-g75.server-DKeFXI7S.mjs");
			await seedGate75(sql);
			const { seedBllChannels } = await import("./seed-bll-channels.server-CUaJDQYa.mjs");
			await seedBllChannels(sql);
			await repairPncpPublicUrls(sql);
			return;
		}
	}
	for (const source of SOURCES) {
		await upsert(sql, "source_system", {
			...source,
			active: true
		});
		await upsert(sql, "source_rate_policy", {
			source_system_id: source.id,
			max_concurrency: 1,
			requests_per_second: 1,
			timeout_ms: 8e3,
			backoff_profile: "conservative"
		}, "source_system_id");
	}
	await upsert(sql, "source_endpoint", {
		id: "ep_sc_modalidades",
		source_system_id: "src_sc_compras",
		name: "modalidades-filtro",
		path: "/api/modalidades-filtro",
		http_method: "GET",
		endpoint_type: "JSON_API",
		public: true,
		pagination_type: "UNKNOWN",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "UNKNOWN"
	});
	await upsert(sql, "source_endpoint", {
		id: "ep_sc_situacoes",
		source_system_id: "src_sc_compras",
		name: "situacoes-filtro",
		path: "/api/situacoes-filtro",
		http_method: "GET",
		endpoint_type: "JSON_API",
		public: true,
		pagination_type: "UNKNOWN",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "UNKNOWN"
	});
	await upsert(sql, "source_endpoint", {
		id: "ep_sc_orgaos",
		source_system_id: "src_sc_compras",
		name: "orgaos-filtro",
		path: "/api/orgaos-filtro",
		http_method: "GET",
		endpoint_type: "JSON_API",
		public: true,
		pagination_type: "UNKNOWN",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "UNKNOWN"
	});
	await upsert(sql, "source_endpoint", {
		id: "ep_sc_editais",
		source_system_id: "src_sc_compras",
		name: "editais",
		path: "/api/editais",
		http_method: "GET",
		endpoint_type: "JSON_API",
		public: true,
		pagination_type: "UNKNOWN",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "UNKNOWN"
	});
	await upsert(sql, "source_capability", {
		id: "cap_sc_discover",
		source_system_id: "src_sc_compras",
		capability: "DISCOVER_PROCUREMENTS",
		access_type: "PUBLIC",
		endpoint_or_url: "/api/editais",
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "UNKNOWN",
		documented: true,
		confidence: 1
	});
	await upsert(sql, "source_connector_config", {
		source_system_id: "src_sc_compras",
		connector_type: "GENERIC_JSON",
		base_url: "https://www.compras.sc.gov.br",
		paths_json: {
			modalities: "/api/modalidades-filtro",
			situations: "/api/situacoes-filtro",
			organizations: "/api/orgaos-filtro",
			discover: "/api/editais",
			responsePath: "conteudo"
		},
		default_params_json: { situacao: "PUBLICADO" },
		normalization_config: {
			external_id: "id",
			process_number: "processo",
			modality: "tipo",
			organization_identifier: "orgaoSigla",
			organization_name: "orgaoNome",
			object: "objeto",
			proposal_deadline: "entregaProposta",
			opening_at: "abertura",
			status: "situacao"
		},
		enabled: true
	}, "source_system_id");
	await upsert(sql, "source_endpoint", {
		id: "ep_rj_fornecedor",
		source_system_id: "src_rj_siga",
		name: "Fornecedor",
		path: "/Portal-Siga/Fornecedor/buscar.action",
		http_method: "GET",
		endpoint_type: "HTML_LIST",
		public: true,
		pagination_type: "SERVER_SIDE_FORM",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "UNKNOWN"
	});
	await upsert(sql, "source_endpoint", {
		id: "ep_rj_ata",
		source_system_id: "src_rj_siga",
		name: "AtaRegistroPreco",
		path: "/Portal-Siga/AtaRegistroPreco/buscar.action",
		http_method: "GET",
		endpoint_type: "HTML_LIST",
		public: true,
		pagination_type: "SERVER_SIDE_FORM",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "UNKNOWN"
	});
	await upsert(sql, "source_endpoint", {
		id: "ep_rj_contrato",
		source_system_id: "src_rj_siga",
		name: "Contrato",
		path: "/Portal-Siga/Contrato/buscar.action",
		http_method: "GET",
		endpoint_type: "HTML_LIST",
		public: true,
		pagination_type: "SERVER_SIDE_FORM",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "UNKNOWN"
	});
	await upsert(sql, "source_endpoint", {
		id: "ep_rj_buscar",
		source_system_id: "src_rj_siga",
		name: "buscar",
		path: "/Portal-Siga/AtaRegistroPreco/buscar.action",
		http_method: "GET",
		endpoint_type: "FORM_POST",
		public: true,
		pagination_type: "SERVER_SIDE_FORM",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "UNKNOWN"
	});
	await upsert(sql, "source_capability", {
		id: "cap_rj_discover",
		source_system_id: "src_rj_siga",
		capability: "DISCOVER_PROCUREMENTS",
		access_type: "PUBLIC",
		endpoint_or_url: "/Portal-Siga/",
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "SERVER_SIDE_FORM",
		documented: false,
		confidence: .6
	});
	await upsert(sql, "source_capability", {
		id: "cap_rj_suppliers",
		source_system_id: "src_rj_siga",
		capability: "SUPPLIERS",
		access_type: "PUBLIC",
		endpoint_or_url: "/Portal-Siga/Fornecedor/buscar.action",
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "SERVER_SIDE_FORM",
		documented: false,
		confidence: .6
	});
	await upsert(sql, "source_capability", {
		id: "cap_rj_arp",
		source_system_id: "src_rj_siga",
		capability: "ARP",
		access_type: "PUBLIC",
		endpoint_or_url: "/Portal-Siga/AtaRegistroPreco/buscar.action",
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "SERVER_SIDE_FORM",
		documented: false,
		confidence: .6
	});
	await upsert(sql, "source_capability", {
		id: "cap_rj_contracts",
		source_system_id: "src_rj_siga",
		capability: "CONTRACTS",
		access_type: "PUBLIC",
		endpoint_or_url: "/Portal-Siga/Contrato/buscar.action",
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "SERVER_SIDE_FORM",
		documented: false,
		confidence: .6
	});
	await upsert(sql, "source_connector_config", {
		source_system_id: "src_rj_siga",
		connector_type: "GENERIC_ACTION",
		base_url: "https://www.compras.rj.gov.br",
		paths_json: {
			discover: "/Portal-Siga/EditaisLicitacoes/buscar.action",
			suppliers: "/Portal-Siga/Fornecedor/buscar.action",
			arp: "/Portal-Siga/AtaRegistroPreco/buscar.action",
			contracts: "/Portal-Siga/Contrato/buscar.action",
			search: "/Portal-Siga/AtaRegistroPreco/buscar.action"
		},
		enabled: true
	}, "source_system_id");
	await upsert(sql, "source_endpoint", {
		id: "ep_pa_list",
		source_system_id: "src_pa_compraspara",
		name: "licitacao_list",
		path: "/compraspara/public/licitacao_list.xhtml",
		http_method: "GET",
		endpoint_type: "HTML_LIST",
		public: true,
		pagination_type: "JSF_VIEWSTATE",
		requires_cookie: true,
		requires_csrf: true,
		requires_auth: false,
		status: "UNKNOWN"
	});
	await upsert(sql, "source_capability", {
		id: "cap_pa_discover",
		source_system_id: "src_pa_compraspara",
		capability: "DISCOVER_PROCUREMENTS",
		access_type: "PUBLIC",
		endpoint_or_url: "/compraspara/public/licitacao_list.xhtml",
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "JSF_VIEWSTATE",
		documented: true,
		confidence: .8
	});
	await upsert(sql, "source_connector_config", {
		source_system_id: "src_pa_compraspara",
		connector_type: "GENERIC_JSF",
		base_url: "https://www.sistemas.pa.gov.br",
		paths_json: { discover: "/compraspara/public/licitacao_list.xhtml" },
		enabled: true
	}, "source_system_id");
	await upsert(sql, "source_capability", {
		id: "cap_pa_hub_search",
		source_system_id: "src_pa_portal",
		capability: "SEARCH",
		access_type: "PUBLIC",
		endpoint_or_url: "https://www.compraspara.pa.gov.br/",
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "UNKNOWN",
		documented: false,
		confidence: .4
	});
	await upsert(sql, "source_connector_config", {
		source_system_id: "src_pa_portal",
		connector_type: "EXTERNAL_LINK_HUB",
		base_url: "https://www.compraspara.pa.gov.br/",
		paths_json: {},
		enabled: true
	}, "source_system_id");
	await upsert(sql, "source_system_relationship", {
		id: "rel_pa_hub_mural",
		source_system_id: "src_pa_portal",
		related_source_system_id: "src_pa_compraspara",
		relation_type: "LINKS_TO"
	});
	await upsert(sql, "source_evidence", {
		id: "ev_go_transferegov",
		source_system_id: "src_go_comprasnet",
		evidence_type: "OFFICIAL_DOCUMENT",
		evidence_level: "VERIFIED",
		title: "Transferegov — sistemas de compras integrados",
		description: "Lista oficial da Secretaria de Gestão: COMPRASNET.GO = Governo do Estado de Goiás. Não é família comercial. vendor_name permanece Governo de Goiás.",
		url: "https://www.gov.br/transferegov/pt-br/sobre/acesso-integracao/sistemas-de-compras",
		observed_value: "COMPRASNET.GO",
		expected_signature: null,
		verified_by: "seed"
	});
	await upsert(sql, "source_evidence", {
		id: "ev_mg_siad_decreto",
		source_system_id: "src_mg_siad",
		evidence_type: "OFFICIAL_DOCUMENT",
		evidence_level: "STRONG_INDICATION",
		title: "SIAD / Portal de Compras MG — página institucional",
		description: "Portal institucional descreve SIAD (Decreto nº 45.018/2009) e o Portal de Compras (compras.mg.gov.br) como divulgação centralizada. SIRP é módulo de registro de preços do SIAD.",
		url: "https://compras.mg.gov.br/acesso-a-informacoes/institucional/sistema-integrado-de-administracao-de-materiais-e-servicos-do-estado-de-minas-gerais-siad-mg/",
		observed_value: "SIAD",
		expected_signature: null,
		verified_by: "seed"
	});
	await upsert(sql, "source_system_relationship", {
		id: "rel_mg_portal_siad",
		source_system_id: "src_mg_portal",
		related_source_system_id: "src_mg_siad",
		relation_type: "FRONTEND_OF"
	});
	await upsert(sql, "source_system_relationship", {
		id: "rel_mg_sirp_siad",
		source_system_id: "src_mg_sirp",
		related_source_system_id: "src_mg_siad",
		relation_type: "EXECUTION_FOR"
	});
	await upsert(sql, "source_system_relationship", {
		id: "rel_mg_portal_sirp",
		source_system_id: "src_mg_portal",
		related_source_system_id: "src_mg_sirp",
		relation_type: "LINKS_TO"
	});
	await upsert(sql, "source_connector_config", {
		source_system_id: "src_pi_central",
		connector_type: "EXTERNAL_LINK_HUB",
		base_url: "https://centraldecompras.sead.pi.gov.br/",
		paths_json: {},
		enabled: true
	}, "source_system_id");
	await upsert(sql, "source_capability", {
		id: "cap_pr_planning",
		source_system_id: "src_pr_pcae",
		capability: "PLANNING",
		access_type: "PUBLIC",
		endpoint_or_url: "https://www.planejamento.pr.gov.br/Pagina/PCA-E",
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "UNKNOWN",
		documented: true,
		confidence: .9
	});
	await upsert(sql, "source_connector_config", {
		source_system_id: "src_pr_pcae",
		connector_type: "PLANNING_ONLY",
		base_url: "https://www.planejamento.pr.gov.br",
		paths_json: { planning: "/Pagina/PCA-E" },
		enabled: true
	}, "source_system_id");
	await upsert(sql, "source_endpoint", {
		id: "ep_pncp_publicacao",
		source_system_id: "src_br_pncp",
		name: "contratacoes-publicacao",
		path: "/api/consulta/v1/contratacoes/publicacao",
		http_method: "GET",
		endpoint_type: "JSON_API",
		public: true,
		pagination_type: "PAGE_NUMBER",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "UNKNOWN"
	});
	await upsert(sql, "source_endpoint", {
		id: "ep_pncp_orgaos",
		source_system_id: "src_br_pncp",
		name: "orgaos",
		path: "/api/consulta/v1/orgaos",
		http_method: "GET",
		endpoint_type: "JSON_API",
		public: true,
		pagination_type: "UNKNOWN",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "UNKNOWN"
	});
	await upsert(sql, "source_capability", {
		id: "cap_pncp_discover",
		source_system_id: "src_br_pncp",
		capability: "DISCOVER_PROCUREMENTS",
		access_type: "PUBLIC",
		endpoint_or_url: "/api/consulta/v1/contratacoes/publicacao",
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "PAGE_NUMBER",
		documented: true,
		confidence: 1
	});
	await upsert(sql, "source_capability", {
		id: "cap_pncp_contracts",
		source_system_id: "src_br_pncp",
		capability: "CONTRACTS",
		access_type: "PUBLIC",
		endpoint_or_url: "/api/consulta/v1",
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "PAGE_NUMBER",
		documented: true,
		confidence: .9
	});
	await upsert(sql, "source_capability", {
		id: "cap_pncp_arp",
		source_system_id: "src_br_pncp",
		capability: "ARP",
		access_type: "PUBLIC",
		endpoint_or_url: "/api/consulta/v1/atas",
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "PAGE_NUMBER",
		documented: true,
		confidence: .8
	});
	await upsert(sql, "source_connector_config", {
		source_system_id: "src_br_pncp",
		connector_type: "GENERIC_JSON",
		base_url: "https://pncp.gov.br",
		paths_json: {
			discover: "/api/consulta/v1/contratacoes/publicacao",
			organizations: "/api/consulta/v1/orgaos"
		},
		enabled: true
	}, "source_system_id");
	await upsert(sql, "source_capability", {
		id: "cap_comprasgov_discover",
		source_system_id: "src_br_comprasgov",
		capability: "DISCOVER_PROCUREMENTS",
		access_type: "PUBLIC",
		endpoint_or_url: "https://dadosabertos.compras.gov.br",
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "PAGE_NUMBER",
		documented: true,
		confidence: .8
	});
	await upsert(sql, "source_connector_config", {
		source_system_id: "src_br_comprasgov",
		connector_type: "GENERIC_JSON",
		base_url: "https://dadosabertos.compras.gov.br",
		paths_json: {},
		enabled: true
	}, "source_system_id");
	for (const obs of OBSERVATIONS) await upsert(sql, "source_observation", { ...obs });
	await upsert(sql, "source_evidence", {
		id: "ev_sc_json_routes",
		source_system_id: "src_sc_compras",
		evidence_type: "ROUTE_SIGNATURE",
		evidence_level: "VERIFIED",
		title: "Rotas JSON públicas Compras SC",
		description: "FATO — GET /api/modalidades-filtro, /api/situacoes-filtro, /api/orgaos-filtro, /api/editais. Não identifica fornecedor.",
		url: "https://www.compras.sc.gov.br/api/editais",
		observed_value: "/api/editais",
		expected_signature: "/api/",
		verified_by: "seed"
	});
	await upsert(sql, "source_evidence", {
		id: "ev_rj_action_routes",
		source_system_id: "src_rj_siga",
		evidence_type: "ROUTE_SIGNATURE",
		evidence_level: "VERIFIED",
		title: "Rotas .action públicas SIGA RJ",
		description: "FATO — Fornecedor/buscar.action, AtaRegistroPreco/buscar.action, Contrato/buscar.action, EditaisLicitacoes/buscar.action. pesquisar.action retornou HTTP 404.",
		url: "https://www.compras.rj.gov.br/Portal-Siga/",
		observed_value: ".action",
		expected_signature: ".action",
		verified_by: "seed"
	});
	await upsert(sql, "source_evidence", {
		id: "ev_pa_xhtml",
		source_system_id: "src_pa_compraspara",
		evidence_type: "ROUTE_SIGNATURE",
		evidence_level: "VERIFIED",
		title: "Listagem .xhtml Compras Pará",
		description: "FATO — licitacao_list.xhtml. Indica GENERIC_JSF. Não é evidência de Paradigma.",
		url: "https://www.sistemas.pa.gov.br/compraspara/public/licitacao_list.xhtml",
		observed_value: ".xhtml",
		expected_signature: ".xhtml",
		verified_by: "seed"
	});
	const historyNow = (/* @__PURE__ */ new Date()).toISOString();
	for (const source of SOURCES) {
		if (source.technology_family === "UNKNOWN") continue;
		await upsert(sql, "source_platform_history", {
			id: `hist_${source.id}_current`,
			source_system_id: source.id,
			technology_family: source.technology_family,
			vendor_name: source.vendor_name,
			product_name: source.product_name,
			valid_from: historyNow,
			valid_to: null,
			evidence_id: source.id === "src_go_comprasnet" ? "ev_go_transferegov" : source.id === "src_mg_siad" ? "ev_mg_siad_decreto" : null,
			confidence: source.vendor_confidence
		});
	}
	await repairExistingSeeds(sql);
	const { seedMilestone3 } = await import("./seed-m3.server-oatlPWGO.mjs");
	await seedMilestone3(sql);
	const { seedMilestone4 } = await import("./seed-m4.server-BsBmWg3n.mjs");
	await seedMilestone4(sql);
	const { seedMilestone5 } = await import("./seed-m5.server-C1ZE9xdo.mjs");
	await seedMilestone5(sql);
	const { seedMilestone6 } = await import("./seed-m6.server-CDsUyzF1.mjs");
	await seedMilestone6(sql);
	const { seedMilestone7 } = await import("./seed-m7.server-CqzYmzzC.mjs");
	await seedMilestone7(sql);
	const { seedGate75 } = await import("./seed-g75.server-DKeFXI7S.mjs");
	await seedGate75(sql);
	const { seedBllChannels } = await import("./seed-bll-channels.server-CUaJDQYa.mjs");
	await seedBllChannels(sql);
	await repairPncpPublicUrls(sql);
}
var globalRef = globalThis;
function ensureSeeded(sql) {
	globalRef.__atlasRegistrySeedG75j__ ??= seedAll(sql).catch((err) => {
		globalRef.__atlasRegistrySeedG75j__ = void 0;
		throw err;
	});
	return globalRef.__atlasRegistrySeedG75j__;
}
//#endregion
export { ensureSeeded, LEARNED_VENDOR_SIGNATURES as t };
