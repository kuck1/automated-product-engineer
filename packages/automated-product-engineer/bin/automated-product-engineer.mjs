#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(packageRoot, "..", "..");
const sourceRoot = existsSync(path.join(repositoryRoot, "skills", "automated-product-engineer", "SKILL.md"))
  ? repositoryRoot
  : path.join(packageRoot, "payload");
const targets = ["universal", "codex", "claude", "cursor", "windsurf", "copilot", "orca", "generic"];
const components = ["skills", "docs", "templates", "examples"];

const adapters = {
  cursorRule: `---
description: Apply the automated product engineering workflow for substantial product work across web, React Native, and Expo.
globs:
alwaysApply: false
---

Read @.ai/skills/automated-product-engineer/SKILL.md and load only the specialist skills it routes to. Read @.automated-product-engineer/INSTALLATION.md for the detected project profile and reference map. For Expo or React Native work, load the expo-native-app skill before changing routing, auth, native configuration, device capabilities, builds, updates, or store delivery.
`,
  cursorCommand: `Use the workflow in \`.ai/skills/automated-product-engineer/SKILL.md\` to complete the requested product work. Read \`.automated-product-engineer/INSTALLATION.md\` and \`project-profile.json\` first. For Expo or React Native, use the \`expo-native-app\` specialist and verify on the relevant simulator or device. Preserve repository instructions and stop at the user's authorized delivery boundary.
`,
  windsurfRule: `# Automated Product Engineer

For substantial product work, read \`.ai/skills/automated-product-engineer/SKILL.md\` and the detected project profile in \`.automated-product-engineer/INSTALLATION.md\`. For Expo or React Native, load \`expo-native-app\` before changing navigation, auth, native configuration, device capabilities, builds, updates, or store delivery. Preserve repository instructions and verify on the actual target platform.
`,
  copilotPrompt: `Use the \`automated-product-engineer\` skill to complete this work. Read \`.automated-product-engineer/INSTALLATION.md\` and \`project-profile.json\` first. If this is Expo or React Native, use \`expo-native-app\`, verify native lifecycle and platform behavior, and include simulator or device evidence.
`,
  genericWorkflow: `# Automated Product Engineer

Begin with \`.ai/skills/automated-product-engineer/SKILL.md\` and read \`.automated-product-engineer/INSTALLATION.md\` for the detected project profile. Load only the needed specialists. Expo and React Native work must use \`expo-native-app\` and be verified in the relevant native runtime rather than inferred from a browser viewport.
`,
};

const sharedEntries = {
  docs: ["README.md", "AGENTS.md", "LICENSE", "docs", "checklists"],
  templates: ["templates"],
};
const webExamples = ["app/api/examples", "app/examples/page.tsx", "app/guide/page.tsx", "app/system/page.tsx", "src/examples", "src/guide", "src/system", "src/ui", "supabase/migrations", "e2e/reference-app.spec.ts"];
const nativeExamples = ["native/examples"];

function usage() {
  return [
    "Install and run the Automated Product Engineer toolkit.", "",
    "Usage:",
    "  pnpm dlx automated-product-engineer",
    "  pnpm dlx automated-product-engineer doctor",
    "  pnpm dlx automated-product-engineer launch [--ios|--android|--web] [--tunnel] [--clear]",
    "  pnpm dlx automated-product-engineer install [--target <target>] [--project <path>] [--only <parts>] [--force]", "",
    "The installer detects Next.js, Expo, or bare React Native automatically.",
    `Targets: ${targets.join(", ")}`,
    `Parts:   ${components.join(", ")} (default: all)`, "",
    "Examples:",
    "  pnpm dlx automated-product-engineer",
    "  pnpm dlx automated-product-engineer doctor",
    "  pnpm dlx automated-product-engineer launch --ios",
    "  pnpm dlx automated-product-engineer install --target cursor --only skills,docs",
  ].join("\n");
}

