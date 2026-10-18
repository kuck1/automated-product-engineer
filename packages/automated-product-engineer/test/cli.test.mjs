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
    assert.match(result.stderr, /Launch requires an Expo, React Native, native iOS, Swift package, native Android, or Kotlin Multiplatform project/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("launch selects Expo development client and bare React Native commands", () => {
  const expo = fixture({ name: "expo-app", dependencies: { expo: "^55", "react-native": "^0.83", "expo-dev-client": "^6" } }, { expo: { name: "Expo App", scheme: "expo-app" } });
  const bare = fixture({ name: "bare-app", dependencies: { "react-native": "^0.83", react: "^19" } });
  try {
    writeFixtureFile(bare, "settings.gradle", "include ':app'\n");
    writeFixtureFile(bare, "android/app/build.gradle", "plugins { id 'com.android.application' }\nandroid { defaultConfig { applicationId 'com.example.bare' } }\n");
    writeFixtureFile(bare, "android/app/src/main/AndroidManifest.xml", "<manifest><application /></manifest>\n");
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

test("doctor detects a native iOS project, shared scheme, capabilities, privacy, and tests", () => {
  const root = fixture({ name: "native-ios-app" });
  try {
    writeFixtureFile(root, "NativeApp.xcodeproj/project.pbxproj", `PRODUCT_BUNDLE_IDENTIFIER = com.example.native;\nIPHONEOS_DEPLOYMENT_TARGET = 17.0;\nSWIFT_VERSION = 6.0;\n`);
    writeFixtureFile(root, "NativeApp.xcodeproj/xcshareddata/xcschemes/NativeApp.xcscheme", "<Scheme></Scheme>\n");
    writeFixtureFile(root, "NativeApp/NativeApp.entitlements", `<?xml version="1.0"?><plist><dict><key>com.apple.developer.associated-domains</key><array/></dict></plist>\n`);
    writeFixtureFile(root, "NativeApp/PrivacyInfo.xcprivacy", `<?xml version="1.0"?><plist><dict/></plist>\n`);
    writeFixtureFile(root, "NativeApp/App.swift", "import SwiftUI\n@main struct NativeApp: App { var body: some Scene { WindowGroup { Text(\"Hi\") } } }\n");
    writeFixtureFile(root, "NativeAppTests/AppTests.swift", "import Testing\n@Test func loads() {}\n");

    const result = run(["doctor", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const profile = JSON.parse(result.stdout);
    assert.equal(profile.kind, "ios");
    assert.equal(profile.packageManager, "xcode");
    assert.equal(profile.router, "swiftui-or-uikit");
    assert.equal(profile.xcode.project, "NativeApp.xcodeproj");
    assert.deepEqual(profile.xcode.schemes, ["NativeApp"]);
    assert.equal(profile.xcode.bundleIdentifier, "com.example.native");
    assert.equal(profile.xcode.deploymentTarget, "17.0");
    assert.equal(profile.xcode.swiftVersion, "6.0");
    assert.deepEqual(profile.capabilities, ["associated-domains"]);
    assert.deepEqual(profile.findings, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("native iOS install selects Swift examples and launch opens the Xcode workspace", () => {
  const root = fixture({ name: "native-ios-app" });
  try {
    writeFixtureFile(root, "NativeApp.xcworkspace/contents.xcworkspacedata", "<Workspace></Workspace>\n");
    writeFixtureFile(root, "NativeApp.xcodeproj/project.pbxproj", "PRODUCT_BUNDLE_IDENTIFIER = com.example.native;\n");
    writeFixtureFile(root, "NativeApp/App.swift", "import SwiftUI\n");
    const installResult = run(["install", "--only", "examples"], root);
    assert.equal(installResult.status, 0, installResult.stderr);
    const toolkit = path.join(root, ".automated-product-engineer");
    assert.equal(existsSync(path.join(toolkit, "ios", "examples", "Package.swift")), true);
    assert.equal(existsSync(path.join(toolkit, "native", "examples")), false);
    assert.equal(existsSync(path.join(toolkit, "app", "examples", "page.tsx")), false);
    assert.match(readFileSync(path.join(toolkit, "INSTALLATION.md"), "utf8"), /Native iOS project path/);

    const launchResult = run(["launch", "--dry-run"], root);
    assert.equal(launchResult.status, 0, launchResult.stderr);
    assert.match(launchResult.stdout, /Opening native-ios-app in Xcode with open -a Xcode .*NativeApp\.xcworkspace/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("doctor and launch support a standalone Swift package", () => {
  const root = fixture({ name: "swift-library" });
  try {
    writeFixtureFile(root, "Package.swift", "// swift-tools-version: 6.0\nimport PackageDescription\n");
    writeFixtureFile(root, "Sources/Library/Library.swift", "public actor Store {}\n");
    const doctorResult = run(["doctor", "--json"], root);
    assert.equal(doctorResult.status, 0, doctorResult.stderr);
    const profile = JSON.parse(doctorResult.stdout);
    assert.equal(profile.kind, "swift-package");
    assert.equal(profile.packageManager, "swiftpm");
    assert.equal(profile.xcode.swiftFileCount, 1);

    const launchResult = run(["launch", "--dry-run"], root);
    assert.equal(launchResult.status, 0, launchResult.stderr);
    assert.match(launchResult.stdout, /open -a Xcode .*Package\.swift/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("native iOS audit reports direct view networking, insecure credential storage, and missing privacy", () => {
  const root = fixture({ name: "unsafe-ios-app" });
  try {
    writeFixtureFile(root, "Unsafe.xcodeproj/project.pbxproj", "PRODUCT_BUNDLE_IDENTIFIER = com.example.unsafe;\n");
    writeFixtureFile(root, "Unsafe/Screen.swift", `import SwiftUI\nstruct Screen: View {\n let token = UserDefaults.standard.string(forKey: \"authToken\")\n var body: some View { Text(\"Load\").task { _ = try? await URLSession.shared.data(from: URL(string: \"https://example.com\")!) } }\n}\n`);
    const result = run(["audit", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    const byId = Object.fromEntries(report.findings.map((finding) => [finding.id, finding]));
    assert.equal(byId["ios-network-boundary"].status, "risk");
    assert.equal(byId["ios-secret-storage"].status, "risk");
    assert.equal(byId["ios-privacy-manifest"].status, "opportunity");
    assert.equal(byId["ios-state-ownership"].status, "opportunity");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("doctor detects a native Android Compose project, Gradle contract, capabilities, and tests", () => {
  const root = fixture({ name: "native-android-app" });
  try {
    writeFixtureFile(root, "settings.gradle.kts", 'rootProject.name = "NativeAndroid"\ninclude(":app")\n');
    writeFixtureFile(root, "gradlew", "#!/bin/sh\n");
    writeFixtureFile(root, "build.gradle.kts", 'plugins { id("com.android.application") version "9.4.0" apply false; id("org.jetbrains.kotlin.android") version "2.4.10" apply false }\n');
    writeFixtureFile(root, "app/build.gradle.kts", `plugins { id("com.android.application"); id("org.jetbrains.kotlin.android"); id("org.jetbrains.kotlin.plugin.compose") }
android { namespace = "com.example.nativeandroid"; compileSdk = 36; defaultConfig { applicationId = "com.example.nativeandroid"; minSdk = 26; targetSdk = 36 } }
dependencies { implementation("androidx.navigation:navigation-compose:2.9.0"); implementation("androidx.credentials:credentials:1.6.0"); implementation("androidx.room:room-runtime:2.8.0"); implementation("androidx.work:work-runtime-ktx:2.11.0") }
`);
    writeFixtureFile(root, "app/src/main/AndroidManifest.xml", '<manifest xmlns:android="http://schemas.android.com/apk/res/android"><uses-permission android:name="android.permission.INTERNET"/><application><activity android:autoVerify="true"/></application></manifest>\n');
    writeFixtureFile(root, "app/src/main/kotlin/com/example/MainActivity.kt", "class MainActivity\n");
    writeFixtureFile(root, "app/src/test/kotlin/com/example/StoreTest.kt", "class StoreTest\n");
    writeFixtureFile(root, "app/src/androidTest/kotlin/com/example/AppTest.kt", "class AppTest\n");

    const result = run(["doctor", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const profile = JSON.parse(result.stdout);
    assert.equal(profile.kind, "android");
    assert.equal(profile.packageManager, "gradle");
    assert.equal(profile.router, "navigation-compose");
    assert.equal(profile.android.settingsFile, "settings.gradle.kts");
    assert.equal(profile.android.applicationModule, "app");
    assert.equal(profile.android.applicationId, "com.example.nativeandroid");
    assert.equal(profile.android.namespace, "com.example.nativeandroid");
    assert.equal(profile.android.compileSdk, "36");
    assert.equal(profile.android.minSdk, "26");
    assert.equal(profile.android.targetSdk, "36");
    assert.equal(profile.android.compose, true);
    assert.equal(profile.android.hasUnitTests, true);
    assert.equal(profile.android.hasInstrumentedTests, true);
    assert.deepEqual(profile.capabilities, ["internet", "background-work", "app-links", "credential-manager", "room"]);
    assert.deepEqual(profile.findings, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("native Android install selects Kotlin examples and launch opens Android Studio", () => {
  const root = fixture({ name: "native-android-app" });
  try {
    writeFixtureFile(root, "settings.gradle.kts", 'rootProject.name = "NativeAndroid"\ninclude(":app")\n');
    writeFixtureFile(root, "gradlew", "#!/bin/sh\n");
    writeFixtureFile(root, "app/build.gradle.kts", 'plugins { id("com.android.application") }\nandroid { namespace = "com.example.nativeandroid"; compileSdk = 36; defaultConfig { applicationId = "com.example.nativeandroid"; minSdk = 26; targetSdk = 36 } }\n');
    writeFixtureFile(root, "app/src/main/AndroidManifest.xml", "<manifest><application /></manifest>\n");
    writeFixtureFile(root, "app/src/main/kotlin/com/example/MainActivity.kt", "class MainActivity\n");
    writeFixtureFile(root, "app/src/test/kotlin/com/example/StoreTest.kt", "class StoreTest\n");
    const installResult = run(["install", "--only", "examples"], root);
    assert.equal(installResult.status, 0, installResult.stderr);
    const toolkit = path.join(root, ".automated-product-engineer");
    assert.equal(existsSync(path.join(toolkit, "android", "examples", "build.gradle.kts")), true);
    assert.equal(existsSync(path.join(toolkit, "android", "case-studies", "field-relay", "README.md")), true);
    assert.equal(existsSync(path.join(toolkit, "ios", "examples")), false);
    assert.equal(existsSync(path.join(toolkit, "native", "examples")), false);
    assert.equal(existsSync(path.join(toolkit, "app", "examples", "page.tsx")), false);
    assert.match(readFileSync(path.join(toolkit, "INSTALLATION.md"), "utf8"), /Native Android project path/);

    const launchResult = run(["launch", "--dry-run"], root);
    assert.equal(launchResult.status, 0, launchResult.stderr);
    assert.match(launchResult.stdout, /Opening native-android-app in Android Studio with/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("native Android audit reports coroutine, composable networking, credential, and signing risks", () => {
  const root = fixture({ name: "unsafe-android-app" });
  try {
    writeFixtureFile(root, "settings.gradle.kts", 'include(":app")\n');
    writeFixtureFile(root, "gradlew", "#!/bin/sh\n");
    writeFixtureFile(root, "app/build.gradle.kts", 'plugins { id("com.android.application") }\nandroid { namespace = "com.example.unsafe"; compileSdk = 36; defaultConfig { applicationId = "com.example.unsafe"; targetSdk = 36 }; signingConfigs { create("release") { storePassword = "exposed"; keyPassword = "exposed" } } }\n');
    writeFixtureFile(root, "app/src/main/AndroidManifest.xml", "<manifest><application /></manifest>\n");
    writeFixtureFile(root, "app/src/main/kotlin/com/example/UnsafeScreen.kt", `@Composable fun UnsafeScreen() { val client = OkHttpClient(); GlobalScope.launch { client.toString() }; val authToken = getSharedPreferences("auth", 0).getString("token", null) }
`);
    const result = run(["audit", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    const byId = Object.fromEntries(report.findings.map((finding) => [finding.id, finding]));
    assert.equal(byId["android-state-ownership"].status, "opportunity");
    assert.equal(byId["android-concurrency"].status, "risk");
    assert.equal(byId["android-network-boundary"].status, "risk");
    assert.equal(byId["android-secret-storage"].status, "risk");
    assert.equal(byId["android-signing-secrets"].status, "risk");
    assert.equal(byId["android-durable-data"].status, "opportunity");
  } finally { rmSync(root, { recursive: true, force: true }); }
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
    assert.equal(byId["concurrency-retry"].patternId, "versioned-idempotent-write");
    assert.ok(Array.isArray(report.currentSystemFeedback.preserve));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("audit routes newer product situations into the pattern atlas", () => {
  const root = fixture({
    name: "pattern-app",
    dependencies: { next: "^16", react: "^19", "@tanstack/react-query": "^5" },
    scripts: { build: "next build" },
  });
  try {
    writeFixtureFile(root, "src/components/derived.tsx", "useEffect(() => { setTotal(items.length); }, [items]);\n");
    writeFixtureFile(root, "src/auth/logout.ts", "export const logout = () => signOut();\n");
    writeFixtureFile(root, "src/hooks/items.ts", "export const useItems = () => useQuery({ queryKey: ['items'] });\n");
    writeFixtureFile(root, "src/app/api/webhook/route.ts", "export async function POST(request) { const webhook = await request.json(); return process(webhook); }\n");
    writeFixtureFile(root, "src/workers/export.ts", "export async function runBackgroundJob() { return exportRows(); }\n");
    writeFixtureFile(root, "src/app/upload.tsx", "export const send = (file) => { const body = new FormData(); body.append('file', file); };\n");
    writeFixtureFile(root, "src/components/beta.tsx", "export const Beta = () => flags.newCheckout ? <button /> : null;\n");

    const result = run(["audit", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    const byId = Object.fromEntries(report.findings.map((finding) => [finding.id, finding]));
    assert.equal(byId["derived-state"].patternId, "minimal-derived-state");
    assert.equal(byId["identity-cache"].status, "opportunity");
    assert.equal(byId["webhook-delivery"].patternId, "webhook-inbox");
    assert.equal(byId["background-jobs"].patternId, "durable-job-state-machine");
    assert.equal(byId["large-uploads"].patternId, "resumable-upload");
    assert.equal(byId["feature-flags"].patternId, "server-enforced-feature-flag");
    assert.ok(report.currentSystemFeedback.selectedPattern);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("audit does not label browser-system Effects as copied derived state", () => {
  const root = fixture({ name: "observer-app", dependencies: { next: "^16", react: "^19" }, scripts: { build: "next build" } });
  try {
    writeFixtureFile(root, "src/components/visible.tsx", "useEffect(() => { const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting)); observer.observe(node); return () => observer.disconnect(); }, [node]);\n");
    const result = run(["audit", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.findings.some((finding) => finding.id === "derived-state"), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("install ships onboarding, upgrade analysis, and their local entry points", () => {
  const root = fixture({ name: "upgrade-app", dependencies: { next: "^16", react: "^19" } });
  try {
    const result = run(["install", "--target", "codex", "--only", "skills,docs"], root);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(path.join(root, ".agents", "skills", "codebase-upgrade", "SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".agents", "skills", "codebase-upgrade", "references", "pattern-and-antipattern-catalog.md")), true);
    assert.equal(existsSync(path.join(root, ".agents", "skills", "codebase-upgrade", "references", "pattern-atlas.md")), true);
    assert.equal(existsSync(path.join(root, ".agents", "skills", "codebase-onboarding", "SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".automated-product-engineer", "docs", "codebase-upgrades.md")), true);
    assert.equal(existsSync(path.join(root, ".automated-product-engineer", "docs", "codebase-onboarding.md")), true);
    assert.match(readFileSync(path.join(root, ".automated-product-engineer", "INSTALLATION.md"), "utf8"), /automated-product-engineer audit/);
    assert.match(readFileSync(path.join(root, ".automated-product-engineer", "INSTALLATION.md"), "utf8"), /automated-product-engineer onboard/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("onboard creates a project-owned program and preserves accepted decisions on refresh", () => {
  const root = fixture({
    name: "onboarding-app",
    dependencies: { next: "^16", react: "^19" },
    scripts: { test: "node --test", build: "next build" },
  });
  try {
    writeFixtureFile(root, "README.md", "# Product\n\nCurrent behavior.\n");
    writeFixtureFile(root, "docs/architecture.md", "# Architecture\n\nRoutes own transport.\n");
    writeFixtureFile(root, "src/app/points.tsx", 'useEffect(() => { fetch("/api/points"); }, []);\n');
    writeFixtureFile(root, "src/components/feed.tsx", 'useEffect(() => { fetch("/api/feed"); }, []);\n');
    const installResult = run(["install", "--target", "codex", "--only", "skills,docs"], root);
    assert.equal(installResult.status, 0, installResult.stderr);

    const first = run(["onboard", "--target", "codex"], root);
    assert.equal(first.status, 0, first.stderr);
    assert.match(first.stdout, /Prepared codebase onboarding/);
    const onboarding = path.join(root, ".automated-product-engineer", "onboarding");
    for (const name of ["README.md", "CURRENT_PRACTICES.md", "INCONSISTENCIES.md", "PRODUCT_REQUIREMENTS.md", "DECISIONS.md", "UPGRADE_PROGRAM.md", "TEST_STRATEGY.md", "RETROSPECTIVES.md", "analysis.latest.json", "onboarding.json"]) {
      assert.equal(existsSync(path.join(onboarding, name)), true, name);
    }
    assert.equal(existsSync(path.join(root, ".agents", "skills", "project-engineering-context", "SKILL.md")), true);
    const analysis = JSON.parse(readFileSync(path.join(onboarding, "analysis.latest.json"), "utf8"));
    assert.deepEqual(analysis.documentation, ["README.md", "docs/architecture.md"]);
    assert.equal(analysis.selectedDomains.includes("state-management"), true);
    assert.equal(analysis.audit.summary.risks > 0, true);

    const decisions = path.join(onboarding, "DECISIONS.md");
    writeFileSync(decisions, "# Accepted local decision\n");
    writeFileSync(path.join(onboarding, "onboarding.json"), `${JSON.stringify({ schemaVersion: 1, selectedDomains: ["state-management"], target: "codex" }, null, 2)}\n`);
    const second = run(["onboard", "--target", "codex"], root);
    assert.equal(second.status, 0, second.stderr);
    assert.equal(readFileSync(decisions, "utf8"), "# Accepted local decision\n");
    assert.deepEqual(JSON.parse(readFileSync(path.join(onboarding, "analysis.latest.json"), "utf8")).selectedDomains, ["state-management"]);
    assert.match(second.stdout, /Created 0 team-owned files; refreshed analysis.latest.json/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("web example installation includes the typed pattern atlas and executable references", () => {
  const root = fixture({ name: "pattern-install", dependencies: { next: "^16", react: "^19" } });
  try {
    const result = run(["install", "--only", "examples"], root);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(path.join(root, ".automated-product-engineer", "src", "patterns", "catalog.ts")), true);
    assert.equal(existsSync(path.join(root, ".automated-product-engineer", "src", "patterns", "patterns.test.ts")), true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

function kotlinMultiplatformFixture() {
  const root = fixture({ name: "product-kernel" });
  writeFixtureFile(root, "settings.gradle.kts", 'rootProject.name = "ProductKernel"\ninclude(":shared:product-kernel", ":androidApp")\n');
  writeFixtureFile(root, "gradlew", "#!/bin/sh\n");
  writeFixtureFile(root, "shared/product-kernel/build.gradle.kts", `plugins {
  id("org.jetbrains.kotlin.multiplatform")
  id("com.android.kotlin.multiplatform.library")
}
kotlin { androidLibrary { namespace = "dev.example.kernel"; compileSdk = 36; minSdk = 26 }; iosArm64(); iosSimulatorArm64(); jvm("host") }
`);
  writeFixtureFile(root, "shared/product-kernel/src/commonMain/kotlin/dev/example/Policy.kt", "interface Repository\nobject Policy\nclass Controller\n");
  writeFixtureFile(root, "shared/product-kernel/src/commonTest/kotlin/dev/example/PolicyTest.kt", "class PolicyTest\n");
  writeFixtureFile(root, "androidApp/build.gradle.kts", 'plugins { id("com.android.application") }\nandroid { namespace = "dev.example.app"; compileSdk = 36; defaultConfig { applicationId = "dev.example.app"; minSdk = 26; targetSdk = 36 } }\n');
  writeFixtureFile(root, "androidApp/src/main/AndroidManifest.xml", "<manifest><application /></manifest>\n");
  writeFixtureFile(root, "androidApp/src/main/kotlin/dev/example/MainActivity.kt", "class MainActivity\n");
  writeFixtureFile(root, "ProductApp.xcodeproj/project.pbxproj", "PRODUCT_BUNDLE_IDENTIFIER = dev.example.app;\n");
  writeFixtureFile(root, "iosApp/Sources/WorkItemModel.swift", "@MainActor final class WorkItemModel: ObservableObject { func subscribe() {}; func close() {} }\n");
  writeFixtureFile(root, "contracts/tokens/product.tokens.json", '{}\n');
  writeFixtureFile(root, "contracts/components/button.component.json", '{}\n');
  writeFixtureFile(root, "contracts/scenarios/work-item.vectors.json", '{}\n');
  writeFixtureFile(root, "shared/product-kernel/src/commonMain/kotlin/dev/example/GeneratedTokens.kt", "object GeneratedTokens\n");
  writeFixtureFile(root, "iosApp/Generated/DesignTokens.swift", "enum DesignTokens {}\n");
  writeFixtureFile(root, ".github/workflows/mobile.yml", "jobs:\n  test:\n    steps:\n      - run: gradle hostTest assembleDebug linkDebugFramework\n      - run: xcodebuild test\n");
  return root;
}

test("doctor detects Kotlin Multiplatform modules, contracts, targets, and native shells", () => {
  const root = kotlinMultiplatformFixture();
  try {
    const result = run(["doctor", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const profile = JSON.parse(result.stdout);
    assert.equal(profile.kind, "kotlin-multiplatform");
    assert.equal(profile.packageManager, "gradle");
    assert.equal(profile.router, "native-projections");
    assert.deepEqual(profile.multiplatform.modules, ["shared/product-kernel"]);
    assert.deepEqual(profile.multiplatform.sourceSets, ["commonMain", "commonTest"]);
    assert.deepEqual(profile.multiplatform.targets, ["android", "ios-arm64", "ios-simulator-arm64", "jvm"]);
    assert.equal(profile.multiplatform.hasAndroidShell, true);
    assert.equal(profile.multiplatform.hasIosShell, true);
    assert.equal(profile.multiplatform.usesModernAndroidPlugin, true);
    assert.deepEqual(profile.multiplatform.tokenSources, ["contracts/tokens/product.tokens.json"]);
    assert.deepEqual(profile.findings, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("Kotlin Multiplatform install selects shared examples and launcher chooses each native shell", () => {
  const root = kotlinMultiplatformFixture();
  try {
    const installResult = run(["install", "--only", "examples"], root);
    assert.equal(installResult.status, 0, installResult.stderr);
    const toolkit = path.join(root, ".automated-product-engineer");
    assert.equal(existsSync(path.join(toolkit, "multiplatform", "examples", "parallel-feature-ledger.json")), true);
    assert.equal(existsSync(path.join(toolkit, "multiplatform", "case-studies", "field-relay-shared-kernel", "README.md")), true);
    assert.equal(existsSync(path.join(toolkit, "android", "examples")), false);
    assert.equal(existsSync(path.join(toolkit, "ios", "examples")), false);
    assert.match(readFileSync(path.join(toolkit, "INSTALLATION.md"), "utf8"), /Kotlin Multiplatform project path/);

    const android = run(["launch", "--dry-run"], root);
    assert.equal(android.status, 0, android.stderr);
    assert.match(android.stdout, /Android shell in Android Studio/);
    const ios = run(["launch", "--ios", "--dry-run"], root);
    assert.equal(ios.status, 0, ios.stderr);
    assert.match(ios.stdout, /iOS shell in Xcode.*ProductApp\.xcodeproj/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("Kotlin Multiplatform audit reports product-kernel, contract, Swift, and verification evidence", () => {
  const root = kotlinMultiplatformFixture();
  try {
    const result = run(["audit", "--json"], root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    const byId = Object.fromEntries(report.findings.map((finding) => [finding.id, finding]));
    assert.equal(byId["kmp-product-kernel"].status, "established");
    assert.equal(byId["kmp-contract-projections"].status, "established");
    assert.equal(byId["kmp-swift-boundary"].status, "established");
    assert.equal(byId["kmp-common-tests"].status, "established");
    assert.equal(byId["verification-evidence"].status, "established");
  } finally { rmSync(root, { recursive: true, force: true }); }
});
