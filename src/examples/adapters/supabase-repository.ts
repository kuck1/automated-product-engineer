import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { DomainError, fieldMissionSchema, fieldStopSchema, gateSchema, onboardingSchema, releaseSchema, type FieldMission, type Onboarding, type Release } from "../contracts";
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

const fieldStopRowSchema = z.object({
  id: z.string(), position: z.number(), name: z.string(), address: z.string(), priority: fieldStopSchema.shape.priority,
  status: fieldStopSchema.shape.status, assigned_to: z.string(), eta: z.string(), supply_label: z.string(),
  planned_units: z.number(), delivered_units: z.number(), proof_required: z.boolean(), proof_captured: z.boolean(),
});

const fieldMissionRowSchema = z.object({
  id: z.string(), workspace_id: z.string(), name: z.string(), incident: z.string(), lifeline: fieldMissionSchema.shape.lifeline,
  coordinator: z.string(), operational_period: z.string(), revision: z.number(), last_operation_id: z.string().nullable(),
  example_field_stops: z.array(fieldStopRowSchema),
});

const fieldMissionSelect = "*, example_field_stops(id,position,name,address,priority,status,assigned_to,eta,supply_label,planned_units,delivered_units,proof_required,proof_captured)";

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

function mapFieldMission(value: unknown): FieldMission {
  const row = fieldMissionRowSchema.parse(value);
  return fieldMissionSchema.parse({
    id: row.id, workspaceId: row.workspace_id, name: row.name, incident: row.incident, lifeline: row.lifeline,
    coordinator: row.coordinator, operationalPeriod: row.operational_period, revision: row.revision, lastOperationId: row.last_operation_id,
    stops: row.example_field_stops.toSorted((left, right) => left.position - right.position).map((stop) => ({
      id: stop.id, position: stop.position, name: stop.name, address: stop.address, priority: stop.priority, status: stop.status,
      assignedTo: stop.assigned_to, eta: stop.eta, supplyLabel: stop.supply_label, plannedUnits: stop.planned_units,
      deliveredUnits: stop.delivered_units, proofRequired: stop.proof_required, proofCaptured: stop.proof_captured,
    })),
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
  async listFieldMissions(workspaceId: string) {
    const { data, error } = await this.client.from("example_field_missions").select(fieldMissionSelect).eq("workspace_id", workspaceId).order("name");
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapFieldMission);
  }
  async getFieldMission(id: string) {
    const { data, error } = await this.client.from("example_field_missions").select(fieldMissionSelect).eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapFieldMission(data) : null;
  }
  async saveFieldMission(mission: FieldMission, changedStopId: string) {
    const changed = mission.stops.find((stop) => stop.id === changedStopId);
    if (!changed) throw new Error("No changed field stop was supplied.");
    const { data, error } = await this.client.rpc("save_example_field_stop", {
      target_mission_id: mission.id,
      target_stop_id: changed.id,
      expected_revision: mission.revision - 1,
      next_status: changed.status,
      next_delivered_units: changed.deliveredUnits,
      next_proof_captured: changed.proofCaptured,
      operation_id: mission.lastOperationId,
    });
    unwrapVersioned(data, error);
    const refreshed = await this.getFieldMission(mission.id);
    return unwrap(refreshed, null);
  }
}
