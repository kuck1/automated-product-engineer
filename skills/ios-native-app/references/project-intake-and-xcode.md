# Project intake and Xcode

## Inventory before edits

Run the toolkit doctor, then inspect `.xcworkspace` before `.xcodeproj` when both exist. Map application, extension, framework, widget, test, and UI-test targets to their schemes and bundle identifiers. Record package dependencies, deployment targets, supported destinations, configurations, `.xcconfig` files, code-signing ownership, entitlements, Info.plist sources, asset catalogs, localization, and generated code.

Prefer a shared application scheme. A local-only scheme makes command-line builds and CI depend on one developer's user data. Do not regenerate an Xcode project or resolve package versions broadly just to make a focused feature build.

## Select boundaries from behavior

Begin with a user journey and trace `Scene/App -> navigation -> View -> observable feature model -> service protocol -> actor/repository -> server`. Preserve a UIKit application shell when it is stable; host SwiftUI incrementally with `UIHostingController`, and wrap required UIKit views with representables. Do not rewrite controllers merely to claim SwiftUI adoption.

Split a module when it has a stable capability boundary, independent tests, and a dependency direction worth enforcing. Avoid one package per screen and avoid a global “Core” module that accumulates unrelated work.

## Xcode contract

- Workspace/project path and shared scheme are automation inputs.
- Build configuration selects environment; source code does not switch production behavior with ad hoc booleans.
- Bundle identifiers, associated domains, URL types, app groups, Keychain groups, push environments, and background modes agree across target settings, entitlements, provider consoles, and the server.
- Secrets never live in `.xcconfig`, Info.plist, source, or the app bundle. Public API origins and client identifiers may be configuration.
- Swift Package versions are reviewed changes. Validate transitive privacy manifests and signatures where required.

## Launch and diagnose

`pnpm dlx automated-product-engineer launch` opens the detected workspace, project, or Swift package. Use the shared scheme and a named simulator or device for build evidence. When builds differ between Xcode and CI, compare selected Xcode, scheme, destination, configuration, package resolution, environment, signing, and generated files before clearing caches.

Capture the exact `xcodebuild` command for CI. Use a fresh DerivedData directory to distinguish stale local artifacts from source defects; do not make cache deletion the first or only diagnosis.
