# Testing, CI, and release

## Evidence ladder

1. Canonical schemas, tokens, and component contracts validate and regenerate without drift.
2. Pure common tests prove domain rules and scenario vectors on a fast host target.
3. Android and iOS target tests prove platform-specific actuals, serialization, database drivers, and interop.
4. Native component tests prove rendering, intent wiring, accessibility, localization, and adaptive behavior.
5. Device journeys prove lifecycle, auth, links, permissions, background work, offline recovery, process termination, and multi-device conflicts.
6. Compatibility tests run old app/new server, new app/old server where supported, and staggered Android/iOS rollout states.
7. Benchmarks enforce build, binary, startup, memory, scroll, and critical-interaction budgets.

## CI fan-out

Pin the shared commit and contract digest, then run independent jobs for contracts, shared host tests, Android, iOS, server compatibility, documentation, API compatibility, and performance. Use remote caches only with trustworthy keys and reproducible inputs. Build release artifacts once and promote the verified artifact rather than rebuilding per environment.

A contract PR can land before native implementations when it is additive and gated. Android and iOS PRs target the same contract SHA and publish evidence back to one feature ledger. Required checks prevent a platform from marking a scenario complete with a different fixture or semantic token version.

## Rollout

Use server-supported compatibility windows and independently targeted feature flags. Apply database changes through expand, migrate, observe, and contract phases. Record the shared-kernel version in logs, crash reports, support diagnostics, and analytics so a cross-platform defect can be traced to the common layer or one native adapter.
