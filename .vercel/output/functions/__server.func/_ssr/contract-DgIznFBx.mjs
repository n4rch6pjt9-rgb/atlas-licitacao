import { i as pncpEditalUrl } from "./pncp-url-CkM9bQPG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contract-DgIznFBx.js
function joinUrl(baseUrl, path) {
	if (!path) return baseUrl;
	try {
		if (/^https?:\/\//i.test(path)) return path;
		const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
		return new URL(path, base).toString();
	} catch {
		return path;
	}
}
function mapValue(obj, path) {
	if (!path || obj == null) return void 0;
	const parts = path.split(".").filter(Boolean);
	let current = obj;
	for (const part of parts) {
		if (current == null || typeof current !== "object") return void 0;
		if (Array.isArray(current)) {
			const index = Number(part);
			if (!Number.isInteger(index) || index < 0 || index >= current.length) return;
			current = current[index];
			continue;
		}
		current = current[part];
	}
	return current;
}
function asString(value) {
	if (value == null) return null;
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed ? trimmed : null;
	}
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
	if (typeof value === "boolean") return value ? "true" : "false";
	return null;
}
function asYear(value) {
	if (typeof value === "number" && Number.isFinite(value)) {
		const year = Math.trunc(value);
		if (year >= 1900 && year <= 2100) return year;
	}
	if (typeof value === "string") {
		const match = value.match(/(19|20)\d{2}/);
		if (match) return Number(match[0]);
		const numeric = Number(value);
		if (Number.isFinite(numeric)) {
			const year = Math.trunc(numeric);
			if (year >= 1900 && year <= 2100) return year;
		}
	}
	return null;
}
var DEFAULT_FIELD_PATHS = {
	external_id: "id",
	process_number: "processo",
	procurement_number: "numero",
	year: "ano",
	modality: "tipo",
	status: "situacao",
	organization_name: "orgaoNome",
	organization_identifier: "orgaoCnpj",
	object: "objeto",
	proposal_deadline: "entregaProposta",
	opening_at: "abertura",
	source_url: "url"
};
function mappedString(raw, mapping, field, fallbacks = []) {
	const path = mapping[field];
	if (path) {
		const value = asString(mapValue(raw, path));
		if (value) return value;
	}
	for (const fallback of fallbacks) {
		const value = asString(mapValue(raw, fallback));
		if (value) return value;
	}
	return null;
}
function applyNormalization(raw, mapping, source_system_id, source_url) {
	const paths = {
		...DEFAULT_FIELD_PATHS,
		...mapping ?? {}
	};
	const process_number = mappedString(raw, paths, "process_number", [
		"processo",
		"numeroProcesso",
		"process_number",
		"numero",
		"NR_PROCESSO",
		"identificacao"
	]);
	const mappedUrl = mappedString(raw, paths, "source_url", [
		"url",
		"link",
		"href",
		"urlReferencia",
		"urlProcesso"
	]);
	const control = asString(mapValue(raw, "numeroControlePNCP")) ?? asString(mapValue(raw, "numeroControlePncp")) ?? mappedString(raw, paths, "external_id", ["numeroControlePNCP"]);
	const external_id = mappedString(raw, paths, "external_id", [
		"id",
		"codigo",
		"uuid",
		"numeroControlePNCP",
		"codLicitacao",
		"idLicitacao",
		"codigoLicitacao"
	]) ?? process_number ?? "unknown";
	const year = asYear(paths.year ? mapValue(raw, paths.year) : void 0) ?? asYear(mapValue(raw, "ano")) ?? asYear(mapValue(raw, "anoCompra")) ?? asYear(mapValue(raw, "year")) ?? asYear(process_number);
	const publicUrl = pncpEditalUrl(control) ?? pncpEditalUrl(external_id) ?? pncpEditalUrl(mappedUrl);
	return {
		external_id,
		source_system_id,
		process_number,
		procurement_number: mappedString(raw, paths, "procurement_number", ["numero", "numeroCompra"]),
		year,
		modality: mappedString(raw, paths, "modality", [
			"tipo",
			"modalidade",
			"tipoLicitacao"
		]),
		status: mappedString(raw, paths, "status", ["situacao", "status"]),
		organization_name: mappedString(raw, paths, "organization_name", [
			"orgaoNome",
			"orgao",
			"razaoSocial"
		]),
		organization_identifier: mappedString(raw, paths, "organization_identifier", ["orgaoCnpj", "cnpj"]),
		object: mappedString(raw, paths, "object", [
			"objeto",
			"object",
			"resumo",
			"DS_OBJETO",
			"objetoCompra"
		]),
		proposal_deadline: mappedString(raw, paths, "proposal_deadline", ["entregaProposta"]),
		opening_at: mappedString(raw, paths, "opening_at", ["abertura"]),
		source_url: publicUrl ?? mappedUrl ?? source_url,
		raw_payload: raw
	};
}
function decodeEntities(text) {
	return text.replace(/&nbsp;/gi, " ").replace(/&/gi, "&").replace(/</gi, "<").replace(/>/gi, ">").replace(/"/gi, "\"").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(String(n), 16)));
}
function stripTags(html) {
	return decodeEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}
