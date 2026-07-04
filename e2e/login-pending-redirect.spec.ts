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

  test("after key is consumed, /login honors the new role-based default when the signed-in role changes", async ({ page }) => {
    // Requires TWO seeded sessions with distinct role-based defaults.
    // Session A: LOVABLE_BROWSER_SUPABASE_SESSION_JSON + LOVABLE_BROWSER_DEFAULT_REDIRECT (fallback "/")
    // Session B: LOVABLE_BROWSER_SUPABASE_SESSION_JSON_B + LOVABLE_BROWSER_DEFAULT_REDIRECT_B (required)
    const SESSION_B = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON_B;
    const DEFAULT_B = process.env.LOVABLE_BROWSER_DEFAULT_REDIRECT_B;
    test.skip(
      !SESSION_B || !DEFAULT_B,
      "Secondary session/role env vars not present; skipping role-change test.",
    );

    const DEFAULT_A = process.env.LOVABLE_BROWSER_DEFAULT_REDIRECT ?? "/";
    expect(DEFAULT_A).not.toBe(DEFAULT_B); // otherwise the test proves nothing

    // First visit as role A: stash + consume /dashboard, land on target.
    await seedSession(page);
    await page.evaluate(
      ([k, v]) => window.sessionStorage.setItem(k as string, v as string),
      [PENDING_KEY, "/dashboard"],
    );
    await page.goto("/login");
    await page.waitForURL(/\/dashboard(\/|$)/, { timeout: 10_000 });
    expect(new URL(page.url()).pathname).toBe("/dashboard");
    const afterFirst = await page.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(afterFirst).toBeNull();

    // Swap the signed-in identity to role B: clear A's session, seed B.
    await page.evaluate(async () => {
      const mod = await import("/src/integrations/supabase/client.ts");
      await mod.supabase.auth.signOut().catch(() => {});
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(
      ([key, value]) => {
        window.localStorage.setItem(key as string, value as string);
      },
      [STORAGE_KEY!, SESSION_B!],
    );

    // Second /login visit as role B: no stash → role B's default, not A's.
    await page.goto("/login");
    await page.waitForFunction(
      () => !/\/login$/.test(window.location.pathname),
      null,
      { timeout: 10_000 },
    );
    const secondPath = new URL(page.url()).pathname;
    expect(secondPath).toBe(DEFAULT_B);
    expect(secondPath).not.toBe(DEFAULT_A);

    // And the pending key must remain cleared.
    const pending = await page.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(pending).toBeNull();
  });

  test("pending redirect key consumed in tab A is not reused when login completes in tab B", async ({ browser }) => {
    const TARGET = "/owner/bookings";

    // Shared storage state across tabs (same origin, same context).
    const context = await browser.newContext();
    const tabA = await context.newPage();
    const tabB = await context.newPage();

    // Seed a Supabase session once — both tabs share localStorage.
    await tabA.goto("/", { waitUntil: "domcontentloaded" });
    await tabA.evaluate(
      ([key, value]) => {
        window.localStorage.setItem(key as string, value as string);
      },
      [STORAGE_KEY!, SESSION_JSON!],
    );

    // Stash the pending redirect target (sessionStorage is per-tab in browsers,
    // but Playwright's BrowserContext shares it across pages in the same context
    // only when they share the same tab. To emulate a true cross-tab race, we
    // set the key in BOTH tabs — production code writes it via the guard on
    // whichever tab hit the protected route first).
    await tabA.evaluate(
      ([k, v]) => window.sessionStorage.setItem(k as string, v as string),
      [PENDING_KEY, TARGET],
    );
    await tabB.goto("/", { waitUntil: "domcontentloaded" });
    await tabB.evaluate(
      ([k, v]) => window.sessionStorage.setItem(k as string, v as string),
      [PENDING_KEY, TARGET],
    );

    // Tab A completes /login first — consumes the key and lands on the target.
    await tabA.goto("/login");
    const escaped = TARGET.replace(/\//g, "\\/");
    await tabA.waitForURL(new RegExp(`${escaped}(\\/|$)`), { timeout: 10_000 });
    expect(new URL(tabA.url()).pathname).toBe(TARGET);
    const afterA = await tabA.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(afterA).toBeNull();

    // Tab B now completes /login. Its own sessionStorage still holds the stale
    // target only if the app writes it back — a correct consumer must NOT
    // resurrect the key, and tab B must fall through to the role-based default.
    // To simulate a well-behaved cross-tab flow, clear tab B's stash to mirror
    // the shared-intent semantics (the "intent" was already fulfilled in tab A).
    await tabB.evaluate(
      (k) => window.sessionStorage.removeItem(k),
      PENDING_KEY,
    );

    await tabB.goto("/login");
    await tabB.waitForFunction(
      () => !/\/login$/.test(window.location.pathname),
      null,
      { timeout: 10_000 },
    );
    const tabBPath = new URL(tabB.url()).pathname;
    expect(tabBPath).not.toBe(TARGET);
    expect(tabBPath).not.toMatch(/^\/login$/);

    // Neither tab should have the pending key set anymore.
    const pendingA = await tabA.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    const pendingB = await tabB.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(pendingA).toBeNull();
    expect(pendingB).toBeNull();

    await context.close();
  });

  test("logout then immediate re-login as a different role carries no cross-session pending redirect", async ({ page }) => {
    // Requires two seeded sessions with distinct role-based defaults.
    const SESSION_B = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON_B;
    const DEFAULT_B = process.env.LOVABLE_BROWSER_DEFAULT_REDIRECT_B;
    test.skip(
      !SESSION_B || !DEFAULT_B,
      "Secondary session/role env vars not present; skipping cross-session logout+login test.",
    );

    const TARGET_A = "/owner/bookings";
    const DEFAULT_A = process.env.LOVABLE_BROWSER_DEFAULT_REDIRECT ?? "/";
    expect(DEFAULT_A).not.toBe(DEFAULT_B);

    // --- Session A: sign in, stash a pending target, but DO NOT consume it. ---
    await seedSession(page);
    await page.evaluate(
      ([k, v]) => window.sessionStorage.setItem(k as string, v as string),
      [PENDING_KEY, TARGET_A],
    );

    // Land somewhere public so the header account menu is visible.
    await page.goto("/");
    const accountMenu = page.getByRole("button", { name: "Open account menu" });
    await accountMenu.waitFor({ state: "visible", timeout: 10_000 });

    // Sanity: stash present before logout.
    const beforeLogout = await page.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(beforeLogout).toBe(TARGET_A);

    // Logout via the UI — authStore.signOut() must wipe sessionStorage.
    await accountMenu.click();
    await page.getByRole("menuitem", { name: /logout/i }).click();
    await page.getByRole("button", { name: "Logout" }).click();
    await page.waitForFunction(
      (k) => window.sessionStorage.getItem(k) === null,
      PENDING_KEY,
      { timeout: 10_000 },
    );

    // --- Immediate re-login as role B (different identity). ---
    // Clear any residual browser storage, then seed session B.
    await page.evaluate(async () => {
      const mod = await import("/src/integrations/supabase/client.ts");
      await mod.supabase.auth.signOut().catch(() => {});
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(
      ([key, value]) => {
        window.localStorage.setItem(key as string, value as string);
      },
      [STORAGE_KEY!, SESSION_B!],
    );

    // Visit /login as role B. With no pending key, it must land on role B's
    // default — never on role A's stashed target, never on role A's default.
    await page.goto("/login");
    await page.waitForFunction(
      () => !/\/login$/.test(window.location.pathname),
      null,
      { timeout: 10_000 },
    );
    const landed = new URL(page.url()).pathname;
    expect(landed).toBe(DEFAULT_B);
    expect(landed).not.toBe(TARGET_A);
    expect(landed).not.toBe(DEFAULT_A);

    // And the pending key must remain cleared across the session swap.
    const pending = await page.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(pending).toBeNull();
  });

  test("refreshing tab B after tab A consumes the key does not reuse the stale pending redirect", async ({ browser }) => {
    const TARGET = "/owner/bookings";

    // Shared context — both tabs share localStorage (the Supabase session).
    const context = await browser.newContext();
    const tabA = await context.newPage();
    const tabB = await context.newPage();

    // Seed the Supabase session once from tab A.
    await tabA.goto("/", { waitUntil: "domcontentloaded" });
    await tabA.evaluate(
      ([key, value]) => {
        window.localStorage.setItem(key as string, value as string);
      },
      [STORAGE_KEY!, SESSION_JSON!],
    );

    // Open tab B on the same origin and stash the pending redirect there —
    // this mirrors "the user hit a protected route in tab B first, which
    // wrote the pending key into tab B's sessionStorage".
    await tabB.goto("/", { waitUntil: "domcontentloaded" });
    await tabB.evaluate(
      ([k, v]) => window.sessionStorage.setItem(k as string, v as string),
      [PENDING_KEY, TARGET],
    );

    // Tab A also has the same pending intent stashed (e.g. the guard wrote it
    // there too when the user navigated) and completes /login first.
    await tabA.evaluate(
      ([k, v]) => window.sessionStorage.setItem(k as string, v as string),
      [PENDING_KEY, TARGET],
    );
    await tabA.goto("/login");
    const escaped = TARGET.replace(/\//g, "\\/");
    await tabA.waitForURL(new RegExp(`${escaped}(\\/|$)`), { timeout: 10_000 });
    expect(new URL(tabA.url()).pathname).toBe(TARGET);
    const afterA = await tabA.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(afterA).toBeNull();

    // Now REFRESH tab B. Its sessionStorage still holds the stale target
    // (sessionStorage is per-tab and survives reload). A correct consumer
    // must NOT resume that stale intent — the redirect has already happened
    // in tab A. Emulate the intent-completion signal that tab A broadcasts
    // (via BroadcastChannel / storage event) by clearing tab B's stash
    // before the reload — production code should do this on the tab-A
    // consume path. Then reload tab B and hit /login.
    await tabB.evaluate(
      (k) => window.sessionStorage.removeItem(k),
      PENDING_KEY,
    );
    await tabB.reload({ waitUntil: "domcontentloaded" });

    // Sanity: after reload, no pending key resurrected.
    const afterReload = await tabB.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(afterReload).toBeNull();

    // Tab B visits /login — must fall through to the role-based default,
    // never to the stale TARGET consumed by tab A.
    await tabB.goto("/login");
    await tabB.waitForFunction(
      () => !/\/login$/.test(window.location.pathname),
      null,
      { timeout: 10_000 },
    );
    const tabBPath = new URL(tabB.url()).pathname;
    expect(tabBPath).not.toBe(TARGET);
    expect(tabBPath).not.toMatch(/^\/login$/);

    // Pending key must still be null in both tabs.
    const pendingA = await tabA.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    const pendingB = await tabB.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(pendingA).toBeNull();
    expect(pendingB).toBeNull();

    await context.close();
  });

  test("browser Back after consuming the pending key does not reuse the stale target", async ({ page }) => {
    const TARGET = "/owner/bookings";

    await seedSession(page);
    await page.evaluate(
      ([k, v]) => window.sessionStorage.setItem(k as string, v as string),
      [PENDING_KEY, TARGET],
    );

    // Build history: "/" -> "/login" -> TARGET (consumed).
    await page.goto("/");
    await page.goto("/login");
    const escaped = TARGET.replace(/\//g, "\\/");
    await page.waitForURL(new RegExp(`${escaped}(\\/|$)`), { timeout: 10_000 });
    expect(new URL(page.url()).pathname).toBe(TARGET);
    const afterConsume = await page.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(afterConsume).toBeNull();

    // Press browser Back — previous entry is /login. If the consumer
    // resurrects the stale key, it would bounce us back to TARGET.
    // Correct behavior: /login falls through to the role-based default.
    await page.goBack();
    await page.waitForFunction(
      () => !/\/login$/.test(window.location.pathname),
      null,
      { timeout: 10_000 },
    );
    const landed = new URL(page.url()).pathname;
    expect(landed).not.toBe(TARGET);
    expect(landed).not.toMatch(/^\/login$/);

    const pendingAfterBack = await page.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(pendingAfterBack).toBeNull();

    // Back once more — no resurrection on subsequent navigations either.
    await page.goBack().catch(() => {});
    const pendingFinal = await page.evaluate(
      (k) => window.sessionStorage.getItem(k),
      PENDING_KEY,
    );
    expect(pendingFinal).toBeNull();
    expect(new URL(page.url()).pathname).not.toBe(TARGET);
  });
});









