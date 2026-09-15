/**
 * Gate 7.5 status and M8 direction. Evidence in, recommendation out.
 * Do not start M8 from this module — it only recommends.
 */

export type M8Choice = "A" | "B" | "C" | "D" | "NONE";

export type M8Evidence = {
  live_pca_ingested: boolean;
  live_pgc_ingested: boolean;
  live_arp_ingested: boolean;
  planning_confirmed_precision: number | null;
  planning_confirmed_n: number;
  planning_incorrect_confirmed: number;
  recurrence_n: number;
  recurrence_beats_baseline: boolean | null;
  recurrence_sample_too_small: boolean;
  pcp_cohort_matured: boolean;
  pcp_overlap_ratio: number | null;
  window_recommendation_change: boolean;
  attention_absurd_count: number;
  alerts_idempotent: boolean;
  golden_separated: boolean;
  holdout_defined: boolean;
  error_taxonomy: boolean;
  document_pages_observed: number;
  price_observations: number;
  live_opportunities: number;
  local_coverage_gain_after_late_match: number | null;
};

export type Gate75Workstream = {
  id: string;
  title: string;
  until: string;
  status: "DONE" | "IN_PROGRESS" | "WAITING";
  notes: string;
};

export const G75_WORKSTREAMS: Gate75Workstream[] = [
  {
    id: "harden_planning_link",
    title: "Endurecer e reprocessar planning → contratação",
    until: "2026-09-21",
    status: "DONE",
    notes:
      "CONFIRMED só com id oficial ou CNPJ+ano+catálogo. 3 object+valor → PROBABLE; 5 só objeto → REVIEW_REQUIRED. Precisão de CONFIRMED, não quantidade de matches.",
  },
  {
    id: "grow_recurrence_sample",
    title: "Aumentar amostra de recorrência sem tocar o holdout",
    until: "2026-09-21",
    status: "IN_PROGRESS",
    notes:
      "Séries históricas visíveis em T=2026-06-30 acrescidas. Holdout ≥ 2026-09-01 permanece intocado. n HIGH/MEDIUM ainda < 30.",
  },
  {
    id: "pcp_late_matches",
    title: "Acumular first_seen e matches tardios da PCP",
    until: "2026-09-21",
    status: "IN_PROGRESS",
    notes: "Coorte 08–14/09. Não alterar a janela de 7 dias antes da maturação. Reprocessar exatamente essa coorte em 21/09.",
  },
  {
    id: "attention_v1_bad_cases",
    title: "Preservar attention v1 e coletar casos ruins",
    until: "2026-09-21",
    status: "IN_PROGRESS",
    notes: "Não recalibrar pesos. Atenção estrutural, não probabilidade de vitória. Casos absurdos entram na taxonomia.",
  },
];

export const G75_DECISIVE_GATE = {
  on: "2026-09-21",
  action:
    "Reprocessar exatamente a coorte PCP 08–14/09 e produzir time_to_national_match: ≤24h, ≤72h, ≤7d, ≤14d, ainda sem match.",
};

export const M8_C_REQUIRES = [
  "precision dos planning links CONFIRMED após endurecimento",
  "recurrence follow-through com n≥30",
  "ganho incremental real das fontes locais após late matching",
] as const;

export const PROJECT_STATE =
  "M1–M7: GO → Gate 7.5 operacional: GO → inteligência estatisticamente validada: PENDENTE → M8: NO-GO";

export type M8Decision = {
  choice: M8Choice;
  go_m8: false | true;
  closest_if_forced: M8Choice;
  closest_confidence: "PRELIMINARY" | "EVIDENCED";
  rationale: string;
  criteria: Record<M8Choice, string>;
  blockers: string[];
  facts: string[];
  inferences: string[];
  limitations: string[];
  m8_c_requires: string[];
};

