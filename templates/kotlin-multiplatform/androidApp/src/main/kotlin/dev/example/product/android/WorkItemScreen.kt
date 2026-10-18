package dev.example.product.android

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.example.product.design.GeneratedTokens
import dev.example.product.feature.WorkItemController

@Composable
fun WorkItemRoute(controller: WorkItemController, modifier: Modifier = Modifier) {
    val state by controller.state.collectAsStateWithLifecycle()
    Column(
        modifier = modifier.fillMaxSize().padding(GeneratedTokens.spacePage.dp),
        verticalArrangement = Arrangement.spacedBy(GeneratedTokens.spaceControl.dp),
    ) {
        if (state.loading) {
            CircularProgressIndicator(color = Color(GeneratedTokens.colorActionPrimary.toInt()))
        } else {
            Text(state.title, style = MaterialTheme.typography.headlineMedium)
            Text("${state.stage} · revision ${state.revision}")
            if (state.queued) Text("Saved on this device; waiting to sync.")
            state.message?.let { Text(it, color = MaterialTheme.colorScheme.error) }
            Button(
                onClick = { controller.requestStage("READY") },
                enabled = !state.submitting,
            ) { Text(if (state.submitting) "Submitting" else "Mark ready") }
        }
    }
}
