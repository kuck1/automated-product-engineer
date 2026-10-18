---
name: android-native-app
description: Build, audit, launch, test, and deliver native Android applications in Kotlin with Jetpack Compose or Views. Use for Android Studio and Gradle projects, ViewModel, StateFlow, coroutines, Room, DataStore, WorkManager, Credential Manager, App Links, permissions, Play Integrity, app signing, or Google Play delivery.
---

# Native Android Application

Treat the Gradle graph, application modules, manifests, Kotlin source, resources, server contracts, device capabilities, signing identity, and Play configuration as one product system. Preserve Android conventions and accepted repository decisions. A responsive browser or compile-only check is not Android runtime evidence.

## Establish the platform contract

Inspect `settings.gradle(.kts)`, wrapper and plugin versions, convention plugins, modules, application ID and namespace, SDK levels, build types and flavors, Compose/Views boundary, navigation, manifests, permissions, App Links, tests, CI, signing, and release automation. Run `pnpm dlx automated-product-engineer doctor` when installed.

Read [project-intake-and-gradle.md](references/project-intake-and-gradle.md) for adoption, module ownership, version catalogs, variants, launch, and mixed Compose/View repositories. Record a capability contract: feature, owning module, manifest entry, runtime permission, denial and settings recovery, background limit, emulator limit, physical-device proof, data disclosure, server dependency, and release owner.

## Build through explicit ownership

- Keep composables declarative. Local element state uses `remember` or `rememberSaveable`; reusable state is hoisted; screen business state belongs in a screen-level `ViewModel`; durable and remote truth remains behind repositories.
- Expose immutable `StateFlow` UI state, collect it with lifecycle awareness, and express user intent as method calls. Represent important one-time outcomes as durable state rather than lossy event channels.
- Use structured concurrency. Tie work to `viewModelScope`, `lifecycleScope`, or an injected caller scope; use WorkManager for guaranteed deferrable work; preserve cancellation and test dispatchers.
- Keep authorization, tenancy, idempotency, revision checks, and durable policy on the server. The app may project intent and recover; it does not become the authority.
- Use Credential Manager for passkeys, passwords, and Sign in with Google. Keep privileged keys off-device, protect only minimal local key material with Android Keystore, and scope caches and queued work to the authenticated subject.
- Use DataStore for small settings, Room for structured/offline data, and explicit outboxes plus WorkManager for durable synchronization.
- Wrap system capabilities behind narrow interfaces so denied, permanently denied, unavailable, interrupted, backgrounded, restored, and process-recreated behavior is testable.

Read [compose-architecture-and-state.md](references/compose-architecture-and-state.md) for Compose and Views, navigation, state, concurrency, multi-window, races, and process death. Read [networking-auth-and-security.md](references/networking-auth-and-security.md) for transport, Credential Manager, OAuth, App Links, cookies, Keystore, Play Integrity, and random-logout debugging. Read [persistence-lifecycle-and-capabilities.md](references/persistence-lifecycle-and-capabilities.md) for Room, DataStore, outboxes, WorkManager, notifications, permissions, lifecycle, and restoration.

## Preserve the Android experience

Use Material 3 semantics, edge-to-edge layouts, system bars, predictive back, adaptive window-size classes, platform navigation, dynamic type through scalable units, accessibility semantics, focus and keyboard behavior, reduced motion, contrast, localization, and content pressure. Put product tokens above Android semantic roles rather than replacing the platform. Keep component behavior, variants, examples, accessibility, and usage guidance together.

Read [design-system-and-accessibility.md](references/design-system-and-accessibility.md) when introducing shared Compose components, XML components, tokens, or a design source.

## Prove and deliver

Run local Kotlin tests for domain and state contracts, Android host tests where the framework is needed, Compose or Espresso device tests for critical journeys, and Macrobenchmark/Baseline Profile checks for important performance paths. Exercise cold launch, warm resume, background/foreground, process recreation, App Links, auth cancellation, expired credentials, offline recovery, concurrent devices, denied permissions, font scale, TalkBack, compact/medium/expanded windows, and at least one supported physical device when hardware participates.

Read [testing-signing-and-play-release.md](references/testing-signing-and-play-release.md) before changing SDK targets, shrinking, signing, upload keys, App Bundles, Play tracks, staged rollout, Data safety, or production delivery. Prepare reviewable artifacts within scope; production credential changes and Play publication require the user's authority.
