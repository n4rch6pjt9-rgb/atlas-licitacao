//#region node_modules/.nitro/vite/services/ssr/assets/format-CIMAN_Kq.js
function formatDate(iso) {
	if (!iso) return "—";
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short"
	}).format(date);
}
function formatPct(ratio) {
	if (!Number.isFinite(ratio)) return "—";
	return new Intl.NumberFormat("pt-BR", {
		style: "percent",
		maximumFractionDigits: 0
	}).format(ratio);
}
function formatInt(value) {
	return new Intl.NumberFormat("pt-BR").format(value);
}
function formatHours(value) {
	if (value == null || !Number.isFinite(value)) return "—";
	const abs = Math.abs(value);
	const sign = value > 0 ? "+" : value < 0 ? "−" : "";
	if (abs >= 48) return `${sign}${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(abs / 24)} d`;
	return `${sign}${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(abs)} h`;
}
function formatMoney(value) {
	if (value == null || !Number.isFinite(value)) return "—";
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
		maximumFractionDigits: 0
	}).format(value);
}
function claimFromEvidence(level) {
	if (level === "VERIFIED") return "FATO_VERIFICADO";
	if (level === "STRONG_INDICATION" || level === "WEAK_INDICATION") return "INFERENCIA";
	return "PENDENTE_DE_VALIDACAO";
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/rolldown-runtime-D7D4PA-g.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
export { formatInt as a, formatHours as i, claimFromEvidence as n, formatMoney as o, formatDate as r, formatPct as s, __exportAll as t };
