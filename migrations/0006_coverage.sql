-- Milestone 4: coverage of procurements, not just a catalog of portals.

alter table source_record add column if not exists fetched_at timestamptz;
alter table source_record add column if not exists local_only_state text;

update source_record
set fetched_at = coalesce(fetched_at, last_seen_at, first_seen_at)
where fetched_at is null;

alter table source_entity_link add column if not exists matched_fields jsonb;
alter table source_entity_link add column if not exists conflicting_fields jsonb;
alter table source_entity_link add column if not exists canonical_procurement_id text;
alter table source_entity_link add column if not exists local_first_seen_at timestamptz;
alter table source_entity_link add column if not exists pncp_first_seen_at timestamptz;
alter table source_entity_link add column if not exists lead_time_hours real;
alter table source_entity_link add column if not exists next_recheck_at timestamptz;

create unique index if not exists source_entity_link_identity_idx
  on source_entity_link (
    source_system_id,
    source_entity_type,
    source_external_id,
    canonical_entity_type
  );

create table if not exists canonical_procurement (
  id text primary key,
  object text,
  organization_name text,
  organization_cnpj text,
  municipality text,
  uf text,
  ibge_code text,
  modality text,
  status text,
  opening_at timestamptz,
  estimated_value text,
  created_at timestamptz not null default now()
);

alter table source_entity_link
  add column if not exists canonical_procurement_id text;

create table if not exists source_comparison (
  id text primary key,
  canonical_id text references canonical_procurement (id),
  field text not null,
  source_a_id text,
  value_a text,
  source_b_id text,
  value_b text,
  observed_at timestamptz not null default now(),
  severity text
);

create index if not exists source_comparison_canonical_idx
  on source_comparison (canonical_id);

create table if not exists municipality_census (
  id text primary key,
  jurisdiction_id text references jurisdiction (id),
  ibge_code text,
  uf text,
  name text not null,
  portal_presence text not null default 'UNKNOWN',
  source_system_id text references source_system (id),
  evidence_level text,
  adapter text,
  discovery_capability boolean not null default false,
  active boolean not null default true,
  last_verified_at timestamptz
);

create index if not exists municipality_census_uf_idx on municipality_census (uf);

create table if not exists coverage_config (
  key text primary key,
  value_num real,
  value_text text,
  description text
);

create table if not exists source_live_probe (
  id text primary key,
  source_system_id text references source_system (id),
  url text not null,
  http_status integer,
  ok boolean not null default false,
  content_type text,
  excerpt text,
  error text,
  probed_at timestamptz not null default now()
);

create index if not exists source_record_local_only_idx
  on source_record (local_only_state);
create index if not exists source_entity_link_status_idx
  on source_entity_link (status);
create index if not exists source_entity_link_canonical_idx
  on source_entity_link (canonical_procurement_id);
