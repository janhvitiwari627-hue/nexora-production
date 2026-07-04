import { test, expect, type Page } from "@playwright/test";

/**
 * A signed-in partner (growth_partner / district_partner) must be able
 * to open /partner/profile directly and reach the profile-edit surface.
 *
 * Note: `/partner/profile` intentionally forwards authorized users to
 * `/dashboard/settings` (the shared profile-edit page). This test
 * verifies that forward happens WITHOUT the `requireRole` guard
 * bouncing the partner to /login or another role's dashboard.
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

test.describe("Partner can open /partner/profile", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping partner profile access test.",
  );

  test.beforeEach(async ({ page }) => {
    await seedPartnerSession(page);
    const partner = await isPartnerSession(page);
    test.skip(
      !partner,
      "Injected Supabase session is not a partner; skipping partner-scoped access test.",
    );
  });

  test("direct navigation to /partner/profile reaches the profile-edit surface", async ({ page }) => {
    await page.goto("/partner/profile");

    // The route forwards authorized partners to /dashboard/settings.
    await page.waitForFunction(
      () => window.location.pathname === "/dashboard/settings",
      undefined,
      { timeout: 10_000 },
    );

    const landed = new URL(page.url()).pathname;
    expect(landed).toBe("/dashboard/settings");

    // Guard did NOT bounce to /login or a different role dashboard.
    expect(landed.startsWith("/login")).toBe(false);
    expect(landed.startsWith("/admin/")).toBe(false);
    expect(landed.startsWith("/owner/")).toBe(false);

    // No sign-in prompt appeared — the partner stayed authenticated.
    expect(await page.locator('input[type="password"]').count()).toBe(0);
  });
});
