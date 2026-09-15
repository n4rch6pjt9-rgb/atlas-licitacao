import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClaimBadge } from "@/components/claim-badge";
import { PageHeader, PageShell } from "@/components/page-header";
import { PageSkeleton, QueryErrorState } from "@/components/status-states";
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
import {
  getMilestone4Fn,
  getMilestone6Fn,
  listComparisonsFn,
  listLocalOnlyFn,
  listMunicipalityCensusFn,
} from "@/lib/registry/api";
import { formatHours, formatInt, formatPct } from "@/lib/registry/format";
import {
  CONNECTOR_LABELS,
  EVIDENCE_LABELS,
  LOCAL_ONLY_LABELS,
  PORTAL_PRESENCE_LABELS,
  TECHNOLOGY_LABELS,
} from "@/lib/registry/labels";
import type {
  ComparisonRow,
  FamilyPriorityRow,
  LiveProbeRow,
  LocalOnlyRow,
  MunicipalityCensusRow,
} from "@/lib/registry/models";
import {
  EVIDENCE_LEVELS,
  LOCAL_ONLY_STATES,
  PORTAL_PRESENCE,
  type EvidenceLevel,
  type LocalOnlyState,
  type PortalPresence,
} from "@/lib/registry/types";
import { asConnector, asTechFamily } from "@/lib/registry/view";

export const Route = createFileRoute("/cobertura")({ component: CoberturaPage });

function asPresence(value: string): PortalPresence {
  return (PORTAL_PRESENCE as readonly string[]).includes(value)
    ? (value as PortalPresence)
    : "UNKNOWN";
}

function asLocal(value: string): LocalOnlyState {
  return (LOCAL_ONLY_STATES as readonly string[]).includes(value)
    ? (value as LocalOnlyState)
    : "PENDING_PNCP_MATCH";
}

function asLevel(value: string | null): EvidenceLevel {
  return value && (EVIDENCE_LEVELS as readonly string[]).includes(value)
    ? (value as EvidenceLevel)
    : "UNKNOWN";
}

function Verdict({ value }: { value: "GO" | "NO-GO" }) {
  return <Badge variant={value === "GO" ? "ok" : "danger"}>{value}</Badge>;
}

