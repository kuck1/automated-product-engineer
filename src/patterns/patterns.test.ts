import assert from "node:assert/strict";
import test from "node:test";
import { getPattern, patternCatalog, patternsForSkill } from "./catalog";
import { IdentityCache, LatestIntent, deriveVisibleWork, runOptimisticMutation } from "./examples/state";
import { LeaseTable, Outbox, VersionConflict, VersionedStore, reconcileRealtimeMessages } from "./examples/consistency";
import { WebhookInbox, authorizeResource, canUseCapability } from "./examples/trust";
import { advanceUploadCheckpoint, nextRetryDelay, runCompensatedWorkflow, transitionJob } from "./examples/operations";

test("catalog entries have stable unique IDs and actionable routing", () => {
  const ids = patternCatalog.map((pattern) => pattern.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(patternCatalog.length >= 18);
  for (const pattern of patternCatalog) {
    assert.ok(pattern.situation.length > 20, pattern.id);
    assert.ok(pattern.failure.length > 20, pattern.id);
    assert.ok(pattern.antiPatterns.length, pattern.id);
    assert.ok(pattern.proof.length, pattern.id);
    assert.ok(pattern.skills.length, pattern.id);
  }
  assert.equal(getPattern("offline-outbox")?.family, "durable-consistency");
  assert.ok(patternsForSkill("security-review").some((pattern) => pattern.id === "webhook-inbox"));
  assert.deepEqual(patternsForSkill("kotlin-multiplatform-app").map((pattern) => pattern.id), [
    "shared-product-kernel",
    "ports-at-platform-edge",
    "generated-semantic-contracts",
    "small-swift-facade",
  ]);
});

test("derived state follows the source without a synchronization step", () => {
  const source = [{ id: 1, completed: false }, { id: 2, completed: true }];
  assert.deepEqual(deriveVisibleWork(source, false), { visible: [source[0]], remaining: 1 });
  source[0].completed = true;
  assert.deepEqual(deriveVisibleWork(source, false), { visible: [], remaining: 0 });
});

test("only the latest request token may commit a result", () => {
  const intents = new LatestIntent();
  const oldRequest = intents.begin();
  const newRequest = intents.begin();
  assert.equal(intents.isCurrent(oldRequest), false);
  assert.equal(intents.isCurrent(newRequest), true);
});

test("optimistic work reconciles canonical success and rolls back exact failure", async () => {
  let value = { points: 10 };
  const success = await runOptimisticMutation({
    read: () => value,
    project: (current) => ({ points: current.points + 5 }),
    commit: (next) => { value = next; },
    mutate: async () => ({ canonicalPoints: 14 }),
    reconcile: (result) => ({ points: result.canonicalPoints }),
  });
  assert.deepEqual(success, { points: 14 });
  assert.deepEqual(value, { points: 14 });

  await assert.rejects(runOptimisticMutation({
    read: () => value,
    project: () => ({ points: 99 }),
    commit: (next) => { value = next; },
    mutate: async () => { throw new Error("rejected"); },
    reconcile: () => ({ points: 0 }),
  }), /rejected/);
  assert.deepEqual(value, { points: 14 });
});

test("identity change removes only the departing actor's cache", () => {
  const cache = new IdentityCache<number>();
  cache.set("a", "points", 10);
  cache.set("b", "points", 20);
  cache.removeIdentity("a");
  assert.equal(cache.get("a", "points"), undefined);
  assert.equal(cache.get("b", "points"), 20);
});

test("versioned writes return duplicate replay and reject stale new work", () => {
  const store = new VersionedStore({ seats: 1 });
  const first = store.write("op-1", 0, (value) => ({ seats: value.seats + 1 }));
  assert.deepEqual(first, { value: { seats: 2 }, revision: 1 });
  assert.deepEqual(store.write("op-1", 0, () => ({ seats: 100 })), first);
  assert.throws(() => store.write("op-2", 0, (value) => value), (error) =>
    error instanceof VersionConflict && error.currentRevision === 1,
  );
});

test("outbox preserves confirmed, conflicted, and retryable failed operations", async () => {
  const outbox = new Outbox<{ result: "confirmed" | "conflicted" | "failed" }>();
  outbox.enqueue("a", { result: "confirmed" });
  outbox.enqueue("b", { result: "conflicted" });
  outbox.enqueue("c", { result: "failed" });
  outbox.enqueue("a", { result: "failed" });
  const result = await outbox.flush(async (entry) => {
    if (entry.payload.result === "failed") throw new Error("offline");
    return entry.payload.result;
  });
  assert.deepEqual(result.map((entry) => [entry.id, entry.state, entry.attempts]), [
    ["a", "confirmed", 1],
    ["b", "conflicted", 1],
    ["c", "failed", 1],
  ]);
});

test("realtime echo replaces an optimistic row by client nonce", () => {
  const optimistic = [{ clientNonce: "n-1", text: "Hello" }];
  const result = reconcileRealtimeMessages(optimistic, {
    id: "message-1",
    clientNonce: "n-1",
    text: "Hello",
    createdAt: "2026-10-18T10:00:00Z",
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "message-1");
});

test("an expired cross-tab lease allows leader takeover", () => {
  const leases = new LeaseTable();
  assert.equal(leases.acquire("refresh", "tab-a", 0, 100), true);
  assert.equal(leases.acquire("refresh", "tab-b", 50, 100), false);
  assert.equal(leases.acquire("refresh", "tab-b", 101, 100), true);
  assert.equal(leases.owner("refresh", 120), "tab-b");
});

test("authorization checks identity, tenant, object ownership, and role", () => {
  const resource = { id: "r", tenantId: "t-1", ownerId: "u-1" };
  assert.equal(authorizeResource(null, resource, "read"), false);
  assert.equal(authorizeResource({ id: "u-2", tenantId: "t-2", roles: ["admin"] }, resource, "delete"), false);
  assert.equal(authorizeResource({ id: "u-1", tenantId: "t-1", roles: [] }, resource, "update"), true);
  assert.equal(authorizeResource({ id: "u-2", tenantId: "t-1", roles: ["admin"] }, resource, "delete"), true);
});

test("webhook inbox rejects bad signatures and deduplicates accepted events", () => {
  const inbox = new WebhookInbox();
  assert.throws(() => inbox.accept("evt-1", false, 10), /Unverified/);
  assert.equal(inbox.accept("evt-1", true, 10).status, "accepted");
  assert.deepEqual(inbox.accept("evt-1", true, 20), { eventId: "evt-1", acceptedAt: 10, status: "duplicate" });
});

test("feature capability requires flag, tenant, and role", () => {
  const actor = { id: "u", tenantId: "t", roles: ["editor"] };
  assert.equal(canUseCapability({ enabled: true, actor, tenantId: "t", requiredRole: "editor" }), true);
  assert.equal(canUseCapability({ enabled: false, actor, tenantId: "t", requiredRole: "editor" }), false);
  assert.equal(canUseCapability({ enabled: true, actor, tenantId: "other", requiredRole: "editor" }), false);
});

test("background jobs accept only defined transitions", () => {
  assert.equal(transitionJob("queued", "running"), "running");
  assert.equal(transitionJob("running", "cancelling"), "cancelling");
  assert.throws(() => transitionJob("succeeded", "running"), /Invalid job transition/);
});

test("upload checkpoints advance monotonically and complete at declared size", () => {
  const start = { uploadId: "up-1", confirmedBytes: 10, totalBytes: 100, completed: false };
  assert.equal(advanceUploadCheckpoint(start, 100).completed, true);
  assert.throws(() => advanceUploadCheckpoint(start, 5), /cannot move backward/);
  assert.throws(() => advanceUploadCheckpoint(start, 101), /exceeds declared size/);
});

test("retry policy honors authoritative delay and stops permanent failures", () => {
  assert.equal(nextRetryDelay({ attempt: 1, status: 429, retryAfterMs: 2_000 }), 2_000);
  assert.equal(nextRetryDelay({ attempt: 2, status: 503, baseMs: 100, jitter: 0.5 }), 300);
  assert.equal(nextRetryDelay({ attempt: 1, status: 400 }), null);
  assert.equal(nextRetryDelay({ attempt: 5, status: 503 }), null);
});

test("partial workflows compensate completed steps in reverse order", async () => {
  const events: string[] = [];
  const result = await runCompensatedWorkflow([
    { run: async () => { events.push("run-a"); }, compensate: async () => { events.push("undo-a"); } },
    { run: async () => { events.push("run-b"); }, compensate: async () => { events.push("undo-b"); } },
    { run: async () => { events.push("run-c"); throw new Error("failed-c"); } },
  ]);
  assert.equal(result.status, "failed");
  assert.equal(result.compensated, 2);
  assert.deepEqual(events, ["run-a", "run-b", "run-c", "undo-b", "undo-a"]);
});

