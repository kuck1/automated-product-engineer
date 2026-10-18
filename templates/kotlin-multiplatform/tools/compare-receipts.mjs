#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const [kotlinPath = "build/receipts/kotlin.json", webPath = "build/receipts/web.json"] = process.argv.slice(2);
const kotlin = JSON.parse(readFileSync(path.resolve(kotlinPath), "utf8"));
const web = JSON.parse(readFileSync(path.resolve(webPath), "utf8"));
assert.deepEqual(web, kotlin, "Next.js and Kotlin produced different semantic receipts");
console.log(`Semantic parity proven for ${web.receipts.length} scenarios at ${web.featureDigest.slice(0, 12)}.`);
