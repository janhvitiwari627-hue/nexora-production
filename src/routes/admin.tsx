import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import {
  Sparkles, LayoutDashboard, Users, Building2, Briefcase, CreditCard,
  Megaphone, Gift, Star, Trophy, Settings, UserPlus, BarChart3,
} from "lucide-react";
import { BackButton } from "@/components/shared/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") return;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/admin/login" });
    }
    const [{ data: isAdmin }, { data: isSuper }] = await Promise.all([
      supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: data.user.id, _role: "super_admin" }),
    ]);
    if (!isAdmin && !isSuper) {
      throw redirect({ to: "/admin/login" });
    }
    if (location.pathname === "/admin") {
      throw redirect({ to: "/admin/dashboard" });
    }
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/businesses", label: "Businesses", icon: Building2 },
  { to: "/admin/jobs", label: "Jobs & Hiring", icon: Briefcase },
  { to: "/admin/partner-applications", label: "Partner Applications", icon: UserPlus },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/advertising", label: "Advertising", icon: Megaphone },
  { to: "/admin/rewards", label: "Rewards", icon: Gift },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/rankings", label: "Rankings", icon: Trophy },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname === "/admin/login";

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
          <BackButton size="icon" className="shrink-0" aria-label="Go back" />
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-cta grid h-8 w-8 place-items-center rounded-lg text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-gradient-brand text-lg font-extrabold tracking-tight">
              Nexora
            </span>
            <span className="ml-2 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Admin
            </span>
          </Link>
        </div>
      </div>

      {isLogin ? (
        <Outlet />
      ) : (
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
            <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {NAV.map(({ to, label, icon: Icon }) => {
                const active = pathname === to || pathname.startsWith(to + "/");
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
}
