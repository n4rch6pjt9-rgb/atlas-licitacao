-- Atlas Portal Registry — additive, idempotent, PGLite-compatible (no extensions).
-- Text PKs, jsonb, timestamptz, boolean, real only.

create table if not exists jurisdiction (
  id text primary key,
  type text,
  ibge_code text,
  uf text,
  name text not null,
  cnpj text,
  parent_id text references jurisdiction (id),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists source_system (
  id text primary key,
  jurisdiction_id text not null references jurisdiction (id),
  name text not null,
  slug text not null,
  base_url text,
  functional_family text,
  technology_family text,
  vendor_name text,
  product_name text,
  vendor_evidence_level text,
  vendor_confidence real,
  public_access boolean not null default false,
  active boolean not null default true,
  pncp_overlap boolean not null default false,
  comprasgov_overlap boolean not null default false,
  discovery_strategy text,
  connector_type text,
  connector_version text,
  classification_state text,
  first_seen_at timestamptz not null default now(),
  last_verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists source_capability (
  id text primary key,
  source_system_id text not null references source_system (id),
  capability text not null,
  access_type text,
  endpoint_or_url text,
  method text,
  auth_required boolean not null default false,
  publicly_observed boolean not null default false,
  pagination_type text,
  documented boolean not null default false,
  confidence real,
  last_verified_at timestamptz,
  raw_metadata jsonb
);

create table if not exists source_endpoint (
  id text primary key,
  source_system_id text not null references source_system (id),
  name text,
  path text,
  http_method text,
  endpoint_type text,
  public boolean not null default false,
  request_schema jsonb,
  response_schema jsonb,
  pagination_type text,
  requires_cookie boolean not null default false,
  requires_csrf boolean not null default false,
  requires_auth boolean not null default false,
  status text,
  last_verified_at timestamptz
);

create table if not exists source_evidence (
  id text primary key,
  source_system_id text not null references source_system (id),
  evidence_type text,
  evidence_level text,
  title text,
  description text,
  url text,
  observed_value text,
  expected_signature text,
  captured_at timestamptz not null default now(),
  verified_by text,
  content_hash text,
  raw_payload jsonb
);

create table if not exists source_observation (
  id text primary key,
  source_system_id text not null references source_system (id),
  observation_type text not null,
  key text not null,
  value text not null,
  observed_at timestamptz not null default now(),
  source_url text,
  raw_payload jsonb
);

create table if not exists fingerprint_signature (
  id text primary key,
  technology_family text not null,
  signature_type text not null,
  key text not null,
  pattern text not null,
  weight real not null default 1,
  required boolean not null default false,
  description text,
  source_url text,
  verified_at timestamptz,
  is_vendor_claim boolean not null default false
);

create table if not exists source_fingerprint_run (
  id text primary key,
  source_system_id text not null references source_system (id),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text,
  candidate_family text,
  score real,
  evidence_count integer,
  strong_evidence_count integer,
  raw_result jsonb,
  error text
);

create table if not exists source_fingerprint_match (
  id text primary key,
  run_id text not null references source_fingerprint_run (id),
  signature_id text references fingerprint_signature (id),
  matched boolean not null default false,
  score real,
  observed_value text,
  evidence_id text references source_evidence (id)
);

create table if not exists schema_fingerprint (
  id text primary key,
  source_endpoint_id text not null references source_endpoint (id),
  schema_hash text not null,
  field_paths jsonb,
  type_map jsonb,
  sample_count integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists source_connector_config (
  source_system_id text primary key references source_system (id),
  connector_type text,
  base_url text,
  paths_json jsonb,
  default_params_json jsonb,
  headers_json jsonb,
  pagination_config jsonb,
  normalization_config jsonb,
  document_config jsonb,
  enabled boolean not null default true
);

create table if not exists source_platform_history (
  id text primary key,
  source_system_id text not null references source_system (id),
  technology_family text,
  vendor_name text,
  product_name text,
  valid_from timestamptz not null,
  valid_to timestamptz,
  evidence_id text references source_evidence (id),
  confidence real
);

create table if not exists source_system_relationship (
  id text primary key,
  source_system_id text not null references source_system (id),
  related_source_system_id text not null references source_system (id),
  relation_type text not null
);

create table if not exists source_entity_link (
  id text primary key,
  source_system_id text not null references source_system (id),
  source_entity_type text,
  source_external_id text,
  canonical_entity_type text,
  canonical_entity_id text,
  match_method text,
  match_score real,
  status text,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create table if not exists source_endpoint_health (
  source_endpoint_id text primary key references source_endpoint (id),
  status text,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  consecutive_failures integer not null default 0,
  latency_ms integer,
  http_status integer,
  schema_hash text
);

create table if not exists source_rate_policy (
  source_system_id text primary key references source_system (id),
  max_concurrency integer not null default 1,
  requests_per_second real not null default 1,
  timeout_ms integer not null default 8000,
  backoff_profile text
);

create table if not exists source_record (
  id text primary key,
  source_system_id text not null references source_system (id),
  source_entity_type text,
  source_identifier text,
  payload_hash text,
  raw_payload jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  source_updated_at timestamptz
);

create table if not exists source_alert (
  id text primary key,
  source_system_id text references source_system (id),
  alert_type text not null,
  severity text,
  message text,
  payload jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists jurisdiction_parent_id_idx on jurisdiction (parent_id);
create index if not exists jurisdiction_uf_idx on jurisdiction (uf);

create unique index if not exists source_system_slug_idx on source_system (slug);
create index if not exists source_system_jurisdiction_id_idx on source_system (jurisdiction_id);
create index if not exists source_system_technology_family_idx on source_system (technology_family);
create index if not exists source_system_functional_family_idx on source_system (functional_family);
create index if not exists source_system_connector_type_idx on source_system (connector_type);

create index if not exists source_capability_source_system_id_idx on source_capability (source_system_id);
create index if not exists source_endpoint_source_system_id_idx on source_endpoint (source_system_id);
create index if not exists source_evidence_source_system_id_idx on source_evidence (source_system_id);
create index if not exists source_observation_source_system_id_idx on source_observation (source_system_id);

create index if not exists fingerprint_signature_family_idx on fingerprint_signature (technology_family);

create index if not exists source_fingerprint_run_source_system_id_idx on source_fingerprint_run (source_system_id);
create index if not exists source_fingerprint_match_run_id_idx on source_fingerprint_match (run_id);
create index if not exists source_fingerprint_match_signature_id_idx on source_fingerprint_match (signature_id);

create index if not exists schema_fingerprint_source_endpoint_id_idx on schema_fingerprint (source_endpoint_id);
create index if not exists source_platform_history_source_system_id_idx on source_platform_history (source_system_id);
create index if not exists source_system_relationship_source_system_id_idx on source_system_relationship (source_system_id);
create index if not exists source_system_relationship_related_id_idx on source_system_relationship (related_source_system_id);
create index if not exists source_entity_link_source_system_id_idx on source_entity_link (source_system_id);
create index if not exists source_record_source_system_id_idx on source_record (source_system_id);
create index if not exists source_alert_source_system_id_idx on source_alert (source_system_id);
