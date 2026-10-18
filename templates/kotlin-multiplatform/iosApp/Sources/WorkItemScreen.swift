import SwiftUI

struct WorkItemScreen: View {
    @StateObject var model: WorkItemModel

    var body: some View {
        VStack(alignment: .leading, spacing: DesignTokens.spaceControl) {
            if model.state.loading {
                ProgressView()
            } else {
                Text(model.state.title).font(.title)
                Text("\(model.state.stage) · revision \(model.state.revision)")
                if model.state.queued { Text("Saved on this device; waiting to sync.") }
                if let message = model.state.message { Text(message).foregroundStyle(.red) }
                Button(model.state.submitting ? "Submitting" : "Mark ready") {
                    model.markReady()
                }
                .disabled(model.state.submitting)
            }
        }
        .padding(DesignTokens.spacePage)
    }
}
