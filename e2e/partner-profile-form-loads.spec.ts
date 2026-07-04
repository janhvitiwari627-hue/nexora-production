import { test, expect, type Page } from "@playwright/test";

/**
 * A signed-in partner opens /partner/profile and lands on
 * /dashboard/settings (the shared profile-edit surface). This test
 * verifies the account-settings UI actually loads — the sidebar
 * appears and the default Personal Info panel renders its form fields.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

async function seedPartnerSession(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
      window.sessionStorage.removeItem("nexora:postLoginRedirect");
    },
    [STORAGE_KEY!, SESSION_JSON!],
  );
}

async function isPartnerSession(page: Page): Promise<boolean> {
  return await page.evaluate(async () => {
    const mod = await import("/src/integrations/supabase/client.ts").catch(
      () => null as unknown as { supabase: unknown } | null,
    );
    const supabase = (mod as { supabase: {
      auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
      from: (t: string) => {
        select: (c: string) => {
          eq: (col: string, val: string) => Promise<{ data: Array<{ role: string }> | null }>;
        };
      };
    } } | null)?.supabase;
    if (!supabase) return false;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return false;
    const res = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const roles = (res.data ?? []).map((r) => r.role);
    return roles.includes("growth_partner") || roles.includes("district_partner");
  });
}

test.describe("Partner reaches profile-edit form via /partner/profile", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping partner profile-form test.",
  );

  test.beforeEach(async ({ page }) => {
    await seedPartnerSession(page);
    const partner = await isPartnerSession(page);
    test.skip(
      !partner,
      "Injected Supabase session is not a partner; skipping partner-scoped form test.",
    );
  });

  test("/partner/profile forwards to /dashboard/settings and the edit form loads", async ({ page }) => {
    await page.goto("/partner/profile");

    // Land on the shared edit surface.
    await page.waitForFunction(
      () => window.location.pathname === "/dashboard/settings",
      undefined,
      { timeout: 10_000 },
    );
    expect(new URL(page.url()).pathname).toBe("/dashboard/settings");

    // Sidebar sections from AccountSettingsPage — at least these must render.
    await expect(page.getByText(/Personal info/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Contact info/i).first()).toBeVisible();
    await expect(page.getByText(/Security/i).first()).toBeVisible();
    await expect(page.getByText(/Notifications/i).first()).toBeVisible();

    // Default panel is Personal Info — assert its form fields are present.
    // Placeholders come from src/pages/customer/settings/PersonalInfoPanel.tsx.
    await expect(page.getByPlaceholder(/6-digit pincode/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByPlaceholder(/auto-suggested from name/i)).toBeVisible();

    // The page must contain interactive form fields (inputs/comboboxes).
    const inputCount = await page.locator("input").count();
    expect(inputCount).toBeGreaterThan(0);

    // Not stuck on a loading skeleton or an error boundary.
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0);

    // Session did not lapse mid-flight.
    expect(await page.locator('input[type="password"]').count()).toBe(0);
  });
});
