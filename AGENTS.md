# Design-to-App Working Agreement

If `.automated-product-engineer/onboarding/README.md` exists, read it and the `project-engineering-context` skill before selecting shared specialist skills. Treat `analysis.latest.json` as evidence to validate and the accepted Markdown decisions as the repository-specific contract.

Use these instructions when implementing a Figma or Claude Design handoff in a Next.js repository.

## Before editing

- Read repository and directory-specific instructions.
- Inventory the complete handoff: behavior, copy, tokens, HTML prototype, typed components, assets, reference frames, and open questions.
- Inspect existing components, tokens, routes, data models, API patterns, feature flags, analytics, and tests.
- Write a compact mapping from export artifacts to application owners.

## Adaptive intake

- Inspect the repository, conversation, available design source, current branch or pull request, and tests before asking the user for information.
- Ask only for missing decisions that would materially change behavior, architecture, persistence, permissions, responsive rules, or acceptance evidence. Continue independent discovery while waiting when possible.
- When a missing input belongs to Figma, Claude Design, a product owner, or another teammate, generate one tailored copy-ready request with known context filled in, the exact gap, and the expected deliverable. Do not send the user to a catalog of generic prompts.
- If the evidence is sufficient, state any reasonable assumptions briefly and proceed.

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

## Encapsulation and extension

- Give each feature a public contract and keep its internal components, hooks, adapters, and services private by default.
- Depend on typed interfaces at layer boundaries. Do not let pages reach through hooks into transport details or let route handlers reach around domain services.
- Add variants through typed configuration, registries, slots, or adapters when an intentional extension point already exists.
- Avoid growing central conditionals for each new feature. Add a small implementation behind a stable contract and register it at one composition boundary.
- Do not create speculative abstractions. Extract an extension point when two real implementations share a stable contract or when product requirements explicitly call for replaceable behavior.
- Keep extensions closed to arbitrary runtime code: validate registrations, constrain enums, and test the default and added implementation.

## Verification order

1. Focused component, hook, service, and API tests.
2. Manual desktop and mobile comparison with approved references.
3. Targeted visual regression coverage.
4. Typecheck, lint, build, and required repository tests after behavior and design stabilize.
5. Real browser QA covering keyboard use, retry, back/reset, refresh, overflow, console errors, and network failures.
6. Deterministic desktop and mobile demo screenshots of the completed user journey.

For Expo or React Native work, establish the native runtime before implementation. Use a development build for OAuth redirects, push notifications, or custom native modules. Verify lifecycle, deep links, permissions, offline/reconnect behavior, safe areas, keyboard, text scaling, and platform navigation on the relevant simulator or device. Treat native dependency or configuration changes as a new-binary boundary; an over-the-air JavaScript update does not add native code.

For Swift or native iOS work, inspect the Xcode workspace or project, shared scheme, targets, packages, deployment target, Swift language and concurrency settings, entitlements, privacy manifest, and signing boundary before implementation. Keep SwiftUI views declarative, observable UI models on the main actor, mutable shared resources actor-isolated, secrets in Keychain, and durable cross-user policy on the server. Verify focused Swift tests, critical XCUI journeys, lifecycle and deep links in a simulator, accessibility, and relevant hardware behavior on a physical device. Do not change signing identities, publish to TestFlight, or submit to the App Store without the user's authority.

For Kotlin or native Android work, inspect the Gradle wrapper and settings, modules, version catalog and convention plugins, application ID and namespace, SDK levels, variants, Compose/Views boundary, manifests, permissions, tests, and signing boundary before implementation. Keep composables declarative, screen state in screen-level ViewModels with immutable Flow, asynchronous work in owned coroutine scopes, structured data in Room, settings in DataStore, durable deferrable work in WorkManager, and shared policy on the server. Verify focused Kotlin tests, critical Compose or Espresso journeys, process recreation, App Links, adaptive layouts, accessibility, and relevant hardware behavior on a physical device. Do not change upload keys, Play credentials, tracks, or publication state without the user's authority.

For Kotlin Multiplatform work, inspect the Gradle wrapper, KMP and Android plugins, version catalog, modules, source sets and targets, native shells, iOS integration, public framework API, contract generators, scenario vectors, and CI fan-out before implementation. Share product documentation, domain rules, application orchestration, wire and error contracts, sync policy, analytics semantics, tokens, and component behavior. Keep navigation, lifecycle, native UI, secure storage, OS capabilities, accessibility, signing, and distribution in the native shells by default. Prefer injected interfaces to broad `expect`/`actual`, keep the Swift-facing facade small, and prove common policy plus both native projections against the same contract version and shared commit.

## Delivery and fix-back

- Run a short retrospective after implementation and initial QA. Record surprises, defects, architecture friction, and missing safeguards.
- Fix high-confidence, in-scope findings before handoff, then rerun the affected checks and recapture stale screenshots.
- Open a draft PR only from a clean, pushed feature branch. Include the user-visible result, architecture, screenshots, validation, retrospective fixes, risks, and rollback path.
- Never merge automatically. Human review remains the release gate.

Never update screenshots blindly. Decide whether a diff represents a defect, an approved design change, stale fixture data, font/platform variation, or flaky infrastructure.

## Handoff

Report the user-visible outcome, architecture and data ownership, screenshots, analytics, tests run, approved deviations, remaining decisions, and material risks. Do not merge or deploy unless the user explicitly requests it.
