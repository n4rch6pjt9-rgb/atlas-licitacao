import { C as VENDOR_FAMILIES, p as FRAMEWORK_FAMILIES } from "./types-DkMyNmeu.mjs";
import { n as publicRequest } from "./http.server-PaTjCECa.mjs";
import { t as payloadHash } from "./hash-DAnDaBOp.mjs";
import { n as detectSchemaDrift, r as schemaFingerprint, t as collectFieldPaths } from "./schema-fingerprint-49fkWjyh.mjs";
import { a as insertObservations, c as listSignatures, i as insertFingerprintRun, n as getSourceById, o as insertSourceRecord, r as insertAlert, s as listObservationsForSource, t as applyClassificationToSource, u as loadEvidenceInputs } from "./queries.server-B9mr7TW7.mjs";
import { randomUUID } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/fingerprint-run.server-CE660Q-k.js
/**
* Configurable scoring weights. Do not scatter magic numbers in classifiers.
* Calibrate empirically; this is the initial table from the engineering spec.
*/
var SCORE_WEIGHTS = {
	OFFICIAL_DOCUMENT: 100,
	PUBLIC_CONTRACT: 100,
	OFFICIAL_MANUAL: 90,
	VENDOR_REFERENCE: 80,
	ROUTE_SIGNATURE: 40,
	JSON_SCHEMA: 35,
	ASSET_NAMESPACE: 35,
	HTML_SIGNATURE: 35,
	JS_ASSET: 25,
	FORM_ACTION: 20,
	HTTP_HEADER: 10,
	COOKIE: 5,
	GENERIC_FRAMEWORK: 5,
	VISUAL_SIMILARITY: 1,
	ROBOTS: 3,
	SITEMAP: 3,
	OTHER: 2
};
var EVIDENCE_TYPE_WEIGHT = {
	OFFICIAL_DOCUMENT: SCORE_WEIGHTS.OFFICIAL_DOCUMENT,
	PUBLIC_CONTRACT: SCORE_WEIGHTS.PUBLIC_CONTRACT,
	OFFICIAL_MANUAL: SCORE_WEIGHTS.OFFICIAL_MANUAL,
	VENDOR_REFERENCE: SCORE_WEIGHTS.VENDOR_REFERENCE,
	HTML_SIGNATURE: SCORE_WEIGHTS.HTML_SIGNATURE,
	JS_ASSET: SCORE_WEIGHTS.JS_ASSET,
	HTTP_HEADER: SCORE_WEIGHTS.HTTP_HEADER,
	COOKIE: SCORE_WEIGHTS.COOKIE,
	ROUTE_SIGNATURE: SCORE_WEIGHTS.ROUTE_SIGNATURE,
	JSON_SCHEMA: SCORE_WEIGHTS.JSON_SCHEMA,
	FORM_ACTION: SCORE_WEIGHTS.FORM_ACTION,
	ROBOTS: SCORE_WEIGHTS.ROBOTS,
	SITEMAP: SCORE_WEIGHTS.SITEMAP,
	OTHER: SCORE_WEIGHTS.OTHER
};
var LEVEL_THRESHOLDS = {
	VERIFIED: 100,
	STRONG_INDICATION: 70,
	WEAK_INDICATION: 30
};
function evidenceLevelFromScore(score) {
	if (score >= LEVEL_THRESHOLDS.VERIFIED) return "VERIFIED";
	if (score >= LEVEL_THRESHOLDS.STRONG_INDICATION) return "STRONG_INDICATION";
	if (score >= LEVEL_THRESHOLDS.WEAK_INDICATION) return "WEAK_INDICATION";
	return "UNKNOWN";
}
function confidenceFromScore(score) {
	return Math.round(Math.max(0, Math.min(score, 120)) / 120 * 1e3) / 1e3;
}
function weightForEvidenceType(type) {
	return EVIDENCE_TYPE_WEIGHT[type] ?? SCORE_WEIGHTS.OTHER;
}
function normalize(value) {
	return value.trim().toLowerCase();
}
function observationMatches(observation, signature) {
	const pattern = signature.pattern;
	const haystack = [
		observation.value,
		observation.key,
		observation.observation_type
	].filter(Boolean).join(" ");
	const nHay = normalize(haystack);
	const nPat = normalize(pattern);
	if (signature.signature_type === "COOKIE_NAME") return normalize(observation.key) === "cookie_name" || observation.observation_type === "COOKIE_NAME" ? normalize(observation.value) === nPat || nHay.includes(nPat) : false;
	if (signature.signature_type === "PAGE_SUFFIX") return nHay.includes(nPat);
	if (nPat.startsWith("/") || nPat.startsWith(".")) return nHay.includes(nPat);
	try {
		return new RegExp(pattern, "i").test(haystack);
	} catch {
		return nHay.includes(nPat);
	}
}
function matchSignatures(observations, signatures) {
	return signatures.map((signature) => {
		const hit = observations.find((obs) => observationMatches(obs, signature));
		return {
			signature,
			matched: Boolean(hit),
			score: hit ? signature.weight : 0,
			observed_value: hit ? hit.value : null
		};
	});
}
function bestFamily(matches, allowed) {
	const scores = /* @__PURE__ */ new Map();
	for (const match of matches) {
		if (!match.matched) continue;
		const family = match.signature.technology_family;
		if (allowed && !allowed.has(family)) continue;
		scores.set(family, (scores.get(family) ?? 0) + match.score);
	}
	let family = "UNKNOWN";
	let score = 0;
	for (const [candidate, value] of scores) if (value > score) {
		family = candidate;
		score = value;
	}
	return {
		family,
		score
	};
}
function vendorFromEvidence(evidence) {
	let score = 0;
	let vendor_name = null;
	let product_name = null;
	let family = null;
	for (const item of evidence) {
		score += weightForEvidenceType(item.evidence_type);
		const parsed = parseVendorMention(`${item.title} ${item.description ?? ""} ${item.observed_value ?? ""}`);
		if (parsed.family) family = parsed.family;
		if (parsed.vendor_name) vendor_name = parsed.vendor_name;
		if (parsed.product_name) product_name = parsed.product_name;
	}
	return {
		vendor_name,
		product_name,
		family,
		score
	};
}
var VENDOR_ALIASES = [
	{
		family: "PARADIGMA_WBC",
		vendor_name: "Paradigma",
		product_name: "WBC",
		patterns: [/paradigma/i, /\bwbc\b/i]
	},
	{
		family: "SCPI_FIORILLI",
		vendor_name: "Fiorilli",
		product_name: "SCPI",
		patterns: [/fiorilli/i, /\bscpi\b/i]
	},
	{
		family: "LICITAR_DIGITAL",
		vendor_name: "Licitar Digital",
		product_name: "Licitar Digital",
		patterns: [/licitar\s*digital/i]
	},
	{
		family: "PORTAL_COMPRAS_PUBLICAS",
		vendor_name: "eCustomize",
		product_name: "Portal de Compras Públicas",
		patterns: [/portal de compras p[uú]blicas/i, /ecustomize/i]
	},
	{
		family: "LICITANET",
		vendor_name: "Licitanet",
		product_name: "Licitanet",
		patterns: [/licitanet/i]
	},
	{
		family: "BLL",
		vendor_name: "BLL",
		product_name: "Lance Eletrônico",
		patterns: [/\bbll\b/i, /bolsa de licita[cç][oõ]es/i]
	},
	{
		family: "BNC",
		vendor_name: "BNC",
		product_name: "BNC Compras",
		patterns: [/\bbnc\b/i, /bolsa nacional de compras/i]
	},
	{
		family: "BBMNET",
		vendor_name: "Bolsa Brasileira de Mercadorias",
		product_name: "BBMNET Licitações",
		patterns: [/bbmnet/i, /bolsa brasileira de mercadorias/i]
	},
	{
		family: "COMPRASBR",
		vendor_name: "A Z Informática",
		product_name: "Pregão Eletrônico SIGA / ComprasBR",
		patterns: [/comprasbr/i, /a z inform[aá]tica/i]
	},
	{
		family: "BANCO_DO_BRASIL",
		vendor_name: "Banco do Brasil",
		product_name: "Licitações-e",
		patterns: [/licita[cç][oõ]es-e/i, /licitacoes-e/i]
	}
];
function parseVendorMention(text) {
	for (const alias of VENDOR_ALIASES) if (alias.patterns.some((re) => re.test(text))) return {
		family: alias.family,
		vendor_name: alias.vendor_name,
		product_name: alias.product_name
	};
	return {
		family: null,
		vendor_name: null,
		product_name: null
	};
}
function claimKindFor(level, family) {
	if (level === "VERIFIED") return "FATO_VERIFICADO";
	if (family === "UNKNOWN") return "PENDENTE_DE_VALIDACAO";
	if (FRAMEWORK_FAMILIES.has(family)) return "INFERENCIA";
	if (level === "STRONG_INDICATION") return "INFERENCIA";
	return "PENDENTE_DE_VALIDACAO";
}
/**
* Observations → matches → candidate family → score → classification.
* Framework markers never prove a commercial vendor.
*/
function classifySource(input) {
	const evidence = input.evidence ?? [];
	const matches = matchSignatures(input.observations, input.signatures);
	const framework = bestFamily(matches, FRAMEWORK_FAMILIES);
	const vendorSig = bestFamily(matches, VENDOR_FAMILIES);
	const fromEvidence = vendorFromEvidence(evidence);
	const framework_score = framework.score;
	const vendor_score = fromEvidence.score + vendorSig.score;
	const score = Math.max(framework_score, vendor_score);
	let technology_family = "UNKNOWN";
	let candidate_family = framework.family;
	let vendor_name = null;
	let product_name = null;
	let conflict = false;
	let conflict_reason = null;
	const evidenceLevelVendor = evidenceLevelFromScore(fromEvidence.score);
	if (fromEvidence.family && (evidenceLevelVendor === "VERIFIED" || evidenceLevelVendor === "STRONG_INDICATION")) {
		technology_family = fromEvidence.family;
		candidate_family = fromEvidence.family;
		vendor_name = fromEvidence.vendor_name;
		product_name = fromEvidence.product_name;
	} else if (vendorSig.family !== "UNKNOWN" && vendorSig.score >= SCORE_WEIGHTS.ROUTE_SIGNATURE) {
		technology_family = vendorSig.family;
		candidate_family = vendorSig.family;
	} else if (framework.family !== "UNKNOWN") {
		technology_family = framework.family;
		candidate_family = framework.family;
	}
	if (fromEvidence.family && vendorSig.family !== "UNKNOWN" && fromEvidence.family !== vendorSig.family && evidenceLevelVendor === "VERIFIED") {
		conflict = true;
		conflict_reason = `Documento oficial indica ${fromEvidence.family}, fingerprint técnico indica ${vendorSig.family}`;
		technology_family = fromEvidence.family;
		candidate_family = fromEvidence.family;
	}
	if (input.currentVendorFamily && VENDOR_FAMILIES.has(input.currentVendorFamily) && fromEvidence.family && fromEvidence.family !== input.currentVendorFamily && evidenceLevelVendor === "VERIFIED") {
		vendor_name = fromEvidence.vendor_name;
		product_name = fromEvidence.product_name;
		technology_family = fromEvidence.family;
	}
	const evidence_level = fromEvidence.family ? evidenceLevelFromScore(fromEvidence.score) : evidenceLevelFromScore(VENDOR_FAMILIES.has(technology_family) ? vendor_score : framework_score);
	if (FRAMEWORK_FAMILIES.has(technology_family) && !fromEvidence.family) {
		vendor_name = null;
		product_name = null;
	}
	return {
		candidate_family,
		technology_family,
		vendor_name,
		product_name,
		evidence_level,
		confidence: confidenceFromScore(fromEvidence.family ? fromEvidence.score : framework_score),
		score,
		vendor_score,
		framework_score,
		conflict,
		conflict_reason,
		claim_kind: claimKindFor(evidence_level, technology_family),
		matches
	};
}
var PAGE_SUFFIXES = /* @__PURE__ */ new Set([
	".xhtml",
	".jsf",
	".faces",
	".aspx",
	".asp",
	".jsp",
	".action",
	".do",
	".php",
	".html",
	".htm"
]);
var SERVER_HEADER_NAMES = /* @__PURE__ */ new Set([
	"server",
	"x-powered-by",
	"x-aspnet-version",
	"x-aspnetmvc-version",
	"x-runtime",
	"x-generator"
]);
var MAX_PER_TYPE = 40;
function obs(observation_type, key, value, source_url, raw_payload) {
	const row = {
		observation_type,
		key,
		value,
		source_url: source_url ?? null
	};
	if (raw_payload !== void 0) row.raw_payload = raw_payload;
	return row;
}
function decodeEntities(text) {
	return text.replace(/&nbsp;/gi, " ").replace(/&/gi, "&").replace(/</gi, "<").replace(/>/gi, ">").replace(/"/gi, "\"").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}
