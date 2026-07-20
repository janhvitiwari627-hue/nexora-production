import { test, expect, type Page } from "@playwright/test";

/**
 * A signed-in customer must NOT be able to open role-specific profile
 * edit routes by typing the URL directly. `requireRole` in
 * `src/lib/route-guards.ts` should redirect them away before the
 * `/dashboard/settings` redirect ever runs.
 *
 * Uses the Lovable browser-use managed Supabase session when available;
 * skips otherwise, and also skips when the injected session belongs to
 * a non-customer role so the assertions stay meaningful.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

const PROTECTED_PROFILE_ROUTES = ["/owner/profile", "/partner/profile", "/admin/profile"] as const;

// `requireRole` sends a customer to `/` when the guard fails, or `/login`
// if the session has lapsed. Any customer-appropriate landing is fine so
// long as it is NOT the shared `/dashboard/settings` edit surface (which
// would mean the guard did not fire).
const ALLOWED_LANDINGS = ["/", "/login"];

async function seedCustomerSession(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
      window.sessionStorage.removeItem("nexora:postLoginRedirect");
    },
    [STORAGE_KEY!, SESSION_JSON!],
  );
}

async function isCustomerSession(page: Page): Promise<boolean> {
  // Treat "customer" as: signed in AND no elevated role (no admin /
  // owner / shop_owner / shop_manager / growth_partner / district_partner
  // / super_admin) AND no approved salon_owners link. This matches how
  // `requireRole` in src/lib/route-guards.ts derives effective roles.
  return await page.evaluate(async () => {
    const mod = await import("/src/integrations/supabase/client.ts").catch(
      () => null as unknown as { supabase: unknown } | null,
    );
    const supabase = (
      mod as {
        supabase: {
          auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
          from: (t: string) => {
            select: (c: string) => {
              eq: (
                col: string,
                val: string,
              ) => {
                eq?: (col: string, val: unknown) => Promise<{ data: unknown[] | null }>;
              } & Promise<{ data: Array<{ role: string }> | null }>;
            };
          };
        };
      } | null
    )?.supabase;
    if (!supabase) return false;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return false;

    const roleRes = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    const roles = (roleRes.data ?? []).map((r) => r.role);
    const elevated = [
      "admin",
      "super_admin",
      "owner",
      "shop_owner",
      "shop_manager",
      "growth_partner",
      "district_partner",
    ];
    if (roles.some((r) => elevated.includes(r))) return false;

    const linkRes = await (
      supabase.from("salon_owners") as unknown as {
        select: (c: string) => {
          eq: (
            col: string,
            val: string,
          ) => {
            eq: (col: string, val: boolean) => Promise<{ data: unknown[] | null }>;
          };
        };
      }
    )
      .select("id")
      .eq("user_id", data.user.id)
      .eq("is_approved", true);
    if ((linkRes.data?.length ?? 0) > 0) return false;

    return true;
  });
}

test.describe("Customer cannot open role-specific profile edit routes", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping customer profile guard test.",
  );

  test.beforeEach(async ({ page }) => {
    await seedCustomerSession(page);
    const customer = await isCustomerSession(page);
    test.skip(
      !customer,
      "Injected Supabase session is not a customer; skipping customer-scoped guard test.",
    );
  });

  for (const route of PROTECTED_PROFILE_ROUTES) {
    test(`direct navigation to ${route} is blocked for a customer`, async ({ page }) => {
      // Track every URL the browser visits so we can assert
      // /dashboard/settings was NEVER reached — not even for a frame.
      const visited: string[] = [];
      page.on("framenavigated", (frame) => {
        if (frame === page.mainFrame()) {
          visited.push(new URL(frame.url()).pathname);
        }
      });

      await page.goto(route);

      // The guard should redirect somewhere else. Wait until we're off
      // the protected profile URL.
      await page.waitForFunction((r) => !window.location.pathname.startsWith(r), route, {
        timeout: 10_000,
      });

      // Give any trailing redirects a beat to settle.
      await page.waitForTimeout(300);

      const landed = new URL(page.url()).pathname;

      // Not still on the protected route.
      expect(landed.startsWith(route)).toBe(false);

      // Must not have been forwarded — final or transient — into the
      // shared profile-edit surface. That would mean `requireRole`
      // did not fire before the route's own redirect.
      expect(landed.startsWith("/dashboard/settings")).toBe(false);
      expect(
        visited.some((p) => p.startsWith("/dashboard/settings")),
        `unexpected /dashboard/settings hop; visited=${JSON.stringify(visited)}`,
      ).toBe(false);

      // Must land on a customer-appropriate destination.
      expect(ALLOWED_LANDINGS.some((t) => landed === t || landed.startsWith(t + "/"))).toBe(true);
    });
  }
});
