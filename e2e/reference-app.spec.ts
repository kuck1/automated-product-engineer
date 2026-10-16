import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/examples/reset");
});

test("landing page explains the complete delivery workflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(navigation.getByRole("link", { name: "Workflow" })).toHaveCount(0);
  await expect(navigation.getByRole("link", { name: "Examples" })).toHaveAttribute("href", "/examples");
  await expect(page.getByRole("heading", { name: /Beautiful features/ })).toBeVisible();
  await expect(page.getByLabel(/Animated before and after comparison/)).toContainText("Before: one-off styles");
  await expect(page.getByRole("heading", { name: "Release Readiness" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Onboarding Operations" })).toBeVisible();
});

test("before and after cards stay aligned across viewports", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const alignment = await page.evaluate(() => {
    const before = document.querySelector<HTMLElement>(".flow-before-window .flow-card")?.getBoundingClientRect();
    const after = document.querySelector<HTMLElement>(".flow-after-window .flow-card")?.getBoundingClientRect();
    if (!before || !after) return null;
    return {
      x: Math.abs(before.x - after.x),
      y: Math.abs(before.y - after.y),
      width: Math.abs(before.width - after.width),
      height: Math.abs(before.height - after.height),
    };
  });
  expect(alignment).not.toBeNull();
  expect(alignment?.x).toBeLessThanOrEqual(0.5);
  expect(alignment?.y).toBeLessThanOrEqual(0.5);
  expect(alignment?.width).toBeLessThanOrEqual(0.5);
  expect(alignment?.height).toBeLessThanOrEqual(0.5);
});

test("release policy rejects an incomplete ship and rolls the optimistic state back", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/examples?view=releases");
  await expect(page.getByRole("button", { name: /Client app 01 Release readiness 3 releases/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Client app 02 Onboarding ops 3 accounts/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /How we built them Developer guide Guide/i })).toBeVisible();
  await page.getByRole("tab", { name: "Tokens" }).click();
  await expect(page.getByText("Decision focus", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Prompts" }).click();
  await expect(page.getByRole("link", { name: /Full-stack boundary map/ })).toHaveAttribute("href", "/library?prompt=boundaries#prompts");
  await expect(page.getByLabel("Release policy control tower")).toBeVisible();
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
  await expect(page.getByLabel("Onboarding operations reference kit")).toBeVisible();
  await page.getByRole("tab", { name: "Design system" }).click();
  await expect(page.getByText("Journey before table", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Customer onboarding journey")).toBeVisible();
  const customer = page.getByRole("article").filter({ hasText: "Northstar Health" });
  await customer.getByRole("button", { name: "Begin training" }).click();
  await expect(page.getByRole("status")).toContainText("moved to training");
  await expect(page.getByRole("region", { name: "Training" })).toContainText("Northstar Health");
  await expect(page.getByRole("article").filter({ hasText: "Northstar Health" }).getByRole("button", { name: "Launch customer" })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/view=releases/);
});

test("developer guide embeds the ownership chain and real source excerpts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/examples?view=architecture");
  await expect(page.getByRole("heading", { name: "One action. Every boundary. No missing middle." })).toBeVisible();
  await page.getByRole("button", { name: /Domain ExampleService/ }).click();
  await expect(page.getByText("authorize(actor, release.workspaceId);", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Give every state one owner." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evidence follows the architecture." })).toBeVisible();
  await expect(page.getByRole("link", { name: /architecture decision/i })).toHaveCount(0);
});

test("skills library exposes specialist workflows and copy-ready prompts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/library");
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Library" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Skills library" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Claude Design to App" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Figma to App" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ask for one artifact or the whole handoff." })).toBeVisible();
  await page.getByRole("button", { name: /Semantic token export/ }).click();
  await expect(page.getByText("Provide DTCG-compatible", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Implementation", exact: true }).click();
  await expect(page.getByRole("button", { name: /Full-stack boundary map/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Semantic token export/ })).toHaveCount(0);
});

test("example reference links open the requested prompt", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/library?prompt=boundaries#prompts");
  await expect(page.getByRole("heading", { name: "Full-stack boundary map" })).toBeVisible();
  await expect(page.getByText("Design the production boundaries", { exact: false })).toBeVisible();
});

test("design system tour explains hierarchy and swaps semantic tokens", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/system");
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "System" })).toHaveAttribute("aria-current", "page");
  const heading = page.getByRole("heading", { name: "See the rules. Feel the system." });
  await expect(heading).toBeVisible();
  expect((await heading.boundingBox())?.y).toBeLessThan(340);
  await expect(page.getByText("Interactive focus and brand expression")).toBeVisible();
  await page.getByRole("button", { name: /Mint focus/ }).click();
  await page.getByRole("button", { name: /Soft/ }).click();
  await page.getByRole("button", { name: "Compact" }).click();
  await expect(page.getByText("Mint focus + Soft + compact", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Repeat product decisions, not just pixels." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recover without losing intent" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Browse 12 prompts/ })).toBeVisible();
});

test("mobile design system tour stays within the viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/system");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole("link", { name: /Token playground/ })).toBeVisible();
});

test("desktop landing visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page).toHaveScreenshot("landing-desktop.png", { fullPage: true, animations: "disabled" });
});

test("mobile landing visual and overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page).toHaveScreenshot("landing-mobile.png", { fullPage: true, animations: "disabled" });
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
