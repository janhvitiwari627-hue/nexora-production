import { expect, test } from "@playwright/test";

test("customer manifest uses the large launcher artwork", async ({ request }) => {
  const response = await request.get("/manifests/customer.webmanifest");
  expect(response.status()).toBe(200);

  const manifest = await response.json();
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        src: expect.stringContaining("customer-pwa-launcher-192.png"),
        sizes: "192x192",
      }),
      expect.objectContaining({
        src: expect.stringContaining("customer-pwa-launcher-512.png"),
        sizes: "512x512",
      }),
    ]),
  );

  for (const size of [192, 512]) {
    const icon = await request.get(`/customer-pwa-launcher-${size}.png`);
    expect(icon.status()).toBe(200);
    expect(icon.headers()["content-type"]).toContain("image/png");
  }
});

test("install page shows progress after the native install is accepted", async ({ page }) => {
  await page.goto("/customer-app?install=1");
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.defineProperties(event, {
      prompt: { value: async () => undefined },
      userChoice: { value: Promise.resolve({ outcome: "accepted" }) },
    });
    window.dispatchEvent(event);
  });

  const installButton = page.getByRole("button", { name: "Install Customer App" }).first();
  await expect(installButton).toBeVisible();
  await installButton.click();
  await expect(page.getByText("Installing Nexora…").first()).toBeVisible();
  await expect(
    page.getByText(/Android will confirm when the app has been added/i).first(),
  ).toBeVisible();
});
