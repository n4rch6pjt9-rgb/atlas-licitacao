import { C as VENDOR_FAMILIES, p as FRAMEWORK_FAMILIES } from "./types-DkMyNmeu.mjs";
import { a as formatInt } from "./rolldown-runtime-D7D4PA-g.mjs";
import { F as TECHNOLOGY_LABELS, u as CONNECTOR_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as Badge } from "./router-kRQOR_EK.mjs";
import { E as listFamiliesFn, n as PageShell, t as PageHeader } from "./api-BbDjf7Uy.mjs";
import { a as asTechFamily, t as asConnector } from "./view-DDAn-sqq.mjs";
import { n as PageSkeleton, r as QueryErrorState } from "./status-states-CB2KYIx6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/familias-BHocepb9.js
var import_jsx_runtime = require_jsx_runtime();
var GROUPS = [
	{
		title: "Nacionais",
		families: ["PNCP", "COMPRAS_GOV"]
	},
	{
		title: "Comerciais",
		families: [...VENDOR_FAMILIES]
	},
	{
		title: "Genéricas / framework",
		families: [...FRAMEWORK_FAMILIES]
	},
	{
		title: "Próprio",
		families: ["SISTEMA_PROPRIO"]
	}
];
function FamiliasPage() {
	const familiesQuery = useQuery({
		queryKey: ["families"],
		queryFn: () => listFamiliesFn()
	});
	const byFamily = /* @__PURE__ */ new Map();
	for (const row of familiesQuery.data ?? []) byFamily.set(asTechFamily(row.family), row);
	function rowFor(family) {
		return byFamily.get(family) ?? {
			family,
			count: 0,
			adapter_ready_count: 0,
			verified_count: 0,
			connector_types: []
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Famílias",
		description: "Famílias comerciais podem ter zero fontes verificadas. Isso é censo pendente, não um bug."
	}), familiesQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 6 }) : familiesQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: familiesQuery.error instanceof Error ? familiesQuery.error.message : "Erro desconhecido.",
		onRetry: () => familiesQuery.refetch()
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-8",
		children: GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-3 font-display text-xl font-medium tracking-tight",
			children: group.title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-2",
			children: group.families.map((family) => {
				const row = rowFor(family);
				const pending = (VENDOR_FAMILIES.has(family) || family === "SISTEMA_PROPRIO") && row.verified_count === 0;
				const adapter = row.connector_types[0] ? asConnector(row.connector_types[0]) : null;
				const badge = pending ? {
					variant: "muted",
					label: "Censo pendente"
				} : row.count === 0 ? {
					variant: "muted",
					label: "Sem fontes"
				} : row.verified_count > 0 ? {
					variant: "ok",
					label: "Com evidência"
				} : {
					variant: "warn",
					label: "Observada"
				};
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/familias/$family",
					params: { family },
					className: "flex min-h-11 flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium text-fg",
							children: TECHNOLOGY_LABELS[family]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								formatInt(row.count),
								" fontes ·",
								" ",
								formatInt(row.verified_count),
								" verificadas",
								adapter ? ` · ${CONNECTOR_LABELS[adapter]}` : ""
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: badge.variant,
						children: badge.label
					})]
				}) }, family);
			})
		})] }, group.title))
	})] });
}
//#endregion
export { FamiliasPage as component };
