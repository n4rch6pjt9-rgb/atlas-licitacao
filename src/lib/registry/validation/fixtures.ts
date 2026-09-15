import { normalizeObject, recurrenceGroupKey } from "../object-normalize.ts";
import type { RecurrencePurchase } from "../recurrence.ts";
import type { AttentionInput } from "../attention.ts";
import type { RecurrenceSeries } from "./recurrence-eval.ts";
import type { LinkCandidate } from "./planning-precision.ts";
import type { RankedOpportunity } from "./attention-audit.ts";
import type { LateMatchRow } from "./window-eval.ts";
import type { PlanningSide } from "./pca-pgc.ts";
import type { AlertEvalEvent } from "./alert-quality.ts";
import type { AlertRuleDef } from "../alerts.ts";

function purchase(id: string, at: string, object: string, value: number): RecurrencePurchase {
  return {
    canonical_id: id,
    occurred_at: at,
    value,
    normalized: normalizeObject(object),
  };
}

function dated(
  prefix: string,
  object: string,
  value: number,
  dates: string[],
): RecurrencePurchase[] {
  return dates.map((at, i) => purchase(`${prefix}_${i}`, `${at}T10:00:00.000Z`, object, value));
}

function series(args: {
  id: string;
  org: string;
  category: string;
  object: string;
  value: number;
  dates: string[];
  origin?: string;
}): RecurrenceSeries {
  return {
    id: args.id,
    organization_id: args.org,
    category: args.category,
    data_origin: args.origin ?? "SYNTHETIC",
    purchases: dated(args.id, args.object, args.value, args.dates),
  };
}

/**
 * Synthetic temporal series. Tagged SYNTHETIC.
 * Calibration purchases sit on or before T=2026-06-30.
 * Follow-through for 30/60d sits in Jul–Aug (validation). Holdout ≥ 2026-09-01 is unused in calibration.
 * n HIGH/MEDIUM still < 30 — amostra cresce, não fabrica GO estatístico.
 */
