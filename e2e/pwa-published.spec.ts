import { test, expect, devices } from "@playwright/test";

/**
 * Post-deploy validation of the PWA install surface on the *published*
 * origin (default: https://radiant-hub-os.lovable.app). Override with
 * `PLAYWRIGHT_PUBLISHED_URL` to run against any environment (e.g. a
 * custom domain or a staging build).
 *
 * These tests are deliberately independent from the local dev server —
 * they hit whatever HTML + manifest the CDN is currently serving.
 */

const PUBLISHED_URL = process.env.PLAYWRIGHT_PUBLISHED_URL ?? "https://radiant-hub-os.lovable.app";

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36";

const EXPECTED_START_URL = "/customer/home";
const EXPECTED_THEME_COLOR = "#2563eb";
const EXPECTED_BACKGROUND_COLOR = "#f8fafc";
const REQUIRED_ICON_SIZES = ["192x192", "512x512"];

type Manifest = {
  name?: string;
  short_name?: string;
  start_url?: string;
  display?: string;
  theme_color?: string;
  background_color?: string;
  icons?: Array<{ src: string; sizes: string; type?: string }>;
};

test.describe("Published PWA manifest", () => {
  test("serves manifest with correct start_url, theme, background, and icons", async ({
    request,
  }) => {
    const res = await request.get(`${PUBLISHED_URL}/manifest.webmanifest`);
    expect(res.status(), "manifest.webmanifest must be 200").toBe(200);

    const contentType = res.headers()["content-type"] ?? "";
    // Browsers accept the manifest regardless of MIME, but a JSON-ish content type is preferred.
    expect(contentType).toMatch(/manifest\+json|application\/json|octet-stream|text\/plain/);

    const manifest = (await res.json()) as Manifest;

    expect(manifest.start_url, "start_url must launch the customer app home").toBe(
      EXPECTED_START_URL,
    );
    expect(manifest.display, "display must be standalone for installability").toBe("standalone");
    expect(manifest.theme_color?.toLowerCase()).toBe(EXPECTED_THEME_COLOR);
    expect(manifest.background_color?.toLowerCase()).toBe(EXPECTED_BACKGROUND_COLOR);

    const iconSizes = (manifest.icons ?? []).map((i) => i.sizes);
    for (const size of REQUIRED_ICON_SIZES) {
      expect(iconSizes, `icons must include ${size}`).toContain(size);
    }

    // start_url itself must be reachable, not a phantom route.
    const home = await request.get(`${PUBLISHED_URL}${EXPECTED_START_URL}`);
    expect(home.status(), `${EXPECTED_START_URL} must resolve on the published site`).toBe(200);
  });

  test("root HTML advertises the manifest and theme-color meta", async ({ request }) => {
    const res = await request.get(`${PUBLISHED_URL}/customer-app`);
    expect(res.status()).toBe(200);
    const html = await res.text();

    expect(html).toMatch(/<link[^>]+rel=["']manifest["']/i);
    expect(html.toLowerCase()).toContain(EXPECTED_THEME_COLOR);
  });
});

test.describe("Published /customer-app install CTA visibility", () => {
  test("Android (Chrome UA): shows install-eligible CTA and Android manual steps hint", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...devices["Pixel 7"],
      userAgent: ANDROID_UA,
    });
    const page = await context.newPage();
    await page.goto(`${PUBLISHED_URL}/customer-app`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // With no synthetic beforeinstallprompt, the button falls back to the manual guide label.
    const androidBtn = page
      .locator("main")
      .getByRole("button", { name: /Show Android Install Steps|Install Nexora App/i });
    await expect(androidBtn).toBeVisible();

    // Android hint copy should be present alongside the CTA.
    await expect(page.locator("main")).toContainText(/On Android:/i);
    await expect(page.locator("main")).toContainText(/Install app/i);

    // Simulate the browser firing beforeinstallprompt → button label upgrades to the native install label.
    await page.evaluate(() => {
      const e = new Event("beforeinstallprompt") as Event & {
        prompt?: () => Promise<void>;
        userChoice?: Promise<{ outcome: "accepted" | "dismissed" }>;
      };
      (window as unknown as { __promptFired?: boolean }).__promptFired = false;
      e.prompt = () => {
        (window as unknown as { __promptFired?: boolean }).__promptFired = true;
        return Promise.resolve();
      };
      e.userChoice = Promise.resolve({ outcome: "dismissed" });
      window.dispatchEvent(e);
    });

    const nativeBtn = page.locator("main").getByRole("button", { name: /^Install Nexora App$/i });
    await expect(nativeBtn).toBeVisible();
    await nativeBtn.click();
    const fired = await page.evaluate(
      () => (window as unknown as { __promptFired?: boolean }).__promptFired,
    );
    expect(fired, "clicking Install Nexora App must invoke deferred.prompt()").toBe(true);

    await context.close();
  });

  test("iOS (Safari UA): shows iOS install-steps CTA and Add to Home Screen guidance", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...devices["iPhone 13"],
      userAgent: IOS_UA,
    });
    const page = await context.newPage();
    await page.goto(`${PUBLISHED_URL}/customer-app`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    const iosBtn = page.locator("main").getByRole("button", { name: /Show iOS Install Steps/i });
    await expect(iosBtn).toBeVisible();

    await expect(page.locator("main")).toContainText(/On iPhone\/iPad:/i);
    await expect(page.locator("main")).toContainText(/Add to Home Screen/i);

    // Reveal the full step-by-step guide.
    await iosBtn.click();
    await expect(page.locator("main")).toContainText(/Install on iPhone \/ iPad \(Safari\)/i);

    await context.close();
  });

  test("Installed state (localStorage flag): CTA hides and 'App installed' pill shows", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...devices["Pixel 7"],
      userAgent: ANDROID_UA,
    });
    const page = await context.newPage();

    // Prime the persistent install flag before the app boots.
    await context.addInitScript(() => {
      try {
        localStorage.setItem("nexora_pwa_installed", "1");
      } catch {
        /* ignore */
      }
    });

    await page.goto(`${PUBLISHED_URL}/customer-app`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    await expect(
      page.locator("main").getByRole("button", {
        name: /Install Nexora App|Show Android Install Steps|Show iOS Install Steps/i,
      }),
    ).toHaveCount(0);
    await expect(page.locator("main")).toContainText(/App installed/i);

    await context.close();
  });
});
