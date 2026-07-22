import { expect, test } from "@playwright/test";

const REGISTERED_EMAIL = process.env.SUPABASE_E2E_EMAIL;

test.describe("signup existing-email early warning", () => {
  test.skip(
    !REGISTERED_EMAIL,
    "SUPABASE_E2E_EMAIL is required for the live registered-account check.",
  );

  test("shows the account popup before the user completes the form", async ({ page }) => {
    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    // The PWA release guard can add its cache-busting query once on first load.
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1_000);
    await page.getByLabel("Email").fill(REGISTERED_EMAIL!);

    const dialog = page.getByRole("dialog", {
      name: "This email already has an account",
    });
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(dialog.getByRole("link", { name: "Go to login" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Forgot password" })).toBeVisible();

    await dialog.getByRole("link", { name: "Go to login" }).click();
    await expect(page).toHaveURL(/\/login\?email=/);
    await expect(page.getByLabel("Email", { exact: true })).toHaveValue(REGISTERED_EMAIL!);
  });
});
