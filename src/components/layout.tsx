import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import {
  Bell,
  Building2,
  Cable,
  CalendarRange,
  ClipboardList,
  Database,
  FlaskConical,
  Gauge,
  Grid3x3,
  LayoutDashboard,
  Layers,
  Map,
  Menu,
  Package,
  Search,
  Timer,
} from "lucide-react";
import { ClaimLegend } from "@/components/claim-badge";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/lib/use-theme";
import { applyTheme, parseTheme, THEME_STORAGE_KEY } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/oportunidades", label: "Oportunidades", icon: Timer, exact: false },
  { to: "/planejamento", label: "Planejamento", icon: CalendarRange, exact: false },
  { to: "/orgaos", label: "Órgãos", icon: Building2, exact: false },
  { to: "/itens", label: "Itens", icon: Package, exact: false },
  { to: "/alertas", label: "Alertas", icon: Bell, exact: false },
  { to: "/busca", label: "Busca", icon: Search, exact: false },
  { to: "/cobertura", label: "Cobertura", icon: Map, exact: false },
  { to: "/prioridades", label: "Prioridades", icon: Gauge, exact: false },
  { to: "/validacao", label: "Validação", icon: FlaskConical, exact: false },
  { to: "/censo", label: "Censo", icon: ClipboardList, exact: false },
  { to: "/fontes", label: "Fontes", icon: Database, exact: false },
  { to: "/familias", label: "Famílias", icon: Layers, exact: false },
  { to: "/matriz", label: "Matriz", icon: Grid3x3, exact: false },
  { to: "/adapters", label: "Adapters", icon: Cable, exact: false },
] as const;

function pathActive(pathname: string, to: string, exact: boolean) {
  if (exact) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

function Wordmark() {
  return (
    <div className="min-w-0">
      <p className="font-display text-2xl font-medium tracking-tight text-fg">
        Atlas
      </p>
      <p className="text-xs text-muted">Registry de portais</p>
    </div>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Principal" className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathActive(pathname, item.to, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-[background-color,color] duration-quick ease-smooth-out",
              active
                ? "bg-surface-2 text-fg"
                : "text-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function RailFooter() {
  return (
    <div className="mt-auto border-t border-border pt-4">
      <ThemeSwitcher />
      <p className="mt-4 mb-2 text-xs tracking-wide text-subtle uppercase">
        Legenda de claims
      </p>
      <ClaimLegend compact />
    </div>
  );
}

function ThemeSync() {
  useEffect(() => {
    applyTheme(parseTheme(localStorage.getItem(THEME_STORAGE_KEY)));
  }, []);
  return null;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme } = useTheme();

  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={200}>
        <ThemeSync />
        <div className="flex min-h-dvh bg-bg text-fg">
          <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface p-5 lg:flex">
            <Wordmark />
            <div className="mt-8 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <NavLinks pathname={pathname} />
              </div>
              <RailFooter />
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-border bg-bg/95 px-3 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menu"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <Wordmark />
              <div className="ml-auto">
                <ThemeSwitcher compact />
              </div>
            </header>
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left" className="bg-surface p-0">
            <SheetHeader>
              <SheetTitle>Atlas</SheetTitle>
              <SheetDescription>Registry de portais</SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-5">
              <NavLinks
                pathname={pathname}
                onNavigate={() => setMenuOpen(false)}
              />
              <div className="mt-6">
                <RailFooter />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Toaster
          theme={theme === "dark" ? "dark" : "light"}
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "bg-surface text-fg border border-border font-sans",
              title: "text-fg",
              description: "text-muted",
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
