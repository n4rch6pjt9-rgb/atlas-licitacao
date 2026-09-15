import type { ClaimKind, EvidenceLevel } from "./types";

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatPct(ratio: number): string {
  if (!Number.isFinite(ratio)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(ratio);
}

export function formatInt(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatHours(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  if (abs >= 48) {
    return `${sign}${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(abs / 24)} d`;
  }
  return `${sign}${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(abs)} h`;
}

export function formatMoney(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function claimFromEvidence(level: EvidenceLevel): ClaimKind {
  if (level === "VERIFIED") return "FATO_VERIFICADO";
  if (level === "STRONG_INDICATION" || level === "WEAK_INDICATION") {
    return "INFERENCIA";
  }
  return "PENDENTE_DE_VALIDACAO";
}
