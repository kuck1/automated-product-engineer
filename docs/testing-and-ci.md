# Testing and CI Architecture

The goal is fast feedback at the responsible layer, followed by a small number of high-value cross-layer checks.

## Test pyramid for product UI

### Static contracts

Run formatting, Markdown link checks, token-schema validation, generated-artifact drift checks, lint, and TypeScript. These should fail quickly and produce precise diagnostics.

### Component tests

Verify accessible names, roles, keyboard behavior, focus, supported variants, boundary copy, and callbacks. Avoid retesting CSS framework internals.

### Hook and controller tests

Cover initial state, transitions, reset, URL/default precedence, optimistic patches, rollback, stale responses, rapid toggles, pagination, and mutation error normalization.

### Service and API tests

Cover validation, authentication, authorization, ownership, idempotency, transactions, duplicate/no-op behavior, and DTO shape. Include negative tests for cross-user access and privileged-role assumptions.

### Visual tests

Capture the smallest useful surfaces plus a few page-level compositions. Fixtures must be deterministic. Use exact viewports, stable fonts, fixed clocks, predictable data, and disabled nondeterministic animation. Inspect diffs; never raise thresholds merely to make a defect pass.

### End-to-end tests

Protect critical outcomes that cross routing, API, persistence, and UI. Prefer a small set of durable journeys over duplicating every component branch. Create isolated test data and clean it safely.

### Manual browser QA

Exercise desktop and mobile, keyboard and pointer, back/reset, retry, refresh persistence, long content, slow responses, console errors, and failed network requests. Manual QA complements automated E2E; neither replaces the other.

## CI stages

Use staged jobs with dependency caching and artifact upload:

1. **Contracts:** formatting, docs links, token validation, generated drift.
2. **Static:** lint and typecheck.
3. **Unit matrix:** split component, hook, and server tests by historical runtime or stable directory shards.
4. **Build:** production Next.js build.
5. **Browser matrix:** focused E2E and visual shards against one built artifact or preview environment.
6. **Evidence:** upload reports, screenshots, traces, and visual diffs.

Target individual shards under five minutes when practical. Rebalance from measured duration instead of file count. Keep retries limited to known infrastructure instability; a passing retry should remain visible as a flake signal.

## Branch protection

Require static checks, unit checks, build, critical E2E, and visual contracts that cover changed surfaces. Keep preview deployment status separate from functional checks. Require human review for migration, authorization, public API, and design-system contract changes.

## Visual baseline policy

Generate canonical baselines in one controlled environment. On other environments, run behavioral and geometry assertions or compare using an explicitly documented tolerance. A changed baseline must correspond to an approved design change and should be reviewable as an artifact.

## CI templates

The `templates/ci` folder includes a GitHub Actions workflow and Playwright configuration. Copy them into the target repository and replace placeholder scripts with the application's actual commands. Do not enable a required check until it runs reliably on the default branch.
