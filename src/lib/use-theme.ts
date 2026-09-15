import { useCallback, useSyncExternalStore } from "react";
import {
  applyTheme,
  parseTheme,
  THEME_STORAGE_KEY,
  type ThemeId,
} from "@/lib/theme";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("atlas-theme", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("atlas-theme", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): ThemeId {
  return parseTheme(localStorage.getItem(THEME_STORAGE_KEY));
}

function getServerSnapshot(): ThemeId {
  return "dark";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setTheme = useCallback((next: ThemeId) => {
    applyTheme(next);
  }, []);
  return { theme, setTheme } as const;
}
