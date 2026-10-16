import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { DomainError, gateSchema, onboardingSchema, releaseSchema, type Onboarding, type Release } from "../contracts";
import type { ExampleRepository } from "../repository";

const releaseRowSchema = z.object({
  id: z.string(), workspace_id: z.string(), name: z.string(), owner: z.string(), target_date: z.string(),
  stage: releaseSchema.shape.stage, revision: z.number(), approvals: z.number(), required_approvals: z.number(),
  example_release_gates: z.array(gateSchema.extend({ release_id: z.string().optional() })),
});

const milestoneRowSchema = z.object({ id: z.string(), label: z.string(), completed: z.boolean(), due_date: z.string() });

const onboardingRowSchema = z.object({
  id: z.string(), workspace_id: z.string(), customer: z.string(), plan: onboardingSchema.shape.plan, owner: z.string(),
  stage: onboardingSchema.shape.stage, revision: z.number(), seats: z.number(), weekly_active_users: z.number(),
  last_contact_at: z.string(), target_launch_date: z.string(),
  example_onboarding_milestones: z.array(milestoneRowSchema),
});

const releaseSelect = "*, example_release_gates(id,label,status,required)";
const onboardingSelect = "*, example_onboarding_milestones(id,label,completed,due_date)";

function mapRelease(value: unknown): Release {
  const row = releaseRowSchema.parse(value);
  return releaseSchema.parse({
    id: row.id, workspaceId: row.workspace_id, name: row.name, owner: row.owner, targetDate: row.target_date,
    stage: row.stage, revision: row.revision, approvals: row.approvals, requiredApprovals: row.required_approvals,
    gates: row.example_release_gates,
  });
}

function mapOnboarding(value: unknown): Onboarding {
  const row = onboardingRowSchema.parse(value);
  return onboardingSchema.parse({
    id: row.id, workspaceId: row.workspace_id, customer: row.customer, plan: row.plan, owner: row.owner,
    stage: row.stage, revision: row.revision, seats: row.seats, weeklyActiveUsers: row.weekly_active_users,
    lastContactAt: row.last_contact_at, targetLaunchDate: row.target_launch_date,
    milestones: row.example_onboarding_milestones.map((milestone) => ({ id: milestone.id, label: milestone.label, completed: milestone.completed, dueDate: milestone.due_date })),
  });
}

function unwrap<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Supabase returned no record.");
  return data;
}

function unwrapVersioned<T>(data: T | null, error: { message: string } | null): T {
  if (!data && !error) throw new DomainError("CONFLICT", "This record changed. Refresh before trying again.", 409);
  return unwrap(data, error);
}

/** Uses the caller's authenticated Supabase client so row-level security remains authoritative. */
export class SupabaseExampleRepository implements ExampleRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listReleases(workspaceId: string) {
    const { data, error } = await this.client.from("example_releases").select(releaseSelect).eq("workspace_id", workspaceId).order("target_date");
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRelease);
  }
  async getRelease(id: string) {
    const { data, error } = await this.client.from("example_releases").select(releaseSelect).eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRelease(data) : null;
  }
  async saveRelease(release: Release) {
    const { data, error } = await this.client.from("example_releases").update({ stage: release.stage, revision: release.revision }).eq("id", release.id).eq("revision", release.revision - 1).select(releaseSelect).maybeSingle();
    return mapRelease(unwrapVersioned(data, error));
  }
  async listOnboardings(workspaceId: string) {
    const { data, error } = await this.client.from("example_onboardings").select(onboardingSelect).eq("workspace_id", workspaceId).order("target_launch_date");
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapOnboarding);
  }
  async getOnboarding(id: string) {
    const { data, error } = await this.client.from("example_onboardings").select(onboardingSelect).eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapOnboarding(data) : null;
  }
  async saveOnboarding(onboarding: Onboarding) {
    const { data, error } = await this.client.from("example_onboardings").update({ stage: onboarding.stage, revision: onboarding.revision }).eq("id", onboarding.id).eq("revision", onboarding.revision - 1).select(onboardingSelect).maybeSingle();
    return mapOnboarding(unwrapVersioned(data, error));
  }
}
