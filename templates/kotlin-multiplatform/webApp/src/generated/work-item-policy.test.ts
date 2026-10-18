import assert from "node:assert/strict";
import test from "node:test";
import { transitionWorkItem } from "./work-item-policy";
import { generatedWorkItemVectors } from "./work-item-vectors";

test("the web projection satisfies every canonical scenario", () => {
  for (const vector of generatedWorkItemVectors) {
    const result = transitionWorkItem(vector.initial, vector.command);
    assert.deepEqual(
      { kind: result.kind, stage: result.item.stage, revision: result.item.revision },
      vector.expected,
      vector.id,
    );
  }
});
