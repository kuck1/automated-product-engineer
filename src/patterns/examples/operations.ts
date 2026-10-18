export type JobState = "queued" | "running" | "succeeded" | "failed" | "cancelling" | "cancelled";

const jobTransitions: Record<JobState, JobState[]> = {
  queued: ["running", "cancelled"],
  running: ["succeeded", "failed", "cancelling"],
  cancelling: ["cancelled", "failed"],
  failed: ["queued"],
  succeeded: [],
  cancelled: [],
};

export function transitionJob(current: JobState, next: JobState): JobState {
  if (!jobTransitions[current].includes(next)) throw new Error(`Invalid job transition: ${current} -> ${next}`);
  return next;
}

export type UploadCheckpoint = { uploadId: string; confirmedBytes: number; totalBytes: number; completed: boolean };

export function advanceUploadCheckpoint(checkpoint: UploadCheckpoint, confirmedBytes: number): UploadCheckpoint {
  if (confirmedBytes < checkpoint.confirmedBytes) throw new Error("Upload progress cannot move backward");
  if (confirmedBytes > checkpoint.totalBytes) throw new Error("Upload progress exceeds declared size");
  return { ...checkpoint, confirmedBytes, completed: confirmedBytes === checkpoint.totalBytes };
}

export function nextRetryDelay(input: {
  attempt: number;
  status: number;
  retryAfterMs?: number;
  maxAttempts?: number;
  baseMs?: number;
  jitter?: number;
}) {
  const maxAttempts = input.maxAttempts ?? 5;
  if (input.attempt >= maxAttempts || (input.status >= 400 && input.status < 500 && input.status !== 408 && input.status !== 429)) return null;
  if (input.retryAfterMs !== undefined) return input.retryAfterMs;
  const base = input.baseMs ?? 250;
  const jitter = Math.max(0, Math.min(1, input.jitter ?? 0));
  return Math.min(30_000, base * 2 ** Math.max(0, input.attempt - 1)) * (1 + jitter);
}

export type WorkflowStep = {
  run: () => Promise<void>;
  compensate?: () => Promise<void>;
};

export async function runCompensatedWorkflow(steps: WorkflowStep[]) {
  const completed: WorkflowStep[] = [];
  try {
    for (const step of steps) {
      await step.run();
      completed.push(step);
    }
    return { status: "succeeded" as const, compensated: 0 };
  } catch (cause) {
    let compensated = 0;
    const compensationErrors: unknown[] = [];
    for (const step of completed.reverse()) {
      if (!step.compensate) continue;
      try {
        await step.compensate();
        compensated += 1;
      } catch (error) {
        compensationErrors.push(error);
      }
    }
    return { status: "failed" as const, cause, compensated, compensationErrors };
  }
}

