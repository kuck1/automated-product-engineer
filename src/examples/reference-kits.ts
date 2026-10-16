export type ExampleReferenceKit = {
  name: string;
  label: string;
  summary: string;
  brief: ReadonlyArray<readonly [label: string, value: string]>;
  principles: ReadonlyArray<readonly [name: string, detail: string]>;
  components: readonly string[];
  tokens: ReadonlyArray<{ readonly name: string; readonly variable: string; readonly value: string; readonly purpose: string }>;
  architecture: ReadonlyArray<readonly [layer: string, detail: string, source: string]>;
  prompts: ReadonlyArray<{ readonly slug: string; readonly name: string; readonly use: string }>;
};

export const exampleReferenceKits = {
  releases: {
    name: "Release readiness",
    label: "Client app 01",
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
    tokens: [
      { name: "Decision focus", variable: "--accent", value: "#a991ff", purpose: "Selected release, progress, and primary focus" },
      { name: "Ready", variable: "--mint", value: "#72e2c0", purpose: "Passing gates and policy-complete releases" },
      { name: "Pending", variable: "--warning", value: "#f2bf68", purpose: "Checks that still need attention" },
      { name: "Blocked", variable: "--danger", value: "#ff887f", purpose: "Failed gates and blocked transitions" },
      { name: "Control surface", variable: "--panel", value: "#181d23", purpose: "Rows, cards, and grouped controls" },
    ],
    architecture: [
      ["UI state", "The URL selects the client app; each row owns only transient interaction state.", "src/examples/example-workspace.tsx"],
      ["Server cache", "TanStack Query owns the snapshot, optimistic mutation, rollback, and reconciliation.", "queryKey: example-snapshot"],
      ["API", "The PATCH route authenticates, validates the revision, and delegates the transition.", "/api/examples/releases/[id]"],
      ["Policy", "The service recomputes gates and approvals before accepting ready.", "ExampleService.updateRelease"],
      ["Persistence", "A repository contract supports deterministic memory or Supabase adapters.", "ExampleRepository"],
    ],
    prompts: [
      { slug: "components", name: "Typed component contract", use: "Specify the release row, gates, score, states, and callbacks." },
      { slug: "boundaries", name: "Full-stack boundary map", use: "Trace Mark ready through optimism, API validation, policy, and persistence." },
      { slug: "visual-qa", name: "Visual QA evidence", use: "Cover dense rows, horizontal pressure, statuses, and failure recovery." },
      { slug: "tokens", name: "Semantic token export", use: "Document decision, ready, pending, blocked, and surface roles." },
    ],
  },
  onboarding: {
    name: "Onboarding operations",
    label: "Client app 02",
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
    tokens: [
      { name: "Journey focus", variable: "--accent", value: "#a991ff", purpose: "Selected navigation and interactive focus" },
      { name: "Healthy progress", variable: "--mint", value: "#72e2c0", purpose: "Adoption, completed milestones, and live state" },
      { name: "Needs attention", variable: "--danger", value: "#ff887f", purpose: "At-risk accounts and overdue work" },
      { name: "Stage surface", variable: "--bg-elevated", value: "#14191f", purpose: "Journey columns and spatial grouping" },
      { name: "Account surface", variable: "--panel", value: "#181d23", purpose: "Account cards and operational details" },
    ],
    architecture: [
      ["UI state", "The URL selects the client app; the board derives columns from canonical account stages.", "src/examples/example-workspace.tsx"],
      ["Server cache", "TanStack Query moves cards optimistically, then reconciles the saved account.", "queryKey: example-snapshot"],
      ["API", "The PATCH route authenticates, validates the revision, and delegates the stage change.", "/api/examples/onboardings/[id]"],
      ["Policy", "The service blocks launch until milestones and adoption meet the product rules.", "ExampleService.updateOnboarding"],
      ["Persistence", "The same repository seam supports memory fixtures or tenant-scoped Supabase records.", "ExampleRepository"],
    ],
    prompts: [
      { slug: "responsive", name: "Responsive state matrix", use: "Specify the horizontal journey at wide, transition, and narrow widths." },
      { slug: "components", name: "Typed component contract", use: "Define columns, account cards, health, milestones, and actions." },
      { slug: "boundaries", name: "Full-stack boundary map", use: "Trace a stage transition through optimism, policy, and persistence." },
      { slug: "visual-qa", name: "Visual QA evidence", use: "Cover empty stages, long customer names, risk states, and mobile overflow." },
    ],
  },
} as const satisfies Record<"releases" | "onboarding", ExampleReferenceKit>;