function parseOptions(args) {
  const remaining = [...args];
  const command = remaining[0] && !remaining[0].startsWith("-") ? remaining.shift() : "install";
  if (!["install", "doctor", "launch"].includes(command)) throw new Error(`Unknown command: ${command}\n\n${usage()}`);
  const options = { command, target: "universal", project: ".", only: [...components], force: false, platform: null, tunnel: false, clear: false, json: false, dryRun: false };
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
      if (argument === "--target") options.target = value;
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

function detectProject(project) {
  const manifest = readJson(path.join(project, "package.json")) ?? {};
  const dependencies = { ...(manifest.dependencies ?? {}), ...(manifest.devDependencies ?? {}) };
  const hasExpo = Boolean(dependencies.expo);
  const hasReactNative = Boolean(dependencies["react-native"]);
  const hasNext = Boolean(dependencies.next);
  const kind = hasExpo ? "expo" : hasReactNative ? "react-native" : hasNext ? "nextjs" : "unknown";
  const appJson = readJson(path.join(project, "app.json"));
  const expoConfig = appJson?.expo ?? appJson ?? {};
  const dynamicConfigFile = ["app.config.ts", "app.config.js", "app.config.mjs", "app.config.cjs"]
    .find((name) => existsSync(path.join(project, name))) ?? null;
  const configSource = appJson ? "app.json" : dynamicConfigFile ?? null;
  const packageManager = detectPackageManager(project, manifest);
  const router = dependencies["expo-router"] ? "expo-router" : dependencies["@react-navigation/native"] ? "react-navigation" : hasNext ? "next-router" : "unknown";
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
  if (kind === "unknown") findings.push({ level: "warning", code: "platform-unknown", message: "No Next.js, Expo, or React Native dependency was detected." });
  if (["expo", "react-native"].includes(kind) && !expoConfig.scheme && !dynamicConfigFile) findings.push({ level: "warning", code: "scheme-missing", message: "No app scheme was found. OAuth redirects and production deep links need a stable scheme." });
  if (kind === "expo" && dynamicConfigFile && !appJson) findings.push({ level: "note", code: "dynamic-config", message: `Detected ${dynamicConfigFile}. Run Expo config to verify resolved schemes, identifiers, plugins, and permissions.` });
  if (kind === "expo" && !existsSync(path.join(project, "eas.json"))) findings.push({ level: "note", code: "eas-unconfigured", message: "No eas.json was found. Local development still works; EAS builds and updates are not configured yet." });
  if (kind === "expo" && dependencies["expo-auth-session"] && !dependencies["expo-dev-client"]) findings.push({ level: "warning", code: "auth-needs-dev-build", message: "OAuth is present without expo-dev-client. Stable native redirects should be tested in a development build, not Expo Go." });
  if (kind === "expo" && dependencies["expo-notifications"] && !dependencies["expo-dev-client"]) findings.push({ level: "warning", code: "push-needs-dev-build", message: "Push notifications require a development build or release build." });
  return {
    schemaVersion: 1, kind, packageManager, router,
    configSource,
    app: { name: expoConfig.name ?? manifest.name ?? path.basename(project), slug: expoConfig.slug ?? null, scheme: expoConfig.scheme ?? null, iosBundleIdentifier: expoConfig.ios?.bundleIdentifier ?? null, androidPackage: expoConfig.android?.package ?? null },
    nativeDirectories, usesDevelopmentClient: Boolean(dependencies["expo-dev-client"]), easConfigured: existsSync(path.join(project, "eas.json")), capabilities, findings,
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

function copySkills(project, target, force, installedFiles) {
  const skillsDirectory = path.join(sourceRoot, "skills");
  const destinations = target === "universal" ? [path.join(project, ".agents", "skills"), path.join(project, ".claude", "skills"), path.join(project, ".ai", "skills")]
    : ["codex", "copilot"].includes(target) ? [path.join(project, ".agents", "skills")]
      : target === "claude" ? [path.join(project, ".claude", "skills")]
        : target === "orca" ? [path.join(project, ".agents", "skills"), path.join(project, ".claude", "skills")]
          : [path.join(project, ".ai", "skills")];
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
  return `# Automated Product Engineer — Local Toolkit

This is an installed reference kit. Adapt its patterns to the host repository; do not import this directory as application runtime code.

## Detected project

- **Platform:** ${profile.kind}
- **Router:** ${profile.router}
- **Package manager:** ${profile.packageManager}
- **Development client:** ${profile.usesDevelopmentClient ? "detected" : "not detected"}

## Installed parts

${included}
${nativeStart}
## Shared starting points

- \`docs/how-to-use.md\`: end-to-end workflow.
- \`docs/knowledge-coverage.md\`: maintained capability coverage.
- \`docs/architecture.md\`: ownership and boundaries.
- \`docs/testing-and-ci.md\`: focused tests and CI.
- \`checklists/integration.md\`: implementation gates.

The selected agent adapter is **${target}**. Re-run the installer to update identical files. Use \`--force\` only after reviewing changes to locally modified toolkit files.
`;
}

function install(options) {
  const project = resolveProject(options.project);
  const profile = detectProject(project);
  const toolkitRoot = path.join(project, ".automated-product-engineer");
  const installedFiles = [];
  if (options.only.includes("skills")) copySkills(project, options.target, options.force, installedFiles);
  for (const component of ["docs", "templates"]) if (options.only.includes(component)) for (const entry of sharedEntries[component]) copyPackageEntry(entry, toolkitRoot, options.force, installedFiles);
  if (options.only.includes("examples")) {
    const entries = ["expo", "react-native"].includes(profile.kind) ? nativeExamples : profile.kind === "nextjs" ? webExamples : [...webExamples, ...nativeExamples];
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
  console.log(profile.kind === "expo" ? "Next: run `pnpm dlx automated-product-engineer launch` or ask your agent to use expo-native-app." : "Next: ask your agent to use automated-product-engineer for your feature.");
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
  console.log(`Native projects: ${profile.nativeDirectories.join(", ") || "managed/CNG"}`);
  console.log(`Capabilities: ${profile.capabilities.join(", ") || "none detected"}`);
  if (!profile.findings.length) console.log("Doctor: ready — no configuration warnings detected.");
  for (const finding of profile.findings) console.log(`${finding.level.toUpperCase()} ${finding.code}: ${finding.message}`);
}

function launch(options) {
  const project = resolveProject(options.project);
  const profile = detectProject(project);
  if (!["expo", "react-native"].includes(profile.kind)) throw new Error("Launch requires an Expo or React Native project.");
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
  if (options.command === "install") install(options);
  if (options.command === "doctor") doctor(options);
  if (options.command === "launch") launch(options);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
