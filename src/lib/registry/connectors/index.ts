import type { ConnectorConfig, DiscoveryParams, SourceProcurement } from "../types.ts";
import type { PublicProcurementSource } from "./contract.ts";
import { createGenericActionAdapter } from "./generic-action.ts";
import { createGenericJsfAdapter } from "./generic-jsf.ts";
import { createGenericJsonAdapter } from "./generic-json.ts";

export type { PublicProcurementSource } from "./contract.ts";
export {
  applyNormalization,
  htmlRecordToProcurement,
  joinUrl,
  mapValue,
  parseHtmlListRecords,
} from "./contract.ts";
export { createGenericActionAdapter } from "./generic-action.ts";
export { createGenericJsfAdapter } from "./generic-jsf.ts";
export { createGenericJsonAdapter, extractJsonRecords } from "./generic-json.ts";

class EmptySource implements PublicProcurementSource {
  readonly connectorType: PublicProcurementSource["connectorType"];
  readonly config: ConnectorConfig;

  constructor(config: ConnectorConfig) {
    this.connectorType = config.connectorType;
    this.config = config;
  }

  async *discover(
    _params: DiscoveryParams,
  ): AsyncIterable<SourceProcurement> {
    // EXTERNAL_LINK_HUB / PLANNING_ONLY / NONE yield no procurements.
    // Empty discover/getPlanning is not a SUPPORTED capability.
  }

  async getPlanning(_params: DiscoveryParams) {
    return [];
  }
}

export function createAdapter(
  config: ConnectorConfig,
  sourceSystemId: string,
): PublicProcurementSource {
  switch (config.connectorType) {
    case "GENERIC_JSON":
      return createGenericJsonAdapter(config, sourceSystemId);
    case "GENERIC_ACTION":
      return createGenericActionAdapter(config, sourceSystemId);
    case "GENERIC_JSF":
      return createGenericJsfAdapter(config, sourceSystemId);
    case "EXTERNAL_LINK_HUB":
    case "PLANNING_ONLY":
    case "NONE":
      return new EmptySource(config);
    default: {
      const unexpected: never = config.connectorType;
      throw new Error(`Unsupported connectorType: ${String(unexpected)}`);
    }
  }
}
