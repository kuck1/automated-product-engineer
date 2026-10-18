# Field Relay in native Swift

Use the executable outbox and versioned-write patterns in `ios/examples` to implement the Field Relay mission workflow in a native app. The product journey remains: record a field observation offline, show that it is saved on this device, resume after termination, sync under the active identity, and surface a second-device revision conflict without discarding either account of what happened.

A SwiftUI implementation owns presentation in local state, coordinates the mission with an `@Observable @MainActor` model, persists operations through an actor-backed repository, and delegates authorization and canonical revision changes to the server. A background task may attempt a drain, but foreground reconciliation remains required because background execution is opportunistic.

Proof includes a Swift Testing domain suite, persistence reconstruction, two-writer conflict, XCUI offline/reconnect journey, Dynamic Type and VoiceOver inspection, and a physical-device background/resume pass.
