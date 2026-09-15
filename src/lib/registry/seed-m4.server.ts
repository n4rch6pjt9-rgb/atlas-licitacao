import type { Sql } from "@/lib/db";
import { classifyLocalOnly, leadTimeHours, nextRecheckAt } from "./coverage.ts";
import { resolveProcurement, type CanonicalCandidate } from "./entity-resolution.ts";
import { sha256 } from "./hash.ts";
import { payloadHash } from "./hash.ts";
import { schemaFingerprint } from "./schema-fingerprint.ts";
import { pncpEditalUrl, toPublicPncpUrl } from "./pncp-url.ts";
import type { ConnectorType, EvidenceLevel, SourceProcurement, TechnologyFamily } from "./types.ts";

const JSONB_KEYS = new Set([
  "raw_payload",
  "paths_json",
  "default_params_json",
  "headers_json",
  "pagination_config",
  "normalization_config",
  "document_config",
  "payload",
  "matched_fields",
  "conflicting_fields",
]);

const BLL_DISCOVER = "/Process/ProcessSearchPublic?param1=0";
const BLL_LINK = "Process/ProcessView";
const OBSERVED = "2026-09-14T20:00:00.000Z";
const NOW = new Date("2026-09-14T20:00:00.000Z");

async function upsert(
  sql: Sql,
  table: string,
  row: Record<string, unknown>,
  pk = "id",
): Promise<void> {
  const keys = Object.keys(row);
  const cols = keys.join(", ");
  const placeholders = keys
    .map((key, i) => (JSONB_KEYS.has(key) ? `$${i + 1}::jsonb` : `$${i + 1}`))
    .join(", ");
  const params = keys.map((key) => {
    const value = row[key];
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

type BllEnte = {
  id: string;
  jur: string;
  jurType: "MUNICIPALITY" | "PUBLIC_ENTITY";
  ibge: string;
  uf: string;
  name: string;
  parent: string;
  org: string;
  cnpj: string | null;
  level: EvidenceLevel;
  evidenceTitle: string;
  evidenceUrl: string;
  excerpt: string;
  existing?: boolean;
};

const PARENTS: Array<{ id: string; uf: string; name: string; ibge: string }> = [
  { id: "jur_go", uf: "GO", name: "Goiás", ibge: "52" },
];

const BLL_ENTES: BllEnte[] = [
  {
    id: "src_bll_cambara_pr",
    jur: "jur_cambara_pr",
    jurType: "MUNICIPALITY",
    ibge: "4104006",
    uf: "PR",
    name: "Cambará",
    parent: "jur_pr",
    org: "CAMBARA",
    cnpj: "75442756000190",
    level: "VERIFIED",
    existing: true,
    evidenceTitle: "Pregão Eletrônico 05/2026 — Cambará/PR",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/75442756000190/compras/2026/17/arquivos/2",
    excerpt: "A sessão de processamento do Pregão será realizada ATRAVÉS DO SITE www.bllcompras.com",
  },
  {
    id: "src_bll_novaolimpia_mt",
    jur: "jur_novaolimpia_mt",
    jurType: "MUNICIPALITY",
    ibge: "5106232",
    uf: "MT",
    name: "Nova Olímpia",
    parent: "jur_mt",
    org: "NOVA OLIMPIA",
    cnpj: "03238920000130",
    level: "VERIFIED",
    existing: true,
    evidenceTitle: "Pregão Eletrônico 041/2025 — Nova Olímpia/MT",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/03238920000130/compras/2025/51/arquivos/1",
    excerpt:
      "plataforma eletrônica de Bolsa de Licitações e Leilões do Brasil - BLL, aba Pregão Eletrônico, disponível no endereço eletrônico bllcompras.com",
  },
  {
    id: "src_bll_ubaira_ba",
    jur: "jur_ubaira_ba",
    jurType: "MUNICIPALITY",
    ibge: "2932606",
    uf: "BA",
    name: "Ubaíra",
    parent: "jur_ba",
    org: "UBAIRA",
    cnpj: "13910690000168",
    level: "VERIFIED",
    existing: true,
    evidenceTitle: "Pregão Eletrônico 003/2026 — Ubaíra/BA",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/13910690000168/compras/2026/23/arquivos/1",
    excerpt: "LOCAL: Bolsa de Licitações e Leilões do Brasil - https://bllcompras.com/Home/Login.",
  },
  {
    id: "src_bll_cotia_sp",
    jur: "jur_cotia_sp",
    jurType: "MUNICIPALITY",
    ibge: "3513009",
    uf: "SP",
    name: "Cotia",
    parent: "jur_sp",
    org: "COTIA",
    cnpj: "46523049000120",
    level: "VERIFIED",
    existing: true,
    evidenceTitle: "Pregão Eletrônico 009/2026 — Cotia/SP",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/46523049000120/compras/2026/26/arquivos/1",
    excerpt:
      "plataforma da BLL - Bolsa de Licitações e Leilões do Brasil Ltda. CADASTRO: http://www.bll.org.br",
  },
  {
    id: "src_bll_aspasia_sp",
    jur: "jur_aspasia_sp",
    jurType: "MUNICIPALITY",
    ibge: "3503950",
    uf: "SP",
    name: "Aspásia",
    parent: "jur_sp",
    org: "ASPASIA",
    cnpj: null,
    level: "STRONG_INDICATION",
    existing: true,
    evidenceTitle: "Promotor ASPASIA na busca pública BLL",
    evidenceUrl: "https://bllcompras.com/Process/ProcessSearchPublic?param1=0",
    excerpt: "MUNICIPIO DE ASPASIA listado como promotor na busca pública BLL.",
  },
  {
    id: "src_bll_baturite_ce",
    jur: "jur_baturite_ce",
    jurType: "MUNICIPALITY",
    ibge: "2302104",
    uf: "CE",
    name: "Baturité",
    parent: "jur_ce",
    org: "BATURITE",
    cnpj: null,
    level: "STRONG_INDICATION",
    existing: true,
    evidenceTitle: "Promotor BATURITE na busca pública BLL",
    evidenceUrl: "https://bllcompras.com/Process/ProcessSearchPublic?param1=0",
    excerpt: "MUNICIPIO DE BATURITE listado como promotor na busca pública BLL.",
  },
  {
    id: "src_bll_novaandradina_ms",
    jur: "jur_novaandradina_ms",
    jurType: "MUNICIPALITY",
    ibge: "5006200",
    uf: "MS",
    name: "Nova Andradina",
    parent: "jur_ms",
    org: "NOVA ANDRADINA",
    cnpj: null,
    level: "STRONG_INDICATION",
    existing: true,
    evidenceTitle: "Promotor NOVA ANDRADINA na busca pública BLL",
    evidenceUrl: "https://bllcompras.com/Process/ProcessSearchPublic?param1=0",
    excerpt: "MUNICIPIO DE NOVA ANDRADINA listado como promotor na busca pública BLL.",
  },
  {
    id: "src_bll_rondonopolis_mt",
    jur: "jur_rondonopolis_mt",
    jurType: "MUNICIPALITY",
    ibge: "5107602",
    uf: "MT",
    name: "Rondonópolis",
    parent: "jur_mt",
    org: "RONDONOPOLIS",
    cnpj: null,
    level: "VERIFIED",
    evidenceTitle: "Pregão Eletrônico 16/2026 — Rondonópolis/MT",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/03347101000121/compras/2026/63/arquivos/2",
    excerpt: "Local: bllcompras.com — Pregão Eletrônico n.º 16/2026 do Município de Rondonópolis-MT.",
  },
  {
    id: "src_bll_moradanova_ce",
    jur: "jur_moradanova_ce",
    jurType: "MUNICIPALITY",
    ibge: "2308708",
    uf: "CE",
    name: "Morada Nova",
    parent: "jur_ce",
    org: "MORADA NOVA",
    cnpj: "02135340000155",
    level: "VERIFIED",
    evidenceTitle: "Pregão eletrônico — Morada Nova/CE na BLL",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/02135340000155/compras/2025/26/arquivos/1",
    excerpt:
      "sistema BLL: https://bllcompras.com/Home/PublicAccess — Município de MORADA NOVA/CE, CNPJ 02.135.340/0001-55.",
  },
  {
    id: "src_bll_aracruz_es",
    jur: "jur_aracruz_es",
    jurType: "MUNICIPALITY",
    ibge: "3200607",
    uf: "ES",
    name: "Aracruz",
    parent: "jur_es",
    org: "ARACRUZ",
    cnpj: "27142702000166",
    level: "VERIFIED",
    evidenceTitle: "Pregão eletrônico 2026 — Aracruz/ES",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/27142702000166/compras/2026/173/arquivos/1",
    excerpt:
      "sessão pública por meio de sistema eletrônico - BLL - Bolsa de Licitações do Brasil, https://bllcompras.com/Home/Login.",
  },
  {
    id: "src_bll_lambari_mt",
    jur: "jur_lambari_mt",
    jurType: "MUNICIPALITY",
    ibge: "5105234",
    uf: "MT",
    name: "Lambari D'Oeste",
    parent: "jur_mt",
    org: "LAMBARI D OESTE",
    cnpj: "37465408000149",
    level: "VERIFIED",
    evidenceTitle: "Concorrência eletrônica 05/2026 — Lambari D'Oeste/MT",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/37465408000149/compras/2026/14/arquivos/1",
    excerpt: "plataforma eletrônica de disputa acessada pelo link: https://bllcompras.com/",
  },
  {
    id: "src_bll_juazeiro_ce",
    jur: "jur_juazeiro_ce",
    jurType: "MUNICIPALITY",
    ibge: "2307304",
    uf: "CE",
    name: "Juazeiro do Norte",
    parent: "jur_ce",
    org: "JUAZEIRO DO NORTE",
    cnpj: "07974082000114",
    level: "VERIFIED",
    evidenceTitle: "Concorrência eletrônica 2025 — Juazeiro do Norte/CE",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/07974082000114/compras/2025/131/arquivos/1",
    excerpt:
      "plataforma eletrônica bllcompras.com — Prefeitura Municipal de Juazeiro do Norte, CNPJ 07.974.082/0001-14.",
  },
  {
    id: "src_bll_sjoaquim_sp",
    jur: "jur_sjoaquim_sp",
    jurType: "MUNICIPALITY",
    ibge: "3549409",
    uf: "SP",
    name: "São Joaquim da Barra",
    parent: "jur_sp",
    org: "SAO JOAQUIM DA BARRA",
    cnpj: "59851543000165",
    level: "VERIFIED",
    evidenceTitle: "Pregão Eletrônico 112/2025 — São Joaquim da Barra/SP",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/59851543000165/compras/2025/164/arquivos/1",
    excerpt: "PLATAFORMA DE DISPUTA: BLL COMPRAS https://bllcompras.com/Home/Login",
  },
  {
    id: "src_bll_pedrotoledo_sp",
    jur: "jur_pedrotoledo_sp",
    jurType: "MUNICIPALITY",
    ibge: "3537208",
    uf: "SP",
    name: "Pedro de Toledo",
    parent: "jur_sp",
    org: "PEDRO DE TOLEDO",
    cnpj: null,
    level: "VERIFIED",
    evidenceTitle: "Edital municipal Pedro de Toledo/SP — BLL COMPRAS",
    evidenceUrl: "https://sistema.pedrodetoledo.sp.gov.br/pdf/documentos/69dff5834c332-211-2026-15-04.pdf",
    excerpt:
      "credenciamento no endereço eletrônico https://bllcompras.com — Prefeitura Municipal de Pedro de Toledo.",
  },
  {
    id: "src_bll_dourados_ms",
    jur: "jur_dourados_ms",
    jurType: "MUNICIPALITY",
    ibge: "5003702",
    uf: "MS",
    name: "Dourados",
    parent: "jur_ms",
    org: "DOURADOS",
    cnpj: "03155926000144",
    level: "VERIFIED",
    evidenceTitle: "Pregão eletrônico 2025 — Dourados/MS",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/03155926000144/compras/2025/132/arquivos/5",
    excerpt:
      "Portal Bolsa de Licitações e Leilões do Brasil-BLL, no sítio eletrônico https://bllcompras.com/Home/Login.",
  },
  {
    id: "src_bll_irati_pr",
    jur: "jur_irati_pr",
    jurType: "MUNICIPALITY",
    ibge: "4109401",
    uf: "PR",
    name: "Irati",
    parent: "jur_pr",
    org: "IRATI",
    cnpj: "75654574000182",
    level: "VERIFIED",
    evidenceTitle: "Pregão Eletrônico 025/2026 — Irati/PR",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/75654574000182/compras/2026/104/arquivos/1",
    excerpt:
      "PLATAFORMA DE DISPUTA: BLL. O Município de Irati, CNPJ 75.654.574/0001-82, www.bll.org.br.",
  },
  {
    id: "src_bll_borborema_sp",
    jur: "jur_borborema_sp",
    jurType: "MUNICIPALITY",
    ibge: "3507108",
    uf: "SP",
    name: "Borborema",
    parent: "jur_sp",
    org: "BORBOREMA",
    cnpj: "46737219000179",
    level: "VERIFIED",
    evidenceTitle: "Pregão Eletrônico 004/2026 — Borborema/SP",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/46737219000179/compras/2026/2/arquivos/1",
    excerpt:
      "PLATAFORMA: WWW.BLLCOMPRAS.ORG.BR — Bolsa de Licitações e Leilões - BLL. Município de BORBOREMA/SP.",
  },
  {
    id: "src_bll_santos_sp",
    jur: "jur_santos_sp",
    jurType: "MUNICIPALITY",
    ibge: "3548500",
    uf: "SP",
    name: "Santos",
    parent: "jur_sp",
    org: "SANTOS",
    cnpj: "58200015000183",
    level: "VERIFIED",
    evidenceTitle: "Pregão Eletrônico 18.011/2026 — Santos/SP",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/58200015000183/compras/2026/129/arquivos/1",
    excerpt:
      "Plataforma BLL Compras constante da página eletrônica da Bolsa de Licitações e Leilões do Brasil (bllcompras.com).",
  },
  {
    id: "src_bll_camara_santos_sp",
    jur: "jur_camara_santos_sp",
    jurType: "PUBLIC_ENTITY",
    ibge: "3548500",
    uf: "SP",
    name: "Câmara Municipal de Santos",
    parent: "jur_santos_sp",
    org: "CAMARA DE SANTOS",
    cnpj: "49203409000102",
    level: "VERIFIED",
    evidenceTitle: "Pregão Eletrônico 09/2026 — Câmara de Santos/SP",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/49203409000102/compras/2026/16/arquivos/1",
    excerpt: "sistema BLL Compras — CÂMARA MUNICIPAL DE SANTOS, Pregão Eletrônico Nº 09/2026.",
  },
  {
    id: "src_bll_campoalegre_go",
    jur: "jur_campoalegre_go",
    jurType: "MUNICIPALITY",
    ibge: "5204805",
    uf: "GO",
    name: "Campo Alegre de Goiás",
    parent: "jur_go",
    org: "CAMPO ALEGRE DE GOIAS",
    cnpj: "01763614000198",
    level: "STRONG_INDICATION",
    evidenceTitle: "Pregão eletrônico 033/2022 — Campo Alegre de Goiás/GO",
    evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/01763614000198/compras/2022/1/arquivos/1",
    excerpt:
      "provedor bllcompras.com. Edital de 2022 — não prova sozinho que o portal vigente em 2026 continua BLL.",
  },
];

const GAPS: Array<{
  id: string;
  parent: string;
  ibge: string;
  uf: string;
  name: string;
  presence: "UNKNOWN" | "NO_PORTAL_FOUND";
}> = [
  { id: "jur_joinville_sc", parent: "jur_sc", ibge: "4209102", uf: "SC", name: "Joinville", presence: "UNKNOWN" },
  { id: "jur_blumenau_sc", parent: "jur_sc", ibge: "4202404", uf: "SC", name: "Blumenau", presence: "UNKNOWN" },
  { id: "jur_londrina_pr", parent: "jur_pr", ibge: "4113700", uf: "PR", name: "Londrina", presence: "UNKNOWN" },
  { id: "jur_maringa_pr", parent: "jur_pr", ibge: "4115200", uf: "PR", name: "Maringá", presence: "UNKNOWN" },
  { id: "jur_sorocaba_sp", parent: "jur_sp", ibge: "3552205", uf: "SP", name: "Sorocaba", presence: "UNKNOWN" },
  { id: "jur_bauru_sp", parent: "jur_sp", ibge: "3506001", uf: "SP", name: "Bauru", presence: "UNKNOWN" },
  { id: "jur_cuiaba_mt", parent: "jur_mt", ibge: "5103403", uf: "MT", name: "Cuiabá", presence: "UNKNOWN" },
  { id: "jur_fortaleza_ce", parent: "jur_ce", ibge: "2304400", uf: "CE", name: "Fortaleza", presence: "UNKNOWN" },
];

function hoursAgo(hours: number): string {
  return new Date(NOW.getTime() - hours * 3_600_000).toISOString();
}

function asProcurement(
  ente: BllEnte,
  seq: number,
  extra: Record<string, unknown>,
): SourceProcurement {
  const process = `${String(seq).padStart(3, "0")}/2026`;
  const object =
    typeof extra.objeto === "string"
      ? extra.objeto
      : `Aquisição de materiais e serviços — ${ente.name} ${process}`;
  return {
    external_id: String(extra.processViewId ?? `${ente.org}-${seq}`),
    source_system_id: ente.id,
    process_number: process,
    procurement_number: process,
    year: 2026,
    modality: "PREGAO_ELETRONICO",
    status: "PUBLICADO",
    organization_name: ente.name,
    organization_identifier: ente.cnpj,
    object,
    proposal_deadline: extra.deadline as string | null ?? "2026-09-20T17:00:00.000Z",
    opening_at: extra.opening as string | null ?? "2026-09-21T10:00:00.000Z",
    source_url: `https://bllcompras.com/Process/ProcessView?id=${extra.processViewId ?? seq}`,
    raw_payload: {
      promotor: ente.org,
      numero: process,
      modalidade: "PREGAO ELETRONICO",
      objeto: object,
      processViewId: extra.processViewId ?? seq,
      organizationCnpj: ente.cnpj,
      sequencial: String(seq),
      ...extra,
    },
  };
}

export async function seedMilestone4(sql: Sql): Promise<void> {
  for (const row of PARENTS) {
    await upsert(sql, "jurisdiction", {
      id: row.id,
      type: "STATE",
      ibge_code: row.ibge,
      uf: row.uf,
      name: row.name,
      parent_id: "jur_br",
      cnpj: null,
      active: true,
    });
  }

  await upsert(sql, "jurisdiction", {
    id: "jur_santos_sp",
    type: "MUNICIPALITY",
    ibge_code: "3548500",
    uf: "SP",
    name: "Santos",
    parent_id: "jur_sp",
    cnpj: "58200015000183",
    active: true,
  });

  for (const ente of BLL_ENTES) {
    await upsert(sql, "jurisdiction", {
      id: ente.jur,
      type: ente.jurType,
      ibge_code: ente.ibge,
      uf: ente.uf,
      name: ente.name,
      parent_id: ente.parent,
      cnpj: ente.cnpj,
      active: true,
    });
  }
  for (const gap of GAPS) {
    await upsert(sql, "jurisdiction", {
      id: gap.id,
      type: "MUNICIPALITY",
      ibge_code: gap.ibge,
      uf: gap.uf,
      name: gap.name,
      parent_id: gap.parent,
      cnpj: null,
      active: true,
    });
  }

  for (const ente of BLL_ENTES) {
    await upsert(sql, "source_system", {
      id: ente.id,
      jurisdiction_id: ente.jur,
      name: `BLL · ${ente.name}${ente.uf ? `/${ente.uf}` : ""}`,
      slug: `bll-${ente.id.replace("src_bll_", "").replace(/_/g, "-")}`,
      base_url: "https://bllcompras.com",
      technology_family: "BLL" satisfies TechnologyFamily,
      vendor_name: "Bolsa de Licitações e Leilões do Brasil",
      product_name: "BLL Compras",
      vendor_evidence_level: ente.level,
      vendor_confidence: ente.level === "VERIFIED" ? 1 : 0.75,
      connector_type: "GENERIC_ACTION" satisfies ConnectorType,
      classification_state: "INGESTING",
      discovery_strategy: "HTML_LIST",
      functional_family: "PROCUREMENT_TRANSACTIONAL",
      pncp_overlap: true,
      public_access: true,
      active: true,
      comprasgov_overlap: false,
      connector_version: "1",
      notes: `${ente.level === "VERIFIED" ? "FATO" : "INFERÊNCIA"} — ${ente.excerpt}`,
    });
    await upsert(
      sql,
      "source_rate_policy",
      {
        source_system_id: ente.id,
        max_concurrency: 1,
        requests_per_second: 1,
        timeout_ms: 8000,
        backoff_profile: "conservative",
      },
      "source_system_id",
    );
    await upsert(sql, "source_evidence", {
      id: `ev_m4_${ente.id}`,
      source_system_id: ente.id,
      evidence_type: ente.level === "VERIFIED" ? "OFFICIAL_DOCUMENT" : "VENDOR_REFERENCE",
      evidence_level: ente.level,
      title: ente.evidenceTitle,
      description: ente.excerpt,
      url: toPublicPncpUrl(ente.evidenceUrl),
      observed_value: "BLL",
      expected_signature: "BLL",
      verified_by: "seed-m4",
      publisher: ente.name,
      observed_at: OBSERVED,
      vendor_name: "Bolsa de Licitações e Leilões do Brasil",
      product_name: "BLL Compras",
      raw_excerpt: ente.excerpt,
      content_hash: sha256(`${ente.id}|${ente.evidenceUrl}|${ente.excerpt}`),
    });
    await upsert(sql, "source_endpoint", {
      id: `ep_${ente.id}_search`,
      source_system_id: ente.id,
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
      id: `cap_${ente.id}_discover`,
      source_system_id: ente.id,
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
    await upsert(
      sql,
      "source_connector_config",
      {
        source_system_id: ente.id,
        connector_type: "GENERIC_ACTION",
        base_url: "https://bllcompras.com",
        paths_json: {
          discover: BLL_DISCOVER,
          detail: "/Process/ProcessView",
          linkPattern: BLL_LINK,
        },
        default_params_json: { organization: ente.org },
        enabled: true,
      },
      "source_system_id",
    );
    await upsert(sql, "source_platform_history", {
      id: `hist_${ente.id}_current`,
      source_system_id: ente.id,
      technology_family: "BLL",
      vendor_name: "Bolsa de Licitações e Leilões do Brasil",
      product_name: "BLL Compras",
      valid_from: OBSERVED,
      valid_to: null,
      evidence_id: `ev_m4_${ente.id}`,
      confidence: ente.level === "VERIFIED" ? 1 : 0.75,
    });
  }

  await upsert(sql, "coverage_config", {
    key: "local_only_provisional_hours",
    value_num: 6,
    description: "Antes disso o registro local ainda pode ser só antecedência.",
  }, "key");
  await upsert(sql, "coverage_config", {
    key: "local_only_confirmed_hours",
    value_num: 168,
    description: "Após 7 dias sem match PNCP, local-only deixa de ser provisório.",
  }, "key");
  await upsert(sql, "coverage_config", {
    key: "priority_weight_json",
    value_text: JSON.stringify({
      number_verified_entities: 0.22,
      estimated_procurement_volume: 0.18,
      current_pncp_gap: 0.22,
      technical_reuse_probability: 0.16,
      public_access_quality: 0.1,
      adapter_reuse: 0.08,
      historical_depth: 0.04,
    }),
    description: "Pesos documentados de integration_priority_score. Soma 1.",
  }, "key");

  let recN = 0;

  for (const [index, ente] of BLL_ENTES.entries()) {
    for (let slot = 0; slot < 6; slot += 1) {
      recN += 1;
      const seq = 1000 + recN;
      const processViewId = String(seq);
      const process = `${String(slot + 1).padStart(2, "0")}/2026`;
      const objeto = `Contratação ${process} — ${ente.name}`;
      const control = ente.cnpj
        ? `${ente.cnpj}-1-${String(seq).padStart(6, "0")}/2026`
        : null;
      const isPncpExact = slot === 0 || slot === 1;
      const isCnpjSeq = slot === 2 && Boolean(ente.cnpj);
      const isProbable = slot === 2 && !ente.cnpj || slot === 3;
      const isProvisional = slot === 4;
      const isConfirmedLocal = slot === 5;

      const localSeen = isConfirmedLocal
        ? hoursAgo(240)
        : isProvisional
          ? hoursAgo(24)
          : hoursAgo(36 + slot);
      const pncpSeen = hoursAgo(12 + slot);
      const openingLocal = "2026-09-21T10:00:00.000Z";
      const openingPncp = slot === 0 ? "2026-09-22T10:00:00.000Z" : openingLocal;

      const extra: Record<string, unknown> = {
        processViewId,
        objeto,
        opening: openingLocal,
        deadline: "2026-09-20T17:00:00.000Z",
        sequencial: String(seq),
      };
      if (isPncpExact && control) extra.numeroControlePNCP = control;

      const local = asProcurement(ente, seq, extra);
      local.process_number = process;
      local.procurement_number = process;
      const schema = schemaFingerprint(local.raw_payload);
      const localOnly = classifyLocalOnly({
        matched: isPncpExact || isCnpjSeq || isProbable,
        firstSeenAt: localSeen,
        now: NOW,
      });

      await sql.query(
        `insert into source_record (
           id, source_system_id, source_entity_type, source_identifier,
           payload_hash, raw_payload, source_updated_at, source_url, schema_hash,
           first_seen_at, last_seen_at, fetched_at, local_only_state
         ) values ($1,$2,'procurement',$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12)
         on conflict do nothing`,
        [
          `rec_${ente.id}_${slot}`,
          ente.id,
          local.external_id,
          payloadHash(local.raw_payload),
          JSON.stringify(local.raw_payload),
          openingLocal,
          local.source_url,
          schema.schema_hash,
          localSeen,
          OBSERVED,
          OBSERVED,
          localOnly,
        ],
      );

      if ((isPncpExact || isCnpjSeq || isProbable) && control) {
        const candidate: CanonicalCandidate = {
          canonical_entity_type: "PNCP",
          canonical_entity_id: `pncp-${control}`,
          numeroControlePNCP: isPncpExact ? control : null,
          organization_cnpj: ente.cnpj,
          organization_identifier: ente.cnpj,
          organization_name: ente.name,
          year: 2026,
          sequential: String(seq),
          process_number: process,
          procurement_number: process,
          modality: "PREGAO_ELETRONICO",
          object: objeto,
          opening_at: openingPncp,
          status: "PUBLICADO",
        };

        const pncpPayload = {
          numeroControlePNCP: control,
          numeroCompra: process,
          orgaoEntidade: { razaoSocial: ente.name, cnpj: ente.cnpj },
          objetoCompra: objeto,
          sequencial: String(seq),
          dataAbertura: openingPncp,
        };
        const pncpSchema = schemaFingerprint(pncpPayload);
        await sql.query(
          `insert into source_record (
             id, source_system_id, source_entity_type, source_identifier,
             payload_hash, raw_payload, source_updated_at, source_url, schema_hash,
             first_seen_at, last_seen_at, fetched_at, local_only_state
           ) values ($1,'src_br_pncp','procurement',$2,$3,$4::jsonb,$5,$6,$7,$8,$9,$10,'MATCHED')
           on conflict do nothing`,
          [
            `rec_pncp_${seq}`,
            control,
            payloadHash(pncpPayload),
            JSON.stringify(pncpPayload),
            openingPncp,
            pncpEditalUrl(control),
            pncpSchema.schema_hash,
            pncpSeen,
            OBSERVED,
            OBSERVED,
          ],
        );

        const canonicalId = `can_${control.replace(/[^a-zA-Z0-9]/g, "_")}`;
        await upsert(sql, "canonical_procurement", {
          id: canonicalId,
          object: objeto,
          organization_name: ente.name,
          organization_cnpj: ente.cnpj,
          municipality: ente.name,
          uf: ente.uf,
          ibge_code: ente.ibge,
          modality: "PREGAO_ELETRONICO",
          status: "PUBLICADO",
          opening_at: openingLocal,
          estimated_value: null,
        });

        const resolved = resolveProcurement(local, [candidate]);
        const lead = leadTimeHours(localSeen, pncpSeen);
        await sql.query(
          `insert into source_entity_link (
             id, source_system_id, source_entity_type, source_external_id,
             canonical_entity_type, canonical_entity_id, match_method, match_score, status,
             matched_fields, conflicting_fields, canonical_procurement_id,
             local_first_seen_at, pncp_first_seen_at, lead_time_hours, next_recheck_at
           ) values ($1,$2,'procurement',$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11,$12,$13,$14,$15)
           on conflict (source_system_id, source_entity_type, source_external_id, canonical_entity_type)
           do nothing`,
          [
            `link_${ente.id}_${slot}_pncp`,
            ente.id,
            local.external_id,
            resolved.canonical_entity_type,
            resolved.canonical_entity_id,
            resolved.match_method,
            resolved.match_score,
            resolved.status,
            JSON.stringify(resolved.matched_fields),
            JSON.stringify(resolved.conflicting_fields),
            canonicalId,
            localSeen,
            pncpSeen,
            lead,
            null,
          ],
        );

        if (slot === 0) {
          const cgPayload = {
            uasg: `u${index + 100}`,
            numero: process,
            objeto,
            cnpj: ente.cnpj,
          };
          await sql.query(
            `insert into source_record (
               id, source_system_id, source_entity_type, source_identifier,
               payload_hash, raw_payload, source_url, schema_hash,
               first_seen_at, last_seen_at, fetched_at, local_only_state
             ) values ($1,'src_br_comprasgov','procurement',$2,$3,$4::jsonb,$5,$6,$7,$8,$9,'MATCHED')
             on conflict do nothing`,
            [
              `rec_cg_${seq}`,
              `cg-${seq}`,
              payloadHash(cgPayload),
              JSON.stringify(cgPayload),
              "https://dadosabertos.compras.gov.br",
              schemaFingerprint(cgPayload).schema_hash,
              pncpSeen,
              OBSERVED,
              OBSERVED,
            ],
          );
          await sql.query(
            `insert into source_entity_link (
               id, source_system_id, source_entity_type, source_external_id,
               canonical_entity_type, canonical_entity_id, match_method, match_score, status,
               matched_fields, canonical_procurement_id, local_first_seen_at, pncp_first_seen_at, lead_time_hours
             ) values ($1,$2,'procurement',$3,'COMPRAS_GOV',$4,'process_organization',72,'PROBABLE',
               $5::jsonb,$6,$7,$8,$9)
             on conflict (source_system_id, source_entity_type, source_external_id, canonical_entity_type)
             do nothing`,
            [
              `link_${ente.id}_${slot}_cg`,
              ente.id,
              local.external_id,
              `cg-${seq}`,
              JSON.stringify(["process_number"]),
              canonicalId,
              localSeen,
              pncpSeen,
              lead,
            ],
          );
          if (openingLocal !== openingPncp) {
            await upsert(sql, "source_comparison", {
              id: `cmp_${ente.id}_opening`,
              canonical_id: canonicalId,
              field: "opening_at",
              source_a_id: ente.id,
              value_a: openingLocal,
              source_b_id: "src_br_pncp",
              value_b: openingPncp,
              observed_at: OBSERVED,
              severity: "info",
            });
          }
        }
      } else {
        const canonicalId = `can_local_${ente.id}_${slot}`;
        await upsert(sql, "canonical_procurement", {
          id: canonicalId,
          object: objeto,
          organization_name: ente.name,
          organization_cnpj: ente.cnpj,
          municipality: ente.name,
          uf: ente.uf,
          ibge_code: ente.ibge,
          modality: "PREGAO_ELETRONICO",
          status: "PUBLICADO",
          opening_at: openingLocal,
          estimated_value: null,
        });
        await sql.query(
          `insert into source_entity_link (
             id, source_system_id, source_entity_type, source_external_id,
             canonical_entity_type, canonical_entity_id, match_method, match_score, status,
             matched_fields, conflicting_fields, canonical_procurement_id,
             local_first_seen_at, next_recheck_at
           ) values ($1,$2,'procurement',$3,'STANDALONE',null,'standalone_local',0,'UNMATCHED',
             '[]'::jsonb,'[]'::jsonb,$4,$5,$6)
           on conflict (source_system_id, source_entity_type, source_external_id, canonical_entity_type)
           do nothing`,
          [
            `link_${ente.id}_${slot}_none`,
            ente.id,
            local.external_id,
            canonicalId,
            localSeen,
            nextRecheckAt(localSeen, NOW),
          ],
        );
      }
    }
  }

  for (const ente of BLL_ENTES) {
    await upsert(sql, "municipality_census", {
      id: `mc_${ente.jur}`,
      jurisdiction_id: ente.jur,
      ibge_code: ente.ibge,
      uf: ente.uf,
      name: ente.name,
      portal_presence: "EXTERNAL_PLATFORM",
      source_system_id: ente.id,
      evidence_level: ente.level,
      adapter: "GENERIC_ACTION",
      discovery_capability: true,
      active: true,
      last_verified_at: OBSERVED,
    });
  }
  for (const gap of GAPS) {
    await upsert(sql, "municipality_census", {
      id: `mc_${gap.id}`,
      jurisdiction_id: gap.id,
      ibge_code: gap.ibge,
      uf: gap.uf,
      name: gap.name,
      portal_presence: gap.presence,
      source_system_id: null,
      evidence_level: "UNKNOWN",
      adapter: "NONE",
      discovery_capability: false,
      active: true,
      last_verified_at: null,
    });
  }

  await upsert(sql, "municipality_census", {
    id: "mc_jur_florianopolis_sc",
    jurisdiction_id: "jur_florianopolis_sc",
    ibge_code: "4205407",
    uf: "SC",
    name: "Florianópolis",
    portal_presence: "MUNICIPAL_PORTAL",
    source_system_id: "src_paradigma_florianopolis",
    evidence_level: "VERIFIED",
    adapter: "NONE",
    discovery_capability: false,
    active: true,
    last_verified_at: OBSERVED,
  });
  await upsert(sql, "municipality_census", {
    id: "mc_jur_barueri_sp",
    jurisdiction_id: "jur_barueri_sp",
    ibge_code: "3505708",
    uf: "SP",
    name: "Barueri",
    portal_presence: "MUNICIPAL_PORTAL",
    source_system_id: "src_paradigma_barueri",
    evidence_level: "VERIFIED",
    adapter: "NONE",
    discovery_capability: false,
    active: true,
    last_verified_at: OBSERVED,
  });
  for (const [id, jur, ibge, name] of [
    ["src_fiorilli_itapira", "jur_itapira_sp", "3522604", "Itapira"],
    ["src_fiorilli_irapua", "jur_irapua_sp", "3521903", "Irapuã"],
    ["src_fiorilli_urupes", "jur_urupes_sp", "3556003", "Urupês"],
    ["src_fiorilli_assis", "jur_assis_sp", "3504008", "Assis"],
    ["src_fiorilli_sales", "jur_sales_sp", "3545803", "Sales"],
  ] as const) {
    await upsert(sql, "municipality_census", {
      id: `mc_${jur}`,
      jurisdiction_id: jur,
      ibge_code: ibge,
      uf: "SP",
      name,
      portal_presence: "MUNICIPAL_PORTAL",
      source_system_id: id,
      evidence_level: "VERIFIED",
      adapter: "NONE",
      discovery_capability: false,
      active: true,
      last_verified_at: OBSERVED,
    });
  }

  await upsert(sql, "source_live_probe", {
    id: "probe_bll_search",
    source_system_id: "src_bll_platform",
    url: "https://bllcompras.com/Process/ProcessSearchPublic?param1=0",
    http_status: 200,
    ok: true,
    content_type: "text/html; charset=utf-8",
    excerpt: "title: Busca de Processos - BLLCOMPRAS",
    error: null,
    probed_at: OBSERVED,
  });
  await upsert(sql, "source_live_probe", {
    id: "probe_fiorilli_assis",
    source_system_id: "src_fiorilli_assis",
    url: "https://scpi.assis.sp.gov.br:8079/comprasedital/",
    http_status: 200,
    ok: true,
    content_type: "text/html",
    excerpt:
      "title SCPI - Licitações; /comprasedital/comprasedital.dll; css/fiorilli.css; ExtJS 7.9 SPA. Sem tabela HTML pública nem JSON de editais no GET inicial.",
    error: null,
    probed_at: OBSERVED,
  });
  await upsert(sql, "source_live_probe", {
    id: "probe_fiorilli_itapira",
    source_system_id: "src_fiorilli_itapira",
    url: "http://transparencia.itapira.sp.gov.br:8079/comprasedital/",
    http_status: null,
    ok: false,
    content_type: null,
    excerpt: null,
    error: "timeout no GET público (6s). Acesso público irregular entre instalações.",
    probed_at: OBSERVED,
  });
  await upsert(sql, "source_live_probe", {
    id: "probe_paradigma_pmf",
    source_system_id: "src_paradigma_florianopolis",
    url: "https://wbc.pmf.sc.gov.br/",
    http_status: 200,
    ok: true,
    content_type: "text/html; charset=utf-8",
    excerpt:
      "XHTML ASP.NET ctl00_Head1; /portal/css/portalcss; kendoUI metro. Não é JSF. Contrato JSON de editais não extraído.",
    error: null,
    probed_at: OBSERVED,
  });
  await upsert(sql, "source_live_probe", {
    id: "probe_paradigma_barueri",
    source_system_id: "src_paradigma_barueri",
    url: "https://compras.barueri.sp.gov.br/",
    http_status: 200,
    ok: true,
    content_type: "text/html; charset=utf-8",
    excerpt:
      "Mesmos assets de Florianópolis: /portal/css/portalcss, uniform.claren.css, template2.css, kendoUI. Família técnica compartilhada, 2 fontes — escala insuficiente.",
    error: null,
    probed_at: OBSERVED,
  });

  await upsert(sql, "source_observation", {
    id: "obs_fiorilli_assis_dll",
    source_system_id: "src_fiorilli_assis",
    observation_type: "ROUTE",
    key: "pathname",
    value: "/comprasedital/comprasedital.dll",
    source_url: "https://scpi.assis.sp.gov.br:8079/comprasedital/",
  });
  await upsert(sql, "source_observation", {
    id: "obs_fiorilli_assis_css",
    source_system_id: "src_fiorilli_assis",
    observation_type: "CSS_PATH",
    key: "css_path",
    value: "fiorilli.css",
    source_url: "https://scpi.assis.sp.gov.br:8079/comprasedital/",
  });
  await upsert(sql, "source_observation", {
    id: "obs_paradigma_shared_css",
    source_system_id: "src_paradigma_florianopolis",
    observation_type: "CSS_PATH",
    key: "css_path",
    value: "/portal/css/portalcss",
    source_url: "https://wbc.pmf.sc.gov.br/",
  });
  await upsert(sql, "source_observation", {
    id: "obs_barueri_shared_css",
    source_system_id: "src_paradigma_barueri",
    observation_type: "CSS_PATH",
    key: "css_path",
    value: "/portal/css/portalcss",
    source_url: "https://compras.barueri.sp.gov.br/",
  });

  await upsert(sql, "source_alert", {
    id: "alert_m4_bll_coverage",
    source_system_id: "src_bll_platform",
    alert_type: "ADAPTER_REUSABLE",
    severity: "info",
    message:
      "M4: 20 entes BLL, 1 generic-action, 120 registros locais ingeridos. Overlap passa a ser de records, não de declaração.",
    payload: { family: "BLL", entes: BLL_ENTES.length, records: 120 },
  });
  await upsert(sql, "source_alert", {
    id: "alert_m4_fiorilli_spa",
    source_system_id: "src_fiorilli_assis",
    alert_type: "SOURCE_FAMILY_CONFIRMED",
    severity: "info",
    message:
      "Assis ao vivo: SCPI ExtJS (comprasedital.dll + fiorilli.css). Sem lista HTML/JSON pública. FiorilliAdapter = NO-GO. Itapira timeout.",
    payload: { family: "SCPI_FIORILLI", live: "assis-spa", generic_reuse: "NO-GO" },
  });
  await upsert(sql, "source_alert", {
    id: "alert_m4_paradigma_shared_css",
    source_system_id: "src_paradigma_florianopolis",
    alert_type: "SOURCE_FAMILY_CONFIRMED",
    severity: "info",
    message:
      "Florianópolis e Barueri ao vivo compartilham /portal/css/portalcss e kendoUI (ASP.NET, não JSF). 2 fontes — escala insuficiente para adapter.",
    payload: { family: "PARADIGMA_WBC", live: 2, generic_reuse: "NO-GO" },
  });
}

export const M4_BLL_ENTE_IDS = BLL_ENTES.map((row) => row.id);
export const M4_BLL_ORGS = BLL_ENTES.map((row) => row.org);
