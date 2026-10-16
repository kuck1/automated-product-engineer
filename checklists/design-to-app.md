# Design-to-App Checklist

## Define

- [ ] Primary user and outcome are explicit.
- [ ] Entry, completion, dismissal, replay, and failure behavior are defined.
- [ ] Final decisions and open product questions are separated.
- [ ] Desktop, mobile, dense, empty, loading, and error references exist.

## Map

- [ ] Existing primitives and semantic tokens were inventoried.
- [ ] New component and token additions are justified.
- [ ] State is classified as local, URL, query cache, or database.
- [ ] API, service, authorization, and persistence owners are named.
- [ ] Feature flag and analytics behavior are defined.

## Build

- [ ] Visual skeleton works with deterministic fixtures.
- [ ] Reusable components contain no domain data or network behavior.
- [ ] Hooks each own a focused orchestration concern.
- [ ] Route handlers authenticate, validate, and delegate.
- [ ] Services own authorization, transactions, idempotency, and DTOs.
- [ ] Async actions support loading, success, recovery, and retry.
- [ ] Optimistic updates define rollback and reconciliation.

## Verify

- [ ] Component and hook contracts have focused tests.
- [ ] APIs and services cover invalid input, unauthorized access, retries, and no-op success.
- [ ] Approved desktop and mobile frames reproduce deterministically.
- [ ] Keyboard, focus, reduced motion, overflow, and long content were inspected.
- [ ] Console and network errors were reviewed after final interactions.
- [ ] Typecheck, lint, build, and required repository checks pass.
