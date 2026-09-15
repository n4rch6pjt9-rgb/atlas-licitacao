import { Badge } from "@/components/ui/badge";
import { CLAIM_LABELS } from "@/lib/registry/labels";
import type { ClaimKind, EvidenceLevel } from "@/lib/registry/types";
import { claimFromEvidence } from "@/lib/registry/format";

const CLAIM_VARIANT: Record<
  ClaimKind,
  "ok" | "warn" | "muted"
> = {
  FATO_VERIFICADO: "ok",
  INFERENCIA: "warn",
  PENDENTE_DE_VALIDACAO: "muted",
};

export function ClaimBadge({
  kind,
  evidence,
}: {
  kind?: ClaimKind | null;
  evidence?: EvidenceLevel | null;
}) {
  const resolved = kind ?? (evidence ? claimFromEvidence(evidence) : "PENDENTE_DE_VALIDACAO");
  return <Badge variant={CLAIM_VARIANT[resolved]}>{CLAIM_LABELS[resolved]}</Badge>;
}

export function ClaimLegend({ compact = false }: { compact?: boolean }) {
  const items: ClaimKind[] = [
    "FATO_VERIFICADO",
    "INFERENCIA",
    "PENDENTE_DE_VALIDACAO",
  ];
  return (
    <ul className={compact ? "flex flex-col gap-2" : "flex flex-wrap gap-2"}>
      {items.map((kind) => (
        <li key={kind} className="flex items-center gap-2">
          <ClaimBadge kind={kind} />
        </li>
      ))}
    </ul>
  );
}
