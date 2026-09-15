import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageShell } from "@/components/page-header";
import { PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Card } from "@/components/ui/card";
import { getItemFn } from "@/lib/registry/api";
import { formatDate, formatInt, formatMoney } from "@/lib/registry/format";
import { PRICE_KIND_LABELS, SIGNAL_LEVEL_LABELS } from "@/lib/registry/labels";

export const Route = createFileRoute("/itens/$id")({ component: ItemDetailPage });

function ItemDetailPage() {
  const { id } = Route.useParams();
  const query = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItemFn({ data: { id } }),
  });
  const row = query.data;
  return (
    <PageShell>
      {query.isLoading ? (
        <PageSkeleton />
      ) : query.isError ? (
        <QueryErrorState
          message={query.error instanceof Error ? query.error.message : "Erro."}
          onRetry={() => query.refetch()}
        />
      ) : !row ? (
        <p className="text-sm text-muted">Item não encontrado.</p>
      ) : (
        <>
          <PageHeader title={row.label} description={`${row.catalog_type} ${row.catalog_code ?? "sem código oficial"}`} />
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="p-4">
              <p className="text-xs text-subtle uppercase">Órgãos</p>
              <p className="mt-2 font-display text-2xl">{formatInt(row.organizations_buying)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-subtle uppercase">Compras</p>
              <p className="mt-2 font-display text-2xl">{formatInt(row.procurements_count)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-subtle uppercase">Preço mediano</p>
              <p className="mt-2 font-display text-2xl">{formatMoney(row.median_price)}</p>
              <p className="text-xs text-muted">{PRICE_KIND_LABELS[row.latest_price_kind ?? ""] ?? row.latest_price_kind}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-subtle uppercase">Compradores recorrentes</p>
              <p className="mt-2 font-display text-2xl">{formatInt(row.recurring_buyers)}</p>
            </Card>
          </section>
          <section className="mt-8">
            <h2 className="font-display text-xl font-medium">Quem compra</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {row.buyers.map((buyer) => (
                <li key={buyer.organization_id}>
                  {buyer.organization_id ? (
                    <Link to="/orgaos/$id" params={{ id: buyer.organization_id }} className="hover:underline">
                      {buyer.name}
                    </Link>
                  ) : (
                    buyer.name
                  )}
                  <span className="text-muted">
                    {" "}
                    · {buyer.uf} · {formatInt(buyer.count)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="mt-8">
            <h2 className="font-display text-xl font-medium">Observações de preço</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
              {row.prices.map((price) => (
                <li key={price.id}>
                  {PRICE_KIND_LABELS[price.price_kind] ?? price.price_kind} · {price.source_kind} ·{" "}
                  {formatMoney(price.unit_price)} · {formatDate(price.observed_at)}
                </li>
              ))}
            </ul>
          </section>
          {row.recurrence.length > 0 ? (
            <section className="mt-8">
              <h2 className="font-display text-xl font-medium">Recorrência</h2>
              {row.recurrence.map((item) => (
                <p key={item.id} className="mt-2 text-sm text-muted">
                  {SIGNAL_LEVEL_LABELS[item.signal_level]} · {item.organization_name} · {item.rationale}
                </p>
              ))}
            </section>
          ) : null}
        </>
      )}
    </PageShell>
  );
}
