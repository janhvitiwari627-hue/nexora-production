import { test, expect } from "@playwright/test";

/**
 * Every /site/:slug/* route must render the shared SalonNotFound page when
 * the slug is missing, literally "undefined", or literally "null" — never a
 * dead-end error or a silent redirect. The SalonNotFound page shows a
 * "Salon not found" (or "Salon website not published") heading plus a
 * "Go to Nexora" primary CTA and a "Browse salons" secondary CTA.
 */

const INVALID_SLUGS = ["undefined", "null"];

const ROUTE_PATTERNS = [
  (slug: string) => `/site/${slug}`,
  (slug: string) => `/site/${slug}/services`,
  (slug: string) => `/site/${slug}/book`,
  (slug: string) => `/site/${slug}/booking-success?booking=abc`,
];

for (const slug of INVALID_SLUGS) {
  for (const build of ROUTE_PATTERNS) {
    const path = build(slug);
    test(`${path} renders SalonNotFound (slug="${slug}")`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});

      // Should NOT silently redirect off the /site/* URL.
      expect(new URL(page.url()).pathname).toBe(path.split("?")[0]);

      // Friendly heading + both CTAs are visible.
      const heading = page.getByRole("heading", {
        name: /Salon (not found|website not published)/i,
      });
      await expect(heading).toBeVisible();
      await expect(page.getByRole("link", { name: /Go to Nexora/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /Browse salons/i })).toBeVisible();
    });
  }
}

test('tab title falls back to "salon" (never the literal "undefined") for invalid slugs', async ({
  page,
}) => {
  await page.goto("/site/undefined/services", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/salon/i);
  await expect(page).not.toHaveTitle(/undefined/i);

  await page.goto("/site/undefined/book", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/salon/i);
  await expect(page).not.toHaveTitle(/undefined/i);
});
