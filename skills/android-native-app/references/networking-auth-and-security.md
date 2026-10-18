# Networking, authentication, and security

## Transport boundary

Put HTTP construction, serialization, authentication headers, refresh coordination, retries, timeouts, and error normalization behind a repository or remote data source. Composables and fragments render typed state; they do not create Retrofit or OkHttp clients. Cancel replaceable reads and never retry non-idempotent writes without a stable operation ID or server contract.

Use TLS endpoints, Network Security Configuration for explicit exceptions, and certificate pinning only with a documented rotation and recovery plan. Log request IDs and safe diagnostics, never credentials or sensitive response bodies.

## Credential Manager and federation

Use Credential Manager for passkeys, passwords, and Sign in with Google. Obtain passkey creation and authentication challenges from the backend and send results back for server verification. Configure Digital Asset Links for the exact package name and signing certificate. For browser OAuth, use Authorization Code with PKCE through a maintained standards-based client and a verified HTTPS callback; do not embed provider client secrets in the APK or intercept credentials in a WebView.

Treat the backend session subject as the identity boundary. Coordinate refresh so only one request rotates credentials, queue dependent requests, reject stale refresh results, and clear identity-scoped Room rows, memory caches, WebView cookies where relevant, notifications, and pending work according to explicit product policy on logout or account switch.

Use Android Keystore to protect local cryptographic keys when local protection is required. It does not turn a bundled server secret into a secret. SharedPreferences and plain DataStore are not credential stores.

## App Links

Use verified HTTPS Android App Links for production routes and custom schemes only when an integration requires them. Keep `assetlinks.json`, package name, release signing certificate, manifest intent filters, backend callback allow-list, and navigation parser aligned. Test cold, warm, signed-out, expired-session, duplicate, malformed, and unauthorized links.

## Authorization and integrity

The server re-authenticates every protected request, resolves tenancy, checks ownership and role, validates revisions and idempotency, and returns a canonical DTO. Client checks improve UX only.

Play Integrity is an abuse signal, not authentication. Bind standard verdict requests to a digest of the protected request, send the token to the backend, verify it through Google Play, and apply tiered server policy. Never trust or decrypt a verdict solely on-device.

## Random logout diagnostic

Capture a correlated timeline without logging secrets:

1. app process and activity lifecycle;
2. credential read, expiry, refresh start/end, and refresh owner;
3. network request ID, status, retry, and clock skew;
4. account subject before and after refresh;
5. cache clear, WorkManager execution, and notification/deep-link entry;
6. server revocation, cookie/token policy, and concurrent-device behavior.

Reproduce cold start, process death, background expiry, network loss during refresh, concurrent 401s, account switch, device clock change, backup/restore, and provider cancellation. Fix the owner or policy; do not mask it with infinite refresh retries.
