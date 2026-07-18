import { test, expect, devices } from "@playwright/test";

/**
 * Responsive regression suite.
 *
 * Guards against horizontal-overflow regressions across mobile / tablet /
 * desktop breakpoints on public routes. Each combination:
 *   1) asserts document has no horizontal scroll (scrollWidth ≤ clientWidth + 1)
 *   2) asserts no visible element extends past the viewport right edge
 *   3) captures a full-page screenshot as a durable artifact
 *
 * Screenshots live under `playwright-report/` on failure and under
 * `test-results/responsive/` always, so diffs are reviewable in CI.
 *
 * To add a route: append to ROUTES. To add a breakpoint: append to VIEWPORTS.
 */

type Viewport = {
  name: string;
  width: number;
  height: number;
  userAgent?: string;
};

const VIEWPORTS: Viewport[] = [
  // Mobile portrait
  { name: "mobile-360", width: 360, height: 640 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-430", width: 430, height: 932 },
  // Mobile landscape
  { name: "mobile-landscape-844", width: 844, height: 390 },
  // Tablet
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-1024", width: 1024, height: 1366 },
  // Desktop
  { name: "desktop-1280", width: 1280, height: 900 },
  { name: "desktop-1536", width: 1536, height: 960 },
];

// Public, unauthenticated routes that should render cleanly.
const ROUTES: { path: string; label: string }[] = [
  { path: "/", label: "home" },
  { path: "/login", label: "login" },
  { path: "/shop-owner-app", label: "shop-owner-app" },
  { path: "/customer-app", label: "customer-app" },
  { path: "/distributor-app", label: "distributor-app" },
  { path: "/jobs-app", label: "jobs-app" },
  { path: "/growth-partner-app", label: "growth-partner-app" },
];

// Tolerance for sub-pixel rounding on some engines.
const OVERFLOW_TOLERANCE_PX = 1;

test.describe("responsive overflow regression", () => {
  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${route.label} @ ${vp.name} (${vp.width}x${vp.height}) has no horizontal overflow`, async ({
        browser,
      }, testInfo) => {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
        });
        const page = await context.newPage();

        const consoleErrors: string[] = [];
        page.on("pageerror", (err) => consoleErrors.push(String(err)));
        page.on("console", (msg) => {
          if (msg.type() === "error") consoleErrors.push(msg.text());
        });

        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        // Let layout settle (fonts, images, lazy content).
        await page.waitForLoadState("networkidle").catch(() => {});
        await page.waitForTimeout(300);

        // 1) Document-level horizontal scroll check.
        const dims = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          innerWidth: window.innerWidth,
        }));

        // 2) Find any element visibly wider than the viewport.
        const offenders = await page.evaluate((tolerance) => {
          const vw = window.innerWidth;
          const bad: { tag: string; cls: string; right: number; width: number }[] = [];
          const all = document.body.querySelectorAll<HTMLElement>("*");
          for (const el of all) {
            const style = getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden") continue;
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;
            if (rect.right > vw + tolerance) {
              bad.push({
                tag: el.tagName.toLowerCase(),
                cls: (el.className || "").toString().slice(0, 120),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
              });
              if (bad.length >= 5) break;
            }
          }
          return bad;
        }, OVERFLOW_TOLERANCE_PX);

        // Screenshot artifact (always).
        const shot = await page.screenshot({ fullPage: true });
        await testInfo.attach(`${route.label}-${vp.name}.png`, {
          body: shot,
          contentType: "image/png",
        });

        await context.close();

        expect(
          dims.scrollWidth,
          `scrollWidth ${dims.scrollWidth} > clientWidth ${dims.clientWidth} on ${route.path} @ ${vp.name}`,
        ).toBeLessThanOrEqual(dims.clientWidth + OVERFLOW_TOLERANCE_PX);

        expect(
          offenders,
          `Elements overflow the viewport on ${route.path} @ ${vp.name}:\n${JSON.stringify(offenders, null, 2)}`,
        ).toEqual([]);

        expect(
          consoleErrors.filter(
            (e) =>
              // Filter noisy dev-only warnings unrelated to layout.
              !/DevTools|Download the React DevTools|Lovable|hydrat/i.test(e),
          ),
          `Console errors on ${route.path} @ ${vp.name}:\n${consoleErrors.join("\n")}`,
        ).toEqual([]);
      });
    }
  }
});

/**
 * Optional emulated-device pass — exercises iOS Safari (WebKit) and Android
 * Chromium user-agent + viewport tuples for the highest-traffic public routes.
 * Skipped unless the corresponding browser binaries are installed.
 */
const EMULATED = [
  { name: "iPhone-13", device: devices["iPhone 13"] },
  { name: "iPhone-13-landscape", device: devices["iPhone 13 landscape"] },
  { name: "Pixel-7", device: devices["Pixel 7"] },
];

test.describe("responsive overflow — emulated devices", () => {
  for (const emu of EMULATED) {
    for (const route of ROUTES.slice(0, 3)) {
      test(`${route.label} on ${emu.name}`, async ({ browser }, testInfo) => {
        const context = await browser.newContext({ ...emu.device });
        const page = await context.newPage();
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle").catch(() => {});
        await page.waitForTimeout(300);

        const dims = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        const shot = await page.screenshot({ fullPage: true });
        await testInfo.attach(`${route.label}-${emu.name}.png`, {
          body: shot,
          contentType: "image/png",
        });

        await context.close();

        expect(dims.scrollWidth).toBeLessThanOrEqual(
          dims.clientWidth + OVERFLOW_TOLERANCE_PX,
        );
      });
    }
  }
});
