#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { auditProject, formatAudit } from "./audit.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(packageRoot, "..", "..");
const sourceRoot = existsSync(path.join(repositoryRoot, "skills", "automated-product-engineer", "SKILL.md"))
  ? repositoryRoot
  : path.join(packageRoot, "payload");
const targets = ["universal", "codex", "claude", "cursor", "windsurf", "copilot", "orca", "generic"];
const components = ["skills", "docs", "templates", "examples"];

const adapters = {
  cursorRule: `---
description: Apply the automated product engineering workflow for substantial product work across web, React Native, Expo, Swift, native iOS, Kotlin, and native Android.
globs:
alwaysApply: false
---

Read @.ai/skills/automated-product-engineer/SKILL.md and load only the specialist skills it routes to. Read @.automated-product-engineer/INSTALLATION.md for the detected project profile and reference map. If @.automated-product-engineer/onboarding/README.md exists, load project-engineering-context before shared specialists. Use expo-native-app for Expo or React Native, ios-native-app for Swift and Apple platforms, and android-native-app for Kotlin, Jetpack Compose, Android Studio, Gradle, Android capabilities, signing, or Play delivery.
`,
  cursorCommand: `Use the workflow in \`.ai/skills/automated-product-engineer/SKILL.md\` to complete the requested product work. Read \`.automated-product-engineer/INSTALLATION.md\` and \`project-profile.json\` first. If the onboarding workspace exists, load \`project-engineering-context\` before shared specialists. Use \`expo-native-app\` for Expo or React Native, \`ios-native-app\` for Swift or native iOS, and \`android-native-app\` for Kotlin or native Android. Verify on the relevant simulator or device. Preserve repository instructions and stop at the user's authorized delivery boundary.
`,
  windsurfRule: `# Automated Product Engineer

For substantial product work, read \`.ai/skills/automated-product-engineer/SKILL.md\` and the detected project profile in \`.automated-product-engineer/INSTALLATION.md\`. If the onboarding workspace exists, load \`project-engineering-context\` before shared specialists. Use \`expo-native-app\` for Expo or React Native, \`ios-native-app\` for Swift or native iOS, and \`android-native-app\` for Kotlin or native Android before changing navigation, auth, capabilities, builds, or distribution. Preserve repository instructions and verify on the actual target platform.
`,
  copilotPrompt: `Use the \`automated-product-engineer\` skill to complete this work. Read \`.automated-product-engineer/INSTALLATION.md\` and \`project-profile.json\` first. If the onboarding workspace exists, load \`project-engineering-context\` before shared specialists. Use \`expo-native-app\` for Expo or React Native, \`ios-native-app\` for Swift or native iOS, and \`android-native-app\` for Kotlin or native Android. Verify lifecycle and platform behavior and include simulator or device evidence.
`,
  genericWorkflow: `# Automated Product Engineer

Begin with \`.ai/skills/automated-product-engineer/SKILL.md\` and read \`.automated-product-engineer/INSTALLATION.md\` for the detected project profile. If the onboarding workspace exists, load \`project-engineering-context\` before shared specialists. Load only the needed specialists. Expo and React Native work must use \`expo-native-app\`; Swift and native iOS work must use \`ios-native-app\`; Kotlin and native Android work must use \`android-native-app\`. Verify native behavior in a simulator or device rather than inferring it from a browser viewport.
`,
};

const sharedEntries = {
  docs: ["README.md", "AGENTS.md", "LICENSE", "docs", "checklists"],
  templates: ["templates"],
};
const webExamples = ["app/api/examples", "app/examples/page.tsx", "app/guide/page.tsx", "app/system/page.tsx", "src/examples", "src/patterns", "src/guide", "src/system", "src/ui", "supabase/migrations", "e2e/reference-app.spec.ts"];
const nativeExamples = ["native/examples", "native/case-studies"];
const iosExamples = ["ios/examples", "ios/case-studies"];
const androidExamples = ["android/examples", "android/case-studies"];
const onboardingDomains = [
  ["product-requirements", "Product requirements and journeys", "automated-product-engineer"],
  ["architecture", "Architecture and ownership boundaries", "architecture-building"],
  ["state-management", "State management, cache, concurrency, and realtime", "frontend-api-db"],
  ["api-services", "API, services, errors, and idempotency", "frontend-api-db"],
  ["database", "Database design, migrations, tenancy, and retention", "frontend-api-db"],
  ["auth-security", "Authentication, sessions, authorization, and secrets", "security-review"],
  ["design-system", "Design system, semantic tokens, and component adoption", "design-system"],
  ["responsive-native", "Responsive behavior and native runtime", "responsive-design + expo-native-app + ios-native-app + android-native-app"],
  ["testing-ci", "Testing, visual evidence, E2E, and CI", "manual-ui-qa + code-review"],
  ["delivery-observability", "Delivery, flags, observability, and rollback", "pr-workflow"],
  ["documentation", "Documentation, decisions, and developer experience", "codebase-onboarding"],
];

function usage() {
  return [
    "Install and run the Automated Product Engineer toolkit.", "",
    "Usage:",
    "  pnpm dlx automated-product-engineer",
    "  pnpm dlx automated-product-engineer onboard",
    "  pnpm dlx automated-product-engineer audit [--json]",
    "  pnpm dlx automated-product-engineer doctor",
    "  pnpm dlx automated-product-engineer launch [--ios|--android|--web] [--tunnel] [--clear]",
    "  pnpm dlx automated-product-engineer install [--target <target>] [--project <path>] [--only <parts>] [--force]", "",
    "The installer detects Next.js, Expo, bare React Native, native iOS, Swift packages, or native Android automatically.",
    "The onboarding command creates a project-owned engineering contract and upgrade program.",
    "The audit command reads the codebase without executing application source.",
    `Targets: ${targets.join(", ")}`,
    `Parts:   ${components.join(", ")} (default: all)`, "",
    "Examples:",
    "  pnpm dlx automated-product-engineer",
    "  pnpm dlx automated-product-engineer onboard",
    "  pnpm dlx automated-product-engineer audit",
    "  pnpm dlx automated-product-engineer doctor",
    "  pnpm dlx automated-product-engineer launch --ios",
    "  pnpm dlx automated-product-engineer launch --android",
    "  pnpm dlx automated-product-engineer install --target cursor --only skills,docs",
  ].join("\n");
}

