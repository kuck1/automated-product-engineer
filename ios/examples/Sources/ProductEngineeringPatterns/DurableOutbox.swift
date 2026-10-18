import Foundation

public struct PendingOperation: Codable, Equatable, Identifiable, Sendable {
    public enum State: String, Codable, Sendable { case queued, syncing, conflicted, failed }
    public let id: UUID
    public let accountID: String
    public let entityID: UUID
    public let expectedRevision: Int
    public let payload: Data
    public var state: State
    public var attempts: Int

    public init(id: UUID, accountID: String, entityID: UUID, expectedRevision: Int, payload: Data) {
        self.id = id
        self.accountID = accountID
        self.entityID = entityID
        self.expectedRevision = expectedRevision
        self.payload = payload
        self.state = .queued
        self.attempts = 0
    }
}

public actor DurableOutbox {
    private var operations: [PendingOperation]

    public init(restored: [PendingOperation] = []) { operations = restored }

    public func enqueue(_ operation: PendingOperation) {
        guard !operations.contains(where: { $0.id == operation.id }) else { return }
        operations.append(operation)
    }

    public func next(for accountID: String) -> PendingOperation? {
        operations.first { $0.accountID == accountID && ($0.state == .queued || $0.state == .failed) }
    }

    public func begin(_ id: UUID) {
        update(id) { $0.state = .syncing; $0.attempts += 1 }
    }

    public func fail(_ id: UUID, conflict: Bool) {
        update(id) { $0.state = conflict ? .conflicted : .failed }
    }

    public func confirm(_ id: UUID) { operations.removeAll { $0.id == id } }

    public func snapshot(for accountID: String) -> [PendingOperation] {
        operations.filter { $0.accountID == accountID }
    }

    private func update(_ id: UUID, _ change: (inout PendingOperation) -> Void) {
        guard let index = operations.firstIndex(where: { $0.id == id }) else { return }
        change(&operations[index])
    }
}
