import { test, expect, type Page } from "@playwright/test";

/**
 * A signed-in partner (growth_partner / district_partner) must NOT be
 * able to open the owner or admin profile-edit routes by typing the URL
 * directly. `requireRole` in `src/lib/route-guards.ts` should redirect
 * them away before the `/dashboard/settings` redirect runs.
 *
 * Requires a partner-scoped Supabase session. When the injected session
 * belongs to a different role (or env vars are missing), the test skips
 * so the suite stays green in sandboxes signed in as another user.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

const FORBIDDEN_ROUTES = ["/owner/profile", "/admin/profile"] as const;

// Where `requireRole` may legitimately send a partner: `/login` when the
// guard rejects, or a partner-appropriate landing.
const ALLOWED_LANDINGS = [
  "/login",
  "/partner/dashboard",
  "/",
];

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
  // Ask the app's Supabase client for the current user's roles. This
  // routes through the same client the route guard uses, so if the guard
  // will treat the user as a partner, so will this check.
  return await page.evaluate(async () => {
    // Access the module the app already loaded to avoid a second client.
    const mod = await import("/src/integrations/supabase/client.ts").catch(
      () => null as unknown as { supabase: unknown } | null,
    );
    // Fallback: use window-attached client if present, else give up.
    // The app doesn't expose one, so rely on the module import above.
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

test.describe("Partner cannot open owner/admin profile edit routes", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping partner profile guard test.",
  );

  test.beforeEach(async ({ page }) => {
    await seedPartnerSession(page);
    const partner = await isPartnerSession(page);
    test.skip(
      !partner,
      "Injected Supabase session is not a partner; skipping partner-scoped guard test.",
    );
  });

  for (const route of FORBIDDEN_ROUTES) {
    test(`direct navigation to ${route} is blocked for a partner`, async ({ page }) => {
      await page.goto(route);

      // The guard must redirect off the forbidden URL.
      await page.waitForFunction(
        (r) => !window.location.pathname.startsWith(r),
        route,
        { timeout: 10_000 },
      );

      const landed = new URL(page.url()).pathname;

      // Not still on the forbidden route.
      expect(landed.startsWith(route)).toBe(false);

      // Guard must fire BEFORE the route's own redirect to
      // `/dashboard/settings`. Landing there would mean a partner reached
      // the owner/admin edit surface through the back door.
      expect(landed.startsWith("/dashboard/settings")).toBe(false);

      // Landing is a partner-appropriate destination.
      expect(
        ALLOWED_LANDINGS.some((t) => landed === t || landed.startsWith(t + "/")),
      ).toBe(true);
    });
  }
});
