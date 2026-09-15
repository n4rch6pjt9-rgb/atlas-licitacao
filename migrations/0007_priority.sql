-- Milestone 5: versioned priority scores, temporal coverage windows, probes.

create table if not exists priority_score_version (
  version text primary key,
  formula text not null,
  weights_json jsonb not null,
  documented_at timestamptz not null default now(),
  notes text
);

create table if not exists coverage_window (
  id text primary key,
  window_start timestamptz not null,
  window_end timestamptz not null,
  label text not null,
  metric_version text not null,
  notes text
);

create table if not exists family_coverage_metric (
  id text primary key,
  window_id text not null references coverage_window (id),
  family text not null,
  records_ingested integer not null default 0,
  records_matched_pncp integer not null default 0,
  records_matched_comprasgov integer not null default 0,
  records_local_only_provisional integer not null default 0,
  records_local_only_confirmed integer not null default 0,
  pncp_record_overlap_ratio real,
  comprasgov_record_overlap_ratio real,
  median_lead_time_hours real,
  p75_lead_time_hours real,
  p95_lead_time_hours real,
  record_conflict_ratio real,
  successful_fetch_ratio real,
  schema_drift_count integer not null default 0,
  average_records_per_day real,
  estimated_records_month integer,
  estimation_method text,
  estimation_confidence text,
  missing_object_rate real,
  missing_dates_rate real,
  adapter_fit text,
  integration_cost real,
  maintenance_risk real,
  uncaptured_volume real,
  public_access_score real,
  source_reliability real,
  evidence_confidence real,
  historical_depth real,
  technical_reuse real,
  sample_size integer,
  unique (window_id, family)
);

create table if not exists family_priority_score (
  id text primary key,
  window_id text not null references coverage_window (id),
  family text not null,
  score_version text not null,
  components_json jsonb not null,
  weights_json jsonb not null,
  final_score real not null,
  rationale text,
  ranked_at timestamptz not null default now(),
  unique (window_id, family, score_version)
);

create table if not exists source_probe_run (
  id text primary key,
  source_system_id text references source_system (id),
  family text,
  url text not null,
  http_status integer,
  latency_ms integer,
  content_type text,
  page_size integer,
  ok boolean not null default false,
  excerpt text,
  error text,
  robots text,
  fingerprint_excerpt text,
  probed_at timestamptz not null default now()
);

create index if not exists source_probe_run_family_idx on source_probe_run (family);

create table if not exists municipality_base (
  ibge_code text primary key,
  uf text not null,
  name text not null,
  population integer,
  portal_status text not null default 'UNKNOWN'
);

create index if not exists municipality_base_uf_idx on municipality_base (uf);
