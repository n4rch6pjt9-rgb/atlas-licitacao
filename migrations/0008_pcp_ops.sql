-- Milestone 6: PCP live operations, publicKey semantics, checkpoints, provenance.

alter table source_connector_config
  add column if not exists value_classification text,
  add column if not exists public_key_semantics text,
  add column if not exists public_key_fingerprint text,
  add column if not exists accept_equals_json jsonb,
  add column if not exists connector_readiness text;

alter table source_record
  add column if not exists ingestion_mode text,
  add column if not exists fetch_method text;

create table if not exists public_key_assessment (
  id text primary key,
  family text not null,
  endpoint text not null,
  semantics text not null,
  value_classification text not null,
  evidence_url text,
  excerpt text,
  key_fingerprint text,
  http_status integer,
  observed_at timestamptz not null default now(),
  notes text
);

create table if not exists ingestion_checkpoint (
  id text primary key,
  source_system_id text not null references source_system (id),
  window_start timestamptz,
  window_end timestamptz,
  page_or_cursor text,
  last_success_at timestamptz,
  records_processed integer not null default 0,
  error_count integer not null default 0,
  last_error text,
  unique (source_system_id, window_start, window_end)
);

create index if not exists ingestion_checkpoint_source_idx
  on ingestion_checkpoint (source_system_id);

create table if not exists operational_report (
  id text primary key,
  family text not null,
  window_id text,
  score_version text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
