import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifySource } from "./classify.ts";
import { createGenericActionAdapter } from "./connectors/generic-action.ts";
import { createGenericJsfAdapter } from "./connectors/generic-jsf.ts";
import {
  createGenericJsonAdapter,
  extractJsonRecords,
} from "./connectors/generic-json.ts";
import { createAdapter } from "./connectors/index.ts";
import { resolveProcurement } from "./entity-resolution.ts";
import { ingestRecords } from "./ingest.ts";
import {
  classifyLocalOnly,
  integrationPriorityScore,
  leadTimeHours,
  percentile,
  PRIORITY_WEIGHTS,
  recordOverlap,
  toOpportunityEarlyKind,
} from "./coverage.ts";
import {
  explainablePriorityScore,
  priorityWeightsSum,
  PRIORITY_WEIGHTS_V1,
  PRIORITY_WEIGHTS_V2,
  PRIORITY_SCORE_VERSION,
  PRIORITY_SCORE_VERSION_V2,
} from "./priority.ts";
import {
  classifyAuthError,
  classifyPublicKey,
  fingerprintKey,
  mayPersistPublicKey,
  PCP_APIPCP_PUBLICKEY_EVIDENCE,
  redactKey,
} from "./pcp-semantics.ts";
import { M4_BLL_ENTE_IDS, M4_BLL_ORGS } from "./seed-m4.server.ts";
import { applyPlatformTransition } from "./platform-history.ts";
import { payloadHash, sha256 } from "./hash.ts";
import {
  detectSchemaDrift,
  schemaFingerprint,
} from "./schema-fingerprint.ts";
import { compareSchemas, fingerprintPayload } from "./schema-similarity.ts";
import { evidenceLevelFromScore, SCORE_WEIGHTS } from "./scoring.ts";
import { FRAMEWORK_SIGNATURES, sig } from "./signatures.ts";
import {
  buildFamilyCandidates,
  pickReuseFamily,
} from "./family-candidates.ts";
import { normalizeObject, objectsGroupTogether } from "./object-normalize.ts";
import { computeRecurrence } from "./recurrence.ts";
import {
  ATTENTION_SCORE_VERSION,
  ATTENTION_WEIGHTS_V1,
  attentionWeightsSum,
  explainableAttentionScore,
} from "./attention.ts";
import { hardenConfirmedLink, linkPlanningToProcurement } from "./planning-link.ts";
import {
  alertEventKey,
  changePriority,
  leadClass,
  shouldAlertForChange,
} from "./alerts.ts";
import { resolveOrgIdentity, arpSignals } from "./org-identity.ts";
import type {
  ConnectorConfig,
  Observation,
  SourceProcurement,
} from "./types.ts";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { evaluateAlerts } from "./validation/alert-quality.ts";
import { auditAttention } from "./validation/attention-audit.ts";
import {
  G75_AS_OF,
  G75_NOW,
  holdoutUnused,
  visibleAt,
} from "./validation/cohorts.ts";
import {
  G75_OBJECT_PAIRS,
  g75AlertEvents,
  g75AlertRules,
  g75AttentionRows,
  g75LabeledLinks,
  g75LateMatches,
  g75PcaPgcSides,
  g75RecurrenceSeries,
  mergeRecurrenceSeries,
  seriesFromProcurements,
} from "./validation/fixtures.ts";
import { decideM8, gate75StatisticalGo, G75_WORKSTREAMS, PROJECT_STATE } from "./validation/m8-decision.ts";
import { forbiddenLanguageHit, liveOnly } from "./validation/origin.ts";
import { auditObjectPair, relateAll, relatePcaPgc } from "./validation/pca-pgc.ts";
import { labelLinks, precisionReport, protocolLabel, reprocessLinks, unofficialConfirmedCount } from "./validation/planning-precision.ts";
import { evaluateRecurrence } from "./validation/recurrence-eval.ts";
import { displayLocalOnlyKind, evaluateMatchWindow } from "./validation/window-eval.ts";
import { localOnlyUxLabel } from "./labels.ts";

async function collectProcurements(
  iterable: AsyncIterable<SourceProcurement>,
): Promise<SourceProcurement[]> {
  const rows: SourceProcurement[] = [];
  for await (const row of iterable) rows.push(row);
  return rows;
}

async function withMockFetch(
  handler: (url: string) => {
    status?: number;
    body: unknown;
    headers?: Record<string, string>;
  },
  run: () => Promise<void>,
): Promise<string[]> {
  const original = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    const result = handler(url);
    const body =
      typeof result.body === "string" ? result.body : JSON.stringify(result.body);
    const contentType =
      typeof result.body === "string"
        ? "text/html; charset=utf-8"
        : "application/json";
    return new Response(body, {
      status: result.status ?? 200,
      headers: {
        "content-type": result.headers?.["content-type"] ?? contentType,
        ...(result.headers ?? {}),
      },
    });
  }) as typeof fetch;
  try {
    await run();
    return calls;
  } finally {
    globalThis.fetch = original;
  }
}

function blankProcurement(
  override: Partial<SourceProcurement>,
): SourceProcurement {
  return {
    external_id: "1",
    source_system_id: "src-local",
    process_number: null,
    procurement_number: null,
    year: null,
    modality: null,
    status: null,
    organization_name: null,
    organization_identifier: null,
    object: null,
    proposal_deadline: null,
    opening_at: null,
    source_url: null,
    raw_payload: {},
    ...override,
  };
}

