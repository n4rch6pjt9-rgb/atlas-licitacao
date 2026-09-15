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
  getMilestone3Fn,
  getMilestone4Fn,
  listCensusFn,
  listFamilyCandidatesFn,
} from "@/lib/registry/api";
import { formatHours, formatInt, formatPct } from "@/lib/registry/format";
import {
  CONNECTOR_LABELS,
  EVIDENCE_LABELS,
  TECHNOLOGY_LABELS,
} from "@/lib/registry/labels";
import type { CensusRow, FamilyCandidateRow } from "@/lib/registry/models";
import {
  CLAIM_KINDS,
  EVIDENCE_LEVELS,
  FRAMEWORK_FAMILIES,
  VENDOR_FAMILIES,
  type ClaimKind,
  type EvidenceLevel,
} from "@/lib/registry/types";
import { asConnector, asTechFamily } from "@/lib/registry/view";

export const Route = createFileRoute("/censo")({ component: CensoPage });

function asClaim(value: string): ClaimKind {
  return (CLAIM_KINDS as readonly string[]).includes(value)
    ? (value as ClaimKind)
    : "PENDENTE_DE_VALIDACAO";
}

function asLevel(value: string): EvidenceLevel {
  return (EVIDENCE_LEVELS as readonly string[]).includes(value)
    ? (value as EvidenceLevel)
    : "UNKNOWN";
}

function Verdict({ value }: { value: "GO" | "NO-GO" }) {
  return (
    <Badge variant={value === "GO" ? "ok" : "danger"}>{value}</Badge>
  );
}

