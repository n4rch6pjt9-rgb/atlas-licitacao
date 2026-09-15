import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClaimBadge } from "@/components/claim-badge";
import { PaFrameworkNote } from "@/components/pa-note";
import { PageHeader, PageShell } from "@/components/page-header";
import { EmptyState, PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMetricsFn, getMilestone3Fn, getMilestone4Fn, getMilestone5Fn, getMilestone6Fn, getMilestone7Fn, listAlertsFn } from "@/lib/registry/api";
import { formatHours, formatInt, formatPct } from "@/lib/registry/format";
import { asEnum, readString, readStringOrNull } from "@/lib/registry/json";
import { ALERT_TYPE_LABELS, TECHNOLOGY_LABELS } from "@/lib/registry/labels";
import { ALERT_TYPES, CLAIM_KINDS, type AlertType, type ClaimKind } from "@/lib/registry/types";
import { asTechFamily } from "@/lib/registry/view";

export const Route = createFileRoute("/")({ component: DashboardPage });

const GOLDEN = [
  {
    uf: "SC",
    title: "Santa Catarina",
    paradigm: "JSON API",
    adapter: "generic-json",
    note: "Contrato JSON público. Golden da família API JSON genérica.",
  },
  {
    uf: "RJ",
    title: "Rio de Janeiro",
    paradigm: "action / form",
    adapter: "generic-action",
    note: "Busca multifunção por action de formulário.",
  },
  {
    uf: "PA",
    title: "Pará",
    paradigm: "JSF",
    adapter: "generic-jsf",
    note: "Página .xhtml. Framework não prova fornecedor.",
  },
] as const;

const LAYERS = [
  {
    k: "Ente",
    v: "Pessoa jurídica ou órgão. Ex.: Estado de Santa Catarina.",
  },
  {
    k: "Portal",
    v: "Endereço público. Ex.: compras.sc.gov.br.",
  },
  {
    k: "Sistema",
    v: "Software por trás do portal. Ex.: e-LIC, SIGA.",
  },
  {
    k: "Fornecedor",
    v: "Família comercial, só com evidência. Nunca só pelo histórico.",
  },
] as const;

