# Persistence, lifecycle, and capabilities

## Choose storage by contract

Use `UserDefaults` for small nonsecret preferences, not tokens or domain records. Use Keychain for small secrets. Use SwiftData or Core Data when objects, relationships, queries, migrations, and offline editing justify a database. Use files for large opaque documents with an explicit atomic-write and coordination strategy. Hide storage behind a protocol and isolate mutation through an actor or model context boundary.

Every durable model needs versioning, migration, recovery, backup/sync classification, account scope, retention, and deletion behavior. If CloudKit participates, design conflict and account-change behavior before enabling it.

## Offline work

Persist an operation with stable ID, actor and tenant, entity ID, expected revision, payload, creation time, attempt state, and last error. Show queued, syncing, conflicted, failed, and confirmed honestly. Reconnect is a hint to drain; it is not proof of success. Remove work only after canonical confirmation. Support sign-out decisions for queued work that belongs to the outgoing account.

## Lifecycle

Use scene phase and system event APIs to reconcile state, not to assume continuous execution. On foreground, refresh time-sensitive snapshots and credentials through deduplicated coordinators. On background, persist bounded local intent and schedule only eligible work. On termination, rely on durable state rather than cleanup callbacks.

Background tasks are opportunistic. Register identifiers, set permitted identifiers, submit within system policy, honor expiration, make work resumable and idempotent, and expose the last confirmed result in the UI.

## Capability contract

For camera, photos, microphone, location, Bluetooth, notifications, contacts, health, background modes, app groups, widgets, or extensions, record: purpose; system permission; Info.plist usage string; entitlement; target membership; unavailable and denied UX; Settings recovery; simulator limitation; physical-device proof; data retention; privacy manifest; and App Store disclosure.

Ask only in context, immediately before value. Distinguish not determined, denied, restricted, limited, provisional, unavailable, and authorized states. The feature must remain navigable when access is denied.

Notifications route through typed destinations after identity and authorization checks. Widgets and extensions share the smallest possible data contract through an app group and must tolerate stale or missing data.
