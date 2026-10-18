# Native Android delivery

The zero-flag installer detects `settings.gradle.kts` or `settings.gradle`, Android application or library plugins, and `AndroidManifest.xml`. It records the wrapper, modules, application module, application ID, namespace, SDK levels, Compose usage, Kotlin sources, test source sets, and common capabilities in `.automated-product-engineer/project-profile.json`, then installs Android-specific examples only.

```bash
pnpm dlx automated-product-engineer
pnpm dlx automated-product-engineer doctor
pnpm dlx automated-product-engineer audit
pnpm dlx automated-product-engineer launch
```

`launch` opens the Gradle project in Android Studio. It does not install SDKs, create an emulator, change Gradle or SDK versions, select signing credentials, mutate manifests, or upload a build. Use the `android-native-app` skill to inspect the actual module and implement the product work.

## Architecture contract

Use declarative Compose or lifecycle-aware Views, immutable screen state from a screen-level ViewModel, repositories around local and remote sources, DataStore for small settings, Room for structured offline data, WorkManager for durable deferrable work, and authenticated server policy for shared truth. Preserve cancellation, stable operation IDs, revisions, and identity-scoped cleanup.

## Capability contract

Before a platform feature enters code, record its user value, module, manifest declaration, runtime permission states, fallback and settings recovery, background restriction, emulator limitation, physical-device proof, data handling and Data safety disclosure, server dependency, and release owner.

## Verification contract

Run pure Kotlin and focused module tests first, then lint and the exact debug/release variant, then Compose or Espresso journeys on named devices. Exercise lifecycle, process recreation, identity, offline/reconnect, App Links, permissions, accessibility, adaptive windows, and conflicts. Measure critical startup and interaction paths. Inspect the App Bundle, signing, shrinking, mapping files, Play configuration, and Data safety evidence before distribution.

See [the research contract](research/native-android-platform-contract.md), the [`android-native-app` skill](../skills/android-native-app/SKILL.md), and [the Android release checklist](../checklists/android-release.md).
