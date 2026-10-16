# Reference App Architecture

## Product contract

The public site demonstrates the repository's product-engineering workflow without recreating Auto's editor or intermediate-representation tooling. A visitor should understand the product in the first viewport, open a realistic delivery workspace, change a feature's stage, filter the work, and see where every layer lives in the repository.

The hero animation tells one deterministic story:

1. Figma, Claude Design, or a product brief enters as source context.
2. Semantic tokens and typed component contracts are derived.
3. A vertical slice crosses UI, API, service, and repository boundaries.
4. Responsive and visual QA produces evidence.
5. A clean draft PR is the output.

The animation freezes in its complete state for reduced-motion users.

## Layer ownership

| Layer | Owner | Examples |
| --- | --- | --- |
| Route composition | `app/` | public landing page, workspace page, route handlers |
| Feature contract | `src/features/delivery/contract.ts` | DTOs, enums, validation schemas |
| Feature UI | `src/features/delivery/components/` | board, filters, delivery cards |
| UI orchestration | `src/features/delivery/use-delivery-controller.ts` | URL filter state, local panel state, query/mutation coordination |
| Reusable UI | `src/ui/` | buttons, badges, segmented controls, surface recipes |
| Server policy | `src/features/delivery/server/service.ts` | actor/workspace access, valid transitions, canonical DTOs |
| Persistence boundary | `src/features/delivery/server/repository.ts` | repository interface and database-safe records |
| Adapters | `src/features/delivery/server/adapters/` | deterministic demo repository and optional Supabase repository |
| Authentication | `src/server/auth/` | demo actor and Supabase-ready bearer session boundary |

Pages do not call the database. Components do not know transport or database record shapes. Route handlers authenticate, validate, delegate, and normalize responses.

## State ownership

- **Local UI state:** open detail panel and transient animation controls.
- **Navigation state:** selected filter and selected delivery, represented in the URL.
- **Server cache:** workspace and delivery DTOs, owned by TanStack Query.
- **Durable state:** delivery stage and user view preference, owned by the repository.
- **External authority:** authentication identity, resolved before service calls.

Mutations are optimistic, snapshot the relevant query, roll back on failure, and reconcile with the canonical service response. Stage transitions use a monotonic `revision` so stale writes cannot silently overwrite newer intent.

## Extension points

- New delivery stages extend a typed enum plus the transition map.
- New persistence targets implement `DeliveryRepository` and are selected at one composition boundary.
- New visual tones extend typed recipes in `src/ui/recipes.ts`.
- New source types extend the hero source registry rather than branching through the page.

## Data and auth

The deployed public demo uses a deterministic, isolated demo actor and in-memory adapter. Supplying Supabase environment variables switches the same services to the Supabase adapter. The SQL migration enables row-level security and scopes records by workspace membership. Demo mode is explicit and never accepts arbitrary actor IDs from the client.

## Verification contract

- Unit tests cover transition policy, authorization, and DTO boundaries.
- Component tests cover filter and state controls.
- Playwright covers the public-to-workspace journey and deterministic desktop/mobile screenshots.
- CI runs validation, unit tests, typecheck, lint, build, and focused browser checks.
- Manual QA covers keyboard navigation, reduced motion, responsive overflow, retry behavior, back/forward state, and console/network errors.

