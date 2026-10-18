package dev.automatedproductengineer.patterns

enum class OutboxState { PENDING, IN_FLIGHT, CONFLICT, FAILED }

data class OutboxOperation(
    val operationId: String,
    val subjectId: String,
    val aggregateId: String,
    val expectedRevision: Long,
    val payload: String,
    val attempts: Int = 0,
    val state: OutboxState = OutboxState.PENDING,
    val lastError: String? = null,
)

class DurableOutbox {
    private val operations = linkedMapOf<String, OutboxOperation>()

    @Synchronized
    fun enqueue(operation: OutboxOperation): OutboxOperation =
        operations.getOrPut(operation.operationId) { operation }

    @Synchronized
    fun claim(subjectId: String): OutboxOperation? {
        val next = operations.values.firstOrNull {
            it.subjectId == subjectId && it.state == OutboxState.PENDING
        } ?: return null
        return next.copy(attempts = next.attempts + 1, state = OutboxState.IN_FLIGHT)
            .also { operations[it.operationId] = it }
    }

    @Synchronized
    fun retry(operationId: String, reason: String) {
        operations[operationId]?.let {
            operations[operationId] = it.copy(state = OutboxState.PENDING, lastError = reason)
        }
    }

    @Synchronized
    fun conflict(operationId: String, reason: String) {
        operations[operationId]?.let {
            operations[operationId] = it.copy(state = OutboxState.CONFLICT, lastError = reason)
        }
    }

    @Synchronized
    fun acknowledge(operationId: String) {
        operations.remove(operationId)
    }

    @Synchronized
    fun snapshot(): List<OutboxOperation> = operations.values.toList()
}
