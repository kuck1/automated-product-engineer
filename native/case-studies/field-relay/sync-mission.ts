import type { FieldMission, FieldOperation } from "./field-mission";

export type FieldOutbox = {
  list(missionId: string): Promise<FieldOperation[]>;
  remove(operationId: string): Promise<void>;
  markConflict(operationId: string, canonical: FieldMission): Promise<void>;
};

export async function reconcileMission(options: {
  missionId: string;
  outbox: FieldOutbox;
  send(operation: FieldOperation): Promise<FieldMission>;
  fetchCanonical(): Promise<FieldMission>;
}) {
  let canonical = await options.fetchCanonical();
  for (const operation of await options.outbox.list(options.missionId)) {
    const next = { ...operation, expectedRevision: canonical.revision };
    try {
      canonical = await options.send(next);
      await options.outbox.remove(operation.operationId);
    } catch (error) {
      if (error instanceof Error && error.message === "CONFLICT") {
        canonical = await options.fetchCanonical();
        await options.outbox.markConflict(operation.operationId, canonical);
        break;
      }
      throw error;
    }
  }
  return canonical;
}
