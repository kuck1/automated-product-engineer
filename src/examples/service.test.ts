import assert from "node:assert/strict";
import test from "node:test";
import { MemoryExampleRepository } from "./adapters/memory-repository";
import { DomainError, type Actor } from "./contracts";
import { ExampleService, onboardingHealth, releaseReadiness } from "./service";

const owner: Actor = { id: "user_demo_owner", workspaceId: "workspace_demo", role: "owner" };

test("release readiness weights required gates and approvals", async () => {
  const service = new ExampleService(new MemoryExampleRepository());
  const release = (await service.snapshot(owner)).releases[0];
  assert.deepEqual(releaseReadiness(release), { score: 76, gatesReady: false, approvalsReady: true, passing: 2, required: 3 });
});

test("a release cannot ship while a required gate is pending", async () => {
  const service = new ExampleService(new MemoryExampleRepository());
  const release = (await service.snapshot(owner)).releases[0];
  await assert.rejects(
    service.updateRelease(owner, release.id, { stage: "ready", expectedRevision: release.revision }),
    (error: unknown) => error instanceof DomainError && error.code === "GATES_INCOMPLETE",
  );
});

test("valid release transitions increment the concurrency revision", async () => {
  const service = new ExampleService(new MemoryExampleRepository());
  const release = (await service.snapshot(owner)).releases[2];
  const saved = await service.updateRelease(owner, release.id, { stage: "validating", expectedRevision: release.revision });
  assert.equal(saved.stage, "validating");
  assert.equal(saved.revision, release.revision + 1);
});

test("stale mutations are rejected without overwriting newer intent", async () => {
  const service = new ExampleService(new MemoryExampleRepository());
  const release = (await service.snapshot(owner)).releases[2];
  await service.updateRelease(owner, release.id, { stage: "validating", expectedRevision: release.revision });
  await assert.rejects(
    service.updateRelease(owner, release.id, { stage: "blocked", expectedRevision: release.revision }),
    (error: unknown) => error instanceof DomainError && error.code === "CONFLICT",
  );
});

test("workspace authorization is enforced by the service", async () => {
  const service = new ExampleService(new MemoryExampleRepository());
  const release = (await service.snapshot(owner)).releases[2];
  await assert.rejects(
    service.updateRelease({ ...owner, workspaceId: "workspace_other" }, release.id, { stage: "validating", expectedRevision: release.revision }),
    (error: unknown) => error instanceof DomainError && error.code === "FORBIDDEN",
  );
});

test("onboarding health combines milestones, adoption, and contact recency", async () => {
  const service = new ExampleService(new MemoryExampleRepository());
  const onboarding = (await service.snapshot(owner)).onboardings[0];
  const health = onboardingHealth(onboarding);
  assert.equal(health.completed, 2);
  assert.equal(health.total, 4);
  assert.equal(health.overdue, 0);
  assert.equal(health.score, 53);
});

test("a customer cannot go live before milestones and adoption policy pass", async () => {
  const service = new ExampleService(new MemoryExampleRepository());
  const onboarding = (await service.snapshot(owner)).onboardings[2];
  await assert.rejects(
    service.updateOnboarding(owner, onboarding.id, { stage: "live", expectedRevision: onboarding.revision }),
    (error: unknown) => error instanceof DomainError && error.code === "GATES_INCOMPLETE",
  );
});
