# Native Android release checklist

## Product and architecture

- [ ] Critical journeys, recovery states, and adaptive layouts are explicit.
- [ ] Composables/Views, ViewModels, repositories, local stores, workers, and server policy have distinct owners.
- [ ] Process recreation, offline retry, idempotency, revision conflict, realtime reconnect, and multi-window behavior are defined where relevant.
- [ ] Compose/View interoperability preserves existing contracts.

## Identity, privacy, and capabilities

- [ ] Credential Manager or the accepted identity adapter uses server-issued challenges and server verification.
- [ ] No privileged secret, upload password, or server key ships in source, resources, Gradle files, or the APK.
- [ ] Logout and account switching clear identity-scoped caches; queued work has an explicit policy.
- [ ] App Links, package name, release signing fingerprint, OAuth configuration, and backend allow-list agree.
- [ ] Permissions, capability fallbacks, retention, deletion, privacy policy, and Play Data safety answers agree.
- [ ] Play Integrity verdicts are bound to protected requests and verified by the backend where used.

## Proof

- [ ] Pure Kotlin and coroutine tests cover domain, race, retry, decoding, persistence, and migration invariants.
- [ ] Repository and database tests cover local/remote reconciliation and identity boundaries.
- [ ] Compose or Espresso tests cover the critical journey plus one failure or recovery path.
- [ ] Compact, medium, expanded, split-screen, font-scale, TalkBack, contrast, RTL, keyboard, and back behavior were inspected.
- [ ] Cold start, resume, process recreation, App Link, offline/reconnect, expired session, and denied permission were exercised.
- [ ] Hardware or OEM-sensitive behavior passed on supported physical devices.
- [ ] Macrobenchmark and Baseline Profile evidence exists for critical performance paths when relevant.

## Distribution

- [ ] The committed Gradle wrapper builds the exact commit with pinned versions and the correct variant.
- [ ] Application ID, namespace, SDK targets, version code/name, upload key, Play signing, and service configuration are correct.
- [ ] Package-name ownership and Android developer verification are complete for the intended distribution channels.
- [ ] `test`, `lint`, release bundle, shrinking, artifact inspection, and required device tests pass.
- [ ] Mapping files and native symbols are retained or uploaded; crash, ANR, vitals, and backend monitoring are ready.
- [ ] Data safety, store listing, account deletion, content rating, target audience, and policy declarations are reviewed.
- [ ] Internal-track and pre-launch evidence are reviewed before any staged production rollout.
- [ ] The user authorized any credential change, upload, tester invitation, track promotion, staged rollout, or publication.
