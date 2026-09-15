import type { Sql } from "@/lib/db";

export type CheckpointRow = {
  id: string;
  source_system_id: string;
  window_start: string | null;
  window_end: string | null;
  page_or_cursor: string | null;
  last_success_at: string | null;
  records_processed: number;
  error_count: number;
  last_error: string | null;
};

export async function upsertCheckpoint(
  sql: Sql,
  input: {
    source_system_id: string;
    window_start?: string | null;
    window_end?: string | null;
    page_or_cursor?: string | null;
    records_processed: number;
    error_count?: number;
    last_error?: string | null;
  },
): Promise<void> {
  const id = `ckpt_${input.source_system_id}_${input.window_start ?? "open"}`;
  await sql.query(
    `insert into ingestion_checkpoint (
       id, source_system_id, window_start, window_end, page_or_cursor,
       last_success_at, records_processed, error_count, last_error
     ) values ($1,$2,$3,$4,$5,now(),$6,$7,$8)
     on conflict (source_system_id, window_start, window_end) do update set
       page_or_cursor = excluded.page_or_cursor,
       last_success_at = excluded.last_success_at,
       records_processed = excluded.records_processed,
       error_count = excluded.error_count,
       last_error = excluded.last_error`,
    [
      id,
      input.source_system_id,
      input.window_start ?? null,
      input.window_end ?? null,
      input.page_or_cursor ?? null,
      input.records_processed,
      input.error_count ?? 0,
      input.last_error ?? null,
    ],
  );
}

export async function loadCheckpoint(
  sql: Sql,
  sourceSystemId: string,
  windowStart: string | null,
  windowEnd: string | null,
): Promise<CheckpointRow | null> {
  const rows = await sql.query<Record<string, unknown>>(
    `select * from ingestion_checkpoint
     where source_system_id = $1
       and window_start is not distinct from $2
       and window_end is not distinct from $3`,
    [sourceSystemId, windowStart, windowEnd],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    source_system_id: String(row.source_system_id),
    window_start: row.window_start == null ? null : String(row.window_start),
    window_end: row.window_end == null ? null : String(row.window_end),
    page_or_cursor: row.page_or_cursor == null ? null : String(row.page_or_cursor),
    last_success_at: row.last_success_at == null ? null : String(row.last_success_at),
    records_processed: Number(row.records_processed ?? 0),
    error_count: Number(row.error_count ?? 0),
    last_error: row.last_error == null ? null : String(row.last_error),
  };
}
