# State, offline work, and realtime

## Ownership matrix

| State | Owner | Examples |
| --- | --- | --- |
| transient interaction | component or reducer | pressed state, draft input, open sheet |
| navigation | router | selected record, shareable filter, modal route |
| remote snapshot | query cache | lists, profiles, unread counts, server aggregates |
| small sensitive value | secure storage | refresh credential or device-bound secret when required |
| substantial offline data | local database | queued field work, documents, message history |
| durable multi-user truth | server/database | permissions, balances, membership, canonical revisions |
| live transport | subscription adapter | presence, message delivery, invalidation hints |

Context distributes stable app-wide dependencies and UI policy. It is not a replacement for a query cache, local database, or server authority.

## Mutation contract

Every durable mutation should define:

- a client-generated idempotency key;
- the expected version or conflict rule;
- optimistic intent and exact rollback snapshot;
- durable queue representation if offline writes are supported;
- retry ownership and backoff;
- canonical server response and all affected cache keys;
- what happens when the app backgrounds, is terminated, or reconnects;
- how a second device or collaborator's update is reconciled.

Do not report success merely because a write entered a local queue. Distinguish `saved on device`, `syncing`, `confirmed`, `conflicted`, and `failed` when those states change user decisions.

## Realtime is a hint, durable reads are truth

Key subscriptions by authenticated workspace and visible entity. Unsubscribe on scope changes and sign-out. On reconnect, refetch a canonical cursor or revision range before accepting new live events. Deduplicate by event or operation ID. Never allow a late subscription or request from a previous account, route, or filter to repaint the current screen.

## Scenarios that must be exercised

- a top-bar aggregate updates after mutation on a nested screen;
- a rapid selection race does not paint the previous record;
- the same record is edited on two devices and one receives a conflict;
- a chat message is queued offline, retried once, and deduplicated;
- a collaborative document merges independent operations and exposes true conflicts;
- sign-out clears identity-scoped caches and subscriptions;
- reconnect after a long background interval refreshes before applying live events.

For server-cache mechanics and durable policy, also use `frontend-api-db` and its state-management reference.
