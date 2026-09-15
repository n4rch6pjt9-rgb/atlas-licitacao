import { createFileRoute } from "@tanstack/react-router";
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
import { getGate75Fn } from "@/lib/registry/api";
import { formatInt, formatPct } from "@/lib/registry/format";
import { DATA_ORIGIN_LABELS, localOnlyUxLabel } from "@/lib/registry/labels";
import type { Gate75Report, Gate75SignalVerdict } from "@/lib/registry/models";

export const Route = createFileRoute("/validacao")({
  component: ValidacaoPage,
});

const SIGNAL_LABELS: Record<keyof Gate75Report["signals"], string> = {
  recurrence: "Recorrência",
  planning_link: "Ligação planejamento → contratação",
  pca_live: "PCA live",
  pgc_live: "PGC live",
  arp_live: "ARP live",
  window_7d: "Janela de 7 dias",
  attention: "Attention score",
  alerts: "Alertas",
};

function Verdict({ value }: { value: "GO" | "NO-GO" | boolean }) {
  const go = value === true || value === "GO";
  return <Badge variant={go ? "ok" : "danger"}>{go ? "GO" : "NO-GO"}</Badge>;
}

function ValidacaoPage() {
  const query = useQuery({
    queryKey: ["gate75"],
    queryFn: () => getGate75Fn(),
    staleTime: 60_000,
  });

  return (
    <PageShell>
      <PageHeader
        title="Gate 7.5 — Engineering GO / validação estatística NO-GO"
        description="PCA, PGC e ARP live estão operacionalizados. Recorrência, planning-link e attention score ainda não têm validação suficiente. M8 permanece fechado. Golden nunca entra nas métricas live."
      />

      {query.isLoading ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Ingestão live limitada a 22 segundos. Golden não entra nestas métricas. Recorrência
            não é previsão.
          </p>
          <PageSkeleton rows={10} />
        </div>
      ) : query.isError ? (
        <QueryErrorState
          message={query.error instanceof Error ? query.error.message : "Erro desconhecido."}
          onRetry={() => query.refetch()}
        />
      ) : query.data ? (
        <ReportBody report={query.data} />
      ) : null}
    </PageShell>
  );
}

