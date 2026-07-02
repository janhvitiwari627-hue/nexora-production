import { test, expect } from "@playwright/test";
test("dbg", async ({ context, page }) => {
  await context.addInitScript(() => {
    const w = window as any;
    w.__fire = (o = "dismissed") => {
      const e: any = new Event("beforeinstallprompt", { cancelable: true });
      e.prompt = async () => {};
      e.userChoice = Promise.resolve({ outcome: o });
      window.dispatchEvent(e);
    };
  });
  await page.goto("/download-app");
  await expect(page.getByText("Install is available on the published", { exact: false })).toBeVisible();
  const hasFire = await page.evaluate(() => typeof (window as any).__fire);
  console.log("typeof __fire:", hasFire);
  await page.evaluate(() => (window as any).__fire());
  await page.waitForTimeout(500);
  const txt = await page.evaluate(() => document.querySelector("main section")?.textContent?.slice(0, 400));
  console.log("banner text:", txt);
});
