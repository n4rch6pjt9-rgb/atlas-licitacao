/**
 * Public PNCP edital URL — Portal Nacional de Contratações Públicas.
 * Pattern: https://pncp.gov.br/app/editais/{cnpj}-{unidade}-{numero}/{ano}
 * Example: https://pncp.gov.br/app/editais/75442756000190-1-001001/2026
 *
 * numeroControlePNCP is `{cnpj}-{unidade}-{numero}/{ano}`. The slash is a
 * path separator on the public portal — never encode it, never prefix `pncp-`.
 * API paths (`/pncp-api/v1/orgaos/.../compras/...`) rewrite to this pattern.
 */

export const PNCP_PORTAL_ORIGIN = "https://pncp.gov.br";
export const PNCP_EDITAL_BASE = `${PNCP_PORTAL_ORIGIN}/app/editais`;
export const PNCP_EDITAL_EXAMPLE =
  "https://pncp.gov.br/app/editais/75442756000190-1-001001/2026";
export const PNCP_OFFICIAL_NAME = "Portal Nacional de Contratações Públicas";

export type PncpControl = {
  cnpj: string;
  unidade: string;
  numero: string;
  ano: string;
};

const CONTROL_SLASH = /^(\d{14})-(\d+)-(\d+)\/(\d{4})$/;
const CONTROL_ALT = /^(\d{14})-(\d+)-(\d{4})-(\d+)$/;
const API_COMPRA =
  /\/orgaos\/(\d{14})\/compras\/(\d{4})\/(\d+)(?:\/|$)/i;

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

export function pncpEditalUrl(
  input: string | PncpControl | null | undefined,
): string | null {
  const parsed =
    input && typeof input === "object"
      ? {
          cnpj: digits(input.cnpj),
          unidade: String(input.unidade || "1"),
          numero: padNumero(String(input.numero)),
          ano: String(input.ano),
        }
      : parseNumeroControlePncp(input);
  if (
    !parsed ||
    !isUsablePncpCnpj(parsed.cnpj) ||
    !/^\d{4}$/.test(parsed.ano) ||
    !parsed.numero
  ) {
    return null;
  }
  return `${PNCP_EDITAL_BASE}/${parsed.cnpj}-${parsed.unidade}-${parsed.numero}/${parsed.ano}`;
}

export function isPncpEditalUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (
    !/^https?:\/\/pncp\.gov\.br\/app\/editais\/\d{14}-\d+-\d+\/\d{4}$/i.test(
      trimmed,
    )
  ) {
    return false;
  }
  return pncpEditalUrl(trimmed) != null;
}

/** Clickable public URL: rewrite `/pncp-api` editais; never keep API file links. */
export function toPublicPncpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const rewritten = pncpEditalUrl(url);
  if (rewritten) return rewritten;
  if (/pncp\.gov\.br\/pncp-api/i.test(url)) return null;
  return url;
}
