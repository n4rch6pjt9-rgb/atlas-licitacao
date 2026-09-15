import { a as formatInt, s as formatPct } from "./rolldown-runtime-D7D4PA-g.mjs";
import { L as localOnlyUxLabel, p as DATA_ORIGIN_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as ClaimBadge, l as Badge } from "./router-kRQOR_EK.mjs";
import { n as PageShell, s as getGate75Fn, t as PageHeader } from "./api-BbDjf7Uy.mjs";
import { n as PageSkeleton, r as QueryErrorState } from "./status-states-CB2KYIx6.mjs";
import { t as Card } from "./card-lp01NrQY.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-Cg_cqpAS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/validacao-BsjTAhIZ.js
var import_jsx_runtime = require_jsx_runtime();
var SIGNAL_LABELS = {
	recurrence: "Recorrência",
	planning_link: "Ligação planejamento → contratação",
	pca_live: "PCA live",
	pgc_live: "PGC live",
	arp_live: "ARP live",
	window_7d: "Janela de 7 dias",
	attention: "Attention score",
	alerts: "Alertas"
};
function Verdict({ value }) {
	const go = value === true || value === "GO";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: go ? "ok" : "danger",
		children: go ? "GO" : "NO-GO"
	});
}
function ValidacaoPage() {
	const query = useQuery({
		queryKey: ["gate75"],
		queryFn: () => getGate75Fn(),
		staleTime: 6e4
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Gate 7.5 — Engineering GO / validação estatística NO-GO",
		description: "PCA, PGC e ARP live estão operacionalizados. Recorrência, planning-link e attention score ainda não têm validação suficiente. M8 permanece fechado. Golden nunca entra nas métricas live."
	}), query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Ingestão live limitada a 22 segundos. Golden não entra nestas métricas. Recorrência não é previsão."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 10 })]
	}) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: query.error instanceof Error ? query.error.message : "Erro desconhecido.",
		onRetry: () => query.refetch()
	}) : query.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportBody, { report: query.data }) : null] });
}
function ReportBody({ report }) {
	const quality = report.quality;
	const precision = quality.planning_precision ?? {};
	const windowLive = quality.window_live ?? {};
	const recurrence = quality.recurrence ?? {};
	const alerts = quality.alerts ?? {};
	const pcaPgc = quality.pca_pgc ?? [];
	const attention = quality.attention ?? {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "Estado do gate"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted",
									children: "Engineering"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Verdict, { value: report.engineering_go }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted",
									children: "Validação estatística"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Verdict, { value: report.statistical_go })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-display text-lg font-medium tracking-tight",
							children: report.project_state
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [
								"Corte ",
								report.as_of.slice(0, 16).replace("T", " "),
								" UTC. M8 ",
								report.m8.choice,
								report.m8.closest_if_forced !== "NONE" ? ` · direção mais próxima ${report.m8.closest_if_forced} (${report.m8.closest_confidence === "PRELIMINARY" ? "preliminar" : "com evidência"})` : ""
							]
						}),
						report.statistical_missing.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 list-disc space-y-1 pl-5 text-sm text-muted",
							children: report.statistical_missing.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "Milestone 8"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl font-medium tracking-tight",
							children: "Não abrir M8"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: report.m8.rationale
						}),
						report.m8.closest_if_forced === "C" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: "C (cobertura) é bússola preliminar, não escolha. Depois de 21/09, só com os três números: precision CONFIRMED após endurecimento, follow-through n≥30, ganho local após late matching."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 list-disc space-y-1 pl-5 text-sm text-muted",
							children: report.m8.m8_c_requires.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "Janela de 7 dias"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-display text-2xl font-medium tracking-tight",
							children: [
								"Manter ",
								report.window_recommendation.keep_days,
								" dias"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: report.window_recommendation.reason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-xs text-subtle",
							children: [
								"Reavaliar depois de ",
								report.window_recommendation.reevaluate_after,
								". Não aplicar automaticamente."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-fg",
							children: ["Alias de tela: ", localOnlyUxLabel("LOCAL_ONLY_CONFIRMED")]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "Até 21/09 — só quatro trabalhos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-3",
							children: report.workstreams.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: item.status === "DONE" ? "ok" : "warn",
									children: item.status === "DONE" ? "feito" : "em curso"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-fg",
										children: item.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-subtle",
										children: item.notes
									})]
								})]
							}, item.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: report.decisive_gate.action
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-xl font-medium tracking-tight",
				children: "Sinais"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: Object.keys(SIGNAL_LABELS).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalCard, {
					label: SIGNAL_LABELS[key],
					signal: report.signals[key]
				}, key))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-display text-xl font-medium tracking-tight",
					children: "Produto — live vs golden"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted",
					children: "Contagens isoladas por origem. Golden não entra no denominador live."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "PCA live",
							value: formatInt(report.product.live.pca),
							hint: `planejamento live ${formatInt(report.product.live.planning)}`,
							claim: "FATO_VERIFICADO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "PGC live",
							value: formatInt(report.product.live.pgc),
							hint: "PGC ≠ PCA. Relação observada, nunca auto-merge.",
							claim: "FATO_VERIFICADO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "ARP live",
							value: formatInt(report.product.live.arp),
							hint: "Instrumento vigente — não é edital novo.",
							claim: "FATO_VERIFICADO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "PCP overlap live",
							value: formatPct(report.product.pcp_overlap_ratio),
							hint: `reprocessados ${formatInt(report.product.pcp_reprocess.n)} · maduro sem match ${formatInt(report.product.pcp_reprocess.confirmed)}`,
							claim: "FATO_VERIFICADO"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Golden planejamento",
							value: formatInt(report.product.golden.planning),
							hint: "Fora das métricas live",
							claim: "FATO_VERIFICADO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Golden ARP",
							value: formatInt(report.product.golden.arp),
							claim: "FATO_VERIFICADO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Golden oportunidades",
							value: formatInt(report.product.golden.opportunities),
							claim: "FATO_VERIFICADO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Holdout",
							value: report.holdout_unused ? "intocado" : "contaminado",
							hint: "Compras após 2026-09-01 não calibram regra",
							claim: "FATO_VERIFICADO"
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-xl font-medium tracking-tight",
				children: "Qualidade amostral"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Planning rotulado",
						value: formatInt(precision.n ?? 0),
						hint: `reclassificados ${formatInt(precision.reclassified_from_confirmed ?? 0)} · ${formatInt(precision.demoted_to_probable ?? 0)} → PROBABLE · ${formatInt(precision.demoted_to_review ?? 0)} → REVIEW · CONFIRMED incorreto ${formatInt(precision.incorrect_confirmed ?? 0)}`,
						claim: "PENDENTE_DE_VALIDACAO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Recorrência n",
						value: formatInt(recurrence.high_or_medium ?? 0),
						hint: recurrence.sample_too_small ? `amostra pequena · ${formatInt(recurrence.series_n ?? 0)} séries · holdout intocado` : recurrence.engine_beats_best_baseline_90d ? "bate o melhor baseline em 90d" : "não bate baseline",
						claim: "INFERENCIA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Vazamento temporal",
						value: formatInt(recurrence.leakage_count ?? 0),
						hint: "compras depois de T não podem entrar no sinal",
						claim: "FATO_VERIFICADO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Alertas idempotentes",
						value: alerts.idempotent ? "sim" : "não",
						hint: `eventos ${formatInt(alerts.events_generated ?? 0)} · duplicatas ${formatInt(alerts.duplicates_suppressed ?? 0)}`,
						claim: "INFERENCIA"
					})
				]
			})] }),
			attention.bad_cases && attention.bad_cases.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-display text-xl font-medium tracking-tight",
					children: "Casos ruins de attention v1"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted",
					children: "Pesos preservados. Coleta para auditoria — não é probabilidade de vitória e não recalibra o score."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Id" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Score" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Confiança" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Razão" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: attention.bad_cases.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: row.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.score.toFixed(1) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: Math.round(row.data_confidence * 100) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm text-muted",
							children: row.reason ?? "—"
						})
					] }, row.id)) })] })
				})
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-display text-xl font-medium tracking-tight",
					children: "Tempo até match nacional"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted",
					children: "CDF só em matches observados. Ausência de match não é irregularidade. Coorte PCP 08–14/09 ainda não madura."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "n live",
							value: formatInt(windowLive.n ?? 0),
							claim: "FATO_VERIFICADO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "ainda na janela",
							value: formatInt(windowLive.n_still_in_window ?? 0),
							claim: "FATO_VERIFICADO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "≤ 24h",
							value: windowLive.pct_24h == null ? "—" : formatPct(windowLive.pct_24h),
							claim: "FATO_VERIFICADO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "≤ 7d",
							value: windowLive.pct_7d == null ? "—" : formatPct(windowLive.pct_7d),
							claim: "FATO_VERIFICADO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "≤ 14d",
							value: windowLive.pct_14d == null ? "—" : formatPct(windowLive.pct_14d),
							claim: "FATO_VERIFICADO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "coorte madura",
							value: windowLive.cohort_matured ? "sim" : "não",
							claim: "FATO_VERIFICADO"
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-display text-xl font-medium tracking-tight",
					children: "Ingestão live desta sessão"
				}),
				report.live_ingest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-sm text-muted",
					children: [
						"Orçamento ",
						Math.round(report.live_ingest.budget_ms / 1e3),
						"s · PCA consolidado",
						" ",
						formatInt(report.live_ingest.pca_consolidado),
						" · itens PCA",
						" ",
						formatInt(report.live_ingest.pca_items),
						" · PGC ",
						formatInt(report.live_ingest.pgc_items),
						" ",
						"· ARP ",
						formatInt(report.live_ingest.arp_rows),
						" · contratações",
						" ",
						formatInt(report.live_ingest.contratacoes),
						report.live_ingest.skipped.length ? ` · pulados: ${report.live_ingest.skipped.join(", ")}` : ""
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted",
					children: "Ingestão live ainda não disparada."
				}),
				report.live_ingest?.errors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mb-3 list-disc space-y-1 pl-5 text-sm text-muted",
					children: report.live_ingest.errors.map((err) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: err }, err))
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fonte" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "HTTP" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Linhas" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Erro" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: report.checkpoints.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 5,
						className: "text-muted",
						children: "Nenhum checkpoint. A ingestão live só corre nesta página."
					}) }) : report.checkpoints.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: row.source_kind
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: row.status === "ok" ? "ok" : "danger",
							children: row.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.http_status ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatInt(row.rows_ingested) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "max-w-xs truncate text-xs text-muted",
							children: row.error ?? "—"
						})
					] }, `${row.source_kind}-${row.fetched_at ?? ""}`)) })] })
				})
			] }),
			pcaPgc.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-xl font-medium tracking-tight",
				children: "PCA × PGC — relação, não identidade"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "PCA" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "PGC" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Auto-merge" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: pcaPgc.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: row.pca_planning_id
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: row.pgc_planning_id
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.status }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.auto_merged ? "sim (erro)" : "não" })
				] }, `${row.pca_planning_id}-${row.pgc_planning_id}`)) })] })
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListCard, {
						title: "Fatos verificados",
						items: report.facts
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListCard, {
						title: "Inferências",
						items: report.inferences
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListCard, {
						title: "Limitações",
						items: report.limitations
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListCard, {
					title: "Erros comprovados",
					items: report.proven_errors
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListCard, {
					title: "Correções já aplicadas",
					items: report.corrections_applied
				})]
			}),
			report.gate75_missing.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListCard, {
				title: "Itens em aberto para o Gate 7.5",
				items: report.gate75_missing
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-xl font-medium tracking-tight",
				children: "Cohortes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Id" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tipo" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Janela" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Notas" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: report.cohorts.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: row.id
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.kind }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-xs text-muted",
						children: [
							row.window_start.slice(0, 10),
							" → ",
							row.window_end.slice(0, 10)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm text-muted",
						children: row.notes
					})
				] }, row.id)) })] })
			})] }),
			report.errors.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-xl font-medium tracking-tight",
				children: "Taxonomia de erro"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Código" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Entidade" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Origem" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Notas" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: report.errors.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: row.code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.entity_type }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: DATA_ORIGIN_LABELS[row.data_origin ?? "UNKNOWN"] ?? row.data_origin ?? "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm text-muted",
						children: row.notes
					})
				] }, `${row.code}-${row.entity_type}-${row.notes}`)) })] })
			})] }) : null,
			report.forbidden_language_hits.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-danger/40 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Linguagem proibida detectada"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 list-disc pl-5 text-sm text-muted",
					children: report.forbidden_language_hits.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: hit }, hit))
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: "Nenhuma frase proibida (probabilidade de vitória, ausência definitiva, exclusivo) nos textos desta rodada."
			})
		]
	});
}
function SignalCard({ label, signal }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-fg",
					children: label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Verdict, { value: signal.verdict }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: signal.claim }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-subtle",
					children: ["n=", formatInt(signal.n)]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: signal.note
		})]
	});
}
function Metric({ label, value, hint, claim }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-2xl font-medium tracking-tight",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: hint
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: claim })
			})
		]
	});
}
function ListCard({ title, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs tracking-wide text-subtle uppercase",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
		})]
	});
}
//#endregion
export { ValidacaoPage as component };
