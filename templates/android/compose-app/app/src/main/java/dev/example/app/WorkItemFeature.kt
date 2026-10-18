package dev.example.app

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
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import java.util.UUID
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class WorkItemUiState(
    val loading: Boolean = true,
    val title: String = "",
    val stage: String = "",
    val revision: Long = 0,
    val pending: Boolean = false,
    val submitting: Boolean = false,
    val error: String? = null,
)

class WorkItemViewModel(
    private val workItemId: String,
    private val repository: WorkItemRepository,
) : ViewModel() {
    private val submitting = MutableStateFlow(false)
    private val error = MutableStateFlow<String?>(null)

    val uiState: StateFlow<WorkItemUiState> = combine(
        repository.observe(workItemId),
        submitting,
        error,
    ) { item, isSubmitting, message ->
            WorkItemUiState(
                loading = false,
                title = item.title,
                stage = item.stage,
                revision = item.revision,
                pending = item.pending,
                submitting = isSubmitting,
                error = message,
            )
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), WorkItemUiState())

    fun requestNextStage() {
        val snapshot = uiState.value
        if (snapshot.loading || snapshot.pending || snapshot.submitting) return
        viewModelScope.launch {
            submitting.value = true
            error.value = null
            try {
                repository.requestTransition(
                    id = workItemId,
                    expectedRevision = snapshot.revision,
                    operationId = UUID.randomUUID().toString(),
                )
            } catch (cancellation: CancellationException) {
                throw cancellation
            } catch (_: Exception) {
                error.value = "The change could not be queued. Try again."
            } finally {
                submitting.value = false
            }
        }
    }
}

@Composable
fun WorkItemRoute(viewModel: WorkItemViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    WorkItemScreen(state = state, onRequestNextStage = viewModel::requestNextStage)
}

@Composable
fun WorkItemScreen(
    state: WorkItemUiState,
    onRequestNextStage: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxSize().padding(ProductTheme.spacing.page),
        verticalArrangement = Arrangement.spacedBy(ProductTheme.spacing.controlGap),
    ) {
        if (state.loading) {
            CircularProgressIndicator()
            return@Column
        }
        Text(state.title, style = MaterialTheme.typography.headlineMedium)
        Text("${state.stage} · revision ${state.revision}")
        state.error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
        Button(
            onClick = onRequestNextStage,
            enabled = !state.pending && !state.submitting,
        ) {
            Text(if (state.pending) "Queued" else "Request next stage")
        }
    }
}
