import { o as __toESM } from "./_runtime.mjs";
import { _ as LINK_STATUSES, b as PAGINATION_TYPES, f as EVIDENCE_TYPES, h as HEALTH_STATES, i as CAPABILITY_SUPPORT_STATES, l as DISCOVERY_STRATEGIES, p as FRAMEWORK_FAMILIES, r as CAPABILITIES, t as ACCESS_TYPES, u as ENDPOINT_TYPES, v as LOCAL_ONLY_STATES, y as OBSERVATION_TYPES } from "./_ssr/types-DkMyNmeu.mjs";
import { i as formatHours, r as formatDate } from "./_ssr/rolldown-runtime-D7D4PA-g.mjs";
import { C as INGESTION_MODE_LABELS, D as OBSERVATION_LABELS, E as LOCAL_ONLY_LABELS, F as TECHNOLOGY_LABELS, I as VALUE_CLASSIFICATION_LABELS, M as PUBLIC_KEY_SEMANTICS_LABELS, O as PAGINATION_LABELS, P as STATE_LABELS, R as cn, T as LINK_STATUS_LABELS, _ as EVIDENCE_LABELS, b as HEALTH_LABELS, d as CONNECTOR_READINESS_LABELS, g as ENDPOINT_TYPE_LABELS, h as DISCOVERY_STRATEGY_LABELS, o as CAPABILITY_LABELS, s as CAPABILITY_SUPPORT_LABELS, t as ACCESS_LABELS, u as CONNECTOR_LABELS, v as EVIDENCE_TYPE_LABELS, y as FUNCTIONAL_LABELS } from "./_ssr/labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { a as Route$6, c as ClaimBadge, l as Badge, s as Button } from "./_ssr/router-kRQOR_EK.mjs";
import { t as PaFrameworkNote } from "./_ssr/pa-note-bVFdOpoR.mjs";
import { G as verifySourceFn, R as listSourceRecordsFn, i as fingerprintSourceFn, n as PageShell, r as discoverSourceFn, t as PageHeader, v as getSourceFn } from "./_ssr/api-BbDjf7Uy.mjs";
import { a as readString, i as readNumber, n as asJsonObject, o as readStringOrNull, r as readBool, t as asEnum } from "./_ssr/json-DMlCsaaG.mjs";
import { a as asTechFamily, i as asState, l as sourceClaim, n as asEvidence, o as discoverMessage, r as asFunctionalFamily, s as fingerprintMessage, t as asConnector } from "./_ssr/view-DDAn-sqq.mjs";
import { n as PageSkeleton, r as QueryErrorState, t as EmptyState } from "./_ssr/status-states-CB2KYIx6.mjs";
import { t as Card } from "./_ssr/card-lp01NrQY.mjs";
import { t as DiscoveryChannelStack } from "./_ssr/discovery-channels-FztfV89j.mjs";
import { n as PNCP_OFFICIAL_NAME, t as PNCP_EDITAL_EXAMPLE } from "./_ssr/pncp-url-CkM9bQPG.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./_ssr/tabs-Dw7k9Max.mjs";
import { t as Root } from "./_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-C9lDaNSI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MonoPanel({ value }) {
	if (value == null || value === "") return null;
	const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: "max-h-80 overflow-auto rounded-md bg-bg p-3 font-mono text-xs leading-relaxed text-muted",
		children: text
	});
}
var Separator = (0, import_react.forwardRef)(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className),
	...props
}));
Separator.displayName = "Separator";
var TABS = [
	{
		id: "visao",
		label: "Visão"
	},
	{
		id: "canais",
		label: "Canais"
	},
	{
		id: "capacidades",
		label: "Capacidades"
	},
	{
		id: "endpoints",
		label: "Endpoints"
	},
	{
		id: "evidencias",
		label: "Evidências"
	},
	{
		id: "observacoes",
		label: "Observações"
	},
	{
		id: "fingerprints",
		label: "Fingerprints"
	},
	{
		id: "historico",
		label: "Histórico"
	},
	{
		id: "connector",
		label: "Connector"
	},
	{
		id: "saude",
		label: "Saúde"
	},
	{
		id: "registros",
		label: "Registros"
	}
];
function SourceDossierPage() {
	const { id } = Route$6.useParams();
	const queryClient = useQueryClient();
	const sourceQuery = useQuery({
		queryKey: ["source", id],
		queryFn: () => getSourceFn({ data: { id } })
	});
	const recordsQuery = useQuery({
		queryKey: ["source-records", id],
		queryFn: () => listSourceRecordsFn({ data: { id } })
	});
	const fingerprint = useMutation({
		mutationFn: () => fingerprintSourceFn({ data: { id } }),
		onSuccess: (res) => {
			toast.success(fingerprintMessage(res));
			queryClient.invalidateQueries({ queryKey: ["source", id] });
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Falha no fingerprint")
	});
	const verify = useMutation({
		mutationFn: () => verifySourceFn({ data: { id } }),
		onSuccess: (res) => {
			toast.success(fingerprintMessage(res));
			queryClient.invalidateQueries({ queryKey: ["source", id] });
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Falha na verificação")
	});
	const discover = useMutation({
		mutationFn: () => discoverSourceFn({ data: { id } }),
		onSuccess: (res) => {
			toast.success(discoverMessage(res));
			queryClient.invalidateQueries({ queryKey: ["source", id] });
			queryClient.invalidateQueries({ queryKey: ["source-records", id] });
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Falha na descoberta")
	});
	if (sourceQuery.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 6 }) });
	if (sourceQuery.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
		message: sourceQuery.error instanceof Error ? sourceQuery.error.message : "Erro desconhecido.",
		onRetry: () => sourceQuery.refetch()
	}) });
	const source = sourceQuery.data;
	if (!source) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Fonte não encontrada",
		hint: "O identificador não corresponde a um source_system cadastrado."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/fontes",
		className: "mt-4 inline-flex min-h-11 items-center text-sm text-muted hover:text-fg",
		children: "Voltar às fontes"
	})] });
	const family = asTechFamily(source.technology_family);
	const showPaNote = source.jurisdiction_uf === "PA" || family === "GENERIC_JSF" || family === "PARADIGMA_WBC";
	const busy = fingerprint.isPending || verify.isPending || discover.isPending;
	const evidence = asEvidence(source.vendor_evidence_level);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: source.name,
			description: source.base_url ?? void 0,
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					disabled: busy,
					onClick: () => fingerprint.mutate(),
					children: "Fingerprint"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					disabled: busy,
					onClick: () => verify.mutate(),
					children: "Verificar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: busy,
					onClick: () => discover.mutate(),
					children: "Descobrir"
				})
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: source.jurisdiction_name ?? "—"
				}),
				source.jurisdiction_uf ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "muted",
					children: source.jurisdiction_uf
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: FUNCTIONAL_LABELS[asFunctionalFamily(source.functional_family)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: TECHNOLOGY_LABELS[family]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "muted",
					children: EVIDENCE_LABELS[evidence]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "muted",
					children: CONNECTOR_LABELS[asConnector(source.connector_type)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "default",
					children: STATE_LABELS[asState(source.classification_state)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, {
					kind: sourceClaim(source),
					evidence
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-6 text-xs text-subtle",
			children: "Fingerprint é passivo (GET público). Verificar confirma evidência. Descobrir dispara ingestão."
		}),
		showPaNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaFrameworkNote, {})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "visao",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
						className: "h-auto w-max min-w-full justify-start",
						children: TABS.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: tab.id,
							className: "min-h-11",
							children: tab.label
						}, tab.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "visao",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisaoTab, { source })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "canais",
					children: (source.channels ?? []).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiscoveryChannelStack, { channels: source.channels }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "Nenhum canal registrado",
						hint: "Canais descrevem superfícies públicas distintas do mesmo portal — lista, detalhe e paginação por canal, sem adapter de marca."
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "capacidades",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
						rows: source.capabilities,
						emptyTitle: "Nenhuma capacidade observada",
						emptyHint: "Capacidades entram após fingerprint ou verificação.",
						render: (row, key) => {
							const cap = asEnum(row.capability, CAPABILITIES, CAPABILITIES[0]);
							const support = asEnum(row.support_status, CAPABILITY_SUPPORT_STATES, "UNKNOWN");
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-lg border border-border bg-surface px-4 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-medium",
												children: CAPABILITY_LABELS[cap]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: support === "SUPPORTED" ? "ok" : "muted",
												children: CAPABILITY_SUPPORT_LABELS[support]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "muted",
												children: ACCESS_LABELS[asEnum(row.access_type, ACCESS_TYPES, "UNKNOWN")]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: sourceClaim({ vendor_evidence_level: readString(row.evidence_level, source.vendor_evidence_level ?? "") }) })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-mono text-xs text-muted",
										children: [readStringOrNull(row.method), readStringOrNull(row.endpoint_or_url)].filter(Boolean).join(" ")
									}),
									row.raw_metadata != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonoPanel, { value: row.raw_metadata })
									}) : null
								]
							}, key);
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "endpoints",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
						rows: source.endpoints,
						emptyTitle: "Nenhum endpoint",
						emptyHint: "Rotas públicas observadas aparecem aqui.",
						render: (row, key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-lg border border-border bg-surface px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: readString(row.name, "endpoint")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "muted",
										children: readString(row.http_method, "GET")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										children: ENDPOINT_TYPE_LABELS[asEnum(row.endpoint_type, ENDPOINT_TYPES, "OTHER")]
									}),
									row.pagination_type ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "muted",
										children: PAGINATION_LABELS[asEnum(row.pagination_type, PAGINATION_TYPES, "UNKNOWN")]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: readBool(row.public) ? "FATO_VERIFICADO" : "INFERENCIA" })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-muted",
								children: readString(row.path)
							})]
						}, key)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "evidencias",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
						rows: source.evidence,
						emptyTitle: "Sem evidências",
						emptyHint: "Documento oficial, contrato e assinatura técnica entram neste dossiê.",
						render: (row, key) => {
							const level = asEvidence(row.evidence_level);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-lg border border-border bg-surface px-4 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-medium",
												children: readString(row.title, "Evidência")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "muted",
												children: EVIDENCE_TYPE_LABELS[asEnum(row.evidence_type, EVIDENCE_TYPES, "OTHER")]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												children: EVIDENCE_LABELS[level]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { evidence: level })
										]
									}),
									readStringOrNull(row.description) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: readString(row.description)
									}) : null,
									readStringOrNull(row.publisher) || readStringOrNull(row.vendor_name) || readStringOrNull(row.product_name) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-subtle",
										children: [
											readStringOrNull(row.publisher),
											readStringOrNull(row.vendor_name),
											readStringOrNull(row.product_name)
										].filter(Boolean).join(" · ")
									}) : null,
									readStringOrNull(row.raw_excerpt) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 border-l-2 border-border pl-3 font-mono text-xs text-muted",
										children: readString(row.raw_excerpt)
									}) : null,
									readStringOrNull(row.url) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: readString(row.url),
										className: "mt-1 inline-block text-xs text-muted underline-offset-4 hover:underline",
										target: "_blank",
										rel: "noreferrer",
										children: readString(row.url)
									}) : null,
									row.raw_payload != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonoPanel, { value: row.raw_payload })
									}) : null
								]
							}, key);
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "observacoes",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
						rows: source.observations,
						emptyTitle: "Sem observações",
						emptyHint: "Headers, cookies, rotas e sufixos de página ficam separados da classificação.",
						render: (row, key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-lg border border-border bg-surface px-4 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "muted",
										children: OBSERVATION_LABELS[asEnum(row.observation_type, OBSERVATION_TYPES, "OTHER")]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: "FATO_VERIFICADO" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 font-mono text-sm",
									children: [
										readString(row.key),
										" = ",
										readString(row.value)
									]
								}),
								row.raw_payload != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonoPanel, { value: row.raw_payload })
								}) : null
							]
						}, key)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "fingerprints",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintsTab, { source })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "historico",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
						rows: source.history,
						emptyTitle: "Sem histórico de plataforma",
						emptyHint: "Troca de fornecedor preserva o período anterior. Não se infere o atual pelo passado.",
						render: (row, key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-lg border border-border bg-surface px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: TECHNOLOGY_LABELS[asTechFamily(row.technology_family)]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { evidence: asEvidence(row.evidence_level) })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: [
									formatDate(readStringOrNull(row.valid_from)),
									" —",
									" ",
									row.valid_to ? formatDate(readString(row.valid_to)) : "vigente"
								]
							})]
						}, key)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "connector",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorTab, { source })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "saude",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaudeTab, { source })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "registros",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegistrosTab, {
						rows: recordsQuery.data ?? [],
						loading: recordsQuery.isLoading
					})
				})
			]
		})
	] });
}
function Field({ label, children, claim }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-subtle uppercase",
				children: label
			}), claim ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: claim }) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-fg",
			children
		})]
	});
}
function VisaoTab({ source }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2 sm:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Jurisdição",
					children: source.jurisdiction_name ?? "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Família funcional",
					children: FUNCTIONAL_LABELS[asFunctionalFamily(source.functional_family)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
					label: "Família tecnológica",
					claim: FRAMEWORK_FAMILIES.has(asTechFamily(source.technology_family)) ? "INFERENCIA" : sourceClaim(source),
					children: [
						TECHNOLOGY_LABELS[asTechFamily(source.technology_family)],
						source.vendor_name ? ` · ${source.vendor_name}` : "",
						source.product_name ? ` / ${source.product_name}` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Estratégia de descoberta",
					children: DISCOVERY_STRATEGY_LABELS[asEnum(source.discovery_strategy, DISCOVERY_STRATEGIES, "UNKNOWN")]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Sobreposição PNCP (declaração)",
					children: source.pncp_overlap ? "Sim — declaração da fonte, não overlap de records" : "Não observada"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Sobreposição Compras.gov (declaração)",
					children: source.comprasgov_overlap ? "Sim — declaração da fonte" : "Não observada"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "URL base",
					children: source.base_url ?? "—"
				}),
				source.id === "src_br_pncp" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
					label: "URL pública de edital",
					claim: "FATO_VERIFICADO",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: PNCP_EDITAL_EXAMPLE,
							className: "font-mono text-xs underline-offset-4 hover:underline",
							target: "_blank",
							rel: "noreferrer",
							children: ["https://pncp.gov.br/app/editais/", "{cnpj}-{unidade}-{numero}/{ano}"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 block font-mono text-xs text-muted",
							children: ["Ex.: ", PNCP_EDITAL_EXAMPLE]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 block text-xs text-subtle",
							children: [PNCP_OFFICIAL_NAME, " — não usar /pncp-api/ como link público."]
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Última verificação",
					children: formatDate(source.last_verified_at)
				})
			]
		}), source.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "Notas",
			children: source.notes
		})] }) : null]
	});
}
function FingerprintsTab({ source }) {
	const run = source.last_run;
	if (!run) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Nenhuma execução",
		hint: "Fingerprint passivo coleta HTML, headers, cookies e rotas públicas."
	});
	const matches = source.last_run_matches.filter((match) => readBool(match.matched));
	const raw = asJsonObject(run.raw_result);
	const fetchErrors = Array.isArray(raw.fetch_errors) ? raw.fetch_errors.filter((item) => typeof item === "string") : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-surface px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: TECHNOLOGY_LABELS[asTechFamily(run.candidate_family ?? run.technology_family)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "muted",
						children: run.status === "FAILED" ? "Falhou" : run.status === "COMPLETED" ? "Concluído" : run.status === "RUNNING" ? "Em execução" : readString(run.status, "—")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { evidence: asEvidence(run.evidence_level) })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted",
				children: [
					formatDate(readStringOrNull(run.started_at)),
					" · score ",
					readNumber(run.score, 0)
				]
			}),
			readStringOrNull(run.error) && fetchErrors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-danger",
				children: readString(run.error)
			}) : null,
			fetchErrors.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm text-muted",
				children: [
					fetchErrors.length === 1 ? "1 coleta pública falhou." : `${fetchErrors.length} coletas públicas falharam.`,
					" ",
					"Classificação segue nas observações já guardadas."
				]
			}) : null,
			matches.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-1",
				children: matches.map((match, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "font-mono text-xs text-muted",
					children: [
						"match · ",
						readString(match.signature_key ?? match.key),
						readStringOrNull(match.observed_value) ? ` · ${readString(match.observed_value)}` : ""
					]
				}, i))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Nenhuma assinatura bateu. Família comercial permanece pendente."
			})
		]
	});
}
function ConnectorTab({ source }) {
	const config = source.connector_config;
	const readiness = config ? readStringOrNull(config.connector_readiness) : null;
	const semantics = config ? readStringOrNull(config.public_key_semantics) : null;
	const classification = config ? readStringOrNull(config.value_classification) : null;
	const fingerprint = config ? readStringOrNull(config.public_key_fingerprint) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "Adapter",
				children: [CONNECTOR_LABELS[asConnector(source.connector_type)], source.connector_version ? ` · ${source.connector_version}` : ""]
			}),
			readiness ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Prontidão",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: readiness === "LIVE" ? "ok" : readiness === "DEGRADED" || readiness === "AUTH_REQUIRED" ? "warn" : "muted",
					children: CONNECTOR_READINESS_LABELS[readiness] ?? readiness
				})
			}) : null,
			classification ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Classificação do valor",
				children: VALUE_CLASSIFICATION_LABELS[classification] ?? classification
			}) : null,
			semantics ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "Semântica da publicKey",
				claim: "FATO_VERIFICADO",
				children: [PUBLIC_KEY_SEMANTICS_LABELS[semantics] ?? semantics, fingerprint ? ` · fingerprint ${fingerprint}` : ""]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Semântica da publicKey",
				claim: "FATO_VERIFICADO",
				children: "Nenhuma chave persistida. Config pública usa identificador de órgão, não credencial."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Um adapter atende N fontes. A configuração vive no source_system, não no código. HTTP 400 de autenticação é erro de configuração, não de parser."
			}),
			config ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonoPanel, { value: config })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Sem config persistida."
			})
		]
	});
}
function healthVariant(state) {
	if (state === "HEALTHY") return "ok";
	if (state === "DEGRADED" || state === "SCHEMA_CHANGED" || state === "PARSER_DEGRADED") return "warn";
	if (state === "FAILING") return "danger";
	return "muted";
}
function SaudeTab({ source }) {
	const rows = source.health;
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Sem checagem de saúde",
		hint: "Health por endpoint aparece depois da primeira verificação."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-col gap-2",
		children: rows.map((row, i) => {
			const state = asEnum(row.state ?? row.status, HEALTH_STATES, "UNKNOWN");
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-lg border border-border bg-surface px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: healthVariant(state),
							children: HEALTH_LABELS[state]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind: state === "HEALTHY" ? "FATO_VERIFICADO" : "INFERENCIA" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: readString(row.detail ?? row.message, "Sem detalhe.")
					}),
					readStringOrNull(row.schema_hash) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-xs text-muted",
						children: readString(row.schema_hash)
					}) : null
				]
			}, i);
		})
	});
}
function RecordList({ rows, emptyTitle, emptyHint, render }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: emptyTitle,
		hint: emptyHint
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-col gap-2",
		children: rows.map((row, i) => render(row, readString(row.id, String(i))))
	});
}
function asLinkStatus(value) {
	if (!value) return null;
	return LINK_STATUSES.includes(value) ? value : null;
}
function asLocalState(value) {
	if (!value) return null;
	return LOCAL_ONLY_STATES.includes(value) ? value : null;
}
function RegistrosTab({ rows, loading }) {
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 4 });
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Nenhum registro ingerido",
		hint: "Descobrir persiste source_record com raw_payload, hash e fetched_at. Overlap nasce depois da resolução."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-col gap-2",
		children: rows.map((row) => {
			const status = asLinkStatus(row.match_status);
			const local = asLocalState(row.local_only_state);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-lg border border-border bg-surface px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs text-muted",
								children: row.source_identifier
							}),
							row.source_channel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: row.source_channel
							}) : null,
							row.ingestion_mode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: row.ingestion_mode === "LIVE_PUBLIC_API" ? "ok" : "muted",
								children: INGESTION_MODE_LABELS[row.ingestion_mode] ?? row.ingestion_mode
							}) : null,
							status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: status === "CONFIRMED" ? "ok" : "muted",
								children: LINK_STATUS_LABELS[status]
							}) : null,
							local && local !== "MATCHED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "warn",
								children: LOCAL_ONLY_LABELS[local]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-fg",
						children: row.excerpt ?? "sem objeto extraído"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted",
						children: [
							"visto ",
							formatDate(row.first_seen_at),
							" · fetch ",
							formatDate(row.fetched_at),
							row.match_method ? ` · ${row.match_method}` : "",
							row.lead_time_hours != null ? ` · lead ${formatHours(row.lead_time_hours)}` : "",
							row.fetch_method ? ` · ${row.fetch_method}` : ""
						]
					}),
					row.payload_hash ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-mono text-xs text-subtle",
						children: [
							"payload ",
							row.payload_hash.slice(0, 12),
							row.schema_hash ? ` · schema ${row.schema_hash.slice(0, 12)}` : ""
						]
					}) : null,
					row.matched_fields.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-mono text-xs text-subtle",
						children: ["campos: ", row.matched_fields.join(", ")]
					}) : null,
					row.source_url ? /^https?:\/\//i.test(row.source_url) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: row.source_url,
						className: "mt-1 block truncate font-mono text-xs text-muted underline-offset-4 hover:text-fg hover:underline",
						target: "_blank",
						rel: "noreferrer",
						children: row.source_url
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 truncate font-mono text-xs text-muted",
						children: row.source_url
					}) : null
				]
			}, row.id);
		})
	});
}
//#endregion
export { SourceDossierPage as component };
