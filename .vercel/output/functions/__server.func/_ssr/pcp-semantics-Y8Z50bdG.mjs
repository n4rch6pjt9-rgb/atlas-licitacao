import { n as sha256 } from "./hash-DAnDaBOp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pcp-semantics-Y8Z50bdG.js
/**
* PCP publicKey semantics — Milestone 6 gate.
*
* Never persist or log a full key. Fingerprint only.
* A/B may enter connector_config. C/D must not.
*/
/** Official apipcp /publico and compras.api /v1 — observed 2026-09-14. */
var PCP_APIPCP_PUBLICKEY_EVIDENCE = {
	inOfficialDocs: true,
	docsDescribeAsVerificationKey: true,
	docsRequireRequestingAccess: true,
	presentInPublicSpaHtmlOrJs: false,
	requiredByEndpoint: true,
	documentedSampleWorks: false,
	buyerPathIdentifiesBuyingUnit: true,
	httpAuthErrorWithoutKey: true
};
function classifyPublicKey(evidence) {
	if (evidence.presentInPublicSpaHtmlOrJs && !evidence.httpAuthErrorWithoutKey) return {
		semantics: evidence.buyerPathIdentifiesBuyingUnit ? "PUBLIC_TENANT_IDENTIFIER" : "PUBLIC_CLIENT_KEY",
		classification: "PUBLIC",
		allowedInPublicConnectorConfig: true,
		readiness: "CANDIDATE_CONFIG",
		rationale: "Identificador publicado no frontend público. Candidato a config, não a adapter de marca.",
		claim: "FATO_VERIFICADO"
	};
	if (evidence.requiredByEndpoint && evidence.httpAuthErrorWithoutKey && !evidence.presentInPublicSpaHtmlOrJs && !evidence.documentedSampleWorks) return {
		semantics: "PRIVATE_CREDENTIAL",
		classification: "SECRET",
		allowedInPublicConnectorConfig: false,
		readiness: "AUTH_REQUIRED",
		rationale: "publicKey é chave de verificação exigida pela API de integração do comprador. Não aparece no HTML/JS da SPA pública. Amostra da documentação retorna erro de autenticação. Não persistir em connector_config de discovery público.",
		claim: "FATO_VERIFICADO"
	};
	if (evidence.requiredByEndpoint && !evidence.presentInPublicSpaHtmlOrJs) return {
		semantics: "UNKNOWN",
		classification: "INTERNAL",
		allowedInPublicConnectorConfig: false,
		readiness: "CONFIG_PENDING",
		rationale: "Semântica ainda não comprovada como identificador público de tenant.",
		claim: "PENDENTE_DE_VALIDACAO"
	};
	return {
		semantics: "UNKNOWN",
		classification: "INTERNAL",
		allowedInPublicConnectorConfig: false,
		readiness: "CONFIG_PENDING",
		rationale: "Evidência insuficiente.",
		claim: "PENDENTE_DE_VALIDACAO"
	};
}
function fingerprintKey(value) {
	if (!value) return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	return sha256(trimmed).slice(0, 16);
}
function redactKey(url) {
	return url.replace(/([?&]publicKey=)[^&]*/gi, "$1[redacted]");
}
function classifyAuthError(status, bodyText) {
	const text = bodyText.toLowerCase();
	if (status === 400 && /autentic/i.test(text)) return "CONFIG_INVALID";
	if (status === 401 || status === 403) return "AUTH_SEMANTICS_CHANGED";
	if (status >= 500) return "SOURCE_DEGRADED";
	return "UNKNOWN";
}
//#endregion
export { redactKey as a, fingerprintKey as i, classifyAuthError as n, classifyPublicKey as r, PCP_APIPCP_PUBLICKEY_EVIDENCE as t };
