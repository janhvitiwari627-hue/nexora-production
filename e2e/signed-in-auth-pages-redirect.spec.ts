import { test, expect, type Page } from "@playwright/test";

/**
 * Verify that a user who is already signed up / signed in does NOT have to
 * re-sign-up or re-sign-in: visiting any auth page (/login, /signup,
 * /register, /admin/login) should redirect straight to their role-based
 * dashboard via `resolvePostLoginRedirect`.
 *
 * Uses the Lovable browser-use managed Supabase session when available;
 * skips otherwise.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

const PENDING_KEY = "nexora:postLoginRedirect";

const AUTH_PAGES = ["/login", "/signup", "/register", "/admin/login"] as const;

// Known role-based landing targets from src/lib/auth-redirect.ts
const ROLE_TARGETS = [
  "/",
  "/admin/dashboard",
  "/owner/dashboard",
  "/owner/templates",
  "/owner/register-business",
  "/partner/dashboard",
  "/portal/brands",
  "/dashboard",
];

async function seedSession(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
      window.sessionStorage.removeItem("nexora:postLoginRedirect");
    },
    [STORAGE_KEY!, SESSION_JSON!],
  );
}

test.describe("Signed-in users skip auth pages", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping signed-in redirect test.",
  );

  for (const authPage of AUTH_PAGES) {
    test(`visiting ${authPage} while signed in redirects to role dashboard`, async ({ page }) => {
      await seedSession(page);

      await page.goto(authPage);

      // Wait until we're no longer on the auth page.
      await page.waitForFunction(
        (p) => !window.location.pathname.startsWith(p),
        authPage,
        { timeout: 10_000 },
      );

      const landed = new URL(page.url()).pathname;
      expect(landed.startsWith(authPage)).toBe(false);
      expect(
        ROLE_TARGETS.some((t) => landed === t || landed.startsWith(t + "/")),
      ).toBe(true);

      // No auth form should be visible — user was not asked to sign in again.
      const passwordFields = await page
        .locator('input[type="password"]')
        .count();
      expect(passwordFields).toBe(0);

      // Pending redirect key must not linger.
      const pending = await page.evaluate(
        (k) => window.sessionStorage.getItem(k),
        PENDING_KEY,
      );
      expect(pending).toBeNull();
    });
  }

  test("landing on role dashboard does not bounce back to /login", async ({ page }) => {
    await seedSession(page);
    await page.goto("/login");
    await page.waitForFunction(
      () => !window.location.pathname.startsWith("/login"),
      undefined,
      { timeout: 10_000 },
    );
    // Give the app a moment; ensure no async redirect throws user back to auth.
    await page.waitForTimeout(500);
    expect(new URL(page.url()).pathname.startsWith("/login")).toBe(false);
    expect(new URL(page.url()).pathname.startsWith("/signup")).toBe(false);
  });
});
