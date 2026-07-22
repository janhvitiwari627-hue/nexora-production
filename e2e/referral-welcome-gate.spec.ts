import { expect, test } from "@playwright/test";

test("guest opening the customer app never sees the referral welcome popup", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/customer-app?referral-gate-test=1");
  await page.waitForTimeout(1_400);

  await expect(page.getByRole("heading", { name: /^welcome,/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /share welcome & benefits/i })).toHaveCount(0);

  await context.close();
});

test("referral signup page publishes the Nexora logo for link previews", async ({ request }) => {
  const response = await request.get("/signup?ref=NXTEST123");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("https://www.meripahalfasthelp.online/nexora-final-logo.jpg");
  expect(html).toContain("Welcome to Nexora Salons");
});