export function g75RecurrenceSeries(): RecurrenceSeries[] {
  return [
    {
      id: "series_diesel_monthly",
      organization_id: "org_27111222000191",
      category: "combustivel",
      data_origin: "SYNTHETIC",
      purchases: [
        purchase("d1", "2026-01-10T10:00:00.000Z", "Aquisição de combustível diesel", 400000),
        purchase("d2", "2026-02-12T10:00:00.000Z", "Aquisição de combustível diesel", 410000),
        purchase("d3", "2026-03-11T10:00:00.000Z", "Aquisição de combustível diesel", 405000),
        purchase("d4", "2026-04-09T10:00:00.000Z", "Aquisição de combustível diesel", 420000),
        purchase("d5", "2026-05-10T10:00:00.000Z", "Aquisição de combustível diesel", 415000),
        purchase("d6", "2026-07-08T10:00:00.000Z", "Aquisição de combustível diesel", 430000),
      ],
    },
    {
      id: "series_sport_semestral",
      organization_id: "org_82575812000120",
      category: "material_esportivo",
      data_origin: "SYNTHETIC",
      purchases: [
        purchase("s1", "2024-03-01T10:00:00.000Z", "Aquisição de material esportivo e aparelhos de academia", 180000),
        purchase("s2", "2024-08-28T10:00:00.000Z", "Aquisição de material esportivo e aparelhos de academia", 185000),
        purchase("s3", "2025-02-24T10:00:00.000Z", "Aquisição de material esportivo e aparelhos de academia", 190000),
        purchase("s4", "2025-08-23T10:00:00.000Z", "Aquisição de material esportivo e aparelhos de academia", 195000),
        purchase("s5", "2026-02-19T10:00:00.000Z", "Aquisição de material esportivo e aparelhos de academia", 200000),
        purchase("s6", "2026-09-22T10:00:00.000Z", "Aquisição de equipamentos esportivos para academias", 210000),
      ],
    },
    {
      id: "series_merenda_annual",
      organization_id: "org_46523270000188",
      category: "alimentacao_escolar",
      data_origin: "SYNTHETIC",
      purchases: [
        purchase("m1", "2024-02-15T10:00:00.000Z", "Gêneros alimentícios para merenda escolar", 700000),
        purchase("m2", "2025-02-18T10:00:00.000Z", "Aquisição de merenda escolar para a rede municipal", 740000),
        purchase("m3", "2026-02-20T10:00:00.000Z", "Gêneros alimentícios para merenda escolar", 760000),
      ],
    },
    {
      id: "series_ti_sparse",
      organization_id: "org_00394460000141",
      category: "ti",
      data_origin: "SYNTHETIC",
      purchases: [
        purchase("t1", "2024-11-01T10:00:00.000Z", "Contratação de suporte de TI e datacenter", 120000),
        purchase("t2", "2026-05-02T10:00:00.000Z", "Contratação de suporte de TI e datacenter", 130000),
      ],
    },
    {
      id: "series_meds_none",
      organization_id: "org_00394452000103",
      category: "medicamentos",
      data_origin: "SYNTHETIC",
      purchases: [
        purchase("md1", "2025-06-01T10:00:00.000Z", "Aquisição de medicamentos hospitalares OPME", 500000),
      ],
    },
    {
      id: "series_obras_once",
      organization_id: "org_46523270000188",
      category: "obras",
      data_origin: "SYNTHETIC",
      purchases: [
        purchase("o1", "2026-03-10T10:00:00.000Z", "Obra de pavimentação asfáltica no distrito industrial", 2400000),
      ],
    },
    series({
      id: "series_limpeza_quarterly",
      org: "org_limpeza_sc",
      category: "limpeza",
      object: "Contratação de serviços de limpeza predial",
      value: 85000,
      dates: [
        "2024-07-01",
        "2024-10-01",
        "2025-01-02",
        "2025-04-02",
        "2025-07-03",
        "2025-10-03",
        "2026-01-05",
        "2026-04-06",
        "2026-07-15",
      ],
    }),
    series({
      id: "series_expediente_bimonthly",
      org: "org_expediente_df",
      category: "expediente",
      object: "Aquisição de material de expediente",
      value: 42000,
      dates: ["2025-08-10", "2025-10-12", "2025-12-11", "2026-02-10", "2026-04-09", "2026-06-08", "2026-08-10"],
    }),
    series({
      id: "series_agua_monthly",
      org: "org_agua_joinville",
      category: "agua",
      object: "Aquisição de água mineral para as secretarias",
      value: 18000,
      dates: [
        "2026-01-08",
        "2026-02-09",
        "2026-03-10",
        "2026-04-08",
        "2026-05-11",
        "2026-06-09",
        "2026-07-10",
      ],
    }),
    series({
      id: "series_energia_monthly",
      org: "org_energia_itajai",
      category: "energia",
      object: "Fornecimento de energia elétrica para unidades administrativas",
      value: 220000,
      dates: [
        "2026-01-05",
        "2026-02-05",
        "2026-03-05",
        "2026-04-06",
        "2026-05-05",
        "2026-06-05",
        "2026-07-06",
      ],
    }),
    series({
      id: "series_copias_monthly",
      org: "org_copias_blumenau",
      category: "copias",
      object: "Locação de equipamentos de impressão e cópias",
      value: 31000,
      dates: [
        "2026-01-12",
        "2026-02-12",
        "2026-03-12",
        "2026-04-13",
        "2026-05-12",
        "2026-06-12",
        "2026-08-03",
      ],
    }),
    series({
      id: "series_pneus_semestral",
      org: "org_pneus_sc",
      category: "pneus",
      object: "Aquisição de pneus para a frota municipal",
      value: 95000,
      dates: ["2024-09-01", "2025-03-04", "2025-09-02", "2026-03-03"],
    }),
    series({
      id: "series_manutencao_quarterly",
      org: "org_manut_balneario",
      category: "manutencao",
      object: "Manutenção predial das unidades de saúde",
      value: 64000,
      dates: ["2025-03-01", "2025-06-02", "2025-09-01", "2025-12-02", "2026-03-03", "2026-06-02"],
    }),
    series({
      id: "series_uniformes_annual",
      org: "org_uniforme_mogi",
      category: "uniformes",
      object: "Aquisição de uniformes escolares",
      value: 280000,
      dates: ["2024-01-20", "2025-01-18", "2026-01-19"],
    }),
    series({
      id: "series_transporte_annual",
      org: "org_transporte_sc",
      category: "transporte_escolar",
      object: "Transporte escolar da rede municipal",
      value: 910000,
      dates: ["2024-12-10", "2025-12-12"],
    }),
    series({
      id: "series_internet_annual",
      org: "org_internet_df",
      category: "internet",
      object: "Link de internet para a sede administrativa",
      value: 48000,
      dates: ["2025-03-01", "2026-03-02"],
    }),
    series({
      id: "series_medicamentos_monthly",
      org: "org_farmacia_sc",
      category: "medicamentos",
      object: "Aquisição de medicamentos da atenção básica",
      value: 310000,
      dates: [
        "2026-01-15",
        "2026-02-16",
        "2026-03-16",
        "2026-04-15",
        "2026-05-15",
        "2026-06-16",
        "2026-07-16",
      ],
    }),
    series({
      id: "series_passagens_sparse",
      org: "org_passagens_to",
      category: "passagens",
      object: "Passagens aéreas para o país",
      value: 22000,
      dates: ["2024-05-01", "2026-04-20"],
    }),
    series({
      id: "series_consultoria_once",
      org: "org_consult_sp",
      category: "consultoria",
      object: "Consultoria para plano diretor",
      value: 180000,
      dates: ["2026-02-01"],
    }),
    series({
      id: "series_reforma_once",
      org: "org_reforma_pa",
      category: "obras",
      object: "Reforma de escola municipal no bairro central",
      value: 1500000,
      dates: ["2026-05-20"],
    }),
  ];
}

