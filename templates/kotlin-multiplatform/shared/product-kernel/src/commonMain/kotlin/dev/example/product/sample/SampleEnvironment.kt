package dev.example.product.sample

import dev.example.product.application.OperationIdSource
import dev.example.product.application.ProductTelemetry
import dev.example.product.application.TransitionOutcome
import dev.example.product.application.WorkItemRepository
import dev.example.product.domain.TransitionCommand
import dev.example.product.domain.TransitionDecision
import dev.example.product.domain.WorkItem
import dev.example.product.domain.WorkItemPolicy
import dev.example.product.domain.WorkStage
import dev.example.product.feature.WorkItemController
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

private class SampleWorkItemRepository : WorkItemRepository {
    private val lock = Mutex()
    private val state = MutableStateFlow(WorkItem("work-1", "Ship the shared product kernel", WorkStage.VALIDATING, 7))
    private val completedOperations = mutableMapOf<String, TransitionOutcome>()

    override fun observe(id: String): Flow<WorkItem> = state

    override suspend fun transition(command: TransitionCommand): TransitionOutcome = lock.withLock {
        completedOperations[command.operationId]?.let { return@withLock it }
        val current = state.value
        val outcome = when (val decision = WorkItemPolicy.decide(current, command)) {
            TransitionDecision.Allowed -> TransitionOutcome.Confirmed(
                current.copy(stage = command.nextStage, revision = current.revision + 1),
            )
            is TransitionDecision.Rejected -> if (decision.code == "STALE_REVISION") {
                TransitionOutcome.Conflict(current)
            } else {
                TransitionOutcome.Rejected(current, decision.code)
            }
        }
        if (outcome is TransitionOutcome.Confirmed) state.value = outcome.item
        completedOperations[command.operationId] = outcome
        outcome
    }
}

private class SampleOperationIds : OperationIdSource {
    private var value = 0L
    override fun next(): String = "sample-${++value}"
}

private object SampleTelemetry : ProductTelemetry {
    override fun record(name: String, properties: Map<String, String>) = Unit
}

/** Preview/demo composition root. Production apps replace every adapter. */
fun sampleWorkItemController(): WorkItemController = WorkItemController(
    workItemId = "work-1",
    repository = SampleWorkItemRepository(),
    operationIds = SampleOperationIds(),
    telemetry = SampleTelemetry,
)
