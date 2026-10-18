import Foundation
import Testing
@testable import ProductEngineeringPatterns

@Test("duplicate mutation returns its first canonical result")
func duplicateReplay() async throws {
    let item = WorkItem(id: UUID(), title: "Draft", points: 1)
    let store = VersionedWorkItemStore(item)
    let operationID = UUID()
    let first = try await store.apply(.init(operationID: operationID, expectedRevision: 0, title: "Ready", points: 8))
    let replay = try await store.apply(.init(operationID: operationID, expectedRevision: 0, title: "Ignored", points: 99))
    #expect(first == replay)
    #expect(replay.revision == 1)
}

@Test("stale new work conflicts with the canonical snapshot")
func staleWriteConflicts() async throws {
    let item = WorkItem(id: UUID(), title: "Draft", points: 1)
    let store = VersionedWorkItemStore(item)
    _ = try await store.apply(.init(operationID: UUID(), expectedRevision: 0, title: "Ready", points: 8))
    do {
        _ = try await store.apply(.init(operationID: UUID(), expectedRevision: 0, title: "Stale", points: 2))
        Issue.record("Expected a revision conflict")
    } catch MutationError.conflict(let current) {
        #expect(current.title == "Ready")
        #expect(current.revision == 1)
    }
}

@Test("queued work survives reconstruction and stays identity scoped")
func durableIdentityScopedOutbox() async {
    let operation = PendingOperation(id: UUID(), accountID: "account-a", entityID: UUID(), expectedRevision: 3, payload: Data("change".utf8))
    let restored = DurableOutbox(restored: [operation])
    #expect(await restored.next(for: "account-a")?.id == operation.id)
    #expect(await restored.next(for: "account-b") == nil)
    await restored.begin(operation.id)
    #expect(await restored.snapshot(for: "account-a").first?.attempts == 1)
    await restored.confirm(operation.id)
    #expect(await restored.snapshot(for: "account-a").isEmpty)
}

@Test("account transition clears protected projections")
func identityTransitionClearsCache() async {
    let cache = IdentityScopedCache<String>()
    await cache.transition(to: "a")
    await cache.store("private-a", for: "profile", identity: "a")
    #expect(await cache.value(for: "profile", identity: "a") == "private-a")
    await cache.transition(to: "b")
    #expect(await cache.value(for: "profile", identity: "b") == nil)
    #expect(await cache.value(for: "profile", identity: "a") == nil)
}