function CensoPage() {
  const metricsQuery = useQuery({
    queryKey: ["milestone3"],
    queryFn: () => getMilestone3Fn(),
  });
  const coverageQuery = useQuery({
    queryKey: ["milestone4"],
    queryFn: () => getMilestone4Fn(),
  });
  const candidatesQuery = useQuery({
    queryKey: ["family-candidates"],
    queryFn: () => listFamilyCandidatesFn(),
  });
  const censusQuery = useQuery({
    queryKey: ["census-rows"],
    queryFn: () => listCensusFn(),
  });

  const loading =
    metricsQuery.isLoading ||
    candidatesQuery.isLoading ||
    censusQuery.isLoading ||
    coverageQuery.isLoading;
  const error =
    metricsQuery.error || candidatesQuery.error || censusQuery.error || coverageQuery.error;
  const metrics = metricsQuery.data;
  const coverage = coverageQuery.data;
  const candidates = candidatesQuery.data ?? [];
  const rows = censusQuery.data ?? [];

  const commercial = candidates.filter((row) =>
    VENDOR_FAMILIES.has(asTechFamily(row.technology_family)),
  );
  const frameworks = candidates.filter((row) =>
    FRAMEWORK_FAMILIES.has(asTechFamily(row.technology_family)),
  );

  return (
    <PageShell>
      <PageHeader
        title="Censo de famílias"
        description="Evidência comercial primeiro. Fingerprint técnico depois. Um adapter de fornecedor só nasce quando o genérico fica cheio de exceções."
      />

      {loading ? (
        <PageSkeleton rows={6} />
      ) : error ? (
        <QueryErrorState
          message={error instanceof Error ? error.message : "Erro desconhecido."}
          onRetry={() => {
            metricsQuery.refetch();
            candidatesQuery.refetch();
            censusQuery.refetch();
            coverageQuery.refetch();
          }}
        />
      ) : (
        <>
          <section className="grid gap-3 md:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs tracking-wide text-subtle uppercase">
                Adapter comercial
              </p>
              <p className="mt-2 font-display text-3xl font-medium tracking-tight">
                {metrics?.commercial_adapter_verdict ?? "NO-GO"}
              </p>
              <p className="mt-2 text-sm text-muted">
                Nenhum ParadigmaAdapter, FiorilliAdapter ou BllAdapter. O genérico
                cobre o contrato público observado.
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs tracking-wide text-subtle uppercase">
                Reuso genérico
              </p>
              <p className="mt-2 font-display text-3xl font-medium tracking-tight">
                {metrics?.generic_reuse_verdict ?? "NO-GO"}
              </p>
              <p className="mt-2 text-sm text-muted">
                Família escolhida:{" "}
                {metrics?.chosen_family
                  ? TECHNOLOGY_LABELS[asTechFamily(metrics.chosen_family)]
                  : "nenhuma"}
                {metrics?.chosen_adapter
                  ? ` · ${CONNECTOR_LABELS[asConnector(metrics.chosen_adapter)]}`
                  : null}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs tracking-wide text-subtle uppercase">
                Famílias com evidência
              </p>
              <p className="mt-2 font-display text-3xl font-medium tracking-tight">
                {formatInt(metrics?.families_verified ?? 0)}
              </p>
              <p className="mt-2 text-sm text-muted">
                Integração PNCP declarada:{" "}
                {formatPct(metrics?.pncp_overlap_ratio ?? 0)} — não é overlap de
                records. Mudanças históricas:{" "}
                {formatInt(metrics?.historical_vendor_changes ?? 0)}.
              </p>
            </Card>
          </section>

          {coverage ? (
            <section className="mt-6">
              <Link
                to="/cobertura"
                className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs tracking-wide text-subtle uppercase">
                    Overlap de records
                  </p>
                  <p className="mt-1 font-display text-xl font-medium tracking-tight">
                    PNCP {formatPct(coverage.pncp_overlap_ratio)} · Compras.gov{" "}
                    {formatPct(coverage.comprasgov_overlap_ratio)}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {formatInt(coverage.records_ingested_local)} registros locais ·
                    local-only {formatInt(coverage.local_only_provisional + coverage.local_only_confirmed)} ·
                    antecedência {formatHours(coverage.median_lead_time_hours)}
                  </p>
                </div>
                <span className="text-sm text-muted">Abrir cobertura →</span>
              </Link>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="font-display text-xl font-medium tracking-tight">
              Candidatas comerciais
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              VERIFIED só com documento oficial, contrato, manual ou identificação
              explícita de produto no portal do ente. .xhtml, .action e JSESSIONID
              não entram aqui.
            </p>
            <CandidateTable rows={commercial} />
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-medium tracking-tight">
              Frameworks
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Família técnica. Nunca promover a fornecedor.
            </p>
            <CandidateTable rows={frameworks} />
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-medium tracking-tight">
              Ente · portal · sistema · fornecedor
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Histórico não sobrescreve o vigente. SC estadual 2014–2023 WBC
              permanece como intervalo fechado; o vigente é e-LIC / API JSON.
            </p>
            <CensusTable rows={rows} />
          </section>

          <section className="mt-10 grid gap-3 md:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-display text-lg font-medium tracking-tight">
                Similaridade de schema
              </h3>
              <p className="mt-2 text-sm text-muted">
                {metrics?.schema_similarity[0]?.note ??
                  "Schema parecido não prova fornecedor."}
              </p>
              {metrics?.schema_similarity[0] ? (
                <p className="mt-3 font-mono text-xs text-subtle">
                  {metrics.schema_similarity[0].left_id} ×{" "}
                  {metrics.schema_similarity[0].right_id} · Jaccard{" "}
                  {metrics.schema_similarity[0].jaccard}
                </p>
              ) : null}
            </Card>
            <Card className="p-5">
              <h3 className="font-display text-lg font-medium tracking-tight">
                Limitações e hipóteses
              </h3>
              <ul className="mt-2 flex flex-col gap-2 text-sm text-muted">
                <li>
                  Fiorilli: Assis ao vivo é ExtJS SPA (comprasedital.dll +
                  fiorilli.css), sem lista HTML/JSON pública. Itapira timeout.
                  FiorilliAdapter = NO-GO.
                </li>
                <li>
                  Paradigma: Florianópolis e Barueri vigentes, assets
                  /portal/css/portalcss + kendoUI (ASP.NET, não JSF). 2 fontes —
                  escala insuficiente.
                </li>
                <li>
                  Licitanet, BNC, BBMNET, Licitar Digital, ComprasBR: cadastro
                  Transferegov VERIFIED na plataforma, censo de entes PENDENTE.
                </li>
                <li>
                  Integração PNCP no censo de fontes é declaração de edital.
                  Overlap real de records está em Cobertura, após entity resolution.
                </li>
              </ul>
            </Card>
          </section>
        </>
      )}
    </PageShell>
  );
}

function CandidateTable({ rows }: { rows: FamilyCandidateRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">Nenhuma candidata neste grupo.</p>;
  }
  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Família</TableHead>
            <TableHead>Fontes</TableHead>
            <TableHead>Verificadas</TableHead>
            <TableHead>Adapter</TableHead>
            <TableHead>Comercial</TableHead>
            <TableHead>Reuso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const family = asTechFamily(row.technology_family);
            return (
              <TableRow key={row.technology_family}>
                <TableCell>
                  <Link
                    to="/familias/$family"
                    params={{ family }}
                    className="font-medium text-fg hover:underline"
                  >
                    {TECHNOLOGY_LABELS[family]}
                  </Link>
                  <p className="mt-1 max-w-xs text-xs text-muted">{row.rationale}</p>
                </TableCell>
                <TableCell>{formatInt(row.source_count)}</TableCell>
                <TableCell>{formatInt(row.verified_sources)}</TableCell>
                <TableCell className="font-mono text-xs">
                  {row.adapter_candidate
                    ? CONNECTOR_LABELS[asConnector(row.adapter_candidate)]
                    : "—"}
                </TableCell>
                <TableCell>
                  <Verdict value={row.commercial_adapter} />
                </TableCell>
                <TableCell>
                  <Verdict value={row.generic_reuse} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function CensusTable({ rows }: { rows: CensusRow[] }) {
  const sorted = [...rows].sort((a, b) => {
    const fa = a.technology_family.localeCompare(b.technology_family);
    if (fa !== 0) return fa;
    return a.ente.localeCompare(b.ente);
  });
  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ente</TableHead>
            <TableHead>Portal</TableHead>
            <TableHead>Sistema</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Nível</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.source_id}>
              <TableCell>
                <Link
                  to="/fontes/$id"
                  params={{ id: row.source_id }}
                  className="font-medium text-fg hover:underline"
                >
                  {row.ente}
                </Link>
                {row.uf ? (
                  <span className="ml-1 text-xs text-subtle">{row.uf}</span>
                ) : null}
              </TableCell>
              <TableCell className="max-w-40 truncate font-mono text-xs text-muted">
                {row.portal ?? "—"}
              </TableCell>
              <TableCell className="text-sm">{row.sistema ?? "—"}</TableCell>
              <TableCell className="text-sm">{row.vendor ?? "—"}</TableCell>
              <TableCell className="text-sm">{row.product ?? "—"}</TableCell>
              <TableCell className="max-w-48 text-xs text-muted">
                {row.period}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline">
                    {EVIDENCE_LABELS[asLevel(row.evidence_level)]}
                  </Badge>
                  <ClaimBadge kind={asClaim(row.claim_kind)} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
