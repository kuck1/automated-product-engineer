# Parallel platform development

Use this workflow when one feature must ship in Next.js, native Kotlin Android, and native Swift iOS without making one implementation the reference platform.

## Repository shape

```text
contracts/
  features/       product decisions and transitions
  scenarios/      executable behavior vectors
  api/            transport schemas
  tokens/         semantic design values
  components/     behavior and accessibility contracts
shared/
  product-kernel/ KMP product policy and portable runtime
webApp/           Next.js projection and generated TypeScript policy
androidApp/       native Compose application
iosApp/           native SwiftUI or UIKit application
tools/            deterministic compilers and receipt comparison
```

## Feature workflow

1. Describe the actor, business outcome, states, intents, guards, authority, failures, recovery, telemetry, flags, tokens, behavior, and scenarios in one feature capsule.
2. Generate Kotlin and TypeScript policy. Commit the capsule and generated manifest together.
3. Create sibling web, Android, iOS, server, and evidence lanes from that contract commit.
4. Keep KMP responsible for deterministic native product behavior. Keep React, Compose, and SwiftUI responsible for their platform experience.
5. Run each platform lane independently. Publish receipts against the same capsule digest.
6. Compare Kotlin and TypeScript semantic receipts. Then join native and web evidence at the convergence gate.
7. Record deviations, compatibility windows, rollout, rollback, and the released contract epoch.

## Review rules

- A green web build cannot unblock missing Android or iOS evidence.
- A passing KMP test cannot prove platform lifecycle, accessibility, permissions, storage, auth, or distribution.
- A screenshot cannot prove shared policy.
- Generated files are disposable and may not contain hand edits.
- Server authorization and durable invariants are repeated even when clients share deterministic policy.
- Platform branches are siblings and remain reviewable on their own.

The runnable blueprint is in [`templates/kotlin-multiplatform/`](../templates/kotlin-multiplatform/README.md). The specialist workflow is in [`skills/parallel-platform-development/`](../skills/parallel-platform-development/SKILL.md).
