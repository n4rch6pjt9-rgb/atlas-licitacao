import { C as VENDOR_FAMILIES, a as CLAIM_KINDS, d as EVIDENCE_LEVELS, p as FRAMEWORK_FAMILIES } from "./types-DkMyNmeu.mjs";
import { a as formatInt, i as formatHours, s as formatPct } from "./rolldown-runtime-D7D4PA-g.mjs";
import { F as TECHNOLOGY_LABELS, _ as EVIDENCE_LABELS, u as CONNECTOR_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as ClaimBadge, l as Badge } from "./router-kRQOR_EK.mjs";
import { C as listCensusFn, D as listFamilyCandidatesFn, d as getMilestone3Fn, f as getMilestone4Fn, n as PageShell, t as PageHeader } from "./api-BbDjf7Uy.mjs";
import { a as asTechFamily, t as asConnector } from "./view-DDAn-sqq.mjs";
import { n as PageSkeleton, r as QueryErrorState } from "./status-states-CB2KYIx6.mjs";
import { t as Card } from "./card-lp01NrQY.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-Cg_cqpAS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/censo-BjPJK0Ip.js
var import_jsx_runtime = require_jsx_runtime();
function asClaim(value) {
	return CLAIM_KINDS.includes(value) ? value : "PENDENTE_DE_VALIDACAO";
}
function asLevel(value) {
	return EVIDENCE_LEVELS.includes(value) ? value : "UNKNOWN";
}
function Verdict({ value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: value === "GO" ? "ok" : "danger",
		children: value
	});
}
function CensoPage() {
	const metricsQuery = useQuery({
		queryKey: ["milestone3"],
		queryFn: () => getMilestone3Fn()
	});
	const coverageQuery = useQuery({
		queryKey: ["milestone4"],
		queryFn: () => getMilestone4Fn()
	});
	const candidatesQuery = useQuery({
		queryKey: ["family-candidates"],
		queryFn: () => listFamilyCandidatesFn()
	});
	const censusQuery = useQuery({
		queryKey: ["census-rows"],
		queryFn: () => listCensusFn()
	});
	const loading = metricsQuery.isLoading || candidatesQuery.isLoading || censusQuery.isLoading || coverageQuery.isLoading;
	const error = metricsQuery.error || candidatesQuery.error || censusQuery.error || coverageQuery.error;
	const metrics = metricsQuery.data;
	const coverage = coverageQuery.data;
	const candidates = candidatesQuery.data ?? [];
	const rows = censusQuery.data ?? [];
	const commercial = candidates.filter((row) => VENDOR_FAMILIES.has(asTechFamily(row.technology_family)));
	const frameworks = candidates.filter((row) => FRAMEWORK_FAMILIES.has(asTechFamily(row.technology_family)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Censo de famílias",
		description: "Evidência comercial primeiro. Fingerprint técnico depois. Um adapter de fornecedor só nasce quando o genérico fica cheio de exceções."
	}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 6 }) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: error instanceof Error ? error.message : "Erro desconhecido.",
		onRetry: () => {
			metricsQuery.refetch();
			candidatesQuery.refetch();
			censusQuery.refetch();
			coverageQuery.refetch();
		}
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-3 md:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "Adapter comercial"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-3xl font-medium tracking-tight",
							children: metrics?.commercial_adapter_verdict ?? "NO-GO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Nenhum ParadigmaAdapter, FiorilliAdapter ou BllAdapter. O genérico cobre o contrato público observado."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "Reuso genérico"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-3xl font-medium tracking-tight",
							children: metrics?.generic_reuse_verdict ?? "NO-GO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [
								"Família escolhida:",
								" ",
								metrics?.chosen_family ? TECHNOLOGY_LABELS[asTechFamily(metrics.chosen_family)] : "nenhuma",
								metrics?.chosen_adapter ? ` · ${CONNECTOR_LABELS[asConnector(metrics.chosen_adapter)]}` : null
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "Famílias com evidência"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-3xl font-medium tracking-tight",
							children: formatInt(metrics?.families_verified ?? 0)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [
								"Integração PNCP declarada:",
								" ",
								formatPct(metrics?.pncp_overlap_ratio ?? 0),
								" — não é overlap de records. Mudanças históricas:",
								" ",
								formatInt(metrics?.historical_vendor_changes ?? 0),
								"."
							]
						})
					]
				})
			]
		}),
		coverage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/cobertura",
				className: "flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 transition-[background-color] duration-quick ease-smooth-out hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-subtle uppercase",
						children: "Overlap de records"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-xl font-medium tracking-tight",
						children: [
							"PNCP ",
							formatPct(coverage.pncp_overlap_ratio),
							" · Compras.gov",
							" ",
							formatPct(coverage.comprasgov_overlap_ratio)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							formatInt(coverage.records_ingested_local),
							" registros locais · local-only ",
							formatInt(coverage.local_only_provisional + coverage.local_only_confirmed),
							" · antecedência ",
							formatHours(coverage.median_lead_time_hours)
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: "Abrir cobertura →"
				})]
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Candidatas comerciais"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "VERIFIED só com documento oficial, contrato, manual ou identificação explícita de produto no portal do ente. .xhtml, .action e JSESSIONID não entram aqui."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandidateTable, { rows: commercial })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Frameworks"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "Família técnica. Nunca promover a fornecedor."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandidateTable, { rows: frameworks })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Ente · portal · sistema · fornecedor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "Histórico não sobrescreve o vigente. SC estadual 2014–2023 WBC permanece como intervalo fechado; o vigente é e-LIC / API JSON."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CensusTable, { rows })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10 grid gap-3 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-medium tracking-tight",
						children: "Similaridade de schema"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: metrics?.schema_similarity[0]?.note ?? "Schema parecido não prova fornecedor."
					}),
					metrics?.schema_similarity[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-xs text-subtle",
						children: [
							metrics.schema_similarity[0].left_id,
							" ×",
							" ",
							metrics.schema_similarity[0].right_id,
							" · Jaccard",
							" ",
							metrics.schema_similarity[0].jaccard
						]
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-medium tracking-tight",
					children: "Limitações e hipóteses"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 flex flex-col gap-2 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Fiorilli: Assis ao vivo é ExtJS SPA (comprasedital.dll + fiorilli.css), sem lista HTML/JSON pública. Itapira timeout. FiorilliAdapter = NO-GO." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Paradigma: Florianópolis e Barueri vigentes, assets /portal/css/portalcss + kendoUI (ASP.NET, não JSF). 2 fontes — escala insuficiente." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Licitanet, BNC, BBMNET, Licitar Digital, ComprasBR: cadastro Transferegov VERIFIED na plataforma, censo de entes PENDENTE." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Integração PNCP no censo de fontes é declaração de edital. Overlap real de records está em Cobertura, após entity resolution." })
					]
				})]
			})]
		})
	] })] });
}
function CandidateTable({ rows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Nenhuma candidata neste grupo."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Família" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fontes" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Verificadas" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Adapter" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Comercial" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Reuso" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((row) => {
			const family = asTechFamily(row.technology_family);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/familias/$family",
					params: { family },
					className: "font-medium text-fg hover:underline",
					children: TECHNOLOGY_LABELS[family]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xs text-xs text-muted",
					children: row.rationale
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatInt(row.source_count) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatInt(row.verified_sources) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-mono text-xs",
					children: row.adapter_candidate ? CONNECTOR_LABELS[asConnector(row.adapter_candidate)] : "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Verdict, { value: row.commercial_adapter }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Verdict, { value: row.generic_reuse }) })
			] }, row.technology_family);
		}) })] })
	});
}
function CensusTable({ rows }) {
	const sorted = [...rows].sort((a, b) => {
		const fa = a.technology_family.localeCompare(b.technology_family);
		if (fa !== 0) return fa;
		return a.ente.localeCompare(b.ente);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Ente" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Portal" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Sistema" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fornecedor" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Produto" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Período" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Nível" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: sorted.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/fontes/$id",
				params: { id: row.source_id },
				className: "font-medium text-fg hover:underline",
				children: row.ente
			}), row.uf ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-1 text-xs text-subtle",
				children: row.uf
			}) : null] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "max-w-40 truncate font-mono text-xs text-muted",
				children: row.portal ?? "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-sm",
				children: row.sistema ?? "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-sm",
				children: row.vendor ?? "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-sm",
				children: row.product ?? "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "max-w-48 text-xs text-muted",
				children: row.period
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: EVIDENCE_LABELS[asLevel(row.evidence_level)]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: asClaim(row.claim_kind) })]
			}) })
		] }, row.source_id)) })] })
	});
}
//#endregion
export { CensoPage as component };
