import { test, expect, type Page } from "@playwright/test";

/**
 * A signed-in customer must NOT be able to open role-specific profile
 * edit routes by typing the URL directly. `requireRole` in
 * `src/lib/route-guards.ts` should redirect them away before the
 * `/dashboard/settings` redirect ever runs.
 *
 * Uses the Lovable browser-use managed Supabase session when available;
 * skips otherwise (the sandbox session belongs to a customer by default,
 * which is exactly the role this test needs).
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

const PROTECTED_PROFILE_ROUTES = [
  "/owner/profile",
  "/partner/profile",
  "/admin/profile",
] as const;

// Any of these landings are acceptable — `requireRole` either bounces the
// user to /login (no matching role) or to a role-appropriate home. The
// customer role maps to `/` via `routeForRole`.
const ALLOWED_LANDINGS = ["/", "/login", "/admin/dashboard", "/owner/dashboard"];

async function seedCustomerSession(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
      window.sessionStorage.removeItem("nexora:postLoginRedirect");
    },
    [STORAGE_KEY!, SESSION_JSON!],
  );
}

test.describe("Customer cannot open role-specific profile edit routes", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping customer profile guard test.",
  );

  for (const route of PROTECTED_PROFILE_ROUTES) {
    test(`direct navigation to ${route} is blocked for a customer`, async ({ page }) => {
      await seedCustomerSession(page);

      await page.goto(route);

      // The guard should redirect somewhere else. Wait until we're off the
      // protected profile URL. If the guard were missing, the route would
      // fall through to its own `redirect({ to: "/dashboard/settings" })`
      // — which is also not the requested URL, so we additionally assert
      // the landing is a customer-visible surface (not the dashboard edit
      // page a customer shouldn't reach through this door).
      await page.waitForFunction(
        (r) => !window.location.pathname.startsWith(r),
        route,
        { timeout: 10_000 },
      );

      const landed = new URL(page.url()).pathname;

      // Not still on the protected route.
      expect(landed.startsWith(route)).toBe(false);

      // Must not have been quietly forwarded into the role-specific
      // settings surface — that would mean the guard did not fire.
      expect(landed.startsWith("/dashboard/settings")).toBe(false);

      // Must land on a customer-appropriate destination.
      expect(
        ALLOWED_LANDINGS.some((t) => landed === t || landed.startsWith(t + "/")),
      ).toBe(true);
    });
  }
});
