# Kotlin Multiplatform release checklist

## Shared contract

- [ ] Product requirement, decision record, states, failures, and scenario IDs are current.
- [ ] Domain, protocol, analytics, feature-flag, and component contracts remain backward compatible for the rollout window.
- [ ] Generated token and contract artifacts match their canonical source digest.
- [ ] Common tests cover rules, races, cancellation, retries, conflicts, identity changes, and clock boundaries.
- [ ] The exported Apple framework API has a reviewed compatibility report and Swift smoke test.

## Native projections

- [ ] Android and iOS render every required shared state and send only declared intents.
- [ ] Platform navigation, lifecycle, deep links, auth, permissions, notifications, background work, and restoration are verified natively.
- [ ] Accessibility, localization, text scaling, adaptive windows, appearance modes, reduced motion, and platform interaction conventions are verified.
- [ ] Native component implementations satisfy the shared component scenarios without erasing intentional platform differences.

## Parallel CI evidence

- [ ] Contract validation and generated-artifact drift checks pass.
- [ ] Host-target shared tests and platform-target shared tests pass.
- [ ] Android unit, lint, build, device, baseline-profile, signing, and bundle gates pass.
- [ ] iOS unit, build, UI, accessibility, privacy, signing, archive, and TestFlight gates pass.
- [ ] Server compatibility tests cover the oldest supported app contract and the candidate contract.
- [ ] Performance and binary-size budgets are within the accepted change envelope.
- [ ] Both apps identify the same contract version and shared-kernel commit in diagnostics.

## Promotion

- [ ] Feature flags permit independent platform rollout and rollback.
- [ ] Schema changes use expand/migrate/contract sequencing.
- [ ] Observability separates shared-kernel failures from Android, iOS, and server adapters.
- [ ] Owners, staged cohorts, stop conditions, support notes, and rollback actions are recorded.
- [ ] Store publication and production credential mutations have explicit human authorization.
