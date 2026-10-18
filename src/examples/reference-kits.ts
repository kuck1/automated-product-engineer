import { clientSystems, type ClientToken } from "./client-systems";

export type ExampleReferenceKit = {
  name: string;
  label: string;
  systemName: string;
  systemSummary: string;
  summary: string;
  brief: ReadonlyArray<readonly [label: string, value: string]>;
  principles: ReadonlyArray<readonly [name: string, detail: string]>;
  components: readonly string[];
  tokens: readonly ClientToken[];
  architecture: ReadonlyArray<readonly [layer: string, detail: string, source: { readonly label: string; readonly path: string }]>;
  skills: ReadonlyArray<{ readonly slug: string; readonly name: string; readonly use: string }>;
};

export const exampleReferenceKits = {
  releases: {
    name: "Release readiness",
    label: "Client app 01",
    systemName: "Checkpoint OS",
    systemSummary: "A tactile arcade control room for high-stakes release decisions: bold signals, hard edges, and unmistakable system states.",
    summary: "A sample client product for release managers deciding what can safely ship. This is the client-facing application; the surrounding library, system tour, and guide explain how we built it.",
    brief: [
      ["Primary user", "Release manager or engineering lead"],
      ["Decision", "Can this release move to ready?"],
      ["Business rules", "Required gates, approvals, guarded transitions, and stale-write protection"],
      ["Interaction model", "Dense control tower with reversible optimistic actions"],
    ],
    principles: [
      ["Policy before action", "Show every gate and approval beside the decision it controls."],
      ["Dense but scannable", "Use a stable table rhythm so risk can be compared without opening details."],
      ["Status uses words", "Color supports labels and icons; it never carries meaning alone."],
    ],
    components: ["Release summary", "Policy gate", "Approval count", "Readiness score", "Decision action"],
    tokens: clientSystems.releases.tokens,
    architecture: [
      ["UI state", "The URL selects the client app; each row owns only transient interaction state.", { label: "example-workspace.tsx", path: "src/examples/example-workspace.tsx" }],
      ["Server cache", "TanStack Query owns the snapshot, optimistic mutation, rollback, and reconciliation.", { label: "example-workspace.tsx", path: "src/examples/example-workspace.tsx" }],
      ["API", "The PATCH route authenticates, validates the revision, and delegates the transition.", { label: "releases/[id]/route.ts", path: "app/api/examples/releases/[id]/route.ts" }],
      ["Policy", "The service recomputes gates and approvals before accepting ready.", { label: "ExampleService.updateRelease", path: "src/examples/service.ts" }],
      ["Persistence", "This public demo runs the deterministic memory adapter. Production integrations use the same port with the authenticated Supabase adapter.", { label: "ExampleRepository + adapters", path: "src/examples/repository.ts" }],
    ],
    skills: [
      { slug: "architecture-building", name: "Architecture Design", use: "Trace Mark ready through UI state, server cache, policy, and persistence." },
      { slug: "frontend-api-db", name: "Frontend / API / Database", use: "Implement the typed mutation, authorization, revision check, and canonical response." },
      { slug: "design-system", name: "Design System", use: "Govern decision, ready, pending, blocked, and surface roles with semantic tokens." },
      { slug: "manual-ui-qa", name: "Manual UI QA", use: "Exercise dense rows, horizontal pressure, status changes, and failure recovery." },
    ],
  },
  onboarding: {
    name: "Onboarding operations",
    label: "Client app 02",
    systemName: "Clarity System",
    systemSummary: "A quiet, light workspace for customer journeys: generous space, restrained color, and content-led hierarchy.",
    summary: "A sample client product for customer teams moving accounts toward value. This is the client-facing application; the reference system documents its design and implementation choices.",
    brief: [
      ["Primary user", "Customer success or implementation lead"],
      ["Decision", "What should happen next for each account?"],
      ["Business rules", "Milestone completion, adoption, contact recency, launch policy, and owner workload"],
      ["Interaction model", "Horizontal journey board with contextual account actions"],
    ],
    principles: [
      ["Journey before table", "Organize work by customer stage so progression is visible spatially."],
      ["Health in context", "Combine milestones, adoption, and recency beside the account action."],
      ["Calm operations", "Use whitespace and compact cards so exceptions stand out without alarm fatigue."],
    ],
    components: ["Journey summary", "Stage column", "Account card", "Health ring", "Milestone track"],
    tokens: clientSystems.onboarding.tokens,
    architecture: [
      ["UI state", "The URL selects the client app; the board derives columns from canonical account stages.", { label: "example-workspace.tsx", path: "src/examples/example-workspace.tsx" }],
      ["Server cache", "TanStack Query moves cards optimistically, then reconciles the saved account.", { label: "example-workspace.tsx", path: "src/examples/example-workspace.tsx" }],
      ["API", "The PATCH route authenticates, validates the revision, and delegates the stage change.", { label: "onboardings/[id]/route.ts", path: "app/api/examples/onboardings/[id]/route.ts" }],
      ["Policy", "The service blocks launch until milestones and adoption meet the product rules.", { label: "ExampleService.updateOnboarding", path: "src/examples/service.ts" }],
      ["Persistence", "This public demo runs the deterministic memory adapter. Production integrations use the same port with tenant-scoped Supabase records.", { label: "ExampleRepository + adapters", path: "src/examples/repository.ts" }],
    ],
    skills: [
      { slug: "responsive-design", name: "Responsive Design", use: "Define the horizontal journey at wide, transition, and narrow widths." },
      { slug: "design-system", name: "Design System", use: "Specify columns, account cards, health, milestones, and action variants." },
      { slug: "frontend-api-db", name: "Frontend / API / Database", use: "Trace a stage transition through optimism, policy, and persistence." },
      { slug: "manual-ui-qa", name: "Manual UI QA", use: "Cover empty stages, long customer names, risk states, and mobile overflow." },
    ],
  },
  field: {
    name: "Field Relay",
    label: "Native app 03",
    systemName: "Relay Field System",
    systemSummary: "An outdoor-readable mobile workspace for relief deliveries: warm map surfaces, decisive signals, large targets, and honest sync state.",
    summary: "A native field product for community relief teams moving essential supplies from an assigned mission to verified delivery. The app keeps working through weak connectivity and reconciles every action with the authorized workspace.",
    brief: [
      ["Primary user", "Field team member or logistics coordinator"],
      ["Decision", "What is the next safe stop, and has the delivery been verified?"],
      ["Business rules", "Assigned workspace, valid stop transitions, proof before completion, idempotent sync, and stale-revision protection"],
      ["Native contract", "Expo development build, protected routes, device camera/location, offline outbox, foreground reconciliation"],
    ],
    principles: [
      ["Status before decoration", "Connection, assignment, route state, and critical need remain visible outdoors and under pressure."],
      ["Offline is a real state", "A device-saved action says queued until the server confirms it; the interface never calls it synced early."],
      ["Proof follows purpose", "Capture only the delivery evidence the operation requires, with an explicit permission recovery path."],
    ],
    components: ["Mission shell", "Connection status", "Route stop", "Delivery proof sheet", "Sync conflict notice", "Team presence"],
    tokens: clientSystems.field.tokens,
    architecture: [
      ["Native shell", "Expo Router protects the mission group and restores the intended stop after Google OAuth returns.", { label: "Expo protected routes", path: "templates/native/expo-router/src/app/_layout.tsx" }],
      ["Device state", "The current stop, draft quantity, permission result, and queued operation live on device until confirmed.", { label: "versioned-outbox.ts", path: "native/examples/versioned-outbox.ts" }],
      ["Server cache", "The mission query owns the canonical snapshot; foreground and reconnect events trigger scoped reconciliation.", { label: "lifecycle-reconcile.ts", path: "native/examples/lifecycle-reconcile.ts" }],
      ["Policy", "The service validates workspace, revision, transition, quantity, and required proof before completion.", { label: "ExampleService.updateFieldStop", path: "src/examples/service.ts" }],
      ["Persistence", "A version-checked Postgres function updates the mission revision and stop atomically behind RLS.", { label: "save_example_field_stop", path: "supabase/migrations/202610160001_reference_examples.sql" }],
    ],
    skills: [
      { slug: "expo-native-app", name: "Expo Native App", use: "Launch the development build and cover auth callbacks, lifecycle, permissions, offline work, and release boundaries." },
      { slug: "frontend-api-db", name: "Frontend / API / Database", use: "Trace an offline completion through the outbox, idempotency key, revision guard, policy, and atomic persistence." },
      { slug: "security-review", name: "Security Review", use: "Verify Google OAuth, workspace membership, RLS, proof storage, and account-switch cache cleanup." },
      { slug: "manual-ui-qa", name: "Manual UI QA", use: "Exercise sunlight contrast, large text, interrupted capture, backgrounding, weak networks, and one-handed use." },
    ],
  },
} as const satisfies Record<"releases" | "onboarding" | "field", ExampleReferenceKit>;
