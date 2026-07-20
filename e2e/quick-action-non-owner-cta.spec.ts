import { test, expect, type Page } from "@playwright/test";

/**
 * Verify the "Become an owner" flow on the Owner Dashboard quick actions
 * for signed-in users who do NOT yet have the "owner" role, and confirm
 * that once the owner role is granted (role-complete), the same action
 * navigates to the correct owner route.
 *
 * The `/owner/dashboard` layout requires role `owner` OR `admin`, so a
 * signed-in-but-not-owner tester must be an admin (or another allowed
 * non-owner role) to reach the dashboard and see QuickActionsRow. Provide
 * that session via `LOVABLE_BROWSER_SUPABASE_SESSION_JSON_NON_OWNER`.
 * The whole suite skips when it's absent.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON_NON_OWNER = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON_NON_OWNER;
const PENDING_KEY = "nexora:postLoginRedirect";

const QUICK_ACTIONS: { label: string; target: string }[] = [
  { label: "Add Service", target: "/owner/services" },
  { label: "Add Staff", target: "/owner/staff" },
  { label: "Create Offer", target: "/owner/marketing" },
  { label: "Generate QR", target: "/owner/website" },
  { label: "View Analytics", target: "/owner/analytics" },
];

async function seedNonOwnerSession(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
      window.sessionStorage.removeItem("nexora:postLoginRedirect");
    },
    [STORAGE_KEY!, SESSION_JSON_NON_OWNER!],
  );
}

/** Force the auth store into a signed-in non-owner state without touching Supabase. */
async function forceNonOwnerAuthState(page: Page) {
  await page.evaluate(async () => {
    const mod = await import("/src/stores/authStore.ts");
    mod.useAuthStore.setState({
      // Preserve whatever session/user hydration produced, but strip owner role.
      roles: (mod.useAuthStore.getState().roles ?? []).filter(
        (r: string) => r !== "owner" && r !== "shop_owner" && r !== "shop_manager",
      ),
      isInitialized: true,
    });
  });
}

async function forceOwnerAuthState(page: Page) {
  await page.evaluate(async () => {
    const mod = await import("/src/stores/authStore.ts");
    const cur = mod.useAuthStore.getState();
    const roles = Array.from(new Set([...(cur.roles ?? []), "owner"]));
    mod.useAuthStore.setState({ roles, role: roles[0], isInitialized: true });
  });
}

async function gotoDashboard(page: Page) {
  await page.goto("/owner/dashboard");
  // Wait for the QuickActionsRow to render — "Add Service" button is a stable landmark.
  await page.getByRole("button", { name: "Add Service" }).waitFor({
    state: "visible",
    timeout: 15_000,
  });
}

test.describe("Owner quick actions — non-owner CTA + role-complete resume", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON_NON_OWNER,
    "Non-owner Supabase session env var not present; skipping non-owner CTA suite.",
  );

  for (const action of QUICK_ACTIONS) {
    test(`${action.label}: non-owner sees Become an owner CTA, then resumes to ${action.target} after role granted`, async ({
      page,
    }) => {
      await seedNonOwnerSession(page);
      await gotoDashboard(page);
      await forceNonOwnerAuthState(page);

      // 1. Click the quick action — non-owner branch fires.
      await page.getByRole("button", { name: action.label }).click();

      // 2. Toast should surface with the "Become an owner" action button.
      const toast = page.locator("[data-sonner-toast]", {
        hasText: /owner access required/i,
      });
      await expect(toast).toBeVisible({ timeout: 5_000 });
      const cta = toast.getByRole("button", { name: /become an owner/i });
      await expect(cta).toBeVisible();

      // 3. Clicking the CTA navigates to /owner-signup.
      await cta.click();
      await page.waitForURL(/\/owner-signup(\/|$|\?)/, { timeout: 10_000 });
      expect(new URL(page.url()).pathname).toBe("/owner-signup");

      // 4. Simulate role-complete: user finishes owner signup, gains the owner
      //    role, and returns to the dashboard. We fake role hydration via the
      //    auth store so the test does not need to mutate the database.
      await gotoDashboard(page);
      await forceOwnerAuthState(page);

      // 5. Clicking the same action now navigates to the target owner route
      //    (no CTA toast, no login prompt).
      await page.getByRole("button", { name: action.label }).click();
      const escaped = action.target.replace(/\//g, "\\/");
      await page.waitForURL(new RegExp(`${escaped}(\\/|$|\\?)`), {
        timeout: 10_000,
      });
      expect(new URL(page.url()).pathname.startsWith(action.target)).toBe(true);

      // 6. The non-owner branch never stashes a post-login redirect — the user
      //    was already signed in, only the role was missing.
      const pending = await page.evaluate((k) => window.sessionStorage.getItem(k), PENDING_KEY);
      expect(pending).toBeNull();
    });
  }

  test("Become an owner CTA does not fire when the user already has the owner role", async ({
    page,
  }) => {
    await seedNonOwnerSession(page);
    await gotoDashboard(page);
    await forceOwnerAuthState(page);

    await page.getByRole("button", { name: "Add Service" }).click();
    await page.waitForURL(/\/owner\/services(\/|$|\?)/, { timeout: 10_000 });

    // No "Owner access required" toast should have appeared.
    const denialToast = page.locator("[data-sonner-toast]", {
      hasText: /owner access required/i,
    });
    await expect(denialToast).toHaveCount(0);
  });
});
