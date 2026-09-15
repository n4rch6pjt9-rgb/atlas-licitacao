import {
  hardenConfirmedLink,
  hasOfficialPlanningIdentifier,
  planningConversion,
  type PlanningLinkResult,
} from "../planning-link.ts";
import { wilsonInterval, type WilsonInterval } from "./recurrence-eval.ts";

export type LinkStatus = "CONFIRMED" | "PROBABLE" | "REVIEW_REQUIRED" | "UNMATCHED";
export type ProtocolLabel = "CORRECT" | "INCORRECT" | "AMBIGUOUS";

export type LinkCandidate = {
  id: string;
  planning_id: string;
  procurement_id: string | null;
  status: LinkStatus;
  match_method: string;
  match_score: number;
  matched_fields: string[];
  data_origin: string;
  planning_origin: "PCA_PNCP" | "PGC_COMPRASGOV";
};

export type LabeledLink = LinkCandidate & {
  label: ProtocolLabel;
  protocol: string;
  notes: string;
};

export type ReprocessLinksResult = {
  before: LinkCandidate[];
  after: LinkCandidate[];
  demoted: LinkCandidate[];
  demoted_to_probable: number;
  demoted_to_review: number;
};

/**
 * Protocolo documentado — não é LLM.
 * CONFIRMED só é CORRECT com id oficial ou CNPJ+ano+catálogo.
 * Texto sozinho nunca confirma: se o motor confirmou só por objeto, é INCORRECT.
 */
export function protocolLabel(link: LinkCandidate): { label: ProtocolLabel; protocol: string; notes: string } {
  const fields = new Set(link.matched_fields);
  const official =
    link.match_method === "official_item_id" ||
    fields.has("numero_item_pncp") ||
    (link.match_method === "cnpj_year_catalog" && fields.has("catalog_code"));
  if (link.status === "CONFIRMED") {
    if (official) {
      return {
        label: "CORRECT",
        protocol: "CONFIRMED_OFFICIAL",
        notes: "Confirmado por identificador oficial ou CNPJ+ano+catálogo.",
      };
    }
    return {
      label: "INCORRECT",
      protocol: "CONFIRMED_WITHOUT_OFFICIAL_ID",
      notes: "CONFIRMED sem id oficial — regra deve endurecer, não aumentar match rate.",
    };
  }
  if (link.status === "PROBABLE" || link.status === "REVIEW_REQUIRED") {
    return {
      label: "AMBIGUOUS",
      protocol: "NEEDS_PUBLIC_REVIEW",
      notes: "Candidato sem id oficial. Texto/valor não basta para confirmar.",
    };
  }
  return {
    label: "AMBIGUOUS",
    protocol: "UNMATCHED_NOT_ABSENCE",
    notes: "Sem contratação ligada. Não prova que o planejamento foi cancelado.",
  };
}

export function labelLinks(links: LinkCandidate[]): LabeledLink[] {
  return links.map((link) => {
    const labeled = protocolLabel(link);
    return { ...link, ...labeled };
  });
}

export function unofficialConfirmedCount(links: Array<Pick<LinkCandidate, "status" | "match_method" | "matched_fields">>): number {
  return links.filter(
    (link) =>
      link.status === "CONFIRMED" &&
      !hasOfficialPlanningIdentifier({ match_method: link.match_method, matched_fields: link.matched_fields }),
  ).length;
}

