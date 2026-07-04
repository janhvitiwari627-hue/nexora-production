import { test, expect, type Page } from "@playwright/test";

/**
 * A signed-in owner (owner / shop_owner / shop_manager) must NOT be
 * able to open the partner or admin profile-edit routes by typing the
 * URL directly. `requireRole` in `src/lib/route-guards.ts` should
 * redirect them away BEFORE the route's own `/dashboard/settings`
 * redirect runs.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

const FORBIDDEN_ROUTES = ["/partner/profile", "/admin/profile"] as const;

// `requireRole` sends an owner to `/owner/dashboard` when the guard
// rejects a forbidden route — that is the exact expected landing.
const EXPECTED_LANDING = "/owner/dashboard";

async function seedOwnerSession(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
      window.sessionStorage.removeItem("nexora:postLoginRedirect");
    },
    [STORAGE_KEY!, SESSION_JSON!],
  );
}

async function isOwnerSession(page: Page): Promise<boolean> {
  return await page.evaluate(async () => {
    const mod = await import("/src/integrations/supabase/client.ts").catch(
      () => null as unknown as { supabase: unknown } | null,
    );
    const supabase = (mod as { supabase: {
      auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
      from: (t: string) => {
        select: (c: string) => {
          eq: (col: string, val: string) => {
            eq?: (col: string, val: unknown) => Promise<{ data: unknown[] | null }>;
          } & Promise<{ data: Array<{ role: string }> | null }>;
        };
      };
    } } | null)?.supabase;
    if (!supabase) return false;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return false;
    const roleRes = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const roles = (roleRes.data ?? []).map((r) => r.role);
    // Exclude admins/partners so this stays owner-scoped.
    const elevated = ["admin", "super_admin", "growth_partner", "district_partner"];
    if (roles.some((r) => elevated.includes(r))) return false;
    const hasOwnerRole =
      roles.includes("owner") ||
      roles.includes("shop_owner") ||
      roles.includes("shop_manager");
    if (hasOwnerRole) return true;
    const linkRes = await (supabase
      .from("salon_owners") as unknown as {
        select: (c: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: boolean) => Promise<{ data: unknown[] | null }>;
          };
        };
      })
      .select("id")
      .eq("user_id", data.user.id)
      .eq("is_approved", true);
    return (linkRes.data?.length ?? 0) > 0;
  });
}

test.describe("Owner cannot open partner/admin profile edit routes", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping owner profile guard test.",
  );

  test.beforeEach(async ({ page }) => {
    await seedOwnerSession(page);
    const owner = await isOwnerSession(page);
    test.skip(
      !owner,
      "Injected Supabase session is not an owner; skipping owner-scoped guard test.",
    );
  });

  for (const route of FORBIDDEN_ROUTES) {
    test(`direct navigation to ${route} is blocked for an owner`, async ({ page }) => {
      // Track every URL the browser visits to assert /dashboard/settings
      // was NEVER reached — not even as a transient hop.
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
      // redirect — as final landing or transient hop.
      expect(landed.startsWith("/dashboard/settings")).toBe(false);
      expect(
        visited.some((p) => p.startsWith("/dashboard/settings")),
        `unexpected /dashboard/settings hop; visited=${JSON.stringify(visited)}`,
      ).toBe(false);

      // Landing must be EXACTLY the owner dashboard — the guard's declared
      // owner destination. Anything else (home, login, a partner surface)
      // means the redirect target regressed.
      expect(landed).toBe(EXPECTED_LANDING);
    });
  }
});
