-- Milestone 7: opportunity intelligence, planning, recurrence, ARP, alerts.
-- Additive, PGLite-compatible. Does not alter ingestion adapters.

alter table canonical_procurement
  add column if not exists publication_at timestamptz,
  add column if not exists proposal_deadline timestamptz,
  add column if not exists catalog_code text,
  add column if not exists catalog_type text,
  add column if not exists normalized_object text,
  add column if not exists estimated_value_num real,
  add column if not exists organization_id text;

create table if not exists organization_identity (
  id text primary key,
  display_name text not null,
  cnpj text,
  uasg text,
  pncp_org_id text,
  comprasgov_id text,
  municipality text,
  uf text,
  ibge_code text,
  identity_method text not null default 'CNPJ',
  identity_status text not null default 'REVIEW_REQUIRED',
  observed_at timestamptz not null default now()
);

create unique index if not exists organization_identity_cnpj_idx
  on organization_identity (cnpj)
  where cnpj is not null;

create table if not exists catalog_item (
  id text primary key,
  catalog_type text not null,
  catalog_code text,
  label text not null,
  normalized_label text,
  classification_method text not null default 'TEXTUAL',
  confidence real not null default 0.4,
  observed_at timestamptz not null default now()
);

create table if not exists first_seen_by_source (
  id text primary key,
  canonical_procurement_id text not null references canonical_procurement (id),
  source_system_id text not null references source_system (id),
  first_seen_at timestamptz not null,
  unique (canonical_procurement_id, source_system_id)
);

create table if not exists opportunity (
  id text primary key,
  canonical_procurement_id text not null references canonical_procurement (id),
  organization_id text,
  organization_name text,
  municipality text,
  uf text,
  object text,
  raw_object text,
  normalized_object text,
  catalog_code text,
  catalog_type text,
  modality text,
  status text,
  publication_at timestamptz,
  proposal_deadline timestamptz,
  opening_at timestamptz,
  estimated_value_num real,
  horizon text not null,
  early_kind text,
  first_seen_global timestamptz,
  first_seen_local timestamptz,
  first_seen_pncp timestamptz,
  first_seen_comprasgov timestamptz,
  lead_time_hours real,
  lead_class text,
  sources_count integer not null default 0,
  data_confidence real not null default 0.5,
  attention_score real,
  attention_score_version text,
  observed_at timestamptz not null default now(),
  unique (canonical_procurement_id)
);

create index if not exists opportunity_horizon_idx on opportunity (horizon);
create index if not exists opportunity_uf_idx on opportunity (uf);
create index if not exists opportunity_org_idx on opportunity (organization_id);

create table if not exists opportunity_event (
  id text primary key,
  opportunity_id text not null references opportunity (id),
  event_type text not null,
  source_system_id text,
  occurred_at timestamptz not null,
  summary text not null,
  payload jsonb,
  change_priority text,
  observed_at timestamptz not null default now()
);

create index if not exists opportunity_event_opp_idx on opportunity_event (opportunity_id, occurred_at);

create table if not exists planning_record (
  id text primary key,
  origin_type text not null,
  source_system_id text not null references source_system (id),
  source_identifier text not null,
  organization_id text,
  organization_name text,
  organization_cnpj text,
  municipality text,
  uf text,
  year integer,
  catalog_code text,
  catalog_type text,
  object text,
  raw_object text,
  normalized_object text,
  estimated_value_num real,
  planned_period text,
  item_number text,
  numero_item_pncp text,
  status text,
  valid_from timestamptz,
  valid_to timestamptz,
  observed_at timestamptz not null default now(),
  unique (source_system_id, source_identifier)
);

create index if not exists planning_record_origin_idx on planning_record (origin_type);
create index if not exists planning_record_year_idx on planning_record (year);

create table if not exists planning_procurement_link (
  id text primary key,
  planning_record_id text not null references planning_record (id),
  canonical_procurement_id text references canonical_procurement (id),
  status text not null,
  match_method text,
  match_score real,
  matched_fields jsonb,
  observed_at timestamptz not null default now(),
  unique (planning_record_id, canonical_procurement_id)
);

