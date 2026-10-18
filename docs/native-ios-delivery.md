# Native iOS delivery

The zero-flag installer detects `.xcworkspace`, `.xcodeproj`, or `Package.swift` and writes the result to `.automated-product-engineer/project-profile.json`. It prefers a workspace, records shared schemes, bundle identifier, deployment target, Swift version, entitlements, privacy manifests, tests, and capability signals, then installs native iOS examples only.

```bash
pnpm dlx automated-product-engineer
pnpm dlx automated-product-engineer doctor
pnpm dlx automated-product-engineer launch
```

`launch` opens the detected workspace, project, or package in Xcode. It does not choose a signing team, create credentials, mutate project files, or submit a build. Use the `ios-native-app` skill to inspect the real target and implement the requested product work.

## Capability contract

Before a platform feature enters code, record its purpose, framework, permission state model, usage string, entitlement, target membership, simulator limitation, physical-device proof, privacy declaration, server responsibility, and release owner. This catches mismatches that compile successfully but fail on a device or in distribution.

## Architecture contract

Use a declarative View, an observable main-actor feature model, protocol-defined services, actors or repositories for mutable shared resources, and server authority for cross-user policy. Persist offline intent explicitly and reconcile it with canonical server results. Keep UIKit where it already provides a stable shell or capability.

## Verification contract

Run pure Swift tests first, then target tests and XCUI journeys in a named simulator. Exercise lifecycle, identity, offline, deep-link, permission, accessibility, and conflict states. Add physical-device proof for hardware and background behavior. Inspect archives, privacy reports, signing, and TestFlight evidence before distribution.

See [the research contract](research/native-ios-platform-contract.md), the [`ios-native-app` skill](../skills/ios-native-app/SKILL.md), and [the iOS release checklist](../checklists/ios-release.md).
