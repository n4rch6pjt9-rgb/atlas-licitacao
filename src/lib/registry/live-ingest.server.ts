/**
 * Gate 7.5 live ingest. Uses public GET only, existing PNCP/Compras.gov paths.
 * Budget-capped. Never runs on home seed. Origin = LIVE.
 */
import type { Sql } from "@/lib/db";
import { payloadHash } from "./hash.ts";
import { publicGet } from "./http.server.ts";
import { extractJsonRecords } from "./connectors/generic-json.ts";
import { normalizeObject } from "./object-normalize.ts";
import { arpSignals, resolveOrgIdentity } from "./org-identity.ts";
import { schemaFingerprint } from "./schema-fingerprint.ts";
import { insertSourceRecord } from "./queries.server.ts";
import { pncpEditalUrl } from "./pncp-url.ts";

export const LIVE_INGEST_BUDGET_MS = 22_000;
export const G75_NOW = "2026-09-14T21:00:00.000Z";

const PCA_ORGS = [
  { cnpj: "82575812000120", name: "MUNICIPIO DE PORTO BELO", seq: 9 },
  { cnpj: "46523270000188", name: "MUNICIPIO DE MOGI DAS CRUZES", seq: null },
  { cnpj: "00394460000141", name: "MINISTERIO DA FAZENDA", seq: 1 },
] as const;

function str(row: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return null;
}

