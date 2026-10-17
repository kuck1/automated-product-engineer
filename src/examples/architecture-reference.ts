export const architectureLayers = [
  {
    id: "interaction",
    label: "Interaction",
    title: "ExampleWorkspace",
    detail: "Owns navigation, transient notices, and user intent.",
    why: "The component describes what the user asked for. It never imports Supabase, constructs database records, or decides whether a transition is allowed.",
    files: [
      {
        id: "interaction-contract",
        label: "Actions and state enums",
        path: "src/examples/example-workspace.tsx",
        startLine: 14,
        endLine: 29,
        summary: "Typed actions constrain every transition the UI can request.",
        code: `type View = "releases" | "onboarding";

const releaseActions: Partial<Record<
  ReleaseStage,
  { label: string; stage: ReleaseStage }[]
>> = {
  building: [{ label: "Start validation", stage: "validating" }],
  validating: [
    { label: "Mark ready", stage: "ready" },
    { label: "Block release", stage: "blocked" },
  ],
  blocked: [{ label: "Resume validation", stage: "validating" }],
  ready: [{ label: "Reopen validation", stage: "validating" }],
};`,
      },
      {
        id: "interaction-composition",
        label: "Page composition",
        path: "src/examples/example-workspace.tsx",
        startLine: 97,
        endLine: 110,
        summary: "The page composes documentation and product views from canonical query data.",
        code: `return (
  <main className="workspace-shell">
    <SiteHeader active={view} />
    <section className="workspace-main">
      <WorkspaceTitle view={view} onRefresh={snapshotQuery.refetch} />
      {notice && <Notice {...notice} />}
      <ExampleReferenceKit key={view} kit={exampleReferenceKits[view]} />
      {view === "releases" && (
        <ReleaseView releases={snapshotQuery.data.releases} onMove={moveRelease} />
      )}
      {view === "onboarding" && (
        <OnboardingView onboardings={snapshotQuery.data.onboardings} onMove={moveOnboarding} />
      )}
    </section>
  </main>
);`,
      },
    ],
  },
  {
    id: "cache",
    label: "Server cache",
    title: "TanStack Query",
    detail: "Coordinates remote state, optimistic intent, and rollback.",
    why: "Remote data is not duplicated into component state. One query key owns the snapshot, so successful responses and failures reconcile through a predictable seam.",
    files: [
      {
        id: "release-mutation",
        label: "Release mutation",
        path: "src/examples/example-workspace.tsx",
        startLine: 50,
        endLine: 69,
        summary: "Optimistic state is snapshotted, rolled back on failure, and replaced by the canonical response.",
        code: `const snapshotQuery = useQuery({
  queryKey: ["example-snapshot"],
  queryFn: fetchSnapshot,
  initialData: initialSnapshot,
});

const releaseMutation = useMutation({
  mutationFn: ({ release, stage }) => patchEntity<Release>(
    \`/api/examples/releases/\${release.id}\`,
    { stage, expectedRevision: release.revision },
  ),
  onMutate: async ({ release, stage }) => {
    await queryClient.cancelQueries({ queryKey: ["example-snapshot"] });
    const previous = queryClient.getQueryData<ExampleSnapshot>(["example-snapshot"]);
    queryClient.setQueryData<ExampleSnapshot>(["example-snapshot"], current =>
      applyOptimisticRelease(current, release.id, stage),
    );
    return { previous };
  },
  onError: (_error, _variables, context) => {
    if (context?.previous) queryClient.setQueryData(["example-snapshot"], context.previous);
  },
  onSuccess: saved => reconcileRelease(queryClient, saved),
});`,
      },
      {
        id: "onboarding-mutation",
        label: "Onboarding mutation",
        path: "src/examples/example-workspace.tsx",
        startLine: 71,
        endLine: 88,
        summary: "The second workflow uses the same cache contract without sharing component-local state.",
        code: `const onboardingMutation = useMutation({
  mutationFn: ({ onboarding, stage }) => patchEntity<Onboarding>(
    \`/api/examples/onboardings/\${onboarding.id}\`,
    { stage, expectedRevision: onboarding.revision },
  ),
  onMutate: async ({ onboarding, stage }) => {
    await queryClient.cancelQueries({ queryKey: ["example-snapshot"] });
    const previous = queryClient.getQueryData<ExampleSnapshot>(["example-snapshot"]);
    queryClient.setQueryData<ExampleSnapshot>(["example-snapshot"], current =>
      applyOptimisticOnboarding(current, onboarding.id, stage),
    );
    return { previous };
  },
  onError: (_error, _variables, context) => {
    if (context?.previous) queryClient.setQueryData(["example-snapshot"], context.previous);
  },
  onSuccess: saved => reconcileOnboarding(queryClient, saved),
});`,
      },
    ],
  },
  {
    id: "transport",
    label: "Transport",
    title: "Route handlers",
    detail: "Authenticate, parse the contract, delegate, and normalize errors.",
    why: "HTTP stays thin. Route handlers know request and response mechanics, while business decisions remain reusable from jobs, tests, or another transport.",
    files: [
      {
        id: "release-route",
        label: "Release PATCH route",
        path: "app/api/examples/releases/[id]/route.ts",
        startLine: 1,
        endLine: 15,
        summary: "A complete route: resolve identity, validate input, delegate, and normalize errors.",
        code: `import { NextResponse } from "next/server";
import { getExampleService } from "@/src/examples/container";
import { updateReleaseSchema } from "@/src/examples/contracts";
import { apiError } from "@/src/examples/http";
import { requireActor } from "@/src/server/auth/actor";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const input = updateReleaseSchema.parse(await request.json());
    const saved = await getExampleService().updateRelease(await requireActor(), id, input);
    return NextResponse.json(saved);
  } catch (error) {
    return apiError(error);
  }
}`,
      },
      {
        id: "onboarding-route",
        label: "Onboarding PATCH route",
        path: "app/api/examples/onboardings/[id]/route.ts",
        startLine: 1,
        endLine: 15,
        summary: "A second transport reuses the same boundary shape for a different workflow.",
        code: `import { NextResponse } from "next/server";
import { getExampleService } from "@/src/examples/container";
import { updateOnboardingSchema } from "@/src/examples/contracts";
import { apiError } from "@/src/examples/http";
import { requireActor } from "@/src/server/auth/actor";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const input = updateOnboardingSchema.parse(await request.json());
    const saved = await getExampleService().updateOnboarding(await requireActor(), id, input);
    return NextResponse.json(saved);
  } catch (error) {
    return apiError(error);
  }
}`,
      },
      {
        id: "error-normalizer",
        label: "Error normalization",
        path: "src/examples/http.ts",
        startLine: 1,
        endLine: 12,
        summary: "Domain failures keep stable codes and statuses while unexpected errors stay private.",
        code: `export function apiError(error: unknown) {
  if (error instanceof DomainError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Something went wrong." } },
    { status: 500 },
  );
}`,
      },
    ],
  },
  {
    id: "domain",
    label: "Domain",
    title: "ExampleService",
    detail: "Enforces ownership, revisions, transitions, and launch policy.",
    why: "The service is the authority. UI affordances improve usability, but the same invariants are enforced even when requests are replayed or crafted by another client.",
    files: [
      {
        id: "release-policy",
        label: "Release transition policy",
        path: "src/examples/service.ts",
        startLine: 66,
        endLine: 83,
        summary: "The complete release transition guards ownership, concurrency, state, and business gates.",
        code: `async updateRelease(actor: Actor, id: string, input: UpdateRelease) {
  const release = await this.repository.getRelease(id);
  if (!release) throw new DomainError("NOT_FOUND", "Release not found.", 404);

  authorize(actor, release.workspaceId);
  if (release.revision !== input.expectedRevision) {
    throw new DomainError("CONFLICT", "This release changed. Refresh before trying again.", 409);
  }
  if (!releaseTransitions[release.stage].includes(input.stage)) {
    throw new DomainError("INVALID_TRANSITION", "Transition not allowed.", 422);
  }
  if (input.stage === "ready") {
    const readiness = releaseReadiness(release);
    if (!readiness.gatesReady || !readiness.approvalsReady) {
      throw new DomainError("GATES_INCOMPLETE", "Required gates must pass.", 422);
    }
  }

  return this.repository.saveRelease({
    ...release,
    stage: input.stage,
    revision: release.revision + 1,
  });
}`,
      },
      {
        id: "onboarding-policy",
        label: "Onboarding launch policy",
        path: "src/examples/service.ts",
        startLine: 85,
        endLine: 103,
        summary: "The onboarding flow applies different policy without changing transport or persistence contracts.",
        code: `async updateOnboarding(actor: Actor, id: string, input: UpdateOnboarding) {
  const onboarding = await this.repository.getOnboarding(id);
  if (!onboarding) throw new DomainError("NOT_FOUND", "Onboarding not found.", 404);

  authorize(actor, onboarding.workspaceId);
  if (onboarding.revision !== input.expectedRevision) {
    throw new DomainError("CONFLICT", "This onboarding changed.", 409);
  }
  if (!onboardingTransitions[onboarding.stage].includes(input.stage)) {
    throw new DomainError("INVALID_TRANSITION", "Transition not allowed.", 422);
  }
  if (input.stage === "live") {
    const health = onboardingHealth(onboarding);
    const milestonesReady = onboarding.milestones.every(item => item.completed);
    if (!milestonesReady || health.adoptionRatio < 0.5) {
      throw new DomainError("GATES_INCOMPLETE", "Complete launch requirements.", 422);
    }
  }

  return this.repository.saveOnboarding({
    ...onboarding,
    stage: input.stage,
    revision: onboarding.revision + 1,
  });
}`,
      },
      {
        id: "scoring-policy",
        label: "Readiness scoring",
        path: "src/examples/service.ts",
        startLine: 31,
        endLine: 53,
        summary: "Pure scoring functions stay deterministic and easy to test without HTTP or database fixtures.",
        code: `export function releaseReadiness(release: Release) {
  const required = release.gates.filter(gate => gate.required);
  const passing = required.filter(gate => gate.status === "passing").length;
  const gatesReady = passing === required.length;
  const approvalsReady = release.approvals >= release.requiredApprovals;
  const gateRatio = required.length ? passing / required.length : 1;
  const approvalRatio = Math.min(1, release.approvals / release.requiredApprovals);
  const score = Math.round((gateRatio * 0.72 + approvalRatio * 0.28) * 100);

  return {
    score,
    gatesReady,
    approvalsReady,
    passing,
    required: required.length,
  };
}`,
      },
    ],
  },
  {
    id: "persistence",
    label: "Persistence",
    title: "ExampleRepository",
    detail: "A stable port implemented by memory and Supabase adapters.",
    why: "Domain code depends on a typed capability instead of a vendor client. The public demo stays deterministic while production can use RLS-backed persistence without changing the service.",
    files: [
      {
        id: "repository-port",
        label: "Repository port",
        path: "src/examples/repository.ts",
        startLine: 1,
        endLine: 10,
        summary: "The service sees domain-shaped capabilities rather than database tables or vendor types.",
        code: `import type { Onboarding, Release } from "./contracts";

export interface ExampleRepository {
  listReleases(workspaceId: string): Promise<Release[]>;
  getRelease(id: string): Promise<Release | null>;
  saveRelease(release: Release): Promise<Release>;

  listOnboardings(workspaceId: string): Promise<Onboarding[]>;
  getOnboarding(id: string): Promise<Onboarding | null>;
  saveOnboarding(onboarding: Onboarding): Promise<Onboarding>;
}`,
      },
      {
        id: "memory-adapter",
        label: "Deterministic memory adapter",
        path: "src/examples/adapters/memory-repository.ts",
        startLine: 5,
        endLine: 33,
        summary: "The public demo implements the same port with isolated, clone-safe fixtures.",
        code: `const clone = <T,>(value: T): T => structuredClone(value);

export class MemoryExampleRepository implements ExampleRepository {
  private releases = new Map(demoReleases.map(item => [item.id, clone(item)]));
  private onboardings = new Map(demoOnboardings.map(item => [item.id, clone(item)]));

  async listReleases(workspaceId: string) {
    return [...this.releases.values()]
      .filter(item => item.workspaceId === workspaceId)
      .map(clone);
  }

  async getRelease(id: string) {
    const item = this.releases.get(id);
    return item ? clone(item) : null;
  }

  async saveRelease(release: Release) {
    this.releases.set(release.id, clone(release));
    return clone(release);
  }

  async saveOnboarding(onboarding: Onboarding) {
    this.onboardings.set(onboarding.id, clone(onboarding));
    return clone(onboarding);
  }
}`,
      },
      {
        id: "supabase-adapter",
        label: "Supabase production adapter",
        path: "src/examples/adapters/supabase-repository.ts",
        startLine: 54,
        endLine: 85,
        summary: "The production adapter preserves RLS and rejects stale writes with a revision predicate.",
        code: `/** The caller supplies an authenticated client so RLS remains authoritative. */
export class SupabaseExampleRepository implements ExampleRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listReleases(workspaceId: string) {
    const { data, error } = await this.client
      .from("example_releases")
      .select(releaseSelect)
      .eq("workspace_id", workspaceId)
      .order("target_date");
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRelease);
  }

  async saveRelease(release: Release) {
    const { data, error } = await this.client
      .from("example_releases")
      .update({ stage: release.stage, revision: release.revision })
      .eq("id", release.id)
      .eq("revision", release.revision - 1)
      .select(releaseSelect)
      .maybeSingle();

    return mapRelease(unwrapVersioned(data, error));
  }
}`,
      },
    ],
  },
] as const;

