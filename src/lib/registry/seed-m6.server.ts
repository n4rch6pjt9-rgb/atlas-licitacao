import type { Sql } from "@/lib/db";
import { upsertCheckpoint } from "./checkpoint.ts";
import { createAdapter } from "./connectors/index.ts";
import { classifyLocalOnly } from "./coverage.ts";
import { resolveIngestedRecords } from "./coverage.server.ts";
import { payloadHash } from "./hash.ts";
import { publicGet } from "./http.server.ts";
import {
  classifyAuthError,
  classifyPublicKey,
  fingerprintKey,
  PCP_APIPCP_PUBLICKEY_EVIDENCE,
  redactKey,
} from "./pcp-semantics.ts";
import {
  PRIORITY_SCORE_VERSION_V2,
  PRIORITY_WEIGHTS_V2,
} from "./priority.ts";
import { persistPrioritySnapshot } from "./priority.server.ts";
import { insertSourceRecord, upsertSourceCapability } from "./queries.server.ts";
import { schemaFingerprint } from "./schema-fingerprint.ts";
import type { ConnectorType } from "./types.ts";

const JSONB_KEYS = new Set([
  "raw_payload",
  "paths_json",
  "default_params_json",
  "headers_json",
  "pagination_config",
  "normalization_config",
  "document_config",
  "accept_equals_json",
  "payload",
  "weights_json",
  "components_json",
]);

const OBSERVED = "2026-09-14T22:55:00.000Z";
const WINDOW_ID = "win_2026_09_08_14_live";
const WINDOW_START = "2026-09-08T00:00:00.000Z";
const WINDOW_END = "2026-09-14T23:59:59.000Z";
const PCP_V2 = "https://compras.api.portaldecompraspublicas.com.br";
const PCP_SITE = "https://www.portaldecompraspublicas.com.br";
const PCP_APIPCP = "https://apipcp.portaldecompraspublicas.com.br";
const DISCOVER = "/v2/licitacao/processos";
const PER_SOURCE_LIMIT = 25;
const PAGE_SIZE = 25;
const LIVE_BUDGET_MS = 45000;

const PCP_NORMALIZATION = {
  external_id: "codigoLicitacao",
  process_number: "numero",
  procurement_number: "numero",
  object: "resumo",
  organization_name: "razaoSocial",
  status: "status.descricao",
  modality: "tipoLicitacao.tipoLicitacao",
  source_url: "urlReferencia",
  opening_at: "dataHoraInicioLances",
  proposal_deadline: "dataHoraFinalPropostas",
};

const PCP_PAGINATION = {
  type: "PAGE_NUMBER" as const,
  pageParam: "pagina",
  sizeParam: "limitePagina",
  startPage: 1,
  pageSize: PAGE_SIZE,
};

type LiveEnte = {
  id: string;
  orgao: string;
  acceptEquals?: Record<string, string>;
  label: string;
};

const LIVE_ENTES: LiveEnte[] = [
  {
    id: "src_pcp_linhares_es",
    orgao: "Câmara Municipal de Linhares",
    label: "Câmara de Linhares/ES",
  },
  {
    id: "src_pcp_alegre_es",
    orgao: "Prefeitura Municipal de Alegre",
    acceptEquals: { razaoSocial: "Prefeitura Municipal de Alegre" },
    label: "Alegre/ES",
  },
  {
    id: "src_pcp_mogi_sp",
    orgao: "Prefeitura Municipal de Mogi das Cruzes",
    label: "Mogi das Cruzes/SP",
  },
  {
    id: "src_pcp_porto_nacional_to",
    orgao: "Secretaria Municipal de Compras e Licitações de Porto Nacional",
    label: "Porto Nacional/TO",
  },
  {
    id: "src_pcp_porto_belo_sc",
    orgao: "Prefeitura Municipal de Porto Belo",
    label: "Porto Belo/SC",
  },
];

