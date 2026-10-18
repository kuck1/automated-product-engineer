# Architecture and boundaries

## Product Semantics Fabric

The system has four layers:

1. **Feature capsule** — language-neutral product meaning and examples.
2. **Semantic runtimes** — generated Kotlin and TypeScript policy with identical inputs and outputs.
3. **Portable native runtime** — KMP use cases, repositories, sync, cache, outbox, and small Swift facade.
4. **Native projections** — Next.js/React, Android/Compose, and iOS/SwiftUI composition.

The capsule is the collaboration boundary. Generated code is disposable. Native projections depend inward; the feature capsule never imports framework concepts.

## Share exactly

Share vocabulary, identifiers, state machines, guards, error taxonomy, wire formats, analytics meaning, flag meaning, idempotency and revision rules, semantic tokens, component behavior, accessibility intent, and scenario vectors.

## Keep native

Keep rendering, navigation, lifecycle, deep links, credentials, secure storage, push, background execution, device capabilities, platform accessibility APIs, performance work, signing, and store delivery in platform modules.

Use injected ports for clock, identity, persistence, transport, telemetry, secure storage, notifications, and platform capabilities. Use `expect`/`actual` only for a small stable primitive that cannot be expressed as an interface owned by the caller.

## Server authority

Generated client policy improves immediate feedback and optimistic behavior. The server repeats authorization, revision, transition, validation, and persistence policy atomically. A client decision is never proof of authority.
