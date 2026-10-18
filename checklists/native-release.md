# Native application release checklist

## Product and runtime

- [ ] Name the iOS, Android, and web scope and deliberate platform differences.
- [ ] Record Expo SDK, React Native, router, app version, build numbers, runtime version, commit, and environment.
- [ ] Decide Expo Go, development build, preview build, or store build for each validation stage.
- [ ] Classify every change as JavaScript/assets, native configuration, native dependency, or server contract.
- [ ] Create a new binary when native compatibility changes.

## Navigation and lifecycle

- [ ] Verify cold start, warm resume, background/foreground, process termination, and restored navigation.
- [ ] Verify protected routes do not flash private content during session bootstrap.
- [ ] Verify back, modal dismissal, tab history, inbound links, unknown links, and notification links.
- [ ] Validate safe areas, keyboard avoidance, text scaling, reduced motion, touch targets, and screen-reader order.

## Authentication and security

- [ ] Use a stable app scheme or associated/universal link for native auth callbacks.
- [ ] Test Google or Apple auth in a development or release build, including cancellation and interrupted callbacks.
- [ ] Keep OAuth client secrets, service-role keys, signing keys, and provider credentials out of the bundle and logs.
- [ ] Refresh sessions only while appropriate for the app lifecycle and clear identity-scoped caches on sign-out.
- [ ] Enforce object and tenant authorization on the server or with RLS.
- [ ] Verify account switching, revoked sessions, expired tokens, and deep-link authorization.

## Data and offline behavior

- [ ] Assign local UI, route, query cache, secure storage, local database, and server state explicitly.
- [ ] Define idempotency, expected version, retry, rollback, reconciliation, and conflict UX for each durable mutation.
- [ ] Distinguish queued, syncing, confirmed, conflicted, and failed states when offline work is supported.
- [ ] Reconcile canonical data after reconnect before consuming new realtime events.
- [ ] Exercise rapid actions, stale responses, two-device edits, long background intervals, and account changes.

## Capabilities

- [ ] Explain permission value before prompting and ask in context.
- [ ] Handle limited, denied, blocked, revoked, unavailable, and interrupted states.
- [ ] Provide a useful fallback and settings recovery path.
- [ ] Verify hardware features on a physical device.
- [ ] Treat notifications as delivery hints; fetch authorized current data after opening.

## Testing and evidence

- [ ] Run domain, component, router, and integration tests.
- [ ] Exercise the relevant development build on iOS and Android.
- [ ] Run Maestro or the repository's E2E flows against installable artifacts.
- [ ] Capture device/OS, build/runtime, identity, network mode, scenario, expected/observed result, logs, and media.
- [ ] Inspect Metro, native crash, network, and update logs.

## Delivery

- [ ] Verify bundle/package IDs, signing, versioning, icons, splash, permissions, privacy declarations, and store metadata.
- [ ] Test the exact runtime/update combination on preview or store beta distribution.
- [ ] Document staged rollout, monitoring, update rollback, binary recovery, and owners.
- [ ] Keep production channel changes and store submission inside the user's authorized release boundary.
