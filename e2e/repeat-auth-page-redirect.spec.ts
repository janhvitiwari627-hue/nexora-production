import { test, expect, type Page } from "@playwright/test";

/**
 * Regression: once a signed-in user has been auto-redirected off /login or
 * /signup to their role dashboard, revisiting those auth pages repeatedly
 * (fresh navigations, reloads, back/forward) must keep redirecting them
 * to a role dashboard — never leave them stranded on /login or /signup,
 * and never prompt for credentials again.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

const PENDING_KEY = "nexora:postLoginRedirect";
const AUTH_PAGES = ["/login", "/signup"] as const;

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

async function expectRoleLanding(page: Page, from: string) {
  await page.waitForFunction((p) => !window.location.pathname.startsWith(p), from, {
    timeout: 10_000,
  });
  const landed = new URL(page.url()).pathname;
  expect(landed.startsWith(from)).toBe(false);
  expect(ROLE_TARGETS.some((t) => landed === t || landed.startsWith(t + "/"))).toBe(true);
  expect(await page.locator('input[type="password"]').count()).toBe(0);
  const pending = await page.evaluate((k) => window.sessionStorage.getItem(k), PENDING_KEY);
  expect(pending).toBeNull();
  return landed;
}

test.describe("Repeat visits to /login and /signup keep redirecting to role dashboard", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping repeat-visit redirect test.",
  );

  test("multiple direct visits to /login and /signup always redirect", async ({ page }) => {
    await seedSession(page);

    const landings: string[] = [];

    // Three rounds — enough to catch a stale flag, a cached loader, or a
    // consumed sessionStorage key that would only fail on the second try.
    for (let round = 0; round < 3; round += 1) {
      for (const authPage of AUTH_PAGES) {
        await page.goto(authPage);
        landings.push(await expectRoleLanding(page, authPage));
      }
    }

    // Same landing every time — the app should not oscillate between
    // different role targets across repeat visits.
    const unique = new Set(landings);
    expect(unique.size).toBe(1);
  });

  test("reloading /login while signed in keeps redirecting", async ({ page }) => {
    await seedSession(page);

    await page.goto("/login");
    await expectRoleLanding(page, "/login");

    // Force a hard reload by navigating back to /login and reloading it.
    for (let i = 0; i < 3; i += 1) {
      await page.goto("/login");
      await page.reload();
      await expectRoleLanding(page, "/login");
    }
  });

  test("browser back after redirect does not strand user on /signup", async ({ page }) => {
    await seedSession(page);

    await page.goto("/signup");
    await expectRoleLanding(page, "/signup");

    // Navigate somewhere else, then go back — the /signup entry in history
    // must not restore an auth page for a signed-in user.
    await page.goto("/");
    await page.goBack();
    await expectRoleLanding(page, "/signup");

    // And forward again for good measure.
    await page.goForward();
    // After forward we should be at "/" (or wherever the previous goto took us).
    const pathname = new URL(page.url()).pathname;
    expect(pathname.startsWith("/signup")).toBe(false);
    expect(pathname.startsWith("/login")).toBe(false);
  });
});
