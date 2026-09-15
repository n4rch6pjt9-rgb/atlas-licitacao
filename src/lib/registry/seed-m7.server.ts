import type { Sql } from "@/lib/db";
import { classifyLocalOnly, leadTimeHours } from "./coverage.ts";
import { payloadHash } from "./hash.ts";
import { runIntelligenceJobs } from "./intelligence.server.ts";
import { normalizeObject } from "./object-normalize.ts";
import { arpSignals, resolveOrgIdentity } from "./org-identity.ts";
import { schemaFingerprint } from "./schema-fingerprint.ts";
import { pncpControl, pncpEditalUrl } from "./pncp-url.ts";

const NOW = "2026-09-14T20:00:00.000Z";
let pncpSeq = 1001;
const JSONB = new Set([
  "raw_payload",
  "payload",
  "matched_fields",
  "conflicting_fields",
  "event_types",
  "filters_json",
  "reason_json",
  "signals",
  "evidence_procurement_ids",
  "components_json",
  "weights_json",
]);

async function upsert(
  sql: Sql,
  table: string,
  row: Record<string, unknown>,
  pk = "id",
): Promise<void> {
  const keys = Object.keys(row);
  const cols = keys.join(", ");
  const placeholders = keys
    .map((key, i) => (JSONB.has(key) ? `$${i + 1}::jsonb` : `$${i + 1}`))
    .join(", ");
  const params = keys.map((key) => {
    const value = row[key];
    if (value === undefined) return null;
    if (JSONB.has(key)) {
      if (value == null) return null;
      return typeof value === "string" ? value : JSON.stringify(value);
    }
    return value;
  });
  await sql.query(
    `insert into ${table} (${cols}) values (${placeholders}) on conflict (${pk}) do nothing`,
    params,
  );
}

const CAT_SPORTS = {
  id: "cat_catmat_104217",
  catalog_type: "CATMAT",
  catalog_code: "104217",
  label: "Material / equipamento esportivo",
  classification_method: "CATALOG",
  confidence: 0.9,
};

const CAT_FOOD = {
  id: "cat_textual_alimentacao",
  catalog_type: "TEXTUAL",
  catalog_code: null as string | null,
  label: "Alimentação escolar",
  classification_method: "TEXTUAL",
  confidence: 0.55,
};

const CAT_PAVE = {
  id: "cat_textual_pavimentacao",
  catalog_type: "TEXTUAL",
  catalog_code: null as string | null,
  label: "Pavimentação asfáltica",
  classification_method: "TEXTUAL",
  confidence: 0.5,
};

const CAT_FUEL = {
  id: "cat_textual_combustivel",
  catalog_type: "TEXTUAL",
  catalog_code: null as string | null,
  label: "Combustível",
  classification_method: "TEXTUAL",
  confidence: 0.5,
};

const CAT_OFFICE = {
  id: "cat_catmat_36911",
  catalog_type: "CATMAT",
  catalog_code: "36911",
  label: "Material de expediente",
  classification_method: "CATALOG",
  confidence: 0.85,
};

type ProcSeed = {
  id: string;
  sourceId: string;
  orgName: string;
  cnpj: string | null;
  municipality: string;
  uf: string;
  ibge: string;
  object: string;
  catalog?: { catalog_type: string; catalog_code: string | null };
  value: number | null;
  opening: string;
  deadline?: string | null;
  firstLocal: string;
  firstPncp?: string | null;
  modality?: string;
  status?: string;
  localOnly?: boolean;
};

