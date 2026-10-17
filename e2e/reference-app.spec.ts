import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/examples/reset");
});

test("every public page uses the shared top bar", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  const routes = [
    "/",
    "/examples?view=releases",
    "/examples?view=onboarding",
    "/quick-start",
    "/guide",
    "/library",
    "/system",
  ];

  for (const route of routes) {
    await page.goto(route);
    const navigation = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(navigation.getByRole("link")).toHaveCount(5);
    await expect(page.getByRole("link", { name: "Open Source on GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/kuck1/automated-product-engineer-nextjs",
    );
  }
});

test("the shared top bar remains legible at tablet width", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.setViewportSize({ width: 820, height: 900 });
  await page.goto("/");

  const headerGeometry = await page.locator(".site-header").evaluate((header) => {
    const viewportWidth = document.documentElement.clientWidth;
    const links = [...header.querySelectorAll("nav a, .header-action")];
    return links.map((link) => {
      const box = link.getBoundingClientRect();
      return { left: box.left, right: box.right, viewportWidth };
    });
  });

  expect(headerGeometry).toHaveLength(6);
  for (const item of headerGeometry) {
    expect(item.left).toBeGreaterThanOrEqual(0);
    expect(item.right).toBeLessThanOrEqual(item.viewportWidth);
  }
});

test("landing page explains the complete delivery workflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(navigation.getByRole("link")).toHaveCount(5);
  await expect(navigation.getByRole("link", { name: "Release Readiness" })).toHaveAttribute("href", "/examples?view=releases");
  await expect(navigation.getByRole("link", { name: "Onboarding Operations" })).toHaveAttribute("href", "/examples?view=onboarding");
  await expect(navigation.getByRole("link", { name: "Quick Start" })).toHaveAttribute("href", "/quick-start");
  await expect(navigation.getByRole("link", { name: "Developer Guide" })).toHaveAttribute("href", "/guide");
  await expect(navigation.getByRole("link", { name: "Complete Skill Library" })).toHaveAttribute("href", "/library");
  await expect(page.getByRole("heading", { name: /Beautiful features/ })).toBeVisible();
  await expect(page.getByLabel(/Animated before and after comparison/)).toContainText("Before: one-off styles");
  await expect(page.getByRole("link", { name: "Open the Release Readiness case study" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open the Onboarding Operations case study" })).toBeVisible();
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
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Release Readiness" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByLabel("Release readiness reference kit")).toHaveClass(/reference-kit-arcade/);
  await page.getByRole("tab", { name: "Tokens" }).click();
  await expect(page.getByText("Decision focus", { exact: true })).toBeVisible();
  await expect(page.getByText("--release-action", { exact: true })).toBeVisible();
  const releaseTokenValues = await page.evaluate(() => {
    const kit = document.querySelector<HTMLElement>(".reference-kit-arcade");
    const app = document.querySelector<HTMLElement>(".release-control-tower");
    return {
      documented: kit ? getComputedStyle(kit).getPropertyValue("--release-action").trim() : "",
      consumed: app ? getComputedStyle(app).getPropertyValue("--release-action").trim() : "",
    };
  });
  expect(releaseTokenValues).toEqual({ documented: "#FFD43B", consumed: "#FFD43B" });
  await expect(page.getByText("Live policy service · deterministic memory adapter")).toBeVisible();
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
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Onboarding Operations" }).click();
  await expect(page).toHaveURL(/view=onboarding/);
  await expect(page.getByLabel("Onboarding operations reference kit")).toHaveClass(/reference-kit-minimal/);
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
  await page.goto("/guide");
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Developer Guide" })).toHaveAttribute("aria-current", "page");
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
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Complete Skill Library" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Start with the workflow, then inspect the playbook." })).toBeVisible();
  await expect(page.getByRole("button", { name: /RUN THE WHOLE WORKFLOW Automated Product Engineer/ })).toBeVisible();
  await page.getByRole("button", { name: /SHIP FROM CLAUDE Claude Design to App/ }).click();
  await expect(page.locator(".skill-preview").getByRole("heading", { name: "Choose the workflow" })).toBeVisible();
  await expect(page).toHaveURL(/skill=claude-design-to-app/);
  await expect(page.getByRole("heading", { name: "Ask for one artifact or the whole handoff." })).toBeVisible();
  await page.getByRole("button", { name: /Semantic token export/ }).click();
  await expect(page.locator(".prompt-preview .markdown-content").getByRole("heading", { name: "Semantic Token Export Prompt" })).toBeVisible();
  await expect(page.getByText("Provide DTCG-compatible", { exact: false })).toBeVisible();
  await expect(page.getByText("# Semantic Token Export Prompt", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Implementation", exact: true }).click();
  await expect(page.getByRole("button", { name: /Full-stack boundary map/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Semantic token export/ })).toHaveCount(0);
});

test("mobile workflow library remains readable without page overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/library?skill=figma-to-app-feature#skills");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole("button", { name: /SHIP FROM FIGMA Figma to App/ })).toBeVisible();
  await expect(page.locator(".skill-preview").getByRole("heading", { name: "Intake contract" })).toBeVisible();
});

test("example reference links open the requested prompt", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/library?prompt=boundaries#prompts");
  await expect(page.getByRole("heading", { name: "Full-stack boundary map", exact: true })).toBeVisible();
  await expect(page.getByText("Design the production boundaries", { exact: false })).toBeVisible();
});

test("design system tour explains hierarchy and swaps semantic tokens", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/system");
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Quick Start" })).toBeVisible();
  const heading = page.getByRole("heading", { name: "Design tokens. Components and patterns." });
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

test("quick start connects installation, workflows, and the developer guide", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/quick-start");
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Quick Start" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".quick-start-hero h1")).toContainText("Install the workflow");
  await expect(page.getByText("python3 scripts/install_ai_editor.py", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Automated Product Engineer/ })).toHaveAttribute("href", "/library?skill=automated-product-engineer#skills");
  await expect(page.getByRole("link", { name: /Open developer guide/ })).toHaveAttribute("href", "/guide");
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
