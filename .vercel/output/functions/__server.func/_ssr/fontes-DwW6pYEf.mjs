import { o as __toESM } from "../_runtime.mjs";
import { S as TECHNOLOGY_FAMILIES, d as EVIDENCE_LEVELS, g as JURISDICTION_TYPES, o as CLASSIFICATION_STATES } from "./types-DkMyNmeu.mjs";
import { F as TECHNOLOGY_LABELS, P as STATE_LABELS, R as cn, _ as EVIDENCE_LABELS, w as JURISDICTION_LABELS } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogOverlay$1, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { s as Button } from "./router-kRQOR_EK.mjs";
import { A as listJurisdictionsFn, V as registerSourceFn, n as PageShell, t as PageHeader, z as listSourcesFn } from "./api-BbDjf7Uy.mjs";
import { a as readString, t as asEnum } from "./json-DMlCsaaG.mjs";
import { c as matchesFilters } from "./view-DDAn-sqq.mjs";
import { n as PageSkeleton, r as QueryErrorState, t as EmptyState } from "./status-states-CB2KYIx6.mjs";
import { t as SourceRow } from "./source-row-BhQQGps8.mjs";
import { n as NativeSelect, t as Input } from "./input-BJIo7alT.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fontes-DwW6pYEf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-bg/80", className),
	...props
}));
DialogOverlay.displayName = "DialogOverlay";
var DialogContent = (0, import_react.forwardRef)(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed top-1/2 left-4 right-4 z-50 max-h-dvh max-w-md -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-border sm:left-1/2 sm:right-auto sm:w-full sm:-translate-x-1/2", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-md text-muted transition-[background-color,color] duration-quick ease-smooth-out hover:bg-surface-2 hover:text-fg focus-visible:ring-2 focus-visible:ring-accent/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Fechar"
		})]
	})]
})] }));
DialogContent.displayName = "DialogContent";
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-5 flex flex-col gap-1 pr-8", className),
		...props
	});
}
var DialogTitle = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("font-display text-xl font-medium tracking-tight", className),
	...props
}));
DialogTitle.displayName = "DialogTitle";
var DialogDescription = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted", className),
	...props
}));
DialogDescription.displayName = "DialogDescription";
var Label = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("text-sm font-medium text-fg", className),
	...props
}));
Label.displayName = "Label";
var BRAZIL_UFS = [
	"AC",
	"AL",
	"AP",
	"AM",
	"BA",
	"CE",
	"DF",
	"ES",
	"GO",
	"MA",
	"MT",
	"MS",
	"MG",
	"PA",
	"PB",
	"PR",
	"PE",
	"PI",
	"RJ",
	"RN",
	"RS",
	"RO",
	"RR",
	"SC",
	"SP",
	"SE",
	"TO"
];
function FontesPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const [uf, setUf] = (0, import_react.useState)("");
	const [family, setFamily] = (0, import_react.useState)("");
	const [evidence, setEvidence] = (0, import_react.useState)("");
	const [state, setState] = (0, import_react.useState)("");
	const sourcesQuery = useQuery({
		queryKey: ["sources"],
		queryFn: () => listSourcesFn()
	});
	const sources = (0, import_react.useMemo)(() => {
		return (sourcesQuery.data ?? []).filter((source) => matchesFilters(source, {
			q,
			uf,
			family,
			evidence,
			state
		}));
	}, [
		sourcesQuery.data,
		q,
		uf,
		family,
		evidence,
		state
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Fontes",
			description: "Sistemas-fonte observados. Clique para abrir o dossiê.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegisterSourceDialog, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Buscar nome ou URL",
					"aria-label": "Buscar fontes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
					value: uf,
					onChange: (e) => setUf(e.target.value),
					"aria-label": "UF",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Todas as UFs"
					}), BRAZIL_UFS.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: code,
						children: code
					}, code))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
					value: family,
					onChange: (e) => setFamily(e.target.value),
					"aria-label": "Família tecnológica",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Todas as famílias"
					}), TECHNOLOGY_FAMILIES.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: code,
						children: TECHNOLOGY_LABELS[code]
					}, code))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
					value: evidence,
					onChange: (e) => setEvidence(e.target.value),
					"aria-label": "Nível de evidência",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Toda evidência"
					}), EVIDENCE_LEVELS.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: code,
						children: EVIDENCE_LABELS[code]
					}, code))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
					value: state,
					onChange: (e) => setState(e.target.value),
					"aria-label": "Estado",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Todos os estados"
					}), CLASSIFICATION_STATES.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: code,
						children: STATE_LABELS[code]
					}, code))]
				})
			]
		}),
		sourcesQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { rows: 6 }) : sourcesQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorState, {
			message: sourcesQuery.error instanceof Error ? sourcesQuery.error.message : "Erro desconhecido.",
			onRetry: () => sourcesQuery.refetch()
		}) : sources.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Nenhuma fonte neste recorte",
			hint: "Registre um portal ou afrouxe os filtros."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-2",
			children: sources.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceRow, { source }) }, source.id))
		})
	] });
}
function RegisterSourceDialog() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [baseUrl, setBaseUrl] = (0, import_react.useState)("");
	const [jurisdictionId, setJurisdictionId] = (0, import_react.useState)("");
	const jurisdictionsQuery = useQuery({
		queryKey: ["jurisdictions"],
		queryFn: () => listJurisdictionsFn(),
		enabled: open
	});
	const register = useMutation({
		mutationFn: () => registerSourceFn({ data: {
			name: name.trim(),
			baseUrl: baseUrl.trim(),
			jurisdictionId
		} }),
		onSuccess: (source) => {
			toast.success("Fonte registrada.");
			queryClient.invalidateQueries({ queryKey: ["sources"] });
			queryClient.invalidateQueries({ queryKey: ["metrics"] });
			setOpen(false);
			setName("");
			setBaseUrl("");
			setJurisdictionId("");
			navigate({
				to: "/fontes/$id",
				params: { id: source.id }
			});
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Falha ao registrar")
	});
	const jurisdictions = jurisdictionsQuery.data ?? [];
	const canSubmit = name.trim().length > 1 && baseUrl.trim().length > 3 && jurisdictionId.length > 0 && !register.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Registrar fonte" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Registrar fonte" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Cadastro mínimo. A família tecnológica só entra com evidência." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex flex-col gap-4",
			onSubmit: (e) => {
				e.preventDefault();
				if (canSubmit) register.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "source-name",
						children: "Nome"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "source-name",
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "Portal de compras de…",
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "source-url",
						children: "URL base"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "source-url",
						type: "url",
						value: baseUrl,
						onChange: (e) => setBaseUrl(e.target.value),
						placeholder: "https://",
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "source-jurisdiction",
							children: "Jurisdição"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
							id: "source-jurisdiction",
							value: jurisdictionId,
							onChange: (e) => setJurisdictionId(e.target.value),
							required: true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Selecionar"
							}), jurisdictions.map((item) => {
								const id = readString(item.id);
								const type = asEnum(item.type, JURISDICTION_TYPES, "OTHER");
								const uf = readString(item.uf);
								const label = readString(item.name, id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: id,
									children: [
										uf ? `${uf} · ` : "",
										label,
										" (",
										JURISDICTION_LABELS[type],
										")"
									]
								}, id);
							})]
						}),
						open && !jurisdictionsQuery.isLoading && jurisdictions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Nenhuma jurisdição cadastrada ainda."
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: !canSubmit,
					children: register.isPending ? "Registrando…" : "Registrar"
				})
			]
		})] })]
	});
}
//#endregion
export { FontesPage as component };
