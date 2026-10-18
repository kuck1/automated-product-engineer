// Generated from contracts/scenarios/work-item.vectors.json. Do not edit.
import type { TransitionCommand, WorkItem } from "./work-item-policy";

export const workItemVectorSourceSha256 = "d4ae5da2d0805906814336ce8e2b62884e6f3aaf67c137207fb8c4f567862dae" as const;
export type WorkItemVector = { id: string; initial: WorkItem; command: TransitionCommand; expected: { kind: "APPLIED" | "CONFLICT" | "REJECTED"; stage: WorkItem["stage"]; revision: number } };
export const generatedWorkItemVectors = [
  {
    "id": "draft-begins-validation",
    "initial": {
      "id": "work-1",
      "title": "Launch",
      "stage": "DRAFT",
      "revision": 4
    },
    "command": {
      "operationId": "op-1",
      "workItemId": "work-1",
      "expectedRevision": 4,
      "nextStage": "VALIDATING"
    },
    "expected": {
      "kind": "APPLIED",
      "stage": "VALIDATING",
      "revision": 5
    }
  },
  {
    "id": "stale-write-returns-canonical",
    "initial": {
      "id": "work-1",
      "title": "Launch",
      "stage": "VALIDATING",
      "revision": 7
    },
    "command": {
      "operationId": "op-2",
      "workItemId": "work-1",
      "expectedRevision": 6,
      "nextStage": "READY"
    },
    "expected": {
      "kind": "CONFLICT",
      "stage": "VALIDATING",
      "revision": 7
    }
  },
  {
    "id": "ready-is-terminal",
    "initial": {
      "id": "work-1",
      "title": "Launch",
      "stage": "READY",
      "revision": 8
    },
    "command": {
      "operationId": "op-3",
      "workItemId": "work-1",
      "expectedRevision": 8,
      "nextStage": "VALIDATING"
    },
    "expected": {
      "kind": "REJECTED",
      "stage": "READY",
      "revision": 8
    }
  }
] as const satisfies readonly WorkItemVector[];