/** Aplica o resolver endurecido em ligações já materializadas. Não infla match rate. */
export function reprocessLinks(links: LinkCandidate[]): ReprocessLinksResult {
  const after: LinkCandidate[] = [];
  const demoted: LinkCandidate[] = [];
  let demoted_to_probable = 0;
  let demoted_to_review = 0;
  for (const link of links) {
    const hardened = hardenConfirmedLink({
      planning_id: link.planning_id,
      procurement_id: link.procurement_id,
      status: link.status,
      match_method: link.match_method,
      match_score: link.match_score,
      matched_fields: link.matched_fields,
    } satisfies PlanningLinkResult);
    const next: LinkCandidate = {
      ...link,
      status: hardened.status,
      match_method: hardened.match_method,
      match_score: hardened.match_score,
      matched_fields: hardened.matched_fields,
    };
    after.push(next);
    if (link.status === "CONFIRMED" && next.status !== "CONFIRMED") {
      demoted.push(next);
      if (next.status === "PROBABLE") demoted_to_probable += 1;
      if (next.status === "REVIEW_REQUIRED") demoted_to_review += 1;
    }
  }
  return { before: links, after, demoted, demoted_to_probable, demoted_to_review };
}

export type PlanningPrecisionReport = {
  origin_scope: string;
  n: number;
  by_status: Record<LinkStatus, number>;
  confirmed: WilsonInterval;
  probable_ambiguous_rate: number;
  review_rate: number;
  incorrect_confirmed: number;
  harden_confirmed_rule: boolean;
  reclassified_from_confirmed: number;
  demoted_to_probable: number;
  demoted_to_review: number;
  conversion: ReturnType<typeof planningConversion>;
  median_plan_to_procurement_days: number | null;
  notes: string;
};

export function precisionReport(args: {
  labeled: LabeledLink[];
  planned: number;
  converted: number;
  plan_to_procurement_days: number[];
  origin_scope: string;
  reclassified_from_confirmed?: number;
  demoted_to_probable?: number;
  demoted_to_review?: number;
}): PlanningPrecisionReport {
  const labeled = args.labeled;
  const by_status: Record<LinkStatus, number> = {
    CONFIRMED: 0,
    PROBABLE: 0,
    REVIEW_REQUIRED: 0,
    UNMATCHED: 0,
  };
  for (const row of labeled) by_status[row.status] += 1;
  const confirmed = labeled.filter((row) => row.status === "CONFIRMED");
  const confirmedCorrect = confirmed.filter((row) => row.label === "CORRECT").length;
  const incorrect = confirmed.filter((row) => row.label === "INCORRECT").length;
  const review_rate = labeled.length === 0 ? 0 : by_status.REVIEW_REQUIRED / labeled.length;
  const probable_ambiguous_rate =
    labeled.length === 0
      ? 0
      : labeled.filter((row) => row.status === "PROBABLE" && row.label === "AMBIGUOUS").length /
        labeled.length;
  const days = args.plan_to_procurement_days.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  const median =
    days.length === 0
      ? null
      : days.length % 2 === 0
        ? (days[days.length / 2 - 1] + days[days.length / 2]) / 2
        : days[Math.floor(days.length / 2)];
  const reclassified = args.reclassified_from_confirmed ?? 0;
  return {
    origin_scope: args.origin_scope,
    n: labeled.length,
    by_status,
    confirmed: wilsonInterval(confirmedCorrect, confirmed.length),
    probable_ambiguous_rate,
    review_rate,
    incorrect_confirmed: incorrect,
    harden_confirmed_rule: incorrect > 0,
    reclassified_from_confirmed: reclassified,
    demoted_to_probable: args.demoted_to_probable ?? 0,
    demoted_to_review: args.demoted_to_review ?? 0,
    conversion: planningConversion({ planned: args.planned, converted: args.converted }),
    median_plan_to_procurement_days: median,
    notes:
      incorrect > 0
        ? "Há CONFIRMED sem id oficial. Endurecer a regra — não aumentar match rate."
        : reclassified > 0
          ? `${reclassified} CONFIRMED sem id oficial foram reclassificados. CONFIRMED restantes têm identificador oficial. Precisão live ainda pendente.`
          : confirmed.length === 0
            ? "Nenhum CONFIRMED nesta amostra. Não inflar match rate."
            : "CONFIRMED desta amostra passou no protocolo oficial. Amostra rotulada por protocolo, não por LLM.",
  };
}
