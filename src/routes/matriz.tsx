import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Minus } from "lucide-react";
import { PageHeader, PageShell } from "@/components/page-header";
import { EmptyState, PageSkeleton, QueryErrorState } from "@/components/status-states";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMatrixFn } from "@/lib/registry/api";
import { CAPABILITY_LABELS } from "@/lib/registry/labels";
import { CAPABILITIES, type Capability } from "@/lib/registry/types";
import { asEnum } from "@/lib/registry/json";

export const Route = createFileRoute("/matriz")({ component: MatrizPage });

function MatrizPage() {
  const matrixQuery = useQuery({
    queryKey: ["matrix"],
    queryFn: () => getMatrixFn(),
  });

  const columns = (matrixQuery.data?.capabilities ?? [...CAPABILITIES]).map((cap) =>
    asEnum(cap, CAPABILITIES, CAPABILITIES[0]),
  ) as Capability[];
  const rows = matrixQuery.data?.rows ?? [];

  return (
    <PageShell>
      <PageHeader
        title="Matriz de capacidades"
        description="O que cada fonte expõe em público. Células vazias são censo pendente."
      />

      {matrixQuery.isLoading ? (
        <PageSkeleton rows={6} />
      ) : matrixQuery.isError ? (
        <QueryErrorState
          message={
            matrixQuery.error instanceof Error
              ? matrixQuery.error.message
              : "Erro desconhecido."
          }
          onRetry={() => matrixQuery.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState title="Matriz ainda sem observações" />
      ) : (
        <div className="rounded-xl border border-border bg-surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 bg-surface">Fonte</TableHead>
                {columns.map((cap) => (
                  <TableHead key={cap} className="text-center">
                    {CAPABILITY_LABELS[cap]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.source_id}>
                  <TableCell className="sticky left-0 z-10 bg-surface">
                    <Link
                      to="/fontes/$id"
                      params={{ id: row.source_id }}
                      className="whitespace-nowrap text-fg hover:underline"
                    >
                      {row.source_name}
                    </Link>
                  </TableCell>
                  {columns.map((cap) => (
                    <TableCell key={cap} className="text-center">
                      <CellMark present={Boolean(row.cells[cap]?.present)} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageShell>
  );
}

function CellMark({ present }: { present: boolean }) {
  if (present) {
    return (
      <span
        className="inline-flex size-7 items-center justify-center rounded-sm bg-ok/20 text-ok"
        title="Observado"
      >
        <Check className="size-4" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="inline-flex size-7 items-center justify-center text-subtle" title="Pendente">
      <Minus className="size-3.5" strokeWidth={1.5} />
    </span>
  );
}
