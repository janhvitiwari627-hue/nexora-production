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

  for (const target of ["/dashboard", "/owner/dashboard", "/owner/bookings"]) {
    test(`signed-in user landing on /login resumes stashed path ${target}`, async ({ page }) => {
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
    });
  }

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

  for (const target of ["/dashboard", "/owner/bookings", "/partner/dashboard"]) {
    test(`pending redirect key for ${target} is consumed exactly once and not reused on next /login`, async ({ page }) => {
      await seedSession(page);
      await page.evaluate(
        ([k, v]) => window.sessionStorage.setItem(k as string, v as string),
        [PENDING_KEY, target],
      );

      // First /login visit: consumes the stash and lands on the target.
      const escaped = target.replace(/\//g, "\\/");
      await page.goto("/login");
      await page.waitForURL(new RegExp(`${escaped}(\\/|$)`), { timeout: 10_000 });
      expect(new URL(page.url()).pathname).toBe(target);
      const afterFirst = await page.evaluate(
        (k) => window.sessionStorage.getItem(k),
        PENDING_KEY,
      );
      expect(afterFirst).toBeNull();

      // Second /login visit: no stash present → role-based default, NOT the previous target.
      await page.goto("/login");
      await page.waitForFunction(
        () => !/\/login$/.test(window.location.pathname),
        null,
        { timeout: 10_000 },
      );
      const secondPath = new URL(page.url()).pathname;
      expect(secondPath).not.toBe(target);
      expect(secondPath).not.toMatch(/^\/login$/);

      // For /dashboard specifically, assert we land on the exact role-based
      // default from resolvePostLoginRedirect — configurable per test env so
      // it matches the seeded user's role (e.g. "/" for customer,
      // "/owner/dashboard" for owner, "/partner/dashboard" for partner,
      // "/admin/dashboard" for admin). Defaults to "/" (customer fallback).
      if (target === "/dashboard") {
        const expectedDefault =
          process.env.LOVABLE_BROWSER_DEFAULT_REDIRECT ?? "/";
        expect(secondPath).toBe(expectedDefault);
      }


      // Key remains cleared — no ghost value written back by the resume flow.
      const afterSecond = await page.evaluate(
        (k) => window.sessionStorage.getItem(k),
        PENDING_KEY,
      );
      expect(afterSecond).toBeNull();
    });

  test("logout before completing redirect flow clears the pending redirect key", async ({ page }) => {
    await seedSession(page);
    await page.evaluate(
      ([k, v]) => window.sessionStorage.setItem(k as string, v as string),
      [PENDING_KEY, "/owner/bookings"],
    );

    // Land on a public page whose header shows the account menu when signed in.
    await page.goto("/");
    const accountMenu = page.getByRole("button", { name: "Open account menu" });
    await accountMenu.waitFor({ state: "visible", timeout: 10_000 });

    // Sanity: the pending key is still stashed at this point.
    const beforeLogout = await page.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(beforeLogout).toBe("/owner/bookings");

    // Open account menu → Logout → confirm.
    await accountMenu.click();
    await page.getByRole("menuitem", { name: /logout/i }).click();
    await page.getByRole("button", { name: "Logout" }).click();

    // authStore.signOut() must clear sessionStorage so the stale target
    // cannot resurrect on the next sign-in.
    await page.waitForFunction(
      (k) => window.sessionStorage.getItem(k) === null,
      PENDING_KEY,
      { timeout: 10_000 },
    );
    const afterLogout = await page.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(afterLogout).toBeNull();
  });

  test("logout during the post-login redirect window does not land on the stashed target", async ({ page }) => {
    const TARGET = "/owner/bookings";

    // Stall the target route request so the redirect consumer's navigation
    // stays "in flight" long enough for us to trigger signOut in the middle.
    await page.route("**/owner/bookings*", async (route) => {
      await new Promise((r) => setTimeout(r, 2500));
      await route.continue();
    });

    await seedSession(page);
    await page.evaluate(
      ([k, v]) => window.sessionStorage.setItem(k as string, v as string),
      [PENDING_KEY, TARGET],
    );

    // Kick off the login-side redirect consumer.
    const navPromise = page.goto("/login").catch(() => null);

    // Race: as soon as the pending key has been consumed (redirect started),
    // sign the user out before the target actually finishes loading.
    await page.waitForFunction(
      (k) => window.sessionStorage.getItem(k) === null,
      PENDING_KEY,
      { timeout: 10_000 },
    );
    await page.evaluate(async () => {
      // Mirror authStore.signOut(): clear supabase session + wipe sessionStorage.
      const mod = await import("/src/integrations/supabase/client.ts");
      await mod.supabase.auth.signOut().catch(() => {});
      window.sessionStorage.clear();
    });

    await navPromise;

    // The auth-state-change listener redirects signed-out users away from
    // protected routes. Final URL must NOT be the stashed target.
    await page.waitForFunction(
      (t) => !window.location.pathname.startsWith(t),
      TARGET,
      { timeout: 10_000 },
    );
    const finalPath = new URL(page.url()).pathname;
    expect(finalPath.startsWith(TARGET)).toBe(false);

    // And the pending key must stay cleared — no ghost value to resurrect.
    const pending = await page.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(pending).toBeNull();
  });
});




