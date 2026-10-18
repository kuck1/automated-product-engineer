export type SyncCheckpoint = {
  accountId: string;
  cursor: string | null;
  lastConfirmedAt: number;
  backgroundedAt: number | null;
};

export type ResumePlan =
  | { type: "keep" }
  | { type: "invalidate-visible"; reason: string }
  | { type: "resync-from-cursor"; cursor: string | null; reason: string }
  | { type: "reset-identity"; reason: string };

export function planResume(input: {
  checkpoint: SyncCheckpoint;
  activeAccountId: string;
  now: number;
  online: boolean;
  realtimeDisconnected: boolean;
}): ResumePlan {
  if (input.checkpoint.accountId !== input.activeAccountId) return { type: "reset-identity", reason: "The active account changed while the app was suspended." };
  if (!input.online) return { type: "keep" };
  const backgroundDuration = input.checkpoint.backgroundedAt ? input.now - input.checkpoint.backgroundedAt : 0;
  if (input.realtimeDisconnected || backgroundDuration > 5 * 60_000) {
    return { type: "resync-from-cursor", cursor: input.checkpoint.cursor, reason: "The live event stream may have a gap." };
  }
  if (backgroundDuration > 30_000) return { type: "invalidate-visible", reason: "Visible remote snapshots may be stale." };
  return { type: "keep" };
}
