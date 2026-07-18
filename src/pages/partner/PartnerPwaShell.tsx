import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { GraduationCap, IndianRupee, LayoutDashboard, Store, UserRound } from "lucide-react";
import nexoraLogo from "@/assets/nexora-logo.jpg.asset.json";
import { useAuthStore } from "@/stores/authStore";

const NAV = [
  { to: "/app/partner", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/partner/shops", label: "Shops", icon: Store },
  { to: "/app/partner/earnings", label: "Earnings", icon: IndianRupee },
  { to: "/app/partner/training", label: "Training", icon: GraduationCap },
  { to: "/app/partner/profile", label: "Profile", icon: UserRound },
] as const;

export function PartnerPwaShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const profile = useAuthStore((state) => state.profile);
  const name = profile?.full_name || "Growth Partner";

  return (
    <div className="nexora-pwa-surface min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#F6F7FB] text-[#0B1330]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Link to="/app/partner" className="flex min-w-0 items-center gap-2">
            <img
              src={nexoraLogo.url}
              alt="Nexora"
              className="h-10 w-10 shrink-0 rounded-xl object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate font-black leading-none">{name}</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-violet-700">
                Growth Partner App
              </span>
            </span>
          </Link>
          <Link
            to="/app/partner/profile"
            className="shrink-0 rounded-full border bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800"
          >
            Profile
          </Link>
        </div>
      </header>

      <div className="w-full max-w-full overflow-x-hidden pb-24">
        <Outlet />
      </div>

      <nav
        aria-label="Growth partner app navigation"
        className="pwa-bottom-nav fixed inset-x-0 bottom-0 z-50 w-full border-t bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid w-full max-w-xl grid-cols-5">
          {NAV.map((item) => {
            const active =
              "exact" in item && item.exact
                ? pathname === item.to || pathname === `${item.to}/`
                : pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold ${active ? "text-violet-700" : "text-slate-500"}`}
                >
                  <span className={`rounded-full px-3 py-1 ${active ? "bg-violet-100" : ""}`}>
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="max-w-full truncate px-0.5">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
