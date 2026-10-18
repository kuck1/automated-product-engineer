package dev.example.product.domain

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs

class WorkItemPolicyTest {
    private val item = WorkItem("work-1", "Launch", WorkStage.VALIDATING, 7)

    @Test
    fun acceptsVersionedTransition() {
        assertIs<TransitionDecision.Allowed>(
            WorkItemPolicy.decide(item, TransitionCommand("op-1", item.id, 7, WorkStage.READY)),
        )
    }

    @Test
    fun rejectsStaleRevisionBeforeTransition() {
        val decision = WorkItemPolicy.decide(item, TransitionCommand("op-2", item.id, 6, WorkStage.READY))
        assertEquals("STALE_REVISION", assertIs<TransitionDecision.Rejected>(decision).code)
    }

    @Test
    fun canonicalScenarioVectorsRemainExecutable() {
        for (vector in generatedWorkItemVectors) {
            val current = WorkItem("work-1", "Launch", vector.initialStage, vector.initialRevision)
            val command = TransitionCommand(vector.operationId, current.id, vector.expectedRevision, vector.nextStage)
            val decision = WorkItemPolicy.decide(current, command)
            val actualKind = when (decision) {
                TransitionDecision.Allowed -> "APPLIED"
                is TransitionDecision.Rejected -> if (decision.code == "STALE_REVISION") "CONFLICT" else "REJECTED"
            }
            val result = if (decision is TransitionDecision.Allowed) current.copy(stage = command.nextStage, revision = current.revision + 1) else current
            assertEquals(vector.expectedKind, actualKind, vector.id)
            assertEquals(vector.expectedStage, result.stage, vector.id)
            assertEquals(vector.expectedResultRevision, result.revision, vector.id)
        }
    }
}
