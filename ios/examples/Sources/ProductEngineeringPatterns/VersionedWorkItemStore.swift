import Foundation

public struct WorkItem: Codable, Equatable, Identifiable, Sendable {
    public let id: UUID
    public var title: String
    public var points: Int
    public var revision: Int

    public init(id: UUID, title: String, points: Int, revision: Int = 0) {
        self.id = id
        self.title = title
        self.points = points
        self.revision = revision
    }
}

public struct WorkItemMutation: Sendable {
    public let operationID: UUID
    public let expectedRevision: Int
    public let title: String
    public let points: Int

    public init(operationID: UUID, expectedRevision: Int, title: String, points: Int) {
        self.operationID = operationID
        self.expectedRevision = expectedRevision
        self.title = title
        self.points = points
    }
}

public enum MutationError: Error, Equatable, Sendable {
    case conflict(current: WorkItem)
    case invalidPoints
}

public actor VersionedWorkItemStore {
    private var current: WorkItem
    private var receipts: [UUID: WorkItem] = [:]

    public init(_ initial: WorkItem) { current = initial }

    public func snapshot() -> WorkItem { current }

    public func apply(_ mutation: WorkItemMutation) throws -> WorkItem {
        if let receipt = receipts[mutation.operationID] { return receipt }
        guard mutation.expectedRevision == current.revision else { throw MutationError.conflict(current: current) }
        guard (0...100).contains(mutation.points) else { throw MutationError.invalidPoints }
        current.title = mutation.title
        current.points = mutation.points
        current.revision += 1
        receipts[mutation.operationID] = current
        return current
    }
}
