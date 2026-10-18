import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(packageRoot, "bin", "automated-product-engineer.mjs");

function fixture(manifest, appJson) {
  const root = mkdtempSync(path.join(tmpdir(), "ape-native-"));
  writeFileSync(path.join(root, "package.json"), JSON.stringify(manifest));
  writeFileSync(path.join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  if (appJson) writeFileSync(path.join(root, "app.json"), JSON.stringify(appJson));
  return root;
}

function writeFixtureFile(root, name, content) {
  const destination = path.join(root, name);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, content);
}

function run(args, cwd) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8" });
}

test("doctor identifies an Expo Router development-client project", () => {
  const root = fixture({ name: "field-app", dependencies: { expo: "^55", "react-native": "^0.83", "expo-router": "^6", "expo-dev-client": "^6", "expo-auth-session": "^7" } }, { expo: { name: "Field App", scheme: "field-app", ios: { bundleIdentifier: "com.example.field" }, android: { package: "com.example.field" } } });
  try {
    const result = run(["doctor", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const profile = JSON.parse(result.stdout);
    assert.equal(profile.kind, "expo");
    assert.equal(profile.router, "expo-router");
    assert.equal(profile.packageManager, "pnpm");
    assert.equal(profile.usesDevelopmentClient, true);
    assert.equal(profile.app.scheme, "field-app");
    assert.deepEqual(profile.findings.map((finding) => finding.code), ["eas-unconfigured"]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("default install selects native examples and records the detected profile", () => {
  const root = fixture({ name: "native-app", dependencies: { expo: "^55", "react-native": "^0.83", "expo-router": "^6" } }, { expo: { name: "Native App", scheme: "native-app" } });
  try {
    const result = run(["install", "--only", "examples"], root);
    assert.equal(result.status, 0, result.stderr);
    const toolkit = path.join(root, ".automated-product-engineer");
    assert.equal(existsSync(path.join(toolkit, "native", "examples", "versioned-outbox.ts")), true);
    assert.equal(existsSync(path.join(toolkit, "native", "case-studies", "field-relay", "field-mission.ts")), true);
    assert.equal(existsSync(path.join(toolkit, "app", "examples", "page.tsx")), false);
    const profile = JSON.parse(readFileSync(path.join(toolkit, "project-profile.json"), "utf8"));
    assert.equal(profile.kind, "expo");
    assert.match(readFileSync(path.join(toolkit, "INSTALLATION.md"), "utf8"), /Native project path/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("doctor calls out native auth without a development build or scheme", () => {
  const root = fixture({ name: "auth-app", dependencies: { expo: "^55", "react-native": "^0.83", "expo-auth-session": "^7" } });
  try {
    mkdirSync(path.join(root, "ios"));
    const result = run(["doctor", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const profile = JSON.parse(result.stdout);
    assert.deepEqual(profile.nativeDirectories, ["ios"]);
    assert.deepEqual(profile.findings.map((finding) => finding.code), ["scheme-missing", "eas-unconfigured", "auth-needs-dev-build"]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("doctor recognizes dynamic Expo config without guessing resolved values", () => {
  const root = fixture({ name: "dynamic-app", dependencies: { expo: "^55", "react-native": "^0.83" } });
  try {
    writeFixtureFile(root, "app.config.ts", "export default ({ config }) => ({ ...config, scheme: process.env.APP_SCHEME });\n");
    const result = run(["doctor", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const profile = JSON.parse(result.stdout);
    assert.equal(profile.configSource, "app.config.ts");
    assert.equal(profile.app.scheme, null);
    assert.deepEqual(profile.findings.map((finding) => finding.code), ["dynamic-config", "eas-unconfigured"]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("web installation retains web examples and remains repeatable", () => {
  const root = fixture({ name: "web-app", dependencies: { next: "^16", react: "^19" } });
  try {
    const first = run(["install", "--only", "examples"], root);
    assert.equal(first.status, 0, first.stderr);
    const second = run(["install", "--only", "examples"], root);
    assert.equal(second.status, 0, second.stderr);
    const toolkit = path.join(root, ".automated-product-engineer");
    assert.equal(existsSync(path.join(toolkit, "app", "examples", "page.tsx")), true);
    assert.equal(existsSync(path.join(toolkit, "native", "examples")), false);
    const profile = JSON.parse(readFileSync(path.join(toolkit, "project-profile.json"), "utf8"));
    assert.equal(profile.kind, "nextjs");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("launch rejects non-Expo projects before invoking a package manager", () => {
  const root = fixture({ name: "web-app", dependencies: { next: "^16", react: "^19" } });
  try {
    const result = run(["launch"], root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Launch requires an Expo or React Native project/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("launch selects Expo development client and bare React Native commands", () => {
  const expo = fixture({ name: "expo-app", dependencies: { expo: "^55", "react-native": "^0.83", "expo-dev-client": "^6" } }, { expo: { name: "Expo App", scheme: "expo-app" } });
  const bare = fixture({ name: "bare-app", dependencies: { "react-native": "^0.83", react: "^19" } });
  try {
    const expoResult = run(["launch", "--ios", "--dry-run"], expo);
    assert.equal(expoResult.status, 0, expoResult.stderr);
    assert.match(expoResult.stdout, /pnpm exec expo start --dev-client --ios/);
    const bareResult = run(["launch", "--android", "--dry-run"], bare);
    assert.equal(bareResult.status, 0, bareResult.stderr);
    assert.match(bareResult.stdout, /pnpm exec react-native run-android/);
  } finally {
    rmSync(expo, { recursive: true, force: true });
    rmSync(bare, { recursive: true, force: true });
  }
});

test("audit reports concrete state, concurrency, and credential risks without modifying the project", () => {
  const root = fixture({ name: "audit-app", dependencies: { next: "^16", react: "^19" }, scripts: { build: "next build" } });
  try {
    writeFixtureFile(root, "src/app/points.tsx", 'useEffect(() => { fetch("/api/points"); }, []);\n');
    writeFixtureFile(root, "src/components/feed.tsx", 'useEffect(() => { fetch("/api/feed"); }, []);\n');
    writeFixtureFile(root, "src/app/save.ts", 'export const save = () => fetch("/api/items", { method: "POST" });\n');
    writeFixtureFile(root, "src/app/client.ts", 'const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;\n');
    const before = readFileSync(path.join(root, "src/app/client.ts"), "utf8");

    const result = run(["audit", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    const byId = Object.fromEntries(report.findings.map((finding) => [finding.id, finding]));
    assert.equal(byId["server-state-cache"].status, "risk");
    assert.equal(byId["concurrency-retry"].status, "opportunity");
    assert.equal(byId["auth-data-boundary"].status, "risk");
    assert.deepEqual(byId["server-state-cache"].evidence, ["src/app/points.tsx", "src/components/feed.tsx"]);
    assert.match(report.nextQuestion, /Which upgrade should we design first/);
    assert.equal(readFileSync(path.join(root, "src/app/client.ts"), "utf8"), before);
    assert.equal(existsSync(path.join(root, ".automated-product-engineer")), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("audit recognizes established server-cache, concurrency, authorization, and verification patterns", () => {
  const root = fixture({
    name: "established-app",
    dependencies: { next: "^16", react: "^19", "@tanstack/react-query": "^5", "@supabase/supabase-js": "^2" },
    scripts: { test: "node --test", typecheck: "tsc --noEmit", lint: "eslint .", build: "next build" },
  });
  try {
    writeFixtureFile(root, "src/hooks/use-items.ts", "export const useItems = () => useQuery({ queryKey: ['items'] });\n");
    writeFixtureFile(root, "src/domain/item-service.ts", "export class ItemService { update(expectedRevision, operationId) {} }\n");
    writeFixtureFile(root, "src/repositories/item-repository.ts", "export class ItemRepository {}\n");
    writeFixtureFile(root, "src/app/api/items/route.ts", "export async function PATCH() { return service.update(); }\n");
    writeFixtureFile(root, "supabase/migrations/001_items.sql", "alter table items enable row level security; create policy item_access on items for select using (true);\n");
    writeFixtureFile(root, "e2e/items.spec.ts", "import { test } from '@playwright/test'; test('item flow', () => {});\n");

    const result = run(["audit", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    const byId = Object.fromEntries(report.findings.map((finding) => [finding.id, finding]));
    assert.equal(byId["thin-server-boundaries"].status, "established");
    assert.equal(byId["server-state-cache"].status, "established");
    assert.equal(byId["concurrency-retry"].status, "established");
    assert.equal(byId["auth-data-boundary"].status, "established");
    assert.equal(byId["verification-evidence"].status, "established");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("install ships the upgrade skill, catalog, audit guide, and local audit entry point", () => {
  const root = fixture({ name: "upgrade-app", dependencies: { next: "^16", react: "^19" } });
  try {
    const result = run(["install", "--target", "codex", "--only", "skills,docs"], root);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(path.join(root, ".agents", "skills", "codebase-upgrade", "SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".agents", "skills", "codebase-upgrade", "references", "pattern-and-antipattern-catalog.md")), true);
    assert.equal(existsSync(path.join(root, ".automated-product-engineer", "docs", "codebase-upgrades.md")), true);
    assert.match(readFileSync(path.join(root, ".automated-product-engineer", "INSTALLATION.md"), "utf8"), /automated-product-engineer audit/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
