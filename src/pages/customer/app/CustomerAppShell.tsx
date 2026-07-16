import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Gift, Home, Search, UserRound } from "lucide-react";
import nexoraLogo from "@/assets/nexora-logo.jpg.asset.json";
import { LocationPermissionModal } from "@/components/auth/LocationPermissionModal";
import { useAuthStore } from "@/stores/authStore";
import { CustomerAvatar } from "./CustomerAvatar";

const NAV = [
  { to: "/app/customer", label: "Home", icon: Home, exact: true },
  { to: "/app/customer/search", label: "Search", icon: Search },
  { to: "/app/customer/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/app/customer/rewards", label: "Rewards", icon: Gift },
  { to: "/app/customer/profile", label: "Profile", icon: UserRound },
] as const;

export function CustomerAppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden border-b bg-white/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Link to="/app/customer" className="flex min-w-0 items-center gap-2">
            <img
              src={nexoraLogo.url}
              alt="Nexora"
              className="h-10 w-10 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <p className="font-black leading-none">Nexora</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                Customer App
              </p>
            </div>
          </Link>
          {user ? (
            <Link
              to="/app/customer/profile"
              className="flex max-w-36 shrink-0 items-center gap-2 rounded-full border border-violet-200 bg-violet-50 py-1 pl-1 pr-3 text-sm font-bold text-violet-800 sm:max-w-44"
            >
              <CustomerAvatar className="h-8 w-8" iconClassName="h-4 w-4" />
              <span className="truncate">{profile?.full_name || "My profile"}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-bold text-slate-700">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-violet-700 px-4 py-2 text-sm font-bold text-white"
              >
                Signup
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="w-full max-w-full overflow-x-hidden pb-24">
        <Outlet />
      </div>

      <nav
        aria-label="Customer app navigation"
        className="fixed inset-x-0 bottom-0 z-50 w-full max-w-full overflow-x-hidden border-t bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid w-full max-w-xl grid-cols-5">
          {NAV.map((item) => {
            const active = "exact" in item && item.exact
              ? pathname === item.to || pathname === `${item.to}/`
              : pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold sm:text-[11px] ${
                    active ? "text-violet-700" : "text-slate-500"
                  }`}
                >
                  <span className={`rounded-full px-3 py-1 ${active ? "bg-violet-100" : ""}`}>
                    {item.label === "Profile" && user ? (
                      <CustomerAvatar className="h-6 w-6" iconClassName="h-3.5 w-3.5" />
                    ) : (
                      <item.icon className="h-5 w-5" />
                    )}
                  </span>
                  <span className="max-w-full truncate px-0.5">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <LocationPermissionModal />
    </div>
  );
}
