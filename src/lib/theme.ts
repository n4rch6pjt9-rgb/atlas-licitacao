export const THEME_IDS = ["light", "medium", "dark"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = "dark";

export const THEME_STORAGE_KEY = "atlas-theme";

export const THEME_LABELS: Record<ThemeId, string> = {
  light: "Claro",
  medium: "Claro médio",
  dark: "Escuro",
};

export const THEME_SHORT_LABELS: Record<ThemeId, string> = {
  light: "Claro",
  medium: "Médio",
  dark: "Escuro",
};

export const THEME_META: Record<ThemeId, string> = {
  light: "#f3f1eb",
  medium: "#d4cfc4",
  dark: "#0c0d0e",
};

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return value === "light" || value === "medium" || value === "dark";
}

export function parseTheme(value: string | null | undefined): ThemeId {
  return isThemeId(value) ? value : DEFAULT_THEME;
}

export function colorSchemeFor(theme: ThemeId): "light" | "dark" {
  return theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = colorSchemeFor(theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_META[theme]);
  window.dispatchEvent(new Event("atlas-theme"));
}

export const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t==="light"||t==="medium"||t==="dark"){var r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t==="dark"?"dark":"light";}}catch(e){}})();`;
