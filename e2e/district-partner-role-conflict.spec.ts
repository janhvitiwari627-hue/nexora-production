import { test as base, expect, type Page } from "@playwright/test";
import { mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Custom fixture: always record a HAR for the test's context, but only KEEP
 * it when the test fails. On pass we delete it so artifacts stay small.
 * Path: test-results/har/<sanitized-title>.har — picked up by the CI
 * `test-results/**` artifact upload.
 */
const HAR_DIR = path.resolve("test-results", "har");

const test = base.extend<{ harPath: string }>({
  harPath: async ({}, use, testInfo) => {
    await mkdir(HAR_DIR, { recursive: true });
    const slug = testInfo.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const file = path.join(HAR_DIR, `${slug}-${testInfo.workerIndex}.har`);
    await use(file);
  },
  context: async ({ browser, harPath }, use, testInfo) => {
    const ctx = await browser.newContext({
      recordHar: { path: harPath, content: "embed" },
    });
    await use(ctx);
    await ctx.close(); // flushes HAR to disk
    if (testInfo.status === testInfo.expectedStatus && existsSync(harPath)) {
      await rm(harPath, { force: true });
    } else if (existsSync(harPath)) {
      await testInfo.attach("network.har", {
        path: harPath,
        contentType: "application/json",
      });
    }
  },
});

/**
 * Verifies the "one email = one role" guard on the District Partner signup
 * flow (/register?role=district_partner).
 *
 * Requires a known email that is ALREADY registered in the project under
 * a role other than `district_partner` (e.g. customer, owner). Set:
 *   SUPABASE_E2E_EXISTING_EMAIL  — the existing email
 *   SUPABASE_E2E_EXISTING_ROLE   — its role label as shown in the UI
 *                                  (e.g. "Customer", "Salon Owner").
 *                                  Defaults to "Customer" if unset.
 *
 * When SUPABASE_E2E_EXISTING_EMAIL is missing the test is skipped so the
 * suite remains green locally without credentials.
 */

test.setTimeout(60_000);

const EXISTING_EMAIL = process.env.SUPABASE_E2E_EXISTING_EMAIL;
const EXISTING_ROLE_LABEL = process.env.SUPABASE_E2E_EXISTING_ROLE ?? "Customer";

async function gotoDistrictPartnerSignup(page: Page) {
  await page.goto("/register?role=district_partner", {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.waitForTimeout(8000);
  await expect(page.getByLabel("Full name")).toBeVisible({ timeout: 60_000 });
  // District Partner tab should be selected via ?role=
  await expect(page.getByRole("tab", { name: /District Partner/i })).toHaveAttribute(
    "data-state",
    "active",
  );
  // District field is DBP-specific.
  await expect(page.getByLabel(/District/i)).toBeVisible();
}

test.describe("/register?role=district_partner — one-email-one-role guard", () => {
  test.skip(!EXISTING_EMAIL, "SUPABASE_E2E_EXISTING_EMAIL not set; skipping role-conflict test.");

  test("blocks signup and shows the friendly role-conflict message when the email is already registered under another role", async ({
    page,
  }) => {
    await gotoDistrictPartnerSignup(page);

    await page.getByLabel("Full name").fill("DBP Conflict Test");
    await page.getByLabel("Email").fill(EXISTING_EMAIL!);
    await page.getByLabel(/Mobile/i).fill("9876543210");
    await page.getByLabel(/^Password$/).fill("StrongP@ss123");
    await page.getByLabel(/Confirm password/i).fill("StrongP@ss123");
    await page.getByLabel(/^District$/i).fill("Test District");

    await page.getByRole("button", { name: /Apply as District Partner|Create account/i }).click();

    const alert = page.getByRole("alert").filter({ hasText: /already registered as/i });
    await expect(alert).toBeVisible({ timeout: 15_000 });

    const text = ((await alert.textContent()) ?? "").trim();
    // Friendly message mentions the EXISTING role and the ATTEMPTED role.
    expect(text).toMatch(new RegExp(`already registered as ${EXISTING_ROLE_LABEL}`, "i"));
    expect(text).toMatch(/District Partner/i);
    // MUST NOT leak raw JSON / `{}`.
    expect(text).not.toBe("{}");
    expect(text).not.toMatch(/^\s*\{[\s\S]*\}\s*$/);

    // Should NOT have navigated away from /register.
    await expect(page).toHaveURL(/\/register(\?|$)/);
  });
});
