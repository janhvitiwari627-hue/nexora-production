/**
 * Standalone (installed PWA) redirect guard.
 *
 * When the app is running as an installed PWA (display-mode: standalone
 * or iOS Safari's navigator.standalone), it must only show customer app
 * screens. If the current URL is outside the allowed customer scope, we
 * redirect to /customer/home.
 */

const ALLOWED_EXACT = new Set<string>([
  "/customer/login",
  "/customer/verify-otp",
  "/customer/onboarding",
  "/customer/location",
  "/customer/home",
  "/customer/at-salon",
  "/customer/at-home",
  "/customer/bookings",
  "/customer/rewards",
  "/customer/profile",
  "/customer/settings",
  "/customer/support",
  "/customer/support/add-ticket",
]);

// Prefixes that are allowed (covers nested customer routes + salon detail/booking).
const ALLOWED_PREFIXES = ["/customer/", "/salon/", "/auth/callback"];

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  } catch {
    /* ignore */
  }
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  return false;
}

export function isAllowedStandalonePath(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (ALLOWED_EXACT.has(p)) return true;
  if (ALLOWED_PREFIXES.some((prefix) => p.startsWith(prefix))) return true;
  return false;
}

/**
 * Installs a global guard that redirects the installed app to
 * /customer/home whenever it lands on a non-customer route.
 * Safe to call once at app boot.
 */
export function initStandaloneRedirectGuard(): void {
  if (typeof window === "undefined") return;
  if (!isStandaloneDisplay()) return;

  const check = () => {
    const path = window.location.pathname;
    if (!isAllowedStandalonePath(path)) {
      window.location.replace("/customer/home");
    }
  };

  check();
  window.addEventListener("popstate", check);
}
