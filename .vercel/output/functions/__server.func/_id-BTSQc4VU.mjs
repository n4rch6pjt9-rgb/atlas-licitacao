import { a as formatInt, o as formatMoney, r as formatDate } from "./_ssr/rolldown-runtime-D7D4PA-g.mjs";
import { N as SIGNAL_LEVEL_LABELS, j as PRICE_KIND_LABELS } from "./_ssr/labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { i as Route$4 } from "./_ssr/router-kRQOR_EK.mjs";
import { c as getItemFn, n as PageShell, t as PageHeader } from "./_ssr/api-BbDjf7Uy.mjs";
import { n as PageSkeleton, r as QueryErrorState } from "./_ssr/status-states-CB2KYIx6.mjs";
import { t as Card } from "./_ssr/card-lp01NrQY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-BTSQc4VU.js
var import_jsx_runtime = require_jsx_runtime();
function ItemDetailPage() {
	const { id } = Route$4.useParams();
	const query = useQuery({
		queryKey: ["item", id],
		queryFn: () => getItemFn({ data: { id } })
	});
	const row = query.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, {}) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: query.error instanceof Error ? query.error.message : "Erro.",
		onRetry: () => query.refetch()
	}) : !row ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Item não encontrado."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: row.label,
			description: `${row.catalog_type} ${row.catalog_code ?? "sem código oficial"}`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid grid-cols-2 gap-3 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle uppercase",
						children: "Órgãos"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl",
						children: formatInt(row.organizations_buying)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle uppercase",
						children: "Compras"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl",
						children: formatInt(row.procurements_count)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle uppercase",
							children: "Preço mediano"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl",
							children: formatMoney(row.median_price)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: PRICE_KIND_LABELS[row.latest_price_kind ?? ""] ?? row.latest_price_kind
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle uppercase",
						children: "Compradores recorrentes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl",
						children: formatInt(row.recurring_buyers)
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium",
				children: "Quem compra"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: row.buyers.map((buyer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [buyer.organization_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/orgaos/$id",
					params: { id: buyer.organization_id },
					className: "hover:underline",
					children: buyer.name
				}) : buyer.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted",
					children: [
						" ",
						"· ",
						buyer.uf,
						" · ",
						formatInt(buyer.count)
					]
				})] }, buyer.organization_id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium",
				children: "Observações de preço"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2 text-sm text-muted",
				children: row.prices.map((price) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					PRICE_KIND_LABELS[price.price_kind] ?? price.price_kind,
					" · ",
					price.source_kind,
					" ·",
					" ",
					formatMoney(price.unit_price),
					" · ",
					formatDate(price.observed_at)
				] }, price.id))
			})]
		}),
		row.recurrence.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium",
				children: "Recorrência"
			}), row.recurrence.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					SIGNAL_LEVEL_LABELS[item.signal_level],
					" · ",
					item.organization_name,
					" · ",
					item.rationale
				]
			}, item.id))]
		}) : null
	] }) });
}
//#endregion
export { ItemDetailPage as component };
