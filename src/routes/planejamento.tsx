import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClaimBadge } from "@/components/claim-badge";
import { PageHeader, PageShell } from "@/components/page-header";
import { EmptyState, PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMilestone7Fn, listArpsFn, listFutureDemandFn, listPlanningFn, listRecurrenceFn } from "@/lib/registry/api";
import { formatInt, formatMoney } from "@/lib/registry/format";
import {
  ARP_SIGNAL_LABELS,
  CONVERSION_LABELS,
  PLANNING_ORIGIN_LABELS,
  SIGNAL_LEVEL_LABELS,
} from "@/lib/registry/labels";

export const Route = createFileRoute("/planejamento")({
  component: PlanejamentoPage,
});

function PlanejamentoPage() {
  const [tab, setTab] = useState("pca");
  const metrics = useQuery({ queryKey: ["milestone7"], queryFn: () => getMilestone7Fn() });
  const pca = useQuery({
    queryKey: ["planning", "PCA_PNCP"],
    queryFn: () => listPlanningFn({ data: { origin: "PCA_PNCP" } }),
  });
  const pgc = useQuery({
    queryKey: ["planning", "PGC_COMPRASGOV"],
    queryFn: () => listPlanningFn({ data: { origin: "PGC_COMPRASGOV" } }),
  });
  const future = useQuery({ queryKey: ["future-demand"], queryFn: () => listFutureDemandFn() });
  const rec = useQuery({ queryKey: ["recurrence"], queryFn: () => listRecurrenceFn() });
  const arps = useQuery({ queryKey: ["arps"], queryFn: () => listArpsFn() });

  return (
    <PageShell>
      <PageHeader
        title="Demanda futura"
        description="PCA e PGC são planejamento oficial. Recorrência é inferência do histórico. ARP é instrumento vigente — não é edital novo."
      />

      {metrics.data ? (
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card className="p-4">
            <p className="text-xs tracking-wide text-subtle uppercase">PCA (PNCP)</p>
            <p className="mt-2 font-display text-2xl">{formatInt(metrics.data.pca_items)}</p>
            <ClaimBadge kind="FATO_VERIFICADO" />
          </Card>
          <Card className="p-4">
            <p className="text-xs tracking-wide text-subtle uppercase">PGC (Compras.gov)</p>
            <p className="mt-2 font-display text-2xl">{formatInt(metrics.data.pgc_items)}</p>
            <ClaimBadge kind="FATO_VERIFICADO" />
          </Card>
          <Card className="p-4">
            <p className="text-xs tracking-wide text-subtle uppercase">Conversão</p>
            <p className="mt-2 font-display text-2xl">
              {new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 }).format(
                metrics.data.planning_conversion_rate,
              )}
            </p>
            <p className="mt-2 text-xs text-muted">planejado → contratação nesta amostra</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs tracking-wide text-subtle uppercase">ARP ativas</p>
            <p className="mt-2 font-display text-2xl">{formatInt(metrics.data.active_arps)}</p>
            <ClaimBadge kind="FATO_VERIFICADO" />
          </Card>
        </section>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="pca">PCA · PNCP</TabsTrigger>
          <TabsTrigger value="pgc">PGC · Compras.gov</TabsTrigger>
          <TabsTrigger value="rec">Recorrência</TabsTrigger>
          <TabsTrigger value="arp">ARP</TabsTrigger>
        </TabsList>
        <TabsContent value="pca">
          <PlanTable query={pca} empty="Nenhum item de PCA nesta amostra." />
        </TabsContent>
        <TabsContent value="pgc">
          <PlanTable query={pgc} empty="Nenhum item de PGC nesta amostra." />
        </TabsContent>
        <TabsContent value="rec">
          {rec.isLoading ? (
            <PageSkeleton />
          ) : rec.isError ? (
            <QueryErrorState message="Falha ao carregar recorrência." onRetry={() => rec.refetch()} />
          ) : (rec.data ?? []).length === 0 ? (
            <EmptyState title="Nenhum sinal" hint="Recorrência só aparece com 2+ compras agrupáveis." />
          ) : (
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Órgão</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Compras</TableHead>
                    <TableHead>Intervalo</TableHead>
                    <TableHead>Sinal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(rec.data ?? []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Link to="/orgaos/$id" params={{ id: row.organization_id }} className="hover:underline">
                          {row.organization_name ?? row.organization_id}
                        </Link>
                        <p className="text-xs text-muted">{row.uf}</p>
                      </TableCell>
                      <TableCell className="max-w-sm text-sm">{row.normalized_object}</TableCell>
                      <TableCell className="font-mono">{row.purchase_count}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.median_interval_days ? `${Math.round(row.median_interval_days)} d` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.signal_level === "HIGH" ? "warn" : "muted"}>
                          {SIGNAL_LEVEL_LABELS[row.signal_level] ?? row.signal_level}
                        </Badge>
                        <p className="mt-1 text-xs text-muted">{row.rationale}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="arp">
          {arps.isLoading ? (
            <PageSkeleton />
          ) : (arps.data ?? []).length === 0 ? (
            <EmptyState title="Nenhuma ARP" />
          ) : (
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Órgão</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Sinais</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(arps.data ?? []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {row.organization_name}
                        <p className="text-xs text-muted">{row.uf}</p>
                      </TableCell>
                      <TableCell className="max-w-sm text-sm">{row.object}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {row.remaining_balance ?? "—"}
                        {row.remaining_ratio != null
                          ? ` (${Math.round(row.remaining_ratio * 100)}%)`
                          : ""}
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {row.signals.map((s) => ARP_SIGNAL_LABELS[s] ?? s).join(" · ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {future.data && future.data.length > 0 ? (
        <p className="mt-6 text-xs text-muted">
          A lista unificada de demanda futura mistura origens só nesta leitura: cada linha declara se é
          planejamento oficial ou inferência. PCA {PLANNING_ORIGIN_LABELS.PCA_PNCP} ≠{" "}
          {PLANNING_ORIGIN_LABELS.PGC_COMPRASGOV}.
        </p>
      ) : null}
    </PageShell>
  );
}

function PlanTable({
  query,
  empty,
}: {
  query: { data?: Array<{
    id: string;
    origin_type: string;
    organization_name: string | null;
    uf: string | null;
    year: number | null;
    object: string | null;
    estimated_value_num: number | null;
    conversion_status: string;
    source_name: string | null;
  }> | undefined; isLoading: boolean; isError: boolean; refetch: () => void; error?: unknown };
  empty: string;
}) {
  if (query.isLoading) return <PageSkeleton />;
  if (query.isError) {
    return (
      <QueryErrorState
        message={query.error instanceof Error ? query.error.message : "Erro."}
        onRetry={() => query.refetch()}
      />
    );
  }
  const rows = query.data ?? [];
  if (rows.length === 0) return <EmptyState title={empty} />;
  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ente</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Conversão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                {row.organization_name}
                <p className="text-xs text-muted">
                  {row.uf} · {row.source_name}
                </p>
              </TableCell>
              <TableCell className="max-w-sm text-sm">{row.object}</TableCell>
              <TableCell className="font-mono">{row.year ?? "—"}</TableCell>
              <TableCell>{formatMoney(row.estimated_value_num)}</TableCell>
              <TableCell>
                <Badge variant={row.conversion_status === "UNMATCHED" ? "muted" : "ok"}>
                  {CONVERSION_LABELS[row.conversion_status] ?? row.conversion_status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
