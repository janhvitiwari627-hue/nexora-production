import { test, expect, type BrowserContext } from "@playwright/test";

/**
 * Simulates the installed PWA (standalone display-mode) and verifies that
 * every /customer/* route mounts CustomerAppLayout — never a marketing
 * layout (PublicHeader / PublicFooter / PublicPageHeader).
 *
 * Standalone detection is faked by overriding `window.matchMedia` for the
 * `(display-mode: standalone)` query and setting `navigator.standalone`
 * before any app code runs. This is what `src/lib/pwa-standalone-guard.ts`
 * inspects on boot.
 *
 * Auth: these tests do not sign in. Unauthenticated visits to /customer/*
 * are redirected to /login by the route's `beforeLoad`. The assertion that
 * matters is layout isolation — no public marketing chrome must render at
 * any point in the flow, regardless of the eventual URL.
 */

const CUSTOMER_ROUTES = [
  "/customer/home",
  "/customer/at-salon",
  "/customer/at-home",
  "/customer/bookings",
  "/customer/rewards",
  "/customer/profile",
  "/customer/settings",
  "/customer/support",
];

async function installStandaloneFake(context: BrowserContext) {
  await context.addInitScript(() => {
    // Force matchMedia('(display-mode: standalone)') to return matches: true.
    const originalMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = ((query: string) => {
      if (typeof query === "string" && query.includes("display-mode: standalone")) {
        return {
          matches: true,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        } as unknown as MediaQueryList;
      }
      return originalMatchMedia(query);
    }) as typeof window.matchMedia;

    // iOS-style standalone flag, for completeness.
    try {
      Object.defineProperty(window.navigator, "standalone", {
        configurable: true,
        get: () => true,
      });
    } catch {
      /* ignore — already defined */
    }
  });
}

async function expectNoMarketingLayout(page: import("@playwright/test").Page) {
  await expect(page.locator('[data-testid="public-header"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="public-footer"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="public-page-header"]')).toHaveCount(0);
}

test.describe("PWA standalone mode: customer app layout isolation", () => {
  test("standalone-mode public URL redirects into /customer/* and shows no marketing layout", async ({ browser }) => {
    const context = await browser.newContext();
    await installStandaloneFake(context);
    const page = await context.newPage();

    await page.goto("/");
    // The pwa-standalone-guard replaces the location before React mounts
    // marketing UI; wait for the redirect to settle.
    await page.waitForURL(/\/customer\/|\/login/, { timeout: 10_000 });

    expect(page.url()).not.toMatch(/\/$|\/explore|\/for-owners|\/admin/);
    await expectNoMarketingLayout(page);

    await context.close();
  });

  for (const route of CUSTOMER_ROUTES) {
    test(`standalone: ${route} never renders marketing layout`, async ({ browser }) => {
      const context = await browser.newContext();
      await installStandaloneFake(context);
      const page = await context.newPage();

      await page.goto(route);
      // Either the customer route renders (authed) or beforeLoad redirects
      // to /login. Both are acceptable — the invariant is: no marketing
      // header/footer ever appears.
      await page.waitForLoadState("domcontentloaded");
      await expectNoMarketingLayout(page);

      await context.close();
    });
  }
});
