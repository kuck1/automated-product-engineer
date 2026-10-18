import Observation
import SwiftUI

@MainActor
@Observable
final class WorkItemModel {
    enum Phase: Equatable { case idle, loading, ready(WorkItemDTO), failed(message: String) }

    private let id: UUID
    private let service: any WorkItemService
    var phase: Phase = .idle

    init(id: UUID, service: any WorkItemService) { self.id = id; self.service = service }

    func load() async {
        phase = .loading
        do { phase = .ready(try await service.item(id: id)) }
        catch is CancellationError { return }
        catch { phase = .failed(message: "We couldn't load this item. Try again.") }
    }
}

struct WorkItemScreen: View {
    @State private var model: WorkItemModel

    init(id: UUID, service: any WorkItemService) {
        _model = State(initialValue: WorkItemModel(id: id, service: service))
    }

    var body: some View {
        Group {
            switch model.phase {
            case .idle, .loading: ProgressView("Loading")
            case let .ready(item): Text(item.title).font(.headline)
            case let .failed(message): ContentUnavailableView("Unable to load", systemImage: "exclamationmark.triangle", description: Text(message))
            }
        }
        .navigationTitle("Work item")
        .task { await model.load() }
    }
}
