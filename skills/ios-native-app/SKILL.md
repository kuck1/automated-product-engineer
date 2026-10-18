---
name: ios-native-app
description: Build, audit, launch, test, and deliver native Apple applications in Swift with SwiftUI or UIKit. Use for Xcode projects, Swift packages, Observation, Swift concurrency, Apple authentication, Keychain, app lifecycle, capabilities, privacy manifests, signing, TestFlight, or App Store work.
---

# Native iOS Application

Treat the Xcode project, Swift modules, entitlements, privacy declarations, server contracts, and distribution configuration as one product system. Preserve Apple platform conventions and repository-specific decisions. A browser, mockup, or compile-only check is not native runtime evidence.

## Establish the platform contract

Inspect the workspace or project, shared schemes, targets, package graph, minimum OS, Swift language and strict-concurrency settings, SwiftUI/UIKit boundary, app and scene lifecycle, entitlements, privacy manifest, signing configuration, tests, CI, and release automation. Run `pnpm dlx automated-product-engineer doctor` when installed.

Read [project-intake-and-xcode.md](references/project-intake-and-xcode.md) for adoption, target mapping, modularization, build settings, launch, and mixed SwiftUI/UIKit repositories. Record a capability contract: target, minimum OS, required hardware, permission, entitlement, fallback, simulator limit, physical-device proof, privacy declaration, and release owner.

## Build through explicit ownership

- Keep `View` values declarative. Local interaction belongs in `@State`; child mutation uses bindings; feature coordination belongs in an `@Observable` model owned at a deliberate lifetime; durable and remote truth remains behind actors, services, and repositories.
- Use typed navigation values and lightweight route identities. Resolve current data at the destination rather than transporting model graphs in a navigation path.
- Enable complete concurrency checking before Swift 6 mode. Put UI models on `@MainActor`, isolate mutable shared resources with actors, make cross-isolation values `Sendable`, and preserve cancellation.
- Keep authorization, tenancy, idempotency, revision checks, and durable policy on the server. The app may project intent and recover; it does not become the authority.
- Keep credentials and small secrets in Keychain. Never place privileged server keys in the app bundle. Scope caches and persistence to the active identity and clear protected projections on identity change.
- Wrap system capabilities behind narrow protocols so denied, restricted, unavailable, interrupted, backgrounded, and restored behavior is testable.

Read [swiftui-architecture-and-state.md](references/swiftui-architecture-and-state.md) for Observation, navigation, concurrency, multi-window state, offline work, and race handling. Read [networking-auth-and-security.md](references/networking-auth-and-security.md) for URLSession, Sign in with Apple, passkeys, OAuth, Keychain, universal links, cookies, App Attest, and session debugging. Read [persistence-lifecycle-and-capabilities.md](references/persistence-lifecycle-and-capabilities.md) for SwiftData/Core Data, outboxes, background work, notifications, permissions, scenes, and restoration.

## Preserve the Apple experience

Use semantic system colors, Dynamic Type, SF Symbols, safe areas, platform navigation, focus, accessibility labels and actions, reduced motion, contrast, localization, and content-size pressure. Put product tokens above Apple semantic roles rather than replacing the platform. Keep reusable component behavior, variants, examples, accessibility, and usage guidance together.

Read [design-system-and-accessibility.md](references/design-system-and-accessibility.md) when introducing shared components or translating a design source.

## Prove and deliver

Use Swift Testing for domain and integration contracts and XCTest/XCUIAutomation for critical user journeys and platform integration. Exercise cold launch, warm resume, background/foreground, termination restore, deep links, auth cancellation, expired credentials, offline queue recovery, concurrent devices, denied permissions, Dynamic Type, VoiceOver, reduced motion, and at least one supported physical device when hardware participates.

Read [testing-signing-and-release.md](references/testing-signing-and-release.md) before changing signing, capabilities, privacy declarations, build numbers, archives, TestFlight, phased release, or App Store submission. Prepare those artifacts autonomously within scope; distribution, production credential changes, and App Store submission require the user's authority.
