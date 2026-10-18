# Kotlin Multiplatform product-kernel research

This research defines a cross-platform delivery model that shares product truth aggressively while preserving native Android and iOS experiences. It does not optimize for the highest percentage of shared files. It optimizes for one implementation of every rule whose divergence would become a product defect.

## Toolchain snapshot

The reference template was pinned on 2026-10-18 to Kotlin 2.4.21, Android Gradle Plugin 9.4.1, Gradle 9.6, and JDK 17. Kotlin's [release page](https://kotlinlang.org/docs/releases.html), Android's [Gradle plugin API page](https://developer.android.com/reference/tools/gradle-api), and the [AGP compatibility table](https://developer.android.com/build/releases/about-agp) are the authority when refreshing those pins. The shared Android target uses `com.android.kotlin.multiplatform.library`; Android's [KMP plugin guidance](https://developer.android.com/kotlin/multiplatform/plugin) recommends a separate application module and documents migration away from the legacy Android library plugin.

Swift export remains an explicit experiment while Kotlin documents it as [Alpha](https://kotlinlang.org/docs/native-swift-export.html). The default production boundary therefore uses the established Objective-C/Swift framework interop plus a deliberately small feature facade. A team may evaluate Swift export behind an API compatibility gate without making the entire codebase depend on its current surface.

## The architectural choice

Kotlin Multiplatform supports selective sharing: teams can keep native Jetpack Compose and SwiftUI interfaces while sharing business logic, or adopt Compose Multiplatform for chosen surfaces. The official [Android and iOS architecture comparison](https://kotlinlang.org/docs/multiplatform/build-ios-android-app.html) describes this as a spectrum rather than an all-or-nothing framework decision. The default in this toolkit is native UI over a shared product kernel. Shared UI is a feature-level decision when identical behavior and presentation have more value than platform-specific interaction.

The project uses three rings:

1. **Invariant kernel:** immutable domain values, policies, state machines, validation, pricing, permissions, conflict rules, analytics semantics, and deterministic test vectors. It has no platform API, network client, database driver, or UI dependency.
2. **Portable runtime:** use cases, repositories, serialization, cache and outbox orchestration, feature stores, clocks, identifiers, logging, and capability ports. It depends inward and receives platform implementations.
3. **Native projection:** Android and iOS composition roots, lifecycle ownership, navigation, UI components, permissions, secure storage, notifications, system integrations, accessibility, and release configuration. Native code renders shared state and sends typed intent.

The [official native-UI KMP sample](https://github.com/Kotlin/kmp-basic-sample) uses separate Android and iOS applications with a shared module. Kotlin's [project-configuration guidance](https://kotlinlang.org/docs/multiplatform/multiplatform-project-configuration.html) supports either one or several shared modules. We use several modules only when they create independent ownership, compilation, release, or dependency boundaries.

## Share contracts before implementation

The highest-return shared layer is documentation and executable contracts:

- product outcomes, actors, policies, failure states, and acceptance journeys;
- a canonical domain vocabulary and state-transition catalog;
- wire schemas, error codes, revision and idempotency rules;
- analytics event names, property authority, privacy classification, and deduplication;
- semantic design tokens and component behavior contracts;
- scenario fixtures that every platform runs against the same expected result.

These contracts live above app code in the monorepo. A platform implementation cannot declare itself complete until it satisfies the same scenario IDs. A generated artifact carries its source digest so CI can reject drift.

The token source follows the stable 2025.10 [Design Tokens Format Module](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/). The repository compiler emits native Kotlin, Swift, and CSS names from semantic roles. Platforms convert those primitives into `Color`, `Shape`, `TextStyle`, or SwiftUI equivalents at the native boundary; the product meaning and raw value stay identical.

## Kotlin module and platform boundary

`commonMain` holds code that must behave identically. `androidMain` and `iosMain` connect platform APIs when a multiplatform library is unavailable. Kotlin documents [source sets](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html) as the main unit for target-specific dependencies and compilation.

Prefer ordinary interfaces passed into common code over `expect`/`actual`: interfaces make dependencies visible, permit deterministic fakes, and let a composition root choose implementations. Use `expect`/`actual` for small compile-time platform facts or constructors that cannot be expressed cleanly as injected behavior. Kotlin's [expect/actual guidance](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html) preserves a common API while platform source sets provide implementations.

For modern Android library targets, use the official [`com.android.kotlin.multiplatform.library` plugin](https://developer.android.com/kotlin/multiplatform/plugin). Keep the Android application in a separate application module. For iOS monorepos without a required CocoaPods dependency, use [direct framework integration](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html); use a local Swift package or CocoaPods only when the dependency graph needs it.

## State and Swift interoperability

Feature logic exposes an immutable state snapshot and accepts typed intents. Android may collect `StateFlow` with lifecycle awareness. The Swift boundary should stay deliberately small: expose a feature controller with `subscribe`, `dispatch`, and `close`, then adapt it to an `@MainActor` observable Swift model. This hides coroutine and collection types from most Swift call sites, guarantees explicit cancellation, and keeps SwiftUI previews trivial.

Kotlin's [Swift/Objective-C interoperability](https://kotlinlang.org/docs/native-objc-interop.html) maps Kotlin declarations through generated frameworks but has naming, error, collection, and coroutine constraints. Treat the exported surface as a product API: limit public declarations, use stable names, map failures to explicit values, avoid broad dependency exports, and add a Swift compile smoke test. Swift export is promising but remains an explicit adoption decision while its documented status is not fully stable.

## Data, auth, and offline behavior

The shared module owns request/response schemas, authentication state transitions, retry policy, refresh coordination, identity-scoped invalidation, repository interfaces, optimistic updates, version conflicts, and durable outbox semantics. Platform shells own credential UI, secure key material, browser or app handoff, background schedulers, reachability hints, and OS notification routing. The server remains authoritative for identity, authorization, tenancy, idempotency, and durable policy.

A local database can be shared where it materially removes schema and migration divergence. Android documents [Room for KMP](https://developer.android.com/kotlin/multiplatform/room) with common entities and DAOs plus platform-specific database builders. The choice remains replaceable behind a repository port: database availability must not leak into domain rules.

## Native UI and component systems

Native components share contracts, not widget implementations by default. A component contract defines semantic role, variants, states, content rules, accessibility semantics, interactions, motion intent, adaptive behavior, and scenario fixtures. Android maps that contract to Compose or Views; iOS maps it to SwiftUI or UIKit. This preserves platform navigation, input, typography, accessibility, and newly released OS capabilities.

Compose Multiplatform can own an entire feature when it passes an explicit decision record: the feature benefits from visual identity and synchronized delivery, platform UX differences are small, required native APIs are available, binary and startup impact are measured, and both platform teams accept the debugging boundary. Compose Multiplatform remains interoperable with SwiftUI and UIKit, as described in the [SwiftUI integration guidance](https://kotlinlang.org/docs/multiplatform/compose-swiftui-integration.html).

## Parallel delivery with unlimited CI

Every feature is sliced by contract rather than platform:

1. Land product docs, state diagrams, tokens, component contracts, wire schemas, and scenario fixtures.
2. Implement the pure shared kernel and execute its tests on a host target.
3. Build Android and iOS projections in parallel against the same immutable shared commit.
4. Run platform component tests and accessibility checks independently.
5. Run contract, Android, iOS, server, and cross-version compatibility matrices.
6. Promote only when scenario coverage, generated-artifact drift, API compatibility, performance budgets, and native journey evidence agree on one SHA.

The shared layer is never a queue that blocks both platform teams. Contract changes use additive evolution, feature flags, schema compatibility windows, and generated API reports. Native shells may ship at different times while the server and shared kernel support the overlap.

## Governing metrics

Measure rule duplication removed, contract parity, native-shell size, feature lead time, platform lag, build duration, exported API size, binary/startup cost, escaped platform divergence, and rollback time. A high shared-code percentage is neither a goal nor proof of quality.

## Resulting rule

Share meaning, rules, state transitions, protocols, and semantic decisions. Generate mechanical representations. Keep system capabilities and experience-native code at the edge. Move a boundary only after two implementations expose a stable shared contract or the product explicitly requires identical behavior.