export function decideM8(ev: M8Evidence): M8Decision {
  const blockers: string[] = [];
  if (!ev.golden_separated) blockers.push("Golden ainda mistura métrica live.");
  if (!ev.holdout_defined) blockers.push("Holdout temporal não definido.");
  if (!ev.error_taxonomy) blockers.push("Error taxonomy ausente.");
  if (!ev.pcp_cohort_matured) {
    blockers.push("Coorte PCP 08–14/09/2026 não madura — janela de 7 dias ainda aberta.");
  }
  if (ev.recurrence_sample_too_small || ev.recurrence_n < 30) {
    blockers.push(`Recorrência n=${ev.recurrence_n} < 30. Não justifica personalização nem complexidade extra.`);
  }
  if ((ev.planning_confirmed_n ?? 0) < 30) {
    blockers.push(`Amostra CONFIRMED de planning n=${ev.planning_confirmed_n} é pequena.`);
  }
  if (ev.planning_incorrect_confirmed > 0) {
    blockers.push(
      `${ev.planning_incorrect_confirmed} CONFIRMED sem id oficial. Endurecer antes de qualquer feature nova.`,
    );
  }
  if (ev.window_recommendation_change) {
    blockers.push("Recomendação da janela pediu mudança — aplicar só depois de holdout.");
  }

  const aReady =
    ev.recurrence_beats_baseline === true &&
    !ev.recurrence_sample_too_small &&
    (ev.planning_confirmed_precision ?? 0) >= 0.9 &&
    ev.planning_confirmed_n >= 30 &&
    ev.planning_incorrect_confirmed === 0 &&
    ev.pcp_cohort_matured &&
    ev.attention_absurd_count === 0;
  const bReady = ev.document_pages_observed >= 50;
  const dReady = ev.price_observations >= 200;
  const coverageGap =
    (ev.pcp_overlap_ratio != null && ev.pcp_overlap_ratio < 0.05) ||
    !ev.live_pca_ingested ||
    !ev.live_pgc_ingested;

  let choice: M8Choice = "NONE";
  let closest: M8Choice = coverageGap ? "C" : "NONE";
  if (aReady) {
    choice = "A";
    closest = "A";
  } else if (bReady && !coverageGap) {
    choice = "B";
    closest = "B";
  } else if (dReady && ev.price_observations > (ev.live_opportunities || 0)) {
    choice = "D";
    closest = "D";
  }

  // Never auto-open M8 while validation is incomplete. C is a compass, not a GO.
  if (blockers.length > 0 || !aReady) {
    choice = "NONE";
  }

  const closest_confidence: "PRELIMINARY" | "EVIDENCED" =
    closest === "C" && blockers.length > 0 ? "PRELIMINARY" : closest === "NONE" ? "PRELIMINARY" : "EVIDENCED";

  const rationale =
    choice === "NONE"
      ? closest === "C"
        ? `M8 NO-GO. Engineering GO, validação estatística NO-GO. Recorrência n=${ev.recurrence_n}, planning CONFIRMED n=${ev.planning_confirmed_n}, coorte PCP madura=${ev.pcp_cohort_matured}. Direção mais próxima, ainda preliminar, é C — cobertura — mas só se justifica depois de 21/09 se precision CONFIRMED e follow-through n≥30 permanecerem fracos e o ganho local após late matching continuar alto. Não abrir personalização, IA documental nem preços.`
        : `M8 NO-GO. Engineering GO, validação estatística NO-GO. Recorrência n=${ev.recurrence_n}, planning CONFIRMED n=${ev.planning_confirmed_n}, coorte PCP madura=${ev.pcp_cohort_matured}. Nenhuma direção A/B/C/D tem evidência agora. C (cobertura) só se justificaria depois de 21/09 se precision CONFIRMED e follow-through n≥30 permanecerem fracos e o ganho local após late matching continuar alto.`
      : `M8-${choice} com evidência do Gate 7.5.`;

  return {
    choice,
    go_m8: choice !== "NONE",
    closest_if_forced: closest,
    closest_confidence,
    rationale,
    criteria: {
      A: "Personalização só se oportunidades/sinais já tiverem qualidade suficiente. Recorrência precisa bater baseline com n adequado.",
      B: "IA documental só se discovery estiver bom e o gargalo for ler edital. Páginas de documento observadas insuficientes.",
      C: "Cobertura se o ganho de novas famílias/entes superar features sobre o que já existe. Ainda preliminar — depende dos três números após 21/09.",
      D: "Preços só com densidade de price_observation para benchmarking. Ainda não.",
      NONE: "Não abrir M8. Validação empírica incompleta ou amostra insuficiente.",
    },
    blockers,
    facts: [
      ev.live_pca_ingested ? "PCA live ingerido via PNCP /orgaos/{cnpj}/pca/{ano}." : "PCA live não ingerido.",
      ev.live_pgc_ingested ? "PGC live ingerido via dadosabertos modulo-pgc." : "PGC live não ingerido.",
      ev.live_arp_ingested ? "ARP live ingerida via dadosabertos modulo-arp." : "ARP live não ingerida.",
      `Golden separado de live: ${ev.golden_separated}`,
      `Holdout definido: ${ev.holdout_defined}`,
      ev.planning_incorrect_confirmed === 0
        ? "CONFIRMED sem id oficial reclassificados pelo resolver endurecido."
        : `${ev.planning_incorrect_confirmed} CONFIRMED ainda sem id oficial.`,
    ],
    inferences: [
      "Recorrência é inferência histórica, não previsão de nova licitação.",
      "Attention score é atenção estrutural, não probabilidade de vitória.",
      "MATURED_NO_MATCH descreve o que sabemos: sem match nacional após a janela — não é ausência definitiva.",
    ],
    limitations: [
      "Consulta PNCP /api/consulta/v1/pca* estoura timeout — ingestão usa /api/pncp/v1/orgaos/...",
      "Unidades PCA retornaram 405; itens usam sequencial conhecido (Fazenda 1, Porto Belo 9).",
      "Cap de 512 KB e timeout de 8s limitam o recorte live desta sessão.",
      "Amostra rotulada de planning usa protocolo determinístico, não revisão humana de 100 processos.",
    ],
    m8_c_requires: [...M8_C_REQUIRES],
  };
}

