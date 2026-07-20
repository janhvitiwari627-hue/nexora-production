import { test, expect, type Page } from "@playwright/test";

/**
 * End-to-end booking flow on a template preview / mock salon slug:
 * 1. Land on `/template-preview/<key>`.
 * 2. Click the header "Book Now" and land on the booking form (not home).
 * 3. Fill out service / staff / date / time / name / mobile.
 * 4. Submit and assert the booking-success receipt renders with a
 *    reference number and the selected service name.
 */

const TEMPLATE_KEYS = ["modern-salon", "royal-luxe", "professional-beauty"];

async function resolveDemoSlug(page: Page, key: string): Promise<string> {
  await page.goto(`/template-preview/${key}`);
  await page.waitForLoadState("domcontentloaded");
  const bookHref = await page
    .locator('a[href*="/site/"][href*="/book"]')
    .first()
    .getAttribute("href");
  expect(bookHref, "template preview must expose a /site/<slug>/book link").toBeTruthy();
  const match = bookHref!.match(/^\/site\/([^/]+)\/book/);
  expect(match, `unexpected book href: ${bookHref}`).not.toBeNull();
  return match![1];
}

for (const key of TEMPLATE_KEYS) {
  test(`template ${key}: completing the mock booking form shows the success receipt`, async ({
    page,
  }) => {
    const slug = await resolveDemoSlug(page, key);

    // Click through the actual Book Now link so we exercise the same
    // href generation customers see. The header link is the first
    // /site/<slug>/book anchor on the preview page.
    await page.locator('a[href*="/site/"][href*="/book"]').first().click();
    await page.waitForLoadState("domcontentloaded");

    // We must be on the booking form for THIS slug — never redirected home.
    await expect(page).toHaveURL(new RegExp(`/site/${slug}/book`));
    const heading = page.getByRole("heading", { level: 1, name: /^Book at /i });
    await expect(
      heading,
      "booking form heading should render (not the disabled fallback)",
    ).toBeVisible();

    // Capture the service that got auto-selected via the first radio.
    // The first service card's <span class="font-semibold"> holds its name.
    const firstServiceLabel = page.locator('label:has(input[name="service"])').first();
    const serviceName = (
      await firstServiceLabel.locator("span.font-semibold").first().innerText()
    ).trim();
    expect(serviceName.length).toBeGreaterThan(0);

    // Pick a time slot (the first available one).
    await page.locator('button:has-text(":")').first().click();

    // Fill customer details. Date defaults to tomorrow so we leave it.
    await page.getByLabel(/^Name/i).fill("Playwright Tester");
    await page.getByLabel(/Mobile number/i).fill("9876543210");

    // Submit.
    await page.getByRole("button", { name: /Create appointment/i }).click();

    // Land on the success page for the same slug with a booking search param.
    await page.waitForURL(new RegExp(`/site/${slug}/booking-success\\?booking=`));
    await expect(
      page.getByRole("heading", { level: 1, name: /Advance payment is pending/i }),
    ).toBeVisible();
    await expect(page.getByText(/Appointment created/i)).toBeVisible();

    // The selected service name should appear in the receipt card.
    await expect(page.getByText(serviceName, { exact: false }).first()).toBeVisible();

    // Booking reference cell should be populated (non-empty text next to the label).
    const reference = page.locator("dd.font-mono").first();
    await expect(reference).toBeVisible();
    const referenceText = (await reference.innerText()).trim();
    expect(referenceText.length, "booking reference must not be empty").toBeGreaterThan(0);
  });
}
