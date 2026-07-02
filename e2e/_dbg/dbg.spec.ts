import { test } from "@playwright/test";
test("dbg", async ({ context, page }) => {
  await context.addInitScript(() => {
    const w = window as any;
    w.__bipCount = 0;
    const origAdd = window.addEventListener.bind(window);
    window.addEventListener = ((type: any, l: any, o: any) => {
      if (type === "beforeinstallprompt") w.__bipCount++;
      return origAdd(type, l, o);
    }) as any;
    w.__fire = () => {
      const e: any = new Event("beforeinstallprompt", { cancelable: true });
      e.prompt = async () => {};
      e.userChoice = Promise.resolve({ outcome: "dismissed" });
      window.dispatchEvent(e);
    };
  });
  await page.goto("/download-app");
  await page.waitForTimeout(2500);
  console.log("bipCount before:", await page.evaluate(() => (window as any).__bipCount));
  await page.evaluate(() => (window as any).__fire());
  await page.waitForTimeout(800);
  const txt = await page.evaluate(() => document.querySelector("main section")?.textContent?.slice(0, 300));
  console.log("banner:", txt);
});
