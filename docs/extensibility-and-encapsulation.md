# Encapsulation and Extension over Modification

Good product code makes common changes local. A new visual variant should not require edits to routing and persistence. A new provider should not add branches across pages, hooks, and services. Encapsulation keeps implementation details inside their owner; extension over modification lets new behavior implement a stable contract and enter through one composition boundary.

## Define feature boundaries

A feature module should expose a deliberately small surface:

```text
features/review/
  index.ts                  public exports only
  review.types.ts           public view and command contracts
  review-view.tsx           feature composition
  internal/
    use-review-controller.ts
    review-api-adapter.ts
    review-copy.ts
```

Consumers import from `features/review`, not its `internal` directory. The public contract describes observable state and commands. Internal hooks may change from fetch to a query library, or from local state to URL state, without forcing view consumers to change.

Apply the same rule server-side. Route handlers depend on a service contract. Services depend on repository and provider contracts. Infrastructure implements those contracts at the composition root.

## Choose the right extension mechanism

Use a mechanism that matches the kind of variation:

| Variation | Preferred mechanism | Example |
| --- | --- | --- |
| Visual state | typed variant or slot | `tone: "neutral" | "warning"` |
| Domain algorithm | strategy interface | rank roles by recency or location |
| External system | adapter | email, storage, analytics provider |
| Feature-specific renderer | validated registry | activity type to row renderer |
| Application assembly | composition root | choose production versus test provider |
| Product copy | keyed catalog | state-specific message templates |

A registry should be closed to unvalidated keys and arbitrary runtime code. Give it a constrained key type, a defined fallback, and tests proving registration and default behavior. A strategy should accept a domain DTO rather than database rows or browser state.

## Extend without scattering branches

Avoid adding the same feature check in a page, hook, API route, service, and component. Put the decision at the narrowest authoritative boundary. Examples:

- A page chooses one controller implementation; the view consumes one controller contract.
- A service selects a matching strategy; the route still calls one service method.
- A design-system component maps a typed variant to tokens; feature screens do not duplicate its styles.
- An analytics adapter receives a stable event contract; feature code does not know vendor SDK details.

Feature flags still gate every entry point that can activate the behavior. Keep flag evaluation near composition and authorization near the server authority; do not thread vendor-specific flag clients through reusable components.

## Preserve invariants

Extensibility must not weaken product rules. Enforce authorization, confidentiality, eligibility, idempotency, and data ownership in services before any replaceable provider runs. An extension receives only the data it is allowed to use and returns a validated result.

Use discriminated unions for meaningful states and exhaustive checks at the owner boundary. Avoid boolean combinations whose invalid states leak into callers.

## Avoid premature abstraction

Extension over modification is not a request for a framework around every function. Add an abstraction when:

- two real implementations already share a stable responsibility;
- a known integration must be replaceable;
- a design-system variant is supported across several consumers; or
- testing requires a controlled boundary around time, network, storage, or a vendor.

Keep direct code when there is only one simple behavior and no stable axis of variation. A small local edit is safer than a generic registry whose future callers are imaginary.

## Review checklist

- Can the feature's public API be named in one sentence?
- Are internal modules imported only by their owner?
- Can a supported variant be added in one implementation and one registration point?
- Do extensions receive narrow DTOs rather than database or framework objects?
- Are security and product invariants enforced before replaceable behavior?
- Is the default implementation obvious and tested?
- Would removing one extension leave the others unchanged?
- Does the abstraction correspond to observed variation rather than speculation?
