import { a as formatInt, o as formatMoney } from "./rolldown-runtime-D7D4PA-g.mjs";
import { S as IDENTITY_STATUS_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as Badge } from "./router-kRQOR_EK.mjs";
import { P as listOrganizationsFn, n as PageShell, t as PageHeader } from "./api-BbDjf7Uy.mjs";
import { n as PageSkeleton, r as QueryErrorState, t as EmptyState } from "./status-states-CB2KYIx6.mjs";
import { t as Card } from "./card-lp01NrQY.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-Cg_cqpAS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orgaos-DR7Hix1i.js
var import_jsx_runtime = require_jsx_runtime();
function OrgaosPage() {
	const query = useQuery({
		queryKey: ["orgs"],
		queryFn: () => listOrganizationsFn()
	});
	const rows = query.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Órgãos",
		description: "Identidade por CNPJ quando houver. Nome avulso fica em revisão. Perfil materializado, não recalculado a cada clique."
	}), query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 6 }) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: query.error instanceof Error ? query.error.message : "Erro.",
		onRetry: () => query.refetch()
	}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Nenhum órgão perfilado" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Órgão" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Identidade" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "12 meses" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Recorrência" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "PCA/PGC" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "ARP" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/orgaos/$id",
				params: { id: row.id },
				className: "hover:underline",
				children: row.display_name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					row.municipality,
					" · ",
					row.uf
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: row.identity_status === "CONFIRMED" ? "ok" : "muted",
				children: IDENTITY_STATUS_LABELS[row.identity_status] ?? row.identity_status
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-xs text-muted",
				children: row.cnpj ?? "sem CNPJ"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [formatInt(row.procurements_12m), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: formatMoney(row.estimated_value_12m)
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatInt(row.recurring_objects) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatInt(row.active_planning_items) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatInt(row.active_arps) })
		] }, row.id)) })] })
	})] });
}
//#endregion
export { OrgaosPage as component };
