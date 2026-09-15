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
import { listOrganizationsFn } from "@/lib/registry/api";
import { formatInt, formatMoney } from "@/lib/registry/format";
import { IDENTITY_STATUS_LABELS } from "@/lib/registry/labels";

export const Route = createFileRoute("/orgaos/")({ component: OrgaosPage });

function OrgaosPage() {
  const query = useQuery({ queryKey: ["orgs"], queryFn: () => listOrganizationsFn() });
  const rows = query.data ?? [];
  return (
    <PageShell>
      <PageHeader
        title="Órgãos"
        description="Identidade por CNPJ quando houver. Nome avulso fica em revisão. Perfil materializado, não recalculado a cada clique."
      />
      {query.isLoading ? (
        <PageSkeleton rows={6} />
      ) : query.isError ? (
        <QueryErrorState
          message={query.error instanceof Error ? query.error.message : "Erro."}
          onRetry={() => query.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum órgão perfilado" />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Órgão</TableHead>
                <TableHead>Identidade</TableHead>
                <TableHead>12 meses</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead>PCA/PGC</TableHead>
                <TableHead>ARP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link to="/orgaos/$id" params={{ id: row.id }} className="hover:underline">
                      {row.display_name}
                    </Link>
                    <p className="text-xs text-muted">
                      {row.municipality} · {row.uf}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.identity_status === "CONFIRMED" ? "ok" : "muted"}>
                      {IDENTITY_STATUS_LABELS[row.identity_status] ?? row.identity_status}
                    </Badge>
                    <p className="mt-1 font-mono text-xs text-muted">{row.cnpj ?? "sem CNPJ"}</p>
                  </TableCell>
                  <TableCell>
                    {formatInt(row.procurements_12m)}
                    <p className="text-xs text-muted">{formatMoney(row.estimated_value_12m)}</p>
                  </TableCell>
                  <TableCell>{formatInt(row.recurring_objects)}</TableCell>
                  <TableCell>{formatInt(row.active_planning_items)}</TableCell>
                  <TableCell>{formatInt(row.active_arps)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </PageShell>
  );
}
