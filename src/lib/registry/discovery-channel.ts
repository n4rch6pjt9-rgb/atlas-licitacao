import type { ClaimKind, ConnectorType, DiscoveryChannelType } from "./types.ts";

export type { DiscoveryChannelType };
export { DISCOVERY_CHANNEL_TYPES } from "./types.ts";

export const CHANNEL_READINESS = [
  "READY",
  "OBSERVED",
  "BLOCKED",
  "NOT_READY",
] as const;
export type ChannelReadiness = (typeof CHANNEL_READINESS)[number];

export const CHANNEL_INGEST_STATUS = [
  "NOT_STARTED",
  "FIXTURE_SEEDED",
  "LIVE_FIRST_PAGE",
  "PAGINATION_BLOCKED",
] as const;
export type ChannelIngestStatus = (typeof CHANNEL_INGEST_STATUS)[number];

export type DiscoveryChannelDef = {
  channel_type: DiscoveryChannelType;
  label: string;
  list_path: string;
  detail_path: string;
  link_pattern: string;
  connector_type: ConnectorType;
  readiness: ChannelReadiness;
  ingest_status: ChannelIngestStatus;
  captcha_constraint: string | null;
  claim_kind: ClaimKind;
  notes: string;
  params: Record<string, string>;
  pagination: Record<string, string>;
};

/**
 * Path-shaped inference. Not a vendor fork: any portal whose public
 * routes contain these tokens maps to the same channel vocabulary.
 */
export function inferDiscoveryChannel(path: string | null | undefined): DiscoveryChannelType {
  const value = path ?? "";
  if (/DirectBuy/i.test(value)) return "DIRECT_BUY";
  if (/ByLocation/i.test(value)) return "LOCATION";
  if (/\/pca\b|planej|pgc/i.test(value)) return "PLANNING";
  if (/\barp\b|ata.?registro|registro.?preco/i.test(value)) return "ARP";
  if (/contrat/i.test(value) && !/DirectBuy/i.test(value)) return "CONTRACT";
  if (/Process\//i.test(value) || /Pregao|Pregão|edital/i.test(value)) return "PROCESS";
  return "OTHER";
}

export function htmlHasCaptcha(html: string): boolean {
  return /g-recaptcha|grecaptcha|data-sitekey|recaptcha/i.test(html);
}

/** First-page public HTML is usable. Tokenized pagination is not. */
export function captchaBlocksPagination(html: string): boolean {
  return htmlHasCaptcha(html) && /GetDirectBuyByParams|ExecuteCaptcha|token=/i.test(html);
}

export function neverBypassCaptcha(notes: string): boolean {
  return /n[aã]o (usar|contornar|neutralizar|resolver) .{0,40}captcha/i.test(notes);
}

/**
 * Process number is not a cross-channel identity. 01/2026 on PROCESS
 * and 01/2026 on DIRECT_BUY may be different procurements.
 */
export function channelIdentityKey(input: {
  source_system_id: string;
  source_channel: DiscoveryChannelType | string | null;
  external_id: string;
  source_url?: string | null;
}): string {
  const channel = input.source_channel ?? "OTHER";
  const id = input.external_id.trim() || input.source_url || "unknown";
  return `${input.source_system_id}:${channel}:${id}`;
}

export const BLL_CHANNEL_STACK: DiscoveryChannelDef[] = [
  {
    channel_type: "PROCESS",
    label: "Processos competitivos",
    list_path: "/Process/ProcessSearchPublic?param1=0",
    detail_path: "/Process/ProcessView",
    link_pattern: "Process/ProcessView",
    connector_type: "GENERIC_ACTION",
    readiness: "READY",
    ingest_status: "LIVE_FIRST_PAGE",
    captcha_constraint: null,
    claim_kind: "FATO_VERIFICADO",
    notes:
      "FATO — Superfície Process já exercitada no M4 com generic-action. Pregões e processos públicos. Não é a única superfície da BLL.",
    params: {},
    pagination: { type: "UNKNOWN" },
  },
  {
    channel_type: "DIRECT_BUY",
    label: "Compra direta",
    list_path: "/DirectBuy/DirectBuySearchPublic",
    detail_path: "/DirectBuy/DirectBuyView",
    link_pattern: "DirectBuy/DirectBuyView",
    connector_type: "GENERIC_ACTION",
    readiness: "READY",
    ingest_status: "FIXTURE_SEEDED",
    captcha_constraint:
      "reCAPTCHA observado no GET paginado (GetDirectBuyByParams + token). Primeira página HTML pública responde sem token. Não contornar CAPTCHA.",
    claim_kind: "FATO_VERIFICADO",
    notes:
      "FATO — Compra Direta não é filtro da busca de processos. Formulário e tabela próprios: Organization, Number, City, fkState, fkModality (DISPENSA/INEXIGIBILIDADE), fkStatus (PUBLICADA/CONCLUÍDA), DateStart, DateEnd, Offset. Detalhe em DirectBuyView?param1=… opaco; preservar param1, não decodificar. INFERÊNCIA — pode fechar parte do gap local→PNCP; overlap ainda não medido. Backfill 90 dias só por fluxo público, sem CAPTCHA bypass.",
    params: {
      fkModality: "",
      fkStatus: "",
      DateStart: "",
      DateEnd: "",
      Offset: "0",
    },
    pagination: {
      type: "OFFSET_LIMIT",
      pageParam: "Offset",
      captcha: "required-for-scroll",
    },
  },
  {
    channel_type: "LOCATION",
    label: "Busca por localização",
    list_path: "/Process/ProcessSearchPublicByLocation",
    detail_path: "/Process/ProcessView",
    link_pattern: "Process/ProcessView",
    connector_type: "GENERIC_ACTION",
    readiness: "OBSERVED",
    ingest_status: "NOT_STARTED",
    captcha_constraint: null,
    claim_kind: "PENDENTE_DE_VALIDACAO",
    notes:
      "PENDENTE — Item de menu público observado. Utilidade para ingestão ainda não validada. Não marcar READY.",
    params: {},
    pagination: { type: "UNKNOWN" },
  },
];

export function bllChannelByType(
  type: DiscoveryChannelType,
): DiscoveryChannelDef | undefined {
  return BLL_CHANNEL_STACK.find((row) => row.channel_type === type);
}
