import { createServerFn } from "@tanstack/react-start";
import type { JsonObject } from "./json";

function requireId(data: unknown): { id: string } {
  const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const id = typeof rec.id === "string" ? rec.id.trim() : "";
  if (!id) throw new Error("id is required");
  return { id };
}

function requireFamily(data: unknown): { family: string } {
  const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const family = typeof rec.family === "string" ? rec.family.trim() : "";
  if (!family) throw new Error("family is required");
  return { family };
}

function parseDiscover(data: unknown): { id: string; year?: number } {
  const { id } = requireId(data);
  const rec = data as Record<string, unknown>;
  const yearRaw = rec.year;
  const year =
    typeof yearRaw === "number"
      ? yearRaw
      : typeof yearRaw === "string" && yearRaw.trim()
        ? Number(yearRaw)
        : undefined;
  if (year !== undefined && !Number.isFinite(year)) throw new Error("year must be a number");
  return year === undefined ? { id } : { id, year };
}

function parseRegister(data: unknown): {
  name: string;
  baseUrl: string;
  jurisdictionId: string;
  functionalFamily?: string;
} {
  const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const name = typeof rec.name === "string" ? rec.name.trim() : "";
  const baseUrl = typeof rec.baseUrl === "string" ? rec.baseUrl.trim() : "";
  const jurisdictionId =
    typeof rec.jurisdictionId === "string" ? rec.jurisdictionId.trim() : "";
  const functionalFamily =
    typeof rec.functionalFamily === "string" ? rec.functionalFamily.trim() : undefined;
  if (!name) throw new Error("name is required");
  if (!baseUrl) throw new Error("baseUrl is required");
  if (!jurisdictionId) throw new Error("jurisdictionId is required");
  return { name, baseUrl, jurisdictionId, functionalFamily };
}

async function withSql<T>(fn: (sql: import("@/lib/db").Sql) => Promise<T>): Promise<T> {
  const { getSql } = await import("@/lib/db");
  const { ensureSeeded } = await import("./seed.server");
  const sql = await getSql();
  await ensureSeeded(sql);
  return fn(sql);
}

export const listSourcesFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listSources } = await import("./queries.server");
    return listSources(sql);
  });
});

export const getSourceFn = createServerFn({ method: "GET" })
  .validator(requireId)
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { getSourceDetail } = await import("./queries.server");
      return getSourceDetail(sql, data.id);
    });
  });

export const listFamiliesFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listFamilies } = await import("./queries.server");
    return listFamilies(sql);
  });
});

export const getFamilySourcesFn = createServerFn({ method: "GET" })
  .validator(requireFamily)
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { listSources } = await import("./queries.server");
      return listSources(sql, { family: data.family });
    });
  });

export const getMetricsFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { metrics } = await import("./queries.server");
    return metrics(sql);
  });
});

export const getStatsFn = getMetricsFn;

export const getMatrixFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { capabilityMatrix } = await import("./queries.server");
    return capabilityMatrix(sql);
  });
});

export const fingerprintSourceFn = createServerFn({ method: "POST" })
  .validator(requireId)
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { runFingerprint } = await import("./fingerprint-run.server");
      return runFingerprint(sql, data.id);
    });
  });

export const discoverSourceFn = createServerFn({ method: "POST" })
  .validator(parseDiscover)
  .handler(async ({ data }): Promise<JsonObject> => {
    return withSql(async (sql) => {
      const { discoverSource } = await import("./discover.server");
      const raw = await discoverSource(sql, data.id, { year: data.year });
      return JSON.parse(JSON.stringify(raw ?? { records: [] })) as JsonObject;
    });
  });

export const registerSourceFn = createServerFn({ method: "POST" })
  .validator(parseRegister)
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { insertRegisteredSource } = await import("./queries.server");
      return insertRegisteredSource(sql, data);
    });
  });

export const verifySourceFn = createServerFn({ method: "POST" })
  .validator(requireId)
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { runFingerprint } = await import("./fingerprint-run.server");
      return runFingerprint(sql, data.id);
    });
  });

export const listJurisdictionsFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listJurisdictions } = await import("./queries.server");
    return listJurisdictions(sql);
  });
});

export const listAlertsFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listAlerts } = await import("./queries.server");
    return listAlerts(sql);
  });
});

export const listFamilyCandidatesFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listFamilyCandidates } = await import("./queries.server");
    return listFamilyCandidates(sql);
  });
});

