# Domain review matrix

Review the domains that participate in the product. Mark absent domains as not applicable rather than inventing work.

| Domain | Questions to answer | Evidence | Typical specialist |
| --- | --- | --- | --- |
| Product requirements | Who acts, for what outcome, under which policies and failures? | journeys, copy, analytics, support issues, acceptance tests | `automated-product-engineer` |
| Architecture | Where do composition, orchestration, policy, and persistence live? | imports, calls, services, adapters, dependency direction | `architecture-building` |
| State management | Which owner holds local, URL, remote, durable, session, and cross-window state? | hooks, cache keys, contexts, storage, realtime, races | `frontend-api-db` |
| API and services | Are transport, validation, policy, errors, idempotency, and retries explicit? | routes, schemas, service contracts, logs, tests | `frontend-api-db` |
| Database | Do schema, constraints, indexes, transactions, migrations, retention, and tenancy enforce the model? | migrations, query plans, policies, repositories | `frontend-api-db` |
| Auth and security | How are identity, cookies or tokens, refresh, authorization, secrets, tenant boundaries, and logout handled? | clients, middleware, RLS, negative tests, incidents | `security-review` |
| Design system | Are semantic tokens, primitives, components, states, variants, accessibility, and adoption governed? | token sources, component catalog, usage search, visual tests | `design-system` |
| Responsive and native | Does behavior adapt by content and capability across browser, iOS, and Android lifecycles? | layouts, device runtime, deep links, permissions, offline recovery, Swift concurrency, scenes, entitlements, Gradle modules, Compose state, coroutine ownership, Room/DataStore/WorkManager, Android signing and Play delivery | `responsive-design`, `expo-native-app`, `ios-native-app`, `android-native-app` |
| Testing | Does proof follow ownership, cover failure paths, and avoid brittle implementation mirroring? | unit, integration, component, visual, E2E, native, CI | `manual-ui-qa`, `code-review` |
| Delivery | Are flags, migrations, observability, rollback, evidence, and release authority explicit? | CI, deploy config, telemetry, runbooks, PR templates | `pr-workflow` |
| Documentation | Can a new teammate find current decisions, commands, boundaries, and exceptions? | instructions, ADRs, runbooks, generated docs | `codebase-onboarding` |

For each selected domain write:

1. Current behavior and owner.
2. Evidence paths and runtime proof.
3. Strong contract to preserve.
4. Inconsistency or failure consequence.
5. Target contract and rejected alternative.
6. First characterization proof.
7. Migration, rollback, and completion evidence.
