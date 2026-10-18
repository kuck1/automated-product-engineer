import ProductKernel
import SwiftUI

@main
struct ProductApp: App {
    var body: some Scene {
        WindowGroup {
            WorkItemScreen(
                model: WorkItemModel(controller: SampleEnvironmentKt.sampleWorkItemController())
            )
        }
    }
}
