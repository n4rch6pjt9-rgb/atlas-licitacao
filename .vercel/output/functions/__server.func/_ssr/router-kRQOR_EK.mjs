import { o as __toESM } from "../_runtime.mjs";
import { n as claimFromEvidence, t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { R as cn, l as CLAIM_LABELS } from "./labels-BJbcmPwN.mjs";
import { r as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as createRootRoute, b as useRouter, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as CalendarRange, a as Package, b as Bell, c as Map$1, d as Grid3x3, f as Gauge, h as ClipboardList, i as Search, l as LayoutDashboard, m as Database, n as TriangleAlert, p as FlaskConical, r as Timer, s as Menu, t as X, u as Layers, v as Cable, y as Building2 } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as Portal, r as Provider, t as Content2 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-esGgBWjL.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "bg-surface-2 text-fg",
		muted: "bg-surface-2 text-muted",
		outline: "border border-border text-muted",
		ok: "bg-ok/15 text-ok",
		warn: "bg-warn/15 text-warn",
		danger: "bg-danger/15 text-danger"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-kRQOR_EK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var FALLBACK_MESSAGE = "Ocorreu um erro inesperado. Recarregue a página.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-danger",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 1.75
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-xl font-medium tracking-tight",
				children: "Algo deu errado"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var CLAIM_VARIANT = {
	FATO_VERIFICADO: "ok",
	INFERENCIA: "warn",
	PENDENTE_DE_VALIDACAO: "muted"
};
function ClaimBadge({ kind, evidence }) {
	const resolved = kind ?? (evidence ? claimFromEvidence(evidence) : "PENDENTE_DE_VALIDACAO");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: CLAIM_VARIANT[resolved],
		children: CLAIM_LABELS[resolved]
	});
}
function ClaimLegend({ compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: compact ? "flex flex-col gap-2" : "flex flex-wrap gap-2",
		children: [
			"FATO_VERIFICADO",
			"INFERENCIA",
			"PENDENTE_DE_VALIDACAO"
		].map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "flex items-center gap-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBadge, { kind })
		}, kind))
	});
}
var THEME_IDS = [
	"light",
	"medium",
	"dark"
];
var DEFAULT_THEME = "dark";
var THEME_STORAGE_KEY = "atlas-theme";
var THEME_LABELS = {
	light: "Claro",
	medium: "Claro médio",
	dark: "Escuro"
};
var THEME_SHORT_LABELS = {
	light: "Claro",
	medium: "Médio",
	dark: "Escuro"
};
var THEME_META = {
	light: "#f3f1eb",
	medium: "#d4cfc4",
	dark: "#0c0d0e"
};
function isThemeId(value) {
	return value === "light" || value === "medium" || value === "dark";
}
function parseTheme(value) {
	return isThemeId(value) ? value : DEFAULT_THEME;
}
function colorSchemeFor(theme) {
	return theme === "dark" ? "dark" : "light";
}
function applyTheme(theme) {
	const root = document.documentElement;
	root.setAttribute("data-theme", theme);
	root.style.colorScheme = colorSchemeFor(theme);
	localStorage.setItem(THEME_STORAGE_KEY, theme);
	const meta = document.querySelector("meta[name=\"theme-color\"]");
	if (meta) meta.setAttribute("content", THEME_META[theme]);
	window.dispatchEvent(new Event("atlas-theme"));
}
var THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t==="light"||t==="medium"||t==="dark"){var r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t==="dark"?"dark":"light";}}catch(e){}})();`;
function subscribe(onStoreChange) {
	window.addEventListener("atlas-theme", onStoreChange);
	window.addEventListener("storage", onStoreChange);
	return () => {
		window.removeEventListener("atlas-theme", onStoreChange);
		window.removeEventListener("storage", onStoreChange);
	};
}
function getSnapshot() {
	return parseTheme(localStorage.getItem(THEME_STORAGE_KEY));
}
function getServerSnapshot() {
	return "dark";
}
function useTheme() {
	return {
		theme: (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getServerSnapshot),
		setTheme: (0, import_react.useCallback)((next) => {
			applyTheme(next);
		}, [])
	};
}
function ThemeSwitcher({ compact = false }) {
	const { theme, setTheme } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("min-w-0", compact ? "" : "w-full"),
		children: [compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-xs tracking-wide text-subtle uppercase",
			children: "Aparência"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "radiogroup",
			"aria-label": "Aparência",
			className: cn("grid grid-cols-3 gap-1 rounded-lg bg-surface-2 p-1", compact ? "w-40" : "w-full"),
			children: THEME_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeOption, {
				id,
				selected: theme === id,
				onSelect: setTheme
			}, id))
		})]
	});
}
function ThemeOption({ id, selected, onSelect }) {
	const label = THEME_LABELS[id];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		role: "radio",
		"aria-checked": selected,
		"aria-label": label,
		title: label,
		onClick: () => onSelect(id),
		className: cn("flex min-h-11 flex-col items-center justify-center gap-1 rounded-md px-1 text-xs leading-none transition-[background-color,color,box-shadow] duration-quick ease-smooth-out", selected ? "bg-surface text-fg shadow-border" : "text-muted hover:text-fg"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			"data-swatch": id,
			className: "size-3.5 rounded-full ring-1 ring-fg/25 ring-inset"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: THEME_SHORT_LABELS[id]
		})]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-[transform,background-color,opacity,color,box-shadow] duration-quick ease-smooth-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-accent/40", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-surface-2 text-fg shadow-border hover:bg-surface",
			outline: "border border-border bg-transparent text-fg hover:bg-surface-2",
			ghost: "text-fg hover:bg-surface-2",
			link: "text-fg underline-offset-4 hover:underline"
		},
		size: {
			default: "h-11 min-h-11 px-4",
			sm: "h-9 min-h-9 px-3 text-sm",
			lg: "h-12 min-h-12 px-5",
			icon: "size-11 min-h-11 min-w-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = (0, import_react.forwardRef)(({ className, variant, size, asChild = false, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		type: asChild ? void 0 : type ?? "button",
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
});
Button.displayName = "Button";
var Sheet = Dialog;
var SheetPortal = DialogPortal;
var SheetOverlay = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	ref,
	className: cn("fixed inset-0 z-50 bg-bg/80", className),
	...props
}));
SheetOverlay.displayName = "SheetOverlay";
var SheetContent = (0, import_react.forwardRef)(({ className, children, side = "left", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn("fixed z-50 flex h-dvh w-72 max-w-full flex-col bg-surface shadow-border", side === "left" ? "inset-y-0 left-0 border-r border-border" : "inset-y-0 right-0 border-l border-border", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute top-2 right-2 inline-flex size-11 items-center justify-center rounded-md text-muted transition-[background-color,color] duration-quick ease-smooth-out hover:bg-surface-2 hover:text-fg focus-visible:ring-2 focus-visible:ring-accent/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Fechar"
		})]
	})]
})] }));
SheetContent.displayName = "SheetContent";
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("px-5 pt-5 pb-3 pr-12", className),
		...props
	});
}
var SheetTitle = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("font-display text-2xl font-medium tracking-tight", className),
	...props
}));
SheetTitle.displayName = "SheetTitle";
var SheetDescription = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted", className),
	...props
}));
SheetDescription.displayName = "SheetDescription";
var TooltipProvider = Provider;
var TooltipContent = (0, import_react.forwardRef)(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-w-xs rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs text-fg shadow-border", className),
	...props
}) }));
TooltipContent.displayName = "TooltipContent";
var NAV = [
	{
		to: "/",
		label: "Visão geral",
		icon: LayoutDashboard,
		exact: true
	},
	{
		to: "/oportunidades",
		label: "Oportunidades",
		icon: Timer,
		exact: false
	},
	{
		to: "/planejamento",
		label: "Planejamento",
		icon: CalendarRange,
		exact: false
	},
	{
		to: "/orgaos",
		label: "Órgãos",
		icon: Building2,
		exact: false
	},
	{
		to: "/itens",
		label: "Itens",
		icon: Package,
		exact: false
	},
	{
		to: "/alertas",
		label: "Alertas",
		icon: Bell,
		exact: false
	},
	{
		to: "/busca",
		label: "Busca",
		icon: Search,
		exact: false
	},
	{
		to: "/cobertura",
		label: "Cobertura",
		icon: Map$1,
		exact: false
	},
	{
		to: "/prioridades",
		label: "Prioridades",
		icon: Gauge,
		exact: false
	},
	{
		to: "/validacao",
		label: "Validação",
		icon: FlaskConical,
		exact: false
	},
	{
		to: "/censo",
		label: "Censo",
		icon: ClipboardList,
		exact: false
	},
	{
		to: "/fontes",
		label: "Fontes",
		icon: Database,
		exact: false
	},
	{
		to: "/familias",
		label: "Famílias",
		icon: Layers,
		exact: false
	},
	{
		to: "/matriz",
		label: "Matriz",
		icon: Grid3x3,
		exact: false
	},
	{
		to: "/adapters",
		label: "Adapters",
		icon: Cable,
		exact: false
	}
];
function pathActive(pathname, to, exact) {
	if (exact) return pathname === to;
	return pathname === to || pathname.startsWith(`${to}/`);
}
function Wordmark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl font-medium tracking-tight text-fg",
			children: "Atlas"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: "Registry de portais"
		})]
	});
}
function NavLinks({ pathname, onNavigate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Principal",
		className: "flex flex-col gap-1",
		children: NAV.map((item) => {
			const active = pathActive(pathname, item.to, item.exact);
			const Icon = item.icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				"aria-current": active ? "page" : void 0,
				onClick: onNavigate,
				className: cn("flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-[background-color,color] duration-quick ease-smooth-out", active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-4 shrink-0",
					strokeWidth: 1.75
				}), item.label]
			}, item.to);
		})
	});
}
function RailFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-auto border-t border-border pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSwitcher, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 mb-2 text-xs tracking-wide text-subtle uppercase",
				children: "Legenda de claims"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimLegend, { compact: true })
		]
	});
}
function ThemeSync() {
	(0, import_react.useEffect)(() => {
		applyTheme(parseTheme(localStorage.getItem(THEME_STORAGE_KEY)));
	}, []);
	return null;
}
function AppLayout({ children }) {
	const [client] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		staleTime: 3e4,
		retry: 1,
		refetchOnWindowFocus: false
	} } }));
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { theme } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, {
			delayDuration: 200,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSync, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-dvh bg-bg text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface p-5 lg:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex min-h-0 flex-1 flex-col overflow-hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-h-0 flex-1 overflow-y-auto pr-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, { pathname })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailFooter, {})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: "sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-border bg-bg/95 px-3 lg:hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Abrir menu",
									onClick: () => setMenuOpen(true),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "ml-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSwitcher, { compact: true })
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
							className: "min-w-0 flex-1",
							children
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
					open: menuOpen,
					onOpenChange: setMenuOpen,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
						side: "left",
						className: "bg-surface p-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Atlas" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Registry de portais" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, {
								pathname,
								onNavigate: () => setMenuOpen(false)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailFooter, {})
							})]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
					theme: theme === "dark" ? "dark" : "light",
					position: "bottom-right",
					toastOptions: { classNames: {
						toast: "bg-surface text-fg border border-border font-sans",
						title: "text-fg",
						description: "text-muted"
					} }
				})
			]
		})
	});
}
var styles_default = "/assets/styles-BSnNVr4P.css";
var APP_TITLE = "Atlas";
var FONT_HREF = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap";
var Route$25 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_TITLE },
			{
				name: "theme-color",
				content: "#0c0d0e"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: FONT_HREF
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "pt-BR",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: THEME_BOOT_SCRIPT } }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "min-h-dvh overflow-x-hidden bg-bg font-sans text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$24 = () => import("./routes-CbFmwYDT.mjs");
var Route$24 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
var $$splitComponentImporter$23 = () => import("./adapters-C-1gRaGl.mjs");
var Route$23 = createFileRoute("/adapters")({ component: lazyRouteComponent($$splitComponentImporter$23, "component") });
var $$splitComponentImporter$22 = () => import("./alertas-CDteL5gl.mjs");
var Route$22 = createFileRoute("/alertas")({ component: lazyRouteComponent($$splitComponentImporter$22, "component") });
var $$splitComponentImporter$21 = () => import("./busca-CZOwtCc1.mjs");
var Route$21 = createFileRoute("/busca")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
var $$splitComponentImporter$20 = () => import("./censo-BjPJK0Ip.mjs");
var Route$20 = createFileRoute("/censo")({ component: lazyRouteComponent($$splitComponentImporter$20, "component") });
var $$splitComponentImporter$19 = () => import("./cobertura-Bp5-MeH2.mjs");
var Route$19 = createFileRoute("/cobertura")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./familias-BwldO2RV.mjs");
var Route$18 = createFileRoute("/familias")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./fontes-3DwPg1iZ.mjs");
var Route$17 = createFileRoute("/fontes")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./itens-CxyRqCZP.mjs");
var Route$16 = createFileRoute("/itens")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./matriz-BWxPeMry.mjs");
var Route$15 = createFileRoute("/matriz")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./oportunidades-DXK8_Nnb.mjs");
var Route$14 = createFileRoute("/oportunidades")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./orgaos-BB2FldPR.mjs");
var Route$13 = createFileRoute("/orgaos")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./planejamento-C_alItq7.mjs");
var Route$12 = createFileRoute("/planejamento")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./prioridades-CSrCRoR7.mjs");
var Route$11 = createFileRoute("/prioridades")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./validacao-BsjTAhIZ.mjs");
var Route$10 = createFileRoute("/validacao")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./familias-BHocepb9.mjs");
var Route$9 = createFileRoute("/familias/")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("../_family-C80tB8TT.mjs");
var Route$8 = createFileRoute("/familias/$family")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./fontes-DwW6pYEf.mjs");
var Route$7 = createFileRoute("/fontes/")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("../_id-C9lDaNSI.mjs");
var Route$6 = createFileRoute("/fontes/$id")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./itens-DxxNAGIF.mjs");
var Route$5 = createFileRoute("/itens/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("../_id-BTSQc4VU.mjs");
var Route$4 = createFileRoute("/itens/$id")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./oportunidades-CBn3JXq_.mjs");
var Route$3 = createFileRoute("/oportunidades/")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("../_id-BOlYN7hi.mjs");
var Route$2 = createFileRoute("/oportunidades/$id")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./orgaos-DR7Hix1i.mjs");
var Route$1 = createFileRoute("/orgaos/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("../_id-AD4pMTEc.mjs");
var Route = createFileRoute("/orgaos/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$24.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$25
});
var AdaptersRoute = Route$23.update({
	id: "/adapters",
	path: "/adapters",
	getParentRoute: () => Route$25
});
var AlertasRoute = Route$22.update({
	id: "/alertas",
	path: "/alertas",
	getParentRoute: () => Route$25
});
var BuscaRoute = Route$21.update({
	id: "/busca",
	path: "/busca",
	getParentRoute: () => Route$25
});
var CensoRoute = Route$20.update({
	id: "/censo",
	path: "/censo",
	getParentRoute: () => Route$25
});
var CoberturaRoute = Route$19.update({
	id: "/cobertura",
	path: "/cobertura",
	getParentRoute: () => Route$25
});
var FamiliasRoute = Route$18.update({
	id: "/familias",
	path: "/familias",
	getParentRoute: () => Route$25
});
var FontesRoute = Route$17.update({
	id: "/fontes",
	path: "/fontes",
	getParentRoute: () => Route$25
});
var ItensRoute = Route$16.update({
	id: "/itens",
	path: "/itens",
	getParentRoute: () => Route$25
});
var MatrizRoute = Route$15.update({
	id: "/matriz",
	path: "/matriz",
	getParentRoute: () => Route$25
});
var OportunidadesRoute = Route$14.update({
	id: "/oportunidades",
	path: "/oportunidades",
	getParentRoute: () => Route$25
});
var OrgaosRoute = Route$13.update({
	id: "/orgaos",
	path: "/orgaos",
	getParentRoute: () => Route$25
});
var PlanejamentoRoute = Route$12.update({
	id: "/planejamento",
	path: "/planejamento",
	getParentRoute: () => Route$25
});
var PrioridadesRoute = Route$11.update({
	id: "/prioridades",
	path: "/prioridades",
	getParentRoute: () => Route$25
});
var ValidacaoRoute = Route$10.update({
	id: "/validacao",
	path: "/validacao",
	getParentRoute: () => Route$25
});
var FamiliasIndexRoute = Route$9.update({
	id: "/",
	path: "/",
	getParentRoute: () => FamiliasRoute
});
var FamiliasFamilyRoute = Route$8.update({
	id: "/$family",
	path: "/$family",
	getParentRoute: () => FamiliasRoute
});
var FontesIndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => FontesRoute
});
var FontesIdRoute = Route$6.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => FontesRoute
});
var ItensIndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => ItensRoute
});
var ItensIdRoute = Route$4.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => ItensRoute
});
var OportunidadesIndexRoute = Route$3.update({
	id: "/",
	path: "/",
	getParentRoute: () => OportunidadesRoute
});
var OportunidadesIdRoute = Route$2.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => OportunidadesRoute
});
var OrgaosIndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => OrgaosRoute
});
var OrgaosIdRoute = Route.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => OrgaosRoute
});
var FamiliasRouteChildren = {
	FamiliasFamilyRoute,
	FamiliasIndexRoute
};
var FamiliasRouteWithChildren = FamiliasRoute._addFileChildren(FamiliasRouteChildren);
var FontesRouteChildren = {
	FontesIdRoute,
	FontesIndexRoute
};
var FontesRouteWithChildren = FontesRoute._addFileChildren(FontesRouteChildren);
var ItensRouteChildren = {
	ItensIdRoute,
	ItensIndexRoute
};
var ItensRouteWithChildren = ItensRoute._addFileChildren(ItensRouteChildren);
var OportunidadesRouteChildren = {
	OportunidadesIdRoute,
	OportunidadesIndexRoute
};
var OportunidadesRouteWithChildren = OportunidadesRoute._addFileChildren(OportunidadesRouteChildren);
var OrgaosRouteChildren = {
	OrgaosIdRoute,
	OrgaosIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AdaptersRoute,
	AlertasRoute,
	BuscaRoute,
	CensoRoute,
	CoberturaRoute,
	FamiliasRoute: FamiliasRouteWithChildren,
	FontesRoute: FontesRouteWithChildren,
	ItensRoute: ItensRouteWithChildren,
	MatrizRoute,
	OportunidadesRoute: OportunidadesRouteWithChildren,
	OrgaosRoute: OrgaosRoute._addFileChildren(OrgaosRouteChildren),
	PlanejamentoRoute,
	PrioridadesRoute,
	ValidacaoRoute
};
var routeTree = Route$25._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route$6 as a, ClaimBadge as c, Route$4 as i, Badge as l, Route as n, Route$8 as o, Route$2 as r, Button as s, router_exports as t };
