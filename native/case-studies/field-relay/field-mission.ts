export type StopStatus = "queued" | "en_route" | "arrived" | "complete" | "blocked";

export type FieldStop = {
  id: string;
  position: number;
  name: string;
  priority: "critical" | "high" | "routine";
  status: StopStatus;
  supplyLabel: string;
  plannedUnits: number;
  deliveredUnits: number;
  proofRequired: boolean;
  proofCaptured: boolean;
};

export type FieldMission = {
  id: string;
  workspaceId: string;
  revision: number;
  stops: FieldStop[];
};

export type FieldOperation = {
  operationId: string;
  missionId: string;
  stopId: string;
  expectedRevision: number;
  status: StopStatus;
  deliveredUnits?: number;
  proofCaptured?: boolean;
  createdAt: string;
};

const transitions: Record<StopStatus, readonly StopStatus[]> = {
  queued: ["en_route", "blocked"],
  en_route: ["arrived", "blocked"],
  arrived: ["complete", "blocked"],
  blocked: ["queued", "en_route"],
  complete: [],
};

export function assertFieldOperation(mission: FieldMission, operation: FieldOperation) {
  if (mission.id !== operation.missionId || mission.revision !== operation.expectedRevision) throw new Error("STALE_MISSION");
  const stop = mission.stops.find((item) => item.id === operation.stopId);
  if (!stop) throw new Error("STOP_NOT_FOUND");
  if (!transitions[stop.status].includes(operation.status)) throw new Error("INVALID_TRANSITION");
  if (operation.status === "complete" && stop.proofRequired && !operation.proofCaptured) throw new Error("PROOF_REQUIRED");
  if (operation.status === "complete" && !operation.deliveredUnits) throw new Error("QUANTITY_REQUIRED");
}
