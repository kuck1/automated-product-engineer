export const architectureLayers = [
  {
    id: "interaction",
    label: "Interaction",
    title: "ExampleWorkspace",
    detail: "Owns navigation, transient notices, and user intent.",
    why: "The component describes what the user asked for. It never imports Supabase, constructs database records, or decides whether a transition is allowed.",
    path: "src/examples/example-workspace.tsx",
    code: `const mutation = useMutation({
  mutationFn: ({ release, stage }) =>
    patchEntity(\`/api/examples/releases/\${release.id}\`, {
      stage,
      expectedRevision: release.revision,
    }),
  onMutate: snapshotAndApplyOptimisticStage,
  onError: restorePreviousSnapshot,
  onSuccess: reconcileCanonicalResponse,
});`,
  },
  {
    id: "cache",
    label: "Server cache",
    title: "TanStack Query",
    detail: "Coordinates remote state, optimistic intent, and rollback.",
    why: "Remote data is not duplicated into component state. One query key owns the snapshot, so successful responses and failures reconcile through a predictable seam.",
    path: "src/examples/example-workspace.tsx",
    code: `await queryClient.cancelQueries({ queryKey: ["example-snapshot"] });
const previous = queryClient.getQueryData(["example-snapshot"]);

queryClient.setQueryData(["example-snapshot"], current => ({
  ...current,
  releases: current.releases.map(item =>
    item.id === release.id ? optimisticRelease : item,
  ),
}));

return { previous };`,
  },
  {
    id: "transport",
    label: "Transport",
    title: "Route handlers",
    detail: "Authenticate, parse the contract, delegate, and normalize errors.",
    why: "HTTP stays thin. Route handlers know request and response mechanics, while business decisions remain reusable from jobs, tests, or another transport.",
    path: "app/api/examples/releases/[id]/route.ts",
    code: `export async function PATCH(request, context) {
  try {
    const actor = await requireActor();
    const input = updateReleaseSchema.parse(await request.json());
    const { id } = await context.params;
    return NextResponse.json(
      await getExampleService().updateRelease(actor, id, input),
    );
  } catch (error) {
    return domainErrorResponse(error);
  }
}`,
  },
  {
    id: "domain",
    label: "Domain",
    title: "ExampleService",
    detail: "Enforces ownership, revisions, transitions, and launch policy.",
    why: "The service is the authority. UI affordances improve usability, but the same invariants are enforced even when requests are replayed or crafted by another client.",
    path: "src/examples/service.ts",
    code: `authorize(actor, release.workspaceId);

if (release.revision !== input.expectedRevision) {
  throw new DomainError("CONFLICT", "Refresh before trying again.", 409);
}

if (!releaseTransitions[release.stage].includes(input.stage)) {
  throw new DomainError("INVALID_TRANSITION", "Transition not allowed.", 422);
}

if (input.stage === "ready") assertReleasePolicy(release);`,
  },
  {
    id: "persistence",
    label: "Persistence",
    title: "ExampleRepository",
    detail: "A stable port implemented by memory and Supabase adapters.",
    why: "Domain code depends on a typed capability instead of a vendor client. The public demo stays deterministic while production can use RLS-backed persistence without changing the service.",
    path: "src/examples/repository.ts",
    code: `export interface ExampleRepository {
  listReleases(workspaceId: string): Promise<Release[]>;
  getRelease(id: string): Promise<Release | null>;
  saveRelease(release: Release): Promise<Release>;

  listOnboardings(workspaceId: string): Promise<Onboarding[]>;
  getOnboarding(id: string): Promise<Onboarding | null>;
  saveOnboarding(onboarding: Onboarding): Promise<Onboarding>;
}`,
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
