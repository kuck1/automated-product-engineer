# Native iOS support: implementation record

## Research

The pass used current Apple documentation for SwiftUI Observation and navigation, Swift 6 concurrency, AuthenticationServices and Keychain, App Attest, Xcode testing, privacy manifests, universal links, TestFlight, and App Store submission. The resulting product boundary is a distinct native iOS specialist rather than an addendum to Expo.

## Cycle 1: platform model

Added a progressive `ios-native-app` skill for Xcode intake, SwiftUI and UIKit coexistence, state ownership, actors, auth, persistence, capabilities, design systems, accessibility, testing, signing, and release. A capability contract connects code, entitlements, privacy, device proof, and distribution.

## Cycle 2: executable knowledge

Added a Swift package that proves versioned/idempotent writes, durable outbox behavior, and identity-scoped cache clearing. Added SwiftUI integration templates and a native Field Relay application note.

## Cycle 3: installation and diagnostics

Extended the CLI to recognize Xcode projects, workspaces, Swift packages, schemes, build settings, entitlements, privacy manifests, tests, and capabilities; select iOS references during install; and open the correct container in Xcode.

## Limits and follow-up

The toolkit does not generate or rewrite `.pbxproj`, choose a signing team, provision credentials, or submit builds. Runtime verification still belongs in the host application's simulator and devices. Future case studies can add StoreKit, push, widgets, Live Activities, and document collaboration when a concrete product journey requires them.
