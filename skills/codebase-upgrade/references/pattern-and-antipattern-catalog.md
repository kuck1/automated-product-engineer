# Pattern and Anti-Pattern Catalog

This catalog turns the reference applications and delivery work into reusable decisions. Use it to interpret a codebase, not to force every repository into the same folder structure.

## One owner per state class

**Use when:** data appears in several components, routes, tabs, or devices.

**Pattern:** local interaction stays near the component; shareable navigation lives in the URL; fetched records live in a query cache; durable truth lives behind a service and database; external systems remain explicit authorities. Define precedence where one source initializes another.

**Anti-patterns:** copying query results into Context or local state; keeping selected IDs in both the URL and component state; separate top-bar, page, and dialog counters; treating browser storage as durable truth.

**Inspect:** query keys, provider values, URL reads and writes, hydration, identity changes, cache invalidation, and duplicate state setters.

**Working examples:** Onboarding Operations uses the URL for the selected app and TanStack Query for records. The shared-points scenario uses one account query key for every surface.

**Owning skill:** `frontend-api-db`.

## Thin transport, server-owned policy

**Use when:** a UI action crosses an API boundary or changes durable data.

**Pattern:** the route authenticates, validates, delegates, and serializes. The service owns object and tenant authorization, transitions, business rules, idempotency, transaction shape, and the canonical response. The repository or adapter owns storage details.

**Anti-patterns:** permission checks only in the UI; database writes directly in route handlers; the client reconstructing canonical domain results; RLS treated as the only product-policy layer.

**Inspect:** request parsers, actor resolution, service calls, direct ORM or Supabase access, response DTOs, negative authorization tests, and transaction boundaries.

**Working examples:** Release Readiness, Onboarding Operations, and Field Relay all use route → service → repository. Field Relay repeats durable policy inside a locked Postgres operation.

**Owning skills:** `architecture-building`, `frontend-api-db`, and `security-review`.

## Versioned writes and idempotent replay

**Use when:** work can be retried, double-clicked, performed in two tabs, queued offline, or changed by another user.

**Pattern:** send the expected revision or ETag and a stable operation ID or client nonce. Check the version and apply the write atomically. Duplicate replay returns the canonical result; a stale write returns an explicit conflict and recovery path.

**Anti-patterns:** last-write-wins for collaborative records; checking a version before a separate write; retrying a POST without a stable ID; incrementing a parent revision when the child write can still fail.

**Inspect:** mutation payloads, unique constraints, transaction or RPC code, retry behavior, HTTP `409`, optimistic rollback, realtime deduplication, and conflict UX.

**Working examples:** Release Readiness rejects stale revisions. Field Relay locks the mission, deduplicates the operation, checks the stop transition, and updates mission plus stop in one transaction. Chat uses a client nonce to reconcile optimistic, response, and realtime copies.

**Owning skill:** `frontend-api-db`.

## Honest offline work

**Use when:** a mobile or web action may outlive the connection, page, process, or device session.

**Pattern:** persist a typed outbox operation with identity scope, expected version, operation ID, and enough intent to replay. Show queued, syncing, confirmed, conflicted, and failed as different states. Reconcile canonical data before consuming new realtime hints.

**Anti-patterns:** showing success after a local write; silently falling back to local-only behavior when the server fails; losing queued work on termination; replaying an operation under a different signed-in identity.

**Inspect:** storage lifetime, queue schema, reconnect and foreground hooks, identity changes, duplicate replay, stale revisions, labels, and dependent-action gating.

**Working example:** Field Relay distinguishes “saved on device” from “server confirmed,” disables dependent actions, survives replay, and exposes a conflict path.

**Owning skills:** `expo-native-app` and `frontend-api-db`.

## Session lifecycle and data isolation

**Use when:** the app has protected routes, cookie sessions, OAuth, multiple tabs, native lifecycle, or Supabase.

**Pattern:** browser and server clients have separate contracts; the server verifies the actor; PKCE completes before protected navigation; refresh follows the app lifecycle; identity changes clear scoped caches; publishable keys pair with service policy and RLS.

**Anti-patterns:** public environment variables containing privileged keys; shared server clients across requests; `getSession()` treated as authorization proof; several tabs racing refresh rotation; protected route prefetch before the callback persists cookies.

**Inspect:** environment names, client construction, callback order, cookies, `AppState`, cache keys, sign-out behavior, RLS migrations, and cross-tenant tests.

