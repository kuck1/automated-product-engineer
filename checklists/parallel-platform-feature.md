# Parallel Next.js, Android, and iOS feature

## Contract

- [ ] Actor, trigger, business outcome, vocabulary, states, intents, guards, authority, failures, recovery, analytics, flags, and accessibility intent are explicit.
- [ ] API, tokens, component behavior, and canonical scenario vectors are versioned with the feature capsule.
- [ ] Capsule digest and compatibility window are recorded.
- [ ] Kotlin and TypeScript projections regenerate deterministically with no drift.

## Independent lanes

- [ ] Server, shared kernel, Next.js, Android, iOS, design, quality, and documentation have disjoint owners and outputs.
- [ ] Platform branches are siblings from the capsule commit.
- [ ] Each lane publishes a projection receipt with the same capsule digest.
- [ ] Deviations have an owner, reason, evidence, expiry condition, and product approval.

## Proof

- [ ] Kotlin and TypeScript replay the same scenario vectors and produce equal semantic receipts.
- [ ] Next.js typecheck, tests, production build, and server/client boundary checks pass.
- [ ] KMP host tests and exported Swift API compile.
- [ ] Android unit, lint, build, device journey, lifecycle, accessibility, and capability checks pass.
- [ ] iOS unit, Swift compile, simulator journey, lifecycle, accessibility, privacy, capability, signing, and distribution checks pass.
- [ ] Server authorization, revision, idempotency, transaction, and negative-permission tests pass.
- [ ] The convergence job rejects mixed epochs, missing evidence, generated drift, and undocumented deviations.

## Release

- [ ] Each artifact records its capsule digest and supported capability envelope.
- [ ] Rollout and rollback are independently safe for web, Android, and iOS.
- [ ] The server supports every still-active contract epoch.
- [ ] Documentation, decisions, and retrospective reflect the released behavior.
