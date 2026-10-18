// Generated from contracts/features/work-item.feature.json. Do not edit.
package dev.example.product.domain

object GeneratedWorkItemPolicy {
    const val sourceSha256: String = "e34b5a8e6c4e7393efc2058265d6f57a1e925d2b3440941142e5d922b735115f"
    private val allowedTransitions = setOf(
        WorkStage.DRAFT to WorkStage.VALIDATING,
        WorkStage.VALIDATING to WorkStage.READY,
        WorkStage.VALIDATING to WorkStage.BLOCKED,
        WorkStage.BLOCKED to WorkStage.VALIDATING,
    )

    fun isAllowed(from: WorkStage, to: WorkStage): Boolean = (from to to) in allowedTransitions
}