function idFromHref(href) {
	try {
		const url = new URL(href, "https://invalid.local");
		for (const key of [
			"id",
			"codigo",
			"cod",
			"numero",
			"edital",
			"licitacaoId",
			"licitacao",
			"param1"
		]) {
			const value = url.searchParams.get(key);
			if (value && value.trim()) return value.trim();
		}
		const last = url.pathname.split("/").filter(Boolean).pop();
		if (last && /View$|Search$|\.action$/i.test(last) && url.search) return url.search.replace(/^\?/, "") || last;
		return last ?? null;
	} catch {
		return null;
	}
}
var PROCESS_NUMBER_RE = /^\d{1,8}(?:[./-]\d{1,8}){0,3}(?:[./-][A-Za-z0-9]{1,8})?$/;
function looksLikeProcessNumber(cell) {
	const text = cell.trim();
	if (!text || text.length > 32) return false;
	if (/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(text)) return false;
	if (/\d{1,2}:\d{2}/.test(text)) return false;
	if (/^\d{4,}$/.test(text)) return true;
	return PROCESS_NUMBER_RE.test(text) && /\d/.test(text) && /[./-]/.test(text);
}
function foldHeader(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function columnRole(header) {
	const folded = foldHeader(header);
	if (!folded) return "ignore";
	if (/(promotor|orgao|organizacao|organization|ente|municipio)/.test(folded)) return "organization_name";
	if (/(objeto|object|descricao|resumo)/.test(folded)) return "object";
	if (/(modalidade|modality)/.test(folded)) return "modality";
	if (/(status|situacao)/.test(folded)) return "status";
	if (/(publica|abertura|opening)/.test(folded)) return "opening_at";
	if (/(numero|edital|processo|\bn\b|\bno\b)/.test(folded)) return "process_number";
	if (/(conclusao|encerramento|fim)/.test(folded)) return "ignore";
	return "ignore";
}
function fallbackModality(cell) {
	const text = cell.trim();
	if (/^(dispensa|inexigibilidade|pregao|preg[aã]o|concorrencia|concorr[eê]ncia|tomada|leilao|leil[aã]o|dialogo|credenciamento)/i.test(text)) return text;
	return null;
}
function fallbackStatus(cell) {
	const text = cell.trim();
	if (/^(publicada|conclu[ií]da|aberta|encerrada|suspensa|anulada|fracassada|deserta|em andamento)/i.test(text)) return text;
	return null;
}
function recordFromRow(input) {
	const href = input.hrefs[0] ?? null;
	const source_url = href ? joinUrl(input.baseUrl, href) : null;
	const cells = input.rawCells.filter(Boolean);
	const mapped = {};
	if (input.headers.length > 0 && input.rawCells.length > 0) {
		const limit = Math.max(input.headers.length, input.rawCells.length);
		for (let i = 0; i < limit; i += 1) {
			const role = columnRole(input.headers[i] ?? "");
			const value = (input.rawCells[i] ?? "").trim();
			if (role === "ignore" || !value || mapped[role]) continue;
			mapped[role] = value;
		}
	}
	const process_number = mapped.process_number ?? cells.find((cell) => looksLikeProcessNumber(cell)) ?? null;
	const organization_name = mapped.organization_name ?? null;
	const modality = mapped.modality ?? cells.map(fallbackModality).find((value) => Boolean(value)) ?? null;
	const status = mapped.status ?? cells.map(fallbackStatus).find((value) => Boolean(value)) ?? null;
	const opening_at = mapped.opening_at ?? null;
	let object = mapped.object ?? null;
	if (!object) {
		const skip = new Set([
			process_number,
			organization_name,
			modality,
			status,
			opening_at
		].filter(Boolean));
		object = [...cells].sort((a, b) => b.length - a.length).find((cell) => !skip.has(cell) && !looksLikeProcessNumber(cell) && !/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(cell) && !/\d{1,2}:\d{2}/.test(cell) && cell.length > 12) ?? null;
	}
	return {
		external_id: (href ? idFromHref(href) : null) ?? process_number ?? source_url ?? stripTags(input.rowHtml).slice(0, 80) ?? "unknown",
		process_number,
		object,
		source_url,
		htmlSnippet: input.fullRow.slice(0, 4e3),
		organization_name,
		modality,
		status,
		opening_at
	};
}
function parseHtmlListRecords(html, baseUrl, linkPattern) {
	const records = [];
	const seen = /* @__PURE__ */ new Set();
	const hrefMatches = (href) => {
		const path = href.split("?")[0] ?? href;
		return linkPattern.test(path) || linkPattern.test(href);
	};
	let headers = [];
	for (const headerMatch of html.matchAll(/<tr\b[^>]*>((?:\s*<th\b[\s\S]*?<\/th>\s*)+)<\/tr>/gi)) {
		const ths = [...(headerMatch[1] ?? "").matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map((match) => stripTags(match[1] ?? ""));
		if (ths.some((cell) => cell.length > 0)) headers = ths;
	}
	for (const rowMatch of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
		const rowHtml = rowMatch[1] ?? "";
		if (/<(?:table|tr)\b/i.test(rowHtml)) continue;
		if ([...rowHtml.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map((match) => stripTags(match[1] ?? "")).length > 0 && !/<td\b/i.test(rowHtml)) continue;
		const hrefs = [...rowHtml.matchAll(/href=["']([^"']+)["']/gi)].map((match) => match[1]).filter((href) => Boolean(href && hrefMatches(href)));
		if (hrefs.length === 0) continue;
		if (/<(?:input|select|textarea)\b/i.test(rowHtml)) continue;
		const rawCells = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => stripTags(match[1] ?? ""));
		const row = recordFromRow({
			rowHtml,
			fullRow: rowMatch[0] ?? "",
			hrefs,
			rawCells,
			headers,
			baseUrl
		});
		const key = row.source_url ?? row.external_id;
		if (seen.has(key)) continue;
		seen.add(key);
		records.push(row);
	}
	for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
		const href = match[1];
		if (!href || !hrefMatches(href)) continue;
		const source_url = joinUrl(baseUrl, href);
		if (seen.has(source_url)) continue;
		seen.add(source_url);
		const text = stripTags(match[2] ?? "");
		const processMatch = looksLikeProcessNumber(text) ? text : text.match(/\d+\s*\/\s*\d{2,4}/)?.[0] ?? null;
		records.push({
			external_id: idFromHref(href) ?? (text || source_url),
			process_number: processMatch,
			object: text || null,
			source_url,
			htmlSnippet: (match[0] ?? "").slice(0, 4e3),
			organization_name: null,
			modality: null,
			status: null,
			opening_at: null
		});
	}
	return records;
}
function htmlRecordToProcurement(row, sourceSystemId, sourceChannel) {
	return {
		external_id: row.external_id,
		source_system_id: sourceSystemId,
		process_number: row.process_number,
		procurement_number: null,
		year: asYear(row.process_number) ?? asYear(row.opening_at),
		modality: row.modality,
		status: row.status,
		organization_name: row.organization_name,
		organization_identifier: null,
		object: row.object,
		proposal_deadline: null,
		opening_at: row.opening_at,
		source_url: row.source_url,
		raw_payload: { htmlSnippet: row.htmlSnippet },
		source_channel: sourceChannel ?? null
	};
}
//#endregion
export { parseHtmlListRecords as a, mapValue as i, htmlRecordToProcurement as n, joinUrl as r, applyNormalization as t };
