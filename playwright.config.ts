import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for header / auth-flash e2e tests.
 *
 * Assumes the Vite dev server is reachable at PLAYWRIGHT_BASE_URL
 * (default: http://localhost:8080). Start it with `bun run dev` in
 * another terminal, or set `webServer` below to auto-start.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [
    ["list"],
    // HTML report uploaded as a CI artifact on failure.
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
          : undefined,
      },
    },
  ],
});
