# Feature Boundaries and Extension Review

## Trace the existing system first

Build a responsibility map before proposing files:

| Concern | Current owner | Authority | Consumers | Failure mode |
| --- | --- | --- | --- | --- |
| visible state | component or controller | browser or URL | view | stale or invalid combination |
| fetched data | query adapter | server | controller | stale response or partial failure |
| mutation policy | domain service | server | route or job | unauthorized or non-idempotent write |
| durable invariant | database | database | service | duplicate or orphaned data |
| external delivery | provider adapter | external system | service or job | timeout, replay, or drift |

Inspect adjacent features before inventing a new shape. Record why an established pattern does or does not fit.

## Reference vertical slice

```text
app/example/page.tsx                  route composition and initial access
features/example/index.ts             public feature exports
features/example/example.types.ts     view state and command contract
features/example/example-view.tsx     presentation composition
features/example/internal/
  use-example-controller.ts           interaction orchestration
  example-client.ts                   typed transport adapter
app/api/example/route.ts              authenticate, validate, delegate
server/example/example-service.ts     policy, transaction, DTO construction
server/example/example-repository.ts  database implementation
```

The page imports the feature's public index. The view receives state and commands. The controller depends on a typed client. The route calls a service. The service enforces policy before calling repositories or providers.

## Extension test

For every proposed abstraction, name the real variation:

- visual variants use enum-backed recipes or typed slots;
- domain algorithms use strategies with domain DTOs;
- vendors use adapters selected at the composition root;
- renderers use constrained registries with an explicit fallback;
- time, randomness, storage, and network use injectable boundaries when deterministic testing needs them.

Reject an extension point when it has only one simple implementation, leaks framework objects, weakens invariants, or requires callers to know internal sequencing.

## Race and state audit

For each asynchronous interaction, answer:

1. What uniquely identifies the request and affected resource?
2. Can a newer intent start before the older one resolves?
3. Which result wins, and how is an older result prevented from overwriting it?
4. What optimistic state is captured and rolled back?
5. What happens on navigation, unmount, retry, and duplicate submission?
6. Which server invariant makes a retry safe?

Use abort signals where cancellation is meaningful, request or mutation identifiers for latest-intent reconciliation, and server idempotency for repeated writes. Do not treat a disabled button as the only concurrency guarantee.

## Architecture decision output

Record the accepted stories, current shape, proposed ownership, data/state flow, extension points, rejected alternatives, migration or compatibility plan, failure behavior, test seams, rollout, rollback, and PR decomposition. Keep refactors tied to a measured failure or required capability.
