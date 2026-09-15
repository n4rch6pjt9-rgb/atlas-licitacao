import { C as VENDOR_FAMILIES, S as TECHNOLOGY_FAMILIES, b as PAGINATION_TYPES, d as EVIDENCE_LEVELS, f as EVIDENCE_TYPES, g as JURISDICTION_TYPES, h as HEALTH_STATES, n as ALERT_TYPES, o as CLASSIFICATION_STATES, p as FRAMEWORK_FAMILIES, r as CAPABILITIES, s as CONNECTOR_TYPES, t as ACCESS_TYPES, u as ENDPOINT_TYPES, y as OBSERVATION_TYPES } from "./types-DkMyNmeu.mjs";
import { n as claimFromEvidence, t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { n as asJsonObject, t as asEnum } from "./json-DMlCsaaG.mjs";
import { a as toPublicPncpUrl, i as pncpEditalUrl } from "./pncp-url-CkM9bQPG.mjs";
import { n as pickReuseFamily, r as schemaSimilarity, t as buildFamilyCandidates } from "./family-candidates-Dniw2-34.mjs";
import { r as schemaFingerprint } from "./schema-fingerprint-49fkWjyh.mjs";
import { randomUUID } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/queries.server-B9mr7TW7.js
function bySource(history, sourceSystemId) {
	return history.filter((row) => row.source_system_id === sourceSystemId);
}
function samePlatformIdentity(current, next) {
	return current.technology_family === next.technology_family && (current.vendor_name ?? null) === (next.vendor_name ?? null) && (current.product_name ?? null) === (next.product_name ?? null);
}
function currentPlatform(history, sourceSystemId) {
	const open = (sourceSystemId ? bySource(history, sourceSystemId) : history).filter((row) => row.valid_to === null);
	if (open.length === 0) return null;
	return [...open].sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0];
}
/**
* Vendor / family change never overwrites a past row.
* Close the open interval and append a new one. 2015 Paradigma and 2026
* sistema próprio can both be true.
*/
function applyPlatformTransition(history, transition, nextId = () => randomUUID()) {
	const snapshot = history.map((row) => ({ ...row }));
	const current = currentPlatform(snapshot, transition.source_system_id);
	if (current && samePlatformIdentity(current, transition)) return {
		history: snapshot,
		changed: false,
		closed: null,
		created: null
	};
	const closed = current ? {
		...current,
		valid_to: transition.observed_at
	} : null;
	const created = {
		id: nextId(),
		source_system_id: transition.source_system_id,
		technology_family: transition.technology_family,
		vendor_name: transition.vendor_name,
		product_name: transition.product_name,
		valid_from: transition.observed_at,
		valid_to: null,
		evidence_id: transition.evidence_id,
		confidence: transition.confidence
	};
	const next = snapshot.map((row) => closed && row.id === closed.id ? closed : row);
	next.push(created);
	return {
		history: next,
		changed: true,
		closed,
		created
	};
}
function compareSchemas(left, right) {
	const similar = schemaSimilarity(left.field_paths, right.field_paths);
	const same_hash = left.schema_hash === right.schema_hash;
	return {
		left_id: left.source_system_id,
		right_id: right.source_system_id,
		left_hash: left.schema_hash,
		right_hash: right.schema_hash,
		jaccard: similar.jaccard,
		same_hash,
		claim_kind: same_hash ? "FATO_VERIFICADO" : similar.jaccard >= .6 ? "INFERENCIA" : "PENDENTE_DE_VALIDACAO",
		note: same_hash ? "Hash idêntico — mesmo contrato JSON observado. Não prova fornecedor." : similar.jaccard >= .6 ? "Schemas próximos. Similaridade técnica ≠ vendor comprovado." : "Schemas distintos."
	};
}
function fingerprintPayload(source_system_id, payload) {
	const result = schemaFingerprint(payload);
	return {
		source_system_id,
		schema_hash: result.schema_hash,
		field_paths: result.field_paths
	};
}
var queries_server_exports = /* @__PURE__ */ __exportAll({
	applyClassificationToSource: () => applyClassificationToSource,
	capabilityMatrix: () => capabilityMatrix,
	getSourceById: () => getSourceById,
	getSourceDetail: () => getSourceDetail,
	insertAlert: () => insertAlert,
	insertFingerprintRun: () => insertFingerprintRun,
	insertObservations: () => insertObservations,
	insertRegisteredSource: () => insertRegisteredSource,
	insertSourceRecord: () => insertSourceRecord,
	listAlerts: () => listAlerts,
	listCensusRows: () => listCensusRows,
	listDiscoveryChannels: () => listDiscoveryChannels,
	listFamilies: () => listFamilies,
	listFamilyCandidates: () => listFamilyCandidates,
	listJurisdictions: () => listJurisdictions,
	listObservationsForSource: () => listObservationsForSource,
	listSignatures: () => listSignatures,
	listSources: () => listSources,
	loadConnectorConfig: () => loadConnectorConfig,
	loadEvidenceInputs: () => loadEvidenceInputs,
	metrics: () => metrics,
	milestone3Metrics: () => milestone3Metrics,
	upsertSourceCapability: () => upsertSourceCapability
});
function jsonSafe(value) {
	return JSON.parse(JSON.stringify(value, (_key, inner) => {
		if (typeof inner === "bigint") return Number(inner);
		if (inner instanceof Date) return inner.toISOString();
		return inner;
	}));
}
function toJson(value) {
	if (value === void 0) return void 0;
	return jsonSafe(value);
}
function iso(value) {
	if (value === null || value === void 0) return null;
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") return value;
	return String(value);
}
function num(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "bigint") return Number(value);
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}
function bool(value) {
	return value === true || value === "t" || value === "true";
}
function mapSource(row) {
	return {
		id: String(row.id),
		name: String(row.name ?? ""),
		slug: String(row.slug ?? ""),
		base_url: row.base_url == null ? null : String(row.base_url),
		jurisdiction_id: String(row.jurisdiction_id ?? ""),
		jurisdiction_name: row.jurisdiction_name == null ? null : String(row.jurisdiction_name),
		jurisdiction_uf: row.jurisdiction_uf == null ? null : String(row.jurisdiction_uf),
		technology_family: row.technology_family == null ? null : String(row.technology_family),
		functional_family: row.functional_family == null ? null : String(row.functional_family),
		vendor_evidence_level: row.vendor_evidence_level == null ? null : String(row.vendor_evidence_level),
		vendor_confidence: row.vendor_confidence == null ? null : num(row.vendor_confidence),
		connector_type: row.connector_type == null ? null : String(row.connector_type),
		connector_version: row.connector_version == null ? null : String(row.connector_version),
		classification_state: row.classification_state == null ? null : String(row.classification_state),
		vendor_name: row.vendor_name == null ? null : String(row.vendor_name),
		product_name: row.product_name == null ? null : String(row.product_name),
		public_access: bool(row.public_access),
		active: bool(row.active),
		pncp_overlap: bool(row.pncp_overlap),
		comprasgov_overlap: bool(row.comprasgov_overlap),
		discovery_strategy: row.discovery_strategy == null ? null : String(row.discovery_strategy),
		first_seen_at: iso(row.first_seen_at),
		last_verified_at: iso(row.last_verified_at),
		notes: row.notes == null ? null : String(row.notes)
	};
}
var SOURCE_SELECT = `
  select
    s.id, s.jurisdiction_id, s.name, s.slug, s.base_url,
    s.functional_family, s.technology_family, s.vendor_name, s.product_name,
    s.vendor_evidence_level, s.vendor_confidence, s.public_access, s.active,
    s.pncp_overlap, s.comprasgov_overlap, s.discovery_strategy, s.connector_type,
    s.connector_version, s.classification_state, s.first_seen_at, s.last_verified_at,
    s.notes,
    j.name as jurisdiction_name, j.uf as jurisdiction_uf
  from source_system s
  left join jurisdiction j on j.id = s.jurisdiction_id
`;
async function listSources(sql, filter) {
	const clauses = [];
	const params = [];
	if (filter?.q) {
		params.push(`%${filter.q.toLowerCase()}%`);
		clauses.push(`(lower(s.name) like $${params.length} or lower(coalesce(s.base_url, '')) like $${params.length} or lower(s.slug) like $${params.length})`);
	}
	if (filter?.uf) {
		params.push(filter.uf);
		clauses.push(`j.uf = $${params.length}`);
	}
	if (filter?.family) {
		params.push(filter.family);
		clauses.push(`s.technology_family = $${params.length}`);
	}
	if (filter?.evidence) {
		params.push(filter.evidence);
		clauses.push(`s.vendor_evidence_level = $${params.length}`);
	}
	if (filter?.state) {
		params.push(filter.state);
		clauses.push(`s.classification_state = $${params.length}`);
	}
	const where = clauses.length > 0 ? ` where ${clauses.join(" and ")}` : "";
	return jsonSafe((await sql.query(`${SOURCE_SELECT}${where} order by j.uf nulls first, s.name`, params)).map(mapSource));
}
async function getSourceById(sql, id) {
	const row = (await sql.query(`${SOURCE_SELECT} where s.id = $1`, [id]))[0];
	return row ? jsonSafe(mapSource(row)) : null;
}
async function getRawSource(sql, id) {
	return (await sql.query(`${SOURCE_SELECT} where s.id = $1`, [id]))[0] ?? null;
}
function capabilitySupportStatus(row) {
	const observed = bool(row.publicly_observed);
	const documented = bool(row.documented);
	const confidence = num(row.confidence);
	if (observed && documented && confidence >= .8) return "SUPPORTED";
	if (observed) return "PARTIAL";
	return "UNKNOWN";
}
function mapCapability(row) {
	const support_status = capabilitySupportStatus(row);
	const evidence = support_status === "SUPPORTED" ? "VERIFIED" : support_status === "PARTIAL" ? "WEAK_INDICATION" : "UNKNOWN";
	return asJsonObject({
		id: String(row.id),
		capability: asEnum(row.capability, CAPABILITIES, "SEARCH"),
		access_type: asEnum(row.access_type, ACCESS_TYPES, "UNKNOWN"),
		endpoint_or_url: row.endpoint_or_url == null ? null : String(row.endpoint_or_url),
		method: row.method == null ? null : String(row.method),
		auth_required: bool(row.auth_required),
		publicly_observed: bool(row.publicly_observed),
		documented: bool(row.documented),
		support_status,
		pagination_type: row.pagination_type ? asEnum(row.pagination_type, PAGINATION_TYPES, "UNKNOWN") : null,
		evidence_level: evidence,
		confidence: num(row.confidence),
		last_verified_at: iso(row.last_verified_at),
		claim_kind: claimFromEvidence(evidence),
		raw_metadata: toJson(row.raw_metadata) ?? null
	});
}
function mapEndpoint(row) {
	return asJsonObject({
		id: String(row.id),
		name: String(row.name ?? ""),
		path: String(row.path ?? ""),
		http_method: String(row.http_method ?? "GET"),
		endpoint_type: asEnum(row.endpoint_type, ENDPOINT_TYPES, "OTHER"),
		public: bool(row.public),
		pagination_type: row.pagination_type ? asEnum(row.pagination_type, PAGINATION_TYPES, "UNKNOWN") : null,
		last_verified_at: iso(row.last_verified_at),
		claim_kind: bool(row.public) ? "FATO_VERIFICADO" : "PENDENTE_DE_VALIDACAO",
		request_schema: toJson(row.request_schema) ?? null,
		response_schema: toJson(row.response_schema) ?? null
	});
}
function mapEvidence(row) {
	const level = asEnum(row.evidence_level, EVIDENCE_LEVELS, "UNKNOWN");
	return asJsonObject({
		id: String(row.id),
		evidence_type: asEnum(row.evidence_type, EVIDENCE_TYPES, "OTHER"),
		evidence_level: level,
		title: String(row.title ?? ""),
		description: row.description == null ? null : String(row.description),
		url: row.url == null ? null : String(row.url),
		observed_value: row.observed_value == null ? null : String(row.observed_value),
		expected_signature: row.expected_signature == null ? null : String(row.expected_signature),
		captured_at: iso(row.captured_at),
		publisher: row.publisher == null ? null : String(row.publisher),
		published_at: iso(row.published_at),
		observed_at: iso(row.observed_at) ?? iso(row.captured_at),
		vendor_name: row.vendor_name == null ? null : String(row.vendor_name),
		product_name: row.product_name == null ? null : String(row.product_name),
		raw_excerpt: row.raw_excerpt == null ? null : String(row.raw_excerpt),
		content_hash: row.content_hash == null ? null : String(row.content_hash),
		claim_kind: claimFromEvidence(level),
		raw_payload: toJson(row.raw_payload) ?? null
	});
}
function mapObservation(row) {
	return asJsonObject({
		id: String(row.id),
		observation_type: asEnum(row.observation_type, OBSERVATION_TYPES, "OTHER"),
		key: String(row.key ?? ""),
		value: String(row.value ?? ""),
		observed_at: iso(row.observed_at),
		source_url: row.source_url == null ? null : String(row.source_url),
		raw_payload: toJson(row.raw_payload) ?? null
	});
}
function mapConnectorConfig(config, source) {
	if (!config) return null;
	return asJsonObject({
		connector_type: asEnum(config.connector_type ?? source.connector_type, CONNECTOR_TYPES, "NONE"),
		base_url: config.base_url == null ? null : String(config.base_url),
		paths: toJson(config.paths_json) ?? null,
		default_params: toJson(config.default_params_json) ?? null,
		headers: toJson(config.headers_json) ?? null,
		pagination: toJson(config.pagination_config) ?? null,
		normalization: toJson(config.normalization_config) ?? null,
		documents: toJson(config.document_config) ?? null,
		enabled: bool(config.enabled),
		version: source.connector_version == null ? null : String(source.connector_version),
		value_classification: config.value_classification == null ? null : String(config.value_classification),
		public_key_semantics: config.public_key_semantics == null ? null : String(config.public_key_semantics),
		public_key_fingerprint: config.public_key_fingerprint == null ? null : String(config.public_key_fingerprint),
		connector_readiness: config.connector_readiness == null ? null : String(config.connector_readiness),
		accept_equals: toJson(config.accept_equals_json) ?? null
	});
}
async function getSourceDetail(sql, id) {
	const raw = await getRawSource(sql, id);
	if (!raw) return null;
	const list = mapSource(raw);
	const [capabilities, endpoints, evidence, observations, runs, history, configs, alerts, relationships, policies] = await Promise.all([
		sql.query(`select * from source_capability where source_system_id = $1 order by capability`, [id]),
		sql.query(`select * from source_endpoint where source_system_id = $1 order by path`, [id]),
		sql.query(`select * from source_evidence where source_system_id = $1 order by captured_at desc`, [id]),
		sql.query(`select * from source_observation where source_system_id = $1 order by observed_at desc`, [id]),
		sql.query(`select * from source_fingerprint_run where source_system_id = $1 order by started_at desc`, [id]),
		sql.query(`select * from source_platform_history where source_system_id = $1 order by valid_from desc`, [id]),
		sql.query(`select * from source_connector_config where source_system_id = $1`, [id]),
		sql.query(`select * from source_alert where source_system_id = $1 order by created_at desc`, [id]),
		sql.query(`select * from source_system_relationship
         where source_system_id = $1 or related_source_system_id = $1`, [id]),
		sql.query(`select * from source_rate_policy where source_system_id = $1`, [id])
	]);
	const fingerprintRows = [];
	for (const run of runs) {
		const matches = await sql.query(`select m.*, sig.key as signature_key, sig.signature_type
       from source_fingerprint_match m
       left join fingerprint_signature sig on sig.id = m.signature_id
       where m.run_id = $1
       order by m.matched desc, m.score desc`, [run.id]);
		const classification = (run.raw_result ?? {}).classification ?? {};
		const claim = classification.claim_kind === "FATO_VERIFICADO" || classification.claim_kind === "INFERENCIA" || classification.claim_kind === "PENDENTE_DE_VALIDACAO" ? classification.claim_kind : "INFERENCIA";
		fingerprintRows.push(asJsonObject({
			id: String(run.id),
			started_at: iso(run.started_at) ?? "",
			completed_at: iso(run.completed_at),
			status: String(run.status ?? ""),
			candidate_family: run.candidate_family ? asEnum(run.candidate_family, TECHNOLOGY_FAMILIES, "UNKNOWN") : null,
			technology_family: classification.technology_family ?? (run.candidate_family ? asEnum(run.candidate_family, TECHNOLOGY_FAMILIES, "UNKNOWN") : null),
			score: run.score == null ? null : num(run.score),
			evidence_count: num(run.evidence_count),
			strong_evidence_count: num(run.strong_evidence_count),
			evidence_level: classification.evidence_level ?? null,
			claim_kind: claim,
			matches: matches.map((match) => ({
				signature_key: String(match.signature_key ?? match.signature_id ?? ""),
				key: String(match.signature_key ?? match.signature_id ?? ""),
				signature_type: match.signature_type == null ? null : String(match.signature_type),
				matched: bool(match.matched),
				score: num(match.score),
				observed_value: match.observed_value == null ? null : String(match.observed_value)
			})),
			raw_result: toJson(run.raw_result) ?? null,
			error: run.error == null ? null : String(run.error)
		}));
	}
	const last = fingerprintRows[0] ?? null;
	const last_run_matches = (last && Array.isArray(last.matches) ? last.matches : []).map((match) => asJsonObject(match));
	const endpointIds = endpoints.map((row) => String(row.id));
	let healthRows = [];
	if (endpointIds.length > 0) {
		const placeholders = endpointIds.map((_, i) => `$${i + 1}`).join(", ");
		healthRows = await sql.query(`select h.*, e.name as endpoint_name, e.path as endpoint_path
       from source_endpoint_health h
       left join source_endpoint e on e.id = h.source_endpoint_id
       where h.source_endpoint_id in (${placeholders})`, endpointIds);
	}
	const health = healthRows.map((row) => {
		const status = asEnum(row.status, HEALTH_STATES, "UNKNOWN");
		return asJsonObject({
			source_endpoint_id: String(row.source_endpoint_id ?? ""),
			name: row.endpoint_name == null ? null : String(row.endpoint_name),
			path: row.endpoint_path == null ? null : String(row.endpoint_path),
			state: status,
			status,
			last_checked_at: iso(row.last_success_at) ?? iso(row.last_failure_at),
			detail: row.http_status != null ? `HTTP ${row.http_status}` : null,
			message: row.http_status != null ? `HTTP ${row.http_status}` : null,
			schema_hash: row.schema_hash == null ? null : String(row.schema_hash),
			latency_ms: row.latency_ms == null ? null : num(row.latency_ms),
			consecutive_failures: num(row.consecutive_failures)
		});
	});
	return jsonSafe({
		...list,
		capabilities: capabilities.map(mapCapability),
		endpoints: endpoints.map(mapEndpoint),
		evidence: evidence.map(mapEvidence),
		observations: observations.map(mapObservation),
		last_run: last,
		last_run_matches,
		history: history.map((row) => {
			const family = asEnum(row.technology_family, TECHNOLOGY_FAMILIES, "UNKNOWN");
			return asJsonObject({
				id: String(row.id),
				technology_family: family,
				vendor_name: row.vendor_name == null ? null : String(row.vendor_name),
				product_name: row.product_name == null ? null : String(row.product_name),
				valid_from: iso(row.valid_from) ?? "",
				valid_to: iso(row.valid_to),
				confidence: num(row.confidence),
				evidence_level: row.confidence != null && num(row.confidence) >= .8 ? "VERIFIED" : "UNKNOWN",
				claim_kind: FRAMEWORK_FAMILIES.has(family) ? "INFERENCIA" : "FATO_VERIFICADO"
			});
		}),
		connector_config: mapConnectorConfig(configs[0], raw),
		health,
		alerts: alerts.map((row) => asJsonObject({
			id: String(row.id),
			alert_type: String(row.alert_type ?? ""),
			message: String(row.message ?? ""),
			severity: row.severity == null ? null : String(row.severity),
			created_at: iso(row.created_at),
			resolved_at: iso(row.resolved_at)
		})),
		relationships: relationships.map((row) => asJsonObject({
			id: String(row.id),
			source_system_id: String(row.source_system_id ?? ""),
			related_source_system_id: String(row.related_source_system_id ?? ""),
			relation_type: String(row.relation_type ?? "")
		})),
		rate_policy: policies[0] ? asJsonObject(policies[0]) : null,
		channels: await listDiscoveryChannels(sql, { sourceId: id })
	});
}
async function listFamilies(sql) {
	return jsonSafe((await sql.query(`select
       coalesce(technology_family, 'UNKNOWN') as family,
       count(*)::int as source_count,
       count(*) filter (where classification_state = 'ADAPTER_READY')::int as adapter_ready_count,
       count(*) filter (where vendor_evidence_level = 'VERIFIED')::int as verified_count,
       string_agg(distinct nullif(connector_type, 'NONE'), ',') as connector_types
     from source_system
     group by coalesce(technology_family, 'UNKNOWN')
     order by source_count desc, family`)).map((row) => {
		const family = asEnum(row.family, TECHNOLOGY_FAMILIES, "UNKNOWN");
		const adapters = String(row.connector_types ?? "").split(",").map((item) => item.trim()).filter(Boolean);
		const adapter = adapters[0] ? asEnum(adapters[0], CONNECTOR_TYPES, "NONE") : null;
		return {
			family,
			count: Number(row.source_count) || 0,
			adapter_ready_count: Number(row.adapter_ready_count) || 0,
			verified_count: Number(row.verified_count) || 0,
			connector_types: adapters,
			adapter: adapter === "NONE" ? null : adapter,
			census_pending: (VENDOR_FAMILIES.has(family) || family === "SISTEMA_PROPRIO") && Number(row.verified_count) === 0
		};
	}));
}
async function capabilityMatrix(sql) {
	const rows = await sql.query(`select s.id as source_id, s.name as source_name, c.capability, c.publicly_observed
     from source_system s
     left join source_capability c on c.source_system_id = s.id
     order by s.name`);
	const bySource = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const sourceId = String(row.source_id);
		let entry = bySource.get(sourceId);
		if (!entry) {
			entry = {
				source_id: sourceId,
				source_name: String(row.source_name),
				cells: {}
			};
			bySource.set(sourceId, entry);
		}
		if (row.capability) {
			const capability = asEnum(row.capability, CAPABILITIES, "SEARCH");
			entry.cells[capability] = { present: bool(row.publicly_observed) };
		}
	}
	return jsonSafe({
		capabilities: [...CAPABILITIES],
		rows: [...bySource.values()]
	});
}
async function metrics(sql) {
	const [totals] = await sql.query(`select
       count(*)::int as sources_total,
       count(*) filter (where vendor_evidence_level = 'VERIFIED')::int as sources_verified,
       count(*) filter (where technology_family is null or technology_family = 'UNKNOWN')::int as sources_unknown_family,
       count(distinct jurisdiction_id)::int as jurisdictions_covered,
       count(*) filter (
         where public_access = true
           and (
             discovery_strategy in ('PUBLIC_JSON_API', 'PUBLIC_REST_API')
             or connector_type = 'GENERIC_JSON'
           )
       )::int as sources_with_public_api
     from source_system`);
	const byFamily = await sql.query(`select coalesce(technology_family, 'UNKNOWN') as family, count(*)::int as count
     from source_system
     group by coalesce(technology_family, 'UNKNOWN')
     order by count desc, family`);
	const [reuse] = await sql.query(`with typed as (
       select connector_type
       from source_system
       where connector_type is not null
         and connector_type <> 'NONE'
         and connector_type <> ''
     ),
     freq as (
       select connector_type, count(*)::int as n
       from typed
       group by connector_type
     )
     select
       (select count(*)::int from typed) as integrated,
       (select coalesce(sum(n), 0)::int from freq where n >= 2) as reused`);
	const integrated = Number(reuse?.integrated ?? 0);
	const reused = Number(reuse?.reused ?? 0);
	return jsonSafe({
		sources_total: Number(totals?.sources_total ?? 0),
		sources_verified: Number(totals?.sources_verified ?? 0),
		sources_unknown_family: Number(totals?.sources_unknown_family ?? 0),
		sources_by_family: byFamily.map((row) => ({
			family: asEnum(row.family, TECHNOLOGY_FAMILIES, "UNKNOWN"),
			count: Number(row.count) || 0
		})),
		adapter_reuse_ratio: integrated === 0 ? 0 : reused / integrated,
		jurisdictions_covered: Number(totals?.jurisdictions_covered ?? 0),
		sources_with_public_api: Number(totals?.sources_with_public_api ?? 0)
	});
}
async function listJurisdictions(sql) {
	return jsonSafe((await sql.query(`select * from jurisdiction where active = true order by type, uf nulls first, name`)).map((row) => ({
		id: String(row.id),
		type: asEnum(row.type, JURISDICTION_TYPES, "OTHER"),
		ibge_code: row.ibge_code == null ? null : String(row.ibge_code),
		uf: row.uf == null ? null : String(row.uf),
		name: String(row.name ?? ""),
		cnpj: row.cnpj == null ? null : String(row.cnpj),
		parent_id: row.parent_id == null ? null : String(row.parent_id),
		active: bool(row.active)
	})));
}
async function listAlerts(sql, filter) {
	const clauses = [];
	const params = [];
	if (filter?.sourceId) {
		params.push(filter.sourceId);
		clauses.push(`a.source_system_id = $${params.length}`);
	}
	if (filter?.unresolvedOnly) clauses.push("a.resolved_at is null");
	const where = clauses.length > 0 ? ` where ${clauses.join(" and ")}` : "";
	return jsonSafe((await sql.query(`select a.*, s.name as source_name
     from source_alert a
     left join source_system s on s.id = a.source_system_id
     ${where}
     order by a.created_at desc
     limit 200`, params)).map((row) => {
		const type = asEnum(row.alert_type, ALERT_TYPES, "NEW_SOURCE_DISCOVERED");
		const fato = type === "SCHEMA_CHANGED" || type === "ENDPOINT_DOWN" || type === "SOURCE_FAMILY_CONFIRMED";
		return {
			id: String(row.id),
			alert_type: type,
			title: String(row.message ?? type),
			message: String(row.message ?? type),
			detail: row.severity == null ? null : String(row.severity),
			source_system_id: row.source_system_id == null ? null : String(row.source_system_id),
			source_name: row.source_name == null ? null : String(row.source_name),
			created_at: iso(row.created_at) ?? "",
			claim_kind: fato ? "FATO_VERIFICADO" : "INFERENCIA"
		};
	}));
}
async function listSignatures(sql) {
	return (await sql.query(`select * from fingerprint_signature`)).map((row) => ({
		id: String(row.id),
		technology_family: row.technology_family,
		signature_type: row.signature_type,
		key: String(row.key),
		pattern: String(row.pattern),
		weight: Number(row.weight) || 0,
		required: bool(row.required),
		description: String(row.description ?? ""),
		source_url: row.source_url == null ? null : String(row.source_url),
		is_vendor_claim: bool(row.is_vendor_claim)
	}));
}
async function listObservationsForSource(sql, sourceId) {
	return (await sql.query(`select observation_type, key, value, source_url, raw_payload
     from source_observation
     where source_system_id = $1`, [sourceId])).map((row) => ({
		observation_type: row.observation_type,
		key: String(row.key),
		value: String(row.value),
		source_url: row.source_url == null ? null : String(row.source_url),
		raw_payload: row.raw_payload
	}));
}
async function insertObservations(sql, sourceId, observations, observedAt = (/* @__PURE__ */ new Date()).toISOString()) {
	const ids = [];
	for (const obs of observations) {
		const id = `obs_${randomUUID()}`;
		await sql.query(`insert into source_observation
        (id, source_system_id, observation_type, key, value, observed_at, source_url, raw_payload)
       values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`, [
			id,
			sourceId,
			obs.observation_type,
			obs.key,
			obs.value,
			observedAt,
			obs.source_url ?? null,
			obs.raw_payload === void 0 ? null : JSON.stringify(obs.raw_payload)
		]);
		ids.push(id);
	}
	return ids;
}
async function insertFingerprintRun(sql, input) {
	await sql.query(`insert into source_fingerprint_run (
       id, source_system_id, started_at, completed_at, status, candidate_family,
       score, evidence_count, strong_evidence_count, raw_result, error
     ) values (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11
     )
     on conflict (id) do update set
       completed_at = excluded.completed_at,
       status = excluded.status,
       candidate_family = excluded.candidate_family,
       score = excluded.score,
       evidence_count = excluded.evidence_count,
       strong_evidence_count = excluded.strong_evidence_count,
       raw_result = excluded.raw_result,
       error = excluded.error`, [
		input.id,
		input.source_system_id,
		input.started_at,
		input.completed_at,
		input.status,
		input.candidate_family,
		input.score,
		input.evidence_count,
		input.strong_evidence_count,
		input.raw_result === void 0 ? null : JSON.stringify(input.raw_result),
		input.error ?? null
	]);
	if (input.matches) for (const match of input.matches) {
		const matchId = match.id ?? `fm_${randomUUID()}`;
		await sql.query(`insert into source_fingerprint_match (
           id, run_id, signature_id, matched, score, observed_value, evidence_id
         ) values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (id) do nothing`, [
			matchId,
			input.id,
			match.signature_id,
			match.matched,
			match.score,
			match.observed_value,
			match.evidence_id ?? null
		]);
	}
	return input.id;
}
async function insertAlert(sql, input) {
	const id = input.id ?? `alert_${randomUUID()}`;
	await sql.query(`insert into source_alert (id, source_system_id, alert_type, severity, message, payload)
     values ($1, $2, $3, $4, $5, $6::jsonb)`, [
		id,
		input.source_system_id,
		input.alert_type,
		input.severity ?? "warning",
		input.message,
		input.payload === void 0 ? null : JSON.stringify(input.payload)
	]);
	return id;
}
async function insertSourceRecord(sql, input) {
	const publicUrl = pncpEditalUrl(input.source_identifier) ?? toPublicPncpUrl(input.source_url) ?? (input.source_system_id === "src_br_pncp" ? null : input.source_url ?? null);
	const id = input.id ?? `rec_${randomUUID()}`;
	return (await sql.query(`insert into source_record (
       id, source_system_id, source_entity_type, source_identifier,
       payload_hash, raw_payload, source_updated_at, source_url, schema_hash,
       fetched_at, ingestion_mode, fetch_method, data_origin, source_channel
     ) values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, now(), $10, $11, $12, $13)
     on conflict (source_system_id, source_entity_type, source_identifier)
     do update set
       last_seen_at = now(),
       fetched_at = now(),
       payload_hash = excluded.payload_hash,
       raw_payload = case
         when source_record.payload_hash = excluded.payload_hash
         then source_record.raw_payload
         else excluded.raw_payload
       end,
       source_updated_at = coalesce(excluded.source_updated_at, source_record.source_updated_at),
       source_url = coalesce(excluded.source_url, source_record.source_url),
       schema_hash = coalesce(excluded.schema_hash, source_record.schema_hash),
       ingestion_mode = case
         when source_record.ingestion_mode = 'LIVE_PUBLIC_API' then source_record.ingestion_mode
         else coalesce(excluded.ingestion_mode, source_record.ingestion_mode)
       end,
       fetch_method = coalesce(excluded.fetch_method, source_record.fetch_method),
       data_origin = case
         when excluded.data_origin = 'LIVE' then 'LIVE'
         when source_record.data_origin in ('LIVE', 'GOLDEN') then source_record.data_origin
         else coalesce(excluded.data_origin, source_record.data_origin)
       end,
       source_channel = coalesce(excluded.source_channel, source_record.source_channel)
     returning id`, [
		id,
		input.source_system_id,
		input.source_entity_type,
		input.source_identifier,
		input.payload_hash,
		JSON.stringify(input.raw_payload ?? null),
		input.source_updated_at ?? null,
		publicUrl,
		input.schema_hash ?? null,
		input.ingestion_mode ?? null,
		input.fetch_method ?? null,
		input.data_origin ?? "UNKNOWN",
		input.source_channel ?? null
	]))[0]?.id ?? id;
}
async function upsertSourceCapability(sql, input) {
	const id = input.id ?? `cap_${randomUUID()}`;
	await sql.query(`insert into source_capability (
       id, source_system_id, capability, access_type, endpoint_or_url, method,
       auth_required, publicly_observed, pagination_type, documented, confidence
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     on conflict (source_system_id, capability)
     do update set
       access_type = coalesce(excluded.access_type, source_capability.access_type),
       endpoint_or_url = coalesce(excluded.endpoint_or_url, source_capability.endpoint_or_url),
       method = coalesce(excluded.method, source_capability.method),
       auth_required = excluded.auth_required,
       publicly_observed = source_capability.publicly_observed or excluded.publicly_observed,
       pagination_type = coalesce(excluded.pagination_type, source_capability.pagination_type),
       documented = source_capability.documented or excluded.documented,
       confidence = coalesce(excluded.confidence, source_capability.confidence),
       last_verified_at = now()`, [
		id,
		input.source_system_id,
		input.capability,
		input.access_type ?? null,
		input.endpoint_or_url ?? null,
		input.method ?? null,
		input.auth_required ?? false,
		input.publicly_observed ?? false,
		input.pagination_type ?? null,
		input.documented ?? false,
		input.confidence ?? null
	]);
	return id;
}
async function loadPlatformHistory(sql, sourceId) {
	return (await sql.query(`select * from source_platform_history where source_system_id = $1 order by valid_from`, [sourceId])).map((row) => ({
		id: String(row.id),
		source_system_id: String(row.source_system_id),
		technology_family: row.technology_family,
		vendor_name: row.vendor_name == null ? null : String(row.vendor_name),
		product_name: row.product_name == null ? null : String(row.product_name),
		valid_from: iso(row.valid_from) ?? (/* @__PURE__ */ new Date()).toISOString(),
		valid_to: iso(row.valid_to),
		evidence_id: row.evidence_id == null ? null : String(row.evidence_id),
		confidence: Number(row.confidence) || 0
	}));
}
async function persistPlatformHistory(sql, sourceId, transition) {
	const result = applyPlatformTransition(await loadPlatformHistory(sql, sourceId), transition);
	if (!result.changed) return { changed: false };
	if (result.closed) await sql.query(`update source_platform_history set valid_to = $2 where id = $1`, [result.closed.id, result.closed.valid_to]);
	if (result.created) {
		const created = result.created;
		await sql.query(`insert into source_platform_history (
         id, source_system_id, technology_family, vendor_name, product_name,
         valid_from, valid_to, evidence_id, confidence
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
			created.id,
			created.source_system_id,
			created.technology_family,
			created.vendor_name,
			created.product_name,
			created.valid_from,
			created.valid_to,
			created.evidence_id,
			created.confidence
		]);
	}
	return { changed: true };
}
function nextClassificationState(current, result) {
	const cur = asEnum(current, CLASSIFICATION_STATES, "DISCOVERED");
	if (cur === "ADAPTER_READY" || cur === "INGESTING" || cur === "DISABLED") return cur;
	if (result.technology_family !== "UNKNOWN" && result.evidence_level !== "UNKNOWN") return "CLASSIFIED";
	if (result.candidate_family !== "UNKNOWN") return "FINGERPRINTED";
	return "OBSERVED";
}
async function applyClassificationToSource(sql, sourceId, result) {
	const raw = await getRawSource(sql, sourceId);
	if (!raw) return {
		updated: false,
		vendor_overwritten: false,
		conflict: result.conflict,
		technology_family: result.technology_family
	};
	const currentFamily = asEnum(raw.technology_family, TECHNOLOGY_FAMILIES, "UNKNOWN");
	const officialVendor = String(raw.vendor_evidence_level) === "VERIFIED" && Boolean(raw.vendor_name);
	let nextFamily = currentFamily;
	let nextVendor = raw.vendor_name == null ? null : String(raw.vendor_name);
	let nextProduct = raw.product_name == null ? null : String(raw.product_name);
	let nextLevel = raw.vendor_evidence_level == null ? null : String(raw.vendor_evidence_level);
	let nextConfidence = raw.vendor_confidence == null ? null : num(raw.vendor_confidence);
	let vendorOverwritten = false;
	const classifiedFamily = result.technology_family;
	const isFramework = FRAMEWORK_FAMILIES.has(classifiedFamily);
	const isVendor = VENDOR_FAMILIES.has(classifiedFamily);
	const vendorStrong = result.evidence_level === "VERIFIED" || result.evidence_level === "STRONG_INDICATION";
	if (result.conflict && officialVendor) await insertAlert(sql, {
		source_system_id: sourceId,
		alert_type: "SOURCE_VENDOR_CONFLICT",
		severity: "high",
		message: result.conflict_reason ?? `Documento oficial indica ${raw.vendor_name}, fingerprint indica ${classifiedFamily}`,
		payload: {
			official_vendor: raw.vendor_name,
			official_family: currentFamily,
			fingerprint_family: classifiedFamily,
			fingerprint_vendor: result.vendor_name
		}
	});
	else if (isVendor && vendorStrong) {
		nextFamily = classifiedFamily;
		if (officialVendor && result.vendor_name && result.vendor_name !== nextVendor) await insertAlert(sql, {
			source_system_id: sourceId,
			alert_type: "SOURCE_VENDOR_CONFLICT",
			severity: "high",
			message: `Fornecedor oficial ${raw.vendor_name} vs fingerprint ${result.vendor_name}`,
			payload: {
				official: raw.vendor_name,
				fingerprint: result.vendor_name
			}
		});
		else {
			nextVendor = result.vendor_name;
			nextProduct = result.product_name;
			nextLevel = result.evidence_level;
			nextConfidence = result.confidence;
			vendorOverwritten = nextVendor !== (raw.vendor_name == null ? null : String(raw.vendor_name));
		}
	} else if (isFramework) {
		if (!VENDOR_FAMILIES.has(currentFamily) || String(raw.vendor_evidence_level) !== "VERIFIED") nextFamily = classifiedFamily;
		if (!officialVendor) {
			nextVendor = null;
			nextProduct = null;
			nextLevel = result.evidence_level;
			nextConfidence = result.confidence;
		}
	} else if (classifiedFamily !== "UNKNOWN" && !isVendor) {
		if (currentFamily === "UNKNOWN" || FRAMEWORK_FAMILIES.has(currentFamily)) nextFamily = classifiedFamily;
		nextLevel = result.evidence_level;
		nextConfidence = result.confidence;
	}
	const state = nextClassificationState(raw.classification_state == null ? null : String(raw.classification_state), result);
	await sql.query(`update source_system set
       technology_family = $2,
       vendor_name = $3,
       product_name = $4,
       vendor_evidence_level = $5,
       vendor_confidence = $6,
       classification_state = $7,
       last_verified_at = now(),
       updated_at = now()
     where id = $1`, [
		sourceId,
		nextFamily,
		nextVendor,
		nextProduct,
		nextLevel,
		nextConfidence,
		state
	]);
	const open = currentPlatform(await loadPlatformHistory(sql, sourceId), sourceId);
	if ((!open || open.technology_family !== nextFamily || (open.vendor_name ?? null) !== (nextVendor ?? null) || (open.product_name ?? null) !== (nextProduct ?? null)) && nextFamily !== "UNKNOWN") await persistPlatformHistory(sql, sourceId, {
		source_system_id: sourceId,
		technology_family: nextFamily,
		vendor_name: nextVendor,
		product_name: nextProduct,
		observed_at: (/* @__PURE__ */ new Date()).toISOString(),
		evidence_id: null,
		confidence: nextConfidence ?? result.confidence
	});
	if (result.evidence_level === "VERIFIED" && classifiedFamily !== "UNKNOWN" && classifiedFamily !== currentFamily) await insertAlert(sql, {
		source_system_id: sourceId,
		alert_type: "SOURCE_FAMILY_CONFIRMED",
		severity: "info",
		message: `Família confirmada: ${classifiedFamily}`,
		payload: {
			family: classifiedFamily,
			previous: currentFamily
		}
	});
	return {
		updated: nextFamily !== currentFamily || vendorOverwritten,
		vendor_overwritten: vendorOverwritten,
		conflict: result.conflict,
		technology_family: nextFamily
	};
}
async function insertRegisteredSource(sql, input) {
	const id = `src_${randomUUID()}`;
	const baseSlug = input.name.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "source";
	let slug = baseSlug;
	let n = 1;
	while (true) {
		if ((await sql.query(`select id from source_system where slug = $1`, [slug])).length === 0) break;
		n += 1;
		slug = `${baseSlug}-${n}`;
	}
	await sql.query(`insert into source_system (
       id, jurisdiction_id, name, slug, base_url, functional_family, technology_family,
       vendor_name, product_name, vendor_evidence_level, vendor_confidence,
       public_access, active, pncp_overlap, comprasgov_overlap,
       discovery_strategy, connector_type, classification_state, notes
     ) values (
       $1, $2, $3, $4, $5, $6, 'UNKNOWN',
       null, null, 'UNKNOWN', 0,
       true, true, false, false,
       'UNKNOWN', 'NONE', 'DISCOVERED', $7
     )`, [
		id,
		input.jurisdictionId,
		input.name,
		slug,
		input.baseUrl,
		input.functionalFamily ?? "UNKNOWN",
		"Registrado sem classificação de fornecedor."
	]);
	await sql.query(`insert into source_rate_policy (
       source_system_id, max_concurrency, requests_per_second, timeout_ms, backoff_profile
     ) values ($1, 1, 1, 8000, 'conservative')
     on conflict (source_system_id) do nothing`, [id]);
	await insertAlert(sql, {
		source_system_id: id,
		alert_type: "NEW_SOURCE_DISCOVERED",
		severity: "info",
		message: `Nova fonte registrada: ${input.name}`,
		payload: { base_url: input.baseUrl }
	});
	const created = await getSourceById(sql, id);
	if (!created) throw new Error("failed to load registered source");
	return created;
}
async function loadEvidenceInputs(sql, sourceId) {
	return (await sql.query(`select * from source_evidence where source_system_id = $1`, [sourceId])).map((row) => ({
		evidence_type: row.evidence_type,
		evidence_level: row.evidence_level ?? void 0,
		title: String(row.title ?? ""),
		description: row.description == null ? void 0 : String(row.description),
		url: row.url == null ? null : String(row.url),
		observed_value: row.observed_value == null ? null : String(row.observed_value),
		expected_signature: row.expected_signature == null ? null : String(row.expected_signature)
	}));
}
async function loadConnectorConfig(sql, sourceId) {
	const row = (await sql.query(`select c.*, s.base_url as source_base_url, s.connector_type as source_connector_type
     from source_system s
     left join source_connector_config c on c.source_system_id = s.id
     where s.id = $1`, [sourceId]))[0];
	if (!row) return null;
	const connectorType = asEnum(row.connector_type ?? row.source_connector_type, CONNECTOR_TYPES, "NONE");
	const asStringMap = (value) => {
		if (!value || typeof value !== "object" || Array.isArray(value)) return {};
		const out = {};
		for (const [key, inner] of Object.entries(value)) if (typeof inner === "string") out[key] = inner;
		return out;
	};
	const pathsJson = row.paths_json;
	const paths = asStringMap(row.paths_json);
	const responsePath = typeof pathsJson?.responsePath === "string" ? String(pathsJson.responsePath) : void 0;
	const linkBase = typeof pathsJson?.linkBase === "string" ? String(pathsJson.linkBase) : void 0;
	return {
		connectorType,
		baseUrl: String(row.base_url ?? row.source_base_url ?? ""),
		paths,
		defaultParams: asStringMap(row.default_params_json),
		headers: asStringMap(row.headers_json),
		responsePath,
		pagination: row.pagination_config ?? void 0,
		normalization: asStringMap(row.normalization_config),
		documents: asStringMap(row.document_config),
		acceptEquals: asStringMap(row.accept_equals_json),
		linkBase
	};
}
async function listFamilyCandidates(sql) {
	const sources = await listSources(sql);
	return jsonSafe(buildFamilyCandidates(sources));
}
async function listCensusRows(sql) {
	const sources = await listSources(sql);
	const history = await sql.query(`select source_system_id, technology_family, vendor_name, product_name, valid_from, valid_to
     from source_platform_history
     order by valid_from`);
	const bySource = /* @__PURE__ */ new Map();
	for (const row of history) {
		const list = bySource.get(String(row.source_system_id)) ?? [];
		list.push(row);
		bySource.set(String(row.source_system_id), list);
	}
	return jsonSafe(sources.map((source) => {
		const intervals = bySource.get(source.id) ?? [];
		const closed = intervals.filter((row) => row.valid_to != null);
		const current = intervals.find((row) => row.valid_to == null);
		const period = closed.length > 0 ? [...closed.map((row) => `${iso(row.valid_from)?.slice(0, 4) ?? "?"}–${iso(row.valid_to)?.slice(0, 4) ?? "?"} ${row.technology_family ?? ""}`.trim()), current ? `${iso(current.valid_from)?.slice(0, 4) ?? "?"}– ${source.technology_family ?? "UNKNOWN"}` : `vigente ${source.technology_family ?? "UNKNOWN"}`].join(" · ") : `vigente ${source.technology_family ?? "UNKNOWN"}`;
		const level = source.vendor_evidence_level ?? "UNKNOWN";
		return {
			source_id: source.id,
			ente: source.jurisdiction_name ?? source.name,
			uf: source.jurisdiction_uf,
			portal: source.base_url,
			sistema: source.product_name ?? source.name,
			vendor: source.vendor_name,
			product: source.product_name,
			period,
			evidence_level: level,
			url: source.base_url,
			claim_kind: level === "VERIFIED" ? "FATO_VERIFICADO" : level === "UNKNOWN" ? "PENDENTE_DE_VALIDACAO" : "INFERENCIA",
			technology_family: source.technology_family ?? "UNKNOWN",
			connector_type: source.connector_type
		};
	}));
}
async function milestone3Metrics(sql) {
	const sources = await listSources(sql);
	const candidates = buildFamilyCandidates(sources);
	const base = await metrics(sql);
	const perAdapter = await sql.query(`select coalesce(nullif(connector_type, ''), 'NONE') as adapter, count(*)::int as count
     from source_system
     group by coalesce(nullif(connector_type, ''), 'NONE')
     order by count desc`);
	const distribution = await sql.query(`select coalesce(vendor_evidence_level, 'UNKNOWN') as level, count(*)::int as count
     from source_system
     group by coalesce(vendor_evidence_level, 'UNKNOWN')
     order by count desc`);
	const [overlap] = await sql.query(`select
       count(*) filter (where pncp_overlap = true)::int as n,
       count(*)::int as total
     from source_system`);
	const [localOnly] = await sql.query(`select count(*)::int as n from source_record r
     left join source_entity_link l
       on l.source_system_id = r.source_system_id
      and l.source_external_id = r.source_identifier
     where l.id is null`);
	const [historyChanges] = await sql.query(`select count(*)::int as n from source_platform_history where valid_to is not null`);
	const pair = compareSchemas(fingerprintPayload("src_sc_compras", {
		conteudo: [{
			id: 1,
			processo: "1/2026",
			tipo: "PREGAO",
			orgaoSigla: "SEA",
			orgaoNome: "SEA",
			objeto: "x",
			entregaProposta: "2026-01-01",
			abertura: "2026-01-02",
			situacao: "PUBLICADO"
		}],
		pagina: 1,
		porPagina: 20,
		totalPaginas: 1,
		totalElementos: 1
	}), fingerprintPayload("src_br_pncp", { data: [{
		numeroControlePNCP: "x",
		numeroCompra: "1",
		orgaoEntidade: { razaoSocial: "y" },
		objetoCompra: "z"
	}] }));
	const chosen = pickReuseFamily(candidates);
	const familiesVerified = candidates.filter((row) => row.verified_sources > 0).length;
	return jsonSafe({
		families_verified: familiesVerified,
		sources_per_family: candidates.map((row) => ({
			family: row.technology_family,
			count: row.source_count,
			verified: row.verified_sources
		})),
		adapter_reuse_ratio: base.adapter_reuse_ratio,
		sources_per_adapter: perAdapter.map((row) => ({
			adapter: String(row.adapter),
			count: Number(row.count) || 0
		})),
		vendor_confidence_distribution: distribution.map((row) => ({
			level: String(row.level),
			count: Number(row.count) || 0
		})),
		schema_similarity: [{
			left_id: pair.left_id,
			right_id: pair.right_id,
			jaccard: pair.jaccard,
			same_hash: pair.same_hash,
			note: pair.note
		}],
		pncp_overlap_sources: Number(overlap?.n ?? 0),
		pncp_overlap_ratio: Number(overlap?.total ?? 0) === 0 ? 0 : Number(overlap?.n ?? 0) / Number(overlap?.total ?? 1),
		local_only_records: Number(localOnly?.n ?? 0),
		historical_vendor_changes: Number(historyChanges?.n ?? 0),
		commercial_adapter_verdict: "NO-GO",
		generic_reuse_verdict: chosen?.generic_reuse ?? "NO-GO",
		chosen_family: chosen?.technology_family ?? null,
		chosen_adapter: chosen?.adapter_candidate ?? null
	});
}
function mapDiscoveryChannel(row) {
	return {
		id: String(row.id),
		source_system_id: String(row.source_system_id ?? ""),
		channel_type: String(row.channel_type ?? "OTHER"),
		label: String(row.label ?? row.channel_type ?? "Canal"),
		list_url: row.list_url == null ? null : String(row.list_url),
		detail_url_pattern: row.detail_url_pattern == null ? null : String(row.detail_url_pattern),
		connector_type: row.connector_type == null ? null : String(row.connector_type),
		readiness: String(row.readiness ?? "OBSERVED"),
		ingest_status: String(row.ingest_status ?? "NOT_STARTED"),
		captcha_constraint: row.captcha_constraint == null ? null : String(row.captcha_constraint),
		notes: row.notes == null ? null : String(row.notes),
		claim_kind: String(row.claim_kind ?? "PENDENTE_DE_VALIDACAO"),
		data_origin: String(row.data_origin ?? "UNKNOWN"),
		last_success_at: iso(row.last_success_at)
	};
}
async function listDiscoveryChannels(sql, filters = {}) {
	try {
		const clauses = [];
		const params = [];
		if (filters.sourceId) {
			params.push(filters.sourceId);
			clauses.push(`(c.source_system_id = $${params.length} or (c.source_system_id = 'src_bll_platform' and exists (
        select 1 from source_system s where s.id = $${params.length} and s.technology_family = 'BLL'
      )))`);
		}
		if (filters.family) {
			params.push(filters.family);
			clauses.push(`exists (select 1 from source_system s where s.id = c.source_system_id and s.technology_family = $${params.length})`);
		}
		const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
		const mapped = (await sql.query(`select c.* from source_discovery_channel c ${where}
       order by case c.channel_type
         when 'PROCESS' then 0
         when 'DIRECT_BUY' then 1
         when 'LOCATION' then 2
         else 3 end, c.label`, params)).map(mapDiscoveryChannel);
		const seen = /* @__PURE__ */ new Set();
		const out = [];
		for (const row of mapped) {
			if (seen.has(row.channel_type)) continue;
			seen.add(row.channel_type);
			out.push(row);
		}
		return jsonSafe(out);
	} catch {
		return [];
	}
}
//#endregion
export { insertObservations as a, listSignatures as c, queries_server_exports as d, upsertSourceCapability as f, insertFingerprintRun as i, loadConnectorConfig as l, getSourceById as n, insertSourceRecord as o, insertAlert as r, listObservationsForSource as s, applyClassificationToSource as t, loadEvidenceInputs as u };
