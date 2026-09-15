//#region node_modules/.nitro/vite/services/ssr/assets/org-identity-DpYJSdnO.js
function digitsCnpj(value) {
	const digits = (value ?? "").replace(/\D/g, "");
	return digits.length === 14 ? digits : null;
}
function organizationIdFrom(input) {
	const cnpj = digitsCnpj(input.cnpj);
	if (cnpj) return `org_${cnpj}`;
	if (input.uasg) return `org_uasg_${input.uasg}`;
	if (input.pncp_org_id) return `org_pncp_${input.pncp_org_id}`;
	if (input.comprasgov_id) return `org_cg_${input.comprasgov_id}`;
	const slug = (input.display_name ?? "desconhecido").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 48);
	return `org_name_${input.uf ?? "xx"}_${slug}`;
}
function resolveOrgIdentity(input) {
	const cnpj = digitsCnpj(input.cnpj);
	if (cnpj) return {
		...input,
		cnpj,
		id: `org_${cnpj}`,
		identity_method: "CNPJ",
		identity_status: "CONFIRMED"
	};
	if (input.uasg) return {
		...input,
		id: organizationIdFrom(input),
		identity_method: "UASG",
		identity_status: "PROBABLE"
	};
	if (input.pncp_org_id) return {
		...input,
		id: organizationIdFrom(input),
		identity_method: "PNCP_ORG",
		identity_status: "PROBABLE"
	};
	if (input.comprasgov_id) return {
		...input,
		id: organizationIdFrom(input),
		identity_method: "COMPRASGOV",
		identity_status: "PROBABLE"
	};
	return {
		...input,
		id: organizationIdFrom(input),
		identity_method: "NAME_UF",
		identity_status: "REVIEW_REQUIRED"
	};
}
function arpSignals(args) {
	const out = ["ACTIVE_ARP"];
	if (args.remaining_ratio != null) {
		if (args.remaining_ratio >= .5) out.push("HIGH_REMAINING_BALANCE");
		else if (args.remaining_ratio <= .15) out.push("LOW_REMAINING_BALANCE");
	}
	if ((args.adhesions ?? 0) > 0) out.push("RECENT_ADHESION");
	if (args.vigency_end) {
		const days = (new Date(args.vigency_end).getTime() - new Date(args.now).getTime()) / 864e5;
		if (days >= 0 && days <= 45) out.push("NEAR_EXPIRATION");
	}
	return out;
}
//#endregion
export { digitsCnpj as n, resolveOrgIdentity as r, arpSignals as t };
