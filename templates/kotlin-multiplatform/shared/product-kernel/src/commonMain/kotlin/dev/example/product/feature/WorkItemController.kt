package dev.example.product.feature

import dev.example.product.application.OperationIdSource
import dev.example.product.application.ProductTelemetry
import dev.example.product.application.TransitionOutcome
import dev.example.product.application.WorkItemRepository
import dev.example.product.domain.TransitionCommand
import dev.example.product.domain.WorkItem
import dev.example.product.domain.WorkStage
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

data class WorkItemFeatureState(
    val loading: Boolean = true,
    val title: String = "",
    val stage: String = "",
    val revision: Long = 0,
    val submitting: Boolean = false,
    val queued: Boolean = false,
    val message: String? = null,
)

fun interface Cancellation {
    fun cancel()
}

class WorkItemController(
    private val workItemId: String,
    private val repository: WorkItemRepository,
    private val operationIds: OperationIdSource,
    private val telemetry: ProductTelemetry,
    dispatcher: CoroutineDispatcher = Dispatchers.Main,
) {
    private val scope = CoroutineScope(SupervisorJob() + dispatcher)
    private val mutableState = MutableStateFlow(WorkItemFeatureState())
    val state: StateFlow<WorkItemFeatureState> = mutableState.asStateFlow()

    init {
        scope.launch {
            repository.observe(workItemId).collectLatest { item ->
                mutableState.value = mutableState.value.from(item).copy(loading = false)
            }
        }
    }

    fun currentState(): WorkItemFeatureState = state.value

    fun subscribe(observer: (WorkItemFeatureState) -> Unit): Cancellation {
        val job = scope.launch { state.collect(observer) }
        return Cancellation { job.cancel() }
    }

    fun requestStage(stageName: String) {
        val stage = runCatching { WorkStage.valueOf(stageName) }.getOrNull() ?: run {
            mutableState.value = mutableState.value.copy(message = "Unknown stage")
            return
        }
        val snapshot = mutableState.value
        if (snapshot.loading || snapshot.submitting) return
        scope.launch {
            mutableState.value = snapshot.copy(submitting = true, message = null)
            val command = TransitionCommand(operationIds.next(), workItemId, snapshot.revision, stage)
            try {
                val outcome = repository.transition(command)
                when (outcome) {
                    is TransitionOutcome.Confirmed -> mutableState.value = mutableState.value.from(outcome.item).copy(submitting = false)
                    is TransitionOutcome.Queued -> mutableState.value = mutableState.value.from(outcome.optimistic).copy(submitting = false, queued = true)
                    is TransitionOutcome.Conflict -> mutableState.value = mutableState.value.from(outcome.canonical).copy(submitting = false, message = "Updated elsewhere. Review the latest version.")
                    is TransitionOutcome.Rejected -> mutableState.value = mutableState.value.from(outcome.canonical).copy(submitting = false, message = outcome.code)
                }
                telemetry.record("work_item_transition_finished", mapOf("result" to outcomeName(outcome)))
            } catch (cancellation: CancellationException) {
                throw cancellation
            } catch (_: Exception) {
                mutableState.value = mutableState.value.copy(submitting = false, message = "The change could not be completed.")
                telemetry.record("work_item_transition_failed", emptyMap())
            }
        }
    }

    fun close() = scope.cancel()

    private fun WorkItemFeatureState.from(item: WorkItem) = copy(
        title = item.title,
        stage = item.stage.name,
        revision = item.revision,
        queued = false,
        message = null,
    )

    private fun outcomeName(outcome: TransitionOutcome): String = when (outcome) {
        is TransitionOutcome.Confirmed -> "confirmed"
        is TransitionOutcome.Queued -> "queued"
        is TransitionOutcome.Conflict -> "conflict"
        is TransitionOutcome.Rejected -> "rejected"
    }
}
