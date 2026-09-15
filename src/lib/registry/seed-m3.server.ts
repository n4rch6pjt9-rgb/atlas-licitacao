import type { Sql } from "@/lib/db";
import { sha256 } from "./hash";
import { toPublicPncpUrl } from "./pncp-url.ts";
import { LEARNED_VENDOR_SIGNATURES } from "./signatures";
import type { ConnectorType, EvidenceLevel, TechnologyFamily } from "./types";

const JSONB_KEYS = new Set([
  "raw_metadata",
  "raw_payload",
  "paths_json",
  "default_params_json",
  "headers_json",
  "pagination_config",
  "normalization_config",
  "document_config",
  "payload",
]);

const TRANSFEREGOV =
  "https://www.gov.br/transferegov/pt-br/sobre/apis-integracao/sistemas-de-compras";

async function upsert(
  sql: Sql,
  table: string,
  row: Record<string, unknown>,
  pk = "id",
): Promise<void> {
  const payload = table === "source_evidence" ? withEvidenceProvenance(row) : row;
  const keys = Object.keys(payload);
  const cols = keys.join(", ");
  const placeholders = keys
    .map((key, i) => (JSONB_KEYS.has(key) ? `$${i + 1}::jsonb` : `$${i + 1}`))
    .join(", ");
  const params = keys.map((key) => {
    const value = payload[key];
    if (value === undefined) return null;
    if (JSONB_KEYS.has(key)) {
      if (value === null) return null;
      return typeof value === "string" ? value : JSON.stringify(value);
    }
    return value;
  });
  await sql.query(
    `insert into ${table} (${cols}) values (${placeholders}) on conflict (${pk}) do nothing`,
    params,
  );
}

const OBSERVED_AT = "2026-09-14T00:00:00.000Z";

function withEvidenceProvenance(row: Record<string, unknown>): Record<string, unknown> {
  const url =
    typeof row.url === "string" ? toPublicPncpUrl(row.url) : row.url ?? null;
  const excerpt =
    (typeof row.raw_excerpt === "string" && row.raw_excerpt) ||
    (typeof row.description === "string" && row.description) ||
    (typeof row.observed_value === "string" && row.observed_value) ||
    "";
  return {
    ...row,
    url,
    observed_at: row.observed_at ?? OBSERVED_AT,
    content_hash:
      row.content_hash ??
      sha256(
        [row.id, row.title, url, row.publisher, excerpt].map((part) => part ?? "").join("|"),
      ),
  };
}

type Jur = {
  id: string;
  type: string;
  ibge_code: string | null;
  uf: string | null;
  name: string;
  parent_id: string | null;
};

const JURISDICTIONS: Jur[] = [
  { id: "jur_sp", type: "STATE", ibge_code: "35", uf: "SP", name: "São Paulo", parent_id: "jur_br" },
  { id: "jur_mt", type: "STATE", ibge_code: "51", uf: "MT", name: "Mato Grosso", parent_id: "jur_br" },
  { id: "jur_ce", type: "STATE", ibge_code: "23", uf: "CE", name: "Ceará", parent_id: "jur_br" },
  { id: "jur_ms", type: "STATE", ibge_code: "50", uf: "MS", name: "Mato Grosso do Sul", parent_id: "jur_br" },
  { id: "jur_es", type: "STATE", ibge_code: "32", uf: "ES", name: "Espírito Santo", parent_id: "jur_br" },
  { id: "jur_pr", type: "STATE", ibge_code: "41", uf: "PR", name: "Paraná", parent_id: "jur_br" },
  { id: "jur_ba", type: "STATE", ibge_code: "29", uf: "BA", name: "Bahia", parent_id: "jur_br" },
  { id: "jur_sc", type: "STATE", ibge_code: "42", uf: "SC", name: "Santa Catarina", parent_id: "jur_br" },
  { id: "jur_aspasia_sp", type: "MUNICIPALITY", ibge_code: "350395", uf: "SP", name: "Aspásia", parent_id: "jur_sp" },
  { id: "jur_baturite_ce", type: "MUNICIPALITY", ibge_code: "230210", uf: "CE", name: "Baturité", parent_id: "jur_ce" },
  { id: "jur_cambara_pr", type: "MUNICIPALITY", ibge_code: "410400", uf: "PR", name: "Cambará", parent_id: "jur_pr" },
  { id: "jur_novaolimpia_mt", type: "MUNICIPALITY", ibge_code: "510623", uf: "MT", name: "Nova Olímpia", parent_id: "jur_mt" },
  { id: "jur_novaandradina_ms", type: "MUNICIPALITY", ibge_code: "500620", uf: "MS", name: "Nova Andradina", parent_id: "jur_ms" },
  { id: "jur_itapira_sp", type: "MUNICIPALITY", ibge_code: "352260", uf: "SP", name: "Itapira", parent_id: "jur_sp" },
  { id: "jur_irapua_sp", type: "MUNICIPALITY", ibge_code: "352190", uf: "SP", name: "Irapuã", parent_id: "jur_sp" },
  { id: "jur_linhares_es", type: "MUNICIPALITY", ibge_code: "320320", uf: "ES", name: "Linhares", parent_id: "jur_es" },
  { id: "jur_alegre_es", type: "MUNICIPALITY", ibge_code: "320020", uf: "ES", name: "Alegre", parent_id: "jur_es" },
  { id: "jur_florianopolis_sc", type: "MUNICIPALITY", ibge_code: "420540", uf: "SC", name: "Florianópolis", parent_id: "jur_sc" },
  { id: "jur_barueri_sp", type: "MUNICIPALITY", ibge_code: "350570", uf: "SP", name: "Barueri", parent_id: "jur_sp" },
  { id: "jur_urupes_sp", type: "MUNICIPALITY", ibge_code: "355600", uf: "SP", name: "Urupês", parent_id: "jur_sp" },
  { id: "jur_assis_sp", type: "MUNICIPALITY", ibge_code: "350400", uf: "SP", name: "Assis", parent_id: "jur_sp" },
  { id: "jur_sales_sp", type: "MUNICIPALITY", ibge_code: "354580", uf: "SP", name: "Sales", parent_id: "jur_sp" },
  { id: "jur_ubaira_ba", type: "MUNICIPALITY", ibge_code: "293260", uf: "BA", name: "Ubaíra", parent_id: "jur_ba" },
  { id: "jur_cotia_sp", type: "MUNICIPALITY", ibge_code: "351300", uf: "SP", name: "Cotia", parent_id: "jur_sp" },
];

