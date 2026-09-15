/**
 * Public PNCP edital URL — Portal Nacional de Contratações Públicas.
 * Pattern: https://pncp.gov.br/app/editais/{cnpj}/{ano}/{sequencialCompra}
 * Example: https://pncp.gov.br/app/editais/10572048000128/2026/1272
 *
 * numeroControlePNCP remains `{cnpj}-{unidade}-{numero}/{ano}` as an official
 * identifier, but it is not the public page path.
 */

export const PNCP_PORTAL_ORIGIN = "https://pncp.gov.br";
export const PNCP_EDITAL_BASE = `${PNCP_PORTAL_ORIGIN}/app/editais`;
export const PNCP_EDITAL_EXAMPLE =
  "https://pncp.gov.br/app/editais/10572048000128/2026/1272";
export const PNCP_OFFICIAL_NAME = "Portal Nacional de Contratações Públicas";

export type PncpControl = {
  cnpj: string;
  unidade: string;
  numero: string;
  ano: string;
};

type PncpStructuredPayload = {
  cnpj?: unknown;
  anoCompra?: unknown;
  sequencialCompra?: unknown;
  orgaoEntidade?: { cnpj?: unknown } | null;
};

const CONTROL_SLASH = /^(\d{14})-(\d+)-(\d+)\/(\d{4})$/;
const CONTROL_ALT = /^(\d{14})-(\d+)-(\d{4})-(\d+)$/;
const API_COMPRA =
  /\/orgaos\/(\d{14})\/compras\/(\d{4})\/(\d+)(?:\/|$)/i;
const PUBLIC_EDITAL = /^https?:\/\/pncp\.gov\.br\/app\/editais\/(\d{14})\/(\d{4})\/(\d+)$/i;

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

function padNumero(value: string): string {
  const n = digits(value);
  if (!n) return value;
  return n.length >= 6 ? n : n.padStart(6, "0");
}

export function isUsablePncpCnpj(value: string | null | undefined): boolean {
  const cnpj = digits(value ?? "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  return true;
}

function stripWrapper(value: string): string {
  let text = value.trim();
  text = text.replace(/^https?:\/\/pncp\.gov\.br\/app\/editais\//i, "");
  text = text.replace(/^pncp-/i, "");
  try {
    text = decodeURIComponent(text);
  } catch {
    /* keep raw */
  }
  return text;
}

export function parseNumeroControlePncp(
  value: string | null | undefined,
): PncpControl | null {
  if (!value) return null;
  const cleaned = stripWrapper(value);
  const slash = cleaned.match(CONTROL_SLASH);
  if (slash) {
    return {
      cnpj: slash[1],
      unidade: slash[2],
      numero: padNumero(slash[3]),
      ano: slash[4],
    };
  }
  const alt = cleaned.match(CONTROL_ALT);
  if (alt) {
    return {
      cnpj: alt[1],
      unidade: alt[2],
      ano: alt[3],
      numero: padNumero(alt[4]),
    };
  }
  const api = value.match(API_COMPRA);
  if (api) {
    return {
      cnpj: api[1],
      unidade: "1",
      ano: api[2],
      numero: padNumero(api[3]),
    };
  }
  return null;
}

export function pncpControl(parts: {
  cnpj: string;
  unidade?: string | number | null;
  numero: string | number;
  ano: string | number;
}): string {
  const cnpj = digits(parts.cnpj);
  const unidade = String(parts.unidade ?? 1).replace(/\D/g, "") || "1";
  const numero = padNumero(String(parts.numero));
  const ano = String(parts.ano).replace(/\D/g, "").slice(0, 4);
  return `${cnpj}-${unidade}-${numero}/${ano}`;
}

function structuredPncpUrl(input: PncpStructuredPayload): string | null {
  const cnpj = digits(
    String(input.cnpj ?? input.orgaoEntidade?.cnpj ?? ""),
  );
  const ano = String(input.anoCompra ?? "").replace(/\D/g, "");
  const sequencial = digits(String(input.sequencialCompra ?? ""));
  if (
    !isUsablePncpCnpj(cnpj) ||
    !/^\d{4}$/.test(ano) ||
    !sequencial
  ) {
    return null;
  }
  return `${PNCP_EDITAL_BASE}/${cnpj}/${ano}/${sequencial}`;
}

export function pncpEditalUrl(
  input: string | PncpControl | PncpStructuredPayload | null | undefined,
): string | null {
  if (
    input &&
    typeof input === "object" &&
    ("sequencialCompra" in input || "anoCompra" in input)
  ) {
    return structuredPncpUrl(input);
  }
  if (typeof input === "string" && PUBLIC_EDITAL.test(input.trim())) {
    return input.trim();
  }
  if (
    input &&
    typeof input === "object" &&
    !("cnpj" in input && "numero" in input && "ano" in input)
  ) {
    return null;
  }
  const control = input as string | PncpControl | null | undefined;
  const parsed =
    control && typeof control === "object"
      ? {
          cnpj: digits(control.cnpj),
          unidade: String(control.unidade || "1"),
          numero: padNumero(String(control.numero)),
          ano: String(control.ano),
        }
      : parseNumeroControlePncp(control);
  if (
    !parsed ||
    !isUsablePncpCnpj(parsed.cnpj) ||
    !/^\d{4}$/.test(parsed.ano) ||
    !parsed.numero
  ) {
    return null;
  }
  return `${PNCP_EDITAL_BASE}/${parsed.cnpj}/${parsed.ano}/${Number(parsed.numero)}`;
}

export function isPncpEditalUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  return PUBLIC_EDITAL.test(value.trim());
}

/** Clickable public URL: rewrite API paths and legacy control URLs. */
export function toPublicPncpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const api = url.match(API_COMPRA);
  if (api) {
    return pncpEditalUrl({
      cnpj: api[1],
      ano: api[2],
      numero: api[3],
      unidade: "1",
    });
  }
  if (isPncpEditalUrl(url)) return url.trim();
  const legacy = parseNumeroControlePncp(url);
  if (legacy) return pncpEditalUrl(legacy);
  if (/pncp\.gov\.br\/(?:pncp-api|api\/consulta)/i.test(url)) return null;
  return url;
}
