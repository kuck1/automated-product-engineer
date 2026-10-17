import { clientSystems, type ClientToken } from "./client-systems";

export type ExampleReferenceKit = {
  theme: "arcade" | "minimal";
  name: string;
  label: string;
  systemName: string;
  systemSummary: string;
  summary: string;
  brief: ReadonlyArray<readonly [label: string, value: string]>;
  principles: ReadonlyArray<readonly [name: string, detail: string]>;
  components: readonly string[];
  tokens: readonly ClientToken[];
  architecture: ReadonlyArray<readonly [layer: string, detail: string, source: string]>;
  prompts: ReadonlyArray<{ readonly slug: string; readonly name: string; readonly use: string }>;
};

export const exampleReferenceKits = {
  releases: {
    theme: "arcade",
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
      ["UI state", "The URL selects the client app; each row owns only transient interaction state.", "src/examples/example-workspace.tsx"],
      ["Server cache", "TanStack Query owns the snapshot, optimistic mutation, rollback, and reconciliation.", "queryKey: example-snapshot"],
      ["API", "The PATCH route authenticates, validates the revision, and delegates the transition.", "/api/examples/releases/[id]"],
      ["Policy", "The service recomputes gates and approvals before accepting ready.", "ExampleService.updateRelease"],
      ["Persistence", "This public demo runs the deterministic memory adapter. Production integrations use the same port with the authenticated Supabase adapter.", "MemoryExampleRepository → ExampleRepository ← SupabaseExampleRepository"],
    ],
    prompts: [
      { slug: "components", name: "Typed component contract", use: "Specify the release row, gates, score, states, and callbacks." },
      { slug: "boundaries", name: "Full-stack boundary map", use: "Trace Mark ready through optimism, API validation, policy, and persistence." },
      { slug: "visual-qa", name: "Visual QA evidence", use: "Cover dense rows, horizontal pressure, statuses, and failure recovery." },
      { slug: "tokens", name: "Semantic token export", use: "Document decision, ready, pending, blocked, and surface roles." },
    ],
  },
  onboarding: {
    theme: "minimal",
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
      ["UI state", "The URL selects the client app; the board derives columns from canonical account stages.", "src/examples/example-workspace.tsx"],
      ["Server cache", "TanStack Query moves cards optimistically, then reconciles the saved account.", "queryKey: example-snapshot"],
      ["API", "The PATCH route authenticates, validates the revision, and delegates the stage change.", "/api/examples/onboardings/[id]"],
      ["Policy", "The service blocks launch until milestones and adoption meet the product rules.", "ExampleService.updateOnboarding"],
      ["Persistence", "This public demo runs the deterministic memory adapter. Production integrations use the same port with tenant-scoped Supabase records.", "MemoryExampleRepository → ExampleRepository ← SupabaseExampleRepository"],
    ],
    prompts: [
      { slug: "responsive", name: "Responsive state matrix", use: "Specify the horizontal journey at wide, transition, and narrow widths." },
      { slug: "components", name: "Typed component contract", use: "Define columns, account cards, health, milestones, and actions." },
      { slug: "boundaries", name: "Full-stack boundary map", use: "Trace a stage transition through optimism, policy, and persistence." },
      { slug: "visual-qa", name: "Visual QA evidence", use: "Cover empty stages, long customer names, risk states, and mobile overflow." },
    ],
  },
} as const satisfies Record<"releases" | "onboarding", ExampleReferenceKit>;
