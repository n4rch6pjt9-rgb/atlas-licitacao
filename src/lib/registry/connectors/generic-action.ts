import { publicGet } from "../http.server.ts";
import { inferDiscoveryChannel } from "../discovery-channel.ts";
import type {
  ConnectorConfig,
  DiscoveryParams,
  SourcePlanningRecord,
  SourceProcurement,
} from "../types.ts";
import {
  htmlRecordToProcurement,
  joinUrl,
  parseHtmlListRecords,
  type PublicProcurementSource,
} from "./contract.ts";

const ACTION_LINK = /\.action/i;

function linkPatternFromConfig(config: ConnectorConfig): RegExp {
  const raw = config.linkPattern ?? config.paths.linkPattern;
  if (!raw) return ACTION_LINK;
  try {
    return new RegExp(raw, "i");
  } catch {
    return ACTION_LINK;
  }
}

class GenericActionAdapter implements PublicProcurementSource {
  readonly connectorType = "GENERIC_ACTION" as const;
  readonly config: ConnectorConfig;
  private readonly sourceSystemId: string;

  constructor(config: ConnectorConfig, sourceSystemId: string) {
    this.config = config;
    this.sourceSystemId = sourceSystemId;
  }

  async *discover(
    params: DiscoveryParams,
  ): AsyncIterable<SourceProcurement> {
    const path = this.config.paths.discover;
    if (!path) {
      throw new Error("generic-action: config.paths.discover is required");
    }
    const url = joinUrl(this.config.baseUrl, path);
    let response;
    try {
      response = await publicGet(url, this.config.headers);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`generic-action discover failed for ${url}: ${message}`);
    }
    if (!response.ok) {
      throw new Error(
        `generic-action: GET ${url} failed with HTTP ${response.status}`,
      );
    }
    const rows = parseHtmlListRecords(
      response.text,
      this.config.baseUrl,
      linkPatternFromConfig(this.config),
    );
    const organization = this.config.defaultParams?.organization?.trim().toLowerCase();
    const filtered = organization
      ? rows.filter((row) => {
          const hay = `${row.htmlSnippet} ${row.object ?? ""} ${row.process_number ?? ""} ${row.organization_name ?? ""}`.toLowerCase();
          return hay.includes(organization);
        })
      : rows;
    const channel =
      this.config.channelType ??
      inferDiscoveryChannel(path) ??
      inferDiscoveryChannel(this.config.paths.linkPattern);
    const limit = params.limit ?? 20;
    for (const row of filtered.slice(0, limit)) {
      yield htmlRecordToProcurement(row, this.sourceSystemId, channel);
    }
  }

  /**
   * Planning is not implemented. Empty result ≠ PLANNING supported.
   */
  async getPlanning(
    _params: DiscoveryParams,
  ): Promise<SourcePlanningRecord[]> {
    return [];
  }
}

export function createGenericActionAdapter(
  config: ConnectorConfig,
  sourceSystemId: string,
): PublicProcurementSource {
  return new GenericActionAdapter(config, sourceSystemId);
}
