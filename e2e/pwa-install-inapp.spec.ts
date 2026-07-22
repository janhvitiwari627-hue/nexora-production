import { expect, test } from "@playwright/test";

const ANDROID_WEBVIEW_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP1A) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Version/4.0 Chrome/125.0.0.0 Mobile Safari/537.36 wv";

test("Android in-app browser offers a direct Open in Chrome install path", async ({ browser }) => {
  test.setTimeout(60000);
  const context = await browser.newContext({ userAgent: ANDROID_WEBVIEW_UA });
  const page = await context.newPage();

  await page.goto("/customer-app?pwa_release=2026-07-22-desktop-install-v8");
  await page.getByRole("button", { name: /install customer app/i }).click();

  await expect(
    page.getByRole("heading", { name: /open chrome to install customer app/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /open in chrome/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /copy link/i })).toBeVisible();

  await context.close();
});

test("customer manifest and service worker meet the install surface requirements", async ({
  request,
}) => {
  const manifestResponse = await request.get("/manifests/customer.webmanifest");
  expect(manifestResponse.status()).toBe(200);
  const manifest = await manifestResponse.json();
  expect(manifest).toMatchObject({
    id: "/apps/customer",
    start_url: "/app/customer?source=pwa",
    scope: "/",
    display: "standalone",
  });
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(
    expect.arrayContaining(["192x192", "512x512"]),
  );

  const workerResponse = await request.get("/pwa-sw.js");
  expect(workerResponse.status()).toBe(200);
  expect(await workerResponse.text()).toContain('self.addEventListener("fetch"');
});