function collapseWs(text) {
	return text.replace(/\s+/g, " ").trim();
}
function attr(tag, name) {
	const re = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i");
	return tag.match(re)?.[1] ?? null;
}
function openTags(html, tagName) {
	const re = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
	return html.match(re) ?? [];
}
function parseUrl(url) {
	try {
		return new URL(url);
	} catch {
		try {
			return new URL(url, "https://invalid.local");
		} catch {
			return null;
		}
	}
}
function suffixFromPath(pathname) {
	const match = pathname.toLowerCase().match(/(\.[a-z0-9]{1,10})$/);
	if (!match) return null;
	return PAGE_SUFFIXES.has(match[1]) ? match[1] : null;
}
function normalizeCookies(cookies) {
	if (!cookies) return [];
	if (Array.isArray(cookies)) return cookies;
	return Object.entries(cookies).map(([name, value]) => ({
		name,
		value
	}));
}
function cookieNameFromSetCookie(header) {
	const name = header.split("=", 1)[0]?.trim();
	return name ? name : null;
}
function pushCapped(out, counts, item) {
	const value = item.value.trim();
	if (!value) return;
	const n = counts.get(item.observation_type) ?? 0;
	if (n >= MAX_PER_TYPE) return;
	counts.set(item.observation_type, n + 1);
	out.push({
		...item,
		value
	});
}
function collectFromUrl(out, counts, url) {
	const parsed = parseUrl(url);
	if (!parsed) {
		pushCapped(out, counts, obs("ROUTE", "url", url, url));
		return;
	}
	pushCapped(out, counts, obs("ROUTE", "pathname", parsed.pathname, url));
	const suffix = suffixFromPath(parsed.pathname);
	if (suffix) pushCapped(out, counts, obs("PAGE_SUFFIX", "page_suffix", suffix, url));
	for (const key of parsed.searchParams.keys()) pushCapped(out, counts, obs("PARAMETER_NAME", "query", key, url));
}
function collectFromHeaders(out, headers, url) {
	const counts = /* @__PURE__ */ new Map();
	for (const [rawName, rawValue] of Object.entries(headers)) {
		const name = rawName.toLowerCase();
		const value = rawValue.trim();
		if (!value) continue;
		if (SERVER_HEADER_NAMES.has(name)) pushCapped(out, counts, obs("SERVER_HEADER", name, value, url));
		if (name === "content-type") pushCapped(out, counts, obs("CONTENT_TYPE", "content_type", value.split(";", 1)[0]?.trim() ?? value, url));
		if (name === "set-cookie") for (const part of value.split(/,(?=[^ ;]+=)/)) {
			const cookie = cookieNameFromSetCookie(part);
			if (cookie) pushCapped(out, counts, obs("COOKIE_NAME", "cookie_name", cookie, url));
		}
		if (name === "location") pushCapped(out, counts, obs("ROUTE", "location", parseUrl(value)?.pathname ?? value, url));
	}
}
function collectFromCookies(out, cookies, url) {
	const counts = /* @__PURE__ */ new Map();
	for (const cookie of cookies) {
		const name = cookie.name.trim();
		if (!name) continue;
		pushCapped(out, counts, obs("COOKIE_NAME", "cookie_name", name, url));
	}
}
var FRAMEWORK_MARKERS = [
	{
		re: /javax\.faces\.ViewState/i,
		type: "INPUT_NAME",
		key: "viewstate",
		value: "javax.faces.ViewState"
	},
	{
		re: /javax\.faces\.partial/i,
		type: "PARAMETER_NAME",
		key: "jsf_partial",
		value: "javax.faces.partial"
	},
	{
		re: /PrimeFaces/i,
		type: "JS_GLOBAL",
		key: "js_global",
		value: "PrimeFaces"
	},
	{
		re: /RichFaces/i,
		type: "JS_GLOBAL",
		key: "js_global",
		value: "RichFaces"
	},
	{
		re: /jsf\.ajax/i,
		type: "JS_GLOBAL",
		key: "js_global",
		value: "jsf.ajax"
	},
	{
		re: /__VIEWSTATE/,
		type: "INPUT_NAME",
		key: "viewstate",
		value: "__VIEWSTATE"
	},
	{
		re: /__doPostBack/,
		type: "JS_GLOBAL",
		key: "js_global",
		value: "__doPostBack"
	},
	{
		re: /struts\.action/i,
		type: "PAGE_TEXT",
		key: "framework",
		value: "struts.action"
	}
];
function collectFromHtml(out, html, url) {
	const counts = /* @__PURE__ */ new Map();
	const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
	if (title) pushCapped(out, counts, obs("HTML_TITLE", "title", collapseWs(decodeEntities(title)), url));
	for (const tag of openTags(html, "meta")) {
		const name = (attr(tag, "name") ?? attr(tag, "property") ?? "").toLowerCase();
		const content = attr(tag, "content");
		if (!content) continue;
		if (name === "generator") pushCapped(out, counts, obs("META_GENERATOR", "generator", collapseWs(content), url));
	}
	for (const tag of openTags(html, "script")) {
		const src = attr(tag, "src");
		if (src) {
			pushCapped(out, counts, obs("SCRIPT_PATH", "script_src", src, url));
			const suffix = suffixFromPath(src.split("?")[0] ?? src);
			if (suffix) pushCapped(out, counts, obs("PAGE_SUFFIX", "page_suffix", suffix, url));
		}
	}
	for (const tag of openTags(html, "link")) {
		const rel = (attr(tag, "rel") ?? "").toLowerCase();
		const href = attr(tag, "href");
		if (href && rel.includes("stylesheet")) pushCapped(out, counts, obs("CSS_PATH", "stylesheet", href, url));
	}
	for (const tag of openTags(html, "form")) {
		const action = attr(tag, "action");
		if (action) {
			pushCapped(out, counts, obs("FORM_ACTION", "form_action", action, url));
			const parsed = parseUrl(action);
			pushCapped(out, counts, obs("ROUTE", "form_action", parsed?.pathname ?? action, url));
			const suffix = suffixFromPath((parsed?.pathname ?? action).split("?")[0] ?? "");
			if (suffix) pushCapped(out, counts, obs("PAGE_SUFFIX", "page_suffix", suffix, url));
		}
	}
	for (const tag of openTags(html, "input")) {
		const name = attr(tag, "name");
		if (name) pushCapped(out, counts, obs("INPUT_NAME", "input_name", name, url));
	}
	for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
		const href = match[1];
		if (!href || href.startsWith("mailto:") || href.startsWith("javascript:")) continue;
		const path = parseUrl(href)?.pathname ?? href.split("?")[0] ?? href;
		const suffix = suffixFromPath(path);
		if (suffix) {
			pushCapped(out, counts, obs("PAGE_SUFFIX", "page_suffix", suffix, url));
			pushCapped(out, counts, obs("ROUTE", "href", path, url));
		} else if (path.includes(".action") || path.startsWith("/api/")) pushCapped(out, counts, obs("ROUTE", "href", path, url));
	}
	for (const match of html.matchAll(/["'`](\/api\/[A-Za-z0-9_\-./]+)["'`]/g)) pushCapped(out, counts, obs("ROUTE", "api_path", match[1], url));
	for (const match of html.matchAll(/["'`](\/[A-Za-z0-9_\-./]*\.action(?:\?[^"'`]*)?)["'`]/g)) {
		pushCapped(out, counts, obs("ROUTE", "action", match[1].split("?")[0] ?? match[1], url));
		pushCapped(out, counts, obs("PAGE_SUFFIX", "page_suffix", ".action", url));
	}
	for (const marker of FRAMEWORK_MARKERS) if (marker.re.test(html)) pushCapped(out, counts, obs(marker.type, marker.key, marker.value, url));
}
function collectFromJson(out, payload, url) {
	const counts = /* @__PURE__ */ new Map();
	const fingerprint = schemaFingerprint(payload);
	pushCapped(out, counts, obs("JSON_SHAPE", "schema_hash", fingerprint.schema_hash, url, {
		field_paths: fingerprint.field_paths,
		type_map: fingerprint.type_map
	}));
	const paths = collectFieldPaths(payload);
	for (const path of [...paths.keys()].sort()) {
		const name = (path.split(".").pop() ?? path).replace(/\[\]$/g, "");
		if (name) pushCapped(out, counts, obs("JSON_FIELD", "json_field", name, url));
	}
}
function collectFromRobots(out, robotsTxt, url) {
	const counts = /* @__PURE__ */ new Map();
	for (const line of robotsTxt.split(/\r?\n/)) {
		const match = line.match(/^\s*(allow|disallow)\s*:\s*(\S+)/i);
		if (!match) continue;
		const kind = match[1].toLowerCase();
		const path = match[2];
		pushCapped(out, counts, obs("ROBOTS", kind, path, url));
		if (path.startsWith("/") && path.length > 1) pushCapped(out, counts, obs("ROUTE", `robots_${kind}`, path, url));
	}
}
function collectFromSitemap(out, sitemapXml, url) {
	const counts = /* @__PURE__ */ new Map();
	for (const match of sitemapXml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
		const loc = collapseWs(decodeEntities(match[1]));
		const path = parseUrl(loc)?.pathname ?? loc;
		pushCapped(out, counts, obs("ROUTE", "sitemap", path, url));
		const suffix = suffixFromPath(path);
		if (suffix) pushCapped(out, counts, obs("PAGE_SUFFIX", "page_suffix", suffix, url));
	}
}
function paginationFromJson(value) {
	if (!value || typeof value !== "object") return null;
	if (Array.isArray(value)) return value.length > 0 ? paginationFromJson(value[0]) : null;
	const keys = new Set(Object.keys(value).map((k) => k.toLowerCase()));
	const has = (...names) => names.some((n) => keys.has(n));
	if (has("draw") && (has("recordstotal") || has("recordstotal".toLowerCase()) || has("data"))) return "DATATABLES";
	if (has("cursor", "nextcursor", "next_cursor", "nextpagetoken", "next_page_token")) return "CURSOR";
	if (has("offset") && has("limit") || has("skip") && has("take", "limit")) return "OFFSET_LIMIT";
	if (has("page", "pagenumber", "page_number", "pagina", "numeropagina", "pageindex")) return "PAGE_NUMBER";
	const rec = value;
	const links = rec._links ?? rec.links;
	if (links && typeof links === "object" && !Array.isArray(links) && "next" in links) return "NEXT_LINK";
	if (typeof rec.next === "string") return "NEXT_LINK";
	return null;
}
function paginationFromUrl(url) {
	const parsed = parseUrl(url);
	if (!parsed) return null;
	const keys = new Set([...parsed.searchParams.keys()].map((k) => k.toLowerCase()));
	const has = (...names) => names.some((n) => keys.has(n));
	if (has("draw") && has("start", "length")) return "DATATABLES";
	if (has("cursor", "nextcursor", "page_token")) return "CURSOR";
	if (has("offset") || has("limit") && has("start")) return "OFFSET_LIMIT";
	if (has("page", "pagina", "p", "pagenumber")) return "PAGE_NUMBER";
	return null;
}
function detectPagination(input) {
	const html = input.html ?? "";
	if (/javax\.faces\.ViewState/i.test(html)) return "JSF_VIEWSTATE";
	if (/name=["']__VIEWSTATE["']/.test(html) || /__doPostBack/.test(html)) return "SERVER_SIDE_FORM";
	if (/\bDataTable\b/i.test(html) && /["']draw["']/.test(html)) return "DATATABLES";
	const fromJson = input.json !== void 0 ? paginationFromJson(input.json) : null;
	if (fromJson) return fromJson;
	if (input.url) {
		const fromUrl = paginationFromUrl(input.url);
		if (fromUrl) return fromUrl;
	}
	if (/<form\b/i.test(html) && /type=["']hidden["']/i.test(html)) return "SERVER_SIDE_FORM";
	return "UNKNOWN";
}
function dedupe(rows) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const row of rows) {
		const key = `${row.observation_type}\0${row.key}\0${row.value}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(row);
	}
	return out;
}
/**
* Passive public-page extraction. Observations are facts, not vendor claims.
* Framework markers (.xhtml, JSESSIONID, ViewState) stay GENERIC_*.
*/
function extractObservations(input) {
	const out = [];
	const url = input.url;
	const counts = /* @__PURE__ */ new Map();
	collectFromUrl(out, counts, url);
	if (input.headers) collectFromHeaders(out, input.headers, url);
	collectFromCookies(out, normalizeCookies(input.cookies), url);
	if (input.html) collectFromHtml(out, input.html, url);
	if (input.json !== void 0) collectFromJson(out, input.json, url);
	if (input.robotsTxt) collectFromRobots(out, input.robotsTxt, url);
	if (input.sitemapXml) collectFromSitemap(out, input.sitemapXml, url);
	const pagination = detectPagination({
		url,
		html: input.html,
		json: input.json
	});
	if (pagination !== "UNKNOWN") pushCapped(out, counts, obs("PAGINATION_PATTERN", "pagination", pagination, url));
	return dedupe(out);
}
async function fetchPublic(url, _timeoutMs) {
	const started = Date.now();
	try {
		const res = await publicRequest(url, { method: "GET" });
		const contentType = res.headers["content-type"] ?? "";
		const result = {
			url: res.url || url,
			status: res.status,
			ok: res.ok,
			headers: res.headers,
			latency_ms: Date.now() - started
		};
		if (res.json != null) result.json = res.json;
		if (/robots\.txt/i.test(url)) result.robotsTxt = res.text;
		else if (result.json == null) result.html = res.text;
		else if (/html/i.test(contentType)) result.html = res.text;
		return result;
	} catch (err) {
		return {
			url,
			status: 0,
			ok: false,
			headers: {},
			latency_ms: Date.now() - started,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
function joinUrl(base, path) {
	if (/^https?:\/\//i.test(path)) return path;
	try {
		return new URL(path, base).toString();
	} catch {
		return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
	}
}
function originOf(url) {
	try {
		return new URL(url).origin;
	} catch {
		return null;
	}
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function toFingerprintSignatures(rows) {
	return rows.map((row) => ({
		id: row.id,
		technology_family: row.technology_family,
		signature_type: row.signature_type,
		key: row.key,
		pattern: row.pattern,
		weight: row.weight,
		required: row.required,
		description: row.description,
		source_url: row.source_url,
		is_vendor_claim: row.is_vendor_claim
	}));
}
async function upsertEndpointHealth(sql, endpointId, patch) {
	await sql.query(`insert into source_endpoint_health (
       source_endpoint_id, status, last_success_at, last_failure_at,
       consecutive_failures, latency_ms, http_status, schema_hash
     ) values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (source_endpoint_id) do update set
       status = excluded.status,
       last_success_at = coalesce(excluded.last_success_at, source_endpoint_health.last_success_at),
       last_failure_at = coalesce(excluded.last_failure_at, source_endpoint_health.last_failure_at),
       consecutive_failures = excluded.consecutive_failures,
       latency_ms = excluded.latency_ms,
       http_status = excluded.http_status,
       schema_hash = coalesce(excluded.schema_hash, source_endpoint_health.schema_hash)`, [
		endpointId,
		patch.status,
		patch.last_success_at ?? null,
		patch.last_failure_at ?? null,
		patch.consecutive_failures ?? 0,
		patch.latency_ms ?? null,
		patch.http_status ?? null,
		patch.schema_hash ?? null
	]);
}
async function handleJsonSchema(sql, sourceId, endpoint, payload, schemaAlerts) {
	const current = schemaFingerprint(payload);
	const previous = await sql.query(`select id, schema_hash from schema_fingerprint
     where source_endpoint_id = $1
     order by last_seen_at desc
     limit 1`, [endpoint.id]);
	const drift = detectSchemaDrift(previous[0]?.schema_hash ?? null, payload);
	if (previous[0] && previous[0].schema_hash === current.schema_hash) await sql.query(`update schema_fingerprint
       set sample_count = sample_count + 1, last_seen_at = now()
       where id = $1`, [previous[0].id]);
	else await sql.query(`insert into schema_fingerprint (
         id, source_endpoint_id, schema_hash, field_paths, type_map, sample_count
       ) values ($1, $2, $3, $4::jsonb, $5::jsonb, 1)`, [
		`sf_${randomUUID()}`,
		endpoint.id,
		current.schema_hash,
		JSON.stringify(current.field_paths),
		JSON.stringify(current.type_map)
	]);
	await insertSourceRecord(sql, {
		source_system_id: sourceId,
		source_entity_type: "endpoint_payload",
		source_identifier: endpoint.path || endpoint.id,
		payload_hash: payloadHash(payload),
		raw_payload: payload
	});
	if (drift.status === "SCHEMA_CHANGED") {
		schemaAlerts.push(endpoint.path || endpoint.id);
		await insertAlert(sql, {
			source_system_id: sourceId,
			alert_type: "SCHEMA_CHANGED",
			severity: "high",
			message: `Schema alterado em ${endpoint.path ?? endpoint.id}`,
			payload: {
				endpoint_id: endpoint.id,
				previous_hash: drift.previous_hash,
				current_hash: drift.current_hash
			}
		});
		await upsertEndpointHealth(sql, endpoint.id, {
			status: "SCHEMA_CHANGED",
			last_success_at: (/* @__PURE__ */ new Date()).toISOString(),
			consecutive_failures: 0,
			schema_hash: current.schema_hash
		});
	}
	return current.schema_hash;
}
async function runFingerprint(sql, sourceId) {
	const source = await getSourceById(sql, sourceId);
	if (!source) throw new Error(`source not found: ${sourceId}`);
	const runId = `run_${randomUUID()}`;
	const startedAt = (/* @__PURE__ */ new Date()).toISOString();
	await insertFingerprintRun(sql, {
		id: runId,
		source_system_id: sourceId,
		started_at: startedAt,
		completed_at: null,
		status: "RUNNING",
		candidate_family: null,
		score: null,
		evidence_count: 0,
		strong_evidence_count: 0,
		raw_result: null,
		error: null
	});
	const fetchErrors = [];
	const schemaAlerts = [];
	const captured = [];
	const policy = await sql.query(`select * from source_rate_policy where source_system_id = $1`, [sourceId]);
	const timeoutMs = Number(policy[0]?.timeout_ms ?? 8e3);
	const rps = Number(policy[0]?.requests_per_second ?? 1) || 1;
	const gapMs = Math.max(0, Math.round(1e3 / rps));
	const endpoints = await sql.query(`select id, name, path, http_method, endpoint_type, public
     from source_endpoint
     where source_system_id = $1`, [sourceId]);
	const urls = [];
	if (source.base_url) {
		urls.push({
			url: source.base_url,
			kind: "base"
		});
		const origin = originOf(source.base_url);
		if (origin) urls.push({
			url: `${origin}/robots.txt`,
			kind: "robots"
		});
	}
	for (const endpoint of endpoints) {
		if (!endpoint.public) continue;
		if ((endpoint.http_method ?? "GET").toUpperCase() !== "GET") continue;
		if (!endpoint.path && !source.base_url) continue;
		const url = source.base_url ? joinUrl(source.base_url, endpoint.path || "") : endpoint.path ?? "";
		if (url) urls.push({
			url,
			endpoint,
			kind: "endpoint"
		});
	}
	const unique = [];
	const seen = /* @__PURE__ */ new Set();
	for (const item of urls) {
		if (seen.has(item.url)) continue;
		seen.add(item.url);
		unique.push(item);
	}
	let liveFailed = 0;
	for (let i = 0; i < unique.length; i += 1) {
		const item = unique[i];
		if (i > 0 && gapMs > 0) await sleep(gapMs);
		const capturedFetch = await fetchPublic(item.url, timeoutMs);
		if (capturedFetch.error || !capturedFetch.ok) {
			liveFailed += 1;
			const message = capturedFetch.error || `HTTP ${capturedFetch.status} ${item.url}`;
			fetchErrors.push(message);
			if (item.endpoint) {
				await upsertEndpointHealth(sql, item.endpoint.id, {
					status: "FAILING",
					last_failure_at: (/* @__PURE__ */ new Date()).toISOString(),
					consecutive_failures: 1,
					latency_ms: capturedFetch.latency_ms,
					http_status: capturedFetch.status || null
				});
				await insertAlert(sql, {
					source_system_id: sourceId,
					alert_type: "ENDPOINT_DOWN",
					severity: "warning",
					message: `Endpoint público falhou: ${item.endpoint.path ?? item.url}`,
					payload: {
						url: item.url,
						status: capturedFetch.status,
						error: capturedFetch.error
					}
				});
			}
			continue;
		}
		const observations = extractObservations({
			url: capturedFetch.url,
			html: capturedFetch.html,
			headers: capturedFetch.headers,
			json: capturedFetch.json,
			robotsTxt: capturedFetch.robotsTxt
		});
		captured.push(...observations);
		if (item.endpoint) {
			const isJson = capturedFetch.json !== void 0 || item.endpoint.endpoint_type === "JSON_API" || item.endpoint.endpoint_type === "REST";
			let schemaHash = null;
			if (isJson && capturedFetch.json !== void 0) schemaHash = await handleJsonSchema(sql, sourceId, item.endpoint, capturedFetch.json, schemaAlerts);
			const healthStatus = schemaAlerts.includes(item.endpoint.path || item.endpoint.id) ? "SCHEMA_CHANGED" : "HEALTHY";
			if (healthStatus !== "SCHEMA_CHANGED") await upsertEndpointHealth(sql, item.endpoint.id, {
				status: healthStatus,
				last_success_at: (/* @__PURE__ */ new Date()).toISOString(),
				consecutive_failures: 0,
				latency_ms: capturedFetch.latency_ms,
				http_status: capturedFetch.status,
				schema_hash: schemaHash
			});
			await sql.query(`update source_endpoint set last_verified_at = now(), status = $2 where id = $1`, [item.endpoint.id, healthStatus]);
		}
	}
	if (captured.length > 0) await insertObservations(sql, sourceId, captured);
	const stored = await listObservationsForSource(sql, sourceId);
	const classification = classifySource({
		observations: stored,
		signatures: toFingerprintSignatures(await listSignatures(sql)),
		evidence: await loadEvidenceInputs(sql, sourceId),
		currentVendorFamily: VENDOR_FAMILIES.has(source.technology_family ?? "UNKNOWN") ? source.technology_family ?? "UNKNOWN" : null
	});
	const evidenceCount = classification.matches.filter((m) => m.matched).length;
	const strongEvidenceCount = classification.matches.filter((m) => m.matched && (m.signature.weight >= 12 || m.signature.is_vendor_claim)).length;
	const applied = await applyClassificationToSource(sql, sourceId, classification);
	const mayWriteVendor = VENDOR_FAMILIES.has(classification.technology_family) && (classification.evidence_level === "VERIFIED" || classification.evidence_level === "STRONG_INDICATION");
	const mayWriteFramework = FRAMEWORK_FAMILIES.has(classification.technology_family);
	const runError = unique.length > 0 && liveFailed === unique.length ? fetchErrors[0] ?? "all public fetches failed" : fetchErrors.length > 0 ? `${fetchErrors.length} fetch error(s)` : null;
	await insertFingerprintRun(sql, {
		id: runId,
		source_system_id: sourceId,
		started_at: startedAt,
		completed_at: (/* @__PURE__ */ new Date()).toISOString(),
		status: runError && liveFailed === unique.length ? "FAILED" : "COMPLETED",
		candidate_family: classification.candidate_family,
		score: classification.score,
		evidence_count: evidenceCount,
		strong_evidence_count: strongEvidenceCount,
		raw_result: {
			classification: {
				candidate_family: classification.candidate_family,
				technology_family: classification.technology_family,
				evidence_level: classification.evidence_level,
				confidence: classification.confidence,
				score: classification.score,
				vendor_score: classification.vendor_score,
				framework_score: classification.framework_score,
				conflict: classification.conflict,
				conflict_reason: classification.conflict_reason,
				claim_kind: classification.claim_kind,
				vendor_name: classification.vendor_name,
				product_name: classification.product_name
			},
			applied,
			may_write_vendor: mayWriteVendor,
			may_write_framework: mayWriteFramework,
			fetch_errors: fetchErrors,
			schema_alerts: schemaAlerts,
			observation_count: stored.length
		},
		error: runError,
		matches: classification.matches.map((match) => ({
			signature_id: match.signature.id,
			matched: match.matched,
			score: match.score,
			observed_value: match.observed_value
		}))
	});
	return {
		run_id: runId,
		source_id: sourceId,
		status: runError && liveFailed === unique.length ? "FAILED" : "COMPLETED",
		candidate_family: classification.candidate_family,
		technology_family: applied.technology_family,
		score: classification.score,
		evidence_count: evidenceCount,
		strong_evidence_count: strongEvidenceCount,
		error: runError,
		fetch_errors: fetchErrors,
		schema_alerts: schemaAlerts
	};
}
//#endregion
export { runFingerprint };
