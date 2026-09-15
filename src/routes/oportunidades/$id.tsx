import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClaimBadge } from "@/components/claim-badge";
import { PageHeader, PageShell } from "@/components/page-header";
import { PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getOpportunityFn } from "@/lib/registry/api";
import { formatDate, formatHours, formatMoney } from "@/lib/registry/format";
import {
  ATTENTION_COMPONENT_LABELS,
  CONVERSION_LABELS,
  HORIZON_LABELS,
  PLANNING_ORIGIN_LABELS,
  SIGNAL_LEVEL_LABELS,
  localOnlyUxLabel,
} from "@/lib/registry/labels";

export const Route = createFileRoute("/oportunidades/$id")({
  component: OpportunityDetailPage,
});

function OpportunityDetailPage() {
  const { id } = Route.useParams();
  const query = useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => getOpportunityFn({ data: { id } }),
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
        <p className="text-sm text-muted">Oportunidade não encontrada.</p>
      ) : (
        <>
          <PageHeader
            title={row.object ?? "Oportunidade"}
            description={`${row.organization_name ?? "Órgão"} · ${row.uf ?? "—"}`}
          />
          <section className="mb-6 flex flex-wrap gap-2">
            <Badge variant={row.horizon === "EARLY" ? "warn" : "ok"}>
              {HORIZON_LABELS[row.horizon] ?? row.horizon}
            </Badge>
            {row.early_kind ? (
              <Badge variant="muted">{localOnlyUxLabel(row.early_kind)}</Badge>
            ) : null}
            <ClaimBadge kind={row.claim_kind} />
            {row.catalog_code ? (
              <Badge variant="outline">
                {row.catalog_type} {row.catalog_code}
              </Badge>
            ) : null}
          </section>

          <section className="grid gap-3 md:grid-cols-4">
            <Stat label="Valor estimado" value={formatMoney(row.estimated_value_num)} />
            <Stat label="Prazo" value={formatDate(row.proposal_deadline)} />
            <Stat label="Antecedência" value={formatHours(row.lead_time_hours)} />
            <Stat
              label="Atenção / confiança"
              value={`${row.attention_score?.toFixed(1) ?? "—"} / ${Math.round(row.data_confidence * 100)}`}
            />
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="font-display text-lg font-medium tracking-tight">Por que esta atenção?</h2>
              <p className="mt-1 mb-4 text-sm text-muted">
                {row.score?.rationale ?? "Score ainda não materializado."} Separado da confiança dos dados.
              </p>
              {row.score
                ? Object.entries(row.score.components)
                    .sort((a, b) => b[1] - a[1])
                    .map(([key, value]) => {
                      const weight = row.score?.weights[key] ?? 0;
                      return (
                        <div key={key} className="mb-3">
                          <div className="mb-1 flex justify-between gap-3 text-sm">
                            <span>{ATTENTION_COMPONENT_LABELS[key] ?? key}</span>
                            <span className="font-mono text-xs text-muted">
                              {value.toFixed(2)} × {weight.toFixed(2)}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-sm bg-surface-2">
                            <div className="h-full bg-accent" style={{ width: `${Math.round(value * 100)}%` }} />
                          </div>
                        </div>
                      );
                    })
                : null}
            </Card>
            <Card>
              <h2 className="font-display text-lg font-medium tracking-tight">
                {row.sources.length} fontes
              </h2>
              <p className="mt-1 mb-4 text-sm text-muted">Uma contratação canônica, várias origens.</p>
              <ul className="flex flex-col gap-3">
                {row.sources.map((source) => (
                  <li key={source.id}>
                    <Link to="/fontes/$id" params={{ id: source.id }} className="text-fg hover:underline">
                      {source.name}
                    </Link>
                    <p className="text-xs text-muted">primeira vista {formatDate(source.first_seen_at)}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-xl font-medium tracking-tight">Linha do tempo</h2>
            <ol className="mt-4 flex flex-col gap-3 border-l border-border pl-4">
              {row.events.map((event) => (
                <li key={event.id}>
                  <p className="text-xs text-muted">{formatDate(event.occurred_at)}</p>
                  <p className="text-sm text-fg">{event.summary}</p>
                  <p className="text-xs text-muted">
                    {event.source_name ?? "sistema"}
                    {event.change_priority ? ` · ${event.change_priority}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {row.planning_links.length > 0 ? (
            <section className="mt-8">
              <h2 className="font-display text-xl font-medium tracking-tight">Planejamento ligado</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {row.planning_links.map((item) => (
                  <li key={item.planning_id} className="text-sm text-muted">
                    {PLANNING_ORIGIN_LABELS[item.origin_type] ?? item.origin_type} ·{" "}
                    {CONVERSION_LABELS[item.status] ?? item.status} · {item.object}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {row.recurrence.length > 0 ? (
            <section className="mt-8">
              <h2 className="font-display text-xl font-medium tracking-tight">Sinais de recorrência</h2>
              <p className="mt-1 text-sm text-muted">Inferência histórica. Não é previsão de nova licitação.</p>
              <ul className="mt-3 flex flex-col gap-2">
                {row.recurrence.map((item) => (
                  <li key={item.id} className="text-sm text-muted">
                    {SIGNAL_LEVEL_LABELS[item.signal_level] ?? item.signal_level} · {item.purchase_count} processos ·{" "}
                    {item.rationale}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="mt-8 text-xs text-muted">
            Texto oficial preservado: {row.raw_object}. Normalizado só para agrupamento: {row.normalized_object}.
          </p>
        </>
      )}
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
      <p className="mt-2 font-display text-xl font-medium tracking-tight">{value}</p>
    </Card>
  );
}