function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ["metrics"],
    queryFn: () => getMetricsFn(),
  });
  const alertsQuery = useQuery({
    queryKey: ["alerts"],
    queryFn: () => listAlertsFn(),
  });
  const m3Query = useQuery({
    queryKey: ["milestone3"],
    queryFn: () => getMilestone3Fn(),
  });
  const m4Query = useQuery({
    queryKey: ["milestone4"],
    queryFn: () => getMilestone4Fn(),
  });
  const m5Query = useQuery({
    queryKey: ["milestone5"],
    queryFn: () => getMilestone5Fn(),
  });
  const m6Query = useQuery({
    queryKey: ["milestone6"],
    queryFn: () => getMilestone6Fn(),
  });
  const m7Query = useQuery({
    queryKey: ["milestone7"],
    queryFn: () => getMilestone7Fn(),
  });

  const stats = statsQuery.data;
  const familyRows = (stats?.sources_by_family ?? []).filter((row) => row.count > 0);
  const maxFamily = Math.max(1, ...familyRows.map((row) => row.count));
  const alerts = alertsQuery.data ?? [];

  return (
    <PageShell>
      <PageHeader
        title="Visão geral"
        description="Censo nacional de portais de compras públicas. Classificação por evidência, não por palpite."
      />

      {statsQuery.isLoading ? (
        <PageSkeleton rows={2} />
      ) : statsQuery.isError ? (
        <QueryErrorState
          message={errorText(statsQuery.error)}
          onRetry={() => statsQuery.refetch()}
        />
      ) : stats ? (
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          <Metric label="Fontes" value={formatInt(stats.sources_total)} />
          <Metric label="Verificadas" value={formatInt(stats.sources_verified)} />
          <Metric
            label="Família desconhecida"
            value={formatInt(stats.sources_unknown_family)}
          />
          <Metric
            label="Reuso de adapter"
            value={formatPct(stats.adapter_reuse_ratio)}
          />
          <Metric
            label="Jurisdições"
            value={formatInt(stats.jurisdictions_covered)}
          />
        </section>
      ) : null}

      {m3Query.data ? (
        <section className="mt-8">
          <Link
            to="/censo"
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-xs tracking-wide text-subtle uppercase">
                Milestone 3
              </p>
              <p className="mt-1 font-display text-xl font-medium tracking-tight">
                Adapter comercial {m3Query.data.commercial_adapter_verdict}
              </p>
              <p className="mt-1 text-sm text-muted">
                Reuso genérico {m3Query.data.generic_reuse_verdict}
                {m3Query.data.chosen_family
                  ? ` · ${TECHNOLOGY_LABELS[asTechFamily(m3Query.data.chosen_family)]}`
                  : ""}
                {m3Query.data.chosen_adapter
                  ? ` · ${m3Query.data.chosen_adapter}`
                  : ""}
              </p>
            </div>
            <span className="text-sm text-muted">Abrir censo →</span>
          </Link>
        </section>
      ) : null}

      {m4Query.data ? (
        <section className="mt-4">
          <Link
            to="/cobertura"
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-xs tracking-wide text-subtle uppercase">
                Milestone 4
              </p>
              <p className="mt-1 font-display text-xl font-medium tracking-tight">
                Cobertura {m4Query.data.milestone_verdict} ·{" "}
                {formatInt(m4Query.data.records_ingested_local)} records locais
              </p>
              <p className="mt-1 text-sm text-muted">
                Overlap PNCP {formatPct(m4Query.data.pncp_overlap_ratio)} ·
                local-only{" "}
                {formatInt(
                  m4Query.data.local_only_provisional +
                    m4Query.data.local_only_confirmed,
                )}{" "}
                · antecedência {formatHours(m4Query.data.median_lead_time_hours)}
              </p>
            </div>
            <span className="text-sm text-muted">Abrir cobertura →</span>
          </Link>
        </section>
      ) : null}

      {m5Query.data ? (
        <section className="mt-4">
          <Link
            to="/prioridades"
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-xs tracking-wide text-subtle uppercase">
                Milestone 5
              </p>
              <p className="mt-1 font-display text-xl font-medium tracking-tight">
                Próxima fonte {m5Query.data.milestone_verdict}
                {m5Query.data.chosen_family
                  ? ` · ${TECHNOLOGY_LABELS[asTechFamily(m5Query.data.chosen_family)]}`
                  : ""}
              </p>
              <p className="mt-1 text-sm text-muted">
                Score {m5Query.data.score_version} {m5Query.data.chosen_score?.toFixed(1) ?? "—"} ·
                PCP {formatInt(m5Query.data.pcp_verified_entes)} entes · overlap{" "}
                {formatPct(m5Query.data.pcp_pncp_overlap_ratio)} · antecedência{" "}
                {formatHours(m5Query.data.pcp_median_lead_time_hours)}
              </p>
            </div>
            <span className="text-sm text-muted">Abrir prioridades →</span>
          </Link>
        </section>
      ) : null}

      {m6Query.data ? (
        <section className="mt-4">
          <Link
            to="/prioridades"
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-xs tracking-wide text-subtle uppercase">
                Milestone 6
              </p>
              <p className="mt-1 font-display text-xl font-medium tracking-tight">
                PCP live {m6Query.data.milestone_verdict}
                {m6Query.data.chosen_family
                  ? ` · ${TECHNOLOGY_LABELS[asTechFamily(m6Query.data.chosen_family)]}`
                  : ""}
              </p>
              <p className="mt-1 text-sm text-muted">
                Score {m6Query.data.score_version} {m6Query.data.chosen_score?.toFixed(1) ?? "—"}
                {" · "}
                {formatInt(m6Query.data.live_entes)} entes LIVE
                {" · "}
                {formatInt(m6Query.data.live_records)} records
                {" · "}
                publicKey {m6Query.data.public_key_readiness}
              </p>
            </div>
            <span className="text-sm text-muted">Abrir prioridades →</span>
          </Link>
        </section>
      ) : null}

      {m7Query.data ? (
        <section className="mt-4">
          <Link
            to="/oportunidades"
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-xs tracking-wide text-subtle uppercase">
                Milestone 7
              </p>
              <p className="mt-1 font-display text-xl font-medium tracking-tight">
                Inteligência {m7Query.data.milestone_verdict} ·{" "}
                {formatInt(m7Query.data.active_opportunities)} oportunidades
              </p>
              <p className="mt-1 text-sm text-muted">
                Antecipadas {formatInt(m7Query.data.early_opportunities)} · PCA{" "}
                {formatInt(m7Query.data.pca_items)} · PGC {formatInt(m7Query.data.pgc_items)} ·
                recorrência {formatInt(m7Query.data.recurrence_signals)} · ARP{" "}
                {formatInt(m7Query.data.active_arps)}
              </p>
            </div>
            <span className="text-sm text-muted">Abrir oportunidades →</span>
          </Link>
        </section>
      ) : null}

      <section className="mt-4">
        <Link
          to="/validacao"
          className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs tracking-wide text-subtle uppercase">Gate 7.5</p>
            <p className="mt-1 font-display text-xl font-medium tracking-tight">
              Engineering GO · validação estatística pendente
            </p>
            <p className="mt-1 text-sm text-muted">
              PCA, PGC e ARP live operacionalizados. Recorrência, planning-link e attention ainda
              sem evidência suficiente. M8 permanece NO-GO. A ingestão live só dispara ao abrir
              essa página.
            </p>
          </div>
          <span className="text-sm text-muted">Abrir validação →</span>
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium tracking-tight">
          Portais golden
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          Três paradigmas de integração. Um adapter, N configurações.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {GOLDEN.map((portal) => (
            <Card key={portal.uf} className="p-4">
              <p className="text-xs tracking-wide text-subtle uppercase">
                {portal.uf}
              </p>
              <p className="mt-1 font-display text-lg font-medium tracking-tight">
                {portal.title}
              </p>
              <p className="mt-2 text-sm text-fg">{portal.paradigm}</p>
              <p className="mt-1 font-mono text-xs text-muted">{portal.adapter}</p>
              <p className="mt-3 text-sm text-muted">{portal.note}</p>
              {portal.uf === "PA" ? (
                <div className="mt-3">
                  <PaFrameworkNote />
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium tracking-tight">
          Distribuição por família
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          Contagem observada. Famílias comerciais sem censo aparecem vazias.
        </p>
        {familyRows.length === 0 ? (
          <EmptyState
            title="Nenhuma classificação ainda"
            hint="As barras aparecem quando há fontes com família atribuída."
          />
        ) : (
          <Card className="p-4">
            <ul className="flex flex-col gap-4">
              {familyRows.map((row) => {
                const family = asTechFamily(row.family);
                return (
                  <li key={row.family}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <Link
                        to="/familias/$family"
                        params={{ family }}
                        className="text-sm text-fg hover:underline"
                      >
                        {TECHNOLOGY_LABELS[family]}
                      </Link>
                      <span className="tabular-nums text-sm text-muted">
                        {formatInt(row.count)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-sm bg-surface-2">
                      <div
                        className="h-full rounded-sm bg-accent"
                        style={{ width: `${(row.count / maxFamily) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium tracking-tight">
          Alertas recentes
        </h2>
        <div className="mt-4">
          {alertsQuery.isLoading ? (
            <PageSkeleton rows={3} />
          ) : alertsQuery.isError ? (
            <QueryErrorState
              message={errorText(alertsQuery.error)}
              onRetry={() => alertsQuery.refetch()}
            />
          ) : alerts.length === 0 ? (
            <EmptyState
              title="Sem alertas"
              hint="Mudança de fingerprint, conflito de fornecedor e schema drift aparecem aqui."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {alerts.slice(0, 8).map((alert) => {
                const type = asEnum(alert.alert_type, ALERT_TYPES, "NEW_SOURCE_DISCOVERED") as AlertType;
                const label = ALERT_TYPE_LABELS[type];
                const raw =
                  readString(alert.message) || readString(alert.title);
                const title =
                  !raw || raw === type || raw === label ? label : raw;
                const claim = asEnum(
                  alert.claim_kind,
                  CLAIM_KINDS,
                  "INFERENCIA",
                ) as ClaimKind;
                return (
                  <li
                    key={readString(alert.id, title)}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fg">{title}</p>
                      {title !== label || readStringOrNull(alert.source_name) ? (
                        <p className="text-xs text-muted">
                          {[title !== label ? label : null, readStringOrNull(alert.source_name)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      ) : null}
                    </div>
                    <ClaimBadge kind={claim} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium tracking-tight">
          Quatro camadas
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          ente ≠ portal ≠ sistema ≠ fornecedor
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {LAYERS.map((layer) => (
            <Card key={layer.k} className="p-4">
              <CardHeader className="mb-1">
                <CardTitle className="text-lg">{layer.k}</CardTitle>
                <CardDescription>{layer.v}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums tracking-tight">
        {value}
      </p>
    </Card>
  );
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : "Erro desconhecido.";
}
