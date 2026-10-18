# Adoption and debugging

## First slice

Choose a feature with meaningful policy, at least one stale or conflicting write, and visible recovery. Document accepted behavior, freeze vectors, and wrap current implementations before moving code.

1. Inventory current Next.js, Android, iOS, server, and documentation behavior.
2. Mark differences as defect, platform necessity, intentional product difference, or unknown.
3. Create the capsule and generate projections without changing behavior.
4. Make every current implementation replay the vector oracle.
5. Introduce the KMP kernel for Android and iOS behind existing interfaces.
6. Replace web policy with the generated TypeScript runtime.
7. Enable receipt comparison, then migrate one feature at a time.

## Debug order

When outputs diverge, inspect in this order:

1. capsule and vector digests;
2. normalized identity, locale, time zone, clock, numeric units, and input order;
3. serialization defaults, nullability, enum and unknown-value handling;
4. guard ordering and error precedence;
5. optimistic versus canonical state;
6. caching, replay, idempotency, and stale revisions;
7. platform adapters and lifecycle restoration.

Capture the mismatch as a new vector before fixing it. Update the capsule when the product decision was underspecified; update one runtime when its implementation was wrong.