export const listCensusFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listCensusRows } = await import("./queries.server");
    return listCensusRows(sql);
  });
});

export const getMilestone3Fn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { milestone3Metrics } = await import("./queries.server");
    return milestone3Metrics(sql);
  });
});

function parseSearch(data: unknown): {
  q?: string;
  uf?: string;
  modality?: string;
  status?: string;
} {
  const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const q = typeof rec.q === "string" ? rec.q.trim() : "";
  const uf = typeof rec.uf === "string" ? rec.uf.trim() : "";
  const modality = typeof rec.modality === "string" ? rec.modality.trim() : "";
  const status = typeof rec.status === "string" ? rec.status.trim() : "";
  return {
    ...(q ? { q } : {}),
    ...(uf ? { uf } : {}),
    ...(modality ? { modality } : {}),
    ...(status ? { status } : {}),
  };
}

export const getMilestone4Fn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { milestone4Metrics } = await import("./coverage.server");
    return milestone4Metrics(sql);
  });
});

export const getCoverageFn = getMilestone4Fn;

export const listSearchFn = createServerFn({ method: "GET" })
  .validator(parseSearch)
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { searchIntelligence } = await import("./intelligence.server");
      return searchIntelligence(sql, data);
    });
  });

export const listMunicipalityCensusFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listMunicipalityCensus } = await import("./coverage.server");
    return listMunicipalityCensus(sql);
  });
});

export const listLocalOnlyFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listLocalOnly } = await import("./coverage.server");
    return listLocalOnly(sql);
  });
});

export const listComparisonsFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listComparisons } = await import("./coverage.server");
    return listComparisons(sql);
  });
});

export const listSourceRecordsFn = createServerFn({ method: "GET" })
  .validator(requireId)
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { listSourceRecords } = await import("./coverage.server");
      return listSourceRecords(sql, data.id);
    });
  });

export const getMilestone5Fn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { milestone5Metrics } = await import("./priority.server");
    return milestone5Metrics(sql);
  });
});

export const getMilestone6Fn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { milestone6Metrics } = await import("./priority.server");
    return milestone6Metrics(sql);
  });
});

export const listFamilyRankingFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { persistPrioritySnapshot } = await import("./priority.server");
    return persistPrioritySnapshot(sql);
  });
});

export const listEarlyOpportunitiesFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listEarlyOpportunities } = await import("./priority.server");
    return listEarlyOpportunities(sql);
  });
});

export const listProbeRunsFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listProbeRuns } = await import("./priority.server");
    return listProbeRuns(sql);
  });
});

function parseOppFilters(data: unknown): {
  q?: string;
  uf?: string;
  horizon?: string;
  earlyOnly: boolean;
  modality?: string;
  organizationId?: string;
  catalogCode?: string;
  minValue?: number;
  sort?: "newest" | "deadline" | "attention" | "value";
} {
  const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const sortRaw = rec.sort;
  const sort: "newest" | "deadline" | "attention" | "value" | undefined =
    sortRaw === "deadline" || sortRaw === "attention" || sortRaw === "value" || sortRaw === "newest"
      ? sortRaw
      : undefined;
  const minRaw = rec.minValue;
  const minValue =
    typeof minRaw === "number" && Number.isFinite(minRaw)
      ? minRaw
      : typeof minRaw === "string" && Number.isFinite(Number(minRaw))
        ? Number(minRaw)
        : undefined;
  return {
    q: typeof rec.q === "string" ? rec.q : undefined,
    uf: typeof rec.uf === "string" ? rec.uf : undefined,
    horizon: typeof rec.horizon === "string" ? rec.horizon : undefined,
    earlyOnly: rec.earlyOnly === true || rec.earlyOnly === "true",
    modality: typeof rec.modality === "string" ? rec.modality : undefined,
    organizationId: typeof rec.organizationId === "string" ? rec.organizationId : undefined,
    catalogCode: typeof rec.catalogCode === "string" ? rec.catalogCode : undefined,
    minValue,
    sort,
  };
}

export const getMilestone7Fn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { milestone7Metrics } = await import("./intelligence.server");
    return milestone7Metrics(sql);
  });
});

export const listOpportunitiesFn = createServerFn({ method: "GET" })
  .validator((data) => parseOppFilters(data))
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { listOpportunities } = await import("./intelligence.server");
      return listOpportunities(sql, data);
    });
  });

