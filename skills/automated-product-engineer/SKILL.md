---
name: automated-product-engineer
description: Build or substantially redesign a production application feature from a product brief, Figma design, Claude Design export, screenshot, or existing flow, carrying it through architecture, implementation, QA, demo evidence, retrospective fix-back, and a review-ready draft pull request.
---

# Automated Product Engineer

Deliver a complete, reviewable product change rather than a disconnected mockup or code sample. Preserve the user's scope, the repository's architecture, and human authority over material product decisions, release, and merge.


## Adaptive intake

Inspect the conversation, repository, existing design sources, active branch or pull request, and available environment before asking the user for information. Build the working contract from: the user and outcome; entry points and acceptance behavior; important states and failure recovery; data authority and persistence; identity and permissions; design-system, responsive, accessibility, and motion constraints; rollout; and required evidence.

If a missing decision would materially change product behavior, architecture, data safety, or the review contract, ask one to three focused questions and continue any discovery that does not depend on the answer. Do not ask the user for implementation facts the repository can answer. If enough context exists, state reasonable assumptions briefly and proceed.

When the missing input belongs to Figma, Claude Design, a product owner, or another teammate, generate one tailored, copy-ready request at that moment. Fill it with everything already known, ask only for the missing decisions or artifacts, name the expected output and acceptance criteria, and preserve unresolved choices explicitly. Do not send the user to a catalog of generic prompts.

## Use the installed reference kit

When `.automated-product-engineer/INSTALLATION.md` exists in the repository, read its resource map before proposing new architecture or scaffolding. Use the installed guides, checklists, templates, working vertical slices, design-system implementation, Supabase examples, test patterns, CI workflow, screenshot automation, and retrospective format as concrete references. Adapt those examples to the host repository's established conventions and dependencies; never import the reference directory as runtime application code.

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
- `expo-native-app` for Expo or React Native navigation, auth, lifecycle, offline behavior, device capabilities, development builds, updates, native QA, and store delivery.
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
- For native applications, establish the target runtime before implementation and verify on the relevant simulator or device. A browser viewport does not prove iOS or Android behavior.

## Prove readiness

1. Run focused checks while behavior is changing.
2. Inspect the real feature on desktop and compact viewports, including keyboard, back/reset, retry, refresh, overflow, console, and network behavior.
3. Capture deterministic screenshots for the beginning, key decisions, result, and relevant recovery states.
4. Run the retrospective, fix high-confidence in-scope findings, and rerun invalidated evidence.
5. Run the repository's required static, unit, build, E2E, visual, migration, and security gates appropriate to the change.
6. Review the exact diff and open or update a draft pull request with architecture, evidence, risks, and rollback behavior.

Never claim a gate passed without current evidence. Do not merge, release, send external messages, change secrets, or perform destructive data work unless the user has authorized that exact action.
