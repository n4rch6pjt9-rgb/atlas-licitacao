import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-BuBiEJEB.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function requireId(data) {
	const rec = data && typeof data === "object" ? data : {};
	const id = typeof rec.id === "string" ? rec.id.trim() : "";
	if (!id) throw new Error("id is required");
	return { id };
}
function requireFamily(data) {
	const rec = data && typeof data === "object" ? data : {};
	const family = typeof rec.family === "string" ? rec.family.trim() : "";
	if (!family) throw new Error("family is required");
	return { family };
}
function parseDiscover(data) {
	const { id } = requireId(data);
	const yearRaw = data.year;
	const year = typeof yearRaw === "number" ? yearRaw : typeof yearRaw === "string" && yearRaw.trim() ? Number(yearRaw) : void 0;
	if (year !== void 0 && !Number.isFinite(year)) throw new Error("year must be a number");
	return year === void 0 ? { id } : {
		id,
		year
	};
}
function parseRegister(data) {
	const rec = data && typeof data === "object" ? data : {};
	const name = typeof rec.name === "string" ? rec.name.trim() : "";
	const baseUrl = typeof rec.baseUrl === "string" ? rec.baseUrl.trim() : "";
	const jurisdictionId = typeof rec.jurisdictionId === "string" ? rec.jurisdictionId.trim() : "";
	const functionalFamily = typeof rec.functionalFamily === "string" ? rec.functionalFamily.trim() : void 0;
	if (!name) throw new Error("name is required");
	if (!baseUrl) throw new Error("baseUrl is required");
	if (!jurisdictionId) throw new Error("jurisdictionId is required");
	return {
		name,
		baseUrl,
		jurisdictionId,
		functionalFamily
	};
}
async function withSql(fn) {
	const { getSql } = await import("./db-UxipSq6H.mjs");
	const { ensureSeeded } = await import("./seed.server-DIgxylBp.mjs");
	const sql = await getSql();
	await ensureSeeded(sql);
	return fn(sql);
}
var listSourcesFn_createServerFn_handler = createServerRpc({
	id: "70790ed9a18c8ae524dbe9b4436488f15fedc61f9bf1d93e29473985b4121a7c",
	name: "listSourcesFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listSourcesFn.__executeServer(opts));
var listSourcesFn = createServerFn({ method: "GET" }).handler(listSourcesFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listSources } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return listSources(sql);
	});
});
var getSourceFn_createServerFn_handler = createServerRpc({
	id: "8ef86eb6815ccd235e0f71b5c7c9d9b74d6474a1544a8cc91432d7c52a0b53fe",
	name: "getSourceFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getSourceFn.__executeServer(opts));
var getSourceFn = createServerFn({ method: "GET" }).validator(requireId).handler(getSourceFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { getSourceDetail } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return getSourceDetail(sql, data.id);
	});
});
var listFamiliesFn_createServerFn_handler = createServerRpc({
	id: "21fb2d85117cd17fc8961971c0398abfb8c9b95719f8e8ac578c360031c3e54a",
	name: "listFamiliesFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listFamiliesFn.__executeServer(opts));
var listFamiliesFn = createServerFn({ method: "GET" }).handler(listFamiliesFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listFamilies } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return listFamilies(sql);
	});
});
var getFamilySourcesFn_createServerFn_handler = createServerRpc({
	id: "b96c0b4b3913627c76ebc1b6200bcd042bb7510d74d77a825342146f6d34993e",
	name: "getFamilySourcesFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getFamilySourcesFn.__executeServer(opts));
var getFamilySourcesFn = createServerFn({ method: "GET" }).validator(requireFamily).handler(getFamilySourcesFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { listSources } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return listSources(sql, { family: data.family });
	});
});
var getMetricsFn_createServerFn_handler = createServerRpc({
	id: "415cbdd3eb3c738b19ccdfdd0d7f9ea420f5e5a4b8482737448e5008b05f7f8d",
	name: "getMetricsFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getMetricsFn.__executeServer(opts));
var getMetricsFn = createServerFn({ method: "GET" }).handler(getMetricsFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { metrics } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return metrics(sql);
	});
});
var getMatrixFn_createServerFn_handler = createServerRpc({
	id: "a5eca7854b334c587adb53b0bd78fd2344150cf54b8dce614bebb777580de7dc",
	name: "getMatrixFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getMatrixFn.__executeServer(opts));
var getMatrixFn = createServerFn({ method: "GET" }).handler(getMatrixFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { capabilityMatrix } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return capabilityMatrix(sql);
	});
});
var fingerprintSourceFn_createServerFn_handler = createServerRpc({
	id: "ff95650c00b11d45081a26dd9bed888a7411c2e527234a4145862866c992620e",
	name: "fingerprintSourceFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => fingerprintSourceFn.__executeServer(opts));
var fingerprintSourceFn = createServerFn({ method: "POST" }).validator(requireId).handler(fingerprintSourceFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { runFingerprint } = await import("./fingerprint-run.server-CE660Q-k.mjs");
		return runFingerprint(sql, data.id);
	});
});
var discoverSourceFn_createServerFn_handler = createServerRpc({
	id: "115bf44e41ea9161d4b7c191c0877c77285c8db2e48902af758e1a988ccb2f63",
	name: "discoverSourceFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => discoverSourceFn.__executeServer(opts));
var discoverSourceFn = createServerFn({ method: "POST" }).validator(parseDiscover).handler(discoverSourceFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { discoverSource } = await import("./discover.server-CFpFTj_b.mjs");
		const raw = await discoverSource(sql, data.id, { year: data.year });
		return JSON.parse(JSON.stringify(raw ?? { records: [] }));
	});
});
var registerSourceFn_createServerFn_handler = createServerRpc({
	id: "32aef602231761d423276c895b38b4e7f31ac7de34ebd7d342128dc9f576661b",
	name: "registerSourceFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => registerSourceFn.__executeServer(opts));
var registerSourceFn = createServerFn({ method: "POST" }).validator(parseRegister).handler(registerSourceFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { insertRegisteredSource } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return insertRegisteredSource(sql, data);
	});
});
var verifySourceFn_createServerFn_handler = createServerRpc({
	id: "12db74f1d5e7d6a138710405a1da6ec487176878b2dc6cd054d9e134f80bfaca",
	name: "verifySourceFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => verifySourceFn.__executeServer(opts));
var verifySourceFn = createServerFn({ method: "POST" }).validator(requireId).handler(verifySourceFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { runFingerprint } = await import("./fingerprint-run.server-CE660Q-k.mjs");
		return runFingerprint(sql, data.id);
	});
});
var listJurisdictionsFn_createServerFn_handler = createServerRpc({
	id: "aff5abfa2c38ee553f88772457f862eefb6036f5b9a90f6d196941d1fc1d9750",
	name: "listJurisdictionsFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listJurisdictionsFn.__executeServer(opts));
var listJurisdictionsFn = createServerFn({ method: "GET" }).handler(listJurisdictionsFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listJurisdictions } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return listJurisdictions(sql);
	});
});
var listAlertsFn_createServerFn_handler = createServerRpc({
	id: "c4db9c2a93b10b9a1a94caea977b00b3e4cc5b26341acf0a9d44811af346cab3",
	name: "listAlertsFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listAlertsFn.__executeServer(opts));
var listAlertsFn = createServerFn({ method: "GET" }).handler(listAlertsFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listAlerts } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return listAlerts(sql);
	});
});
var listFamilyCandidatesFn_createServerFn_handler = createServerRpc({
	id: "4b56c9e736131c3428cf0acf85e5e0dbcf6e86f3a811ad0a0809bc14a48cbe93",
	name: "listFamilyCandidatesFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listFamilyCandidatesFn.__executeServer(opts));
var listFamilyCandidatesFn = createServerFn({ method: "GET" }).handler(listFamilyCandidatesFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listFamilyCandidates } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return listFamilyCandidates(sql);
	});
});
var listCensusFn_createServerFn_handler = createServerRpc({
	id: "17328def8e280bb46cedacac08f385b970ff375a120d731f03c0693a069f02a5",
	name: "listCensusFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listCensusFn.__executeServer(opts));
var listCensusFn = createServerFn({ method: "GET" }).handler(listCensusFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listCensusRows } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return listCensusRows(sql);
	});
});
var getMilestone3Fn_createServerFn_handler = createServerRpc({
	id: "0a7b1949be465a0a4fe564e2d11b1af033227345d3766518e0f8c6027e1f8e38",
	name: "getMilestone3Fn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getMilestone3Fn.__executeServer(opts));
var getMilestone3Fn = createServerFn({ method: "GET" }).handler(getMilestone3Fn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { milestone3Metrics } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return milestone3Metrics(sql);
	});
});
function parseSearch(data) {
	const rec = data && typeof data === "object" ? data : {};
	const q = typeof rec.q === "string" ? rec.q.trim() : "";
	const uf = typeof rec.uf === "string" ? rec.uf.trim() : "";
	const modality = typeof rec.modality === "string" ? rec.modality.trim() : "";
	const status = typeof rec.status === "string" ? rec.status.trim() : "";
	return {
		...q ? { q } : {},
		...uf ? { uf } : {},
		...modality ? { modality } : {},
		...status ? { status } : {}
	};
}
var getMilestone4Fn_createServerFn_handler = createServerRpc({
	id: "b19cc7b1769220d5d6b9659ce79fc5f01c8b094087135c209767051add4f7b6a",
	name: "getMilestone4Fn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getMilestone4Fn.__executeServer(opts));
var getMilestone4Fn = createServerFn({ method: "GET" }).handler(getMilestone4Fn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { milestone4Metrics } = await import("./coverage.server-DMEnGzqD.mjs");
		return milestone4Metrics(sql);
	});
});
var listSearchFn_createServerFn_handler = createServerRpc({
	id: "f44db68f0a386ad12b807a15cd12eb2cbff430f0291b69a1ccd868af5db5b69c",
	name: "listSearchFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listSearchFn.__executeServer(opts));
var listSearchFn = createServerFn({ method: "GET" }).validator(parseSearch).handler(listSearchFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { searchIntelligence } = await import("./intelligence.server-BvA1TlYE.mjs");
		return searchIntelligence(sql, data);
	});
});
var listMunicipalityCensusFn_createServerFn_handler = createServerRpc({
	id: "5b90dd6dd4e71e23e3b30208f0c09b8448795c9c45c196ac5578f85e62fe8490",
	name: "listMunicipalityCensusFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listMunicipalityCensusFn.__executeServer(opts));
var listMunicipalityCensusFn = createServerFn({ method: "GET" }).handler(listMunicipalityCensusFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listMunicipalityCensus } = await import("./coverage.server-DMEnGzqD.mjs");
		return listMunicipalityCensus(sql);
	});
});
var listLocalOnlyFn_createServerFn_handler = createServerRpc({
	id: "6013369c57e49028c7e568faf3272a64a567247bdb1172a6d9f2ced0c7ccb7a2",
	name: "listLocalOnlyFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listLocalOnlyFn.__executeServer(opts));
var listLocalOnlyFn = createServerFn({ method: "GET" }).handler(listLocalOnlyFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listLocalOnly } = await import("./coverage.server-DMEnGzqD.mjs");
		return listLocalOnly(sql);
	});
});
var listComparisonsFn_createServerFn_handler = createServerRpc({
	id: "a16dd39dce70895379c2d32a0ac147d43e1507fce8f7740a12a5a80f89d28bc9",
	name: "listComparisonsFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listComparisonsFn.__executeServer(opts));
var listComparisonsFn = createServerFn({ method: "GET" }).handler(listComparisonsFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listComparisons } = await import("./coverage.server-DMEnGzqD.mjs");
		return listComparisons(sql);
	});
});
var listSourceRecordsFn_createServerFn_handler = createServerRpc({
	id: "bf9883e665f44e14624684951169bcc7b27b9ed520fbb9a8b3f7dcd07ae0d3af",
	name: "listSourceRecordsFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listSourceRecordsFn.__executeServer(opts));
var listSourceRecordsFn = createServerFn({ method: "GET" }).validator(requireId).handler(listSourceRecordsFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { listSourceRecords } = await import("./coverage.server-DMEnGzqD.mjs");
		return listSourceRecords(sql, data.id);
	});
});
var getMilestone5Fn_createServerFn_handler = createServerRpc({
	id: "4a3edfabb4bf6b4b611c5fb10c4058862d1b2f337329e15638ef19b17173e619",
	name: "getMilestone5Fn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getMilestone5Fn.__executeServer(opts));
var getMilestone5Fn = createServerFn({ method: "GET" }).handler(getMilestone5Fn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { milestone5Metrics } = await import("./priority.server-B4IJ691O.mjs");
		return milestone5Metrics(sql);
	});
});
var getMilestone6Fn_createServerFn_handler = createServerRpc({
	id: "024345a3d1dea3bf4b297ca7eee852ef83c60c2d050a25ef8a993af393ac2dd6",
	name: "getMilestone6Fn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getMilestone6Fn.__executeServer(opts));
var getMilestone6Fn = createServerFn({ method: "GET" }).handler(getMilestone6Fn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { milestone6Metrics } = await import("./priority.server-B4IJ691O.mjs");
		return milestone6Metrics(sql);
	});
});
var listFamilyRankingFn_createServerFn_handler = createServerRpc({
	id: "d3ac0ad28c6ecf7e37b857c84131a368c137c78aeaec5c1b26a60004ce5896f2",
	name: "listFamilyRankingFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listFamilyRankingFn.__executeServer(opts));
var listFamilyRankingFn = createServerFn({ method: "GET" }).handler(listFamilyRankingFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { persistPrioritySnapshot } = await import("./priority.server-B4IJ691O.mjs");
		return persistPrioritySnapshot(sql);
	});
});
var listEarlyOpportunitiesFn_createServerFn_handler = createServerRpc({
	id: "03936f2519b06330961214135aae2d3df1b82726a50f93c5ca02db4532dd34b6",
	name: "listEarlyOpportunitiesFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listEarlyOpportunitiesFn.__executeServer(opts));
var listEarlyOpportunitiesFn = createServerFn({ method: "GET" }).handler(listEarlyOpportunitiesFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listEarlyOpportunities } = await import("./priority.server-B4IJ691O.mjs");
		return listEarlyOpportunities(sql);
	});
});
var listProbeRunsFn_createServerFn_handler = createServerRpc({
	id: "da35eb03d7799bb6cc4940ae37bfa160bf9129e8074fe01316facfb6cbfb19b0",
	name: "listProbeRunsFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listProbeRunsFn.__executeServer(opts));
var listProbeRunsFn = createServerFn({ method: "GET" }).handler(listProbeRunsFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listProbeRuns } = await import("./priority.server-B4IJ691O.mjs");
		return listProbeRuns(sql);
	});
});
function parseOppFilters(data) {
	const rec = data && typeof data === "object" ? data : {};
	const sortRaw = rec.sort;
	const sort = sortRaw === "deadline" || sortRaw === "attention" || sortRaw === "value" || sortRaw === "newest" ? sortRaw : void 0;
	const minRaw = rec.minValue;
	const minValue = typeof minRaw === "number" && Number.isFinite(minRaw) ? minRaw : typeof minRaw === "string" && Number.isFinite(Number(minRaw)) ? Number(minRaw) : void 0;
	return {
		q: typeof rec.q === "string" ? rec.q : void 0,
		uf: typeof rec.uf === "string" ? rec.uf : void 0,
		horizon: typeof rec.horizon === "string" ? rec.horizon : void 0,
		earlyOnly: rec.earlyOnly === true || rec.earlyOnly === "true",
		modality: typeof rec.modality === "string" ? rec.modality : void 0,
		organizationId: typeof rec.organizationId === "string" ? rec.organizationId : void 0,
		catalogCode: typeof rec.catalogCode === "string" ? rec.catalogCode : void 0,
		minValue,
		sort
	};
}
var getMilestone7Fn_createServerFn_handler = createServerRpc({
	id: "64912c93fbbf8ff701a17bd5eabbc282cce0530fb5b79e7f8aa27f46619c46b7",
	name: "getMilestone7Fn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getMilestone7Fn.__executeServer(opts));
var getMilestone7Fn = createServerFn({ method: "GET" }).handler(getMilestone7Fn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { milestone7Metrics } = await import("./intelligence.server-BvA1TlYE.mjs");
		return milestone7Metrics(sql);
	});
});
var listOpportunitiesFn_createServerFn_handler = createServerRpc({
	id: "f73f35ce0b69a88db1ac9d21b1f722e3ab893fa760f2b409f5eac772acb8f1a3",
	name: "listOpportunitiesFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listOpportunitiesFn.__executeServer(opts));
var listOpportunitiesFn = createServerFn({ method: "GET" }).validator((data) => parseOppFilters(data)).handler(listOpportunitiesFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { listOpportunities } = await import("./intelligence.server-BvA1TlYE.mjs");
		return listOpportunities(sql, data);
	});
});
var getOpportunityFn_createServerFn_handler = createServerRpc({
	id: "dd344b1deafb15a2553e2fa8fa447fdd5ed7344a955ac7d7f29e19cee678de12",
	name: "getOpportunityFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getOpportunityFn.__executeServer(opts));
var getOpportunityFn = createServerFn({ method: "GET" }).validator(requireId).handler(getOpportunityFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { getOpportunityDetail } = await import("./intelligence.server-BvA1TlYE.mjs");
		return getOpportunityDetail(sql, data.id);
	});
});
var listPlanningFn_createServerFn_handler = createServerRpc({
	id: "4f8862abfcfc51557fb8e3187554fbf7cafb824e459d360917f1a411d5842b57",
	name: "listPlanningFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listPlanningFn.__executeServer(opts));
var listPlanningFn = createServerFn({ method: "GET" }).validator((data) => {
	const rec = data && typeof data === "object" ? data : {};
	return { origin: typeof rec.origin === "string" ? rec.origin : void 0 };
}).handler(listPlanningFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { listPlanning } = await import("./intelligence.server-BvA1TlYE.mjs");
		return listPlanning(sql, data.origin);
	});
});
var listFutureDemandFn_createServerFn_handler = createServerRpc({
	id: "77c8bfe2419a91f3a32f7c67fc00455376c2e5fc2b2756bc89a70ad54f8a3425",
	name: "listFutureDemandFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listFutureDemandFn.__executeServer(opts));
var listFutureDemandFn = createServerFn({ method: "GET" }).handler(listFutureDemandFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listFutureDemand } = await import("./intelligence.server-BvA1TlYE.mjs");
		return listFutureDemand(sql);
	});
});
var listOrganizationsFn_createServerFn_handler = createServerRpc({
	id: "f17e8b9f1508327b0879152880157983d26dc930518aa9db808280f288e0abf5",
	name: "listOrganizationsFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listOrganizationsFn.__executeServer(opts));
var listOrganizationsFn = createServerFn({ method: "GET" }).handler(listOrganizationsFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listOrganizations } = await import("./intelligence.server-BvA1TlYE.mjs");
		return listOrganizations(sql);
	});
});
var getOrganizationFn_createServerFn_handler = createServerRpc({
	id: "433aa3e1c32f97379bbac80d74cec1181eefaa15281c6052064d2e475289a584",
	name: "getOrganizationFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getOrganizationFn.__executeServer(opts));
var getOrganizationFn = createServerFn({ method: "GET" }).validator(requireId).handler(getOrganizationFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { getOrganization } = await import("./intelligence.server-BvA1TlYE.mjs");
		return getOrganization(sql, data.id);
	});
});
var listItemsFn_createServerFn_handler = createServerRpc({
	id: "1d650b4b05f27ae2a51af15dd079a0902d160d623bf16a54a05bbd5ea9fba31b",
	name: "listItemsFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listItemsFn.__executeServer(opts));
var listItemsFn = createServerFn({ method: "GET" }).handler(listItemsFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listItems } = await import("./intelligence.server-BvA1TlYE.mjs");
		return listItems(sql);
	});
});
var getItemFn_createServerFn_handler = createServerRpc({
	id: "f7d37ae3d3cf0eeae50c9dd08df67f20e9e8ec86aaac1551f8e70552800416f6",
	name: "getItemFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getItemFn.__executeServer(opts));
var getItemFn = createServerFn({ method: "GET" }).validator(requireId).handler(getItemFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { getItem } = await import("./intelligence.server-BvA1TlYE.mjs");
		return getItem(sql, data.id);
	});
});
var listArpsFn_createServerFn_handler = createServerRpc({
	id: "367bc55cbebb11153b836d1211aed9d32869be0a39281a58f3977bda706eb17a",
	name: "listArpsFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listArpsFn.__executeServer(opts));
var listArpsFn = createServerFn({ method: "GET" }).handler(listArpsFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listArps } = await import("./intelligence.server-BvA1TlYE.mjs");
		return listArps(sql);
	});
});
var listRecurrenceFn_createServerFn_handler = createServerRpc({
	id: "353ee8a1d5eae90ee4d6520de36e37beb2bbdb58885678f1b7382861ddfbbcc9",
	name: "listRecurrenceFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listRecurrenceFn.__executeServer(opts));
var listRecurrenceFn = createServerFn({ method: "GET" }).handler(listRecurrenceFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listRecurrence } = await import("./intelligence.server-BvA1TlYE.mjs");
		return listRecurrence(sql);
	});
});
var listAlertRulesFn_createServerFn_handler = createServerRpc({
	id: "de19adfd0aa5be60b476f8585703bfc1257550d37f970d4176166d257d13067b",
	name: "listAlertRulesFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listAlertRulesFn.__executeServer(opts));
var listAlertRulesFn = createServerFn({ method: "GET" }).handler(listAlertRulesFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listAlertRules } = await import("./intelligence.server-BvA1TlYE.mjs");
		return listAlertRules(sql);
	});
});
var listAlertEventsFn_createServerFn_handler = createServerRpc({
	id: "1bfdd4ea4452058f2979cbbe5e8ea7d71c44ab420d0f7cb4a401e2f407c7cd6c",
	name: "listAlertEventsFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listAlertEventsFn.__executeServer(opts));
var listAlertEventsFn = createServerFn({ method: "GET" }).handler(listAlertEventsFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listAlertEvents } = await import("./intelligence.server-BvA1TlYE.mjs");
		return listAlertEvents(sql);
	});
});
var upsertAlertRuleFn_createServerFn_handler = createServerRpc({
	id: "09b2d919678c6394ad3a0b5736dbba4e3f53057942ad0112a4cf581f699256e3",
	name: "upsertAlertRuleFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => upsertAlertRuleFn.__executeServer(opts));
var upsertAlertRuleFn = createServerFn({ method: "POST" }).validator((data) => {
	const rec = data && typeof data === "object" ? data : {};
	const name = typeof rec.name === "string" ? rec.name.trim() : "";
	if (!name) throw new Error("name is required");
	const event_types = Array.isArray(rec.event_types) ? rec.event_types.filter((item) => typeof item === "string") : ["NEW_PROCUREMENT"];
	const filters = rec.filters && typeof rec.filters === "object" ? rec.filters : {};
	return {
		id: typeof rec.id === "string" ? rec.id : void 0,
		name,
		event_types,
		filters,
		min_change_priority: typeof rec.min_change_priority === "string" ? rec.min_change_priority : null,
		active: rec.active !== false
	};
}).handler(upsertAlertRuleFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { upsertAlertRule } = await import("./intelligence.server-BvA1TlYE.mjs");
		await upsertAlertRule(sql, data);
		return { ok: true };
	});
});
var setAlertRuleActiveFn_createServerFn_handler = createServerRpc({
	id: "57acafe910fa0a636aa608f934bba39ac0fb58a066fee9456cf8130de97ea6f6",
	name: "setAlertRuleActiveFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => setAlertRuleActiveFn.__executeServer(opts));
var setAlertRuleActiveFn = createServerFn({ method: "POST" }).validator((data) => {
	const { id } = requireId(data);
	return {
		id,
		active: data.active !== false
	};
}).handler(setAlertRuleActiveFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { setAlertRuleActive } = await import("./intelligence.server-BvA1TlYE.mjs");
		await setAlertRuleActive(sql, data.id, data.active);
		return { ok: true };
	});
});
var listWatchlistFn_createServerFn_handler = createServerRpc({
	id: "ccb8ee9a11662ac817127ee98acc3d2944f0fdb403af5ca74827a6f7e70403ed",
	name: "listWatchlistFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listWatchlistFn.__executeServer(opts));
var listWatchlistFn = createServerFn({ method: "GET" }).handler(listWatchlistFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { listWatchlist } = await import("./intelligence.server-BvA1TlYE.mjs");
		return listWatchlist(sql);
	});
});
var upsertWatchlistFn_createServerFn_handler = createServerRpc({
	id: "19f1b40ed1579c5f1136bf3e2482631dc14fcccb0468c2edd3490f95c6385216",
	name: "upsertWatchlistFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => upsertWatchlistFn.__executeServer(opts));
var upsertWatchlistFn = createServerFn({ method: "POST" }).validator((data) => {
	const rec = data && typeof data === "object" ? data : {};
	const kind = typeof rec.kind === "string" ? rec.kind : "";
	const value = typeof rec.value === "string" ? rec.value.trim() : "";
	if (!kind || !value) throw new Error("kind and value are required");
	return {
		kind,
		value,
		label: typeof rec.label === "string" ? rec.label : null
	};
}).handler(upsertWatchlistFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { upsertWatchlist } = await import("./intelligence.server-BvA1TlYE.mjs");
		await upsertWatchlist(sql, data);
		return { ok: true };
	});
});
var getGate75Fn_createServerFn_handler = createServerRpc({
	id: "7bdf72d4a68e7043f67c9a8be38758b1b4e9c309d0ae77260f53f9a283430ea2",
	name: "getGate75Fn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getGate75Fn.__executeServer(opts));
var getGate75Fn = createServerFn({ method: "GET" }).handler(getGate75Fn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { runGate75 } = await import("./validation.server-DqiALiyG.mjs");
		return runGate75(sql);
	});
});
var getDigestFn_createServerFn_handler = createServerRpc({
	id: "20ade58e72981c819a65570fedd36ab2a739335f2d01b752f46ce41b027100d4",
	name: "getDigestFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => getDigestFn.__executeServer(opts));
var getDigestFn = createServerFn({ method: "GET" }).handler(getDigestFn_createServerFn_handler, async () => {
	return withSql(async (sql) => {
		const { getDigest } = await import("./intelligence.server-BvA1TlYE.mjs");
		return getDigest(sql);
	});
});
var listDiscoveryChannelsFn_createServerFn_handler = createServerRpc({
	id: "fcc285c32310dd309ff6bd99ac8aff85a38c990467972e3202b8d2269a5af273",
	name: "listDiscoveryChannelsFn",
	filename: "src/lib/registry/api.ts"
}, (opts) => listDiscoveryChannelsFn.__executeServer(opts));
var listDiscoveryChannelsFn = createServerFn({ method: "GET" }).validator((data) => {
	const rec = data && typeof data === "object" ? data : {};
	return {
		family: typeof rec.family === "string" ? rec.family.trim() : void 0,
		sourceId: typeof rec.sourceId === "string" ? rec.sourceId.trim() : void 0
	};
}).handler(listDiscoveryChannelsFn_createServerFn_handler, async ({ data }) => {
	return withSql(async (sql) => {
		const { listDiscoveryChannels } = await import("./queries.server-B9mr7TW7.mjs").then((n) => n.d);
		return listDiscoveryChannels(sql, {
			family: data.family,
			sourceId: data.sourceId
		});
	});
});
//#endregion
export { discoverSourceFn_createServerFn_handler, fingerprintSourceFn_createServerFn_handler, getDigestFn_createServerFn_handler, getFamilySourcesFn_createServerFn_handler, getGate75Fn_createServerFn_handler, getItemFn_createServerFn_handler, getMatrixFn_createServerFn_handler, getMetricsFn_createServerFn_handler, getMilestone3Fn_createServerFn_handler, getMilestone4Fn_createServerFn_handler, getMilestone5Fn_createServerFn_handler, getMilestone6Fn_createServerFn_handler, getMilestone7Fn_createServerFn_handler, getOpportunityFn_createServerFn_handler, getOrganizationFn_createServerFn_handler, getSourceFn_createServerFn_handler, listAlertEventsFn_createServerFn_handler, listAlertRulesFn_createServerFn_handler, listAlertsFn_createServerFn_handler, listArpsFn_createServerFn_handler, listCensusFn_createServerFn_handler, listComparisonsFn_createServerFn_handler, listDiscoveryChannelsFn_createServerFn_handler, listEarlyOpportunitiesFn_createServerFn_handler, listFamiliesFn_createServerFn_handler, listFamilyCandidatesFn_createServerFn_handler, listFamilyRankingFn_createServerFn_handler, listFutureDemandFn_createServerFn_handler, listItemsFn_createServerFn_handler, listJurisdictionsFn_createServerFn_handler, listLocalOnlyFn_createServerFn_handler, listMunicipalityCensusFn_createServerFn_handler, listOpportunitiesFn_createServerFn_handler, listOrganizationsFn_createServerFn_handler, listPlanningFn_createServerFn_handler, listProbeRunsFn_createServerFn_handler, listRecurrenceFn_createServerFn_handler, listSearchFn_createServerFn_handler, listSourceRecordsFn_createServerFn_handler, listSourcesFn_createServerFn_handler, listWatchlistFn_createServerFn_handler, registerSourceFn_createServerFn_handler, setAlertRuleActiveFn_createServerFn_handler, upsertAlertRuleFn_createServerFn_handler, upsertWatchlistFn_createServerFn_handler, verifySourceFn_createServerFn_handler };
