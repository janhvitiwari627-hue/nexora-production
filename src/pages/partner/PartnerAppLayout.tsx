import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  GraduationCap,
  IndianRupee,
  LayoutDashboard,
  Settings,
  Store,
  Target,
  Trophy,
  UserPlus,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }> };

const NAV: NavItem[] = [
  { to: "/partner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/partner/leads", label: "Leads", icon: UserPlus },
  { to: "/partner/shops", label: "Shops", icon: Store },
  { to: "/partner/commission", label: "Commission", icon: IndianRupee },
  { to: "/partner/payout", label: "Payout", icon: Wallet },
  { to: "/partner/milestones", label: "Milestones", icon: Trophy },
  { to: "/partner/training", label: "Training", icon: GraduationCap },
  { to: "/partner/settings", label: "Settings", icon: Settings },
];

export function PartnerAppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="nexora-pwa-surface min-h-[100dvh] bg-[#F6F7FB]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 md:px-6">
          <Link to="/partner/dashboard" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white">
              <Target className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-black text-[#0B1330]">Nexora Partner</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Growth Partner App
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-[#EEF2FF] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] sm:inline-flex">
              Silver Tier
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#0B1330] text-xs font-bold text-white">
              R
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="sticky top-20 space-y-1 rounded-2xl border border-slate-200 bg-white p-2">
            {NAV.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[#EEF2FF] text-[#4F46E5]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#0B1330]"
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Mobile nav pills */}
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {NAV.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
                    active
                      ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <n.icon className="h-3.5 w-3.5" />
                  {n.label}
                </Link>
              );
            })}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PartnerPageShell({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white shadow-[0_10px_25px_-10px_rgba(79,70,229,0.6)]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black tracking-tight text-[#0B1330] md:text-3xl" style={{ letterSpacing: "-0.02em" }}>
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function ComingSoonCard({ note }: { note: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5]">
        <BarChart3 className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-[#0B1330]">Coming soon</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{note}</p>
    </div>
  );
}
