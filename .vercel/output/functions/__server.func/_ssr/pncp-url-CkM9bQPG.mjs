//#region node_modules/.nitro/vite/services/ssr/assets/pncp-url-CkM9bQPG.js
var PNCP_EDITAL_BASE = `https://pncp.gov.br/app/editais`;
var PNCP_EDITAL_EXAMPLE = "https://pncp.gov.br/app/editais/75442756000190-1-001001/2026";
var PNCP_OFFICIAL_NAME = "Portal Nacional de Contratações Públicas";
var CONTROL_SLASH = /^(\d{14})-(\d+)-(\d+)\/(\d{4})$/;
var CONTROL_ALT = /^(\d{14})-(\d+)-(\d{4})-(\d+)$/;
var API_COMPRA = /\/orgaos\/(\d{14})\/compras\/(\d{4})\/(\d+)(?:\/|$)/i;
function digits(value) {
	return value.replace(/\D/g, "");
}
function padNumero(value) {
	const n = digits(value);
	if (!n) return value;
	return n.length >= 6 ? n : n.padStart(6, "0");
}
function isUsablePncpCnpj(value) {
	const cnpj = digits(value ?? "");
	if (cnpj.length !== 14) return false;
	if (/^(\d)\1{13}$/.test(cnpj)) return false;
	return true;
}
function stripWrapper(value) {
	let text = value.trim();
	text = text.replace(/^https?:\/\/pncp\.gov\.br\/app\/editais\//i, "");
	text = text.replace(/^pncp-/i, "");
	try {
		text = decodeURIComponent(text);
	} catch {}
	return text;
}
function parseNumeroControlePncp(value) {
	if (!value) return null;
	const cleaned = stripWrapper(value);
	const slash = cleaned.match(CONTROL_SLASH);
	if (slash) return {
		cnpj: slash[1],
		unidade: slash[2],
		numero: padNumero(slash[3]),
		ano: slash[4]
	};
	const alt = cleaned.match(CONTROL_ALT);
	if (alt) return {
		cnpj: alt[1],
		unidade: alt[2],
		ano: alt[3],
		numero: padNumero(alt[4])
	};
	const api = value.match(API_COMPRA);
	if (api) return {
		cnpj: api[1],
		unidade: "1",
		ano: api[2],
		numero: padNumero(api[3])
	};
	return null;
}
function pncpControl(parts) {
	return `${digits(parts.cnpj)}-${String(parts.unidade ?? 1).replace(/\D/g, "") || "1"}-${padNumero(String(parts.numero))}/${String(parts.ano).replace(/\D/g, "").slice(0, 4)}`;
}
function pncpEditalUrl(input) {
	const parsed = input && typeof input === "object" ? {
		cnpj: digits(input.cnpj),
		unidade: String(input.unidade || "1"),
		numero: padNumero(String(input.numero)),
		ano: String(input.ano)
	} : parseNumeroControlePncp(input);
	if (!parsed || !isUsablePncpCnpj(parsed.cnpj) || !/^\d{4}$/.test(parsed.ano) || !parsed.numero) return null;
	return `${PNCP_EDITAL_BASE}/${parsed.cnpj}-${parsed.unidade}-${parsed.numero}/${parsed.ano}`;
}
/** Clickable public URL: rewrite `/pncp-api` editais; never keep API file links. */
function toPublicPncpUrl(url) {
	if (!url) return null;
	const rewritten = pncpEditalUrl(url);
	if (rewritten) return rewritten;
	if (/pncp\.gov\.br\/pncp-api/i.test(url)) return null;
	return url;
}
//#endregion
export { toPublicPncpUrl as a, pncpEditalUrl as i, PNCP_OFFICIAL_NAME as n, pncpControl as r, PNCP_EDITAL_EXAMPLE as t };
