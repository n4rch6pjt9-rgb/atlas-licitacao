import { t as publicGet } from "./http.server-PaTjCECa.mjs";
import { i as inferDiscoveryChannel } from "./discovery-channel-DKoYBJAm.mjs";
import { a as parseHtmlListRecords, n as htmlRecordToProcurement, r as joinUrl } from "./contract-DgIznFBx.mjs";
import { t as createGenericJsonAdapter } from "./generic-json-CwPmayOu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/connectors-CWdq_vs7.js
var ACTION_LINK = /\.action/i;
function linkPatternFromConfig(config) {
	const raw = config.linkPattern ?? config.paths.linkPattern;
	if (!raw) return ACTION_LINK;
	try {
		return new RegExp(raw, "i");
	} catch {
		return ACTION_LINK;
	}
}
var GenericActionAdapter = class {
	connectorType = "GENERIC_ACTION";
	config;
	sourceSystemId;
	constructor(config, sourceSystemId) {
		this.config = config;
		this.sourceSystemId = sourceSystemId;
	}
	async *discover(params) {
		const path = this.config.paths.discover;
		if (!path) throw new Error("generic-action: config.paths.discover is required");
		const url = joinUrl(this.config.baseUrl, path);
		let response;
		try {
			response = await publicGet(url, this.config.headers);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			throw new Error(`generic-action discover failed for ${url}: ${message}`);
		}
		if (!response.ok) throw new Error(`generic-action: GET ${url} failed with HTTP ${response.status}`);
		const rows = parseHtmlListRecords(response.text, this.config.baseUrl, linkPatternFromConfig(this.config));
		const organization = this.config.defaultParams?.organization?.trim().toLowerCase();
		const filtered = organization ? rows.filter((row) => {
			return `${row.htmlSnippet} ${row.object ?? ""} ${row.process_number ?? ""} ${row.organization_name ?? ""}`.toLowerCase().includes(organization);
		}) : rows;
		const channel = this.config.channelType ?? inferDiscoveryChannel(path) ?? inferDiscoveryChannel(this.config.paths.linkPattern);
		const limit = params.limit ?? 20;
		for (const row of filtered.slice(0, limit)) yield htmlRecordToProcurement(row, this.sourceSystemId, channel);
	}
	/**
	* Planning is not implemented. Empty result ≠ PLANNING supported.
	*/
	async getPlanning(_params) {
		return [];
	}
};
function createGenericActionAdapter(config, sourceSystemId) {
	return new GenericActionAdapter(config, sourceSystemId);
}
var JSF_LINK = /\.(xhtml|jsf|faces)/i;
/**
* Public JSF list adapter. GET the xhtml list page only.
* Do not forge ViewState postbacks or bypass authentication.
*/
var GenericJsfAdapter = class {
	connectorType = "GENERIC_JSF";
	config;
	sourceSystemId;
	constructor(config, sourceSystemId) {
		this.config = config;
		this.sourceSystemId = sourceSystemId;
	}
	async *discover(params) {
		const path = this.config.paths.discover;
		if (!path) throw new Error("generic-jsf: config.paths.discover is required");
		const url = joinUrl(this.config.baseUrl, path);
		let response;
		try {
			response = await publicGet(url, this.config.headers);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			throw new Error(`generic-jsf discover failed for ${url}: ${message}`);
		}
		if (!response.ok) throw new Error(`generic-jsf: GET ${url} failed with HTTP ${response.status}`);
		const rows = parseHtmlListRecords(response.text, this.config.baseUrl, JSF_LINK);
		const limit = params.limit ?? 20;
		for (const row of rows.slice(0, limit)) yield htmlRecordToProcurement(row, this.sourceSystemId);
	}
	/**
	* Planning is not implemented. Empty result ≠ PLANNING supported.
	* Do not forge JSF ViewState postbacks.
	*/
	async getPlanning(_params) {
		return [];
	}
};
function createGenericJsfAdapter(config, sourceSystemId) {
	return new GenericJsfAdapter(config, sourceSystemId);
}
var EmptySource = class {
	connectorType;
	config;
	constructor(config) {
		this.connectorType = config.connectorType;
		this.config = config;
	}
	async *discover(_params) {}
	async getPlanning(_params) {
		return [];
	}
};
function createAdapter(config, sourceSystemId) {
	switch (config.connectorType) {
		case "GENERIC_JSON": return createGenericJsonAdapter(config, sourceSystemId);
		case "GENERIC_ACTION": return createGenericActionAdapter(config, sourceSystemId);
		case "GENERIC_JSF": return createGenericJsfAdapter(config, sourceSystemId);
		case "EXTERNAL_LINK_HUB":
		case "PLANNING_ONLY":
		case "NONE": return new EmptySource(config);
		default: {
			const unexpected = config.connectorType;
			throw new Error(`Unsupported connectorType: ${String(unexpected)}`);
		}
	}
}
//#endregion
export { createAdapter as t };
