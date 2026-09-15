import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PaFrameworkNote } from "@/components/pa-note";
import { PageHeader, PageShell } from "@/components/page-header";
import { SourceRow } from "@/components/source-row";
import { EmptyState, PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Badge } from "@/components/ui/badge";
import { getFamilySourcesFn, listDiscoveryChannelsFn, listFamiliesFn, listFamilyCandidatesFn } from "@/lib/registry/api";
import { formatInt } from "@/lib/registry/format";
import { CONNECTOR_LABELS, TECHNOLOGY_LABELS } from "@/lib/registry/labels";
import {
  FRAMEWORK_FAMILIES,
  TECHNOLOGY_FAMILIES,
  VENDOR_FAMILIES,
  type TechnologyFamily,
} from "@/lib/registry/types";
import { asConnector, asTechFamily } from "@/lib/registry/view";
import { DiscoveryChannelStack } from "@/components/discovery-channels";

export const Route = createFileRoute("/familias/$family")({
  component: FamilyPage,
});

function isFamily(value: string): value is TechnologyFamily {
  return (TECHNOLOGY_FAMILIES as readonly string[]).includes(value);
}

function FamilyPage() {
  const { family: raw } = Route.useParams();
  const family = isFamily(raw) ? raw : null;

  const sourcesQuery = useQuery({
    queryKey: ["family-sources", family],
    queryFn: () => getFamilySourcesFn({ data: { family: family! } }),
    enabled: family != null,
  });
  const familiesQuery = useQuery({
    queryKey: ["families"],
    queryFn: () => listFamiliesFn(),
  });
  const candidatesQuery = useQuery({
    queryKey: ["family-candidates"],
    queryFn: () => listFamilyCandidatesFn(),
  });
  const channelsQuery = useQuery({
    queryKey: ["discovery-channels", family],
    queryFn: () => listDiscoveryChannelsFn({ data: { family: family ?? "" } }),
    enabled: family === "BLL",
  });

  if (!family) {
    return (
      <PageShell>
        <EmptyState title="Família desconhecida" hint={raw} />
      </PageShell>
    );
  }

  const summary = (familiesQuery.data ?? []).find(
    (row) => asTechFamily(row.family) === family,
  );
  const sources = sourcesQuery.data ?? [];
  const verified =
    summary?.verified_count ??
    sources.filter((s) => s.vendor_evidence_level === "VERIFIED").length;
  const censusPending = VENDOR_FAMILIES.has(family) && verified === 0;
  const showPa = family === "GENERIC_JSF" || family === "PARADIGMA_WBC";
  const adapter = summary?.connector_types[0]
    ? asConnector(summary.connector_types[0])
    : null;
  const candidate = (candidatesQuery.data ?? []).find(
    (row) => asTechFamily(row.technology_family) === family,
  );

  return (
    <PageShell>
      <PageHeader
        title={TECHNOLOGY_LABELS[family]}
        description={
          FRAMEWORK_FAMILIES.has(family)
            ? "Framework não prova fornecedor. Classificação genérica até evidência adicional."
            : VENDOR_FAMILIES.has(family)
              ? "Família comercial. Só atribuir com evidência suficiente."
              : "Família tecnológica do registry."
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{formatInt(sources.length)} fontes</Badge>
        <Badge variant="muted">{formatInt(verified)} verificadas</Badge>
        {adapter ? (
          <Badge variant="outline">{CONNECTOR_LABELS[adapter]}</Badge>
        ) : null}
        {censusPending ? <Badge variant="muted">Censo pendente</Badge> : null}
        {candidate ? (
          <>
            <Badge variant={candidate.commercial_adapter === "GO" ? "ok" : "danger"}>
              Comercial {candidate.commercial_adapter}
            </Badge>
            <Badge variant={candidate.generic_reuse === "GO" ? "ok" : "muted"}>
              Reuso {candidate.generic_reuse}
            </Badge>
          </>
        ) : null}
      </div>

      {candidate ? (
        <p className="mb-6 max-w-3xl text-sm text-muted">{candidate.rationale}</p>
      ) : null}

      {family === "BLL" ? (
        <DiscoveryChannelStack
          channels={channelsQuery.data ?? []}
          title="BLL não é uma superfície só"
          description="Processos, Compra Direta e Busca por Localização são canais públicos distintos. O adapter continua generic-action. Compra Direta não é filtro de pregão. Não abrir adapter BLL. Não contornar CAPTCHA. Milestone 8 permanece fechado."
        />
      ) : null}

      {showPa ? (
        <div className="mb-6">
          <PaFrameworkNote />
        </div>
      ) : null}

      {family === "GENERIC_JSON_API" ? (
        <p className="mb-6 text-sm text-muted">
          Quando o censo estiver semeado, esta família lista SC, PNCP e
          Compras.gov — o mesmo adapter generic-json, três configs.
        </p>
      ) : null}

      {sourcesQuery.isLoading ? (
        <PageSkeleton rows={4} />
      ) : sourcesQuery.isError ? (
        <QueryErrorState
          message={
            sourcesQuery.error instanceof Error
              ? sourcesQuery.error.message
              : "Erro desconhecido."
          }
          onRetry={() => sourcesQuery.refetch()}
        />
      ) : sources.length === 0 ? (
        <EmptyState
          title={
            VENDOR_FAMILIES.has(family)
              ? "Censo pendente"
              : "Nenhuma fonte nesta família"
          }
          hint={
            VENDOR_FAMILIES.has(family)
              ? "Zero fontes verificadas é um estado honesto, não um erro de cadastro."
              : "Fontes classificadas nesta família aparecem aqui."
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {sources.map((source) => (
            <li key={source.id}>
              <SourceRow source={source} />
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/familias"
        className="mt-6 inline-flex min-h-11 items-center text-sm text-muted hover:text-fg"
      >
        Todas as famílias
      </Link>
    </PageShell>
  );
}
