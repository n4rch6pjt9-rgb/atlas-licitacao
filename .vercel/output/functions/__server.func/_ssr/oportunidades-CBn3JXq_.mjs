import { o as __toESM } from "../_runtime.mjs";
import { a as formatInt, i as formatHours, o as formatMoney, r as formatDate } from "./rolldown-runtime-D7D4PA-g.mjs";
import { L as localOnlyUxLabel, x as HORIZON_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as ClaimBadge, l as Badge } from "./router-kRQOR_EK.mjs";
import { N as listOpportunitiesFn, h as getMilestone7Fn, n as PageShell, t as PageHeader } from "./api-BbDjf7Uy.mjs";
import { n as PageSkeleton, r as QueryErrorState, t as EmptyState } from "./status-states-CB2KYIx6.mjs";
import { t as Card } from "./card-lp01NrQY.mjs";
import { n as NativeSelect, t as Input } from "./input-BJIo7alT.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-Cg_cqpAS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/oportunidades-CBn3JXq_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OportunidadesPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const [uf, setUf] = (0, import_react.useState)("");
	const [horizon, setHorizon] = (0, import_react.useState)("");
	const [sort, setSort] = (0, import_react.useState)("attention");
	const [minValue, setMinValue] = (0, import_react.useState)("");
	const metricsQuery = useQuery({
		queryKey: ["milestone7"],
		queryFn: () => getMilestone7Fn()
	});
	const query = useQuery({
		queryKey: [
			"opportunities",
			q,
			uf,
			horizon,
			sort,
			minValue
		],
		queryFn: () => listOpportunitiesFn({ data: {
			q,
			uf,
			horizon: horizon || void 0,
			earlyOnly: horizon === "EARLY",
			sort,
			minValue: minValue ? Number(minValue) : void 0
		} })
	});
	const rows = (0, import_react.useMemo)(() => query.data ?? [], [query.data]);
	const ufs = (0, import_react.useMemo)(() => {
		return [...new Set(rows.map((row) => row.uf).filter((value) => Boolean(value)))].sort();
	}, [rows]);
	const metrics = metricsQuery.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Oportunidades",
			description: "Horizontes separados: o que está aberto agora, o que a fonte local viu antes do PNCP. MATURED_NO_MATCH descreve ausência de match nacional após a janela — não é ausência definitiva no PNCP."
		}),
		metrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-6 grid grid-cols-2 gap-3 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Atuais + antecipadas",
					value: formatInt(metrics.active_opportunities),
					claim: "FATO_VERIFICADO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Antecipadas",
					value: formatInt(metrics.early_opportunities),
					hint: "H1 · observado antes do PNCP ou sem match",
					claim: "FATO_VERIFICADO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Score de atenção",
					value: metrics.attention_score_version,
					hint: "Não é probabilidade de vitória",
					claim: "INFERENCIA"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Milestone 7",
					value: metrics.milestone_verdict,
					hint: `PCA ${formatInt(metrics.pca_items)} · PGC ${formatInt(metrics.pgc_items)} · ARP ${formatInt(metrics.active_arps)}`,
					claim: "FATO_VERIFICADO"
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
			onSubmit: (e) => e.preventDefault(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Objeto, órgão, CATMAT",
					"aria-label": "Buscar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
					value: uf,
					onChange: (e) => setUf(e.target.value),
					"aria-label": "UF",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Todas as UFs"
					}), ufs.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: item,
						children: item
					}, item))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
					value: horizon,
					onChange: (e) => setHorizon(e.target.value),
					"aria-label": "Horizonte",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Todos os horizontes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "CURRENT",
							children: "Atual"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "EARLY",
							children: "Antecipada"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
					value: minValue,
					onChange: (e) => setMinValue(e.target.value),
					"aria-label": "Valor mínimo",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Qualquer valor"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "20000",
							children: "≥ R$ 20 mil"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "100000",
							children: "≥ R$ 100 mil"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "1000000",
							children: "≥ R$ 1 milhão"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
					value: sort,
					onChange: (e) => setSort(e.target.value),
					"aria-label": "Ordenar",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "attention",
							children: "Atenção"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "newest",
							children: "Mais recente"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "deadline",
							children: "Prazo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "value",
							children: "Valor"
						})
					]
				})
			]
		}),
		query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 8 }) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
			message: query.error instanceof Error ? query.error.message : "Erro desconhecido.",
			onRetry: () => query.refetch()
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Nenhuma oportunidade nesta filtragem",
			hint: "Tente outro horizonte ou UF."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "overflow-hidden p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Objeto" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Órgão" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Horizonte" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Atenção" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Prazo" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fontes" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OppRow, { row }, row.id)) })] })
		})
	] });
}
function OppRow({ row }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
			className: "max-w-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/oportunidades/$id",
				params: { id: row.id },
				className: "text-sm text-fg hover:underline",
				children: row.object ?? "—"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted",
				children: [
					row.uf ?? "—",
					" · ",
					formatMoney(row.estimated_value_num)
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.organization_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/orgaos/$id",
			params: { id: row.organization_id },
			className: "hover:underline",
			children: row.organization_name ?? "—"
		}) : row.organization_name ?? "—" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: row.horizon === "EARLY" ? "warn" : "ok",
			children: HORIZON_LABELS[row.horizon] ?? row.horizon
		}), row.early_kind ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted",
			children: localOnlyUxLabel(row.early_kind)
		}) : null] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
			className: "font-mono text-sm",
			children: [row.attention_score?.toFixed(1) ?? "—", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: ["conf. ", Math.round(row.data_confidence * 100)]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
			className: "text-xs text-muted",
			children: [formatDate(row.proposal_deadline), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: row.lead_time_hours ? formatHours(row.lead_time_hours) : "—" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "font-mono text-sm",
			children: row.sources_count
		})
	] });
}
function Metric({ label, value, hint, claim }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-subtle uppercase",
					children: label
				}), claim ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: claim }) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-2xl font-medium tracking-tight",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
//#endregion
export { OportunidadesPage as component };
