// Generated from contracts/scenarios/work-item.vectors.json. Do not edit.
package dev.example.product.domain

data class WorkItemVector(
    val id: String,
    val initialStage: WorkStage,
    val initialRevision: Long,
    val operationId: String,
    val expectedRevision: Long,
    val nextStage: WorkStage,
    val expectedKind: String,
    val expectedStage: WorkStage,
    val expectedResultRevision: Long,
)

const val workItemVectorSourceSha256: String = "d4ae5da2d0805906814336ce8e2b62884e6f3aaf67c137207fb8c4f567862dae"
val generatedWorkItemVectors = listOf(
    WorkItemVector("draft-begins-validation", WorkStage.DRAFT, 4L, "op-1", 4L, WorkStage.VALIDATING, "APPLIED", WorkStage.VALIDATING, 5L),
    WorkItemVector("stale-write-returns-canonical", WorkStage.VALIDATING, 7L, "op-2", 6L, WorkStage.READY, "CONFLICT", WorkStage.VALIDATING, 7L),
    WorkItemVector("ready-is-terminal", WorkStage.READY, 8L, "op-3", 8L, WorkStage.VALIDATING, "REJECTED", WorkStage.READY, 8L),
)
