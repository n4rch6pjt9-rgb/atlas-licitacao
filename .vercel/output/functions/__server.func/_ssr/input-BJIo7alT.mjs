import { o as __toESM } from "../_runtime.mjs";
import { R as cn } from "./labels-BJbcmPwN.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-BJIo7alT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var fieldClass = "flex h-11 w-full min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg shadow-border outline-none placeholder:text-subtle transition-[box-shadow,border-color] duration-quick ease-smooth-out focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-40";
var Input = (0, import_react.forwardRef)(({ className, type = "text", ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		type,
		className: cn(fieldClass, className),
		...props
	});
});
Input.displayName = "Input";
var NativeSelect = (0, import_react.forwardRef)(({ className, children, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		ref,
		className: cn(fieldClass, className),
		...props,
		children
	});
});
NativeSelect.displayName = "NativeSelect";
//#endregion
export { NativeSelect as n, Input as t };
