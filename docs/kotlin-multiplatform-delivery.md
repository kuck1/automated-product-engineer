# Kotlin Multiplatform delivery

The Kotlin Multiplatform path installs one product-engineering system for a monorepo containing shared Kotlin modules, a native Android application, and a native iOS application. It treats documentation, business rules, state machines, wire contracts, sync behavior, analytics vocabulary, semantic tokens, and scenario fixtures as shared product sources. Native shells remain responsible for platform composition, UI, lifecycle, capabilities, accessibility, and distribution.

```bash
pnpm dlx automated-product-engineer
pnpm dlx automated-product-engineer doctor
pnpm dlx automated-product-engineer audit
pnpm dlx automated-product-engineer launch
pnpm dlx automated-product-engineer launch --ios
```

The zero-flag launcher opens the monorepo in Android Studio. `--ios` opens the detected iOS workspace or project. Neither command changes dependencies, signing, SDKs, or release configuration.

Use the [`kotlin-multiplatform-app` skill](../skills/kotlin-multiplatform-app/SKILL.md), the [product-kernel research](research/kotlin-multiplatform-product-kernel.md), and the [multiplatform release checklist](../checklists/kotlin-multiplatform-release.md). The reference monorepo under `templates/kotlin-multiplatform/` demonstrates the dependency direction, native projection boundary, design-token compiler, contract manifest, and CI fan-out.

The parallel operating model uses a versioned **contract capsule** per feature. Product, shared-kernel, server, Android, iOS, design-system, quality, and documentation lanes consume the same digest and publish evidence into one completion ledger. This turns platform work into a dependency graph that can fan out immediately while additive compatibility windows prevent one native release cadence from blocking the other. The full protocol lives in [`parallel-delivery-operating-model.md`](../skills/kotlin-multiplatform-app/references/parallel-delivery-operating-model.md).
