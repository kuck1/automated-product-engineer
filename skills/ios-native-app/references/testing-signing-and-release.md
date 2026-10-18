# Testing, signing, and release

## Evidence ladder

1. Swift Testing for pure policy, value semantics, concurrency, decoding, migrations, and repositories.
2. Integration tests for URLProtocol-backed networking, persistent stores, Keychain adapters, and server sandbox contracts.
3. XCTest/XCUIAutomation for critical user tasks, system prompts, deep links, background/resume, and regression reproductions.
4. Accessibility inspection, performance and memory profiling for affected journeys.
5. Simulator matrix for supported form factors and OS versions.
6. Physical-device proof for camera, notifications, background execution, biometric/passkey, performance, and hardware behavior.
7. Archive validation, TestFlight feedback, crash/metric review, and rollout evidence.

Use test plans to separate fast development, integration, UI, migration, and release suites. Make launch arguments and environment inject deterministic fixtures without compiling test backdoors into production behavior.

## Signing and privacy

Treat bundle IDs, teams, certificates, profiles, entitlements, app groups, associated domains, push environments, and capabilities as one identity graph. Automate validation while keeping private keys and App Store credentials in an authorized secret store. Do not “fix” signing by changing the bundle identifier or disabling a capability.

Maintain `PrivacyInfo.xcprivacy` for collected data, tracking, tracking domains, and required-reason APIs. Generate and inspect the privacy report, including dependencies. Reconcile usage strings, product behavior, analytics, retention, account deletion, App Store privacy answers, and policy.

## Distribution

Build and archive the exact commit with a shared scheme and release configuration. Record marketing version, build number, Xcode/Swift version, destination, dependencies, migration behavior, flags, server compatibility, and rollback. TestFlight is a feedback and crash-observation gate; it is not proof by itself.

Before App Store review, verify metadata, screenshots, review notes and account, export compliance, privacy URL and answers, in-app purchase or subscription behavior, deletion, accessibility, backend readiness, phased-release policy, monitoring, and incident owner. Uploading, inviting external testers, changing release state, or submitting for review is an external action and follows the user's authority.