describe("registry engine", () => {
  it("TEST 1: .xhtml + JSESSIONID classifies as GENERIC_JSF, not PARADIGMA_WBC", () => {
    const observations: Observation[] = [
      {
        observation_type: "PAGE_SUFFIX",
        key: "page_suffix",
        value: ".xhtml",
      },
      {
        observation_type: "COOKIE_NAME",
        key: "cookie_name",
        value: "JSESSIONID",
      },
    ];
    const paradigmaRoute = sig({
      id: "sig_paradigma_wbc_portalcompras",
      technology_family: "PARADIGMA_WBC",
      signature_type: "ROUTE_SIGNATURE",
      key: "route",
      pattern: "/PortalComprasWBC/",
      weight: 40,
      is_vendor_claim: true,
      description: "Speculative vendor route used only to prove it does not match",
    });
    const result = classifySource({
      observations,
      signatures: [...FRAMEWORK_SIGNATURES, paradigmaRoute],
    });
    assert.equal(result.technology_family, "GENERIC_JSF");
    assert.notEqual(result.technology_family, "PARADIGMA_WBC");
    const paradigmaMatch = result.matches.find(
      (row) => row.signature.pattern === "/PortalComprasWBC/",
    );
    assert.equal(paradigmaMatch?.matched, false);
  });

  it("TEST 2: official WBC/Paradigma document is VERIFIED PARADIGMA_WBC", () => {
    const title =
      "Contrato público de licenciamento da plataforma WBC/Paradigma para o município X";
    const result = classifySource({
      observations: [],
      signatures: FRAMEWORK_SIGNATURES,
      evidence: [
        {
          evidence_type: "OFFICIAL_DOCUMENT",
          title,
          description: title,
        },
      ],
    });
    assert.equal(result.technology_family, "PARADIGMA_WBC");
    assert.equal(result.evidence_level, "VERIFIED");
  });

  it("TEST 3: schema drift preserves payload and sets SCHEMA_CHANGED", () => {
    const previousPayload = { id: 1, nome: "edital" };
    const newPayload = { id: 1, nome: "edital", novoCampo: true };
    const previous = schemaFingerprint(previousPayload);
    const drift = detectSchemaDrift(previous.schema_hash, newPayload);
    assert.equal(drift.status, "SCHEMA_CHANGED");
    assert.deepEqual(drift.preserved_payload, newPayload);

    const ingested = ingestRecords(
      [
        {
          source_system_id: "src-1",
          source_identifier: "1",
          source_entity_type: "procurement",
          payload_hash: previous.schema_hash,
          schema_hash: previous.schema_hash,
          raw_payload: previousPayload,
          status: "HEALTHY",
          source_url: null,
        },
      ],
      [
        {
          source_system_id: "src-1",
          source_identifier: "1",
          raw_payload: newPayload,
        },
      ],
    );
    assert.equal(ingested[0]?.status, "SCHEMA_CHANGED");
    assert.deepEqual(ingested[0]?.raw_payload, newPayload);
    assert.ok(ingested[0]?.raw_payload);
  });

  it("TEST 4: vendor A → B closes the first interval without overwriting identity", () => {
    const first = applyPlatformTransition(
      [],
      {
        source_system_id: "src-sc",
        technology_family: "PARADIGMA_WBC",
        vendor_name: "A",
        product_name: "WBC",
        observed_at: "2015-01-01T00:00:00.000Z",
        evidence_id: "ev-a",
        confidence: 1,
      },
      () => "hist-a",
    );
    assert.equal(first.created?.vendor_name, "A");
    const second = applyPlatformTransition(
      first.history,
      {
        source_system_id: "src-sc",
        technology_family: "SISTEMA_PROPRIO",
        vendor_name: "B",
        product_name: "Portal próprio",
        observed_at: "2026-01-01T00:00:00.000Z",
        evidence_id: "ev-b",
        confidence: 1,
      },
      () => "hist-b",
    );
    assert.equal(second.changed, true);
    assert.equal(second.closed?.id, "hist-a");
    assert.equal(second.closed?.valid_to, "2026-01-01T00:00:00.000Z");
    assert.equal(second.created?.id, "hist-b");
    assert.equal(second.history.length, 2);

    const original = second.history.find((row) => row.id === "hist-a");
    assert.ok(original);
    assert.equal(original.vendor_name, "A");
    assert.equal(original.product_name, "WBC");
    assert.equal(original.technology_family, "PARADIGMA_WBC");
    assert.equal(original.valid_from, "2015-01-01T00:00:00.000Z");
    assert.equal(original.valid_to, "2026-01-01T00:00:00.000Z");

    const next = second.history.find((row) => row.id === "hist-b");
    assert.ok(next);
    assert.equal(next.vendor_name, "B");
    assert.equal(next.valid_to, null);
  });

  it("TEST 5: generic-json is reused across SC and PNCP-like configs", () => {
    const scConfig: ConnectorConfig = {
      connectorType: "GENERIC_JSON",
      baseUrl: "https://www.compras.sc.gov.br",
      paths: {
        discover: "/api/editais",
        modalities: "/api/modalidades-filtro",
      },
      defaultParams: { ano: "2026" },
      normalization: {
        external_id: "id",
        process_number: "processo",
        organization_name: "orgaoNome",
        object: "objeto",
      },
    };
    const pncpConfig: ConnectorConfig = {
      connectorType: "GENERIC_JSON",
      baseUrl: "https://pncp.gov.br/api/consulta",
      paths: {
        discover: "/v1/contratacoes/publicacao",
      },
      normalization: {
        external_id: "numeroControlePNCP",
        process_number: "numeroCompra",
        organization_name: "orgaoEntidade.razaoSocial",
        object: "objetoCompra",
      },
    };
    const sc = createGenericJsonAdapter(scConfig, "source-sc");
    const pncp = createGenericJsonAdapter(pncpConfig, "source-pncp");
    assert.equal(sc.connectorType, "GENERIC_JSON");
    assert.equal(pncp.connectorType, "GENERIC_JSON");
    assert.equal(sc.config.baseUrl, "https://www.compras.sc.gov.br");
    assert.equal(pncp.config.baseUrl, "https://pncp.gov.br/api/consulta");
    assert.notEqual(sc.config.baseUrl, pncp.config.baseUrl);
    assert.equal(sc.constructor, pncp.constructor);
    assert.equal(sc.constructor.name, pncp.constructor.name);
  });

  it("visual-only Paradigma mention stays UNKNOWN and does not become VERIFIED vendor", () => {
    const result = classifySource({
      observations: [
        { observation_type: "PAGE_SUFFIX", key: "page_suffix", value: ".xhtml" },
        { observation_type: "COOKIE_NAME", key: "cookie_name", value: "JSESSIONID" },
      ],
      signatures: FRAMEWORK_SIGNATURES,
      evidence: [
        {
          evidence_type: "OTHER",
          title: "Interface visual semelhante a Paradigma/WBC",
        },
      ],
    });
    assert.equal(result.technology_family, "GENERIC_JSF");
    assert.notEqual(result.technology_family, "PARADIGMA_WBC");
    assert.notEqual(result.evidence_level, "VERIFIED");
    assert.equal(result.vendor_name, null);
  });

  it("vendor reference at weight 80 is STRONG_INDICATION, not VERIFIED", () => {
    assert.equal(evidenceLevelFromScore(SCORE_WEIGHTS.VENDOR_REFERENCE), "STRONG_INDICATION");
    const result = classifySource({
      observations: [],
      signatures: FRAMEWORK_SIGNATURES,
      evidence: [
        {
          evidence_type: "VENDOR_REFERENCE",
          title: "Portal Licitanet citado em página institucional",
        },
      ],
    });
    assert.equal(result.technology_family, "LICITANET");
    assert.equal(result.evidence_level, "STRONG_INDICATION");
    assert.notEqual(result.evidence_level, "VERIFIED");
  });

  it("route + json schema vendor signatures reach STRONG_INDICATION", () => {
    const result = classifySource({
      observations: [
        {
          observation_type: "ROUTE",
          key: "pathname",
          value: "/licitanet/editais",
        },
        {
          observation_type: "JSON_FIELD",
          key: "json_field",
          value: "licitanetId",
        },
      ],
      signatures: [
        sig({
          id: "sig_licitanet_route",
          technology_family: "LICITANET",
          signature_type: "ROUTE_SIGNATURE",
          pattern: "/licitanet/",
          weight: SCORE_WEIGHTS.ROUTE_SIGNATURE,
          is_vendor_claim: true,
        }),
        sig({
          id: "sig_licitanet_schema",
          technology_family: "LICITANET",
          signature_type: "JSON_SHAPE",
          pattern: "licitanetId",
          weight: SCORE_WEIGHTS.JSON_SCHEMA,
          is_vendor_claim: true,
        }),
      ],
    });
    assert.equal(result.technology_family, "LICITANET");
    assert.equal(result.evidence_level, "STRONG_INDICATION");
    assert.ok(result.vendor_score >= 70);
  });

  it("official Fiorilli vs fingerprint Paradigma records an explicit conflict", () => {
    const result = classifySource({
      observations: [
        {
          observation_type: "ROUTE",
          key: "pathname",
          value: "/PortalComprasWBC/editais",
        },
      ],
      signatures: [
        sig({
          id: "sig_paradigma_conflict",
          technology_family: "PARADIGMA_WBC",
          signature_type: "ROUTE_SIGNATURE",
          pattern: "/PortalComprasWBC/",
          weight: SCORE_WEIGHTS.ROUTE_SIGNATURE,
          is_vendor_claim: true,
        }),
      ],
      evidence: [
        {
          evidence_type: "OFFICIAL_DOCUMENT",
          title: "Contrato de licenciamento Fiorilli SCPI",
        },
      ],
      currentVendorFamily: "PARADIGMA_WBC",
    });
    assert.equal(result.conflict, true);
    assert.match(result.conflict_reason ?? "", /SCPI_FIORILLI/);
    assert.match(result.conflict_reason ?? "", /PARADIGMA_WBC/);
    assert.equal(result.technology_family, "SCPI_FIORILLI");
    assert.equal(result.evidence_level, "VERIFIED");
  });

  it("same payload yields the same schema hash twice", () => {
    const payload = { content: [{ id: 1, processo: "1/2026" }] };
    const a = schemaFingerprint(payload);
    const b = schemaFingerprint(payload);
    assert.equal(a.schema_hash, b.schema_hash);
    assert.ok(a.field_paths.includes("content"));
    assert.equal(detectSchemaDrift(a.schema_hash, payload).status, "HEALTHY");
  });

  it("extractJsonRecords prefers explicit responsePath over heuristics", () => {
    const payload = {
      content: [{ id: "heuristic" }],
      resultado: { lista: [{ id: "explicit" }] },
    };
    const heuristic = extractJsonRecords(payload);
    const explicit = extractJsonRecords(payload, "resultado.lista");
    assert.equal((heuristic[0] as { id: string }).id, "heuristic");
    assert.equal((explicit[0] as { id: string }).id, "explicit");
    const portuguese = extractJsonRecords({
      conteudo: [{ id: "sc" }],
    });
    assert.equal((portuguese[0] as { id: string }).id, "sc");
  });

  it("generic-json PAGE_NUMBER pagination issues more than one GET", async () => {
    const pages: Record<string, unknown[]> = {
      "1": [
        { id: "a", objeto: "um" },
        { id: "b", objeto: "dois" },
      ],
      "2": [{ id: "c", objeto: "tres" }],
    };
    const adapter = createGenericJsonAdapter(
      {
        connectorType: "GENERIC_JSON",
        baseUrl: "https://example.gov.br",
        paths: { discover: "/api/editais" },
        pagination: {
          type: "PAGE_NUMBER",
          pageParam: "page",
          sizeParam: "size",
          pageSize: 2,
          startPage: 1,
        },
        normalization: { external_id: "id", object: "objeto" },
      },
      "src-page",
    );
    let rows: SourceProcurement[] = [];
    const calls = await withMockFetch((url) => {
      const page = new URL(url).searchParams.get("page") ?? "1";
      return { body: { content: pages[page] ?? [] } };
    }, async () => {
      rows = await collectProcurements(adapter.discover({ limit: 5 }));
    });
    assert.equal(rows.length, 3);
    assert.deepEqual(
      rows.map((row) => row.external_id),
      ["a", "b", "c"],
    );
    assert.ok(calls.length >= 2);
    assert.ok(calls.some((url) => url.includes("page=1")));
    assert.ok(calls.some((url) => url.includes("page=2")));
  });

  it("generic-json OFFSET_LIMIT and NEXT_LINK paginate until empty or next is missing", async () => {
    const offsetAdapter = createGenericJsonAdapter(
      {
        connectorType: "GENERIC_JSON",
        baseUrl: "https://example.gov.br",
        paths: { discover: "/api/itens" },
        pagination: {
          type: "OFFSET_LIMIT",
          pageParam: "offset",
          sizeParam: "limit",
          pageSize: 1,
          startPage: 0,
        },
        responsePath: "items",
        normalization: { external_id: "id" },
      },
      "src-offset",
    );
    const offsetItems = [{ id: "o1" }, { id: "o2" }];
    let offsetRows: SourceProcurement[] = [];
    await withMockFetch((url) => {
      const offset = Number(new URL(url).searchParams.get("offset") ?? "0");
      return { body: { items: offsetItems.slice(offset, offset + 1) } };
    }, async () => {
      offsetRows = await collectProcurements(offsetAdapter.discover({ limit: 10 }));
    });
    assert.equal(offsetRows.length, 2);

    const nextAdapter = createGenericJsonAdapter(
      {
        connectorType: "GENERIC_JSON",
        baseUrl: "https://example.gov.br",
        paths: { discover: "/api/page" },
        pagination: { type: "NEXT_LINK" },
        normalization: { external_id: "id" },
      },
      "src-next",
    );
    let nextRows: SourceProcurement[] = [];
    await withMockFetch((url) => {
      if (url.includes("cursor=b")) {
        return { body: { content: [{ id: "n2" }] } };
      }
      return {
        body: {
          content: [{ id: "n1" }],
          next: "https://example.gov.br/api/page?cursor=b",
        },
      };
    }, async () => {
      nextRows = await collectProcurements(nextAdapter.discover({ limit: 10 }));
    });
    assert.deepEqual(
      nextRows.map((row) => row.external_id),
      ["n1", "n2"],
    );
  });

  it("one generic-json class maps two JSON shapes to the same canonical fields", async () => {
    const scLike = createGenericJsonAdapter(
      {
        connectorType: "GENERIC_JSON",
        baseUrl: "https://alpha.gov.br",
        paths: { discover: "/api/editais" },
        responsePath: "content",
        normalization: {
          external_id: "id",
          process_number: "processo",
          object: "objeto",
          organization_name: "orgaoNome",
        },
      },
      "src-alpha",
    );
    const pncpLike = createGenericJsonAdapter(
      {
        connectorType: "GENERIC_JSON",
        baseUrl: "https://beta.gov.br",
        paths: { discover: "/v1/compras" },
        responsePath: "data",
        normalization: {
          external_id: "numeroControlePNCP",
          process_number: "numeroCompra",
          object: "objetoCompra",
          organization_name: "orgaoEntidade.razaoSocial",
        },
      },
      "src-beta",
    );
    assert.equal(scLike.constructor, pncpLike.constructor);

    let alpha: SourceProcurement[] = [];
    let beta: SourceProcurement[] = [];
    await withMockFetch((url) => {
      if (url.includes("alpha.gov.br")) {
        return {
          body: {
            content: [
              {
                id: 88,
                processo: "10/2026",
                objeto: "Material de expediente",
                orgaoNome: "SEAD",
              },
            ],
          },
        };
      }
      return {
        body: {
          data: [
            {
              numeroControlePNCP: "88",
              numeroCompra: "10/2026",
              objetoCompra: "Material de expediente",
              orgaoEntidade: { razaoSocial: "SEAD" },
            },
          ],
        },
      };
    }, async () => {
      alpha = await collectProcurements(scLike.discover({ limit: 1 }));
      beta = await collectProcurements(pncpLike.discover({ limit: 1 }));
    });

    assert.equal(alpha[0]?.external_id, "88");
    assert.equal(beta[0]?.external_id, "88");
    assert.equal(alpha[0]?.process_number, beta[0]?.process_number);
    assert.equal(alpha[0]?.object, beta[0]?.object);
    assert.equal(alpha[0]?.organization_name, beta[0]?.organization_name);
    assert.equal(alpha[0]?.source_system_id, "src-alpha");
    assert.equal(beta[0]?.source_system_id, "src-beta");
  });

  it("getPlanning returning [] is not a supported capability signal", async () => {
    const json = createGenericJsonAdapter(
      {
        connectorType: "GENERIC_JSON",
        baseUrl: "https://example.gov.br",
        paths: { discover: "/api/editais" },
      },
      "src-json",
    );
    const action = createGenericActionAdapter(
      {
        connectorType: "GENERIC_ACTION",
        baseUrl: "https://example.gov.br",
        paths: { discover: "/buscar.action" },
      },
      "src-action",
    );
    const jsf = createGenericJsfAdapter(
      {
        connectorType: "GENERIC_JSF",
        baseUrl: "https://example.gov.br",
        paths: { discover: "/list.xhtml" },
      },
      "src-jsf",
    );
    assert.deepEqual(await json.getPlanning?.({}), []);
    assert.deepEqual(await action.getPlanning?.({}), []);
    assert.deepEqual(await jsf.getPlanning?.({}), []);
  });

  it("entity resolution CONFIRMED only with strong identifiers", () => {
    const confirmed = resolveProcurement(
      blankProcurement({
        external_id: "local-1",
        raw_payload: { numeroControlePNCP: "12345678000199-1-000001/2026" },
      }),
      [
        {
          canonical_entity_type: "PNCP",
          canonical_entity_id: "pncp-1",
          numeroControlePNCP: "12345678000199-1-000001/2026",
        },
      ],
    );
    assert.equal(confirmed.status, "CONFIRMED");
    assert.equal(confirmed.match_method, "numeroControlePNCP");

    const standalone = resolveProcurement(blankProcurement({}), []);
    assert.equal(standalone.status, "UNMATCHED");
    assert.equal(standalone.match_method, "standalone_local");

    const weak = resolveProcurement(
      blankProcurement({
        object: "Aquisição de papel A4",
        opening_at: "2026-01-10T00:00:00.000Z",
      }),
      [
        {
          canonical_entity_type: "PNCP",
          canonical_entity_id: "pncp-weak",
          object: "Aquisição de papel A4 reciclado",
          opening_at: "2026-01-10T00:00:00.000Z",
        },
      ],
    );
    assert.notEqual(weak.status, "CONFIRMED");
  });

  it("M3: five BLL configs reuse one generic-action class without municipality forks", async () => {
    const adapterSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "connectors/generic-action.ts"),
      "utf8",
    );
    assert.equal(adapterSource.includes("if source"), false);
    assert.equal(/if\s*\(.*municip/i.test(adapterSource), false);
    assert.equal(/Cambará|Ubaíra|Cotia|Aspásia/i.test(adapterSource), false);

    const html = `
      <table>
        <tr><th>Promotor</th><th>Número</th><th>Objeto</th></tr>
        <tr><td>CAMBARA</td><td><a href="/Process/ProcessView?id=1">01/2026</a></td><td>Equipamentos Cambará</td></tr>
        <tr><td>NOVA OLIMPIA</td><td><a href="/Process/ProcessView?id=2">02/2026</a></td><td>Veículos Nova Olímpia</td></tr>
        <tr><td>UBAIRA</td><td><a href="/Process/ProcessView?id=3">03/2026</a></td><td>Manutenção Ubaíra</td></tr>
        <tr><td>COTIA</td><td><a href="/Process/ProcessView?id=4">04/2026</a></td><td>Limpeza Cotia</td></tr>
        <tr><td>ASPASIA</td><td><a href="/Process/ProcessView?id=5">05/2026</a></td><td>Material Aspásia</td></tr>
      </table>
    `;
    const orgs = [
      ["src_bll_cambara_pr", "CAMBARA", "1"],
      ["src_bll_novaolimpia_mt", "NOVA OLIMPIA", "2"],
      ["src_bll_ubaira_ba", "UBAIRA", "3"],
      ["src_bll_cotia_sp", "COTIA", "4"],
      ["src_bll_aspasia_sp", "ASPASIA", "5"],
    ] as const;

    const constructors = new Set<string>();
    await withMockFetch(() => ({ body: html }), async () => {
      for (const [id, organization, expectedId] of orgs) {
        const config: ConnectorConfig = {
          connectorType: "GENERIC_ACTION",
          baseUrl: "https://bllcompras.com",
          paths: {
            discover: "/Process/ProcessSearchPublic?param1=0",
            detail: "/Process/ProcessView",
            linkPattern: "Process/ProcessView",
          },
          defaultParams: { organization },
        };
        const adapter = createAdapter(config, id);
        constructors.add(adapter.constructor.name);
        assert.equal(adapter.connectorType, "GENERIC_ACTION");
        const rows = await collectProcurements(adapter.discover({ limit: 20 }));
        assert.equal(rows.length, 1);
        assert.equal(rows[0]?.external_id, expectedId);
        assert.equal(rows[0]?.source_system_id, id);
        assert.ok(rows[0]?.object);
      }
    });
    assert.equal(constructors.size, 1);
    assert.equal([...constructors][0], "GenericActionAdapter");
  });

  it("M3: family census GO/NO-GO — BLL reuses generic, vendor adapter stays NO-GO", () => {
    const bllIds = [
      "src_bll_platform",
      "src_bll_cambara_pr",
      "src_bll_novaolimpia_mt",
      "src_bll_ubaira_ba",
      "src_bll_cotia_sp",
    ];
    const candidates = buildFamilyCandidates([
      ...bllIds.map((id) => ({
        id,
        technology_family: "BLL",
        vendor_name: "Bolsa de Licitações e Leilões do Brasil",
        product_name: "BLL Compras",
        vendor_evidence_level: "VERIFIED",
        connector_type: "GENERIC_ACTION",
        classification_state: "ADAPTER_READY",
      })),
      {
        id: "src_fiorilli_itapira",
        technology_family: "SCPI_FIORILLI",
        vendor_name: "Fiorilli Software",
        product_name: "SCPI",
        vendor_evidence_level: "VERIFIED",
        connector_type: "NONE",
        classification_state: "CLASSIFIED",
      },
      {
        id: "src_fiorilli_assis",
        technology_family: "SCPI_FIORILLI",
        vendor_name: "Fiorilli Software",
        product_name: "SCPI",
        vendor_evidence_level: "VERIFIED",
        connector_type: "NONE",
        classification_state: "CLASSIFIED",
      },
      {
        id: "src_fiorilli_sales",
        technology_family: "SCPI_FIORILLI",
        vendor_name: "Fiorilli Software",
        product_name: "SCPI",
        vendor_evidence_level: "VERIFIED",
        connector_type: "NONE",
        classification_state: "CLASSIFIED",
      },
      {
        id: "src_fiorilli_urupes",
        technology_family: "SCPI_FIORILLI",
        vendor_name: "Fiorilli Software",
        product_name: "SCPI",
        vendor_evidence_level: "VERIFIED",
        connector_type: "NONE",
        classification_state: "CLASSIFIED",
      },
      {
        id: "src_fiorilli_irapua",
        technology_family: "SCPI_FIORILLI",
        vendor_name: "Fiorilli Software",
        product_name: "SCPI",
        vendor_evidence_level: "VERIFIED",
        connector_type: "NONE",
        classification_state: "CLASSIFIED",
      },
      {
        id: "src_paradigma_florianopolis",
        technology_family: "PARADIGMA_WBC",
        vendor_name: "Paradigma Business Solutions",
        product_name: "EGOV",
        vendor_evidence_level: "VERIFIED",
        connector_type: "NONE",
        classification_state: "CLASSIFIED",
      },
      {
        id: "src_paradigma_barueri",
        technology_family: "PARADIGMA_WBC",
        vendor_name: "Paradigma Business Solutions",
        product_name: "WBC",
        vendor_evidence_level: "VERIFIED",
        connector_type: "NONE",
        classification_state: "CLASSIFIED",
      },
    ]);
    const bll = candidates.find((row) => row.technology_family === "BLL");
    const fiorilli = candidates.find((row) => row.technology_family === "SCPI_FIORILLI");
    const paradigma = candidates.find((row) => row.technology_family === "PARADIGMA_WBC");
    assert.ok(bll);
    assert.equal(bll.verified_sources, 5);
    assert.equal(bll.generic_reuse, "GO");
    assert.equal(bll.commercial_adapter, "NO-GO");
    assert.equal(bll.adapter_candidate, "GENERIC_ACTION");
    assert.ok(fiorilli);
    assert.equal(fiorilli.verified_sources, 5);
    assert.equal(fiorilli.commercial_adapter, "NO-GO");
    assert.equal(fiorilli.generic_reuse, "NO-GO");
    assert.ok(paradigma);
    assert.equal(paradigma.verified_sources, 2);
    assert.equal(paradigma.commercial_adapter, "NO-GO");
    const chosen = pickReuseFamily(candidates);
    assert.equal(chosen?.technology_family, "BLL");
    assert.equal(chosen?.commercial_adapter, "NO-GO");
  });

  it("M3: similar JSON schema is not vendor proof", () => {
    const left = fingerprintPayload("src_a", { processo: "1", objeto: "x" });
    const right = fingerprintPayload("src_b", { processo: "2", objeto: "y" });
    const report = compareSchemas(left, right);
    assert.equal(report.same_hash, true);
    assert.match(report.note, /Não prova fornecedor|não prova fornecedor/i);
  });

  it("M3: source_record identity upsert does not duplicate", () => {
    const first = ingestRecords(
      [],
      [
        {
          source_system_id: "src_bll_cambara_pr",
          source_identifier: "1",
          source_entity_type: "procurement",
          raw_payload: { id: 1 },
        },
      ],
    );
    const second = ingestRecords(first, [
      {
        source_system_id: "src_bll_cambara_pr",
        source_identifier: "1",
        source_entity_type: "procurement",
        raw_payload: { id: 1, extra: true },
      },
    ]);
    assert.equal(second.length, 1);
    assert.equal(second[0]?.source_identifier, "1");
    assert.equal(second[0]?.status, "SCHEMA_CHANGED");
  });

  it("M4: twenty BLL entes reuse one GenericActionAdapter without municipality forks", async () => {
    assert.equal(M4_BLL_ENTE_IDS.length, 20);
    assert.equal(M4_BLL_ORGS.length, 20);
    const adapterSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "connectors/generic-action.ts"),
      "utf8",
    );
    assert.equal(/if\s*\(.*municip/i.test(adapterSource), false);
    for (const ente of M4_BLL_ORGS) {
      assert.equal(adapterSource.includes(ente), false);
    }

    const html = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "fixtures/bll-search.html"),
      "utf8",
    );
    const constructors = new Set<string>();
    await withMockFetch(() => ({ body: html }), async () => {
      for (const [i, id] of M4_BLL_ENTE_IDS.entries()) {
        const config: ConnectorConfig = {
          connectorType: "GENERIC_ACTION",
          baseUrl: "https://bllcompras.com",
          paths: {
            discover: "/Process/ProcessSearchPublic?param1=0",
            detail: "/Process/ProcessView",
            linkPattern: "Process/ProcessView",
          },
          defaultParams: { organization: M4_BLL_ORGS[i] },
        };
        const adapter = createAdapter(config, id);
        constructors.add(adapter.constructor.name);
        assert.equal(adapter.connectorType, "GENERIC_ACTION");
      }
    });
    assert.equal(constructors.size, 1);
    assert.equal([...constructors][0], "GenericActionAdapter");
    assert.ok(M4_BLL_ENTE_IDS.length * 6 >= 100);
  });

  it("M4: unmatched vs confirmed and object-only never confirms", () => {
    const confirmed = resolveProcurement(
      blankProcurement({
        external_id: "local-1",
        raw_payload: { numeroControlePNCP: "12345678000199-1-000001/2026" },
      }),
      [
        {
          canonical_entity_type: "PNCP",
          canonical_entity_id: "pncp-1",
          numeroControlePNCP: "12345678000199-1-000001/2026",
        },
      ],
    );
    assert.equal(confirmed.status, "CONFIRMED");
    assert.deepEqual(confirmed.matched_fields, ["numeroControlePNCP"]);

    const empty = resolveProcurement(blankProcurement({}), []);
    assert.equal(empty.status, "UNMATCHED");

    const objectOnly = resolveProcurement(
      blankProcurement({
        object: "Aquisição exclusiva de papel sulfite",
        opening_at: "2026-01-10T00:00:00.000Z",
      }),
      [
        {
          canonical_entity_type: "PNCP",
          canonical_entity_id: "pncp-obj",
          object: "Aquisição exclusiva de papel sulfite",
          opening_at: "2026-01-10T00:00:00.000Z",
        },
      ],
    );
    assert.notEqual(objectOnly.status, "CONFIRMED");
    assert.ok(objectOnly.match_score < 90);
  });

  it("M4: overlap is computed from records, not declarations", () => {
    const overlap = recordOverlap({
      total_local_records: 120,
      matched_pncp_records: 80,
      matched_comprasgov_records: 20,
      local_only_records: 40,
      ambiguous_records: 0,
      rejected_matches: 0,
    });
    assert.equal(overlap.pncp_overlap_ratio, 80 / 120);
    assert.equal(overlap.comprasgov_overlap_ratio, 20 / 120);
    assert.notEqual(overlap.pncp_overlap_ratio, 0.28);
  });

  it("M4: local-only states and lead time", () => {
    const now = "2026-09-14T20:00:00.000Z";
    assert.equal(
      classifyLocalOnly({ matched: true, firstSeenAt: "2026-09-14T00:00:00.000Z", now }),
      "MATCHED",
    );
    assert.equal(
      classifyLocalOnly({ matched: false, firstSeenAt: "2026-09-14T18:00:00.000Z", now }),
      "PENDING_PNCP_MATCH",
    );
    assert.equal(
      classifyLocalOnly({ matched: false, firstSeenAt: "2026-09-13T20:00:00.000Z", now }),
      "LOCAL_ONLY_PROVISIONAL",
    );
    assert.equal(
      classifyLocalOnly({ matched: false, firstSeenAt: "2026-09-01T20:00:00.000Z", now }),
      "LOCAL_ONLY_CONFIRMED",
    );
    const lead = leadTimeHours("2026-09-13T08:00:00.000Z", "2026-09-14T08:00:00.000Z");
    assert.equal(lead, 24);
    assert.ok(lead > 0);
    assert.equal(percentile([10, 20, 30, 40], 50), 25);
  });

  it("M4: canonical identity does not duplicate on the same PNCP control", () => {
    const left = resolveProcurement(
      blankProcurement({
        external_id: "bll-1",
        raw_payload: { numeroControlePNCP: "AAA-1-000001/2026" },
      }),
      [
        {
          canonical_entity_type: "PNCP",
          canonical_entity_id: "AAA-1-000001/2026",
          numeroControlePNCP: "AAA-1-000001/2026",
        },
      ],
    );
    const right = resolveProcurement(
      blankProcurement({
        external_id: "pncp-same",
        source_system_id: "src_br_pncp",
        raw_payload: { numeroControlePNCP: "AAA-1-000001/2026" },
      }),
      [
        {
          canonical_entity_type: "PNCP",
          canonical_entity_id: "AAA-1-000001/2026",
          numeroControlePNCP: "AAA-1-000001/2026",
        },
      ],
    );
    assert.equal(left.canonical_entity_id, right.canonical_entity_id);
    assert.equal(left.status, "CONFIRMED");
    assert.equal(right.status, "CONFIRMED");
  });

  it("M4: match score is explainable and CNPJ+year+seq confirms", () => {
    const result = resolveProcurement(
      blankProcurement({
        external_id: "seq-1",
        organization_identifier: "12345678000199",
        year: 2026,
        raw_payload: { sequencial: "17", organizationCnpj: "12345678000199" },
      }),
      [
        {
          canonical_entity_type: "PNCP",
          canonical_entity_id: "pncp-seq",
          organization_cnpj: "12345678000199",
          year: 2026,
          sequential: "17",
        },
      ],
    );
    assert.equal(result.status, "CONFIRMED");
    assert.equal(result.match_method, "cnpj_year_sequential");
    assert.ok(result.matched_fields.includes("organization_cnpj"));
    assert.ok(result.matched_fields.includes("year"));
    assert.ok(result.matched_fields.includes("sequential"));
  });

  it("M4: priority weights are documented and sum to 1", () => {
    const sum = Object.values(PRIORITY_WEIGHTS).reduce((acc, n) => acc + n, 0);
    assert.equal(Math.round(sum * 1000) / 1000, 1);
    const score = integrationPriorityScore({
      number_verified_entities: 1,
      estimated_procurement_volume: 0.6,
      current_pncp_gap: 0.4,
      technical_reuse_probability: 1,
      public_access_quality: 1,
      adapter_reuse: 1,
      historical_depth: 0.2,
    });
    assert.ok(score > 0.5);
    assert.ok(score <= 1);
  });

  it("M4: SC JSON fixture → generic-json → canonical fields", async () => {
    const payload = JSON.parse(
      readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), "fixtures/sc-editais.json"),
        "utf8",
      ),
    );
    await withMockFetch(() => ({ body: payload }), async () => {
      const adapter = createAdapter(
        {
          connectorType: "GENERIC_JSON",
          baseUrl: "https://www.compras.sc.gov.br",
          paths: { discover: "/api/editais" },
          responsePath: "conteudo",
        },
        "src_sc_compras",
      );
      const rows = await collectProcurements(adapter.discover({ limit: 20 }));
      assert.ok(rows.length >= 2);
      assert.ok(rows[0]?.object);
      assert.ok(rows[0]?.process_number || rows[0]?.external_id);
      assert.equal(rows[0]?.source_system_id, "src_sc_compras");
    });
  });

  it("M4: BLL HTML fixture → generic-action → records", async () => {
    const html = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "fixtures/bll-search.html"),
      "utf8",
    );
    await withMockFetch(() => ({ body: html }), async () => {
      const adapter = createAdapter(
        {
          connectorType: "GENERIC_ACTION",
          baseUrl: "https://bllcompras.com",
          paths: {
            discover: "/Process/ProcessSearchPublic?param1=0",
            linkPattern: "Process/ProcessView",
          },
          defaultParams: { organization: "CAMBARA" },
        },
        "src_bll_cambara_pr",
      );
      const rows = await collectProcurements(adapter.discover({ limit: 20 }));
      assert.equal(rows.length, 1);
      assert.equal(rows[0]?.external_id, "1001");
      assert.match(String(rows[0]?.object), /Cambará/i);
    });
  });

  it("M4: RJ action fixture → generic-action → records", async () => {
    const html = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "fixtures/rj-action.html"),
      "utf8",
    );
    await withMockFetch(() => ({ body: html }), async () => {
      const adapter = createAdapter(
        {
          connectorType: "GENERIC_ACTION",
          baseUrl: "https://www.compras.rj.gov.br",
          paths: { discover: "/Portal-Siga/EditaisLicitacoes/buscar.action" },
        },
        "src_rj_siga",
      );
      const rows = await collectProcurements(adapter.discover({ limit: 20 }));
      assert.ok(rows.length >= 2);
      assert.equal(rows[0]?.source_system_id, "src_rj_siga");
      assert.ok(rows[0]?.object);
    });
  });

  it("M5: v1 weights are documented, versioned and sum to 1", () => {
    assert.equal(PRIORITY_SCORE_VERSION, "v1");
    const sum = priorityWeightsSum(PRIORITY_WEIGHTS_V1);
    assert.equal(Math.round(sum * 1000) / 1000, 1);
    const explained = explainablePriorityScore({
      coverage_gap: 0.5,
      estimated_volume: 0.88,
      lead_time: 0.75,
      technical_reuse: 0.95,
      source_reliability: 0.55,
      evidence_confidence: 1,
      public_access: 0.7,
      historical_depth: 0.25,
      maintenance_risk: 0.25,
      integration_cost: 0.35,
    });
    assert.equal(explained.score_version, "v1");
    assert.ok(explained.final_score > 50);
    assert.ok(explained.final_score <= 100);
    assert.ok(explained.components.coverage_gap === 0.5);
    assert.match(explained.rationale, /v1/);
  });

  it("M5: already-ingested family with low remaining volume ranks below a high-gap reusable family", () => {
    const bll = explainablePriorityScore({
      coverage_gap: 0.33,
      estimated_volume: 0.35,
      lead_time: 0.5,
      technical_reuse: 1,
      source_reliability: 0.95,
      evidence_confidence: 1,
      public_access: 0.95,
      historical_depth: 0.45,
      maintenance_risk: 0.15,
      integration_cost: 0.12,
    });
    const pcp = explainablePriorityScore({
      coverage_gap: 0.5,
      estimated_volume: 0.88,
      lead_time: 0.75,
      technical_reuse: 0.95,
      source_reliability: 0.55,
      evidence_confidence: 1,
      public_access: 0.7,
      historical_depth: 0.25,
      maintenance_risk: 0.25,
      integration_cost: 0.35,
    });
    assert.ok(pcp.final_score > bll.final_score);
  });

  it("M5: PCP JSON fixture → generic-json → records, same class, no municipality fork", async () => {
    const payload = JSON.parse(
      readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), "fixtures/pcp-listar-processos.json"),
        "utf8",
      ),
    );
    const extracted = extractJsonRecords(payload, "dadosLicitacoes");
    assert.equal(extracted.length, 3);
    await withMockFetch(() => ({ body: payload }), async () => {
      const mogi = createAdapter(
        {
          connectorType: "GENERIC_JSON",
          baseUrl: "https://apipcp.portaldecompraspublicas.com.br",
          paths: { discover: "/publico/listarProcessos/" },
          responsePath: "dadosLicitacoes",
          defaultParams: { pagina: "1" },
          normalization: {
            external_id: "codLicitacao",
            process_number: "numero",
            object: "resumo",
            organization_name: "razaoSocial",
            status: "status",
            modality: "tipoLicitacao",
            source_url: "urlReferencia",
          },
        },
        "src_pcp_mogi_sp",
      );
      const porto = createAdapter(
        {
          connectorType: "GENERIC_JSON",
          baseUrl: "https://apipcp.portaldecompraspublicas.com.br",
          paths: { discover: "/publico/listarProcessos/" },
          responsePath: "dadosLicitacoes",
          defaultParams: { pagina: "1" },
          normalization: {
            external_id: "codLicitacao",
            process_number: "numero",
            object: "resumo",
            organization_name: "razaoSocial",
          },
        },
        "src_pcp_porto_belo_sc",
      );
      const left = await collectProcurements(mogi.discover({ limit: 20 }));
      const right = await collectProcurements(porto.discover({ limit: 20 }));
      assert.equal(left.length, 3);
      assert.equal(right.length, 3);
      assert.equal(left[0]?.external_id, "910001");
      assert.match(String(left[0]?.object), /Mogi/);
      assert.equal(mogi.connectorType, porto.connectorType);
      assert.equal(mogi.connectorType, "GENERIC_JSON");
    });
  });

  it("M5: object-only still never CONFIRMED", () => {
    const result = resolveProcurement(
      blankProcurement({
        external_id: "obj-only",
        object: "Aquisição de merenda escolar",
        raw_payload: { objeto: "Aquisição de merenda escolar" },
      }),
      [
        {
          canonical_entity_type: "PNCP",
          canonical_entity_id: "pncp-obj",
          object: "Aquisição de merenda escolar",
        },
      ],
    );
    assert.notEqual(result.status, "CONFIRMED");
  });

  it("M5: local-only confirmed is a window state, not a legal claim", () => {
    const confirmed = classifyLocalOnly({
      matched: false,
      firstSeenAt: "2026-09-01T00:00:00.000Z",
      now: "2026-09-14T00:00:00.000Z",
    });
    assert.equal(confirmed, "LOCAL_ONLY_CONFIRMED");
    const provisional = classifyLocalOnly({
      matched: false,
      firstSeenAt: "2026-09-13T12:00:00.000Z",
      now: "2026-09-14T00:00:00.000Z",
    });
    assert.equal(provisional, "LOCAL_ONLY_PROVISIONAL");
  });

  it("M5: PCP census of 5 VERIFIED on generic-json is reuse GO, commercial NO-GO", () => {
    const candidates = buildFamilyCandidates(
      [
        "src_pcp_platform",
        "src_pcp_linhares_es",
        "src_pcp_alegre_es",
        "src_pcp_mogi_sp",
        "src_pcp_porto_nacional_to",
        "src_pcp_porto_belo_sc",
      ].map((id) => ({
        id,
        technology_family: "PORTAL_COMPRAS_PUBLICAS",
        vendor_name: "eCustomize Consultoria em Software",
        product_name: "Portal de Compras Públicas",
        vendor_evidence_level: "VERIFIED",
        connector_type: "GENERIC_JSON",
        classification_state: "INGESTING",
      })),
    );
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0]?.generic_reuse, "GO");
    assert.equal(candidates[0]?.commercial_adapter, "NO-GO");
    assert.ok((candidates[0]?.verified_sources ?? 0) >= 5);
    const picked = pickReuseFamily(candidates);
    assert.equal(picked?.technology_family, "PORTAL_COMPRAS_PUBLICAS");
  });

  it("M6: apipcp publicKey is PRIVATE_CREDENTIAL and must not enter public connector_config", () => {
    const verdict = classifyPublicKey(PCP_APIPCP_PUBLICKEY_EVIDENCE);
    assert.equal(verdict.semantics, "PRIVATE_CREDENTIAL");
    assert.equal(verdict.classification, "SECRET");
    assert.equal(verdict.allowedInPublicConnectorConfig, false);
    assert.equal(verdict.readiness, "AUTH_REQUIRED");
    assert.equal(verdict.claim, "FATO_VERIFICADO");
    assert.equal(mayPersistPublicKey(verdict, "SECRET"), false);
    assert.equal(mayPersistPublicKey(verdict, "PUBLIC"), false);
    assert.equal(classifyAuthError(400, "Erro autenticação"), "CONFIG_INVALID");
    assert.match(redactKey("https://x/?publicKey=abc123&pagina=1"), /\[redacted\]/);
    assert.equal(fingerprintKey("b7ad651a44cff961330fe393543796f0")?.length, 16);
    assert.notEqual(fingerprintKey("b7ad651a44cff961330fe393543796f0"), "b7ad651a44cff961330fe393543796f0");
  });

  it("M6: v2 weights copy v1, are versioned and sum to 1", () => {
    assert.equal(PRIORITY_SCORE_VERSION_V2, "v2");
    assert.equal(Math.round(priorityWeightsSum(PRIORITY_WEIGHTS_V2) * 1000) / 1000, 1);
    assert.deepEqual({ ...PRIORITY_WEIGHTS_V2 }, { ...PRIORITY_WEIGHTS_V1 });
    const explained = explainablePriorityScore(
      {
        coverage_gap: 0.5,
        estimated_volume: 0.8,
        lead_time: 0.4,
        technical_reuse: 0.95,
        source_reliability: 0.8,
        evidence_confidence: 1,
        public_access: 0.9,
        historical_depth: 0.25,
        maintenance_risk: 0.22,
        integration_cost: 0.2,
      },
      PRIORITY_WEIGHTS_V2,
      PRIORITY_SCORE_VERSION_V2,
    );
    assert.equal(explained.score_version, "v2");
    assert.match(explained.rationale, /v2/);
    assert.ok(explained.final_score > 50);
  });

  it("M6: v2 fixture → generic-json, same class, five configs, no municipality fork", async () => {
    const page1 = JSON.parse(
      readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), "fixtures/pcp-v2-processos-page1.json"),
        "utf8",
      ),
    );
    const extracted = extractJsonRecords(page1, "result");
    assert.ok(extracted.length >= 3);
    const orgaos = [
      "Câmara Municipal de Linhares",
      "Prefeitura Municipal de Alegre",
      "Prefeitura Municipal de Mogi das Cruzes",
      "Secretaria Municipal de Compras e Licitações de Porto Nacional",
      "Prefeitura Municipal de Porto Belo",
    ];
    await withMockFetch(() => ({ body: page1 }), async () => {
      const adapters = orgaos.map((orgao, index) =>
        createAdapter(
          {
            connectorType: "GENERIC_JSON",
            baseUrl: "https://compras.api.portaldecompraspublicas.com.br",
            paths: { discover: "/v2/licitacao/processos" },
            responsePath: "result",
            defaultParams: { orgao, limitePagina: "25" },
            pagination: {
              type: "PAGE_NUMBER",
              pageParam: "pagina",
              sizeParam: "limitePagina",
              startPage: 1,
              pageSize: 25,
            },
            normalization: {
              external_id: "codigoLicitacao",
              process_number: "numero",
              object: "resumo",
              organization_name: "razaoSocial",
              status: "status.descricao",
              modality: "tipoLicitacao.tipoLicitacao",
              source_url: "urlReferencia",
            },
            linkBase: "https://www.portaldecompraspublicas.com.br",
          },
          `src_pcp_${index}`,
        ),
      );
      const first = await collectProcurements(adapters[0]!.discover({ limit: 5 }));
      assert.ok(first.length >= 1);
      assert.equal(first[0]?.external_id, "507402");
      assert.match(String(first[0]?.object), /REGULARIZAÇÃO FUNDIÁRIA/i);
      assert.equal(
        new Set(adapters.map((row) => row.constructor.name)).size,
        1,
      );
      adapters.forEach((row) => assert.equal(row.connectorType, "GENERIC_JSON"));
    });
  });

  it("M6: pagination page 2 differs from page 1 on the v2 fixture", async () => {
    const page1 = JSON.parse(
      readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), "fixtures/pcp-v2-processos-page1.json"),
        "utf8",
      ),
    );
    const page2 = JSON.parse(
      readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), "fixtures/pcp-v2-processos-page2.json"),
        "utf8",
      ),
    );
    const ids1 = extractJsonRecords(page1, "result").map(
      (row) => (row as { codigoLicitacao: number }).codigoLicitacao,
    );
    const ids2 = extractJsonRecords(page2, "result").map(
      (row) => (row as { codigoLicitacao: number }).codigoLicitacao,
    );
    assert.ok(ids1.length > 0 && ids2.length > 0);
    assert.ok(ids1.every((id) => !ids2.includes(id)));
    await withMockFetch((url) => {
      if (url.includes("pagina=2")) return { body: page2 };
      return { body: page1 };
    }, async () => {
      const adapter = createGenericJsonAdapter(
        {
          connectorType: "GENERIC_JSON",
          baseUrl: "https://compras.api.portaldecompraspublicas.com.br",
          paths: { discover: "/v2/licitacao/processos" },
          responsePath: "result",
          defaultParams: {
            orgao: "Prefeitura Municipal de Mogi das Cruzes",
            limitePagina: "5",
          },
          pagination: {
            type: "PAGE_NUMBER",
            pageParam: "pagina",
            sizeParam: "limitePagina",
            startPage: 1,
            pageSize: 5,
          },
          normalization: { external_id: "codigoLicitacao" },
        },
        "src_pcp_mogi_sp",
      );
      const rows = await collectProcurements(adapter.discover({ limit: 10 }));
      const ids = rows.map((row) => row.external_id);
      assert.ok(ids.includes("507402"));
      assert.ok(ids.includes("497656"));
      assert.notEqual(ids[0], ids[5] ?? ids[ids.length - 1]);
    });
  });

  it("M6: acceptEquals drops Alegrete-style substring hits", async () => {
    const mixed = {
      result: [
        { codigoLicitacao: 1, razaoSocial: "Prefeitura Municipal de Alegre" },
        { codigoLicitacao: 2, razaoSocial: "Prefeitura Municipal de Alegrete" },
      ],
    };
    await withMockFetch(() => ({ body: mixed }), async () => {
      const adapter = createGenericJsonAdapter(
        {
          connectorType: "GENERIC_JSON",
          baseUrl: "https://compras.api.portaldecompraspublicas.com.br",
          paths: { discover: "/v2/licitacao/processos" },
          responsePath: "result",
          defaultParams: { orgao: "Prefeitura Municipal de Alegre" },
          acceptEquals: { razaoSocial: "Prefeitura Municipal de Alegre" },
          normalization: {
            external_id: "codigoLicitacao",
            organization_name: "razaoSocial",
          },
        },
        "src_pcp_alegre_es",
      );
      const rows = await collectProcurements(adapter.discover({ limit: 20 }));
      assert.equal(rows.length, 1);
      assert.equal(rows[0]?.organization_name, "Prefeitura Municipal de Alegre");
    });
  });

  it("M6: payload hash is stable; change is detectable; PcpAdapter file does not exist", () => {
    const left = { codigoLicitacao: 1, resumo: "A" };
    const right = { codigoLicitacao: 1, resumo: "B" };
    assert.equal(payloadHash(left), payloadHash(left));
    assert.notEqual(payloadHash(left), payloadHash(right));
    assert.equal(sha256("x").length, 64);
    const adapterFiles = [
      join(dirname(fileURLToPath(import.meta.url)), "connectors/pcp-adapter.ts"),
      join(dirname(fileURLToPath(import.meta.url)), "connectors/pcp.ts"),
      join(dirname(fileURLToPath(import.meta.url)), "connectors/PcpAdapter.ts"),
    ];
    adapterFiles.forEach((file) => assert.equal(existsSync(file), false));
  });

  it("M6: HTTP 400 auth is a config error, not a parser failure", async () => {
    await withMockFetch(
      () => ({ status: 400, body: { erro: "Erro autenticação" } }),
      async () => {
        const adapter = createGenericJsonAdapter(
          {
            connectorType: "GENERIC_JSON",
            baseUrl: "https://apipcp.portaldecompraspublicas.com.br",
            paths: { discover: "/publico/listarProcessos/" },
            responsePath: "dadosLicitacoes",
          },
          "src_pcp_platform",
        );
        await assert.rejects(
          () => collectProcurements(adapter.discover({ limit: 1 })),
          /HTTP 400/,
        );
      },
    );
  });

  it("M6: object-only still never CONFIRMED on live-shaped payload", () => {
    const result = resolveProcurement(
      blankProcurement({
        external_id: "507402",
        object: "REGULARIZAÇÃO FUNDIÁRIA",
        raw_payload: { resumo: "REGULARIZAÇÃO FUNDIÁRIA" },
      }),
      [
        {
          canonical_entity_type: "PNCP",
          canonical_entity_id: "pncp-obj",
          object: "REGULARIZAÇÃO FUNDIÁRIA",
        },
      ],
    );
    assert.notEqual(result.status, "CONFIRMED");
  });

  it("M7: v1 attention weights are documented, versioned and sum to 1", () => {
    assert.equal(ATTENTION_SCORE_VERSION, "v1");
    assert.equal(Math.round(attentionWeightsSum(ATTENTION_WEIGHTS_V1) * 1000) / 1000, 1);
    const explained = explainableAttentionScore({
      freshness: 0.95,
      lead_time: 0.8,
      deadline_urgency: 0.6,
      organization_recurrence: 0.7,
      category_relevance: 0.5,
      planning_confirmation: 1,
      estimated_value: 0.7,
      data_quality: 0.85,
      source_confidence: 0.8,
    });
    assert.ok(explained.final_score > 50);
    assert.ok(explained.final_score <= 100);
    assert.match(explained.rationale, /v1/);
    assert.ok(explained.components.freshness === 0.95);
  });

  it("M7: 1 purchase has no recurrence; 2 distant is low; 5 regular is high", () => {
    const now = "2026-09-14T20:00:00.000Z";
    const one = computeRecurrence({
      now,
      purchases: [
        {
          canonical_id: "a",
          occurred_at: "2026-02-01T00:00:00.000Z",
          value: 100,
          normalized: normalizeObject("material esportivo"),
        },
      ],
    });
    assert.equal(one.signal_level, "NONE");

    const distant = computeRecurrence({
      now,
      purchases: [
        {
          canonical_id: "b1",
          occurred_at: "2023-10-12T00:00:00.000Z",
          value: 100,
          normalized: normalizeObject("aquisição de combustível diesel"),
        },
        {
          canonical_id: "b2",
          occurred_at: "2026-08-02T00:00:00.000Z",
          value: 110,
          normalized: normalizeObject("aquisição de combustível diesel"),
        },
      ],
    });
    assert.equal(distant.signal_level, "LOW");

    const regular = computeRecurrence({
      now,
      purchases: [
        "2024-03-01T00:00:00.000Z",
        "2024-08-28T00:00:00.000Z",
        "2025-02-24T00:00:00.000Z",
        "2025-08-23T00:00:00.000Z",
        "2026-02-19T00:00:00.000Z",
      ].map((occurred_at, i) => ({
        canonical_id: `s${i}`,
        occurred_at,
        value: 180000,
        normalized: normalizeObject("aquisição de material esportivo e aparelhos de academia"),
      })),
    });
    assert.equal(regular.signal_level, "HIGH");
    assert.ok((regular.evidence_procurement_ids ?? []).length >= 5);
    assert.match(regular.rationale, /inferência/i);
    assert.doesNotMatch(regular.rationale, /vai comprar|compra garantida|oportunidade exclusiva|descumprimento/i);
  });

  it("M7: strongly different objects do not group", () => {
    const sport = normalizeObject("Aquisição de material esportivo e aparelhos de academia");
    const school = normalizeObject("Reforma de escola municipal no bairro Perequê");
    assert.equal(objectsGroupTogether(sport, school), false);
  });

  it("M7: PCA exact official id confirms; object-only does not; unmatched stays unmatched", () => {
    const confirmed = linkPlanningToProcurement(
      {
        id: "pca1",
        origin_type: "PCA_PNCP",
        organization_cnpj: "82575812000120",
        year: 2026,
        catalog_code: "104217",
        numero_item_pncp: "82575812000120-2026-12",
        item_number: "12",
        object: "material esportivo",
        estimated_value_num: 220000,
      },
      [
        {
          id: "proc1",
          organization_cnpj: "82575812000120",
          year: 2026,
          catalog_code: "104217",
          numero_item_pncp: "82575812000120-2026-12",
          object: "equipamentos esportivos",
          estimated_value_num: 210000,
        },
      ],
    );
    assert.equal(confirmed.status, "CONFIRMED");

    const probable = linkPlanningToProcurement(
      {
        id: "pca2",
        origin_type: "PCA_PNCP",
        organization_cnpj: "46523270000188",
        year: 2026,
        catalog_code: null,
        numero_item_pncp: null,
        item_number: null,
        object: "Gêneros alimentícios para merenda escolar",
        estimated_value_num: 740000,
      },
      [
        {
          id: "proc2",
          organization_cnpj: "46523270000188",
          year: 2026,
          catalog_code: null,
          numero_item_pncp: null,
          object: "Aquisição de merenda escolar para a rede municipal de ensino",
          estimated_value_num: 760000,
        },
      ],
    );
    assert.equal(probable.status, "PROBABLE");

    const objectOnly = linkPlanningToProcurement(
      {
        id: "pca3",
        origin_type: "PCA_PNCP",
        organization_cnpj: null,
        year: 2026,
        catalog_code: null,
        numero_item_pncp: null,
        item_number: null,
        object: "merenda escolar",
        estimated_value_num: 100,
      },
      [
        {
          id: "proc3",
          organization_cnpj: "00000000000000",
          year: 2025,
          catalog_code: null,
          numero_item_pncp: null,
          object: "merenda escolar",
          estimated_value_num: 100,
        },
      ],
    );
    assert.notEqual(objectOnly.status, "CONFIRMED");

    const unmatched = linkPlanningToProcurement(
      {
        id: "pca4",
        origin_type: "PCA_PNCP",
        organization_cnpj: "25094626000100",
        year: 2026,
        catalog_code: null,
        numero_item_pncp: null,
        item_number: null,
        object: "Aquisição de veículos para a frota municipal",
        estimated_value_num: 1_200_000,
      },
      [
        {
          id: "proc4",
          organization_cnpj: "82575812000120",
          year: 2026,
          catalog_code: "104217",
          numero_item_pncp: null,
          object: "material esportivo",
          estimated_value_num: 210000,
        },
      ],
    );
    assert.equal(unmatched.status, "UNMATCHED");
  });

  it("M7: alert events are idempotent and ignore low-priority changes when rule is HIGH", () => {
    const key1 = alertEventKey({
      ruleId: "r1",
      entityType: "opportunity",
      entityId: "opp1",
      eventType: "NEW_PROCUREMENT",
    });
    const key2 = alertEventKey({
      ruleId: "r1",
      entityType: "opportunity",
      entityId: "opp1",
      eventType: "NEW_PROCUREMENT",
    });
    assert.equal(key1, key2);
    assert.equal(changePriority("deadline"), "HIGH");
    assert.equal(changePriority("notes"), "LOW");
    assert.equal(shouldAlertForChange("HIGH", "HIGH"), true);
    assert.equal(shouldAlertForChange("LOW", "HIGH"), false);
    assert.equal(leadClass(36), "EARLY");
    assert.equal(leadClass(0), "SAME_WINDOW");
  });

  it("M7: organization identity prefers CNPJ and marks name-only as review", () => {
    const cnpj = resolveOrgIdentity({
      display_name: "Prefeitura de Porto Belo",
      cnpj: "82.575.812/0001-20",
      uf: "SC",
    });
    assert.equal(cnpj.identity_status, "CONFIRMED");
    assert.equal(cnpj.identity_method, "CNPJ");
    assert.equal(cnpj.cnpj, "82575812000120");
    const named = resolveOrgIdentity({ display_name: "Alguma câmara", uf: "TO" });
    assert.equal(named.identity_status, "REVIEW_REQUIRED");
    assert.equal(named.identity_method, "NAME_UF");
  });

  it("M7: official text is preserved; synonym buckets group sports and school meals", () => {
    const sport = normalizeObject("Aquisição de material esportivo e aparelhos de academia — lote 2");
    assert.equal(sport.raw, "Aquisição de material esportivo e aparelhos de academia — lote 2");
    assert.equal(sport.synonym_bucket, "equipamento_esportivo");
    const meal = normalizeObject("Gêneros alimentícios para merenda escolar");
    const meal2 = normalizeObject("Aquisição de merenda escolar para a rede municipal de ensino");
    assert.equal(meal.synonym_bucket, "alimentacao_escolar");
    assert.equal(objectsGroupTogether(meal, meal2), true);
  });

  it("M7: PENDING_PNCP_MATCH maps to PENDING_MATCH on the opportunity, never EXCLUSIVE", () => {
    assert.equal(toOpportunityEarlyKind("PENDING_PNCP_MATCH"), "PENDING_MATCH");
    assert.equal(toOpportunityEarlyKind("LOCAL_ONLY_CONFIRMED"), "LOCAL_ONLY_CONFIRMED");
    assert.equal(toOpportunityEarlyKind("MATCHED"), null);
    const pending = classifyLocalOnly({
      matched: false,
      firstSeenAt: "2026-09-14T18:00:00.000Z",
      now: "2026-09-14T20:00:00.000Z",
    });
    assert.equal(pending, "PENDING_PNCP_MATCH");
    assert.equal(toOpportunityEarlyKind(pending), "PENDING_MATCH");
  });

  it("M7: ARP signals are consumption flags, not a new bid", () => {
    const signals = arpSignals({
      remaining_ratio: 0.62,
      vigency_end: "2026-10-04T00:00:00.000Z",
      adhesions: 2,
      now: "2026-09-14T20:00:00.000Z",
    });
    assert.ok(signals.includes("ACTIVE_ARP"));
    assert.ok(signals.includes("HIGH_REMAINING_BALANCE"));
    assert.ok(signals.includes("NEAR_EXPIRATION"));
    assert.ok(signals.includes("RECENT_ADHESION"));
    assert.equal(signals.includes("NEW_PROCUREMENT"), false);
  });

  it("M7: attention score is structural attention, not win probability", () => {
    const explained = explainableAttentionScore({
      freshness: 1,
      lead_time: 1,
      deadline_urgency: 1,
      organization_recurrence: 1,
      category_relevance: 1,
      planning_confirmation: 1,
      estimated_value: 1,
      data_quality: 1,
      source_confidence: 1,
    });
    assert.equal(explained.final_score, 100);
    assert.match(explained.rationale, /não é probabilidade de vitória|não probabilidade de vitória/i);
    assert.equal(Object.keys(explained.components).length, 9);
  });
});

