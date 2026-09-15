import { o as __toESM } from "../_runtime.mjs";
import { R as cn } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tabs-Dw7k9Max.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
var TabsList = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-11 min-h-11 items-center gap-1 rounded-lg bg-surface-2 p-1 text-muted", className),
	...props
}));
TabsList.displayName = "TabsList";
var TabsTrigger = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-[background-color,color] duration-quick ease-smooth-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 data-[state=active]:bg-surface data-[state=active]:text-fg", className),
	...props
}));
TabsTrigger.displayName = "TabsTrigger";
var TabsContent = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-4 min-w-0 focus-visible:outline-none", className),
	...props
}));
TabsContent.displayName = "TabsContent";
//#endregion
export { TabsTrigger as i, TabsContent as n, TabsList as r, Tabs as t };
