# Field Relay — native Android reference

Field Relay coordinates incident response where technicians work through unreliable connectivity while dispatch, safety, and customers watch the same job. Android is the field instrument: scan an asset, capture evidence, complete a guarded step, queue it offline, and reconcile with the server without losing who performed the work.

## Product journeys

1. A technician signs in through Credential Manager and opens a verified assignment link.
2. The app resolves the authenticated subject and assignment from the backend, then projects the canonical Room record.
3. The technician scans the asset, records a safety check, attaches evidence, and taps complete.
4. The repository commits an outbox operation and optimistic projection in one Room transaction.
5. Unique WorkManager work sends the stable operation ID and expected revision when connectivity allows.
6. The server rechecks membership, transition policy, evidence, and revision, then returns a canonical assignment.
7. The app reconciles success, conflict, or rejected policy; dispatch receives the canonical update through realtime invalidation.
8. Logout or account switch cancels subject-scoped work and clears protected projections while retaining only data allowed by retention policy.

## Ownership

| Concern | Owner |
| --- | --- |
| expanded evidence row, scanner overlay | local Compose state |
| assignment screen state and intent | destination `ViewModel` |
| observable assignment and outbox projection | repository backed by Room |
| retry and connectivity constraints | unique WorkManager job |
| camera permission and scanner | capability adapter |
| credential selection and App Link entry | identity/navigation adapters |
| membership, policy, revision, idempotency | authenticated server service |
| audit and durable shared truth | server database |

## Failure stories

- Two devices complete the same assignment from revision 8. The first succeeds; the second receives revision 9 and a conflict instead of overwriting it.
- Connectivity disappears after local commit. The operation remains visible as queued and resumes after process death.
- Credential refresh fails while work is queued. The worker stops without sending under another subject and the UI asks the technician to sign in again.
- Camera permission is denied permanently. Manual asset entry remains available with a route to Settings.
- An App Link opens an assignment outside the subject's workspace. Navigation shows a safe unavailable state; the server reveals no record.

Adapt the executable contracts in [`android/examples`](../../examples/) and the integration patterns in [`templates/android`](../../../templates/android/). Keep the server service and persistence adapters application-owned.