function CoberturaPage() {
  const metricsQuery = useQuery({
    queryKey: ["milestone4"],
    queryFn: () => getMilestone4Fn(),
  });
  const censusQuery = useQuery({
    queryKey: ["municipality-census"],
    queryFn: () => listMunicipalityCensusFn(),
  });
  const localQuery = useQuery({
    queryKey: ["local-only"],
    queryFn: () => listLocalOnlyFn(),
  });
  const cmpQuery = useQuery({
    queryKey: ["comparisons"],
    queryFn: () => listComparisonsFn(),
  });
  const m6Query = useQuery({
    queryKey: ["milestone6"],
    queryFn: () => getMilestone6Fn(),
  });

  const loading =
    metricsQuery.isLoading ||
    censusQuery.isLoading ||
    localQuery.isLoading ||
    cmpQuery.isLoading;
  const error = metricsQuery.error || censusQuery.error || localQuery.error || cmpQuery.error;
  const metrics = metricsQuery.data;
  const census = censusQuery.data ?? [];
  const localOnly = localQuery.data ?? [];
  const comparisons = cmpQuery.data ?? [];

  return (
    <PageShell>
      <PageHeader
        title="Cobertura de contratações"
        description="O valor não é quantos portais estão cadastrados. É quantos registros adicionais cada família entrega sobre PNCP e Compras.gov, com que antecedência e com que confiabilidade."
      />

      {loading ? (
        <PageSkeleton rows={8} />
      ) : error ? (
        <QueryErrorState
          message={error instanceof Error ? error.message : "Erro desconhecido."}
          onRetry={() => {
            metricsQuery.refetch();
            censusQuery.refetch();
            localQuery.refetch();
            cmpQuery.refetch();
          }}
        />
      ) : metrics ? (
        <>
          <section className="mb-8 flex flex-wrap items-center gap-3">
            <Verdict value={metrics.milestone_verdict} />
            <p className="text-sm text-muted">
              Milestone 4 · adapter comercial{" "}
              <span className="text-fg">{metrics.commercial_adapter_verdict}</span>
              {" · "}reuso genérico{" "}
              <span className="text-fg">{metrics.generic_reuse_verdict}</span>
            </p>
            <Link to="/busca" className="text-sm text-muted hover:text-fg">
              Abrir busca unificada →
            </Link>
            <Link to="/prioridades" className="text-sm text-muted hover:text-fg">
              Ranking de famílias →
            </Link>
            <Link to="/oportunidades" className="text-sm text-muted hover:text-fg">
              Oportunidades antecipadas →
            </Link>
          </section>

          {m6Query.data ? (
            <section className="mb-8 rounded-lg border border-border bg-surface px-4 py-4">
              <p className="text-xs tracking-wide text-subtle uppercase">
                Coorte live · {m6Query.data.window_label}
              </p>
              <p className="mt-2 font-display text-lg font-medium tracking-tight">
                PCP {m6Query.data.milestone_verdict} · {formatInt(m6Query.data.live_records)}{" "}
                records LIVE · {formatInt(m6Query.data.fixture_records)} fixture
              </p>
              <p className="mt-1 text-sm text-muted">
                Overlap PNCP {formatPct(m6Query.data.pcp_pncp_overlap_ratio)} · Compras.gov{" "}
                {formatPct(m6Query.data.pcp_comprasgov_overlap_ratio)} · local-only{" "}
                {formatInt(m6Query.data.pcp_local_only)} · antecedência{" "}
                {formatHours(m6Query.data.pcp_median_lead_time_hours)} · score{" "}
                {m6Query.data.score_version}
              </p>
            </section>
          ) : null}

          <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Metric
              label="Registros locais"
              value={formatInt(metrics.records_ingested_local)}
              hint={`${formatInt(metrics.bll_entes)} entes BLL · ${formatInt(metrics.bll_records)} records BLL`}
              claim="FATO_VERIFICADO"
            />
            <Metric
              label="Overlap PNCP (records)"
              value={formatPct(metrics.pncp_overlap_ratio)}
              hint={`${formatInt(metrics.records_matched_pncp)} matches · declaração ${formatPct(metrics.declared_pncp_integration_ratio)}`}
              claim="FATO_VERIFICADO"
            />
            <Metric
              label="Overlap Compras.gov"
              value={formatPct(metrics.comprasgov_overlap_ratio)}
              hint={`${formatInt(metrics.records_matched_comprasgov)} matches`}
              claim="FATO_VERIFICADO"
            />
            <Metric
              label="Antecedência mediana"
              value={formatHours(metrics.median_lead_time_hours)}
              hint={`p75 ${formatHours(metrics.p75_lead_time_hours)} · p95 ${formatHours(metrics.p95_lead_time_hours)}`}
              claim="FATO_VERIFICADO"
            />
            <Metric
              label="Local-only provisório"
              value={formatInt(metrics.local_only_provisional)}
              hint={`confirmado ${formatInt(metrics.local_only_confirmed)} · aguardando ${formatInt(metrics.local_only_pending)}`}
              claim="INFERENCIA"
            />
            <Metric
              label="Municípios mapeados"
              value={formatInt(metrics.municipalities_mapped)}
              hint={`verificados ${formatInt(metrics.municipalities_with_verified_source)} · sem portal/UNKNOWN ${formatInt(metrics.municipalities_without_portal)}`}
              claim="PENDENTE_DE_VALIDACAO"
            />
            <Metric
              label="Contratações canônicas"
              value={formatInt(metrics.canonical_procurements)}
              hint={`${formatInt(metrics.conflicts_observed)} conflitos entre fontes`}
              claim="FATO_VERIFICADO"
            />
            <Metric
              label="Connectors ativos"
              value={formatInt(metrics.active_connectors)}
              hint={`reuso ${formatPct(metrics.adapter_reuse_ratio)} · ${formatInt(metrics.families_with_5plus_verified_entities)} famílias com 5+ VERIFIED`}
              claim="FATO_VERIFICADO"
            />
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-medium tracking-tight">
              Prioridade de integração
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Pesos M4 (catálogo × gap). O ranking de ganho marginal versionado está em
              Prioridades (v1). Overlap abaixo é de records, não de declaração.
            </p>
            <PriorityTable rows={metrics.family_priorities} />
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-medium tracking-tight">
              Relatórios ao vivo
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              GET público. Sem login. Fiorilli e Paradigma exercitados; adapter comercial
              permanece NO-GO.
            </p>
            <ProbeList rows={metrics.live_probes} />
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-medium tracking-tight">
              Local-only
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Registro local válido sem match PNCP nesta janela. Provisório até a
              reconciliação (1h / 6h / 24h / 72h / 7d). Confirmado após a janela
              operacional não é irregularidade nem descumprimento jurídico.
            </p>
            <LocalOnlyTable rows={localOnly} />
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-medium tracking-tight">
              Conflitos entre fontes
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Nenhuma fonte vence em silêncio. PNCP pode ser autoridade nacional;
              o portal local pode publicar antes.
            </p>
            <ComparisonTable rows={comparisons} />
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-medium tracking-tight">
              Censo municipal
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Ausência de portal é dado. UNKNOWN não foi inventado como plataforma.
              Meta progressiva: 100 → 500 → 1.000 → 5.570.
            </p>
            <CensusTable rows={census} />
          </section>

          <section className="mt-10 grid gap-3 md:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-display text-lg font-medium tracking-tight">
                Fato · inferência · pendente
              </h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
                <li>
                  <span className="text-fg">FATO</span> — 20 entes BLL, 1 generic-action,
                  ≥100 records locais, overlap medido por entity resolution, lead time
                  positivo (portal local antes do PNCP).
                </li>
                <li>
                  <span className="text-fg">FATO</span> — Assis Fiorilli: ExtJS SPA
                  (comprasedital.dll + fiorilli.css). Itapira: timeout no GET público.
                </li>
                <li>
                  <span className="text-fg">FATO</span> — Florianópolis e Barueri
                  compartilham /portal/css/portalcss e kendoUI (ASP.NET, não JSF).
                </li>
                <li>
                  <span className="text-fg">INFERÊNCIA</span> — local-only confirmado após
                  7 dias sem PNCP. Não há prazo oficial de publicação.
                </li>
                <li>
                  <span className="text-fg">PENDENTE</span> — censo dos 5.570 municípios.
                  Licitanet, BNC, BBMNET, Licitar Digital, ComprasBR: plataforma
                  VERIFIED, entes não mapeados.
                </li>
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="font-display text-lg font-medium tracking-tight">
                GO / NO-GO para o próximo marco
              </h3>
              <p className="mt-3 text-sm text-muted">
                Milestone 4 é {metrics.milestone_verdict}: ingestão multi-ente BLL,
                resolução local→PNCP, overlap de records, local-only, lead time e
                canônicos sem duplicata evitável. Segunda família exercitada ao vivo
                com limitação documentada — FiorilliAdapter e ParadigmaAdapter
                continuam NO-GO.
              </p>
              <p className="mt-3 text-sm text-muted">
                Próximo passo: família de maior ganho marginal (priority score), não
                a de maior catálogo.
              </p>
            </Card>
          </section>
        </>
      ) : null}
    </PageShell>
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

function PriorityTable({ rows }: { rows: FamilyPriorityRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">Nenhuma família com fonte cadastrada.</p>;
  }
  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Família</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>VERIFIED</TableHead>
            <TableHead>Records</TableHead>
            <TableHead>Overlap PNCP</TableHead>
            <TableHead>Local-only</TableHead>
            <TableHead>Reuso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const family = asTechFamily(row.family);
            return (
              <TableRow key={row.family}>
                <TableCell>
                  <Link
                    to="/familias/$family"
                    params={{ family }}
                    className="font-medium text-fg hover:underline"
                  >
                    {TECHNOLOGY_LABELS[family]}
                  </Link>
                  <p className="mt-1 text-xs text-muted">{row.rationale}</p>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {row.priority_score.toFixed(3)}
                </TableCell>
                <TableCell>{formatInt(row.verified_entities)}</TableCell>
                <TableCell>{formatInt(row.records_local)}</TableCell>
                <TableCell>{formatPct(row.pncp_overlap_ratio)}</TableCell>
                <TableCell>{formatInt(row.local_only)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Verdict value={row.generic_reuse} />
                    {row.adapter ? (
                      <Badge variant="muted">
                        {CONNECTOR_LABELS[asConnector(row.adapter)]}
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function ProbeList({ rows }: { rows: LiveProbeRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">Nenhum probe nesta janela.</p>;
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map((row) => (
        <Card key={row.id} className="p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-fg">{row.source_name ?? row.source_system_id}</p>
            <Badge variant={row.ok ? "ok" : "danger"}>
              {row.http_status != null ? `HTTP ${row.http_status}` : "falha"}
            </Badge>
          </div>
          <p className="mt-2 break-all font-mono text-xs text-muted">{row.url}</p>
          <p className="mt-2 text-sm text-muted">{row.excerpt ?? row.error ?? "—"}</p>
        </Card>
      ))}
    </div>
  );
}

function LocalOnlyTable({ rows }: { rows: LocalOnlyRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">Nenhum local-only nesta janela.</p>;
  }
  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ente</TableHead>
            <TableHead>Objeto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Visto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.slice(0, 40).map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Link
                  to="/fontes/$id"
                  params={{ id: row.source_system_id }}
                  className="text-fg hover:underline"
                >
                  {row.source_name ?? row.source_system_id}
                </Link>
                <p className="text-xs text-muted">
                  {row.uf ?? "—"} · {row.source_identifier}
                </p>
              </TableCell>
              <TableCell className="max-w-sm truncate">
                {row.object ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant="muted">{LOCAL_ONLY_LABELS[asLocal(row.local_only_state)]}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted">
                {row.first_seen_at?.slice(0, 16).replace("T", " ") ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">Nenhum conflito observado.</p>;
  }
  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campo</TableHead>
            <TableHead>Fonte A</TableHead>
            <TableHead>Fonte B</TableHead>
            <TableHead>Objeto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.slice(0, 30).map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-xs">{row.field}</TableCell>
              <TableCell className="text-xs">
                {row.source_a_id}
                <p className="text-muted">{row.value_a}</p>
              </TableCell>
              <TableCell className="text-xs">
                {row.source_b_id}
                <p className="text-muted">{row.value_b}</p>
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm">
                {row.object ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function CensusTable({ rows }: { rows: MunicipalityCensusRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">Censo municipal ainda vazio.</p>;
  }
  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Município</TableHead>
            <TableHead>IBGE</TableHead>
            <TableHead>Presença</TableHead>
            <TableHead>Fonte</TableHead>
            <TableHead>Evidência</TableHead>
            <TableHead>Adapter</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                {row.name}
                <span className="ml-2 text-xs text-muted">{row.uf}</span>
              </TableCell>
              <TableCell className="font-mono text-xs">{row.ibge_code ?? "—"}</TableCell>
              <TableCell>
                {PORTAL_PRESENCE_LABELS[asPresence(row.portal_presence)]}
              </TableCell>
              <TableCell>
                {row.source_system_id ? (
                  <Link
                    to="/fontes/$id"
                    params={{ id: row.source_system_id }}
                    className="text-fg hover:underline"
                  >
                    {row.source_name ?? row.source_system_id}
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{EVIDENCE_LABELS[asLevel(row.evidence_level)]}</TableCell>
              <TableCell className="font-mono text-xs">{row.adapter ?? "NONE"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
