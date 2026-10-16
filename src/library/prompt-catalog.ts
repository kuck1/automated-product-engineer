export type PromptCategory = "Start here" | "Design contract" | "Implementation" | "Verification";

export type PromptDescriptor = {
  slug: string;
  title: string;
  category: PromptCategory;
  description: string;
  file: string;
};

export type PromptEntry = PromptDescriptor & { body: string };

export const promptCatalog: PromptDescriptor[] = [
  { slug: "claude-quick", title: "Claude Design quick request", category: "Start here", description: "Request the complete minimum handoff for a focused feature.", file: "claude-design-quick.md" },
  { slug: "claude-full", title: "Claude Design full export", category: "Start here", description: "Request an exhaustive offline handoff for a complex product flow.", file: "claude-design-full-export.md" },
  { slug: "figma-audit", title: "Figma source audit", category: "Design contract", description: "Inventory frames, components, states, and unresolved decisions before coding.", file: "figma-source-audit.md" },
  { slug: "tokens", title: "Semantic token export", category: "Design contract", description: "Extract human-readable tokens and map them to the existing system.", file: "design-token-export.md" },
  { slug: "prototype", title: "Offline HTML prototype", category: "Design contract", description: "Generate a deterministic prototype whose states work without a build step.", file: "offline-html-prototype.md" },
  { slug: "components", title: "Typed component contract", category: "Design contract", description: "Define props, variants, callbacks, accessibility, and state ownership.", file: "typed-component-contract.md" },
  { slug: "responsive", title: "Responsive state matrix", category: "Design contract", description: "Specify adaptive behavior at wide, transition, and narrow widths.", file: "responsive-state-matrix.md" },
  { slug: "motion", title: "Motion and interaction spec", category: "Design contract", description: "Document triggers, timing, focus, interruption, and reduced motion.", file: "motion-interaction-spec.md" },
  { slug: "boundaries", title: "Full-stack boundary map", category: "Implementation", description: "Trace one action through UI, API, policy, persistence, and analytics.", file: "full-stack-boundary-map.md" },
  { slug: "visual-qa", title: "Visual QA evidence", category: "Verification", description: "Plan focused UI checks, fixtures, screenshots, traces, and baselines.", file: "visual-qa-evidence.md" },
  { slug: "pull-request", title: "Pull request evidence", category: "Verification", description: "Package reviewer context, validation, screenshots, risk, and rollback.", file: "pull-request-evidence.md" },
  { slug: "retrospective", title: "Retrospective and fix-back", category: "Verification", description: "Turn delivery friction into durable improvements to the system.", file: "retrospective-fix-back.md" },
];
