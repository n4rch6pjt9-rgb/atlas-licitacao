import { c as recordOverlap, s as percentile } from "./coverage-h_nbs-Bf.mjs";
import { t as buildFamilyCandidates } from "./family-candidates-Dniw2-34.mjs";
import { r as classifyPublicKey, t as PCP_APIPCP_PUBLICKEY_EVIDENCE } from "./pcp-semantics-Y8Z50bdG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/priority.server-B4IJ691O.js
var PRIORITY_WEIGHTS_V1 = {
	coverage_gap: .18,
	estimated_volume: .14,
	lead_time: .16,
	technical_reuse: .12,
	source_reliability: .08,
	evidence_confidence: .1,
	public_access: .08,
	historical_depth: .04,
	maintenance_risk_inverted: .05,
	integration_cost_inverted: .05
};
var PRIORITY_WEIGHTS_V2 = { ...PRIORITY_WEIGHTS_V1 };
function clamp01(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(1, value));
}
function leadTimeComponent(medianHours) {
	if (medianHours == null || !Number.isFinite(medianHours)) return .3;
	return clamp01(medianHours / 48);
}
function overlapGap(ratio, hasSample) {
	if (!hasSample) return .55;
	return clamp01(1 - (ratio ?? 0));
}
function explainablePriorityScore(input, weights = PRIORITY_WEIGHTS_V1, scoreVersion = "v1") {
	const components = {
		coverage_gap: clamp01(input.coverage_gap),
		estimated_volume: clamp01(input.estimated_volume),
		lead_time: clamp01(input.lead_time),
		technical_reuse: clamp01(input.technical_reuse),
		source_reliability: clamp01(input.source_reliability),
		evidence_confidence: clamp01(input.evidence_confidence),
		public_access: clamp01(input.public_access),
		historical_depth: clamp01(input.historical_depth),
		maintenance_risk_inverted: clamp01(1 - input.maintenance_risk),
		integration_cost_inverted: clamp01(1 - input.integration_cost)
	};
	const weighted = {};
	let sum = 0;
	Object.keys(PRIORITY_WEIGHTS_V1).forEach((key) => {
		const w = weights[key] ?? 0;
		const value = components[key] * w;
		weighted[key] = Math.round(value * 1e4) / 1e4;
		sum += value;
	});
	const final_score = Math.round(sum * 1e3) / 10;
	const top = Object.keys(components).map((key) => ({
		key,
		value: weighted[key]
	})).sort((a, b) => b.value - a.value).slice(0, 3).map((row) => `${row.key} ${row.value.toFixed(3)}`).join(", ");
	return {
		score_version: scoreVersion,
		components,
		weights: { ...weights },
		weighted,
		final_score,
		rationale: `${scoreVersion} ponderado. Maiores contribuições: ${top}. Volume = ganho ainda não capturado, não tamanho de catálogo.`
	};
}
function adapterFitReuse(fit) {
	switch (fit) {
		case "GENERIC_JSON_FIT":
		case "GENERIC_ACTION_FIT":
		case "GENERIC_JSF_FIT": return .95;
		case "NEEDS_NEW_GENERIC_CAPABILITY": return .35;
		case "NEEDS_VENDOR_ADAPTER": return .12;
		case "UNSUITABLE": return .05;
		default: return .2;
	}
}
var WINDOW_ID = "win_2026_09_01_14";
var WINDOW_ID_V2 = "win_2026_09_08_14_live";
function jsonSafe(value) {
	return JSON.parse(JSON.stringify(value, (_key, inner) => {
		if (typeof inner === "bigint") return Number(inner);
		if (inner instanceof Date) return inner.toISOString();
		return inner;
	}));
}
function num(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "bigint") return Number(value);
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}
function iso(value) {
	if (value == null) return null;
	if (value instanceof Date) return value.toISOString();
	return String(value);
}
function asFit(value) {
	if (value === "GENERIC_JSON_FIT" || value === "GENERIC_ACTION_FIT" || value === "GENERIC_JSF_FIT" || value === "NEEDS_NEW_GENERIC_CAPABILITY" || value === "NEEDS_VENDOR_ADAPTER" || value === "UNSUITABLE") return value;
	return "UNSUITABLE";
}
function weightsFor(scoreVersion) {
	return scoreVersion === "v2" ? { ...PRIORITY_WEIGHTS_V2 } : { ...PRIORITY_WEIGHTS_V1 };
}
async function listProbeRuns(sql) {
	return jsonSafe((await sql.query(`select id, source_system_id, family, url, http_status, latency_ms, content_type,
            ok, excerpt, error, probed_at
     from source_probe_run
     order by probed_at desc`)).map((row) => ({
		id: String(row.id),
		source_system_id: row.source_system_id == null ? null : String(row.source_system_id),
		family: row.family == null ? null : String(row.family),
		url: String(row.url),
		http_status: row.http_status == null ? null : num(row.http_status),
		latency_ms: row.latency_ms == null ? null : num(row.latency_ms),
		content_type: row.content_type == null ? null : String(row.content_type),
		ok: Boolean(row.ok),
		excerpt: row.excerpt == null ? null : String(row.excerpt),
		error: row.error == null ? null : String(row.error),
		probed_at: iso(row.probed_at)
	})));
}
async function listEarlyOpportunities(sql) {
	return jsonSafe((await sql.query(`select r.id,
            l.canonical_procurement_id as canonical_id,
            coalesce(c.object, r.raw_payload->>'objeto', r.raw_payload->>'resumo') as object,
            coalesce(c.organization_name, r.raw_payload->>'razaoSocial') as organization_name,
            c.municipality,
            coalesce(c.uf, j.uf) as uf,
            s.name as local_source,
            s.id as local_source_id,
            coalesce(l.local_first_seen_at, r.first_seen_at) as first_seen_local,
            l.pncp_first_seen_at as first_seen_pncp,
            l.lead_time_hours,
            l.status as match_status,
            r.local_only_state
     from source_record r
     join source_system s on s.id = r.source_system_id
     left join jurisdiction j on j.id = s.jurisdiction_id
     left join source_entity_link l
       on l.source_system_id = r.source_system_id
      and l.source_external_id = r.source_identifier
      and l.canonical_entity_type in ('PNCP', 'STANDALONE', 'UNMATCHED')
     left join canonical_procurement c on c.id = l.canonical_procurement_id
     where s.technology_family not in ('PNCP', 'COMPRAS_GOV')
       and r.source_entity_type = 'procurement'
       and (
         r.local_only_state in ('PENDING_PNCP_MATCH', 'LOCAL_ONLY_PROVISIONAL', 'LOCAL_ONLY_CONFIRMED')
         or (l.lead_time_hours is not null and l.lead_time_hours > 0)
       )
     order by
       case
         when r.local_only_state in ('LOCAL_ONLY_PROVISIONAL', 'PENDING_PNCP_MATCH') then 0
         when r.local_only_state = 'LOCAL_ONLY_CONFIRMED' then 1
         else 2
       end,
       coalesce(l.lead_time_hours, 0) desc,
       r.first_seen_at asc
     limit 400`)).map((row) => {
		const localOnly = row.local_only_state == null ? null : String(row.local_only_state);
		const lead = row.lead_time_hours == null ? null : num(row.lead_time_hours);
		const kind = lead != null && lead > 0 && (localOnly === "MATCHED" || localOnly == null) ? "EARLY_MATCHED" : localOnly === "LOCAL_ONLY_CONFIRMED" ? "LOCAL_ONLY_CONFIRMED" : localOnly === "PENDING_PNCP_MATCH" ? "PENDING_PNCP_MATCH" : "LOCAL_ONLY_PROVISIONAL";
		return {
			id: String(row.id),
			canonical_id: row.canonical_id == null ? null : String(row.canonical_id),
			object: row.object == null ? null : String(row.object),
			organization_name: row.organization_name == null ? null : String(row.organization_name),
			municipality: row.municipality == null ? null : String(row.municipality),
			uf: row.uf == null ? null : String(row.uf),
			local_source: String(row.local_source ?? row.local_source_id),
			local_source_id: String(row.local_source_id),
			first_seen_local: iso(row.first_seen_local),
			first_seen_pncp: iso(row.first_seen_pncp),
			lead_time_hours: lead,
			match_status: row.match_status == null ? null : String(row.match_status),
			local_only_state: localOnly,
			kind
		};
	}));
}
async function familyLiveStats(sql, liveOnlyPcp = false) {
	const liveClause = liveOnlyPcp ? `and (
         s.technology_family <> 'PORTAL_COMPRAS_PUBLICAS'
         or r.ingestion_mode = 'LIVE_PUBLIC_API'
       )` : "";
	const [records, links, leads, sources] = await Promise.all([
		sql.query(`select coalesce(s.technology_family, 'UNKNOWN') as family,
              count(*)::int as n,
              count(*) filter (where r.local_only_state = 'LOCAL_ONLY_PROVISIONAL')::int as provisional,
              count(*) filter (where r.local_only_state = 'LOCAL_ONLY_CONFIRMED')::int as confirmed,
              count(*) filter (where r.local_only_state = 'PENDING_PNCP_MATCH')::int as pending
       from source_record r
       join source_system s on s.id = r.source_system_id
       where s.technology_family not in ('PNCP', 'COMPRAS_GOV')
         and r.source_entity_type = 'procurement'
         ${liveClause}
       group by 1`),
		sql.query(`select coalesce(s.technology_family, 'UNKNOWN') as family,
              count(distinct r.id) filter (
                where exists (
                  select 1 from source_entity_link l
                  where l.source_system_id = r.source_system_id
                    and l.source_external_id = r.source_identifier
                    and l.canonical_entity_type = 'PNCP'
                    and l.status in ('CONFIRMED','PROBABLE')
                )
              )::int as pncp,
              count(distinct r.id) filter (
                where exists (
                  select 1 from source_entity_link l
                  where l.source_system_id = r.source_system_id
                    and l.source_external_id = r.source_identifier
                    and l.canonical_entity_type = 'COMPRAS_GOV'
                    and l.status in ('CONFIRMED','PROBABLE')
                )
              )::int as compras
       from source_record r
       join source_system s on s.id = r.source_system_id
       where s.technology_family not in ('PNCP', 'COMPRAS_GOV')
         and r.source_entity_type = 'procurement'
         ${liveClause}
       group by 1`),
		sql.query(`select coalesce(s.technology_family, 'UNKNOWN') as family, l.lead_time_hours as hours
       from source_entity_link l
       join source_system s on s.id = l.source_system_id
       ${liveOnlyPcp ? `join source_record r
                on r.source_system_id = l.source_system_id
               and r.source_identifier = l.source_external_id
               and (
                 s.technology_family <> 'PORTAL_COMPRAS_PUBLICAS'
                 or r.ingestion_mode = 'LIVE_PUBLIC_API'
               )` : ""}
       where l.lead_time_hours is not null`),
		sql.query(`select s.id, s.technology_family, s.vendor_name, s.product_name,
              s.vendor_evidence_level, s.connector_type, s.classification_state,
              j.type as jurisdiction_type
       from source_system s
       left join jurisdiction j on j.id = s.jurisdiction_id`)
	]);
	return {
		records,
		links,
		leads,
		sources
	};
}
async function persistPrioritySnapshot(sql, windowId = WINDOW_ID, scoreVersion = "v1") {
	const liveOnlyPcp = scoreVersion === "v2";
	const weights = weightsFor(scoreVersion);
	const [{ records, links, leads, sources }, assessments, windows] = await Promise.all([
		familyLiveStats(sql, liveOnlyPcp),
		sql.query(`select * from family_coverage_metric where window_id = $1`, [windowId]),
		sql.query(`select * from coverage_window where id = $1`, [windowId])
	]);
	const windowLabel = String(windows[0]?.label ?? (liveOnlyPcp ? "coorte live 2026-09-08 a 2026-09-14" : "coorte 2026-09-01 a 2026-09-14"));
	const candidates = buildFamilyCandidates(sources);
	const byFamilyRecords = new Map(records.map((row) => [row.family, row]));
	const byFamilyLinks = new Map(links.map((row) => [row.family, row]));
	const leadsByFamily = /* @__PURE__ */ new Map();
	for (const row of leads) {
		const list = leadsByFamily.get(row.family) ?? [];
		list.push(num(row.hours));
		leadsByFamily.set(row.family, list);
	}
	const assessmentByFamily = new Map(assessments.map((row) => [String(row.family), row]));
	const families = /* @__PURE__ */ new Set([
		...assessmentByFamily.keys(),
		...byFamilyRecords.keys(),
		...candidates.map((row) => row.technology_family)
	]);
	const ranking = [];
	for (const family of families) {
		if (family === "PNCP" || family === "COMPRAS_GOV" || family === "UNKNOWN") continue;
		const rec = byFamilyRecords.get(family);
		const link = byFamilyLinks.get(family);
		const assessment = assessmentByFamily.get(family);
		const candidate = candidates.find((row) => row.technology_family === family);
		const local = num(rec?.n);
		const pncpMatched = num(link?.pncp);
		const comprasMatched = num(link?.compras);
		const overlap = recordOverlap({
			total_local_records: local,
			matched_pncp_records: pncpMatched,
			matched_comprasgov_records: comprasMatched,
			local_only_records: num(rec?.provisional) + num(rec?.confirmed) + num(rec?.pending),
			ambiguous_records: 0,
			rejected_matches: 0
		});
		const fit = asFit(assessment?.adapter_fit == null ? null : String(assessment.adapter_fit));
		const integrationCost = assessment?.integration_cost == null ? .7 : num(assessment.integration_cost);
		const maintenanceRisk = assessment?.maintenance_risk == null ? .5 : num(assessment.maintenance_risk);
		const uncaptured = assessment?.uncaptured_volume == null ? .4 : num(assessment.uncaptured_volume);
		const explained = explainablePriorityScore({
			coverage_gap: overlapGap(overlap.pncp_overlap_ratio, local > 0),
			estimated_volume: uncaptured,
			lead_time: leadTimeComponent(percentile(leadsByFamily.get(family) ?? [], 50)),
			technical_reuse: assessment?.technical_reuse == null ? adapterFitReuse(fit) : num(assessment.technical_reuse),
			source_reliability: assessment?.source_reliability == null ? .4 : num(assessment.source_reliability),
			evidence_confidence: assessment?.evidence_confidence == null ? Math.min(1, (candidate?.verified_sources ?? 0) / 5) : num(assessment.evidence_confidence),
			public_access: assessment?.public_access_score == null ? .4 : num(assessment.public_access_score),
			historical_depth: assessment?.historical_depth == null ? .2 : num(assessment.historical_depth),
			maintenance_risk: maintenanceRisk,
			integration_cost: integrationCost
		}, weights, scoreVersion);
		ranking.push({
			family,
			rank: 0,
			verified_entities: candidate?.verified_sources ?? 0,
			records_local: local,
			pncp_overlap_ratio: overlap.pncp_overlap_ratio,
			comprasgov_overlap_ratio: overlap.comprasgov_overlap_ratio,
			local_only: overlap.local_only_records,
			median_lead_time_hours: percentile(leadsByFamily.get(family) ?? [], 50),
			adapter_fit: fit,
			generic_reuse: candidate?.generic_reuse ?? "NO-GO",
			commercial_adapter: candidate?.commercial_adapter ?? "NO-GO",
			estimated_records_month: assessment?.estimated_records_month == null ? null : num(assessment.estimated_records_month),
			estimation_method: assessment?.estimation_method == null ? null : String(assessment.estimation_method),
			estimation_confidence: assessment?.estimation_confidence == null ? null : String(assessment.estimation_confidence),
			uncaptured_volume: uncaptured,
			integration_cost: integrationCost,
			maintenance_risk: maintenanceRisk,
			components: explained.components,
			weights: explained.weights,
			final_score: explained.final_score,
			score_version: explained.score_version,
			rationale: explained.rationale,
			window_label: windowLabel
		});
	}
	ranking.sort((a, b) => b.final_score - a.final_score);
	ranking.forEach((row, index) => {
		row.rank = index + 1;
	});
	for (const row of ranking) await sql.query(`insert into family_priority_score (
         id, window_id, family, score_version, components_json, weights_json,
         final_score, rationale, ranked_at
       ) values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,now())
       on conflict (window_id, family, score_version) do update set
         components_json = excluded.components_json,
         weights_json = excluded.weights_json,
         final_score = excluded.final_score,
         rationale = excluded.rationale,
         ranked_at = excluded.ranked_at`, [
		`fps_${windowId}_${row.family}_${scoreVersion}`,
		windowId,
		row.family,
		scoreVersion,
		JSON.stringify(row.components),
		JSON.stringify(row.weights),
		row.final_score,
		row.rationale
	]);
	return ranking;
}
async function milestone5Metrics(sql) {
	const [windows, ranking, probes, pcpCounts, baseCount, earlyCounts] = await Promise.all([
		sql.query(`select * from coverage_window where id = $1`, [WINDOW_ID]),
		persistPrioritySnapshot(sql),
		listProbeRuns(sql),
		sql.query(`select count(*)::int as n from source_system
       where technology_family = 'PORTAL_COMPRAS_PUBLICAS'
         and vendor_evidence_level = 'VERIFIED'
         and id <> 'src_pcp_platform'`),
		sql.query(`select count(*)::int as n from municipality_base`),
		sql.query(`select
         count(*) filter (
           where r.local_only_state = 'MATCHED' and l.lead_time_hours > 0
         )::int as matched,
         count(*) filter (where r.local_only_state = 'LOCAL_ONLY_PROVISIONAL')::int as provisional,
         count(*) filter (where r.local_only_state = 'LOCAL_ONLY_CONFIRMED')::int as confirmed
       from source_record r
       join source_system s on s.id = r.source_system_id
       left join source_entity_link l
         on l.source_system_id = r.source_system_id
        and l.source_external_id = r.source_identifier
        and l.canonical_entity_type = 'PNCP'
       where s.technology_family not in ('PNCP', 'COMPRAS_GOV')
         and r.source_entity_type = 'procurement'`)
	]);
	const window = windows[0];
	const pcp = ranking.find((row) => row.family === "PORTAL_COMPRAS_PUBLICAS");
	const chosen = ranking[0] ?? null;
	const technicalSamples = new Set(probes.map((row) => row.family).filter(Boolean)).size;
	const pcpReady = ranking.some((row) => row.family === "PORTAL_COMPRAS_PUBLICAS" && row.generic_reuse === "GO");
	const go = ranking.length >= 5 && technicalSamples >= 3 && Boolean(chosen) && pcpReady && num(pcpCounts[0]?.n) >= 5 && (pcp?.records_local ?? 0) >= 15 && (pcp?.median_lead_time_hours ?? 0) > 0;
	return jsonSafe({
		score_version: "v1",
		window_id: WINDOW_ID,
		window_label: String(window?.label ?? "coorte 2026-09-01 a 2026-09-14"),
		window_start: iso(window?.window_start) ?? "2026-09-01T00:00:00.000Z",
		window_end: iso(window?.window_end) ?? "2026-09-14T23:59:59.000Z",
		families_evaluated: ranking.length,
		families_with_technical_sample: technicalSamples,
		chosen_family: chosen?.family ?? null,
		chosen_score: chosen?.final_score ?? null,
		chosen_adapter_fit: chosen?.adapter_fit ?? null,
		pcp_verified_entes: num(pcpCounts[0]?.n),
		pcp_records: pcp?.records_local ?? 0,
		pcp_pncp_overlap_ratio: pcp?.pncp_overlap_ratio ?? 0,
		pcp_comprasgov_overlap_ratio: pcp?.comprasgov_overlap_ratio ?? 0,
		pcp_local_only: pcp?.local_only ?? 0,
		pcp_median_lead_time_hours: pcp?.median_lead_time_hours ?? null,
		early_matched: num(earlyCounts[0]?.matched),
		early_provisional: num(earlyCounts[0]?.provisional),
		early_confirmed: num(earlyCounts[0]?.confirmed),
		municipality_base_count: num(baseCount[0]?.n),
		commercial_adapter_verdict: "NO-GO",
		generic_reuse_verdict: pcpReady ? "GO" : "NO-GO",
		milestone_verdict: go ? "GO" : "NO-GO",
		ranking,
		probes
	});
}
async function milestone6Metrics(sql) {
	const verdict = classifyPublicKey(PCP_APIPCP_PUBLICKEY_EVIDENCE);
	const [windows, ranking, liveCounts, fixtureCounts, liveBySource, checkpoints, probes, reportRows, pcpLeads, readiness] = await Promise.all([
		sql.query(`select * from coverage_window where id = $1`, [WINDOW_ID_V2]),
		persistPrioritySnapshot(sql, WINDOW_ID_V2, "v2"),
		sql.query(`select count(*)::int as n
       from source_record r
       join source_system s on s.id = r.source_system_id
       where s.technology_family = 'PORTAL_COMPRAS_PUBLICAS'
         and r.source_entity_type = 'procurement'
         and r.ingestion_mode = 'LIVE_PUBLIC_API'`),
		sql.query(`select count(*)::int as n
       from source_record r
       join source_system s on s.id = r.source_system_id
       where s.technology_family = 'PORTAL_COMPRAS_PUBLICAS'
         and r.source_entity_type = 'procurement'
         and coalesce(r.ingestion_mode, 'MANUAL_FIXTURE') <> 'LIVE_PUBLIC_API'`),
		sql.query(`select s.id, s.name, count(r.id)::int as n, c.connector_readiness as readiness
       from source_system s
       left join source_connector_config c on c.source_system_id = s.id
       left join source_record r
         on r.source_system_id = s.id
        and r.source_entity_type = 'procurement'
        and r.ingestion_mode = 'LIVE_PUBLIC_API'
       where s.technology_family = 'PORTAL_COMPRAS_PUBLICAS'
         and s.id <> 'src_pcp_platform'
         and s.vendor_evidence_level = 'VERIFIED'
       group by s.id, s.name, c.connector_readiness
       order by s.name`),
		sql.query(`select count(*)::int as n from ingestion_checkpoint`),
		listProbeRuns(sql),
		sql.query(`select payload from operational_report where id = 'opr_m6_pcp'`),
		sql.query(`select l.lead_time_hours as hours
       from source_entity_link l
       join source_system s on s.id = l.source_system_id
       join source_record r
         on r.source_system_id = l.source_system_id
        and r.source_identifier = l.source_external_id
       where s.technology_family = 'PORTAL_COMPRAS_PUBLICAS'
         and r.ingestion_mode = 'LIVE_PUBLIC_API'
         and l.lead_time_hours is not null`),
		sql.query(`select source_system_id, connector_readiness from source_connector_config
       where source_system_id like 'src_pcp_%'`)
	]);
	const window = windows[0];
	const pcp = ranking.find((row) => row.family === "PORTAL_COMPRAS_PUBLICAS");
	const bll = ranking.find((row) => row.family === "BLL");
	const chosen = ranking[0] ?? null;
	const liveRecords = num(liveCounts[0]?.n);
	const fixtureRecords = num(fixtureCounts[0]?.n);
	const liveEntes = liveBySource.filter((row) => num(row.n) > 0).length;
	const report = reportRows[0]?.payload && typeof reportRows[0].payload === "object" ? reportRows[0].payload : {};
	const pagination = report.pagination ?? {};
	const schema = report.schema ?? {};
	const page2Distinct = Boolean(pagination.page2_distinct);
	const liveProbes = probes.filter((row) => String(row.id).startsWith("probe_m6_"));
	const successProbes = liveProbes.filter((row) => row.ok);
	const latencies = liveProbes.map((row) => row.latency_ms).filter((value) => value != null && Number.isFinite(value));
	const leadHours = pcpLeads.map((row) => num(row.hours)).filter((n) => Number.isFinite(n));
	const pcpReady = ranking.some((row) => row.family === "PORTAL_COMPRAS_PUBLICAS" && row.generic_reuse === "GO");
	readiness.every((row) => {
		return row.connector_readiness !== "AUTH_REQUIRED" || row.source_system_id === "src_pcp_platform";
	});
	const go = verdict.semantics === "PRIVATE_CREDENTIAL" && !verdict.allowedInPublicConnectorConfig && liveEntes >= 5 && liveRecords >= 100 && page2Distinct && ranking.length >= 5 && pcpReady;
	return jsonSafe({
		score_version: "v2",
		window_id: WINDOW_ID_V2,
		window_label: String(window?.label ?? "coorte live 2026-09-08 a 2026-09-14"),
		window_start: iso(window?.window_start) ?? "2026-09-08T00:00:00.000Z",
		window_end: iso(window?.window_end) ?? "2026-09-14T23:59:59.000Z",
		public_key_semantics: verdict.semantics,
		public_key_classification: verdict.classification,
		public_key_allowed_in_config: verdict.allowedInPublicConnectorConfig,
		public_key_readiness: verdict.readiness,
		public_key_rationale: verdict.rationale,
		live_entes: liveEntes,
		live_records: liveRecords,
		fixture_records: fixtureRecords,
		page2_distinct: page2Distinct,
		pagination_type: String(pagination.type ?? "PAGE_NUMBER"),
		shared_schema: Boolean(schema.shared_schema ?? true),
		schema_hashes: Array.isArray(schema.hashes) ? schema.hashes.map(String) : [],
		items_observed: Boolean(report.items),
		documents_observed: Boolean(report.documents),
		detail_observed: Boolean(report.detail),
		pcp_pncp_overlap_ratio: pcp?.pncp_overlap_ratio ?? 0,
		pcp_comprasgov_overlap_ratio: pcp?.comprasgov_overlap_ratio ?? 0,
		pcp_local_only: pcp?.local_only ?? 0,
		pcp_median_lead_time_hours: percentile(leadHours, 50),
		pcp_p75_lead_time_hours: percentile(leadHours, 75),
		pcp_p95_lead_time_hours: percentile(leadHours, 95),
		reliability_success_ratio: liveProbes.length > 0 ? successProbes.length / liveProbes.length : null,
		reliability_median_latency_ms: percentile(latencies, 50),
		checkpoints: num(checkpoints[0]?.n),
		chosen_family: chosen?.family ?? null,
		chosen_score: chosen?.final_score ?? null,
		pcp_score: pcp?.final_score ?? null,
		bll_score: bll?.final_score ?? null,
		commercial_adapter_verdict: "NO-GO",
		generic_reuse_verdict: pcpReady ? "GO" : "NO-GO",
		milestone_verdict: go ? "GO" : "NO-GO",
		ranking,
		live_ente_rows: liveBySource.map((row) => ({
			id: row.id,
			label: row.name,
			count: num(row.n),
			readiness: row.readiness
		})),
		probes: liveProbes.length > 0 ? liveProbes : probes.slice(0, 12)
	});
}
//#endregion
export { listEarlyOpportunities, listProbeRuns, milestone5Metrics, milestone6Metrics, PRIORITY_WEIGHTS_V2 as n, persistPrioritySnapshot, PRIORITY_WEIGHTS_V1 as t };
