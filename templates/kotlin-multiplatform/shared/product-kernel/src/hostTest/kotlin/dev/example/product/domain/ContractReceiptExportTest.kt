package dev.example.product.domain

import java.io.File
import kotlin.test.Test

class ContractReceiptExportTest {
    @Test
    fun exportCanonicalReceiptsWhenRequested() {
        val destination = System.getProperty("product.receipts").orEmpty()
        if (destination.isBlank()) return
        val receipts = generatedWorkItemVectors.joinToString(",") { vector ->
            val item = WorkItem("work-1", "Launch", vector.initialStage, vector.initialRevision)
            val command = TransitionCommand(vector.operationId, item.id, vector.expectedRevision, vector.nextStage)
            val decision = WorkItemPolicy.decide(item, command)
            val kind = when (decision) {
                TransitionDecision.Allowed -> "APPLIED"
                is TransitionDecision.Rejected -> if (decision.code == "STALE_REVISION") "CONFLICT" else "REJECTED"
            }
            val result = if (decision is TransitionDecision.Allowed) item.copy(stage = command.nextStage, revision = item.revision + 1) else item
            "{\"id\":\"${vector.id}\",\"kind\":\"$kind\",\"stage\":\"${result.stage}\",\"revision\":${result.revision}}"
        }
        val json = "{\"featureDigest\":\"${GeneratedWorkItemPolicy.sourceSha256}\",\"vectorDigest\":\"$workItemVectorSourceSha256\",\"receipts\":[$receipts]}"
        File(destination).also { it.parentFile.mkdirs() }.writeText("$json\n")
    }
}
