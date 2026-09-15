import { a as formatInt, o as formatMoney } from "./_ssr/rolldown-runtime-D7D4PA-g.mjs";
import { N as SIGNAL_LEVEL_LABELS, S as IDENTITY_STATUS_LABELS, x as HORIZON_LABELS } from "./_ssr/labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { l as Badge, n as Route } from "./_ssr/router-kRQOR_EK.mjs";
import { _ as getOrganizationFn, n as PageShell, t as PageHeader } from "./_ssr/api-BbDjf7Uy.mjs";
import { n as PageSkeleton, r as QueryErrorState } from "./_ssr/status-states-CB2KYIx6.mjs";
import { t as Card } from "./_ssr/card-lp01NrQY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-AD4pMTEc.js
var import_jsx_runtime = require_jsx_runtime();
function OrgaoDetailPage() {
	const { id } = Route.useParams();
	const query = useQuery({
		queryKey: ["org", id],
		queryFn: () => getOrganizationFn({ data: { id } })
	});
	const row = query.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 8 }) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: query.error instanceof Error ? query.error.message : "Erro.",
		onRetry: () => query.refetch()
	}) : !row ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Órgão não encontrado."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: row.display_name,
			description: `${row.municipality ?? ""} · ${row.uf ?? ""}`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: row.identity_status === "CONFIRMED" ? "ok" : "muted",
				children: [
					IDENTITY_STATUS_LABELS[row.identity_status],
					" · ",
					row.identity_method
				]
			}), row.cnpj ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "outline",
				children: row.cnpj
			}) : null]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid grid-cols-2 gap-3 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle uppercase",
						children: "12 meses"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl",
						children: formatInt(row.procurements_12m)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle uppercase",
						children: "Volume 12m"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl",
						children: formatMoney(row.estimated_value_12m)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle uppercase",
						children: "Planejamento"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl",
						children: formatInt(row.active_planning_items)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle uppercase",
						children: "ARP"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl",
						children: formatInt(row.active_arps)
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium",
				children: "Compras recentes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: row.recent.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/oportunidades/$id",
						params: { id: item.id },
						className: "hover:underline",
						children: item.object
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted",
						children: [
							" ",
							"· ",
							HORIZON_LABELS[item.horizon],
							" · ",
							formatMoney(item.estimated_value_num)
						]
					})]
				}, item.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium",
					children: "Recorrência"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Inferência. Não significa que “vai comprar”."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-2",
					children: row.recurrence.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm text-muted",
						children: [
							SIGNAL_LEVEL_LABELS[item.signal_level],
							" · ",
							item.normalized_object,
							" · ",
							item.rationale
						]
					}, item.id))
				})
			]
		})
	] }) });
}
//#endregion
export { OrgaoDetailPage as component };
