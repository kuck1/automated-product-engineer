# Native Android support retrospective

## Thesis

Native Android support must reduce technical wrangling without hiding Android's real contracts. Product work can start with the business need because project intake, state ownership, background limits, identity, persistence, capabilities, device proof, signing, and Play delivery become explicit and reusable.

## Cycle 1: research and ownership

Current Android guidance converged on unidirectional data flow, screen-level ViewModels, immutable Flow state, repository boundaries, lifecycle-aware collection, Room/DataStore ownership, and WorkManager for persistent tasks. That became a dedicated `android-native-app` specialist rather than an appendix to Expo.

## Cycle 2: detection and feedback

The installer now distinguishes native Gradle Android projects from Expo and React Native. It records modules, wrapper, application identity, SDK levels, Compose, tests, manifests, and capabilities. The audit turns Kotlin and Gradle signals into specific questions: who owns state, can work outlive its scope, can a stale response win, are credentials or signing passwords stored unsafely, and what survives process death?

## Cycle 3: executable patterns

Pure Kotlin references keep correctness independent from a particular screen: versioned idempotent transitions, durable outbox replay, and identity-scoped cache cleanup. Compose templates show integration without requiring a new architecture or dependency-injection framework.

## Cycle 4: delivery evidence

The release path now separates local domain proof, host checks, emulator journeys, physical-device capabilities, performance measurement, release bundle inspection, internal Play delivery, and staged production rollout. Every gate names the evidence it can and cannot provide.

## Limitation from this environment

This machine did not provide a Java runtime, Gradle, Android SDK, emulator, or Android Studio command-line tool during implementation. Node-based installer and audit behavior can be tested here; Kotlin compilation, Gradle tasks, lint, instrumented tests, and device behavior require an Android toolchain. The examples and templates preserve standard Gradle structure so those gates can run in a host Android repository or Android-enabled CI.
