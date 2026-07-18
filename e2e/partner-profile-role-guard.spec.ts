import { test, expect, type Page } from "@playwright/test";

/**
 * A signed-in partner (growth_partner / district_partner) must NOT be
 * able to open the owner or admin profile-edit routes by typing the URL
 * directly. `requireRole` in `src/lib/route-guards.ts` should redirect
 * them away BEFORE the route's own `/dashboard/settings` redirect runs,
 * so `/dashboard/settings` must never appear — not even as a transient
 * hop.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

const FORBIDDEN_ROUTES = ["/owner/profile", "/admin/profile"] as const;

// `requireRole` sends a rejected partner to `/` (no owner/admin fallback);
// `/login` is acceptable if the session lapsed. A partner-appropriate
// landing is also fine.
const ALLOWED_LANDINGS = ["/login", "/partner/dashboard", "/partner", "/"];

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
    // Exclude admins/owners so this stays partner-scoped.
    const elevated = [
      "admin",
      "super_admin",
      "owner",
      "shop_owner",
      "shop_manager",
    ];
    if (roles.some((r) => elevated.includes(r))) return false;
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
    test(`direct navigation to ${route} is blocked for a partner and never lands on /dashboard/settings`, async ({ page }) => {
      // Track every URL the browser visits so we can assert
      // /dashboard/settings was NEVER reached — not even for a frame.
      const visited: string[] = [];
      page.on("framenavigated", (frame) => {
        if (frame === page.mainFrame()) {
          visited.push(new URL(frame.url()).pathname);
        }
      });

      await page.goto(route);

      // The guard must redirect off the forbidden URL.
      await page.waitForFunction(
        (r) => !window.location.pathname.startsWith(r),
        route,
        { timeout: 10_000 },
      );

      // Give trailing redirects a beat to settle.
      await page.waitForTimeout(500);

      const landed = new URL(page.url()).pathname;

      // Not still on the forbidden route.
      expect(landed.startsWith(route)).toBe(false);

      // Guard must fire BEFORE the route's own /dashboard/settings
      // redirect — neither final landing nor transient hop.
      expect(landed.startsWith("/dashboard/settings")).toBe(false);
      expect(
        visited.some((p) => p.startsWith("/dashboard/settings")),
        `unexpected /dashboard/settings hop; visited=${JSON.stringify(visited)}`,
      ).toBe(false);

      // Landing must be partner-appropriate.
      expect(
        ALLOWED_LANDINGS.some((t) => landed === t || landed.startsWith(t + "/")),
      ).toBe(true);
    });
  }
});
