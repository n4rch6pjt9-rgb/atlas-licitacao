import { sha256, stableStringify } from "./hash.ts";

export type SchemaFingerprintResult = {
  schema_hash: string;
  field_paths: string[];
  type_map: Record<string, string>;
};

export function jsonTypeOf(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

export function collectFieldPaths(
  value: unknown,
  prefix = "",
  acc: Map<string, string> = new Map(),
  depth = 0,
): Map<string, string> {
  if (depth > 8) return acc;
  if (Array.isArray(value)) {
    const path = prefix ? `${prefix}[]` : "[]";
    if (!acc.has(path)) acc.set(path, "array");
    if (value.length > 0) collectFieldPaths(value[0], path, acc, depth + 1);
    return acc;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const path = prefix ? `${prefix}.${key}` : key;
      const child = (value as Record<string, unknown>)[key];
      acc.set(path, jsonTypeOf(child));
      if (child && typeof child === "object") {
        collectFieldPaths(child, path, acc, depth + 1);
      }
    }
    return acc;
  }
  if (prefix && !acc.has(prefix)) acc.set(prefix, jsonTypeOf(value));
  return acc;
}

export function schemaFingerprint(payload: unknown): SchemaFingerprintResult {
  const map = collectFieldPaths(payload);
  const field_paths = [...map.keys()].sort();
  const type_map: Record<string, string> = {};
  for (const path of field_paths) type_map[path] = map.get(path) ?? "unknown";
  const schema_hash = sha256(stableStringify({ field_paths, type_map }));
  return { schema_hash, field_paths, type_map };
}

export type SchemaDriftResult = {
  status: "HEALTHY" | "SCHEMA_CHANGED" | "UNKNOWN";
  previous_hash: string | null;
  current_hash: string;
  preserved_payload: unknown;
};

export function detectSchemaDrift(
  previousHash: string | null,
  payload: unknown,
): SchemaDriftResult {
  const current = schemaFingerprint(payload);
  if (!previousHash) {
    return {
      status: "UNKNOWN",
      previous_hash: null,
      current_hash: current.schema_hash,
      preserved_payload: payload,
    };
  }
  if (previousHash !== current.schema_hash) {
    return {
      status: "SCHEMA_CHANGED",
      previous_hash: previousHash,
      current_hash: current.schema_hash,
      preserved_payload: payload,
    };
  }
  return {
    status: "HEALTHY",
    previous_hash: previousHash,
    current_hash: current.schema_hash,
    preserved_payload: payload,
  };
}
