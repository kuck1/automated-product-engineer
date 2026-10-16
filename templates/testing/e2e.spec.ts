import { expect, test } from "@playwright/test";

test("completes the critical review outcome", async ({ page }) => {
  await page.goto("/review");
  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText("Saved")).toBeVisible();
});

test("recovers without losing the user's work", async ({ page }) => {
  await page.route("**/api/review", async route => {
    await route.fulfill({ status: 503, body: JSON.stringify({ code: "temporarily_unavailable" }) });
  });
  await page.goto("/review");
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});
