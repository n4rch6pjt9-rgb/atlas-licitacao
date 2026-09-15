import { F as TECHNOLOGY_LABELS, P as STATE_LABELS, _ as EVIDENCE_LABELS, u as CONNECTOR_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as ClaimBadge, l as Badge } from "./router-kRQOR_EK.mjs";
import { a as asTechFamily, i as asState, l as sourceClaim, n as asEvidence, t as asConnector } from "./view-DDAn-sqq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source-row-BhQQGps8.js
var import_jsx_runtime = require_jsx_runtime();
function SourceRow({ source }) {
	const family = asTechFamily(source.technology_family);
	const evidence = asEvidence(source.vendor_evidence_level);
	const connector = asConnector(source.connector_type);
	const state = asState(source.classification_state);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/fontes/$id",
		params: { id: source.id },
		className: "flex min-h-11 flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent/40 sm:flex-row sm:items-center sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate font-medium text-fg",
				children: source.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-xs text-muted",
				children: [
					source.jurisdiction_uf,
					source.jurisdiction_name,
					source.base_url
				].filter(Boolean).join(" · ")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: TECHNOLOGY_LABELS[family]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "muted",
					children: EVIDENCE_LABELS[evidence]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "muted",
					children: CONNECTOR_LABELS[connector]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "default",
					children: STATE_LABELS[state]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, {
					kind: sourceClaim(source),
					evidence
				})
			]
		})]
	});
}
//#endregion
export { SourceRow as t };
