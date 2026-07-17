import { test, expect, devices, type Page } from "@playwright/test";

/**
 * Responsive coverage: on both mobile and desktop viewports, every
 * "Book Now" link on the owner template-preview pages must point to
 * `/site/<slug>/book` — never home (`/`) and never a
 * `/site/undefined/book` regression.
 *
 * Mobile matters because some Book-Now CTAs live inside a hamburger
 * drawer / sticky bottom bar that only mount below the md breakpoint,
 * so a desktop-only check would miss those regressions.
 */

const TEMPLATE_KEYS = ["modern-salon", "royal-luxe", "professional-beauty"];

const VIEWPORTS = [
  { name: "mobile", ...devices["iPhone 13"] },
  { name: "desktop", viewport: { width: 1280, height: 900 } },
] as const;

async function collectBookNowHrefs(page: Page): Promise<string[]> {
  // Reveal any Book-Now CTA that lives inside a mobile drawer.
  const menuToggle = page
    .locator(
      'button[aria-label*="menu" i], button[aria-label*="navigation" i], button:has-text("Menu")',
    )
    .first();
  if (await menuToggle.isVisible().catch(() => false)) {
    await menuToggle.click().catch(() => {});
  }

  const links = page.locator("a", { hasText: /book\s*now/i });
  const count = await links.count();
  const hrefs: string[] = [];
  for (let i = 0; i < count; i++) {
    const href = await links.nth(i).getAttribute("href");
    if (href) hrefs.push(href);
  }
  return hrefs;
}

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name} viewport`, () => {
    test.use({
      ...("viewport" in vp ? { viewport: vp.viewport } : {}),
      ...("userAgent" in vp && vp.userAgent ? { userAgent: vp.userAgent } : {}),
      ...("isMobile" in vp && vp.isMobile ? { isMobile: vp.isMobile } : {}),
      ...("hasTouch" in vp && vp.hasTouch ? { hasTouch: vp.hasTouch } : {}),
      ...("deviceScaleFactor" in vp && vp.deviceScaleFactor
        ? { deviceScaleFactor: vp.deviceScaleFactor }
        : {}),
    });

    for (const key of TEMPLATE_KEYS) {
      test(`template-preview/${key}: Book Now hrefs never point home`, async ({ page }) => {
        await page.goto(`/template-preview/${key}`);
        await page.waitForLoadState("domcontentloaded");
        await expect(page.locator("body")).toBeVisible();

        const hrefs = await collectBookNowHrefs(page);
        expect(
          hrefs.length,
          `expected at least one Book Now link on ${vp.name}`,
        ).toBeGreaterThan(0);

        for (const href of hrefs) {
          expect(href, `bad Book Now href on ${vp.name}: ${href}`).toMatch(
            /^\/site\/[^/]+\/book(\?.*)?$/,
          );
          expect(href).not.toMatch(/\/site\/(undefined|null)\//);
          expect(href).not.toBe("/");
          expect(href).not.toMatch(/^\/(\?.*)?$/);
        }
      });

      test(`template-preview/${key}: clicking Book Now on ${vp.name} lands on /site/<slug>/book`, async ({
        page,
      }) => {
        await page.goto(`/template-preview/${key}`);
        await page.waitForLoadState("domcontentloaded");

        const menuToggle = page
          .locator(
            'button[aria-label*="menu" i], button[aria-label*="navigation" i], button:has-text("Menu")',
          )
          .first();
        if (await menuToggle.isVisible().catch(() => false)) {
          await menuToggle.click().catch(() => {});
        }

        const firstBook = page.locator("a", { hasText: /book\s*now/i }).first();
        await expect(firstBook).toBeVisible();
        await firstBook.click();

        await page.waitForURL(/\/site\/[^/]+\/book/, { timeout: 10_000 });
        const url = new URL(page.url());
        expect(url.pathname).toMatch(/^\/site\/[^/]+\/book$/);
        expect(url.pathname).not.toMatch(/\/site\/(undefined|null)\//);
        expect(url.pathname).not.toBe("/");
      });
    }
  });
}
