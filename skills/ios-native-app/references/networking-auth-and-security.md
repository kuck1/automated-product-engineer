# Networking, authentication, and security

## Networking contract

Wrap `URLSession` behind a small `Sendable` protocol. Construct typed requests centrally, pass cancellation through async calls, validate HTTP status and content type, decode a typed success or normalized server error, and return canonical DTOs. Retry only safe reads or writes with a stable idempotency key. Honor server retry guidance and bound backoff.

Keep TLS trust evaluation on system defaults unless a documented threat model justifies more. Certificate pinning adds rotation and recovery risk; it is a product and operations decision, not decorative hardening.

## Authentication choices

Prefer AuthenticationServices for Sign in with Apple, passkeys, and web authentication sessions. OAuth uses PKCE, a cryptographic state value, an ephemeral session where appropriate, and a registered callback or universal link. Exchange authorization codes on the server when a client secret would otherwise be required.

The server session is authority. Store only the minimal refresh or device credential in Keychain with an accessibility class matching background requirements. Keep profile and entitlement data out of Keychain. At launch and foreground, restore locally, validate or refresh once through a single-flight coordinator, then publish one session transition.

For Sign in with Apple, persist the stable provider subject; name and email may only be returned at first authorization. Check credential state and handle revoked or transferred accounts. For passkeys, bind challenges and relying-party identifiers on the server and verify assertions there.

## Random logout diagnostic

Trace one timeline across scene transitions, Keychain reads, refresh requests, server cookie/token expiry, clock, network, and competing refreshes. Look for duplicate refresh calls, refresh-token rotation without atomic replacement, Keychain accessibility that blocks background access, environment or bundle-ID mismatch, lost cookies in custom URLSession configuration, account changes that do not clear caches, and revoked provider credentials. Add structured reason codes without logging tokens.

## Trust boundaries

- Never ship service-role, private, signing, or provider secrets in the bundle.
- Authorization checks actor, object, tenant, and action on the server; UI visibility is only presentation.
- Universal links require the associated-domain entitlement and a valid site association. Custom schemes need strict callback parsing and state verification.
- App Attest can raise confidence for sensitive server requests, but the server validates challenges, attestations, assertions, counters, and environment. It complements authentication and authorization.
- Redact credentials, personal data, and sensitive request bodies from logs, analytics, crash reports, and screenshots.

Prove signed-out, expired, revoked, wrong-account, cross-tenant, cancelled-login, offline-resume, concurrent-refresh, and deep-link-reentry paths.
