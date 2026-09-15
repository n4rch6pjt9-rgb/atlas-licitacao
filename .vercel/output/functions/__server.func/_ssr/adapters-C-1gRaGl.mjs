import { a as formatInt } from "./rolldown-runtime-D7D4PA-g.mjs";
import { u as CONNECTOR_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as PaFrameworkNote } from "./pa-note-bVFdOpoR.mjs";
import { n as PageShell, t as PageHeader, z as listSourcesFn } from "./api-BbDjf7Uy.mjs";
import { t as asConnector } from "./view-DDAn-sqq.mjs";
import { i as CardTitle, n as CardDescription, r as CardHeader, t as Card } from "./card-lp01NrQY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/adapters-C-1gRaGl.js
var import_jsx_runtime = require_jsx_runtime();
var ADAPTERS = [
	{
		type: "GENERIC_JSON",
		slug: "generic-json",
		title: "generic-json",
		golden: "SC · PNCP · Compras.gov",
		body: "GET em API JSON pública. Paginação, campos e paths entram como config por fonte — não como scraper novo."
	},
	{
		type: "GENERIC_ACTION",
		slug: "generic-action",
		title: "generic-action",
		golden: "RJ e portais Struts / .action",
		body: "POST/GET HTML público, action path e parâmetros nomeados. Um adapter cobre N entes e N canais do mesmo portal. BLL: Processos, Compra Direta e Localização — configs distintas, zero forks por município, zero BllAdapter."
	},
	{
		type: "GENERIC_JSF",
		slug: "generic-jsf",
		title: "generic-jsf",
		golden: "PA e portais .xhtml",
		body: "ViewState / postback JSF. Reusa o mesmo coletor. .xhtml não prova Paradigma, Fiorilli nem qualquer marca."
	}
];
function AdaptersPage() {
	const sources = useQuery({
		queryKey: ["sources", "adapters"],
		queryFn: () => listSourcesFn()
	}).data ?? [];
	const counts = /* @__PURE__ */ new Map();
	for (const source of sources) {
		const type = asConnector(source.connector_type);
		counts.set(type, (counts.get(type) ?? 0) + 1);
	}
	const reused = sources.filter((s) => [
		"GENERIC_JSON",
		"GENERIC_ACTION",
		"GENERIC_JSF"
	].includes(asConnector(s.connector_type))).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Adapters",
			description: "1 adapter, N configs. A expansão por ente não escala; a expansão por família sim."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mb-6 p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Reuso" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Configuração vive no source_system. O adapter não conhece o município. Destino: M famílias + configs, não N scrapers." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Fontes no adapter genérico: ",
					formatInt(reused),
					" de ",
					formatInt(sources.length)
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-3",
			children: ADAPTERS.map((adapter) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-muted",
						children: adapter.slug
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-lg font-medium tracking-tight",
						children: adapter.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-fg",
						children: adapter.body
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted",
						children: ["Golden: ", adapter.golden]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-subtle",
						children: [
							formatInt(counts.get(adapter.type) ?? 0),
							" configs ·",
							" ",
							CONNECTOR_LABELS[adapter.type]
						]
					})
				]
			}, adapter.type))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaFrameworkNote, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Quando não reusar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: "Só criar adapter novo quando a família comprovada não couber em generic-json, generic-action ou generic-jsf. Marca comercial exige evidência; framework sozinho não justifica um coletor próprio."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/familias",
					className: "mt-4 inline-flex min-h-11 items-center text-sm text-muted hover:text-fg",
					children: "Ver famílias"
				})
			]
		})
	] });
}
//#endregion
export { AdaptersPage as component };
