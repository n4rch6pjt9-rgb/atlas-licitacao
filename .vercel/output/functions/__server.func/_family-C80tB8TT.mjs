import { C as VENDOR_FAMILIES, S as TECHNOLOGY_FAMILIES, p as FRAMEWORK_FAMILIES } from "./_ssr/types-DkMyNmeu.mjs";
import { a as formatInt } from "./_ssr/rolldown-runtime-D7D4PA-g.mjs";
import { F as TECHNOLOGY_LABELS, u as CONNECTOR_LABELS } from "./_ssr/labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { l as Badge, o as Route$8 } from "./_ssr/router-kRQOR_EK.mjs";
import { t as PaFrameworkNote } from "./_ssr/pa-note-bVFdOpoR.mjs";
import { D as listFamilyCandidatesFn, E as listFamiliesFn, T as listDiscoveryChannelsFn, n as PageShell, o as getFamilySourcesFn, t as PageHeader } from "./_ssr/api-BbDjf7Uy.mjs";
import { a as asTechFamily, t as asConnector } from "./_ssr/view-DDAn-sqq.mjs";
import { n as PageSkeleton, r as QueryErrorState, t as EmptyState } from "./_ssr/status-states-CB2KYIx6.mjs";
import { t as SourceRow } from "./_ssr/source-row-BhQQGps8.mjs";
import { t as DiscoveryChannelStack } from "./_ssr/discovery-channels-FztfV89j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_family-C80tB8TT.js
var import_jsx_runtime = require_jsx_runtime();
function isFamily(value) {
	return TECHNOLOGY_FAMILIES.includes(value);
}
function FamilyPage() {
	const { family: raw } = Route$8.useParams();
	const family = isFamily(raw) ? raw : null;
	const sourcesQuery = useQuery({
		queryKey: ["family-sources", family],
		queryFn: () => getFamilySourcesFn({ data: { family } }),
		enabled: family != null
	});
	const familiesQuery = useQuery({
		queryKey: ["families"],
		queryFn: () => listFamiliesFn()
	});
	const candidatesQuery = useQuery({
		queryKey: ["family-candidates"],
		queryFn: () => listFamilyCandidatesFn()
	});
	const channelsQuery = useQuery({
		queryKey: ["discovery-channels", family],
		queryFn: () => listDiscoveryChannelsFn({ data: { family: family ?? "" } }),
		enabled: family === "BLL"
	});
	if (!family) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Família desconhecida",
		hint: raw
	}) });
	const summary = (familiesQuery.data ?? []).find((row) => asTechFamily(row.family) === family);
	const sources = sourcesQuery.data ?? [];
	const verified = summary?.verified_count ?? sources.filter((s) => s.vendor_evidence_level === "VERIFIED").length;
	const censusPending = VENDOR_FAMILIES.has(family) && verified === 0;
	const showPa = family === "GENERIC_JSF" || family === "PARADIGMA_WBC";
	const adapter = summary?.connector_types[0] ? asConnector(summary.connector_types[0]) : null;
	const candidate = (candidatesQuery.data ?? []).find((row) => asTechFamily(row.technology_family) === family);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: TECHNOLOGY_LABELS[family],
			description: FRAMEWORK_FAMILIES.has(family) ? "Framework não prova fornecedor. Classificação genérica até evidência adicional." : VENDOR_FAMILIES.has(family) ? "Família comercial. Só atribuir com evidência suficiente." : "Família tecnológica do registry."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					children: [formatInt(sources.length), " fontes"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "muted",
					children: [formatInt(verified), " verificadas"]
				}),
				adapter ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: CONNECTOR_LABELS[adapter]
				}) : null,
				censusPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "muted",
					children: "Censo pendente"
				}) : null,
				candidate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: candidate.commercial_adapter === "GO" ? "ok" : "danger",
					children: ["Comercial ", candidate.commercial_adapter]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: candidate.generic_reuse === "GO" ? "ok" : "muted",
					children: ["Reuso ", candidate.generic_reuse]
				})] }) : null
			]
		}),
		candidate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-6 max-w-3xl text-sm text-muted",
			children: candidate.rationale
		}) : null,
		family === "BLL" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiscoveryChannelStack, {
			channels: channelsQuery.data ?? [],
			title: "BLL não é uma superfície só",
			description: "Processos, Compra Direta e Busca por Localização são canais públicos distintos. O adapter continua generic-action. Compra Direta não é filtro de pregão. Não abrir adapter BLL. Não contornar CAPTCHA. Milestone 8 permanece fechado."
		}) : null,
		showPa ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaFrameworkNote, {})
		}) : null,
		family === "GENERIC_JSON_API" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-6 text-sm text-muted",
			children: "Quando o censo estiver semeado, esta família lista SC, PNCP e Compras.gov — o mesmo adapter generic-json, três configs."
		}) : null,
		sourcesQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 4 }) : sourcesQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
			message: sourcesQuery.error instanceof Error ? sourcesQuery.error.message : "Erro desconhecido.",
			onRetry: () => sourcesQuery.refetch()
		}) : sources.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: VENDOR_FAMILIES.has(family) ? "Censo pendente" : "Nenhuma fonte nesta família",
			hint: VENDOR_FAMILIES.has(family) ? "Zero fontes verificadas é um estado honesto, não um erro de cadastro." : "Fontes classificadas nesta família aparecem aqui."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-2",
			children: sources.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceRow, { source }) }, source.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/familias",
			className: "mt-6 inline-flex min-h-11 items-center text-sm text-muted hover:text-fg",
			children: "Todas as famílias"
		})
	] });
}
//#endregion
export { FamilyPage as component };
