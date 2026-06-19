import { Link, useRouterState } from "@tanstack/react-router";
import { Calendar, Home, Sparkles, User, Wallet } from "lucide-react";

type NavItem = { to: string; label: string; icon: typeof Home; exact?: boolean };

const ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: Home, exact: true },
  { to: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { to: "/dashboard/rewards", label: "Rewards", icon: Sparkles },
  { to: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { to: "/dashboard/settings", label: "Account", icon: User },
];

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function isActive(to: string, exact?: boolean) {
    if (exact) return pathname === to;
    return pathname === to || pathname.startsWith(`${to}/`);
  }

  return (
    <nav
      aria-label="Dashboard navigation"
      className="bg-card/95 border-border supports-[backdrop-filter]:bg-card/80 fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = isActive(item.to, item.exact);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`grid h-7 w-12 place-items-center rounded-full transition ${
                    active ? "bg-primary/15" : "bg-transparent"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={active ? 2.5 : 2} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
