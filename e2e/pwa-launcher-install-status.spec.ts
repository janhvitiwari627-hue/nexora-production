import { expect, test } from "@playwright/test";

test("customer manifest uses the large launcher artwork", async ({ request }) => {
  const response = await request.get("/manifests/customer.webmanifest");
  expect(response.status()).toBe(200);

  const manifest = await response.json();
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        src: expect.stringContaining("customer-pwa-transparent-192.png"),
        sizes: "192x192",
      }),
      expect.objectContaining({
        src: expect.stringContaining("customer-pwa-transparent-512.png"),
        sizes: "512x512",
      }),
    ]),
  );

  for (const size of [192, 512]) {
    const icon = await request.get(`/customer-pwa-transparent-${size}.png`);
    expect(icon.status()).toBe(200);
    expect(icon.headers()["content-type"]).toContain("image/png");
  }
});

test("install page shows progress after the native install is accepted", async ({ page }) => {
  await page.goto("/customer-app?install=1&pwa_release=2026-07-22-transparent-icon-install-v6");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("button", { name: "How to install Customer App" }).first(),
  ).toBeEnabled();
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.defineProperties(event, {
      prompt: { value: async () => undefined },
      userChoice: { value: Promise.resolve({ outcome: "accepted" }) },
    });
    window.dispatchEvent(event);
  });

  const installButton = page.getByRole("button", { name: "Install Customer App" }).first();
  await expect(installButton).toBeEnabled();
  await installButton.click();
  await expect(page.getByText("Installing Nexora…").first()).toBeVisible();
  await expect(
    page.getByText(/Android or your desktop browser will confirm/i).first(),
  ).toBeVisible();

  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(page.getByText(/App installed successfully\. Nexora is ready to open/i)).toBeVisible(
    {
      timeout: 5000,
    },
  );
});
