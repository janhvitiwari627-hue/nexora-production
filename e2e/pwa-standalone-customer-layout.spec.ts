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
 * are redirected to /customer/login by the route's `beforeLoad` — the
 * redirect must stay inside the /customer/* scope, never bounce out to
 * the public /login. The assertion that matters is layout isolation —
 * no public marketing chrome must render at any point in the flow.
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
    // marketing UI; wait for the redirect to settle inside /customer/*.
    await page.waitForURL(/\/customer\//, { timeout: 10_000 });

    expect(page.url()).toMatch(/\/customer\//);
    expect(page.url()).not.toMatch(/\/(explore|for-owners|admin|about|create-shop-website|partner-growth|distributor|job-portal)(\/|$|\?)/);
    await expectNoMarketingLayout(page);

    await context.close();
  });

  for (const route of CUSTOMER_ROUTES) {
    test(`standalone: ${route} never renders marketing layout`, async ({ browser }) => {
      const context = await browser.newContext();
      await installStandaloneFake(context);
      const page = await context.newPage();

      await page.goto(route);
      // Either the route renders (authed) or beforeLoad redirects to
      // /customer/login. Both stay inside /customer/* — the invariant is
      // that no marketing header/footer ever appears.
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/\/customer\//, { timeout: 10_000 });
      expect(page.url()).toMatch(/\/customer\//);
      await expectNoMarketingLayout(page);

      await context.close();
    });
  }

  // Rule 3 + 4: launching the installed app (start_url = /customer/home)
  // must land inside /customer/* with no marketing chrome, even when the
  // browser initially navigates to the /customer-app install landing page.
  test("standalone: /customer-app redirects into /customer/* (no install landing)", async ({ browser }) => {
    const context = await browser.newContext();
    await installStandaloneFake(context);
    const page = await context.newPage();

    await page.goto("/customer-app");
    await page.waitForURL(/\/customer\//, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/customer\//);
    expect(page.url()).not.toMatch(/\/customer-app(\?|$|\/)/);
    await expectNoMarketingLayout(page);

    await context.close();
  });

  // Rule 5: no owner / partner / distributor / job-portal / create-shop
  // website nav links may render inside the installed customer shell.
  const FORBIDDEN_NAV_HREFS = [
    "/create-shop-website",
    "/partner-growth",
    "/distributor",
    "/job-portal",
    "/owner",
    "/admin",
  ];

  for (const route of ["/customer/home", "/customer/at-salon", "/customer/profile"]) {
    test(`standalone: ${route} contains no owner/partner/distributor nav links`, async ({ browser }) => {
      const context = await browser.newContext();
      await installStandaloneFake(context);
      const page = await context.newPage();

      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/\/customer\//, { timeout: 10_000 });

      for (const href of FORBIDDEN_NAV_HREFS) {
        // Any anchor pointing at a forbidden owner/marketing surface would
        // break the customer app's separation from the public website.
        await expect(page.locator(`a[href^="${href}"]`)).toHaveCount(0);
      }

      await context.close();
    });
  }

  // Rule 7: "Continue in Browser" (rendered in InstallBanner on public
  // pages) must route to /customer/home, never to the website home.
  test("non-standalone: InstallBanner 'Continue in Browser' targets /customer/home", async ({ browser }) => {
    const context = await browser.newContext();
    // NOTE: no standalone fake — this checks the browser-mode banner.
    const page = await context.newPage();

    await page.goto("/customer-app");
    await page.waitForLoadState("domcontentloaded");

    // The CustomerAppPage's primary "Continue in Browser" CTA is a
    // <Link to="/customer/home">. Assert at least one such anchor exists.
    const continueLinks = page.locator('a[href="/customer/home"]');
    expect(await continueLinks.count()).toBeGreaterThan(0);

    await context.close();
  });
});
