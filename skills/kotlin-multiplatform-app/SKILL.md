---
name: kotlin-multiplatform-app
description: Design, build, audit, and deliver Kotlin Multiplatform applications with shared product logic and slim native Android and iOS shells. Use for KMP monorepos, commonMain, Android/iOS source sets, shared state and sync, Swift interoperability, cross-platform tokens, native UI projections, or parallel mobile CI.
---

# Kotlin Multiplatform Application

Share product truth, not platform accidents. Put behavior that must remain identical in a product kernel and keep lifecycle, UI, capabilities, secure storage, and distribution in native edges. Do not pursue a shared-code percentage; minimize the number of places where a product rule can disagree.

## Establish the contract

Inspect product docs, Gradle settings and wrapper, version catalog, KMP and Android plugins, source sets and targets, modules, iOS integration, public framework API, platform shells, token sources, component contracts, code generation, tests, CI, and release paths. Run `pnpm dlx automated-product-engineer doctor` when installed.

Classify each concern before moving code:

- **Shared source:** requirements, domain vocabulary, state machines, policy, validation, protocol schemas, error taxonomy, sync and conflict rules, analytics semantics, feature flags, semantic tokens, and test scenarios.
- **Shared implementation:** pure domain logic, application use cases, serialization, repositories, feature stores, offline orchestration, and capability interfaces.
- **Generated projection:** Kotlin, Swift, CSS, API clients, event catalogs, and documentation derived deterministically from a canonical source.
- **Native implementation:** platform composition, UI, navigation, lifecycle, credential UI and secure storage, capabilities, accessibility, performance integration, signing, and store delivery.

Read [architecture-and-module-boundaries.md](references/architecture-and-module-boundaries.md) before creating or changing modules. Read [adoption-and-migration.md](references/adoption-and-migration.md) when introducing KMP to an existing repository.

## Build the shared product kernel

Keep the invariant kernel platform-free and deterministic. Model commands, states, failures, revisions, operation IDs, and time explicitly. The portable runtime may use coroutines and serialization, but receives clock, identifier, transport, persistence, identity, telemetry, scheduler, and capability ports from the composition root. Prefer injected interfaces to `expect`/`actual`; use `expect`/`actual` for narrow construction or platform facts.

Expose each feature through a small facade: immutable state, typed intent, subscription, and close/cancel. Keep most Kotlin declarations internal so the Swift API stays intentional. Map expected failures to values; do not let undeclared Kotlin exceptions cross into Swift. Read [state-sync-and-auth.md](references/state-sync-and-auth.md) for feature stores, concurrency, offline work, identity, and server authority. Read [swift-interop-and-native-shells.md](references/swift-interop-and-native-shells.md) for the exported boundary and native adapters.

## Share the design system correctly

Keep semantic token and component behavior sources platform-neutral. Compile tokens into native names with a recorded source digest; map them to platform types at the edge. Component contracts define meaning, variants, states, interaction, accessibility, adaptation, and examples. Jetpack Compose and SwiftUI components remain free to honor their platforms. Share UI with Compose Multiplatform only after a feature-level decision records native capability, UX, performance, ownership, and escape-hatch tradeoffs.

Read [tokens-components-and-shared-ui.md](references/tokens-components-and-shared-ui.md) before changing tokens, component contracts, code generation, or the shared/native UI boundary.

## Deliver in parallel

Land contracts and a shared-kernel commit first. Android and iOS work then proceed in parallel against that immutable interface. CI fans out into contract drift, common tests, Android, iOS, server compatibility, performance, and release evidence. Use additive API and schema evolution so one platform can lag safely. Every native journey reports its contract version and shared commit.

Read [testing-ci-and-release.md](references/testing-ci-and-release.md) for matrices, compatibility windows, performance, evidence, and rollout. Production signing, store publication, and credential changes remain human-authorized delivery actions.

For large parallel programs, read [parallel-delivery-operating-model.md](references/parallel-delivery-operating-model.md). Use one versioned contract capsule and completion ledger per feature so shared, server, Android, iOS, design-system, quality, and documentation lanes can progress against the same immutable product meaning without sharing implementation ownership.
