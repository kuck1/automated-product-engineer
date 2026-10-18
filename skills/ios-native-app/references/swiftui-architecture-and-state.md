# SwiftUI architecture, state, and concurrency

## State owner matrix

| State | Owner | Examples |
| --- | --- | --- |
| transient presentation | nearest `View` with `@State` | focus, selected segment, draft disclosure |
| child edit access | `@Binding` or `@Bindable` | form field editing |
| feature coordination | `@Observable @MainActor` model owned with `@State` | load phase, intent, error recovery |
| navigation | typed route values at the scene or feature lifetime | stack path, sheet item, selected tab |
| remote snapshot | actor-backed client/repository plus feature projection | profile, messages, points |
| durable local work | SwiftData/Core Data/file actor or repository | drafts, offline operations |
| secrets | Keychain adapter | refresh credential, device key |
| cross-user policy | server | authorization, price, entitlement, revision |

Environment injection is appropriate for stable capabilities shared down a subtree. It is not a license for an unbounded mutable global. Store facts and derive projections. Include account and workspace identity in cache keys.

## Observation

Use `@Observable` for reference models when the deployment target supports Observation. Own a model with `@State` when the view controls its lifetime; inject long-lived dependencies from the app or scene. Mark UI models `@MainActor`. Keep network, database, and synchronization work in isolated collaborators rather than expanding the model into a god object.

For older deployment targets, preserve an established `ObservableObject` contract. Migrate feature by feature and test lifetime behavior; do not mix wrappers mechanically.

## Navigation and scenes

Use lightweight, `Hashable` route values. A route identifies a destination; the destination queries its current data. Keep independent paths for independent scenes or columns. Decide which route state restores after termination and which must reset after logout. Validate universal links at cold launch and while another scene is active.

## Swift concurrency

- Turn on complete checking while still in Swift 5 mode, resolve warnings by ownership, then opt targets into Swift 6.
- Actors protect mutable shared resources. `@MainActor` protects UI state. Neither replaces server concurrency control.
- Values crossing isolation boundaries are immutable `Sendable` snapshots or explicit transfer objects.
- Keep unstructured tasks owned and cancellable. `.task(id:)` is useful when work follows view identity; services should still accept cancellation.
- Never use `Task.detached` to silence isolation errors. Never mark a mutable reference `@unchecked Sendable` without a documented synchronization proof.

## Races worth proving

1. A slower obsolete search cannot replace a newer result.
2. Two scenes editing one object produce a version conflict instead of silent overwrite.
3. Retried writes reuse an operation ID and return the first canonical result.
4. Optimistic rows reconcile with both mutation response and realtime echo.
5. Logout cancels reads and clears identity-scoped projections before the next account appears.
6. An offline operation survives termination and remains visibly queued until canonical confirmation.

The executable examples under `ios/examples` cover versioned replay, outbox recovery, and identity-scoped cache cleanup without coupling them to one UI framework.