export function gate75EngineeringGo(args: {
  live_pca: boolean;
  live_pgc: boolean;
  live_arp: boolean;
  planning_labeled: boolean;
  planning_hardened: boolean;
  recurrence_temporal: boolean;
  baseline_compared: boolean;
  pcp_reprocessed: boolean;
  window_evaluated: boolean;
  attention_audited: boolean;
  alerts_live: boolean;
  golden_separated: boolean;
  holdout: boolean;
  taxonomy: boolean;
  tests: boolean;
}): { go: boolean; missing: string[] } {
  const checks: Array<[string, boolean]> = [
    ["PCA live operacional", args.live_pca],
    ["PGC live operacional", args.live_pgc],
    ["ARP live operacional", args.live_arp],
    ["planning links rotulados", args.planning_labeled],
    ["resolver CONFIRMED endurecido", args.planning_hardened],
    ["recorrência temporal", args.recurrence_temporal],
    ["baseline", args.baseline_compared],
    ["PCP reprocessado", args.pcp_reprocessed],
    ["janela avaliada", args.window_evaluated],
    ["attention auditado", args.attention_audited],
    ["alertas live", args.alerts_live],
    ["golden separado", args.golden_separated],
    ["holdout", args.holdout],
    ["error taxonomy", args.taxonomy],
    ["tests", args.tests],
  ];
  const missing = checks.filter(([, ok]) => !ok).map(([name]) => name);
  return { go: missing.length === 0, missing };
}

export function gate75StatisticalGo(args: {
  pcp_cohort_matured: boolean;
  recurrence_n: number;
  recurrence_beats_baseline: boolean | null;
  planning_incorrect_confirmed: number;
  planning_confirmed_n: number;
  planning_confirmed_precision: number | null;
}): { go: boolean; missing: string[] } {
  const checks: Array<[string, boolean]> = [
    ["coorte PCP 08–14/09 madura", args.pcp_cohort_matured],
    ["recorrência n≥30", args.recurrence_n >= 30],
    ["recorrência bate baseline", args.recurrence_beats_baseline === true],
    ["zero CONFIRMED sem id oficial", args.planning_incorrect_confirmed === 0],
    ["planning CONFIRMED n≥30", args.planning_confirmed_n >= 30],
    [
      "precision CONFIRMED ≥ 0.9",
      args.planning_confirmed_precision != null && args.planning_confirmed_precision >= 0.9,
    ],
  ];
  const missing = checks.filter(([, ok]) => !ok).map(([name]) => name);
  return { go: missing.length === 0, missing };
}

/** @deprecated split into engineering vs statistical */
export function gate75Go(args: {
  live_pca: boolean;
  live_pgc: boolean;
  live_arp: boolean;
  planning_labeled: boolean;
  recurrence_temporal: boolean;
  baseline_compared: boolean;
  pcp_reprocessed: boolean;
  window_evaluated: boolean;
  attention_audited: boolean;
  alerts_live: boolean;
  golden_separated: boolean;
  holdout: boolean;
  taxonomy: boolean;
  tests: boolean;
  typecheck: boolean;
  lint: boolean;
}): { go: boolean; missing: string[] } {
  return gate75EngineeringGo({
    live_pca: args.live_pca,
    live_pgc: args.live_pgc,
    live_arp: args.live_arp,
    planning_labeled: args.planning_labeled,
    planning_hardened: true,
    recurrence_temporal: args.recurrence_temporal,
    baseline_compared: args.baseline_compared,
    pcp_reprocessed: args.pcp_reprocessed,
    window_evaluated: args.window_evaluated,
    attention_audited: args.attention_audited,
    alerts_live: args.alerts_live,
    golden_separated: args.golden_separated,
    holdout: args.holdout,
    taxonomy: args.taxonomy,
    tests: args.tests,
  });
}
