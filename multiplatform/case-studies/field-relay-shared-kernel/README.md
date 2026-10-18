# Field Relay as a shared product kernel

Field Relay is the migration case study for a product that must remain useful offline, resume after process death, reconcile work from several devices, and preserve native platform behavior.

## Shared product truth

- mission, checkpoint, observation, and operation identifiers;
- mission lifecycle and transition policy;
- optimistic state, revision conflict, retry, and idempotency rules;
- durable outbox ordering and canonical reconciliation;
- authentication state machine and identity-scoped invalidation;
- telemetry meaning, privacy classification, semantic tokens, and scenario vectors.

## Native Android edge

Jetpack Compose, lifecycle-aware collection, Room-backed adapters, WorkManager scheduling, Credential Manager, App Links, permissions, notifications, accessibility, performance, signing, and Play delivery stay in the Android shell. See `android/case-studies/field-relay/`.

## Native iOS edge

SwiftUI, scene lifecycle, Swift observable models, Keychain, AuthenticationServices, background task scheduling, universal links, permissions, notifications, accessibility, performance, signing, TestFlight, and App Store delivery stay in the iOS shell. See `ios/case-studies/field-relay/`.

## Parallel build sequence

1. Characterize accepted behavior with shared scenario vectors and existing native journey tests.
2. Move one deterministic mission transition into the invariant kernel without changing either screen.
3. Export a small feature facade and connect native adapters behind the existing UI.
4. Run both old and new paths against the same fixture and compare canonical output.
5. Move sync and outbox orchestration only after policy parity is proven.
6. Delete duplicated native policy after both apps ship the shared path safely.

This sequence is a strangler migration. It never requires a flag-day UI rewrite, shared database, or Compose Multiplatform adoption.
