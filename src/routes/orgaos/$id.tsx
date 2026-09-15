import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageShell } from "@/components/page-header";
import { PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getOrganizationFn } from "@/lib/registry/api";
import { formatInt, formatMoney } from "@/lib/registry/format";
import { HORIZON_LABELS, IDENTITY_STATUS_LABELS, SIGNAL_LEVEL_LABELS } from "@/lib/registry/labels";

export const Route = createFileRoute("/orgaos/$id")({ component: OrgaoDetailPage });

function OrgaoDetailPage() {
  const { id } = Route.useParams();
  const query = useQuery({
    queryKey: ["org", id],
    queryFn: () => getOrganizationFn({ data: { id } }),
  });
  const row = query.data;
  return (
    <PageShell>
      {query.isLoading ? (
        <PageSkeleton rows={8} />
      ) : query.isError ? (
        <QueryErrorState
          message={query.error instanceof Error ? query.error.message : "Erro."}
          onRetry={() => query.refetch()}
        />
      ) : !row ? (
        <p className="text-sm text-muted">Órgão não encontrado.</p>
      ) : (
        <>
          <PageHeader title={row.display_name} description={`${row.municipality ?? ""} · ${row.uf ?? ""}`} />
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge variant={row.identity_status === "CONFIRMED" ? "ok" : "muted"}>
              {IDENTITY_STATUS_LABELS[row.identity_status]} · {row.identity_method}
            </Badge>
            {row.cnpj ? <Badge variant="outline">{row.cnpj}</Badge> : null}
          </div>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="p-4">
              <p className="text-xs text-subtle uppercase">12 meses</p>
              <p className="mt-2 font-display text-2xl">{formatInt(row.procurements_12m)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-subtle uppercase">Volume 12m</p>
              <p className="mt-2 font-display text-2xl">{formatMoney(row.estimated_value_12m)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-subtle uppercase">Planejamento</p>
              <p className="mt-2 font-display text-2xl">{formatInt(row.active_planning_items)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-subtle uppercase">ARP</p>
              <p className="mt-2 font-display text-2xl">{formatInt(row.active_arps)}</p>
            </Card>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-xl font-medium">Compras recentes</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {row.recent.map((item) => (
                <li key={item.id} className="text-sm">
                  <Link to="/oportunidades/$id" params={{ id: item.id }} className="hover:underline">
                    {item.object}
                  </Link>
                  <span className="text-muted">
                    {" "}
                    · {HORIZON_LABELS[item.horizon]} · {formatMoney(item.estimated_value_num)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-xl font-medium">Recorrência</h2>
            <p className="mt-1 text-sm text-muted">Inferência. Não significa que “vai comprar”.</p>
            <ul className="mt-3 flex flex-col gap-2">
              {row.recurrence.map((item) => (
                <li key={item.id} className="text-sm text-muted">
                  {SIGNAL_LEVEL_LABELS[item.signal_level]} · {item.normalized_object} · {item.rationale}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </PageShell>
  );
}
