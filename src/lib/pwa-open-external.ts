import { useEffect } from "react";

/**
 * When the app is running as an installed PWA (display-mode: standalone)
 * inside the Customer App scope (`/customer/*`), any click on a link that
 * points OUT of the customer scope (website home, owner, jobs, portal,
 * admin, marketing pages, etc.) should open in the user's browser instead
 * of navigating inside the standalone app window.
 *
 * The manifest scope already tells the browser to eject out-of-scope
 * navigations, but this is only reliable for full-page navigations. Client
 * router links (`<Link>` / `history.pushState`) never trigger that ejection.
 * This global capture-phase click handler covers both cases.
 */
const CUSTOMER_SCOPE_PREFIX = "/customer";
const ALLOWED_INSIDE_APP = new Set<string>([
  "/login",
  "/auth/callback",
  "/logout",
]);

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isOutOfCustomerScope(pathname: string): boolean {
  if (pathname.startsWith(CUSTOMER_SCOPE_PREFIX)) return false;
  if (ALLOWED_INSIDE_APP.has(pathname)) return false;
  return true;
}

export function useOpenExternalInStandalone() {
  useEffect(() => {
    if (!isStandalone()) return;

    const onClick = (e: MouseEvent) => {
      // Respect modifier-click / middle-click / already-handled events.
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const path = e.composedPath();
      const anchor = path.find(
        (n): n is HTMLAnchorElement =>
          n instanceof HTMLAnchorElement && !!n.href,
      );
      if (!anchor) return;

      // Skip anchors that opt out explicitly.
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.dataset.pwaKeep === "true") return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      // Only same-origin, out-of-scope links get intercepted.
      if (url.origin !== window.location.origin) return;
      if (!isOutOfCustomerScope(url.pathname)) return;

      e.preventDefault();
      e.stopPropagation();
      window.open(url.href, "_blank", "noopener,noreferrer");
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
}
