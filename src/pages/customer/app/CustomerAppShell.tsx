import { useCallback, useEffect, useState } from "react";
import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, ChevronDown, Gift, Home, MapPin, Search, UserRound } from "lucide-react";
import { LocationPermissionModal } from "@/components/auth/LocationPermissionModal";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";
import { useCustomerLocation } from "@/hooks/useCustomerLocation";
import { CUSTOMER_LOCATION_ONBOARDING_KEY } from "@/lib/customer-location";
import { useAuthStore } from "@/stores/authStore";
import { CustomerAvatar } from "./CustomerAvatar";
import { CustomerLocationDialog } from "./CustomerLocationDialog";

const CUSTOMER_ICON = "/customer-pwa-icon-192.png";
const CUSTOMER_SPLASH = "/customer-pwa-splash.jpg";
const SPLASH_SESSION_KEY = "nexora:customer-launch-splash:v1";

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
  const { location, save: saveLocation } = useCustomerLocation();
  const [showLaunchSplash, setShowLaunchSplash] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const dismissLaunchSplash = useCallback(() => {
    setShowLaunchSplash(false);
    try {
      window.sessionStorage.setItem(SPLASH_SESSION_KEY, "shown");
    } catch {
      // Restricted storage should not prevent the app from opening.
    }
  }, []);

  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(SPLASH_SESSION_KEY) === "shown";
      if (window.sessionStorage.getItem(CUSTOMER_LOCATION_ONBOARDING_KEY) === "required") {
        window.sessionStorage.setItem(SPLASH_SESSION_KEY, "shown");
        return;
      }
    } catch {
      // Restricted storage should not prevent the app from opening.
    }
    if (alreadyShown) return;

    setShowLaunchSplash(true);
    const timer = window.setTimeout(dismissLaunchSplash, 2600);
    return () => window.clearTimeout(timer);
  }, [dismissLaunchSplash]);

  return (
    <div className="nexora-pwa-surface customer-app min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#fff9ed] text-[#0b0a08]">
      {showLaunchSplash ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Nexora Customer App launch screen"
          className="fixed inset-0 z-[100] grid min-h-[100dvh] place-items-center overflow-hidden bg-black"
          onClick={dismissLaunchSplash}
        >
          <img
            src={CUSTOMER_SPLASH}
            alt="Nexora SalONOS — Salon ja rahe ho? Nexora kiya?"
            className="h-full w-full object-contain"
            fetchPriority="high"
          />
          <button
            type="button"
            onClick={dismissLaunchSplash}
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] rounded-full border border-amber-300/40 bg-black/70 px-4 py-2 text-xs font-bold text-amber-100 backdrop-blur"
          >
            Skip
          </button>
        </div>
      ) : null}

      <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden border-b border-[#e8e0d2] bg-[#fffdf8]/95 shadow-[0_8px_30px_rgba(69,49,12,0.06)] backdrop-blur">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Link to="/app/customer" className="flex min-w-0 items-center gap-2">
            <img
              src={CUSTOMER_ICON}
              alt="Nexora"
              className="h-10 w-10 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <p className="font-black leading-none">Nexora</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a6b16]">
                Customer App
              </p>
            </div>
          </Link>
          <div className="flex min-w-0 items-center justify-end gap-2">
            <InstallAppButton
              kind="customer"
              fallbackHref="/app/customer"
              hideWhenInstalled
              className="hidden min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#0b0a08] px-4 text-xs font-black text-[#f3cf70] shadow-md transition hover:-translate-y-0.5 min-[520px]:inline-flex"
            />
            {user ? (
              <Link
                to="/app/customer/profile"
                className="flex max-w-36 shrink-0 items-center gap-2 rounded-full border border-[#ead49b] bg-[#fff4d3] py-1 pl-1 pr-3 text-sm font-bold text-[#6d4a10] sm:max-w-44"
              >
                <CustomerAvatar className="h-8 w-8" iconClassName="h-4 w-4" />
                <span className="truncate">{profile?.full_name || "My profile"}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-bold text-[#4f493f]">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-[#0b0a08] px-4 py-2 text-sm font-bold text-[#f3cf70]"
                >
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>
        {user ? (
          <div className="border-t border-[#efe3c4] bg-[#fff8e7] px-4 py-2">
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              aria-label="Change current location"
              className="mx-auto flex w-full max-w-6xl items-center gap-2 rounded-xl px-1 py-1 text-left transition hover:bg-[#fff0c2]"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0b0a08] text-[#f3cf70]">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[9px] font-black uppercase tracking-[0.15em] text-[#9a6b16]">
                  Current location
                </span>
                <span className="block truncate text-sm font-black text-[#20190d]">
                  {location?.label ?? "Set your location"}
                </span>
              </span>
              <span className="hidden text-xs font-bold text-[#9a6b16] sm:inline">
                {location ? "Change" : "Set now"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#9a6b16]" />
            </button>
          </div>
        ) : null}
      </header>

      <div className="w-full max-w-full overflow-x-hidden pb-24">
        <Outlet />
      </div>

      <nav
        aria-label="Customer app navigation"
        className="pwa-bottom-nav fixed inset-x-0 bottom-0 z-50 w-full max-w-full overflow-x-hidden border-t border-[#e8e0d2] bg-[#fffdf8]/95 shadow-[0_-8px_30px_rgba(69,49,12,0.08)] backdrop-blur"
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
                  className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold sm:text-[11px] ${
                    active ? "text-[#9a6b16]" : "text-[#7a746a]"
                  }`}
                >
                  <span className={`rounded-full px-3 py-1 ${active ? "bg-[#fff0c2]" : ""}`}>
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
      <CustomerLocationDialog
        open={locationOpen}
        onOpenChange={setLocationOpen}
        initialLocation={location}
        onSave={saveLocation}
      />
    </div>
  );
}
