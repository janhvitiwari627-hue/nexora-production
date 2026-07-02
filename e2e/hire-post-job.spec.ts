import { test, expect, type Page } from "@playwright/test";

/**
 * Regression coverage for /hire/post-job:
 *  1. Direct navigation to /hire/post-job mounts PostJobPage and shows the
 *     "Job details" step.
 *  2. Clicking "Post a job free" from /hire lands on /hire/post-job with the
 *     same "Job details" step visible.
 *
 * PostJobPage requires an authenticated session, so both tests are skipped
 * when the Lovable browser-use session env vars are not injected.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

async function seedSession(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
    },
    [STORAGE_KEY!, SESSION_JSON!],
  );
}

test.describe("/hire/post-job", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping authenticated post-job checks.",
  );

  test("direct navigation mounts PostJobPage with Job details step", async ({ page }) => {
    await seedSession(page);
    await page.goto("/hire/post-job", { waitUntil: "networkidle" });

    expect(new URL(page.url()).pathname.replace(/\/$/, "")).toBe("/hire/post-job");
    await expect(page.getByRole("heading", { name: "Job details" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("clicking Post a job free from /hire reaches the Job details step", async ({ page }) => {
    await seedSession(page);
    await page.goto("/hire", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: /Post a job free/i }).click();

    await page.waitForURL(/\/hire\/post-job\/?$/, { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "Job details" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Continue from Job details advances to the Location & schedule step", async ({ page }) => {
    // Start with a clean wizard so we don't inherit a persisted draft from
    // a previous run (the wizard remembers step/form in localStorage).
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.localStorage.removeItem("nexora:postJobWizard:v1");
    });

    await seedSession(page);
    await page.goto("/hire/post-job", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: "Job details" })).toBeVisible({
      timeout: 10_000,
    });

    // Fill the two required fields on step 1 so Continue enables.
    await page.getByRole("textbox", { name: "Job title" }).fill("Senior Hair Stylist");
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("Own the chair, deliver amazing cuts, and mentor junior stylists.");

    const continueBtn = page.getByRole("button", { name: /^Continue$/ }).first();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Next step should render its own heading and the progress label update.
    await expect(
      page.getByRole("heading", { name: "Location & schedule" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Step 2 of 5/)).toBeVisible();
  });

  test("Continue from Location & schedule advances to the Salary & benefits step", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.localStorage.removeItem("nexora:postJobWizard:v1");
    });

    await seedSession(page);
    await page.goto("/hire/post-job", { waitUntil: "networkidle" });

    // Step 1: Job details
    await page.getByRole("textbox", { name: "Job title" }).fill("Senior Hair Stylist");
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("Own the chair, deliver amazing cuts, and mentor junior stylists.");
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 2: Location & schedule
    await expect(
      page.getByRole("heading", { name: "Location & schedule" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("textbox", { name: "City" }).fill("Mumbai");

    const continueBtn = page.getByRole("button", { name: /^Continue$/ }).first();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Step 3: Salary & benefits should render.
    await expect(
      page.getByRole("heading", { name: "Salary & benefits" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Step 3 of 5/)).toBeVisible();
  });

  test("Continue from Salary & benefits advances to the Requirements step", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.localStorage.removeItem("nexora:postJobWizard:v1");
    });

    await seedSession(page);
    await page.goto("/hire/post-job", { waitUntil: "networkidle" });

    // Step 1: Job details
    await page.getByRole("textbox", { name: "Job title" }).fill("Senior Hair Stylist");
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("Own the chair, deliver amazing cuts, and mentor junior stylists.");
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 2: Location & schedule
    await expect(
      page.getByRole("heading", { name: "Location & schedule" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("textbox", { name: "City" }).fill("Mumbai");
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 3: Salary & benefits — no required fields, just Continue.
    await expect(
      page.getByRole("heading", { name: "Salary & benefits" }),
    ).toBeVisible({ timeout: 10_000 });

    const continueBtn = page.getByRole("button", { name: /^Continue$/ }).first();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Step 4: Requirements should render.
    await expect(
      page.getByRole("heading", { name: "Requirements" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Step 4 of 5/)).toBeVisible();
  });
});
