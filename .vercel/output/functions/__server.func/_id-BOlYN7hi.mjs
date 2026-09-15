import { i as formatHours, o as formatMoney, r as formatDate } from "./_ssr/rolldown-runtime-D7D4PA-g.mjs";
import { L as localOnlyUxLabel, N as SIGNAL_LEVEL_LABELS, a as ATTENTION_COMPONENT_LABELS, f as CONVERSION_LABELS, k as PLANNING_ORIGIN_LABELS, x as HORIZON_LABELS } from "./_ssr/labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { c as ClaimBadge, l as Badge, r as Route$2 } from "./_ssr/router-kRQOR_EK.mjs";
import { g as getOpportunityFn, n as PageShell, t as PageHeader } from "./_ssr/api-BbDjf7Uy.mjs";
import { n as PageSkeleton, r as QueryErrorState } from "./_ssr/status-states-CB2KYIx6.mjs";
import { t as Card } from "./_ssr/card-lp01NrQY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-BOlYN7hi.js
var import_jsx_runtime = require_jsx_runtime();
function OpportunityDetailPage() {
	const { id } = Route$2.useParams();
	const query = useQuery({
		queryKey: ["opportunity", id],
		queryFn: () => getOpportunityFn({ data: { id } })
	});
	const row = query.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 8 }) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: query.error instanceof Error ? query.error.message : "Erro.",
		onRetry: () => query.refetch()
	}) : !row ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Oportunidade não encontrada."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: row.object ?? "Oportunidade",
			description: `${row.organization_name ?? "Órgão"} · ${row.uf ?? "—"}`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-6 flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: row.horizon === "EARLY" ? "warn" : "ok",
					children: HORIZON_LABELS[row.horizon] ?? row.horizon
				}),
				row.early_kind ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "muted",
					children: localOnlyUxLabel(row.early_kind)
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: row.claim_kind }),
				row.catalog_code ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					children: [
						row.catalog_type,
						" ",
						row.catalog_code
					]
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-3 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Valor estimado",
					value: formatMoney(row.estimated_value_num)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Prazo",
					value: formatDate(row.proposal_deadline)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Antecedência",
					value: formatHours(row.lead_time_hours)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Atenção / confiança",
					value: `${row.attention_score?.toFixed(1) ?? "—"} / ${Math.round(row.data_confidence * 100)}`
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-medium tracking-tight",
					children: "Por que esta atenção?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: [row.score?.rationale ?? "Score ainda não materializado.", " Separado da confiança dos dados."]
				}),
				row.score ? Object.entries(row.score.components).sort((a, b) => b[1] - a[1]).map(([key, value]) => {
					const weight = row.score?.weights[key] ?? 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1 flex justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ATTENTION_COMPONENT_LABELS[key] ?? key }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-xs text-muted",
								children: [
									value.toFixed(2),
									" × ",
									weight.toFixed(2)
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1.5 overflow-hidden rounded-sm bg-surface-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-accent",
								style: { width: `${Math.round(value * 100)}%` }
							})
						})]
					}, key);
				}) : null
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-lg font-medium tracking-tight",
					children: [row.sources.length, " fontes"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: "Uma contratação canônica, várias origens."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-3",
					children: row.sources.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/fontes/$id",
						params: { id: source.id },
						className: "text-fg hover:underline",
						children: source.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: ["primeira vista ", formatDate(source.first_seen_at)]
					})] }, source.id))
				})
			] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium tracking-tight",
				children: "Linha do tempo"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-4 flex flex-col gap-3 border-l border-border pl-4",
				children: row.events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: formatDate(event.occurred_at)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fg",
						children: event.summary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [event.source_name ?? "sistema", event.change_priority ? ` · ${event.change_priority}` : ""]
					})
				] }, event.id))
			})]
		}),
		row.planning_links.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium tracking-tight",
				children: "Planejamento ligado"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: row.planning_links.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "text-sm text-muted",
					children: [
						PLANNING_ORIGIN_LABELS[item.origin_type] ?? item.origin_type,
						" ·",
						" ",
						CONVERSION_LABELS[item.status] ?? item.status,
						" · ",
						item.object
					]
				}, item.planning_id))
			})]
		}) : null,
		row.recurrence.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Sinais de recorrência"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Inferência histórica. Não é previsão de nova licitação."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-2",
					children: row.recurrence.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm text-muted",
						children: [
							SIGNAL_LEVEL_LABELS[item.signal_level] ?? item.signal_level,
							" · ",
							item.purchase_count,
							" processos ·",
							" ",
							item.rationale
						]
					}, item.id))
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-8 text-xs text-muted",
			children: [
				"Texto oficial preservado: ",
				row.raw_object,
				". Normalizado só para agrupamento: ",
				row.normalized_object,
				"."
			]
		})
	] }) });
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs tracking-wide text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 font-display text-xl font-medium tracking-tight",
			children: value
		})]
	});
}
//#endregion
export { OpportunityDetailPage as component };
