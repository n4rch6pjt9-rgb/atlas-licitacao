import { createHash } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/hash-DAnDaBOp.js
function sha256(input) {
	return createHash("sha256").update(input).digest("hex");
}
function stableStringify(value) {
	return JSON.stringify(sortValue(value));
}
function sortValue(value) {
	if (Array.isArray(value)) return value.map(sortValue);
	if (value && typeof value === "object") {
		const obj = value;
		const out = {};
		for (const key of Object.keys(obj).sort()) out[key] = sortValue(obj[key]);
		return out;
	}
	return value;
}
function payloadHash(payload) {
	return sha256(stableStringify(payload ?? null));
}
//#endregion
export { sha256 as n, stableStringify as r, payloadHash as t };
