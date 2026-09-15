import { i as inferDiscoveryChannel, n as captchaBlocksPagination, r as htmlHasCaptcha, t as BLL_CHANNEL_STACK } from "./discovery-channel-DKoYBJAm.mjs";
import { a as parseHtmlListRecords } from "./contract-DgIznFBx.mjs";
import { t as payloadHash } from "./hash-DAnDaBOp.mjs";
import { r as schemaFingerprint } from "./schema-fingerprint-49fkWjyh.mjs";
import { o as insertSourceRecord } from "./queries.server-B9mr7TW7.mjs";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
//#region node_modules/.nitro/vite/services/ssr/assets/seed-bll-channels.server-CUaJDQYa.js
/**
* BLL discovery-channel expansion. Not Milestone 8.
* Registers PROCESS / DIRECT_BUY / LOCATION on the platform source.
* Ingests DirectBuy from the public HTML fixture. Does not bypass CAPTCHA.
*/
var OBSERVED = "2026-09-15T12:00:00.000Z";
var BASE = "https://bllcompras.com";
var PLATFORM = "src_bll_platform";
var JSONB_KEYS = /* @__PURE__ */ new Set([
	"params_json",
	"pagination_config",
	"normalization_config",
	"capabilities_json",
	"raw_payload",
	"raw_metadata"
]);
async function upsert(sql, table, row, pk = "id") {
	const keys = Object.keys(row);
	const cols = keys.join(", ");
	const placeholders = keys.map((key, i) => JSONB_KEYS.has(key) ? `$${i + 1}::jsonb` : `$${i + 1}`).join(", ");
	const params = keys.map((key) => {
		const value = row[key];
		if (value === void 0) return null;
		if (JSONB_KEYS.has(key)) {
			if (value === null) return null;
			return typeof value === "string" ? value : JSON.stringify(value);
		}
		return value;
	});
	await sql.query(`insert into ${table} (${cols}) values (${placeholders}) on conflict (${pk}) do nothing`, params);
}
function loadDirectBuyFixture() {
	return readFileSync(join(dirname(fileURLToPath(import.meta.url)), "fixtures/bll-direct-buy.html"), "utf8");
}
async function seedBllChannels(sql) {
	const html = loadDirectBuyFixture();
	const hasCaptcha = htmlHasCaptcha(html);
	const paginationBlocked = captchaBlocksPagination(html);
	for (const channel of BLL_CHANNEL_STACK) {
		await upsert(sql, "source_discovery_channel", {
			id: `ch_bll_${channel.channel_type.toLowerCase()}`,
			source_system_id: PLATFORM,
			channel_type: channel.channel_type,
			label: channel.label,
			list_url: `${BASE}${channel.list_path}`,
			detail_url_pattern: `${BASE}${channel.detail_path}`,
			connector_type: channel.connector_type,
			params_json: channel.params,
			pagination_config: channel.pagination,
			capabilities_json: {
				discover: channel.readiness === "READY",
				detail: channel.channel_type !== "LOCATION",
				first_page_public: channel.channel_type !== "LOCATION"
			},
			readiness: channel.readiness,
			ingest_status: channel.ingest_status,
			captcha_constraint: channel.captcha_constraint,
			notes: channel.notes,
			claim_kind: channel.claim_kind,
			data_origin: channel.channel_type === "DIRECT_BUY" ? "FIXTURE" : "LIVE",
			last_success_at: channel.readiness === "READY" ? OBSERVED : null
		});
		await upsert(sql, "source_endpoint", {
			id: `ep_bll_${channel.channel_type.toLowerCase()}_list`,
			source_system_id: PLATFORM,
			name: `${channel.label} — lista`,
			path: channel.list_path,
			http_method: "GET",
			endpoint_type: "HTML_LIST",
			public: true,
			pagination_type: channel.pagination.type ?? "UNKNOWN",
			requires_cookie: false,
			requires_csrf: false,
			requires_auth: false,
			status: channel.readiness === "READY" ? "HEALTHY" : "UNKNOWN",
			last_verified_at: OBSERVED
		});
	}
	await upsert(sql, "source_endpoint", {
		id: "ep_bll_direct_buy_view",
		source_system_id: PLATFORM,
		name: "Compra direta — detalhe",
		path: "/DirectBuy/DirectBuyView",
		http_method: "GET",
		endpoint_type: "HTML_DETAIL",
		public: true,
		pagination_type: "UNKNOWN",
		requires_cookie: false,
		requires_csrf: false,
		requires_auth: false,
		status: "HEALTHY",
		last_verified_at: OBSERVED
	});
	await upsert(sql, "source_evidence", {
		id: "ev_bll_direct_buy_html",
		source_system_id: PLATFORM,
		evidence_type: "ROUTE_SIGNATURE",
		evidence_level: "VERIFIED",
		title: "Compra Direta pública BLL — DirectBuySearchPublic",
		description: "GET público /DirectBuy/DirectBuySearchPublic devolve HTML com tabela própria (Promotor, Nº, Status, Modalidade, Datas). Menu distingue Processos, Compra Direta e Busca por Localização. Modalidades DISPENSA e INEXIGIBILIDADE. param1 opaco no detalhe. reCAPTCHA presente no fluxo de paginação; primeira página não exige token. Não é adapter BLL — canal extra do generic-action.",
		url: "https://bllcompras.com/DirectBuy/DirectBuySearchPublic",
		observed_value: "/DirectBuy/DirectBuySearchPublic",
		expected_signature: "/DirectBuy/DirectBuySearchPublic",
		verified_by: "seed-bll-channels",
		captured_at: OBSERVED
	});
	await upsert(sql, "source_observation", {
		id: "obs_bll_direct_buy_captcha",
		source_system_id: PLATFORM,
		observation_type: "OTHER",
		key: "captcha",
		value: hasCaptcha ? "reCAPTCHA invisível no HTML; GetDirectBuyByParams exige token. Paginação live bloqueada. Primeira página pública permanece utilizável." : "CAPTCHA não observado neste fixture.",
		source_url: "https://bllcompras.com/DirectBuy/DirectBuySearchPublic",
		raw_payload: {
			htmlHasCaptcha: hasCaptcha,
			captchaBlocksPagination: paginationBlocked,
			policy: "never-bypass"
		}
	});
	await upsert(sql, "source_observation", {
		id: "obs_bll_three_surfaces",
		source_system_id: PLATFORM,
		observation_type: "ROUTE",
		key: "public_nav",
		value: "Processos | Compra Direta | Busca por Localização",
		source_url: "https://bllcompras.com/DirectBuy/DirectBuySearchPublic"
	});
	const rows = parseHtmlListRecords(html, BASE, /DirectBuy\/DirectBuyView/i);
	const channel = inferDiscoveryChannel("/DirectBuy/DirectBuySearchPublic");
	for (const row of rows) {
		const identifier = row.external_id;
		await insertSourceRecord(sql, {
			id: `rec_bll_db_${payloadHash(identifier).slice(0, 16)}`,
			source_system_id: PLATFORM,
			source_entity_type: "procurement",
			source_identifier: identifier,
			payload_hash: payloadHash(row),
			schema_hash: schemaFingerprint(row).schema_hash,
			raw_payload: {
				htmlSnippet: row.htmlSnippet,
				process_number: row.process_number,
				modality: row.modality,
				status: row.status,
				organization_name: row.organization_name,
				channel
			},
			source_url: row.source_url,
			ingestion_mode: "RECORDED_FIXTURE",
			fetch_method: "GENERIC_ACTION",
			data_origin: "FIXTURE",
			source_channel: channel
		});
	}
	try {
		await sql.query(`insert into validation_metric (id, metric_name, origin_scope, value_num, payload, calculated_at)
       values ($1,$2,$3,$4,$5::jsonb,now())
       on conflict (metric_name, origin_scope) do update set
         value_num = excluded.value_num,
         payload = excluded.payload,
         calculated_at = now()`, [
			"vm_bll_direct_buy_fixture",
			"bll_direct_buy_fixture_count",
			"FIXTURE",
			rows.length,
			JSON.stringify({
				sample_size: rows.length,
				captcha_on_page: hasCaptcha,
				pagination_blocked: paginationBlocked,
				channels: BLL_CHANNEL_STACK.map((row) => row.channel_type),
				m8: "NONE",
				note: "Expansão de canal, não família nova nem adapter comercial. Golden não entra. Overlap PNCP de DirectBuy ainda não medido."
			})
		]);
	} catch {}
}
//#endregion
export { seedBllChannels };
