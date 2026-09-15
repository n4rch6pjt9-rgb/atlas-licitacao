import { Link } from "@tanstack/react-router";
import { ClaimBadge } from "@/components/claim-badge";
import { Badge } from "@/components/ui/badge";
import {
  CONNECTOR_LABELS,
  EVIDENCE_LABELS,
  STATE_LABELS,
  TECHNOLOGY_LABELS,
} from "@/lib/registry/labels";
import type { SourceListItem } from "@/lib/registry/models";
import {
  asConnector,
  asEvidence,
  asState,
  asTechFamily,
  sourceClaim,
} from "@/lib/registry/view";

export function SourceRow({ source }: { source: SourceListItem }) {
  const family = asTechFamily(source.technology_family);
  const evidence = asEvidence(source.vendor_evidence_level);
  const connector = asConnector(source.connector_type);
  const state = asState(source.classification_state);
  return (
    <Link
      to="/fontes/$id"
      params={{ id: source.id }}
      className="flex min-h-11 flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent/40 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-fg">{source.name}</p>
        <p className="truncate text-xs text-muted">
          {[source.jurisdiction_uf, source.jurisdiction_name, source.base_url]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline">{TECHNOLOGY_LABELS[family]}</Badge>
        <Badge variant="muted">{EVIDENCE_LABELS[evidence]}</Badge>
        <Badge variant="muted">{CONNECTOR_LABELS[connector]}</Badge>
        <Badge variant="default">{STATE_LABELS[state]}</Badge>
        <ClaimBadge kind={sourceClaim(source)} evidence={evidence} />
      </div>
    </Link>
  );
}
