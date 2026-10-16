import { z } from "zod";

export const releaseStageSchema = z.enum(["building", "validating", "blocked", "ready"]);
export type ReleaseStage = z.infer<typeof releaseStageSchema>;

export const gateSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(["passing", "failing", "pending"]),
  required: z.boolean(),
});

export const releaseSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  owner: z.string(),
  targetDate: z.string(),
  stage: releaseStageSchema,
  revision: z.number().int().nonnegative(),
  approvals: z.number().int().nonnegative(),
  requiredApprovals: z.number().int().positive(),
  gates: z.array(gateSchema),
});
export type Release = z.infer<typeof releaseSchema>;

export const onboardingStageSchema = z.enum(["discovery", "configuring", "training", "live", "at_risk"]);
export type OnboardingStage = z.infer<typeof onboardingStageSchema>;

export const milestoneSchema = z.object({
  id: z.string(),
  label: z.string(),
  completed: z.boolean(),
  dueDate: z.string(),
});

export const onboardingSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  customer: z.string(),
  plan: z.enum(["growth", "enterprise"]),
  owner: z.string(),
  stage: onboardingStageSchema,
  revision: z.number().int().nonnegative(),
  seats: z.number().int().positive(),
  weeklyActiveUsers: z.number().int().nonnegative(),
  lastContactAt: z.string(),
  targetLaunchDate: z.string(),
  milestones: z.array(milestoneSchema),
});
export type Onboarding = z.infer<typeof onboardingSchema>;

export const updateReleaseSchema = z.object({
  stage: releaseStageSchema,
  expectedRevision: z.number().int().nonnegative(),
});

export const updateOnboardingSchema = z.object({
  stage: onboardingStageSchema,
  expectedRevision: z.number().int().nonnegative(),
});

export type UpdateRelease = z.infer<typeof updateReleaseSchema>;
export type UpdateOnboarding = z.infer<typeof updateOnboardingSchema>;

export type Actor = { id: string; workspaceId: string; role: "owner" | "member" };

export type ExampleSnapshot = {
  releases: Release[];
  onboardings: Onboarding[];
  generatedAt: string;
};

export type DomainErrorCode = "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INVALID_TRANSITION" | "GATES_INCOMPLETE";

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
