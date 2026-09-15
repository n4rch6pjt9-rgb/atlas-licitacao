import { a as formatInt, o as formatMoney } from "./rolldown-runtime-D7D4PA-g.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as Badge } from "./router-kRQOR_EK.mjs";
import { k as listItemsFn, n as PageShell, t as PageHeader } from "./api-BbDjf7Uy.mjs";
import { n as PageSkeleton, r as QueryErrorState, t as EmptyState } from "./status-states-CB2KYIx6.mjs";
import { t as Card } from "./card-lp01NrQY.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-Cg_cqpAS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/itens-DxxNAGIF.js
var import_jsx_runtime = require_jsx_runtime();
function ItensPage() {
	const query = useQuery({
		queryKey: ["items"],
		queryFn: () => listItemsFn()
	});
	const rows = query.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Itens e categorias",
		description: "CATMAT/CATSER quando o código veio no payload. Classificação textual é fallback com confiança baixa. Preço estimado, homologado e de ARP não se misturam."
	}), query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, {}) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: query.error instanceof Error ? query.error.message : "Erro.",
		onRetry: () => query.refetch()
	}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Nenhum item perfilado" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Item" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tipo" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Órgãos" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Compras" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Preço mediano" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "ARP / PCA" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/itens/$id",
				params: { id: row.id },
				className: "hover:underline",
				children: row.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs text-muted",
				children: row.catalog_code ?? "sem código"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: row.classification_method === "CATALOG" ? "ok" : "muted",
				children: row.catalog_type
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatInt(row.organizations_buying) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatInt(row.procurements_count) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [formatMoney(row.median_price), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: row.latest_price_kind ?? ""
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
				className: "text-xs text-muted",
				children: [
					formatInt(row.active_arps),
					" ARP · ",
					formatInt(row.active_plans),
					" planos"
				]
			})
		] }, row.id)) })] })
	})] });
}
//#endregion
export { ItensPage as component };
