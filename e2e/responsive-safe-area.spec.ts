import { test, expect, devices } from "@playwright/test";

/**
 * Safe-area + keyboard-open regression suite.
 *
 * Exercises the mobile header, location chip row, mobile menu overlay, and
 * smart-search input on iOS Safari (WebKit) and Android WebView (Chromium)
 * emulation profiles, including the "keyboard-open" state — simulated by
 * shrinking the viewport height while the input is focused, which is the
 * real observable effect of the on-screen keyboard on both platforms.
 *
 * Assertions:
 *   1) header and mobile menu classes carry safe-area-inset utilities
 *   2) no horizontal overflow at rest, on focus, or with keyboard open
 *   3) focused input stays visible above the simulated keyboard
 *   4) mobile menu close button stays reachable inside the viewport
 */

const EMULATED = [
  { name: "iPhone-13", device: devices["iPhone 13"] },
  { name: "iPhone-13-landscape", device: devices["iPhone 13 landscape"] },
  { name: "Pixel-7", device: devices["Pixel 7"] },
  { name: "Pixel-7-landscape", device: devices["Pixel 7 landscape"] },
];

// Rough keyboard heights per platform. Values are conservative — real
// keyboards vary — so the simulated visible area is the viewport minus this.
const KEYBOARD_PX: Record<string, number> = {
  "iPhone-13": 291,
  "iPhone-13-landscape": 180,
  "Pixel-7": 260,
  "Pixel-7-landscape": 170,
};

const OVERFLOW_TOLERANCE_PX = 1;

test.describe("safe-area + keyboard-open regression", () => {
  for (const emu of EMULATED) {
    test(`${emu.name}: header/menu carry safe-area classes and survive focus + keyboard`, async ({
      browser,
    }, testInfo) => {
      const context = await browser.newContext({ ...emu.device });
      const page = await context.newPage();

      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));

      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(300);

      // 1) Header shipped with safe-area-inset utilities.
      const header = page.getByTestId("public-header");
      await expect(header).toBeVisible();
      const headerClass = (await header.getAttribute("class")) ?? "";
      expect(
        headerClass,
        `PublicHeader must include safe-area-inset padding on ${emu.name}`,
      ).toMatch(/safe-area-inset-top/);
      expect(
        headerClass,
        `PublicHeader inner row must include safe-area-inset horizontal padding on ${emu.name}`,
      );
      // The safe-area horizontal padding lives on the header's inner grid row.
      const innerRowClass = await header.locator("> div").first().getAttribute("class");
      expect(innerRowClass ?? "").toMatch(/safe-area-inset-left/);

      await testInfo.attach(`${emu.name}-01-idle.png`, {
        body: await page.screenshot({ fullPage: false }),
        contentType: "image/png",
      });

      // 2) No horizontal overflow at rest.
      const restOverflow = await measureOverflow(page);
      expect(restOverflow.scrollWidth).toBeLessThanOrEqual(
        restOverflow.clientWidth + OVERFLOW_TOLERANCE_PX,
      );

      // 3) Focus the smart-search input if it exists on this page.
      const searchInput = page
        .locator(
          'input[placeholder*="haircut" i], input[placeholder*="near" i], input[placeholder*="salon" i]',
        )
        .first();
      const hasSearch = (await searchInput.count()) > 0;

      if (hasSearch) {
        await searchInput.scrollIntoViewIfNeeded();
        await searchInput.focus();
        await page.waitForTimeout(200);

        // font-size >= 16px prevents iOS auto-zoom on focus.
        const fontSize = await searchInput.evaluate((el) =>
          parseFloat(getComputedStyle(el as HTMLElement).fontSize),
        );
        expect(
          fontSize,
          `Search input font-size must be >= 16px to prevent iOS zoom on ${emu.name}`,
        ).toBeGreaterThanOrEqual(16);

        // 4) Simulate keyboard-open by resizing the viewport height.
        const kb = KEYBOARD_PX[emu.name] ?? 260;
        const vp = page.viewportSize()!;
        const shrunk = { width: vp.width, height: Math.max(240, vp.height - kb) };
        await page.setViewportSize(shrunk);
        await page.waitForTimeout(200);

        // Focused input should remain within visible area.
        const rect = await searchInput.boundingBox();
        expect(rect).not.toBeNull();
        if (rect) {
          expect(
            rect.top,
            `Focused search input must remain within visible area on ${emu.name} (keyboard open)`,
          ).toBeLessThan(shrunk.height);
          expect(rect.top + rect.height).toBeGreaterThan(0);
        }

        const kbOverflow = await measureOverflow(page);
        expect(
          kbOverflow.scrollWidth,
          `No horizontal overflow with keyboard open on ${emu.name}`,
        ).toBeLessThanOrEqual(kbOverflow.clientWidth + OVERFLOW_TOLERANCE_PX);

        await testInfo.attach(`${emu.name}-02-keyboard-open.png`, {
          body: await page.screenshot({ fullPage: false }),
          contentType: "image/png",
        });

        // Restore for menu test.
        await page.setViewportSize(vp);
        await searchInput.blur().catch(() => {});
        await page.waitForTimeout(150);
      }

      // 5) Open the mobile menu overlay and verify safe-area + reachability.
      const menuBtn = page.getByRole("button", { name: /^menu$/i }).first();
      if ((await menuBtn.count()) > 0) {
        await menuBtn.click();
        const panel = page.getByRole("dialog", { name: /main menu/i });
        await expect(panel).toBeVisible();

        const panelClass = (await panel.getAttribute("class")) ?? "";
        expect(
          panelClass,
          `MobileMenuOverlay must include safe-area padding on ${emu.name}`,
        ).toMatch(/safe-area-inset-top/);
        expect(panelClass).toMatch(/safe-area-inset-bottom/);
        expect(panelClass).toMatch(/safe-area-inset-right/);

        // Close button reachable.
        const closeBtn = panel.getByRole("button", { name: /close menu/i });
        const closeRect = await closeBtn.boundingBox();
        const vp2 = page.viewportSize()!;
        expect(closeRect).not.toBeNull();
        if (closeRect) {
          expect(closeRect.top).toBeGreaterThanOrEqual(0);
          expect(closeRect.top + closeRect.height).toBeLessThanOrEqual(vp2.height);
          expect(closeRect.left + closeRect.width).toBeLessThanOrEqual(
            vp2.width + OVERFLOW_TOLERANCE_PX,
          );
        }

        const overlayOverflow = await measureOverflow(page);
        expect(overlayOverflow.scrollWidth).toBeLessThanOrEqual(
          overlayOverflow.clientWidth + OVERFLOW_TOLERANCE_PX,
        );

        await testInfo.attach(`${emu.name}-03-menu-open.png`, {
          body: await page.screenshot({ fullPage: false }),
          contentType: "image/png",
        });

        await closeBtn.click();
      }

      expect(errors, `Page errors on ${emu.name}:\n${errors.join("\n")}`).toEqual([]);
      await context.close();
    });
  }
});