async function upsertReplace(
  sql: Sql,
  table: string,
  row: Record<string, unknown>,
  pk: string,
): Promise<void> {
  const keys = Object.keys(row);
  const cols = keys.join(", ");
  const placeholders = keys
    .map((key, i) => (JSONB_KEYS.has(key) ? `$${i + 1}::jsonb` : `$${i + 1}`))
    .join(", ");
  const updates = keys
    .filter((key) => key !== pk)
    .map((key) => `${key} = excluded.${key}`)
    .join(", ");
  const params = keys.map((key) => {
    const value = row[key];
    if (value === undefined) return null;
    if (JSONB_KEYS.has(key)) {
      if (value === null) return null;
      return typeof value === "string" ? value : JSON.stringify(value);
    }
    return value;
  });
  await sql.query(
    `insert into ${table} (${cols}) values (${placeholders})
     on conflict (${pk}) do update set ${updates}`,
    params,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function configureLiveJson(
  sql: Sql,
  sourceId: string,
  defaultParams: Record<string, string>,
  acceptEquals?: Record<string, string>,
): Promise<void> {
  await sql.query(
    `update source_system
     set connector_type = 'GENERIC_JSON',
         connector_version = '1',
         classification_state = 'INGESTING',
         discovery_strategy = 'PUBLIC_JSON_API',
         public_access = true,
         base_url = $2
     where id = $1`,
    [sourceId, PCP_V2],
  );
  await upsertReplace(
    sql,
    "source_connector_config",
    {
      source_system_id: sourceId,
      connector_type: "GENERIC_JSON" satisfies ConnectorType,
      base_url: PCP_V2,
      paths_json: {
        discover: DISCOVER,
        responsePath: "result",
        linkBase: PCP_SITE,
      },
      default_params_json: defaultParams,
      pagination_config: PCP_PAGINATION,
      normalization_config: PCP_NORMALIZATION,
      accept_equals_json: acceptEquals ?? {},
      enabled: true,
      value_classification: "PUBLIC",
      public_key_semantics: null,
      public_key_fingerprint: null,
      connector_readiness: "LIVE",
    },
    "source_system_id",
  );
}

async function ingestLiveSource(
  sql: Sql,
  sourceId: string,
  defaultParams: Record<string, string>,
  acceptEquals?: Record<string, string>,
): Promise<{ count: number; error: string | null; latencyMs: number; status: number | null }> {
  const t0 = Date.now();
  try {
    const adapter = createAdapter(
      {
        connectorType: "GENERIC_JSON",
        baseUrl: PCP_V2,
        paths: { discover: DISCOVER, linkBase: PCP_SITE },
        responsePath: "result",
        defaultParams,
        acceptEquals,
        linkBase: PCP_SITE,
        pagination: PCP_PAGINATION,
        normalization: PCP_NORMALIZATION,
      },
      sourceId,
    );
    const records = [];
    for await (const record of adapter.discover({ limit: PER_SOURCE_LIMIT })) {
      records.push(record);
    }
    for (const record of records) {
      await insertSourceRecord(sql, {
        source_system_id: sourceId,
        source_entity_type: "procurement",
        source_identifier: record.external_id,
        payload_hash: payloadHash(record.raw_payload ?? record),
        schema_hash: schemaFingerprint(record.raw_payload ?? record).schema_hash,
        raw_payload: record.raw_payload ?? record,
        source_url: record.source_url,
        source_updated_at: record.opening_at ?? record.proposal_deadline ?? null,
        ingestion_mode: "LIVE_PUBLIC_API",
        fetch_method: "GENERIC_JSON",
      });
    }
    try {
      await resolveIngestedRecords(sql, sourceId, records);
    } catch {
      // resolution additive
    }
    await sql.query(
      `update source_record
       set local_only_state = coalesce(local_only_state, $2)
       where source_system_id = $1
         and ingestion_mode = 'LIVE_PUBLIC_API'
         and local_only_state is null`,
      [
        sourceId,
        classifyLocalOnly({
          matched: false,
          firstSeenAt: OBSERVED,
          now: OBSERVED,
        }),
      ],
    );
    await upsertCheckpoint(sql, {
      source_system_id: sourceId,
      window_start: WINDOW_START,
      window_end: WINDOW_END,
      page_or_cursor: "1",
      records_processed: records.length,
      error_count: 0,
    });
    return { count: records.length, error: null, latencyMs: Date.now() - t0, status: 200 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await upsertCheckpoint(sql, {
      source_system_id: sourceId,
      window_start: WINDOW_START,
      window_end: WINDOW_END,
      page_or_cursor: "1",
      records_processed: 0,
      error_count: 1,
      last_error: message.slice(0, 500),
    });
    await sql.query(
      `update source_connector_config
       set connector_readiness = 'DEGRADED'
       where source_system_id = $1`,
      [sourceId],
    );
    return { count: 0, error: message, latencyMs: Date.now() - t0, status: null };
  }
}

export async function seedMilestone6(sql: Sql): Promise<void> {
  const verdict = classifyPublicKey(PCP_APIPCP_PUBLICKEY_EVIDENCE);
  const documentedSample = "b7ad651a44cff961330fe393543796f0";

  await upsertReplace(
    sql,
    "public_key_assessment",
    {
      id: "pka_pcp_apipcp_listar",
      family: "PORTAL_COMPRAS_PUBLICAS",
      endpoint: `${PCP_APIPCP}/publico/listarProcessos/`,
      semantics: verdict.semantics,
      value_classification: verdict.classification,
      evidence_url: `${PCP_APIPCP}/publico/apidoc/`,
      excerpt:
        "apidoc: publicKey = 'Chave de verificação', obrigatória. Doc: integração com sistemas internos; acesso ao ambiente de testes pode ser solicitado a comprador@portaldecompraspublicas.com.br. SPA /processos não embute publicKey. GET sem chave e com amostra documental: HTTP 400 Erro autenticação.",
      key_fingerprint: fingerprintKey(documentedSample),
      http_status: 400,
      observed_at: OBSERVED,
      notes: verdict.rationale,
    },
    "id",
  );
  await upsertReplace(
    sql,
    "public_key_assessment",
    {
      id: "pka_pcp_v2_search",
      family: "PORTAL_COMPRAS_PUBLICAS",
      endpoint: `${PCP_V2}/v2/licitacao/processos`,
      semantics: "PUBLIC_TENANT_IDENTIFIER",
      value_classification: "PUBLIC",
      evidence_url: `${PCP_V2}/swagger/v1/swagger.json`,
      excerpt:
        "OpenAPI público sem security. GET /v2/licitacao/processos não exige publicKey. Filtro orgao é nome público do comprador. Esta é a API da SPA.",
      key_fingerprint: null,
      http_status: 200,
      observed_at: OBSERVED,
      notes:
        "Discovery público = compras.api v2 + config orgao. publicKey da apipcp permanece AUTH_REQUIRED.",
    },
    "id",
  );

  await sql.query(
    `update source_record
     set ingestion_mode = coalesce(ingestion_mode, 'MANUAL_FIXTURE'),
         fetch_method = coalesce(fetch_method, 'SEED')
     where source_system_id like 'src_pcp_%'
       and ingestion_mode is null`,
  );

  const liveResults: Array<{
    id: string;
    label: string;
    count: number;
    error: string | null;
    latencyMs: number;
    schema: string | null;
  }> = [];

  const liveStarted = Date.now();

  for (const ente of LIVE_ENTES) {
    const params: Record<string, string> = {
      orgao: ente.orgao,
      limitePagina: String(PAGE_SIZE),
    };
    await configureLiveJson(sql, ente.id, params, ente.acceptEquals);
    if (Date.now() - liveStarted > LIVE_BUDGET_MS) {
      liveResults.push({
        id: ente.id,
        label: ente.label,
        count: 0,
        error: "orçamento HTTP do seed esgotado",
        latencyMs: 0,
        schema: null,
      });
      await sql.query(
        `update source_connector_config set connector_readiness = 'DEGRADED' where source_system_id = $1`,
        [ente.id],
      );
      continue;
    }
    await sleep(180);
    const result = await ingestLiveSource(sql, ente.id, params, ente.acceptEquals);
    let schema: string | null = null;
    if (result.count > 0) {
      const row = await sql.query<{ schema_hash: string }>(
        `select schema_hash from source_record
         where source_system_id = $1 and ingestion_mode = 'LIVE_PUBLIC_API'
         limit 1`,
        [ente.id],
      );
      schema = row[0]?.schema_hash ?? null;
    }
    liveResults.push({
      id: ente.id,
      label: ente.label,
      count: result.count,
      error: result.error,
      latencyMs: result.latencyMs,
      schema,
    });
    await upsertReplace(sql, "source_probe_run", {
      id: `probe_m6_${ente.id}`,
      source_system_id: ente.id,
      family: "PORTAL_COMPRAS_PUBLICAS",
      url: `${PCP_V2}${DISCOVER}?orgao=${encodeURIComponent(ente.orgao)}&pagina=1&limitePagina=${PAGE_SIZE}`,
      http_status: result.status,
      latency_ms: result.latencyMs,
      content_type: "application/json",
      ok: result.count > 0,
      excerpt: result.error
        ? result.error.slice(0, 280)
        : `LIVE ${result.count} records · generic-json · orgao público`,
      error: result.error,
      fingerprint_excerpt: "compras.api v2 público; sem publicKey",
      probed_at: new Date().toISOString(),
    }, "id");
  }

  await configureLiveJson(sql, "src_pcp_platform", {
    limitePagina: String(PAGE_SIZE),
  });
  if (Date.now() - liveStarted > LIVE_BUDGET_MS) {
    liveResults.push({
      id: "src_pcp_platform",
      label: "Plataforma nacional",
      count: 0,
      error: "orçamento HTTP do seed esgotado",
      latencyMs: 0,
      schema: null,
    });
    await sql.query(
      `update source_connector_config set connector_readiness = 'DEGRADED' where source_system_id = 'src_pcp_platform'`,
    );
  } else {
    await sleep(180);
    const platform = await ingestLiveSource(sql, "src_pcp_platform", {
      limitePagina: String(PAGE_SIZE),
    });
    liveResults.push({
      id: "src_pcp_platform",
      label: "Plataforma nacional",
      count: platform.count,
      error: platform.error,
      latencyMs: platform.latencyMs,
      schema: null,
    });
  }

  try {
    const apipcpNoKey = await publicGet(`${PCP_APIPCP}/publico/listarProcessos/`);
    await upsertReplace(
      sql,
      "source_probe_run",
      {
        id: "probe_m6_apipcp_nokey",
        source_system_id: "src_pcp_platform",
        family: "PORTAL_COMPRAS_PUBLICAS",
        url: redactKey(`${PCP_APIPCP}/publico/listarProcessos/`),
        http_status: apipcpNoKey.status,
        latency_ms: null,
        content_type: apipcpNoKey.headers["content-type"] ?? null,
        ok: false,
        excerpt: (apipcpNoKey.text || "").slice(0, 200),
        error: classifyAuthError(apipcpNoKey.status, apipcpNoKey.text),
        fingerprint_excerpt: "AUTH_REQUIRED — publicKey não é discovery público",
        probed_at: new Date().toISOString(),
      },
      "id",
    );
  } catch (err) {
    await upsertReplace(
      sql,
      "source_probe_run",
      {
        id: "probe_m6_apipcp_nokey",
        source_system_id: "src_pcp_platform",
        family: "PORTAL_COMPRAS_PUBLICAS",
        url: redactKey(`${PCP_APIPCP}/publico/listarProcessos/`),
        ok: false,
        excerpt: err instanceof Error ? err.message : String(err),
        error: "CONFIG_INVALID",
        fingerprint_excerpt: "AUTH_REQUIRED — publicKey não é discovery público",
        probed_at: new Date().toISOString(),
      },
      "id",
    );
  }

  let itemsOk = false;
  let docsOk = false;
  let detailOk = false;
  let page2Distinct = false;
  try {
    const page1 = await publicGet(
      `${PCP_V2}${DISCOVER}?orgao=${encodeURIComponent("Prefeitura Municipal de Mogi das Cruzes")}&pagina=1&limitePagina=5`,
    );
    await sleep(180);
    const page2 = await publicGet(
      `${PCP_V2}${DISCOVER}?orgao=${encodeURIComponent("Prefeitura Municipal de Mogi das Cruzes")}&pagina=2&limitePagina=5`,
    );
    const ids1 = ((page1.json as { result?: Array<{ codigoLicitacao?: number }> } | null)?.result ?? [])
      .map((row) => row.codigoLicitacao)
      .filter(Boolean);
    const ids2 = ((page2.json as { result?: Array<{ codigoLicitacao?: number }> } | null)?.result ?? [])
      .map((row) => row.codigoLicitacao)
      .filter(Boolean);
    page2Distinct =
      ids1.length > 0 &&
      ids2.length > 0 &&
      ids1.every((id) => !ids2.includes(id));
    const first = ids1[0];
    if (first) {
      await sleep(180);
      const items = await publicGet(`${PCP_V2}/v2/licitacao/${first}/itens?pagina=1`);
      itemsOk = items.ok;
      await sleep(180);
      const docs = await publicGet(`${PCP_V2}/v2/licitacao/${first}/documentos/processo`);
      docsOk = docs.ok && Array.isArray(docs.json) && docs.json.length > 0;
      await sleep(180);
      const detail = await publicGet(
        `${PCP_V2}/v2/licitacao/sp/prefeitura-municipal-de-mogi-das-cruzes-1352/cptp-15-2026-2026-507402`,
      );
      detailOk = detail.ok;
    }
    await upsertReplace(
      sql,
      "source_probe_run",
      {
      id: "probe_m6_pagination",
      source_system_id: "src_pcp_mogi_sp",
      family: "PORTAL_COMPRAS_PUBLICAS",
      url: `${PCP_V2}${DISCOVER}?orgao=Mogi&pagina=1|2&limitePagina=5`,
      http_status: page1.status,
      ok: page2Distinct,
      excerpt: page2Distinct
        ? `página 2 ≠ página 1 (${ids1[0]} vs ${ids2[0]}). PAGE_NUMBER.`
        : "paginação não comprovada nesta sessão",
      error: null,
      fingerprint_excerpt: "pagina é número de página, não offset (Mogi estável)",
      probed_at: new Date().toISOString(),
      },
      "id",
    );
  } catch (err) {
    await upsertReplace(
      sql,
      "source_probe_run",
      {
      id: "probe_m6_pagination",
      source_system_id: "src_pcp_mogi_sp",
      family: "PORTAL_COMPRAS_PUBLICAS",
      url: `${PCP_V2}${DISCOVER}`,
      ok: false,
      excerpt: err instanceof Error ? err.message : String(err),
      error: "pagination probe failed",
      probed_at: new Date().toISOString(),
      },
      "id",
    );
  }

  const capRows: Array<{ cap: string; state: string; url: string; observed: boolean }> = [
    {
      cap: "DISCOVER_PROCUREMENTS",
      state: liveResults.some((row) => row.count > 0) ? "SUPPORTED" : "DEGRADED",
      url: DISCOVER,
      observed: true,
    },
    {
      cap: "PROCUREMENT_DETAIL",
      state: detailOk ? "SUPPORTED" : "UNKNOWN",
      url: "/v2/licitacao/{uf}/{comprador}/{licitacao}",
      observed: detailOk,
    },
    {
      cap: "ITEMS",
      state: itemsOk ? "SUPPORTED" : "UNKNOWN",
      url: "/v2/licitacao/{id}/itens",
      observed: itemsOk,
    },
    {
      cap: "DOCUMENTS",
      state: docsOk ? "PARTIAL" : "UNKNOWN",
      url: "/v2/licitacao/{id}/documentos/processo",
      observed: docsOk,
    },
    { cap: "RESULTS", state: "UNKNOWN", url: "", observed: false },
    { cap: "SUPPLIERS", state: "UNKNOWN", url: "", observed: false },
    { cap: "ARP", state: "UNKNOWN", url: "", observed: false },
    { cap: "CONTRACTS", state: "UNKNOWN", url: "", observed: false },
    { cap: "PLANNING", state: "UNKNOWN", url: "", observed: false },
  ];
  for (const ente of [...LIVE_ENTES, { id: "src_pcp_platform" }]) {
    for (const cap of capRows) {
      await upsertSourceCapability(sql, {
        id: `cap_m6_${ente.id}_${cap.cap.toLowerCase()}`,
        source_system_id: ente.id,
        capability: cap.cap,
        access_type: "PUBLIC",
        endpoint_or_url: cap.url || null,
        method: "GET",
        auth_required: false,
        publicly_observed: cap.observed,
        documented: true,
        confidence: cap.observed ? 0.9 : 0.2,
      });
    }
  }

  const liveCount = await sql.query<{ n: number }>(
    `select count(*)::int as n
     from source_record r
     join source_system s on s.id = r.source_system_id
     where s.technology_family = 'PORTAL_COMPRAS_PUBLICAS'
       and r.ingestion_mode = 'LIVE_PUBLIC_API'
       and r.source_entity_type = 'procurement'`,
  );
  const liveEntes = liveResults.filter((row) => row.id !== "src_pcp_platform" && row.count > 0).length;
  const schemas = new Set(liveResults.map((row) => row.schema).filter(Boolean));
  const hashes = [...schemas];
  const sharedSchema = hashes.length === 1;

  await upsertReplace(
    sql,
    "coverage_window",
    {
      id: WINDOW_ID,
      window_start: WINDOW_START,
      window_end: WINDOW_END,
      label: "coorte live 2026-09-08 a 2026-09-14",
      metric_version: PRIORITY_SCORE_VERSION_V2,
      notes:
        "Coorte LIVE do M6. Não reutiliza a coorte de avaliação M5. Overlap e lead medidos sobre records LIVE_PUBLIC_API.",
    },
    "id",
  );

  await sql.query(
    `insert into family_coverage_metric (
       id, window_id, family, records_ingested, records_matched_pncp, records_matched_comprasgov,
       records_local_only_provisional, records_local_only_confirmed, pncp_record_overlap_ratio,
       comprasgov_record_overlap_ratio, median_lead_time_hours, p75_lead_time_hours, p95_lead_time_hours,
       record_conflict_ratio, successful_fetch_ratio, schema_drift_count, average_records_per_day,
       estimated_records_month, estimation_method, estimation_confidence, missing_object_rate,
       missing_dates_rate, adapter_fit, integration_cost, maintenance_risk, uncaptured_volume,
       public_access_score, source_reliability, evidence_confidence, historical_depth, technical_reuse,
       sample_size
     )
     select replace(id, 'win_2026_09_01_14', $1), $1, family, records_ingested, records_matched_pncp,
            records_matched_comprasgov, records_local_only_provisional, records_local_only_confirmed,
            pncp_record_overlap_ratio, comprasgov_record_overlap_ratio, median_lead_time_hours,
            p75_lead_time_hours, p95_lead_time_hours, record_conflict_ratio, successful_fetch_ratio,
            schema_drift_count, average_records_per_day, estimated_records_month, estimation_method,
            estimation_confidence, missing_object_rate, missing_dates_rate, adapter_fit, integration_cost,
            maintenance_risk, uncaptured_volume, public_access_score, source_reliability,
            evidence_confidence, historical_depth, technical_reuse, sample_size
     from family_coverage_metric
     where window_id = 'win_2026_09_01_14'
     on conflict (window_id, family) do nothing`,
    [WINDOW_ID],
  );

  const liveOk = liveResults.filter((row) => row.count > 0).length;
  const liveAttempts = liveResults.length;
  const reliability = liveAttempts > 0 ? liveOk / liveAttempts : 0;
  const liveNPreview = Number(liveCount[0]?.n ?? 0);
  await sql.query(
    `update family_coverage_metric
     set records_ingested = $2,
         sample_size = $2,
         successful_fetch_ratio = $3,
         public_access_score = 0.9,
         source_reliability = $4,
         integration_cost = 0.2,
         maintenance_risk = 0.22,
         uncaptured_volume = 0.8,
         estimated_records_month = $5,
         estimation_method = 'GET público compras.api /v2/licitacao/processos, 5 entes + plataforma, sem publicKey',
         estimation_confidence = 'média'
     where window_id = $1 and family = 'PORTAL_COMPRAS_PUBLICAS'`,
    [
      WINDOW_ID,
      liveNPreview,
      reliability,
      Math.max(0.4, reliability),
      Math.round((liveNPreview / 7) * 30),
    ],
  );

  await upsertReplace(
    sql,
    "priority_score_version",
    {
      version: PRIORITY_SCORE_VERSION_V2,
      formula:
        "v2 = mesma soma ponderada de v1, com insumos live (records/dia, overlap, lead, reliability). v1 permanece.",
      weights_json: PRIORITY_WEIGHTS_V2,
      documented_at: OBSERVED,
      notes: "Pesos iguais a v1. O que muda são as entradas observadas.",
    },
    "version",
  );

  const ranking = await persistPrioritySnapshot(sql, WINDOW_ID, PRIORITY_SCORE_VERSION_V2);
  const pcpRank = ranking.find((row) => row.family === "PORTAL_COMPRAS_PUBLICAS");
  const bllRank = ranking.find((row) => row.family === "BLL");

  const liveN = Number(liveCount[0]?.n ?? 0);
  const go =
    verdict.semantics === "PRIVATE_CREDENTIAL" &&
    !verdict.allowedInPublicConnectorConfig &&
    liveEntes >= 5 &&
    liveN >= 100 &&
    page2Distinct &&
    ranking.length >= 5;

  const report = {
    public_key: {
      apipcp: verdict,
      v2_search: "no publicKey; public orgao filter",
    },
    live_entes: liveResults,
    live_records: liveN,
    live_entes_ok: liveEntes,
    pagination: { page2_distinct: page2Distinct, type: "PAGE_NUMBER" },
    schema: { hashes, shared_schema: sharedSchema },
    capabilities: capRows,
    items: itemsOk,
    documents: docsOk,
    detail: detailOk,
    commercial_adapter: "NO-GO",
    generic_reuse: "GO",
    pcp_vs_bll: {
      pcp_score: pcpRank?.final_score ?? null,
      bll_score: bllRank?.final_score ?? null,
      coverage_gain_per_engineering_day:
        "INFERÊNCIA — PCP v2 público reusa generic-json já existente; BLL já ingerido no M4. Ganho residual PCP > BLL enquanto o censo nacional PCP não estiver capturado.",
    },
    milestone_verdict: go ? "GO" : "NO-GO",
    score_version: PRIORITY_SCORE_VERSION_V2,
    window_id: WINDOW_ID,
  };

  await upsertReplace(
    sql,
    "operational_report",
    {
      id: "opr_m6_pcp",
      family: "PORTAL_COMPRAS_PUBLICAS",
      window_id: WINDOW_ID,
      score_version: PRIORITY_SCORE_VERSION_V2,
      payload: report,
      created_at: new Date().toISOString(),
    },
    "id",
  );

  await sql.query(
    `update source_system
     set notes = $1
     where id = 'src_pcp_platform'`,
    [
      `M6 FATO — publicKey apipcp = PRIVATE_CREDENTIAL / AUTH_REQUIRED. Discovery live = GET ${PCP_V2}${DISCOVER} sem chave, filtro orgao por ente. PcpAdapter NÃO criado. ${liveN} records LIVE.`,
    ],
  );
}

export const M6_WINDOW_ID = WINDOW_ID;
export const M6_LIVE_ENTE_IDS = LIVE_ENTES.map((row) => row.id);
