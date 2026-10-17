# Reference App Architecture

This document is the implementation contract for the two reference applications in `/examples`. The same material appears in the application’s interactive Behind the scenes section, including real source excerpts and a layer-by-layer explorer.

## What the reference demonstrates

The repository contains two deliberately different product surfaces over one architecture:

- **Release Readiness** is a policy control tower. It presents releases as a compact gate matrix, calculates readiness, requires approvals, and rejects unsafe transitions.
- **Customer Onboarding Operations** is a spatial journey board. It groups accounts by lifecycle stage and combines milestones, adoption, and relationship recency into customer health.

They reuse contracts, services, repository ports, adapters, authentication, and remote-state orchestration. They do not reuse a generic feature-card composition. Shared architecture should make products coherent without making every product look the same.

## Runtime map

| Layer | Current owner | Responsibility | Must not own |
| --- | --- | --- | --- |
| Route composition | `app/examples/page.tsx` | Load the initial snapshot and mount providers | Transition policy or database records |
| Interaction | `src/examples/example-workspace.tsx` | Navigation, transient notices, product-specific composition | Authorization or persistence |
| Server cache | TanStack Query inside `ExampleWorkspace` | Remote snapshot, optimistic updates, rollback, canonical reconciliation | Durable authority |
| Transport | `app/api/examples/**/route.ts` | Authenticate, parse Zod input, delegate, normalize errors | Business decisions |
| Domain | `src/examples/service.ts` | Ownership, valid transitions, readiness and launch policy, concurrency | HTTP or vendor-specific records |
| Persistence port | `src/examples/repository.ts` | Domain-shaped read/write capability | Supabase implementation details |
| Adapters | `src/examples/adapters/` | Translate memory or Supabase storage into domain records | UI behavior or workflow policy |
| Authentication | `src/server/auth/actor.ts` | Resolve the server actor and workspace boundary | Client-provided identity |
| Composition root | `src/examples/container.ts` | Select one repository implementation and construct the service | Feature behavior |

The dependency direction is always inward:

```text
UI → HTTP contract → service policy → repository port ← adapter
                         ↑
                    authenticated actor
```

Pages never import Supabase. Route handlers never decide whether a release is safe. Services never return vendor-specific rows. Adapters never know which button the user clicked.

## A mutation from click to persistence

Every release and onboarding transition follows the same six-step protocol.

1. **Intent:** A typed product control emits a requested next stage.
2. **Optimistic cache:** TanStack Query cancels overlapping reads, snapshots the current data, and applies the likely result.
3. **Transport boundary:** The route resolves the server actor and validates `stage` plus `expectedRevision` with Zod.
4. **Domain policy:** `ExampleService` checks workspace ownership, stale revisions, the transition map, and stage-specific gates.
5. **Versioned persistence:** The selected adapter writes the next domain record through `ExampleRepository`.
6. **Reconciliation:** The canonical response replaces optimistic state. A domain error restores the snapshot and becomes visible failure UX.

The optimistic UI is a latency technique, not an authority boundary. Every rule is repeated on the server.

## Contracts and concurrency

`src/examples/contracts.ts` owns the public enums, Zod schemas, DTO shapes, update commands, actor, and normalized domain error codes. A mutation carries `expectedRevision`; the service rejects a stale command with `409 CONFLICT` before saving. This prevents a background refresh or another collaborator from being silently overwritten.

The UI may hide impossible actions, but the service owns the canonical transition maps:

```text
release:    building ↔ validating ↔ ready
                 ↘ blocked ↗

onboarding: discovery → configuring → training → live
                    ↘ at risk ↗
```

Moving a release to `ready` also requires every required gate and the configured approval count. Moving an onboarding to `live` requires all milestones and at least 50% weekly adoption.

## State ownership

| State class | Examples | Owner | Why |
| --- | --- | --- | --- |
| Local UI | active developer-guide layer, transient notice | React component | Ephemeral and private to one mounted surface |
| Navigation | selected reference app or guide | URL search params | Must survive browser history and be shareable |
| Server cache | release and onboarding DTO snapshots | TanStack Query | Remote data with loading, mutation, and reconciliation semantics |
| Durable | stages, gates, milestones, revisions, workspace ownership | repository adapter | Must survive refresh and coordinate collaborators |
| External authority | authenticated user and workspace membership | server auth boundary | Must never be accepted from arbitrary client input |

