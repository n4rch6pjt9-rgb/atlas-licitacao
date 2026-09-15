import { o as __toESM } from "../_runtime.mjs";
import { a as formatInt, o as formatMoney } from "./rolldown-runtime-D7D4PA-g.mjs";
import { N as SIGNAL_LEVEL_LABELS, f as CONVERSION_LABELS, i as ARP_SIGNAL_LABELS, k as PLANNING_ORIGIN_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as ClaimBadge, l as Badge } from "./router-kRQOR_EK.mjs";
import { F as listPlanningFn, I as listRecurrenceFn, O as listFutureDemandFn, S as listArpsFn, h as getMilestone7Fn, n as PageShell, t as PageHeader } from "./api-BbDjf7Uy.mjs";
import { n as PageSkeleton, r as QueryErrorState, t as EmptyState } from "./status-states-CB2KYIx6.mjs";
import { t as Card } from "./card-lp01NrQY.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-Dw7k9Max.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-Cg_cqpAS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/planejamento-C_alItq7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlanejamentoPage() {
	const [tab, setTab] = (0, import_react.useState)("pca");
	const metrics = useQuery({
		queryKey: ["milestone7"],
		queryFn: () => getMilestone7Fn()
	});
	const pca = useQuery({
		queryKey: ["planning", "PCA_PNCP"],
		queryFn: () => listPlanningFn({ data: { origin: "PCA_PNCP" } })
	});
	const pgc = useQuery({
		queryKey: ["planning", "PGC_COMPRASGOV"],
		queryFn: () => listPlanningFn({ data: { origin: "PGC_COMPRASGOV" } })
	});
	const future = useQuery({
		queryKey: ["future-demand"],
		queryFn: () => listFutureDemandFn()
	});
	const rec = useQuery({
		queryKey: ["recurrence"],
		queryFn: () => listRecurrenceFn()
	});
	const arps = useQuery({
		queryKey: ["arps"],
		queryFn: () => listArpsFn()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Demanda futura",
			description: "PCA e PGC são planejamento oficial. Recorrência é inferência do histórico. ARP é instrumento vigente — não é edital novo."
		}),
		metrics.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-6 grid grid-cols-2 gap-3 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "PCA (PNCP)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl",
							children: formatInt(metrics.data.pca_items)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: "FATO_VERIFICADO" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "PGC (Compras.gov)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl",
							children: formatInt(metrics.data.pgc_items)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: "FATO_VERIFICADO" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "Conversão"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl",
							children: new Intl.NumberFormat("pt-BR", {
								style: "percent",
								maximumFractionDigits: 0
							}).format(metrics.data.planning_conversion_rate)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: "planejado → contratação nesta amostra"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "ARP ativas"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl",
							children: formatInt(metrics.data.active_arps)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: "FATO_VERIFICADO" })
					]
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: tab,
			onValueChange: setTab,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "mb-4 flex flex-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "pca",
							children: "PCA · PNCP"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "pgc",
							children: "PGC · Compras.gov"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "rec",
							children: "Recorrência"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "arp",
							children: "ARP"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "pca",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanTable, {
						query: pca,
						empty: "Nenhum item de PCA nesta amostra."
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "pgc",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanTable, {
						query: pgc,
						empty: "Nenhum item de PGC nesta amostra."
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "rec",
					children: rec.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, {}) : rec.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
						message: "Falha ao carregar recorrência.",
						onRetry: () => rec.refetch()
					}) : (rec.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "Nenhum sinal",
						hint: "Recorrência só aparece com 2+ compras agrupáveis."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "overflow-hidden p-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Órgão" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Assunto" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Compras" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Intervalo" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Sinal" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: (rec.data ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/orgaos/$id",
								params: { id: row.organization_id },
								className: "hover:underline",
								children: row.organization_name ?? row.organization_id
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: row.uf
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "max-w-sm text-sm",
								children: row.normalized_object
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-mono",
								children: row.purchase_count
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-mono text-xs",
								children: row.median_interval_days ? `${Math.round(row.median_interval_days)} d` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: row.signal_level === "HIGH" ? "warn" : "muted",
								children: SIGNAL_LEVEL_LABELS[row.signal_level] ?? row.signal_level
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: row.rationale
							})] })
						] }, row.id)) })] })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "arp",
					children: arps.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, {}) : (arps.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Nenhuma ARP" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "overflow-hidden p-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Órgão" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Objeto" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Saldo" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Sinais" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: (arps.data ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [row.organization_name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: row.uf
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "max-w-sm text-sm",
								children: row.object
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "font-mono text-sm",
								children: [row.remaining_balance ?? "—", row.remaining_ratio != null ? ` (${Math.round(row.remaining_ratio * 100)}%)` : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs text-muted",
								children: row.signals.map((s) => ARP_SIGNAL_LABELS[s] ?? s).join(" · ")
							})
						] }, row.id)) })] })
					})
				})
			]
		}),
		future.data && future.data.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-6 text-xs text-muted",
			children: [
				"A lista unificada de demanda futura mistura origens só nesta leitura: cada linha declara se é planejamento oficial ou inferência. PCA ",
				PLANNING_ORIGIN_LABELS.PCA_PNCP,
				" ≠",
				" ",
				PLANNING_ORIGIN_LABELS.PGC_COMPRASGOV,
				"."
			]
		}) : null
	] });
}
function PlanTable({ query, empty }) {
	if (query.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: query.error instanceof Error ? query.error.message : "Erro.",
		onRetry: () => query.refetch()
	});
	const rows = query.data ?? [];
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: empty });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Ente" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Item" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Ano" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Valor" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Conversão" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [row.organization_name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					row.uf,
					" · ",
					row.source_name
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "max-w-sm text-sm",
				children: row.object
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "font-mono",
				children: row.year ?? "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatMoney(row.estimated_value_num) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: row.conversion_status === "UNMATCHED" ? "muted" : "ok",
				children: CONVERSION_LABELS[row.conversion_status] ?? row.conversion_status
			}) })
		] }, row.id)) })] })
	});
}
//#endregion
export { PlanejamentoPage as component };
