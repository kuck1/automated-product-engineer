# Architecture and Code Principles for Design-to-App Features

The software produced from a Figma or Claude Design handoff should look like native application code. The design artifact supplies the visual contract, interaction states, copy, and product intent. The application supplies the architecture: existing components and tokens, typed server contracts, authorization, durable persistence, analytics, and operational safeguards.

## Layered shape

```text
Route or page
  -> feature composition
    -> design-system primitives
    -> focused orchestration hooks
      -> typed client/API adapter
        -> authenticated route handler
          -> domain service
            -> database and external providers

Across the stack:
  semantic tokens | types/DTOs | feature flags | analytics | tests | observability
```

Dependencies point inward toward stable contracts. A button should not know about Prisma. A route handler should not render product copy. A reusable component should not own recruiter-specific business rules. The database should not be accessed directly from client components.

## Presentation and design system

The design system owns reusable visual language: semantic colors, typography, spacing, radii, borders, shadows, motion, buttons, inputs, dialogs, pills, menus, row shells, and other primitives. Tokens are named for meaning such as surface, text, border, accent, success, warning, and danger rather than for raw color values.

Reusable components expose typed variants and interaction states. Domain data, routing, permissions, network requests, and mutations stay outside them. Hover, focus, pressed, selected, loading, disabled, warning, and error usually belong to one component contract rather than separate components copied from separate design frames.

A feature component composes these primitives into recruiter-facing UI. It owns feature-specific presentation and receives data and commands through props or hooks. Exact copy and configurable thresholds should live in established copy or configuration modules when they are shared, conditional, or likely to change.

## Page and route composition

The page or route is the assembly boundary. It chooses the server/client rendering shape, obtains initial data, applies access rules, and composes the feature. It should remain readable as an outline of the experience rather than accumulating selection logic, mutation state, formatting rules, and request construction.

Use server rendering for authoritative initial data and access decisions when it fits the route. Use client components for interactions that require browser state. Avoid making an entire page client-rendered merely because one control is interactive.

## Hooks and client state

Hooks own focused orchestration concerns. Good boundaries include selection, filters, saved views, pagination, optimistic favorites, tag mutations, submission, and multi-step navigation. A hook should return observable state and explicit commands; the view should not reach into its internal implementation.

Classify state before implementing it:

- **Local component state:** temporary open/closed, hover-independent UI mode, draft input.
- **URL state:** shareable search, filters, sort, tab, pagination cursor when appropriate.
- **Query cache:** server-owned data and optimistic projections.
- **Database state:** information that must survive refresh, session, device, or teammate access.

Do not let local storage impersonate durable product state. Guard against hydration mismatches when browser-only data is unavoidable. For optimistic mutations, define the cache patch, rollback, server reconciliation, invalidation, and behavior under rapid repeated actions. The latest valid intent should win; an older response must not overwrite it.

## API routes and domain services

Route handlers form a narrow transport boundary. They authenticate, parse and validate input, call a service, and return a typed response with normalized errors. They should not contain large queries or scattered business rules.

Services own domain behavior: authorization and ownership, query shape, transactions, idempotency, concurrency rules, external-provider calls, and DTO construction. Keep these rules together so UI changes cannot bypass them and other entry points can reuse them safely.

APIs should return what the client needs to reconcile state. Mutation responses should distinguish requested records from records actually changed, especially for bulk actions, duplicates, or idempotent operations. Define stable error codes for recoverable product states rather than forcing the UI to parse prose.

## Database and persistence

Add persistence only for durable behavior. Model ownership explicitly, use foreign keys and constrained enums where appropriate, and define uniqueness rules that make retries safe. Migrations should be additive and reversible when possible, avoid unrelated schema churn, and preserve existing data paths.

The server remains authoritative for permissions, eligibility, computed status, and sensitive fields. Client-side hiding is presentation, not security. Multi-step flows should separate intermediate saves from final completion so a refresh or cache invalidation does not make the active experience disappear before its final screen.

## Data contracts and types

Use explicit DTOs at boundaries. Database records, service models, API responses, and component props need not be the same shape. Convert deliberately so internal columns and sensitive data do not leak into the browser.

Represent loading, empty, partial, success, recoverable error, and terminal error deliberately. Avoid optional fields whose meaning is unclear. If absence has several causes, use a discriminated union or explicit status.

## Feature flags, analytics, and errors

A feature flag must gate all feature-specific entry points and supporting endpoints. The disabled path should preserve existing UI, network behavior, and side effects. Flags should not become substitutes for authorization.

Use the application's established analytics helpers and stable event names. Track meaningful product behavior: entry source, viewed step, selected option, primary action, success, dismissal, and failure. Include durable identifiers and useful context while avoiding sensitive data. Keep tracking calls near the action boundary and test important payloads.

Failures should be recoverable. Show what failed, preserve user input, offer retry or a safe exit, and send diagnostic context to established observability tools. Do not expose raw server errors to users.

## Verification architecture

Test each contract at the smallest useful layer:

- component tests for rendering, accessibility, and variants;
- hook tests for transitions, precedence, optimistic updates, rollback, and pagination;
- service and API tests for validation, authorization, ownership, idempotency, and response shape;
- visual tests for approved deterministic desktop and mobile states;
- end-to-end tests for critical cross-layer user outcomes;
- manual QA for real interaction quality, responsive behavior, console errors, and network results.

Fixtures and query controls used for visual verification must be deterministic, restricted to development or test contexts, and unable to mutate production state accidentally.

## What good finished code looks like

A teammate should be able to open the feature and quickly answer: which components render it, which hook controls each interaction, which query supplies the data, which API and service apply the rules, which table persists the result, which analytics events fire, and which tests protect the behavior. Each layer has one clear reason to change, names match product language, existing patterns are reused, and the approved design can be reproduced without reading the original implementation conversation.
