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
import { getMilestone6Fn } from "@/lib/registry/api";
import { formatHours, formatInt, formatPct } from "@/lib/registry/format";
import {
  ADAPTER_FIT_LABELS,
  CONNECTOR_LABELS,
  CONNECTOR_READINESS_LABELS,
  INGESTION_MODE_LABELS,
  PUBLIC_KEY_SEMANTICS_LABELS,
  TECHNOLOGY_LABELS,
  VALUE_CLASSIFICATION_LABELS,
} from "@/lib/registry/labels";
import type { FamilyRankRow, Milestone6Metrics } from "@/lib/registry/models";
import { asTechFamily } from "@/lib/registry/view";

export const Route = createFileRoute("/prioridades")({ component: PrioridadesPage });

const WEIGHT_LABELS: Record<string, string> = {
  coverage_gap: "Gap PNCP",
  estimated_volume: "Volume não capturado",
  lead_time: "Antecedência",
  technical_reuse: "Reuso técnico",
  source_reliability: "Confiabilidade",
  evidence_confidence: "Evidência",
  public_access: "Acesso público",
  historical_depth: "Profundidade",
  maintenance_risk_inverted: "1 − risco de manutenção",
  integration_cost_inverted: "1 − custo de integração",
};

function PrioridadesPage() {
  const query = useQuery({
    queryKey: ["milestone6"],
    queryFn: () => getMilestone6Fn(),
  });
  const metrics = query.data;

  return (
    <PageShell>
      <PageHeader
        title="Próximas fontes"
        description="Ranking v2 com ingestão live do Portal de Compras Públicas. Pesos iguais ao v1; o que muda são os insumos observados."
      />

      {query.isLoading ? (
        <PageSkeleton rows={8} />
      ) : query.isError ? (
        <QueryErrorState
          message={query.error instanceof Error ? query.error.message : "Erro desconhecido."}
          onRetry={() => query.refetch()}
        />
      ) : metrics ? (
        <RankingBody metrics={metrics} />
      ) : null}
    </PageShell>
  );
}

