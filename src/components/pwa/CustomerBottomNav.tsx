import { Link, useRouterState } from "@tanstack/react-router";
import { Calendar, Home, MapPin, Sparkles, User } from "lucide-react";

type TabId = "home" | "at-salon" | "bookings" | "rewards" | "profile";

type NavItem = {
  id: TabId;
  to: "/customer/home" | "/customer/at-salon" | "/customer/bookings" | "/customer/rewards" | "/customer/profile";
  label: string;
  icon: typeof Home;
};

const ITEMS: NavItem[] = [
  { id: "home", to: "/customer/home", label: "Home", icon: Home },
  { id: "at-salon", to: "/customer/at-salon", label: "At Salon", icon: MapPin },
  { id: "bookings", to: "/customer/bookings", label: "Bookings", icon: Calendar },
  { id: "rewards", to: "/customer/rewards", label: "Rewards", icon: Sparkles },
  { id: "profile", to: "/customer/profile", label: "Profile", icon: User },
];

/**
 * Maps every scaffolded customer-app route to the bottom-nav tab that
 * should highlight while it's mounted. Keeping this table explicit makes
 * it obvious which sub-routes belong under which tab, and prevents drift
 * when new screens are added.
 *
 * Order matters: entries are matched with `startsWith`, so more specific
 * prefixes must appear before less specific ones (e.g. /customer/support
 * before /customer/settings).
 */
const ROUTE_TAB_MAP: Array<{ prefix: string; tab: TabId; exact?: boolean }> = [
  { prefix: "/customer/home", tab: "home", exact: true },
  { prefix: "/customer/at-salon", tab: "at-salon" },
  { prefix: "/customer/at-home", tab: "at-salon" }, // sibling booking mode
  { prefix: "/customer/bookings", tab: "bookings" }, // covers /bookings/$bookingId
  { prefix: "/customer/rewards", tab: "rewards" },
  { prefix: "/customer/profile", tab: "profile" },
  { prefix: "/customer/settings", tab: "profile" }, // reached from Profile
  { prefix: "/customer/support", tab: "profile" }, // covers /support/add-ticket
];

function activeTabFor(pathname: string): TabId | null {
  const p = pathname.replace(/\/+$/, "") || "/";
  for (const entry of ROUTE_TAB_MAP) {
    if (entry.exact ? p === entry.prefix : p === entry.prefix || p.startsWith(`${entry.prefix}/`)) {
      return entry.tab;
    }
  }
  return null;
}

export function CustomerBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeTab = activeTabFor(pathname);

  return (
    <nav
      aria-label="Customer app navigation"
      className="bg-card/95 border-border supports-[backdrop-filter]:bg-card/80 fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map((item) => {
          const active = activeTab === item.id;
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                data-active={active ? "true" : undefined}
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

