package dev.example.product.application

import dev.example.product.domain.TransitionCommand
import dev.example.product.domain.WorkItem
import kotlinx.coroutines.flow.Flow

sealed interface TransitionOutcome {
    data class Confirmed(val item: WorkItem) : TransitionOutcome
    data class Queued(val optimistic: WorkItem) : TransitionOutcome
    data class Conflict(val canonical: WorkItem) : TransitionOutcome
    data class Rejected(val canonical: WorkItem, val code: String) : TransitionOutcome
}

interface WorkItemRepository {
    fun observe(id: String): Flow<WorkItem>
    suspend fun transition(command: TransitionCommand): TransitionOutcome
}

interface IdentityProvider {
    val subjectId: String?
}

interface OperationIdSource {
    fun next(): String
}

interface ProductTelemetry {
    fun record(name: String, properties: Map<String, String>)
}
