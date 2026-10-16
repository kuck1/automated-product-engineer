---
name: claude-design-to-app
description: Prepare production-grade requests for Claude Design and turn Claude Design export folders into application UI. Use when a user asks what to send Claude Design, supplies a Claude Design handoff/export, or asks to implement or reconcile that export in an existing codebase. The skill covers the export contract, design-system mapping, real data and persistence, feature flags, analytics, responsive behavior, motion, accessibility, pixel comparison, and focused UI/E2E tests. Do not use for ordinary UI implementation without a Claude Design input, or for direct Figma implementation when only a Figma source is supplied.
---

# Claude Design to App

Treat a Claude Design export as a design and behavior contract, not as production code to paste into the repository.

## Choose the workflow

- If the user wants a request to send to Claude Design, read [claude-design-export-prompt.md](references/claude-design-export-prompt.md), replace its bracketed inputs, and return the complete prompt without weakening its deliverables.
- If the user supplied an export folder, read [integration-checklist.md](references/integration-checklist.md) and follow it from discovery through verification.
- If the user wants both, prepare the request first. Integrate only after the resulting export is available.
- If the export points to a Figma source or the user also requests direct Figma implementation, invoke the applicable Figma design-to-code skill before using Figma tools.

## Requesting a Claude Design export

Collect or infer these inputs from the conversation and repository:

1. Feature name and product context.
2. Primary user and job to be done.
3. Business rules, final copy, data definitions, persistence, permissions, analytics, and feature-flag rules.
4. Known app design-system primitives, tokens, routes, and framework.
5. Reference screenshots, files, existing flows, and required responsive sizes.
6. Known product decisions and unresolved questions.

Use reasonable repository evidence for missing implementation context. Preserve unresolved product-policy choices as explicit decisions instead of silently inventing them.

Ask Claude Design for a self-contained handoff package with all meaningful states, deterministic state controls, typed reference components, separated copy and config, semantic tokens, local assets, machine-readable frame metadata, exact desktop and mobile reference images, accessibility and motion specifications, a data contract, analytics and persistence rules, acceptance criteria, and open decisions. The exact copyable request is in the prompt reference.

## Implementing an export

Start by inventorying the complete export. Read the handoff, exact copy, configuration, tokens, source design, prototype, reference components, frame manifest, and canonical screenshots before editing the app.

Then inspect the target repository's instructions, design system, existing implementation, feature flags, data model, API patterns, analytics helpers, and tests. Write down a compact mapping from the export to existing primitives and semantic tokens. Resolve architecture and state ownership before broad visual work.

Use the export's reference component as an interaction and geometry model. Rebuild it with the app's components, tokens, routing, server authority, data access, and persistence conventions. Keep final copy and product thresholds/config out of presentation JSX when the app already has an appropriate configuration layer.

Preserve these contracts:

- Gate every entry point and supporting endpoint that is part of a flagged feature. The flag-off path must have no visible or behavioral side effects.
- Use real application data. Clearly label any fixture-only values and keep them out of production paths.
- Persist completion or acknowledgment server-side when the experience must survive devices or sessions.
- Distinguish first-time, replay, reminder, and existing-user flows. Do not let replay mutate completion state or redirect unexpectedly.
- Separate intermediate persistence from final close/navigation. A refresh caused by an intermediate save must not make the current experience ineligible and unmount its final screen.
- Define dismissal, Escape, outside-click, failure recovery, and navigation behavior deliberately for each flow.
- Track initial open, step views, dwell time, actions, completion, dismissal, failure, and replay when analytics are requested.
- Keep dialog geometry stable across steps unless the design explicitly requires a size change.
- Implement reduced-motion behavior alongside the intended transitions.

## Verify the result

Create deterministic fixtures or URL controls for each canonical state when the repository permits them. Capture the exact viewports listed in the export's frame manifest and compare them against the supplied references with overlays or image diffs. Inspect desktop and mobile manually; fix colors, type, radii, spacing, alignment, wrapping, overflow, and motion before accepting visual baselines.

Add meaningful focused coverage for:

- eligibility and feature-flag isolation;
- state transitions, guards, boundary values, and replay behavior;
- persistence/API success and failure;
- dismissal and keyboard behavior;
- analytics payloads and timing lifecycle;
- responsive geometry and canonical visual states;
- final navigation and server-refreshed state.

Run broad repository gates only after design and behavior are stable. Report what changed, how it maps to the export, the visual evidence, tests run, and any product decisions that remain open.