type SourceRow = {
  id: string;
  jurisdiction_id: string;
  name: string;
  slug: string;
  base_url: string;
  technology_family: TechnologyFamily;
  vendor_name: string | null;
  product_name: string | null;
  vendor_evidence_level: EvidenceLevel;
  vendor_confidence: number;
  connector_type: ConnectorType;
  classification_state: string;
  discovery_strategy: string;
  functional_family: string;
  pncp_overlap: boolean;
  notes: string;
};

const BLL_DISCOVER = "/Process/ProcessSearchPublic?param1=0";
const BLL_LINK = "Process/ProcessView";

const SOURCES: SourceRow[] = [
  {
    id: "src_bll_platform",
    jurisdiction_id: "jur_br",
    name: "BLL Compras (plataforma)",
    slug: "bll-compras",
    base_url: "https://bllcompras.com",
    technology_family: "BLL",
    vendor_name: "Bolsa de Licitações e Leilões do Brasil",
    product_name: "Lance Eletrônico / BLL Compras",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "GENERIC_ACTION",
    classification_state: "ADAPTER_READY",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: true,
    notes:
      "FATO — Transferegov lista LANCE ELETRÔNICO / Bolsa de Licitações e Leilões do Brasil, CNPJ 10.508.843/0002-38. Portal público bllcompras.com. GET /Process/ProcessSearchPublic observado em 2026-09-14 (IIS/ASP.NET MVC 5.2). ASP.NET não prova o fornecedor; a evidência de vendor é o cadastro Transferegov + marca BLLCOMPRAS. Integração PNCP citada em edital municipal — cobertura de records PENDENTE.",
  },
  {
    id: "src_bll_cambara_pr",
    jurisdiction_id: "jur_cambara_pr",
    name: "BLL · Cambará/PR",
    slug: "bll-cambara-pr",
    base_url: "https://bllcompras.com",
    technology_family: "BLL",
    vendor_name: "Bolsa de Licitações e Leilões do Brasil",
    product_name: "BLL Compras",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "GENERIC_ACTION",
    classification_state: "ADAPTER_READY",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: true,
    notes:
      "FATO — Edital Dispensa Eletrônica 02/2026 do Município de Cambará/PR publica a sessão na plataforma BLL (https://bllcompras.com/Home/Login). Mesmo portal e mesmo contrato HTML da plataforma nacional. Config filtra o órgão; o adapter não conhece o município.",
  },
  {
    id: "src_bll_novaolimpia_mt",
    jurisdiction_id: "jur_novaolimpia_mt",
    name: "BLL · Nova Olímpia/MT",
    slug: "bll-nova-olimpia-mt",
    base_url: "https://bllcompras.com",
    technology_family: "BLL",
    vendor_name: "Bolsa de Licitações e Leilões do Brasil",
    product_name: "BLL Compras",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "GENERIC_ACTION",
    classification_state: "ADAPTER_READY",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: true,
    notes:
      "FATO — Pregão Eletrônico 027/2025 do Município de Nova Olímpia/MT designa a Bolsa de Licitações e Leilões do Brasil e cita integração ao PNCP. Edital disponível em bll.org.br e no site da prefeitura.",
  },
  {
    id: "src_bll_aspasia_sp",
    jurisdiction_id: "jur_aspasia_sp",
    name: "BLL · Aspásia/SP",
    slug: "bll-aspasia-sp",
    base_url: "https://bllcompras.com",
    technology_family: "BLL",
    vendor_name: "Bolsa de Licitações e Leilões do Brasil",
    product_name: "BLL Compras",
    vendor_evidence_level: "STRONG_INDICATION",
    vendor_confidence: 0.75,
    connector_type: "GENERIC_ACTION",
    classification_state: "ADAPTER_READY",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: true,
    notes:
      "INFERÊNCIA — MUNICIPIO DE ASPASIA aparece como promotor na busca pública BLL em 2026-09-14. Não há edital municipal arquivado neste censo. Nível STRONG_INDICATION, não VERIFIED.",
  },
  {
    id: "src_bll_baturite_ce",
    jurisdiction_id: "jur_baturite_ce",
    name: "BLL · Baturité/CE",
    slug: "bll-baturite-ce",
    base_url: "https://bllcompras.com",
    technology_family: "BLL",
    vendor_name: "Bolsa de Licitações e Leilões do Brasil",
    product_name: "BLL Compras",
    vendor_evidence_level: "STRONG_INDICATION",
    vendor_confidence: 0.75,
    connector_type: "GENERIC_ACTION",
    classification_state: "ADAPTER_READY",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: true,
    notes:
      "INFERÊNCIA — MUNICIPIO DE BATURITE listado como promotor na busca pública BLL em 2026-09-14. Sem edital municipal neste censo.",
  },
  {
    id: "src_bll_novaandradina_ms",
    jurisdiction_id: "jur_novaandradina_ms",
    name: "BLL · Nova Andradina/MS",
    slug: "bll-nova-andradina-ms",
    base_url: "https://bllcompras.com",
    technology_family: "BLL",
    vendor_name: "Bolsa de Licitações e Leilões do Brasil",
    product_name: "BLL Compras",
    vendor_evidence_level: "STRONG_INDICATION",
    vendor_confidence: 0.75,
    connector_type: "GENERIC_ACTION",
    classification_state: "ADAPTER_READY",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: true,
    notes:
      "INFERÊNCIA — MUNICIPIO DE NOVA ANDRADINA listado como promotor na busca pública BLL em 2026-09-14. Sem edital municipal neste censo.",
  },
  {
    id: "src_bll_ubaira_ba",
    jurisdiction_id: "jur_ubaira_ba",
    name: "BLL · Ubaíra/BA",
    slug: "bll-ubaira-ba",
    base_url: "https://bllcompras.com",
    technology_family: "BLL",
    vendor_name: "Bolsa de Licitações e Leilões do Brasil",
    product_name: "BLL Compras",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "GENERIC_ACTION",
    classification_state: "ADAPTER_READY",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: true,
    notes:
      "FATO — Pregão Eletrônico 003/2026 do Município de Ubaíra/BA (CNPJ 13.910.690/0001-68) designa a Bolsa de Licitações e Leilões do Brasil em https://bllcompras.com/Home/Login. Mesmo portal nacional. Config filtra o órgão.",
  },
  {
    id: "src_bll_cotia_sp",
    jurisdiction_id: "jur_cotia_sp",
    name: "BLL · Cotia/SP",
    slug: "bll-cotia-sp",
    base_url: "https://bllcompras.com",
    technology_family: "BLL",
    vendor_name: "Bolsa de Licitações e Leilões do Brasil",
    product_name: "BLL Compras",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "GENERIC_ACTION",
    classification_state: "ADAPTER_READY",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: true,
    notes:
      "FATO — Pregão Eletrônico SRP 013/2026 da Prefeitura de Cotia/SP realiza a sessão na plataforma BLL (bll.org.br / bllcompras.com). Período vigente 2026.",
  },
  {
    id: "src_pcp_platform",
    jurisdiction_id: "jur_br",
    name: "Portal de Compras Públicas",
    slug: "portal-compras-publicas",
    base_url: "https://www.portaldecompraspublicas.com.br",
    technology_family: "PORTAL_COMPRAS_PUBLICAS",
    vendor_name: "eCustomize Consultoria em Software",
    product_name: "Portal de Compras Públicas",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "UNKNOWN",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: true,
    notes:
      "FATO — Transferegov: PORTAL DE COMPRAS PÚBLICAS / ECUSTOMIZE CONSULTORIA EM SOFTWARE LTDA, CNPJ 09.397.355/0001-30. Homepage Angular/Express observada. Busca /processos existe. API JSON pública de editais NÃO extraída nesta sessão — adapter genérico PENDENTE.",
  },
  {
    id: "src_pcp_linhares_es",
    jurisdiction_id: "jur_linhares_es",
    name: "PCP · Câmara de Linhares/ES",
    slug: "pcp-camara-linhares-es",
    base_url: "https://www.portaldecompraspublicas.com.br",
    technology_family: "PORTAL_COMPRAS_PUBLICAS",
    vendor_name: "eCustomize Consultoria em Software",
    product_name: "Portal de Compras Públicas",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "UNKNOWN",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Contrato 5/2024 da Câmara Municipal de Linhares: contratação do sistema Portal de Compras Públicas, contratada ECUSTOMIZE CONSULTORIA EM SOFTWARE S.A, CNPJ 09.397.355/0001-30.",
  },
  {
    id: "src_pcp_alegre_es",
    jurisdiction_id: "jur_alegre_es",
    name: "PCP · Alegre/ES",
    slug: "pcp-alegre-es",
    base_url: "https://www.portaldecompraspublicas.com.br",
    technology_family: "PORTAL_COMPRAS_PUBLICAS",
    vendor_name: "eCustomize Consultoria em Software",
    product_name: "Portal de Compras Públicas",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "UNKNOWN",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Site oficial da Prefeitura de Alegre/ES declara adesão ao Portal de Compras Públicas, mantido pela Ecustomize Consultoria em Software S/A.",
  },
  {
    id: "src_fiorilli_itapira",
    jurisdiction_id: "jur_itapira_sp",
    name: "SCPI Fiorilli · Itapira/SP",
    slug: "scpi-itapira-sp",
    base_url: "http://transparencia.itapira.sp.gov.br:8079/comprasedital/",
    technology_family: "SCPI_FIORILLI",
    vendor_name: "Fiorilli Software",
    product_name: "SCPI Portal de Compras",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Edital PNCP do Município de Itapira/SP cita SCPI – Portal de Compras – Pregão Eletrônico – FIORILLI em http://transparencia.itapira.sp.gov.br:8079/comprasedital/. Instalação própria por ente. Adapter reutilizável PENDENTE de contrato técnico compartilhado ao vivo.",
  },
  {
    id: "src_fiorilli_irapua",
    jurisdiction_id: "jur_irapua_sp",
    name: "SCPI Fiorilli · Irapuã/SP",
    slug: "scpi-irapua-sp",
    base_url: "http://170.0.49.246:5656/comprasedital/",
    technology_family: "SCPI_FIORILLI",
    vendor_name: "Fiorilli Software",
    product_name: "SCPI Portal de Compras",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Publicação oficial do Município de Irapuã/SP cita SCPI – Portal de Compras – Pregão Eletrônico FIORILLI em http://170.0.49.246:5656/comprasedital/. Path /comprasedital compartilhado com Itapira. Fingerprint ao vivo PENDENTE.",
  },
  {
    id: "src_fiorilli_urupes",
    jurisdiction_id: "jur_urupes_sp",
    name: "SCPI Fiorilli · Urupês/SP",
    slug: "scpi-urupes-sp",
    base_url: "http://transparencia.urupes.sp.gov.br:5656/comprasedital/",
    technology_family: "SCPI_FIORILLI",
    vendor_name: "Fiorilli Software",
    product_name: "SCPI Portal de Compras",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Diário oficial do Município de Urupês/SP (leilão eletrônico 2025) nomeia SCPI – PORTAL DE COMPRAS (FIORILLI) em http://transparencia.urupes.sp.gov.br:5656/comprasedital/. Manual do fornecedor em ajuda.fiorilli.com.br. Instalação própria. Contrato HTML ao vivo PENDENTE.",
  },
  {
    id: "src_fiorilli_assis",
    jurisdiction_id: "jur_assis_sp",
    name: "SCPI Fiorilli · Assis/SP",
    slug: "scpi-assis-sp",
    base_url: "https://scpi.assis.sp.gov.br:8079/comprasedital/",
    technology_family: "SCPI_FIORILLI",
    vendor_name: "Fiorilli Software",
    product_name: "SCPI Portal de Compras",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Editais 2025 da Prefeitura de Assis/SP (CNPJ 46.179.941/0001-35) publicam a sessão no Portal de Compras Fiorilli https://scpi.assis.sp.gov.br:8079/comprasedital/. Host scpi.{municipio} é instalação, não prova sozinho; o edital nomeia Fiorilli.",
  },
  {
    id: "src_fiorilli_sales",
    jurisdiction_id: "jur_sales_sp",
    name: "SCPI Fiorilli · Sales/SP",
    slug: "scpi-sales-sp",
    base_url: "http://170.0.48.169:8079/comprasedital/",
    technology_family: "SCPI_FIORILLI",
    vendor_name: "Fiorilli Software",
    product_name: "SCPI Portal de Compras",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Concorrência eletrônica 002/2025 da Prefeitura Municipal de Sales/SP (CNPJ 46.613.196/0001-90) nomeia SCPI – Portal de Compras – Fiorilli em http://170.0.48.169:8079/comprasedital/. Path compartilhado. IP não é evidência de vendor; o edital é.",
  },
  {
    id: "src_paradigma_florianopolis",
    jurisdiction_id: "jur_florianopolis_sc",
    name: "Paradigma EGOV · Florianópolis/SC",
    slug: "paradigma-florianopolis-sc",
    base_url: "https://wbc.pmf.sc.gov.br/",
    technology_family: "PARADIGMA_WBC",
    vendor_name: "Paradigma Business Solutions",
    product_name: "Paradigma EGOV / WBC Public",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Portal oficial da Prefeitura de Florianópolis em wbc.pmf.sc.gov.br identifica-se como 'Paradigma EGOV - florianopolis' (observado 2026-09-14). Produto vigente. Adapter reutilizável PENDENTE — HTML público, contrato JSON não extraído.",
  },
  {
    id: "src_paradigma_barueri",
    jurisdiction_id: "jur_barueri_sp",
    name: "Paradigma WBC · Barueri/SP",
    slug: "paradigma-barueri-sp",
    base_url: "https://compras.barueri.sp.gov.br/",
    technology_family: "PARADIGMA_WBC",
    vendor_name: "Paradigma Business Solutions",
    product_name: "Paradigma WBC Public",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "HTML_LIST",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Portal oficial compras.barueri.sp.gov.br publica manual de cadastro WBC (janeiro/2025) com marca paradigmabs.com.br. Produto vigente. Contrato técnico JSON PENDENTE.",
  },
  {
    id: "src_licitanet_platform",
    jurisdiction_id: "jur_br",
    name: "Licitanet",
    slug: "licitanet",
    base_url: "https://www.licitanet.com.br",
    technology_family: "LICITANET",
    vendor_name: "Licitanet – Licitações Eletrônicas",
    product_name: "Licitanet",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "UNKNOWN",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Transferegov: LICITANET, CNPJ 21.280.462/0001-80. GET público retornou HTTP 403 nesta sessão. Contrato técnico PENDENTE.",
  },
  {
    id: "src_bnc_platform",
    jurisdiction_id: "jur_br",
    name: "BNC Compras",
    slug: "bnc-compras",
    base_url: "https://bnc.org.br",
    technology_family: "BNC",
    vendor_name: "Bolsa Nacional de Compras",
    product_name: "BNC Compras",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "UNKNOWN",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Transferegov: BNC COMPRAS / Bolsa Nacional de Compras, CNPJ 25.099.967/0001-01. Site institucional WordPress observado. Portal transacional PENDENTE.",
  },
  {
    id: "src_bbmnet_platform",
    jurisdiction_id: "jur_br",
    name: "BBMNET Licitações",
    slug: "bbmnet",
    base_url: "https://bbmnet.com.br",
    technology_family: "BBMNET",
    vendor_name: "Bolsa Brasileira de Mercadorias",
    product_name: "BBMNET Licitações",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "UNKNOWN",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Transferegov: BBMNET Licitações / Bolsa Brasileira de Mercadorias, CNPJ 05.342.088/0001-43. Homepage institucional observada. URL transacional PENDENTE.",
  },
  {
    id: "src_licitar_platform",
    jurisdiction_id: "jur_br",
    name: "Licitar Digital",
    slug: "licitar-digital",
    base_url: "https://licitardigital.com.br",
    technology_family: "LICITAR_DIGITAL",
    vendor_name: "Licitar Digital Serviços em TI",
    product_name: "Licitar Digital",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "UNKNOWN",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Transferegov: LICITAR DIGITAL SERVIÇOS EM TI LTDA, CNPJ 35.125.567/0001-79. Homepage bloqueada por Cloudflare nesta sessão. Fingerprint PENDENTE.",
  },
  {
    id: "src_comprasbr_platform",
    jurisdiction_id: "jur_br",
    name: "ComprasBR / SIGA (AZ)",
    slug: "comprasbr",
    base_url: "https://comprasbr.com.br",
    technology_family: "COMPRASBR",
    vendor_name: "A Z Informática",
    product_name: "Pregão Eletrônico SIGA / ComprasBR",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "UNKNOWN",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Transferegov: PREGÃO ELETRÔNICO SIGA / COMPRASBR / A Z INFORMÁTICA LTDA, CNPJ 24.598.492/0001-27. NÃO confundir com SIGA RJ (GENERIC_STRUTS_ACTION) sem evidência de que o RJ usa AZ Informática.",
  },
  {
    id: "src_licitacoese_platform",
    jurisdiction_id: "jur_br",
    name: "Licitações-e (Banco do Brasil)",
    slug: "licitacoes-e",
    base_url: "https://www.licitacoes-e.com.br",
    technology_family: "BANCO_DO_BRASIL",
    vendor_name: "Banco do Brasil",
    product_name: "Licitações-e",
    vendor_evidence_level: "VERIFIED",
    vendor_confidence: 1,
    connector_type: "NONE",
    classification_state: "CLASSIFIED",
    discovery_strategy: "UNKNOWN",
    functional_family: "PROCUREMENT_TRANSACTIONAL",
    pncp_overlap: false,
    notes:
      "FATO — Transferegov: LICITAÇÕES-e / BANCO DO BRASIL S/A. Portal transacional e overlap PNCP PENDENTES de mapeamento nesta sessão.",
  },
];

