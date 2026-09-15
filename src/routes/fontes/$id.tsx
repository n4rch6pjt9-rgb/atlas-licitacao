import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClaimBadge } from "@/components/claim-badge";
import { MonoPanel } from "@/components/mono-panel";
import { DiscoveryChannelStack } from "@/components/discovery-channels";
import { PaFrameworkNote } from "@/components/pa-note";
import { PageHeader, PageShell } from "@/components/page-header";
import { EmptyState, PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  discoverSourceFn,
  fingerprintSourceFn,
  getSourceFn,
  listSourceRecordsFn,
  verifySourceFn,
} from "@/lib/registry/api";
import { formatDate, formatHours } from "@/lib/registry/format";
import { asEnum, asJsonObject, readBool, readNumber, readString, readStringOrNull, type JsonObject } from "@/lib/registry/json";
import {
  ACCESS_LABELS,
  CAPABILITY_LABELS,
  CAPABILITY_SUPPORT_LABELS,
  CONNECTOR_LABELS,
  CONNECTOR_READINESS_LABELS,
  DISCOVERY_STRATEGY_LABELS,
  ENDPOINT_TYPE_LABELS,
  EVIDENCE_LABELS,
  EVIDENCE_TYPE_LABELS,
  FUNCTIONAL_LABELS,
  HEALTH_LABELS,
  INGESTION_MODE_LABELS,
  LINK_STATUS_LABELS,
  LOCAL_ONLY_LABELS,
  OBSERVATION_LABELS,
  PAGINATION_LABELS,
  PUBLIC_KEY_SEMANTICS_LABELS,
  STATE_LABELS,
  TECHNOLOGY_LABELS,
  VALUE_CLASSIFICATION_LABELS,
} from "@/lib/registry/labels";
import type { SourceDetail, SourceRecordRow } from "@/lib/registry/models";
import {
  ACCESS_TYPES,
  CAPABILITIES,
  CAPABILITY_SUPPORT_STATES,
  DISCOVERY_STRATEGIES,
  ENDPOINT_TYPES,
  EVIDENCE_TYPES,
  FRAMEWORK_FAMILIES,
  HEALTH_STATES,
  LINK_STATUSES,
  LOCAL_ONLY_STATES,
  OBSERVATION_TYPES,
  PAGINATION_TYPES,
  type ClaimKind,
  type HealthState,
  type LinkStatus,
  type LocalOnlyState,
} from "@/lib/registry/types";
import {
  asConnector,
  asEvidence,
  asFunctionalFamily,
  asState,
  asTechFamily,
  discoverMessage,
  fingerprintMessage,
  sourceClaim,
} from "@/lib/registry/view";
import {
  PNCP_EDITAL_EXAMPLE,
  PNCP_OFFICIAL_NAME,
  isPncpEditalUrl,
} from "@/lib/registry/pncp-url";

export const Route = createFileRoute("/fontes/$id")({
  component: SourceDossierPage,
});

const TABS = [
  { id: "visao", label: "Visão" },
  { id: "canais", label: "Canais" },
  { id: "capacidades", label: "Capacidades" },
  { id: "endpoints", label: "Endpoints" },
  { id: "evidencias", label: "Evidências" },
  { id: "observacoes", label: "Observações" },
  { id: "fingerprints", label: "Fingerprints" },
  { id: "historico", label: "Histórico" },
  { id: "connector", label: "Connector" },
  { id: "saude", label: "Saúde" },
  { id: "registros", label: "Registros" },
] as const;

function SourceDossierPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const sourceQuery = useQuery({
    queryKey: ["source", id],
    queryFn: () => getSourceFn({ data: { id } }),
  });
  const recordsQuery = useQuery({
    queryKey: ["source-records", id],
    queryFn: () => listSourceRecordsFn({ data: { id } }),
  });

  const fingerprint = useMutation({
    mutationFn: () => fingerprintSourceFn({ data: { id } }),
    onSuccess: (res) => {
      toast.success(fingerprintMessage(res));
      queryClient.invalidateQueries({ queryKey: ["source", id] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Falha no fingerprint"),
  });
  const verify = useMutation({
    mutationFn: () => verifySourceFn({ data: { id } }),
    onSuccess: (res) => {
      toast.success(fingerprintMessage(res));
      queryClient.invalidateQueries({ queryKey: ["source", id] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Falha na verificação"),
  });
  const discover = useMutation({
    mutationFn: () => discoverSourceFn({ data: { id } }),
    onSuccess: (res) => {
      toast.success(discoverMessage(res));
      queryClient.invalidateQueries({ queryKey: ["source", id] });
      queryClient.invalidateQueries({ queryKey: ["source-records", id] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Falha na descoberta"),
  });

  if (sourceQuery.isLoading) {
    return (
      <PageShell>
        <PageSkeleton rows={6} />
      </PageShell>
    );
  }
  if (sourceQuery.isError) {
    return (
      <PageShell>
        <QueryErrorState
          message={
            sourceQuery.error instanceof Error
              ? sourceQuery.error.message
              : "Erro desconhecido."
          }
          onRetry={() => sourceQuery.refetch()}
        />
      </PageShell>
    );
  }

  const source = sourceQuery.data;
  if (!source) {
    return (
      <PageShell>
        <EmptyState
          title="Fonte não encontrada"
          hint="O identificador não corresponde a um source_system cadastrado."
        />
        <Link
          to="/fontes"
          className="mt-4 inline-flex min-h-11 items-center text-sm text-muted hover:text-fg"
        >
          Voltar às fontes
        </Link>
      </PageShell>
    );
  }

  const family = asTechFamily(source.technology_family);
  const showPaNote =
    source.jurisdiction_uf === "PA" ||
    family === "GENERIC_JSF" ||
    family === "PARADIGMA_WBC";
  const busy = fingerprint.isPending || verify.isPending || discover.isPending;
  const evidence = asEvidence(source.vendor_evidence_level);

  return (
    <PageShell>
      <PageHeader
        title={source.name}
        description={source.base_url ?? undefined}
        actions={
          <>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => fingerprint.mutate()}
            >
              Fingerprint
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => verify.mutate()}
            >
              Verificar
            </Button>
            <Button disabled={busy} onClick={() => discover.mutate()}>
              Descobrir
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{source.jurisdiction_name ?? "—"}</Badge>
        {source.jurisdiction_uf ? (
          <Badge variant="muted">{source.jurisdiction_uf}</Badge>
        ) : null}
        <Badge variant="outline">
          {FUNCTIONAL_LABELS[asFunctionalFamily(source.functional_family)]}
        </Badge>
        <Badge variant="outline">{TECHNOLOGY_LABELS[family]}</Badge>
        <Badge variant="muted">{EVIDENCE_LABELS[evidence]}</Badge>
        <Badge variant="muted">
          {CONNECTOR_LABELS[asConnector(source.connector_type)]}
        </Badge>
        <Badge variant="default">
          {STATE_LABELS[asState(source.classification_state)]}
        </Badge>
        <ClaimBadge kind={sourceClaim(source)} evidence={evidence} />
      </div>
      <p className="mb-6 text-xs text-subtle">
        Fingerprint é passivo (GET público). Verificar confirma evidência.
        Descobrir dispara ingestão.
      </p>

      {showPaNote ? (
        <div className="mb-6">
          <PaFrameworkNote />
        </div>
      ) : null}

      <Tabs defaultValue="visao">
        <div className="overflow-x-auto">
          <TabsList className="h-auto w-max min-w-full justify-start">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="min-h-11">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="visao">
          <VisaoTab source={source} />
        </TabsContent>
        <TabsContent value="canais">
          {(source.channels ?? []).length > 0 ? (
            <DiscoveryChannelStack channels={source.channels} />
          ) : (
            <EmptyState
              title="Nenhum canal registrado"
              hint="Canais descrevem superfícies públicas distintas do mesmo portal — lista, detalhe e paginação por canal, sem adapter de marca."
            />
          )}
        </TabsContent>
        <TabsContent value="capacidades">
          <RecordList
            rows={source.capabilities}
            emptyTitle="Nenhuma capacidade observada"
            emptyHint="Capacidades entram após fingerprint ou verificação."
            render={(row, key) => {
              const cap = asEnum(row.capability, CAPABILITIES, CAPABILITIES[0]);
              const support = asEnum(
                row.support_status,
                CAPABILITY_SUPPORT_STATES,
                "UNKNOWN",
              );
              return (
                <li key={key} className="rounded-lg border border-border bg-surface px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{CAPABILITY_LABELS[cap]}</p>
                    <Badge variant={support === "SUPPORTED" ? "ok" : "muted"}>
                      {CAPABILITY_SUPPORT_LABELS[support]}
                    </Badge>
                    <Badge variant="muted">
                      {ACCESS_LABELS[asEnum(row.access_type, ACCESS_TYPES, "UNKNOWN")]}
                    </Badge>
                    <ClaimBadge
                      kind={sourceClaim({
                        vendor_evidence_level: readString(
                          row.evidence_level,
                          source.vendor_evidence_level ?? "",
                        ),
                      })}
                    />
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {[readStringOrNull(row.method), readStringOrNull(row.endpoint_or_url)]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                  {row.raw_metadata != null ? (
                    <div className="mt-2">
                      <MonoPanel value={row.raw_metadata} />
                    </div>
                  ) : null}
                </li>
              );
            }}
          />
        </TabsContent>
        <TabsContent value="endpoints">
          <RecordList
            rows={source.endpoints}
            emptyTitle="Nenhum endpoint"
            emptyHint="Rotas públicas observadas aparecem aqui."
            render={(row, key) => (
              <li key={key} className="rounded-lg border border-border bg-surface px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{readString(row.name, "endpoint")}</p>
                  <Badge variant="muted">{readString(row.http_method, "GET")}</Badge>
                  <Badge variant="outline">
                    {ENDPOINT_TYPE_LABELS[asEnum(row.endpoint_type, ENDPOINT_TYPES, "OTHER")]}
                  </Badge>
                  {row.pagination_type ? (
                    <Badge variant="muted">
                      {PAGINATION_LABELS[asEnum(row.pagination_type, PAGINATION_TYPES, "UNKNOWN")]}
                    </Badge>
                  ) : null}
                  <ClaimBadge kind={readBool(row.public) ? "FATO_VERIFICADO" : "INFERENCIA"} />
                </div>
                <p className="mt-1 font-mono text-xs text-muted">{readString(row.path)}</p>
              </li>
            )}
          />
        </TabsContent>
        <TabsContent value="evidencias">
          <RecordList
            rows={source.evidence}
            emptyTitle="Sem evidências"
            emptyHint="Documento oficial, contrato e assinatura técnica entram neste dossiê."
            render={(row, key) => {
              const level = asEvidence(row.evidence_level);
              return (
                <li key={key} className="rounded-lg border border-border bg-surface px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{readString(row.title, "Evidência")}</p>
                    <Badge variant="muted">
                      {EVIDENCE_TYPE_LABELS[asEnum(row.evidence_type, EVIDENCE_TYPES, "OTHER")]}
                    </Badge>
                    <Badge variant="outline">{EVIDENCE_LABELS[level]}</Badge>
                    <ClaimBadge evidence={level} />
                  </div>
                  {readStringOrNull(row.description) ? (
                    <p className="mt-1 text-sm text-muted">{readString(row.description)}</p>
                  ) : null}
                  {readStringOrNull(row.publisher) ||
                  readStringOrNull(row.vendor_name) ||
                  readStringOrNull(row.product_name) ? (
                    <p className="mt-1 text-xs text-subtle">
                      {[
                        readStringOrNull(row.publisher),
                        readStringOrNull(row.vendor_name),
                        readStringOrNull(row.product_name),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                  {readStringOrNull(row.raw_excerpt) ? (
                    <p className="mt-2 border-l-2 border-border pl-3 font-mono text-xs text-muted">
                      {readString(row.raw_excerpt)}
                    </p>
                  ) : null}
                  {readStringOrNull(row.url) ? (
                    <a
                      href={readString(row.url)}
                      className="mt-1 inline-block text-xs text-muted underline-offset-4 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {readString(row.url)}
                    </a>
                  ) : null}
                  {row.raw_payload != null ? (
                    <div className="mt-2">
                      <MonoPanel value={row.raw_payload} />
                    </div>
                  ) : null}
                </li>
              );
            }}
          />
        </TabsContent>
        <TabsContent value="observacoes">
          <RecordList
            rows={source.observations}
            emptyTitle="Sem observações"
            emptyHint="Headers, cookies, rotas e sufixos de página ficam separados da classificação."
            render={(row, key) => (
              <li key={key} className="rounded-lg border border-border bg-surface px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="muted">
                    {OBSERVATION_LABELS[asEnum(row.observation_type, OBSERVATION_TYPES, "OTHER")]}
                  </Badge>
                  <ClaimBadge kind="FATO_VERIFICADO" />
                </div>
                <p className="mt-2 font-mono text-sm">
                  {readString(row.key)} = {readString(row.value)}
                </p>
                {row.raw_payload != null ? (
                  <div className="mt-2">
                    <MonoPanel value={row.raw_payload} />
                  </div>
                ) : null}
              </li>
            )}
          />
        </TabsContent>
        <TabsContent value="fingerprints">
          <FingerprintsTab source={source} />
        </TabsContent>
        <TabsContent value="historico">
          <RecordList
            rows={source.history}
            emptyTitle="Sem histórico de plataforma"
            emptyHint="Troca de fornecedor preserva o período anterior. Não se infere o atual pelo passado."
            render={(row, key) => (
              <li key={key} className="rounded-lg border border-border bg-surface px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">
                    {TECHNOLOGY_LABELS[asTechFamily(row.technology_family)]}
                  </p>
                  <ClaimBadge evidence={asEvidence(row.evidence_level)} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {formatDate(readStringOrNull(row.valid_from))} —{" "}
                  {row.valid_to ? formatDate(readString(row.valid_to)) : "vigente"}
                </p>
              </li>
            )}
          />
        </TabsContent>
        <TabsContent value="connector">
          <ConnectorTab source={source} />
        </TabsContent>
        <TabsContent value="saude">
          <SaudeTab source={source} />
        </TabsContent>
        <TabsContent value="registros">
          <RegistrosTab
            rows={recordsQuery.data ?? []}
            loading={recordsQuery.isLoading}
          />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

function Field({
  label,
  children,
  claim,
}: {
  label: string;
  children: ReactNode;
  claim?: ClaimKind;
}) {
  return (
    <div className="flex flex-col gap-1 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
        {claim ? <ClaimBadge kind={claim} /> : null}
      </div>
      <div className="text-sm text-fg">{children}</div>
    </div>
  );
}

function VisaoTab({ source }: { source: SourceDetail }) {
  return (
    <Card className="p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Jurisdição">
          {source.jurisdiction_name ?? "—"}
        </Field>
        <Field label="Família funcional">
          {FUNCTIONAL_LABELS[asFunctionalFamily(source.functional_family)]}
        </Field>
        <Field
          label="Família tecnológica"
          claim={
            FRAMEWORK_FAMILIES.has(asTechFamily(source.technology_family))
              ? "INFERENCIA"
              : sourceClaim(source)
          }
        >
          {TECHNOLOGY_LABELS[asTechFamily(source.technology_family)]}
          {source.vendor_name ? ` · ${source.vendor_name}` : ""}
          {source.product_name ? ` / ${source.product_name}` : ""}
        </Field>
        <Field label="Estratégia de descoberta">
          {
            DISCOVERY_STRATEGY_LABELS[
              asEnum(source.discovery_strategy, DISCOVERY_STRATEGIES, "UNKNOWN")
            ]
          }
        </Field>
        <Field label="Sobreposição PNCP (declaração)">
          {source.pncp_overlap ? "Sim — declaração da fonte, não overlap de records" : "Não observada"}
        </Field>
        <Field label="Sobreposição Compras.gov (declaração)">
          {source.comprasgov_overlap ? "Sim — declaração da fonte" : "Não observada"}
        </Field>
        <Field label="URL base">{source.base_url ?? "—"}</Field>
        {source.id === "src_br_pncp" ? (
          <Field label="URL pública de edital" claim="FATO_VERIFICADO">
            <a
              href={PNCP_EDITAL_EXAMPLE}
              className="font-mono text-xs underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              https://pncp.gov.br/app/editais/{"{cnpj}/{ano}/{sequencialCompra}"}
            </a>
            <span className="mt-1 block font-mono text-xs text-muted">
              Ex.: {PNCP_EDITAL_EXAMPLE}
            </span>
            <span className="mt-1 block text-xs text-subtle">
              {PNCP_OFFICIAL_NAME} — não usar /pncp-api/ como link público.
            </span>
          </Field>
        ) : null}
        <Field label="Última verificação">{formatDate(source.last_verified_at)}</Field>
      </div>
      {source.notes ? (
        <>
          <Separator className="my-3" />
          <Field label="Notas">{source.notes}</Field>
        </>
      ) : null}
    </Card>
  );
}

function FingerprintsTab({ source }: { source: SourceDetail }) {
  const run = source.last_run;
  if (!run) {
    return (
      <EmptyState
        title="Nenhuma execução"
        hint="Fingerprint passivo coleta HTML, headers, cookies e rotas públicas."
      />
    );
  }
  const matches = source.last_run_matches.filter((match) => readBool(match.matched));
  const raw = asJsonObject(run.raw_result);
  const fetchErrors = Array.isArray(raw.fetch_errors)
    ? raw.fetch_errors.filter((item): item is string => typeof item === "string")
    : [];
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">
          {TECHNOLOGY_LABELS[asTechFamily(run.candidate_family ?? run.technology_family)]}
        </p>
        <Badge variant="muted">
          {run.status === "FAILED"
            ? "Falhou"
            : run.status === "COMPLETED"
              ? "Concluído"
              : run.status === "RUNNING"
                ? "Em execução"
                : readString(run.status, "—")}
        </Badge>
        <ClaimBadge evidence={asEvidence(run.evidence_level)} />
      </div>
      <p className="mt-1 text-xs text-muted">
        {formatDate(readStringOrNull(run.started_at))} · score {readNumber(run.score, 0)}
      </p>
      {readStringOrNull(run.error) && fetchErrors.length === 0 ? (
        <p className="mt-2 text-sm text-danger">{readString(run.error)}</p>
      ) : null}
      {fetchErrors.length > 0 ? (
        <p className="mt-3 text-sm text-muted">
          {fetchErrors.length === 1
            ? "1 coleta pública falhou."
            : `${fetchErrors.length} coletas públicas falharam.`}{" "}
          Classificação segue nas observações já guardadas.
        </p>
      ) : null}
      {matches.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1">
          {matches.map((match, i) => (
            <li key={i} className="font-mono text-xs text-muted">
              match · {readString(match.signature_key ?? match.key)}
              {readStringOrNull(match.observed_value)
                ? ` · ${readString(match.observed_value)}`
                : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">
          Nenhuma assinatura bateu. Família comercial permanece pendente.
        </p>
      )}
    </div>
  );
}

function ConnectorTab({ source }: { source: SourceDetail }) {
  const config = source.connector_config;
  const readiness = config ? readStringOrNull(config.connector_readiness) : null;
  const semantics = config ? readStringOrNull(config.public_key_semantics) : null;
  const classification = config ? readStringOrNull(config.value_classification) : null;
  const fingerprint = config ? readStringOrNull(config.public_key_fingerprint) : null;
  return (
    <Card className="p-4">
      <Field label="Adapter">
        {CONNECTOR_LABELS[asConnector(source.connector_type)]}
        {source.connector_version ? ` · ${source.connector_version}` : ""}
      </Field>
      {readiness ? (
        <Field label="Prontidão">
          <Badge variant={readiness === "LIVE" ? "ok" : readiness === "DEGRADED" || readiness === "AUTH_REQUIRED" ? "warn" : "muted"}>
            {CONNECTOR_READINESS_LABELS[readiness] ?? readiness}
          </Badge>
        </Field>
      ) : null}
      {classification ? (
        <Field label="Classificação do valor">
          {VALUE_CLASSIFICATION_LABELS[classification] ?? classification}
        </Field>
      ) : null}
      {semantics ? (
        <Field label="Semântica da publicKey" claim="FATO_VERIFICADO">
          {PUBLIC_KEY_SEMANTICS_LABELS[semantics] ?? semantics}
          {fingerprint ? ` · fingerprint ${fingerprint}` : ""}
        </Field>
      ) : (
        <Field label="Semântica da publicKey" claim="FATO_VERIFICADO">
          Nenhuma chave persistida. Config pública usa identificador de órgão, não credencial.
        </Field>
      )}
      <p className="mt-2 text-sm text-muted">
        Um adapter atende N fontes. A configuração vive no source_system, não no
        código. HTTP 400 de autenticação é erro de configuração, não de parser.
      </p>
      {config ? (
        <div className="mt-3">
          <MonoPanel value={config} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">Sem config persistida.</p>
      )}
    </Card>
  );
}

function healthVariant(state: HealthState): "ok" | "warn" | "danger" | "muted" {
  if (state === "HEALTHY") return "ok";
  if (state === "DEGRADED" || state === "SCHEMA_CHANGED" || state === "PARSER_DEGRADED") return "warn";
  if (state === "FAILING") return "danger";
  return "muted";
}

function SaudeTab({ source }: { source: SourceDetail }) {
  const rows = source.health;
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sem checagem de saúde"
        hint="Health por endpoint aparece depois da primeira verificação."
      />
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row, i) => {
        const state = asEnum(row.state ?? row.status, HEALTH_STATES, "UNKNOWN");
        return (
          <li key={i} className="rounded-lg border border-border bg-surface px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={healthVariant(state)}>{HEALTH_LABELS[state]}</Badge>
              <ClaimBadge
                kind={state === "HEALTHY" ? "FATO_VERIFICADO" : "INFERENCIA"}
              />
            </div>
            <p className="mt-2 text-sm text-muted">
              {readString(row.detail ?? row.message, "Sem detalhe.")}
            </p>
            {readStringOrNull(row.schema_hash) ? (
              <p className="mt-2 font-mono text-xs text-muted">
                {readString(row.schema_hash)}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function RecordList({
  rows,
  emptyTitle,
  emptyHint,
  render,
}: {
  rows: JsonObject[];
  emptyTitle: string;
  emptyHint: string;
  render: (row: JsonObject, key: string) => ReactNode;
}) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} hint={emptyHint} />;
  }
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row, i) => render(row, readString(row.id, String(i))))}
    </ul>
  );
}

function asLinkStatus(value: string | null | undefined): LinkStatus | null {
  if (!value) return null;
  return (LINK_STATUSES as readonly string[]).includes(value) ? (value as LinkStatus) : null;
}

function asLocalState(value: string | null | undefined): LocalOnlyState | null {
  if (!value) return null;
  return (LOCAL_ONLY_STATES as readonly string[]).includes(value)
    ? (value as LocalOnlyState)
    : null;
}

function RegistrosTab({
  rows,
  loading,
}: {
  rows: SourceRecordRow[];
  loading: boolean;
}) {
  if (loading) return <PageSkeleton rows={4} />;
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Nenhum registro ingerido"
        hint="Descobrir persiste source_record com raw_payload, hash e fetched_at. Overlap nasce depois da resolução."
      />
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => {
        const status = asLinkStatus(row.match_status);
        const local = asLocalState(row.local_only_state);
        return (
          <li key={row.id} className="rounded-lg border border-border bg-surface px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs text-muted">{row.source_identifier}</p>
              {row.source_channel ? (
                <Badge variant="outline">{row.source_channel}</Badge>
              ) : null}
              {row.ingestion_mode ? (
                <Badge variant={row.ingestion_mode === "LIVE_PUBLIC_API" ? "ok" : "muted"}>
                  {INGESTION_MODE_LABELS[row.ingestion_mode] ?? row.ingestion_mode}
                </Badge>
              ) : null}
              {status ? (
                <Badge variant={status === "CONFIRMED" ? "ok" : "muted"}>
                  {LINK_STATUS_LABELS[status]}
                </Badge>
              ) : null}
              {local && local !== "MATCHED" ? (
                <Badge variant="warn">{LOCAL_ONLY_LABELS[local]}</Badge>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-fg">{row.excerpt ?? "sem objeto extraído"}</p>
            <p className="mt-2 text-xs text-muted">
              visto {formatDate(row.first_seen_at)} · fetch {formatDate(row.fetched_at)}
              {row.match_method ? ` · ${row.match_method}` : ""}
              {row.lead_time_hours != null ? ` · lead ${formatHours(row.lead_time_hours)}` : ""}
              {row.fetch_method ? ` · ${row.fetch_method}` : ""}
            </p>
            {row.payload_hash ? (
              <p className="mt-1 font-mono text-xs text-subtle">
                payload {row.payload_hash.slice(0, 12)}
                {row.schema_hash ? ` · schema ${row.schema_hash.slice(0, 12)}` : ""}
              </p>
            ) : null}
            {row.matched_fields.length > 0 ? (
              <p className="mt-1 font-mono text-xs text-subtle">
                campos: {row.matched_fields.join(", ")}
              </p>
            ) : null}
            {row.source_url ? (
              /^https?:\/\//i.test(row.source_url) ? (
                <a
                  href={row.source_url}
                  className="mt-1 block truncate text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {row.source_system_id === "src_br_pncp" &&
                  isPncpEditalUrl(row.source_url)
                    ? "Ver no PNCP ↗"
                    : row.source_url}
                </a>
              ) : (
                <p className="mt-1 truncate font-mono text-xs text-muted">{row.source_url}</p>
              )
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
