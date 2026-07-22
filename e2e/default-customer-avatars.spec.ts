import { expect, test } from "@playwright/test";

for (const gender of ["male", "female"] as const) {
  test(`${gender} automatic customer avatar is production-ready`, async ({ page, request }) => {
    const path = `/default-customer-${gender}.jpg`;
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/jpeg");
    expect((await response.body()).byteLength).toBeGreaterThan(20_000);

    await page.goto(path);
    const dimensions = await page
      .locator("img")
      .first()
      .evaluate((image: HTMLImageElement) => ({
        complete: image.complete,
        width: image.naturalWidth,
        height: image.naturalHeight,
      }));
    expect(dimensions).toEqual({ complete: true, width: 512, height: 512 });
  });
}
