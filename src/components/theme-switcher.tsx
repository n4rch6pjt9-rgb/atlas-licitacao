import {
  THEME_IDS,
  THEME_LABELS,
  THEME_SHORT_LABELS,
  type ThemeId,
} from "@/lib/theme";
import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("min-w-0", compact ? "" : "w-full")}>
      {compact ? null : (
        <p className="mb-2 text-xs tracking-wide text-subtle uppercase">
          Aparência
        </p>
      )}
      <div
        role="radiogroup"
        aria-label="Aparência"
        className={cn(
          "grid grid-cols-3 gap-1 rounded-lg bg-surface-2 p-1",
          compact ? "w-40" : "w-full",
        )}
      >
        {THEME_IDS.map((id) => (
          <ThemeOption
            key={id}
            id={id}
            selected={theme === id}
            onSelect={setTheme}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeOption({
  id,
  selected,
  onSelect,
}: {
  id: ThemeId;
  selected: boolean;
  onSelect: (id: ThemeId) => void;
}) {
  const label = THEME_LABELS[id];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={() => onSelect(id)}
      className={cn(
        "flex min-h-11 flex-col items-center justify-center gap-1 rounded-md px-1 text-xs leading-none transition-[background-color,color,box-shadow] duration-quick ease-smooth-out",
        selected
          ? "bg-surface text-fg shadow-border"
          : "text-muted hover:text-fg",
      )}
    >
      <span
        aria-hidden
        data-swatch={id}
        className="size-3.5 rounded-full ring-1 ring-fg/25 ring-inset"
      />
      <span className="truncate">{THEME_SHORT_LABELS[id]}</span>
    </button>
  );
}
