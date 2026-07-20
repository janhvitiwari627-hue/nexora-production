import { test, expect, type Page } from "@playwright/test";

/**
 * A signed-in owner (owner / shop_owner / shop_manager) must NOT be
 * able to reach the partner profile-edit surface. `requireRole` in
 * `src/routes/partner.profile.tsx` should bounce the owner away before
 * the route's own redirect to `/dashboard/settings` runs.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

// `requireRole` sends an owner to /owner/dashboard when the guard fails,
// or to /login if the user has no matching effective role.
const ALLOWED_LANDINGS = ["/owner/dashboard", "/owner", "/login", "/"];

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
    const hasOwnerRole =
      roles.includes("owner") || roles.includes("shop_owner") || roles.includes("shop_manager");
    if (hasOwnerRole) return true;
    // Fallback: approved salon_owners link also grants owner access via requireRole.
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
    return (linkRes.data?.length ?? 0) > 0;
  });
}

test.describe("Owner cannot open /partner/profile", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping owner→partner guard test.",
  );

  test.beforeEach(async ({ page }) => {
    await seedOwnerSession(page);
    const owner = await isOwnerSession(page);
    test.skip(
      !owner,
      "Injected Supabase session is not an owner; skipping owner-scoped guard test.",
    );
  });

  test("direct navigation to /partner/profile is blocked and never lands on /dashboard/settings", async ({
    page,
  }) => {
    // Track every URL the browser visits during this navigation so we can
    // assert /dashboard/settings was NEVER reached — not even for a frame.
    const visited: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        visited.push(new URL(frame.url()).pathname);
      }
    });

    await page.goto("/partner/profile");

    // Wait until we're off the forbidden URL.
    await page.waitForFunction(
      () => !window.location.pathname.startsWith("/partner/profile"),
      undefined,
      { timeout: 10_000 },
    );

    // Give any trailing redirects a beat to settle before final assertions.
    await page.waitForTimeout(500);

    const landed = new URL(page.url()).pathname;

    // Not still on the forbidden route.
    expect(landed.startsWith("/partner/profile")).toBe(false);

    // Owner must never reach the shared profile-edit surface through the
    // partner door — neither as the final landing nor as an intermediate hop.
    expect(landed.startsWith("/dashboard/settings")).toBe(false);
    expect(
      visited.some((p) => p.startsWith("/dashboard/settings")),
      `unexpected /dashboard/settings hop; visited=${JSON.stringify(visited)}`,
    ).toBe(false);

    // Landing is an owner-appropriate destination.
    expect(ALLOWED_LANDINGS.some((t) => landed === t || landed.startsWith(t + "/"))).toBe(true);
  });
});
