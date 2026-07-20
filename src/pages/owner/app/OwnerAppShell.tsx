import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Globe2, LayoutDashboard, UserRound, WalletCards } from "lucide-react";
import nexoraLogo from "@/assets/nexora-logo.jpg.asset.json";
import { useOwnerContext } from "@/hooks/use-owner-context";

const NAV = [
  { to: "/app/owner", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/owner/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/owner/website", label: "Website", icon: Globe2 },
  { to: "/app/owner/wallet", label: "Wallet", icon: WalletCards },
  { to: "/app/owner/profile", label: "Profile", icon: UserRound },
] as const;

export function OwnerAppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { activeSalon } = useOwnerContext();

  return (
    <div className="nexora-pwa-surface min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden border-b bg-white/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Link to="/app/owner" className="flex min-w-0 items-center gap-2">
            <img
              src={activeSalon?.image_url || nexoraLogo.url}
              alt={activeSalon?.name || "Nexora"}
              className="h-10 w-10 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-black leading-none">{activeSalon?.name || "Nexora"}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                Shop Owner App
              </p>
            </div>
          </Link>
          <Link
            to="/app/owner/profile"
            className="shrink-0 rounded-full border bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800"
          >
            Manage
          </Link>
        </div>
      </header>

      <div className="w-full max-w-full overflow-x-hidden pb-24">
        <Outlet />
      </div>

      <nav
        aria-label="Shop owner app navigation"
        className="pwa-bottom-nav fixed inset-x-0 bottom-0 z-50 w-full max-w-full overflow-x-hidden border-t bg-white/95 backdrop-blur"
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
                  className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold ${
                    active ? "text-violet-700" : "text-slate-500"
                  }`}
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
