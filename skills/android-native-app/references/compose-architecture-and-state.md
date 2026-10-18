# Compose architecture, state, and concurrency

## State owner by lifetime

| State | Owner | Typical primitive |
| --- | --- | --- |
| gesture, focus, expanded row | smallest composable that needs it | `remember` |
| reconstructible UI element across recreation | hoisted composable state | `rememberSaveable` with a small saver |
| screen state and business actions | destination-scoped `ViewModel` | immutable `StateFlow<UiState>` |
| shared navigation-graph flow | graph-scoped state holder or ViewModel | typed route inputs plus explicit state |
| remote snapshot | repository/local source of truth | Flow from Room or network-backed store |
| small durable preference | data layer | DataStore |
| structured offline data | repository | Room transaction |
| guaranteed deferrable work | scheduler adapter | WorkManager |
| cross-user policy | backend | authenticated service and database |

Pass state down and events up. A reusable composable receives plain values and callbacks; it does not fetch, navigate, or own a screen ViewModel. Keep `Context`, `Activity`, `NavController`, and lifecycle objects out of ViewModels. Pass stable identifiers through typed routes and load current data at the destination.

Model loading, empty, partial, content, refreshing, validation, recoverable failure, authorization loss, and terminal failure deliberately. For user-visible one-time outcomes, prefer state that remains true until the UI acknowledges it; a `SharedFlow` emission can disappear while no collector is active.

## Races and optimistic changes

For every write, choose the policy before code:

- **latest intent wins** for search and replaceable previews: cancel the prior job and reject stale completion;
- **versioned write** for collaborative records: send expected revision and stable operation ID; treat conflict as data;
- **serialized transition** for workflows: guard through a mutex or actor-like owner locally and recheck policy on the server;
- **durable outbox** for offline intent: persist before acknowledging, retry with backoff, deduplicate on operation ID, and reconcile with the canonical response.

Optimistic UI is a projection, not durable truth. Snapshot affected state, update every visible projection, disable or merge duplicate intent, roll back on failure, and replace it with the server DTO on success.

## Coroutines and Flow

Use `viewModelScope` for screen-owned work and `repeatOnLifecycle` or `collectAsStateWithLifecycle` at the UI. Inject dispatchers into data boundaries that perform blocking work. Avoid `GlobalScope`, anonymous application-wide scopes, unbounded `launch`, swallowed `CancellationException`, and mutable objects crossing threads.

Use `stateIn` with a deliberate sharing policy for repository streams. Use `combine` for derived state instead of copying derived values into mutable fields. Use `flatMapLatest` for replaceable reads. Use `Mutex` only around the smallest invariant; do not hold it across arbitrary UI callbacks. Prefer database transactions and server preconditions for durable correctness.

## Process death and multiple windows

ViewModel survives configuration change, not process death. Put only small reconstruction inputs in `SavedStateHandle`; rebuild from repositories. Do not serialize entire model graphs into navigation or saved state. Treat multiple activities, windows, widgets, notifications, and other devices as concurrent clients of the same canonical data.

Views follow the same ownership rules: collect Flow with `repeatOnLifecycle`, keep fragment view bindings at the view lifecycle, and use screen-level ViewModels rather than putting business state in custom views.
