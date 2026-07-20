import { test, expect, type Page } from "@playwright/test";

/**
 * End-to-end coverage for the auth-aware PublicHeader.
 *
 * Goals:
 *  1. Anonymous visitors see Login + Register CTAs (after auth resolves).
 *  2. There is NEVER a flash of Login/Register while the auth store is
 *     bootstrapping for a signed-in user — the skeleton placeholder is
 *     shown instead, then the account dropdown.
 *  3. The account dropdown (Dashboard / Profile / Logout) only appears
 *     when a real session exists.
 *
 * To run authenticated assertions, the sandbox / CI must provide:
 *   - LOVABLE_BROWSER_SUPABASE_STORAGE_KEY
 *   - LOVABLE_BROWSER_SUPABASE_SESSION_JSON
 * These are pre-minted by the Lovable browser-use environment when the
 * user is signed into the preview. Tests that need a session are skipped
 * automatically when the vars are missing so the suite stays green
 * locally without credentials.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;

async function seedSession(page: Page) {
  // Land on the origin first so localStorage writes land on the app origin.
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
    },
    [STORAGE_KEY!, SESSION_JSON!],
  );
}

test.describe("PublicHeader — anonymous", () => {
  test("eventually shows Login + Register and never the account dropdown", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header").first();

    // After auth resolves, both CTAs are visible in the header.
    await expect(header.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Register" })).toBeVisible();

    // Account dropdown trigger must not exist for an anon user.
    await expect(header.getByRole("button", { name: "Open account menu" })).toHaveCount(0);
  });
});

test.describe("PublicHeader — authenticated", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping authenticated header checks.",
  );

  test("never flashes Login/Register and shows the account dropdown", async ({ page }) => {
    // Watch the DOM from the very first paint. If a Login or Register CTA
    // ever appears (even for one frame) we record it and fail the test.
    const flashes: string[] = [];
    await page.addInitScript(() => {
      const seen = new Set<string>();
      const check = () => {
        for (const el of document.querySelectorAll("a, button")) {
          const t = (el.textContent ?? "").trim();
          if (t === "Login" || t === "Register") seen.add(t);
        }
        (window as unknown as { __authFlashes: string[] }).__authFlashes = Array.from(seen);
      };
      const mo = new MutationObserver(check);
      const start = () => {
        check();
        mo.observe(document.documentElement, {
          subtree: true,
          childList: true,
          characterData: true,
        });
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
      } else {
        start();
      }
    });

    await seedSession(page);
    await page.goto("/", { waitUntil: "networkidle" });

    // Account dropdown trigger is the proof that auth resolved as signed-in.
    const trigger = page.getByRole("button", { name: "Open account menu" });
    await expect(trigger).toBeVisible({ timeout: 10_000 });

    // Now read out anything the MutationObserver saw between load and now.
    const observed = await page.evaluate(
      () => (window as unknown as { __authFlashes?: string[] }).__authFlashes ?? [],
    );
    flashes.push(...observed);
    expect(flashes, "Login/Register CTAs should never render for a signed-in user").toEqual([]);

    // Dropdown contents.
    await trigger.click();
    await expect(page.getByRole("menuitem", { name: /Dashboard/ })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /Profile/ })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /Logout/ })).toBeVisible();
  });

  test("logout returns the header to the anonymous state", async ({ page }) => {
    await seedSession(page);
    await page.goto("/", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: "Open account menu" }).click();
    await page.getByRole("menuitem", { name: /Logout/ }).click();

    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open account menu" })).toHaveCount(0);
  });
});
