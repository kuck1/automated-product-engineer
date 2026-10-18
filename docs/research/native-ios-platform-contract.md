# Native iOS platform contract: research and product decisions

This research pass established a first-class Swift and Xcode workflow rather than treating native iOS as an Expo variant.

## Primary-source findings

Apple's [SwiftUI model-data guidance](https://developer.apple.com/documentation/SwiftUI/Managing-model-data-in-your-app) makes the data model a separate, observable source of truth and describes dependency tracking through Observation. The toolkit therefore distinguishes local view state, observable feature coordination, actor-isolated services, durable local storage, and server authority.

Apple recommends [lightweight values in a navigation path](https://developer.apple.com/documentation/swiftui/understanding-the-navigation-stack), so routes identify destinations and destinations resolve current data instead of transporting mutable model graphs.

[Swift 6 strict concurrency](https://developer.apple.com/documentation/swift/adoptingswift6) catches data races at compile time and can be adopted incrementally. The workflow first enables complete checking, fixes isolation by ownership, then moves targets into Swift 6 rather than silencing warnings.

[Keychain Services](https://developer.apple.com/documentation/security/keychain-services) provides encrypted storage for small secrets. [AuthenticationServices](https://developer.apple.com/documentation/AuthenticationServices) covers Sign in with Apple, passkeys, password and web authentication. Credentials live behind a Keychain adapter while profile data, caches, and durable policy remain in their correct owners.

Apple's [passkey guidance](https://developer.apple.com/documentation/authenticationservices/supporting-passkeys) requires a server challenge and associated domain; authentication is therefore modeled as a client/server ceremony, not a local SDK toggle. High-risk server access may add [App Attest](https://developer.apple.com/documentation/devicecheck/validating-apps-that-connect-to-your-server), whose challenge and assertion validation remains server-side.

Apple's [testing guidance](https://developer.apple.com/documentation/xcode/testing) recommends many isolated unit tests, fewer integration tests, and focused UI tests. Xcode 16 includes Swift Testing for direct code tests while XCTest remains the UI automation path. The toolkit separates those layers with test plans and retains physical-device proof for real capabilities.

A valid [`PrivacyInfo.xcprivacy`](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk) belongs in the target resources. Apple also requires approved reasons for covered APIs, as documented in [required-reason API guidance](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api). Privacy declarations are now part of project detection and release review.

[Universal links](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content) establish a verified two-way association between app and website. Deep-link testing must cover cold start, active scene, signed-out handoff, and post-auth return.

[TestFlight](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/) supports beta distribution, feedback, and metrics before App Review. The workflow treats TestFlight as an observed release gate while retaining explicit human authority over external distribution and submission.

## Product decisions

1. Native iOS has its own `ios-native-app` skill and references.
2. The installer recognizes Xcode projects, workspaces, Swift packages, shared schemes, build settings, entitlements, privacy manifests, tests, and Apple capabilities.
3. The audit speaks Swift: Observation, actor isolation, direct networking in views, secret storage, typed navigation, and privacy/test readiness.
4. Executable Swift examples prove versioned writes, replay safety, offline outboxes, and identity-scoped cache cleanup without binding the patterns to a UI framework.
5. SwiftUI templates demonstrate composition and Apple semantics while remaining adaptable to UIKit and existing project conventions.
6. Release readiness is a ladder from pure Swift proof to simulator, physical device, archive, TestFlight, and App Store operations.
