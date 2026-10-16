---
name: manual-ui-qa
description: Run intensive authenticated manual browser QA for a release-ready application surface. Use a agent-controlled browser to exercise real user stories, console and network behavior, persistence, responsive transitions, and visual quality; this is distinct from Playwright automation.
---

# Manual UI QA

This is an exploratory release gate performed through the real interface. Playwright supplies repeatable automated regression coverage, but it does not replace this agent-controlled manual browser session.

Read [references/release-scenarios.md](references/release-scenarios.md) for a risk-based scenario matrix, evidence format, and defect closure contract.

## Preflight

- Record the exact SHA, branch, URL, environment, database target, flags, browser, and viewport set.
- Confirm server and dependency health before judging the interface.
- Use an authorized test identity and seeded or redacted data; never record a password, secret, PII, or private customer data.
- Prepare the accepted story/state matrix, data namespace, and cleanup plan.
- Start from both a clean URL and explicit shareable URLs when navigation state matters.

## Browser workout

- Exercise each story through visible controls by clicking, typing, scrolling, hovering, focusing, navigating, refreshing, and resizing.
- Cover applicable default, loading, empty, error, selected, open, disabled, permission, destructive, dense, and recovery states.
- Vary high-risk flows by entry point, ordering, data state, navigation, persistence, and viewport rather than repeating identical clicks.
- For durable mutations, observe pending feedback, response, rollback or success, dependent counts, navigation, hard-refresh persistence, and cleanup.
- Probe rapid input, repeated actions, in-flight navigation, cancel/reopen, back/forward, retry, pagination, stale data, and interacting filters where relevant.
- Drag widths in both directions through layout transitions. Check scroll ownership, sticky regions, clipping, overlays, safe areas, keyboard focus, text wrapping, and touch targets.
- Watch browser console and network activity throughout; correlate suspicious behavior with server or worker logs when available.

## Defect loop

For each suspected defect:

1. Capture the state, actions, viewport, screenshot or clip, and relevant console/network evidence.
2. Reproduce slowly and rule out control, fixture, authorization, and environment mistakes.
3. Identify the owning boundary.
4. Add the smallest practical failing unit, integration, or Playwright regression test.
5. Fix the defect when implementation is authorized and in scope.
6. Run focused automated checks, deploy the new SHA, and manually repeat the original and adjacent paths.

An automated test alone does not close a defect discovered manually.

## Report and evidence

Record each important scenario with story, SHA, URL, environment, viewport, account identifier, data mode, actions, expected and observed result, logs or request evidence, media, and cleanup state. Distinguish product defects from environment failures, stale fixtures, and automation-control mistakes.

The handoff should link the QA record, exact test URL, representative desktop and compact screenshots, and a short final-state video. State blockers and untested scope explicitly.
