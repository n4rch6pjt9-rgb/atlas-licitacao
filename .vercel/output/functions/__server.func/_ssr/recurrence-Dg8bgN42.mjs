import { n as sha256 } from "./hash-DAnDaBOp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recurrence-Dg8bgN42.js
var CHANGE_PRIORITY_MAP = {
	deadline: "HIGH",
	proposal_deadline: "HIGH",
	cancellation: "HIGH",
	cancelled: "HIGH",
	suspension: "HIGH",
	suspended: "HIGH",
	reopening: "HIGH",
	status: "HIGH",
	document: "MEDIUM",
	value: "MEDIUM",
	estimated_value: "MEDIUM",
	object: "MEDIUM",
	metadata: "LOW",
	notes: "LOW",
	modality: "LOW"
};
function changePriority(field) {
	return CHANGE_PRIORITY_MAP[field] ?? "LOW";
}
function shouldAlertForChange(priority, minPriority) {
	if (!minPriority) return true;
	const rank = {
		HIGH: 3,
		MEDIUM: 2,
		LOW: 1
	};
	return rank[priority] >= rank[minPriority];
}
function leadClass(hours) {
	if (hours == null || !Number.isFinite(hours)) return null;
	if (hours > 6) return "EARLY";
	if (hours < -6) return "LATE";
	return "SAME_WINDOW";
}
function ruleMatchesEvent(rule, input) {
	if (!rule.event_types.includes(input.eventType) && !rule.event_types.includes("*")) return false;
	const f = rule.filters;
	if (f.uf && f.uf !== input.uf) return false;
	if (f.municipality && f.municipality !== input.municipality) return false;
	if (f.organization_id && f.organization_id !== input.organizationId) return false;
	if (f.catalog_code && f.catalog_code !== input.catalogCode) return false;
	if (f.horizon && f.horizon !== input.horizon) return false;
	if (f.early_only && input.horizon !== "EARLY" && input.earlyKind !== "EARLY_MATCHED") return false;
	if (f.min_value != null && (input.estimatedValue == null || input.estimatedValue < f.min_value)) return false;
	if (f.keyword) {
		const needle = f.keyword.toLowerCase();
		if (!`${input.object ?? ""} ${input.organizationName ?? ""}`.toLowerCase().includes(needle)) return false;
	}
	return true;
}
function alertEventKey(args) {
	return sha256([
		args.ruleId,
		args.entityType,
		args.entityId,
		args.eventType,
		args.distinguishing ?? ""
	].join("|"));
}
function explainAlertReason(args) {
	const because = [`regra “${args.ruleName}”`, `evento ${args.eventType}`];
	if (args.filters.catalog_code) because.push(`CATMAT/CATSER ${args.filters.catalog_code}`);
	if (args.filters.uf) because.push(`UF ${args.filters.uf}`);
	if (args.filters.keyword) because.push(`termo “${args.filters.keyword}”`);
	if (args.filters.min_value) because.push(`valor ≥ ${args.filters.min_value}`);
	if (args.filters.early_only) because.push("oportunidade antecipada");
	if (args.extra) {
		for (const [key, value] of Object.entries(args.extra)) if (value != null && value !== "") because.push(`${key}: ${value}`);
	}
	return {
		because,
		filters: args.filters,
		event_type: args.eventType,
		text: `Você recebeu este alerta porque: ${because.join("; ")}.`
	};
}
var ATTENTION_WEIGHTS_V1 = {
	freshness: .16,
	lead_time: .14,
	deadline_urgency: .14,
	organization_recurrence: .12,
	category_relevance: .08,
	planning_confirmation: .12,
	estimated_value: .08,
	data_quality: .1,
	source_confidence: .06
};
function clamp01$1(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(1, value));
}
function freshnessComponent(firstSeenAt, now) {
	if (!firstSeenAt) return .2;
	const hours = (new Date(now).getTime() - new Date(firstSeenAt).getTime()) / 36e5;
	if (!Number.isFinite(hours) || hours < 0) return .2;
	if (hours <= 6) return 1;
	if (hours <= 24) return .85;
	if (hours <= 72) return .65;
	if (hours <= 168) return .4;
	return .15;
}
function deadlineUrgencyComponent(deadline, now) {
	if (!deadline) return .2;
	const hours = (new Date(deadline).getTime() - new Date(now).getTime()) / 36e5;
	if (!Number.isFinite(hours)) return .2;
	if (hours < 0) return .05;
	if (hours <= 24) return 1;
	if (hours <= 72) return .85;
	if (hours <= 168) return .6;
	if (hours <= 336) return .4;
	return .2;
}
function leadAttentionComponent(hours) {
	if (hours == null || !Number.isFinite(hours) || hours <= 0) return .25;
	return clamp01$1(hours / 48);
}
function valueComponent(value) {
	if (value == null || !Number.isFinite(value) || value <= 0) return .15;
	if (value >= 1e6) return 1;
	if (value >= 1e5) return .7;
	if (value >= 2e4) return .45;
	return .25;
}
function dataQualityFromGaps(args) {
	let score = .2;
	if (args.hasCnpj) score += .3;
	if (args.hasValue) score += .2;
	if (args.hasDeadline) score += .2;
	if (args.matchAmbiguous) score -= .25;
	return clamp01$1(score);
}
function explainableAttentionScore(input, dataConfidence = input.data_quality, weights = ATTENTION_WEIGHTS_V1) {
	const components = {};
	const weighted = {};
	let sum = 0;
	Object.keys(ATTENTION_WEIGHTS_V1).forEach((key) => {
		const value = clamp01$1(input[key]);
		components[key] = value;
		const w = weights[key] ?? 0;
		weighted[key] = Math.round(value * w * 1e4) / 1e4;
		sum += value * w;
	});
	const final_score = Math.round(sum * 1e3) / 10;
	const top = Object.keys(components).map((key) => ({
		key,
		value: weighted[key]
	})).sort((a, b) => b.value - a.value).slice(0, 3).map((row) => `${row.key} ${row.value.toFixed(3)}`).join(", ");
	return {
		score_version: "v1",
		components,
		weights: { ...weights },
		weighted,
		final_score,
		data_confidence: clamp01$1(dataConfidence),
		rationale: `v1 de atenção estrutural, não probabilidade de vitória. Maiores contribuições: ${top}.`
	};
}
/**
* Deterministic object normalization for grouping — never replaces the official text.
*/
var NOISE = [
	"contratacao de empresa para",
	"contratacao de",
	"aquisicao de",
	"aquisicao",
	"contratacao",
	"pregao eletronico para",
	"pregao eletronico",
	"pregao",
	"sistema de registro de precos",
	"registro de precos",
	"srp",
	"objeto",
	"edital",
	"processo administrativo",
	"processo",
	"visando a",
	"visando",
	"para atendimento",
	"destinado a",
	"destinados a",
	"conforme",
	"nº",
	"n°",
	"no."
];
var PHRASE_SYNONYMS = [
	[/aparelho(?:s)? de academia/g, "equipamento_esportivo"],
	[/equipamento(?:s)? de academia/g, "equipamento_esportivo"],
	[/material(?:is)? esportivo(?:s)?/g, "equipamento_esportivo"],
	[/equipamento(?:s)? esportivo(?:s)?/g, "equipamento_esportivo"],
	[/kit(?:s)? esportivo(?:s)?/g, "equipamento_esportivo"],
	[/\bacademia\b/g, "equipamento_esportivo"],
	[/merenda escolar/g, "alimentacao_escolar"],
	[/\bmerenda\b/g, "alimentacao_escolar"],
	[/generos alimenticio(?:s)?/g, "alimentacao_escolar"],
	[/alimentacao escolar/g, "alimentacao_escolar"],
	[/\bdiesel\b/g, "combustivel"],
	[/\bgasolina\b/g, "combustivel"],
	[/combustive(?:l|is)/g, "combustivel"]
];
function stripAccents(value) {
	return value.normalize("NFD").replace(/\p{M}/gu, "");
}
function compactText(value) {
	return stripAccents(value ?? "").toLowerCase().replace(/[^a-z0-9_\s]/g, " ").replace(/\s+/g, " ").trim();
}
function normalizeObject(raw) {
	const original = (raw ?? "").trim();
	let text = compactText(original);
	for (const phrase of NOISE) text = text.replaceAll(phrase, " ");
	text = text.replace(/\b(19|20)\d{2}\b/g, " ").replace(/\b\d+\b/g, " ");
	text = text.replace(/\s+/g, " ").trim();
	let bucket = null;
	for (const [pattern, replacement] of PHRASE_SYNONYMS) {
		pattern.lastIndex = 0;
		if (pattern.test(text)) {
			bucket = replacement;
			pattern.lastIndex = 0;
			text = text.replace(pattern, replacement);
		}
		pattern.lastIndex = 0;
	}
	text = text.replace(/\s+/g, " ").trim();
	const tokens = text.split(" ").filter((token) => token.length > 2);
	return {
		raw: original,
		normalized: text,
		tokens,
		synonym_bucket: bucket
	};
}
function tokenJaccard(left, right) {
	const a = new Set(left);
	const b = new Set(right);
	if (a.size === 0 || b.size === 0) return 0;
	let inter = 0;
	for (const token of a) if (b.has(token)) inter += 1;
	return inter / (a.size + b.size - inter);
}
function objectsGroupTogether(a, b) {
	if (a.synonym_bucket && b.synonym_bucket) return a.synonym_bucket === b.synonym_bucket;
	return tokenJaccard(a.tokens, b.tokens) >= .55;
}
function recurrenceGroupKey(args) {
	if (args.catalogCode && args.catalogCode.trim()) return `${args.organizationId}|CAT:${args.catalogCode.trim()}`;
	const bucket = args.normalized.synonym_bucket ?? args.normalized.normalized;
	return `${args.organizationId}|OBJ:${bucket}`;
}
function digits(value) {
	return (value ?? "").replace(/\D/g, "");
}
function valueClose(a, b) {
	if (a == null || b == null || a <= 0 || b <= 0) return false;
	return Math.min(a, b) / Math.max(a, b) >= .6;
}
/** CONFIRMED exige id oficial PNCP ou CNPJ+ano+código de catálogo. Texto nunca confirma. */
function hasOfficialPlanningIdentifier(args) {
	const fields = new Set(args.matched_fields);
	if (args.match_method === "official_item_id" || fields.has("numero_item_pncp")) return true;
	return args.match_method === "cnpj_year_catalog" && fields.has("catalog_code") && fields.has("organization_cnpj") && fields.has("year");
}
/**
* Reclassifica CONFIRMED sem identificador oficial.
* CNPJ+ano+valor+tópico → PROBABLE. Resto → REVIEW_REQUIRED.
* Objetivo: precisão de CONFIRMED, não quantidade de matches.
*/
function hardenConfirmedLink(link) {
	if (link.status !== "CONFIRMED") return link;
	if (hasOfficialPlanningIdentifier(link)) return link;
	const fields = new Set(link.matched_fields);
	if (fields.has("organization_cnpj") && fields.has("year") && fields.has("value")) return {
		...link,
		status: "PROBABLE",
		match_method: "demoted_from_confirmed_to_probable",
		match_score: Math.min(link.match_score, 88)
	};
	return {
		...link,
		status: "REVIEW_REQUIRED",
		match_method: "demoted_from_confirmed_no_official_id",
		match_score: Math.min(link.match_score, 55)
	};
}
function linkPlanningToProcurement(plan, procurements) {
	const planCnpj = digits(plan.organization_cnpj);
	const planNorm = normalizeObject(plan.object);
	let best = {
		planning_id: plan.id,
		procurement_id: null,
		status: "UNMATCHED",
		match_method: "none",
		match_score: 0,
		matched_fields: []
	};
	for (const proc of procurements) {
		const matched = [];
		const procCnpj = digits(proc.organization_cnpj);
		const procNorm = normalizeObject(proc.object);
		if ((plan.numero_item_pncp && proc.numero_item_pncp && plan.numero_item_pncp === proc.numero_item_pncp || plan.item_number && proc.numero_item_pncp && plan.item_number === proc.numero_item_pncp) && planCnpj && planCnpj === procCnpj) {
			matched.push("numero_item_pncp", "organization_cnpj");
			return hardenConfirmedLink({
				planning_id: plan.id,
				procurement_id: proc.id,
				status: "CONFIRMED",
				match_method: "official_item_id",
				match_score: 100,
				matched_fields: matched
			});
		}
		const sameCnpj = planCnpj.length === 14 && planCnpj === procCnpj;
		const sameYear = plan.year != null && plan.year === proc.year;
		const sameCatalog = Boolean(plan.catalog_code) && plan.catalog_code === proc.catalog_code;
		const objectScore = tokenJaccard(planNorm.tokens, procNorm.tokens);
		const sameTopic = objectsGroupTogether(planNorm, procNorm);
		const sameValue = valueClose(plan.estimated_value_num, proc.estimated_value_num);
		if (sameCnpj && sameYear && sameCatalog) {
			matched.push("organization_cnpj", "year", "catalog_code");
			if (96 > best.match_score) best = {
				planning_id: plan.id,
				procurement_id: proc.id,
				status: "CONFIRMED",
				match_method: "cnpj_year_catalog",
				match_score: 96,
				matched_fields: matched
			};
			continue;
		}
		if (sameCnpj && sameYear && sameValue && (sameCatalog || sameTopic || objectScore >= .7)) {
			const fields = [
				"organization_cnpj",
				"year",
				"value"
			];
			if (sameCatalog) fields.push("catalog_code");
			else fields.push("object");
			if (88 > best.match_score) best = {
				planning_id: plan.id,
				procurement_id: proc.id,
				status: "PROBABLE",
				match_method: sameTopic ? "cnpj_year_synonym_value" : "cnpj_year_object_value",
				match_score: 88,
				matched_fields: fields
			};
			continue;
		}
		if (sameCnpj && (sameCatalog || objectScore >= .6 || sameTopic)) {
			if (55 > best.match_score) best = {
				planning_id: plan.id,
				procurement_id: proc.id,
				status: "REVIEW_REQUIRED",
				match_method: "cnpj_category",
				match_score: 55,
				matched_fields: ["organization_cnpj", sameCatalog ? "catalog_code" : "object"]
			};
		}
	}
	return hardenConfirmedLink(best);
}
function planningConversion(args) {
	const planned = Math.max(0, args.planned);
	const converted = Math.max(0, args.converted);
	return {
		planned_items: planned,
		converted_to_procurement: converted,
		not_yet_converted: Math.max(0, planned - converted),
		conversion_rate: planned === 0 ? 0 : converted / planned
	};
}
function clamp01(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(1, value));
}
function median(values) {
	const sorted = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
	if (sorted.length === 0) return null;
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) return Math.round((sorted[mid - 1] + sorted[mid]) / 2 * 100) / 100;
	return sorted[mid];
}
function mean(values) {
	if (values.length === 0) return null;
	return values.reduce((a, b) => a + b, 0) / values.length;
}
function stdev(values) {
	if (values.length < 2) return null;
	const avg = mean(values);
	if (avg == null) return null;
	const varSum = values.reduce((acc, n) => acc + (n - avg) ** 2, 0) / (values.length - 1);
	return Math.sqrt(varSum);
}
function daysBetween(a, b) {
	return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 864e5;
}
function filterWindow(purchases, now, windowMonths) {
	const end = new Date(now).getTime();
	const start = end - windowMonths * 30.44 * 864e5;
	return purchases.filter((row) => {
		const t = new Date(row.occurred_at).getTime();
		return Number.isFinite(t) && t >= start && t <= end;
	});
}
function computeRecurrence(args) {
	const now = args.now ?? "2026-09-14T20:00:00.000Z";
	const windowMonths = args.windowMonths ?? 36;
	const inWindow = filterWindow(args.purchases, now, windowMonths).sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());
	const empty = (level, rationale) => ({
		model_version: "v1",
		signal_level: level,
		purchase_count: inWindow.length,
		median_interval_days: null,
		last_purchase_at: inWindow.at(-1)?.occurred_at ?? null,
		average_value: null,
		median_value: null,
		seasonality: null,
		confidence: 0,
		sample_size: inWindow.length,
		evidence_procurement_ids: inWindow.map((row) => row.canonical_id),
		rationale,
		claim_kind: "INFERENCIA"
	});
	if (inWindow.length <= 1) return empty("NONE", "Uma única compra na janela não gera sinal de recorrência.");
	const seed = inWindow[0].normalized;
	const grouped = inWindow.filter((row) => objectsGroupTogether(seed, row.normalized));
	if (grouped.length < inWindow.length && grouped.length <= 1) return empty("NONE", "Objetos distintos demais para agrupar automaticamente.");
	const series = grouped.length >= 2 ? grouped : inWindow;
	if (series.length <= 1) return empty("NONE", "Uma única compra na janela não gera sinal de recorrência.");
	const intervals = [];
	for (let i = 1; i < series.length; i += 1) intervals.push(daysBetween(series[i - 1].occurred_at, series[i].occurred_at));
	const medianInterval = median(intervals);
	const avgInterval = mean(intervals);
	const spread = stdev(intervals);
	const cv = avgInterval && spread != null && avgInterval > 0 ? spread / avgInterval : 1;
	const values = series.map((row) => row.value).filter((n) => n != null && Number.isFinite(n));
	const last = series[series.length - 1];
	let signal = "LOW";
	if (series.length === 2 && (medianInterval ?? 0) > 540) signal = "LOW";
	else if (series.length >= 5 && cv < .35) signal = "HIGH";
	else if (series.length >= 4 && cv < .4) signal = "HIGH";
	else if (series.length >= 3 && cv < .5) signal = "MEDIUM";
	else signal = "LOW";
	const confidence = clamp01(.25 * Math.min(1, series.length / 5) + .45 * (1 - Math.min(1, cv)) + .3 * (medianInterval ? 1 : 0));
	const seasonality = medianInterval != null && medianInterval >= 150 && medianInterval <= 210 ? "semestral_aproximado" : medianInterval != null && medianInterval >= 300 && medianInterval <= 400 ? "anual_aproximado" : null;
	const rationale = `Sinal ${signal.toLowerCase()} porque o órgão publicou ${series.length} processos semelhantes nos últimos ${windowMonths} meses, com intervalo mediano de ${Math.round(medianInterval ?? 0)} dias. Isso é inferência histórica, não previsão de nova licitação.`;
	return {
		model_version: "v1",
		signal_level: signal,
		purchase_count: series.length,
		median_interval_days: medianInterval,
		last_purchase_at: last.occurred_at,
		average_value: mean(values),
		median_value: median(values),
		seasonality,
		confidence: Math.round(confidence * 100) / 100,
		sample_size: series.length,
		evidence_procurement_ids: series.map((row) => row.canonical_id),
		rationale,
		claim_kind: "INFERENCIA"
	};
}
//#endregion
export { recurrenceGroupKey as _, dataQualityFromGaps as a, tokenJaccard as b, explainableAttentionScore as c, leadAttentionComponent as d, leadClass as f, planningConversion as g, objectsGroupTogether as h, computeRecurrence as i, freshnessComponent as l, normalizeObject as m, alertEventKey as n, deadlineUrgencyComponent as o, linkPlanningToProcurement as p, changePriority as r, explainAlertReason as s, ATTENTION_WEIGHTS_V1 as t, hardenConfirmedLink as u, ruleMatchesEvent as v, valueComponent as x, shouldAlertForChange as y };
