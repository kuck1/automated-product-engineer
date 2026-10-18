#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "contracts/scenarios/work-item.vectors.json");
const destinations = {
  kotlin: path.join(root, "shared/product-kernel/src/commonTest/kotlin/dev/example/product/domain/GeneratedWorkItemVectors.kt"),
  typescript: path.join(root, "webApp/src/generated/work-item-vectors.ts"),
};

export function compileScenarioSource(raw) {
  const contract = JSON.parse(raw);
  if (!Array.isArray(contract.vectors) || !contract.vectors.length) throw new Error("Scenario vectors must be non-empty");
  const stages = new Set(["DRAFT", "VALIDATING", "READY", "BLOCKED"]);
  const kinds = new Set(["APPLIED", "CONFLICT", "REJECTED"]);
  const digest = createHash("sha256").update(raw).digest("hex");
  const rows = contract.vectors.map((vector) => {
    const values = [vector.id, vector.initial.stage, vector.initial.revision, vector.command.operationId, vector.command.expectedRevision, vector.command.nextStage, vector.expected.kind, vector.expected.stage, vector.expected.revision];
    if (values.some((value) => value === undefined)) throw new Error(`Incomplete scenario vector: ${vector.id ?? "unknown"}`);
    if (!stages.has(vector.initial.stage) || !stages.has(vector.command.nextStage) || !stages.has(vector.expected.stage)) throw new Error(`Unknown stage in scenario vector: ${vector.id}`);
    if (!kinds.has(vector.expected.kind)) throw new Error(`Unknown result kind in scenario vector: ${vector.id}`);
    for (const value of [vector.initial.revision, vector.command.expectedRevision, vector.expected.revision]) if (!Number.isSafeInteger(value) || value < 0) throw new Error(`Invalid revision in scenario vector: ${vector.id}`);
    return `    WorkItemVector(${JSON.stringify(vector.id)}, WorkStage.${vector.initial.stage}, ${vector.initial.revision}L, ${JSON.stringify(vector.command.operationId)}, ${vector.command.expectedRevision}L, WorkStage.${vector.command.nextStage}, ${JSON.stringify(vector.expected.kind)}, WorkStage.${vector.expected.stage}, ${vector.expected.revision}L),`;
  });
  const typescriptVectors = contract.vectors.map((vector) => ({
    id: vector.id,
    initial: { id: "work-1", title: "Launch", stage: vector.initial.stage, revision: vector.initial.revision },
    command: { operationId: vector.command.operationId, workItemId: "work-1", expectedRevision: vector.command.expectedRevision, nextStage: vector.command.nextStage },
    expected: vector.expected,
  }));
  return {
    digest,
    kotlin: [`// Generated from contracts/scenarios/work-item.vectors.json. Do not edit.`, `package dev.example.product.domain`, ``, `data class WorkItemVector(`, `    val id: String,`, `    val initialStage: WorkStage,`, `    val initialRevision: Long,`, `    val operationId: String,`, `    val expectedRevision: Long,`, `    val nextStage: WorkStage,`, `    val expectedKind: String,`, `    val expectedStage: WorkStage,`, `    val expectedResultRevision: Long,`, `)`, ``, `const val workItemVectorSourceSha256: String = "${digest}"`, `val generatedWorkItemVectors = listOf(`, ...rows, `)`, ``].join("\n"),
    typescript: [`// Generated from contracts/scenarios/work-item.vectors.json. Do not edit.`, `import type { TransitionCommand, WorkItem } from "./work-item-policy";`, ``, `export const workItemVectorSourceSha256 = "${digest}" as const;`, `export type WorkItemVector = { id: string; initial: WorkItem; command: TransitionCommand; expected: { kind: "APPLIED" | "CONFLICT" | "REJECTED"; stage: WorkItem["stage"]; revision: number } };`, `export const generatedWorkItemVectors = ${JSON.stringify(typescriptVectors, null, 2)} as const satisfies readonly WorkItemVector[];`, ``].join("\n"),
  };
}

function run() {
  const compiled = compileScenarioSource(readFileSync(source, "utf8"));
  let drift = false;
  if (process.argv.includes("--check")) {
    for (const [kind, destination] of Object.entries(destinations)) {
      if (!existsSync(destination) || readFileSync(destination, "utf8") !== compiled[kind]) {
        console.error(`Generated scenario drift: ${path.relative(root, destination)}`);
        drift = true;
      }
    }
    if (drift) {
      process.exitCode = 1;
      return;
    }
    console.log(`Verified ${compiled.digest.slice(0, 12)} for shared scenario vectors.`);
    return;
  }
  for (const [kind, destination] of Object.entries(destinations)) {
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, compiled[kind]);
  }
  console.log(`Generated ${compiled.digest.slice(0, 12)} for shared scenario vectors.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
