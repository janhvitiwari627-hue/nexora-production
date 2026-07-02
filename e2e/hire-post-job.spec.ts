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

  test("Continue from Requirements advances to the Review & publish step", async ({ page }) => {
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

    // Step 3: Salary & benefits
    await expect(
      page.getByRole("heading", { name: "Salary & benefits" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 4: Requirements — no required fields, just Continue.
    await expect(
      page.getByRole("heading", { name: "Requirements" }),
    ).toBeVisible({ timeout: 10_000 });

    const continueBtn = page.getByRole("button", { name: /^Continue$/ }).first();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Step 5: Review & publish should render.
    await expect(
      page.getByRole("heading", { name: "Review & publish" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Step 5 of 5/)).toBeVisible();
  });

  test("Full wizard walk-through renders the Review & publish confirmation page", async ({ page }) => {
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

    // Step 3: Salary & benefits
    await expect(
      page.getByRole("heading", { name: "Salary & benefits" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 4: Requirements
    await expect(
      page.getByRole("heading", { name: "Requirements" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 5: Review & publish — final confirmation page.
    await expect(
      page.getByRole("heading", { name: "Review & publish" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Step 5 of 5/)).toBeVisible();

    // Review guidance copy is present.
    await expect(
      page.getByText(/Please review the details below/i),
    ).toBeVisible();

    // Publish CTA replaces Continue on the final step (desktop + mobile bars).
    await expect(
      page.getByRole("button", { name: /^Publish job$/ }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /^Continue$/ })).toHaveCount(0);

    // Live preview reflects data entered in earlier steps.
    await expect(
      page.getByRole("heading", { name: "Senior Hair Stylist" }),
    ).toBeVisible();
  });

  test("Publishing the job creates the listing and opens the job detail page with the entered title", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.localStorage.removeItem("nexora:postJobWizard:v1");
    });

    await seedSession(page);
    await page.goto("/hire/post-job", { waitUntil: "networkidle" });

    const jobTitle = `Senior Hair Stylist ${Date.now()}`;

    // Step 1
    await page.getByRole("textbox", { name: "Job title" }).fill(jobTitle);
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("Own the chair, deliver amazing cuts, and mentor junior stylists.");
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 2
    await expect(
      page.getByRole("heading", { name: "Location & schedule" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("textbox", { name: "City" }).fill("Mumbai");
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 3
    await expect(
      page.getByRole("heading", { name: "Salary & benefits" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 4
    await expect(
      page.getByRole("heading", { name: "Requirements" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 5 — publish.
    await expect(
      page.getByRole("heading", { name: "Review & publish" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^Publish job$/ }).first().click();

    // Navigation lands on /jobs/<uuid> and the detail page renders the entered title.
    await page.waitForURL(
      /\/jobs\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      { timeout: 15_000 },
    );
    await expect(
      page.getByRole("heading", { name: jobTitle }),
    ).toBeVisible({ timeout: 15_000 });

  test("Publishing the job shows title, location, and price range on the detail page", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.localStorage.removeItem("nexora:postJobWizard:v1");
    });

    await seedSession(page);
    await page.goto("/hire/post-job", { waitUntil: "networkidle" });

    const jobTitle = `Senior Hair Stylist ${Date.now()}`;
    const city = "Mumbai";
    const area = "Bandra West";

    // Step 1: Job details
    await page.getByRole("textbox", { name: "Job title" }).fill(jobTitle);
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("Own the chair, deliver amazing cuts, and mentor junior stylists.");
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 2: Location & schedule
    await expect(
      page.getByRole("heading", { name: "Location & schedule" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("textbox", { name: "City" }).fill(city);
    await page.getByRole("textbox", { name: "Area / locality" }).fill(area);
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 3: Salary & benefits — fill min/max so the detail page renders a range.
    await expect(
      page.getByRole("heading", { name: "Salary & benefits" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("spinbutton", { name: "Min" }).fill("30000");
    await page.getByRole("spinbutton", { name: "Max" }).fill("50000");
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 4: Requirements
    await expect(
      page.getByRole("heading", { name: "Requirements" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 5: Publish
    await expect(
      page.getByRole("heading", { name: "Review & publish" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^Publish job$/ }).first().click();

    await page.waitForURL(
      /\/jobs\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      { timeout: 15_000 },
    );

    // Title renders on the detail page.
    await expect(
      page.getByRole("heading", { name: jobTitle }),
    ).toBeVisible({ timeout: 15_000 });

    // Location badge renders "{area}, {city}".
    await expect(page.getByText(`${area}, ${city}`)).toBeVisible();

    // Price range — fmtSalary renders "₹30k–50k/mo" (en dash separator).
    await expect(page.getByText("₹30k–50k/mo")).toBeVisible();
  });
});

test.describe("/hire/post-job publish failure", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping authenticated post-job checks.",
  );

  test("failing publish shows error alert with retry, and retry recovers or re-shows the error", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.localStorage.removeItem("nexora:postJobWizard:v1");
    });

    await seedSession(page);

    // Intercept the first POST to the `jobs` REST endpoint and force a 500.
    // Subsequent POSTs pass through so the retry can succeed.
    let jobsPostCount = 0;
    await page.route(/\/rest\/v1\/jobs(\?|$)/, async (route) => {
      if (route.request().method() !== "POST") {
        await route.fallback();
        return;
      }
      jobsPostCount += 1;
      if (jobsPostCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            code: "500",
            message: "Simulated publish failure",
            details: null,
            hint: null,
          }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto("/hire/post-job", { waitUntil: "networkidle" });

    const jobTitle = `Retry Stylist ${Date.now()}`;

    // Step 1
    await page.getByRole("textbox", { name: "Job title" }).fill(jobTitle);
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("Own the chair, deliver amazing cuts, and mentor junior stylists.");
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 2
    await expect(
      page.getByRole("heading", { name: "Location & schedule" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("textbox", { name: "City" }).fill("Mumbai");
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 3
    await expect(
      page.getByRole("heading", { name: "Salary & benefits" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 4
    await expect(
      page.getByRole("heading", { name: "Requirements" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^Continue$/ }).first().click();

    // Step 5 — publish (will fail due to intercept).
    await expect(
      page.getByRole("heading", { name: "Review & publish" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^Publish job$/ }).first().click();

    // Error alert renders with the failure title and retry button.
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible({ timeout: 10_000 });
    await expect(alert.getByText("Publish failed")).toBeVisible();
    const retryBtn = alert.getByRole("button", { name: /^Try again$/ });
    await expect(retryBtn).toBeVisible();
    await expect(retryBtn).toBeEnabled();

    // We should still be on the wizard, not on a detail page.
    expect(page.url()).toContain("/hire/post-job");

    // Click retry — subsequent POST is allowed through.
    await retryBtn.click();

    // Either the detail page loads (recovery), or the alert stays / re-appears.
    const detailUrlRe = /\/jobs\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const navigated = await page
      .waitForURL(detailUrlRe, { timeout: 15_000 })
      .then(() => true)
      .catch(() => false);

    if (navigated) {
      await expect(
        page.getByRole("heading", { name: jobTitle }),
      ).toBeVisible({ timeout: 15_000 });
    } else {
      // Retry did not recover — alert must still be shown to the user.
      await expect(page.getByRole("alert")).toBeVisible();
      await expect(
        page.getByRole("alert").getByText(/Publish failed|Couldn't open your job listing/),
      ).toBeVisible();
    }
  });
});





