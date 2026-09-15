-- Additive provenance on ingested source records.
alter table source_record add column if not exists source_url text;
alter table source_record add column if not exists schema_hash text;
