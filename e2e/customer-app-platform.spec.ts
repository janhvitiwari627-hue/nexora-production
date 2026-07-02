import { test, expect, devices } from "@playwright/test";

/**
 * Verifies platform detection + fallback install instructions on
 * /customer-app when `beforeinstallprompt` is unavailable.
 *
 * The page reads `navigator.userAgent` (and, for iOS, `"ontouchend" in
 * document`) once on mount to pick ios / android / desktop, then renders
 * a hint line + reveals a step-by-step guide when "Install" is clicked.
 */

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36";
const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

/**
 * Suppresses `beforeinstallprompt` at the earliest possible moment so the
 * page treats native install as unavailable — that is the branch we want
 * to test. Real headed Chromium fires this event on eligible PWAs, which
 * would hide the manual fallback hint / guide.
 */
async function suppressBeforeInstallPrompt(context: import("@playwright/test").BrowserContext) {
  await context.addInitScript(() => {
    const origAdd = window.addEventListener.bind(window);
    window.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, opts?: boolean | AddEventListenerOptions) => {
      if (type === "beforeinstallprompt" || type === "appinstalled") return;
      return origAdd(type, listener, opts);
    }) as typeof window.addEventListener;
  });
}

test.describe("CustomerAppPage platform-aware install fallback", () => {
  test("iOS: shows Safari hint and Add to Home Screen steps", async ({ browser }) => {
    const context = await browser.newContext({
      ...devices["iPhone 13"],
      userAgent: IOS_UA,
    });
    await suppressBeforeInstallPrompt(context);
    const page = await context.newPage();
    await page.goto("/customer-app");

    // Hint line
    await expect(page.getByText(/On iPhone\/iPad/i)).toBeVisible();
    await expect(page.getByText(/Add to Home Screen/i).first()).toBeVisible();

    // Button label reflects iOS
    const installBtn = page.getByRole("button", { name: /Show iOS Install Steps/i });
    await expect(installBtn).toBeVisible();

    // Guide is hidden until click
    await expect(page.getByText(/Install on iPhone \/ iPad \(Safari\)/i)).toHaveCount(0);

    await installBtn.click();

    await expect(page.getByText(/Install on iPhone \/ iPad \(Safari\)/i)).toBeVisible();
    await expect(page.getByRole("list")).toContainText(/Safari/);
    await expect(page.getByRole("list")).toContainText(/Add to Home Screen/i);

    await context.close();
  });

  test("Android: shows Chrome hint and Install app steps", async ({ browser }) => {
    const context = await browser.newContext({
      ...devices["Pixel 7"],
      userAgent: ANDROID_UA,
    });
    await suppressBeforeInstallPrompt(context);
    const page = await context.newPage();
    await page.goto("/customer-app");

    await expect(page.getByText(/On Android/i)).toBeVisible();

    const installBtn = page.getByRole("button", { name: /Show Android Install Steps/i });
    await expect(installBtn).toBeVisible();

    await expect(page.getByText(/Install on Android \(Chrome\)/i)).toHaveCount(0);

    await installBtn.click();

    await expect(page.getByText(/Install on Android \(Chrome\)/i)).toBeVisible();
    await expect(page.getByRole("list")).toContainText(/Chrome/);
    await expect(page.getByRole("list")).toContainText(/Install app/i);

    await context.close();
  });

  test("Desktop: shows address-bar hint and desktop install steps", async ({ browser }) => {
    const context = await browser.newContext({ userAgent: DESKTOP_UA });
    await suppressBeforeInstallPrompt(context);
    const page = await context.newPage();
    await page.goto("/customer-app", { waitUntil: "networkidle" });

    await expect(page.getByText(/On desktop Chrome\/Edge/i)).toBeVisible();

    const installBtn = page.getByRole("button", { name: /^Install Nexora App$/i });
    await expect(installBtn).toBeVisible();

    await expect(page.getByText(/Install on Desktop/i)).toHaveCount(0);

    await installBtn.click();

    await expect(page.getByText(/Install on Desktop/i)).toBeVisible();
    const list = page.getByRole("list");
    await expect(list).toContainText(/Chrome/);
    await expect(list).toContainText(/install icon/i);

    await context.close();
  });

  test("Coming Soon store buttons stay disabled on every platform", async ({ browser }) => {
    for (const ua of [IOS_UA, ANDROID_UA, DESKTOP_UA]) {
      const context = await browser.newContext({ userAgent: ua });
      await suppressBeforeInstallPrompt(context);
    const page = await context.newPage();
      await page.goto("/customer-app");
      await expect(page.getByRole("button", { name: /Get it on Google Play/i })).toBeDisabled();
      await expect(page.getByRole("button", { name: /Download on the App Store/i })).toBeDisabled();
      await context.close();
    }
  });
});