export const getOpportunityFn = createServerFn({ method: "GET" })
  .validator(requireId)
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { getOpportunityDetail } = await import("./intelligence.server");
      return getOpportunityDetail(sql, data.id);
    });
  });

export const listPlanningFn = createServerFn({ method: "GET" })
  .validator((data) => {
    const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    return { origin: typeof rec.origin === "string" ? rec.origin : undefined };
  })
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { listPlanning } = await import("./intelligence.server");
      return listPlanning(sql, data.origin);
    });
  });

export const listFutureDemandFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listFutureDemand } = await import("./intelligence.server");
    return listFutureDemand(sql);
  });
});

export const listOrganizationsFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listOrganizations } = await import("./intelligence.server");
    return listOrganizations(sql);
  });
});

export const getOrganizationFn = createServerFn({ method: "GET" })
  .validator(requireId)
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { getOrganization } = await import("./intelligence.server");
      return getOrganization(sql, data.id);
    });
  });

export const listItemsFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listItems } = await import("./intelligence.server");
    return listItems(sql);
  });
});

export const getItemFn = createServerFn({ method: "GET" })
  .validator(requireId)
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { getItem } = await import("./intelligence.server");
      return getItem(sql, data.id);
    });
  });

export const listArpsFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listArps } = await import("./intelligence.server");
    return listArps(sql);
  });
});

export const listRecurrenceFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listRecurrence } = await import("./intelligence.server");
    return listRecurrence(sql);
  });
});

export const listAlertRulesFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listAlertRules } = await import("./intelligence.server");
    return listAlertRules(sql);
  });
});

export const listAlertEventsFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listAlertEvents } = await import("./intelligence.server");
    return listAlertEvents(sql);
  });
});

export const upsertAlertRuleFn = createServerFn({ method: "POST" })
  .validator((data) => {
    const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const name = typeof rec.name === "string" ? rec.name.trim() : "";
    if (!name) throw new Error("name is required");
    const event_types = Array.isArray(rec.event_types)
      ? rec.event_types.filter((item): item is string => typeof item === "string")
      : ["NEW_PROCUREMENT"];
    const filters =
      rec.filters && typeof rec.filters === "object" ? (rec.filters as Record<string, unknown>) : {};
    return {
      id: typeof rec.id === "string" ? rec.id : undefined,
      name,
      event_types,
      filters,
      min_change_priority: typeof rec.min_change_priority === "string" ? rec.min_change_priority : null,
      active: rec.active !== false,
    };
  })
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { upsertAlertRule } = await import("./intelligence.server");
      await upsertAlertRule(sql, data);
      return { ok: true };
    });
  });

export const setAlertRuleActiveFn = createServerFn({ method: "POST" })
  .validator((data) => {
    const { id } = requireId(data);
    const rec = data as Record<string, unknown>;
    return { id, active: rec.active !== false };
  })
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { setAlertRuleActive } = await import("./intelligence.server");
      await setAlertRuleActive(sql, data.id, data.active);
      return { ok: true };
    });
  });

export const listWatchlistFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listWatchlist } = await import("./intelligence.server");
    return listWatchlist(sql);
  });
});

export const upsertWatchlistFn = createServerFn({ method: "POST" })
  .validator((data) => {
    const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const kind = typeof rec.kind === "string" ? rec.kind : "";
    const value = typeof rec.value === "string" ? rec.value.trim() : "";
    if (!kind || !value) throw new Error("kind and value are required");
    return { kind, value, label: typeof rec.label === "string" ? rec.label : null };
  })
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { upsertWatchlist } = await import("./intelligence.server");
      await upsertWatchlist(sql, data);
      return { ok: true };
    });
  });

export const getGate75Fn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { runGate75 } = await import("./validation.server");
    return runGate75(sql);
  });
});

export const getDigestFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { getDigest } = await import("./intelligence.server");
    return getDigest(sql);
  });
});

export const listDiscoveryChannelsFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const family = typeof rec.family === "string" ? rec.family.trim() : undefined;
    const sourceId = typeof rec.sourceId === "string" ? rec.sourceId.trim() : undefined;
    return { family, sourceId };
  })
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { listDiscoveryChannels } = await import("./queries.server");
      return listDiscoveryChannels(sql, {
        family: data.family,
        sourceId: data.sourceId,
      });
    });
  });
