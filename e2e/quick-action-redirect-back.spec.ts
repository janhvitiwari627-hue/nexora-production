import { test, expect, type Page } from "@playwright/test";

/**
 * Verify login redirect-back for the 5 owner dashboard quick actions:
 *   /owner/services, /owner/staff, /owner/marketing,
 *   /owner/website, /owner/analytics
 *
 * Anonymous half (always runs): hitting a target while signed out must
 * stash the intended path in sessionStorage[nexora:postLoginRedirect]
 * and land on the login flow.
 *
 * Authenticated half (needs Lovable browser-use Supabase session):
 * with a stashed target, visiting /login must consume the key and
 * navigate back to the exact target path.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;
const PENDING_KEY = "nexora:postLoginRedirect";

const QUICK_ACTION_TARGETS = [
  "/owner/services",
  "/owner/staff",
  "/owner/marketing",
  "/owner/website",
  "/owner/analytics",
] as const;

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

test.describe("Quick actions — anonymous visit stashes redirect target", () => {
  for (const target of QUICK_ACTION_TARGETS) {
    test(`unauthenticated ${target} stashes path and reaches /login flow`, async ({ page }) => {
      await page.goto(target);
      // The owner layout may route through /auth-notice → /login; wait
      // for either the login page or the notice interstitial, then the
      // final /login.
      await page.waitForURL(/\/(login|auth-notice)/, { timeout: 10_000 });
      await page.waitForURL(/\/login/, { timeout: 10_000 }).catch(() => null);
      const pending = await page.evaluate(
        (k) => window.sessionStorage.getItem(k),
        PENDING_KEY,
      );
      expect(pending).toBe(target);
      // No dashboard content leaked before redirect.
      expect(new URL(page.url()).pathname.startsWith("/owner/")).toBe(false);
    });
  }
});

test.describe("Quick actions — signed-in login flow resumes stashed target", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping authenticated resume test.",
  );

  for (const target of QUICK_ACTION_TARGETS) {
    test(`/login with stashed ${target} resumes to ${target}`, async ({ page }) => {
      await seedSession(page);
      await page.evaluate(
        ([k, v]) => window.sessionStorage.setItem(k as string, v as string),
        [PENDING_KEY, target],
      );

      await page.goto("/login");
      const escaped = target.replace(/\//g, "\\/");
      await page.waitForURL(new RegExp(`${escaped}(\\/|$)`), { timeout: 10_000 });
      expect(new URL(page.url()).pathname).toBe(target);

      // Pending key must be consumed exactly once.
      const pending = await page.evaluate(
        (k) => window.sessionStorage.getItem(k),
        PENDING_KEY,
      );
      expect(pending).toBeNull();

      // No login form is visible — user was not prompted again.
      expect(await page.locator('input[type="password"]').count()).toBe(0);
    });
  }
});
