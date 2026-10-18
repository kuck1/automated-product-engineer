import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { featureContractDigest, transitionWorkItem } from "../webApp/src/generated/work-item-policy";
import { generatedWorkItemVectors, workItemVectorSourceSha256 } from "../webApp/src/generated/work-item-vectors";

const destination = path.resolve(process.argv[2] ?? "build/receipts/web.json");
const receipts = generatedWorkItemVectors.map((vector) => {
  const result = transitionWorkItem(vector.initial, vector.command);
  return { id: vector.id, kind: result.kind, stage: result.item.stage, revision: result.item.revision };
});
mkdirSync(path.dirname(destination), { recursive: true });
writeFileSync(destination, `${JSON.stringify({ featureDigest: featureContractDigest, vectorDigest: workItemVectorSourceSha256, receipts })}\n`);
console.log(`Wrote ${receipts.length} web receipts to ${destination}`);
