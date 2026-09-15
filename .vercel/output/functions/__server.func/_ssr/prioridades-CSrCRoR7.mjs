import { a as formatInt, i as formatHours, s as formatPct } from "./rolldown-runtime-D7D4PA-g.mjs";
import { C as INGESTION_MODE_LABELS, F as TECHNOLOGY_LABELS, I as VALUE_CLASSIFICATION_LABELS, M as PUBLIC_KEY_SEMANTICS_LABELS, d as CONNECTOR_READINESS_LABELS, n as ADAPTER_FIT_LABELS, u as CONNECTOR_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as ClaimBadge, l as Badge } from "./router-kRQOR_EK.mjs";
import { m as getMilestone6Fn, n as PageShell, t as PageHeader } from "./api-BbDjf7Uy.mjs";
import { a as asTechFamily } from "./view-DDAn-sqq.mjs";
import { n as PageSkeleton, r as QueryErrorState } from "./status-states-CB2KYIx6.mjs";
import { t as Card } from "./card-lp01NrQY.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-Cg_cqpAS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prioridades-CSrCRoR7.js
var import_jsx_runtime = require_jsx_runtime();
var WEIGHT_LABELS = {
	coverage_gap: "Gap PNCP",
	estimated_volume: "Volume não capturado",
	lead_time: "Antecedência",
	technical_reuse: "Reuso técnico",
	source_reliability: "Confiabilidade",
	evidence_confidence: "Evidência",
	public_access: "Acesso público",
	historical_depth: "Profundidade",
	maintenance_risk_inverted: "1 − risco de manutenção",
	integration_cost_inverted: "1 − custo de integração"
};
function PrioridadesPage() {
	const query = useQuery({
		queryKey: ["milestone6"],
		queryFn: () => getMilestone6Fn()
	});
	const metrics = query.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Próximas fontes",
		description: "Ranking v2 com ingestão live do Portal de Compras Públicas. Pesos iguais ao v1; o que muda são os insumos observados."
	}), query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 8 }) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: query.error instanceof Error ? query.error.message : "Erro desconhecido.",
		onRetry: () => query.refetch()
	}) : metrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankingBody, { metrics }) : null] });
}
function RankingBody({ metrics }) {
	const chosen = metrics.ranking[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-8 flex flex-wrap items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: metrics.milestone_verdict === "GO" ? "ok" : "danger",
					children: metrics.milestone_verdict
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						metrics.window_label,
						" · score ",
						metrics.score_version,
						" · adapter comercial",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: metrics.commercial_adapter_verdict
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/oportunidades",
					className: "text-sm text-muted hover:text-fg",
					children: "Oportunidades antecipadas →"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/cobertura",
					className: "text-sm text-muted hover:text-fg",
					children: "Cobertura →"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid grid-cols-2 gap-3 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Família escolhida",
					value: metrics.chosen_family ? TECHNOLOGY_LABELS[asTechFamily(metrics.chosen_family)] : "—",
					hint: chosen ? `${ADAPTER_FIT_LABELS[chosen.adapter_fit] ?? chosen.adapter_fit} · score ${chosen.final_score.toFixed(1)}` : void 0,
					claim: "FATO_VERIFICADO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "PCP live",
					value: `${formatInt(metrics.live_entes)} entes`,
					hint: `${formatInt(metrics.live_records)} records LIVE · ${formatInt(metrics.fixture_records)} fixture (M5)`,
					claim: "FATO_VERIFICADO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Overlap PNCP (live)",
					value: formatPct(metrics.pcp_pncp_overlap_ratio),
					hint: `Compras.gov ${formatPct(metrics.pcp_comprasgov_overlap_ratio)} · local-only ${formatInt(metrics.pcp_local_only)}`,
					claim: "FATO_VERIFICADO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Antecedência PCP",
					value: formatHours(metrics.pcp_median_lead_time_hours),
					hint: `p75 ${formatHours(metrics.pcp_p75_lead_time_hours)} · p95 ${formatHours(metrics.pcp_p95_lead_time_hours)}`,
					claim: "FATO_VERIFICADO"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "publicKey apipcp",
					value: PUBLIC_KEY_SEMANTICS_LABELS[metrics.public_key_semantics] ?? metrics.public_key_semantics,
					hint: `${VALUE_CLASSIFICATION_LABELS[metrics.public_key_classification] ?? metrics.public_key_classification} · ${CONNECTOR_READINESS_LABELS[metrics.public_key_readiness] ?? metrics.public_key_readiness}`,
					claim: "FATO_VERIFICADO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Paginação",
					value: metrics.page2_distinct ? "página 2 ≠ 1" : "não comprovada",
					hint: `${metrics.pagination_type} · GET público compras.api v2`,
					claim: metrics.page2_distinct ? "FATO_VERIFICADO" : "PENDENTE_DE_VALIDACAO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Confiabilidade",
					value: metrics.reliability_success_ratio == null ? "—" : formatPct(metrics.reliability_success_ratio),
					hint: metrics.reliability_median_latency_ms == null ? "latência não medida" : `mediana ${Math.round(metrics.reliability_median_latency_ms)} ms`,
					claim: "FATO_VERIFICADO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "PCP × BLL",
					value: `${metrics.pcp_score?.toFixed(1) ?? "—"} / ${metrics.bll_score?.toFixed(1) ?? "—"}`,
					hint: "Score v2. BLL já capturado perde volume residual.",
					claim: "INFERENCIA"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Entes PCP live"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: [
						"Config por ente é o filtro público ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-fg",
							children: "orgao"
						}),
						", não publicKey. Mesmo generic-json, zero forks."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
					children: metrics.live_ente_rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-fg",
									children: row.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: row.count > 0 ? "ok" : "warn",
									children: row.readiness ? CONNECTOR_READINESS_LABELS[row.readiness] ?? row.readiness : INGESTION_MODE_LABELS.LIVE_PUBLIC_API
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono text-xs text-muted",
								children: row.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm text-muted",
								children: [
									formatInt(row.count),
									" records ",
									INGESTION_MODE_LABELS.LIVE_PUBLIC_API.toLowerCase()
								]
							})
						]
					}, row.id))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Ranking de famílias"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "Volume é o que ainda não foi capturado. Família já ingerida (BLL) perde posição mesmo com muitos records. Clique na linha para ver os componentes."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankTable, { rows: metrics.ranking })
			]
		}),
		chosen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhyFirst, { row: chosen }) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Fórmula v2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "Mesmos pesos do v1. Soma = 1. Custo e risco entram invertidos. v1 permanece gravado na coorte anterior."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeightsCard, { weights: chosen?.weights ?? null })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Amostras técnicas live"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "GET público desta sessão. Sem login, sem extração de segredo, sem adapter comercial. HTTP 400 de autenticação é erro de configuração, não de parser."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-2",
					children: metrics.probes.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-fg",
									children: row.family ? TECHNOLOGY_LABELS[asTechFamily(row.family)] : row.url
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: row.ok ? "ok" : "danger",
									children: row.http_status != null ? `HTTP ${row.http_status}` : "falha"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 break-all font-mono text-xs text-muted",
								children: row.url
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: row.excerpt ?? row.error ?? "—"
							})
						]
					}, row.id))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10 grid gap-3 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-medium tracking-tight",
					children: "Fato · inferência · pendente"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 flex flex-col gap-2 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: "FATO"
						}), " — publicKey da apipcp é credencial privada (chave de verificação). Não entra em connector_config. SPA pública não a embute."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "FATO"
							}),
							" — discovery live usa GET compras.api /v2/licitacao/processos, sem chave, filtro orgao por ente.",
							` ${formatInt(metrics.live_entes)}`,
							" entes, ",
							formatInt(metrics.live_records),
							" ",
							"records LIVE. PcpAdapter não criado."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "FATO"
							}),
							" — página 2 de Mogi",
							" ",
							metrics.page2_distinct ? "difere" : "não comprovou diferir",
							" da página 1. Itens ",
							metrics.items_observed ? "observados" : "não observados",
							"; documentos",
							" ",
							metrics.documents_observed ? "parciais" : "não observados",
							"."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: "INFERÊNCIA"
						}), " — ganho residual de cobertura PCP ainda supera BLL porque o censo nacional PCP não está capturado."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: "PENDENTE"
						}), " — publicKeys municipais nunca usadas. Censo 5.570 não reivindicado. CNPJ ausente na listagem v2."] })
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-medium tracking-tight",
						children: "GO / NO-GO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted",
						children: [
							"Milestone 6 é ",
							metrics.milestone_verdict,
							": semântica da publicKey esclarecida, nenhuma credencial privada persistida, generic-json reusado, coorte live separada da avaliação M5. Adapter comercial permanece NO-GO."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: metrics.public_key_rationale
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-xs text-muted",
						children: [
							"Reuso genérico ",
							metrics.generic_reuse_verdict,
							" · ",
							CONNECTOR_LABELS.GENERIC_JSON,
							" · ",
							"checkpoints ",
							formatInt(metrics.checkpoints)
						]
					})
				]
			})]
		})
	] });
}
function WhyFirst({ row }) {
	const entries = Object.entries(row.components).sort((a, b) => b[1] - a[1]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium tracking-tight",
				children: "Por que esta fonte está em primeiro?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 mb-4 text-sm text-muted",
				children: [
					TECHNOLOGY_LABELS[asTechFamily(row.family)],
					" · score ",
					row.final_score.toFixed(1),
					" ",
					"· ",
					row.rationale
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-3",
					children: entries.map(([key, value]) => {
						const weight = row.weights[key] ?? 0;
						const contribution = value * weight;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1 flex items-baseline justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: WEIGHT_LABELS[key] ?? key
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-xs text-muted",
								children: [
									value.toFixed(2),
									" × ",
									weight.toFixed(2),
									" = ",
									contribution.toFixed(3)
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1.5 overflow-hidden rounded-sm bg-surface-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-sm bg-accent",
								style: { width: `${Math.round(value * 100)}%` }
							})
						})] }, key);
					})
				})
			})
		]
	});
}
function RankTable({ rows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Nenhuma família avaliada nesta janela."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "#" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Família" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Score" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "VERIFIED" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Gap PNCP" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fit" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Custo" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((row) => {
			const family = asTechFamily(row.family);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-mono text-sm",
					children: row.rank
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/familias/$family",
					params: { family },
					className: "font-medium text-fg hover:underline",
					children: TECHNOLOGY_LABELS[family]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted",
					children: [
						formatInt(row.records_local),
						" records · local-only",
						" ",
						formatInt(row.local_only),
						" · antecedência",
						" ",
						formatHours(row.median_lead_time_hours)
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-mono text-sm",
					children: row.final_score.toFixed(1)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatInt(row.verified_entities) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatPct(row.components.coverage_gap) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: row.generic_reuse === "GO" ? "ok" : "muted",
					children: ADAPTER_FIT_LABELS[row.adapter_fit] ?? row.adapter_fit
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-mono text-xs text-muted",
					children: row.integration_cost.toFixed(2)
				})
			] }, row.family);
		}) })] })
	});
}
function WeightsCard({ weights }) {
	const entries = Object.entries(weights ?? {}).sort((a, b) => b[1] - a[1]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 text-xs tracking-wide text-subtle uppercase",
			children: "source_integration_priority_score v2"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid gap-2 sm:grid-cols-2",
			children: entries.map(([key, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-baseline justify-between gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: WEIGHT_LABELS[key] ?? key
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-fg",
					children: value.toFixed(2)
				})]
			}, key))
		})]
	});
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
export { PrioridadesPage as component };
