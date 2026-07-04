import { test, expect, type Page } from "@playwright/test";

/**
 * After signing out, the auto-redirect on /login and /signup must NOT
 * fire — those pages should render their forms so the user can sign in
 * again (or as a different account). This guards against a stale
 * client-side session snapshot that would keep bouncing a logged-out
 * user to a role dashboard they no longer have access to.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

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

async function signOutViaHeader(page: Page) {
  // The PublicHeader exposes an account menu when signed in; its Logout
  // menuitem triggers `supabase.auth.signOut()` (see e2e/header-auth.spec.ts).
  const trigger = page.getByRole("button", { name: "Open account menu" });
  await expect(trigger).toBeVisible({ timeout: 10_000 });
  await trigger.click();
  await page.getByRole("menuitem", { name: /Logout/ }).click();

  // Wait for the anonymous state to appear as proof the sign-out landed.
  await expect(
    page.getByRole("link", { name: "Login" }).first(),
  ).toBeVisible({ timeout: 10_000 });
}

test.describe("After logout, /login and /signup render forms (no auto-redirect)", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping logout redirect test.",
  );

  test("visiting /login after logout stays on /login and shows a sign-in form", async ({ page }) => {
    await seedSession(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await signOutViaHeader(page);

    await page.goto("/login");
    // Give the client a beat to run any redirect-if-signed-in guard.
    await page.waitForTimeout(500);

    expect(new URL(page.url()).pathname.startsWith("/login")).toBe(true);
    // A real sign-in form is present.
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test("visiting /signup after logout stays on /signup and shows a sign-up form", async ({ page }) => {
    await seedSession(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await signOutViaHeader(page);

    await page.goto("/signup");
    await page.waitForTimeout(500);

    expect(new URL(page.url()).pathname.startsWith("/signup")).toBe(true);
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test("repeat visits to /login and /signup after logout never redirect to a role dashboard", async ({ page }) => {
    await seedSession(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await signOutViaHeader(page);

    for (const authPage of ["/login", "/signup"] as const) {
      for (let i = 0; i < 3; i += 1) {
        await page.goto(authPage);
        await page.waitForTimeout(400);
        expect(new URL(page.url()).pathname.startsWith(authPage)).toBe(true);
      }
    }
  });
});
