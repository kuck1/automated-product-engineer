#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "contracts/tokens/product.tokens.json");
const outputs = {
  kotlin: path.join(root, "shared/product-kernel/src/commonMain/kotlin/dev/example/product/design/GeneratedTokens.kt"),
  swift: path.join(root, "iosApp/Generated/DesignTokens.swift"),
  css: path.join(root, "web/Generated/tokens.css"),
};

function flatten(node, inheritedType, parts = [], result = new Map()) {
  if (!node || typeof node !== "object" || Array.isArray(node)) throw new Error(`Invalid token group at ${parts.join(".") || "root"}`);
  const type = node.$type ?? inheritedType;
  if (Object.hasOwn(node, "$value")) {
    if (!parts.length || !type) throw new Error(`Token ${parts.join(".") || "root"} is missing a type`);
    result.set(parts.join("."), { type, value: node.$value });
    return result;
  }
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith("$")) flatten(value, type, [...parts, key], result);
  }
  return result;
}

function resolveTokens(tokens) {
  const resolved = new Map();
  const visit = (name, stack = []) => {
    if (resolved.has(name)) return resolved.get(name);
    if (stack.includes(name)) throw new Error(`Token alias cycle: ${[...stack, name].join(" -> ")}`);
    const token = tokens.get(name);
    if (!token) throw new Error(`Unknown token reference: ${name}`);
    let value = token.value;
    if (typeof value === "string") {
      const match = value.match(/^\{([^}]+)\}$/);
      if (match) {
        const target = visit(match[1], [...stack, name]);
        if (target.type !== token.type) throw new Error(`Type mismatch: ${name} references ${match[1]}`);
        value = target.value;
      }
    }
    const next = { type: token.type, value };
    resolved.set(name, next);
    return next;
  };
  for (const name of tokens.keys()) visit(name);
  return resolved;
}

const pascal = (name) => name.split(".").flatMap((part) => part.split(/[-_]/)).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
const camel = (name) => { const next = pascal(name); return next.charAt(0).toLowerCase() + next.slice(1); };
const cssName = (name) => `--${name.replace(/[._]/g, "-")}`;

function colorArgb(value) {
  if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?$/.test(value)) throw new Error(`Unsupported color: ${JSON.stringify(value)}`);
  const hex = value.slice(1);
  return hex.length === 6 ? `FF${hex.toUpperCase()}` : `${hex.slice(6).toUpperCase()}${hex.slice(0, 6).toUpperCase()}`;
}

function scalar(token) {
  if (token.type === "color") return { kotlin: `0x${colorArgb(token.value)}u`, swift: `0x${colorArgb(token.value)}`, css: token.value };
  if (["dimension", "duration"].includes(token.type)) {
    if (!token.value || typeof token.value.value !== "number" || typeof token.value.unit !== "string") throw new Error(`Invalid ${token.type} token`);
    return { kotlin: `${token.value.value}f`, swift: `${token.value.value}.0`, css: `${token.value.value}${token.value.unit === "dp" ? "px" : token.value.unit}` };
  }
  if (token.type === "number" && typeof token.value === "number") return { kotlin: `${token.value}`, swift: `${token.value}`, css: `${token.value}` };
  if (token.type === "string" && typeof token.value === "string") return { kotlin: JSON.stringify(token.value), swift: JSON.stringify(token.value), css: token.value };
  throw new Error(`Unsupported token type: ${token.type}`);
}

export function compileTokenSource(raw) {
  const digest = createHash("sha256").update(raw).digest("hex");
  const tokens = resolveTokens(flatten(JSON.parse(raw)));
  const rows = [...tokens.entries()].sort(([a], [b]) => a.localeCompare(b));
  const kotlin = [`// Generated from contracts/tokens/product.tokens.json. Do not edit.`, `package dev.example.product.design`, ``, `object GeneratedTokens {`, `    const val sourceSha256: String = "${digest}"`, ...rows.map(([name, token]) => `    const val ${camel(name)} = ${scalar(token).kotlin}`), `}`, ``].join("\n");
  const swift = [`// Generated from contracts/tokens/product.tokens.json. Do not edit.`, `import Foundation`, ``, `enum DesignTokens {`, `    static let sourceSha256 = "${digest}"`, ...rows.map(([name, token]) => `    static let ${camel(name)} = ${scalar(token).swift}`), `}`, ``].join("\n");
  const css = [`/* Generated from contracts/tokens/product.tokens.json. Do not edit. */`, `:root {`, `  ${cssName("source-sha256")}: "${digest}";`, ...rows.map(([name, token]) => `  ${cssName(name)}: ${scalar(token).css};`), `}`, ``].join("\n");
  return { digest, kotlin, swift, css };
}

function run() {
  const compiled = compileTokenSource(readFileSync(source, "utf8"));
  let drift = false;
  for (const [kind, destination] of Object.entries(outputs)) {
    const content = compiled[kind];
    if (process.argv.includes("--check")) {
      if (!existsSync(destination) || readFileSync(destination, "utf8") !== content) {
        console.error(`Generated token drift: ${path.relative(root, destination)}`);
        drift = true;
      }
    } else {
      mkdirSync(path.dirname(destination), { recursive: true });
      writeFileSync(destination, content);
    }
  }
  if (drift) process.exitCode = 1;
  else console.log(`${process.argv.includes("--check") ? "Verified" : "Generated"} ${compiled.digest.slice(0, 12)} across Kotlin, Swift, and CSS.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
