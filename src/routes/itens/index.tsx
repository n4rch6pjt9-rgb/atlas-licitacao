import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageShell } from "@/components/page-header";
import { EmptyState, PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listItemsFn } from "@/lib/registry/api";
import { formatInt, formatMoney } from "@/lib/registry/format";

export const Route = createFileRoute("/itens/")({ component: ItensPage });

function ItensPage() {
  const query = useQuery({ queryKey: ["items"], queryFn: () => listItemsFn() });
  const rows = query.data ?? [];
  return (
    <PageShell>
      <PageHeader
        title="Itens e categorias"
        description="CATMAT/CATSER quando o código veio no payload. Classificação textual é fallback com confiança baixa. Preço estimado, homologado e de ARP não se misturam."
      />
      {query.isLoading ? (
        <PageSkeleton />
      ) : query.isError ? (
        <QueryErrorState
          message={query.error instanceof Error ? query.error.message : "Erro."}
          onRetry={() => query.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum item perfilado" />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Órgãos</TableHead>
                <TableHead>Compras</TableHead>
                <TableHead>Preço mediano</TableHead>
                <TableHead>ARP / PCA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link to="/itens/$id" params={{ id: row.id }} className="hover:underline">
                      {row.label}
                    </Link>
                    <p className="font-mono text-xs text-muted">{row.catalog_code ?? "sem código"}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.classification_method === "CATALOG" ? "ok" : "muted"}>
                      {row.catalog_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatInt(row.organizations_buying)}</TableCell>
                  <TableCell>{formatInt(row.procurements_count)}</TableCell>
                  <TableCell>
                    {formatMoney(row.median_price)}
                    <p className="text-xs text-muted">{row.latest_price_kind ?? ""}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted">
                    {formatInt(row.active_arps)} ARP · {formatInt(row.active_plans)} planos
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </PageShell>
  );
}
