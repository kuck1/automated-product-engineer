#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const configPath = process.argv[2] ?? "templates/automation/demo.frames.json";
const baseUrl = process.env.DEMO_BASE_URL ?? "http://127.0.0.1:3000";
const config = JSON.parse(await readFile(configPath, "utf8"));
const outputDir = path.resolve(config.outputDir);

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const captures = [];

try {
  for (const frame of config.frames) {
    const context = await browser.newContext({ viewport: frame.viewport });
    const page = await context.newPage();
    const consoleErrors = [];
    const networkErrors = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", (request) => {
      networkErrors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.request().method()} ${response.url()}`);
      }
    });

    const url = new URL(frame.path, baseUrl).toString();
    await page.goto(url, { waitUntil: "networkidle" });

    if (frame.readyRole && frame.readyName) {
      await page.getByRole(frame.readyRole, { name: frame.readyName }).waitFor();
    }

    const file = path.join(outputDir, `${frame.name}.png`);
    await page.screenshot({ path: file, fullPage: frame.fullPage ?? true });
    captures.push({
      name: frame.name,
      step: frame.step,
      path: frame.path,
      viewport: frame.viewport,
      file: path.relative(process.cwd(), file),
      consoleErrors,
      networkErrors,
    });

    await context.close();
  }
} finally {
  await browser.close();
}

const manifest = {
  baseUrl,
  capturedAt: new Date().toISOString(),
  captures,
};

await writeFile(
  path.join(outputDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

if (
  captures.some(
    (capture) => capture.consoleErrors.length > 0 || capture.networkErrors.length > 0,
  )
) {
  console.error("Screenshots were captured, but browser or network errors were detected.");
  process.exitCode = 1;
} else {
  console.log(`Captured ${captures.length} demo frames in ${outputDir}`);
}
