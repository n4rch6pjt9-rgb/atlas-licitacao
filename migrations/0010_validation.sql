-- Gate 7.5: empirical validation, live planning/ARP ingest, origin tagging.
-- Additive. Does not alter M1–M6 adapters.

alter table source_record
  add column if not exists data_origin text not null default 'UNKNOWN';

alter table canonical_procurement
  add column if not exists data_origin text not null default 'UNKNOWN';

alter table planning_record
  add column if not exists data_origin text not null default 'UNKNOWN';

alter table arp_record
  add column if not exists data_origin text not null default 'UNKNOWN';

alter table opportunity
  add column if not exists data_origin text not null default 'UNKNOWN';

alter table recurrence_signal
  add column if not exists data_origin text not null default 'UNKNOWN';

create table if not exists evaluation_cohort (
  id text primary key,
  kind text not null,
  window_start timestamptz not null,
  window_end timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists evaluation_run (
  id text primary key,
  run_kind text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  rows_affected integer not null default 0,
  origin_scope text not null default 'ALL',
  payload jsonb,
  error text
);

create index if not exists evaluation_run_kind_idx on evaluation_run (run_kind, started_at);

create table if not exists labeled_link_sample (
  id text primary key,
  planning_link_id text,
  planning_record_id text,
  canonical_procurement_id text,
  link_status text not null,
  label text not null,
  protocol text not null,
  data_origin text not null,
  notes text,
  labeled_at timestamptz not null default now()
);

create table if not exists pca_pgc_relation (
  id text primary key,
  pca_planning_id text not null,
  pgc_planning_id text not null,
  status text not null,
  match_method text,
  match_score real,
  matched_fields jsonb,
  observed_at timestamptz not null default now(),
  unique (pca_planning_id, pgc_planning_id)
);

create table if not exists error_taxonomy_event (
  id text primary key,
  code text not null,
  entity_type text not null,
  entity_id text,
  notes text,
  data_origin text,
  observed_at timestamptz not null default now()
);

create table if not exists validation_metric (
  id text primary key,
  metric_name text not null,
  origin_scope text not null,
  value_num real,
  payload jsonb,
  calculated_at timestamptz not null default now(),
  unique (metric_name, origin_scope)
);

create table if not exists live_ingest_checkpoint (
  id text primary key,
  source_kind text not null unique,
  status text not null,
  http_status integer,
  rows_ingested integer not null default 0,
  source_url text,
  error text,
  fetched_at timestamptz,
  payload jsonb
);