export const requestLifecycle = [
  ["Intent", "A typed button emits the requested next stage."],
  ["Optimism", "TanStack Query snapshots the cache and paints the likely result."],
  ["Boundary", "The route authenticates, validates the Zod contract, and delegates."],
  ["Policy", "The service verifies tenant ownership, revision, transition, and gates."],
  ["Persistence", "The selected adapter performs the versioned write."],
  ["Reconcile", "The canonical DTO replaces optimistic state, or the snapshot rolls back."],
] as const;

export const stateOwners = [
  ["Local UI", "Active code layer and transient success/error notice", "React component"],
  ["Navigation", "Selected reference app or developer-guide view", "URL search params"],
  ["Server cache", "Release and onboarding DTO snapshots", "TanStack Query"],
  ["Durable", "Stages, gates, milestones, revisions, ownership", "Repository adapter"],
  ["External authority", "Authenticated user and workspace membership", "Server auth boundary"],
] as const;

export const extensionRules = [
  ["New workflow stage", "Extend the Zod enum and transition map; keep branching out of UI components."],
  ["New database", "Implement ExampleRepository and select it once in the composition root."],
  ["New product surface", "Reuse contracts and services, then give the surface its own composition and interaction model."],
  ["New component variant", "Add a typed recipe or semantic token instead of scattering conditional class names."],
] as const;

export const verificationLayers = [
  ["Domain", "Transition policy, authorization, scoring, and stale-write rejection."],
  ["Transport", "Schema rejection and normalized domain errors."],
  ["Browser", "Optimistic rollback, canonical reconciliation, URL history, and keyboard paths."],
  ["Visual", "Deterministic desktop and mobile states reviewed before baseline updates."],
  ["Delivery", "Content validation, tests, typecheck, lint, build, browser CI, and preview deployment."],
] as const;