async function insertProcurement(sql: Sql, seed: ProcSeed): Promise<void> {
  const ident = resolveOrgIdentity({
    display_name: seed.orgName,
    cnpj: seed.cnpj,
    municipality: seed.municipality,
    uf: seed.uf,
    ibge_code: seed.ibge,
  });
  await upsert(sql, "organization_identity", {
    id: ident.id,
    display_name: ident.display_name,
    cnpj: ident.cnpj ?? null,
    municipality: ident.municipality ?? null,
    uf: ident.uf ?? null,
    ibge_code: ident.ibge_code ?? null,
    identity_method: ident.identity_method,
    identity_status: ident.identity_status,
    observed_at: NOW,
  });
  const normalized = normalizeObject(seed.object);
  const payload = {
    objeto: seed.object,
    resumo: seed.object,
    razaoSocial: seed.orgName,
    organizationCnpj: seed.cnpj,
    catalogCode: seed.catalog?.catalog_code ?? null,
    catalogType: seed.catalog?.catalog_type ?? null,
    valorEstimado: seed.value,
  };
  await upsert(sql, "canonical_procurement", {
    id: seed.id,
    object: seed.object,
    organization_name: seed.orgName,
    organization_cnpj: seed.cnpj,
    municipality: seed.municipality,
    uf: seed.uf,
    ibge_code: seed.ibge,
    modality: seed.modality ?? "PREGAO_ELETRONICO",
    status: seed.status ?? "PUBLICADO",
    opening_at: seed.opening,
    estimated_value: seed.value == null ? null : String(seed.value),
    publication_at: seed.firstLocal,
    proposal_deadline: seed.deadline ?? null,
    catalog_code: seed.catalog?.catalog_code ?? null,
    catalog_type: seed.catalog?.catalog_type ?? null,
    normalized_object: normalized.normalized,
    estimated_value_num: seed.value,
    organization_id: ident.id,
  });
  const ext = seed.id.replace(/^can_/, "");
  const ano = new Date(seed.opening).getUTCFullYear();
  const control = seed.cnpj
    ? pncpControl({
        cnpj: seed.cnpj,
        unidade: 1,
        numero: pncpSeq++,
        ano: Number.isFinite(ano) ? ano : 2026,
      })
    : null;
  const matched = Boolean(seed.firstPncp);
  const localOnly = seed.localOnly
    ? classifyLocalOnly({ matched: false, firstSeenAt: seed.firstLocal, now: NOW })
    : matched
      ? "MATCHED"
      : classifyLocalOnly({ matched: false, firstSeenAt: seed.firstLocal, now: NOW });
  await sql.query(
    `insert into source_record (
       id, source_system_id, source_entity_type, source_identifier, payload_hash, raw_payload,
       source_updated_at, source_url, schema_hash, first_seen_at, last_seen_at, fetched_at, local_only_state
     ) values ($1,$2,'procurement',$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12)
     on conflict do nothing`,
    [
      `rec_${seed.id}_local`,
      seed.sourceId,
      ext,
      payloadHash(payload),
      JSON.stringify(payload),
      seed.opening,
      `https://www.portaldecompraspublicas.com.br/processos/${ext}`,
      schemaFingerprint(payload).schema_hash,
      seed.firstLocal,
      NOW,
      NOW,
      localOnly,
    ],
  );
  const lead = seed.firstPncp ? leadTimeHours(seed.firstLocal, seed.firstPncp) : null;
  await sql.query(
    `insert into source_entity_link (
       id, source_system_id, source_entity_type, source_external_id,
       canonical_entity_type, canonical_entity_id, match_method, match_score, status,
       matched_fields, conflicting_fields, canonical_procurement_id,
       local_first_seen_at, pncp_first_seen_at, lead_time_hours
     ) values ($1,$2,'procurement',$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11,$12,$13,$14)
     on conflict (source_system_id, source_entity_type, source_external_id, canonical_entity_type)
     do nothing`,
    [
      `link_${seed.id}_local`,
      seed.sourceId,
      ext,
      matched ? "PNCP" : "STANDALONE",
      matched ? (control ?? `pncp-${ext}`) : null,
      matched ? "numeroControlePNCP" : "standalone_local",
      matched ? 96 : 0,
      matched ? "CONFIRMED" : "UNMATCHED",
      JSON.stringify(matched ? ["object", "organization_cnpj"] : []),
      JSON.stringify([]),
      seed.id,
      seed.firstLocal,
      seed.firstPncp ?? null,
      lead,
    ],
  );
  if (matched && seed.firstPncp) {
    await sql.query(
      `insert into source_record (
         id, source_system_id, source_entity_type, source_identifier, payload_hash, raw_payload,
         source_updated_at, source_url, schema_hash, first_seen_at, last_seen_at, fetched_at, local_only_state
       ) values ($1,'src_br_pncp','procurement',$2,$3,$4::jsonb,$5,$6,$7,$8,$9,$10,'MATCHED')
       on conflict do nothing`,
      [
        `rec_${seed.id}_pncp`,
        control ?? `pncp-${ext}`,
        payloadHash({ ...payload, numeroControlePNCP: control ?? `pncp-${ext}` }),
        JSON.stringify({ ...payload, numeroControlePNCP: control ?? `pncp-${ext}` }),
        seed.opening,
        pncpEditalUrl(control),
        schemaFingerprint(payload).schema_hash,
        seed.firstPncp,
        NOW,
        NOW,
      ],
    );
    await sql.query(
      `insert into source_entity_link (
         id, source_system_id, source_entity_type, source_external_id,
         canonical_entity_type, canonical_entity_id, match_method, match_score, status,
         matched_fields, canonical_procurement_id, local_first_seen_at, pncp_first_seen_at, lead_time_hours
       ) values ($1,'src_br_pncp','procurement',$2,'PNCP',$2,'numeroControlePNCP',100,'CONFIRMED',
         $3::jsonb,$4,$5,$6,$7)
       on conflict (source_system_id, source_entity_type, source_external_id, canonical_entity_type)
       do nothing`,
      [
        `link_${seed.id}_pncp`,
        control ?? `pncp-${ext}`,
        JSON.stringify(["numeroControlePNCP"]),
        seed.id,
        seed.firstLocal,
        seed.firstPncp,
        lead,
      ],
    );
  }
}

