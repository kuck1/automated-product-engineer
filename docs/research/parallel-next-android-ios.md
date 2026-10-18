# True parallel Next.js, Android, and iOS development

Research snapshot: 2026-10-18.

## Product problem

Teams often call three implementations “cross-platform” when one platform is still the hidden specification, one waits for another to expose behavior, and parity is checked by screenshots or memory. That is serial development with three renderers.

True parallel development needs a smaller shared object than an application and a stronger proof than compilation. This design uses a **feature capsule** as the shared product contract, then lets Next.js, native Kotlin Android, and native Swift iOS build sibling projections concurrently.

## Official constraints

- Next.js supports local monorepo packages through `transpilePackages`, configurable Turbopack roots, and standalone output tracing. Server and Client Components still form an explicit execution boundary; a shared contract must not erase it.
- Kotlin Multiplatform supports shared source sets plus platform-specific source sets and can be introduced incrementally into existing Android and iOS applications. Apple integration can use local framework embedding during active monorepo development and XCFramework or Swift Package distribution when teams need a binary boundary.
- Xcode can package multiple Apple variants in an XCFramework. This is a distribution mechanism, not a reason to share UI or lifecycle code.

These constraints favor a monorepo during active product development, a KMP native product kernel, native platform shells, and a language-neutral contract that can also generate a TypeScript runtime for Next.js.

## Product Semantics Fabric

The shared system has four layers:

1. **Feature capsule** — product vocabulary, actors, outcomes, entities, states, intents, guards, authorization decisions, errors, analytics, flags, tokens, component behavior, API schemas, and scenario vectors.
2. **Semantic runtimes** — deterministic Kotlin and TypeScript projections generated from that capsule.
3. **Portable native runtime** — KMP use cases, repositories, sync, cache, outbox, and a deliberately small Swift-facing facade.
4. **Native projections** — React and Next.js, Jetpack Compose, and SwiftUI or UIKit.

The capsule receives a content digest. Generated files, branches, artifacts, and evidence name that digest as their **contract epoch**. Two lanes using different digests are implementing different product versions even when both compile.

## What is shared

Share product language, identifiers, state machines, guards, error taxonomy, wire formats, analytics meaning, feature-flag meaning, idempotency and revision rules, semantic tokens, component behavior, accessibility intent, and executable scenarios.

Keep rendering, navigation, lifecycle, deep links, secure storage, credentials, push, background execution, native accessibility APIs, device capabilities, performance work, signing, and store delivery in platform-owned code.

The server remains authoritative. Generated client policy exists for immediate validation, optimism, explanation, and deterministic tests. The server repeats authentication, authorization, revision checks, invariants, and persistence atomically.

## Parallel delivery graph

After the capsule commit is frozen, contract, server, KMP kernel, Next.js, Android, iOS, design, quality, and documentation lanes branch as siblings. No platform branch is based on another platform branch.

Each lane publishes a projection receipt with:

- capsule and source digests;
- platform and artifact identity;
- supported capability envelope;
- scenario results;
- focused, integration, accessibility, and native-runtime evidence;
- explicit deviations and their owners.

Kotlin and TypeScript both replay the same canonical scenario vectors. A convergence job parses their semantic receipts and requires deep equality. Platform-specific gates separately prove lifecycle, navigation, storage, networking, auth, accessibility, rendering, and distribution.

## Why this is not shared UI

Sharing rendered UI makes divergence cheap to hide and native behavior expensive to express. Sharing only prose makes drift easy. The feature capsule sits between them: it is precise enough to generate policy and tests, but it leaves native composition and capabilities free.

KMP supplies the native product kernel because Android and iOS can execute the same Kotlin behavior without forcing the web runtime or a shared renderer. Next.js consumes a generated TypeScript semantic runtime because compiling the whole KMP application to JavaScript would make the native kernel, module graph, and browser/server boundary dictate web architecture.

## Compatibility and release

Additive capsule changes can let platform lanes land in any order. Breaking changes require an explicit compatibility window where the server accepts old and new epochs. Each released artifact records its epoch, allowing a platform rollback without guessing which product contract it contains.

Feature flags should describe one semantic capability and may roll out per platform. A platform-specific deviation is a product decision with an owner, expiry condition, and scenario evidence; it is never an undocumented fork.

## Adoption

Start with one feature that has meaningful policy, at least one stale or conflicting write, and visible recovery. Characterize current behavior, freeze vectors, generate both runtimes, make current implementations replay the oracle, move Android and iOS behavior behind KMP interfaces, replace duplicated web policy with the generated TypeScript projection, and enable receipt comparison. Repeat feature by feature.

Debug divergence by checking capsule digests, normalized inputs, serialization, nullability, enum handling, numeric units, time semantics, guard order, optimistic state, canonical reconciliation, and platform adapters—in that order. Add the smallest failing case to the scenario corpus before fixing it.

## Sources

- [Next.js `transpilePackages`](https://nextjs.org/docs/pages/api-reference/config/next-config-js/transpilePackages)
- [Next.js Turbopack root](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack)
- [Next.js output and tracing](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Kotlin Multiplatform quickstart](https://kotlinlang.org/docs/multiplatform/quickstart.html)
- [Kotlin Multiplatform project configuration](https://kotlinlang.org/docs/multiplatform/multiplatform-project-configuration.html)
- [Incremental KMP integration](https://kotlinlang.org/docs/multiplatform/multiplatform-integrate-in-existing-app.html)
- [KMP iOS integration options](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-integration-overview.html)
- [Kotlin/Native Apple frameworks](https://kotlinlang.org/docs/apple-framework.html)
- [Apple XCFramework guidance](https://developer.apple.com/documentation/xcode/creating-a-multi-platform-binary-framework-bundle)
- [Apple binary Swift packages](https://developer.apple.com/documentation/xcode/distributing-binary-frameworks-as-swift-packages)
- [OpenAPI Specification](https://spec.openapis.org/oas/)
