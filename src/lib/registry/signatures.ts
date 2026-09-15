import type {
  FingerprintSignature,
  SignatureType,
  TechnologyFamily,
} from "./types.ts";

type SigInput = {
  id: string;
  technology_family: TechnologyFamily;
  signature_type: SignatureType;
  pattern: string;
  weight: number;
  key?: string;
  required?: boolean;
  description?: string;
  source_url?: string | null;
  is_vendor_claim?: boolean;
};

/**
 * Build a catalog row. Framework signatures are never vendor claims.
 */
export function sig(input: SigInput): FingerprintSignature {
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
    is_vendor_claim: input.is_vendor_claim ?? false,
  };
}

/**
 * Generic framework markers only. Do not catalog speculative
 * Paradigma / WBC / Fiorilli route signatures here.
 */
export const FRAMEWORK_SIGNATURES: FingerprintSignature[] = [
  sig({
    id: "sig_jsf_xhtml",
    technology_family: "GENERIC_JSF",
    signature_type: "PAGE_SUFFIX",
    key: "page_suffix",
    pattern: ".xhtml",
    weight: 5,
    is_vendor_claim: false,
    description: "JSF Facelets page suffix",
  }),
  sig({
    id: "sig_jsf_jsession",
    technology_family: "GENERIC_JSF",
    signature_type: "COOKIE_NAME",
    key: "cookie_name",
    pattern: "JSESSIONID",
    weight: 2,
    is_vendor_claim: false,
    description: "Servlet container session cookie (not a vendor proof)",
  }),
  sig({
    id: "sig_jsf_viewstate",
    technology_family: "GENERIC_JSF",
    signature_type: "JS_GLOBAL",
    key: "js_global",
    pattern: "javax.faces.ViewState",
    weight: 10,
    is_vendor_claim: false,
    description: "JSF ViewState hidden field / partial request marker",
  }),
  sig({
    id: "sig_action_suffix",
    technology_family: "GENERIC_STRUTS_ACTION",
    signature_type: "PAGE_SUFFIX",
    key: "page_suffix",
    pattern: ".action",
    weight: 5,
    is_vendor_claim: false,
    description: "Struts / .action page suffix",
  }),
  sig({
    id: "sig_json_api_path",
    technology_family: "GENERIC_JSON_API",
    signature_type: "ROUTE_SIGNATURE",
    key: "route",
    pattern: "/api/",
    weight: 8,
    is_vendor_claim: false,
    description: "Public /api/ route prefix",
  }),
  sig({
    id: "sig_json_content",
    technology_family: "GENERIC_JSON_API",
    signature_type: "HEADER",
    key: "content_type",
    pattern: "application/json",
    weight: 15,
    is_vendor_claim: false,
    description: "JSON Content-Type",
  }),
  sig({
    id: "sig_asp_aspx",
    technology_family: "GENERIC_ASP",
    signature_type: "PAGE_SUFFIX",
    key: "page_suffix",
    pattern: ".aspx",
    weight: 5,
    is_vendor_claim: false,
    description: "ASP.NET WebForms / MVC page suffix",
  }),
  sig({
    id: "sig_asp_viewstate",
    technology_family: "GENERIC_ASP",
    signature_type: "JS_GLOBAL",
    key: "js_global",
    pattern: "__VIEWSTATE",
    weight: 8,
    is_vendor_claim: false,
    description: "ASP.NET ViewState field",
  }),
  sig({
    id: "sig_spa_reactroot",
    technology_family: "GENERIC_SPA",
    signature_type: "JS_GLOBAL",
    key: "js_global",
    pattern: "data-reactroot",
    weight: 6,
    is_vendor_claim: false,
    description: "React mount marker",
  }),
  sig({
    id: "sig_spa_ngversion",
    technology_family: "GENERIC_SPA",
    signature_type: "JS_GLOBAL",
    key: "js_global",
    pattern: "ng-version",
    weight: 6,
    is_vendor_claim: false,
    description: "Angular version attribute",
  }),
  sig({
    id: "sig_asp_mvc_header",
    technology_family: "GENERIC_ASP",
    signature_type: "SERVER_HEADER",
    key: "header",
    pattern: "X-AspNetMvc-Version",
    weight: 8,
    is_vendor_claim: false,
    description: "Header ASP.NET MVC — framework, não fornecedor.",
  }),
];

/**
 * Learned AFTER official vendor evidence. Never invent a vendor from HTML
 * similarity alone.
 */
export const LEARNED_VENDOR_SIGNATURES: FingerprintSignature[] = [
  sig({
    id: "sig_bll_process_search",
    technology_family: "BLL",
    signature_type: "ROUTE_SIGNATURE",
    key: "pathname",
    pattern: "/Process/ProcessSearchPublic",
    weight: 40,
    is_vendor_claim: true,
    source_url: "https://bllcompras.com/Process/ProcessSearchPublic?param1=0",
    description:
      "Rota pública do produto BLL Compras, observada após listagem Transferegov.",
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
    description: "Detalhe público ProcessView no contrato HTML da BLL.",
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
    description: "Host oficial da plataforma BLL Compras.",
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
    description:
      "Superfície pública Compra Direta da BLL. Não é filtro de ProcessSearchPublic.",
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
    description:
      "Detalhe público DirectBuyView. Identidade via param1 opaco, não decodificado.",
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
    description:
      "Menu público Busca por Localização. Utilidade de ingestão ainda pendente.",
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
    description: "Host oficial do Portal de Compras Públicas (eCustomize).",
  }),
  sig({
    id: "sig_fiorilli_comprasedital",
    technology_family: "SCPI_FIORILLI",
    signature_type: "ROUTE_SIGNATURE",
    key: "pathname",
    pattern: "/comprasedital",
    weight: 40,
    is_vendor_claim: true,
    description:
      "Path /comprasedital citado em editais oficiais SCPI Fiorilli (Itapira, Irapuã, Urupês, Assis, Sales).",
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
    description:
      "Título público 'Paradigma EGOV' no portal municipal de Florianópolis — aprendido depois da evidência de produto, não o contrário.",
  }),
  sig({
    id: "sig_paradigma_powered",
    technology_family: "PARADIGMA_WBC",
    signature_type: "PAGE_TEXT",
    key: "page_text",
    pattern: "Powered by Paradigma",
    weight: 40,
    is_vendor_claim: true,
    description:
      "Rodapé 'Powered by Paradigma®' em portais WBC/EGOV. Só conta após evidência comercial; não prova fornecedor sozinho.",
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
    description:
      "Stylesheet fiorilli.css observado ao vivo em Assis (SCPI ExtJS). Aprendido DEPOIS da evidência institucional, não o contrário.",
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
    description:
      "Endpoint comprasedital.dll do SPA ExtJS SCPI. Sem lista HTML/JSON pública no GET inicial.",
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
    description:
      "Asset compartilhado /portal/css/portalcss em Florianópolis e Barueri (ASP.NET + kendoUI, não JSF). Aprendido ao vivo após evidência de produto.",
  }),
];

export const ALL_SIGNATURES: FingerprintSignature[] = [
  ...FRAMEWORK_SIGNATURES,
  ...LEARNED_VENDOR_SIGNATURES,
];

