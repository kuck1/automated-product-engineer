package dev.automatedproductengineer.patterns

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNull

class PatternsTest {
    @Test
    fun duplicateOperationReplaysWithoutIncrementingRevision() {
        val store = VersionedWorkItemStore(WorkItem("release-1", WorkStage.DRAFT, 4))
        val first = store.transition("operation-1", 4, WorkStage.VALIDATING)
        val replay = store.transition("operation-1", 4, WorkStage.VALIDATING)

        assertEquals(5, assertIs<TransitionResult.Applied>(first).item.revision)
        assertEquals(5, assertIs<TransitionResult.Replayed>(replay).item.revision)
        assertEquals(5, store.snapshot().revision)
    }

    @Test
    fun staleRevisionReturnsCanonicalConflict() {
        val store = VersionedWorkItemStore(WorkItem("release-1", WorkStage.VALIDATING, 8))
        val result = store.transition("operation-2", 7, WorkStage.READY)

        assertEquals(8, assertIs<TransitionResult.Conflict>(result).canonical.revision)
    }

    @Test
    fun outboxDeduplicatesAndRetriesWithoutChangingOperationIdentity() {
        val outbox = DurableOutbox()
        val operation = OutboxOperation("operation-3", "user-1", "release-1", 8, "READY")
        outbox.enqueue(operation)
        outbox.enqueue(operation)

        val claimed = requireNotNull(outbox.claim("user-1"))
        outbox.retry(claimed.operationId, "offline")

        assertEquals(1, outbox.snapshot().size)
        assertEquals(1, outbox.snapshot().single().attempts)
        assertEquals(OutboxState.PENDING, outbox.snapshot().single().state)
    }

    @Test
    fun accountSwitchClearsProtectedProjection() {
        val cache = IdentityScopedCache<String>()
        cache.activate("user-1")
        cache.put("user-1", "points", "40")
        cache.activate("user-2")

        assertNull(cache.get("user-2", "points"))
    }
}
