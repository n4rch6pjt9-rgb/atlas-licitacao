import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, PageShell } from "@/components/page-header";
import { SourceRow } from "@/components/source-row";
import { EmptyState, PageSkeleton, QueryErrorState } from "@/components/status-states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, NativeSelect } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listJurisdictionsFn,
  listSourcesFn,
  registerSourceFn,
} from "@/lib/registry/api";
import { asEnum, readString } from "@/lib/registry/json";
import {
  EVIDENCE_LABELS,
  JURISDICTION_LABELS,
  STATE_LABELS,
  TECHNOLOGY_LABELS,
} from "@/lib/registry/labels";
import { BRAZIL_UFS } from "@/lib/registry/models";
import {
  CLASSIFICATION_STATES,
  EVIDENCE_LEVELS,
  JURISDICTION_TYPES,
  TECHNOLOGY_FAMILIES,
  type JurisdictionType,
} from "@/lib/registry/types";
import { matchesFilters } from "@/lib/registry/view";

export const Route = createFileRoute("/fontes/")({ component: FontesPage });

function FontesPage() {
  const [q, setQ] = useState("");
  const [uf, setUf] = useState("");
  const [family, setFamily] = useState("");
  const [evidence, setEvidence] = useState("");
  const [state, setState] = useState("");

  const sourcesQuery = useQuery({
    queryKey: ["sources"],
    queryFn: () => listSourcesFn(),
  });

  const sources = useMemo(() => {
    return (sourcesQuery.data ?? []).filter((source) =>
      matchesFilters(source, { q, uf, family, evidence, state }),
    );
  }, [sourcesQuery.data, q, uf, family, evidence, state]);

  return (
    <PageShell>
      <PageHeader
        title="Fontes"
        description="Sistemas-fonte observados. Clique para abrir o dossiê."
        actions={<RegisterSourceDialog />}
      />

      <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar nome ou URL"
          aria-label="Buscar fontes"
        />
        <NativeSelect
          value={uf}
          onChange={(e) => setUf(e.target.value)}
          aria-label="UF"
        >
          <option value="">Todas as UFs</option>
          {BRAZIL_UFS.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          aria-label="Família tecnológica"
        >
          <option value="">Todas as famílias</option>
          {TECHNOLOGY_FAMILIES.map((code) => (
            <option key={code} value={code}>
              {TECHNOLOGY_LABELS[code]}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          aria-label="Nível de evidência"
        >
          <option value="">Toda evidência</option>
          {EVIDENCE_LEVELS.map((code) => (
            <option key={code} value={code}>
              {EVIDENCE_LABELS[code]}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={state}
          onChange={(e) => setState(e.target.value)}
          aria-label="Estado"
        >
          <option value="">Todos os estados</option>
          {CLASSIFICATION_STATES.map((code) => (
            <option key={code} value={code}>
              {STATE_LABELS[code]}
            </option>
          ))}
        </NativeSelect>
      </div>

      {sourcesQuery.isLoading ? (
        <PageSkeleton rows={6} />
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
          title="Nenhuma fonte neste recorte"
          hint="Registre um portal ou afrouxe os filtros."
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
    </PageShell>
  );
}

function RegisterSourceDialog() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [jurisdictionId, setJurisdictionId] = useState("");

  const jurisdictionsQuery = useQuery({
    queryKey: ["jurisdictions"],
    queryFn: () => listJurisdictionsFn(),
    enabled: open,
  });

  const register = useMutation({
    mutationFn: () =>
      registerSourceFn({
        data: { name: name.trim(), baseUrl: baseUrl.trim(), jurisdictionId },
      }),
    onSuccess: (source) => {
      toast.success("Fonte registrada.");
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      setOpen(false);
      setName("");
      setBaseUrl("");
      setJurisdictionId("");
      void navigate({ to: "/fontes/$id", params: { id: source.id } });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Falha ao registrar"),
  });

  const jurisdictions = jurisdictionsQuery.data ?? [];
  const canSubmit =
    name.trim().length > 1 &&
    baseUrl.trim().length > 3 &&
    jurisdictionId.length > 0 &&
    !register.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Registrar fonte</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar fonte</DialogTitle>
          <DialogDescription>
            Cadastro mínimo. A família tecnológica só entra com evidência.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) register.mutate();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source-name">Nome</Label>
            <Input
              id="source-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Portal de compras de…"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source-url">URL base</Label>
            <Input
              id="source-url"
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source-jurisdiction">Jurisdição</Label>
            <NativeSelect
              id="source-jurisdiction"
              value={jurisdictionId}
              onChange={(e) => setJurisdictionId(e.target.value)}
              required
            >
              <option value="">Selecionar</option>
              {jurisdictions.map((item) => {
                const id = readString(item.id);
                const type = asEnum(item.type, JURISDICTION_TYPES, "OTHER") as JurisdictionType;
                const uf = readString(item.uf);
                const label = readString(item.name, id);
                return (
                  <option key={id} value={id}>
                    {uf ? `${uf} · ` : ""}
                    {label} ({JURISDICTION_LABELS[type]})
                  </option>
                );
              })}
            </NativeSelect>
            {open && !jurisdictionsQuery.isLoading && jurisdictions.length === 0 ? (
              <p className="text-xs text-muted">
                Nenhuma jurisdição cadastrada ainda.
              </p>
            ) : null}
          </div>
          <Button type="submit" disabled={!canSubmit}>
            {register.isPending ? "Registrando…" : "Registrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