/** Group stored procurements into recurrence series. Holdout dates stay in the series but never calibrate the signal. */
export function seriesFromProcurements(
  rows: Array<{
    id: string;
    organization_id: string | null;
    object: string | null;
    occurred_at: string | null;
    estimated_value_num: number | null;
    data_origin?: string | null;
    catalog_code?: string | null;
  }>,
  t: string,
): RecurrenceSeries[] {
  const groups = new Map<
    string,
    { org: string; category: string; origin: string; purchases: RecurrencePurchase[] }
  >();
  for (const row of rows) {
    if (!row.organization_id || !row.occurred_at) continue;
    const normalized = normalizeObject(row.object);
    const key = recurrenceGroupKey({
      organizationId: row.organization_id,
      catalogCode: row.catalog_code,
      normalized,
    });
    const origin = row.data_origin && row.data_origin !== "UNKNOWN" ? row.data_origin : "SYNTHETIC";
    const bucket = groups.get(key) ?? {
      org: row.organization_id,
      category: normalized.synonym_bucket ?? normalized.normalized.slice(0, 40),
      origin,
      purchases: [],
    };
    bucket.purchases.push({
      canonical_id: row.id,
      occurred_at: row.occurred_at,
      value: row.estimated_value_num,
      normalized,
      catalog_code: row.catalog_code,
    });
    if (origin === "LIVE") bucket.origin = "LIVE";
    groups.set(key, bucket);
  }
  const out: RecurrenceSeries[] = [];
  for (const [key, bucket] of groups) {
    const visible = bucket.purchases.filter((p) => p.occurred_at <= t);
    if (visible.length < 2) continue;
    out.push({
      id: `db_${key}`.slice(0, 80),
      organization_id: bucket.org,
      category: bucket.category,
      data_origin: bucket.origin,
      purchases: bucket.purchases,
    });
  }
  return out;
}