describe("Gate 7.5 empirical validation", () => {
  it("does not leak purchases after T into recurrence", () => {
    const series = g75RecurrenceSeries();
    const sport = series.find((row) => row.id === "series_sport_semestral");
    assert.ok(sport);
    const visible = visibleAt(sport.purchases, G75_AS_OF);
    assert.equal(
      visible.some((row) => row.occurred_at > G75_AS_OF),
      false,
    );
    const rec = evaluateRecurrence({ series, t: G75_AS_OF, origin_scope: "SYNTHETIC" });
    assert.equal(rec.leakage_count, 0);
    assert.equal(
      holdoutUnused({
        calibrated_on: series.flatMap((s) =>
          s.purchases.filter((p) => p.occurred_at <= G75_AS_OF).map((p) => p.canonical_id),
        ),
        holdout_ids: series.flatMap((s) =>
          s.purchases.filter((p) => p.occurred_at >= "2026-09-01").map((p) => p.canonical_id),
        ),
      }),
      true,
    );
  });

  it("compares recurrence against baselines and flags small n", () => {
    const rec = evaluateRecurrence({
      series: g75RecurrenceSeries(),
      t: G75_AS_OF,
      origin_scope: "SYNTHETIC",
    });
    assert.ok(rec.windows[90].engine.n >= 0);
    assert.ok(rec.windows[90].baseline_one_last_year.n >= 0);
    assert.equal(typeof rec.sample_too_small, "boolean");
    assert.match(rec.notes, /amostra|baseline|follow-through|sinal/i);
  });

  it("object grouping matches the audited pairs", () => {
    for (const pair of G75_OBJECT_PAIRS) {
      const audit = auditObjectPair(pair.left, pair.right, pair.expected);
      assert.equal(audit.error, null, `${pair.left} vs ${pair.right}`);
    }
  });

  it("PCA is not PGC and never auto-merges", () => {
    const sides = g75PcaPgcSides();
    const related = relateAll(sides.pca, sides.pgc);
    assert.equal(
      related.every((row) => row.auto_merged === false),
      true,
    );
    const sameOffice = relatePcaPgc(
      sides.pca.find((row) => row.id === "pca_office")!,
      sides.pgc.find((row) => row.id === "pgc_office")!,
    );
    assert.notEqual(sameOffice.status, "UNRELATED");
    assert.equal(sameOffice.auto_merged, false);
    const unrelated = relatePcaPgc(
      sides.pca.find((row) => row.id === "pca_fazenda_obra")!,
      sides.pgc.find((row) => row.id === "pgc_doutorado")!,
    );
    assert.ok(unrelated.status === "UNRELATED" || unrelated.status === "REVIEW_REQUIRED");
    assert.equal(unrelated.auto_merged, false);
  });

  it("live metrics drop golden and fixture rows", () => {
    const mixed = g75LateMatches();
    const live = liveOnly(mixed);
    assert.equal(
      live.every((row) => row.data_origin === "LIVE"),
      true,
    );
    assert.equal(
      live.some((row) => row.data_origin === "GOLDEN" || row.data_origin === "FIXTURE"),
      false,
    );
  });

  it("CONFIRMED without official id is INCORRECT and the resolver demotes the eight", () => {
    const raw = g75LabeledLinks();
    const labeledRaw = labelLinks(raw);
    const bad = labeledRaw.filter((row) => row.id.startsWith("lab_conf_bad_"));
    assert.equal(bad.length, 8);
    assert.equal(
      bad.every((row) => row.label === "INCORRECT"),
      true,
    );
    const ok = protocolLabel({
      id: "x",
      planning_id: "p",
      procurement_id: "c",
      status: "CONFIRMED",
      match_method: "official_item_id",
      match_score: 100,
      matched_fields: ["numero_item_pncp"],
      data_origin: "SYNTHETIC",
      planning_origin: "PCA_PNCP",
    });
    assert.equal(ok.label, "CORRECT");
    const rawReport = precisionReport({
      labeled: labeledRaw,
      planned: labeledRaw.length,
      converted: labeledRaw.filter((row) => row.status === "CONFIRMED" || row.status === "PROBABLE").length,
      plan_to_procurement_days: [40, 70, 95],
      origin_scope: "SYNTHETIC",
    });
    assert.equal(rawReport.incorrect_confirmed, 8);
    assert.equal(rawReport.harden_confirmed_rule, true);
    assert.equal(rawReport.n, 100);

    const reprocessed = reprocessLinks(raw);
    assert.equal(reprocessed.demoted.length, 8);
    assert.equal(reprocessed.demoted_to_review, 5);
    assert.equal(reprocessed.demoted_to_probable, 3);
    assert.equal(
      reprocessed.after.filter((row) => row.status === "CONFIRMED").length,
      40,
    );
    assert.equal(unofficialConfirmedCount(reprocessed.after), 0);
    const labeledAfter = labelLinks(reprocessed.after);
    const afterReport = precisionReport({
      labeled: labeledAfter,
      planned: labeledAfter.length,
      converted: labeledAfter.filter((row) => row.status === "CONFIRMED" || row.status === "PROBABLE").length,
      plan_to_procurement_days: [40, 70, 95],
      origin_scope: "SYNTHETIC",
      reclassified_from_confirmed: reprocessed.demoted.length,
      demoted_to_review: reprocessed.demoted_to_review,
      demoted_to_probable: reprocessed.demoted_to_probable,
    });
    assert.equal(afterReport.incorrect_confirmed, 0);
    assert.equal(afterReport.harden_confirmed_rule, false);
    assert.equal(afterReport.reclassified_from_confirmed, 8);
    assert.equal(afterReport.demoted_to_probable, 3);
    assert.equal(afterReport.demoted_to_review, 5);
    assert.equal(
      labeledAfter.filter((row) => row.status === "CONFIRMED").every((row) => row.label === "CORRECT"),
      true,
    );

    const demoted = hardenConfirmedLink({
      planning_id: "p",
      procurement_id: "c",
      status: "CONFIRMED",
      match_method: "object_only",
      match_score: 70,
      matched_fields: ["object"],
    });
    assert.equal(demoted.status, "REVIEW_REQUIRED");
    assert.equal(demoted.match_method, "demoted_from_confirmed_no_official_id");

    const probable = hardenConfirmedLink({
      planning_id: "p2",
      procurement_id: "c2",
      status: "CONFIRMED",
      match_method: "cnpj_year_object_value",
      match_score: 88,
      matched_fields: ["organization_cnpj", "year", "value"],
    });
    assert.equal(probable.status, "PROBABLE");
    assert.equal(probable.match_method, "demoted_from_confirmed_to_probable");
  });

  it("window CDF keeps 7 days and does not mature the PCP week", () => {
    const live = evaluateMatchWindow({
      rows: liveOnly(g75LateMatches()),
      now: G75_NOW,
      origin_scope: "LIVE",
    });
    assert.equal(live.cohort_matured, false);
    assert.equal(live.recommendation.change, false);
    assert.equal(live.recommendation.keep_days, 7);
    assert.equal(live.recommendation.reevaluate_after, "2026-09-21");
    assert.equal(live.display_alias.ux_kind, "MATURED_NO_MATCH");
    const fixture = evaluateMatchWindow({
      rows: g75LateMatches().filter((row) => row.data_origin === "FIXTURE"),
      now: G75_NOW,
      origin_scope: "FIXTURE",
    });
    assert.ok((fixture.pct_24h ?? 0) > 0);
    assert.ok((fixture.pct_7d ?? 0) >= (fixture.pct_24h ?? 0));
  });

  it("LOCAL_ONLY_CONFIRMED displays as MATURED_NO_MATCH, never exclusive", () => {
    assert.equal(displayLocalOnlyKind("LOCAL_ONLY_CONFIRMED"), "MATURED_NO_MATCH");
    const label = localOnlyUxLabel("LOCAL_ONLY_CONFIRMED");
    assert.match(label, /não é ausência definitiva/i);
    assert.equal(/exclusiv/i.test(label), false);
  });

  it("attention audit versions the score and runs ablation", () => {
    const audit = auditAttention({ rows: g75AttentionRows(), origin_scope: "SYNTHETIC" });
    assert.equal(audit.score_version, ATTENTION_SCORE_VERSION);
    assert.ok(audit.ablation.length >= 8);
    assert.ok(audit.absurd_count >= 1);
    assert.equal(audit.bad_cases.length, audit.absurd_count);
    assert.match(audit.notes, /não é probabilidade de vitória|atenção estrutural/i);
    assert.match(audit.notes, /pesos não foram alterados/i);
  });

  it("alerts are idempotent and suppress duplicate keys", () => {
    const report = evaluateAlerts({
      rules: g75AlertRules(),
      events: g75AlertEvents(),
      origin_scope: "SYNTHETIC",
    });
    assert.equal(report.idempotent, true);
    assert.ok(report.duplicates_suppressed >= 0);
    const keyA = alertEventKey({
      ruleId: "r1",
      eventType: "NEW_PROCUREMENT",
      entityType: "opportunity",
      entityId: "opp1",
    });
    const keyB = alertEventKey({
      ruleId: "r1",
      eventType: "NEW_PROCUREMENT",
      entityType: "opportunity",
      entityId: "opp1",
    });
    assert.equal(keyA, keyB);
  });

  it("rejects forbidden product language", () => {
    assert.ok(forbiddenLanguageHit("probabilidade de vitória"));
    assert.ok(forbiddenLanguageHit("ausência definitiva no PNCP"));
    assert.ok(forbiddenLanguageHit("local exclusive"));
    assert.equal(forbiddenLanguageHit("atenção estrutural"), null);
    assert.equal(forbiddenLanguageHit("sem match nacional após a janela"), null);
    assert.equal(forbiddenLanguageHit("não é probabilidade de vitória"), null);
    assert.equal(
      forbiddenLanguageHit("Attention v1 é atenção estrutural, não é probabilidade de vitória."),
      null,
    );
    assert.equal(forbiddenLanguageHit("não é ausência definitiva"), null);
  });

  it("M8 stays NONE while the PCP window is unmatured and n is small", () => {
    const decision = decideM8({
      live_pca_ingested: true,
      live_pgc_ingested: true,
      live_arp_ingested: true,
      planning_confirmed_precision: 0.83,
      planning_confirmed_n: 40,
      planning_incorrect_confirmed: 0,
      recurrence_n: 4,
      recurrence_beats_baseline: null,
      recurrence_sample_too_small: true,
      pcp_cohort_matured: false,
      pcp_overlap_ratio: 0,
      window_recommendation_change: false,
      attention_absurd_count: 0,
      alerts_idempotent: true,
      golden_separated: true,
      holdout_defined: true,
      error_taxonomy: true,
      document_pages_observed: 0,
      price_observations: 3,
      live_opportunities: 2,
      local_coverage_gain_after_late_match: null,
    });
    assert.equal(decision.choice, "NONE");
    assert.equal(decision.go_m8, false);
    assert.equal(decision.closest_if_forced, "C");
    assert.equal(decision.closest_confidence, "PRELIMINARY");
    assert.ok(decision.blockers.length > 0);
    assert.equal(decision.m8_c_requires.length, 3);
    assert.match(decision.rationale, /Direção mais próxima, ainda preliminar, é C/);
    const statistical = gate75StatisticalGo({
      pcp_cohort_matured: false,
      recurrence_n: 4,
      recurrence_beats_baseline: null,
      planning_incorrect_confirmed: 0,
      planning_confirmed_n: 40,
      planning_confirmed_precision: 1,
    });
    assert.equal(statistical.go, false);
    assert.ok(statistical.missing.includes("coorte PCP 08–14/09 madura"));
    assert.equal(G75_WORKSTREAMS.length, 4);
    assert.equal(G75_WORKSTREAMS[0].status, "DONE");
    assert.equal(
      G75_WORKSTREAMS.filter((row) => row.status === "IN_PROGRESS").length,
      3,
    );
    assert.match(PROJECT_STATE, /inteligência estatisticamente validada: PENDENTE/);
    assert.match(PROJECT_STATE, /M8: NO-GO/);
  });

  it("grows recurrence sample without using holdout purchases at T", () => {
    const series = g75RecurrenceSeries();
    assert.ok(series.length >= 15);
    const rec = evaluateRecurrence({ series, t: G75_AS_OF, origin_scope: "SYNTHETIC" });
    assert.equal(rec.leakage_count, 0);
    assert.equal(rec.sample_too_small, true);
    assert.ok(rec.high_or_medium < 30);
    assert.ok(rec.series_n >= 15);
    assert.equal(
      holdoutUnused({
        calibrated_on: series.flatMap((s) =>
          s.purchases.filter((p) => p.occurred_at <= G75_AS_OF).map((p) => p.canonical_id),
        ),
        holdout_ids: series.flatMap((s) =>
          s.purchases.filter((p) => p.occurred_at >= "2026-09-01").map((p) => p.canonical_id),
        ),
      }),
      true,
    );
    const fromDb = seriesFromProcurements(
      [
        {
          id: "db1",
          organization_id: "org_x",
          object: "Aquisição de combustível diesel",
          occurred_at: "2026-01-10T00:00:00.000Z",
          estimated_value_num: 10,
          data_origin: "LIVE",
        },
        {
          id: "db2",
          organization_id: "org_x",
          object: "Aquisição de combustível diesel",
          occurred_at: "2026-03-10T00:00:00.000Z",
          estimated_value_num: 11,
          data_origin: "LIVE",
        },
        {
          id: "hold",
          organization_id: "org_x",
          object: "Aquisição de combustível diesel",
          occurred_at: "2026-09-10T00:00:00.000Z",
          estimated_value_num: 12,
          data_origin: "LIVE",
        },
      ],
      G75_AS_OF,
    );
    assert.equal(fromDb.length, 1);
    const merged = mergeRecurrenceSeries(series, fromDb);
    assert.ok(merged.length >= series.length);
    const vis = fromDb[0].purchases.filter((p) => p.occurred_at <= G75_AS_OF);
    assert.equal(vis.some((p) => p.occurred_at >= "2026-09-01"), false);
  });
});


