import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClaimBadge } from "@/components/claim-badge";
import { PageHeader, PageShell } from "@/components/page-header";
import { EmptyState, PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, NativeSelect } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMilestone7Fn, listOpportunitiesFn } from "@/lib/registry/api";
import { formatDate, formatHours, formatInt, formatMoney } from "@/lib/registry/format";
import { HORIZON_LABELS, localOnlyUxLabel } from "@/lib/registry/labels";
import type { OpportunityListRow } from "@/lib/registry/models";

export const Route = createFileRoute("/oportunidades/")({
  component: OportunidadesPage,
});

function OportunidadesPage() {
  const [q, setQ] = useState("");
  const [uf, setUf] = useState("");
  const [horizon, setHorizon] = useState("");
  const [sort, setSort] = useState<"newest" | "deadline" | "attention" | "value">("attention");
  const [minValue, setMinValue] = useState("");
  const metricsQuery = useQuery({ queryKey: ["milestone7"], queryFn: () => getMilestone7Fn() });
  const query = useQuery({
    queryKey: ["opportunities", q, uf, horizon, sort, minValue],
    queryFn: () =>
      listOpportunitiesFn({
        data: {
          q,
          uf,
          horizon: horizon || undefined,
          earlyOnly: horizon === "EARLY",
          sort,
          minValue: minValue ? Number(minValue) : undefined,
        },
      }),
  });
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const ufs = useMemo(() => {
    const set = new Set(rows.map((row) => row.uf).filter((value): value is string => Boolean(value)));
    return [...set].sort();
  }, [rows]);
  const metrics = metricsQuery.data;

  return (
    <PageShell>
      <PageHeader
        title="Oportunidades"
        description="Horizontes separados: o que está aberto agora, o que a fonte local viu antes do PNCP. MATURED_NO_MATCH descreve ausência de match nacional após a janela — não é ausência definitiva no PNCP."
      />

      {metrics ? (
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label="Atuais + antecipadas" value={formatInt(metrics.active_opportunities)} claim="FATO_VERIFICADO" />
          <Metric label="Antecipadas" value={formatInt(metrics.early_opportunities)} hint="H1 · observado antes do PNCP ou sem match" claim="FATO_VERIFICADO" />
          <Metric label="Score de atenção" value={metrics.attention_score_version} hint="Não é probabilidade de vitória" claim="INFERENCIA" />
          <Metric
            label="Milestone 7"
            value={metrics.milestone_verdict}
            hint={`PCA ${formatInt(metrics.pca_items)} · PGC ${formatInt(metrics.pgc_items)} · ARP ${formatInt(metrics.active_arps)}`}
            claim="FATO_VERIFICADO"
          />
        </section>
      ) : null}

      <form className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={(e) => e.preventDefault()}>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Objeto, órgão, CATMAT" aria-label="Buscar" />
        <NativeSelect value={uf} onChange={(e) => setUf(e.target.value)} aria-label="UF">
          <option value="">Todas as UFs</option>
          {ufs.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect value={horizon} onChange={(e) => setHorizon(e.target.value)} aria-label="Horizonte">
          <option value="">Todos os horizontes</option>
          <option value="CURRENT">Atual</option>
          <option value="EARLY">Antecipada</option>
        </NativeSelect>
        <NativeSelect value={minValue} onChange={(e) => setMinValue(e.target.value)} aria-label="Valor mínimo">
          <option value="">Qualquer valor</option>
          <option value="20000">≥ R$ 20 mil</option>
          <option value="100000">≥ R$ 100 mil</option>
          <option value="1000000">≥ R$ 1 milhão</option>
        </NativeSelect>
        <NativeSelect
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Ordenar"
        >
          <option value="attention">Atenção</option>
          <option value="newest">Mais recente</option>
          <option value="deadline">Prazo</option>
          <option value="value">Valor</option>
        </NativeSelect>
      </form>

      {query.isLoading ? (
        <PageSkeleton rows={8} />
      ) : query.isError ? (
        <QueryErrorState
          message={query.error instanceof Error ? query.error.message : "Erro desconhecido."}
          onRetry={() => query.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhuma oportunidade nesta filtragem" hint="Tente outro horizonte ou UF." />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Objeto</TableHead>
                <TableHead>Órgão</TableHead>
                <TableHead>Horizonte</TableHead>
                <TableHead>Atenção</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Fontes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <OppRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </PageShell>
  );
}

function OppRow({ row }: { row: OpportunityListRow }) {
  return (
    <TableRow>
      <TableCell className="max-w-sm">
        <Link to="/oportunidades/$id" params={{ id: row.id }} className="text-sm text-fg hover:underline">
          {row.object ?? "—"}
        </Link>
        <p className="mt-1 text-xs text-muted">
          {row.uf ?? "—"} · {formatMoney(row.estimated_value_num)}
        </p>
      </TableCell>
      <TableCell>
        {row.organization_id ? (
          <Link to="/orgaos/$id" params={{ id: row.organization_id }} className="hover:underline">
            {row.organization_name ?? "—"}
          </Link>
        ) : (
          (row.organization_name ?? "—")
        )}
      </TableCell>
      <TableCell>
        <Badge variant={row.horizon === "EARLY" ? "warn" : "ok"}>
          {HORIZON_LABELS[row.horizon] ?? row.horizon}
        </Badge>
        {row.early_kind ? (
          <p className="mt-1 text-xs text-muted">{localOnlyUxLabel(row.early_kind)}</p>
        ) : null}
      </TableCell>
      <TableCell className="font-mono text-sm">
        {row.attention_score?.toFixed(1) ?? "—"}
        <p className="text-xs text-muted">conf. {Math.round(row.data_confidence * 100)}</p>
      </TableCell>
      <TableCell className="text-xs text-muted">
        {formatDate(row.proposal_deadline)}
        <p>{row.lead_time_hours ? formatHours(row.lead_time_hours) : "—"}</p>
      </TableCell>
      <TableCell className="font-mono text-sm">{row.sources_count}</TableCell>
    </TableRow>
  );
}

function Metric({
  label,
  value,
  hint,
  claim,
}: {
  label: string;
  value: string;
  hint?: string;
  claim?: "FATO_VERIFICADO" | "INFERENCIA" | "PENDENTE_DE_VALIDACAO";
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
        {claim ? <ClaimBadge kind={claim} /> : null}
      </div>
      <p className="mt-2 font-display text-2xl font-medium tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </Card>
  );
}
