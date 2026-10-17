---
name: figma-to-app-feature
description: Turn Figma designs, screenshots, exports, and product notes into a production-ready feature through artifact intake, product and architecture contracts, implementation, automated and manual QA, retrospective fix-back, durable documentation, deferred work, and release handoff.
---

# Figma To App Feature

Treat design artifacts as product requirements, not CSS paste targets. This skill coordinates the full delivery loop; load the specialist skills only when their boundary is active.

Read [references/delivery-lifecycle.md](references/delivery-lifecycle.md) for the full staged workflow and exit evidence. Read [references/artifact-and-state-contract.md](references/artifact-and-state-contract.md) when auditing a design handoff, resolving state precedence, or planning focused tests. Use the repository's design-export examples as concrete shape guidance when they are available, but preserve the target application's architecture and data contracts.


## Adaptive intake

Inspect the accessible Figma source, target repository, existing design system, routes, data contracts, and tests before asking for information. Establish the target frames and states, user outcome, required behavior and copy, persistence and permissions, responsive and accessibility rules, and acceptance evidence.

Ask only when a missing product or design decision would materially change implementation. If the Figma source lacks a required frame, state, token mapping, or interaction rule, generate one focused copy-ready request for the designer with known context filled in and the exact artifact or decision needed. Do not offer a generic prompt catalog. If the design contract is sufficient, proceed.

## Intake contract

- Pin the request, exact design nodes or exports, accepted stories, repository, base SHA, existing branches and pull requests, and available environments.
- Inventory component-level and page-level artifacts separately. Capture default, loading, empty, error, selected, open, hover/focus, permission, destructive, dense, and responsive states that apply.
- Establish a source hierarchy for conflicting design, product notes, running behavior, and code. Record assumptions and superseded decisions.
- Ask only for missing information that would materially change behavior, architecture, persistence, or release risk.

## Coordinate by boundary

- Use `design-system` for reusable tokens, primitives, variants, metadata, and previews.
- Use `architecture-building` for responsibility, state, rendering, integration, and pull-request boundaries.
- Use `frontend-api-db` for durable state, authorization, endpoints, schema, and client-cache behavior.
- Use `responsive-design` and `design-polish` for fluid geometry and screenshot-level refinement.
- Use `pr-workflow`, `code-review`, and `security-review` for packaging and independent gates.
- Use `manual-ui-qa` for the final agent-controlled browser workout. Playwright coverage is required where appropriate but does not satisfy this manual gate.

## Durable knowledge

Create or update two distinct artifacts:

- A living feature guide describing current purpose, stories, visible states, code map, data flow, state ownership, APIs, persistence, authorization, failure behavior, responsive/accessibility behavior, validation, and known risks.
- A historical retrospective describing what happened during implementation and QA, what failed, what was learned about both the feature and delivery pipeline, and the disposition of every finding.

Promote reusable pipeline lessons into shared instructions, runbooks, tests, or skills. Record important non-blocking work in the authorized backlog with evidence, impact, safe-to-defer reasoning, a revisit trigger, and acceptance criteria.

## Completion contract

Completion requires accepted stories on one exact SHA; appropriate focused, full, visual, accessibility, and Playwright checks; a distinct authenticated manual browser QA pass; resolved release blockers; retrospective fix-back of the highest-impact in-scope issues; current feature and pipeline documentation; durable deferred work; and final evidence.

When external communication is authorized, send a concise authorized issue tracker or team channel handoff containing the user outcome, exact SHA and environment, pull requests, test or preview link, automated and manual QA result, retrospective fixes, deferred tickets, and links to a useful screenshot and short video. Verify delivery. Never merge, release, change secrets, perform destructive data work, or send externally without the required authority.
