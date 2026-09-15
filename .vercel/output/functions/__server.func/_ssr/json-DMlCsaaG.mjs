//#region node_modules/.nitro/vite/services/ssr/assets/json-DMlCsaaG.js
function asJsonObject(value) {
	if (value && typeof value === "object" && !Array.isArray(value)) return value;
	return {};
}
function readString(value, fallback = "") {
	if (typeof value === "string") return value;
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
	if (typeof value === "boolean") return value ? "true" : "false";
	return fallback;
}
function readStringOrNull(value) {
	if (value == null) return null;
	const text = readString(value);
	return text ? text : null;
}
function readNumber(value, fallback = 0) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return fallback;
}
function readBool(value) {
	return value === true || value === "t" || value === "true";
}
function asEnum(value, allowed, fallback) {
	return typeof value === "string" && allowed.includes(value) ? value : fallback;
}
//#endregion
export { readString as a, readNumber as i, asJsonObject as n, readStringOrNull as o, readBool as r, asEnum as t };
