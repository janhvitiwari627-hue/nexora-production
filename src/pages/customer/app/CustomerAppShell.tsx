import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Gift, Home, Search, UserRound } from "lucide-react";
import nexoraLogo from "@/assets/nexora-logo.jpg.asset.json";
import { LocationPermissionModal } from "@/components/auth/LocationPermissionModal";
import { useAuthStore } from "@/stores/authStore";

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
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/app/customer" className="flex items-center gap-2">
            <img src={nexoraLogo.url} alt="Nexora" className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <p className="font-black leading-none">Nexora</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                Customer App
              </p>
            </div>
          </Link>
          {user ? (
            <Link
              to="/app/customer/profile"
              className="max-w-40 truncate rounded-full bg-violet-50 px-4 py-2 text-sm font-bold text-violet-800"
            >
              {profile?.full_name || "My profile"}
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

      <div className="pb-24">
        <Outlet />
      </div>

      <nav
        aria-label="Customer app navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.to || pathname === `${item.to}/`
              : pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold ${
                    active ? "text-violet-700" : "text-slate-500"
                  }`}
                >
                  <span className={`rounded-full px-4 py-1 ${active ? "bg-violet-100" : ""}`}>
                    <item.icon className="h-5 w-5" />
                  </span>
                  {item.label}
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
