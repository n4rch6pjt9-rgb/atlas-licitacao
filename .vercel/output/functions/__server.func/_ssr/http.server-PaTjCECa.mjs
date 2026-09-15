//#region node_modules/.nitro/vite/services/ssr/assets/http.server-PaTjCECa.js
/**
* Conservative public GET/HEAD client for passive fingerprinting.
* Never sends credentials. Never POST. Timeouts and body caps are hard.
*/
var HTTP_TIMEOUT_MS = 8e3;
var HTTP_MAX_BODY_BYTES = 512e3;
var HTTP_USER_AGENT = "AtlasPortalRegistry/1.0 (passive public fingerprint)";
var BLOCKED_REQUEST_HEADERS = /* @__PURE__ */ new Set([
	"authorization",
	"proxy-authorization",
	"cookie",
	"x-api-key",
	"x-auth-token",
	"x-access-token"
]);
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function sanitizeHeaders(input) {
	const out = {
		"user-agent": HTTP_USER_AGENT,
		accept: "text/html,application/json;q=0.9,*/*;q=0.8"
	};
	if (!input) return out;
	for (const [rawKey, value] of Object.entries(input)) {
		const key = rawKey.toLowerCase();
		if (BLOCKED_REQUEST_HEADERS.has(key)) continue;
		if (key === "user-agent") continue;
		out[rawKey] = value;
	}
	return out;
}
function headersToRecord(headers) {
	const out = {};
	headers.forEach((value, key) => {
		out[key.toLowerCase()] = value;
	});
	return out;
}
function isRetryableError(err) {
	if (err instanceof DOMException && err.name === "AbortError") return true;
	if (err instanceof Error && err.name === "AbortError") return true;
	if (err instanceof TypeError) return true;
	if (err instanceof Error && /timeout|network|fetch|ECONN|ENOTFOUND|EAI_AGAIN|ECONNRESET/i.test(err.message)) return true;
	return false;
}
function errorMessage(err) {
	if (err instanceof Error && err.message) return err.message;
	return String(err);
}
async function readLimitedBody(res) {
	if (!res.body) {
		const fallback = await res.arrayBuffer();
		return Buffer.from(fallback).subarray(0, HTTP_MAX_BODY_BYTES).toString("utf8");
	}
	const reader = res.body.getReader();
	const chunks = [];
	let received = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (!value || value.byteLength === 0) continue;
		const remaining = HTTP_MAX_BODY_BYTES - received;
		if (remaining <= 0) {
			try {
				await reader.cancel();
			} catch {}
			break;
		}
		if (value.byteLength > remaining) {
			chunks.push(value.subarray(0, remaining));
			received += remaining;
			try {
				await reader.cancel();
			} catch {}
			break;
		}
		chunks.push(value);
		received += value.byteLength;
	}
	return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf8");
}
function parseJson(text, contentType) {
	if (!((contentType ?? "").toLowerCase().includes("json") || /^\s*[[{]/.test(text)) || !text.trim()) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
async function parseResponse(res, method) {
	const headers = headersToRecord(res.headers);
	const text = method === "HEAD" ? "" : await readLimitedBody(res);
	return {
		ok: res.ok,
		status: res.status,
		url: res.url,
		headers,
		text,
		json: parseJson(text, headers["content-type"])
	};
}
async function publicRequest(url, options = {}) {
	const method = options.method ?? "GET";
	if (method !== "GET" && method !== "HEAD") throw new Error("fingerprint http only allows GET/HEAD");
	const headers = sanitizeHeaders(options.headers);
	let lastError;
	for (let attempt = 0; attempt <= 2; attempt += 1) try {
		const res = await fetch(url, {
			method,
			headers,
			redirect: "follow",
			signal: AbortSignal.timeout(HTTP_TIMEOUT_MS)
		});
		if (res.status >= 500 && attempt < 2) {
			await sleep(200 * 2 ** attempt);
			continue;
		}
		return await parseResponse(res, method);
	} catch (err) {
		lastError = err;
		if (attempt < 2 && isRetryableError(err)) {
			await sleep(200 * 2 ** attempt);
			continue;
		}
		throw new Error(`public ${method} ${url} failed: ${errorMessage(err)}`);
	}
	throw new Error(`public ${method} ${url} failed: ${errorMessage(lastError)}`);
}
function publicGet(url, headers) {
	return publicRequest(url, {
		method: "GET",
		headers
	});
}
//#endregion
export { publicRequest as n, publicGet as t };
