import { o as __toESM } from "../_runtime.mjs";
import { a as formatInt, r as formatDate } from "./rolldown-runtime-D7D4PA-g.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { l as Badge, s as Button } from "./router-kRQOR_EK.mjs";
import { B as listWatchlistFn, H as setAlertRuleActiveFn, U as upsertAlertRuleFn, W as upsertWatchlistFn, a as getDigestFn, b as listAlertRulesFn, n as PageShell, t as PageHeader, y as listAlertEventsFn } from "./api-BbDjf7Uy.mjs";
import { n as PageSkeleton, r as QueryErrorState, t as EmptyState } from "./status-states-CB2KYIx6.mjs";
import { t as Card } from "./card-lp01NrQY.mjs";
import { n as NativeSelect, t as Input } from "./input-BJIo7alT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/alertas-CDteL5gl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AlertasPage() {
	const client = useQueryClient();
	const rules = useQuery({
		queryKey: ["alert-rules"],
		queryFn: () => listAlertRulesFn()
	});
	const events = useQuery({
		queryKey: ["alert-events"],
		queryFn: () => listAlertEventsFn()
	});
	const watch = useQuery({
		queryKey: ["watchlist"],
		queryFn: () => listWatchlistFn()
	});
	const digest = useQuery({
		queryKey: ["digest"],
		queryFn: () => getDigestFn()
	});
	const [name, setName] = (0, import_react.useState)("Novo termo");
	const [keyword, setKeyword] = (0, import_react.useState)("");
	const [uf, setUf] = (0, import_react.useState)("");
	const [early, setEarly] = (0, import_react.useState)(false);
	const createRule = useMutation({
		mutationFn: () => upsertAlertRuleFn({ data: {
			name,
			event_types: early ? ["EARLY_SOURCE_ALERT"] : ["NEW_PROCUREMENT", "EARLY_SOURCE_ALERT"],
			filters: {
				...keyword ? { keyword } : {},
				...uf ? { uf } : {},
				early_only: early
			}
		} }),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ["alert-rules"] });
		}
	});
	const toggle = useMutation({
		mutationFn: (input) => setAlertRuleActiveFn({ data: input }),
		onSuccess: () => client.invalidateQueries({ queryKey: ["alert-rules"] })
	});
	const addWatch = useMutation({
		mutationFn: () => upsertWatchlistFn({ data: {
			kind: "term",
			value: keyword || name,
			label: name
		} }),
		onSuccess: () => client.invalidateQueries({ queryKey: ["watchlist"] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Alertas",
			description: "Regras determinísticas. O mesmo evento não dispara duas vezes. A UI explica o porquê — nunca só 'nova oportunidade'."
		}),
		digest.data?.payload && typeof digest.data.payload === "object" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mb-6 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs tracking-wide text-subtle uppercase",
					children: ["Resumo do dia ", digest.data.digest_date]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Estrutura pronta para digest diário — sem envio de e-mail nesta etapa."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-subtle",
							children: "Oportunidades"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-display text-xl",
							children: formatInt(Number(digest.data.payload.active_opportunities ?? 0))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-subtle",
							children: "Antecipadas"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-display text-xl",
							children: formatInt(Number(digest.data.payload.early_opportunities ?? 0))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-subtle",
							children: "Planejamento"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-display text-xl",
							children: formatInt(Number(digest.data.payload.planned_demand_items ?? 0))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-subtle",
							children: "Alertas"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-display text-xl",
							children: formatInt(Number(digest.data.payload.alerts_triggered ?? 0))
						})] })
					]
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-medium",
					children: "Nova regra"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Nome da regra",
							"aria-label": "Nome"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: keyword,
							onChange: (e) => setKeyword(e.target.value),
							placeholder: "Palavra-chave",
							"aria-label": "Palavra-chave"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
							value: uf,
							onChange: (e) => setUf(e.target.value),
							"aria-label": "UF",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Qualquer UF"
							}), [
								"SC",
								"SP",
								"ES",
								"TO",
								"DF"
							].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: item,
								children: item
							}, item))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: early,
								onChange: (e) => setEarly(e.target.checked)
							}), "Só antecipadas"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => createRule.mutate(),
						disabled: !name.trim(),
						children: "Criar regra"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => addWatch.mutate(),
						disabled: !keyword && !name,
						children: "Seguir termo"
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-xl font-medium",
				children: "Regras"
			}), rules.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 4 }) : (rules.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Nenhuma regra" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-3",
				children: (rules.data ?? []).map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: rule.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: rule.event_types.join(", ")
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: rule.active ? "ok" : "muted",
							children: rule.active ? "ativa" : "off"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						size: "sm",
						variant: "secondary",
						onClick: () => toggle.mutate({
							id: rule.id,
							active: !rule.active
						}),
						children: rule.active ? "Desativar" : "Ativar"
					})]
				}) }, rule.id))
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-xl font-medium",
				children: "Eventos"
			}), events.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 4 }) : events.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
				message: "Falha ao carregar eventos.",
				onRetry: () => events.refetch()
			}) : (events.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Nenhum alerta disparado" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-3",
				children: (events.data ?? []).slice(0, 40).map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								formatDate(event.triggered_at),
								" · ",
								event.rule_name
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-fg",
							children: event.reason_text
						}),
						event.entity_type === "opportunity" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/oportunidades/$id",
							params: { id: event.entity_id },
							className: "mt-2 inline-block text-xs text-muted hover:text-fg",
							children: "Abrir oportunidade →"
						}) : null
					]
				}) }, event.id))
			})] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium",
				children: "Watchlist"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: (watch.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					children: [
						item.kind,
						": ",
						item.label ?? item.value
					]
				}, item.id))
			})]
		})
	] });
}
//#endregion
export { AlertasPage as component };
