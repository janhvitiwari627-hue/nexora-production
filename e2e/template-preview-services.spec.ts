import { test, expect, type Page } from "@playwright/test";

/**
 * Verifies that on the owner template-preview flow, the customer-facing
 * services page (`/site/<slug>/services`) actually lists services with
 * price + duration for every template variant.
 *
 * This is the "shop owner ko template dene ka matlab" invariant: on
 * every template, the customer should see all services and be able to
 * click through to book them.
 */

const TEMPLATE_KEYS = ["modern-salon", "royal-luxe", "professional-beauty"];

async function goToServicesFromPreview(page: Page, key: string) {
  await page.goto(`/template-preview/${key}`);
  await page.waitForLoadState("domcontentloaded");

  // Resolve the demo slug the preview mounted, then jump to its
  // services page directly (the template header's Services link uses
  // the same slug).
  const bookHref = await page
    .locator('a[href*="/site/"][href*="/book"]')
    .first()
    .getAttribute("href");
  expect(bookHref, "template preview must expose a /site/<slug>/book link").toBeTruthy();
  const match = bookHref!.match(/^\/site\/([^/]+)\/book/);
  expect(match, `unexpected book href: ${bookHref}`).not.toBeNull();
  const slug = match![1];

  await page.goto(`/site/${slug}/services`);
  await page.waitForLoadState("domcontentloaded");
  return slug;
}

for (const key of TEMPLATE_KEYS) {
  test(`template ${key}: /site/<slug>/services renders services with price + duration`, async ({
    page,
  }) => {
    const slug = await goToServicesFromPreview(page, key);

    // Heading is on every services page.
    await expect(
      page.getByRole("heading", { level: 1, name: /choose your service/i }),
    ).toBeVisible();

    // The service cards use <article> containers with a per-service
    // "Book this service" link.
    const cards = page.locator("article", {
      has: page.getByRole("link", { name: /book this service/i }),
    });
    const count = await cards.count();
    expect(count, `expected services to render on ${slug}`).toBeGreaterThanOrEqual(3);

    // Every card must show a rupee price and a duration.
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const text = (await card.innerText()).replace(/\s+/g, " ");
      expect(text, `card #${i} missing price on ${slug}`).toMatch(/₹\s*\d/);
      expect(text, `card #${i} missing duration on ${slug}`).toMatch(/\d+\s*min/i);
    }

    // Every "Book this service" link goes to /site/<slug>/book with a
    // service search param — never home, never /site/undefined.
    const bookLinks = page.getByRole("link", { name: /book this service/i });
    const linkCount = await bookLinks.count();
    expect(linkCount).toBe(count);
    for (let i = 0; i < linkCount; i++) {
      const href = await bookLinks.nth(i).getAttribute("href");
      expect(href).toMatch(
        new RegExp(`^/site/${slug.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}/book\\?`),
      );
      expect(href).toMatch(/service=/);
      expect(href).not.toMatch(/\/site\/(undefined|null)\//);
    }
  });

  test(`template ${key}: clicking a service card lands on booking form with that service preselected`, async ({
    page,
  }) => {
    const slug = await goToServicesFromPreview(page, key);
    const firstBook = page.getByRole("link", { name: /book this service/i }).first();
    const href = await firstBook.getAttribute("href");
    await firstBook.click();

    await page.waitForURL(new RegExp(`/site/${slug}/book`), { timeout: 10_000 });
    expect(page.url()).toContain(`/site/${slug}/book`);
    expect(page.url()).toContain("service=");
    expect(page.url()).not.toMatch(/\/site\/(undefined|null)\//);
    // Booking form must actually render (not the "Booking not enabled yet" fallback).
    await expect(page.getByRole("heading", { level: 1, name: /^book at /i })).toBeVisible();
    // The service query param should be preserved verbatim from the /services page.
    const search = new URL(page.url()).search;
    const expectedService = new URL(href!, "http://x").searchParams.get("service");
    expect(new URL(page.url()).searchParams.get("service")).toBe(expectedService);
  });
}
