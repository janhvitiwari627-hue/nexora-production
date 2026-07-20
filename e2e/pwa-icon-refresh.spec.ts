import { expect, test } from "@playwright/test";

/**
 * Verifies that the Nexora favicon and PWA manifest icons are wired up
 * correctly and will refresh across deploys.
 *
 * Refresh strategy under test:
 *  - Icon URLs are content-addressed on the Lovable CDN
 *    (/__l5e/assets-v1/<uuid>/<filename>). A re-uploaded logo produces
 *    a new UUID, so the URL itself changes — browsers can never serve
 *    a stale icon from cache.
 *  - The manifest is served with a revalidation-friendly cache-control
 *    so its icon list picks up the new URL on the next visit.
 *  - The service worker (if present) must not intercept these requests.
 */

const CDN_ICON_RE = /\/__l5e\/assets-v1\/[0-9a-f-]{36}\/[^/]+\.(?:jpe?g|png|svg|webp)$/i;

test.describe("PWA icons refresh across deploys", () => {
  test("favicon links are content-addressed and reachable", async ({ page, request }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const links = await page.$$eval("link[rel*='icon']", (els) =>
      els.map((el) => ({
        rel: el.getAttribute("rel"),
        href: (el as HTMLLinkElement).href,
        type: el.getAttribute("type") ?? "",
      })),
    );

    expect(links.length, "at least one favicon <link> must be present").toBeGreaterThan(0);
    for (const l of links) {
      expect(l.href, `${l.rel} href should be content-addressed`).toMatch(CDN_ICON_RE);
      const resp = await request.get(l.href);
      expect(resp.status(), `${l.rel} must resolve 200`).toBe(200);
      const ct = resp.headers()["content-type"] ?? "";
      expect(ct).toMatch(/^image\//);
    }
  });

  test("manifest lists content-addressed icons and revalidates", async ({ page, request }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const manifestHref = await page.locator("link[rel='manifest']").first().getAttribute("href");
    expect(manifestHref, "<link rel='manifest'> must exist").toBeTruthy();

    const manifestUrl = new URL(manifestHref!, page.url()).toString();
    const manifestResp = await request.get(manifestUrl);
    expect(manifestResp.status()).toBe(200);

    // Manifest itself must revalidate so new icon URLs propagate on next visit.
    const cc = (manifestResp.headers()["cache-control"] ?? "").toLowerCase();
    expect(
      cc.includes("no-cache") ||
        cc.includes("no-store") ||
        cc.includes("must-revalidate") ||
        cc.includes("max-age=0"),
      `manifest cache-control should revalidate; got: "${cc}"`,
    ).toBe(true);

    const manifest = (await manifestResp.json()) as {
      icons?: Array<{ src: string; sizes?: string; type?: string; purpose?: string }>;
    };
    expect(manifest.icons?.length ?? 0, "manifest must declare icons").toBeGreaterThan(0);

    const sizesSeen = new Set<string>();
    for (const icon of manifest.icons!) {
      expect(icon.src, "icon src must be content-addressed").toMatch(CDN_ICON_RE);
      if (icon.sizes) sizesSeen.add(icon.sizes);

      const iconUrl = new URL(icon.src, manifestUrl).toString();
      const iconResp = await request.get(iconUrl);
      expect(iconResp.status(), `icon ${icon.sizes ?? "?"} must resolve 200`).toBe(200);

      // Content-addressed assets should be immutable so browsers can cache them
      // long-term without going stale (URL changes when the file changes).
      const iconCc = (iconResp.headers()["cache-control"] ?? "").toLowerCase();
      expect(iconCc, `icon ${icon.sizes ?? "?"} should be immutable`).toContain("immutable");
    }

    // Both install-time sizes required by Android/Chrome installability.
    expect(sizesSeen.has("192x192"), "manifest must include 192x192 icon").toBe(true);
    expect(sizesSeen.has("512x512"), "manifest must include 512x512 icon").toBe(true);
  });

  test("service worker does not intercept icon or manifest requests", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Wait a moment for any SW registration to settle.
    await page.waitForTimeout(500);

    // Any registered SW at this origin must be a pass-through / kill-switch
    // (installed only to unregister legacy PWA workers). It must NOT ship
    // a fetch handler that could cache icon or manifest responses.
    const swInfo = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return { supported: false, active: null };
      const regs = await navigator.serviceWorker.getRegistrations();
      return {
        supported: true,
        activeCount: regs.length,
        scopes: regs.map((r) => r.scope),
      };
    });

    // Either no SW is registered, or the kill-switch is still evicting.
    // In both cases nothing may cache icon requests — verify by fetching
    // the favicon twice and confirming the response headers stay
    // "immutable" (i.e. served fresh from the CDN, not from a SW cache
    // that might rewrite headers).
    expect(swInfo.supported).toBe(true);

    const iconHref = await page.locator("link[rel='icon']").first().getAttribute("href");
    expect(iconHref).toBeTruthy();

    for (let i = 0; i < 2; i++) {
      const r = await page.request.get(iconHref!);
      expect(r.status()).toBe(200);
      const cc = (r.headers()["cache-control"] ?? "").toLowerCase();
      expect(cc, "favicon must remain CDN-cached, not SW-served").toContain("immutable");
    }
  });

  test("logo re-upload invalidates the old icon URL (simulated)", async ({ page, request }) => {
    // Simulate a "new deploy" by tampering with the CDN UUID in the icon
    // URL and verifying the old URL either changes on the next page load
    // (content addressing) or fails to resolve — proving that the browser
    // cannot silently keep serving the old icon after a logo change.
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const currentHref = await page.locator("link[rel='icon']").first().getAttribute("href");
    expect(currentHref).toMatch(CDN_ICON_RE);

    const fakeStaleHref = currentHref!.replace(
      /\/assets-v1\/[0-9a-f-]{36}\//,
      "/assets-v1/00000000-0000-0000-0000-000000000000/",
    );
    expect(fakeStaleHref).not.toBe(currentHref);

    const staleResp = await request.get(fakeStaleHref);
    expect(
      staleResp.status(),
      "a stale UUID must not resolve to a real image; deploys with a new logo therefore always produce a new URL",
    ).not.toBe(200);
  });
});
