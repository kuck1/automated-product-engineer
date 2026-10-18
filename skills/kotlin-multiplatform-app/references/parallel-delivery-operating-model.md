# Parallel delivery operating model

## Product Contract Graph

Treat a cross-platform feature as a graph of decisions, projections, and proofs rather than two app tickets. The graph is rooted in a **contract capsule**:

```text
product intent + vocabulary + policy + protocol + scenarios + semantic tokens
                                  │
                         immutable contract digest
              ┌───────────────────┼───────────────────┐
         shared kernel       Android projection     iOS projection
              │                    │                    │
        host scenarios       native journeys       native journeys
              └───────────────────┼───────────────────┘
                         compatibility ledger
```

Each graph node names its owner, inputs, outputs, compatibility promise, evidence, and source digest. An edge is allowed only when the downstream node consumes a declared contract. CI can therefore rebuild, test, or block the exact affected projections instead of serializing the whole organization behind one mobile branch.

## Contract capsule

Create one directory per feature under `contracts/features/<feature>/` containing:

- intent, actors, success, policy, and failure copy;
- glossary and stable identifiers;
- commands, events, states, wire schemas, error codes, revision and idempotency rules;
- analytics meaning, authority, privacy class, and dedupe key;
- semantic tokens and component behavior references;
- scenario vectors including success, rejection, stale revision, duplicate replay, offline, cancellation, and identity change;
- compatibility window and removal date;
- owners and decisions still open.

Generate a manifest with the capsule digest. Shared, Android, iOS, server, documentation, and analytics outputs report the same digest. A mismatch is a build failure, not a coordination meeting.

## Independent work lanes

After capsule review, work fans out into independent lanes:

1. **Kernel lane:** pure policy, use cases, ports, feature facade, host tests, API dump.
2. **Server lane:** authoritative actor, policy repetition, storage transaction, protocol compatibility, migrations, observability.
3. **Android lane:** adapters, ViewModel or lifecycle ownership, Compose projection, accessibility, device journeys, release integration.
4. **iOS lane:** adapters, Swift main-actor model, SwiftUI projection, accessibility, generated-framework smoke test, release integration.
5. **Design-system lane:** canonical tokens and component contract, native recipes, dynamic type and contrast decisions, visual evidence.
6. **Quality lane:** scenario oracle, compatibility matrix, race harness, device farm, performance budgets, failure injection.
7. **Documentation lane:** product guide, integration guide, support diagnostics, migration and rollback.

No lane edits another lane's internals. Shared changes land through additive contract evolution. Native teams can consume the accepted capsule and an immutable kernel artifact while implementation continues elsewhere.

## Change protocol

Classify every contract change:

- **Additive:** new optional state, event, token, or field. Platforms can adopt independently inside the compatibility window.
- **Behavioral:** an existing input changes result. Add a new scenario and versioned behavior flag; run old and new paths together.
- **Breaking:** remove or reinterpret a contract. Expand support first, migrate all consumers, observe usage, then contract after the declared date.
- **Native-only:** no shared semantic change. The native owner can ship after its platform proof.

Never force-push a capsule digest already consumed by another lane. Publish a new version and make both versions executable until migration completes.

## CI topology

Use affected-graph analysis to start jobs immediately and a final ledger gate to join them:

- contract syntax, alias, compatibility, generated drift, and documentation links;
- common host tests and deterministic scenario replay;
- Kotlin API and Apple framework API compatibility;
- Android compile, lint, units, components, device journeys, accessibility, startup, binary, and release artifact;
- iOS framework link, Swift compile, units, UI journeys, accessibility, launch, binary, and archive artifact;
- server schema, migration, authorization, idempotency, old/new-client compatibility, and load;
- token and component parity with allowed native differences;
- privacy, telemetry, crash-symbol, rollout, rollback, and support-diagnostic checks.

Cache by compiler, dependency lock, source-set inputs, capsule digest, and generator version. Sign and promote the already verified binary; never rebuild a release from a different source graph.

## Native shell budget

Track shell code by reason rather than trying to minimize every file. Native code is healthy when it exists for composition, navigation, lifecycle, platform UI, accessibility, capabilities, secure storage, performance, or distribution. Native duplication of policy, protocol interpretation, sync state machines, analytics meaning, or semantic token values is architectural debt.

Review the budget per feature:

| Category | Shared by default | Native by default |
| --- | --- | --- |
| product policy and transitions | yes | projection only |
| protocol, errors, revisions, idempotency | yes | transport adapter |
| cache, outbox, conflict semantics | yes | storage and scheduler adapter |
| navigation and lifecycle | contract meaning | implementation |
| UI and accessibility | component behavior and tokens | widget and interaction |
| auth | state machine and session semantics | system UI and secure material |
| capabilities | capability interface | OS integration |
| release | compatibility and evidence contract | signing and store delivery |

## Completion ledger

A feature is complete when one machine-readable ledger records:

- contract version and digest;
- shared-kernel version and API report;
- server compatibility range;
- Android and iOS source SHAs plus artifact identities;
- scenario results per target;
- native deviations and their accepted rationale;
- accessibility and performance budgets;
- rollout, observation, rollback, and removal state.

This ledger lets an unlimited number of teams and CI workers proceed in parallel while preserving one product truth and independently native experiences.
