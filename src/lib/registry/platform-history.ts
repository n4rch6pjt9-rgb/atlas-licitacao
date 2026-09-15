import { randomUUID } from "node:crypto";
import type { PlatformHistoryEntry, TechnologyFamily } from "./types";

export type HistoryTransition = {
  source_system_id: string;
  technology_family: TechnologyFamily;
  vendor_name: string | null;
  product_name: string | null;
  observed_at: string;
  evidence_id: string | null;
  confidence: number;
};

export type PlatformTransitionResult = {
  history: PlatformHistoryEntry[];
  changed: boolean;
  closed: PlatformHistoryEntry | null;
  created: PlatformHistoryEntry | null;
};

function bySource(
  history: PlatformHistoryEntry[],
  sourceSystemId: string,
): PlatformHistoryEntry[] {
  return history.filter((row) => row.source_system_id === sourceSystemId);
}

export function samePlatformIdentity(
  current: Pick<
    PlatformHistoryEntry,
    "technology_family" | "vendor_name" | "product_name"
  >,
  next: Pick<
    HistoryTransition,
    "technology_family" | "vendor_name" | "product_name"
  >,
): boolean {
  return (
    current.technology_family === next.technology_family &&
    (current.vendor_name ?? null) === (next.vendor_name ?? null) &&
    (current.product_name ?? null) === (next.product_name ?? null)
  );
}

export function currentPlatform(
  history: PlatformHistoryEntry[],
  sourceSystemId?: string,
): PlatformHistoryEntry | null {
  const rows = sourceSystemId ? bySource(history, sourceSystemId) : history;
  const open = rows.filter((row) => row.valid_to === null);
  if (open.length === 0) return null;
  return [...open].sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0];
}

export function platformAt(
  history: PlatformHistoryEntry[],
  at: string,
  sourceSystemId?: string,
): PlatformHistoryEntry | null {
  const rows = sourceSystemId ? bySource(history, sourceSystemId) : history;
  const covering = rows.filter((row) => {
    if (row.valid_from > at) return false;
    if (row.valid_to === null) return true;
    return row.valid_to > at;
  });
  if (covering.length === 0) return null;
  return [...covering].sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0];
}

/**
 * Vendor / family change never overwrites a past row.
 * Close the open interval and append a new one. 2015 Paradigma and 2026
 * sistema próprio can both be true.
 */
export function applyPlatformTransition(
  history: PlatformHistoryEntry[],
  transition: HistoryTransition,
  nextId: () => string = () => randomUUID(),
): PlatformTransitionResult {
  const snapshot = history.map((row) => ({ ...row }));
  const current = currentPlatform(snapshot, transition.source_system_id);

  if (current && samePlatformIdentity(current, transition)) {
    return {
      history: snapshot,
      changed: false,
      closed: null,
      created: null,
    };
  }

  const closed = current
    ? { ...current, valid_to: transition.observed_at }
    : null;

  const created: PlatformHistoryEntry = {
    id: nextId(),
    source_system_id: transition.source_system_id,
    technology_family: transition.technology_family,
    vendor_name: transition.vendor_name,
    product_name: transition.product_name,
    valid_from: transition.observed_at,
    valid_to: null,
    evidence_id: transition.evidence_id,
    confidence: transition.confidence,
  };

  const next = snapshot.map((row) =>
    closed && row.id === closed.id ? closed : row,
  );
  next.push(created);

  return {
    history: next,
    changed: true,
    closed,
    created,
  };
}
