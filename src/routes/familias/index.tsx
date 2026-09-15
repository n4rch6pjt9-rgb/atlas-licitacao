import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageShell } from "@/components/page-header";
import { PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Badge } from "@/components/ui/badge";
import { listFamiliesFn } from "@/lib/registry/api";
import { formatInt } from "@/lib/registry/format";
import { CONNECTOR_LABELS, TECHNOLOGY_LABELS } from "@/lib/registry/labels";
import type { FamilyCount } from "@/lib/registry/models";
import {
  FRAMEWORK_FAMILIES,
  VENDOR_FAMILIES,
  type TechnologyFamily,
} from "@/lib/registry/types";
import { asConnector, asTechFamily } from "@/lib/registry/view";

export const Route = createFileRoute("/familias/")({ component: FamiliasPage });

const GROUPS: { title: string; families: TechnologyFamily[] }[] = [
  { title: "Nacionais", families: ["PNCP", "COMPRAS_GOV"] },
  { title: "Comerciais", families: [...VENDOR_FAMILIES] },
  { title: "Genéricas / framework", families: [...FRAMEWORK_FAMILIES] },
  { title: "Próprio", families: ["SISTEMA_PROPRIO"] },
];

function FamiliasPage() {
  const familiesQuery = useQuery({
    queryKey: ["families"],
    queryFn: () => listFamiliesFn(),
  });

  const byFamily = new Map<TechnologyFamily, FamilyCount>();
  for (const row of familiesQuery.data ?? []) {
    byFamily.set(asTechFamily(row.family), row);
  }

  function rowFor(family: TechnologyFamily): FamilyCount {
    return (
      byFamily.get(family) ?? {
        family,
        count: 0,
        adapter_ready_count: 0,
        verified_count: 0,
        connector_types: [],
      }
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Famílias"
        description="Famílias comerciais podem ter zero fontes verificadas. Isso é censo pendente, não um bug."
      />

      {familiesQuery.isLoading ? (
        <PageSkeleton rows={6} />
      ) : familiesQuery.isError ? (
        <QueryErrorState
          message={
            familiesQuery.error instanceof Error
              ? familiesQuery.error.message
              : "Erro desconhecido."
          }
          onRetry={() => familiesQuery.refetch()}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="mb-3 font-display text-xl font-medium tracking-tight">
                {group.title}
              </h2>
              <ul className="flex flex-col gap-2">
                {group.families.map((family) => {
                  const row = rowFor(family);
                  const pending =
                    (VENDOR_FAMILIES.has(family) || family === "SISTEMA_PROPRIO") &&
                    row.verified_count === 0;
                  const adapter = row.connector_types[0]
                    ? asConnector(row.connector_types[0])
                    : null;
                  const badge = pending
                    ? { variant: "muted" as const, label: "Censo pendente" }
                    : row.count === 0
                      ? { variant: "muted" as const, label: "Sem fontes" }
                      : row.verified_count > 0
                        ? { variant: "ok" as const, label: "Com evidência" }
                        : { variant: "warn" as const, label: "Observada" };
                  return (
                    <li key={family}>
                      <Link
                        to="/familias/$family"
                        params={{ family }}
                        className="flex min-h-11 flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-fg">
                            {TECHNOLOGY_LABELS[family]}
                          </p>
                          <p className="text-xs text-muted">
                            {formatInt(row.count)} fontes ·{" "}
                            {formatInt(row.verified_count)} verificadas
                            {adapter ? ` · ${CONNECTOR_LABELS[adapter]}` : ""}
                          </p>
                        </div>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </PageShell>
  );
}
