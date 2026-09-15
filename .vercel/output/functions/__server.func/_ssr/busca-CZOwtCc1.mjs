import { o as __toESM } from "../_runtime.mjs";
import { _ as LINK_STATUSES, v as LOCAL_ONLY_STATES } from "./types-DkMyNmeu.mjs";
import { a as formatInt, i as formatHours, o as formatMoney, r as formatDate } from "./rolldown-runtime-D7D4PA-g.mjs";
import { E as LOCAL_ONLY_LABELS, N as SIGNAL_LEVEL_LABELS, T as LINK_STATUS_LABELS, f as CONVERSION_LABELS, x as HORIZON_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as ClaimBadge, l as Badge } from "./router-kRQOR_EK.mjs";
import { L as listSearchFn, n as PageShell, t as PageHeader } from "./api-BbDjf7Uy.mjs";
import { n as PageSkeleton, r as QueryErrorState, t as EmptyState } from "./status-states-CB2KYIx6.mjs";
import { t as Card } from "./card-lp01NrQY.mjs";
import { t as Input } from "./input-BJIo7alT.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-Cg_cqpAS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/busca-CZOwtCc1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function asLink(value) {
	if (!value) return null;
	return LINK_STATUSES.includes(value) ? value : null;
}
function asLocal(value) {
	if (!value) return null;
	return LOCAL_ONLY_STATES.includes(value) ? value : null;
}
function BuscaPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const [uf, setUf] = (0, import_react.useState)("");
	const searchQuery = useQuery({
		queryKey: [
			"search",
			q,
			uf
		],
		queryFn: () => listSearchFn({ data: {
			q,
			uf
		} })
	});
	const data = searchQuery.data;
	const rows = (0, import_react.useMemo)(() => data?.procurements ?? [], [data]);
	const ufs = (0, import_react.useMemo)(() => {
		return [...new Set(rows.map((row) => row.uf).filter((value) => Boolean(value)))].sort();
	}, [rows]);
	const hasTerm = q.trim().length > 0;
	const extraCount = (data?.opportunities.length ?? 0) + (data?.planning.length ?? 0) + (data?.recurrence.length ?? 0) + (data?.organizations.length ?? 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Busca unificada",
			description: "Uma contratação, várias fontes. Com um termo, também abre oportunidades, planejamento oficial e sinais de recorrência — sem misturar fato com inferência."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mb-6 flex flex-col gap-3 sm:flex-row",
			onSubmit: (event) => event.preventDefault(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (event) => setQ(event.target.value),
				placeholder: "academia, CATMAT, órgão, município",
				"aria-label": "Buscar"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				value: uf,
				onChange: (event) => setUf(event.target.value),
				"aria-label": "Filtrar por UF",
				className: "flex h-11 min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					children: "Todas as UFs"
				}), ufs.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: item,
					children: item
				}, item))]
			})]
		}),
		searchQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 6 }) : searchQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
			message: searchQuery.error instanceof Error ? searchQuery.error.message : "Erro desconhecido.",
			onRetry: () => searchQuery.refetch()
		}) : rows.length === 0 && extraCount === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Nenhuma contratação canônica",
			hint: "A busca une records locais já resolvidos contra PNCP. Ingira uma fonte ou abra Cobertura."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [hasTerm && data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntelligenceSections, { data }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultsTable, { rows })] })
	] });
}
function IntelligenceSections({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-8 grid gap-4 lg:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-medium",
						children: "Oportunidades atuais"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: "FATO_VERIFICADO" })]
				}), data.opportunities.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Nenhuma oportunidade aberta com este termo."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: data.opportunities.slice(0, 6).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/oportunidades/$id",
							params: { id: row.id },
							className: "hover:underline",
							children: row.object
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								HORIZON_LABELS[row.horizon] ?? row.horizon,
								" · ",
								row.organization_name,
								" ·",
								" ",
								formatMoney(row.estimated_value_num)
							]
						})]
					}, row.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-medium",
						children: "Planejamento oficial"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: "FATO_VERIFICADO" })]
				}), data.planning.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Nenhum PCA/PGC com este termo."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: data.planning.slice(0, 6).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm",
						children: [row.object, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								row.origin_type === "PGC_COMPRASGOV" ? "PGC" : "PCA",
								" · ",
								row.organization_name,
								" ·",
								" ",
								CONVERSION_LABELS[row.conversion_status] ?? row.conversion_status
							]
						})]
					}, row.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-medium",
						children: "Recorrência"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: "INFERENCIA" })]
				}), data.recurrence.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Nenhum sinal histórico agrupável."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: data.recurrence.slice(0, 6).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/orgaos/$id",
							params: { id: row.organization_id },
							className: "hover:underline",
							children: row.organization_name ?? row.organization_id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								SIGNAL_LEVEL_LABELS[row.signal_level] ?? row.signal_level,
								" · ",
								row.purchase_count,
								" compras ·",
								" ",
								row.normalized_object
							]
						})]
					}, row.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-medium",
						children: "Órgãos"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: "FATO_VERIFICADO" })]
				}), data.organizations.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Nenhum órgão com este termo."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: data.organizations.slice(0, 6).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/orgaos/$id",
							params: { id: row.id },
							className: "hover:underline",
							children: row.display_name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								row.uf,
								" · ",
								formatInt(row.procurements_24m),
								" compras 24m · ",
								formatInt(row.recurring_objects),
								" ",
								"sinais"
							]
						})]
					}, row.id))
				})]
			})
		]
	});
}
function ResultsTable({ rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-x-auto rounded-lg border border-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Objeto" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Órgão" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "UF" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Modalidade" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Match" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Lead" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fontes" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((row) => {
			const status = asLink(row.match_status);
			const local = asLocal(row.local_only_state);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
					className: "max-w-sm",
					children: [row.opportunity_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/oportunidades/$id",
						params: { id: row.opportunity_id },
						className: "text-sm text-fg hover:underline",
						children: row.object ?? "—"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fg",
						children: row.object ?? "—"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [formatDate(row.opening_at), row.horizon ? ` · ${HORIZON_LABELS[row.horizon] ?? row.horizon}` : ""]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.organization_name ?? row.municipality ?? "—" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.uf ?? "—" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-xs",
					children: row.modality ?? "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: status === "CONFIRMED" ? "ok" : "muted",
					children: LINK_STATUS_LABELS[status]
				}) : local ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "warn",
					children: LOCAL_ONLY_LABELS[local]
				}) : "—" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-mono text-xs",
					children: formatHours(row.lead_time_hours)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-fg",
					children: [
						row.sources.length,
						" fonte",
						row.sources.length === 1 ? "" : "s"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xs text-xs text-muted",
					children: row.sources.length > 0 ? row.sources.join(" · ") : "—"
				})] })
			] }, row.id);
		}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "px-4 py-3 text-xs text-subtle",
			children: [rows.length, " contratações canônicas. Uma linha por processo, não um card por portal."]
		})]
	});
}
//#endregion
export { BuscaPage as component };
