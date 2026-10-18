# Current Codebase Assessment

This assessment was completed before broadening the audit, skills, and orchestration. It combines repository inspection with the expanded read-only audit and validates the one ambiguous static signal against its caller.

## Current system feedback

### Preserve

- Thin API routes delegate to services and repositories rather than owning durable policy.
- Query-cache usage, versioned writes, operation IDs, Supabase policies, and offline reconciliation are already represented in working case studies.
- The design system has semantic variables and reusable UI boundaries.
- Verification includes service, installer, package, browser, type, lint, content, and build paths.
- Skills already use progressive references instead of embedding every workflow in the conductor.

### Observed friction

- The existing catalog described strong cross-cutting principles but did not provide stable machine-readable IDs, so the audit, docs, examples, and skills could drift.
- State-management coverage was strongest; webhooks, long-running jobs, uploads, backoff, compensation, identity-scoped cache cleanup, and server-enforced feature flags lacked equivalent examples and tests.
- Audit output grouped findings but did not expose a reusable pre-build feedback object for agents.
- The conductor recommended inspection but did not prescribe a concise preserve/risk/unknown/pattern/proof response before implementation.

### Validated ambiguity

The first expanded audit identified an Effect in `src/guide/live-state-demos.tsx` as possible duplicated state. Inspection showed that it coordinates `IntersectionObserver` and animation frames, which are external browser systems and therefore a valid Effect boundary. The scanner now excludes common external synchronization APIs from the duplicated-state hypothesis.

### Selected pattern

The implementation uses `evidence-follows-owner` for the delivery approach and introduces a registry that links every new situation to its specific owning pattern. Existing runtime examples remain unchanged; the new algorithms are installable reference material rather than application dependencies.

### First proof

The first proof is a focused catalog and algorithm test suite: stable unique IDs, actionable routing, and behavior tests for stale responses, rollback, replay, conflict, deduplication, identity cleanup, authorization, webhooks, jobs, uploads, retry, and compensation. Package tests then prove audit routing and installation.

## Recommended next trigger

Add a new atlas entry only after a real implementation or retrospective reveals a reusable decision. Give it a user-visible situation, a failure, one authority boundary, an anti-pattern, a focused proof, and an owning skill. Avoid adding framework recipes without a product failure they solve.

