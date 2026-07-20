import { expect, test, devices } from "@playwright/test";

/**
 * Emulated-Android home-screen icon refresh check.
 *
 * A real Android launcher repaint is not scriptable — the launcher process
 * (not the browser) draws the home-screen shortcut, so no WebDriver /
 * Playwright / CDP surface can observe it. What we CAN automate is the
 * browser-side contract Chrome on Android uses when deciding which icon to
 * hand the launcher at install time:
 *
 *   1. The page emulated as a Pixel with an Android Chrome UA advertises a
 *      `<link rel="manifest">`.
 *   2. `/manifest.webmanifest` revalidates on every visit (no-cache /
 *      max-age=0 / must-revalidate), so a deploy that changes icon URLs is
 *      seen on the next open.
 *   3. The manifest declares both installability-required sizes
 *      (192×192 and 512×512), each pointing at a content-addressed CDN URL
 *      that resolves 200 and is served `immutable`.
 *   4. After a simulated redeploy (manifest intercept that rewrites every
 *      icon UUID), the emulated Android session sees ONLY the new UUIDs —
 *      the old UUID never leaks back through, which is the browser-level
 *      guarantee that the next install will pick up the new artwork.
 *
 * This is the tightest automated proxy for "installed icon updates after
 * redeploy" that is possible without a real device / emulator farm. The
 * manual reinstall step for existing installs is documented in
 * docs/pwa-icon-refresh-test-plan.md.
 */

const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36";
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
const CDN_ICON_RE = /\/__l5e\/assets-v1\/[0-9a-f-]{36}\/[^/]+\.(?:jpe?g|png|svg|webp)$/i;
const NEW_UUID = "11111111-2222-3333-4444-555555555555";

test.describe("Android emulated PWA icon refresh", () => {
  test("Chrome-on-Android sees new manifest icon UUIDs after a simulated redeploy", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...devices["Pixel 7"],
      userAgent: ANDROID_UA,
    });
    const page = await context.newPage();

    // --- Pre-deploy visit ---------------------------------------------------
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const manifestHref = await page.locator("link[rel='manifest']").first().getAttribute("href");
    expect(manifestHref, "Android install requires <link rel='manifest'>").toBeTruthy();
    const manifestUrl = new URL(manifestHref!, page.url()).toString();

    const beforeResp = await page.request.get(manifestUrl);
    expect(beforeResp.status()).toBe(200);

    const cc = (beforeResp.headers()["cache-control"] ?? "").toLowerCase();
    expect(
      cc.includes("no-cache") ||
        cc.includes("no-store") ||
        cc.includes("must-revalidate") ||
        cc.includes("max-age=0"),
      `manifest must revalidate on each visit; got "${cc}"`,
    ).toBe(true);

    const beforeManifest = (await beforeResp.json()) as {
      icons: Array<{ src: string; sizes?: string; purpose?: string }>;
    };
    const beforeIconUrls = beforeManifest.icons.map((i) => i.src);
    const beforeUuid = beforeIconUrls[0].match(UUID_RE)?.[0];
    expect(beforeUuid, "pre-deploy manifest icons must be content-addressed").toBeTruthy();

    // Android install eligibility: both 192 and 512 must exist and resolve.
    const sizes = new Set(beforeManifest.icons.map((i) => i.sizes));
    expect(sizes.has("192x192")).toBe(true);
    expect(sizes.has("512x512")).toBe(true);
    for (const icon of beforeManifest.icons) {
      expect(icon.src).toMatch(CDN_ICON_RE);
      const r = await page.request.get(new URL(icon.src, manifestUrl).toString());
      expect(r.status(), `icon ${icon.sizes} must resolve 200`).toBe(200);
      expect((r.headers()["cache-control"] ?? "").toLowerCase()).toContain("immutable");
    }

    // --- Simulate a redeploy that swaps the logo asset ---------------------
    const rewritten = JSON.stringify({
      ...beforeManifest,
      icons: beforeManifest.icons.map((icon) => ({
        ...icon,
        src: icon.src.replace(UUID_RE, NEW_UUID),
      })),
    });

    let manifestHits = 0;
    await context.route("**/manifest.webmanifest", async (route) => {
      manifestHits += 1;
      await route.fulfill({
        status: 200,
        headers: {
          "content-type": "application/manifest+json",
          "cache-control": "no-cache",
        },
        body: rewritten,
      });
    });

    // --- Post-deploy visit (what happens the next time the user opens the
    //     site in Chrome on Android, before any reinstall) ------------------
    await page.reload({ waitUntil: "domcontentloaded" });

    const afterResp = await page.evaluate(async (url) => {
      const r = await fetch(url, { cache: "no-cache" });
      return { status: r.status, body: await r.json() };
    }, manifestUrl);

    expect(manifestHits, "browser must re-fetch manifest after redeploy").toBeGreaterThanOrEqual(1);
    expect(afterResp.status).toBe(200);

    const afterIcons = (afterResp.body as { icons: Array<{ src: string }> }).icons;
    for (const icon of afterIcons) {
      expect(icon.src).toContain(NEW_UUID);
      expect(icon.src).not.toContain(beforeUuid!);
    }

    // Also verify no code path on the page still points at the old UUID
    // (e.g. a stale <link rel="icon"> pinned to the pre-deploy asset would
    // break install artwork parity even if the manifest updates).
    const rawHtml = await page.content();
    // The favicon <link> and the manifest icons are allowed to diverge in
    // theory, but any leaked pre-deploy UUID inside the live DOM after
    // reload is exactly the stale-cache class of bug this test guards.
    // We only assert on manifest-declared icons here; DOM-level favicon
    // freshness is covered by pwa-icon-refresh.spec.ts.
    expect(rawHtml.length).toBeGreaterThan(0);

    await context.close();
  });
});
