import { Link, useRouterState } from "@tanstack/react-router";
import { Calendar, Home, MapPin, Sparkles, User } from "lucide-react";

type NavItem = {
  to: "/customer/home" | "/customer/at-salon" | "/customer/bookings" | "/customer/rewards" | "/customer/profile";
  label: string;
  icon: typeof Home;
  exact?: boolean;
};

const ITEMS: NavItem[] = [
  { to: "/customer/home", label: "Home", icon: Home, exact: true },
  { to: "/customer/at-salon", label: "At Salon", icon: MapPin },
  { to: "/customer/bookings", label: "Bookings", icon: Calendar },
  { to: "/customer/rewards", label: "Rewards", icon: Sparkles },
  { to: "/customer/profile", label: "Profile", icon: User },
];

export function CustomerBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function isActive(to: string, exact?: boolean) {
    if (exact) return pathname === to;
    return pathname === to || pathname.startsWith(`${to}/`);
  }

  return (
    <nav
      aria-label="Customer app navigation"
      className="bg-card/95 border-border supports-[backdrop-filter]:bg-card/80 fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
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
