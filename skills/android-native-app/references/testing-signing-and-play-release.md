# Testing, signing, and Play release

## Evidence ladder

1. Pure Kotlin tests prove domain transitions, revision conflicts, idempotency, ordering, parsing, and identity cleanup.
2. Coroutine tests control dispatchers and virtual time; repository tests use fakes or local fixtures.
3. Android host tests cover framework-dependent code only where they add value.
4. Compose or Espresso instrumented tests cover the critical journey and one recovery path on a named device profile.
5. Physical-device checks cover biometrics, camera, notifications, App Links, background limits, process death, OEM behavior, and performance where relevant.
6. Macrobenchmark measures startup and critical interactions; Baseline Profiles are generated from representative journeys and measured, not assumed.

Avoid testing every composable implementation detail. Assert semantics and user-visible behavior. Keep animation clocks and network/backend fixtures deterministic. Exercise compact, medium, and expanded windows plus font scale, dark mode, TalkBack, RTL, offline, slow network, expired session, and denied permission.

## Build and security gates

Run the exact release graph: unit tests, lint, static analysis, instrumented smoke journey, `bundleRelease`, dependency and secret scan, R8/shrinker verification, mapping-file retention, native symbol upload, and artifact inspection. Verify exported components, backup rules, cleartext policy, WebView policy, pending intents, deep links, dependency provenance, and logging.

Keep upload keystore and passwords in protected developer or CI secret storage. Never commit them or echo them. Use a separate upload key with Play App Signing so the distribution key remains managed by Google. Document rotation and recovery ownership.

## Play delivery

- Increment version code and set user-facing version name.
- Build and inspect the Android App Bundle generated from the exact commit and variant.
- Reconcile application ID, signing certificate, App Links, OAuth clients, Firebase/Google services, Play Integrity, and backend allow-lists.
- Confirm the package name is registered to the correct verified Android developer identity and preserve signing-key continuity for every distribution channel.
- Reconcile permissions, SDK disclosures, privacy policy, Data safety, account deletion, ads, content rating, target audience, and store listing.
- Use internal testing for the first Play-signed artifact, then closed/open tracks as product needs require.
- Review pre-launch reports, device catalog exclusions, crashes, ANRs, vitals, performance, accessibility, and tester feedback.
- Stage production rollout with monitoring, server compatibility, flags, rollback/forward-fix plan, and incident owner.

Do not upload, invite testers, change production signing or credentials, promote a track, or publish without the user's authorization for that external action.

## Release evidence

Record commit, variant, Gradle/AGP/Kotlin and SDK versions, artifact hash, version code/name, signing certificate fingerprint, test matrix, device evidence, Data safety review, Play track, rollout percentage, backend compatibility window, monitoring links, known limitations, and rollback decision.
