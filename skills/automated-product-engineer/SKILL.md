---
name: automated-product-engineer
description: Build or substantially redesign a production application feature from a product brief, Figma design, Claude Design export, screenshot, or existing flow, carrying it through architecture, implementation, QA, demo evidence, retrospective fix-back, and a review-ready draft pull request.
---

# Automated Product Engineer

Deliver a complete, reviewable product change rather than a disconnected mockup or code sample. Preserve the user's scope, the repository's architecture, and human authority over material product decisions, release, and merge.

## Establish the contract

- Read repository instructions and inspect existing work before creating a parallel implementation.
- Pin the request, design or product sources, accepted stories, exact base, current branches or pull requests, environments, and authority.
- Resolve only ambiguities that would materially change behavior, persistence, security, or release risk. Record the rest as explicit assumptions.
- Treat a design export as product and interaction evidence, not production architecture to paste.

## Select specialist skills

Load only the skills whose boundary is active:

- `claude-design-to-app` when preparing or integrating a Claude Design handoff.
- `figma-to-app-feature` for a Figma-led feature and the complete staged delivery lifecycle.
- `design-system` for shared tokens, primitives, variants, metadata, and previews.
- `architecture-building` for ownership, state, rendering, integration, encapsulation, and extension points.
- `frontend-api-db` for durable state, authorization, endpoints, schema, and client-cache behavior.
- `responsive-design` and `design-polish` for fluid geometry and final visual refinement.
- `manual-ui-qa` for the final real-browser exploratory pass.
- `code-review` and `security-review` before packaging risky or cross-layer changes.
- `pr-workflow` to capture evidence and open or update a reviewable draft pull request.
- `pr-review` only when reviewing a named remote pull request.

## Build through stable boundaries

- Reuse the design system and repository patterns before adding new mechanisms.
- Keep feature internals private behind narrow typed contracts. Prefer adapters, strategies, registries, slots, and enum-backed variants for real extension axes.
- Do not add speculative abstractions. Extract an extension point only when observed variation or a required integration makes it useful.
- Keep route handlers thin and put authorization, ownership, transactions, idempotency, and durable invariants in server-owned services and storage.
- Make loading, empty, partial, success, failure, retry, permission, and responsive states deliberate.

## Prove readiness

1. Run focused checks while behavior is changing.
2. Inspect the real feature on desktop and compact viewports, including keyboard, back/reset, retry, refresh, overflow, console, and network behavior.
3. Capture deterministic screenshots for the beginning, key decisions, result, and relevant recovery states.
4. Run the retrospective, fix high-confidence in-scope findings, and rerun invalidated evidence.
5. Run the repository's required static, unit, build, E2E, visual, migration, and security gates appropriate to the change.
6. Review the exact diff and open or update a draft pull request with architecture, evidence, risks, and rollback behavior.

Never claim a gate passed without current evidence. Do not merge, release, send external messages, change secrets, or perform destructive data work unless the user has authorized that exact action.