function num(row: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = row[key];
    if (value == null || value === "") continue;
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function remaining(deadline: number): number {
  return deadline - Date.now();
}

async function checkpoint(
  sql: Sql,
  args: {
    id: string;
    source_kind: string;
    status: string;
    http_status?: number | null;
    rows?: number;
    source_url?: string;
    error?: string | null;
    payload?: unknown;
  },
): Promise<void> {
  await sql.query(
    `insert into live_ingest_checkpoint (
       id, source_kind, status, http_status, rows_ingested, source_url, error, fetched_at, payload
     ) values ($1,$2,$3,$4,$5,$6,$7,now(),$8::jsonb)
     on conflict (source_kind) do update set
       status = excluded.status,
       http_status = excluded.http_status,
       rows_ingested = excluded.rows_ingested,
       source_url = excluded.source_url,
       error = excluded.error,
       fetched_at = excluded.fetched_at,
       payload = excluded.payload`,
    [
      args.id,
      args.source_kind,
      args.status,
      args.http_status ?? null,
      args.rows ?? 0,
      args.source_url ?? null,
      args.error ?? null,
      JSON.stringify(args.payload ?? null),
    ],
  );
}

async function putSource(
  sql: Sql,
  args: {
    source_system_id: string;
    entity_type: string;
    identifier: string;
    payload: unknown;
    url: string;
  },
): Promise<string> {
  const publicUrl =
    args.entity_type === "procurement" ? pncpEditalUrl(args.identifier) : null;
  const id = await insertSourceRecord(sql, {
    source_system_id: args.source_system_id,
    source_entity_type: args.entity_type,
    source_identifier: args.identifier,
    payload_hash: payloadHash(args.payload),
    raw_payload: args.payload,
    source_url: publicUrl ?? args.url,
    schema_hash: schemaFingerprint(args.payload).schema_hash,
    ingestion_mode: "LIVE_PUBLIC_API",
    fetch_method: "GET",
    data_origin: "LIVE",
  });
  return id;
}

export type LiveIngestSummary = {
  started_at: string;
  finished_at: string;
  budget_ms: number;
  skipped: string[];
  pca_consolidado: number;
  pca_items: number;
  pgc_items: number;
  arp_rows: number;
  contratacoes: number;
  errors: string[];
};

export async function runLiveIngest(sql: Sql, now = G75_NOW): Promise<LiveIngestSummary> {
  const started = new Date().toISOString();
  const deadline = Date.now() + LIVE_INGEST_BUDGET_MS;
  const skipped: string[] = [];
  const errors: string[] = [];
  let pcaConsolidado = 0;
  let pcaItems = 0;
  let pgcItems = 0;
  let arpRows = 0;
  let contratacoes = 0;

  async function get(url: string, kind: string): Promise<unknown | null> {
    if (remaining(deadline) < 1500) {
      skipped.push(kind);
      await checkpoint(sql, {
        id: `ck_${kind}`,
        source_kind: kind,
        status: "SKIPPED_BUDGET",
        source_url: url,
        error: "budget",
      });
      return null;
    }
    try {
      const left = Math.max(500, remaining(deadline));
      const res = await Promise.race([
        publicGet(url),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("budget")), left);
        }),
      ]);
      if (!res.ok) {
        errors.push(`${kind} HTTP ${res.status}`);
        await checkpoint(sql, {
          id: `ck_${kind}`,
          source_kind: kind,
          status: "HTTP_ERROR",
          http_status: res.status,
          source_url: url,
          error: `HTTP ${res.status}`,
          payload: { excerpt: res.text.slice(0, 240) },
        });
        return null;
      }
      return res.json ?? (res.text ? JSON.parse(res.text) : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${kind} ${message}`);
      await checkpoint(sql, {
        id: `ck_${kind}`,
        source_kind: kind,
        status: "ERROR",
        source_url: url,
        error: message,
      });
      return null;
    }
  }

  {
    const url =
      "https://dadosabertos.compras.gov.br/modulo-pgc/1_consultarPgcDetalhe?orgao=00394460000141&anoPcaProjetoCompra=2026&pagina=1&tamanhoPagina=10";
    const payload = await get(url, "pgc_fazenda_2026");
    if (payload) {
      const records = extractJsonRecords(payload, "resultado");
      let n = 0;
      for (const raw of records) {
        const row = asRecord(raw);
        const object = str(row, "descricaoObjetoDfd", "descricaoItemCatalogo") ?? "Item PGC";
        const ident = `pgc-live-00394460000141-2026-${str(row, "numeroArtefato")}-${str(row, "ordemDfd")}-${n}`;
        const planId = `plan_live_pgc_${str(row, "numeroArtefato")}_${str(row, "ordemDfd")}_${n}`;
        const orgIdent = resolveOrgIdentity({
          display_name: str(row, "nomeUasg") ?? "Fazenda",
          cnpj: str(row, "orgao") ?? "00394460000141",
          uasg: str(row, "codigoUasg"),
        });
        await sql.query(
          `insert into organization_identity (id, display_name, cnpj, uasg, identity_method, identity_status, observed_at)
           values ($1,$2,$3,$4,$5,$6,now()) on conflict (id) do nothing`,
          [
            orgIdent.id,
            orgIdent.display_name,
            orgIdent.cnpj,
            orgIdent.uasg ?? null,
            orgIdent.identity_method,
            orgIdent.identity_status,
          ],
        );
        await putSource(sql, {
          source_system_id: "src_br_comprasgov",
          entity_type: "pgc_item",
          identifier: ident,
          payload: row,
          url,
        });
        await sql.query(
          `insert into planning_record (
             id, origin_type, source_system_id, source_identifier, organization_id, organization_name,
             organization_cnpj, year, catalog_code, catalog_type, object, raw_object, normalized_object,
             estimated_value_num, item_number, status, valid_from, observed_at, data_origin
           ) values ($1,'PGC_COMPRASGOV','src_br_comprasgov',$2,$3,$4,$5,$6,$7,'CATALOGO',$8,$8,$9,$10,$11,'ATIVO',now(),now(),'LIVE')
           on conflict (source_system_id, source_identifier) do update set object = excluded.object, data_origin = 'LIVE'`,
          [
            planId,
            ident,
            orgIdent.id,
            str(row, "nomeUasg"),
            str(row, "orgao") ?? "00394460000141",
            num(row, "anoArtefato") ?? 2026,
            str(row, "codigoItemCatalogo"),
            object,
            normalizeObject(object).normalized,
            null,
            str(row, "numeroArtefato"),
          ],
        );
        n += 1;
      }
      pgcItems = n;
      await checkpoint(sql, {
        id: "ck_pgc",
        source_kind: "pgc_fazenda_2026",
        status: n > 0 ? "OK" : "EMPTY",
        http_status: 200,
        rows: n,
        source_url: url,
      });
    }
  }

  {
    const url =
      "https://dadosabertos.compras.gov.br/modulo-arp/1_consultarARP?dataVigenciaInicialMin=2025-01-01&dataVigenciaInicialMax=2025-03-31&pagina=1&tamanhoPagina=10";
    const payload = await get(url, "arp_2025q1");
    if (payload) {
      const records = extractJsonRecords(payload, "resultado");
      let n = 0;
      for (const raw of records) {
        const row = asRecord(raw);
        const ident =
          str(row, "numeroControlePncpAta", "numeroAtaRegistroPreco") ?? `arp-${n}`;
        const arpId = `arp_live_${ident}`.replace(/[^a-zA-Z0-9_/-]/g, "_").slice(0, 80);
        const vigStart = str(row, "dataVigenciaInicial");
        const vigEnd = str(row, "dataVigenciaFinal");
        const signals = arpSignals({
          remaining_ratio: null,
          vigency_end: vigEnd,
          adhesions: null,
          now,
        });
        await putSource(sql, {
          source_system_id: "src_br_comprasgov",
          entity_type: "arp",
          identifier: ident,
          payload: row,
          url,
        });
        await sql.query(
          `insert into arp_record (
             id, source_system_id, source_identifier, organization_name, uf, object,
             registered_quantity, remaining_ratio, adhesions, vigency_start, vigency_end,
             status, signals, valid_from, valid_to, observed_at, data_origin
           ) values ($1,'src_br_comprasgov',$2,$3,$4,$5,$6,null,null,$7,$8,$9,$10::jsonb,$7,$8,now(),'LIVE')
           on conflict (source_system_id, source_identifier) do update set
             object = excluded.object, signals = excluded.signals, data_origin = 'LIVE'`,
          [
            arpId,
            ident,
            str(row, "nomeUnidadeGerenciadora", "nomeOrgao"),
            null,
            str(row, "objeto"),
            num(row, "quantidadeItens"),
            vigStart,
            vigEnd,
            str(row, "statusAta") ?? "ACTIVE",
            JSON.stringify(signals),
          ],
        );
        n += 1;
      }
      arpRows = n;
      await checkpoint(sql, {
        id: "ck_arp",
        source_kind: "arp_2025q1",
        status: n > 0 ? "OK" : "EMPTY",
        http_status: 200,
        rows: n,
        source_url: url,
      });
    }
  }


  for (const org of PCA_ORGS) {
    const url = `https://pncp.gov.br/api/pncp/v1/orgaos/${org.cnpj}/pca/2026/consolidado`;
    const payload = await get(url, `pca_consolidado_${org.cnpj}`);
    if (!payload) continue;
    const rec = asRecord(payload);
    await putSource(sql, {
      source_system_id: "src_br_pncp",
      entity_type: "pca_consolidado",
      identifier: `pca-consolidado-${org.cnpj}-2026`,
      payload,
      url,
    });
    pcaConsolidado += 1;
    await checkpoint(sql, {
      id: `ck_pca_cons_${org.cnpj}`,
      source_kind: `pca_consolidado_${org.cnpj}`,
      status: "OK",
      http_status: 200,
      rows: 1,
      source_url: url,
      payload: {
        cnpj: str(rec, "cnpj"),
        razaoSocial: str(rec, "razaoSocial"),
        quantidade: num(rec, "quantidade"),
        valorTotal: num(rec, "valorTotal"),
        anoPca: num(rec, "anoPca"),
      },
    });
  }

  const itemTargets = PCA_ORGS.filter((org) => org.seq != null);
  for (const org of itemTargets) {
    const url = `https://pncp.gov.br/api/pncp/v1/orgaos/${org.cnpj}/pca/2026/${org.seq}/itens?pagina=1&tamanhoPagina=10`;
    const payload = await get(url, `pca_itens_${org.cnpj}`);
    if (payload == null) continue;
    const records = extractJsonRecords(payload);
    let n = 0;
    for (const raw of records) {
      const row = asRecord(raw);
      const numero = str(row, "numeroItem") ?? String(n);
      const object =
        str(row, "descricao", "grupoContratacaoNome", "classificacaoSuperiorNome", "pdmDescricao") ??
        "Item PCA";
      const ident = `pca-live-${org.cnpj}-2026-${org.seq}-${numero}`;
      const planId = `plan_live_${org.cnpj}_${org.seq}_${numero}`;
      const orgIdent = resolveOrgIdentity({
        display_name: str(row, "nomeUnidade") ?? org.name,
        cnpj: str(row, "cnpj") ?? org.cnpj,
      });
      await sql.query(
        `insert into organization_identity (id, display_name, cnpj, identity_method, identity_status, observed_at)
         values ($1,$2,$3,$4,$5,now()) on conflict (id) do nothing`,
        [orgIdent.id, orgIdent.display_name, orgIdent.cnpj, orgIdent.identity_method, orgIdent.identity_status],
      );
      await putSource(sql, {
        source_system_id: "src_br_pncp",
        entity_type: "pca_item",
        identifier: ident,
        payload: row,
        url,
      });
      await sql.query(
        `insert into planning_record (
           id, origin_type, source_system_id, source_identifier, organization_id, organization_name,
           organization_cnpj, year, catalog_code, catalog_type, object, raw_object, normalized_object,
           estimated_value_num, item_number, numero_item_pncp, status, valid_from, observed_at, data_origin
         ) values ($1,'PCA_PNCP','src_br_pncp',$2,$3,$4,$5,2026,$6,$7,$8,$8,$9,$10,$11,$12,'ATIVO',now(),now(),'LIVE')
         on conflict (source_system_id, source_identifier) do update set
           object = excluded.object,
           estimated_value_num = excluded.estimated_value_num,
           data_origin = 'LIVE'`,
        [
          planId,
          ident,
          orgIdent.id,
          str(row, "nomeUnidade") ?? org.name,
          org.cnpj,
          str(row, "classificacaoSuperiorCodigo", "codigoItem"),
          str(row, "nomeCatalogo") ?? "CATALOGO",
          object,
          normalizeObject(object).normalized,
          num(row, "valorTotal", "valorOrcamentoExercicio"),
          numero,
          str(row, "grupoContratacaoCodigo"),
        ],
      );
      n += 1;
    }
    pcaItems += n;
    await checkpoint(sql, {
      id: `ck_pca_itens_${org.cnpj}`,
      source_kind: `pca_itens_${org.cnpj}`,
      status: n > 0 ? "OK" : "EMPTY",
      http_status: 200,
      rows: n,
      source_url: url,
    });
  }

  {
    const url =
      "https://dadosabertos.compras.gov.br/modulo-contratacoes/1_consultarContratacoes_PNCP_14133?dataPublicacaoPncpInicial=2026-09-01&dataPublicacaoPncpFinal=2026-09-10&codigoModalidade=6&pagina=1&tamanhoPagina=10";
    const payload = await get(url, "contratacoes_2026_09");
    if (payload) {
      const records = extractJsonRecords(payload, "resultado");
      let n = 0;
      for (const raw of records) {
        const row = asRecord(raw);
        const ident = str(row, "numeroControlePNCP") ?? `live-ct-${n}`;
        const canId = `can_live_${ident.replace(/[^a-zA-Z0-9]/g, "_")}`.slice(0, 80);
        const object = str(row, "objetoCompra") ?? "Contratação";
        const cnpj = str(row, "orgaoEntidadeCnpj");
        const orgIdent = resolveOrgIdentity({
          display_name: str(row, "orgaoEntidadeRazaoSocial") ?? "Órgão",
          cnpj,
          municipality: str(row, "unidadeOrgaoMunicipioNome"),
          uf: str(row, "unidadeOrgaoUfSigla"),
        });
        await sql.query(
          `insert into organization_identity (id, display_name, cnpj, municipality, uf, identity_method, identity_status, observed_at)
           values ($1,$2,$3,$4,$5,$6,$7,now()) on conflict (id) do nothing`,
          [
            orgIdent.id,
            orgIdent.display_name,
            orgIdent.cnpj,
            orgIdent.municipality ?? null,
            orgIdent.uf ?? null,
            orgIdent.identity_method,
            orgIdent.identity_status,
          ],
        );
        await putSource(sql, {
          source_system_id: "src_br_pncp",
          entity_type: "procurement",
          identifier: ident,
          payload: row,
          url,
        });
        await sql.query(
          `insert into canonical_procurement (
             id, object, organization_name, organization_cnpj, municipality, uf, modality, status,
             opening_at, estimated_value, publication_at, proposal_deadline, catalog_code,
             normalized_object, estimated_value_num, organization_id, data_origin
           ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$9,$11,null,$12,$13,$14,'LIVE')
           on conflict (id) do update set data_origin = 'LIVE', object = excluded.object`,
          [
            canId,
            object,
            orgIdent.display_name,
            orgIdent.cnpj,
            str(row, "unidadeOrgaoMunicipioNome"),
            str(row, "unidadeOrgaoUfSigla"),
            str(row, "modalidadeNome"),
            str(row, "situacaoCompraNomePncp"),
            str(row, "dataPublicacaoPncp"),
            str(row, "valorTotalEstimado"),
            str(row, "dataEncerramentoPropostaPncp"),
            normalizeObject(object).normalized,
            num(row, "valorTotalEstimado"),
            orgIdent.id,
          ],
        );
        n += 1;
      }
      contratacoes = n;
      await checkpoint(sql, {
        id: "ck_contratacoes",
        source_kind: "contratacoes_2026_09",
        status: n > 0 ? "OK" : "EMPTY",
        http_status: 200,
        rows: n,
        source_url: url,
        payload: { totalRegistros: asRecord(payload).totalRegistros ?? null },
      });
    }
  }

  return {
    started_at: started,
    finished_at: new Date().toISOString(),
    budget_ms: LIVE_INGEST_BUDGET_MS,
    skipped,
    pca_consolidado: pcaConsolidado,
    pca_items: pcaItems,
    pgc_items: pgcItems,
    arp_rows: arpRows,
    contratacoes,
    errors,
  };
}
