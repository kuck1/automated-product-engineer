package dev.example.app

interface WorkItemRepository {
    fun observe(id: String): kotlinx.coroutines.flow.Flow<WorkItemSnapshot>
    suspend fun requestTransition(id: String, expectedRevision: Long, operationId: String)
}

data class WorkItemSnapshot(
    val id: String,
    val title: String,
    val stage: String,
    val revision: Long,
    val pending: Boolean,
)

data class AppEnvironment(
    val workItems: WorkItemRepository,
)

// Construct the environment once at the application composition root with
// application-owned Room, network, identity, clock, and worker adapters.
