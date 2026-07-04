import { test, expect, type Page } from "@playwright/test";

/**
 * Verify that guarded routes stash the intended path in sessionStorage
 * under `nexora:postLoginRedirect`, and that /login resumes that path
 * once a session exists.
 *
 * The "resume" half needs a real Supabase session, so it auto-skips
 * when the Lovable browser-use session vars are not available.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

const PENDING_KEY = "nexora:postLoginRedirect";

async function seedSession(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
    },
    [STORAGE_KEY!, SESSION_JSON!],
  );
}

test.describe("Login — pending redirect stash (anonymous)", () => {
  for (const target of [
    "/dashboard",
    "/partner/dashboard",
    "/owner/dashboard",
    "/owner/bookings",
    "/owner/analytics",
  ]) {
    test(`hitting ${target} unauthenticated redirects to /login and stashes the path`, async ({ page }) => {
      await page.goto(target);
      await page.waitForURL(/\/login/);
      const pending = await page.evaluate(
        (k) => window.sessionStorage.getItem(k),
        PENDING_KEY,
      );
      expect(pending).toBe(target);
    });
  }
});

test.describe("Login — resume pending redirect (authenticated)", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping authenticated resume test.",
  );

  test("signed-in user landing on /login is redirected to the stashed path", async ({ page }) => {
    await seedSession(page);
    await page.evaluate(
      ([k, v]) => window.sessionStorage.setItem(k as string, v as string),
      [PENDING_KEY, "/dashboard"],
    );

    await page.goto("/login");
    // Login page detects the existing session, calls resolvePostLoginRedirect,
    // and navigates to the stashed path.
    await page.waitForURL(/\/dashboard(\/|$)/, { timeout: 10_000 });
    expect(new URL(page.url()).pathname).toMatch(/^\/dashboard/);

    // Pending key must be consumed exactly once.
    const pending = await page.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(pending).toBeNull();
  });

  test("without a stashed path, signed-in user gets role-based redirect (not /login)", async ({ page }) => {
    await seedSession(page);
    await page.evaluate(
      (k) => window.sessionStorage.removeItem(k),
      PENDING_KEY,
    );

    await page.goto("/login");
    await page.waitForFunction(() => !/\/login$/.test(window.location.pathname), null, {
      timeout: 10_000,
    });
    expect(new URL(page.url()).pathname).not.toMatch(/^\/login$/);
  });
});
