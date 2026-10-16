---
name: architecture-building
description: Design, implement, harden, or review feature architecture from a senior technical lens. Use for separation of concerns, state ownership, API and database boundaries, rendering choices, extensibility, risk analysis, or reviewable pull-request decomposition.
---

# Architecture Building

Start from observed repository facts and the accepted product contract. Optimize for clear ownership and safe evolution, not abstract purity.

Read [references/feature-boundaries.md](references/feature-boundaries.md) when designing or reviewing a cross-layer feature, decomposing a large component, or deciding where an extension point belongs.

## Discover before designing

- Read repository instructions, the living feature guide, relevant decision records, schemas, tests, and the closest implemented patterns.
- Map current responsibilities, data flow, state transitions, external writers, authorization checks, cache behavior, and operational constraints.
- Measure or reproduce claimed scale and maintainability problems. File size alone is not a refactor mandate.
- Record unknowns and pause only when an unresolved decision would materially change the product, persistence model, or security boundary.

## Define ownership

Use explicit layers where the repository supports them:

- entry points compose the experience and choose server/client or process boundaries
- feature components render domain behavior
- hooks or controllers own interaction orchestration and state transitions
- reusable primitives own visual recipes and variants
- endpoints authenticate, validate, delegate, and serialize
- services own policy, transactions, query shape, idempotency, and external coordination
- the database owns durable invariants, constraints, indexes, and migration history
- jobs and integrations own retry, delivery, deduplication, and reconciliation contracts

Classify each state value as transient local state, shareable navigation state, server cache, durable database state, or external authority. Define precedence and synchronization instead of allowing multiple implicit sources of truth.

## Design for failure

- Separate read visibility from write authority.
- Define validation, ownership, tenancy, soft deletion, PII, caching, idempotency, concurrency, migration, rollback, and external-writer behavior.
- Make cache invalidation and stale-response handling part of the mutation design.
- Select static, server-rendered, client-driven, streamed, or background execution from actual interaction and freshness requirements.
- Prefer the smallest vertical slice that proves the riskiest boundary.

## Produce durable output

Document the chosen boundaries, state/data flow, alternatives, risks, test seams, rollout/rollback plan, and intentional constraints in the feature guide or a short decision record. When implementation spans dependent changes, propose the smallest reviewable dependency graph; every branch must remain coherent on its stated base.

After implementation and manual QA, revisit the design with real evidence. Fix low-risk, high-leverage boundary problems in scope, and record larger non-blocking work with a trigger for revisiting it.
