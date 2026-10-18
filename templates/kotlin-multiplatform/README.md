# Product-kernel monorepo blueprint

This blueprint keeps native Android and iOS applications thin while sharing the product behavior that must never diverge. Copy decisions and patterns into the host repository; replace the example namespace, identifiers, endpoints, signing, and product vocabulary.

## Ownership

- `docs/product/`: product outcomes and shared language.
- `contracts/`: canonical semantic tokens and component behavior.
- `shared/product-kernel/`: domain policy, application orchestration, ports, sync, and UI-facing feature state.
- `androidApp/`: Android composition root and Jetpack Compose projection.
- `iosApp/`: iOS composition root, Swift bridge, and SwiftUI projection.
- `tools/`: deterministic contract compiler and validator.

## Commands

```bash
gradle wrapper --gradle-version 9.6.0
node tools/compile-tokens.mjs
node tools/compile-tokens.mjs --check
node tools/compile-scenarios.mjs
node tools/compile-scenarios.mjs --check
node tools/validate-contracts.mjs
./gradlew :shared:product-kernel:hostTest
./gradlew :androidApp:assembleDebug
```

On macOS, open `iosApp` through the generated Xcode project in the host repository and add the direct-integration build phase described in `iosApp/README.md`. This reference intentionally does not invent signing or project identifiers.
