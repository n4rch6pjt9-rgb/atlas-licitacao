import { a as CLAIM_KINDS, c as DISCOVERY_CHANNEL_TYPES, s as CONNECTOR_TYPES } from "./types-DkMyNmeu.mjs";
import { c as CHANNEL_READINESS_LABELS, m as DISCOVERY_CHANNEL_LABELS, u as CONNECTOR_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as ClaimBadge, l as Badge } from "./router-kRQOR_EK.mjs";
import { t as asEnum } from "./json-DMlCsaaG.mjs";
import { i as CardTitle, n as CardDescription, r as CardHeader, t as Card } from "./card-lp01NrQY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/discovery-channels-FztfV89j.js
var import_jsx_runtime = require_jsx_runtime();
function asChannel(value) {
	return asEnum(value, DISCOVERY_CHANNEL_TYPES, "OTHER");
}
function asClaim(value) {
	return asEnum(value, CLAIM_KINDS, "PENDENTE_DE_VALIDACAO");
}
function DiscoveryChannelStack({ channels, title = "Canais de descoberta", description }) {
	if (channels.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mb-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: description ?? "Um portal não é uma URL. Cada canal público tem lista, detalhe, paginação e checkpoint próprios — o adapter continua genérico." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "flex flex-col gap-3",
			children: channels.map((channel) => {
				const type = asChannel(channel.channel_type);
				const connector = asEnum(channel.connector_type, CONNECTOR_TYPES, "GENERIC_ACTION");
				const ready = channel.readiness === "READY";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg border border-border bg-surface-2 px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: channel.label || DISCOVERY_CHANNEL_LABELS[type]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: DISCOVERY_CHANNEL_LABELS[type]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: ready ? "ok" : "muted",
									children: CHANNEL_READINESS_LABELS[channel.readiness] ?? channel.readiness
								}),
								connector ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "muted",
									children: CONNECTOR_LABELS[connector]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: asClaim(channel.claim_kind) })
							]
						}),
						channel.list_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 break-all font-mono text-xs text-muted",
							children: channel.list_url
						}) : null,
						channel.detail_url_pattern ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 break-all font-mono text-xs text-subtle",
							children: ["detalhe ", channel.detail_url_pattern]
						}) : null,
						channel.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: channel.notes
						}) : null,
						channel.captcha_constraint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-warn",
							children: channel.captcha_constraint
						}) : null
					]
				}, channel.id);
			})
		})] })
	});
}
//#endregion
export { DiscoveryChannelStack as t };
