//#region node_modules/.nitro/vite/services/ssr/assets/coverage-h_nbs-Bf.js
/**
* Documented, configurable weights for integration_priority_score.
* Sum = 1. Calibrate empirically; do not scatter magic numbers in UI.
*/
var PRIORITY_WEIGHTS = {
	number_verified_entities: .22,
	estimated_procurement_volume: .18,
	current_pncp_gap: .22,
	technical_reuse_probability: .16,
	public_access_quality: .1,
	adapter_reuse: .08,
	historical_depth: .04
};
var DEFAULT_COVERAGE_CONFIG = {
	local_only_provisional_hours: 6,
	local_only_confirmed_hours: 168,
	match_confirmed_min_score: 90,
	recheck_hours: [
		1,
		6,
		24,
		72,
		168
	]
};
function clamp01(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(1, value));
}
function integrationPriorityScore(input, weights = PRIORITY_WEIGHTS) {
	let sum = 0;
	Object.keys(PRIORITY_WEIGHTS).forEach((key) => {
		sum += clamp01(input[key]) * (weights[key] ?? 0);
	});
	return Math.round(sum * 1e3) / 1e3;
}
function classifyLocalOnly(args) {
	if (args.matched) return "MATCHED";
	const hours = (new Date(args.now ?? Date.now()).getTime() - new Date(args.firstSeenAt).getTime()) / 36e5;
	const config = args.config ?? DEFAULT_COVERAGE_CONFIG;
	if (hours < config.local_only_provisional_hours) return "PENDING_PNCP_MATCH";
	if (hours < config.local_only_confirmed_hours) return "LOCAL_ONLY_PROVISIONAL";
	return "LOCAL_ONLY_CONFIRMED";
}
/** Opportunity early_kind uses PENDING_MATCH; coverage local-only keeps PENDING_PNCP_MATCH. */
function toOpportunityEarlyKind(localOnlyState) {
	if (!localOnlyState || localOnlyState === "MATCHED") return null;
	if (localOnlyState === "PENDING_PNCP_MATCH") return "PENDING_MATCH";
	if (localOnlyState === "EARLY_MATCHED" || localOnlyState === "LOCAL_ONLY_PROVISIONAL" || localOnlyState === "LOCAL_ONLY_CONFIRMED" || localOnlyState === "PENDING_MATCH") return localOnlyState;
	return null;
}
function leadTimeHours(localFirstSeenAt, pncpFirstSeenAt) {
	const local = new Date(localFirstSeenAt).getTime();
	const pncp = new Date(pncpFirstSeenAt).getTime();
	return Math.round((pncp - local) / 36e5 * 100) / 100;
}
function percentile(values, p) {
	const sorted = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
	if (sorted.length === 0) return null;
	if (p <= 0) return sorted[0];
	if (p >= 100) return sorted[sorted.length - 1];
	const idx = p / 100 * (sorted.length - 1);
	const lo = Math.floor(idx);
	const hi = Math.ceil(idx);
	if (lo === hi) return sorted[lo];
	const w = idx - lo;
	return Math.round((sorted[lo] * (1 - w) + sorted[hi] * w) * 100) / 100;
}
function recordOverlap(args) {
	const total = Math.max(0, args.total_local_records);
	return {
		...args,
		pncp_overlap_ratio: total === 0 ? 0 : args.matched_pncp_records / total,
		comprasgov_overlap_ratio: total === 0 ? 0 : args.matched_comprasgov_records / total
	};
}
function compareProcurementFields(sourceAId, a, sourceBId, b) {
	const fields = [
		"object",
		"opening_at",
		"status",
		"modality",
		"estimated_value"
	];
	const out = [];
	for (const field of fields) {
		const left = (a[field] ?? "").trim();
		const right = (b[field] ?? "").trim();
		if (!left || !right) continue;
		if (left !== right) out.push({
			field,
			source_a: sourceAId,
			value_a: left,
			source_b: sourceBId,
			value_b: right
		});
	}
	return out;
}
function nextRecheckAt(firstSeenAt, now, cadencesHours = DEFAULT_COVERAGE_CONFIG.recheck_hours) {
	const first = new Date(firstSeenAt).getTime();
	const elapsed = (new Date(now ?? Date.now()).getTime() - first) / 36e5;
	const next = cadencesHours.find((h) => h > elapsed);
	if (next === void 0) return null;
	return new Date(first + next * 36e5).toISOString();
}
//#endregion
export { leadTimeHours as a, recordOverlap as c, integrationPriorityScore as i, toOpportunityEarlyKind as l, classifyLocalOnly as n, nextRecheckAt as o, compareProcurementFields as r, percentile as s, DEFAULT_COVERAGE_CONFIG as t };
