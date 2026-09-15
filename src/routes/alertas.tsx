import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, PageShell } from "@/components/page-header";
import { EmptyState, PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/input";
import {
  getDigestFn,
  listAlertEventsFn,
  listAlertRulesFn,
  listWatchlistFn,
  setAlertRuleActiveFn,
  upsertAlertRuleFn,
  upsertWatchlistFn,
} from "@/lib/registry/api";
import { formatDate, formatInt } from "@/lib/registry/format";

export const Route = createFileRoute("/alertas")({ component: AlertasPage });

function AlertasPage() {
  const client = useQueryClient();
  const rules = useQuery({ queryKey: ["alert-rules"], queryFn: () => listAlertRulesFn() });
  const events = useQuery({ queryKey: ["alert-events"], queryFn: () => listAlertEventsFn() });
  const watch = useQuery({ queryKey: ["watchlist"], queryFn: () => listWatchlistFn() });
  const digest = useQuery({ queryKey: ["digest"], queryFn: () => getDigestFn() });
  const [name, setName] = useState("Novo termo");
  const [keyword, setKeyword] = useState("");
  const [uf, setUf] = useState("");
  const [early, setEarly] = useState(false);

  const createRule = useMutation({
    mutationFn: () =>
      upsertAlertRuleFn({
        data: {
          name,
          event_types: early ? ["EARLY_SOURCE_ALERT"] : ["NEW_PROCUREMENT", "EARLY_SOURCE_ALERT"],
          filters: {
            ...(keyword ? { keyword } : {}),
            ...(uf ? { uf } : {}),
            early_only: early,
          },
        },
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["alert-rules"] });
    },
  });
  const toggle = useMutation({
    mutationFn: (input: { id: string; active: boolean }) => setAlertRuleActiveFn({ data: input }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["alert-rules"] }),
  });
  const addWatch = useMutation({
    mutationFn: () => upsertWatchlistFn({ data: { kind: "term", value: keyword || name, label: name } }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  return (
    <PageShell>
      <PageHeader
        title="Alertas"
        description="Regras determinísticas. O mesmo evento não dispara duas vezes. A UI explica o porquê — nunca só 'nova oportunidade'."
      />

      {digest.data?.payload && typeof digest.data.payload === "object" ? (
        <Card className="mb-6 p-4">
          <p className="text-xs tracking-wide text-subtle uppercase">Resumo do dia {digest.data.digest_date}</p>
          <p className="mt-2 text-sm text-muted">
            Estrutura pronta para digest diário — sem envio de e-mail nesta etapa.
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div>
              <dt className="text-xs text-subtle">Oportunidades</dt>
              <dd className="font-display text-xl">
                {formatInt(Number((digest.data.payload as Record<string, unknown>).active_opportunities ?? 0))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Antecipadas</dt>
              <dd className="font-display text-xl">
                {formatInt(Number((digest.data.payload as Record<string, unknown>).early_opportunities ?? 0))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Planejamento</dt>
              <dd className="font-display text-xl">
                {formatInt(Number((digest.data.payload as Record<string, unknown>).planned_demand_items ?? 0))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Alertas</dt>
              <dd className="font-display text-xl">
                {formatInt(Number((digest.data.payload as Record<string, unknown>).alerts_triggered ?? 0))}
              </dd>
            </div>
          </dl>
        </Card>
      ) : null}
      <Card className="mb-8">
        <h2 className="font-display text-lg font-medium">Nova regra</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da regra" aria-label="Nome" />
          <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Palavra-chave" aria-label="Palavra-chave" />
          <NativeSelect value={uf} onChange={(e) => setUf(e.target.value)} aria-label="UF">
            <option value="">Qualquer UF</option>
            {["SC", "SP", "ES", "TO", "DF"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </NativeSelect>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={early} onChange={(e) => setEarly(e.target.checked)} />
            Só antecipadas
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => createRule.mutate()} disabled={!name.trim()}>
            Criar regra
          </Button>
          <Button variant="secondary" onClick={() => addWatch.mutate()} disabled={!keyword && !name}>
            Seguir termo
          </Button>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-xl font-medium">Regras</h2>
          {rules.isLoading ? (
            <PageSkeleton rows={4} />
          ) : (rules.data ?? []).length === 0 ? (
            <EmptyState title="Nenhuma regra" />
          ) : (
            <ul className="flex flex-col gap-3">
              {(rules.data ?? []).map((rule) => (
                <li key={rule.id}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="mt-1 text-xs text-muted">{rule.event_types.join(", ")}</p>
                      </div>
                      <Badge variant={rule.active ? "ok" : "muted"}>{rule.active ? "ativa" : "off"}</Badge>
                    </div>
                    <Button
                      className="mt-3"
                      size="sm"
                      variant="secondary"
                      onClick={() => toggle.mutate({ id: rule.id, active: !rule.active })}
                    >
                      {rule.active ? "Desativar" : "Ativar"}
                    </Button>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="mb-3 font-display text-xl font-medium">Eventos</h2>
          {events.isLoading ? (
            <PageSkeleton rows={4} />
          ) : events.isError ? (
            <QueryErrorState message="Falha ao carregar eventos." onRetry={() => events.refetch()} />
          ) : (events.data ?? []).length === 0 ? (
            <EmptyState title="Nenhum alerta disparado" />
          ) : (
            <ul className="flex flex-col gap-3">
              {(events.data ?? []).slice(0, 40).map((event) => (
                <li key={event.id}>
                  <Card className="p-4">
                    <p className="text-xs text-muted">{formatDate(event.triggered_at)} · {event.rule_name}</p>
                    <p className="mt-2 text-sm text-fg">{event.reason_text}</p>
                    {event.entity_type === "opportunity" ? (
                      <Link
                        to="/oportunidades/$id"
                        params={{ id: event.entity_id }}
                        className="mt-2 inline-block text-xs text-muted hover:text-fg"
                      >
                        Abrir oportunidade →
                      </Link>
                    ) : null}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">Watchlist</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(watch.data ?? []).map((item) => (
            <Badge key={item.id} variant="outline">
              {item.kind}: {item.label ?? item.value}
            </Badge>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
