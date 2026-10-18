#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const components = path.join(root, "contracts/components");
const tokens = JSON.parse(readFileSync(path.join(root, "contracts/tokens/product.tokens.json"), "utf8"));
const tokenNames = new Set();
function collectTokenNames(node, prefix = []) {
  if (node && typeof node === "object" && Object.hasOwn(node, "$value")) tokenNames.add(prefix.join("."));
  else if (node && typeof node === "object") for (const [key, value] of Object.entries(node)) if (!key.startsWith("$")) collectTokenNames(value, [...prefix, key]);
}
collectTokenNames(tokens);
const required = ["id", "purpose", "variants", "states", "tokens", "accessibility", "platformDifferences", "scenarios"];
const componentIds = new Set();
for (const file of readdirSync(components).filter((name) => name.endsWith(".json"))) {
  const contract = JSON.parse(readFileSync(path.join(components, file), "utf8"));
  for (const key of required) if (!Object.hasOwn(contract, key)) throw new Error(`${file} is missing ${key}`);
  for (const key of ["variants", "states", "tokens", "scenarios"]) if (!Array.isArray(contract[key]) || !contract[key].length) throw new Error(`${file}.${key} must be non-empty`);
  if (componentIds.has(contract.id)) throw new Error(`Duplicate component id: ${contract.id}`);
  componentIds.add(contract.id);
  for (const token of contract.tokens) if (!tokenNames.has(token)) throw new Error(`${file} references unknown token ${token}`);
}
const vectorIds = new Set();
for (const file of readdirSync(path.join(root, "contracts/scenarios")).filter((name) => name.endsWith(".json"))) {
  const contract = JSON.parse(readFileSync(path.join(root, "contracts/scenarios", file), "utf8"));
  if (contract.schemaVersion !== 1 || !contract.feature || !Array.isArray(contract.vectors) || !contract.vectors.length) throw new Error(`${file} has an invalid scenario-vector envelope`);
  for (const vector of contract.vectors) {
    for (const key of ["id", "initial", "command", "expected"]) if (!Object.hasOwn(vector, key)) throw new Error(`${file} vector is missing ${key}`);
    if (vectorIds.has(vector.id)) throw new Error(`Duplicate scenario id: ${vector.id}`);
    vectorIds.add(vector.id);
  }
}
console.log(`Validated ${componentIds.size} component contract, ${tokenNames.size} tokens, and ${vectorIds.size} scenario vectors.`);
