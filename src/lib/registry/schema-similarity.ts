import { schemaFingerprint } from "./schema-fingerprint.ts";
import { schemaSimilarity } from "./family-candidates.ts";

export type SchemaClusterMember = {
  source_system_id: string;
  endpoint_id?: string;
  schema_hash: string;
  field_paths: string[];
};

export type SchemaCluster = {
  schema_hash: string;
  members: SchemaClusterMember[];
  size: number;
};

export type SchemaPairReport = {
  left_id: string;
  right_id: string;
  left_hash: string;
  right_hash: string;
  jaccard: number;
  same_hash: boolean;
  claim_kind: "FATO_VERIFICADO" | "INFERENCIA" | "PENDENTE_DE_VALIDACAO";
  note: string;
};

/**
 * Identical hashes cluster together. Near hashes are reported as similarity,
 * never as vendor proof.
 */
export function clusterBySchemaHash(members: SchemaClusterMember[]): SchemaCluster[] {
  const byHash = new Map<string, SchemaClusterMember[]>();
  for (const member of members) {
    const list = byHash.get(member.schema_hash) ?? [];
    list.push(member);
    byHash.set(member.schema_hash, list);
  }
  return [...byHash.entries()]
    .map(([schema_hash, group]) => ({
      schema_hash,
      members: group,
      size: group.length,
    }))
    .sort((a, b) => b.size - a.size);
}

export function compareSchemas(
  left: SchemaClusterMember,
  right: SchemaClusterMember,
): SchemaPairReport {
  const similar = schemaSimilarity(left.field_paths, right.field_paths);
  const same_hash = left.schema_hash === right.schema_hash;
  return {
    left_id: left.source_system_id,
    right_id: right.source_system_id,
    left_hash: left.schema_hash,
    right_hash: right.schema_hash,
    jaccard: similar.jaccard,
    same_hash,
    claim_kind: same_hash ? "FATO_VERIFICADO" : similar.jaccard >= 0.6 ? "INFERENCIA" : "PENDENTE_DE_VALIDACAO",
    note: same_hash
      ? "Hash idêntico — mesmo contrato JSON observado. Não prova fornecedor."
      : similar.jaccard >= 0.6
        ? "Schemas próximos. Similaridade técnica ≠ vendor comprovado."
        : "Schemas distintos.",
  };
}

export function fingerprintPayload(
  source_system_id: string,
  payload: unknown,
): SchemaClusterMember {
  const result = schemaFingerprint(payload);
  return {
    source_system_id,
    schema_hash: result.schema_hash,
    field_paths: result.field_paths,
  };
}
