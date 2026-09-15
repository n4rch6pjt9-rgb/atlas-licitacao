import { a as CLAIM_KINDS, n as ALERT_TYPES } from "./types-DkMyNmeu.mjs";
import { a as formatInt, i as formatHours, s as formatPct } from "./rolldown-runtime-D7D4PA-g.mjs";
import { F as TECHNOLOGY_LABELS, r as ALERT_TYPE_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as ClaimBadge } from "./router-kRQOR_EK.mjs";
import { t as PaFrameworkNote } from "./pa-note-bVFdOpoR.mjs";
import { d as getMilestone3Fn, f as getMilestone4Fn, h as getMilestone7Fn, m as getMilestone6Fn, n as PageShell, p as getMilestone5Fn, t as PageHeader, u as getMetricsFn, x as listAlertsFn } from "./api-BbDjf7Uy.mjs";
import { a as readString, o as readStringOrNull, t as asEnum } from "./json-DMlCsaaG.mjs";
import { a as asTechFamily } from "./view-DDAn-sqq.mjs";
import { n as PageSkeleton, r as QueryErrorState, t as EmptyState } from "./status-states-CB2KYIx6.mjs";
import { i as CardTitle, n as CardDescription, r as CardHeader, t as Card } from "./card-lp01NrQY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CbFmwYDT.js
var import_jsx_runtime = require_jsx_runtime();
var GOLDEN = [
	{
		uf: "SC",
		title: "Santa Catarina",
		paradigm: "JSON API",
		adapter: "generic-json",
		note: "Contrato JSON público. Golden da família API JSON genérica."
	},
	{
		uf: "RJ",
		title: "Rio de Janeiro",
		paradigm: "action / form",
		adapter: "generic-action",
		note: "Busca multifunção por action de formulário."
	},
	{
		uf: "PA",
		title: "Pará",
		paradigm: "JSF",
		adapter: "generic-jsf",
		note: "Página .xhtml. Framework não prova fornecedor."
	}
];
var LAYERS = [
	{
		k: "Ente",
		v: "Pessoa jurídica ou órgão. Ex.: Estado de Santa Catarina."
	},
	{
		k: "Portal",
		v: "Endereço público. Ex.: compras.sc.gov.br."
	},
	{
		k: "Sistema",
		v: "Software por trás do portal. Ex.: e-LIC, SIGA."
	},
	{
		k: "Fornecedor",
		v: "Família comercial, só com evidência. Nunca só pelo histórico."
	}
];
function DashboardPage() {
	const statsQuery = useQuery({
		queryKey: ["metrics"],
		queryFn: () => getMetricsFn()
	});
	const alertsQuery = useQuery({
		queryKey: ["alerts"],
		queryFn: () => listAlertsFn()
	});
	const m3Query = useQuery({
		queryKey: ["milestone3"],
		queryFn: () => getMilestone3Fn()
	});
	const m4Query = useQuery({
		queryKey: ["milestone4"],
		queryFn: () => getMilestone4Fn()
	});
	const m5Query = useQuery({
		queryKey: ["milestone5"],
		queryFn: () => getMilestone5Fn()
	});
	const m6Query = useQuery({
		queryKey: ["milestone6"],
		queryFn: () => getMilestone6Fn()
	});
	const m7Query = useQuery({
		queryKey: ["milestone7"],
		queryFn: () => getMilestone7Fn()
	});
	const stats = statsQuery.data;
	const familyRows = (stats?.sources_by_family ?? []).filter((row) => row.count > 0);
	const maxFamily = Math.max(1, ...familyRows.map((row) => row.count));
	const alerts = alertsQuery.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Visão geral",
			description: "Censo nacional de portais de compras públicas. Classificação por evidência, não por palpite."
		}),
		statsQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 2 }) : statsQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
			message: errorText(statsQuery.error),
			onRetry: () => statsQuery.refetch()
		}) : stats ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid grid-cols-2 gap-3 xl:grid-cols-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Fontes",
					value: formatInt(stats.sources_total)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Verificadas",
					value: formatInt(stats.sources_verified)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Família desconhecida",
					value: formatInt(stats.sources_unknown_family)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Reuso de adapter",
					value: formatPct(stats.adapter_reuse_ratio)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Jurisdições",
					value: formatInt(stats.jurisdictions_covered)
				})
			]
		}) : null,
		m3Query.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/censo",
				className: "flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-subtle uppercase",
						children: "Milestone 3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-xl font-medium tracking-tight",
						children: ["Adapter comercial ", m3Query.data.commercial_adapter_verdict]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"Reuso genérico ",
							m3Query.data.generic_reuse_verdict,
							m3Query.data.chosen_family ? ` · ${TECHNOLOGY_LABELS[asTechFamily(m3Query.data.chosen_family)]}` : "",
							m3Query.data.chosen_adapter ? ` · ${m3Query.data.chosen_adapter}` : ""
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: "Abrir censo →"
				})]
			})
		}) : null,
		m4Query.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/cobertura",
				className: "flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-subtle uppercase",
						children: "Milestone 4"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-xl font-medium tracking-tight",
						children: [
							"Cobertura ",
							m4Query.data.milestone_verdict,
							" ·",
							" ",
							formatInt(m4Query.data.records_ingested_local),
							" records locais"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"Overlap PNCP ",
							formatPct(m4Query.data.pncp_overlap_ratio),
							" · local-only",
							" ",
							formatInt(m4Query.data.local_only_provisional + m4Query.data.local_only_confirmed),
							" ",
							"· antecedência ",
							formatHours(m4Query.data.median_lead_time_hours)
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: "Abrir cobertura →"
				})]
			})
		}) : null,
		m5Query.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/prioridades",
				className: "flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-subtle uppercase",
						children: "Milestone 5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-xl font-medium tracking-tight",
						children: [
							"Próxima fonte ",
							m5Query.data.milestone_verdict,
							m5Query.data.chosen_family ? ` · ${TECHNOLOGY_LABELS[asTechFamily(m5Query.data.chosen_family)]}` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"Score ",
							m5Query.data.score_version,
							" ",
							m5Query.data.chosen_score?.toFixed(1) ?? "—",
							" · PCP ",
							formatInt(m5Query.data.pcp_verified_entes),
							" entes · overlap",
							" ",
							formatPct(m5Query.data.pcp_pncp_overlap_ratio),
							" · antecedência",
							" ",
							formatHours(m5Query.data.pcp_median_lead_time_hours)
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: "Abrir prioridades →"
				})]
			})
		}) : null,
		m6Query.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/prioridades",
				className: "flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-subtle uppercase",
						children: "Milestone 6"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-xl font-medium tracking-tight",
						children: [
							"PCP live ",
							m6Query.data.milestone_verdict,
							m6Query.data.chosen_family ? ` · ${TECHNOLOGY_LABELS[asTechFamily(m6Query.data.chosen_family)]}` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"Score ",
							m6Query.data.score_version,
							" ",
							m6Query.data.chosen_score?.toFixed(1) ?? "—",
							" · ",
							formatInt(m6Query.data.live_entes),
							" entes LIVE",
							" · ",
							formatInt(m6Query.data.live_records),
							" records",
							" · ",
							"publicKey ",
							m6Query.data.public_key_readiness
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: "Abrir prioridades →"
				})]
			})
		}) : null,
		m7Query.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/oportunidades",
				className: "flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-subtle uppercase",
						children: "Milestone 7"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-xl font-medium tracking-tight",
						children: [
							"Inteligência ",
							m7Query.data.milestone_verdict,
							" ·",
							" ",
							formatInt(m7Query.data.active_opportunities),
							" oportunidades"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"Antecipadas ",
							formatInt(m7Query.data.early_opportunities),
							" · PCA",
							" ",
							formatInt(m7Query.data.pca_items),
							" · PGC ",
							formatInt(m7Query.data.pgc_items),
							" · recorrência ",
							formatInt(m7Query.data.recurrence_signals),
							" · ARP",
							" ",
							formatInt(m7Query.data.active_arps)
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: "Abrir oportunidades →"
				})]
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/validacao",
				className: "flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-subtle uppercase",
						children: "Gate 7.5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-xl font-medium tracking-tight",
						children: "Engineering GO · validação estatística pendente"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "PCA, PGC e ARP live operacionalizados. Recorrência, planning-link e attention ainda sem evidência suficiente. M8 permanece NO-GO. A ingestão live só dispara ao abrir essa página."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: "Abrir validação →"
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Portais golden"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "Três paradigmas de integração. Um adapter, N configurações."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-3",
					children: GOLDEN.map((portal) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-wide text-subtle uppercase",
								children: portal.uf
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-display text-lg font-medium tracking-tight",
								children: portal.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-fg",
								children: portal.paradigm
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-muted",
								children: portal.adapter
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: portal.note
							}),
							portal.uf === "PA" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaFrameworkNote, {})
							}) : null
						]
					}, portal.uf))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Distribuição por família"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "Contagem observada. Famílias comerciais sem censo aparecem vazias."
				}),
				familyRows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "Nenhuma classificação ainda",
					hint: "As barras aparecem quando há fontes com família atribuída."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-4",
						children: familyRows.map((row) => {
							const family = asTechFamily(row.family);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1.5 flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/familias/$family",
									params: { family },
									className: "text-sm text-fg hover:underline",
									children: TECHNOLOGY_LABELS[family]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-sm text-muted",
									children: formatInt(row.count)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 overflow-hidden rounded-sm bg-surface-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-sm bg-accent",
									style: { width: `${row.count / maxFamily * 100}%` }
								})
							})] }, row.family);
						})
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium tracking-tight",
				children: "Alertas recentes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: alertsQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 3 }) : alertsQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
					message: errorText(alertsQuery.error),
					onRetry: () => alertsQuery.refetch()
				}) : alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "Sem alertas",
					hint: "Mudança de fingerprint, conflito de fornecedor e schema drift aparecem aqui."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: alerts.slice(0, 8).map((alert) => {
						const type = asEnum(alert.alert_type, ALERT_TYPES, "NEW_SOURCE_DISCOVERED");
						const label = ALERT_TYPE_LABELS[type];
						const raw = readString(alert.message) || readString(alert.title);
						const title = !raw || raw === type || raw === label ? label : raw;
						const claim = asEnum(alert.claim_kind, CLAIM_KINDS, "INFERENCIA");
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-fg",
									children: title
								}), title !== label || readStringOrNull(alert.source_name) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: [title !== label ? label : null, readStringOrNull(alert.source_name)].filter(Boolean).join(" · ")
								}) : null]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: claim })]
						}, readString(alert.id, title));
					})
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Quatro camadas"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "ente ≠ portal ≠ sistema ≠ fornecedor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: LAYERS.map((layer) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "mb-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-lg",
								children: layer.k
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: layer.v })]
						})
					}, layer.k))
				})
			]
		})
	] });
}
function Metric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs tracking-wide text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 font-display text-3xl tabular-nums tracking-tight",
			children: value
		})]
	});
}
function errorText(error) {
	return error instanceof Error ? error.message : "Erro desconhecido.";
}
//#endregion
export { DashboardPage as component };
