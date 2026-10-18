import type { ExampleRepository } from "./repository";
import {
  DomainError,
  type Actor,
  type ExampleSnapshot,
  type FieldMission,
  type FieldStopStatus,
  type Onboarding,
  type OnboardingStage,
  type Release,
  type ReleaseStage,
  type UpdateOnboarding,
  type UpdateFieldStop,
  type UpdateRelease,
} from "./contracts";

const releaseTransitions: Record<ReleaseStage, readonly ReleaseStage[]> = {
  building: ["validating", "blocked"],
  validating: ["building", "blocked", "ready"],
  blocked: ["building", "validating"],
  ready: ["validating"],
};

const onboardingTransitions: Record<OnboardingStage, readonly OnboardingStage[]> = {
  discovery: ["configuring", "at_risk"],
  configuring: ["discovery", "training", "at_risk"],
  training: ["configuring", "live", "at_risk"],
  at_risk: ["configuring", "training"],
  live: ["at_risk"],
};

const fieldStopTransitions: Record<FieldStopStatus, readonly FieldStopStatus[]> = {
  queued: ["en_route", "blocked"],
  en_route: ["arrived", "blocked"],
  arrived: ["complete", "blocked"],
  blocked: ["queued", "en_route"],
  complete: [],
};

function authorize(actor: Actor, workspaceId: string) {
  if (actor.workspaceId !== workspaceId) {
    throw new DomainError("FORBIDDEN", "This record belongs to another workspace.", 403);
  }
}

export function releaseReadiness(release: Release) {
  const required = release.gates.filter((gate) => gate.required);
  const passing = required.filter((gate) => gate.status === "passing").length;
  const gatesReady = passing === required.length;
  const approvalsReady = release.approvals >= release.requiredApprovals;
  const score = Math.round(((required.length ? passing / required.length : 1) * 0.72 + Math.min(1, release.approvals / release.requiredApprovals) * 0.28) * 100);
  return { score, gatesReady, approvalsReady, passing, required: required.length };
}

export function onboardingHealth(onboarding: Onboarding, now = new Date("2026-10-16T12:00:00.000Z")) {
  const completed = onboarding.milestones.filter((milestone) => milestone.completed).length;
  const milestoneRatio = completed / Math.max(1, onboarding.milestones.length);
  const adoptionRatio = Math.min(1, onboarding.weeklyActiveUsers / onboarding.seats);
  const daysSinceContact = Math.max(0, (now.getTime() - new Date(onboarding.lastContactAt).getTime()) / 86_400_000);
  const contactScore = Math.max(0, 1 - daysSinceContact / 14);
  const score = Math.round((milestoneRatio * 0.5 + adoptionRatio * 0.3 + contactScore * 0.2) * 100);
  const overdue = onboarding.milestones.filter((milestone) => !milestone.completed && new Date(milestone.dueDate) < now).length;
  return { score, overdue, completed, total: onboarding.milestones.length, adoptionRatio };
}

export class ExampleService {
  constructor(private readonly repository: ExampleRepository) {}

  async snapshot(actor: Actor): Promise<ExampleSnapshot> {
    const [releases, onboardings, fieldMissions] = await Promise.all([
      this.repository.listReleases(actor.workspaceId),
      this.repository.listOnboardings(actor.workspaceId),
      this.repository.listFieldMissions(actor.workspaceId),
    ]);
    return { releases, onboardings, fieldMissions, generatedAt: "2026-10-16T12:00:00.000Z" };
  }

  async updateRelease(actor: Actor, id: string, input: UpdateRelease) {
    const release = await this.repository.getRelease(id);
    if (!release) throw new DomainError("NOT_FOUND", "Release not found.", 404);
    authorize(actor, release.workspaceId);
    if (release.revision !== input.expectedRevision) {
      throw new DomainError("CONFLICT", "This release changed. Refresh before trying again.", 409);
    }
    if (!releaseTransitions[release.stage].includes(input.stage)) {
      throw new DomainError("INVALID_TRANSITION", `A ${release.stage} release cannot move directly to ${input.stage}.`, 422);
    }
    if (input.stage === "ready") {
      const readiness = releaseReadiness(release);
      if (!readiness.gatesReady || !readiness.approvalsReady) {
        throw new DomainError("GATES_INCOMPLETE", "Required gates and approvals must pass before shipping.", 422);
      }
    }
    return this.repository.saveRelease({ ...release, stage: input.stage, revision: release.revision + 1 });
  }

  async updateOnboarding(actor: Actor, id: string, input: UpdateOnboarding) {
    const onboarding = await this.repository.getOnboarding(id);
    if (!onboarding) throw new DomainError("NOT_FOUND", "Onboarding not found.", 404);
    authorize(actor, onboarding.workspaceId);
    if (onboarding.revision !== input.expectedRevision) {
      throw new DomainError("CONFLICT", "This onboarding changed. Refresh before trying again.", 409);
    }
    if (!onboardingTransitions[onboarding.stage].includes(input.stage)) {
      throw new DomainError("INVALID_TRANSITION", `A ${onboarding.stage} onboarding cannot move directly to ${input.stage}.`, 422);
    }
    if (input.stage === "live") {
      const health = onboardingHealth(onboarding);
      const milestonesReady = onboarding.milestones.every((milestone) => milestone.completed);
      if (!milestonesReady || health.adoptionRatio < 0.5) {
        throw new DomainError("GATES_INCOMPLETE", "Complete every milestone and reach 50% weekly adoption before going live.", 422);
      }
    }
    return this.repository.saveOnboarding({ ...onboarding, stage: input.stage, revision: onboarding.revision + 1 });
  }

  async updateFieldStop(actor: Actor, id: string, input: UpdateFieldStop): Promise<FieldMission> {
    const mission = await this.repository.getFieldMission(id);
    if (!mission) throw new DomainError("NOT_FOUND", "Field mission not found.", 404);
    authorize(actor, mission.workspaceId);
    if (mission.lastOperationId === input.operationId) return mission;
    if (mission.revision !== input.expectedRevision) {
      throw new DomainError("CONFLICT", "This mission changed while the device was offline. Review the current stop before syncing again.", 409);
    }
    const stop = mission.stops.find((item) => item.id === input.stopId);
    if (!stop) throw new DomainError("NOT_FOUND", "Mission stop not found.", 404);
    if (!fieldStopTransitions[stop.status].includes(input.status)) {
      throw new DomainError("INVALID_TRANSITION", `A ${stop.status.replace("_", " ")} stop cannot move directly to ${input.status.replace("_", " ")}.`, 422);
    }
    const nextStop = { ...stop, status: input.status, deliveredUnits: input.deliveredUnits ?? stop.deliveredUnits, proofCaptured: input.proofCaptured ?? stop.proofCaptured };
    if (input.status === "complete" && nextStop.proofRequired && !nextStop.proofCaptured) {
      throw new DomainError("GATES_INCOMPLETE", "Capture delivery proof before completing this stop.", 422);
    }
    if (input.status === "complete" && nextStop.deliveredUnits < 1) {
      throw new DomainError("GATES_INCOMPLETE", "Record the delivered quantity before completing this stop.", 422);
    }
    return this.repository.saveFieldMission({
      ...mission,
      revision: mission.revision + 1,
      lastOperationId: input.operationId,
      stops: mission.stops.map((item) => item.id === stop.id ? nextStop : item),
    }, stop.id);
  }
}
