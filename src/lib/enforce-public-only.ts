import { isStandaloneDisplay } from "@/lib/pwa-standalone-guard";

/**
 * Runtime guard: ensures public-website layout components never render
 * inside the customer app surface.
 *
 * A component wrapped with `assertPublicOnly` refuses to render (returns
 * true so the caller can `return null`) when EITHER:
 *
 * 1. The current URL is under /customer/* — the customer-app layout,
 *    always isolated from marketing chrome.
 * 2. The app is running as an installed PWA (display-mode: standalone or
 *    iOS navigator.standalone) AND the current URL is the customer-app
 *    install/landing page (/customer-app). Installed users must never see
 *    marketing header/footer or owner/distributor/growth navigation on
 *    that page — they only see the "Open Nexora App" affordance.
 */
export function isCustomerRoute(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/customer");
}

function isInstalledCustomerAppPage(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== "/customer-app") return false;
  return isStandaloneDisplay();
}

export function assertPublicOnly(componentName: string): boolean {
  if (isCustomerRoute() || isInstalledCustomerAppPage()) {
    // eslint-disable-next-line no-console
    console.error(
      `[layout-guard] ${componentName} is a public-website component and must not render on customer-app surfaces. Rendering null.`,
    );
    return true;
  }
  return false;
}
