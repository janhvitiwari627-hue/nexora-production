import { test, expect, type Page } from "@playwright/test";

/**
 * Confirms /signup and /owner-signup:
 *   1. Never render an empty (whitespace-only) destructive alert.
 *   2. Show friendly inline messages for required-field validation.
 *   3. Show "Passwords do not match" when password & confirm differ.
 *
 * The `/register` page is already covered by register-error.spec.ts; this
 * file extends the same guarantees to the other two signup entry points.
 */

test.setTimeout(60_000);

async function gotoForm(page: Page, path: string, anchorLabel: RegExp = /Full name|Owner full name/) {
  await page.goto(path, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForTimeout(8000);
  await expect(page.getByLabel(anchorLabel).first()).toBeVisible({ timeout: 60_000 });
}

// The destructive alert is the only element rendered with `role="alert"`
// that lives ABOVE the form. The shadcn <Alert> wraps an info banner with
// `role="alert"` as well (referral code, password reset confirmations),
// so we narrow by `variant="destructive"` via class selector.
const destructiveAlertSelector = '[role="alert"].border-destructive\\/50, [role="alert"].text-destructive, [role="alert"][class*="destructive"]';

async function expectNoEmptyDestructiveAlert(page: Page) {
  const alerts = page.locator(destructiveAlertSelector);
  const count = await alerts.count();
  for (let i = 0; i < count; i++) {
    const text = ((await alerts.nth(i).textContent()) ?? "").trim();
    expect(text.length, `destructive alert #${i} rendered with empty text`).toBeGreaterThan(0);
  }
}

test.describe("/signup — empty alert + friendly validation", () => {
  test("submitting an empty form shows inline errors, no empty alert box", async ({ page }) => {
    await gotoForm(page, "/signup", /Full name/);
    await page.getByRole("button", { name: "Create account" }).click();

    // URL unchanged, no destructive alert rendered at all.
    await expect(page).toHaveURL(/\/signup$/);
    await expect(page.locator(destructiveAlertSelector)).toHaveCount(0);

    // Friendly inline messages from the zod schema.
    await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();
    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(page.getByText("Mobile number is required")).toBeVisible();
    await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
  });

  test("mismatched passwords shows 'Passwords do not match', no empty alert", async ({ page }) => {
    await gotoForm(page, "/signup", /Full name/);
    await page.getByLabel("Full name").fill("Mismatch User");
    await page.getByLabel("Email").fill(`mismatch-${Date.now()}@example.com`);
    await page.getByLabel("Phone").fill("9876543210");
    await page.getByLabel("Password", { exact: true }).fill("StrongP@ss123");
    await page.getByLabel("Confirm password").fill("DifferentP@ss123");

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expectNoEmptyDestructiveAlert(page);
    await expect(page).toHaveURL(/\/signup$/);
  });
});

test.describe("/owner-signup — empty alert + friendly validation", () => {
  test("submitting an empty form shows inline errors, no empty alert box", async ({ page }) => {
    await gotoForm(page, "/owner-signup", /Owner full name/);
    await page.getByRole("button", { name: /Create owner account|Create account/ }).click();

    await expect(page).toHaveURL(/\/owner-signup$/);
    await expect(page.locator(destructiveAlertSelector)).toHaveCount(0);

    await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();
    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(page.getByText("Mobile number is required")).toBeVisible();
    await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
    await expect(page.getByText("Business name is required")).toBeVisible();
  });

  test("mismatched passwords shows 'Passwords do not match', no empty alert", async ({ page }) => {
    await gotoForm(page, "/owner-signup", /Owner full name/);
    await page.getByLabel("Owner full name").fill("Mismatch Owner");
    await page.getByLabel("Email").fill(`mismatch-owner-${Date.now()}@example.com`);
    await page.getByLabel("Phone").fill("9876543210");
    await page.getByLabel("Password", { exact: true }).fill("StrongP@ss123");
    await page.getByLabel("Confirm password").fill("DifferentP@ss123");
    await page.getByLabel("Business name").fill("Acme Salon");

    await page.getByRole("button", { name: /Create owner account|Create account/ }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expectNoEmptyDestructiveAlert(page);
    await expect(page).toHaveURL(/\/owner-signup$/);
  });
});

test.describe("/register — empty-alert regression guard for mismatched passwords", () => {
  test("mismatched passwords on customer tab shows friendly error, no empty alert", async ({ page }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForTimeout(8000);
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 60_000 });

    await page.getByLabel("Full name").fill("Mismatch Reg");
    await page.getByLabel("Email").fill(`mismatch-reg-${Date.now()}@example.com`);
    await page.getByLabel("Mobile").fill("9876543210");
    await page.getByLabel("Password", { exact: true }).fill("StrongP@ss123");
    await page.getByLabel("Confirm password").fill("DifferentP@ss123");

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expectNoEmptyDestructiveAlert(page);
    await expect(page).toHaveURL(/\/register$/);
  });
});