create table if not exists recurrence_signal (
  id text primary key,
  organization_id text not null,
  catalog_item_id text,
  group_key text not null,
  normalized_object text,
  catalog_code text,
  window_months integer not null,
  purchase_count integer not null,
  median_interval_days real,
  last_purchase_at timestamptz,
  average_value real,
  median_value real,
  seasonality text,
  signal_level text not null,
  confidence real not null,
  rationale text not null,
  evidence_procurement_ids jsonb not null,
  sample_size integer not null,
  model_version text not null,
  valid_from timestamptz,
  valid_to timestamptz,
  observed_at timestamptz not null default now(),
  unique (organization_id, group_key, model_version)
);

create table if not exists arp_record (
  id text primary key,
  source_system_id text not null references source_system (id),
  source_identifier text not null,
  organization_id text,
  organization_name text,
  uf text,
  object text,
  catalog_code text,
  catalog_type text,
  supplier_name text,
  supplier_identifier text,
  registered_quantity real,
  committed_quantity real,
  remaining_balance real,
  remaining_ratio real,
  adhesions integer,
  vigency_start timestamptz,
  vigency_end timestamptz,
  status text not null default 'ACTIVE',
  signals jsonb,
  valid_from timestamptz,
  valid_to timestamptz,
  observed_at timestamptz not null default now(),
  unique (source_system_id, source_identifier)
);

create table if not exists price_observation (
  id text primary key,
  catalog_item_id text,
  catalog_code text,
  catalog_type text,
  organization_id text,
  canonical_procurement_id text,
  arp_id text,
  price_kind text not null,
  source_kind text not null,
  unit_price real,
  total_price real,
  unit text,
  observed_at timestamptz not null default now(),
  source_system_id text
);

create table if not exists organization_profile (
  organization_id text primary key references organization_identity (id),
  procurements_12m integer not null default 0,
  procurements_24m integer not null default 0,
  estimated_value_12m real,
  modalities_json jsonb,
  top_categories_json jsonb,
  average_interval_days real,
  recurring_objects integer not null default 0,
  active_planning_items integer not null default 0,
  active_arps integer not null default 0,
  sources_count integer not null default 0,
  refreshed_at timestamptz not null default now()
);

create table if not exists item_market_profile (
  catalog_item_id text primary key references catalog_item (id),
  organizations_buying integer not null default 0,
  procurements_count integer not null default 0,
  median_price real,
  latest_price real,
  latest_price_kind text,
  active_plans integer not null default 0,
  active_arps integer not null default 0,
  recurring_buyers integer not null default 0,
  refreshed_at timestamptz not null default now()
);

create table if not exists attention_score_version (
  version text primary key,
  formula text not null,
  weights_json jsonb not null,
  documented_at timestamptz not null default now(),
  notes text
);

create table if not exists opportunity_attention_score (
  id text primary key,
  opportunity_id text not null references opportunity (id),
  score_version text not null,
  components_json jsonb not null,
  weights_json jsonb not null,
  final_score real not null,
  data_confidence real not null,
  rationale text,
  ranked_at timestamptz not null default now(),
  unique (opportunity_id, score_version)
);

create table if not exists alert_rule (
  id text primary key,
  name text not null,
  event_types jsonb not null,
  filters_json jsonb not null,
  min_change_priority text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists alert_event (
  id text primary key,
  event_key text not null,
  alert_rule_id text not null references alert_rule (id),
  entity_type text not null,
  entity_id text not null,
  event_type text not null,
  triggered_at timestamptz not null default now(),
  reason_json jsonb not null,
  unique (event_key)
);

create index if not exists alert_event_rule_idx on alert_event (alert_rule_id, triggered_at);

create table if not exists watchlist_entry (
  id text primary key,
  kind text not null,
  value text not null,
  label text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (kind, value)
);

create table if not exists daily_digest_snapshot (
  id text primary key,
  digest_date text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (digest_date)
);

create table if not exists job_run (
  id text primary key,
  job_name text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  rows_affected integer not null default 0,
  error text,
  payload jsonb
);

create index if not exists job_run_name_idx on job_run (job_name, started_at);

create table if not exists golden_case (
  id text primary key,
  case_key text not null unique,
  expected_kind text not null,
  entity_type text not null,
  entity_id text not null,
  notes text
);
