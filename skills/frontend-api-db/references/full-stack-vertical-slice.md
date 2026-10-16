# Full-Stack Vertical Slice

## Contract before code

Define one outcome through every layer:

```ts
type SavePreferenceRequest = {
  version: 1;
  view: "compact" | "comfortable";
};

type SavePreferenceResponse = {
  preference: {
    version: 1;
    view: "compact" | "comfortable";
    updatedAt: string;
  };
};
```

The route authenticates, validates the versioned request, and calls `savePreference(actor, input)`. The service checks ownership, applies idempotent domain rules, writes inside the needed transaction, and returns a DTO. The component never receives a database record.

## Mutation sequence

1. Cancel or distinguish conflicting reads.
2. Snapshot every cache entry affected by the mutation.
3. Apply the newest optimistic intent once.
4. Send a validated request with a cancellation signal when supported.
5. On failure, roll back only the state owned by that mutation.
6. On success, reconcile from the canonical response.
7. Invalidate or refetch aggregates, facets, and related detail queries.

For repeated actions, attach a monotonic mutation identifier or compare intended values so an older response cannot overwrite a newer user choice. On the server, use uniqueness or an idempotency key when duplicate delivery is possible.

## Migration review

- Is the change additive and compatible with the currently deployed application?
- Can old and new application versions run during rollout?
- Are backfill and constraint enforcement separate when existing rows need repair?
- Do foreign keys, uniqueness, indexes, and delete behavior match real access patterns?
- Can the application read safely before every environment is migrated?
- What is the rollback behavior after writes use the new shape?
- Are triggers, jobs, webhooks, reporting queries, or generated clients affected?

Do not create and drop abandoned schema in consecutive production migrations when the branch has not shipped; remove the obsolete migrations and preserve a clean history.

## Focused tests

- request validation and stable error codes;
- unauthenticated, wrong-owner, and wrong-tenant access;
- idempotent retry and duplicate/no-op behavior;
- transaction rollback on partial failure;
- DTO excludes internal or sensitive columns;
- optimistic success, failure rollback, and rapid repeated intent;
- hard-refresh persistence and cross-surface count reconciliation;
- mixed-version migration behavior when relevant.

## Failure UX

Preserve the user's input, state what failed in product language, offer retry or a safe exit, and log diagnostic context through the repository's established observability boundary. Never convert a failed durable write into local-only success.
