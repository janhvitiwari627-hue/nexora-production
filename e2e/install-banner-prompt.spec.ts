import { test, expect } from "@playwright/test";

/**
 * Verifies the "prompt available" (state B) branch of <InstallBanner /> on
 * /download-app.
 *
 * Real Chrome only fires `beforeinstallprompt` when the origin meets full
 * PWA install criteria (served HTTPS, valid manifest, service worker,
 * top-level context, engagement heuristic). None of that is reproducible
 * in a local Playwright run, so we synthesize the event before the app
 * boots and dispatch it after the banner has mounted. The banner reads
 * the event through the same `subscribeInstallPrompt` bus the real event
 * flows through, so this exercises the production code path.
 */

test.describe("InstallBanner — prompt available state", () => {
  test.beforeEach(async ({ context }) => {
    // Clear any stale dismiss / installed markers before each test.
    await context.addInitScript(() => {
      try {
        localStorage.removeItem("nexora_install_banner_dismissed_at");
        localStorage.removeItem("nexora_pwa_installed");
      } catch {
        /* ignore */
      }

      // Attach a synthetic beforeinstallprompt harness. We stash a
      // dispatcher on window so the test can trigger it AFTER the
      // banner mounts and subscribes.
      const w = window as unknown as {
        __fireBeforeInstallPrompt?: (outcome?: "accepted" | "dismissed") => Event;
        __lastPromptOutcome?: "accepted" | "dismissed";
        __promptCalled?: number;
      };
      w.__promptCalled = 0;
      w.__fireBeforeInstallPrompt = (outcome = "dismissed") => {
        w.__lastPromptOutcome = outcome;
        const evt = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
          prompt: () => Promise<void>;
          userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
        };
        evt.prompt = async () => {
          (w.__promptCalled as number) = (w.__promptCalled ?? 0) + 1;
        };
        evt.userChoice = Promise.resolve({ outcome });
        window.dispatchEvent(evt);
        return evt;
      };
    });
  });

  test("renders the install CTA when beforeinstallprompt fires", async ({ page }) => {
    await page.goto("/download-app");

    // Wait for the C-state (no prompt) card to be visible first — this
    // guarantees the banner has mounted and subscribed.
    await expect(
      page.getByText("Install is available on the published live site", { exact: false }),
    ).toBeVisible();

    // Fire the synthetic event.
    await page.evaluate(() => {
      (window as unknown as { __fireBeforeInstallPrompt: () => void }).__fireBeforeInstallPrompt();
    });

    // Banner should flip to state B.
    await expect(page.getByRole("heading", { name: "Install Nexora App" })).toBeVisible();
    await expect(page.getByText("Faster booking, rewards and reminders.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Install", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Not now" })).toBeVisible();
  });

  test("clicking Install invokes prompt() and flips to installed state on accept", async ({ page }) => {
    await page.goto("/download-app");

    await page.evaluate(() => {
      (window as unknown as {
        __fireBeforeInstallPrompt: (o: "accepted" | "dismissed") => void;
      }).__fireBeforeInstallPrompt("accepted");
    });

    await expect(page.getByRole("button", { name: "Install", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Install", exact: true }).click();

    // prompt() should have been called exactly once.
    const called = await page.evaluate(
      () => (window as unknown as { __promptCalled: number }).__promptCalled,
    );
    expect(called).toBe(1);

    // Banner should now render the installed pill (state A).
    await expect(page.getByText("Nexora App is installed")).toBeVisible();
    await expect(page.getByRole("button", { name: "Install", exact: true })).toHaveCount(0);
  });

  test("Not now dismisses the banner and persists for the 7-day window", async ({ page }) => {
    await page.goto("/download-app");

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

    // Reload — banner should stay hidden.
    await page.reload();
    await expect(page.getByRole("heading", { name: "Install Nexora App" })).toHaveCount(0);
  });
});