export async function seedMilestone7(sql: Sql): Promise<void> {
  pncpSeq = 1001;
  for (const cat of [CAT_SPORTS, CAT_FOOD, CAT_PAVE, CAT_FUEL, CAT_OFFICE]) {
    await upsert(sql, "catalog_item", {
      id: cat.id,
      catalog_type: cat.catalog_type,
      catalog_code: cat.catalog_code,
      label: cat.label,
      normalized_label: normalizeObject(cat.label).normalized,
      classification_method: cat.classification_method,
      confidence: cat.confidence,
      observed_at: NOW,
    });
  }

  const portoBelo = {
    orgName: "Prefeitura Municipal de Porto Belo",
    cnpj: "82575812000120",
    municipality: "Porto Belo",
    uf: "SC",
    ibge: "4213500",
    sourceId: "src_pcp_porto_belo_sc",
  };
  const mogi = {
    orgName: "Prefeitura Municipal de Mogi das Cruzes",
    cnpj: "46523270000188",
    municipality: "Mogi das Cruzes",
    uf: "SP",
    ibge: "3530606",
    sourceId: "src_pcp_mogi_sp",
  };
  const alegre = {
    orgName: "Prefeitura Municipal de Alegre",
    cnpj: "27111222000191",
    municipality: "Alegre",
    uf: "ES",
    ibge: "3200201",
    sourceId: "src_pcp_alegre_es",
  };

  const sportDates = [
    "2024-03-01T10:00:00.000Z",
    "2024-08-28T10:00:00.000Z",
    "2025-02-24T10:00:00.000Z",
    "2025-08-23T10:00:00.000Z",
    "2026-02-19T10:00:00.000Z",
  ];
  for (let i = 0; i < sportDates.length; i += 1) {
    await insertProcurement(sql, {
      id: `can_m7_sport_${i + 1}`,
      ...portoBelo,
      object: `Aquisição de material esportivo e aparelhos de academia — lote ${i + 1}`,
      catalog: CAT_SPORTS,
      value: 180000 + i * 5000,
      opening: sportDates[i],
      firstLocal: sportDates[i],
      firstPncp: new Date(new Date(sportDates[i]).getTime() + 36 * 3_600_000).toISOString(),
    });
    await upsert(sql, "price_observation", {
      id: `price_sport_${i + 1}`,
      catalog_item_id: CAT_SPORTS.id,
      catalog_code: CAT_SPORTS.catalog_code,
      catalog_type: "CATMAT",
      organization_id: "org_82575812000120",
      canonical_procurement_id: `can_m7_sport_${i + 1}`,
      price_kind: "ESTIMATED",
      source_kind: "LOCAL_RESULT",
      unit_price: 180000 + i * 5000,
      total_price: 180000 + i * 5000,
      observed_at: sportDates[i],
      source_system_id: portoBelo.sourceId,
    });
  }

  await insertProcurement(sql, {
    id: "can_m7_sport_now",
    ...portoBelo,
    object: "Aquisição de equipamentos esportivos para academias ao ar livre",
    catalog: CAT_SPORTS,
    value: 210000,
    opening: "2026-09-22T10:00:00.000Z",
    deadline: "2026-09-21T17:00:00.000Z",
    firstLocal: "2026-09-10T08:12:00.000Z",
    firstPncp: "2026-09-13T10:44:00.000Z",
    status: "ABERTO",
  });

  await insertProcurement(sql, {
    id: "can_m7_pave",
    ...mogi,
    object: "Contratação de empresa para obra de pavimentação asfáltica no distrito industrial",
    catalog: CAT_PAVE,
    value: 2_400_000,
    opening: "2026-03-10T10:00:00.000Z",
    firstLocal: "2026-03-10T10:00:00.000Z",
    firstPncp: "2026-03-10T16:00:00.000Z",
  });

  await insertProcurement(sql, {
    id: "can_m7_fuel_1",
    ...alegre,
    object: "Aquisição de combustível diesel para a frota municipal",
    catalog: CAT_FUEL,
    value: 420000,
    opening: "2023-10-12T10:00:00.000Z",
    firstLocal: "2023-10-12T10:00:00.000Z",
    firstPncp: "2023-10-13T10:00:00.000Z",
  });
  await insertProcurement(sql, {
    id: "can_m7_fuel_2",
    ...alegre,
    object: "Aquisição de combustível diesel para a frota municipal",
    catalog: CAT_FUEL,
    value: 455000,
    opening: "2026-08-02T10:00:00.000Z",
    firstLocal: "2026-08-02T10:00:00.000Z",
    firstPncp: "2026-08-02T18:00:00.000Z",
  });

  await insertProcurement(sql, {
    id: "can_m7_school",
    ...portoBelo,
    object: "Reforma de escola municipal no bairro Perequê",
    value: 890000,
    opening: "2025-11-04T10:00:00.000Z",
    firstLocal: "2025-11-04T10:00:00.000Z",
    firstPncp: "2025-11-05T09:00:00.000Z",
  });

  await insertProcurement(sql, {
    id: "can_m7_merenda",
    ...mogi,
    object: "Aquisição de merenda escolar para a rede municipal de ensino",
    catalog: CAT_FOOD,
    value: 760000,
    opening: "2026-09-18T10:00:00.000Z",
    deadline: "2026-09-17T17:00:00.000Z",
    firstLocal: "2026-09-12T09:00:00.000Z",
    firstPncp: "2026-09-14T11:00:00.000Z",
    status: "ABERTO",
  });

  await insertProcurement(sql, {
    id: "can_m7_office",
    orgName: "Secretaria de Administração — amostra Compras.gov",
    cnpj: "00394460000141",
    municipality: "Brasília",
    uf: "DF",
    ibge: "5300108",
    sourceId: "src_br_comprasgov",
    object: "Aquisição de material de expediente para o exercício 2026",
    catalog: CAT_OFFICE,
    value: 95000,
    opening: "2026-09-08T10:00:00.000Z",
    deadline: "2026-09-20T17:00:00.000Z",
    firstLocal: "2026-09-08T10:00:00.000Z",
    firstPncp: "2026-09-08T10:00:00.000Z",
    status: "ABERTO",
  });

  await insertProcurement(sql, {
    id: "can_m7_local_only",
    ...portoBelo,
    object: "Contratação de serviços de manutenção de quadras esportivas",
    catalog: CAT_SPORTS,
    value: 64000,
    opening: "2026-09-20T10:00:00.000Z",
    deadline: "2026-09-19T17:00:00.000Z",
    firstLocal: "2026-09-13T12:00:00.000Z",
    localOnly: true,
    status: "ABERTO",
  });

  const portoId = "org_82575812000120";
  const mogiId = "org_46523270000188";
  const dfId = "org_00394460000141";

  await upsert(sql, "planning_record", {
    id: "plan_pca_porto_sport",
    origin_type: "PCA_PNCP",
    source_system_id: "src_br_pncp",
    source_identifier: "pca-82575812000120-2026-104217",
    organization_id: portoId,
    organization_name: portoBelo.orgName,
    organization_cnpj: portoBelo.cnpj,
    municipality: "Porto Belo",
    uf: "SC",
    year: 2026,
    catalog_code: CAT_SPORTS.catalog_code,
    catalog_type: "CATMAT",
    object: "Material / equipamento esportivo — PCA 2026",
    raw_object: "Material / equipamento esportivo — PCA 2026",
    normalized_object: normalizeObject("equipamento esportivo").normalized,
    estimated_value_num: 220000,
    planned_period: "2026-Q3",
    item_number: "12",
    numero_item_pncp: "82575812000120-2026-12",
    status: "ATIVO",
    valid_from: "2026-01-01T00:00:00.000Z",
    observed_at: NOW,
  });
  await upsert(sql, "planning_record", {
    id: "plan_pca_palmas_veic",
    origin_type: "PCA_PNCP",
    source_system_id: "src_br_pncp",
    source_identifier: "pca-palmas-2026-veiculos",
    organization_id: null,
    organization_name: "Prefeitura Municipal de Palmas",
    organization_cnpj: "25094626000100",
    municipality: "Palmas",
    uf: "TO",
    year: 2026,
    object: "Aquisição de veículos para a frota municipal",
    raw_object: "Aquisição de veículos para a frota municipal",
    normalized_object: normalizeObject("aquisicao de veiculos para a frota municipal").normalized,
    estimated_value_num: 1_200_000,
    planned_period: "2026-Q4",
    status: "ATIVO",
    valid_from: "2026-01-01T00:00:00.000Z",
    observed_at: NOW,
  });
  await upsert(sql, "planning_record", {
    id: "plan_pca_mogi_merenda",
    origin_type: "PCA_PNCP",
    source_system_id: "src_br_pncp",
    source_identifier: "pca-mogi-2026-merenda",
    organization_id: mogiId,
    organization_name: mogi.orgName,
    organization_cnpj: mogi.cnpj,
    municipality: "Mogi das Cruzes",
    uf: "SP",
    year: 2026,
    object: "Gêneros alimentícios para merenda escolar",
    raw_object: "Gêneros alimentícios para merenda escolar",
    normalized_object: normalizeObject("generos alimenticios para merenda escolar").normalized,
    estimated_value_num: 740000,
    planned_period: "2026-Q3",
    status: "ATIVO",
    valid_from: "2026-01-01T00:00:00.000Z",
    observed_at: NOW,
  });
  await upsert(sql, "planning_record", {
    id: "plan_pgc_office",
    origin_type: "PGC_COMPRASGOV",
    source_system_id: "src_br_comprasgov",
    source_identifier: "pgc-00394460000141-2026-36911",
    organization_id: dfId,
    organization_name: "Secretaria de Administração — amostra Compras.gov",
    organization_cnpj: "00394460000141",
    municipality: "Brasília",
    uf: "DF",
    year: 2026,
    catalog_code: CAT_OFFICE.catalog_code,
    catalog_type: "CATMAT",
    object: "Material de expediente — PGC 2026",
    raw_object: "Material de expediente — PGC 2026",
    normalized_object: normalizeObject("material de expediente").normalized,
    estimated_value_num: 98000,
    planned_period: "2026",
    status: "ATIVO",
    valid_from: "2026-01-01T00:00:00.000Z",
    observed_at: NOW,
  });

  const arpSignalsList = arpSignals({
    remaining_ratio: 0.62,
    vigency_end: "2026-10-04T00:00:00.000Z",
    adhesions: 2,
    now: NOW,
  });
  await upsert(sql, "arp_record", {
    id: "arp_porto_sport",
    source_system_id: "src_br_comprasgov",
    source_identifier: "arp-porto-belo-sport-2025",
    organization_id: portoId,
    organization_name: portoBelo.orgName,
    uf: "SC",
    object: "Ata de registro de preços — material esportivo",
    catalog_code: CAT_SPORTS.catalog_code,
    catalog_type: "CATMAT",
    supplier_name: "Esporte Sul Ltda",
    supplier_identifier: "11222333000144",
    registered_quantity: 100,
    committed_quantity: 38,
    remaining_balance: 62,
    remaining_ratio: 0.62,
    adhesions: 2,
    vigency_start: "2025-10-15T00:00:00.000Z",
    vigency_end: "2026-10-04T00:00:00.000Z",
    status: "ACTIVE",
    signals: arpSignalsList,
    valid_from: "2025-10-15T00:00:00.000Z",
    valid_to: "2026-10-04T00:00:00.000Z",
    observed_at: NOW,
  });
  await upsert(sql, "price_observation", {
    id: "price_arp_sport",
    catalog_item_id: CAT_SPORTS.id,
    catalog_code: CAT_SPORTS.catalog_code,
    catalog_type: "CATMAT",
    organization_id: portoId,
    arp_id: "arp_porto_sport",
    price_kind: "ARP_REGISTERED",
    source_kind: "ARP",
    unit_price: 1750,
    unit: "un",
    observed_at: "2025-10-15T00:00:00.000Z",
    source_system_id: "src_br_comprasgov",
  });

  await upsert(sql, "alert_rule", {
    id: "rule_keyword_esportivo_sc",
    name: "Esportivo em SC, inclusive antecipadas",
    event_types: ["NEW_PROCUREMENT", "EARLY_SOURCE_ALERT"],
    filters_json: { keyword: "esportivo", uf: "SC", early_only: false },
    min_change_priority: "MEDIUM",
    active: true,
  });
  await upsert(sql, "alert_rule", {
    id: "rule_catmat_sport",
    name: "CATMAT 104217",
    event_types: ["NEW_PROCUREMENT", "EARLY_SOURCE_ALERT", "PCA_PUBLISHED", "RECURRENCE_SIGNAL"],
    filters_json: { catalog_code: "104217" },
    active: true,
  });
  await upsert(sql, "alert_rule", {
    id: "rule_org_porto",
    name: "Órgão Porto Belo",
    event_types: ["NEW_PROCUREMENT", "EARLY_SOURCE_ALERT", "PCA_PUBLISHED", "RECURRENCE_SIGNAL"],
    filters_json: { organization_id: portoId },
    active: true,
  });
  await upsert(sql, "alert_rule", {
    id: "rule_value_100k",
    name: "Valor acima de R$ 100 mil",
    event_types: ["NEW_PROCUREMENT", "EARLY_SOURCE_ALERT"],
    filters_json: { min_value: 100000 },
    active: true,
  });
  await upsert(sql, "alert_rule", {
    id: "rule_early",
    name: "Somente antecipadas",
    event_types: ["EARLY_SOURCE_ALERT"],
    filters_json: { early_only: true },
    active: true,
  });
  await upsert(sql, "alert_rule", {
    id: "rule_pca",
    name: "PCA publicado",
    event_types: ["PCA_PUBLISHED"],
    filters_json: {},
    active: true,
  });
  await upsert(sql, "alert_rule", {
    id: "rule_arp_exp",
    name: "ARP perto do vencimento",
    event_types: ["ARP_NEAR_EXPIRATION"],
    filters_json: {},
    active: true,
  });
  await upsert(sql, "alert_rule", {
    id: "rule_change_high",
    name: "Mudança de prazo ou status",
    event_types: ["PROCUREMENT_CHANGED"],
    filters_json: {},
    min_change_priority: "HIGH",
    active: true,
  });
  await upsert(sql, "alert_rule", {
    id: "rule_recurrence",
    name: "Sinal de recorrência",
    event_types: ["RECURRENCE_SIGNAL"],
    filters_json: {},
    active: true,
  });

  await upsert(sql, "watchlist_entry", {
    id: "wl_org_porto",
    kind: "organization",
    value: portoId,
    label: "Porto Belo",
    active: true,
  });
  await upsert(sql, "watchlist_entry", {
    id: "wl_cat_sport",
    kind: "catalog",
    value: "104217",
    label: "CATMAT 104217",
    active: true,
  });
  await upsert(sql, "watchlist_entry", {
    id: "wl_term_academia",
    kind: "term",
    value: "academia",
    label: "academia",
    active: true,
  });
  await upsert(sql, "watchlist_entry", {
    id: "wl_uf_sc",
    kind: "uf",
    value: "SC",
    label: "Santa Catarina",
    active: true,
  });

  await runIntelligenceJobs(sql);

  await sql.query(
    `insert into opportunity_event (
       id, opportunity_id, event_type, source_system_id, occurred_at, summary, payload, change_priority, observed_at
     ) values
       ($1,'opp_can_m7_sport_now','DOCUMENT_ADDED',$2,'2026-09-11T09:03:00.000Z','Documento adicionado ao processo',$3::jsonb,'MEDIUM',$4),
       ($5,'opp_can_m7_sport_now','DEADLINE_CHANGED',$2,'2026-09-15T08:00:00.000Z','Prazo de proposta alterado',$6::jsonb,'HIGH',$4),
       ($7,'opp_can_m7_sport_now','METADATA_ADJUSTED',$2,'2026-09-15T08:05:00.000Z','Ajuste de metadado interno',$8::jsonb,'LOW',$4)
     on conflict (id) do nothing`,
    [
      "ev_opp_sport_doc",
      portoBelo.sourceId,
      JSON.stringify({ field: "document" }),
      NOW,
      "ev_opp_sport_deadline",
      JSON.stringify({ field: "deadline", from: "2026-09-21T17:00:00.000Z", to: "2026-09-20T17:00:00.000Z" }),
      "ev_opp_sport_meta",
      JSON.stringify({ field: "notes" }),
    ],
  );

  await generateChangeAlerts(sql);

  const golden: Array<[string, string, string, string, string]> = [
    ["golden_early_matched", "early_matched", "opportunity", "opp_can_m7_sport_now", "Local 10/09, PNCP 13/09"],
    ["golden_local_only_prov", "local_only_provisional", "opportunity", "opp_can_m7_local_only", "Sem PNCP, dentro da janela"],
    ["golden_local_only_conf", "local_only_confirmed", "source_record", "existing_pcp_cohort", "Coorte PCP/BLL já materializada"],
    ["golden_pca_converted", "pca_converted", "planning_record", "plan_pca_porto_sport", "CNPJ+ano+CATMAT"],
    ["golden_pca_unmatched", "pca_unmatched", "planning_record", "plan_pca_palmas_veic", "Sem contratação"],
    ["golden_pca_probable", "pca_probable", "planning_record", "plan_pca_mogi_merenda", "Objeto+valor, sem id oficial"],
    ["golden_pgc_converted", "pgc_converted", "planning_record", "plan_pgc_office", "PGC ≠ PCA"],
    ["golden_recurring", "recurring_purchase", "recurrence_signal", "porto_sport", "5 compras ~180 dias"],
    ["golden_non_recurring", "non_recurring_purchase", "canonical_procurement", "can_m7_pave", "1 compra"],
    ["golden_arp_active", "arp_active", "arp_record", "arp_porto_sport", "ARP ≠ edital novo"],
    ["golden_changed", "procurement_changed", "opportunity_event", "ev_opp_sport_deadline", "Mudança HIGH de prazo"],
  ];
  for (const [id, key, type, entity, notes] of golden) {
    await upsert(sql, "golden_case", {
      id,
      case_key: key,
      expected_kind: key,
      entity_type: type,
      entity_id: entity,
      notes,
    });
  }
}

async function generateChangeAlerts(sql: Sql): Promise<void> {
  const { generateAlertEvents } = await import("./intelligence.server.ts");
  await generateAlertEvents(sql);
}
