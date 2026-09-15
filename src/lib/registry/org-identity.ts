export type OrgIdentityInput = {
  display_name: string;
  cnpj?: string | null;
  uasg?: string | null;
  pncp_org_id?: string | null;
  comprasgov_id?: string | null;
  municipality?: string | null;
  uf?: string | null;
  ibge_code?: string | null;
};

export type OrgIdentity = OrgIdentityInput & {
  id: string;
  identity_method: "CNPJ" | "UASG" | "PNCP_ORG" | "COMPRASGOV" | "NAME_UF";
  identity_status: "CONFIRMED" | "PROBABLE" | "REVIEW_REQUIRED";
};

export function digitsCnpj(value: string | null | undefined): string | null {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length === 14 ? digits : null;
}

export function organizationIdFrom(input: OrgIdentityInput): string {
  const cnpj = digitsCnpj(input.cnpj);
  if (cnpj) return `org_${cnpj}`;
  if (input.uasg) return `org_uasg_${input.uasg}`;
  if (input.pncp_org_id) return `org_pncp_${input.pncp_org_id}`;
  if (input.comprasgov_id) return `org_cg_${input.comprasgov_id}`;
  const slug = (input.display_name ?? "desconhecido")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
  return `org_name_${input.uf ?? "xx"}_${slug}`;
}

export function resolveOrgIdentity(input: OrgIdentityInput): OrgIdentity {
  const cnpj = digitsCnpj(input.cnpj);
  if (cnpj) {
    return {
      ...input,
      cnpj,
      id: `org_${cnpj}`,
      identity_method: "CNPJ",
      identity_status: "CONFIRMED",
    };
  }
  if (input.uasg) {
    return {
      ...input,
      id: organizationIdFrom(input),
      identity_method: "UASG",
      identity_status: "PROBABLE",
    };
  }
  if (input.pncp_org_id) {
    return {
      ...input,
      id: organizationIdFrom(input),
      identity_method: "PNCP_ORG",
      identity_status: "PROBABLE",
    };
  }
  if (input.comprasgov_id) {
    return {
      ...input,
      id: organizationIdFrom(input),
      identity_method: "COMPRASGOV",
      identity_status: "PROBABLE",
    };
  }
  return {
    ...input,
    id: organizationIdFrom(input),
    identity_method: "NAME_UF",
    identity_status: "REVIEW_REQUIRED",
  };
}

export function arpSignals(args: {
  remaining_ratio: number | null;
  vigency_end: string | null;
  adhesions: number | null;
  now: string;
}): string[] {
  const out: string[] = ["ACTIVE_ARP"];
  if (args.remaining_ratio != null) {
    if (args.remaining_ratio >= 0.5) out.push("HIGH_REMAINING_BALANCE");
    else if (args.remaining_ratio <= 0.15) out.push("LOW_REMAINING_BALANCE");
  }
  if ((args.adhesions ?? 0) > 0) out.push("RECENT_ADHESION");
  if (args.vigency_end) {
    const days = (new Date(args.vigency_end).getTime() - new Date(args.now).getTime()) / 86_400_000;
    if (days >= 0 && days <= 45) out.push("NEAR_EXPIRATION");
  }
  return out;
}
