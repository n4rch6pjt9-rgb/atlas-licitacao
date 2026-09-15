import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-BbDjf7Uy.js
var import_jsx_runtime = require_jsx_runtime();
function PageHeader({ title, description, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: title
			}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-sm text-muted",
				children: description
			}) : null]
		}), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 flex-wrap items-center gap-2",
			children: actions
		}) : null]
	});
}
function PageShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
		children
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
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
var listSourcesFn = createServerFn({ method: "GET" }).handler(createSsrRpc("70790ed9a18c8ae524dbe9b4436488f15fedc61f9bf1d93e29473985b4121a7c"));
var getSourceFn = createServerFn({ method: "GET" }).validator(requireId).handler(createSsrRpc("8ef86eb6815ccd235e0f71b5c7c9d9b74d6474a1544a8cc91432d7c52a0b53fe"));
var listFamiliesFn = createServerFn({ method: "GET" }).handler(createSsrRpc("21fb2d85117cd17fc8961971c0398abfb8c9b95719f8e8ac578c360031c3e54a"));
var getFamilySourcesFn = createServerFn({ method: "GET" }).validator(requireFamily).handler(createSsrRpc("b96c0b4b3913627c76ebc1b6200bcd042bb7510d74d77a825342146f6d34993e"));
var getMetricsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("415cbdd3eb3c738b19ccdfdd0d7f9ea420f5e5a4b8482737448e5008b05f7f8d"));
var getMatrixFn = createServerFn({ method: "GET" }).handler(createSsrRpc("a5eca7854b334c587adb53b0bd78fd2344150cf54b8dce614bebb777580de7dc"));
var fingerprintSourceFn = createServerFn({ method: "POST" }).validator(requireId).handler(createSsrRpc("ff95650c00b11d45081a26dd9bed888a7411c2e527234a4145862866c992620e"));
var discoverSourceFn = createServerFn({ method: "POST" }).validator(parseDiscover).handler(createSsrRpc("115bf44e41ea9161d4b7c191c0877c77285c8db2e48902af758e1a988ccb2f63"));
var registerSourceFn = createServerFn({ method: "POST" }).validator(parseRegister).handler(createSsrRpc("32aef602231761d423276c895b38b4e7f31ac7de34ebd7d342128dc9f576661b"));
var verifySourceFn = createServerFn({ method: "POST" }).validator(requireId).handler(createSsrRpc("12db74f1d5e7d6a138710405a1da6ec487176878b2dc6cd054d9e134f80bfaca"));
var listJurisdictionsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("aff5abfa2c38ee553f88772457f862eefb6036f5b9a90f6d196941d1fc1d9750"));
var listAlertsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("c4db9c2a93b10b9a1a94caea977b00b3e4cc5b26341acf0a9d44811af346cab3"));
var listFamilyCandidatesFn = createServerFn({ method: "GET" }).handler(createSsrRpc("4b56c9e736131c3428cf0acf85e5e0dbcf6e86f3a811ad0a0809bc14a48cbe93"));
var listCensusFn = createServerFn({ method: "GET" }).handler(createSsrRpc("17328def8e280bb46cedacac08f385b970ff375a120d731f03c0693a069f02a5"));
var getMilestone3Fn = createServerFn({ method: "GET" }).handler(createSsrRpc("0a7b1949be465a0a4fe564e2d11b1af033227345d3766518e0f8c6027e1f8e38"));
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
var getMilestone4Fn = createServerFn({ method: "GET" }).handler(createSsrRpc("b19cc7b1769220d5d6b9659ce79fc5f01c8b094087135c209767051add4f7b6a"));
var listSearchFn = createServerFn({ method: "GET" }).validator(parseSearch).handler(createSsrRpc("f44db68f0a386ad12b807a15cd12eb2cbff430f0291b69a1ccd868af5db5b69c"));
var listMunicipalityCensusFn = createServerFn({ method: "GET" }).handler(createSsrRpc("5b90dd6dd4e71e23e3b30208f0c09b8448795c9c45c196ac5578f85e62fe8490"));
var listLocalOnlyFn = createServerFn({ method: "GET" }).handler(createSsrRpc("6013369c57e49028c7e568faf3272a64a567247bdb1172a6d9f2ced0c7ccb7a2"));
var listComparisonsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("a16dd39dce70895379c2d32a0ac147d43e1507fce8f7740a12a5a80f89d28bc9"));
var listSourceRecordsFn = createServerFn({ method: "GET" }).validator(requireId).handler(createSsrRpc("bf9883e665f44e14624684951169bcc7b27b9ed520fbb9a8b3f7dcd07ae0d3af"));
var getMilestone5Fn = createServerFn({ method: "GET" }).handler(createSsrRpc("4a3edfabb4bf6b4b611c5fb10c4058862d1b2f337329e15638ef19b17173e619"));
var getMilestone6Fn = createServerFn({ method: "GET" }).handler(createSsrRpc("024345a3d1dea3bf4b297ca7eee852ef83c60c2d050a25ef8a993af393ac2dd6"));
createServerFn({ method: "GET" }).handler(createSsrRpc("d3ac0ad28c6ecf7e37b857c84131a368c137c78aeaec5c1b26a60004ce5896f2"));
createServerFn({ method: "GET" }).handler(createSsrRpc("03936f2519b06330961214135aae2d3df1b82726a50f93c5ca02db4532dd34b6"));
createServerFn({ method: "GET" }).handler(createSsrRpc("da35eb03d7799bb6cc4940ae37bfa160bf9129e8074fe01316facfb6cbfb19b0"));
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
var getMilestone7Fn = createServerFn({ method: "GET" }).handler(createSsrRpc("64912c93fbbf8ff701a17bd5eabbc282cce0530fb5b79e7f8aa27f46619c46b7"));
var listOpportunitiesFn = createServerFn({ method: "GET" }).validator((data) => parseOppFilters(data)).handler(createSsrRpc("f73f35ce0b69a88db1ac9d21b1f722e3ab893fa760f2b409f5eac772acb8f1a3"));
var getOpportunityFn = createServerFn({ method: "GET" }).validator(requireId).handler(createSsrRpc("dd344b1deafb15a2553e2fa8fa447fdd5ed7344a955ac7d7f29e19cee678de12"));
var listPlanningFn = createServerFn({ method: "GET" }).validator((data) => {
	const rec = data && typeof data === "object" ? data : {};
	return { origin: typeof rec.origin === "string" ? rec.origin : void 0 };
}).handler(createSsrRpc("4f8862abfcfc51557fb8e3187554fbf7cafb824e459d360917f1a411d5842b57"));
var listFutureDemandFn = createServerFn({ method: "GET" }).handler(createSsrRpc("77c8bfe2419a91f3a32f7c67fc00455376c2e5fc2b2756bc89a70ad54f8a3425"));
var listOrganizationsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("f17e8b9f1508327b0879152880157983d26dc930518aa9db808280f288e0abf5"));
var getOrganizationFn = createServerFn({ method: "GET" }).validator(requireId).handler(createSsrRpc("433aa3e1c32f97379bbac80d74cec1181eefaa15281c6052064d2e475289a584"));
var listItemsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("1d650b4b05f27ae2a51af15dd079a0902d160d623bf16a54a05bbd5ea9fba31b"));
var getItemFn = createServerFn({ method: "GET" }).validator(requireId).handler(createSsrRpc("f7d37ae3d3cf0eeae50c9dd08df67f20e9e8ec86aaac1551f8e70552800416f6"));
var listArpsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("367bc55cbebb11153b836d1211aed9d32869be0a39281a58f3977bda706eb17a"));
var listRecurrenceFn = createServerFn({ method: "GET" }).handler(createSsrRpc("353ee8a1d5eae90ee4d6520de36e37beb2bbdb58885678f1b7382861ddfbbcc9"));
var listAlertRulesFn = createServerFn({ method: "GET" }).handler(createSsrRpc("de19adfd0aa5be60b476f8585703bfc1257550d37f970d4176166d257d13067b"));
var listAlertEventsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("1bfdd4ea4452058f2979cbbe5e8ea7d71c44ab420d0f7cb4a401e2f407c7cd6c"));
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
}).handler(createSsrRpc("09b2d919678c6394ad3a0b5736dbba4e3f53057942ad0112a4cf581f699256e3"));
var setAlertRuleActiveFn = createServerFn({ method: "POST" }).validator((data) => {
	const { id } = requireId(data);
	return {
		id,
		active: data.active !== false
	};
}).handler(createSsrRpc("57acafe910fa0a636aa608f934bba39ac0fb58a066fee9456cf8130de97ea6f6"));
var listWatchlistFn = createServerFn({ method: "GET" }).handler(createSsrRpc("ccb8ee9a11662ac817127ee98acc3d2944f0fdb403af5ca74827a6f7e70403ed"));
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
}).handler(createSsrRpc("19f1b40ed1579c5f1136bf3e2482631dc14fcccb0468c2edd3490f95c6385216"));
var getGate75Fn = createServerFn({ method: "GET" }).handler(createSsrRpc("7bdf72d4a68e7043f67c9a8be38758b1b4e9c309d0ae77260f53f9a283430ea2"));
var getDigestFn = createServerFn({ method: "GET" }).handler(createSsrRpc("20ade58e72981c819a65570fedd36ab2a739335f2d01b752f46ce41b027100d4"));
var listDiscoveryChannelsFn = createServerFn({ method: "GET" }).validator((data) => {
	const rec = data && typeof data === "object" ? data : {};
	return {
		family: typeof rec.family === "string" ? rec.family.trim() : void 0,
		sourceId: typeof rec.sourceId === "string" ? rec.sourceId.trim() : void 0
	};
}).handler(createSsrRpc("fcc285c32310dd309ff6bd99ac8aff85a38c990467972e3202b8d2269a5af273"));
//#endregion
export { listJurisdictionsFn as A, listWatchlistFn as B, listCensusFn as C, listFamilyCandidatesFn as D, listFamiliesFn as E, listPlanningFn as F, verifySourceFn as G, setAlertRuleActiveFn as H, listRecurrenceFn as I, listSearchFn as L, listMunicipalityCensusFn as M, listOpportunitiesFn as N, listFutureDemandFn as O, listOrganizationsFn as P, listSourceRecordsFn as R, listArpsFn as S, listDiscoveryChannelsFn as T, upsertAlertRuleFn as U, registerSourceFn as V, upsertWatchlistFn as W, getOrganizationFn as _, getDigestFn as a, listAlertRulesFn as b, getItemFn as c, getMilestone3Fn as d, getMilestone4Fn as f, getOpportunityFn as g, getMilestone7Fn as h, fingerprintSourceFn as i, listLocalOnlyFn as j, listItemsFn as k, getMatrixFn as l, getMilestone6Fn as m, PageShell as n, getFamilySourcesFn as o, getMilestone5Fn as p, discoverSourceFn as r, getGate75Fn as s, PageHeader as t, getMetricsFn as u, getSourceFn as v, listComparisonsFn as w, listAlertsFn as x, listAlertEventsFn as y, listSourcesFn as z };