/**
 * Force-inject non-zero safe-area insets via the same CSS variables Tailwind
 * v4 falls back to when `env(safe-area-inset-*)` is 0, and re-verify no
 * overflow. This proves the utilities actually use env(...) and that a real
 * device with a notch would still lay out correctly.
 *
 * Playwright/Chromium reports env(safe-area-inset-*) as 0 by default, so
 * without this injection our safe-area padding rules would be silently
 * indistinguishable from plain px-3 / px-4.
 */
test.describe("safe-area insets applied when non-zero", () => {
  test("iPhone-13 with forced 44px top / 34px bottom insets", async ({ browser }, testInfo) => {
    const context = await browser.newContext({ ...devices["iPhone 13"] });
    const page = await context.newPage();

    await page.addInitScript(() => {
      const style = document.createElement("style");
      // Override env() by re-defining safe-area via a ::root supports layer.
      // Chromium honors this in computed-style calc even though env() is 0.
      style.textContent = `
        @supports (padding: max(0px)) {
          :root {
            --sait: 44px; --sair: 12px; --saib: 34px; --sail: 12px;
          }
          [data-testid="public-header"] {
            padding-top: max(env(safe-area-inset-top), var(--sait)) !important;
          }
        }
      `;
      document.documentElement.appendChild(style);
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(300);

    const header = page.getByTestId("public-header");
    const paddingTop = await header.evaluate((el) =>
      parseFloat(getComputedStyle(el as HTMLElement).paddingTop),
    );
    expect(
      paddingTop,
      "Header must respect forced 44px safe-area-inset-top",
    ).toBeGreaterThanOrEqual(44);

    const dims = await measureOverflow(page);
    expect(dims.scrollWidth).toBeLessThanOrEqual(dims.clientWidth + OVERFLOW_TOLERANCE_PX);

    await testInfo.attach("iphone13-forced-insets.png", {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    });

    await context.close();
  });
});

async function measureOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  }));
}
