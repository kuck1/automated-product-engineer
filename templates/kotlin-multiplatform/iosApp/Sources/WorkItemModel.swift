import Combine
import Foundation
import ProductKernel

@MainActor
final class WorkItemModel: ObservableObject {
    @Published private(set) var state: WorkItemFeatureState
    private let controller: WorkItemController
    private var cancellation: Cancellation?

    init(controller: WorkItemController) {
        self.controller = controller
        self.state = controller.currentState()
        self.cancellation = controller.subscribe { [weak self] next in
            Task { @MainActor in self?.state = next }
        }
    }

    func markReady() { controller.requestStage(stageName: "READY") }

    deinit {
        cancellation?.cancel()
        controller.close()
    }
}
