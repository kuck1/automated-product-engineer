# Swift interoperability and native shells

## Export a deliberate facade

Swift should see a small feature API rather than the KMP dependency graph. A useful boundary is:

```text
FeatureController
  state() -> FeatureState
  subscribe(observer) -> Cancellation
  dispatch(FeatureIntent)
  close()
```

The Swift `@MainActor` observable wrapper owns the cancellation handle, publishes native view state, and closes the controller when its lifetime ends. Android collects the same controller state with lifecycle awareness or wraps it in an AndroidX ViewModel. Both shells invoke identical intents.

Keep names stable and Swift-readable. Avoid generic-heavy APIs, broad class hierarchies, platform collections in hot paths, and exceptions as routine outcomes. Annotate expected thrown failures deliberately; unexpected exceptions crossing the Kotlin/Native boundary can terminate the process. Test the generated header or Swift export and compile at least one Swift caller in CI.

## Platform composition

Each application creates its environment once and supplies native adapters for secure storage, auth UI, notifications, location, camera, background scheduling, telemetry transport, database construction, and deep-link navigation. Adapter interfaces describe product capability rather than OS brand names.

Keep screen layout, navigation containers, system bars, sheets, back behavior, keyboards, focus, safe areas, haptics, accessibility, text scaling, reduced motion, and platform component styling native. The shared state must contain meaning such as `saving`, `queued`, `conflicted`, and `permissionRequired`; the native shell decides how those states look and behave on its platform.

## Integration choice

Use direct Xcode integration in a monorepo when the KMP framework has no CocoaPods dependency and source changes should appear immediately. Use a local Swift package when SwiftPM ownership is important. Use CocoaPods only when the shared module requires pod integration. For independent repositories, publish a versioned XCFramework with checksums and compatibility policy.
