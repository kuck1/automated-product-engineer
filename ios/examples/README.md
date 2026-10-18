# Executable native iOS patterns

This Swift package isolates invariants that are easy to obscure inside SwiftUI code: versioned and idempotent writes, durable identity-scoped outboxes, and cache clearing on account transition.

```bash
swift test --package-path ios/examples
```

The types are references, not runtime dependencies for host apps. Adapt them behind the app's service and persistence protocols, then prove the same invariant in the real Xcode target and one integrated user journey.
