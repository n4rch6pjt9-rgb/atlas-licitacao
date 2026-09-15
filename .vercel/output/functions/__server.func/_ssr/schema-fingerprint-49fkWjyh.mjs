import { n as sha256, r as stableStringify } from "./hash-DAnDaBOp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/schema-fingerprint-49fkWjyh.js
function jsonTypeOf(value) {
	if (value === null) return "null";
	if (Array.isArray(value)) return "array";
	return typeof value;
}
function collectFieldPaths(value, prefix = "", acc = /* @__PURE__ */ new Map(), depth = 0) {
	if (depth > 8) return acc;
	if (Array.isArray(value)) {
		const path = prefix ? `${prefix}[]` : "[]";
		if (!acc.has(path)) acc.set(path, "array");
		if (value.length > 0) collectFieldPaths(value[0], path, acc, depth + 1);
		return acc;
	}
	if (value && typeof value === "object") {
		for (const key of Object.keys(value).sort()) {
			const path = prefix ? `${prefix}.${key}` : key;
			const child = value[key];
			acc.set(path, jsonTypeOf(child));
			if (child && typeof child === "object") collectFieldPaths(child, path, acc, depth + 1);
		}
		return acc;
	}
	if (prefix && !acc.has(prefix)) acc.set(prefix, jsonTypeOf(value));
	return acc;
}
function schemaFingerprint(payload) {
	const map = collectFieldPaths(payload);
	const field_paths = [...map.keys()].sort();
	const type_map = {};
	for (const path of field_paths) type_map[path] = map.get(path) ?? "unknown";
	return {
		schema_hash: sha256(stableStringify({
			field_paths,
			type_map
		})),
		field_paths,
		type_map
	};
}
function detectSchemaDrift(previousHash, payload) {
	const current = schemaFingerprint(payload);
	if (!previousHash) return {
		status: "UNKNOWN",
		previous_hash: null,
		current_hash: current.schema_hash,
		preserved_payload: payload
	};
	if (previousHash !== current.schema_hash) return {
		status: "SCHEMA_CHANGED",
		previous_hash: previousHash,
		current_hash: current.schema_hash,
		preserved_payload: payload
	};
	return {
		status: "HEALTHY",
		previous_hash: previousHash,
		current_hash: current.schema_hash,
		preserved_payload: payload
	};
}
//#endregion
export { detectSchemaDrift as n, schemaFingerprint as r, collectFieldPaths as t };
