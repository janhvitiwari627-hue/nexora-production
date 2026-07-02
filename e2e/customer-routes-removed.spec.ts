import { test, expect } from "@playwright/test";

/**
 * The customer app was removed from the main website. Visiting /customer or
 * any /customer/* path must NOT render customer app UI. Acceptable outcomes:
 *   1. The branded 404 page renders (contains the site's 404 heading), OR
 *   2. The router redirects the user to the public home page ("/").
 *
 * Either way, no customer-app chrome (bottom nav, customer header, PWA
 * install banner, etc.) may appear.
 */

const CUSTOMER_PATHS = [
  "/customer",
  "/customer/",
  "/customer/home",
  "/customer/at-salon",
  "/customer/at-home",
  "/customer/bookings",
  "/customer/bookings/abc-123",
  "/customer/rewards",
  "/customer/profile",
  "/customer/settings",
  "/customer/support",
  "/customer/login",
  "/customer/onboarding",
  "/customer/verify-otp",
  "/customer/location",
];

const FORBIDDEN_SELECTORS = [
  '[data-testid="customer-bottom-nav"]',
  '[data-testid="customer-app-header"]',
  '[data-testid="install-banner"]',
  '[data-testid="pwa-install-prompt"]',
];

for (const path of CUSTOMER_PATHS) {
  test(`${path} shows branded 404 or redirects home — never customer app UI`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Must not remain on any /customer/* URL (customer-app landing is allowed).
    const finalUrl = new URL(page.url());
    expect(finalUrl.pathname).not.toMatch(/^\/customer(\/|$)/);

    // No customer-app chrome anywhere.
    for (const sel of FORBIDDEN_SELECTORS) {
      await expect(page.locator(sel)).toHaveCount(0);
    }

    // Either the branded 404 renders, or we're on the home page.
    const on404 = await page.locator("h1", { hasText: "404" }).count();
    const isHome = finalUrl.pathname === "/";
    expect(on404 > 0 || isHome).toBeTruthy();

    // Response, when a real 404 render, should be non-2xx OR home 200.
    // (SPA fallbacks may still return 200 — we don't hard-fail on that.)
    if (response && !isHome) {
      // If server returned a status, prefer 404. Otherwise accept SPA 200
      // as long as the 404 UI rendered (asserted above).
      expect([200, 404]).toContain(response.status());
    }
  });
}
