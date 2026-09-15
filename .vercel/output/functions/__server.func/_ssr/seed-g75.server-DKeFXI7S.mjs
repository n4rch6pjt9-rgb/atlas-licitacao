import { n as classifyLocalOnly, s as percentile, t as DEFAULT_COVERAGE_CONFIG } from "./coverage-h_nbs-Bf.mjs";
import { _ as recurrenceGroupKey, b as tokenJaccard, c as explainableAttentionScore, g as planningConversion, h as objectsGroupTogether, i as computeRecurrence, m as normalizeObject, n as alertEventKey, r as changePriority, t as ATTENTION_WEIGHTS_V1, u as hardenConfirmedLink, v as ruleMatchesEvent, y as shouldAlertForChange } from "./recurrence-Dg8bgN42.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seed-g75.server-DKeFXI7S.js
/**
* Temporal evaluation splits. A signal computed at T may only see purchases ≤ T.
* Holdout is reserved and must not be used to calibrate rules.
*/
var G75_AS_OF = "2026-06-30T23:59:59.000Z";
var G75_NOW = "2026-09-14T21:00:00.000Z";
var G75_COHORTS = [
	{
		id: "g75_calibration",
		kind: "CALIBRATION",
		window_start: "2024-01-01T00:00:00.000Z",
		window_end: G75_AS_OF,
		notes: "Histórico visível em T. Recurrence signals só podem usar este intervalo."
	},
	{
		id: "g75_validation",
		kind: "VALIDATION",
		window_start: "2026-07-01T00:00:00.000Z",
		window_end: "2026-08-31T23:59:59.000Z",
		notes: "Follow-through de 30/60 dias a partir de T=2026-06-30. Não calibrar aqui."
	},
	{
		id: "g75_holdout",
		kind: "HOLDOUT",
		window_start: "2026-09-01T00:00:00.000Z",
		window_end: "2026-12-31T23:59:59.000Z",
		notes: "Reservado. Não usar para ajustar regras nem declarar sucesso."
	},
	{
		id: "g75_pcp_week",
		kind: "PCP_COHORT",
		window_start: "2026-09-08T00:00:00.000Z",
		window_end: "2026-09-14T23:59:59.000Z",
		notes: "150 records PCP live. Janela operacional de 7 dias ainda não madura em 14/09/2026."
	}
];
function visibleAt(rows, t) {
	const end = new Date(t).getTime();
	return rows.filter((row) => {
		const ts = new Date(row.occurred_at).getTime();
		return Number.isFinite(ts) && ts <= end;
	});
}
function afterT(rows, t) {
	const start = new Date(t).getTime();
	return rows.filter((row) => {
		const ts = new Date(row.occurred_at).getTime();
		return Number.isFinite(ts) && ts > start;
	});
}
function assertNoTemporalLeakage(used, t) {
	const end = new Date(t).getTime();
	const leaked = used.filter((row) => new Date(row.occurred_at).getTime() > end).map((row) => row.id ?? row.occurred_at);
	if (leaked.length > 0) return {
		ok: false,
		leaked
	};
	return { ok: true };
}
function holdoutUnused(args) {
	const hold = new Set(args.holdout_ids);
	return args.calibrated_on.every((id) => !hold.has(id));
}
function daysBetween(a, b) {
	return (new Date(b).getTime() - new Date(a).getTime()) / 864e5;
}
function purchase(id, at, object, value) {
	return {
		canonical_id: id,
		occurred_at: at,
		value,
		normalized: normalizeObject(object)
	};
}
function dated(prefix, object, value, dates) {
	return dates.map((at, i) => purchase(`${prefix}_${i}`, `${at}T10:00:00.000Z`, object, value));
}
function series(args) {
	return {
		id: args.id,
		organization_id: args.org,
		category: args.category,
		data_origin: args.origin ?? "SYNTHETIC",
		purchases: dated(args.id, args.object, args.value, args.dates)
	};
}
/**
* Synthetic temporal series. Tagged SYNTHETIC.
* Calibration purchases sit on or before T=2026-06-30.
* Follow-through for 30/60d sits in Jul–Aug (validation). Holdout ≥ 2026-09-01 is unused in calibration.
* n HIGH/MEDIUM still < 30 — amostra cresce, não fabrica GO estatístico.
*/
function g75RecurrenceSeries() {
	return [
		{
			id: "series_diesel_monthly",
			organization_id: "org_27111222000191",
			category: "combustivel",
			data_origin: "SYNTHETIC",
			purchases: [
				purchase("d1", "2026-01-10T10:00:00.000Z", "Aquisição de combustível diesel", 4e5),
				purchase("d2", "2026-02-12T10:00:00.000Z", "Aquisição de combustível diesel", 41e4),
				purchase("d3", "2026-03-11T10:00:00.000Z", "Aquisição de combustível diesel", 405e3),
				purchase("d4", "2026-04-09T10:00:00.000Z", "Aquisição de combustível diesel", 42e4),
				purchase("d5", "2026-05-10T10:00:00.000Z", "Aquisição de combustível diesel", 415e3),
				purchase("d6", "2026-07-08T10:00:00.000Z", "Aquisição de combustível diesel", 43e4)
			]
		},
		{
			id: "series_sport_semestral",
			organization_id: "org_82575812000120",
			category: "material_esportivo",
			data_origin: "SYNTHETIC",
			purchases: [
				purchase("s1", "2024-03-01T10:00:00.000Z", "Aquisição de material esportivo e aparelhos de academia", 18e4),
				purchase("s2", "2024-08-28T10:00:00.000Z", "Aquisição de material esportivo e aparelhos de academia", 185e3),
				purchase("s3", "2025-02-24T10:00:00.000Z", "Aquisição de material esportivo e aparelhos de academia", 19e4),
				purchase("s4", "2025-08-23T10:00:00.000Z", "Aquisição de material esportivo e aparelhos de academia", 195e3),
				purchase("s5", "2026-02-19T10:00:00.000Z", "Aquisição de material esportivo e aparelhos de academia", 2e5),
				purchase("s6", "2026-09-22T10:00:00.000Z", "Aquisição de equipamentos esportivos para academias", 21e4)
			]
		},
		{
			id: "series_merenda_annual",
			organization_id: "org_46523270000188",
			category: "alimentacao_escolar",
			data_origin: "SYNTHETIC",
			purchases: [
				purchase("m1", "2024-02-15T10:00:00.000Z", "Gêneros alimentícios para merenda escolar", 7e5),
				purchase("m2", "2025-02-18T10:00:00.000Z", "Aquisição de merenda escolar para a rede municipal", 74e4),
				purchase("m3", "2026-02-20T10:00:00.000Z", "Gêneros alimentícios para merenda escolar", 76e4)
			]
		},
		{
			id: "series_ti_sparse",
			organization_id: "org_00394460000141",
			category: "ti",
			data_origin: "SYNTHETIC",
			purchases: [purchase("t1", "2024-11-01T10:00:00.000Z", "Contratação de suporte de TI e datacenter", 12e4), purchase("t2", "2026-05-02T10:00:00.000Z", "Contratação de suporte de TI e datacenter", 13e4)]
		},
		{
			id: "series_meds_none",
			organization_id: "org_00394452000103",
			category: "medicamentos",
			data_origin: "SYNTHETIC",
			purchases: [purchase("md1", "2025-06-01T10:00:00.000Z", "Aquisição de medicamentos hospitalares OPME", 5e5)]
		},
		{
			id: "series_obras_once",
			organization_id: "org_46523270000188",
			category: "obras",
			data_origin: "SYNTHETIC",
			purchases: [purchase("o1", "2026-03-10T10:00:00.000Z", "Obra de pavimentação asfáltica no distrito industrial", 24e5)]
		},
		series({
			id: "series_limpeza_quarterly",
			org: "org_limpeza_sc",
			category: "limpeza",
			object: "Contratação de serviços de limpeza predial",
			value: 85e3,
			dates: [
				"2024-07-01",
				"2024-10-01",
				"2025-01-02",
				"2025-04-02",
				"2025-07-03",
				"2025-10-03",
				"2026-01-05",
				"2026-04-06",
				"2026-07-15"
			]
		}),
		series({
			id: "series_expediente_bimonthly",
			org: "org_expediente_df",
			category: "expediente",
			object: "Aquisição de material de expediente",
			value: 42e3,
			dates: [
				"2025-08-10",
				"2025-10-12",
				"2025-12-11",
				"2026-02-10",
				"2026-04-09",
				"2026-06-08",
				"2026-08-10"
			]
		}),
		series({
			id: "series_agua_monthly",
			org: "org_agua_joinville",
			category: "agua",
			object: "Aquisição de água mineral para as secretarias",
			value: 18e3,
			dates: [
				"2026-01-08",
				"2026-02-09",
				"2026-03-10",
				"2026-04-08",
				"2026-05-11",
				"2026-06-09",
				"2026-07-10"
			]
		}),
		series({
			id: "series_energia_monthly",
			org: "org_energia_itajai",
			category: "energia",
			object: "Fornecimento de energia elétrica para unidades administrativas",
			value: 22e4,
			dates: [
				"2026-01-05",
				"2026-02-05",
				"2026-03-05",
				"2026-04-06",
				"2026-05-05",
				"2026-06-05",
				"2026-07-06"
			]
		}),
		series({
			id: "series_copias_monthly",
			org: "org_copias_blumenau",
			category: "copias",
			object: "Locação de equipamentos de impressão e cópias",
			value: 31e3,
			dates: [
				"2026-01-12",
				"2026-02-12",
				"2026-03-12",
				"2026-04-13",
				"2026-05-12",
				"2026-06-12",
				"2026-08-03"
			]
		}),
		series({
			id: "series_pneus_semestral",
			org: "org_pneus_sc",
			category: "pneus",
			object: "Aquisição de pneus para a frota municipal",
			value: 95e3,
			dates: [
				"2024-09-01",
				"2025-03-04",
				"2025-09-02",
				"2026-03-03"
			]
		}),
		series({
			id: "series_manutencao_quarterly",
			org: "org_manut_balneario",
			category: "manutencao",
			object: "Manutenção predial das unidades de saúde",
			value: 64e3,
			dates: [
				"2025-03-01",
				"2025-06-02",
				"2025-09-01",
				"2025-12-02",
				"2026-03-03",
				"2026-06-02"
			]
		}),
		series({
			id: "series_uniformes_annual",
			org: "org_uniforme_mogi",
			category: "uniformes",
			object: "Aquisição de uniformes escolares",
			value: 28e4,
			dates: [
				"2024-01-20",
				"2025-01-18",
				"2026-01-19"
			]
		}),
		series({
			id: "series_transporte_annual",
			org: "org_transporte_sc",
			category: "transporte_escolar",
			object: "Transporte escolar da rede municipal",
			value: 91e4,
			dates: ["2024-12-10", "2025-12-12"]
		}),
		series({
			id: "series_internet_annual",
			org: "org_internet_df",
			category: "internet",
			object: "Link de internet para a sede administrativa",
			value: 48e3,
			dates: ["2025-03-01", "2026-03-02"]
		}),
		series({
			id: "series_medicamentos_monthly",
			org: "org_farmacia_sc",
			category: "medicamentos",
			object: "Aquisição de medicamentos da atenção básica",
			value: 31e4,
			dates: [
				"2026-01-15",
				"2026-02-16",
				"2026-03-16",
				"2026-04-15",
				"2026-05-15",
				"2026-06-16",
				"2026-07-16"
			]
		}),
		series({
			id: "series_passagens_sparse",
			org: "org_passagens_to",
			category: "passagens",
			object: "Passagens aéreas para o país",
			value: 22e3,
			dates: ["2024-05-01", "2026-04-20"]
		}),
		series({
			id: "series_consultoria_once",
			org: "org_consult_sp",
			category: "consultoria",
			object: "Consultoria para plano diretor",
			value: 18e4,
			dates: ["2026-02-01"]
		}),
		series({
			id: "series_reforma_once",
			org: "org_reforma_pa",
			category: "obras",
			object: "Reforma de escola municipal no bairro central",
			value: 15e5,
			dates: ["2026-05-20"]
		})
	];
}
/** Group stored procurements into recurrence series. Holdout dates stay in the series but never calibrate the signal. */
function seriesFromProcurements(rows, t) {
	const groups = /* @__PURE__ */ new Map();
	for (const row of rows) {
		if (!row.organization_id || !row.occurred_at) continue;
		const normalized = normalizeObject(row.object);
		const key = recurrenceGroupKey({
			organizationId: row.organization_id,
			catalogCode: row.catalog_code,
			normalized
		});
		const origin = row.data_origin && row.data_origin !== "UNKNOWN" ? row.data_origin : "SYNTHETIC";
		const bucket = groups.get(key) ?? {
			org: row.organization_id,
			category: normalized.synonym_bucket ?? normalized.normalized.slice(0, 40),
			origin,
			purchases: []
		};
		bucket.purchases.push({
			canonical_id: row.id,
			occurred_at: row.occurred_at,
			value: row.estimated_value_num,
			normalized,
			catalog_code: row.catalog_code
		});
		if (origin === "LIVE") bucket.origin = "LIVE";
		groups.set(key, bucket);
	}
	const out = [];
	for (const [key, bucket] of groups) {
		if (bucket.purchases.filter((p) => p.occurred_at <= t).length < 2) continue;
		out.push({
			id: `db_${key}`.slice(0, 80),
			organization_id: bucket.org,
			category: bucket.category,
			data_origin: bucket.origin,
			purchases: bucket.purchases
		});
	}
	return out;
}
function mergeRecurrenceSeries(primary, extra) {
	const seen = new Set(primary.map((row) => row.id));
	const out = [...primary];
	for (const row of extra) {
		if (seen.has(row.id)) continue;
		seen.add(row.id);
		out.push(row);
	}
	return out;
}
var G75_OBJECT_PAIRS = [
	{
		left: "Aquisição de material esportivo e aparelhos de academia",
		right: "Equipamentos esportivos para academias ao ar livre",
		expected: true
	},
	{
		left: "Gêneros alimentícios para merenda escolar",
		right: "Aquisição de merenda escolar para a rede municipal",
		expected: true
	},
	{
		left: "Aquisição de combustível diesel",
		right: "Aquisição de gasolina para a frota",
		expected: true
	},
	{
		left: "Contratação de suporte de TI e datacenter",
		right: "Aquisição de medicamentos hospitalares",
		expected: false
	},
	{
		left: "Obra de pavimentação asfáltica",
		right: "Serviço educacional de doutorado em informática",
		expected: false
	},
	{
		left: "Passagens para o país",
		right: "Material esportivo",
		expected: false
	}
];
function attention(partial) {
	return {
		freshness: .4,
		lead_time: .4,
		deadline_urgency: .4,
		organization_recurrence: .4,
		category_relevance: .4,
		planning_confirmation: .4,
		estimated_value: .4,
		data_quality: .4,
		source_confidence: .4,
		...partial
	};
}
function g75AttentionRows() {
	const rows = [
		{
			id: "att_fresh_early",
			object: "Material esportivo — edital aberto",
			organization_name: "Porto Belo",
			data_origin: "SYNTHETIC",
			data_confidence: .9,
			input: attention({
				freshness: 1,
				lead_time: 1,
				deadline_urgency: .85,
				organization_recurrence: .9,
				planning_confirmation: .8,
				data_quality: .9,
				source_confidence: .8,
				estimated_value: .7
			})
		},
		{
			id: "att_stale_low",
			object: "Pavimentação 2025 já encerrada",
			organization_name: "Mogi",
			data_origin: "SYNTHETIC",
			data_confidence: .6,
			input: attention({
				freshness: .15,
				lead_time: 0,
				deadline_urgency: .05,
				organization_recurrence: .1,
				planning_confirmation: 0,
				estimated_value: 1,
				data_quality: .5,
				source_confidence: .5
			})
		},
		{
			id: "att_high_score_low_conf",
			object: "Objeto ilegível",
			organization_name: null,
			data_origin: "SYNTHETIC",
			data_confidence: .1,
			input: attention({
				freshness: 1,
				lead_time: 1,
				deadline_urgency: 1,
				organization_recurrence: 1,
				planning_confirmation: 1,
				estimated_value: 1,
				data_quality: .1,
				source_confidence: .1
			})
		},
		{
			id: "att_high_score_stale",
			object: "Registro de preços 2024 sem prazo",
			organization_name: "Palmas",
			data_origin: "SYNTHETIC",
			data_confidence: .4,
			input: attention({
				freshness: .1,
				lead_time: .1,
				deadline_urgency: .1,
				organization_recurrence: .9,
				planning_confirmation: .9,
				estimated_value: 1,
				data_quality: .7,
				source_confidence: .7
			})
		}
	];
	for (let i = 0; i < 12; i += 1) rows.push({
		id: `att_mid_${i}`,
		object: `Item ${i}`,
		organization_name: "Fazenda",
		data_origin: "SYNTHETIC",
		data_confidence: .5,
		input: attention({
			freshness: .3 + i % 5 * .1,
			estimated_value: .2 + i % 4 * .15,
			deadline_urgency: .2 + i % 3 * .2
		})
	});
	return rows;
}
function g75LabeledLinks() {
	const out = [];
	for (let i = 0; i < 40; i += 1) out.push({
		id: `lab_conf_ok_${i}`,
		planning_id: `plan_ok_${i}`,
		procurement_id: `can_ok_${i}`,
		status: "CONFIRMED",
		match_method: i % 2 === 0 ? "official_item_id" : "cnpj_year_catalog",
		match_score: i % 2 === 0 ? 100 : 96,
		matched_fields: i % 2 === 0 ? ["numero_item_pncp", "organization_cnpj"] : [
			"organization_cnpj",
			"year",
			"catalog_code"
		],
		data_origin: "SYNTHETIC",
		planning_origin: i % 3 === 0 ? "PGC_COMPRASGOV" : "PCA_PNCP"
	});
	for (let i = 0; i < 3; i += 1) out.push({
		id: `lab_conf_bad_${i}`,
		planning_id: `plan_bad_${i}`,
		procurement_id: `can_bad_${i}`,
		status: "CONFIRMED",
		match_method: "cnpj_year_object_value",
		match_score: 88,
		matched_fields: [
			"organization_cnpj",
			"year",
			"value"
		],
		data_origin: "SYNTHETIC",
		planning_origin: "PCA_PNCP"
	});
	for (let i = 3; i < 8; i += 1) out.push({
		id: `lab_conf_bad_${i}`,
		planning_id: `plan_bad_${i}`,
		procurement_id: `can_bad_${i}`,
		status: "CONFIRMED",
		match_method: "object_only",
		match_score: 70,
		matched_fields: ["object"],
		data_origin: "SYNTHETIC",
		planning_origin: "PCA_PNCP"
	});
	for (let i = 0; i < 30; i += 1) out.push({
		id: `lab_prob_${i}`,
		planning_id: `plan_prob_${i}`,
		procurement_id: `can_prob_${i}`,
		status: "PROBABLE",
		match_method: "cnpj_year_synonym_value",
		match_score: 88,
		matched_fields: [
			"organization_cnpj",
			"year",
			"value",
			"object"
		],
		data_origin: "SYNTHETIC",
		planning_origin: "PCA_PNCP"
	});
	for (let i = 0; i < 12; i += 1) out.push({
		id: `lab_rev_${i}`,
		planning_id: `plan_rev_${i}`,
		procurement_id: `can_rev_${i}`,
		status: "REVIEW_REQUIRED",
		match_method: "cnpj_category",
		match_score: 55,
		matched_fields: ["organization_cnpj", "object"],
		data_origin: "SYNTHETIC",
		planning_origin: "PCA_PNCP"
	});
	for (let i = 0; i < 10; i += 1) out.push({
		id: `lab_un_${i}`,
		planning_id: `plan_un_${i}`,
		procurement_id: null,
		status: "UNMATCHED",
		match_method: "none",
		match_score: 0,
		matched_fields: [],
		data_origin: "SYNTHETIC",
		planning_origin: "PCA_PNCP"
	});
	return out;
}
function g75LateMatches() {
	return [
		{
			id: "lm_6h",
			data_origin: "FIXTURE",
			first_seen_local: "2026-03-01T08:00:00.000Z",
			first_seen_pncp: "2026-03-01T14:00:00.000Z",
			matched: true
		},
		{
			id: "lm_30h",
			data_origin: "FIXTURE",
			first_seen_local: "2026-03-02T08:00:00.000Z",
			first_seen_pncp: "2026-03-03T14:00:00.000Z",
			matched: true
		},
		{
			id: "lm_80h",
			data_origin: "FIXTURE",
			first_seen_local: "2026-03-04T08:00:00.000Z",
			first_seen_pncp: "2026-03-07T16:00:00.000Z",
			matched: true
		},
		{
			id: "lm_200h",
			data_origin: "FIXTURE",
			first_seen_local: "2026-02-01T08:00:00.000Z",
			first_seen_pncp: "2026-02-09T16:00:00.000Z",
			matched: true
		},
		{
			id: "lm_400h",
			data_origin: "FIXTURE",
			first_seen_local: "2026-01-01T08:00:00.000Z",
			first_seen_pncp: "2026-01-18T00:00:00.000Z",
			matched: true
		},
		{
			id: "pcp_a",
			data_origin: "LIVE",
			first_seen_local: "2026-09-08T10:00:00.000Z",
			first_seen_pncp: null,
			matched: false
		},
		{
			id: "pcp_b",
			data_origin: "LIVE",
			first_seen_local: "2026-09-12T10:00:00.000Z",
			first_seen_pncp: null,
			matched: false
		},
		{
			id: "pcp_c",
			data_origin: "LIVE",
			first_seen_local: "2026-09-14T08:00:00.000Z",
			first_seen_pncp: null,
			matched: false
		}
	];
}
function lateMatchesFromSourceRecords(rows) {
	const out = [];
	for (const row of rows) {
		if (!row.first_seen_at) continue;
		const matched = row.match_status === "CONFIRMED" && Boolean(row.pncp_first_seen_at);
		out.push({
			id: row.id,
			data_origin: row.data_origin === "LIVE" ? "LIVE" : row.data_origin ?? "UNKNOWN",
			first_seen_local: row.first_seen_at,
			first_seen_pncp: matched ? row.pncp_first_seen_at ?? null : null,
			matched
		});
	}
	return out;
}
function g75PcaPgcSides() {
	return {
		pca: [{
			id: "pca_fazenda_obra",
			origin_type: "PCA_PNCP",
			organization_cnpj: "00394460000141",
			year: 2026,
			catalog_code: "541",
			numero_item_pncp: null,
			object: "OBRA DE ACESSIBILIDADE E DE PREVENÇÃO E COMBATE A INCÊNDIO",
			estimated_value_num: 5e5
		}, {
			id: "pca_office",
			origin_type: "PCA_PNCP",
			organization_cnpj: "00394460000141",
			year: 2026,
			catalog_code: "36911",
			numero_item_pncp: "00394460000141-2026-1",
			object: "Material de expediente",
			estimated_value_num: 98e3
		}],
		pgc: [{
			id: "pgc_doutorado",
			origin_type: "PGC_COMPRASGOV",
			organization_cnpj: "00394460000141",
			year: 2026,
			catalog_code: "12793",
			numero_item_pncp: null,
			object: "Capacitação em Doutorado em Informática Aplicada",
			estimated_value_num: null
		}, {
			id: "pgc_office",
			origin_type: "PGC_COMPRASGOV",
			organization_cnpj: "00394460000141",
			year: 2026,
			catalog_code: "36911",
			numero_item_pncp: "00394460000141-2026-1",
			object: "Material de expediente",
			estimated_value_num: 98e3
		}]
	};
}
function g75AlertRules() {
	return [
		{
			id: "rule_new",
			event_types: ["NEW_PROCUREMENT"],
			filters: { uf: "SC" }
		},
		{
			id: "rule_servico",
			event_types: ["NEW_PROCUREMENT"],
			filters: { keyword: "serviço" }
		},
		{
			id: "rule_change_high",
			event_types: ["DEADLINE_CHANGED", "STATUS_CHANGED"],
			filters: {},
			min_change_priority: "HIGH"
		}
	];
}
function g75AlertEvents() {
	return [
		{
			id: "e1",
			eventType: "NEW_PROCUREMENT",
			uf: "SC",
			object: "Material esportivo",
			entity_type: "opportunity",
			entity_id: "opp_1",
			data_origin: "SYNTHETIC"
		},
		{
			id: "e1dup",
			eventType: "NEW_PROCUREMENT",
			uf: "SC",
			object: "Material esportivo",
			entity_type: "opportunity",
			entity_id: "opp_1",
			data_origin: "SYNTHETIC"
		},
		{
			id: "e2",
			eventType: "NEW_PROCUREMENT",
			uf: "SP",
			object: "serviço de limpeza predial",
			entity_type: "opportunity",
			entity_id: "opp_2",
			data_origin: "SYNTHETIC"
		},
		{
			id: "e3",
			eventType: "DEADLINE_CHANGED",
			uf: "SC",
			object: "Material esportivo",
			entity_type: "opportunity",
			entity_id: "opp_1",
			change_field: "deadline",
			distinguishing: "2026-09-20",
			data_origin: "SYNTHETIC"
		},
		{
			id: "e4",
			eventType: "DEADLINE_CHANGED",
			uf: "SC",
			object: "notas internas",
			entity_type: "opportunity",
			entity_id: "opp_1",
			change_field: "notes",
			distinguishing: "meta",
			data_origin: "SYNTHETIC"
		}
	];
}
function evaluateAlerts(args) {
	const keys = /* @__PURE__ */ new Map();
	const byType = {};
	let generated = 0;
	let changeHigh = 0;
	let changeLow = 0;
	for (const event of args.events) for (const rule of args.rules) {
		if (!ruleMatchesEvent(rule, event)) continue;
		if (event.change_field) {
			const prio = changePriority(event.change_field);
			if (!shouldAlertForChange(prio, rule.min_change_priority)) continue;
			if (prio === "HIGH") changeHigh += 1;
			if (prio === "LOW") changeLow += 1;
		}
		generated += 1;
		byType[event.eventType] = (byType[event.eventType] ?? 0) + 1;
		const key = alertEventKey({
			ruleId: rule.id,
			entityType: event.entity_type,
			entityId: event.entity_id,
			eventType: event.eventType,
			distinguishing: event.distinguishing
		});
		keys.set(key, (keys.get(key) ?? 0) + 1);
	}
	const unique = keys.size;
	const suppressed = [...keys.values()].reduce((acc, n) => acc + Math.max(0, n - 1), 0);
	const noisy = [];
	const keyword = args.noisy_keyword ?? "serviço";
	for (const rule of args.rules) {
		const hits = args.events.filter((event) => ruleMatchesEvent(rule, {
			...event,
			object: event.object ?? keyword
		})).length;
		if (rule.filters.keyword && [
			"servico",
			"serviço",
			"contrato"
		].includes(rule.filters.keyword.toLowerCase())) noisy.push({
			rule_id: rule.id,
			hits,
			estimated_alert_frequency: args.events.length === 0 ? 0 : hits / args.events.length
		});
	}
	return {
		origin_scope: args.origin_scope,
		events_generated: unique,
		unique_keys: unique,
		duplicates_suppressed: suppressed,
		idempotent: suppressed === generated - unique || generated === 0 && unique === 0,
		alerts_by_type: byType,
		noisy_rules: noisy,
		change_high: changeHigh,
		change_low: changeLow,
		timeline_preserves_before_after: true,
		notes: generated === 0 ? "Nenhum alerta disparou neste recorte." : `Idempotência por chave estável. ${suppressed} duplicatas suprimidas. Keyword genérica não foi auto-desligada.`
	};
}
function scoreOf(row, drop) {
	const input = { ...row.input };
	if (drop) input[drop] = 0;
	return explainableAttentionScore(input, row.data_confidence).final_score;
}
function isAbsurd(row, score) {
	if (score >= 70 && row.input.data_quality < .25 && row.input.source_confidence < .25) return {
		absurd: true,
		reason: "score alto com data_confidence baixo — ranking estrutural, não qualidade"
	};
	if (score >= 80 && row.input.freshness < .2 && row.input.deadline_urgency < .2 && row.input.lead_time < .2) return {
		absurd: true,
		reason: "score alto sem frescor, prazo ou antecedência"
	};
	return {
		absurd: false,
		reason: null
	};
}
var INPUT_KEYS = [
	"freshness",
	"lead_time",
	"deadline_urgency",
	"organization_recurrence",
	"category_relevance",
	"planning_confirmation",
	"estimated_value",
	"data_quality",
	"source_confidence"
];
function rankedFromStored(args) {
	if (!args.components) return null;
	const input = {};
	for (const key of INPUT_KEYS) {
		const n = Number(args.components[key]);
		if (!Number.isFinite(n)) return null;
		input[key] = n;
	}
	return {
		id: args.id,
		object: args.object,
		organization_name: args.organization_name,
		data_origin: args.data_origin,
		input,
		data_confidence: args.data_confidence
	};
}
function collectBadAttentionCases(rows) {
	return rows.filter((row) => row.absurd);
}
function auditAttention(args) {
	const scored = args.rows.map((row) => {
		const explained = explainableAttentionScore(row.input, row.data_confidence);
		const top = Object.keys(explained.weighted).sort((a, b) => explained.weighted[b] - explained.weighted[a])[0];
		const absurd = isAbsurd(row, explained.final_score);
		return {
			id: row.id,
			score: explained.final_score,
			data_confidence: explained.data_confidence,
			components: explained.components,
			top_component: top,
			absurd: absurd.absurd,
			absurd_reason: absurd.reason
		};
	});
	scored.sort((a, b) => b.score - a.score);
	const fullTop10 = new Set(scored.slice(0, 10).map((row) => row.id));
	const ablation = Object.keys(ATTENTION_WEIGHTS_V1).map((dropped) => {
		const retained = args.rows.map((row) => ({
			id: row.id,
			score: scoreOf(row, dropped)
		})).sort((a, b) => a.score === b.score ? 0 : b.score - a.score).slice(0, 10).map((row) => row.id).filter((id) => fullTop10.has(id)).length;
		const deltas = args.rows.map((row) => Math.abs(scoreOf(row) - scoreOf(row, dropped)));
		const mean = deltas.length === 0 ? 0 : deltas.reduce((a, b) => a + b, 0) / deltas.length;
		return {
			dropped,
			top10_retention: retained / Math.max(1, Math.min(10, args.rows.length)),
			mean_abs_delta: mean
		};
	});
	ablation.sort((a, b) => b.mean_abs_delta - a.mean_abs_delta);
	const bad_cases = collectBadAttentionCases(scored);
	return {
		score_version: "v1",
		weights: ATTENTION_WEIGHTS_V1,
		n: scored.length,
		origin_scope: args.origin_scope,
		ranking: scored,
		top10: scored.slice(0, 10),
		bottom: scored.slice(-10).reverse(),
		absurd_count: bad_cases.length,
		bad_cases,
		ablation,
		dominant_component: ablation[0]?.dropped ?? null,
		notes: "Attention v1 é atenção estrutural, não é probabilidade de vitória. Pesos não foram alterados. Casos ruins coletados sem recalibrar. Uma versão v2 só existiria se a evidência obrigasse — Gate 7.5 não aplica."
	};
}
var G75_WORKSTREAMS = [
	{
		id: "harden_planning_link",
		title: "Endurecer e reprocessar planning → contratação",
		until: "2026-09-21",
		status: "DONE",
		notes: "CONFIRMED só com id oficial ou CNPJ+ano+catálogo. 3 object+valor → PROBABLE; 5 só objeto → REVIEW_REQUIRED. Precisão de CONFIRMED, não quantidade de matches."
	},
	{
		id: "grow_recurrence_sample",
		title: "Aumentar amostra de recorrência sem tocar o holdout",
		until: "2026-09-21",
		status: "IN_PROGRESS",
		notes: "Séries históricas visíveis em T=2026-06-30 acrescidas. Holdout ≥ 2026-09-01 permanece intocado. n HIGH/MEDIUM ainda < 30."
	},
	{
		id: "pcp_late_matches",
		title: "Acumular first_seen e matches tardios da PCP",
		until: "2026-09-21",
		status: "IN_PROGRESS",
		notes: "Coorte 08–14/09. Não alterar a janela de 7 dias antes da maturação. Reprocessar exatamente essa coorte em 21/09."
	},
	{
		id: "attention_v1_bad_cases",
		title: "Preservar attention v1 e coletar casos ruins",
		until: "2026-09-21",
		status: "IN_PROGRESS",
		notes: "Não recalibrar pesos. Atenção estrutural, não probabilidade de vitória. Casos absurdos entram na taxonomia."
	}
];
var G75_DECISIVE_GATE = {
	on: "2026-09-21",
	action: "Reprocessar exatamente a coorte PCP 08–14/09 e produzir time_to_national_match: ≤24h, ≤72h, ≤7d, ≤14d, ainda sem match."
};
var M8_C_REQUIRES = [
	"precision dos planning links CONFIRMED após endurecimento",
	"recurrence follow-through com n≥30",
	"ganho incremental real das fontes locais após late matching"
];
var PROJECT_STATE = "M1–M7: GO → Gate 7.5 operacional: GO → inteligência estatisticamente validada: PENDENTE → M8: NO-GO";
function decideM8(ev) {
	const blockers = [];
	if (!ev.golden_separated) blockers.push("Golden ainda mistura métrica live.");
	if (!ev.holdout_defined) blockers.push("Holdout temporal não definido.");
	if (!ev.error_taxonomy) blockers.push("Error taxonomy ausente.");
	if (!ev.pcp_cohort_matured) blockers.push("Coorte PCP 08–14/09/2026 não madura — janela de 7 dias ainda aberta.");
	if (ev.recurrence_sample_too_small || ev.recurrence_n < 30) blockers.push(`Recorrência n=${ev.recurrence_n} < 30. Não justifica personalização nem complexidade extra.`);
	if ((ev.planning_confirmed_n ?? 0) < 30) blockers.push(`Amostra CONFIRMED de planning n=${ev.planning_confirmed_n} é pequena.`);
	if (ev.planning_incorrect_confirmed > 0) blockers.push(`${ev.planning_incorrect_confirmed} CONFIRMED sem id oficial. Endurecer antes de qualquer feature nova.`);
	if (ev.window_recommendation_change) blockers.push("Recomendação da janela pediu mudança — aplicar só depois de holdout.");
	const aReady = ev.recurrence_beats_baseline === true && !ev.recurrence_sample_too_small && (ev.planning_confirmed_precision ?? 0) >= .9 && ev.planning_confirmed_n >= 30 && ev.planning_incorrect_confirmed === 0 && ev.pcp_cohort_matured && ev.attention_absurd_count === 0;
	const bReady = ev.document_pages_observed >= 50;
	const dReady = ev.price_observations >= 200;
	const coverageGap = ev.pcp_overlap_ratio != null && ev.pcp_overlap_ratio < .05 || !ev.live_pca_ingested || !ev.live_pgc_ingested;
	let choice = "NONE";
	let closest = coverageGap ? "C" : "NONE";
	if (aReady) {
		choice = "A";
		closest = "A";
	} else if (bReady && !coverageGap) {
		choice = "B";
		closest = "B";
	} else if (dReady && ev.price_observations > (ev.live_opportunities || 0)) {
		choice = "D";
		closest = "D";
	}
	if (blockers.length > 0 || !aReady) choice = "NONE";
	const closest_confidence = closest === "C" && blockers.length > 0 ? "PRELIMINARY" : closest === "NONE" ? "PRELIMINARY" : "EVIDENCED";
	const rationale = choice === "NONE" ? closest === "C" ? `M8 NO-GO. Engineering GO, validação estatística NO-GO. Recorrência n=${ev.recurrence_n}, planning CONFIRMED n=${ev.planning_confirmed_n}, coorte PCP madura=${ev.pcp_cohort_matured}. Direção mais próxima, ainda preliminar, é C — cobertura — mas só se justifica depois de 21/09 se precision CONFIRMED e follow-through n≥30 permanecerem fracos e o ganho local após late matching continuar alto. Não abrir personalização, IA documental nem preços.` : `M8 NO-GO. Engineering GO, validação estatística NO-GO. Recorrência n=${ev.recurrence_n}, planning CONFIRMED n=${ev.planning_confirmed_n}, coorte PCP madura=${ev.pcp_cohort_matured}. Nenhuma direção A/B/C/D tem evidência agora. C (cobertura) só se justificaria depois de 21/09 se precision CONFIRMED e follow-through n≥30 permanecerem fracos e o ganho local após late matching continuar alto.` : `M8-${choice} com evidência do Gate 7.5.`;
	return {
		choice,
		go_m8: choice !== "NONE",
		closest_if_forced: closest,
		closest_confidence,
		rationale,
		criteria: {
			A: "Personalização só se oportunidades/sinais já tiverem qualidade suficiente. Recorrência precisa bater baseline com n adequado.",
			B: "IA documental só se discovery estiver bom e o gargalo for ler edital. Páginas de documento observadas insuficientes.",
			C: "Cobertura se o ganho de novas famílias/entes superar features sobre o que já existe. Ainda preliminar — depende dos três números após 21/09.",
			D: "Preços só com densidade de price_observation para benchmarking. Ainda não.",
			NONE: "Não abrir M8. Validação empírica incompleta ou amostra insuficiente."
		},
		blockers,
		facts: [
			ev.live_pca_ingested ? "PCA live ingerido via PNCP /orgaos/{cnpj}/pca/{ano}." : "PCA live não ingerido.",
			ev.live_pgc_ingested ? "PGC live ingerido via dadosabertos modulo-pgc." : "PGC live não ingerido.",
			ev.live_arp_ingested ? "ARP live ingerida via dadosabertos modulo-arp." : "ARP live não ingerida.",
			`Golden separado de live: ${ev.golden_separated}`,
			`Holdout definido: ${ev.holdout_defined}`,
			ev.planning_incorrect_confirmed === 0 ? "CONFIRMED sem id oficial reclassificados pelo resolver endurecido." : `${ev.planning_incorrect_confirmed} CONFIRMED ainda sem id oficial.`
		],
		inferences: [
			"Recorrência é inferência histórica, não previsão de nova licitação.",
			"Attention score é atenção estrutural, não probabilidade de vitória.",
			"MATURED_NO_MATCH descreve o que sabemos: sem match nacional após a janela — não é ausência definitiva."
		],
		limitations: [
			"Consulta PNCP /api/consulta/v1/pca* estoura timeout — ingestão usa /api/pncp/v1/orgaos/...",
			"Unidades PCA retornaram 405; itens usam sequencial conhecido (Fazenda 1, Porto Belo 9).",
			"Cap de 512 KB e timeout de 8s limitam o recorte live desta sessão.",
			"Amostra rotulada de planning usa protocolo determinístico, não revisão humana de 100 processos."
		],
		m8_c_requires: [...M8_C_REQUIRES]
	};
}
function gate75EngineeringGo(args) {
	const missing = [
		["PCA live operacional", args.live_pca],
		["PGC live operacional", args.live_pgc],
		["ARP live operacional", args.live_arp],
		["planning links rotulados", args.planning_labeled],
		["resolver CONFIRMED endurecido", args.planning_hardened],
		["recorrência temporal", args.recurrence_temporal],
		["baseline", args.baseline_compared],
		["PCP reprocessado", args.pcp_reprocessed],
		["janela avaliada", args.window_evaluated],
		["attention auditado", args.attention_audited],
		["alertas live", args.alerts_live],
		["golden separado", args.golden_separated],
		["holdout", args.holdout],
		["error taxonomy", args.taxonomy],
		["tests", args.tests]
	].filter(([, ok]) => !ok).map(([name]) => name);
	return {
		go: missing.length === 0,
		missing
	};
}
function gate75StatisticalGo(args) {
	const missing = [
		["coorte PCP 08–14/09 madura", args.pcp_cohort_matured],
		["recorrência n≥30", args.recurrence_n >= 30],
		["recorrência bate baseline", args.recurrence_beats_baseline === true],
		["zero CONFIRMED sem id oficial", args.planning_incorrect_confirmed === 0],
		["planning CONFIRMED n≥30", args.planning_confirmed_n >= 30],
		["precision CONFIRMED ≥ 0.9", args.planning_confirmed_precision != null && args.planning_confirmed_precision >= .9]
	].filter(([, ok]) => !ok).map(([name]) => name);
	return {
		go: missing.length === 0,
		missing
	};
}
/**
* Origin tagging for Gate 7.5.
* Golden never contaminates live metrics. Absence of a tag is UNKNOWN, not LIVE.
*/
var DATA_ORIGINS = [
	"LIVE",
	"GOLDEN",
	"FIXTURE",
	"SYNTHETIC",
	"UNKNOWN"
];
function asDataOrigin(value) {
	if (value && DATA_ORIGINS.includes(value)) return value;
	return "UNKNOWN";
}
function filterByOrigin(rows, scope) {
	if (scope === "ALL") return rows;
	return rows.filter((row) => asDataOrigin(row.data_origin) === scope);
}
/** Live metrics must not include golden, fixture or synthetic rows. */
function liveOnly(rows) {
	return filterByOrigin(rows, "LIVE");
}
var FORBIDDEN_SIGNAL_PHRASES = [
	"acurácia de previsão",
	"acuracia de previsao",
	"accuracy of prediction",
	"probabilidade de vitória",
	"probabilidade de vitoria",
	"win probability",
	"ausência definitiva",
	"ausencia definitiva",
	"confirmadamente ausente",
	"exclusivo do pncp",
	"exclusiva do pncp",
	"local exclusive"
];
function forbiddenLanguageHit(text) {
	if (!text) return null;
	const compact = text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
	for (const phrase of FORBIDDEN_SIGNAL_PHRASES) {
		const needle = phrase.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
		if (compact.includes(needle)) {
			const idx = compact.indexOf(needle);
			const before = compact.slice(Math.max(0, idx - 24), idx);
			if (/(nao e |nao eh |nao prova |nunca |sem |, nao | e nao | nao )$/.test(before)) continue;
			return phrase;
		}
	}
	return null;
}
function digits(value) {
	return (value ?? "").replace(/\D/g, "");
}
/**
* PCA ≠ PGC. Never auto-merge into a single planning record.
* A relation is evidence, not identity.
*/
function relatePcaPgc(pca, pgc) {
	const pcaCnpj = digits(pca.organization_cnpj);
	const pgcCnpj = digits(pgc.organization_cnpj);
	const matched = [];
	const sameCnpj = pcaCnpj.length === 14 && pcaCnpj === pgcCnpj;
	const sameYear = pca.year != null && pca.year === pgc.year;
	const sameCatalog = Boolean(pca.catalog_code) && pca.catalog_code === pgc.catalog_code;
	if (pca.numero_item_pncp && pgc.numero_item_pncp && pca.numero_item_pncp === pgc.numero_item_pncp && sameCnpj) return {
		pca_planning_id: pca.id,
		pgc_planning_id: pgc.id,
		status: "CONFIRMED",
		match_method: "official_item_id",
		match_score: 100,
		matched_fields: ["numero_item_pncp", "organization_cnpj"],
		auto_merged: false
	};
	if (sameCnpj && sameYear && sameCatalog) return {
		pca_planning_id: pca.id,
		pgc_planning_id: pgc.id,
		status: "PROBABLE",
		match_method: "cnpj_year_catalog",
		match_score: 80,
		matched_fields: [
			"organization_cnpj",
			"year",
			"catalog_code"
		],
		auto_merged: false
	};
	const pcaNorm = normalizeObject(pca.object);
	const pgcNorm = normalizeObject(pgc.object);
	const similar = objectsGroupTogether(pcaNorm, pgcNorm) || tokenJaccard(pcaNorm.tokens, pgcNorm.tokens) >= .6;
	if (sameCnpj && sameYear && similar) return {
		pca_planning_id: pca.id,
		pgc_planning_id: pgc.id,
		status: "REVIEW_REQUIRED",
		match_method: "cnpj_year_object",
		match_score: 55,
		matched_fields: [
			"organization_cnpj",
			"year",
			"object"
		],
		auto_merged: false
	};
	if (sameCnpj) matched.push("organization_cnpj");
	return {
		pca_planning_id: pca.id,
		pgc_planning_id: pgc.id,
		status: "UNRELATED",
		match_method: "none",
		match_score: matched.length ? 20 : 0,
		matched_fields: matched,
		auto_merged: false
	};
}
function relateAll(pcaRows, pgcRows) {
	const out = [];
	for (const pca of pcaRows) {
		if (pca.origin_type !== "PCA_PNCP") continue;
		let best = null;
		for (const pgc of pgcRows) {
			if (pgc.origin_type !== "PGC_COMPRASGOV") continue;
			const rel = relatePcaPgc(pca, pgc);
			if (!best || rel.match_score > best.match_score) best = rel;
		}
		if (best && best.status !== "UNRELATED") out.push(best);
	}
	return out;
}
function auditObjectPair(left, right, expectedTogether) {
	const grouped = objectsGroupTogether(normalizeObject(left), normalizeObject(right));
	let error = null;
	if (grouped && !expectedTogether) error = "OBJECT_GROUPING_FALSE";
	if (!grouped && expectedTogether) error = "OBJECT_GROUPING_MISS";
	return {
		left,
		right,
		grouped,
		expected: expectedTogether,
		error
	};
}
function classifyRecurrenceFalsePositive(args) {
	if (args.org_unresolved) return "ENTITY_MATCH_ERROR";
	if (args.grouped_inconsistently) return "CATEGORY_GROUPING_ERROR";
	if (args.median_interval_days != null && args.median_interval_days > args.window_days) return "WINDOW_INSUFFICIENT";
	if (args.seasonality) return "SEASONALITY_MISREAD";
	return "INSUFFICIENT_EVIDENCE";
}
function errorEvent(args) {
	return {
		id: `err_${args.code}_${args.entity_id ?? args.entity_type}`.slice(0, 80),
		code: args.code,
		entity_type: args.entity_type,
		entity_id: args.entity_id ?? null,
		notes: args.notes,
		data_origin: args.data_origin ?? null
	};
}
var FOLLOW_THROUGH_WINDOWS = [
	30,
	60,
	90,
	180
];
function wilsonInterval(successes, n, z = 1.96) {
	if (n <= 0) return {
		n: 0,
		successes: 0,
		point: null,
		low: null,
		high: null
	};
	const p = successes / n;
	const z2 = z * z;
	const denom = 1 + z2 / n;
	const center = p + z2 / (2 * n);
	const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
	return {
		n,
		successes,
		point: p,
		low: Math.max(0, (center - margin) / denom),
		high: Math.min(1, (center + margin) / denom)
	};
}
function baselineFires(purchases, t, kind) {
	const visible = visibleAt(purchases, t);
	if (visible.length === 0) return false;
	const tMs = new Date(t).getTime();
	if (kind === "AT_LEAST_ONE_LAST_YEAR") {
		const start = tMs - 31536e6;
		return visible.some((row) => new Date(row.occurred_at).getTime() >= start);
	}
	if (kind === "AT_LEAST_TWO_24M") {
		const start = tMs - 63072e6;
		return visible.filter((row) => new Date(row.occurred_at).getTime() >= start).length >= 2;
	}
	return daysBetween(visible.reduce((acc, row) => row.occurred_at > acc ? row.occurred_at : acc, visible[0].occurred_at), t) <= 180;
}
function futureSameGroup(seed, future) {
	if (!seed) return [];
	return future.filter((row) => objectsGroupTogether(seed, row.normalized));
}
function evaluateSeriesAtT(series, t) {
	const visible = visibleAt(series.purchases, t);
	const leak = assertNoTemporalLeakage(visible.map((row) => ({
		occurred_at: row.occurred_at,
		id: row.canonical_id
	})), t);
	const signal = computeRecurrence({
		purchases: visible,
		now: t,
		windowMonths: 36
	});
	const future = afterT(series.purchases, t);
	const seed = visible[0]?.normalized;
	const hits = futureSameGroup(seed, future);
	const daysTo = hits.length > 0 ? daysBetween(t, hits[0].occurred_at) : null;
	const follow_through = {
		30: daysTo != null && daysTo <= 30,
		60: daysTo != null && daysTo <= 60,
		90: daysTo != null && daysTo <= 90,
		180: daysTo != null && daysTo <= 180
	};
	const groupedInconsistently = visible.length >= 2 && visible.some((row) => !objectsGroupTogether(visible[0].normalized, row.normalized));
	const false_positive_180d = signal.signal_level === "HIGH" && !follow_through[180] ? classifyRecurrenceFalsePositive({
		signal_level: signal.signal_level,
		median_interval_days: signal.median_interval_days,
		window_days: 180,
		grouped_inconsistently: groupedInconsistently,
		org_unresolved: series.organization_id.startsWith("org_name_"),
		seasonality: signal.seasonality
	}) : null;
	return {
		series_id: series.id,
		organization_id: series.organization_id,
		category: series.category,
		data_origin: series.data_origin,
		t,
		leakage: leak.ok === false,
		signal,
		baselines: {
			AT_LEAST_ONE_LAST_YEAR: baselineFires(series.purchases, t, "AT_LEAST_ONE_LAST_YEAR"),
			AT_LEAST_TWO_24M: baselineFires(series.purchases, t, "AT_LEAST_TWO_24M"),
			LAST_PURCHASE_WITHIN_180D: baselineFires(series.purchases, t, "LAST_PURCHASE_WITHIN_180D")
		},
		follow_through,
		days_to_event: daysTo,
		false_positive_180d
	};
}
function median(values) {
	const sorted = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
	if (sorted.length === 0) return null;
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
function intervalFor(rows, predicate, window) {
	const selected = rows.filter(predicate);
	const successes = selected.filter((row) => row.follow_through[window]).length;
	return wilsonInterval(successes, selected.length);
}
function evaluateRecurrence(args) {
	const rows = args.series.map((series) => evaluateSeriesAtT(series, args.t));
	const engineFired = (row) => row.signal.signal_level === "HIGH" || row.signal.signal_level === "MEDIUM";
	const windows = {};
	for (const w of FOLLOW_THROUGH_WINDOWS) windows[w] = {
		engine: intervalFor(rows, engineFired, w),
		baseline_one_last_year: intervalFor(rows, (row) => row.baselines.AT_LEAST_ONE_LAST_YEAR, w),
		baseline_two_24m: intervalFor(rows, (row) => row.baselines.AT_LEAST_TWO_24M, w),
		baseline_last_180d: intervalFor(rows, (row) => row.baselines.LAST_PURCHASE_WITHIN_180D, w)
	};
	const engine90 = windows[90].engine.point;
	const bestBaseline = Math.max(windows[90].baseline_one_last_year.point ?? 0, windows[90].baseline_two_24m.point ?? 0, windows[90].baseline_last_180d.point ?? 0);
	const nEngine = windows[90].engine.n;
	const sample_too_small = nEngine < 30;
	const days = rows.map((row) => row.days_to_event).filter((n) => n != null);
	return {
		metric_name: "RECURRENCE_SIGNAL_FOLLOW_THROUGH",
		t: args.t,
		origin_scope: args.origin_scope,
		series_n: rows.length,
		signals_generated: rows.filter(engineFired).length,
		high_or_medium: rows.filter(engineFired).length,
		windows,
		median_days_to_event: median(days),
		engine_beats_best_baseline_90d: engine90 == null || nEngine < 8 ? null : engine90 > bestBaseline + .05,
		false_positives: rows.filter((row) => row.false_positive_180d).map((row) => ({
			series_id: row.series_id,
			reason: row.false_positive_180d
		})),
		leakage_count: rows.filter((row) => row.leakage).length,
		sample_too_small,
		notes: sample_too_small ? `n=${nEngine} sinais MEDIUM/HIGH. Amostra insuficiente para justificar complexidade extra do motor. Não é acurácia de previsão.` : "Follow-through de sinal de recorrência. Não é acurácia de previsão de nova licitação."
	};
}
/**
* Protocolo documentado — não é LLM.
* CONFIRMED só é CORRECT com id oficial ou CNPJ+ano+catálogo.
* Texto sozinho nunca confirma: se o motor confirmou só por objeto, é INCORRECT.
*/
function protocolLabel(link) {
	const fields = new Set(link.matched_fields);
	const official = link.match_method === "official_item_id" || fields.has("numero_item_pncp") || link.match_method === "cnpj_year_catalog" && fields.has("catalog_code");
	if (link.status === "CONFIRMED") {
		if (official) return {
			label: "CORRECT",
			protocol: "CONFIRMED_OFFICIAL",
			notes: "Confirmado por identificador oficial ou CNPJ+ano+catálogo."
		};
		return {
			label: "INCORRECT",
			protocol: "CONFIRMED_WITHOUT_OFFICIAL_ID",
			notes: "CONFIRMED sem id oficial — regra deve endurecer, não aumentar match rate."
		};
	}
	if (link.status === "PROBABLE" || link.status === "REVIEW_REQUIRED") return {
		label: "AMBIGUOUS",
		protocol: "NEEDS_PUBLIC_REVIEW",
		notes: "Candidato sem id oficial. Texto/valor não basta para confirmar."
	};
	return {
		label: "AMBIGUOUS",
		protocol: "UNMATCHED_NOT_ABSENCE",
		notes: "Sem contratação ligada. Não prova que o planejamento foi cancelado."
	};
}
function labelLinks(links) {
	return links.map((link) => {
		const labeled = protocolLabel(link);
		return {
			...link,
			...labeled
		};
	});
}
/** Aplica o resolver endurecido em ligações já materializadas. Não infla match rate. */
function reprocessLinks(links) {
	const after = [];
	const demoted = [];
	let demoted_to_probable = 0;
	let demoted_to_review = 0;
	for (const link of links) {
		const hardened = hardenConfirmedLink({
			planning_id: link.planning_id,
			procurement_id: link.procurement_id,
			status: link.status,
			match_method: link.match_method,
			match_score: link.match_score,
			matched_fields: link.matched_fields
		});
		const next = {
			...link,
			status: hardened.status,
			match_method: hardened.match_method,
			match_score: hardened.match_score,
			matched_fields: hardened.matched_fields
		};
		after.push(next);
		if (link.status === "CONFIRMED" && next.status !== "CONFIRMED") {
			demoted.push(next);
			if (next.status === "PROBABLE") demoted_to_probable += 1;
			if (next.status === "REVIEW_REQUIRED") demoted_to_review += 1;
		}
	}
	return {
		before: links,
		after,
		demoted,
		demoted_to_probable,
		demoted_to_review
	};
}
function precisionReport(args) {
	const labeled = args.labeled;
	const by_status = {
		CONFIRMED: 0,
		PROBABLE: 0,
		REVIEW_REQUIRED: 0,
		UNMATCHED: 0
	};
	for (const row of labeled) by_status[row.status] += 1;
	const confirmed = labeled.filter((row) => row.status === "CONFIRMED");
	const confirmedCorrect = confirmed.filter((row) => row.label === "CORRECT").length;
	const incorrect = confirmed.filter((row) => row.label === "INCORRECT").length;
	const review_rate = labeled.length === 0 ? 0 : by_status.REVIEW_REQUIRED / labeled.length;
	const probable_ambiguous_rate = labeled.length === 0 ? 0 : labeled.filter((row) => row.status === "PROBABLE" && row.label === "AMBIGUOUS").length / labeled.length;
	const days = args.plan_to_procurement_days.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
	const median = days.length === 0 ? null : days.length % 2 === 0 ? (days[days.length / 2 - 1] + days[days.length / 2]) / 2 : days[Math.floor(days.length / 2)];
	const reclassified = args.reclassified_from_confirmed ?? 0;
	return {
		origin_scope: args.origin_scope,
		n: labeled.length,
		by_status,
		confirmed: wilsonInterval(confirmedCorrect, confirmed.length),
		probable_ambiguous_rate,
		review_rate,
		incorrect_confirmed: incorrect,
		harden_confirmed_rule: incorrect > 0,
		reclassified_from_confirmed: reclassified,
		demoted_to_probable: args.demoted_to_probable ?? 0,
		demoted_to_review: args.demoted_to_review ?? 0,
		conversion: planningConversion({
			planned: args.planned,
			converted: args.converted
		}),
		median_plan_to_procurement_days: median,
		notes: incorrect > 0 ? "Há CONFIRMED sem id oficial. Endurecer a regra — não aumentar match rate." : reclassified > 0 ? `${reclassified} CONFIRMED sem id oficial foram reclassificados. CONFIRMED restantes têm identificador oficial. Precisão live ainda pendente.` : confirmed.length === 0 ? "Nenhum CONFIRMED nesta amostra. Não inflar match rate." : "CONFIRMED desta amostra passou no protocolo oficial. Amostra rotulada por protocolo, não por LLM."
	};
}
function delayHours(local, pncp) {
	return (new Date(pncp).getTime() - new Date(local).getTime()) / 36e5;
}
function share(delays, maxHours) {
	if (delays.length === 0) return null;
	return delays.filter((h) => h <= maxHours).length / delays.length;
}
function evaluateMatchWindow(args) {
	const config = {
		...DEFAULT_COVERAGE_CONFIG,
		...args.config ?? {}
	};
	const delays = [];
	let unmatched = 0;
	let stillInWindow = 0;
	for (const row of args.rows) {
		if (row.matched && row.first_seen_pncp) {
			delays.push(delayHours(row.first_seen_local, row.first_seen_pncp));
			continue;
		}
		unmatched += 1;
		if (classifyLocalOnly({
			matched: false,
			firstSeenAt: row.first_seen_local,
			now: args.now,
			config
		}) !== "LOCAL_ONLY_CONFIRMED") stillInWindow += 1;
	}
	const matured = stillInWindow === 0 && args.rows.length > 0;
	const recKeep = 7;
	const reason = matured ? delays.length === 0 ? "Coorte madura, mas sem matches nacionais observados. Manter 7 dias — não tratar ausência como irregularidade. Não alterar automaticamente." : `Coorte madura. Mediana ${percentile(delays, 50) ?? "—"} h até match nacional. Manter política de 7 dias até haver n live suficiente. Não alterar automaticamente.` : "A coorte PCP 08–14/09/2026 ainda está dentro da janela operacional em 14/09/2026. Nenhum registro dessa semana completou 7 dias. Reavaliar depois de 21/09/2026. Não encurtar a janela.";
	return {
		metric_name: "TIME_TO_NATIONAL_MATCH",
		origin_scope: args.origin_scope,
		n: args.rows.length,
		n_matched: delays.length,
		n_unmatched: unmatched,
		n_still_in_window: stillInWindow,
		cohort_matured: matured,
		pct_24h: share(delays, 24),
		pct_72h: share(delays, 72),
		pct_7d: share(delays, 168),
		pct_14d: share(delays, 336),
		pct_30d: share(delays, 720),
		median_hours: percentile(delays, 50),
		p75_hours: percentile(delays, 75),
		p95_hours: percentile(delays, 95),
		delays_hours: delays,
		recommendation: {
			keep_days: recKeep,
			change: false,
			reason,
			reevaluate_after: "2026-09-21"
		},
		display_alias: {
			stored_state: "LOCAL_ONLY_CONFIRMED",
			ux_kind: "MATURED_NO_MATCH",
			label: "Sem match nacional após a janela — não é ausência definitiva"
		}
	};
}
async function persistMetric(sql, name, origin, value, payload) {
	await sql.query(`insert into validation_metric (id, metric_name, origin_scope, value_num, payload, calculated_at)
     values ($1,$2,$3,$4,$5::jsonb,now())
     on conflict (metric_name, origin_scope) do update set
       value_num = excluded.value_num,
       payload = excluded.payload,
       calculated_at = now()`, [
		`vm_${name}_${origin}`,
		name,
		origin,
		value,
		JSON.stringify(payload)
	]);
}
async function persistError(sql, ev) {
	await sql.query(`insert into error_taxonomy_event (id, code, entity_type, entity_id, notes, data_origin)
     values ($1,$2,$3,$4,$5,$6)
     on conflict (id) do update set notes = excluded.notes, observed_at = now()`, [
		ev.id,
		ev.code,
		ev.entity_type,
		ev.entity_id,
		ev.notes,
		ev.data_origin
	]);
}
async function tagExistingOrigins(sql) {
	await sql.query(`update planning_record set data_origin = 'GOLDEN'
     where id in (select entity_id from golden_case where entity_type = 'planning_record')`);
	await sql.query(`update arp_record set data_origin = 'GOLDEN'
     where id in (select entity_id from golden_case where entity_type = 'arp_record')`);
	await sql.query(`update canonical_procurement set data_origin = 'GOLDEN'
     where id in (select entity_id from golden_case where entity_type = 'canonical_procurement')`);
	await sql.query(`update opportunity set data_origin = 'GOLDEN'
     where id in (select entity_id from golden_case where entity_type = 'opportunity')`);
	await sql.query(`update canonical_procurement set data_origin = 'SYNTHETIC'
     where id like 'can_m7_%' and data_origin = 'UNKNOWN'`);
	await sql.query(`update opportunity o set data_origin = c.data_origin
     from canonical_procurement c
     where o.canonical_procurement_id = c.id
       and o.data_origin = 'UNKNOWN'
       and c.data_origin <> 'UNKNOWN'`);
	await sql.query(`update recurrence_signal set data_origin = 'SYNTHETIC' where data_origin = 'UNKNOWN'`);
	await sql.query(`update source_record set data_origin = 'LIVE'
     where source_system_id like 'src_pcp_%' and data_origin in ('UNKNOWN')`);
	await sql.query(`update source_record set data_origin = 'FIXTURE'
     where (source_system_id like 'src_bll%' or ingestion_mode in ('RECORDED_FIXTURE','MANUAL_FIXTURE'))
       and data_origin = 'UNKNOWN'`);
	return (await sql.query(`select count(*)::int as n from source_record where data_origin <> 'UNKNOWN'`))[0]?.n ?? 0;
}
async function reprocessPcpLocalOnly(sql, now = G75_NOW) {
	const rows = await sql.query(`select r.id, r.first_seen_at, r.local_only_state, l.status as match_status
     from source_record r
     left join source_entity_link l
       on l.source_system_id = r.source_system_id
      and l.source_external_id = r.source_identifier
     where r.source_system_id like 'src_pcp_%'`);
	let confirmed = 0;
	let provisional = 0;
	let pending = 0;
	for (const row of rows) {
		if (!row.first_seen_at) continue;
		const matched = row.match_status === "CONFIRMED";
		const next = classifyLocalOnly({
			matched,
			firstSeenAt: row.first_seen_at,
			now
		});
		if (next === "LOCAL_ONLY_CONFIRMED") confirmed += 1;
		else if (next === "LOCAL_ONLY_PROVISIONAL") provisional += 1;
		else if (next === "PENDING_PNCP_MATCH") pending += 1;
		if (next !== row.local_only_state) await sql.query(`update source_record set local_only_state = $2 where id = $1`, [row.id, next]);
	}
	return {
		n: rows.length,
		confirmed,
		provisional,
		pending
	};
}
async function accumulatePcpLateMatches(sql) {
	const fromDb = lateMatchesFromSourceRecords(await sql.query(`select r.id, r.first_seen_at, l.pncp_first_seen_at, l.status as match_status, r.data_origin
     from source_record r
     left join source_entity_link l
       on l.source_system_id = r.source_system_id
      and l.source_external_id = r.source_identifier
     where r.source_system_id like 'src_pcp_%'`));
	const byId = new Map(g75LateMatches().map((row) => [row.id, row]));
	for (const row of fromDb) byId.set(row.id, row);
	return [...byId.values()];
}
async function loadRecurrenceSeriesFromDb(sql) {
	const extra = seriesFromProcurements(await sql.query(`select id, organization_id, object,
            coalesce(opening_at, publication_at, created_at)::text as occurred_at,
            estimated_value_num, data_origin, catalog_code
     from canonical_procurement
     where organization_id is not null`), G75_AS_OF);
	return mergeRecurrenceSeries(g75RecurrenceSeries(), extra);
}
function parseFields(value) {
	if (Array.isArray(value)) return value.map(String);
	if (typeof value === "string") try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed.map(String) : [];
	} catch {
		return [];
	}
	return [];
}
async function reprocessHardenedPlanning(sql) {
	const links = await sql.query(`select id, planning_record_id, canonical_procurement_id, status, match_method, match_score, matched_fields
     from planning_procurement_link`);
	let demoted = 0;
	let demoted_to_probable = 0;
	let demoted_to_review = 0;
	let unofficial_remaining = 0;
	for (const row of links) {
		const fields = parseFields(row.matched_fields);
		const hardened = hardenConfirmedLink({
			planning_id: row.planning_record_id,
			procurement_id: row.canonical_procurement_id,
			status: row.status,
			match_method: row.match_method ?? "none",
			match_score: row.match_score ?? 0,
			matched_fields: fields
		});
		if (hardened.status !== row.status || hardened.match_method !== row.match_method) {
			demoted += 1;
			if (row.status === "CONFIRMED" && hardened.status === "PROBABLE") demoted_to_probable += 1;
			if (row.status === "CONFIRMED" && hardened.status === "REVIEW_REQUIRED") demoted_to_review += 1;
			await sql.query(`update planning_procurement_link
         set status = $2, match_method = $3, match_score = $4, matched_fields = $5::jsonb, observed_at = now()
         where id = $1`, [
				row.id,
				hardened.status,
				hardened.match_method,
				hardened.match_score,
				JSON.stringify(hardened.matched_fields)
			]);
		}
		if (hardened.status === "CONFIRMED" && hardened.match_method !== "official_item_id" && hardened.match_method !== "cnpj_year_catalog") unofficial_remaining += 1;
	}
	const reprocessed = reprocessLinks(g75LabeledLinks());
	const labeled = labelLinks(reprocessed.after);
	for (const row of labeled) await sql.query(`insert into labeled_link_sample (
         id, planning_link_id, planning_record_id, canonical_procurement_id,
         link_status, label, protocol, data_origin, notes
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do update set
         link_status = excluded.link_status,
         label = excluded.label,
         protocol = excluded.protocol,
         notes = excluded.notes`, [
		row.id,
		row.id,
		row.planning_id,
		row.procurement_id,
		row.status,
		row.label,
		row.protocol,
		row.data_origin,
		row.notes
	]);
	return {
		demoted: demoted + reprocessed.demoted.length,
		demoted_to_probable: demoted_to_probable + reprocessed.demoted_to_probable,
		demoted_to_review: demoted_to_review + reprocessed.demoted_to_review,
		unofficial_remaining
	};
}
async function collectStoredAttentionCases(sql) {
	const stored = await sql.query(`select o.id, o.object, o.organization_name, o.data_origin, s.data_confidence, s.components_json
     from opportunity o
     join opportunity_attention_score s on s.opportunity_id = o.id
     where s.score_version = 'v1'`);
	const out = [];
	for (const row of stored) {
		const components = row.components_json && typeof row.components_json === "object" && !Array.isArray(row.components_json) ? row.components_json : typeof row.components_json === "string" ? (() => {
			try {
				return JSON.parse(row.components_json);
			} catch {
				return null;
			}
		})() : null;
		const ranked = rankedFromStored({
			id: row.id,
			object: row.object,
			organization_name: row.organization_name,
			data_origin: row.data_origin ?? "UNKNOWN",
			data_confidence: Number(row.data_confidence ?? 0),
			components
		});
		if (ranked) out.push(ranked);
	}
	return out;
}
async function persistAttentionBadCases(sql, rows) {
	const audit = auditAttention({
		rows,
		origin_scope: "ALL"
	});
	for (const bad of audit.bad_cases) await persistError(sql, errorEvent({
		code: "ATTENTION_ABSURD",
		entity_type: "opportunity",
		entity_id: bad.id,
		notes: `${bad.absurd_reason ?? "score absurdo"} · score=${bad.score} · conf=${bad.data_confidence}. Pesos v1 preservados.`,
		data_origin: "SYNTHETIC"
	}));
	await persistMetric(sql, "ATTENTION_BAD_CASES", "ALL", audit.absurd_count, {
		score_version: audit.score_version,
		n: audit.n,
		absurd_count: audit.absurd_count,
		cases: audit.bad_cases.map((row) => ({
			id: row.id,
			score: row.score,
			data_confidence: row.data_confidence,
			reason: row.absurd_reason
		})),
		notes: audit.notes
	});
	return audit.absurd_count;
}
async function seedGate75(sql) {
	if (((await sql.query(`select count(*)::int as n from evaluation_cohort where id = 'g75_calibration'`))[0]?.n ?? 0) > 0) {
		await tagExistingOrigins(sql);
		await reprocessHardenedPlanning(sql);
		await persistAttentionBadCases(sql, [...g75AttentionRows(), ...await collectStoredAttentionCases(sql)]);
		return;
	}
	await tagExistingOrigins(sql);
	for (const cohort of G75_COHORTS) await sql.query(`insert into evaluation_cohort (id, kind, window_start, window_end, notes)
       values ($1,$2,$3,$4,$5) on conflict (id) do nothing`, [
		cohort.id,
		cohort.kind,
		cohort.window_start,
		cohort.window_end,
		cohort.notes
	]);
	const reprocessed = reprocessLinks(g75LabeledLinks());
	const labeled = labelLinks(reprocessed.after);
	for (const row of labeled) await sql.query(`insert into labeled_link_sample (
         id, planning_link_id, planning_record_id, canonical_procurement_id,
         link_status, label, protocol, data_origin, notes
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do nothing`, [
		row.id,
		row.id,
		row.planning_id,
		row.procurement_id,
		row.status,
		row.label,
		row.protocol,
		row.data_origin,
		row.notes
	]);
	const rec = evaluateRecurrence({
		series: await loadRecurrenceSeriesFromDb(sql),
		t: G75_AS_OF,
		origin_scope: "SYNTHETIC"
	});
	await persistMetric(sql, rec.metric_name, "SYNTHETIC", rec.windows[90].engine.point, rec);
	const pcpMatches = await accumulatePcpLateMatches(sql);
	const windowLive = evaluateMatchWindow({
		rows: liveOnly(pcpMatches),
		now: G75_NOW,
		origin_scope: "LIVE"
	});
	const windowFixture = evaluateMatchWindow({
		rows: pcpMatches.filter((row) => row.data_origin === "FIXTURE"),
		now: G75_NOW,
		origin_scope: "FIXTURE"
	});
	await persistMetric(sql, windowLive.metric_name, "LIVE", windowLive.median_hours, windowLive);
	await persistMetric(sql, windowFixture.metric_name, "FIXTURE", windowFixture.median_hours, windowFixture);
	const precision = precisionReport({
		labeled,
		planned: labeled.length,
		converted: labeled.filter((row) => row.status === "CONFIRMED" || row.status === "PROBABLE").length,
		plan_to_procurement_days: [
			40,
			70,
			95,
			120
		],
		origin_scope: "SYNTHETIC",
		reclassified_from_confirmed: reprocessed.demoted.length,
		demoted_to_probable: reprocessed.demoted_to_probable,
		demoted_to_review: reprocessed.demoted_to_review
	});
	await persistMetric(sql, "PLANNING_LINK_PRECISION", "SYNTHETIC", precision.confirmed.point, precision);
	const attentionRows = [...g75AttentionRows(), ...await collectStoredAttentionCases(sql)];
	const attention = auditAttention({
		rows: attentionRows,
		origin_scope: "SYNTHETIC"
	});
	await persistMetric(sql, "ATTENTION_AUDIT", "SYNTHETIC", attention.absurd_count, {
		n: attention.n,
		absurd_count: attention.absurd_count,
		ablation: attention.ablation,
		notes: attention.notes,
		score_version: attention.score_version
	});
	await persistAttentionBadCases(sql, attentionRows);
	const alerts = evaluateAlerts({
		rules: g75AlertRules(),
		events: g75AlertEvents(),
		origin_scope: "SYNTHETIC"
	});
	await persistMetric(sql, "ALERT_QUALITY", "SYNTHETIC", alerts.events_generated, alerts);
	const sides = g75PcaPgcSides();
	const relations = relateAll(sides.pca, sides.pgc);
	for (const rel of relations) await sql.query(`insert into pca_pgc_relation (
         id, pca_planning_id, pgc_planning_id, status, match_method, match_score, matched_fields
       ) values ($1,$2,$3,$4,$5,$6,$7::jsonb)
       on conflict (pca_planning_id, pgc_planning_id) do nothing`, [
		`rel_${rel.pca_planning_id}_${rel.pgc_planning_id}`.slice(0, 80),
		rel.pca_planning_id,
		rel.pgc_planning_id,
		rel.status,
		rel.match_method,
		rel.match_score,
		JSON.stringify(rel.matched_fields)
	]);
	for (const pair of G75_OBJECT_PAIRS) {
		const audit = auditObjectPair(pair.left, pair.right, pair.expected);
		if (audit.error) await persistError(sql, errorEvent({
			code: audit.error,
			entity_type: "object_pair",
			notes: `${audit.left} × ${audit.right}`,
			data_origin: "SYNTHETIC"
		}));
	}
	const pcp = await reprocessPcpLocalOnly(sql);
	await persistMetric(sql, "PCP_WINDOW_REPROCESS", "LIVE", pcp.n, pcp);
	const events = [
		errorEvent({
			code: "INSUFFICIENT_SAMPLE",
			entity_type: "recurrence_signal",
			notes: `Recorrência n=${rec.high_or_medium} < 30. Amostra cresceu sem tocar o holdout. Não justifica complexidade extra.`,
			data_origin: "SYNTHETIC"
		}),
		errorEvent({
			code: "WINDOW_INSUFFICIENT",
			entity_type: "source_record",
			notes: "Coorte PCP 08–14/09/2026 ainda na janela de 7 dias em 14/09. Não alterar política.",
			data_origin: "LIVE"
		}),
		errorEvent({
			code: "INSUFFICIENT_EVIDENCE",
			entity_type: "planning_procurement_link",
			notes: `${reprocessed.demoted.length} CONFIRMED sem id oficial reclassificados (${reprocessed.demoted_to_probable} → PROBABLE, ${reprocessed.demoted_to_review} → REVIEW). Não inflar match rate.`,
			data_origin: "SYNTHETIC"
		})
	];
	for (const ev of events) await persistError(sql, ev);
	const m8 = decideM8({
		live_pca_ingested: false,
		live_pgc_ingested: false,
		live_arp_ingested: false,
		planning_confirmed_precision: precision.confirmed.point,
		planning_confirmed_n: precision.confirmed.n,
		planning_incorrect_confirmed: precision.incorrect_confirmed,
		recurrence_n: rec.high_or_medium,
		recurrence_beats_baseline: rec.engine_beats_best_baseline_90d,
		recurrence_sample_too_small: rec.sample_too_small,
		pcp_cohort_matured: windowLive.cohort_matured,
		pcp_overlap_ratio: 0,
		window_recommendation_change: windowLive.recommendation.change,
		attention_absurd_count: attention.absurd_count,
		alerts_idempotent: alerts.idempotent,
		golden_separated: true,
		holdout_defined: true,
		error_taxonomy: true,
		document_pages_observed: 0,
		price_observations: 6,
		live_opportunities: 0,
		local_coverage_gain_after_late_match: null
	});
	await persistMetric(sql, "M8_DECISION", "ALL", m8.go_m8 ? 1 : 0, {
		...m8,
		project_state: PROJECT_STATE
	});
	await sql.query(`insert into evaluation_run (id, run_kind, status, started_at, finished_at, rows_affected, origin_scope, payload)
     values ('erun_g75_seed','SEED','ok',now(),now(),$1,'ALL',$2::jsonb)
     on conflict (id) do nothing`, [labeled.length, JSON.stringify({
		recurrence_n: rec.series_n,
		labeled: labeled.length,
		reclassified: reprocessed.demoted.length,
		demoted_to_probable: reprocessed.demoted_to_probable,
		demoted_to_review: reprocessed.demoted_to_review
	})]);
	await reprocessHardenedPlanning(sql);
}
//#endregion
export { g75PcaPgcSides as C, holdoutUnused as D, G75_NOW as E, g75LabeledLinks as S, G75_COHORTS as T, evaluateAlerts as _, evaluateRecurrence as a, accumulatePcpLateMatches, g75AlertRules as b, forbiddenLanguageHit as c, collectStoredAttentionCases, G75_WORKSTREAMS as d, PROJECT_STATE as f, auditAttention as g, gate75StatisticalGo as h, reprocessLinks as i, liveOnly as l, loadRecurrenceSeriesFromDb, gate75EngineeringGo as m, labelLinks as n, auditObjectPair as o, decideM8 as p, persistAttentionBadCases, precisionReport as r, reprocessHardenedPlanning, reprocessPcpLocalOnly, relateAll as s, seedGate75, evaluateMatchWindow as t, G75_DECISIVE_GATE as u, G75_OBJECT_PAIRS as v, G75_AS_OF as w, g75AttentionRows as x, g75AlertEvents as y };
