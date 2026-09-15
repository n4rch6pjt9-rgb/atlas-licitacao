-- Milestone 3 hardening: identity uniqueness to close read-then-insert races.
-- Current-state uniqueness for capabilities (one live row per capability).

update source_record
set source_entity_type = 'procurement'
where source_entity_type is null or btrim(source_entity_type) = '';

update source_record
set source_identifier = id
where source_identifier is null or btrim(source_identifier) = '';

delete from source_record
where id not in (
  select min(id)
  from source_record
  group by source_system_id, source_entity_type, source_identifier
);

create unique index if not exists source_record_identity_idx
  on source_record (source_system_id, source_entity_type, source_identifier);

delete from source_capability
where id not in (
  select min(id)
  from source_capability
  group by source_system_id, capability
);

create unique index if not exists source_capability_current_idx
  on source_capability (source_system_id, capability);
