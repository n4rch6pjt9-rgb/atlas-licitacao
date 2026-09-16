/**
 * File-route param matching for Atlas detail URLs.
 * IDs stay verbatim — no normalize/truncate.
 */
export function matchPathParams(
  pathname: string,
  pattern: string,
): Record<string, string> | null {
  const pathParts = pathname.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);
  if (pathParts.length !== patternParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const expected = patternParts[i] ?? "";
    const actual = pathParts[i] ?? "";
    if (expected.startsWith("$")) {
      params[expected.slice(1)] = actual;
      continue;
    }
    if (expected !== actual) return null;
  }
  return params;
}

export function isIndexPath(pathname: string, base: string): boolean {
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  return trimmed === base;
}