function RankingBody({ metrics }: { metrics: Milestone6Metrics }) {
  const chosen = metrics.ranking[0];
  return (
    <>
      <section className="mb-8 flex flex-wrap items-center gap-3">
        <Badge variant={metrics.milestone_verdict === "GO" ? "ok" : "danger"}>
          {metrics.milestone_verdict}
        </Badge>
        <p className="text-sm text-muted">
          {metrics.window_label} · score {metrics.score_version} · adapter comercial{" "}
          <span className="text-fg">{metrics.commercial_adapter_verdict}</span>
        </p>
        <Link to="/oportunidades" className="text-sm text-muted hover:text-fg">
          Oportunidades antecipadas →
        </Link>
        <Link to="/cobertura" className="text-sm text-muted hover:text-fg">
          Cobertura →
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          label="Família escolhida"
          value={
            metrics.chosen_family
              ? TECHNOLOGY_LABELS[asTechFamily(metrics.chosen_family)]
              : "—"
          }
          hint={
            chosen
              ? `${ADAPTER_FIT_LABELS[chosen.adapter_fit] ?? chosen.adapter_fit} · score ${chosen.final_score.toFixed(1)}`
              : undefined
          }
          claim="FATO_VERIFICADO"
        />
        <Metric
          label="PCP live"
          value={`${formatInt(metrics.live_entes)} entes`}
          hint={`${formatInt(metrics.live_records)} records LIVE · ${formatInt(metrics.fixture_records)} fixture (M5)`}
          claim="FATO_VERIFICADO"
        />
        <Metric
          label="Overlap PNCP (live)"
          value={formatPct(metrics.pcp_pncp_overlap_ratio)}
          hint={`Compras.gov ${formatPct(metrics.pcp_comprasgov_overlap_ratio)} · local-only ${formatInt(metrics.pcp_local_only)}`}
          claim="FATO_VERIFICADO"
        />
        <Metric
          label="Antecedência PCP"
          value={formatHours(metrics.pcp_median_lead_time_hours)}
          hint={`p75 ${formatHours(metrics.pcp_p75_lead_time_hours)} · p95 ${formatHours(metrics.pcp_p95_lead_time_hours)}`}
          claim="FATO_VERIFICADO"
        />
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          label="publicKey apipcp"
          value={PUBLIC_KEY_SEMANTICS_LABELS[metrics.public_key_semantics] ?? metrics.public_key_semantics}
          hint={`${VALUE_CLASSIFICATION_LABELS[metrics.public_key_classification] ?? metrics.public_key_classification} · ${CONNECTOR_READINESS_LABELS[metrics.public_key_readiness] ?? metrics.public_key_readiness}`}
          claim="FATO_VERIFICADO"
        />
        <Metric
          label="Paginação"
          value={metrics.page2_distinct ? "página 2 ≠ 1" : "não comprovada"}
          hint={`${metrics.pagination_type} · GET público compras.api v2`}
          claim={metrics.page2_distinct ? "FATO_VERIFICADO" : "PENDENTE_DE_VALIDACAO"}
        />
        <Metric
          label="Confiabilidade"
          value={
            metrics.reliability_success_ratio == null
              ? "—"
              : formatPct(metrics.reliability_success_ratio)
          }
          hint={
            metrics.reliability_median_latency_ms == null
              ? "latência não medida"
              : `mediana ${Math.round(metrics.reliability_median_latency_ms)} ms`
          }
          claim="FATO_VERIFICADO"
        />
        <Metric
          label="PCP × BLL"
          value={`${metrics.pcp_score?.toFixed(1) ?? "—"} / ${metrics.bll_score?.toFixed(1) ?? "—"}`}
          hint="Score v2. BLL já capturado perde volume residual."
          claim="INFERENCIA"
        />
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-medium tracking-tight">
          Entes PCP live
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          Config por ente é o filtro público <span className="font-mono text-fg">orgao</span>, não
          publicKey. Mesmo generic-json, zero forks.
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {metrics.live_ente_rows.map((row) => (
            <Card key={row.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-fg">{row.label}</p>
                <Badge variant={row.count > 0 ? "ok" : "warn"}>
                  {row.readiness
                    ? (CONNECTOR_READINESS_LABELS[row.readiness] ?? row.readiness)
                    : INGESTION_MODE_LABELS.LIVE_PUBLIC_API}
                </Badge>
              </div>
              <p className="mt-2 font-mono text-xs text-muted">{row.id}</p>
              <p className="mt-2 text-sm text-muted">
                {formatInt(row.count)} records {INGESTION_MODE_LABELS.LIVE_PUBLIC_API.toLowerCase()}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-medium tracking-tight">
          Ranking de famílias
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          Volume é o que ainda não foi capturado. Família já ingerida (BLL) perde
          posição mesmo com muitos records. Clique na linha para ver os componentes.
        </p>
        <RankTable rows={metrics.ranking} />
      </section>

      {chosen ? <WhyFirst row={chosen} /> : null}

      <section className="mt-10">
        <h2 className="font-display text-xl font-medium tracking-tight">
          Fórmula v2
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          Mesmos pesos do v1. Soma = 1. Custo e risco entram invertidos. v1 permanece
          gravado na coorte anterior.
        </p>
        <WeightsCard weights={chosen?.weights ?? null} />
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-medium tracking-tight">
          Amostras técnicas live
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          GET público desta sessão. Sem login, sem extração de segredo, sem adapter comercial.
          HTTP 400 de autenticação é erro de configuração, não de parser.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {metrics.probes.map((row) => (
            <Card key={row.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-fg">
                  {row.family ? TECHNOLOGY_LABELS[asTechFamily(row.family)] : row.url}
                </p>
                <Badge variant={row.ok ? "ok" : "danger"}>
                  {row.http_status != null ? `HTTP ${row.http_status}` : "falha"}
                </Badge>
              </div>
              <p className="mt-2 break-all font-mono text-xs text-muted">{row.url}</p>
              <p className="mt-2 text-sm text-muted">{row.excerpt ?? row.error ?? "—"}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-3 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-display text-lg font-medium tracking-tight">
            Fato · inferência · pendente
          </h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <li>
              <span className="text-fg">FATO</span> — publicKey da apipcp é credencial
              privada (chave de verificação). Não entra em connector_config. SPA pública
              não a embute.
            </li>
            <li>
              <span className="text-fg">FATO</span> — discovery live usa GET
              compras.api /v2/licitacao/processos, sem chave, filtro orgao por ente.
              {` ${formatInt(metrics.live_entes)}`} entes, {formatInt(metrics.live_records)}{" "}
              records LIVE. PcpAdapter não criado.
            </li>
            <li>
              <span className="text-fg">FATO</span> — página 2 de Mogi{" "}
              {metrics.page2_distinct ? "difere" : "não comprovou diferir"} da página 1.
              Itens {metrics.items_observed ? "observados" : "não observados"}; documentos{" "}
              {metrics.documents_observed ? "parciais" : "não observados"}.
            </li>
            <li>
              <span className="text-fg">INFERÊNCIA</span> — ganho residual de cobertura
              PCP ainda supera BLL porque o censo nacional PCP não está capturado.
            </li>
            <li>
              <span className="text-fg">PENDENTE</span> — publicKeys municipais nunca
              usadas. Censo 5.570 não reivindicado. CNPJ ausente na listagem v2.
            </li>
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-display text-lg font-medium tracking-tight">
            GO / NO-GO
          </h3>
          <p className="mt-3 text-sm text-muted">
            Milestone 6 é {metrics.milestone_verdict}: semântica da publicKey esclarecida,
            nenhuma credencial privada persistida, generic-json reusado, coorte live
            separada da avaliação M5. Adapter comercial permanece NO-GO.
          </p>
          <p className="mt-3 text-sm text-muted">
            {metrics.public_key_rationale}
          </p>
          <p className="mt-3 font-mono text-xs text-muted">
            Reuso genérico {metrics.generic_reuse_verdict}
            {" · "}
            {CONNECTOR_LABELS.GENERIC_JSON}
            {" · "}
            checkpoints {formatInt(metrics.checkpoints)}
          </p>
        </Card>
      </section>
    </>
  );
}

function WhyFirst({ row }: { row: FamilyRankRow }) {
  const entries = Object.entries(row.components).sort((a, b) => b[1] - a[1]);
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-medium tracking-tight">
        Por que esta fonte está em primeiro?
      </h2>
      <p className="mt-1 mb-4 text-sm text-muted">
        {TECHNOLOGY_LABELS[asTechFamily(row.family)]} · score {row.final_score.toFixed(1)}{" "}
        · {row.rationale}
      </p>
      <Card className="p-5">
        <ul className="flex flex-col gap-3">
          {entries.map(([key, value]) => {
            const weight = row.weights[key as keyof typeof row.weights] ?? 0;
            const contribution = value * weight;
            return (
              <li key={key}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-fg">{WEIGHT_LABELS[key] ?? key}</span>
                  <span className="font-mono text-xs text-muted">
                    {value.toFixed(2)} × {weight.toFixed(2)} = {contribution.toFixed(3)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-sm bg-surface-2">
                  <div
                    className="h-full rounded-sm bg-accent"
                    style={{ width: `${Math.round(value * 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}

function RankTable({ rows }: { rows: FamilyRankRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">Nenhuma família avaliada nesta janela.</p>;
  }
  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Família</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>VERIFIED</TableHead>
            <TableHead>Gap PNCP</TableHead>
            <TableHead>Fit</TableHead>
            <TableHead>Custo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const family = asTechFamily(row.family);
            return (
              <TableRow key={row.family}>
                <TableCell className="font-mono text-sm">{row.rank}</TableCell>
                <TableCell>
                  <Link
                    to="/familias/$family"
                    params={{ family }}
                    className="font-medium text-fg hover:underline"
                  >
                    {TECHNOLOGY_LABELS[family]}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {formatInt(row.records_local)} records · local-only{" "}
                    {formatInt(row.local_only)} · antecedência{" "}
                    {formatHours(row.median_lead_time_hours)}
                  </p>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {row.final_score.toFixed(1)}
                </TableCell>
                <TableCell>{formatInt(row.verified_entities)}</TableCell>
                <TableCell>{formatPct(row.components.coverage_gap)}</TableCell>
                <TableCell>
                  <Badge variant={row.generic_reuse === "GO" ? "ok" : "muted"}>
                    {ADAPTER_FIT_LABELS[row.adapter_fit] ?? row.adapter_fit}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted">
                  {row.integration_cost.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function WeightsCard({ weights }: { weights: FamilyRankRow["weights"] | null }) {
  const entries = Object.entries(weights ?? {}).sort((a, b) => b[1] - a[1]);
  return (
    <Card className="p-5">
      <p className="mb-4 text-xs tracking-wide text-subtle uppercase">
        source_integration_priority_score v2
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <li key={key} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted">{WEIGHT_LABELS[key] ?? key}</span>
            <span className="font-mono text-fg">{value.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </Card>
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
