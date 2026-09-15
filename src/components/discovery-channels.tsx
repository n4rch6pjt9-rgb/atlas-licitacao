import { ClaimBadge } from "@/components/claim-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CHANNEL_READINESS_LABELS,
  CONNECTOR_LABELS,
  DISCOVERY_CHANNEL_LABELS,
} from "@/lib/registry/labels";
import type { DiscoveryChannelRow } from "@/lib/registry/models";
import {
  CLAIM_KINDS,
  CONNECTOR_TYPES,
  DISCOVERY_CHANNEL_TYPES,
  type ClaimKind,
  type ConnectorType,
  type DiscoveryChannelType,
} from "@/lib/registry/types";
import { asEnum } from "@/lib/registry/json";

function asChannel(value: string | null | undefined): DiscoveryChannelType {
  return asEnum(value, DISCOVERY_CHANNEL_TYPES, "OTHER");
}

function asClaim(value: string | null | undefined): ClaimKind {
  return asEnum(value, CLAIM_KINDS, "PENDENTE_DE_VALIDACAO");
}

export function DiscoveryChannelStack({
  channels,
  title = "Canais de descoberta",
  description,
}: {
  channels: DiscoveryChannelRow[];
  title?: string;
  description?: string;
}) {
  if (channels.length === 0) return null;
  return (
    <section className="mb-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description ??
              "Um portal não é uma URL. Cada canal público tem lista, detalhe, paginação e checkpoint próprios — o adapter continua genérico."}
          </CardDescription>
        </CardHeader>
        <ol className="flex flex-col gap-3">
          {channels.map((channel) => {
            const type = asChannel(channel.channel_type);
            const connector = asEnum(channel.connector_type, CONNECTOR_TYPES, "GENERIC_ACTION") as ConnectorType;
            const ready = channel.readiness === "READY";
            return (
              <li
                key={channel.id}
                className="rounded-lg border border-border bg-surface-2 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">
                    {channel.label || DISCOVERY_CHANNEL_LABELS[type]}
                  </p>
                  <Badge variant="outline">{DISCOVERY_CHANNEL_LABELS[type]}</Badge>
                  <Badge variant={ready ? "ok" : "muted"}>
                    {CHANNEL_READINESS_LABELS[channel.readiness] ?? channel.readiness}
                  </Badge>
                  {connector ? (
                    <Badge variant="muted">{CONNECTOR_LABELS[connector]}</Badge>
                  ) : null}
                  <ClaimBadge kind={asClaim(channel.claim_kind)} />
                </div>
                {channel.list_url ? (
                  <p className="mt-2 break-all font-mono text-xs text-muted">
                    {channel.list_url}
                  </p>
                ) : null}
                {channel.detail_url_pattern ? (
                  <p className="mt-1 break-all font-mono text-xs text-subtle">
                    detalhe {channel.detail_url_pattern}
                  </p>
                ) : null}
                {channel.notes ? (
                  <p className="mt-2 text-sm text-muted">{channel.notes}</p>
                ) : null}
                {channel.captcha_constraint ? (
                  <p className="mt-2 text-xs text-warn">{channel.captcha_constraint}</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </Card>
    </section>
  );
}
