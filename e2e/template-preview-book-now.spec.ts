import { test, expect } from "@playwright/test";

/**
 * Verifies that on the owner template-preview pages, every "Book Now"
 * link points at the white-label booking route `/site/<slug>/book`
 * for the demo business — not the home page, and not
 * `/site/undefined/book` (a regression caused by using the wrong route
 * param key in TanStack Router's `params={{ ... }}`).
 */

const TEMPLATE_KEYS = ["modern-salon", "royal-luxe", "professional-beauty"];

for (const key of TEMPLATE_KEYS) {
  test(`template-preview/${key}: all Book Now links use /site/<slug>/book`, async ({ page }) => {
    await page.goto(`/template-preview/${key}`);
    // Wait for the white-label page shell to render.
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();

    // Grab every visible "Book Now" (case-insensitive) link/button-link.
    const bookLinks = page.locator("a", { hasText: /book\s*now/i });
    const count = await bookLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = bookLinks.nth(i);
      const href = await link.getAttribute("href");
      expect(href, `Book Now link #${i} must have href`).toBeTruthy();
      // Must go to /site/<slug>/book — never home, never undefined/null slug.
      expect(href!).toMatch(/^\/site\/[^/]+\/book(\?.*)?$/);
      expect(href!).not.toMatch(/\/site\/(undefined|null)\//);
      expect(href).not.toBe("/");
    }
  });

  test(`template-preview/${key}: clicking Book Now stays on /site/<slug>/book (no home redirect)`, async ({ page }) => {
    await page.goto(`/template-preview/${key}`);
    await page.waitForLoadState("domcontentloaded");

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
