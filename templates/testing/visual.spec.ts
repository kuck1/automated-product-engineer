import { expect, test } from "@playwright/test";

const cases = [
  { name: "default desktop", path: "/design-system/review?fixture=default", width: 1440, height: 1000 },
  { name: "error mobile", path: "/design-system/review?fixture=error", width: 390, height: 844 },
];

for (const fixture of cases) {
  test(fixture.name, async ({ page }) => {
    await page.setViewportSize({ width: fixture.width, height: fixture.height });
    await page.goto(fixture.path);
    await expect(page.getByRole("main")).toHaveScreenshot(`${fixture.name}.png`, {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    });
  });
}
