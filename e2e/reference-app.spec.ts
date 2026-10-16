import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/examples/reset");
});

test("landing page explains the complete delivery workflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Ship the whole feature/ })).toBeVisible();
  await expect(page.getByLabel("Animated product delivery workflow")).toContainText("Draft PR");
  await expect(page.getByRole("heading", { name: "Release Readiness" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Onboarding Operations" })).toBeVisible();
});

test("release policy rejects an incomplete ship and rolls the optimistic state back", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/examples?view=releases");
  const release = page.getByRole("article").filter({ hasText: "Mobile checkout refresh" });
  await release.getByRole("button", { name: "Mark ready" }).click();
  await expect(page.getByRole("status")).toContainText("Required gates and approvals must pass");
  await expect(release).toContainText("validating");
  await release.getByRole("button", { name: "Block release" }).click();
  await expect(page.getByRole("status")).toContainText("moved to blocked");
  await expect(release).toContainText("blocked");
});

test("onboarding transition uses URL state and reconciles the canonical response", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/examples?view=releases");
  await page.getByRole("button", { name: /Onboarding ops/ }).click();
  await expect(page).toHaveURL(/view=onboarding/);
  const customer = page.getByRole("article").filter({ hasText: "Northstar Health" });
  await customer.getByRole("button", { name: "Begin training" }).click();
  await expect(page.getByRole("status")).toContainText("moved to training");
  await expect(customer).toContainText("training");
  await page.goBack();
  await expect(page).toHaveURL(/view=releases/);
});

test("architecture view maps the end-to-end ownership chain", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/examples?view=architecture");
  await expect(page.getByText("ExampleService", { exact: true })).toBeVisible();
  await expect(page.getByText("ExampleRepository", { exact: true })).toBeVisible();
  await expect(page.getByText("Optimistic intent + rollback")).toBeVisible();
});

test("skills library exposes the specialist workflows and design meta-prompts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Skills library" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Claude Design to App" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Figma to App" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Claude Design full export/ })).toBeVisible();
});

test("desktop landing visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page).toHaveScreenshot("landing-desktop.png", { fullPage: true, animations: "disabled" });
});

test("desktop release case study visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/examples?view=releases");
  await expect(page).toHaveScreenshot("release-readiness-desktop.png", { fullPage: true, animations: "disabled" });
});

test("desktop skills library visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/library");
  await expect(page).toHaveScreenshot("skills-library-desktop.png", { fullPage: true, animations: "disabled" });
});

test("mobile examples visual and overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/examples?view=onboarding");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page).toHaveScreenshot("examples-mobile.png", { fullPage: true, animations: "disabled" });
});
