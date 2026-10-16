# Full-Stack Boundary Map Prompt

Design the production boundaries for **[FEATURE]** before implementation.

Map one important user action through:

1. component-local UI state;
2. server cache and mutation state;
3. authenticated route or server action;
4. request validation;
5. domain service and authorization policy;
6. repository interface;
7. Supabase persistence and row-level security;
8. analytics and operational errors.

Name the authoritative owner for each rule. Include typed request/response examples, idempotency, concurrency behavior, retry and rollback semantics, tenant isolation, and the flag-off path. Prefer extension through adapters and services over modifying unrelated shared behavior.