const BLL_SOURCES = [
  "src_bll_platform",
  "src_bll_cambara_pr",
  "src_bll_novaolimpia_mt",
  "src_bll_aspasia_sp",
  "src_bll_baturite_ce",
  "src_bll_novaandradina_ms",
  "src_bll_ubaira_ba",
  "src_bll_cotia_sp",
] as const;

const BLL_ORGS: Record<string, string | undefined> = {
  src_bll_cambara_pr: "CAMBARA",
  src_bll_novaolimpia_mt: "NOVA OLIMPIA",
  src_bll_aspasia_sp: "ASPASIA",
  src_bll_baturite_ce: "BATURITE",
  src_bll_novaandradina_ms: "NOVA ANDRADINA",
  src_bll_ubaira_ba: "UBAIRA",
  src_bll_cotia_sp: "COTIA",
};

export async function seedMilestone3(sql: Sql): Promise<void> {
  for (const jur of JURISDICTIONS) {
    await upsert(sql, "jurisdiction", { ...jur, cnpj: null, active: true });
  }

  for (const sig of LEARNED_VENDOR_SIGNATURES) {
    await upsert(sql, "fingerprint_signature", {
      id: sig.id,
      technology_family: sig.technology_family,
      signature_type: sig.signature_type,
      key: sig.key,
      pattern: sig.pattern,
      weight: sig.weight,
      required: sig.required,
      description: sig.description,
      source_url: sig.source_url,
      is_vendor_claim: sig.is_vendor_claim,
    });
  }

  for (const source of SOURCES) {
    await upsert(sql, "source_system", {
      ...source,
      public_access: true,
      active: true,
      comprasgov_overlap: false,
      connector_version: source.connector_type === "GENERIC_ACTION" ? "1" : null,
    });
    await upsert(
      sql,
      "source_rate_policy",
      {
        source_system_id: source.id,
        max_concurrency: 1,
        requests_per_second: 1,
        timeout_ms: 8000,
        backoff_profile: "conservative",
      },
      "source_system_id",
    );
  }

  await upsert(sql, "source_evidence", {
    id: "ev_transferegov_bll",
    source_system_id: "src_bll_platform",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Transferegov — Lance Eletrônico / BLL",
    description:
      "Relação oficial dos sistemas eletrônicos de compras integrados ao Transferegov.br: LANCE ELETRÔNICO | BOLSA DE LICITAÇÕES E LEILÕES DO BRASIL | 10.508.843/0002-38.",
    url: TRANSFEREGOV,
    observed_value: "LANCE ELETRÔNICO",
    expected_signature: "BLL",
    verified_by: "seed-m3",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_edital_cambara_bll",
    source_system_id: "src_bll_cambara_pr",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Edital Dispensa Eletrônica 02/2026 — Cambará/PR",
    description:
      "Município de Cambará/PR publica a sessão na plataforma BLL, endereço https://bllcompras.com/Home/Login.",
    url: "https://pncp.gov.br/pncp-api/v1/orgaos/75442756000190/compras/2026/5/arquivos/1",
    observed_value: "PLATAFORMA BLL",
    expected_signature: "BLL",
    verified_by: "seed-m3",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_edital_novaolimpia_bll",
    source_system_id: "src_bll_novaolimpia_mt",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Pregão Eletrônico 027/2025 — Nova Olímpia/MT",
    description:
      "Plataforma eletrônica: Bolsa de Licitações e Leilões do Brasil – BLL. Edital em https://bll.org.br/. Cita integração ao PNCP.",
    url: "https://pncp.gov.br/pncp-api/v1/orgaos/03238920000130/compras/2025/32/arquivos/1",
    observed_value: "BOLSA DE LICITAÇÕES E LEILÕES DO BRASIL",
    expected_signature: "BLL",
    verified_by: "seed-m3",
    publisher: "Município de Nova Olímpia/MT",
    vendor_name: "Bolsa de Licitações e Leilões do Brasil",
    product_name: "BLL Compras",
    raw_excerpt:
      "PLATAFORMA ELETRÔNICA PARA REALIZAÇÃO DO CERTAME-BOLSA DE LICITAÇÕES E LEILÕES DO BRASIL – BLL. EDITAL DISPONIVEL EM: https://bll.org.br/",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_edital_ubaira_bll",
    source_system_id: "src_bll_ubaira_ba",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Pregão Eletrônico 003/2026 — Ubaíra/BA",
    description:
      "Prefeitura Municipal de Ubaíra realiza o certame na Bolsa de Licitações e Leilões do Brasil, https://bllcompras.com/Home/Login.",
    url: "https://pncp.gov.br/pncp-api/v1/orgaos/13910690000168/compras/2026/23/arquivos/1",
    observed_value: "Bolsa de Licitações e Leilões do Brasil",
    expected_signature: "BLL",
    verified_by: "seed-m3",
    publisher: "Município de Ubaíra/BA",
    published_at: "2026-03-02T00:00:00.000Z",
    vendor_name: "Bolsa de Licitações e Leilões do Brasil",
    product_name: "BLL Compras",
    raw_excerpt:
      "LOCAL: Bolsa de Licitações e Leilões do Brasil - https://bllcompras.com/Home/Login.",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_edital_cotia_bll",
    source_system_id: "src_bll_cotia_sp",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Pregão Eletrônico SRP 013/2026 — Cotia/SP",
    description:
      "Prefeitura do Município de Cotia realiza o pregão na plataforma da BLL — Bolsa de Licitações e Leilões do Brasil Ltda.",
    url: "https://pncp.gov.br/pncp-api/v1/orgaos/46523049000120/compras/2026/44/arquivos/1",
    observed_value: "plataforma da BLL",
    expected_signature: "BLL",
    verified_by: "seed-m3",
    publisher: "Prefeitura do Município de Cotia",
    published_at: "2026-04-01T00:00:00.000Z",
    vendor_name: "Bolsa de Licitações e Leilões do Brasil",
    product_name: "BLL Compras",
    raw_excerpt:
      "CADASTRO DE PROPOSTAS INICIAIS E DISPUTA: http://www.bll.org.br — plataforma da BLL - Bolsa de Licitações e Leilões do Brasil Ltda.",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_bll_live_search",
    source_system_id: "src_bll_platform",
    evidence_type: "ROUTE_SIGNATURE",
    evidence_level: "VERIFIED",
    title: "Busca pública BLL ProcessSearchPublic",
    description:
      "GET https://bllcompras.com/Process/ProcessSearchPublic?param1=5 — HTTP 200, title Busca de Processos - BLLCOMPRAS, Server Microsoft-IIS/10.0, X-AspNetMvc-Version 5.2. Colunas: Promotor, Número, Modalidade, Cidade, Situação. Rotas /Process/ProcessView. Header ASP.NET é framework, não vendor.",
    url: "https://bllcompras.com/Process/ProcessSearchPublic?param1=5",
    observed_value: "/Process/ProcessSearchPublic",
    expected_signature: "/Process/ProcessSearchPublic",
    verified_by: "seed-m3",
  });

  for (const id of ["src_bll_aspasia_sp", "src_bll_baturite_ce", "src_bll_novaandradina_ms"] as const) {
    const label = BLL_ORGS[id] ?? id;
    await upsert(sql, "source_evidence", {
      id: `ev_bll_listing_${id}`,
      source_system_id: id,
      evidence_type: "VENDOR_REFERENCE",
      evidence_level: "STRONG_INDICATION",
      title: `Promotor ${label} na busca pública BLL`,
      description: `Órgão observado como promotor em bllcompras.com/Process/ProcessSearchPublic em 2026-09-14. Não substitui edital municipal.`,
      url: "https://bllcompras.com/Process/ProcessSearchPublic?param1=5",
      observed_value: label,
      expected_signature: "BLL",
      verified_by: "seed-m3",
    });
  }

  await upsert(sql, "source_evidence", {
    id: "ev_transferegov_pcp",
    source_system_id: "src_pcp_platform",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Transferegov — Portal de Compras Públicas / eCustomize",
    description:
      "PORTAL DE COMPRAS PÚBLICAS | ECUSTOMIZE CONSULTORIA EM SOFTWARE LTDA | 09.397.355/0001-30.",
    url: TRANSFEREGOV,
    observed_value: "PORTAL DE COMPRAS PÚBLICAS",
    expected_signature: "eCustomize",
    verified_by: "seed-m3",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_contrato_linhares_pcp",
    source_system_id: "src_pcp_linhares_es",
    evidence_type: "PUBLIC_CONTRACT",
    evidence_level: "VERIFIED",
    title: "Contrato 5/2024 — Câmara Municipal de Linhares",
    description:
      "Contratação do sistema Portal de Compras Públicas. Contratada: ECUSTOMIZE CONSULTORIA EM SOFTWARE S.A, CNPJ 09.397.355/0001-30.",
    url: "https://www.camaralinhares.es.gov.br/transparencia/contrato/ver/150",
    observed_value: "PORTAL DE COMPRAS PÚBLICAS",
    expected_signature: "eCustomize",
    verified_by: "seed-m3",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_alegre_pcp",
    source_system_id: "src_pcp_alegre_es",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Adesão oficial Alegre/ES ao Portal de Compras Públicas",
    description:
      "Prefeitura Municipal de Alegre declara adesão ao Portal de Compras Públicas, mantido pela Ecustomize Consultoria em Software S/A.",
    url: "https://www.alegre.es.gov.br/category/licitacoes/page/2/",
    observed_value: "Portal de Compras Públicas",
    expected_signature: "eCustomize",
    verified_by: "seed-m3",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_transferegov_scpi",
    source_system_id: "src_fiorilli_itapira",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Transferegov — SCPI / Fiorilli",
    description: "SCPI | FIORILLI SOFTWARE LTDA | 01.704.233/0001-38.",
    url: TRANSFEREGOV,
    observed_value: "SCPI",
    expected_signature: "Fiorilli",
    verified_by: "seed-m3",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_edital_itapira_scpi",
    source_system_id: "src_fiorilli_itapira",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Edital Itapira/SP — SCPI Fiorilli",
    description:
      "Sistema SCPI – Portal de Compras – Pregão Eletrônico – FIORILLI, http://transparencia.itapira.sp.gov.br:8079/comprasedital/.",
    url: "https://pncp.gov.br/pncp-api/v1/orgaos/45281144000100/compras/2025/98/arquivos/1",
    observed_value: "FIORILLI",
    expected_signature: "/comprasedital",
    verified_by: "seed-m3",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_edital_irapua_scpi",
    source_system_id: "src_fiorilli_irapua",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Publicação Irapuã/SP — SCPI Fiorilli",
    description:
      "SCPI – Portal de Compras – Pregão Eletrônico FIORILLI em http://170.0.49.246:5656/comprasedital/.",
    url: "https://irapua.sp.gov.br/publicacoes/ver/2182",
    observed_value: "FIORILLI",
    expected_signature: "/comprasedital",
    verified_by: "seed-m3",
    publisher: "Município de Irapuã/SP",
    vendor_name: "Fiorilli Software",
    product_name: "SCPI Portal de Compras",
    raw_excerpt:
      "SCPI – Portal de Compras – Pregão Eletrônico FIORILLI em http://170.0.49.246:5656/comprasedital/.",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_edital_urupes_scpi",
    source_system_id: "src_fiorilli_urupes",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Leilão eletrônico 2025 — Urupês/SP",
    description:
      "Diário oficial: Sistema Eletrônico SCPI – PORTAL DE COMPRAS (FIORILLI) em http://transparencia.urupes.sp.gov.br:5656/comprasedital/.",
    url: "https://dosp.com.br/exibe_do.php?i=NzQzOTIw",
    observed_value: "SCPI – PORTAL DE COMPRAS (FIORILLI)",
    expected_signature: "/comprasedital",
    verified_by: "seed-m3",
    publisher: "Município de Urupês/SP",
    published_at: "2025-12-01T00:00:00.000Z",
    vendor_name: "Fiorilli Software",
    product_name: "SCPI Portal de Compras",
    raw_excerpt:
      "Sistema Eletrônico SCPI – PORTAL DE COMPRAS (FIORILLI) http://transparencia.urupes.sp.gov.br:5656/comprasedital/",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_edital_assis_scpi",
    source_system_id: "src_fiorilli_assis",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Dispensa eletrônica 3102/2025 — Assis/SP",
    description:
      "Prefeitura de Assis publica a sessão no Portal de Compras Fiorilli https://scpi.assis.sp.gov.br:8079/comprasedital/.",
    url: "https://pncp.gov.br/pncp-api/v1/orgaos/46179941000135/compras/2025/393/arquivos/1",
    observed_value: "Portal de Compras Fiorilli",
    expected_signature: "/comprasedital",
    verified_by: "seed-m3",
    publisher: "Prefeitura Municipal de Assis",
    published_at: "2025-10-16T00:00:00.000Z",
    vendor_name: "Fiorilli Software",
    product_name: "SCPI Portal de Compras",
    raw_excerpt:
      "Local de Realização da Sessão Pública Portal de Compras Fiorilli https://scpi.assis.sp.gov.br:8079/comprasedital/",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_edital_sales_scpi",
    source_system_id: "src_fiorilli_sales",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Concorrência eletrônica 002/2025 — Sales/SP",
    description:
      "Prefeitura Municipal de Sales/SP nomeia SCPI – Portal de Compras – Fiorilli em http://170.0.48.169:8079/comprasedital/.",
    url: "https://pncp.gov.br/pncp-api/v1/orgaos/46613196000190/compras/2025/65/arquivos/1",
    observed_value: "SCPI – Portal de Compras – Fiorilli",
    expected_signature: "/comprasedital",
    verified_by: "seed-m3",
    publisher: "Prefeitura Municipal de Sales/SP",
    published_at: "2025-10-29T00:00:00.000Z",
    vendor_name: "Fiorilli Software",
    product_name: "SCPI Portal de Compras",
    raw_excerpt:
      "ENDEREÇO ELETRÔNICO: (http://170.0.48.169:8079/comprasedital/) - SCPI - Portal de Compras – Fiorilli. PREFEITURA MUNICIPAL DE SALES/SP.",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_portal_florianopolis_paradigma",
    source_system_id: "src_paradigma_florianopolis",
    evidence_type: "HTML_SIGNATURE",
    evidence_level: "VERIFIED",
    title: "Portal oficial Florianópolis — Paradigma EGOV",
    description:
      "wbc.pmf.sc.gov.br, domínio da Prefeitura de Florianópolis, identifica o sistema como 'Paradigma EGOV - florianopolis'. Título de produto no portal do ente, não inferência visual.",
    url: "https://wbc.pmf.sc.gov.br/",
    observed_value: "Paradigma EGOV - florianopolis",
    expected_signature: "Paradigma EGOV",
    verified_by: "seed-m3",
    publisher: "Prefeitura Municipal de Florianópolis",
    observed_at: "2026-09-14T00:00:00.000Z",
    vendor_name: "Paradigma Business Solutions",
    product_name: "Paradigma EGOV",
    raw_excerpt: "Paradigma EGOV - florianopolis",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_manual_barueri_wbc",
    source_system_id: "src_paradigma_barueri",
    evidence_type: "OFFICIAL_MANUAL",
    evidence_level: "VERIFIED",
    title: "Manual WBC 2025 no portal de Barueri",
    description:
      "compras.barueri.sp.gov.br hospeda manual de cadastro WBC (janeiro/2025) com marca www.paradigmabs.com.br.",
    url: "https://compras.barueri.sp.gov.br/upload/display/1/Anexos/wbc202501091408410470.pdf",
    observed_value: "www.paradigmabs.com.br",
    expected_signature: "WBC",
    verified_by: "seed-m3",
    publisher: "Prefeitura de Barueri / Paradigma Business Solutions",
    published_at: "2025-01-09T00:00:00.000Z",
    vendor_name: "Paradigma Business Solutions",
    product_name: "Paradigma WBC Public",
    raw_excerpt: "www.paradigmabs.com.br — Entendendo a Renovação Cadastral — Portal de Compras Prefeitura de Barueri",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_transferegov_elic_sc",
    source_system_id: "src_sc_compras",
    evidence_type: "OFFICIAL_DOCUMENT",
    evidence_level: "VERIFIED",
    title: "Transferegov — e-LIC / SEA Santa Catarina",
    description:
      "Relação oficial: e-LIC | SECRETARIA DE ESTADO DA ADM DE SANTA CATARINA | 82.951.351/0001-42. Sistema atual integrado NÃO é Paradigma. Histórico de imprensa 2014 permanece em source_platform_history.",
    url: TRANSFEREGOV,
    observed_value: "e-LIC",
    expected_signature: "e-LIC",
    verified_by: "seed-m3",
    publisher: "Transferegov.br / MGI",
    vendor_name: null,
    product_name: "e-LIC",
    raw_excerpt:
      "e-LIC | SECRETARIA DE ESTADO DA ADM DE SANTA CATARINA | 82.951.351/0001-42",
  });
  await upsert(sql, "source_evidence", {
    id: "ev_press_sc_paradigma_2014",
    source_system_id: "src_sc_compras",
    evidence_type: "VENDOR_REFERENCE",
    evidence_level: "WEAK_INDICATION",
    title: "Imprensa 2014 — SC entre usuários WBC Public",
    description:
      "Reportagem Baguete/ABES (2014) cita os estados de Pernambuco, Pará e Santa Catarina como usuários da solução WBC Public. NÃO é contrato vigente. NÃO sobrescreve a classificação atual GENERIC_JSON_API / e-LIC.",
    url: "https://www.baguete.com.br/noticias/sao-bernardo-e-procurement-com-paradigma-wbc",
    observed_value: "estados de Pernambuco, Pará e Santa Catarina",
    expected_signature: "WBC Public",
    verified_by: "seed-m3",
    publisher: "Baguete",
    published_at: "2014-08-05T00:00:00.000Z",
    vendor_name: "Paradigma Business Solutions",
    product_name: "WBC Public",
    raw_excerpt:
      "Outras cidades paulistas que também usam esta solução são Piracicaba, Sorocaba e Diadema, assim como municípios de outros estados como Florianópolis e sistemas federativos da indústria no RS, SC, PR e RJ, bem como os estados de Pernambuco, Pará e Santa Catarina.",
  });
  const otherOfficial: Array<[string, string, string, string]> = [
    ["ev_transferegov_licitanet", "src_licitanet_platform", "LICITANET", "21.280.462/0001-80"],
    ["ev_transferegov_bnc", "src_bnc_platform", "BNC COMPRAS", "25.099.967/0001-01"],
    ["ev_transferegov_bbmnet", "src_bbmnet_platform", "BBMNET Licitações", "05.342.088/0001-43"],
    ["ev_transferegov_licitar", "src_licitar_platform", "LICITAR DIGITAL", "35.125.567/0001-79"],
    ["ev_transferegov_comprasbr", "src_comprasbr_platform", "PREGÃO ELETRÔNICO SIGA / COMPRASBR", "24.598.492/0001-27"],
    ["ev_transferegov_licitacoese", "src_licitacoese_platform", "LICITAÇÕES-e", "BANCO DO BRASIL S/A"],
  ];
  for (const [id, source, title, cnpj] of otherOfficial) {
    await upsert(sql, "source_evidence", {
      id,
      source_system_id: source,
      evidence_type: "OFFICIAL_DOCUMENT",
      evidence_level: "VERIFIED",
      title: `Transferegov — ${title}`,
      description: `Cadastro oficial Transferegov.br. CNPJ/ente: ${cnpj}.`,
      url: TRANSFEREGOV,
      observed_value: title,
      expected_signature: title,
      verified_by: "seed-m3",
    });
  }

  for (const sourceId of BLL_SOURCES) {
    await upsert(sql, "source_endpoint", {
      id: `ep_${sourceId}_search`,
      source_system_id: sourceId,
      name: "ProcessSearchPublic",
      path: BLL_DISCOVER,
      http_method: "GET",
      endpoint_type: "HTML_LIST",
      public: true,
      pagination_type: "UNKNOWN",
      requires_cookie: false,
      requires_csrf: false,
      requires_auth: false,
      status: "UNKNOWN",
    });
    await upsert(sql, "source_capability", {
      id: `cap_${sourceId}_discover`,
      source_system_id: sourceId,
      capability: "DISCOVER_PROCUREMENTS",
      access_type: "PUBLIC",
      endpoint_or_url: BLL_DISCOVER,
      method: "GET",
      auth_required: false,
      publicly_observed: true,
      pagination_type: "UNKNOWN",
      documented: true,
      confidence: 0.9,
    });
    const org = BLL_ORGS[sourceId];
    await upsert(
      sql,
      "source_connector_config",
      {
        source_system_id: sourceId,
        connector_type: "GENERIC_ACTION",
        base_url: "https://bllcompras.com",
        paths_json: {
          discover: BLL_DISCOVER,
          detail: "/Process/ProcessView",
          linkPattern: BLL_LINK,
        },
        default_params_json: org ? { organization: org } : {},
        enabled: true,
      },
      "source_system_id",
    );
    await upsert(sql, "source_observation", {
      id: `obs_${sourceId}_route`,
      source_system_id: sourceId,
      observation_type: "ROUTE",
      key: "pathname",
      value: "/Process/ProcessSearchPublic",
      source_url: `https://bllcompras.com${BLL_DISCOVER}`,
    });
    await upsert(sql, "source_observation", {
      id: `obs_${sourceId}_header`,
      source_system_id: sourceId,
      observation_type: "SERVER_HEADER",
      key: "header",
      value: "X-AspNetMvc-Version",
      source_url: `https://bllcompras.com${BLL_DISCOVER}`,
    });
    await upsert(sql, "source_system_relationship", {
      id: `rel_${sourceId}_platform`,
      source_system_id: sourceId,
      related_source_system_id: "src_bll_platform",
      relation_type: sourceId === "src_bll_platform" ? "MIRRORS" : "LINKS_TO",
    });
  }

  await upsert(sql, "source_observation", {
    id: "obs_bll_title",
    source_system_id: "src_bll_platform",
    observation_type: "HTML_TITLE",
    key: "title",
    value: "Busca de Processos - BLLCOMPRAS",
    source_url: "https://bllcompras.com/Process/ProcessSearchPublic?param1=5",
  });
  await upsert(sql, "source_observation", {
    id: "obs_pcp_host",
    source_system_id: "src_pcp_platform",
    observation_type: "ROUTE",
    key: "host",
    value: "portaldecompraspublicas.com.br",
    source_url: "https://www.portaldecompraspublicas.com.br/",
  });
  await upsert(sql, "source_observation", {
    id: "obs_pcp_ng",
    source_system_id: "src_pcp_platform",
    observation_type: "JS_GLOBAL",
    key: "js_global",
    value: "ng-app",
    source_url: "https://www.portaldecompraspublicas.com.br/processos",
  });

  const now = new Date().toISOString();
  for (const source of SOURCES) {
    await upsert(sql, "source_platform_history", {
      id: `hist_${source.id}_current`,
      source_system_id: source.id,
      technology_family: source.technology_family,
      vendor_name: source.vendor_name,
      product_name: source.product_name,
      valid_from: now,
      valid_to: null,
      evidence_id: null,
      confidence: source.vendor_confidence,
    });
  }

  // Historical interval for SC. Never overwrite the current GENERIC_JSON_API row.
  await upsert(sql, "source_platform_history", {
    id: "hist_src_sc_compras_paradigma_2014",
    source_system_id: "src_sc_compras",
    technology_family: "PARADIGMA_WBC",
    vendor_name: "Paradigma Business Solutions",
    product_name: "WBC Public",
    valid_from: "2014-08-05T00:00:00.000Z",
    valid_to: "2023-12-31T23:59:59.000Z",
    evidence_id: "ev_press_sc_paradigma_2014",
    confidence: 0.35,
  });

  await upsert(sql, "source_observation", {
    id: "obs_paradigma_pmf_title",
    source_system_id: "src_paradigma_florianopolis",
    observation_type: "HTML_TITLE",
    key: "title",
    value: "Paradigma EGOV - florianopolis",
    source_url: "https://wbc.pmf.sc.gov.br/",
  });
  await upsert(sql, "source_observation", {
    id: "obs_paradigma_pmf_host",
    source_system_id: "src_paradigma_florianopolis",
    observation_type: "ROUTE",
    key: "host",
    value: "wbc.pmf.sc.gov.br",
    source_url: "https://wbc.pmf.sc.gov.br/",
  });
  await upsert(sql, "source_observation", {
    id: "obs_barueri_host",
    source_system_id: "src_paradigma_barueri",
    observation_type: "ROUTE",
    key: "host",
    value: "compras.barueri.sp.gov.br",
    source_url: "https://compras.barueri.sp.gov.br/",
  });
  for (const id of [
    "src_fiorilli_itapira",
    "src_fiorilli_irapua",
    "src_fiorilli_urupes",
    "src_fiorilli_assis",
    "src_fiorilli_sales",
  ]) {
    await upsert(sql, "source_observation", {
      id: `obs_${id}_comprasedital`,
      source_system_id: id,
      observation_type: "ROUTE",
      key: "pathname",
      value: "/comprasedital",
    });
  }

  await upsert(sql, "source_alert", {
    id: "alert_bll_adapter_reusable",
    source_system_id: "src_bll_platform",
    alert_type: "ADAPTER_REUSABLE",
    severity: "info",
    message:
      "Família BLL: 1 adapter generic-action + 8 configs. Adapter comercial BllAdapter = NO-GO — o genérico cobre o contrato HTML público sem forks por município.",
    payload: {
      family: "BLL",
      adapter: "GENERIC_ACTION",
      sources: BLL_SOURCES,
      commercial_adapter: "NO-GO",
      generic_reuse: "GO",
    },
  });
  await upsert(sql, "source_alert", {
    id: "alert_fiorilli_no_vendor_adapter",
    source_system_id: "src_fiorilli_itapira",
    alert_type: "SOURCE_FAMILY_CONFIRMED",
    severity: "info",
    message:
      "Família SCPI/Fiorilli: 5 entes VERIFIED com path /comprasedital. Adapter FiorilliAdapter = NO-GO — contrato HTML ao vivo não exercitado; não promover framework a fornecedor.",
    payload: {
      family: "SCPI_FIORILLI",
      adapter: "NONE",
      commercial_adapter: "NO-GO",
      generic_reuse: "NO-GO",
    },
  });
  await upsert(sql, "source_alert", {
    id: "alert_paradigma_census_incomplete",
    source_system_id: "src_paradigma_florianopolis",
    alert_type: "SOURCE_FAMILY_CONFIRMED",
    severity: "info",
    message:
      "Paradigma/WBC: Florianópolis e Barueri VERIFIED vigentes. SC estadual é histórico (2014–2023) e atual e-LIC. ParadigmaAdapter = NO-GO.",
    payload: {
      family: "PARADIGMA_WBC",
      commercial_adapter: "NO-GO",
      generic_reuse: "NO-GO",
    },
  });
}