export function mergeRecurrenceSeries(primary: RecurrenceSeries[], extra: RecurrenceSeries[]): RecurrenceSeries[] {
  const seen = new Set(primary.map((row) => row.id));
  const out = [...primary];
  for (const row of extra) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

export const G75_OBJECT_PAIRS: Array<{ left: string; right: string; expected: boolean }> = [
  {
    left: "Aquisição de material esportivo e aparelhos de academia",
    right: "Equipamentos esportivos para academias ao ar livre",
    expected: true,
  },
  {
    left: "Gêneros alimentícios para merenda escolar",
    right: "Aquisição de merenda escolar para a rede municipal",
    expected: true,
  },
  {
    left: "Aquisição de combustível diesel",
    right: "Aquisição de gasolina para a frota",
    expected: true,
  },
  {
    left: "Contratação de suporte de TI e datacenter",
    right: "Aquisição de medicamentos hospitalares",
    expected: false,
  },
  {
    left: "Obra de pavimentação asfáltica",
    right: "Serviço educacional de doutorado em informática",
    expected: false,
  },
  {
    left: "Passagens para o país",
    right: "Material esportivo",
    expected: false,
  },
];

function attention(partial: Partial<AttentionInput>): AttentionInput {
  return {
    freshness: 0.4,
    lead_time: 0.4,
    deadline_urgency: 0.4,
    organization_recurrence: 0.4,
    category_relevance: 0.4,
    planning_confirmation: 0.4,
    estimated_value: 0.4,
    data_quality: 0.4,
    source_confidence: 0.4,
    ...partial,
  };
}

export function g75AttentionRows(): RankedOpportunity[] {
  const rows: RankedOpportunity[] = [
    {
      id: "att_fresh_early",
      object: "Material esportivo — edital aberto",
      organization_name: "Porto Belo",
      data_origin: "SYNTHETIC",
      data_confidence: 0.9,
      input: attention({
        freshness: 1,
        lead_time: 1,
        deadline_urgency: 0.85,
        organization_recurrence: 0.9,
        planning_confirmation: 0.8,
        data_quality: 0.9,
        source_confidence: 0.8,
        estimated_value: 0.7,
      }),
    },
    {
      id: "att_stale_low",
      object: "Pavimentação 2025 já encerrada",
      organization_name: "Mogi",
      data_origin: "SYNTHETIC",
      data_confidence: 0.6,
      input: attention({
        freshness: 0.15,
        lead_time: 0,
        deadline_urgency: 0.05,
        organization_recurrence: 0.1,
        planning_confirmation: 0,
        estimated_value: 1,
        data_quality: 0.5,
        source_confidence: 0.5,
      }),
    },
    {
      id: "att_high_score_low_conf",
      object: "Objeto ilegível",
      organization_name: null,
      data_origin: "SYNTHETIC",
      data_confidence: 0.1,
      input: attention({
        freshness: 1,
        lead_time: 1,
        deadline_urgency: 1,
        organization_recurrence: 1,
        planning_confirmation: 1,
        estimated_value: 1,
        data_quality: 0.1,
        source_confidence: 0.1,
      }),
    },
    {
      id: "att_high_score_stale",
      object: "Registro de preços 2024 sem prazo",
      organization_name: "Palmas",
      data_origin: "SYNTHETIC",
      data_confidence: 0.4,
      input: attention({
        freshness: 0.1,
        lead_time: 0.1,
        deadline_urgency: 0.1,
        organization_recurrence: 0.9,
        planning_confirmation: 0.9,
        estimated_value: 1,
        data_quality: 0.7,
        source_confidence: 0.7,
      }),
    },
  ];
  for (let i = 0; i < 12; i += 1) {
    rows.push({
      id: `att_mid_${i}`,
      object: `Item ${i}`,
      organization_name: "Fazenda",
      data_origin: "SYNTHETIC",
      data_confidence: 0.5,
      input: attention({
        freshness: 0.3 + (i % 5) * 0.1,
        estimated_value: 0.2 + (i % 4) * 0.15,
        deadline_urgency: 0.2 + (i % 3) * 0.2,
      }),
    });
  }
  return rows;
}

export function g75LabeledLinks(): LinkCandidate[] {
  const out: LinkCandidate[] = [];
  for (let i = 0; i < 40; i += 1) {
    out.push({
      id: `lab_conf_ok_${i}`,
      planning_id: `plan_ok_${i}`,
      procurement_id: `can_ok_${i}`,
      status: "CONFIRMED",
      match_method: i % 2 === 0 ? "official_item_id" : "cnpj_year_catalog",
      match_score: i % 2 === 0 ? 100 : 96,
      matched_fields:
        i % 2 === 0 ? ["numero_item_pncp", "organization_cnpj"] : ["organization_cnpj", "year", "catalog_code"],
      data_origin: "SYNTHETIC",
      planning_origin: i % 3 === 0 ? "PGC_COMPRASGOV" : "PCA_PNCP",
    });
  }
  // 8 CONFIRMED sem identificador oficial — o resolver endurecido reclassifica.
  // 3 com CNPJ+ano+valor → PROBABLE. 5 só objeto → REVIEW_REQUIRED.
  for (let i = 0; i < 3; i += 1) {
    out.push({
      id: `lab_conf_bad_${i}`,
      planning_id: `plan_bad_${i}`,
      procurement_id: `can_bad_${i}`,
      status: "CONFIRMED",
      match_method: "cnpj_year_object_value",
      match_score: 88,
      matched_fields: ["organization_cnpj", "year", "value"],
      data_origin: "SYNTHETIC",
      planning_origin: "PCA_PNCP",
    });
  }
  for (let i = 3; i < 8; i += 1) {
    out.push({
      id: `lab_conf_bad_${i}`,
      planning_id: `plan_bad_${i}`,
      procurement_id: `can_bad_${i}`,
      status: "CONFIRMED",
      match_method: "object_only",
      match_score: 70,
      matched_fields: ["object"],
      data_origin: "SYNTHETIC",
      planning_origin: "PCA_PNCP",
    });
  }
  for (let i = 0; i < 30; i += 1) {
    out.push({
      id: `lab_prob_${i}`,
      planning_id: `plan_prob_${i}`,
      procurement_id: `can_prob_${i}`,
      status: "PROBABLE",
      match_method: "cnpj_year_synonym_value",
      match_score: 88,
      matched_fields: ["organization_cnpj", "year", "value", "object"],
      data_origin: "SYNTHETIC",
      planning_origin: "PCA_PNCP",
    });
  }
  for (let i = 0; i < 12; i += 1) {
    out.push({
      id: `lab_rev_${i}`,
      planning_id: `plan_rev_${i}`,
      procurement_id: `can_rev_${i}`,
      status: "REVIEW_REQUIRED",
      match_method: "cnpj_category",
      match_score: 55,
      matched_fields: ["organization_cnpj", "object"],
      data_origin: "SYNTHETIC",
      planning_origin: "PCA_PNCP",
    });
  }
  for (let i = 0; i < 10; i += 1) {
    out.push({
      id: `lab_un_${i}`,
      planning_id: `plan_un_${i}`,
      procurement_id: null,
      status: "UNMATCHED",
      match_method: "none",
      match_score: 0,
      matched_fields: [],
      data_origin: "SYNTHETIC",
      planning_origin: "PCA_PNCP",
    });
  }
  return out;
}

export function g75LateMatches(): LateMatchRow[] {
  return [
    {
      id: "lm_6h",
      data_origin: "FIXTURE",
      first_seen_local: "2026-03-01T08:00:00.000Z",
      first_seen_pncp: "2026-03-01T14:00:00.000Z",
      matched: true,
    },
    {
      id: "lm_30h",
      data_origin: "FIXTURE",
      first_seen_local: "2026-03-02T08:00:00.000Z",
      first_seen_pncp: "2026-03-03T14:00:00.000Z",
      matched: true,
    },
    {
      id: "lm_80h",
      data_origin: "FIXTURE",
      first_seen_local: "2026-03-04T08:00:00.000Z",
      first_seen_pncp: "2026-03-07T16:00:00.000Z",
      matched: true,
    },
    {
      id: "lm_200h",
      data_origin: "FIXTURE",
      first_seen_local: "2026-02-01T08:00:00.000Z",
      first_seen_pncp: "2026-02-09T16:00:00.000Z",
      matched: true,
    },
    {
      id: "lm_400h",
      data_origin: "FIXTURE",
      first_seen_local: "2026-01-01T08:00:00.000Z",
      first_seen_pncp: "2026-01-18T00:00:00.000Z",
      matched: true,
    },
    {
      id: "pcp_a",
      data_origin: "LIVE",
      first_seen_local: "2026-09-08T10:00:00.000Z",
      first_seen_pncp: null,
      matched: false,
    },
    {
      id: "pcp_b",
      data_origin: "LIVE",
      first_seen_local: "2026-09-12T10:00:00.000Z",
      first_seen_pncp: null,
      matched: false,
    },
    {
      id: "pcp_c",
      data_origin: "LIVE",
      first_seen_local: "2026-09-14T08:00:00.000Z",
      first_seen_pncp: null,
      matched: false,
    },
  ];
}

export function lateMatchesFromSourceRecords(
  rows: Array<{
    id: string;
    first_seen_at: string | null;
    pncp_first_seen_at?: string | null;
    match_status?: string | null;
    data_origin?: string | null;
  }>,
): LateMatchRow[] {
  const out: LateMatchRow[] = [];
  for (const row of rows) {
    if (!row.first_seen_at) continue;
    const matched = row.match_status === "CONFIRMED" && Boolean(row.pncp_first_seen_at);
    out.push({
      id: row.id,
      data_origin: row.data_origin === "LIVE" ? "LIVE" : (row.data_origin ?? "UNKNOWN"),
      first_seen_local: row.first_seen_at,
      first_seen_pncp: matched ? (row.pncp_first_seen_at ?? null) : null,
      matched,
    });
  }
  return out;
}

export function g75PcaPgcSides(): { pca: PlanningSide[]; pgc: PlanningSide[] } {
  return {
    pca: [
      {
        id: "pca_fazenda_obra",
        origin_type: "PCA_PNCP",
        organization_cnpj: "00394460000141",
        year: 2026,
        catalog_code: "541",
        numero_item_pncp: null,
        object: "OBRA DE ACESSIBILIDADE E DE PREVENÇÃO E COMBATE A INCÊNDIO",
        estimated_value_num: 500000,
      },
      {
        id: "pca_office",
        origin_type: "PCA_PNCP",
        organization_cnpj: "00394460000141",
        year: 2026,
        catalog_code: "36911",
        numero_item_pncp: "00394460000141-2026-1",
        object: "Material de expediente",
        estimated_value_num: 98000,
      },
    ],
    pgc: [
      {
        id: "pgc_doutorado",
        origin_type: "PGC_COMPRASGOV",
        organization_cnpj: "00394460000141",
        year: 2026,
        catalog_code: "12793",
        numero_item_pncp: null,
        object: "Capacitação em Doutorado em Informática Aplicada",
        estimated_value_num: null,
      },
      {
        id: "pgc_office",
        origin_type: "PGC_COMPRASGOV",
        organization_cnpj: "00394460000141",
        year: 2026,
        catalog_code: "36911",
        numero_item_pncp: "00394460000141-2026-1",
        object: "Material de expediente",
        estimated_value_num: 98000,
      },
    ],
  };
}

export function g75AlertRules(): AlertRuleDef[] {
  return [
    {
      id: "rule_new",
      event_types: ["NEW_PROCUREMENT"],
      filters: { uf: "SC" },
    },
    {
      id: "rule_servico",
      event_types: ["NEW_PROCUREMENT"],
      filters: { keyword: "serviço" },
    },
    {
      id: "rule_change_high",
      event_types: ["DEADLINE_CHANGED", "STATUS_CHANGED"],
      filters: {},
      min_change_priority: "HIGH",
    },
  ];
}

export function g75AlertEvents(): AlertEvalEvent[] {
  return [
    {
      id: "e1",
      eventType: "NEW_PROCUREMENT",
      uf: "SC",
      object: "Material esportivo",
      entity_type: "opportunity",
      entity_id: "opp_1",
      data_origin: "SYNTHETIC",
    },
    {
      id: "e1dup",
      eventType: "NEW_PROCUREMENT",
      uf: "SC",
      object: "Material esportivo",
      entity_type: "opportunity",
      entity_id: "opp_1",
      data_origin: "SYNTHETIC",
    },
    {
      id: "e2",
      eventType: "NEW_PROCUREMENT",
      uf: "SP",
      object: "serviço de limpeza predial",
      entity_type: "opportunity",
      entity_id: "opp_2",
      data_origin: "SYNTHETIC",
    },
    {
      id: "e3",
      eventType: "DEADLINE_CHANGED",
      uf: "SC",
      object: "Material esportivo",
      entity_type: "opportunity",
      entity_id: "opp_1",
      change_field: "deadline",
      distinguishing: "2026-09-20",
      data_origin: "SYNTHETIC",
    },
    {
      id: "e4",
      eventType: "DEADLINE_CHANGED",
      uf: "SC",
      object: "notas internas",
      entity_type: "opportunity",
      entity_id: "opp_1",
      change_field: "notes",
      distinguishing: "meta",
      data_origin: "SYNTHETIC",
    },
  ];
}
