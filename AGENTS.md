# Design-to-App Working Agreement

Use these instructions when implementing a Figma or Claude Design handoff in a Next.js repository.

## Before editing

- Read repository and directory-specific instructions.
- Inventory the complete handoff: behavior, copy, tokens, HTML prototype, typed components, assets, reference frames, and open questions.
- Inspect existing components, tokens, routes, data models, API patterns, feature flags, analytics, and tests.
- Write a compact mapping from export artifacts to application owners.

## Implementation rules

- Treat reference code as a visual and interaction specification, not production architecture.
- Reuse existing components and semantic tokens before creating new ones.
- Keep reusable visual components free of routing, domain data, permissions, and network mutations.
- Keep each hook focused on one orchestration concern.
- Keep route handlers thin: authenticate, validate, delegate, and normalize responses.
- Put authorization, ownership, transactions, idempotency, and query shape in server services.
- Persist only state that must survive refresh, session, device, or collaborator access.
- Keep sensitive and authoritative decisions on the server.
- Gate every feature-specific entry point and endpoint when a feature flag is required.
- Use deterministic development or test fixtures for canonical visual states.

## Verification order

1. Focused component, hook, service, and API tests.
2. Manual desktop and mobile comparison with approved references.
3. Targeted visual regression coverage.
4. Typecheck, lint, build, and required repository tests after behavior and design stabilize.
5. Real browser QA covering keyboard use, retry, back/reset, refresh, overflow, console errors, and network failures.

Never update screenshots blindly. Decide whether a diff represents a defect, an approved design change, stale fixture data, font/platform variation, or flaky infrastructure.

## Handoff

Report the user-visible outcome, architecture and data ownership, screenshots, analytics, tests run, approved deviations, remaining decisions, and material risks. Do not merge or deploy unless the user explicitly requests it.
