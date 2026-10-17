import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsDirectory = path.join(root, "skills");
const targets = ["codex", "claude", "cursor", "windsurf", "copilot", "orca", "generic"] as const;
type Target = (typeof targets)[number];

type Options = {
  target: Target;
  project: string;
  force: boolean;
};

const cursorRule = `---
description: Apply the automated product engineering workflow for substantial features, redesigns, and design-to-app work.
globs:
alwaysApply: false
---

Read @.ai/skills/automated-product-engineer/SKILL.md and load only the specialist skills it routes to for the current task. Inspect available context before asking questions; when a material input is still missing, ask only for that decision and generate a tailored handoff request when another tool or teammate must provide it.
`;

const cursorCommand = `Use the workflow in \`.ai/skills/automated-product-engineer/SKILL.md\` to complete the requested feature from intake through a review-ready draft pull request. Load only relevant specialist skills. Inspect available context before asking questions and generate a tailored request only when a material input must come from another tool or teammate. Preserve repository instructions and do not merge.
`;

const windsurfRule = `# Automated Product Engineer

For substantial feature, redesign, or design-to-app work, read \`.ai/skills/automated-product-engineer/SKILL.md\` and load only the specialist skills it routes to. Inspect available context before asking questions; ask only for material missing decisions and generate a tailored handoff request when another tool or teammate must supply them. Preserve repository instructions, produce current QA and screenshot evidence, run retrospective fix-back, and stop at a review-ready draft pull request unless the user explicitly authorizes more.
`;

const copilotPrompt = `Use the \`automated-product-engineer\` agent skill to complete the requested feature from intake through a review-ready draft pull request. Load only relevant specialist skills, inspect available context before asking questions, and generate a tailored request only when a material input must come from another tool or teammate. Preserve repository instructions, capture current desktop and mobile evidence, run retrospective fix-back, and do not merge.
`;

const genericWorkflow = `# Automated Product Engineer

For substantial feature, redesign, or design-to-app work, begin with \`.ai/skills/automated-product-engineer/SKILL.md\`. Load only the specialist skills it routes to. Inspect available context before asking questions; ask only for material missing decisions and generate a tailored handoff request when another tool or teammate must supply them. Follow the target repository's instructions and preserve human authority over merge and release.
`;

function usage(): string {
  return [
    "Install the public product-engineering skills into another project.",
    "",
    "Usage:",
    "  pnpm install:skills --target <target> --project <path> [--force]",
    "",
    `Targets: ${targets.join(", ")}`,
  ].join("\n");
}

function parseOptions(args: string[]): Options {
  let target: string | undefined;
  let project: string | undefined;
  let force = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") {
      console.log(usage());
      process.exit(0);
    }
    if (argument === "--force") {
      force = true;
      continue;
    }
    if (argument === "--target" || argument === "--project") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${argument}.\n\n${usage()}`);
      if (argument === "--target") target = value;
      else project = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}\n\n${usage()}`);
  }

  if (!target || !targets.includes(target as Target)) {
    throw new Error(`Choose a target: ${targets.join(", ")}.\n\n${usage()}`);
  }
  if (!project) throw new Error(`Provide --project with an existing directory.\n\n${usage()}`);
  return { target: target as Target, project, force };
}

function resolveProject(input: string): string {
  const expanded = input === "~" ? homedir() : input.startsWith("~/") ? path.join(homedir(), input.slice(2)) : input;
  const project = path.resolve(expanded);
  if (!existsSync(project) || !statSync(project).isDirectory()) {
    throw new Error(`Project directory does not exist: ${project}`);
  }
  return project;
}

function writeFile(destination: string, content: Buffer | string, force: boolean): void {
  const next = Buffer.isBuffer(content) ? content : Buffer.from(content);
  if (existsSync(destination)) {
    const current = readFileSync(destination);
    if (current.equals(next)) return;
    if (!force) throw new Error(`Refusing to overwrite existing file: ${destination}`);
  }
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, next);
}

function copyDirectory(source: string, destination: string, force: boolean): void {
  for (const entry of readdirSync(source, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDirectory(sourcePath, destinationPath, force);
    else if (entry.isFile()) writeFile(destinationPath, readFileSync(sourcePath), force);
  }
}

function copySkills(destination: string, force: boolean): void {
  copyDirectory(skillsDirectory, destination, force);
}

function install(options: Options): void {
  const project = resolveProject(options.project);
  const { force, target } = options;

  if (target === "codex") copySkills(path.join(project, ".agents", "skills"), force);
  else if (target === "claude") copySkills(path.join(project, ".claude", "skills"), force);
  else if (target === "cursor") {
    copySkills(path.join(project, ".ai", "skills"), force);
    writeFile(path.join(project, ".cursor", "rules", "automated-product-engineer.mdc"), cursorRule, force);
    writeFile(path.join(project, ".cursor", "commands", "automated-product-engineer.md"), cursorCommand, force);
  } else if (target === "windsurf") {
    copySkills(path.join(project, ".ai", "skills"), force);
    writeFile(path.join(project, ".windsurf", "rules", "automated-product-engineer.md"), windsurfRule, force);
  } else if (target === "copilot") {
    copySkills(path.join(project, ".agents", "skills"), force);
    writeFile(path.join(project, ".github", "prompts", "automated-product-engineer.prompt.md"), copilotPrompt, force);
  } else if (target === "orca") {
    copySkills(path.join(project, ".agents", "skills"), force);
    copySkills(path.join(project, ".claude", "skills"), force);
  } else {
    copySkills(path.join(project, ".ai", "skills"), force);
    writeFile(path.join(project, "AI_WORKFLOW.md"), genericWorkflow, force);
  }

  console.log(`Installed ${target} workflow into ${project}`);
}

try {
  install(parseOptions(process.argv.slice(2)));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
