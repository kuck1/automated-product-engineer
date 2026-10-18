# Architecture and module boundaries

## Dependency rule

Dependencies point inward:

```text
androidApp ─┐
            ├─> feature facade ─> application ─> domain
iosApp ─────┘          │               │
                       └─> ports <──── adapters
```

The domain module has no coroutine, serialization, database, network, analytics SDK, OS, or UI dependency. Application modules may coordinate domain objects and ports. Protocol modules own wire compatibility. Feature modules compose application behavior into a stable UI-facing contract. Platform modules provide implementations and render state.

## Recommended monorepo

```text
docs/product/                 outcomes, journeys, policies, glossary
contracts/                    tokens, components, analytics, API, scenarios
shared/domain/                pure values, rules, state machines
shared/application/           use cases and ports
shared/protocol/              serialized DTOs and error taxonomy
shared/sync/                  cache, outbox, conflict and retry policy
shared/features/<feature>/    feature state, intent, facade, fixtures
androidApp/                   Android composition and native projection
iosApp/                       iOS composition and native projection
tools/                        deterministic compilers and validators
```

Start with fewer Gradle modules when boundaries are not yet independent. Extract only when ownership, dependency policy, build isolation, public API, or reuse makes the boundary real.

## Boundary decisions

Share a concern when divergence would be a defect and its platform inputs can be described as a small port. Keep it native when the operating system owns the interaction, UX conventions differ materially, the API is evolving rapidly, or a shared abstraction would expose most of the underlying platform.

Use a multiplatform library before writing two adapters when it has active maintenance, required targets, acceptable binary and build cost, native escape hatches, testability, and a compatible release cadence. Record why it is replaceable.

## API governance

Minimize the exported Apple framework surface. Prefer feature facades and simple immutable transfer values over exporting every domain type. Keep implementation classes internal. Generate API dumps and reject incompatible changes unless the release plan includes an overlap window. Avoid transitive framework exports because they widen the public surface and binary.
