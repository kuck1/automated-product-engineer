# Parallel product-platform monorepo blueprint

This blueprint lets Next.js, native Android, and native iOS ship simultaneously against one versioned product contract. KMP supplies the native product kernel; a generated TypeScript projection gives Next.js identical deterministic semantics. React, Jetpack Compose, and SwiftUI remain deliberately native.

## Ownership

- `docs/product/`: product outcomes and shared language.
- `contracts/features/`: product language, states, transitions, guards, errors, and telemetry names.
- `contracts/scenarios/`: executable examples that every runtime must satisfy.
- `contracts/tokens/` and `contracts/components/`: visual meaning and behavior, independent of rendering technology.
- `shared/product-kernel/`: domain policy, application orchestration, ports, sync, and UI-facing feature state.
- `webApp/`: Next.js projection and generated TypeScript policy runtime.
- `androidApp/`: Android composition root and Jetpack Compose projection.
- `iosApp/`: iOS composition root, Swift bridge, and SwiftUI projection.
- `tools/`: deterministic compilers, validators, receipt exporters, and parity proof.

## Commands

```bash
gradle wrapper --gradle-version 9.6.0
node tools/compile-tokens.mjs
node tools/compile-feature.mjs
node tools/compile-feature.mjs --check
node tools/compile-tokens.mjs --check
node tools/compile-scenarios.mjs
node tools/compile-scenarios.mjs --check
node tools/validate-contracts.mjs
./gradlew :shared:product-kernel:hostTest
./gradlew :androidApp:assembleDebug
pnpm --dir webApp install --frozen-lockfile
pnpm --dir webApp test
pnpm --dir webApp build
```

## Parallel delivery rule

Every feature change starts by updating its capsule and assigning a new digest. Contract, shared-kernel, web, Android, iOS, design, quality, and documentation lanes may then work in parallel. A lane is complete only when it reports the expected digest. Integration waits for semantic parity receipts from Kotlin and TypeScript, plus native projection checks on each platform.

On macOS, open `iosApp` through the generated Xcode project in the host repository and add the direct-integration build phase described in `iosApp/README.md`. This reference intentionally does not invent signing or project identifiers.
