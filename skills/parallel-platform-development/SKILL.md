---
name: parallel-platform-development
description: Build one product feature concurrently in Next.js, native Kotlin Android, and native Swift iOS from a versioned feature capsule with Kotlin Multiplatform native business logic and machine-checked TypeScript/Kotlin semantic parity. Use for cross-platform monorepos, parallel platform delivery, contract generation, parity CI, or platform convergence planning.
---

# Parallel platform development

Ship one product decision through three native experiences without placing one platform on the critical path of another.

## Start with a feature capsule

Read `references/feature-capsule-protocol.md`. Write the product language, actor and outcome, domain entities, states, intents, transitions, guards, authorization decisions, errors, telemetry, flags, tokens, component behavior, API schemas, and scenario vectors before platform implementation.

Assign the capsule a content digest. Every generated projection, platform branch, artifact, and evidence receipt must name that digest. A platform working against another digest is a different product version, even if the source compiles.

## Preserve the ownership model

Read `references/architecture-and-boundaries.md`.

- Keep authoritative business policy on the server.
- Compile deterministic client-safe policy into Kotlin and TypeScript for validation, optimism, and explanation.
- Use KMP for the Android/iOS product kernel and portable runtime.
- Keep Next.js composition in React, Android composition in Jetpack Compose, and iOS composition in SwiftUI or UIKit.
- Keep lifecycle, navigation, secure storage, capabilities, accessibility, and distribution native.
- Share design meaning through tokens and component contracts, not rendered widgets by default.

## Run independent lanes

Read `references/parallel-operating-model.md`. Create contract, server, shared-kernel, Next.js, Android, iOS, design, quality, and documentation lanes from the same capsule commit. Give each lane disjoint ownership and explicit inputs, outputs, proof, and integration boundary. Do not stack platform branches on each other.

Each platform publishes a projection receipt containing the capsule digest, artifact digest, supported capabilities, scenario results, focused tests, visual evidence, and known deviations. Integrate only receipts for the same capsule digest.

## Prove convergence

Read `references/parity-ci-and-release.md`.

1. Validate and regenerate contracts deterministically.
2. Run the same scenario vectors in Kotlin and TypeScript.
3. Compare canonical semantic receipts byte-for-meaning after parsing.
4. Compile the KMP host, Android application, iOS framework plus Swift facade, and Next.js production application independently.
5. Test platform-only behavior on its real runtime.
6. Join the lanes at one convergence gate after all independent evidence exists.

Semantic parity does not replace native UX testing. It proves that platforms agree about product meaning; platform tests prove that each experience expresses it correctly.

## Adopt incrementally

Read `references/adoption-and-debugging.md`. Begin with one high-value, concurrency-sensitive feature. Characterize existing behavior, create the capsule and scenario oracle, wrap current implementations, compare receipts, then move native shared logic into KMP. Preserve explicit deviations until they are product decisions.

When parity fails, compare capsule digests first, then normalized inputs, policy outputs, serialization, numeric and time semantics, optimistic behavior, and platform-only adapters. Fix the owner of the disagreement and add the failing case to the shared scenario vectors.

## Finish

Update the capsule, generated projections, platform evidence, local documentation, and retrospective together. Report which decisions are shared, which remain native, what parity proves, remaining capability differences, and the next safe integration order.
