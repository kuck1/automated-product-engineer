# State, synchronization, and authentication

## Feature store

A shared feature accepts typed intent and publishes immutable state. It owns business transitions, request overlap policy, optimistic projections, rollback, and reconciliation. The native shell owns lifecycle subscription, navigation, local UI-element state, and presentation. Do not export mutable flows or permit native code to edit state directly.

Every asynchronous command declares:

- identity and tenant scope;
- stable operation ID and expected revision;
- cancellation and supersession behavior;
- offline eligibility and durability;
- retry classification and maximum persistence;
- canonical success, conflict, rejection, and unknown-outcome handling.

## Persistence and sync

Repository ports separate domain rules from storage. A shared database may own schema, migrations, queries, cache, and outbox if both platforms need identical behavior. Platform builders supply paths, encryption material, and lifecycle integration. A platform scheduler wakes shared sync logic; the scheduler does not contain product policy.

Use server time and revisions for shared records. A realtime event is a hint to reconcile canonical data, not a second state authority. Outbox records include subject, tenant, operation ID, aggregate, expected revision, payload version, attempts, next attempt, and terminal reason. Identity changes quarantine or delete the previous subject's cache and queue.

## Authentication

The shared state machine owns signed-out, authenticating, signed-in, refreshing, expired, revoked, and recoverable states plus single-flight refresh coordination. Platform shells own Credential Manager, AuthenticationServices, passkeys, browser sessions, keychain or keystore access, callback URLs, and app-link routing. The backend verifies provider results and issues the product session.

Store only the minimum renewable credential material in secure platform storage. Scope database rows, caches, workers, analytics identity, and pending operations to the verified backend subject. On logout or subject change, cancel work, clear memory, close streams, rotate repositories, and remove protected persisted state before presenting another account.