Do not mirror the query snapshot in local component state. Do not put transient panel state into the database. Persist only what must survive refresh, session, device, or collaboration.

## Authentication and tenant isolation

The public demo resolves one deterministic server actor. A production integration replaces that resolver with the authenticated session while preserving the `Actor` contract. The client never sends an actor ID as proof of identity.

The service compares `actor.workspaceId` with every loaded record before applying policy. The Supabase adapter is paired with row-level security so tenant isolation is repeated below the application layer. Service authorization remains necessary because not every future adapter is guaranteed to be Postgres with RLS.

## Persistence adapters

`MemoryExampleRepository` supplies deterministic fixtures for the public demo, unit tests, screenshots, and local exploration. `SupabaseExampleRepository` translates database rows into validated domain objects. Both implement `ExampleRepository`, and `src/examples/container.ts` chooses one implementation at the composition boundary.

This is extension over modification: a future API, SQLite database, or event-backed implementation adds an adapter instead of rewriting services and UI.

## Product-specific composition

The two reference applications share behavior contracts but own their visual grammar:

- Release Readiness optimizes comparison across policy dimensions. A dense table makes gates, approvals, score, and next decision visible in one row.
- Onboarding Operations optimizes movement through time. A horizontally scrollable journey board makes stage, customer health, adoption, milestones, and intervention visible spatially.

Do not extract a universal “record card” merely because both surfaces contain records. Extract a component only when two real consumers share stable semantics, accessibility, and interaction—not just similar rectangles.

## Extension recipes

### Add a workflow stage

1. Extend the relevant Zod enum in `contracts.ts`.
2. Extend the transition map in `service.ts`.
3. Add stage-specific policy beside the transition policy.
4. Add the product control and visual treatment in `example-workspace.tsx`.
5. Test an accepted path and at least one rejected path.

### Add a persistence implementation

1. Implement `ExampleRepository` in a new adapter.
2. Validate translated records at the adapter boundary.
3. Select the adapter in `container.ts`.
4. Test tenant isolation, conflicts, and error normalization.

### Add another product surface

1. Define or extend typed contracts.
2. Put policy in a domain service.
3. Add a repository capability only when durable state requires it.
4. Give the product its own information hierarchy and interaction model.
5. Reuse semantic tokens and primitives without copying the layout of an existing app.

### Add a visual variant

Extend a typed recipe in `src/ui/recipes.ts` or a semantic preset in `src/ui/tokens.ts`. Avoid one-off colors, arbitrary radii, and central conditionals that grow for each feature.

## Failure behavior

- Validation failures return a normalized error without calling the service.
- Unauthorized records return `403`.
- Stale revisions return `409` and tell the user to refresh.
- Invalid transitions and incomplete policy return `422`.
- Optimistic UI always restores its captured snapshot after failure.
- Successful responses replace optimistic data with the canonical server DTO.
- Reset affects deterministic demo state only and can be disabled with `EXAMPLES_ALLOW_RESET=false`.

## Verification contract

| Layer | Evidence |
| --- | --- |
| Domain | transitions, scoring, authorization, stale writes, and launch/readiness gates |
| Transport | Zod rejection and normalized domain errors |
| Browser | optimistic rollback, canonical reconciliation, URL history, and keyboard behavior |
| Visual | reviewed desktop and mobile baselines with deterministic fixtures |
| Responsive | no page-level overflow; intentional boards and code regions scroll locally |
| Delivery | content validation, unit tests, typecheck, lint, build, browser CI, and preview deployment |

Visual baselines are evidence, not approvals. Inspect every diff and classify it as a defect, intended design change, stale fixture, platform variation, or infrastructure failure before updating a snapshot.

## Definition of done for a vertical slice

A complete slice has a typed contract, a thin authenticated route, server-owned policy, a repository port and adapter, explicit client-state ownership, accessible failure UX, focused domain coverage, a browser path, reviewed desktop/mobile evidence, green CI, and a pull request that explains behavior and safety.
