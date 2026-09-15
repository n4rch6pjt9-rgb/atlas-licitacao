import { d as EVIDENCE_LEVELS, v as LOCAL_ONLY_STATES, x as PORTAL_PRESENCE } from "./types-DkMyNmeu.mjs";
import { a as formatInt, i as formatHours, s as formatPct } from "./rolldown-runtime-D7D4PA-g.mjs";
import { A as PORTAL_PRESENCE_LABELS, E as LOCAL_ONLY_LABELS, F as TECHNOLOGY_LABELS, _ as EVIDENCE_LABELS, u as CONNECTOR_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as ClaimBadge, l as Badge } from "./router-kRQOR_EK.mjs";
import { M as listMunicipalityCensusFn, f as getMilestone4Fn, j as listLocalOnlyFn, m as getMilestone6Fn, n as PageShell, t as PageHeader, w as listComparisonsFn } from "./api-BbDjf7Uy.mjs";
import { a as asTechFamily, t as asConnector } from "./view-DDAn-sqq.mjs";
import { n as PageSkeleton, r as QueryErrorState } from "./status-states-CB2KYIx6.mjs";
import { t as Card } from "./card-lp01NrQY.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-Cg_cqpAS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cobertura-Bp5-MeH2.js
var import_jsx_runtime = require_jsx_runtime();
function asPresence(value) {
	return PORTAL_PRESENCE.includes(value) ? value : "UNKNOWN";
}
function asLocal(value) {
	return LOCAL_ONLY_STATES.includes(value) ? value : "PENDING_PNCP_MATCH";
}
function asLevel(value) {
	return value && EVIDENCE_LEVELS.includes(value) ? value : "UNKNOWN";
}
function Verdict({ value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: value === "GO" ? "ok" : "danger",
		children: value
	});
}
function CoberturaPage() {
	const metricsQuery = useQuery({
		queryKey: ["milestone4"],
		queryFn: () => getMilestone4Fn()
	});
	const censusQuery = useQuery({
		queryKey: ["municipality-census"],
		queryFn: () => listMunicipalityCensusFn()
	});
	const localQuery = useQuery({
		queryKey: ["local-only"],
		queryFn: () => listLocalOnlyFn()
	});
	const cmpQuery = useQuery({
		queryKey: ["comparisons"],
		queryFn: () => listComparisonsFn()
	});
	const m6Query = useQuery({
		queryKey: ["milestone6"],
		queryFn: () => getMilestone6Fn()
	});
	const loading = metricsQuery.isLoading || censusQuery.isLoading || localQuery.isLoading || cmpQuery.isLoading;
	const error = metricsQuery.error || censusQuery.error || localQuery.error || cmpQuery.error;
	const metrics = metricsQuery.data;
	const census = censusQuery.data ?? [];
	const localOnly = localQuery.data ?? [];
	const comparisons = cmpQuery.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Cobertura de contratações",
		description: "O valor não é quantos portais estão cadastrados. É quantos registros adicionais cada família entrega sobre PNCP e Compras.gov, com que antecedência e com que confiabilidade."
	}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 8 }) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: error instanceof Error ? error.message : "Erro desconhecido.",
		onRetry: () => {
			metricsQuery.refetch();
			censusQuery.refetch();
			localQuery.refetch();
			cmpQuery.refetch();
		}
	}) : metrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-8 flex flex-wrap items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Verdict, { value: metrics.milestone_verdict }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"Milestone 4 · adapter comercial",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: metrics.commercial_adapter_verdict
						}),
						" · ",
						"reuso genérico",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: metrics.generic_reuse_verdict
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/busca",
					className: "text-sm text-muted hover:text-fg",
					children: "Abrir busca unificada →"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/prioridades",
					className: "text-sm text-muted hover:text-fg",
					children: "Ranking de famílias →"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/oportunidades",
					className: "text-sm text-muted hover:text-fg",
					children: "Oportunidades antecipadas →"
				})
			]
		}),
		m6Query.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-8 rounded-lg border border-border bg-surface px-4 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs tracking-wide text-subtle uppercase",
					children: ["Coorte live · ", m6Query.data.window_label]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 font-display text-lg font-medium tracking-tight",
					children: [
						"PCP ",
						m6Query.data.milestone_verdict,
						" · ",
						formatInt(m6Query.data.live_records),
						" ",
						"records LIVE · ",
						formatInt(m6Query.data.fixture_records),
						" fixture"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						"Overlap PNCP ",
						formatPct(m6Query.data.pcp_pncp_overlap_ratio),
						" · Compras.gov",
						" ",
						formatPct(m6Query.data.pcp_comprasgov_overlap_ratio),
						" · local-only",
						" ",
						formatInt(m6Query.data.pcp_local_only),
						" · antecedência",
						" ",
						formatHours(m6Query.data.pcp_median_lead_time_hours),
						" · score",
						" ",
						m6Query.data.score_version
					]
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid grid-cols-2 gap-3 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Registros locais",
					value: formatInt(metrics.records_ingested_local),
					hint: `${formatInt(metrics.bll_entes)} entes BLL · ${formatInt(metrics.bll_records)} records BLL`,
					claim: "FATO_VERIFICADO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Overlap PNCP (records)",
					value: formatPct(metrics.pncp_overlap_ratio),
					hint: `${formatInt(metrics.records_matched_pncp)} matches · declaração ${formatPct(metrics.declared_pncp_integration_ratio)}`,
					claim: "FATO_VERIFICADO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Overlap Compras.gov",
					value: formatPct(metrics.comprasgov_overlap_ratio),
					hint: `${formatInt(metrics.records_matched_comprasgov)} matches`,
					claim: "FATO_VERIFICADO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Antecedência mediana",
					value: formatHours(metrics.median_lead_time_hours),
					hint: `p75 ${formatHours(metrics.p75_lead_time_hours)} · p95 ${formatHours(metrics.p95_lead_time_hours)}`,
					claim: "FATO_VERIFICADO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Local-only provisório",
					value: formatInt(metrics.local_only_provisional),
					hint: `confirmado ${formatInt(metrics.local_only_confirmed)} · aguardando ${formatInt(metrics.local_only_pending)}`,
					claim: "INFERENCIA"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Municípios mapeados",
					value: formatInt(metrics.municipalities_mapped),
					hint: `verificados ${formatInt(metrics.municipalities_with_verified_source)} · sem portal/UNKNOWN ${formatInt(metrics.municipalities_without_portal)}`,
					claim: "PENDENTE_DE_VALIDACAO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Contratações canônicas",
					value: formatInt(metrics.canonical_procurements),
					hint: `${formatInt(metrics.conflicts_observed)} conflitos entre fontes`,
					claim: "FATO_VERIFICADO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Connectors ativos",
					value: formatInt(metrics.active_connectors),
					hint: `reuso ${formatPct(metrics.adapter_reuse_ratio)} · ${formatInt(metrics.families_with_5plus_verified_entities)} famílias com 5+ VERIFIED`,
					claim: "FATO_VERIFICADO"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Prioridade de integração"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "Pesos M4 (catálogo × gap). O ranking de ganho marginal versionado está em Prioridades (v1). Overlap abaixo é de records, não de declaração."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriorityTable, { rows: metrics.family_priorities })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Relatórios ao vivo"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "GET público. Sem login. Fiorilli e Paradigma exercitados; adapter comercial permanece NO-GO."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProbeList, { rows: metrics.live_probes })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Local-only"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "Registro local válido sem match PNCP nesta janela. Provisório até a reconciliação (1h / 6h / 24h / 72h / 7d). Confirmado após a janela operacional não é irregularidade nem descumprimento jurídico."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalOnlyTable, { rows: localOnly })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Conflitos entre fontes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "Nenhuma fonte vence em silêncio. PNCP pode ser autoridade nacional; o portal local pode publicar antes."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComparisonTable, { rows: comparisons })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Censo municipal"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "Ausência de portal é dado. UNKNOWN não foi inventado como plataforma. Meta progressiva: 100 → 500 → 1.000 → 5.570."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CensusTable, { rows: census })
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
						}), " — 20 entes BLL, 1 generic-action, ≥100 records locais, overlap medido por entity resolution, lead time positivo (portal local antes do PNCP)."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: "FATO"
						}), " — Assis Fiorilli: ExtJS SPA (comprasedital.dll + fiorilli.css). Itapira: timeout no GET público."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: "FATO"
						}), " — Florianópolis e Barueri compartilham /portal/css/portalcss e kendoUI (ASP.NET, não JSF)."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: "INFERÊNCIA"
						}), " — local-only confirmado após 7 dias sem PNCP. Não há prazo oficial de publicação."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: "PENDENTE"
						}), " — censo dos 5.570 municípios. Licitanet, BNC, BBMNET, Licitar Digital, ComprasBR: plataforma VERIFIED, entes não mapeados."] })
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-medium tracking-tight",
						children: "GO / NO-GO para o próximo marco"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted",
						children: [
							"Milestone 4 é ",
							metrics.milestone_verdict,
							": ingestão multi-ente BLL, resolução local→PNCP, overlap de records, local-only, lead time e canônicos sem duplicata evitável. Segunda família exercitada ao vivo com limitação documentada — FiorilliAdapter e ParadigmaAdapter continuam NO-GO."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Próximo passo: família de maior ganho marginal (priority score), não a de maior catálogo."
					})
				]
			})]
		})
	] }) : null] });
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
function PriorityTable({ rows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Nenhuma família com fonte cadastrada."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Família" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Score" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "VERIFIED" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Records" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Overlap PNCP" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Local-only" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Reuso" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((row) => {
			const family = asTechFamily(row.family);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/familias/$family",
					params: { family },
					className: "font-medium text-fg hover:underline",
					children: TECHNOLOGY_LABELS[family]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: row.rationale
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-mono text-sm",
					children: row.priority_score.toFixed(3)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatInt(row.verified_entities) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatInt(row.records_local) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatPct(row.pncp_overlap_ratio) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatInt(row.local_only) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Verdict, { value: row.generic_reuse }), row.adapter ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "muted",
						children: CONNECTOR_LABELS[asConnector(row.adapter)]
					}) : null]
				}) })
			] }, row.family);
		}) })] })
	});
}
function ProbeList({ rows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Nenhum probe nesta janela."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-3 md:grid-cols-2",
		children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-fg",
						children: row.source_name ?? row.source_system_id
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
	});
}
function LocalOnlyTable({ rows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Nenhum local-only nesta janela."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Ente" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Objeto" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Estado" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Visto" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.slice(0, 40).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/fontes/$id",
				params: { id: row.source_system_id },
				className: "text-fg hover:underline",
				children: row.source_name ?? row.source_system_id
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					row.uf ?? "—",
					" · ",
					row.source_identifier
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "max-w-sm truncate",
				children: row.object ?? "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "muted",
				children: LOCAL_ONLY_LABELS[asLocal(row.local_only_state)]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-xs text-muted",
				children: row.first_seen_at?.slice(0, 16).replace("T", " ") ?? "—"
			})
		] }, row.id)) })] })
	});
}
function ComparisonTable({ rows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Nenhum conflito observado."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Campo" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fonte A" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fonte B" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Objeto" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.slice(0, 30).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "font-mono text-xs",
				children: row.field
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
				className: "text-xs",
				children: [row.source_a_id, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: row.value_a
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
				className: "text-xs",
				children: [row.source_b_id, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: row.value_b
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "max-w-xs truncate text-sm",
				children: row.object ?? "—"
			})
		] }, row.id)) })] })
	});
}
function CensusTable({ rows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Censo municipal ainda vazio."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Município" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "IBGE" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Presença" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fonte" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Evidência" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Adapter" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [row.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-2 text-xs text-muted",
				children: row.uf
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "font-mono text-xs",
				children: row.ibge_code ?? "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: PORTAL_PRESENCE_LABELS[asPresence(row.portal_presence)] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.source_system_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/fontes/$id",
				params: { id: row.source_system_id },
				className: "text-fg hover:underline",
				children: row.source_name ?? row.source_system_id
			}) : "—" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: EVIDENCE_LABELS[asLevel(row.evidence_level)] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "font-mono text-xs",
				children: row.adapter ?? "NONE"
			})
		] }, row.id)) })] })
	});
}
//#endregion
export { CoberturaPage as component };
