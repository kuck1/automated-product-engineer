import Observation
import SwiftUI

@MainActor
@Observable
final class AppEnvironment {
    enum Session: Equatable { case restoring, signedOut, signedIn(accountID: String) }

    var session: Session = .restoring
    let workItems: any WorkItemService

    init(workItems: any WorkItemService) { self.workItems = workItems }

    func restoreSession() async {
        // Read the minimal credential from a Keychain adapter, validate or refresh once,
        // then publish one identity transition and clear outgoing identity-scoped data.
        session = .signedOut
    }
}

protocol WorkItemService: Sendable {
    func item(id: UUID) async throws -> WorkItemDTO
    func update(id: UUID, expectedRevision: Int, operationID: UUID, title: String) async throws -> WorkItemDTO
}

struct WorkItemDTO: Codable, Equatable, Sendable {
    let id: UUID
    let title: String
    let revision: Int
}