function parseOptions(args) {
  const remaining = [...args];
  const command = remaining[0] && !remaining[0].startsWith("-") ? remaining.shift() : "install";
  if (!["install", "onboard", "audit", "doctor", "launch"].includes(command)) throw new Error(`Unknown command: ${command}\n\n${usage()}`);
  const options = { command, target: "universal", targetProvided: false, project: ".", only: [...components], force: false, platform: null, tunnel: false, clear: false, json: false, dryRun: false };
  for (let index = 0; index < remaining.length; index += 1) {
    const argument = remaining[index];
    if (argument === "--help" || argument === "-h") { console.log(usage()); process.exit(0); }
    if (argument === "--force") { options.force = true; continue; }
    if (argument === "--tunnel") { options.tunnel = true; continue; }
    if (argument === "--clear") { options.clear = true; continue; }
    if (argument === "--json") { options.json = true; continue; }
    if (argument === "--dry-run") { options.dryRun = true; continue; }
    if (["--ios", "--android", "--web"].includes(argument)) { options.platform = argument.slice(2); continue; }
    if (["--target", "--project", "--only"].includes(argument)) {
      const value = remaining[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${argument}.\n\n${usage()}`);
      if (argument === "--target") { options.target = value; options.targetProvided = true; }
      if (argument === "--project") options.project = value;
      if (argument === "--only") options.only = value.split(",").map((part) => part.trim()).filter(Boolean);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}\n\n${usage()}`);
  }
  if (!targets.includes(options.target)) throw new Error(`Choose a target: ${targets.join(", ")}.\n\n${usage()}`);
  const unknownParts = options.only.filter((part) => !components.includes(part));
  if (!options.only.length || unknownParts.length) throw new Error(`Choose --only values from: ${components.join(", ")}.\n\n${usage()}`);
  return { ...options, only: [...new Set(options.only)] };
}

function resolveProject(input) {
  const expanded = input === "~" ? homedir() : input.startsWith("~/") ? path.join(homedir(), input.slice(2)) : input;
  const project = path.resolve(expanded);
  if (!existsSync(project) || !statSync(project).isDirectory()) throw new Error(`Project directory does not exist: ${project}`);
  return project;
}

function readJson(file) {
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; }
}

