# Project intake and Gradle

## Inventory before editing

Read repository instructions, `settings.gradle.kts` or `settings.gradle`, the Gradle wrapper properties, root and module build files, `gradle/libs.versions.toml`, `build-logic` or convention plugins, manifests, source sets, and CI. Record:

- application and library modules with dependency direction;
- application ID, namespace, minimum, target, and compile SDK;
- Kotlin, Android Gradle Plugin, Gradle, Java toolchain, Compose compiler, and key Jetpack versions;
- build types, product flavors, variant-specific endpoints, and test source sets;
- Compose, Views, or mixed UI ownership;
- dependency injection and navigation mechanisms;
- signing source, Play application identity, and release automation;
- generated code, annotation processors, KSP, native libraries, and dynamic features.

Prefer the committed Gradle wrapper. Centralize dependency versions in the existing version catalog and repeated module policy in convention plugins. Do not upgrade Gradle, AGP, Kotlin, Compose, SDK targets, and every dependency in the same feature slice unless compatibility requires it; make each migration independently buildable and reversible.

## Module decisions

Use modules for a real boundary: independently owned feature, stable public contract, reusable platform capability, or build isolation. A package is enough for code that changes together. Keep the app module as composition root and avoid cyclic feature dependencies. A useful direction is UI feature → domain contract → data implementation, with platform adapters provided at composition.

Do not create a generic `common`, `utils`, or `core` dumping ground. Every shared module needs an owner, public API, dependency rule, and reason it cannot stay local.

## Variants and configuration

Use debug/release build types for build behavior and flavors only for products that truly vary. Keep environment URLs and publishable identifiers outside source literals, but do not treat values embedded in an APK as secrets. Keep signing passwords and keystores out of Git and logs. Verify the exact variant in CI and on a device.

## Launch and baseline

Run:

```bash
pnpm dlx automated-product-engineer doctor
pnpm dlx automated-product-engineer audit
./gradlew projects
./gradlew test lint assembleDebug
pnpm dlx automated-product-engineer launch
```

If the machine lacks Java, Android SDK, or Android Studio, preserve the code and report the exact missing runtime. Do not claim Android verification from JavaScript or static checks.

The first baseline should name a reproducible emulator, at least one supported physical device class, the critical journey, account fixture, backend environment, and commands needed to rebuild it.
