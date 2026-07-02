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
});
