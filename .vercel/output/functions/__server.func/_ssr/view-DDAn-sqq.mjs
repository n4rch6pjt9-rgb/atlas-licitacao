import { S as TECHNOLOGY_FAMILIES, d as EVIDENCE_LEVELS, m as FUNCTIONAL_FAMILIES, o as CLASSIFICATION_STATES, s as CONNECTOR_TYPES } from "./types-DkMyNmeu.mjs";
import { n as claimFromEvidence } from "./rolldown-runtime-D7D4PA-g.mjs";
import { t as asEnum } from "./json-DMlCsaaG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/view-DDAn-sqq.js
function asTechFamily(value) {
	return asEnum(value, TECHNOLOGY_FAMILIES, "UNKNOWN");
}
function asFunctionalFamily(value) {
	return asEnum(value, FUNCTIONAL_FAMILIES, "UNKNOWN");
}
function asEvidence(value) {
	return asEnum(value, EVIDENCE_LEVELS, "UNKNOWN");
}
function asConnector(value) {
	return asEnum(value, CONNECTOR_TYPES, "NONE");
}
function asState(value) {
	return asEnum(value, CLASSIFICATION_STATES, "DISCOVERED");
}
function sourceClaim(source) {
	return claimFromEvidence(asEvidence(source.vendor_evidence_level));
}
function matchesFilters(source, filters) {
	const q = filters.q?.trim().toLowerCase();
	if (q) {
		if (!`${source.name} ${source.slug} ${source.base_url ?? ""} ${source.jurisdiction_name ?? ""}`.toLowerCase().includes(q)) return false;
	}
	if (filters.uf && source.jurisdiction_uf !== filters.uf) return false;
	if (filters.family && source.technology_family !== filters.family) return false;
	if (filters.evidence && source.vendor_evidence_level !== filters.evidence) return false;
	if (filters.state && source.classification_state !== filters.state) return false;
	return true;
}
function discoverMessage(result) {
	if (!result || typeof result !== "object") return "Descoberta concluída.";
	const rec = result;
	if (typeof rec.error === "string" && rec.error) {
		if (/erro de configuração/i.test(rec.error) || /HTTP 400/.test(rec.error)) return rec.error;
		return rec.error;
	}
	if (typeof rec.message === "string" && rec.message) return rec.message;
	if (typeof rec.detail === "string" && rec.detail) return rec.detail;
	return "Descoberta concluída.";
}
function fingerprintMessage(result) {
	if (result.error) return result.error;
	const family = result.technology_family ?? result.candidate_family ?? "UNKNOWN";
	return `${result.status}: ${family} · score ${result.score}`;
}
//#endregion
export { asTechFamily as a, matchesFilters as c, asState as i, sourceClaim as l, asEvidence as n, discoverMessage as o, asFunctionalFamily as r, fingerprintMessage as s, asConnector as t };
