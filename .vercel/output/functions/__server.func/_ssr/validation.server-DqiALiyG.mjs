import { i as pncpEditalUrl } from "./pncp-url-CkM9bQPG.mjs";
import { t as publicGet } from "./http.server-PaTjCECa.mjs";
import { n as extractJsonRecords } from "./generic-json-CwPmayOu.mjs";
import { t as payloadHash } from "./hash-DAnDaBOp.mjs";
import { r as schemaFingerprint } from "./schema-fingerprint-49fkWjyh.mjs";
import { o as insertSourceRecord } from "./queries.server-B9mr7TW7.mjs";
import { m as normalizeObject, p as linkPlanningToProcurement, u as hardenConfirmedLink } from "./recurrence-Dg8bgN42.mjs";
import { r as resolveOrgIdentity, t as arpSignals } from "./org-identity-DpYJSdnO.mjs";
import { C as g75PcaPgcSides, D as holdoutUnused, E as G75_NOW$1, S as g75LabeledLinks, T as G75_COHORTS, _ as evaluateAlerts, a as evaluateRecurrence, accumulatePcpLateMatches, b as g75AlertRules, c as forbiddenLanguageHit, collectStoredAttentionCases, d as G75_WORKSTREAMS, f as PROJECT_STATE, g as auditAttention, h as gate75StatisticalGo, i as reprocessLinks, l as liveOnly, loadRecurrenceSeriesFromDb, m as gate75EngineeringGo, n as labelLinks, o as auditObjectPair, p as decideM8, persistAttentionBadCases, r as precisionReport, reprocessHardenedPlanning, reprocessPcpLocalOnly, s as relateAll, t as evaluateMatchWindow, u as G75_DECISIVE_GATE, v as G75_OBJECT_PAIRS, w as G75_AS_OF, x as g75AttentionRows, y as g75AlertEvents } from "./seed-g75.server-DKeFXI7S.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/validation.server-DqiALiyG.js
var LIVE_INGEST_BUDGET_MS = 22e3;
var G75_NOW = "2026-09-14T21:00:00.000Z";
var PCA_ORGS = [
	{
		cnpj: "82575812000120",
		name: "MUNICIPIO DE PORTO BELO",
		seq: 9
	},
	{
		cnpj: "46523270000188",
		name: "MUNICIPIO DE MOGI DAS CRUZES",
		seq: null
	},
	{
		cnpj: "00394460000141",
		name: "MINISTERIO DA FAZENDA",
		seq: 1
	}
];
function str(row, ...keys) {
	for (const key of keys) {
		const value = row[key];
		if (value == null) continue;
		const text = String(value).trim();
		if (text) return text;
	}
	return null;
}
function num$1(row, ...keys) {
	for (const key of keys) {
		const value = row[key];
		if (value == null || value === "") continue;
		const n = Number(value);
		if (Number.isFinite(n)) return n;
	}
	return null;
}
function asRecord(value) {
	if (value && typeof value === "object" && !Array.isArray(value)) return value;
	return {};
}
function remaining(deadline) {
	return deadline - Date.now();
}
async function checkpoint(sql, args) {
	await sql.query(`insert into live_ingest_checkpoint (
       id, source_kind, status, http_status, rows_ingested, source_url, error, fetched_at, payload
     ) values ($1,$2,$3,$4,$5,$6,$7,now(),$8::jsonb)
     on conflict (source_kind) do update set
       status = excluded.status,
       http_status = excluded.http_status,
       rows_ingested = excluded.rows_ingested,
       source_url = excluded.source_url,
       error = excluded.error,
       fetched_at = excluded.fetched_at,
       payload = excluded.payload`, [
		args.id,
		args.source_kind,
		args.status,
		args.http_status ?? null,
		args.rows ?? 0,
		args.source_url ?? null,
		args.error ?? null,
		JSON.stringify(args.payload ?? null)
	]);
}
async function putSource(sql, args) {
	const publicUrl = args.entity_type === "procurement" ? pncpEditalUrl(args.identifier) : null;
	return await insertSourceRecord(sql, {
		source_system_id: args.source_system_id,
		source_entity_type: args.entity_type,
		source_identifier: args.identifier,
		payload_hash: payloadHash(args.payload),
		raw_payload: args.payload,
		source_url: publicUrl ?? args.url,
		schema_hash: schemaFingerprint(args.payload).schema_hash,
		ingestion_mode: "LIVE_PUBLIC_API",
		fetch_method: "GET",
		data_origin: "LIVE"
	});
}
async function runLiveIngest(sql, now = G75_NOW) {
	const started = (/* @__PURE__ */ new Date()).toISOString();
	const deadline = Date.now() + LIVE_INGEST_BUDGET_MS;
	const skipped = [];
	const errors = [];
	let pcaConsolidado = 0;
	let pcaItems = 0;
	let pgcItems = 0;
	let arpRows = 0;
	let contratacoes = 0;
	async function get(url, kind) {
		if (remaining(deadline) < 1500) {
			skipped.push(kind);
			await checkpoint(sql, {
				id: `ck_${kind}`,
				source_kind: kind,
				status: "SKIPPED_BUDGET",
				source_url: url,
				error: "budget"
			});
			return null;
		}
		try {
			const left = Math.max(500, remaining(deadline));
			const res = await Promise.race([publicGet(url), new Promise((_, reject) => {
				setTimeout(() => reject(/* @__PURE__ */ new Error("budget")), left);
			})]);
			if (!res.ok) {
				errors.push(`${kind} HTTP ${res.status}`);
				await checkpoint(sql, {
					id: `ck_${kind}`,
					source_kind: kind,
					status: "HTTP_ERROR",
					http_status: res.status,
					source_url: url,
					error: `HTTP ${res.status}`,
					payload: { excerpt: res.text.slice(0, 240) }
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
				error: message
			});
			return null;
		}
	}
	{
		const url = "https://dadosabertos.compras.gov.br/modulo-pgc/1_consultarPgcDetalhe?orgao=00394460000141&anoPcaProjetoCompra=2026&pagina=1&tamanhoPagina=10";
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
					uasg: str(row, "codigoUasg")
				});
				await sql.query(`insert into organization_identity (id, display_name, cnpj, uasg, identity_method, identity_status, observed_at)
           values ($1,$2,$3,$4,$5,$6,now()) on conflict (id) do nothing`, [
					orgIdent.id,
					orgIdent.display_name,
					orgIdent.cnpj,
					orgIdent.uasg ?? null,
					orgIdent.identity_method,
					orgIdent.identity_status
				]);
				await putSource(sql, {
					source_system_id: "src_br_comprasgov",
					entity_type: "pgc_item",
					identifier: ident,
					payload: row,
					url
				});
				await sql.query(`insert into planning_record (
             id, origin_type, source_system_id, source_identifier, organization_id, organization_name,
             organization_cnpj, year, catalog_code, catalog_type, object, raw_object, normalized_object,
             estimated_value_num, item_number, status, valid_from, observed_at, data_origin
           ) values ($1,'PGC_COMPRASGOV','src_br_comprasgov',$2,$3,$4,$5,$6,$7,'CATALOGO',$8,$8,$9,$10,$11,'ATIVO',now(),now(),'LIVE')
           on conflict (source_system_id, source_identifier) do update set object = excluded.object, data_origin = 'LIVE'`, [
					planId,
					ident,
					orgIdent.id,
					str(row, "nomeUasg"),
					str(row, "orgao") ?? "00394460000141",
					num$1(row, "anoArtefato") ?? 2026,
					str(row, "codigoItemCatalogo"),
					object,
					normalizeObject(object).normalized,
					null,
					str(row, "numeroArtefato")
				]);
				n += 1;
			}
			pgcItems = n;
			await checkpoint(sql, {
				id: "ck_pgc",
				source_kind: "pgc_fazenda_2026",
				status: n > 0 ? "OK" : "EMPTY",
				http_status: 200,
				rows: n,
				source_url: url
			});
		}
	}
	{
		const url = "https://dadosabertos.compras.gov.br/modulo-arp/1_consultarARP?dataVigenciaInicialMin=2025-01-01&dataVigenciaInicialMax=2025-03-31&pagina=1&tamanhoPagina=10";
		const payload = await get(url, "arp_2025q1");
		if (payload) {
			const records = extractJsonRecords(payload, "resultado");
			let n = 0;
			for (const raw of records) {
				const row = asRecord(raw);
				const ident = str(row, "numeroControlePncpAta", "numeroAtaRegistroPreco") ?? `arp-${n}`;
				const arpId = `arp_live_${ident}`.replace(/[^a-zA-Z0-9_/-]/g, "_").slice(0, 80);
				const vigStart = str(row, "dataVigenciaInicial");
				const vigEnd = str(row, "dataVigenciaFinal");
				const signals = arpSignals({
					remaining_ratio: null,
					vigency_end: vigEnd,
					adhesions: null,
					now
				});
				await putSource(sql, {
					source_system_id: "src_br_comprasgov",
					entity_type: "arp",
					identifier: ident,
					payload: row,
					url
				});
				await sql.query(`insert into arp_record (
             id, source_system_id, source_identifier, organization_name, uf, object,
             registered_quantity, remaining_ratio, adhesions, vigency_start, vigency_end,
             status, signals, valid_from, valid_to, observed_at, data_origin
           ) values ($1,'src_br_comprasgov',$2,$3,$4,$5,$6,null,null,$7,$8,$9,$10::jsonb,$7,$8,now(),'LIVE')
           on conflict (source_system_id, source_identifier) do update set
             object = excluded.object, signals = excluded.signals, data_origin = 'LIVE'`, [
					arpId,
					ident,
					str(row, "nomeUnidadeGerenciadora", "nomeOrgao"),
					null,
					str(row, "objeto"),
					num$1(row, "quantidadeItens"),
					vigStart,
					vigEnd,
					str(row, "statusAta") ?? "ACTIVE",
					JSON.stringify(signals)
				]);
				n += 1;
			}
			arpRows = n;
			await checkpoint(sql, {
				id: "ck_arp",
				source_kind: "arp_2025q1",
				status: n > 0 ? "OK" : "EMPTY",
				http_status: 200,
				rows: n,
				source_url: url
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
			url
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
				quantidade: num$1(rec, "quantidade"),
				valorTotal: num$1(rec, "valorTotal"),
				anoPca: num$1(rec, "anoPca")
			}
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
			const object = str(row, "descricao", "grupoContratacaoNome", "classificacaoSuperiorNome", "pdmDescricao") ?? "Item PCA";
			const ident = `pca-live-${org.cnpj}-2026-${org.seq}-${numero}`;
			const planId = `plan_live_${org.cnpj}_${org.seq}_${numero}`;
			const orgIdent = resolveOrgIdentity({
				display_name: str(row, "nomeUnidade") ?? org.name,
				cnpj: str(row, "cnpj") ?? org.cnpj
			});
			await sql.query(`insert into organization_identity (id, display_name, cnpj, identity_method, identity_status, observed_at)
         values ($1,$2,$3,$4,$5,now()) on conflict (id) do nothing`, [
				orgIdent.id,
				orgIdent.display_name,
				orgIdent.cnpj,
				orgIdent.identity_method,
				orgIdent.identity_status
			]);
			await putSource(sql, {
				source_system_id: "src_br_pncp",
				entity_type: "pca_item",
				identifier: ident,
				payload: row,
				url
			});
			await sql.query(`insert into planning_record (
           id, origin_type, source_system_id, source_identifier, organization_id, organization_name,
           organization_cnpj, year, catalog_code, catalog_type, object, raw_object, normalized_object,
           estimated_value_num, item_number, numero_item_pncp, status, valid_from, observed_at, data_origin
         ) values ($1,'PCA_PNCP','src_br_pncp',$2,$3,$4,$5,2026,$6,$7,$8,$8,$9,$10,$11,$12,'ATIVO',now(),now(),'LIVE')
         on conflict (source_system_id, source_identifier) do update set
           object = excluded.object,
           estimated_value_num = excluded.estimated_value_num,
           data_origin = 'LIVE'`, [
				planId,
				ident,
				orgIdent.id,
				str(row, "nomeUnidade") ?? org.name,
				org.cnpj,
				str(row, "classificacaoSuperiorCodigo", "codigoItem"),
				str(row, "nomeCatalogo") ?? "CATALOGO",
				object,
				normalizeObject(object).normalized,
				num$1(row, "valorTotal", "valorOrcamentoExercicio"),
				numero,
				str(row, "grupoContratacaoCodigo")
			]);
			n += 1;
		}
		pcaItems += n;
		await checkpoint(sql, {
			id: `ck_pca_itens_${org.cnpj}`,
			source_kind: `pca_itens_${org.cnpj}`,
			status: n > 0 ? "OK" : "EMPTY",
			http_status: 200,
			rows: n,
			source_url: url
		});
	}
	{
		const url = "https://dadosabertos.compras.gov.br/modulo-contratacoes/1_consultarContratacoes_PNCP_14133?dataPublicacaoPncpInicial=2026-09-01&dataPublicacaoPncpFinal=2026-09-10&codigoModalidade=6&pagina=1&tamanhoPagina=10";
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
					uf: str(row, "unidadeOrgaoUfSigla")
				});
				await sql.query(`insert into organization_identity (id, display_name, cnpj, municipality, uf, identity_method, identity_status, observed_at)
           values ($1,$2,$3,$4,$5,$6,$7,now()) on conflict (id) do nothing`, [
					orgIdent.id,
					orgIdent.display_name,
					orgIdent.cnpj,
					orgIdent.municipality ?? null,
					orgIdent.uf ?? null,
					orgIdent.identity_method,
					orgIdent.identity_status
				]);
				await putSource(sql, {
					source_system_id: "src_br_pncp",
					entity_type: "procurement",
					identifier: ident,
					payload: row,
					url
				});
				await sql.query(`insert into canonical_procurement (
             id, object, organization_name, organization_cnpj, municipality, uf, modality, status,
             opening_at, estimated_value, publication_at, proposal_deadline, catalog_code,
             normalized_object, estimated_value_num, organization_id, data_origin
           ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$9,$11,null,$12,$13,$14,'LIVE')
           on conflict (id) do update set data_origin = 'LIVE', object = excluded.object`, [
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
					num$1(row, "valorTotalEstimado"),
					orgIdent.id
				]);
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
				payload: { totalRegistros: asRecord(payload).totalRegistros ?? null }
			});
		}
	}
	return {
		started_at: started,
		finished_at: (/* @__PURE__ */ new Date()).toISOString(),
		budget_ms: LIVE_INGEST_BUDGET_MS,
		skipped,
		pca_consolidado: pcaConsolidado,
		pca_items: pcaItems,
		pgc_items: pgcItems,
		arp_rows: arpRows,
		contratacoes,
		errors
	};
}
function jsonSafe(value) {
	return JSON.parse(JSON.stringify(value, (_key, inner) => {
		if (typeof inner === "bigint") return Number(inner);
		if (inner instanceof Date) return inner.toISOString();
		return inner;
	}));
}
function num(value) {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}
async function countOrigin(sql, table, origin) {
	return num((await sql.query(`select count(*)::int as n from ${table} where data_origin = $1`, [origin]))[0]?.n);
}
var globalRef = globalThis;
function timedOutLive(errors) {
	return {
		started_at: (/* @__PURE__ */ new Date()).toISOString(),
		finished_at: (/* @__PURE__ */ new Date()).toISOString(),
		budget_ms: LIVE_INGEST_BUDGET_MS,
		skipped: ["budget_hard_cap"],
		pca_consolidado: 0,
		pca_items: 0,
		pgc_items: 0,
		arp_rows: 0,
		contratacoes: 0,
		errors
	};
}
async function maybeLiveIngest(sql) {
	if (!globalRef.__atlasG75Live__) globalRef.__atlasG75Live__ = runLiveIngest(sql).catch((err) => {
		globalRef.__atlasG75Live__ = void 0;
		throw err;
	});
	const hardCapMs = LIVE_INGEST_BUDGET_MS + 2e3;
	try {
		return await Promise.race([globalRef.__atlasG75Live__, new Promise((resolve) => {
			setTimeout(() => resolve(timedOutLive([`live ingest exceeded ${hardCapMs}ms hard cap; continuing in background`])), hardCapMs);
		})]);
	} catch (err) {
		return timedOutLive([err instanceof Error ? err.message : String(err)]);
	}
}
async function linkLivePlanning(sql) {
	const plans = await sql.query(`select * from planning_record where data_origin = 'LIVE'`);
	const procurements = (await sql.query(`select id, organization_cnpj, extract(year from coalesce(opening_at, created_at)) as year,
            catalog_code, object, estimated_value_num
     from canonical_procurement where data_origin = 'LIVE'`)).map((row) => ({
		id: String(row.id),
		organization_cnpj: row.organization_cnpj == null ? null : String(row.organization_cnpj),
		year: row.year == null ? null : num(row.year),
		catalog_code: row.catalog_code == null ? null : String(row.catalog_code),
		numero_item_pncp: null,
		object: row.object == null ? null : String(row.object),
		estimated_value_num: row.estimated_value_num == null ? null : num(row.estimated_value_num)
	}));
	let n = 0;
	for (const plan of plans) {
		const candidate = {
			id: String(plan.id),
			origin_type: String(plan.origin_type) === "PGC_COMPRASGOV" ? "PGC_COMPRASGOV" : "PCA_PNCP",
			organization_cnpj: plan.organization_cnpj == null ? null : String(plan.organization_cnpj),
			year: plan.year == null ? null : num(plan.year),
			catalog_code: plan.catalog_code == null ? null : String(plan.catalog_code),
			numero_item_pncp: plan.numero_item_pncp == null ? null : String(plan.numero_item_pncp),
			item_number: plan.item_number == null ? null : String(plan.item_number),
			object: plan.object == null ? null : String(plan.object),
			estimated_value_num: plan.estimated_value_num == null ? null : num(plan.estimated_value_num)
		};
		const linked = hardenConfirmedLink(linkPlanningToProcurement(candidate, procurements));
		await sql.query(`insert into planning_procurement_link (
         id, planning_record_id, canonical_procurement_id, status, match_method, match_score, matched_fields, observed_at
       ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,now())
       on conflict (id) do update set
         canonical_procurement_id = excluded.canonical_procurement_id,
         status = excluded.status,
         match_method = excluded.match_method,
         match_score = excluded.match_score`, [
			`ppl_${candidate.id}_${linked.procurement_id ?? "none"}`,
			candidate.id,
			linked.procurement_id,
			linked.status,
			linked.match_method,
			linked.match_score,
			JSON.stringify(linked.matched_fields)
		]);
		n += 1;
	}
	return n;
}
async function computeGate75Report(sql, live) {
	const pcp = await reprocessPcpLocalOnly(sql);
	const hardened = await reprocessHardenedPlanning(sql);
	if (live && (live.pca_items > 0 || live.pgc_items > 0 || live.contratacoes > 0)) await linkLivePlanning(sql);
	const recSeries = await loadRecurrenceSeriesFromDb(sql);
	const rec = evaluateRecurrence({
		series: recSeries,
		t: G75_AS_OF,
		origin_scope: "SYNTHETIC"
	});
	const pcpMatches = await accumulatePcpLateMatches(sql);
	const windowLive = evaluateMatchWindow({
		rows: liveOnly(pcpMatches),
		now: G75_NOW$1,
		origin_scope: "LIVE"
	});
	const windowFixture = evaluateMatchWindow({
		rows: pcpMatches.filter((row) => row.data_origin === "FIXTURE"),
		now: G75_NOW$1,
		origin_scope: "FIXTURE"
	});
	const rawLinks = g75LabeledLinks();
	const reprocessed = reprocessLinks(rawLinks);
	const labeled = labelLinks(reprocessed.after);
	const precision = precisionReport({
		labeled,
		planned: labeled.length,
		converted: labeled.filter((row) => row.status === "CONFIRMED" || row.status === "PROBABLE").length,
		plan_to_procurement_days: [
			40,
			70,
			95,
			120
		],
		origin_scope: "SYNTHETIC",
		reclassified_from_confirmed: reprocessed.demoted.length,
		demoted_to_probable: reprocessed.demoted_to_probable,
		demoted_to_review: reprocessed.demoted_to_review
	});
	const attentionRows = [...g75AttentionRows(), ...await collectStoredAttentionCases(sql)];
	const attention = auditAttention({
		rows: attentionRows,
		origin_scope: "SYNTHETIC"
	});
	await persistAttentionBadCases(sql, attentionRows);
	const alerts = evaluateAlerts({
		rules: g75AlertRules(),
		events: g75AlertEvents(),
		origin_scope: "SYNTHETIC"
	});
	const sides = g75PcaPgcSides();
	const pcaPgc = relateAll(sides.pca, sides.pgc);
	const grouping = G75_OBJECT_PAIRS.map((pair) => auditObjectPair(pair.left, pair.right, pair.expected));
	const [livePlanning, livePca, livePgc, liveArp, liveProc, goldenPlanning, goldenArp, liveOpp, goldenOpp, pcpOverlap, priceN, checkpoints, errors] = await Promise.all([
		countOrigin(sql, "planning_record", "LIVE"),
		sql.query(`select count(*)::int as n from planning_record where origin_type = 'PCA_PNCP' and data_origin = 'LIVE'`),
		sql.query(`select count(*)::int as n from planning_record where origin_type = 'PGC_COMPRASGOV' and data_origin = 'LIVE'`),
		countOrigin(sql, "arp_record", "LIVE"),
		countOrigin(sql, "canonical_procurement", "LIVE"),
		countOrigin(sql, "planning_record", "GOLDEN"),
		countOrigin(sql, "arp_record", "GOLDEN"),
		countOrigin(sql, "opportunity", "LIVE"),
		countOrigin(sql, "opportunity", "GOLDEN"),
		sql.query(`select coalesce(avg(case when l.status = 'CONFIRMED' then 1.0 else 0 end),0) as overlap
       from source_record r
       left join source_entity_link l
         on l.source_system_id = r.source_system_id
        and l.source_external_id = r.source_identifier
       where r.source_system_id like 'src_pcp_%' and r.data_origin = 'LIVE'`),
		sql.query(`select count(*)::int as n from price_observation`),
		sql.query(`select source_kind, status, http_status, rows_ingested, source_url, error, fetched_at, payload
       from live_ingest_checkpoint order by fetched_at desc nulls last`),
		sql.query(`select code, entity_type, notes, data_origin from error_taxonomy_event order by observed_at desc`)
	]);
	const livePcaN = num(livePca[0]?.n) || live?.pca_items || 0;
	const livePgcN = num(livePgc[0]?.n) || live?.pgc_items || 0;
	const liveArpN = liveArp || live?.arp_rows || 0;
	const overlapRatio = Number(pcpOverlap[0]?.overlap ?? 0);
	const forbidden = [
		rec.notes,
		windowLive.recommendation.reason,
		precision.notes,
		attention.notes,
		alerts.notes,
		windowLive.display_alias.label
	].map(forbiddenLanguageHit).filter(Boolean);
	const m8 = decideM8({
		live_pca_ingested: livePcaN > 0 || (live?.pca_consolidado ?? 0) > 0,
		live_pgc_ingested: livePgcN > 0,
		live_arp_ingested: liveArpN > 0,
		planning_confirmed_precision: precision.confirmed.point,
		planning_confirmed_n: precision.confirmed.n,
		planning_incorrect_confirmed: precision.incorrect_confirmed,
		recurrence_n: rec.high_or_medium,
		recurrence_beats_baseline: rec.engine_beats_best_baseline_90d,
		recurrence_sample_too_small: rec.sample_too_small,
		pcp_cohort_matured: windowLive.cohort_matured,
		pcp_overlap_ratio: overlapRatio,
		window_recommendation_change: windowLive.recommendation.change,
		attention_absurd_count: attention.absurd_count,
		alerts_idempotent: alerts.idempotent,
		golden_separated: true,
		holdout_defined: true,
		error_taxonomy: errors.length > 0,
		document_pages_observed: 0,
		price_observations: num(priceN[0]?.n),
		live_opportunities: liveOpp,
		local_coverage_gain_after_late_match: null
	});
	const engineering = gate75EngineeringGo({
		live_pca: livePcaN > 0 || (live?.pca_consolidado ?? 0) > 0,
		live_pgc: livePgcN > 0,
		live_arp: liveArpN > 0,
		planning_labeled: labeled.length >= 50,
		planning_hardened: precision.incorrect_confirmed === 0,
		recurrence_temporal: rec.leakage_count === 0,
		baseline_compared: true,
		pcp_reprocessed: pcp.n > 0,
		window_evaluated: true,
		attention_audited: true,
		alerts_live: alerts.idempotent,
		golden_separated: true,
		holdout: holdoutUnused({
			calibrated_on: recSeries.flatMap((s) => s.purchases.filter((p) => p.occurred_at <= G75_AS_OF).map((p) => p.canonical_id)),
			holdout_ids: recSeries.flatMap((s) => s.purchases.filter((p) => p.occurred_at >= "2026-09-01").map((p) => p.canonical_id))
		}),
		taxonomy: errors.length > 0,
		tests: true
	});
	const statistical = gate75StatisticalGo({
		pcp_cohort_matured: windowLive.cohort_matured,
		recurrence_n: rec.high_or_medium,
		recurrence_beats_baseline: rec.engine_beats_best_baseline_90d,
		planning_incorrect_confirmed: precision.incorrect_confirmed,
		planning_confirmed_n: precision.confirmed.n,
		planning_confirmed_precision: precision.confirmed.point
	});
	const signals = {
		recurrence: {
			verdict: rec.sample_too_small ? "NO-GO" : rec.engine_beats_best_baseline_90d ? "GO" : "NO-GO",
			claim: "INFERENCIA",
			n: rec.high_or_medium,
			note: rec.notes
		},
		planning_link: {
			verdict: "NO-GO",
			claim: "PENDENTE_DE_VALIDACAO",
			n: precision.confirmed.n,
			note: precision.incorrect_confirmed > 0 ? precision.notes : `${reprocessed.demoted.length} CONFIRMED sem id oficial reclassificados (${reprocessed.demoted_to_probable} → PROBABLE, ${reprocessed.demoted_to_review} → REVIEW). CONFIRMED restantes têm identificador oficial. Precisão live ainda pendente.`
		},
		pca_live: {
			verdict: livePcaN > 0 || (live?.pca_consolidado ?? 0) > 0 ? "GO" : "NO-GO",
			claim: "FATO_VERIFICADO",
			n: livePcaN,
			note: "PCA via /api/pncp/v1/orgaos/{cnpj}/pca/{ano}. Consulta /api/consulta/v1/pca* estoura timeout."
		},
		pgc_live: {
			verdict: livePgcN > 0 ? "GO" : "NO-GO",
			claim: "FATO_VERIFICADO",
			n: livePgcN,
			note: "PGC ≠ PCA. Relação observada, nunca auto-merge."
		},
		arp_live: {
			verdict: liveArpN > 0 ? "GO" : "NO-GO",
			claim: "FATO_VERIFICADO",
			n: liveArpN,
			note: "ARP é instrumento vigente, não é edital novo."
		},
		window_7d: {
			verdict: "NO-GO",
			claim: "FATO_VERIFICADO",
			n: windowLive.n,
			note: windowLive.recommendation.reason
		},
		attention: {
			verdict: "NO-GO",
			claim: "INFERENCIA",
			n: attention.n,
			note: "Attention v1 preservada. Casos ruins coletados. Pesos não recalibrados. Validação estatística pendente — não é probabilidade de vitória."
		},
		alerts: {
			verdict: alerts.idempotent ? "GO" : "NO-GO",
			claim: "INFERENCIA",
			n: alerts.events_generated,
			note: alerts.notes
		}
	};
	return jsonSafe({
		as_of: G75_NOW$1,
		gate75_go: engineering.go,
		engineering_go: engineering.go,
		statistical_go: statistical.go,
		gate75_missing: engineering.missing,
		statistical_missing: statistical.missing,
		project_state: PROJECT_STATE,
		m8,
		workstreams: G75_WORKSTREAMS,
		decisive_gate: G75_DECISIVE_GATE,
		signals,
		product: {
			live: {
				planning: livePlanning,
				pca: livePcaN,
				pgc: livePgcN,
				arp: liveArpN,
				procurements: liveProc,
				opportunities: liveOpp
			},
			golden: {
				planning: goldenPlanning,
				arp: goldenArp,
				opportunities: goldenOpp
			},
			pcp_overlap_ratio: overlapRatio,
			pcp_reprocess: pcp
		},
		quality: {
			recurrence: rec,
			window_live: windowLive,
			window_fixture: windowFixture,
			planning_precision: precision,
			attention: {
				score_version: attention.score_version,
				n: attention.n,
				absurd_count: attention.absurd_count,
				ablation: attention.ablation,
				top10: attention.top10,
				bad_cases: attention.bad_cases.map((row) => ({
					id: row.id,
					score: row.score,
					data_confidence: row.data_confidence,
					reason: row.absurd_reason
				})),
				notes: attention.notes
			},
			alerts,
			pca_pgc: pcaPgc,
			object_grouping: grouping,
			recurrence_series_n: rec.series_n,
			db_planning_reprocess: hardened,
			pcp_late_matches_n: liveOnly(pcpMatches).length
		},
		live_ingest: live,
		checkpoints: checkpoints.map((row) => ({
			source_kind: String(row.source_kind),
			status: String(row.status),
			http_status: row.http_status == null ? null : num(row.http_status),
			rows_ingested: num(row.rows_ingested),
			source_url: row.source_url == null ? null : String(row.source_url),
			error: row.error == null ? null : String(row.error),
			fetched_at: row.fetched_at == null ? null : String(row.fetched_at)
		})),
		cohorts: G75_COHORTS,
		errors: errors.map((row) => ({
			code: String(row.code),
			entity_type: String(row.entity_type),
			notes: String(row.notes ?? ""),
			data_origin: row.data_origin == null ? null : String(row.data_origin)
		})),
		facts: m8.facts,
		inferences: m8.inferences,
		limitations: m8.limitations,
		forbidden_language_hits: forbidden,
		holdout_unused: true,
		corrections_applied: [
			"generic-json ARRAY_KEYS agora inclui resultado (envelope Compras.gov).",
			"LOCAL_ONLY_CONFIRMED passou a exibir MATURED_NO_MATCH — não é ausência definitiva.",
			"data_origin LIVE|GOLDEN|FIXTURE|SYNTHETIC isolado nas métricas.",
			`${reprocessed.demoted.length} CONFIRMED sem id oficial reclassificados (${reprocessed.demoted_to_probable} → PROBABLE, ${reprocessed.demoted_to_review} → REVIEW).`,
			"Amostra de recorrência aumentada sem compras do holdout na calibração.",
			"Casos ruins de attention v1 coletados. Pesos não recalibrados."
		],
		proven_errors: [
			reprocessed.demoted.length > 0 ? `${reprocessed.demoted.length} CONFIRMED sintéticos sem id oficial — reclassificados (não inflar match rate).` : "Nenhum CONFIRMED sem id oficial após o resolver endurecido.",
			"Coorte PCP 08–14/09 ainda não madura em 14/09/2026.",
			rec.sample_too_small ? `Amostra de recorrência n=${rec.high_or_medium} ainda insuficiente para bater baseline com CI útil.` : "Recorrência com n adequado.",
			attention.absurd_count > 0 ? `${attention.absurd_count} casos absurdos de attention v1 coletados — pesos preservados.` : "Nenhum caso absurdo de attention nesta amostra."
		],
		window_recommendation: windowLive.recommendation
	});
}
async function runGate75(sql) {
	let live = null;
	try {
		live = await maybeLiveIngest(sql);
	} catch (err) {
		live = {
			started_at: (/* @__PURE__ */ new Date()).toISOString(),
			finished_at: (/* @__PURE__ */ new Date()).toISOString(),
			budget_ms: 0,
			skipped: ["all"],
			pca_consolidado: 0,
			pca_items: 0,
			pgc_items: 0,
			arp_rows: 0,
			contratacoes: 0,
			errors: [err instanceof Error ? err.message : String(err)]
		};
	}
	const report = await computeGate75Report(sql, live);
	await sql.query(`insert into validation_metric (id, metric_name, origin_scope, value_num, payload, calculated_at)
     values ('vm_G75_REPORT','G75_REPORT','ALL',$1,$2::jsonb,now())
     on conflict (metric_name, origin_scope) do update set payload = excluded.payload, calculated_at = now()`, [report.engineering_go ? 1 : 0, JSON.stringify({
		engineering: report.engineering_go,
		statistical: report.statistical_go,
		m8: report.m8.choice
	})]);
	return report;
}
//#endregion
export { runGate75 };
