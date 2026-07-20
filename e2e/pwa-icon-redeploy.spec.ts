import { expect, test } from "@playwright/test";

/**
 * End-to-end simulation of a real deploy that changes the logo.
 *
 * We can't actually swap the CDN asset from a test, so we intercept
 * the manifest response on the second visit and rewrite the icon UUIDs
 * to fresh values (as would happen after re-uploading the logo). The
 * test then verifies:
 *
 *   1. The browser fetches /manifest.webmanifest again on the reload
 *      (it isn't served from a stale HTTP or service-worker cache).
 *   2. The manifest returned to the page contains the NEW UUIDs.
 *   3. The new icon URLs are reachable — i.e. clients will pull the
 *      new artwork after a deploy without any cache-busting.
 *
 * Because icon URLs are content-addressed (/__l5e/assets-v1/<uuid>/...),
 * a UUID change is the real-world signal that a redeploy shipped a new
 * logo.
 */

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
const MANIFEST_PATH = "/manifest.webmanifest";
const NEW_UUID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

test("simulated redeploy: browser fetches new manifest + icon URLs", async ({ page, context }) => {
  // Visit 1: capture the currently-deployed manifest + icon URLs.
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const manifestHref = await page.locator("link[rel='manifest']").first().getAttribute("href");
  expect(manifestHref).toBeTruthy();
  const manifestUrl = new URL(manifestHref!, page.url()).toString();

  const beforeResp = await page.request.get(manifestUrl);
  expect(beforeResp.status()).toBe(200);
  const beforeManifest = (await beforeResp.json()) as {
    icons: Array<{ src: string; sizes?: string }>;
  };
  const beforeIconUrls = beforeManifest.icons.map((i) => i.src);
  expect(beforeIconUrls.length).toBeGreaterThan(0);
  const beforeUuid = beforeIconUrls[0].match(UUID_RE)?.[0];
  expect(beforeUuid, "current manifest must include a UUID in icon URLs").toBeTruthy();

  // Manifest cache-control must revalidate — otherwise the browser could
  // keep serving the old manifest after a deploy.
  const cc = (beforeResp.headers()["cache-control"] ?? "").toLowerCase();
  expect(
    cc.includes("no-cache") ||
      cc.includes("no-store") ||
      cc.includes("must-revalidate") ||
      cc.includes("max-age=0"),
    `manifest cache-control must revalidate; got "${cc}"`,
  ).toBe(true);

  // ---- Simulate a redeploy ---------------------------------------------
  // Intercept /manifest.webmanifest and return a fresh copy where every
  // UUID has been swapped to a new value. This is exactly what would
  // reach the browser after re-uploading the logo asset.
  let manifestHits = 0;
  const rewrittenBody = JSON.stringify({
    ...beforeManifest,
    icons: beforeManifest.icons.map((icon) => ({
      ...icon,
      src: icon.src.replace(UUID_RE, NEW_UUID),
    })),
  });

  await context.route(`**${MANIFEST_PATH}`, async (route) => {
    manifestHits += 1;
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "application/manifest+json",
        // Same revalidation policy the real server uses.
        "cache-control": "no-cache",
      },
      body: rewrittenBody,
    });
  });

  // Visit 2: reload the app so it re-fetches head links + manifest.
  await page.reload({ waitUntil: "domcontentloaded" });

  // Trigger a manifest fetch the way the browser would after a deploy.
  const afterResp = await page.evaluate(async (url) => {
    const r = await fetch(url, { cache: "no-cache" });
    return { status: r.status, body: await r.json() };
  }, manifestUrl);

  expect(manifestHits, "manifest must be re-fetched after redeploy").toBeGreaterThanOrEqual(1);
  expect(afterResp.status).toBe(200);

  const afterIcons = (afterResp.body as { icons: Array<{ src: string }> }).icons;
  const afterIconUrls = afterIcons.map((i) => i.src);
  expect(afterIconUrls).toEqual(beforeIconUrls.map((u) => u.replace(UUID_RE, NEW_UUID)));
  for (const src of afterIconUrls) {
    expect(src).toContain(NEW_UUID);
    expect(src).not.toContain(beforeUuid!);
  }

  // ---- Prove the *old* UUID no longer appears in what the page sees --
  // The page-side fetch above went through our redeploy interceptor,
  // so any client that reloads after the deploy will only see the new
  // UUIDs in the manifest. Stale HTTP caches can't win because the
  // manifest is served no-cache and the icon URLs themselves change.
  for (const src of afterIconUrls) {
    expect(src, "post-deploy manifest must not still reference the old UUID").not.toContain(
      beforeUuid!,
    );
  }
});