function ReportBody({ report }: { report: Gate75Report }) {
  const quality = report.quality as Record<string, unknown>;
  const precision = (quality.planning_precision ?? {}) as {
    n?: number;
    incorrect_confirmed?: number;
    harden_confirmed_rule?: boolean;
    reclassified_from_confirmed?: number;
    demoted_to_probable?: number;
    demoted_to_review?: number;
    confirmed?: { point?: number | null; n?: number };
  };
  const windowLive = (quality.window_live ?? {}) as {
    n?: number;
    n_matched?: number;
    n_still_in_window?: number;
    cohort_matured?: boolean;
    pct_24h?: number | null;
    pct_72h?: number | null;
    pct_7d?: number | null;
    pct_14d?: number | null;
    median_hours?: number | null;
  };
  const recurrence = (quality.recurrence ?? {}) as {
    series_n?: number;
    high_or_medium?: number;
    sample_too_small?: boolean;
    leakage_count?: number;
    engine_beats_best_baseline_90d?: boolean | null;
  };
  const alerts = (quality.alerts ?? {}) as {
    events_generated?: number;
    duplicates_suppressed?: number;
    idempotent?: boolean;
  };
  const pcaPgc = (quality.pca_pgc ?? []) as Array<{
    pca_planning_id: string;
    pgc_planning_id: string;
    status: string;
    auto_merged: boolean;
  }>;
  const attention = (quality.attention ?? {}) as {
    n?: number;
    absurd_count?: number;
    bad_cases?: Array<{ id: string; score: number; data_confidence: number; reason: string | null }>;
    notes?: string;
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-3 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-xs tracking-wide text-subtle uppercase">Estado do gate</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Engineering</span>
            <Verdict value={report.engineering_go} />
            <span className="text-sm text-muted">Validação estatística</span>
            <Verdict value={report.statistical_go} />
          </div>
          <p className="mt-3 font-display text-lg font-medium tracking-tight">{report.project_state}</p>
          <p className="mt-2 text-sm text-muted">
            Corte {report.as_of.slice(0, 16).replace("T", " ")} UTC. M8 {report.m8.choice}
            {report.m8.closest_if_forced !== "NONE"
              ? ` · direção mais próxima ${report.m8.closest_if_forced} (${report.m8.closest_confidence === "PRELIMINARY" ? "preliminar" : "com evidência"})`
              : ""}
          </p>
          {report.statistical_missing.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
              {report.statistical_missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </Card>
        <Card className="p-5">
          <p className="text-xs tracking-wide text-subtle uppercase">Milestone 8</p>
          <p className="mt-2 font-display text-2xl font-medium tracking-tight">Não abrir M8</p>
          <p className="mt-2 text-sm text-muted">{report.m8.rationale}</p>
          {report.m8.closest_if_forced === "C" ? (
            <p className="mt-3 text-sm text-muted">
              C (cobertura) é bússola preliminar, não escolha. Depois de 21/09, só com os três números:
              precision CONFIRMED após endurecimento, follow-through n≥30, ganho local após late matching.
            </p>
          ) : null}
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
            {report.m8.m8_c_requires.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-xs tracking-wide text-subtle uppercase">Janela de 7 dias</p>
          <p className="mt-2 font-display text-2xl font-medium tracking-tight">
            Manter {report.window_recommendation.keep_days} dias
          </p>
          <p className="mt-2 text-sm text-muted">{report.window_recommendation.reason}</p>
          <p className="mt-3 text-xs text-subtle">
            Reavaliar depois de {report.window_recommendation.reevaluate_after}. Não aplicar
            automaticamente.
          </p>
          <p className="mt-3 text-sm text-fg">
            Alias de tela: {localOnlyUxLabel("LOCAL_ONLY_CONFIRMED")}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs tracking-wide text-subtle uppercase">Até 21/09 — só quatro trabalhos</p>
          <ul className="mt-3 space-y-3">
            {report.workstreams.map((item) => (
              <li key={item.id} className="flex gap-3">
                <Badge variant={item.status === "DONE" ? "ok" : "warn"}>
                  {item.status === "DONE" ? "feito" : "em curso"}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm text-fg">{item.title}</p>
                  <p className="text-xs text-subtle">{item.notes}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">{report.decisive_gate.action}</p>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-medium tracking-tight">Sinais</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {(Object.keys(SIGNAL_LABELS) as Array<keyof Gate75Report["signals"]>).map((key) => (
            <SignalCard key={key} label={SIGNAL_LABELS[key]} signal={report.signals[key]} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-medium tracking-tight">
          Produto — live vs golden
        </h2>
        <p className="mb-3 text-sm text-muted">
          Contagens isoladas por origem. Golden não entra no denominador live.
        </p>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric
            label="PCA live"
            value={formatInt(report.product.live.pca)}
            hint={`planejamento live ${formatInt(report.product.live.planning)}`}
            claim="FATO_VERIFICADO"
          />
          <Metric
            label="PGC live"
            value={formatInt(report.product.live.pgc)}
            hint="PGC ≠ PCA. Relação observada, nunca auto-merge."
            claim="FATO_VERIFICADO"
          />
          <Metric
            label="ARP live"
            value={formatInt(report.product.live.arp)}
            hint="Instrumento vigente — não é edital novo."
            claim="FATO_VERIFICADO"
          />
          <Metric
            label="PCP overlap live"
            value={formatPct(report.product.pcp_overlap_ratio)}
            hint={`reprocessados ${formatInt(report.product.pcp_reprocess.n)} · maduro sem match ${formatInt(report.product.pcp_reprocess.confirmed)}`}
            claim="FATO_VERIFICADO"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric
            label="Golden planejamento"
            value={formatInt(report.product.golden.planning)}
            hint="Fora das métricas live"
            claim="FATO_VERIFICADO"
          />
          <Metric
            label="Golden ARP"
            value={formatInt(report.product.golden.arp)}
            claim="FATO_VERIFICADO"
          />
          <Metric
            label="Golden oportunidades"
            value={formatInt(report.product.golden.opportunities)}
            claim="FATO_VERIFICADO"
          />
          <Metric
            label="Holdout"
            value={report.holdout_unused ? "intocado" : "contaminado"}
            hint="Compras após 2026-09-01 não calibram regra"
            claim="FATO_VERIFICADO"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-medium tracking-tight">Qualidade amostral</h2>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric
            label="Planning rotulado"
            value={formatInt(precision.n ?? 0)}
            hint={`reclassificados ${formatInt(precision.reclassified_from_confirmed ?? 0)} · ${formatInt(precision.demoted_to_probable ?? 0)} → PROBABLE · ${formatInt(precision.demoted_to_review ?? 0)} → REVIEW · CONFIRMED incorreto ${formatInt(precision.incorrect_confirmed ?? 0)}`}
            claim="PENDENTE_DE_VALIDACAO"
          />
          <Metric
            label="Recorrência n"
            value={formatInt(recurrence.high_or_medium ?? 0)}
            hint={
              recurrence.sample_too_small
                ? `amostra pequena · ${formatInt(recurrence.series_n ?? 0)} séries · holdout intocado`
                : recurrence.engine_beats_best_baseline_90d
                  ? "bate o melhor baseline em 90d"
                  : "não bate baseline"
            }
            claim="INFERENCIA"
          />
          <Metric
            label="Vazamento temporal"
            value={formatInt(recurrence.leakage_count ?? 0)}
            hint="compras depois de T não podem entrar no sinal"
            claim="FATO_VERIFICADO"
          />
          <Metric
            label="Alertas idempotentes"
            value={alerts.idempotent ? "sim" : "não"}
            hint={`eventos ${formatInt(alerts.events_generated ?? 0)} · duplicatas ${formatInt(alerts.duplicates_suppressed ?? 0)}`}
            claim="INFERENCIA"
          />
        </div>
      </section>

      {attention.bad_cases && attention.bad_cases.length > 0 ? (
        <section>
          <h2 className="mb-3 font-display text-xl font-medium tracking-tight">
            Casos ruins de attention v1
          </h2>
          <p className="mb-3 text-sm text-muted">
            Pesos preservados. Coleta para auditoria — não é probabilidade de vitória e não
            recalibra o score.
          </p>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Confiança</TableHead>
                  <TableHead>Razão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attention.bad_cases.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.id}</TableCell>
                    <TableCell>{row.score.toFixed(1)}</TableCell>
                    <TableCell>{Math.round(row.data_confidence * 100)}</TableCell>
                    <TableCell className="text-sm text-muted">{row.reason ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 font-display text-xl font-medium tracking-tight">
          Tempo até match nacional
        </h2>
        <p className="mb-3 text-sm text-muted">
          CDF só em matches observados. Ausência de match não é irregularidade. Coorte PCP 08–14/09
          ainda não madura.
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Metric label="n live" value={formatInt(windowLive.n ?? 0)} claim="FATO_VERIFICADO" />
          <Metric
            label="ainda na janela"
            value={formatInt(windowLive.n_still_in_window ?? 0)}
            claim="FATO_VERIFICADO"
          />
          <Metric
            label="≤ 24h"
            value={windowLive.pct_24h == null ? "—" : formatPct(windowLive.pct_24h)}
            claim="FATO_VERIFICADO"
          />
          <Metric
            label="≤ 7d"
            value={windowLive.pct_7d == null ? "—" : formatPct(windowLive.pct_7d)}
            claim="FATO_VERIFICADO"
          />
          <Metric
            label="≤ 14d"
            value={windowLive.pct_14d == null ? "—" : formatPct(windowLive.pct_14d)}
            claim="FATO_VERIFICADO"
          />
          <Metric
            label="coorte madura"
            value={windowLive.cohort_matured ? "sim" : "não"}
            claim="FATO_VERIFICADO"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-medium tracking-tight">
          Ingestão live desta sessão
        </h2>
        {report.live_ingest ? (
          <p className="mb-3 text-sm text-muted">
            Orçamento {Math.round(report.live_ingest.budget_ms / 1000)}s · PCA consolidado{" "}
            {formatInt(report.live_ingest.pca_consolidado)} · itens PCA{" "}
            {formatInt(report.live_ingest.pca_items)} · PGC {formatInt(report.live_ingest.pgc_items)}{" "}
            · ARP {formatInt(report.live_ingest.arp_rows)} · contratações{" "}
            {formatInt(report.live_ingest.contratacoes)}
            {report.live_ingest.skipped.length
              ? ` · pulados: ${report.live_ingest.skipped.join(", ")}`
              : ""}
          </p>
        ) : (
          <p className="mb-3 text-sm text-muted">Ingestão live ainda não disparada.</p>
        )}
        {report.live_ingest?.errors.length ? (
          <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-muted">
            {report.live_ingest.errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        ) : null}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fonte</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>HTTP</TableHead>
                <TableHead>Linhas</TableHead>
                <TableHead>Erro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.checkpoints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted">
                    Nenhum checkpoint. A ingestão live só corre nesta página.
                  </TableCell>
                </TableRow>
              ) : (
                report.checkpoints.map((row) => (
                  <TableRow key={`${row.source_kind}-${row.fetched_at ?? ""}`}>
                    <TableCell className="font-mono text-xs">{row.source_kind}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "ok" ? "ok" : "danger"}>{row.status}</Badge>
                    </TableCell>
                    <TableCell>{row.http_status ?? "—"}</TableCell>
                    <TableCell>{formatInt(row.rows_ingested)}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted">
                      {row.error ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </section>

      {pcaPgc.length > 0 ? (
        <section>
          <h2 className="mb-3 font-display text-xl font-medium tracking-tight">
            PCA × PGC — relação, não identidade
          </h2>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PCA</TableHead>
                  <TableHead>PGC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Auto-merge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pcaPgc.map((row) => (
                  <TableRow key={`${row.pca_planning_id}-${row.pgc_planning_id}`}>
                    <TableCell className="font-mono text-xs">{row.pca_planning_id}</TableCell>
                    <TableCell className="font-mono text-xs">{row.pgc_planning_id}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.auto_merged ? "sim (erro)" : "não"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-3">
        <ListCard title="Fatos verificados" items={report.facts} />
        <ListCard title="Inferências" items={report.inferences} />
        <ListCard title="Limitações" items={report.limitations} />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <ListCard title="Erros comprovados" items={report.proven_errors} />
        <ListCard title="Correções já aplicadas" items={report.corrections_applied} />
      </section>

      {report.gate75_missing.length > 0 ? (
        <ListCard title="Itens em aberto para o Gate 7.5" items={report.gate75_missing} />
      ) : null}

      <section>
        <h2 className="mb-3 font-display text-xl font-medium tracking-tight">Cohortes</h2>
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Janela</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.cohorts.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.id}</TableCell>
                  <TableCell>{row.kind}</TableCell>
                  <TableCell className="text-xs text-muted">
                    {row.window_start.slice(0, 10)} → {row.window_end.slice(0, 10)}
                  </TableCell>
                  <TableCell className="text-sm text-muted">{row.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      {report.errors.length > 0 ? (
        <section>
          <h2 className="mb-3 font-display text-xl font-medium tracking-tight">
            Taxonomia de erro
          </h2>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.errors.map((row) => (
                  <TableRow key={`${row.code}-${row.entity_type}-${row.notes}`}>
                    <TableCell className="font-mono text-xs">{row.code}</TableCell>
                    <TableCell>{row.entity_type}</TableCell>
                    <TableCell>
                      {DATA_ORIGIN_LABELS[row.data_origin ?? "UNKNOWN"] ?? row.data_origin ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted">{row.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      ) : null}

      {report.forbidden_language_hits.length > 0 ? (
        <Card className="border-danger/40 p-5">
          <p className="text-sm font-medium">Linguagem proibida detectada</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted">
            {report.forbidden_language_hits.map((hit) => (
              <li key={hit}>{hit}</li>
            ))}
          </ul>
        </Card>
      ) : (
        <p className="text-xs text-subtle">
          Nenhuma frase proibida (probabilidade de vitória, ausência definitiva, exclusivo) nos
          textos desta rodada.
        </p>
      )}
    </div>
  );
}

function SignalCard({
  label,
  signal,
}: {
  label: string;
  signal: Gate75SignalVerdict;
}) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium text-fg">{label}</p>
        <Verdict value={signal.verdict} />
        <ClaimBadge kind={signal.claim} />
        <span className="text-xs text-subtle">n={formatInt(signal.n)}</span>
      </div>
      <p className="mt-2 text-sm text-muted">{signal.note}</p>
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
  claim: "FATO_VERIFICADO" | "INFERENCIA" | "PENDENTE_DE_VALIDACAO";
}) {
  return (
    <Card className="p-4">
      <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
      <p className="mt-2 font-display text-2xl font-medium tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      <div className="mt-2">
        <ClaimBadge kind={claim} />
      </div>
    </Card>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="p-5">
      <p className="text-xs tracking-wide text-subtle uppercase">{title}</p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}
