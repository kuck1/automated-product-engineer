# Discovery, Specification, and Debugging Analysis

Use this reference before proposing architecture in an unfamiliar repository or when a defect may cross layers. Its purpose is to establish the current system and the smallest correct change before implementation begins.

## Build the evidence map

Inspect repository instructions, runtime and package configuration, environment contracts, module boundaries, middleware, error handling, observability, data flow, state ownership, API schemas, test organization, and recent changes relevant to the request. Read the actual callers and tests for the affected path; do not infer the architecture from directory names alone.

Locate applicable product briefs, specifications, decisions, and feature guides. Extract observable behavior, business invariants, validation rules, permissions, data shapes, failure contracts, performance or compatibility constraints, and required integrations. Mark contradictions and stale statements instead of silently choosing one.

Map every material requirement to an implementation owner and evidence source:

| Requirement | Owning layer | Existing contract | Evidence | Open decision |
| --- | --- | --- | --- | --- |
| visible behavior | view or feature boundary | props, state, navigation | design or acceptance story | only if behavior is ambiguous |
| mutation policy | domain service | transition and authorization rules | tests and specification | only if product policy is missing |
| persistence | repository or external adapter | schema and version contract | migration and integration tests | only if lifetime or ownership is unclear |

## Diagnose before fixing

Reproduce the problem and trace one concrete input through the system. Compare intended behavior, current behavior, and the last known working behavior when history is useful. Inspect recent commits only to explain the affected path, not to turn the task into a broad repository archaeology exercise.

Generate a small set of plausible fixes and compare them by owning boundary, scope, compatibility, risk, and testability. Prefer the option that corrects the source of truth with the least new mechanism. Reject fixes that only mask a downstream symptom, duplicate an existing abstraction, or move authority into the UI.

## Plan a reviewable slice

Break the result into the smallest coherent vertical slice that proves the risky contract. Name the expected test or observable evidence for each step. Include interfaces or schema changes only when required by the chosen boundary. Keep dependencies, rollout, rollback, and failure handling explicit.

After implementation, reconcile the result with the original requirements, update living documentation when the current truth changed, and record remaining blockers or deliberate exclusions. Status updates should describe completed behavior, relevant files or boundaries, current validation, and blockers; omit mechanical activity that does not help a reviewer decide.
