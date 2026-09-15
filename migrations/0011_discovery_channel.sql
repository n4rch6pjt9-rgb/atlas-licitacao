-- BLL capability expansion: one source_system has N public discovery channels.
-- Additive. Does not create a vendor adapter. Does not alter M1–M6 contracts.

create table if not exists source_discovery_channel (
  id text primary key,
  source_system_id text not null references source_system (id),
  channel_type text not null,
  label text not null,
  list_url text,
  detail_url_pattern text,
  connector_type text,
  params_json jsonb,
  pagination_config jsonb,
  normalization_config jsonb,
  capabilities_json jsonb,
  readiness text not null default 'OBSERVED',
  ingest_status text not null default 'NOT_STARTED',
  captcha_constraint text,
  last_success_at timestamptz,
  last_error text,
  notes text,
  claim_kind text not null default 'PENDENTE_DE_VALIDACAO',
  data_origin text not null default 'UNKNOWN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists source_discovery_channel_src_type_idx
  on source_discovery_channel (source_system_id, channel_type);

create index if not exists source_discovery_channel_src_idx
  on source_discovery_channel (source_system_id);

create index if not exists source_discovery_channel_type_idx
  on source_discovery_channel (channel_type);

alter table source_record
  add column if not exists source_channel text;

create index if not exists source_record_channel_idx
  on source_record (source_system_id, source_channel);
