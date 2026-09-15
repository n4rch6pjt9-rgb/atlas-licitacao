import { publicGet } from "../http.server.ts";
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

const JSF_LINK = /\.(xhtml|jsf|faces)/i;

/**
 * Public JSF list adapter. GET the xhtml list page only.
 * Do not forge ViewState postbacks or bypass authentication.
 */
class GenericJsfAdapter implements PublicProcurementSource {
  readonly connectorType = "GENERIC_JSF" as const;
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
      throw new Error("generic-jsf: config.paths.discover is required");
    }
    const url = joinUrl(this.config.baseUrl, path);
    let response;
    try {
      response = await publicGet(url, this.config.headers);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`generic-jsf discover failed for ${url}: ${message}`);
    }
    if (!response.ok) {
      throw new Error(
        `generic-jsf: GET ${url} failed with HTTP ${response.status}`,
      );
    }
    const rows = parseHtmlListRecords(
      response.text,
      this.config.baseUrl,
      JSF_LINK,
    );
    const limit = params.limit ?? 20;
    for (const row of rows.slice(0, limit)) {
      yield htmlRecordToProcurement(row, this.sourceSystemId);
    }
  }

  /**
   * Planning is not implemented. Empty result ≠ PLANNING supported.
   * Do not forge JSF ViewState postbacks.
   */
  async getPlanning(
    _params: DiscoveryParams,
  ): Promise<SourcePlanningRecord[]> {
    return [];
  }
}

export function createGenericJsfAdapter(
  config: ConnectorConfig,
  sourceSystemId: string,
): PublicProcurementSource {
  return new GenericJsfAdapter(config, sourceSystemId);
}
