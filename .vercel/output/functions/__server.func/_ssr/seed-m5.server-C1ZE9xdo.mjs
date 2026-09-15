import { a as toPublicPncpUrl, i as pncpEditalUrl } from "./pncp-url-CkM9bQPG.mjs";
import { a as leadTimeHours, n as classifyLocalOnly } from "./coverage-h_nbs-Bf.mjs";
import { t as resolveProcurement } from "./entity-resolution-X96OLfBV.mjs";
import { n as sha256, t as payloadHash } from "./hash-DAnDaBOp.mjs";
import { r as schemaFingerprint } from "./schema-fingerprint-49fkWjyh.mjs";
import { persistPrioritySnapshot, t as PRIORITY_WEIGHTS_V1 } from "./priority.server-B4IJ691O.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seed-m5.server-C1ZE9xdo.js
var JSONB_KEYS = /* @__PURE__ */ new Set([
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
	"weights_json",
	"components_json"
]);
var OBSERVED = "2026-09-14T20:00:00.000Z";
var NOW = /* @__PURE__ */ new Date(OBSERVED);
var WINDOW_ID = "win_2026_09_01_14";
var PCP_API = "https://apipcp.portaldecompraspublicas.com.br";
var PCP_PORTAL = "https://www.portaldecompraspublicas.com.br";
var PCP_DISCOVER = "/publico/listarProcessos/";
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
async function upsertReplace(sql, table, row, pk) {
	const keys = Object.keys(row);
	const cols = keys.join(", ");
	const placeholders = keys.map((key, i) => JSONB_KEYS.has(key) ? `$${i + 1}::jsonb` : `$${i + 1}`).join(", ");
	const updates = keys.filter((key) => key !== pk).map((key) => `${key} = excluded.${key}`).join(", ");
	const params = keys.map((key) => {
		const value = row[key];
		if (value === void 0) return null;
		if (JSONB_KEYS.has(key)) {
			if (value === null) return null;
			return typeof value === "string" ? value : JSON.stringify(value);
		}
		return value;
	});
	await sql.query(`insert into ${table} (${cols}) values (${placeholders})
     on conflict (${pk}) do update set ${updates}`, params);
}
var PCP_ENTES = [
	{
		id: "src_pcp_linhares_es",
		jur: "jur_linhares_es",
		jurType: "PUBLIC_ENTITY",
		ibge: "3203205",
		uf: "ES",
		name: "Câmara de Linhares",
		parent: "jur_es",
		cnpj: null,
		slug: "pcp-camara-linhares-es",
		existing: true,
		evidenceTitle: "Contrato 5/2024 — Câmara Municipal de Linhares",
		evidenceUrl: "https://www.camaralinhares.es.gov.br/transparencia/contrato/ver/150",
		excerpt: "Contratação do sistema Portal de Compras Públicas. Contratada: ECUSTOMIZE CONSULTORIA EM SOFTWARE S.A, CNPJ 09.397.355/0001-30.",
		publisher: "Câmara Municipal de Linhares"
	},
	{
		id: "src_pcp_alegre_es",
		jur: "jur_alegre_es",
		jurType: "MUNICIPALITY",
		ibge: "3200201",
		uf: "ES",
		name: "Alegre",
		parent: "jur_es",
		cnpj: null,
		slug: "pcp-alegre-es",
		existing: true,
		evidenceTitle: "Adesão oficial Alegre/ES ao Portal de Compras Públicas",
		evidenceUrl: "https://www.alegre.es.gov.br/category/licitacoes/page/2/",
		excerpt: "Prefeitura Municipal de Alegre declara adesão ao Portal de Compras Públicas, mantido pela Ecustomize Consultoria em Software S/A.",
		publisher: "Prefeitura Municipal de Alegre"
	},
	{
		id: "src_pcp_mogi_sp",
		jur: "jur_mogi_cruzes_sp",
		jurType: "MUNICIPALITY",
		ibge: "3530606",
		uf: "SP",
		name: "Mogi das Cruzes",
		parent: "jur_sp",
		cnpj: "46523270000188",
		slug: "pcp-mogi-das-cruzes-sp",
		evidenceTitle: "Pregão Eletrônico 162/2024 — Mogi das Cruzes/SP",
		evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/46523270000188/compras/2024/562/arquivos/2",
		excerpt: "O Pregão ocorrerá em sessão pública exclusivamente em ambiente eletrônico, na Internet, no endereço eletrônico: www.portaldecompraspublicas.com.br.",
		publisher: "Prefeitura Municipal de Mogi das Cruzes"
	},
	{
		id: "src_pcp_porto_nacional_to",
		jur: "jur_porto_nacional_to",
		jurType: "MUNICIPALITY",
		ibge: "1718204",
		uf: "TO",
		name: "Porto Nacional",
		parent: "jur_to",
		cnpj: "45316509000186",
		slug: "pcp-porto-nacional-to",
		evidenceTitle: "Pregão Eletrônico SRP 002/2025 FMMA — Porto Nacional/TO",
		evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/45316509000186/compras/2025/136/arquivos/1",
		excerpt: "via Sistema Eletrônico de Administração de Compras, através do site www.portaldecompraspublicas.com.br",
		publisher: "Prefeitura Municipal de Porto Nacional"
	},
	{
		id: "src_pcp_porto_belo_sc",
		jur: "jur_porto_belo_sc",
		jurType: "MUNICIPALITY",
		ibge: "4213500",
		uf: "SC",
		name: "Porto Belo",
		parent: "jur_sc",
		cnpj: "82575812000120",
		slug: "pcp-porto-belo-sc",
		evidenceTitle: "Pregão Eletrônico 072/2025 — Porto Belo/SC",
		evidenceUrl: "https://pncp.gov.br/pncp-api/v1/orgaos/82575812000120/compras/2025/437/arquivos/1",
		excerpt: "LOCAL: www.portaldecompraspublicas.com.br (Portal de Compras Públicas).",
		publisher: "Prefeitura Municipal de Porto Belo"
	}
];
var PCP_NORMALIZATION = {
	external_id: "codLicitacao",
	process_number: "numero",
	object: "resumo",
	organization_name: "razaoSocial",
	status: "status",
	modality: "tipoLicitacao",
	source_url: "urlReferencia"
};
var PCP_PAGINATION = {
	type: "PAGE_NUMBER",
	pageParam: "pagina",
	startPage: 1,
	pageSize: 20
};
var ASSESSMENTS = [
	{
		family: "PORTAL_COMPRAS_PUBLICAS",
		adapter_fit: "GENERIC_JSON_FIT",
		integration_cost: .35,
		maintenance_risk: .25,
		uncaptured_volume: .88,
		public_access_score: .7,
		source_reliability: .55,
		evidence_confidence: 1,
		historical_depth: .25,
		technical_reuse: .95,
		estimated_records_month: 400,
		estimation_method: "documentação oficial da API + amostra da coorte (não censo nacional)",
		estimation_confidence: "baixa"
	},
	{
		family: "BLL",
		adapter_fit: "GENERIC_ACTION_FIT",
		integration_cost: .12,
		maintenance_risk: .15,
		uncaptured_volume: .35,
		public_access_score: .95,
		source_reliability: .95,
		evidence_confidence: 1,
		historical_depth: .45,
		technical_reuse: 1,
		estimated_records_month: 200,
		estimation_method: "coorte BLL já ingerida; volume restante = municípios ainda não cobertos",
		estimation_confidence: "média"
	},
	{
		family: "SCPI_FIORILLI",
		adapter_fit: "NEEDS_NEW_GENERIC_CAPABILITY",
		integration_cost: .85,
		maintenance_risk: .8,
		uncaptured_volume: .55,
		public_access_score: .4,
		source_reliability: .4,
		evidence_confidence: 1,
		historical_depth: .3,
		technical_reuse: .15,
		estimated_records_month: null,
		estimation_method: "sem listagem JSON pública no GET; ExtJS/uniGUI SPA",
		estimation_confidence: "baixa"
	},
	{
		family: "PARADIGMA_WBC",
		adapter_fit: "GENERIC_ACTION_FIT",
		integration_cost: .7,
		maintenance_risk: .55,
		uncaptured_volume: .45,
		public_access_score: .7,
		source_reliability: .7,
		evidence_confidence: .4,
		historical_depth: .25,
		technical_reuse: .45,
		estimated_records_month: null,
		estimation_method: "censo vigente = 2 VERIFIED; HTML ASP.NET observado",
		estimation_confidence: "baixa"
	},
	{
		family: "LICITANET",
		adapter_fit: "NEEDS_NEW_GENERIC_CAPABILITY",
		integration_cost: .7,
		maintenance_risk: .5,
		uncaptured_volume: .7,
		public_access_score: .2,
		source_reliability: .2,
		evidence_confidence: 1,
		historical_depth: .2,
		technical_reuse: .2,
		estimated_records_month: null,
		estimation_method: "homepage HTTP 403 nesta sessão; listagem pública PENDENTE",
		estimation_confidence: "baixa"
	},
	{
		family: "BNC",
		adapter_fit: "UNSUITABLE",
		integration_cost: .75,
		maintenance_risk: .5,
		uncaptured_volume: .5,
		public_access_score: .4,
		source_reliability: .45,
		evidence_confidence: 1,
		historical_depth: .2,
		technical_reuse: .1,
		estimated_records_month: null,
		estimation_method: "site institucional WordPress; portal transacional PENDENTE",
		estimation_confidence: "baixa"
	},
	{
		family: "BBMNET",
		adapter_fit: "UNSUITABLE",
		integration_cost: .8,
		maintenance_risk: .5,
		uncaptured_volume: .55,
		public_access_score: .3,
		source_reliability: .3,
		evidence_confidence: 1,
		historical_depth: .2,
		technical_reuse: .1,
		estimated_records_month: null,
		estimation_method: "URL transacional PENDENTE",
		estimation_confidence: "baixa"
	},
	{
		family: "LICITAR_DIGITAL",
		adapter_fit: "UNSUITABLE",
		integration_cost: .85,
		maintenance_risk: .6,
		uncaptured_volume: .4,
		public_access_score: .1,
		source_reliability: .15,
		evidence_confidence: 1,
		historical_depth: .15,
		technical_reuse: .05,
		estimated_records_month: null,
		estimation_method: "Cloudflare bloqueou GET nesta sessão",
		estimation_confidence: "baixa"
	},
	{
		family: "COMPRASBR",
		adapter_fit: "UNSUITABLE",
		integration_cost: .8,
		maintenance_risk: .5,
		uncaptured_volume: .4,
		public_access_score: .3,
		source_reliability: .3,
		evidence_confidence: 1,
		historical_depth: .15,
		technical_reuse: .1,
		estimated_records_month: null,
		estimation_method: "contrato técnico público PENDENTE",
		estimation_confidence: "baixa"
	}
];
var MUNICIPALITY_BASE = [
	{
		ibge: "3530606",
		uf: "SP",
		name: "Mogi das Cruzes",
		population: 45e4,
		status: "EXTERNAL_PLATFORM"
	},
	{
		ibge: "4213500",
		uf: "SC",
		name: "Porto Belo",
		population: 27e3,
		status: "EXTERNAL_PLATFORM"
	},
	{
		ibge: "1718204",
		uf: "TO",
		name: "Porto Nacional",
		population: 53e3,
		status: "EXTERNAL_PLATFORM"
	},
	{
		ibge: "3200201",
		uf: "ES",
		name: "Alegre",
		population: 3e4,
		status: "EXTERNAL_PLATFORM"
	},
	{
		ibge: "3203205",
		uf: "ES",
		name: "Linhares",
		population: 176e3,
		status: "EXTERNAL_PLATFORM"
	},
	{
		ibge: "3550308",
		uf: "SP",
		name: "São Paulo",
		population: 1145e4,
		status: "UNKNOWN"
	},
	{
		ibge: "3304557",
		uf: "RJ",
		name: "Rio de Janeiro",
		population: 6211e3,
		status: "UNKNOWN"
	},
	{
		ibge: "3106200",
		uf: "MG",
		name: "Belo Horizonte",
		population: 2315e3,
		status: "UNKNOWN"
	},
	{
		ibge: "2927408",
		uf: "BA",
		name: "Salvador",
		population: 2418e3,
		status: "UNKNOWN"
	},
	{
		ibge: "2304400",
		uf: "CE",
		name: "Fortaleza",
		population: 2429e3,
		status: "UNKNOWN"
	},
	{
		ibge: "2611606",
		uf: "PE",
		name: "Recife",
		population: 1489e3,
		status: "UNKNOWN"
	},
	{
		ibge: "4106902",
		uf: "PR",
		name: "Curitiba",
		population: 1773e3,
		status: "UNKNOWN"
	},
	{
		ibge: "4314902",
		uf: "RS",
		name: "Porto Alegre",
		population: 1333e3,
		status: "UNKNOWN"
	},
	{
		ibge: "1302603",
		uf: "AM",
		name: "Manaus",
		population: 2063e3,
		status: "UNKNOWN"
	},
	{
		ibge: "1501402",
		uf: "PA",
		name: "Belém",
		population: 1303e3,
		status: "UNKNOWN"
	},
	{
		ibge: "5208707",
		uf: "GO",
		name: "Goiânia",
		population: 1437e3,
		status: "UNKNOWN"
	},
	{
		ibge: "1721000",
		uf: "TO",
		name: "Palmas",
		population: 306e3,
		status: "UNKNOWN"
	},
	{
		ibge: "4205407",
		uf: "SC",
		name: "Florianópolis",
		population: 537e3,
		status: "MUNICIPAL_PORTAL"
	},
	{
		ibge: "3505708",
		uf: "SP",
		name: "Barueri",
		population: 316e3,
		status: "MUNICIPAL_PORTAL"
	},
	{
		ibge: "3504008",
		uf: "SP",
		name: "Assis",
		population: 101e3,
		status: "EXTERNAL_PLATFORM"
	},
	{
		ibge: "5300108",
		uf: "DF",
		name: "Brasília",
		population: 2817e3,
		status: "UNKNOWN"
	},
	{
		ibge: "2211001",
		uf: "PI",
		name: "Teresina",
		population: 868e3,
		status: "UNKNOWN"
	},
	{
		ibge: "2111300",
		uf: "MA",
		name: "São Luís",
		population: 1037e3,
		status: "UNKNOWN"
	},
	{
		ibge: "2507507",
		uf: "PB",
		name: "João Pessoa",
		population: 833e3,
		status: "UNKNOWN"
	},
	{
		ibge: "2704302",
		uf: "AL",
		name: "Maceió",
		population: 957e3,
		status: "UNKNOWN"
	},
	{
		ibge: "2800308",
		uf: "SE",
		name: "Aracaju",
		population: 602e3,
		status: "UNKNOWN"
	},
	{
		ibge: "2408102",
		uf: "RN",
		name: "Natal",
		population: 751e3,
		status: "UNKNOWN"
	},
	{
		ibge: "5002704",
		uf: "MS",
		name: "Campo Grande",
		population: 898e3,
		status: "UNKNOWN"
	},
	{
		ibge: "5103403",
		uf: "MT",
		name: "Cuiabá",
		population: 65e4,
		status: "UNKNOWN"
	},
	{
		ibge: "1100205",
		uf: "RO",
		name: "Porto Velho",
		population: 46e4,
		status: "UNKNOWN"
	},
	{
		ibge: "1200401",
		uf: "AC",
		name: "Rio Branco",
		population: 364e3,
		status: "UNKNOWN"
	},
	{
		ibge: "1600303",
		uf: "AP",
		name: "Macapá",
		population: 442e3,
		status: "UNKNOWN"
	},
	{
		ibge: "1400100",
		uf: "RR",
		name: "Boa Vista",
		population: 413e3,
		status: "UNKNOWN"
	}
];
function hoursAgo(hours) {
	return (/* @__PURE__ */ new Date(NOW.getTime() - hours * 36e5)).toISOString();
}
function pcpNotes(ente) {
	return `FATO — ${ente.excerpt} publicKey da API oficial é config por ente (como organization na BLL), não adapter de marca. Chave municipal vigente PENDENTE: GET /publico/listarProcessos/ retorna 400 "Erro autenticação" sem chave válida. PcpAdapter NÃO criado.`;
}
async function configurePcpSource(sql, sourceId) {
	await sql.query(`update source_system
     set connector_type = 'GENERIC_JSON',
         connector_version = '1',
         classification_state = 'INGESTING',
         discovery_strategy = 'PUBLIC_JSON_API',
         public_access = true
     where id = $1`, [sourceId]);
	await upsert(sql, "source_rate_policy", {
		source_system_id: sourceId,
		max_concurrency: 1,
		requests_per_second: 1,
		timeout_ms: 8e3,
		backoff_profile: "conservative"
	}, "source_system_id");
	await upsertReplace(sql, "source_connector_config", {
		source_system_id: sourceId,
		connector_type: "GENERIC_JSON",
		base_url: PCP_API,
		paths_json: {
			discover: PCP_DISCOVER,
			responsePath: "dadosLicitacoes"
		},
		default_params_json: { pagina: "1" },
		pagination_config: PCP_PAGINATION,
		normalization_config: PCP_NORMALIZATION,
		enabled: true
	}, "source_system_id");
	await upsert(sql, "source_endpoint", {
		id: `ep_${sourceId}_listar`,
		source_system_id: sourceId,
		name: "listarProcessos",
		path: PCP_DISCOVER,
		http_method: "GET",
		endpoint_type: "JSON_API",
		public: true,
		pagination_type: "PAGE_NUMBER",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "UNKNOWN"
	});
	await upsert(sql, "source_capability", {
		id: `cap_${sourceId}_discover`,
		source_system_id: sourceId,
		capability: "DISCOVER_PROCUREMENTS",
		access_type: "PUBLIC",
		endpoint_or_url: PCP_DISCOVER,
		method: "GET",
		auth_required: false,
		publicly_observed: true,
		pagination_type: "PAGE_NUMBER",
		documented: true,
		confidence: .7
	});
	await upsert(sql, "source_observation", {
		id: `obs_${sourceId}_dados`,
		source_system_id: sourceId,
		observation_type: "JSON_FIELD",
		key: "json_field",
		value: "dadosLicitacoes",
		source_url: `${PCP_API}${PCP_DISCOVER}`
	});
}
async function seedMilestone5(sql) {
	await upsert(sql, "jurisdiction", {
		id: "jur_to",
		type: "STATE",
		ibge_code: "17",
		uf: "TO",
		name: "Tocantins",
		parent_id: "jur_br",
		cnpj: null,
		active: true
	});
	for (const ente of PCP_ENTES) {
		await upsert(sql, "jurisdiction", {
			id: ente.jur,
			type: ente.jurType,
			ibge_code: ente.ibge,
			uf: ente.uf,
			name: ente.name,
			parent_id: ente.parent,
			cnpj: ente.cnpj,
			active: true
		});
		await upsert(sql, "source_system", {
			id: ente.id,
			jurisdiction_id: ente.jur,
			name: `PCP · ${ente.name}/${ente.uf}`,
			slug: ente.slug,
			base_url: PCP_PORTAL,
			technology_family: "PORTAL_COMPRAS_PUBLICAS",
			vendor_name: "eCustomize Consultoria em Software",
			product_name: "Portal de Compras Públicas",
			vendor_evidence_level: "VERIFIED",
			vendor_confidence: 1,
			connector_type: "GENERIC_JSON",
			classification_state: "INGESTING",
			discovery_strategy: "PUBLIC_JSON_API",
			functional_family: "PROCUREMENT_TRANSACTIONAL",
			pncp_overlap: true,
			public_access: true,
			active: true,
			comprasgov_overlap: false,
			connector_version: "1",
			notes: pcpNotes(ente)
		});
		await upsert(sql, "source_evidence", {
			id: `ev_m5_${ente.id}`,
			source_system_id: ente.id,
			evidence_type: "OFFICIAL_DOCUMENT",
			evidence_level: "VERIFIED",
			title: ente.evidenceTitle,
			description: ente.excerpt,
			url: toPublicPncpUrl(ente.evidenceUrl),
			observed_value: "Portal de Compras Públicas",
			expected_signature: "eCustomize",
			verified_by: "seed-m5",
			publisher: ente.publisher,
			observed_at: OBSERVED,
			published_at: null,
			vendor_name: "eCustomize Consultoria em Software",
			product_name: "Portal de Compras Públicas",
			raw_excerpt: ente.excerpt,
			content_hash: sha256(`${ente.id}|${ente.evidenceUrl}|${ente.excerpt}`)
		});
		await upsert(sql, "source_platform_history", {
			id: `hist_${ente.id}_current`,
			source_system_id: ente.id,
			technology_family: "PORTAL_COMPRAS_PUBLICAS",
			vendor_name: "eCustomize Consultoria em Software",
			product_name: "Portal de Compras Públicas",
			valid_from: OBSERVED,
			valid_to: null,
			evidence_id: `ev_m5_${ente.id}`,
			confidence: 1
		});
		await configurePcpSource(sql, ente.id);
		await upsert(sql, "municipality_census", {
			id: `mc_${ente.jur}`,
			jurisdiction_id: ente.jur,
			ibge_code: ente.ibge,
			uf: ente.uf,
			name: ente.name,
			portal_presence: "EXTERNAL_PLATFORM",
			source_system_id: ente.id,
			evidence_level: "VERIFIED",
			adapter: "GENERIC_JSON",
			discovery_capability: true,
			active: true,
			last_verified_at: OBSERVED
		});
	}
	await sql.query(`update source_system
     set connector_type = 'GENERIC_JSON',
         connector_version = '1',
         classification_state = 'INGESTING',
         discovery_strategy = 'PUBLIC_JSON_API',
         notes = $1
     where id = 'src_pcp_platform'`, ["FATO — Transferegov: PORTAL DE COMPRAS PÚBLICAS / ECUSTOMIZE, CNPJ 09.397.355/0001-30. API oficial apipcp.portaldecompraspublicas.com.br documenta GET /publico/listarProcessos/?publicKey&cdSituacao&dataInicio&dataFim&pagina com envelope dadosLicitacoes. GET sem publicKey válido: HTTP 400 {success:false, mensagem:\"Erro autenticação\"} (2026-09-14). SPA /processos HTTP 200, 0 registros até busca JS. publicKey = config por ente. PcpAdapter NÃO criado."]);
	await configurePcpSource(sql, "src_pcp_platform");
	await upsert(sql, "coverage_config", {
		key: "priority_score_version",
		value_text: "v1",
		description: "Versão ativa do source_integration_priority_score."
	}, "key");
	await upsert(sql, "coverage_config", {
		key: "priority_weight_v1_json",
		value_text: JSON.stringify(PRIORITY_WEIGHTS_V1),
		description: "Pesos v1. Soma 1. Volume = ganho não capturado."
	}, "key");
	await upsertReplace(sql, "priority_score_version", {
		version: "v1",
		formula: "weighted_sum(coverage_gap, uncaptured_volume, lead_time, technical_reuse, reliability, evidence, public_access, historical_depth, 1-maintenance_risk, 1-integration_cost)",
		weights_json: PRIORITY_WEIGHTS_V1,
		documented_at: OBSERVED,
		notes: "v1 lineariza ganho/custo. Não é lei. Multiplicativo documentado como alternativa. Já integrado reduz uncaptured_volume."
	}, "version");
	await upsertReplace(sql, "coverage_window", {
		id: WINDOW_ID,
		window_start: "2026-09-01T00:00:00.000Z",
		window_end: "2026-09-14T23:59:59.000Z",
		label: "coorte 2026-09-01 a 2026-09-14",
		metric_version: "v1",
		notes: "Janela de avaliação M5. Overlap BLL 67% é desta coorte, não propriedade eterna. Amostra PCP é piloto de 5 entes, não censo nacional."
	}, "id");
	let recN = 2e3;
	for (const ente of PCP_ENTES) for (let slot = 0; slot < 6; slot += 1) {
		recN += 1;
		const process = `${String(slot + 10).padStart(3, "0")}/2026`;
		const objeto = `Contratação ${process} — ${ente.name}`;
		const control = ente.cnpj ? `${ente.cnpj}-1-${String(recN).padStart(6, "0")}/2026` : null;
		const isPncpExact = slot === 0 || slot === 1;
		const isProbable = slot === 2;
		const isProvisional = slot === 3;
		const isConfirmedLocal = slot === 4 || slot === 5;
		const localSeen = isConfirmedLocal ? hoursAgo(240) : isProvisional ? hoursAgo(24) : hoursAgo(48);
		const pncpSeen = hoursAgo(12);
		const openingLocal = "2026-09-22T10:00:00.000Z";
		const openingPncp = slot === 0 ? "2026-09-23T10:00:00.000Z" : openingLocal;
		const cod = 9e5 + recN;
		const payload = {
			id: null,
			codLicitacao: cod,
			identificacao: process,
			numero: process,
			resumo: objeto,
			razaoSocial: ente.name,
			status: "Aberto",
			tipoLicitacao: "Pregão Eletrônico",
			urlReferencia: `${PCP_PORTAL}/processos/${ente.uf}/${ente.slug}/${process.replace("/", "-")}`,
			organizationCnpj: ente.cnpj,
			sequencial: String(recN),
			...isPncpExact ? { numeroControlePNCP: control } : {}
		};
		const local = {
			external_id: String(cod),
			source_system_id: ente.id,
			process_number: process,
			procurement_number: process,
			year: 2026,
			modality: "PREGAO_ELETRONICO",
			status: "PUBLICADO",
			organization_name: ente.name,
			organization_identifier: ente.cnpj,
			object: objeto,
			proposal_deadline: "2026-09-21T17:00:00.000Z",
			opening_at: openingLocal,
			source_url: String(payload.urlReferencia),
			raw_payload: payload
		};
		const matched = Boolean(control) && (isPncpExact || isProbable);
		const localOnly = classifyLocalOnly({
			matched,
			firstSeenAt: localSeen,
			now: NOW
		});
		await sql.query(`insert into source_record (
           id, source_system_id, source_entity_type, source_identifier,
           payload_hash, raw_payload, source_updated_at, source_url, schema_hash,
           first_seen_at, last_seen_at, fetched_at, local_only_state
         ) values ($1,$2,'procurement',$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12)
         on conflict do nothing`, [
			`rec_${ente.id}_${slot}`,
			ente.id,
			local.external_id,
			payloadHash(local.raw_payload),
			JSON.stringify(local.raw_payload),
			openingLocal,
			local.source_url,
			schemaFingerprint(local.raw_payload).schema_hash,
			localSeen,
			OBSERVED,
			OBSERVED,
			localOnly
		]);
		if (matched && control) {
			const candidate = {
				canonical_entity_type: "PNCP",
				canonical_entity_id: `pncp-${control}`,
				numeroControlePNCP: isPncpExact ? control : null,
				organization_cnpj: ente.cnpj,
				organization_identifier: ente.cnpj,
				organization_name: ente.name,
				year: 2026,
				sequential: String(recN),
				process_number: process,
				procurement_number: process,
				modality: "PREGAO_ELETRONICO",
				object: objeto,
				opening_at: openingPncp,
				status: "PUBLICADO"
			};
			const pncpPayload = {
				numeroControlePNCP: control,
				numeroCompra: process,
				orgaoEntidade: {
					razaoSocial: ente.name,
					cnpj: ente.cnpj
				},
				objetoCompra: objeto,
				sequencial: String(recN),
				dataAbertura: openingPncp
			};
			await sql.query(`insert into source_record (
             id, source_system_id, source_entity_type, source_identifier,
             payload_hash, raw_payload, source_updated_at, source_url, schema_hash,
             first_seen_at, last_seen_at, fetched_at, local_only_state
           ) values ($1,'src_br_pncp','procurement',$2,$3,$4::jsonb,$5,$6,$7,$8,$9,$10,'MATCHED')
           on conflict do nothing`, [
				`rec_pncp_m5_${recN}`,
				control,
				payloadHash(pncpPayload),
				JSON.stringify(pncpPayload),
				openingPncp,
				pncpEditalUrl(control),
				schemaFingerprint(pncpPayload).schema_hash,
				pncpSeen,
				OBSERVED,
				OBSERVED
			]);
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
				estimated_value: null
			});
			const resolved = resolveProcurement(local, [candidate]);
			const lead = leadTimeHours(localSeen, pncpSeen);
			await sql.query(`insert into source_entity_link (
             id, source_system_id, source_entity_type, source_external_id,
             canonical_entity_type, canonical_entity_id, match_method, match_score, status,
             matched_fields, conflicting_fields, canonical_procurement_id,
             local_first_seen_at, pncp_first_seen_at, lead_time_hours, next_recheck_at
           ) values ($1,$2,'procurement',$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11,$12,$13,$14,$15)
           on conflict (source_system_id, source_entity_type, source_external_id, canonical_entity_type)
           do nothing`, [
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
				null
			]);
			if (slot === 0) await sql.query(`insert into source_comparison (
               id, canonical_id, field, source_a_id, value_a, source_b_id, value_b, observed_at, severity
             ) values ($1,$2,'opening_at',$3,$4,$5,$6,$7,'info')
             on conflict (id) do nothing`, [
				`cmp_${canonicalId}_opening_at`,
				canonicalId,
				ente.id,
				openingLocal,
				"src_br_pncp",
				openingPncp,
				OBSERVED
			]);
		} else {
			const canonicalId = `can_local_${ente.id}_${local.external_id}`.replace(/[^a-zA-Z0-9_]/g, "_");
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
				estimated_value: null
			});
			await sql.query(`insert into source_entity_link (
             id, source_system_id, source_entity_type, source_external_id,
             canonical_entity_type, canonical_entity_id, match_method, match_score, status,
             matched_fields, conflicting_fields, canonical_procurement_id,
             local_first_seen_at, pncp_first_seen_at, lead_time_hours, next_recheck_at
           ) values ($1,$2,'procurement',$3,'STANDALONE',null,'standalone_local',0,'UNMATCHED',
             '[]'::jsonb,'[]'::jsonb,$4,$5,null,null,$6)
           on conflict (source_system_id, source_entity_type, source_external_id, canonical_entity_type)
           do nothing`, [
				`link_${ente.id}_${slot}_unmatched`,
				ente.id,
				local.external_id,
				canonicalId,
				localSeen,
				hoursAgo(isConfirmedLocal ? 168 : 6)
			]);
		}
	}
	for (const row of MUNICIPALITY_BASE) await upsert(sql, "municipality_base", {
		ibge_code: row.ibge,
		uf: row.uf,
		name: row.name,
		population: row.population,
		portal_status: row.status
	}, "ibge_code");
	const probes = [
		{
			id: "probe_m5_pcp_api_nokey",
			source_system_id: "src_pcp_platform",
			family: "PORTAL_COMPRAS_PUBLICAS",
			url: `${PCP_API}${PCP_DISCOVER}`,
			http_status: 400,
			latency_ms: 580,
			content_type: "application/json",
			page_size: 64,
			ok: false,
			excerpt: "{\"success\":false,\"mensagem\":\"Erro autenticação\"}",
			error: "HTTP 400 sem publicKey",
			fingerprint_excerpt: "API JSON oficial; listagem exige publicKey do comprador",
			probed_at: OBSERVED
		},
		{
			id: "probe_m5_pcp_api_samplekey",
			source_system_id: "src_pcp_platform",
			family: "PORTAL_COMPRAS_PUBLICAS",
			url: `${PCP_API}${PCP_DISCOVER}?publicKey=b7ad651a44cff961330fe393543796f0&cdSituacao=5&dataInicio=01/05/2021&dataFim=14/05/2021`,
			http_status: 400,
			latency_ms: 597,
			content_type: "application/json",
			page_size: 64,
			ok: false,
			excerpt: "{\"success\":false,\"mensagem\":\"Erro autenticação\"}",
			error: "chave de exemplo da documentação oficial não autentica mais",
			fingerprint_excerpt: "publicKey é segredo de comprador, não listagem aberta",
			probed_at: OBSERVED
		},
		{
			id: "probe_m5_pcp_spa",
			source_system_id: "src_pcp_platform",
			family: "PORTAL_COMPRAS_PUBLICAS",
			url: `${PCP_PORTAL}/processos`,
			http_status: 200,
			latency_ms: 730,
			content_type: "text/html;charset=UTF-8",
			page_size: 8e3,
			ok: true,
			excerpt: "SPA Angular — Pesquisa de Processos de Licitação. Sem tabela HTML até busca JS.",
			error: null,
			fingerprint_excerpt: "GENERIC_SPA; não prova vendor (vendor = Transferegov + editais)",
			probed_at: OBSERVED
		},
		{
			id: "probe_m5_fiorilli_assis",
			source_system_id: "src_fiorilli_assis",
			family: "SCPI_FIORILLI",
			url: "https://scpi.assis.sp.gov.br:8079/comprasedital/",
			http_status: 200,
			latency_ms: 2376,
			content_type: "text/html; charset=utf-8",
			page_size: 8e3,
			ok: true,
			excerpt: "title SCPI - Licitações; comprasedital.dll ExtJS 7.9 + uniGUI + fiorilli.js. GET /data e /app/data.json = 404. Sem JSON público de listagem.",
			error: null,
			fingerprint_excerpt: "ExtJS SPA. FiorilliAdapter NO-GO.",
			probed_at: OBSERVED
		},
		{
			id: "probe_m5_licitanet",
			source_system_id: "src_licitanet_platform",
			family: "LICITANET",
			url: "https://www.licitanet.com.br",
			http_status: 403,
			latency_ms: 179,
			content_type: null,
			page_size: null,
			ok: false,
			excerpt: null,
			error: "HTTP 403 Forbidden",
			fingerprint_excerpt: "listagem pública PENDENTE",
			probed_at: OBSERVED
		},
		{
			id: "probe_m5_bnc",
			source_system_id: "src_bnc_platform",
			family: "BNC",
			url: "https://bnc.org.br",
			http_status: 200,
			latency_ms: 695,
			content_type: "text/html; charset=UTF-8",
			page_size: 8e3,
			ok: true,
			excerpt: "WordPress institucional. Portal transacional PENDENTE.",
			error: null,
			fingerprint_excerpt: "não é listagem de editais",
			probed_at: OBSERVED
		},
		{
			id: "probe_m5_paradigma_pmf",
			source_system_id: "src_paradigma_florianopolis",
			family: "PARADIGMA_WBC",
			url: "https://wbc.pmf.sc.gov.br/",
			http_status: 200,
			latency_ms: 1111,
			content_type: "text/html; charset=utf-8",
			page_size: 8e3,
			ok: true,
			excerpt: "XHTML ASP.NET; /portal/css/portalcss; kendoUI. Primeiros 12KB da homepage sem tabela 2026. Contrato JSON PENDENTE. Censo vigente = 2 VERIFIED.",
			error: null,
			fingerprint_excerpt: "ASP.NET compartilhado com Barueri. Não promover por similaridade visual.",
			probed_at: OBSERVED
		}
	];
	for (const probe of probes) await upsert(sql, "source_probe_run", probe);
	for (const assessment of ASSESSMENTS) await upsertReplace(sql, "family_coverage_metric", {
		id: `fcm_${WINDOW_ID}_${assessment.family}`,
		window_id: WINDOW_ID,
		family: assessment.family,
		adapter_fit: assessment.adapter_fit,
		integration_cost: assessment.integration_cost,
		maintenance_risk: assessment.maintenance_risk,
		uncaptured_volume: assessment.uncaptured_volume,
		public_access_score: assessment.public_access_score,
		source_reliability: assessment.source_reliability,
		evidence_confidence: assessment.evidence_confidence,
		historical_depth: assessment.historical_depth,
		technical_reuse: assessment.technical_reuse,
		estimated_records_month: assessment.estimated_records_month,
		estimation_method: assessment.estimation_method,
		estimation_confidence: assessment.estimation_confidence,
		sample_size: assessment.family === "PORTAL_COMPRAS_PUBLICAS" ? 30 : assessment.family === "BLL" ? 120 : 0
	}, "id");
	await persistPrioritySnapshot(sql, WINDOW_ID);
}
PCP_ENTES.map((row) => row.id);
//#endregion
export { seedMilestone5 };
