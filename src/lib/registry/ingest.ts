import { payloadHash } from "./hash.ts";
import { schemaFingerprint } from "./schema-fingerprint.ts";
import type { HealthState } from "./types.ts";

export type SourceRecordInput = {
  source_system_id: string;
  source_identifier: string;
  raw_payload: unknown;
  source_entity_type?: string;
  source_url?: string | null;
};

export type SourceRecord = {
  source_system_id: string;
  source_identifier: string;
  source_entity_type: string;
  payload_hash: string;
  schema_hash: string;
  raw_payload: unknown;
  status: HealthState;
  source_url: string | null;
};

function recordKey(row: {
  source_system_id: string;
  source_identifier: string;
  source_entity_type?: string;
}): string {
  return `${row.source_system_id}\0${row.source_entity_type ?? "procurement"}\0${row.source_identifier}`;
}

export function upsertSourceRecord(
  existing: SourceRecord | null | undefined,
  incoming: SourceRecordInput,
): SourceRecord {
  const schema = schemaFingerprint(incoming.raw_payload);
  const nextHash = payloadHash(incoming.raw_payload);
  let status: HealthState = "HEALTHY";
  if (existing && existing.schema_hash !== schema.schema_hash) {
    status = "SCHEMA_CHANGED";
  }
  return {
    source_system_id: incoming.source_system_id,
    source_identifier: incoming.source_identifier,
    source_entity_type:
      incoming.source_entity_type ?? existing?.source_entity_type ?? "procurement",
    payload_hash: nextHash,
    schema_hash: schema.schema_hash,
    raw_payload: incoming.raw_payload,
    status,
    source_url: incoming.source_url ?? existing?.source_url ?? null,
  };
}

/**
 * In-memory upsert. Schema drift never drops raw_payload.
 */
export function ingestRecords(
  existing: SourceRecord[],
  incoming: SourceRecordInput[],
): SourceRecord[] {
  const out = existing.map((row) => ({ ...row }));
  const index = new Map<string, number>();
  out.forEach((row, i) => index.set(recordKey(row), i));

  for (const item of incoming) {
    const key = recordKey(item);
    const prevIndex = index.get(key);
    const previous = prevIndex === undefined ? null : out[prevIndex];
    const next = upsertSourceRecord(previous, item);
    if (prevIndex === undefined) {
      index.set(key, out.length);
      out.push(next);
    } else {
      out[prevIndex] = next;
    }
  }

  return out;
}
