import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClaimBadge } from "@/components/claim-badge";
import { PageHeader, PageShell } from "@/components/page-header";
import { EmptyState, PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listSearchFn } from "@/lib/registry/api";
import { formatDate, formatHours, formatInt, formatMoney } from "@/lib/registry/format";
import {
  CONVERSION_LABELS,
  HORIZON_LABELS,
  LINK_STATUS_LABELS,
  LOCAL_ONLY_LABELS,
  SIGNAL_LEVEL_LABELS,
} from "@/lib/registry/labels";
import type { IntelligenceSearch, SearchHit } from "@/lib/registry/models";
import {
  LINK_STATUSES,
  LOCAL_ONLY_STATES,
  type LinkStatus,
  type LocalOnlyState,
} from "@/lib/registry/types";

export const Route = createFileRoute("/busca")({ component: BuscaPage });

function asLink(value: string | null): LinkStatus | null {
  if (!value) return null;
  return (LINK_STATUSES as readonly string[]).includes(value) ? (value as LinkStatus) : null;
}

function asLocal(value: string | null): LocalOnlyState | null {
  if (!value) return null;
  return (LOCAL_ONLY_STATES as readonly string[]).includes(value)
    ? (value as LocalOnlyState)
    : null;
}

function BuscaPage() {
  const [q, setQ] = useState("");
  const [uf, setUf] = useState("");
  const searchQuery = useQuery({
    queryKey: ["search", q, uf],
    queryFn: () => listSearchFn({ data: { q, uf } }),
  });
  const data = searchQuery.data as IntelligenceSearch | undefined;
  const rows = useMemo(() => data?.procurements ?? [], [data]);
  const ufs = useMemo(() => {
    const set = new Set(rows.map((row) => row.uf).filter((value): value is string => Boolean(value)));
    return [...set].sort();
  }, [rows]);
  const hasTerm = q.trim().length > 0;
  const extraCount =
    (data?.opportunities.length ?? 0) +
    (data?.planning.length ?? 0) +
    (data?.recurrence.length ?? 0) +
    (data?.organizations.length ?? 0);

  return (
    <PageShell>
      <PageHeader
        title="Busca unificada"
        description="Uma contratação, várias fontes. Com um termo, também abre oportunidades, planejamento oficial e sinais de recorrência — sem misturar fato com inferência."
      />

      <form
        className="mb-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => event.preventDefault()}
      >
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="academia, CATMAT, órgão, município"
          aria-label="Buscar"
        />
        <select
          value={uf}
          onChange={(event) => setUf(event.target.value)}
          aria-label="Filtrar por UF"
          className="flex h-11 min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg"
        >
          <option value="">Todas as UFs</option>
          {ufs.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </form>

      {searchQuery.isLoading ? (
        <PageSkeleton rows={6} />
      ) : searchQuery.isError ? (
        <QueryErrorState
          message={
            searchQuery.error instanceof Error
              ? searchQuery.error.message
              : "Erro desconhecido."
          }
          onRetry={() => searchQuery.refetch()}
        />
      ) : rows.length === 0 && extraCount === 0 ? (
        <EmptyState
          title="Nenhuma contratação canônica"
          hint="A busca une records locais já resolvidos contra PNCP. Ingira uma fonte ou abra Cobertura."
        />
      ) : (
        <>
          {hasTerm && data ? <IntelligenceSections data={data} /> : null}
          <ResultsTable rows={rows} />
        </>
      )}
    </PageShell>
  );
}

function IntelligenceSections({ data }: { data: IntelligenceSearch }) {
  return (
    <div className="mb-8 grid gap-4 lg:grid-cols-2">
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-medium">Oportunidades atuais</h2>
          <ClaimBadge kind="FATO_VERIFICADO" />
        </div>
        {data.opportunities.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma oportunidade aberta com este termo.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.opportunities.slice(0, 6).map((row) => (
              <li key={row.id} className="text-sm">
                <Link to="/oportunidades/$id" params={{ id: row.id }} className="hover:underline">
                  {row.object}
                </Link>
                <p className="text-xs text-muted">
                  {HORIZON_LABELS[row.horizon] ?? row.horizon} · {row.organization_name} ·{" "}
                  {formatMoney(row.estimated_value_num)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-medium">Planejamento oficial</h2>
          <ClaimBadge kind="FATO_VERIFICADO" />
        </div>
        {data.planning.length === 0 ? (
          <p className="text-sm text-muted">Nenhum PCA/PGC com este termo.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.planning.slice(0, 6).map((row) => (
              <li key={row.id} className="text-sm">
                {row.object}
                <p className="text-xs text-muted">
                  {row.origin_type === "PGC_COMPRASGOV" ? "PGC" : "PCA"} · {row.organization_name} ·{" "}
                  {CONVERSION_LABELS[row.conversion_status] ?? row.conversion_status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-medium">Recorrência</h2>
          <ClaimBadge kind="INFERENCIA" />
        </div>
        {data.recurrence.length === 0 ? (
          <p className="text-sm text-muted">Nenhum sinal histórico agrupável.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.recurrence.slice(0, 6).map((row) => (
              <li key={row.id} className="text-sm">
                <Link to="/orgaos/$id" params={{ id: row.organization_id }} className="hover:underline">
                  {row.organization_name ?? row.organization_id}
                </Link>
                <p className="text-xs text-muted">
                  {SIGNAL_LEVEL_LABELS[row.signal_level] ?? row.signal_level} · {row.purchase_count} compras ·{" "}
                  {row.normalized_object}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-medium">Órgãos</h2>
          <ClaimBadge kind="FATO_VERIFICADO" />
        </div>
        {data.organizations.length === 0 ? (
          <p className="text-sm text-muted">Nenhum órgão com este termo.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.organizations.slice(0, 6).map((row) => (
              <li key={row.id} className="text-sm">
                <Link to="/orgaos/$id" params={{ id: row.id }} className="hover:underline">
                  {row.display_name}
                </Link>
                <p className="text-xs text-muted">
                  {row.uf} · {formatInt(row.procurements_24m)} compras 24m · {formatInt(row.recurring_objects)}{" "}
                  sinais
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function ResultsTable({ rows }: { rows: SearchHit[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Objeto</TableHead>
            <TableHead>Órgão</TableHead>
            <TableHead>UF</TableHead>
            <TableHead>Modalidade</TableHead>
            <TableHead>Match</TableHead>
            <TableHead>Lead</TableHead>
            <TableHead>Fontes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const status = asLink(row.match_status);
            const local = asLocal(row.local_only_state);
            return (
              <TableRow key={row.id}>
                <TableCell className="max-w-sm">
                  {row.opportunity_id ? (
                    <Link
                      to="/oportunidades/$id"
                      params={{ id: row.opportunity_id }}
                      className="text-sm text-fg hover:underline"
                    >
                      {row.object ?? "—"}
                    </Link>
                  ) : (
                    <p className="text-sm text-fg">{row.object ?? "—"}</p>
                  )}
                  <p className="text-xs text-muted">
                    {formatDate(row.opening_at)}
                    {row.horizon ? ` · ${HORIZON_LABELS[row.horizon] ?? row.horizon}` : ""}
                  </p>
                </TableCell>
                <TableCell>
                  {row.organization_name ?? row.municipality ?? "—"}
                </TableCell>
                <TableCell>{row.uf ?? "—"}</TableCell>
                <TableCell className="text-xs">{row.modality ?? "—"}</TableCell>
                <TableCell>
                  {status ? (
                    <Badge variant={status === "CONFIRMED" ? "ok" : "muted"}>
                      {LINK_STATUS_LABELS[status]}
                    </Badge>
                  ) : local ? (
                    <Badge variant="warn">{LOCAL_ONLY_LABELS[local]}</Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {formatHours(row.lead_time_hours)}
                </TableCell>
                <TableCell>
                  <p className="text-sm text-fg">
                    {row.sources.length} fonte{row.sources.length === 1 ? "" : "s"}
                  </p>
                  <p className="max-w-xs text-xs text-muted">
                    {row.sources.length > 0 ? row.sources.join(" · ") : "—"}
                  </p>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <p className="px-4 py-3 text-xs text-subtle">
        {rows.length} contratações canônicas. Uma linha por processo, não um card por portal.
      </p>
    </div>
  );
}
