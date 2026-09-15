import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PaFrameworkNote } from "@/components/pa-note";
import { PageHeader, PageShell } from "@/components/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listSourcesFn } from "@/lib/registry/api";
import { formatInt } from "@/lib/registry/format";
import { CONNECTOR_LABELS } from "@/lib/registry/labels";
import type { ConnectorType } from "@/lib/registry/types";
import { asConnector } from "@/lib/registry/view";

export const Route = createFileRoute("/adapters")({ component: AdaptersPage });

const ADAPTERS: {
  type: ConnectorType;
  slug: string;
  title: string;
  golden: string;
  body: string;
}[] = [
  {
    type: "GENERIC_JSON",
    slug: "generic-json",
    title: "generic-json",
    golden: "SC · PNCP · Compras.gov",
    body: "GET em API JSON pública. Paginação, campos e paths entram como config por fonte — não como scraper novo.",
  },
  {
    type: "GENERIC_ACTION",
    slug: "generic-action",
    title: "generic-action",
    golden: "RJ e portais Struts / .action",
    body: "POST/GET HTML público, action path e parâmetros nomeados. Um adapter cobre N entes e N canais do mesmo portal. BLL: Processos, Compra Direta e Localização — configs distintas, zero forks por município, zero BllAdapter.",
  },
  {
    type: "GENERIC_JSF",
    slug: "generic-jsf",
    title: "generic-jsf",
    golden: "PA e portais .xhtml",
    body: "ViewState / postback JSF. Reusa o mesmo coletor. .xhtml não prova Paradigma, Fiorilli nem qualquer marca.",
  },
];

function AdaptersPage() {
  const sourcesQuery = useQuery({
    queryKey: ["sources", "adapters"],
    queryFn: () => listSourcesFn(),
  });
  const sources = sourcesQuery.data ?? [];
  const counts = new Map<ConnectorType, number>();
  for (const source of sources) {
    const type = asConnector(source.connector_type);
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  const reused = sources.filter((s) =>
    ["GENERIC_JSON", "GENERIC_ACTION", "GENERIC_JSF"].includes(
      asConnector(s.connector_type),
    ),
  ).length;

  return (
    <PageShell>
      <PageHeader
        title="Adapters"
        description="1 adapter, N configs. A expansão por ente não escala; a expansão por família sim."
      />

      <Card className="mb-6 p-5">
        <CardHeader className="mb-2">
          <CardTitle>Reuso</CardTitle>
          <CardDescription>
            Configuração vive no source_system. O adapter não conhece o município.
            Destino: M famílias + configs, não N scrapers.
          </CardDescription>
        </CardHeader>
        <p className="text-sm text-muted">
          Fontes no adapter genérico: {formatInt(reused)} de {formatInt(sources.length)}
        </p>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {ADAPTERS.map((adapter) => (
          <Card key={adapter.type} className="p-4">
            <p className="font-mono text-xs text-muted">{adapter.slug}</p>
            <h2 className="mt-1 font-display text-lg font-medium tracking-tight">
              {adapter.title}
            </h2>
            <p className="mt-3 text-sm text-fg">{adapter.body}</p>
            <p className="mt-3 text-xs text-muted">Golden: {adapter.golden}</p>
            <p className="mt-2 text-xs text-subtle">
              {formatInt(counts.get(adapter.type) ?? 0)} configs ·{" "}
              {CONNECTOR_LABELS[adapter.type]}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <PaFrameworkNote />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium tracking-tight">
          Quando não reusar
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Só criar adapter novo quando a família comprovada não couber em
          generic-json, generic-action ou generic-jsf. Marca comercial exige
          evidência; framework sozinho não justifica um coletor próprio.
        </p>
        <Link
          to="/familias"
          className="mt-4 inline-flex min-h-11 items-center text-sm text-muted hover:text-fg"
        >
          Ver famílias
        </Link>
      </section>
    </PageShell>
  );
}
