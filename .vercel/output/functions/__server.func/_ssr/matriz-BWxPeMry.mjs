import { r as CAPABILITIES } from "./types-DkMyNmeu.mjs";
import { o as CAPABILITY_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as Check, o as Minus } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as getMatrixFn, n as PageShell, t as PageHeader } from "./api-BbDjf7Uy.mjs";
import { t as asEnum } from "./json-DMlCsaaG.mjs";
import { n as PageSkeleton, r as QueryErrorState, t as EmptyState } from "./status-states-CB2KYIx6.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-Cg_cqpAS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/matriz-BWxPeMry.js
var import_jsx_runtime = require_jsx_runtime();
function MatrizPage() {
	const matrixQuery = useQuery({
		queryKey: ["matrix"],
		queryFn: () => getMatrixFn()
	});
	const columns = (matrixQuery.data?.capabilities ?? [...CAPABILITIES]).map((cap) => asEnum(cap, CAPABILITIES, CAPABILITIES[0]));
	const rows = matrixQuery.data?.rows ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Matriz de capacidades",
		description: "O que cada fonte expõe em público. Células vazias são censo pendente."
	}), matrixQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 6 }) : matrixQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: matrixQuery.error instanceof Error ? matrixQuery.error.message : "Erro desconhecido.",
		onRetry: () => matrixQuery.refetch()
	}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Matriz ainda sem observações" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl border border-border bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
			className: "sticky left-0 z-10 bg-surface",
			children: "Fonte"
		}), columns.map((cap) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
			className: "text-center",
			children: CAPABILITY_LABELS[cap]
		}, cap))] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "sticky left-0 z-10 bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/fontes/$id",
				params: { id: row.source_id },
				className: "whitespace-nowrap text-fg hover:underline",
				children: row.source_name
			})
		}), columns.map((cap) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellMark, { present: Boolean(row.cells[cap]?.present) })
		}, cap))] }, row.source_id)) })] })
	})] });
}
function CellMark({ present }) {
	if (present) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex size-7 items-center justify-center rounded-sm bg-ok/20 text-ok",
		title: "Observado",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			className: "size-4",
			strokeWidth: 2.5
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex size-7 items-center justify-center text-subtle",
		title: "Pendente",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
			className: "size-3.5",
			strokeWidth: 1.5
		})
	});
}
//#endregion
export { MatrizPage as component };