**Working examples:** the Expo Router auth template, Supabase session diagnostic guide, and the case-study actor/service/RLS boundary.

**Owning skills:** `security-review` and `expo-native-app`.

## Components as product infrastructure

**Use when:** teams repeatedly rebuild the same visual, interaction, accessibility, or responsive behavior.

**Pattern:** semantic tokens express roles; accessible primitives expose typed variants; patterns and composites capture stable recipes; metadata and previews teach when to use them; product features supply data and commands without importing domain policy into the library.

**Anti-patterns:** a card gallery without usage guidance; copy-pasted components that drift; raw values in consumers; preview-only imitations; a universal component that absorbs feature routing and server mutations.

**Inspect:** repeated geometry, token roles, variant types, state coverage, component callers, accessibility, preview fixtures, migration guidance, and visual tests in real consumers.

**Working example:** the reference component library shows foundations, variants, states, and distinct client-app themes while leaving case-study behavior in feature code.

**Owning skill:** `design-system`.

## Decoupled automated examples

**Use when:** a demo must teach complex behavior or simulate several users without turning playback into production logic.

**Pattern:** automated actors and human controls send the same typed commands. Playback timing, cursor interpolation, fixtures, and story order live in an adapter. The app owns only valid commands and state transitions. Pause offscreen and respect reduced motion.

**Anti-patterns:** DOM scripts directly editing visual state; a demo-only component that bypasses real product commands; animation speed coupled to story duration; simulated success that skips server rules.

**Inspect:** command types, reducer or mutation entry point, actor adapters, viewport activation, manual interruption, conflict scenarios, and tests.

**Working examples:** the multi-user demos and the Field Relay human/offline interaction use the product command boundary rather than a second implementation.

**Owning skills:** `architecture-building` and `manual-ui-qa`.

## Responsive geometry from content pressure

**Use when:** dense applications, boards, toolbars, tabs, cards, or code inspectors cross widths.

**Pattern:** identify minimum readable widths, fixed controls, flexible segments, shrink order, scroll owner, overlay clearance, and the exact transition where structure must change. Test continuously through that boundary and back.

**Anti-patterns:** incidental flex wrapping; clipped arrows; a desktop card width on mobile; page-level horizontal scroll caused by an inner board; hidden navigation without a deliberate replacement.

**Inspect:** overflow, min-width, fixed or sticky elements, safe areas, target sizes, long content, focus order, and narrow-to-wide symmetry.

**Working examples:** the Behind the Scenes responsibility rail uses deliberate mobile card sizing and scroll ownership; Field Relay contains its device shell at 390 px with zero page overflow.

**Owning skill:** `responsive-design`.

## Evidence follows ownership

**Use when:** deciding what to test or whether a feature is ready.

**Pattern:** domain policy gets unit tests; routes get validation and authorization tests; repositories get transaction and migration tests; controllers get race and rollback tests; the browser or device proves the integrated experience and responsive states. Retrospective findings fix the source layer and invalidate stale evidence.

**Anti-patterns:** one end-to-end test for every rule; snapshots that mirror implementation; browser-only proof for native lifecycle; updating a visual baseline without classifying the difference; full-suite churn while the contract is still moving.

**Inspect:** test ownership, negative paths, real runtime evidence, screenshots, console/network failures, CI gates, and whether the evidence matches the current SHA.

**Working examples:** case-study service tests prove transitions and concurrency; browser journeys prove rollback and offline reconciliation; native delivery requires simulator or device proof.

**Owning skills:** `code-review`, `manual-ui-qa`, `expo-native-app`, and `pr-workflow`.

## Retrospective fix-back

**Use when:** implementation or QA exposes a reusable failure in the workflow, templates, or skills.

**Pattern:** record the surprise, owning cause, affected evidence, correction, and durable lesson. Fix high-confidence in-scope issues, rerun only invalidated checks, and update the owning skill or template when the lesson generalizes.

**Anti-patterns:** treating the retrospective as release notes; documenting a defect without correcting it; adding broad rules for a one-off symptom; rerunning every gate after a documentation-only fix.

**Inspect:** review comments, QA failures, repeated workarounds, stale references, and whether a future agent would make the same mistake.

**Working examples:** Field Relay replaced separate database writes with an atomic RPC, then moved transition and proof checks into the locked transaction. Native support records the development-build boundary instead of relying on Expo Go assumptions.

**Owning skill:** `automated-product-engineer`.
