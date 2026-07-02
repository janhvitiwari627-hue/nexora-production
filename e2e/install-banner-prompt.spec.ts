import { test, expect, type Page } from "@playwright/test";

/**
 * Verifies the "prompt available" (state B) branch of <InstallBanner /> on
 * /download-app.
 *
 * Real Chrome only fires `beforeinstallprompt` when the origin meets full
 * PWA install criteria (HTTPS, valid manifest, service worker, top-level
 * context, engagement heuristic). None of that is reproducible in a local
 * Playwright run, so we synthesize the event and dispatch it after the
 * production listener has been wired.
 *
 * The listener lives in `src/lib/pwa-install.ts` and is registered via a
 * dynamic `import()` from `src/routes/__root.tsx` — so we count
 * beforeinstallprompt listeners in an init script and wait for at least
 * one before dispatching. Otherwise the event fires into a void and the
 * banner stays on state C.
 */

async function waitForInstallPromptListener(page: Page) {
  await page.waitForFunction(
    () => (window as unknown as { __bipListeners?: number }).__bipListeners! >= 1,
    { timeout: 10_000 },
  );
}

test.describe("InstallBanner — prompt available state", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      // Note: don't clear localStorage here — this init script runs on every
      // navigation (including reload), which would wipe the dismiss marker
      // the "persists across reload" test is asserting on. Playwright gives
      // each test a fresh browser context, so storage is already empty.


      const w = window as unknown as {
        __bipListeners?: number;
        __fireBeforeInstallPrompt?: (outcome?: "accepted" | "dismissed") => void;
        __promptCalled?: number;
      };
      w.__bipListeners = 0;
      w.__promptCalled = 0;

      // Instrument addEventListener so tests can wait for the production
      // capture listener to be wired before dispatching the synthetic event.
      const origAdd = window.addEventListener.bind(window);
      window.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, opts?: boolean | AddEventListenerOptions) => {
        if (type === "beforeinstallprompt") {
          w.__bipListeners = (w.__bipListeners ?? 0) + 1;
        }
        return origAdd(type as never, listener as never, opts as never);
      }) as typeof window.addEventListener;

      w.__fireBeforeInstallPrompt = (outcome = "dismissed") => {
        const evt = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
          prompt: () => Promise<void>;
          userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
        };
        evt.prompt = async () => {
          w.__promptCalled = (w.__promptCalled ?? 0) + 1;
        };
        evt.userChoice = Promise.resolve({ outcome });
        window.dispatchEvent(evt);
      };
    });
  });

  test("renders the install CTA when beforeinstallprompt fires", async ({ page }) => {
    await page.goto("/download-app");

    // Banner mounts in state C first.
    await expect(
      page.getByText("Install is available on the published live site", { exact: false }),
    ).toBeVisible();

    // Wait for the production listener (registered via dynamic import in
    // __root.tsx) to attach before dispatching.
    await waitForInstallPromptListener(page);

    await page.evaluate(() => {
      (window as unknown as { __fireBeforeInstallPrompt: () => void }).__fireBeforeInstallPrompt();
    });

    // Banner flips to state B.
    await expect(page.getByText("Faster booking, rewards and reminders.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Install", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Not now" })).toBeVisible();

    // State C copy should be gone.
    await expect(
      page.getByText("Install is available on the published live site", { exact: false }),
    ).toHaveCount(0);
  });

  test("clicking Install invokes prompt() and flips to installed state on accept", async ({ page }) => {
    await page.goto("/download-app");
    await waitForInstallPromptListener(page);

    await page.evaluate(() => {
      (window as unknown as {
        __fireBeforeInstallPrompt: (o: "accepted" | "dismissed") => void;
      }).__fireBeforeInstallPrompt("accepted");
    });

    await expect(page.getByRole("button", { name: "Install", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Install", exact: true }).click();

    // prompt() called exactly once via the synthetic event.
    await expect
      .poll(async () =>
        page.evaluate(() => (window as unknown as { __promptCalled: number }).__promptCalled),
      )
      .toBe(1);

    // Banner should now render the installed pill (state A).
    await expect(page.getByText("Nexora App is installed")).toBeVisible();
    await expect(page.getByRole("button", { name: "Install", exact: true })).toHaveCount(0);
  });

  test("Not now dismisses the banner and persists across reload", async ({ page }) => {
    await page.goto("/download-app");
    await waitForInstallPromptListener(page);

    await page.evaluate(() => {
      (window as unknown as { __fireBeforeInstallPrompt: () => void }).__fireBeforeInstallPrompt();
    });

    await expect(page.getByRole("button", { name: "Install", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Not now" }).click();

    await expect(page.getByRole("heading", { name: "Install Nexora App" })).toHaveCount(0);

    const stored = await page.evaluate(() =>
      localStorage.getItem("nexora_install_banner_dismissed_at"),
    );
    expect(stored).not.toBeNull();
    expect(Number(stored)).toBeGreaterThan(Date.now() - 60_000);

    // Reload — banner stays hidden (within the 7-day window).
    await page.reload();
    await expect(page.getByRole("heading", { name: "Install Nexora App" })).toHaveCount(0);
  });
});

test.describe("InstallBanner — standalone & appinstalled", () => {
  test("standalone display-mode is detected as installed", async ({ browser }) => {
    // Emulate the standalone display-mode media query that Chrome/Android set
    // when the app is launched from the home screen.
    const context = await browser.newContext({
      colorScheme: "light",
    });
    const page = await context.newPage();
    await page.emulateMedia({ media: "screen", colorScheme: "light", reducedMotion: null, forcedColors: null });
    // Playwright doesn't expose display-mode emulation directly; patch the
    // matchMedia call to report standalone before any app code runs.
    await context.addInitScript(() => {
      const origMatchMedia = window.matchMedia.bind(window);
      window.matchMedia = ((query: string) => {
        if (query.includes("display-mode: standalone")) {
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          } as MediaQueryList;
        }
        return origMatchMedia(query);
      }) as typeof window.matchMedia;
    });

    await page.goto("/download-app");

    await expect(page.getByText("Nexora App is installed")).toBeVisible();
    await expect(page.getByRole("button", { name: "Install", exact: true })).toHaveCount(0);

    await context.close();
  });

  test("beforeinstallprompt listener is wired via dynamic import from __root", async ({ page, context }) => {
    await context.addInitScript(() => {
      const w = window as unknown as { __bipListeners?: number };
      w.__bipListeners = 0;
      const origAdd = window.addEventListener.bind(window);
      window.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, opts?: boolean | AddEventListenerOptions) => {
        if (type === "beforeinstallprompt") {
          w.__bipListeners = (w.__bipListeners ?? 0) + 1;
        }
        return origAdd(type as never, listener as never, opts as never);
      }) as typeof window.addEventListener;
    });

    await page.goto("/download-app");

    // Production code should attach at least one beforeinstallprompt listener
    // (one from pwa-install capture, one from InstallBanner subscription).
    await page.waitForFunction(
      () => (window as unknown as { __bipListeners?: number }).__bipListeners! >= 1,
      { timeout: 10_000 },
    );

    const count = await page.evaluate(
      () => (window as unknown as { __bipListeners: number }).__bipListeners,
    );
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("appinstalled event transitions to installed state and persists across reload", async ({ page }) => {
    await page.goto("/download-app");

    // Initial state — not installed, no native prompt: state C.
    await expect(
      page.getByText("Install is available on the published live site", { exact: false }),
    ).toBeVisible();

    // Fire the native appinstalled event.
    await page.evaluate(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    // State A pill appears.
    await expect(page.getByText("Nexora App is installed")).toBeVisible();

    // Flag persisted to localStorage.
    const flag = await page.evaluate(() => localStorage.getItem("nexora_pwa_installed"));
    expect(flag).toBe("1");

    // Reload — installed state should be restored from localStorage.
    await page.reload();
    await expect(page.getByText("Nexora App is installed")).toBeVisible();
    await expect(page.getByRole("button", { name: "Install", exact: true })).toHaveCount(0);
    await expect(
      page.getByText("Install is available on the published live site", { exact: false }),
    ).toHaveCount(0);
  });
});
