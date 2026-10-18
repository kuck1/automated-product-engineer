package dev.example.product.domain

import kotlinx.serialization.Serializable

@Serializable
enum class WorkStage { DRAFT, VALIDATING, READY, BLOCKED }

@Serializable
data class WorkItem(
    val id: String,
    val title: String,
    val stage: WorkStage,
    val revision: Long,
)

@Serializable
data class TransitionCommand(
    val operationId: String,
    val workItemId: String,
    val expectedRevision: Long,
    val nextStage: WorkStage,
)

sealed interface TransitionDecision {
    data object Allowed : TransitionDecision
    data class Rejected(val code: String) : TransitionDecision
}

object WorkItemPolicy {
    fun decide(item: WorkItem, command: TransitionCommand): TransitionDecision = when {
        item.id != command.workItemId -> TransitionDecision.Rejected("WRONG_AGGREGATE")
        item.revision != command.expectedRevision -> TransitionDecision.Rejected("STALE_REVISION")
        !GeneratedWorkItemPolicy.isAllowed(item.stage, command.nextStage) -> TransitionDecision.Rejected("INVALID_TRANSITION")
        else -> TransitionDecision.Allowed
    }
}
