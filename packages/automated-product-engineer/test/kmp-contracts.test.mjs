import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const template = path.join(repositoryRoot, "templates", "kotlin-multiplatform");
const compiler = await import(path.join(template, "tools", "compile-tokens.mjs"));
const scenarioCompiler = await import(path.join(template, "tools", "compile-scenarios.mjs"));
const featureCompiler = await import(path.join(template, "tools", "compile-feature.mjs"));

test("KMP token compiler resolves typed aliases and records one source digest", () => {
  const source = readFileSync(path.join(template, "contracts", "tokens", "product.tokens.json"), "utf8");
  const output = compiler.compileTokenSource(source);
  assert.match(output.kotlin, new RegExp(output.digest));
  assert.match(output.swift, new RegExp(output.digest));
  assert.match(output.css, new RegExp(output.digest));
  assert.match(output.kotlin, /colorActionPrimary/);
});

test("KMP token compiler rejects cycles and missing aliases", () => {
  assert.throws(() => compiler.compileTokenSource(JSON.stringify({ a: { $type: "color", $value: "{b}" }, b: { $type: "color", $value: "{a}" } })), /Token alias cycle/);
  assert.throws(() => compiler.compileTokenSource(JSON.stringify({ a: { $type: "color", $value: "{missing}" } })), /Unknown token reference/);
});

test("KMP scenario compiler emits one typed common-test oracle", () => {
  const source = readFileSync(path.join(template, "contracts", "scenarios", "work-item.vectors.json"), "utf8");
  const output = scenarioCompiler.compileScenarioSource(source);
  assert.match(output.kotlin, new RegExp(output.digest));
  assert.match(output.kotlin, /draft-begins-validation/);
  assert.match(output.kotlin, /WorkStage\.READY/);
  assert.throws(() => scenarioCompiler.compileScenarioSource(JSON.stringify({ vectors: [] })), /must be non-empty/);
});

test("feature capsule compiler emits Kotlin and TypeScript policy with one digest", () => {
  const source = readFileSync(path.join(template, "contracts", "features", "work-item.feature.json"), "utf8");
  const output = featureCompiler.compileFeatureSource(source);
  assert.match(output.kotlin, new RegExp(output.digest));
  assert.match(output.typescript, new RegExp(output.digest));
  assert.match(output.kotlin, /GeneratedWorkItemPolicy/);
  assert.match(output.typescript, /transitionWorkItem/);
  assert.throws(() => featureCompiler.compileFeatureSource(JSON.stringify({ schemaVersion: 1, id: "work-item", stages: [] })), /stages.*non-empty/i);
});
