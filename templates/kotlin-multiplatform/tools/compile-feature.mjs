#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "contracts/features/work-item.feature.json");
const outputs = {
  kotlin: path.join(root, "shared/product-kernel/src/commonMain/kotlin/dev/example/product/domain/GeneratedWorkItemPolicy.kt"),
  typescript: path.join(root, "webApp/src/generated/work-item-policy.ts"),
  manifest: path.join(root, "contracts/generated/work-item.manifest.json"),
};

function validate(contract) {
  if (contract.schemaVersion !== 1 || contract.id !== "work-item") throw new Error("Unsupported feature contract");
  if (!Array.isArray(contract.stages) || !contract.stages.length) throw new Error("Feature stages must be non-empty");
  const stages = new Set(contract.stages);
  for (const transition of contract.transitions ?? []) {
    if (!stages.has(transition.from) || !stages.has(transition.to)) throw new Error(`Unknown transition ${transition.from} -> ${transition.to}`);
  }
  for (const key of ["aggregateIdentity", "expectedRevision", "transition"]) {
    if (typeof contract.guards?.[key] !== "string") throw new Error(`Missing guard ${key}`);
  }
}

export function compileFeatureSource(raw) {
  const contract = JSON.parse(raw);
  validate(contract);
  const digest = createHash("sha256").update(raw).digest("hex");
  const transitionRows = contract.transitions.map(({ from, to }) => `        WorkStage.${from} to WorkStage.${to},`);
  const kotlin = [
    `// Generated from contracts/features/work-item.feature.json. Do not edit.`,
    `package dev.example.product.domain`,
    ``,
    `object GeneratedWorkItemPolicy {`,
    `    const val sourceSha256: String = "${digest}"`,
    `    private val allowedTransitions = setOf(`,
    ...transitionRows,
    `    )`,
    ``,
    `    fun isAllowed(from: WorkStage, to: WorkStage): Boolean = (from to to) in allowedTransitions`,
    `}`,
    ``,
  ].join("\n");
  const transitionPairs = contract.transitions.map(({ from, to }) => `  "${from}:${to}",`);
  const typescript = [
    `// Generated from contracts/features/work-item.feature.json. Do not edit.`,
    `export const featureContractDigest = "${digest}" as const;`,
    `export const workStages = ${JSON.stringify(contract.stages)} as const;`,
    `export type WorkStage = (typeof workStages)[number];`,
    `export type WorkItem = { id: string; title: string; stage: WorkStage; revision: number };`,
    `export type TransitionCommand = { operationId: string; workItemId: string; expectedRevision: number; nextStage: WorkStage };`,
    `export type TransitionResult = { kind: "APPLIED" | "CONFLICT" | "REJECTED"; code?: string; item: WorkItem };`,
    `const allowedTransitions = new Set<string>([`,
    ...transitionPairs,
    `]);`,
    ``,
    `export function transitionWorkItem(item: WorkItem, command: TransitionCommand): TransitionResult {`,
    `  if (item.id !== command.workItemId) return { kind: "REJECTED", code: ${JSON.stringify(contract.guards.aggregateIdentity)}, item };`,
    `  if (item.revision !== command.expectedRevision) return { kind: "CONFLICT", code: ${JSON.stringify(contract.guards.expectedRevision)}, item };`,
    `  if (!allowedTransitions.has(\`${"${item.stage}:${command.nextStage}"}\`)) return { kind: "REJECTED", code: ${JSON.stringify(contract.guards.transition)}, item };`,
    `  return { kind: "APPLIED", item: { ...item, stage: command.nextStage, revision: item.revision + 1 } };`,
    `}`,
    ``,
  ].join("\n");
  const manifest = `${JSON.stringify({ schemaVersion: 1, feature: contract.id, source: "contracts/features/work-item.feature.json", sha256: digest, projections: ["kotlin", "typescript"] }, null, 2)}\n`;
  return { digest, kotlin, typescript, manifest };
}

function run() {
  const compiled = compileFeatureSource(readFileSync(source, "utf8"));
  let drift = false;
  for (const [kind, destination] of Object.entries(outputs)) {
    const content = compiled[kind];
    if (process.argv.includes("--check")) {
      if (!existsSync(destination) || readFileSync(destination, "utf8") !== content) {
        console.error(`Generated feature drift: ${path.relative(root, destination)}`);
        drift = true;
      }
    } else {
      mkdirSync(path.dirname(destination), { recursive: true });
      writeFileSync(destination, content);
    }
  }
  if (drift) process.exitCode = 1;
  else console.log(`${process.argv.includes("--check") ? "Verified" : "Generated"} ${compiled.digest.slice(0, 12)} across Kotlin and TypeScript.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
