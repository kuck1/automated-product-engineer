# Native iOS release checklist

## Product and architecture

- [ ] Critical journeys and recovery states are explicit.
- [ ] Views, observable models, services, actors/repositories, and server policy have distinct owners.
- [ ] Multi-scene, offline, retry, idempotency, and version-conflict behavior is defined where relevant.
- [ ] UIKit/SwiftUI interop preserves existing contracts.

## Identity, privacy, and capabilities

- [ ] Tokens and keys use Keychain; no privileged secret ships in the bundle.
- [ ] Sign in with Apple, passkey, or OAuth challenges are verified at the server boundary.
- [ ] Logout and account switching clear identity-scoped caches and queued work has an explicit policy.
- [ ] Entitlements, usage strings, provider settings, target membership, and server configuration agree.
- [ ] `PrivacyInfo.xcprivacy`, privacy report, analytics, retention, deletion, and App Store answers agree.

## Proof

- [ ] Swift Testing covers domain, race, retry, decoding, persistence, and migration invariants.
- [ ] Integration tests cover networking, storage, and auth adapters.
- [ ] XCUI covers the critical journey plus one failure or recovery path.
- [ ] Dynamic Type, VoiceOver, contrast, reduced motion, localization pressure, and keyboard/focus were inspected.
- [ ] Cold start, resume, termination restore, deep link, offline/reconnect, and expired session were exercised.
- [ ] Hardware-dependent behavior passed on a supported physical device.

## Distribution

- [ ] Shared scheme builds the exact commit with pinned dependencies.
- [ ] Bundle ID, team, profiles, certificates, capabilities, versions, and build number are correct.
- [ ] Archive validation and release configuration pass without suppressing warnings.
- [ ] Backend compatibility, migrations, flags, monitoring, rollback, and incident ownership are ready.
- [ ] TestFlight feedback and crash/metric evidence are reviewed.
- [ ] The user authorized any upload, tester invitation, phased release, or App Store submission.