function detectPackageManager(project, manifest) {
  if (existsSync(path.join(project, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(project, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(project, "bun.lockb")) || existsSync(path.join(project, "bun.lock"))) return "bun";
  if (existsSync(path.join(project, "package-lock.json"))) return "npm";
  return String(manifest?.packageManager ?? "npm").split("@")[0];
}

function findXcodeContainers(project) {
  const result = [];
  const visit = (directory, depth) => {
    if (depth > 2 || !existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith(".") || ["node_modules", "Pods", "build", "DerivedData"].includes(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory() && /\.(?:xcworkspace|xcodeproj)$/.test(entry.name)) result.push(path.relative(project, absolute));
      else if (entry.isDirectory()) visit(absolute, depth + 1);
    }
  };
  visit(project, 0);
  return result;
}

function firstBuildSetting(text, key) {
  const match = text.match(new RegExp(`${key}\\s*=\\s*([^;]+);`));
  return match ? match[1].trim().replace(/^\"|\"$/g, "") : null;
}

function detectXcodeProject(project, containers) {
  const workspaces = containers.filter((item) => item.endsWith(".xcworkspace") && !item.includes(".xcodeproj/"));
  const projects = containers.filter((item) => item.endsWith(".xcodeproj"));
  const projectFile = projects[0] ? path.join(project, projects[0], "project.pbxproj") : null;
  const settings = projectFile && existsSync(projectFile) ? readFileSync(projectFile, "utf8") : "";
  const schemes = [...workspaces, ...projects].flatMap((item) => {
    const directory = path.join(project, item, "xcshareddata", "xcschemes");
    return existsSync(directory) ? readdirSync(directory).filter((name) => name.endsWith(".xcscheme")).map((name) => name.replace(/\.xcscheme$/, "")) : [];
  });
  const entitlements = [];
  const privacyManifests = [];
  const swiftFiles = [];
  const visit = (directory, depth = 0) => {
    if (depth > 6 || !existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || ["node_modules", "Pods", "build", "DerivedData", ".build"].includes(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory() && !/\.(?:xcworkspace|xcodeproj)$/.test(entry.name)) visit(absolute, depth + 1);
      else if (entry.isFile()) {
        const relative = path.relative(project, absolute);
        if (entry.name.endsWith(".entitlements")) entitlements.push(relative);
        if (entry.name === "PrivacyInfo.xcprivacy") privacyManifests.push(relative);
        if (entry.name.endsWith(".swift") && entry.name !== "Package.swift") swiftFiles.push(relative);
      }
    }
  };
  visit(project);
  const entitlementText = entitlements.map((item) => readFileSync(path.join(project, item), "utf8")).join("\n");
  const capabilityKeys = [
    ["associated-domains", "com.apple.developer.associated-domains"],
    ["sign-in-with-apple", "com.apple.developer.applesignin"],
    ["push-notifications", "aps-environment"],
    ["keychain-sharing", "keychain-access-groups"],
    ["app-groups", "com.apple.security.application-groups"],
    ["icloud", "com.apple.developer.icloud-services"],
  ];
  return {
    workspace: workspaces[0] ?? null,
    project: projects[0] ?? null,
    schemes: [...new Set(schemes)].sort(),
    bundleIdentifier: firstBuildSetting(settings, "PRODUCT_BUNDLE_IDENTIFIER"),
    deploymentTarget: firstBuildSetting(settings, "IPHONEOS_DEPLOYMENT_TARGET"),
    swiftVersion: firstBuildSetting(settings, "SWIFT_VERSION"),
    entitlements,
    privacyManifests,
    swiftFileCount: swiftFiles.length,
    hasTests: swiftFiles.some((item) => /(?:^|\/).*Tests?(?:\/|$)|Tests?\.swift$/i.test(item)),
    capabilities: capabilityKeys.filter(([, key]) => entitlementText.includes(`<key>${key}</key>`)).map(([name]) => name),
  };
}

function firstGradleValue(text, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`\\b${escaped}\\s*(?:=\\s*)?[\"']?([A-Za-z0-9_.-]+)`));
  return match?.[1] ?? null;
}

function firstGradleInteger(text, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.match(new RegExp(`\\b${escaped}\\s*(?:=\\s*)?(\\d+)`))?.[1] ?? null;
}

function detectAndroidProject(project) {
  const settingsFile = ["settings.gradle.kts", "settings.gradle"].find((name) => existsSync(path.join(project, name))) ?? null;
  const buildFiles = [];
  const manifests = [];
  const kotlinFiles = [];
  const visit = (directory, depth = 0) => {
    if (depth > 6 || !existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith(".") || ["node_modules", "build", ".gradle", ".idea", "captures"].includes(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute, depth + 1);
      else if (entry.isFile()) {
        const relative = path.relative(project, absolute);
        if (/^build\.gradle(?:\.kts)?$/.test(entry.name)) buildFiles.push(relative);
        if (entry.name === "AndroidManifest.xml") manifests.push(relative);
        if (entry.name.endsWith(".kt") && !entry.name.endsWith(".gradle.kts")) kotlinFiles.push(relative);
      }
    }
  };
  visit(project);
  const describedBuilds = buildFiles.map((file) => ({ file, text: readFileSync(path.join(project, file), "utf8") }));
  const applicationBuild = describedBuilds.find(({ file, text }) => file !== "build.gradle" && file !== "build.gradle.kts" && /com\.android\.application|libs\.plugins\.android\.application/.test(text) && !/com\.android\.application[\s\S]{0,100}apply\s+false/.test(text))
    ?? describedBuilds.find(({ file, text }) => file !== "build.gradle" && file !== "build.gradle.kts" && /\bapplicationId\b/.test(text))
    ?? describedBuilds.find(({ text }) => /com\.android\.application|libs\.plugins\.android\.application/.test(text) && !/apply\s+false/.test(text));
  const libraryBuild = describedBuilds.find(({ file, text }) => file !== "build.gradle" && file !== "build.gradle.kts" && /com\.android\.library|libs\.plugins\.android\.library/.test(text));
  const moduleBuild = applicationBuild ?? libraryBuild ?? null;
  const allBuildText = describedBuilds.map(({ text }) => text).join("\n");
  const moduleText = moduleBuild?.text ?? "";
  const settingsText = settingsFile ? readFileSync(path.join(project, settingsFile), "utf8") : "";
  const modules = [...settingsText.matchAll(/(?:include\s*\(|include\s+)([^\n]+)/g)]
    .flatMap((match) => [...match[1].matchAll(/[\"'](:[^\"']+)[\"']/g)].map((item) => item[1]))
    .map((item) => item.replace(/^:/, "").replace(/:/g, "/"));
  const manifestText = manifests.map((file) => readFileSync(path.join(project, file), "utf8")).join("\n");
  const dependencySignals = [allBuildText, manifestText].join("\n");
  const capabilityKeys = [
    ["internet", /android\.permission\.INTERNET/],
    ["notifications", /POST_NOTIFICATIONS|firebase-messaging/],
    ["camera", /android\.permission\.CAMERA|camera-camera2/],
    ["location", /ACCESS_(?:FINE|COARSE|BACKGROUND)_LOCATION/],
    ["background-work", /androidx\.work|work-runtime/],
    ["app-links", /android:autoVerify\s*=\s*[\"']true[\"']/],
    ["credential-manager", /androidx\.credentials|credentials-play-services-auth/],
    ["room", /androidx\.room|room-runtime/],
    ["datastore", /androidx\.datastore|datastore-preferences/],
    ["play-integrity", /com\.google\.android\.play:integrity/],
  ];
  const moduleDirectory = moduleBuild ? path.dirname(moduleBuild.file) : null;
  return {
    detected: Boolean(settingsFile && applicationBuild && manifests.length),
    projectName: settingsText.match(/rootProject\.name\s*=\s*[\"']([^\"']+)[\"']/)?.[1] ?? null,
    settingsFile,
    wrapper: existsSync(path.join(project, "gradlew")) ? "gradlew" : existsSync(path.join(project, "gradlew.bat")) ? "gradlew.bat" : null,
    modules: [...new Set(modules)].sort(),
    applicationModule: applicationBuild ? path.dirname(applicationBuild.file) || "." : null,
    libraryModule: libraryBuild ? path.dirname(libraryBuild.file) || "." : null,
    buildFiles,
    manifests,
    namespace: firstGradleValue(moduleText, "namespace"),
    applicationId: firstGradleValue(moduleText, "applicationId"),
    compileSdk: firstGradleInteger(moduleText, "compileSdk"),
    minSdk: firstGradleInteger(moduleText, "minSdk"),
    targetSdk: firstGradleInteger(moduleText, "targetSdk"),
    compose: /org\.jetbrains\.kotlin\.plugin\.compose|buildFeatures[\s\S]{0,240}compose\s*=\s*true|androidx\.compose/.test(allBuildText),
    kotlinFileCount: kotlinFiles.length,
    hasUnitTests: kotlinFiles.some((file) => /(?:^|\/)src\/test\//.test(file)),
    hasInstrumentedTests: kotlinFiles.some((file) => /(?:^|\/)src\/androidTest\//.test(file)),
    capabilities: capabilityKeys.filter(([, pattern]) => pattern.test(dependencySignals)).map(([name]) => name),
    sourceModule: moduleDirectory,
  };
}

function detectProject(project) {
  const manifest = readJson(path.join(project, "package.json")) ?? {};
  const dependencies = { ...(manifest.dependencies ?? {}), ...(manifest.devDependencies ?? {}) };
  const hasExpo = Boolean(dependencies.expo);
  const hasReactNative = Boolean(dependencies["react-native"]);
  const hasNext = Boolean(dependencies.next);
  const android = detectAndroidProject(project);
  const xcodeContainers = findXcodeContainers(project);
  const hasSwiftPackage = existsSync(path.join(project, "Package.swift"));
  const hasNativeIOS = xcodeContainers.some((item) => item.endsWith(".xcodeproj") || item.endsWith(".xcworkspace"));
  const kind = hasExpo ? "expo" : hasReactNative ? "react-native" : hasNext ? "nextjs" : android.detected ? "android" : hasNativeIOS ? "ios" : hasSwiftPackage ? "swift-package" : "unknown";
  const appJson = readJson(path.join(project, "app.json"));
  const expoConfig = appJson?.expo ?? appJson ?? {};
  const dynamicConfigFile = ["app.config.ts", "app.config.js", "app.config.mjs", "app.config.cjs"]
    .find((name) => existsSync(path.join(project, name))) ?? null;
  const configSource = appJson ? "app.json" : dynamicConfigFile ?? (["ios", "swift-package"].includes(kind) ? (xcodeContainers.find((item) => item.endsWith(".xcworkspace")) ?? xcodeContainers.find((item) => item.endsWith(".xcodeproj")) ?? "Package.swift") : kind === "android" ? android.settingsFile ?? android.buildFiles[0] ?? null : null);
  const packageManager = kind === "ios" ? "xcode" : kind === "swift-package" ? "swiftpm" : kind === "android" ? "gradle" : detectPackageManager(project, manifest);
  const androidText = android.buildFiles.map((file) => readFileSync(path.join(project, file), "utf8")).join("\n");
  const router = dependencies["expo-router"] ? "expo-router" : dependencies["@react-navigation/native"] ? "react-navigation" : hasNext ? "next-router" : kind === "ios" ? "swiftui-or-uikit" : kind === "android" ? (/androidx\.navigation(?::navigation-compose|\.compose)/.test(androidText) ? "navigation-compose" : /androidx\.navigation/.test(androidText) ? "navigation-fragments" : "android-navigation") : "unknown";
  const xcode = detectXcodeProject(project, xcodeContainers);
  const nativeDirectories = ["ios", "android"].filter((name) => existsSync(path.join(project, name)));
  const capabilities = [
    ["auth", ["expo-auth-session", "@react-native-google-signin/google-signin", "@supabase/supabase-js"]],
    ["notifications", ["expo-notifications", "@react-native-firebase/messaging"]],
    ["secure-storage", ["expo-secure-store", "react-native-keychain"]],
    ["server-cache", ["@tanstack/react-query"]],
    ["local-database", ["expo-sqlite", "@nozbe/watermelondb", "realm"]],
    ["camera", ["expo-camera", "react-native-vision-camera"]],
    ["location", ["expo-location", "@react-native-community/geolocation"]],
    ["background-tasks", ["expo-background-task", "expo-task-manager"]],
  ].filter(([, packages]) => packages.some((name) => dependencies[name])).map(([name]) => name);
  const findings = [];
  if (kind === "unknown") findings.push({ level: "warning", code: "platform-unknown", message: "No Next.js, Expo, React Native, Xcode project, Swift package, or native Android project was detected." });
  if (["expo", "react-native"].includes(kind) && !expoConfig.scheme && !dynamicConfigFile) findings.push({ level: "warning", code: "scheme-missing", message: "No app scheme was found. OAuth redirects and production deep links need a stable scheme." });
  if (kind === "expo" && dynamicConfigFile && !appJson) findings.push({ level: "note", code: "dynamic-config", message: `Detected ${dynamicConfigFile}. Run Expo config to verify resolved schemes, identifiers, plugins, and permissions.` });
  if (kind === "expo" && !existsSync(path.join(project, "eas.json"))) findings.push({ level: "note", code: "eas-unconfigured", message: "No eas.json was found. Local development still works; EAS builds and updates are not configured yet." });
  if (kind === "expo" && dependencies["expo-auth-session"] && !dependencies["expo-dev-client"]) findings.push({ level: "warning", code: "auth-needs-dev-build", message: "OAuth is present without expo-dev-client. Stable native redirects should be tested in a development build, not Expo Go." });
  if (kind === "expo" && dependencies["expo-notifications"] && !dependencies["expo-dev-client"]) findings.push({ level: "warning", code: "push-needs-dev-build", message: "Push notifications require a development build or release build." });
  if (kind === "ios" && !xcode.schemes.length) findings.push({ level: "warning", code: "shared-scheme-missing", message: "No shared Xcode scheme was found. Share the application scheme so launch and CI do not depend on one developer's local state." });
  if (kind === "ios" && !xcode.privacyManifests.length) findings.push({ level: "note", code: "privacy-manifest-missing", message: "No PrivacyInfo.xcprivacy was found. Verify collected data, tracking domains, and required-reason APIs before distribution." });
  if (kind === "ios" && !xcode.hasTests) findings.push({ level: "note", code: "ios-tests-missing", message: "No Swift test source was detected. Add focused domain tests and at least one critical XCUI journey." });
  if (kind === "android" && !android.wrapper) findings.push({ level: "warning", code: "gradle-wrapper-missing", message: "No Gradle wrapper was found. Commit the wrapper so local work and CI use the same Gradle version." });
  if (kind === "android" && !android.applicationId) findings.push({ level: "warning", code: "android-application-id-missing", message: "The applicationId was not resolved from the application module. Verify the selected module and release identity." });
  if (kind === "android" && !android.targetSdk) findings.push({ level: "note", code: "android-target-sdk-unresolved", message: "targetSdk was not resolved from the application module. Verify the version catalog or convention plugin before release planning." });
  if (kind === "android" && !android.hasUnitTests && !android.hasInstrumentedTests) findings.push({ level: "note", code: "android-tests-missing", message: "No Kotlin source was detected in src/test or src/androidTest. Add focused state and repository tests plus one critical device journey." });
  return {
    schemaVersion: 1, kind, packageManager, router,
    configSource,
    app: { name: expoConfig.name ?? manifest.name ?? (kind === "android" ? android.projectName : null) ?? xcode.schemes[0] ?? xcode.project?.replace(/\.xcodeproj$/, "") ?? path.basename(project), slug: expoConfig.slug ?? null, scheme: expoConfig.scheme ?? (kind === "ios" ? xcode.schemes[0] ?? null : null), iosBundleIdentifier: expoConfig.ios?.bundleIdentifier ?? xcode.bundleIdentifier, androidPackage: expoConfig.android?.package ?? android.applicationId },
    nativeDirectories, usesDevelopmentClient: Boolean(dependencies["expo-dev-client"]), easConfigured: existsSync(path.join(project, "eas.json")), capabilities: kind === "ios" ? xcode.capabilities : kind === "android" ? android.capabilities : capabilities, xcode, android, findings,
  };
}

function writeManagedFile(destination, content, force) {
  const next = Buffer.isBuffer(content) ? content : Buffer.from(content);
  if (existsSync(destination)) {
    const current = readFileSync(destination);
    if (current.equals(next)) return false;
    if (!force) throw new Error(`Refusing to overwrite existing file: ${destination}\nRe-run with --force after reviewing the local changes.`);
  }
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, next);
  return true;
}

function copyEntry(source, destination, force, installedFiles) {
  const sourceStat = statSync(source);
  if (sourceStat.isDirectory()) {
    for (const entry of readdirSync(source, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) copyEntry(path.join(source, entry.name), path.join(destination, entry.name), force, installedFiles);
    return;
  }
  if (sourceStat.isFile()) { writeManagedFile(destination, readFileSync(source), force); installedFiles.push(destination); }
}

function copyPackageEntry(entry, toolkitRoot, force, installedFiles) {
  const source = path.join(sourceRoot, entry);
  if (!existsSync(source)) throw new Error(`Package is missing required toolkit content: ${entry}`);
  copyEntry(source, path.join(toolkitRoot, entry), force, installedFiles);
}

function skillDestinations(project, target) {
  return target === "universal" ? [path.join(project, ".agents", "skills"), path.join(project, ".claude", "skills"), path.join(project, ".ai", "skills")]
    : ["codex", "copilot"].includes(target) ? [path.join(project, ".agents", "skills")]
      : target === "claude" ? [path.join(project, ".claude", "skills")]
        : target === "orca" ? [path.join(project, ".agents", "skills"), path.join(project, ".claude", "skills")]
          : [path.join(project, ".ai", "skills")];
}

function copySkills(project, target, force, installedFiles) {
  const skillsDirectory = path.join(sourceRoot, "skills");
  const destinations = skillDestinations(project, target);
  for (const destination of destinations) copyEntry(skillsDirectory, destination, force, installedFiles);
  if (["universal", "cursor"].includes(target)) {
    writeManagedFile(path.join(project, ".cursor", "rules", "automated-product-engineer.mdc"), adapters.cursorRule, force);
    writeManagedFile(path.join(project, ".cursor", "commands", "automated-product-engineer.md"), adapters.cursorCommand, force);
  }
  if (["universal", "windsurf"].includes(target)) writeManagedFile(path.join(project, ".windsurf", "rules", "automated-product-engineer.md"), adapters.windsurfRule, force);
  if (["universal", "copilot"].includes(target)) writeManagedFile(path.join(project, ".github", "prompts", "automated-product-engineer.prompt.md"), adapters.copilotPrompt, force);
  if (["universal", "generic"].includes(target)) writeManagedFile(path.join(project, "AI_WORKFLOW.md"), adapters.genericWorkflow, force);
}

function installationGuide(target, selected, profile) {
  const included = selected.map((part) => `- **${part}**`).join("\n");
  const nativeStart = ["expo", "react-native"].includes(profile.kind) ? `
## Native project path

- Start with \`skills/expo-native-app/SKILL.md\` for navigation, auth, lifecycle, permissions, state, native builds, updates, and store delivery.
- Read \`docs/native-app-delivery.md\` and \`checklists/native-release.md\` before planning a native release.
- Use \`native/examples/\` and \`templates/native/\` as patterns; adapt them into the application rather than importing this directory at runtime.
- Run \`pnpm dlx automated-product-engineer doctor\` after native configuration changes.
- Run \`pnpm dlx automated-product-engineer launch\` to start the detected Expo development runtime.
` : "";
  const iosStart = ["ios", "swift-package"].includes(profile.kind) ? `
## Native iOS project path

- Start with \`skills/ios-native-app/SKILL.md\` for SwiftUI or UIKit architecture, Observation, Swift concurrency, auth, persistence, capabilities, testing, signing, TestFlight, and App Store delivery.
- Read \`docs/native-ios-delivery.md\` and \`checklists/ios-release.md\` before planning distribution.
- Use \`ios/examples/\` for executable domain invariants and \`templates/ios/\` for SwiftUI integration patterns. Adapt them into the application; do not import this reference directory at runtime.
- Run \`pnpm dlx automated-product-engineer doctor\` after changing targets, schemes, entitlements, privacy declarations, signing, or deployment settings.
- Run \`pnpm dlx automated-product-engineer launch\` to open the detected workspace or project in Xcode.
` : "";
  const androidStart = profile.kind === "android" ? `
## Native Android project path

- Start with \`skills/android-native-app/SKILL.md\` for Kotlin architecture, Compose or Views, coroutines and Flow, auth, persistence, capabilities, testing, signing, and Play delivery.
- Read \`docs/native-android-delivery.md\` and \`checklists/android-release.md\` before planning distribution.
- Use \`android/examples/\` for executable domain invariants and \`templates/android/\` for integration patterns. Adapt them into the application; do not import this reference directory at runtime.
- Run \`pnpm dlx automated-product-engineer doctor\` after changing modules, manifests, SDK targets, credentials, permissions, signing, or release variants.
- Run \`pnpm dlx automated-product-engineer launch\` to open the detected Gradle project in Android Studio.
` : "";
  return `# Automated Product Engineer — Local Toolkit

This is an installed reference kit. Adapt its patterns to the host repository; do not import this directory as application runtime code.

## Detected project

- **Platform:** ${profile.kind}
- **Router:** ${profile.router}
- **Package manager:** ${profile.packageManager}
- **Development client:** ${profile.usesDevelopmentClient ? "detected" : "not detected"}

## Installed parts

${included}
${nativeStart}${iosStart}${androidStart}
## Shared starting points

- \`pnpm dlx automated-product-engineer audit\`: inspect this codebase and receive evidence-backed upgrade choices before changing architecture.
- \`pnpm dlx automated-product-engineer onboard\`: create the project-owned practices, inconsistencies, requirements, upgrade program, test strategy, decisions, retrospectives, and local skill overlay.
- \`docs/codebase-onboarding.md\`: onboarding artifacts, domain review, selection, and feedback loop.
- \`docs/codebase-upgrades.md\`: audit interpretation, pattern mapping, and user decision workflow.
- \`docs/pattern-atlas.md\`: stable pattern IDs, executable references, proof, and specialist routing.
- \`docs/how-to-use.md\`: end-to-end workflow.
- \`docs/knowledge-coverage.md\`: maintained capability coverage.
- \`docs/architecture.md\`: ownership and boundaries.
- \`docs/testing-and-ci.md\`: focused tests and CI.
- \`checklists/integration.md\`: implementation gates.

The selected agent adapter is **${target}**. Re-run the installer to update identical files. Use \`--force\` only after reviewing changes to locally modified toolkit files.
`;
}

function isInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

async function ask(question) {
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  try { return (await prompt.question(question)).trim(); }
  finally { prompt.close(); }
}

function collectDocumentation(project) {
  const documents = [];
  const ignored = new Set([".git", ".next", ".automated-product-engineer", "build", "coverage", "dist", "node_modules", "playwright-report", "test-results"]);
  const preferred = /^(?:readme|agents|contributing|security|architecture|decisions?|adr|runbook|product|requirements?|testing|release|deploy|design-system)(?:\.|-|_)/i;
  const visit = (directory, depth = 0) => {
    if (documents.length >= 80 || depth > 6) return;
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (documents.length >= 80 || ignored.has(entry.name) || (entry.isDirectory() && entry.name.startsWith(".") && entry.name !== ".github")) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute, depth + 1);
      else if (entry.isFile() && /\.(?:md|mdx|txt)$/i.test(entry.name)) {
        const relative = path.relative(project, absolute);
        if (preferred.test(entry.name) || /(?:^|\/)(?:docs?|adr|decisions?|runbooks?)(?:\/|$)/i.test(relative)) documents.push(relative);
      }
    }
  };
  visit(project);
  return [...new Set(documents)].sort();
}

function writeOwnedFile(destination, content) {
  if (existsSync(destination)) return false;
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, content);
  return true;
}

function markdownList(items, empty) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : `- ${empty}`;
}

function onboardingArtifacts(project, profile, report, selectedDomains, target) {
  const root = path.join(project, ".automated-product-engineer", "onboarding");
  const manifest = readJson(path.join(project, "package.json")) ?? {};
  const documents = collectDocumentation(project);
  const risks = report.findings.filter((item) => item.status === "risk");
  const opportunities = report.findings.filter((item) => item.status === "opportunity");
  const established = report.findings.filter((item) => item.status === "established");
  const selected = onboardingDomains.filter(([id]) => selectedDomains.includes(id));
  const created = [];
  const own = (name, content) => { if (writeOwnedFile(path.join(root, name), content)) created.push(path.join(root, name)); };

  own("README.md", `# Codebase onboarding\n\nThis directory is the team-owned engineering contract for **${profile.app.name}**. Start with \`analysis.latest.json\`, validate its static signals against real code and behavior, then maintain the documents below as accepted decisions.\n\n## Read in this order\n\n1. \`PRODUCT_REQUIREMENTS.md\`\n2. \`CURRENT_PRACTICES.md\`\n3. \`INCONSISTENCIES.md\`\n4. \`DECISIONS.md\`\n5. \`UPGRADE_PROGRAM.md\`\n6. \`TEST_STRATEGY.md\`\n7. \`RETROSPECTIVES.md\`\n\nRun \`pnpm dlx automated-product-engineer onboard\` to refresh machine evidence. Reruns preserve these team-owned Markdown files. Use the \`codebase-onboarding\` skill to complete and maintain them.\n`);
  own("CURRENT_PRACTICES.md", `# Current practices\n\nStatus: initial static baseline; validate every item before marking it accepted.\n\n## Detected platform\n\n- Application: ${profile.app.name}\n- Runtime: ${profile.kind}\n- Router: ${profile.router}\n- Package manager: ${profile.packageManager}\n- Detected capabilities: ${profile.capabilities.join(", ") || "none from package metadata"}\n- Available scripts: ${Object.keys(manifest.scripts ?? {}).sort().join(", ") || "none"}\n\n## Patterns to verify and preserve\n\n${markdownList(established.map((item) => `**${item.title}** — ${item.summary} Evidence: ${item.evidence.join(", ") || "static signal only"}.`), "No established pattern was confirmed by the initial scan.")}\n\n## Domain contracts\n\n${selected.map(([, title, skill]) => `### ${title}\n\n- Owner and current pattern: _verify_\n- Source-of-truth evidence: _add paths_\n- Exceptions: _none recorded_\n- Specialist: \`${skill}\`\n`).join("\n")}\n`);
  own("INCONSISTENCIES.md", `# Inconsistencies and unknowns\n\nRecord conflicts between documentation, code, runtime behavior, tests, and team expectations. The entries below are static leads, not final judgments.\n\n## Risks to validate\n\n${markdownList(risks.map((item) => `**${item.title}** — ${item.summary} Evidence: ${item.evidence.join(", ") || "needs runtime validation"}.`), "No high-confidence risk was found by the static scan.")}\n\n## Opportunities to decide\n\n${markdownList(opportunities.map((item) => `**${item.title}** — ${item.summary} Evidence: ${item.evidence.join(", ") || "needs deeper inspection"}.`), "No upgrade opportunity was found by the static scan.")}\n\n## Documentation reconciliation\n\n${markdownList(documents.map((document) => `\`${document}\` — _mark current, partial, contradicted, or unverified_`), "No preferred documentation file was found. Confirm whether product and architecture knowledge lives elsewhere.")}\n`);
  own("PRODUCT_REQUIREMENTS.md", `# Product requirements baseline\n\nDocument product behavior before standardizing implementation. Use real journeys and exact failure recovery.\n\n## Canonical journeys\n\nFor each journey record actor, trigger, desired outcome, permissions, business rules, durable effects, visible states, failure recovery, analytics, responsive or native behavior, and acceptance evidence.\n\n1. Primary read journey — _document_\n2. Primary write journey — _document_\n3. Permission failure — _document_\n4. Retry, concurrency, or offline recovery — _document_\n5. Responsive or native lifecycle journey — _document if applicable_\n\n## Material unknowns\n\n- Production traffic, operational constraints, external policy, and user priorities require owner or runtime evidence.\n`);
  own("DECISIONS.md", `# Engineering decisions\n\nRecord accepted repository-specific choices. Each decision should include date, status, context, decision, alternatives, product effect, migration, rollback, evidence, and skill guidance affected.\n\n## Pending\n\n- Choose the first upgrade slice after validating the initial analysis.\n`);
  own("UPGRADE_PROGRAM.md", `# Upgrade program\n\nThe selected review domains are listed below. Reorder them by user harm, security and data risk, dependency, learning value, and reversibility. Implement one reviewable vertical slice at a time.\n\n## Initial evidence-backed candidates\n\n${markdownList([...risks, ...opportunities].slice(0, 8).map((item) => `**${item.title}** (\`${item.patternId}\`, ${item.status}) — ${item.action} Specialist: \`${item.skill}\`. Evidence: ${item.evidence.join(", ") || "validate against a real journey"}.`), "The static scan found no upgrade candidate. Stress-test an established pattern or inspect a user-reported problem before proposing structural work.")}\n\n${selected.map(([id, title, skill], index) => `## ${index + 1}. ${title}\n\n- Domain ID: \`${id}\`\n- Specialist: \`${skill}\`\n- Product outcome: _define_\n- Current evidence and contract to preserve: _validate_\n- Inconsistency or risk: _link_\n- Target contract: _decide_\n- Characterization or UI proof: _add before structural change_\n- Focused implementation slice: _define_\n- E2E proof after contract stabilization: _define_\n- Migration and rollback: _define_\n- Completion evidence: _define_\n`).join("\n")}\n## Program gate\n\nDo not begin a broad migration until the product requirement, current owner, first proof, migration, rollback, and completion evidence for that slice are explicit.\n`);
  own("TEST_STRATEGY.md", `# Test strategy\n\nProof follows ownership and is added in increasing scope.\n\n1. Characterize accepted current behavior. Add a focused component or UI contract test first when the user interaction is the contract.\n2. Test domain policy, authorization, concurrency, and persistence at their owning boundary.\n3. Test transport validation and normalized failures.\n4. Add integration proof for changed handoffs.\n5. Add E2E after product requirements and the cross-boundary contract are stable.\n6. Inspect real desktop and compact layouts or the relevant iOS and Android runtime.\n7. Run required typecheck, lint, build, migration, security, and CI gates once the design stabilizes.\n\n## Repository commands\n\n${markdownList(Object.entries(manifest.scripts ?? {}).map(([name, command]) => `\`${profile.packageManager} ${name}\` — \`${command}\``), "No package scripts were detected. Document the actual validation commands.")}\n`);
  own("RETROSPECTIVES.md", `# Upgrade retrospectives\n\nAppend one entry after every completed slice. Record expected and observed outcome, passed and failed evidence, debugging path, preserved strengths, code and documentation fix-back, local skill changes, remaining risk, and next trigger.\n\n## Entries\n\n_None yet._\n`);

  const analysis = { schemaVersion: 1, generatedAt: new Date().toISOString(), project, selectedDomains, documentation: documents, profile, audit: report };
  mkdirSync(root, { recursive: true });
  writeFileSync(path.join(root, "analysis.latest.json"), `${JSON.stringify(analysis, null, 2)}\n`);
  writeFileSync(path.join(root, "onboarding.json"), `${JSON.stringify({ schemaVersion: 1, selectedDomains, target }, null, 2)}\n`);

  const localSkill = `---\nname: project-engineering-context\ndescription: Apply the verified product and engineering contracts for ${profile.app.name}. Use before any substantial feature, refactor, migration, design-system, data, auth, testing, or delivery work in this repository.\n---\n\n# ${profile.app.name} engineering context\n\nRead \`.automated-product-engineer/onboarding/README.md\`, \`.automated-product-engineer/onboarding/PRODUCT_REQUIREMENTS.md\`, \`.automated-product-engineer/onboarding/CURRENT_PRACTICES.md\`, \`.automated-product-engineer/onboarding/INCONSISTENCIES.md\`, and \`.automated-product-engineer/onboarding/DECISIONS.md\` before selecting a shared specialist skill.\n\nTreat \`.automated-product-engineer/onboarding/analysis.latest.json\` and \`.automated-product-engineer/onboarding/onboarding.json\` as static evidence and current review scope to validate, not as accepted policy. Follow accepted local decisions where they specialize the shared skills. Preserve explicit exceptions and update the onboarding documents and retrospective when an accepted contract changes.\n\nDo not weaken security, invent evidence, perform destructive data work, release, or merge without the required authority.\n`;
  for (const destination of skillDestinations(project, target)) {
    const file = path.join(destination, "project-engineering-context", "SKILL.md");
    if (writeOwnedFile(file, localSkill)) created.push(file);
  }
  return { root, created, documents };
}

async function chooseDomains(interactive, existing = []) {
  const validExisting = existing.filter((id) => onboardingDomains.some(([candidate]) => candidate === id));
  if (!interactive) return validExisting.length ? validExisting : onboardingDomains.map(([id]) => id);
  console.log("\nChoose the areas to baseline and plan:");
  onboardingDomains.forEach(([id, title], index) => console.log(`  ${index + 1}. ${title}${validExisting.includes(id) ? " (selected)" : ""}`));
  const defaultLabel = validExisting.length ? "current selection" : "all";
  const answer = await ask(`Select numbers separated by commas, type all, or press Enter for ${defaultLabel}: `);
  if (!answer) return validExisting.length ? validExisting : onboardingDomains.map(([id]) => id);
  if (/^all$/i.test(answer)) return onboardingDomains.map(([id]) => id);
  const indexes = [...new Set(answer.split(",").map((value) => Number.parseInt(value.trim(), 10) - 1))];
  if (!indexes.length || indexes.some((index) => !Number.isInteger(index) || !onboardingDomains[index])) throw new Error("Choose valid domain numbers separated by commas, or press Enter for all.");
  return indexes.map((index) => onboardingDomains[index][0]);
}

async function onboard(options, interactive = isInteractive()) {
  const project = resolveProject(options.project);
  const installation = readJson(path.join(project, ".automated-product-engineer", "installation.json"));
  const existingOnboarding = readJson(path.join(project, ".automated-product-engineer", "onboarding", "onboarding.json"));
  const target = options.targetProvided ? options.target : targets.includes(installation?.target) ? installation.target : options.target;
  const profile = detectProject(project);
  const report = auditProject(project, profile);
  const selectedDomains = await chooseDomains(interactive, existingOnboarding?.selectedDomains ?? []);
  const result = onboardingArtifacts(project, profile, report, selectedDomains, target);
  console.log(`Prepared codebase onboarding in ${result.root}`);
  console.log(`Selected: ${selectedDomains.join(", ")}`);
  console.log(`Documentation inventory: ${result.documents.length} file${result.documents.length === 1 ? "" : "s"}`);
  console.log(`Created ${result.created.length} team-owned file${result.created.length === 1 ? "" : "s"}; refreshed analysis.latest.json.`);
  console.log("Next: ask your agent to use `codebase-onboarding` to validate the baseline, surface contradictions, and recommend the first three upgrade slices.");
}

async function install(options) {
  const project = resolveProject(options.project);
  const profile = detectProject(project);
  const toolkitRoot = path.join(project, ".automated-product-engineer");
  const installedFiles = [];
  if (options.only.includes("skills")) copySkills(project, options.target, options.force, installedFiles);
  for (const component of ["docs", "templates"]) if (options.only.includes(component)) for (const entry of sharedEntries[component]) copyPackageEntry(entry, toolkitRoot, options.force, installedFiles);
  if (options.only.includes("examples")) {
    const entries = ["expo", "react-native"].includes(profile.kind) ? nativeExamples : ["ios", "swift-package"].includes(profile.kind) ? iosExamples : profile.kind === "android" ? androidExamples : profile.kind === "nextjs" ? webExamples : [...webExamples, ...nativeExamples, ...iosExamples, ...androidExamples];
    for (const entry of entries) copyPackageEntry(entry, toolkitRoot, options.force, installedFiles);
  }
  writeManagedFile(path.join(toolkitRoot, "INSTALLATION.md"), installationGuide(options.target, options.only, profile), options.force);
  writeManagedFile(path.join(toolkitRoot, "installation.json"), `${JSON.stringify({ package: "automated-product-engineer", target: options.target, parts: options.only, platform: profile.kind }, null, 2)}\n`, options.force);
  writeManagedFile(path.join(toolkitRoot, "project-profile.json"), `${JSON.stringify(profile, null, 2)}\n`, true);
  console.log(`Installed Automated Product Engineer into ${project}`);
  console.log(`Detected: ${profile.kind} · ${profile.router} · ${profile.packageManager}`);
  console.log(`Parts: ${options.only.join(", ")}`);
  console.log(`Toolkit: ${toolkitRoot}`);
  if (profile.findings.length) console.log(`Doctor: ${profile.findings.length} item${profile.findings.length === 1 ? "" : "s"} to review. Run: pnpm dlx automated-product-engineer doctor`);
  console.log(["expo", "ios", "swift-package", "android"].includes(profile.kind) ? "Next: run `pnpm dlx automated-product-engineer onboard` or `pnpm dlx automated-product-engineer launch`." : "Next: run `pnpm dlx automated-product-engineer onboard` or ask your agent to use automated-product-engineer for your feature.");
  if (isInteractive() && options.only.includes("skills")) {
    const answer = await ask("Analyze this codebase and prepare its onboarding workspace now? [Y/n] ");
    if (!/^n(?:o)?$/i.test(answer)) await onboard(options, true);
  }
}

function doctor(options) {
  const project = resolveProject(options.project);
  const profile = detectProject(project);
  if (options.json) { console.log(JSON.stringify(profile, null, 2)); return; }
  console.log(`Project: ${project}`);
  console.log(`Platform: ${profile.kind}`);
  console.log(`Router: ${profile.router}`);
  console.log(`Package manager: ${profile.packageManager}`);
  console.log(`App: ${profile.app.name}`);
  console.log(`App config: ${profile.configSource ?? "not found"}`);
  console.log(`Scheme: ${profile.app.scheme ?? "missing"}`);
  console.log(`Native projects: ${profile.nativeDirectories.join(", ") || (profile.kind === "android" ? "Gradle modules" : "managed/CNG")}`);
  console.log(`Capabilities: ${profile.capabilities.join(", ") || "none detected"}`);
  if (["ios", "swift-package"].includes(profile.kind)) {
    console.log(`Xcode workspace: ${profile.xcode.workspace ?? "not found"}`);
    console.log(`Xcode project: ${profile.xcode.project ?? "not found"}`);
    console.log(`Shared schemes: ${profile.xcode.schemes.join(", ") || "none"}`);
    console.log(`Bundle identifier: ${profile.xcode.bundleIdentifier ?? "not resolved"}`);
    console.log(`iOS deployment target: ${profile.xcode.deploymentTarget ?? "not resolved"}`);
    console.log(`Swift language version: ${profile.xcode.swiftVersion ?? "not resolved"}`);
    console.log(`Privacy manifests: ${profile.xcode.privacyManifests.join(", ") || "none"}`);
  }
  if (profile.kind === "android") {
    console.log(`Gradle settings: ${profile.android.settingsFile ?? "not found"}`);
    console.log(`Gradle wrapper: ${profile.android.wrapper ?? "not found"}`);
    console.log(`Application module: ${profile.android.applicationModule ?? "not resolved"}`);
    console.log(`Application ID: ${profile.android.applicationId ?? "not resolved"}`);
    console.log(`SDK levels: min ${profile.android.minSdk ?? "?"} · target ${profile.android.targetSdk ?? "?"} · compile ${profile.android.compileSdk ?? "?"}`);
    console.log(`UI: ${profile.android.compose ? "Jetpack Compose detected" : "Views or undetermined"}`);
    console.log(`Tests: unit ${profile.android.hasUnitTests ? "yes" : "no"} · instrumented ${profile.android.hasInstrumentedTests ? "yes" : "no"}`);
  }
  if (!profile.findings.length) console.log("Doctor: ready — no configuration warnings detected.");
  for (const finding of profile.findings) console.log(`${finding.level.toUpperCase()} ${finding.code}: ${finding.message}`);
}

function audit(options) {
  const project = resolveProject(options.project);
  const profile = detectProject(project);
  const report = auditProject(project, profile);
  console.log(options.json ? JSON.stringify(report, null, 2) : formatAudit(report));
}

function launch(options) {
  const project = resolveProject(options.project);
  const profile = detectProject(project);
  if (["ios", "swift-package"].includes(profile.kind)) {
    if (options.platform && options.platform !== "ios") throw new Error("Native iOS launch supports the iOS platform only.");
    if (options.tunnel || options.clear) throw new Error("--tunnel and --clear are Expo options and are unavailable for native iOS projects.");
    const target = profile.xcode.workspace ?? profile.xcode.project ?? (existsSync(path.join(project, "Package.swift")) ? "Package.swift" : null);
    if (!target) throw new Error("No Xcode workspace, Xcode project, or Package.swift was found.");
    const command = "open";
    const args = ["-a", "Xcode", path.join(project, target)];
    console.log(`Opening ${profile.app.name} in Xcode with ${command} ${args.join(" ")}`);
    if (options.dryRun) return;
    const result = spawnSync(command, args, { cwd: project, stdio: "inherit", env: process.env });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 0;
    return;
  }
  if (profile.kind === "android") {
    if (options.platform && options.platform !== "android") throw new Error("Native Android launch supports the Android platform only.");
    if (options.tunnel || options.clear) throw new Error("--tunnel and --clear are Expo options and are unavailable for native Android projects.");
    const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "studio";
    const args = process.platform === "darwin" ? ["-a", "Android Studio", project] : process.platform === "win32" ? ["/c", "start", "", "studio64.exe", project] : [project];
    console.log(`Opening ${profile.app.name} in Android Studio with ${command} ${args.join(" ")}`);
    if (options.dryRun) return;
    const result = spawnSync(command, args, { cwd: project, stdio: "inherit", env: process.env });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 0;
    return;
  }
  if (!["expo", "react-native"].includes(profile.kind)) throw new Error("Launch requires an Expo, React Native, native iOS, Swift package, or native Android project.");
  const runners = { pnpm: ["pnpm", ["exec"]], npm: ["npx", []], yarn: ["yarn", []], bun: ["bunx", []] };
  const [command, prefix] = runners[profile.packageManager] ?? runners.npm;
  const args = [...prefix];
  if (profile.kind === "expo") {
    args.push("expo", "start");
    if (profile.usesDevelopmentClient) args.push("--dev-client");
    if (options.platform) args.push(`--${options.platform}`);
    if (options.tunnel) args.push("--tunnel");
    if (options.clear) args.push("--clear");
  } else {
    if (options.platform === "web") throw new Error("Bare React Native launch supports iOS or Android. Use the repository's web target when it has one.");
    if (options.tunnel) throw new Error("--tunnel is an Expo launch option and is unavailable for bare React Native.");
    args.push("react-native", options.platform === "ios" ? "run-ios" : options.platform === "android" ? "run-android" : "start");
    if (options.clear && !options.platform) args.push("--reset-cache");
  }
  console.log(`Launching ${profile.app.name} with ${command} ${args.join(" ")}`);
  if (options.dryRun) return;
  const result = spawnSync(command, args, { cwd: project, stdio: "inherit", env: process.env });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 0;
}

try {
  const options = parseOptions(process.argv.slice(2));
  if (options.command === "install") await install(options);
  if (options.command === "onboard") await onboard(options);
  if (options.command === "audit") audit(options);
  if (options.command === "doctor") doctor(options);
  if (options.command === "launch") launch(options);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