describe("BLL discovery channels", () => {
  const fixturePath = join(
    dirname(fileURLToPath(import.meta.url)),
    "fixtures/bll-direct-buy.html",
  );

  it("does not introduce a BllAdapter and keeps generic-action", () => {
    const adapterSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "connectors/generic-action.ts"),
      "utf8",
    );
    const indexSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "connectors/index.ts"),
      "utf8",
    );
    assert.equal(/class\s+BllAdapter/.test(adapterSource), false);
    assert.equal(/BllAdapter/.test(indexSource), false);
    assert.equal(/Cambará|Ubaíra|Cotia|DirectBuySearchPublic/.test(adapterSource), false);
    assert.match(adapterSource, /GenericActionAdapter/);
  });

  it("maps BLL public routes to three channels without treating the portal as one URL", async () => {
    const { BLL_CHANNEL_STACK, inferDiscoveryChannel } = await import("./discovery-channel.ts");
    assert.equal(BLL_CHANNEL_STACK.length, 3);
    assert.deepEqual(
      BLL_CHANNEL_STACK.map((row) => row.channel_type),
      ["PROCESS", "DIRECT_BUY", "LOCATION"],
    );
    assert.equal(BLL_CHANNEL_STACK.every((row) => row.connector_type === "GENERIC_ACTION"), true);
    assert.equal(BLL_CHANNEL_STACK.find((row) => row.channel_type === "PROCESS")?.readiness, "READY");
    assert.equal(BLL_CHANNEL_STACK.find((row) => row.channel_type === "DIRECT_BUY")?.readiness, "READY");
    assert.equal(BLL_CHANNEL_STACK.find((row) => row.channel_type === "LOCATION")?.readiness, "OBSERVED");
    assert.equal(inferDiscoveryChannel("/Process/ProcessSearchPublic?param1=0"), "PROCESS");
    assert.equal(inferDiscoveryChannel("/DirectBuy/DirectBuySearchPublic"), "DIRECT_BUY");
    assert.equal(inferDiscoveryChannel("/Process/ProcessSearchPublicByLocation"), "LOCATION");
  });

  it("parses DirectBuy HTML via generic-action, preserves param1, extracts DISPENSA/INEXIGIBILIDADE", async () => {
    const html = readFileSync(fixturePath, "utf8");
    const { htmlHasCaptcha, captchaBlocksPagination, inferDiscoveryChannel, channelIdentityKey } = await import(
      "./discovery-channel.ts"
    );
    assert.equal(htmlHasCaptcha(html), true);
    assert.equal(captchaBlocksPagination(html), true);
    assert.match(html, /Não me lembre|ExecuteCaptcha|GetDirectBuyByParams|g-recaptcha/i);

    await withMockFetch(() => ({ body: html }), async () => {
      const adapter = createAdapter(
        {
          connectorType: "GENERIC_ACTION",
          baseUrl: "https://bllcompras.com",
          paths: {
            discover: "/DirectBuy/DirectBuySearchPublic",
            linkPattern: "DirectBuy/DirectBuyView",
          },
          channelType: "DIRECT_BUY",
        },
        "src_bll_platform",
      );
      assert.equal(adapter.constructor.name, "GenericActionAdapter");
      const rows = await collectProcurements(adapter.discover({ limit: 20 }));
      assert.ok(rows.length >= 6);
      assert.equal(rows.every((row) => row.source_channel === "DIRECT_BUY"), true);
      assert.equal(
        rows.every((row) => row.source_url?.includes("/DirectBuy/DirectBuyView?param1=")),
        true,
      );
      assert.equal(
        rows.some((row) => row.external_id === "01/2026" || row.external_id === "DirectBuyView"),
        false,
      );
      const mira = rows.find((row) => /MIRASELVA/i.test(row.organization_name ?? ""));
      assert.ok(mira);
      assert.equal(mira.process_number, "01/2026");
      assert.match(String(mira.external_id), /gkz/i);
      assert.equal(mira.modality, "INEXIGIBILIDADE");
      assert.equal(mira.status, "PUBLICADA");
      const dispensa = rows.filter((row) => row.modality === "DISPENSA");
      const inex = rows.filter((row) => row.modality === "INEXIGIBILIDADE");
      assert.ok(dispensa.length >= 1);
      assert.ok(inex.length >= 1);
      const processTwin = channelIdentityKey({
        source_system_id: "src_bll_platform",
        source_channel: "PROCESS",
        external_id: "01/2026",
      });
      const directTwin = channelIdentityKey({
        source_system_id: "src_bll_platform",
        source_channel: "DIRECT_BUY",
        external_id: mira.external_id,
      });
      assert.notEqual(processTwin, directTwin);
      assert.equal(inferDiscoveryChannel(adapter.config.paths.discover), "DIRECT_BUY");
    });
  });

  it("does not treat CAPTCHA as something to solve and keeps LOCATION pending", async () => {
    const html = readFileSync(fixturePath, "utf8");
    const { neverBypassCaptcha, BLL_CHANNEL_STACK } = await import("./discovery-channel.ts");
    const notes = BLL_CHANNEL_STACK.find((row) => row.channel_type === "DIRECT_BUY")?.captcha_constraint ?? "";
    assert.match(notes, /n[aã]o contornar/i);
    assert.equal(neverBypassCaptcha("Não contornar CAPTCHA. Não resolver token."), true);
    assert.equal(/grecaptcha\.execute|bypass captcha|solve captcha/i.test(html), false);
    const location = BLL_CHANNEL_STACK.find((row) => row.channel_type === "LOCATION");
    assert.equal(location?.readiness, "OBSERVED");
    assert.equal(location?.ingest_status, "NOT_STARTED");
  });
});

