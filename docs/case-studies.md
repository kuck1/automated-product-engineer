# Reference Case Studies

The example section contains two applications with enough policy and state to demonstrate production boundaries. They share the same UI recipes, query client, authentication contract, service pattern, repository interface, Supabase migration, and failure-response shape. Their business rules remain separate.

## Case study 1: Release Readiness

**Outcome:** help a product team decide whether a release is safe to ship.

The release model includes required and optional gates, approvals, target dates, owner, stage, and a revision for optimistic concurrency. The service owns the transition map. A release can move from validation to ready only when every required gate passes and the approval threshold is met. The repository update includes the expected revision so a second browser cannot silently overwrite a newer decision.

Explore the implementation:

- UI and optimistic rollback: [`src/examples/example-workspace.tsx`](../src/examples/example-workspace.tsx)
- contracts and validation: [`src/examples/contracts.ts`](../src/examples/contracts.ts)
- readiness policy and transitions: [`src/examples/service.ts`](../src/examples/service.ts)
- thin API mutation: [`app/api/examples/releases/[id]/route.ts`](../app/api/examples/releases/%5Bid%5D/route.ts)
- persistence contract: [`src/examples/repository.ts`](../src/examples/repository.ts)
- concurrency and authorization tests: [`src/examples/service.test.ts`](../src/examples/service.test.ts)

Try marking **Mobile checkout refresh** ready. The client projects the intent immediately, the service rejects it because security review is still pending, and the client rolls back to the canonical stage while preserving a useful error.

## Case study 2: Customer Onboarding Operations

**Outcome:** help a customer-success team prioritize implementations and protect launch quality.

The onboarding model includes plan, seat count, weekly active users, contact recency, target launch, milestones, stage, and revision. Health combines milestone completion, adoption, and contact recency. Going live requires every milestone plus at least 50% weekly adoption. This policy stays on the server even though the UI displays the same evidence.

Explore the implementation:

- responsive operations view: [`src/examples/example-workspace.tsx`](../src/examples/example-workspace.tsx)
- health and launch policy: [`src/examples/service.ts`](../src/examples/service.ts)
- thin API mutation: [`app/api/examples/onboardings/[id]/route.ts`](../app/api/examples/onboardings/%5Bid%5D/route.ts)
- deterministic fixtures: [`src/examples/fixtures.ts`](../src/examples/fixtures.ts)
- Supabase adapter: [`src/examples/adapters/supabase-repository.ts`](../src/examples/adapters/supabase-repository.ts)

Move **Northstar Health** into training, then use browser back/forward. The URL owns the selected app while TanStack Query owns server records and the service owns transition validity.

## Shared architecture lessons

| Concern | Concrete example |
| --- | --- |
| Component state | transient notice and pending presentation |
| URL state | selected case-study view |
| Server cache | `ExampleSnapshot` in TanStack Query |
| Optimistic state | stage projection, scoped rollback, canonical reconciliation |
| API boundary | authenticated and Zod-validated route handlers |
| Domain policy | transition, gate, adoption, and tenant rules in `ExampleService` |
| Persistence | `ExampleRepository` with memory and Supabase adapters |
| Database authority | constraints, indexes, foreign keys, and RLS in the migration |
| Race safety | monotonic revision and conditional update |
| QA | policy units, browser journeys, responsive overflow, visual baselines |

## Demo and production modes

The public site uses a fixed synthetic actor and a process-local repository. That keeps screenshots deterministic and prevents a public example from collecting user data. A consuming app should create a Supabase client from its verified user session, resolve workspace membership on the server, and construct `SupabaseExampleRepository` with that authenticated client. Row-level security remains a second boundary; it does not replace service authorization.
