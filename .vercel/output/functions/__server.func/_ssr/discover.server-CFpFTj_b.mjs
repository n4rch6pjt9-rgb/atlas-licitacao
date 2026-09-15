import { b as PAGINATION_TYPES } from "./types-DkMyNmeu.mjs";
import { resolveIngestedRecords } from "./coverage.server-DMEnGzqD.mjs";
import { t as createAdapter } from "./connectors-CWdq_vs7.mjs";
import { t as payloadHash } from "./hash-DAnDaBOp.mjs";
import { n as classifyAuthError } from "./pcp-semantics-Y8Z50bdG.mjs";
import { r as schemaFingerprint } from "./schema-fingerprint-49fkWjyh.mjs";
import { l as loadConnectorConfig, o as insertSourceRecord } from "./queries.server-B9mr7TW7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/discover.server-CFpFTj_b.js
function asPagination(value) {
	if (!value || typeof value !== "object") return void 0;
	const rec = value;
	return {
		type: typeof rec.type === "string" && PAGINATION_TYPES.includes(rec.type) ? rec.type : "UNKNOWN",
		pageParam: typeof rec.pageParam === "string" ? rec.pageParam : void 0,
		sizeParam: typeof rec.sizeParam === "string" ? rec.sizeParam : void 0,
		pageSize: typeof rec.pageSize === "number" ? rec.pageSize : void 0,
		startPage: typeof rec.startPage === "number" ? rec.startPage : void 0
	};
}
function splitResponsePath(paths) {
	const { responsePath, ...rest } = paths;
	return {
		paths: rest,
		responsePath: responsePath || void 0
	};
}
function withDiscoverPath(config) {
	if (config.paths.discover) return config;
	const fallback = config.paths.search ?? config.paths.editais ?? config.paths.list ?? Object.values(config.paths).find((value) => Boolean(value));
	if (!fallback) return config;
	return {
		...config,
		paths: {
			...config.paths,
			discover: fallback
		}
	};
}
async function discoverSource(sql, sourceId, params = {}) {
	const loaded = await loadConnectorConfig(sql, sourceId);
	if (!loaded) return {
		records: [],
		count: 0,
		error: "fonte não encontrada"
	};
	if (loaded.connectorType === "NONE") return {
		records: [],
		count: 0,
		error: "adapter pending"
	};
	if (!loaded.baseUrl) return {
		records: [],
		count: 0,
		error: "fonte sem URL base"
	};
	const split = splitResponsePath(loaded.paths);
	const config = withDiscoverPath({
		connectorType: loaded.connectorType,
		baseUrl: loaded.baseUrl,
		paths: split.paths,
		defaultParams: loaded.defaultParams,
		headers: loaded.headers,
		responsePath: loaded.responsePath ?? split.responsePath,
		pagination: asPagination(loaded.pagination),
		normalization: loaded.normalization,
		documents: loaded.documents,
		acceptEquals: loaded.acceptEquals,
		linkBase: loaded.linkBase
	});
	if ((config.connectorType === "GENERIC_JSON" || config.connectorType === "GENERIC_ACTION" || config.connectorType === "GENERIC_JSF") && !config.paths.discover) return {
		records: [],
		count: 0,
		error: "adapter pending"
	};
	const year = params.year ?? (/* @__PURE__ */ new Date()).getFullYear();
	const limit = params.limit ?? 20;
	const records = [];
	try {
		const adapter = createAdapter(config, sourceId);
		for await (const record of adapter.discover({
			year,
			limit
		})) {
			records.push(record);
			if (records.length >= limit) break;
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		const httpMatch = message.match(/HTTP (\d{3})/);
		const status = httpMatch ? Number(httpMatch[1]) : 0;
		const health = status ? classifyAuthError(status, message) : null;
		return {
			records: [],
			count: 0,
			error: status === 400 || health === "CONFIG_INVALID" || health === "AUTH_SEMANTICS_CHANGED" ? `erro de configuração (HTTP ${status || "auth"}), não falha de parser: ${message}` : message
		};
	}
	for (const record of records) await insertSourceRecord(sql, {
		source_system_id: sourceId,
		source_entity_type: "procurement",
		source_identifier: record.external_id,
		payload_hash: payloadHash(record.raw_payload ?? record),
		schema_hash: schemaFingerprint(record.raw_payload ?? record).schema_hash,
		raw_payload: record.raw_payload ?? record,
		source_url: record.source_url,
		source_updated_at: record.opening_at ?? record.proposal_deadline ?? null,
		ingestion_mode: "LIVE_PUBLIC_API",
		fetch_method: "GENERIC_JSON"
	});
	try {
		await resolveIngestedRecords(sql, sourceId, records);
	} catch {}
	return {
		records,
		count: records.length
	};
}
//#endregion
export { discoverSource };