describe("PNCP public edital URL", () => {
  it("builds the official /app/editais/{cnpj}/{ano}/{sequencialCompra} pattern", async () => {
    const {
      pncpEditalUrl,
      pncpControl,
      isPncpEditalUrl,
      parseNumeroControlePncp,
      toPublicPncpUrl,
      PNCP_OFFICIAL_NAME,
      PNCP_EDITAL_EXAMPLE,
    } = await import("./pncp-url.ts");
    const example = "https://pncp.gov.br/app/editais/10572048000128/2026/1272";
    assert.equal(PNCP_EDITAL_EXAMPLE, example);
    assert.equal(PNCP_OFFICIAL_NAME, "Portal Nacional de Contratações Públicas");
    assert.equal(
      pncpEditalUrl("10572048000128-1-001272/2026"),
      example,
    );
    assert.equal(pncpEditalUrl(example), example);
    assert.equal(
      pncpEditalUrl(pncpControl({ cnpj: "10572048000128", unidade: 1, numero: 1272, ano: 2026 })),
      example,
    );
    assert.equal(
      pncpEditalUrl({
        cnpj: "10572048000128",
        anoCompra: 2026,
        sequencialCompra: 1272,
      }),
      example,
    );
    assert.equal(isPncpEditalUrl(example), true);
    assert.equal(isPncpEditalUrl("https://pncp.gov.br/app/editais/pncp-m7_office"), false);
    assert.equal(pncpEditalUrl("pncp-m7_office"), null);
    assert.equal(pncpEditalUrl("00000000000000-1-001025/2026"), null);
    assert.equal(
      pncpEditalUrl(
        "https://pncp.gov.br/pncp-api/v1/orgaos/75442756000190/compras/2026/17/arquivos/2",
      ),
      "https://pncp.gov.br/app/editais/75442756000190/2026/17",
    );
    assert.equal(
      toPublicPncpUrl(
        "https://pncp.gov.br/pncp-api/v1/orgaos/75442756000190/compras/2026/17/arquivos/2",
      ),
      "https://pncp.gov.br/app/editais/75442756000190/2026/17",
    );
    assert.equal(
      toPublicPncpUrl("https://pncp.gov.br/pncp-api/v1/orgaos/00000000000000/compras/2026/1"),
      null,
    );
    assert.equal(
      toPublicPncpUrl("https://bllcompras.com/Process/ProcessSearchPublic?param1=0"),
      "https://bllcompras.com/Process/ProcessSearchPublic?param1=0",
    );
    assert.equal(toPublicPncpUrl("https://pncp.gov.br/app/editais"), "https://pncp.gov.br/app/editais");
    const parsed = parseNumeroControlePncp(
      "https://pncp.gov.br/pncp-api/v1/orgaos/75442756000190/compras/2026/5/arquivos/1",
    );
    assert.equal(parsed?.cnpj, "75442756000190");
    assert.equal(parsed?.ano, "2026");
    assert.equal(parsed?.numero, "000005");
  });

  it("prefers the public edital URL over the consulta API listing", async () => {
    const { applyNormalization } = await import("./connectors/contract.ts");
    const row = applyNormalization(
      {
        numeroControlePNCP: "75442756000190-1-001001/2026",
        cnpj: "75442756000190",
        anoCompra: 2026,
        sequencialCompra: 1001,
        objetoCompra: "Aquisição de material",
      },
      undefined,
      "src_br_pncp",
      "https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao",
    );
    assert.equal(
      row.source_url,
      "https://pncp.gov.br/app/editais/75442756000190/2026/1001",
    );
    assert.equal(row.external_id, "75442756000190-1-001001/2026");
    const local = applyNormalization(
      { processo: "01/2026", objeto: "Serviço local", url: "https://bllcompras.com/Process/ProcessView?id=1" },
      undefined,
      "src_bll_platform",
      "https://bllcompras.com/Process/ProcessSearchPublic?param1=0",
    );
    assert.equal(local.source_url, "https://bllcompras.com/Process/ProcessView?id=1");
  });
});
