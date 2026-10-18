# Native Android platform contract

This research pass establishes first-class Kotlin and Android tooling rather than treating Android as a React Native target or a generic mobile viewport. Sources were limited to current Android platform documentation.

## Architecture and state

Android's [architecture recommendations](https://developer.android.com/topic/architecture/recommendations) strongly favor unidirectional data flow, screen-level ViewModels, immutable UI state, coroutines and Flow, repositories, and lifecycle-aware state collection. The [state-holder guidance](https://developer.android.com/topic/architecture/ui-layer/stateholders) distinguishes screen business state from UI-element state and keeps state ownership near its lifetime. The toolkit therefore routes native Kotlin work through Compose/View state holders, `ViewModel`, immutable `StateFlow`, repositories, and server authority rather than introducing a universal global store.

The [lifecycle coroutine guidance](https://developer.android.com/topic/libraries/architecture/coroutines) ties asynchronous work to ViewModel and lifecycle scopes. The audit flags `GlobalScope` and anonymous dispatcher scopes, while the skill requires cancellation, dispatcher ownership, and an overlap policy for every asynchronous mutation.

## Persistence and offline work

[DataStore](https://developer.android.com/topic/libraries/architecture/datastore) is suited to small key-value or typed datasets; its documentation points complex, relational, partial-update data to Room. Android's [offline-first architecture](https://developer.android.com/topic/architecture/data-layer/offline-first) uses a local source of truth, queued reads and writes, conflict handling, and WorkManager for persistent synchronization. The platform contract assigns settings to DataStore, structured offline data to Room, and durable deferrable work to WorkManager, with stable operation IDs and canonical server reconciliation.

The [background-task overview](https://developer.android.com/develop/background-work/background-tasks) distinguishes lifecycle-bound asynchronous work, scheduled persistent work, and foreground services. This prevents a coroutine, service, or periodic worker from being chosen solely because it appears to keep work alive.

## Authentication, links, and abuse resistance

The [Credential Manager prerequisites](https://developer.android.com/identity/credential-manager/prerequisites) connect passkeys and federated sign-in to Digital Asset Links, package identity, and signing certificate fingerprints. Passkey [creation](https://developer.android.com/identity/passkeys/create-passkeys) and [sign-in](https://developer.android.com/identity/passkeys/sign-in-with-passkeys) require server-issued options and server verification. The toolkit therefore treats the backend subject as the identity boundary, uses Credential Manager for user credentials, and keeps provider or server secrets out of the APK.

[Android App Links](https://developer.android.com/training/app-links) bind HTTPS routes to a verified app/site association. Their package, release certificate, manifest filter, website file, backend redirect allow-list, and typed navigation parser form one contract.

For sensitive actions, [Play Integrity standard requests](https://developer.android.com/google/play/integrity/standard) bind a request hash to an encrypted token that the backend sends to Google Play for verification. The toolkit treats this as a server-evaluated abuse signal with tiered policy, never as client-side authorization.

## Build, design, testing, and release

Android's [build configuration](https://developer.android.com/build) defines root and module build roles, SDK levels, plugins, variants, and Gradle structure. [Version catalogs](https://developer.android.com/build/migrate-to-catalogs) centralize dependency and plugin versions. The project detector records these structures without rewriting them, and onboarding recommends convention plugins only when repeated policy justifies a build boundary.

Android's adaptive guidance uses [window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes) based on the current window rather than device labels. The component guidance therefore covers compact, medium, and expanded windows, resizing, split screen, foldables, content pressure, insets, and input mode.

The [testing fundamentals](https://developer.android.com/training/testing/fundamentals) separate local, host, and device tests around a testable architecture. [Baseline Profiles](https://developer.android.com/develop/ui/compose/performance/baseline-profiles) connect representative Macrobenchmark journeys to ahead-of-time optimization. The evidence ladder starts with pure Kotlin invariants, adds device journeys where the platform matters, and measures performance rather than assuming it.

Android requires signed artifacts. [Play App Signing](https://developer.android.com/studio/publish/app-signing) separates the upload key from the protected distribution key, and [App Bundle upload guidance](https://developer.android.com/studio/publish/upload-bundle) makes an internal Play track the closest pre-production proof of Play signing, shrinking, and delivery behavior. The release checklist requires an exact App Bundle, signing fingerprint, Data safety reconciliation, test track evidence, staged rollout, monitoring, and rollback ownership.

Android's current [developer verification guidance](https://developer.android.com/developer-verification) also makes package-name registration and verified developer identity part of distribution on certified Android devices. The delivery contract therefore preserves package-name ownership and signing-key continuity across Play and non-Play channels instead of treating them as late store metadata.

## Resulting product boundary

1. Native Android has its own `android-native-app` skill and progressive references.
2. The installer recognizes Gradle Android projects, application modules, manifests, wrapper, SDK levels, application ID, Compose, tests, and capability signals.
3. The audit speaks Kotlin and Gradle: state holders, coroutine ownership, direct networking in composables, credential and signing-secret storage, and durable data boundaries.
4. Executable Kotlin examples prove versioned writes, idempotent replay, offline outboxes, and identity-scoped cache cleanup without binding the invariant to Android UI.
5. Compose templates demonstrate screen state, a repository contract, semantic design tokens, and release CI while remaining adaptable to Views and existing project conventions.
6. Release readiness progresses from pure Kotlin proof to emulator, physical device, App Bundle, internal Play track, and staged production evidence.
