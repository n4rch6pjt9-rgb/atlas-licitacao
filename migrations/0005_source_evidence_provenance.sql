-- Milestone 3: preserve evidence provenance without rewriting history rows.
alter table source_evidence add column if not exists publisher text;
alter table source_evidence add column if not exists published_at timestamptz;
alter table source_evidence add column if not exists observed_at timestamptz;
alter table source_evidence add column if not exists vendor_name text;
alter table source_evidence add column if not exists product_name text;
alter table source_evidence add column if not exists raw_excerpt text;

-- raw_hash lives in existing content_hash. Backfill observed_at from capture.
update source_evidence
set observed_at = captured_at
where observed_at is null;
