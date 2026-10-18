export type PendingIntent<TPayload> = {
  id: string;
  entityId: string;
  expectedRevision: number;
  payload: TPayload;
  createdAt: string;
  attempt: number;
  state: "queued" | "sending" | "conflicted" | "failed";
  lastError?: string;
};

export type ConfirmedMutation<TEntity> = { entity: TEntity; revision: number; operationId: string };
export type MutationConflict<TEntity> = { canonical: TEntity; revision: number; reason: string };

export type SendResult<TEntity> =
  | { type: "confirmed"; value: ConfirmedMutation<TEntity> }
  | { type: "conflict"; value: MutationConflict<TEntity> }
  | { type: "retryable"; message: string }
  | { type: "rejected"; message: string };

export function queueIntent<TPayload>(input: Omit<PendingIntent<TPayload>, "attempt" | "state">): PendingIntent<TPayload> {
  return { ...input, attempt: 0, state: "queued" };
}

export function beginAttempt<TPayload>(intent: PendingIntent<TPayload>): PendingIntent<TPayload> {
  return { ...intent, attempt: intent.attempt + 1, state: "sending", lastError: undefined };
}

export function settleAttempt<TPayload, TEntity>(intent: PendingIntent<TPayload>, result: SendResult<TEntity>) {
  if (result.type === "confirmed") return { intent: null, canonical: result.value.entity, notice: "confirmed" as const };
  if (result.type === "conflict") return {
    intent: { ...intent, state: "conflicted" as const, lastError: result.value.reason },
    canonical: result.value.canonical,
    notice: "conflict" as const,
  };
  if (result.type === "retryable") return {
    intent: { ...intent, state: "queued" as const, lastError: result.message }, canonical: null, notice: "retrying" as const,
  };
  return { intent: { ...intent, state: "failed" as const, lastError: result.message }, canonical: null, notice: "failed" as const };
}

export function nextBackoffMs(attempt: number) {
  const cappedAttempt = Math.min(Math.max(attempt, 0), 6);
  return Math.min(30_000, 750 * 2 ** cappedAttempt);
}
