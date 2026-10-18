# Pattern Atlas

Use this reference after a repository inspection identifies a concrete situation. Load only the relevant family, validate the signal against callers and tests, and propose the smallest vertical slice that proves the target contract. The typed index lives in `src/patterns/catalog.ts`; framework-light algorithms and focused tests live in `src/patterns/examples/` and `src/patterns/patterns.test.ts`.

## State ownership

### `minimal-derived-state` — Store facts; derive projections

Use for totals, filtered lists, labels, eligibility, or status computed from existing input. Remove Effect-driven synchronization and duplicate stored values. Prove one source change updates every projection.

### `state-owner-by-lifetime` — Choose ownership by lifetime and authority

Use when state crosses components, routes, refreshes, tabs, users, or devices. Assign transient interaction to components, shareable navigation to the URL, stable subtree coordination to Context, remote snapshots to a query cache, and durable truth to services and storage. Define precedence whenever one source hydrates another.

## Async coordination

### `latest-intent-wins` — Reject obsolete reads

Use for search, navigation, inspectors, and dependent selection. Complete query keys, propagate `AbortSignal`, and ignore results whose request token is no longer current. Prove an old slow response cannot replace a newer result.

### `optimistic-canonical-reconcile` — Project, roll back, reconcile

Use when an interaction should feel immediate. Cancel conflicting reads, snapshot the exact prior value, apply one optimistic intent, restore the snapshot on failure, replace it with the canonical response, and invalidate aggregates that cannot be reconstructed safely.

## Durable consistency

### `versioned-idempotent-write` — Make retries and concurrent writers safe

Use expected revision or ETag plus a stable operation ID. Check and write atomically. Duplicate replay returns its original canonical result; stale new work returns a conflict with recovery.

### `offline-outbox` — Distinguish saved here from confirmed there

Use durable queued operations with identity, expected revision, and visible queued, syncing, confirmed, conflicted, and failed states. Do not remove an entry until canonical confirmation. Prove termination recovery and second-device conflict.

### `compensated-workflow` — Repair explicit partial failure

Use when one product action spans systems that cannot share a transaction. Record completed steps, make compensations idempotent, run them in reverse, and expose manual repair when recovery cannot finish.

## Distributed UI

### `realtime-echo-dedupe` — Reconcile three copies of one intent

Use a client nonce to replace an optimistic row with mutation and realtime results. Order by server values and backfill gaps after reconnect. Keep typing and cursor presence transient.

### `cross-tab-coordination` — Broadcast hints; elect one local worker

Update the sender directly, send validated invalidation hints to peers, and refetch canonical state. Use an expiring Web Lock or lease for origin-local singleton work. It never replaces database concurrency.

### Collaborative documents

Combine local responsive editing, idempotent operations, transient presence, and versioned checkpoints. Choose an OT, CRDT, or explicit locking protocol based on offline collaboration and merge requirements; do not simulate collaboration with whole-document last-write-wins updates.

## Identity and trust

### `identity-scoped-cache` — Clear sensitive projections on identity change

Include actor and tenant boundaries in keys, cancel in-flight reads, and remove protected snapshots at logout or workspace change. On native platforms, keep credentials in secure storage and treat the server session as authority.

### `object-tenant-authorization` — Verify actor, object, tenant, and action

Resolve identity on the server. Check membership and permission for the specific resource and action, return minimal DTOs, and repeat isolation with database grants and RLS. Prove signed-out, cross-tenant, cross-object, wrong-role, and revoked-access cases.

### `webhook-inbox` — Verify then deduplicate external events

Verify the raw payload and timestamp before trusting parsed input. Store a unique event receipt before effects, acknowledge safely, and process idempotently with visible status. Prove bad signature, duplicate delivery, timeout, and out-of-order related events.

## Long-running work

### `durable-job-state-machine` — Give work a lifecycle

Represent queued, running, succeeded, failed, cancelling, and cancelled states in durable storage. Include attempts, progress, terminal output, worker leases, and retry classification. A single long HTTP request is not a job model.

### `resumable-upload` — Advance confirmed checkpoints

Create a server-issued upload session, validate file intent, persist committed offsets or parts, verify checksums, and finalize idempotently. Client bytes-sent progress is a projection, not confirmation.

### `rate-limit-backoff` — Retry only transient failures

Honor `Retry-After`, use bounded exponential delay with jitter, cap attempts, and stop on permanent errors. Give the user a visible pending, retrying, or failed state and a cancellation path.

## Delivery controls

### `server-enforced-feature-flag` — Gate authority and presentation

Evaluate the capability with actor and tenant context at the server-owned action. Send the client a presentation hint, log decisions, define compatibility and rollback, and remove the flag after rollout. Hiding a button does not disable a capability.

## Product infrastructure

### `governed-component-contract` — Package recurring product behavior

Extract repeated behavior, semantic token roles, typed variants, interaction states, compact layouts, keyboard behavior, and usage guidance. Avoid styling-only card collections and open-ended boolean prop combinations.

## Evidence

### `evidence-follows-owner` — Prove invariants where they live

Map each rule to the narrowest useful test: policy at the service, validation at transport, optimistic transitions at the query boundary, and one failure or recovery journey in a real browser or device. Inspect visual diffs rather than accepting snapshots automatically.

## Recommendation card

For any selected entry, return:

- **Product effect:** what becomes safer, clearer, or easier.
- **Current evidence:** exact files, callers, tests, and reproduced behavior.
- **Preserve:** strong adjacent behavior that must remain.
- **Pattern:** stable atlas ID and owning boundary.
- **Anti-pattern removed:** the concrete mechanism being replaced.
- **Slice:** the smallest end-to-end implementation.
- **Proof:** focused invariant plus integrated failure or recovery.
- **Compatibility and rollback:** mixed versions, migration, and exit path.

