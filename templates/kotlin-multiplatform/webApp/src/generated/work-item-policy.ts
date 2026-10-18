// Generated from contracts/features/work-item.feature.json. Do not edit.
export const featureContractDigest = "e34b5a8e6c4e7393efc2058265d6f57a1e925d2b3440941142e5d922b735115f" as const;
export const workStages = ["DRAFT","VALIDATING","READY","BLOCKED"] as const;
export type WorkStage = (typeof workStages)[number];
export type WorkItem = { id: string; title: string; stage: WorkStage; revision: number };
export type TransitionCommand = { operationId: string; workItemId: string; expectedRevision: number; nextStage: WorkStage };
export type TransitionResult = { kind: "APPLIED" | "CONFLICT" | "REJECTED"; code?: string; item: WorkItem };
const allowedTransitions = new Set<string>([
  "DRAFT:VALIDATING",
  "VALIDATING:READY",
  "VALIDATING:BLOCKED",
  "BLOCKED:VALIDATING",
]);

export function transitionWorkItem(item: WorkItem, command: TransitionCommand): TransitionResult {
  if (item.id !== command.workItemId) return { kind: "REJECTED", code: "WRONG_AGGREGATE", item };
  if (item.revision !== command.expectedRevision) return { kind: "CONFLICT", code: "STALE_REVISION", item };
  if (!allowedTransitions.has(`${item.stage}:${command.nextStage}`)) return { kind: "REJECTED", code: "INVALID_TRANSITION", item };
  return { kind: "APPLIED", item: { ...item, stage: command.nextStage, revision: item.revision + 1 } };
}
