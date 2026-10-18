package dev.automatedproductengineer.patterns

enum class WorkStage { DRAFT, VALIDATING, READY, BLOCKED }

data class WorkItem(
    val id: String,
    val stage: WorkStage,
    val revision: Long,
)

sealed interface TransitionResult {
    data class Applied(val item: WorkItem) : TransitionResult
    data class Conflict(val canonical: WorkItem) : TransitionResult
    data class Replayed(val item: WorkItem) : TransitionResult
    data class Rejected(val item: WorkItem, val reason: String) : TransitionResult
}

class VersionedWorkItemStore(initial: WorkItem) {
    private var current = initial
    private val completedOperations = mutableMapOf<String, WorkItem>()

    @Synchronized
    fun snapshot(): WorkItem = current

    @Synchronized
    fun transition(
        operationId: String,
        expectedRevision: Long,
        nextStage: WorkStage,
    ): TransitionResult {
        completedOperations[operationId]?.let { return TransitionResult.Replayed(it) }
        if (current.revision != expectedRevision) return TransitionResult.Conflict(current)
        if (nextStage !in allowedTransitions.getValue(current.stage)) {
            return TransitionResult.Rejected(current, "${current.stage} cannot transition to $nextStage")
        }

        current = current.copy(stage = nextStage, revision = current.revision + 1)
        completedOperations[operationId] = current
        return TransitionResult.Applied(current)
    }

    private companion object {
        val allowedTransitions = mapOf(
            WorkStage.DRAFT to setOf(WorkStage.VALIDATING),
            WorkStage.VALIDATING to setOf(WorkStage.READY, WorkStage.BLOCKED),
            WorkStage.BLOCKED to setOf(WorkStage.VALIDATING),
            WorkStage.READY to emptySet(),
        )
    }
}
