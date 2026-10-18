# Persistence, lifecycle, and capabilities

## Choose the persistence owner

- Use DataStore for small preference or typed configuration datasets that change transactionally as a whole.
- Use Room for structured records, partial updates, relationships, indexed queries, migrations, and offline application state.
- Use files for user-owned documents or large blobs with explicit lifecycle and backup policy.
- Use Android Keystore for cryptographic keys, not general application data.
- Use the backend for shared truth, authorization, audit, and cross-device conflict resolution.

Expose the local source of truth as Flow and let synchronization update it. The UI should not merge arbitrary remote and local copies. Every schema migration needs forward migration, fixture coverage, failure behavior, and backup/restore implications.

## Durable outbox

Persist an operation before showing it as safely queued. Store operation ID, authenticated subject, aggregate ID, expected revision, normalized payload, attempt count, next attempt, creation time, and terminal error. Enqueue unique WorkManager work. On execution, recheck identity, send the idempotent request, persist the canonical response and outbox deletion in one transaction, and surface conflicts for user resolution.

Do not use WorkManager as a real-time loop. Use it for deferrable work that must survive process death. Foreground services require an immediate user-visible purpose and notification. Ordinary coroutines are for work that can end with its owner.

## Lifecycle and restoration

Model process recreation as normal. On cold launch, establish identity, open the identity-scoped store, reconcile durable work, then expose screen state. Do not rely on `Application` or activity instances as mutable global state. Save only enough UI input to reconstruct a screen.

Notifications, widgets, shortcuts, App Links, and shares are independent entry points. Parse them into typed intent, validate authorization and current data, then navigate. Deduplicate repeated delivery.

## Permission and capability contract

For every camera, location, microphone, notification, Bluetooth, health, media, or background feature, record:

- user value and point of request;
- manifest permission or feature declaration;
- runtime states: not asked, granted, denied, permanently denied, restricted/unavailable;
- fallback and settings recovery;
- approximate versus precise and foreground versus background distinctions;
- data collection, retention, deletion, and Data safety disclosure;
- emulator limitation and required physical-device proof;
- module, owner, monitoring, and release gate.

Ask in context and only when the feature needs it. A permission denial must leave the app coherent. Recheck after returning from Settings and when the OS can revoke access.

## Realtime and multi-client data

Treat realtime messages as invalidation or canonical updates, not authorization. Use versions and sequence numbers, reconnect from a durable cursor when needed, deduplicate delivery, and refresh gaps. A document editor needs operation or CRDT semantics chosen by the backend; a chat needs stable client IDs, send states, pagination, retry, edit/delete policy, and ordering rules. Room can project these states locally, but the server resolves shared truth.
