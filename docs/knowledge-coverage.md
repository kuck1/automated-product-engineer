# Knowledge Coverage

The installable toolkit preserves the reusable engineering knowledge from the source prompt and skill library as maintained skills, progressive references, guides, templates, and executable examples. It intentionally does not mirror every historical Markdown file or editor-specific command verbatim.

## Preserved skill set

The original reusable workflows are represented by these installed skills:

| Capability | Installed skill |
| --- | --- |
| end-to-end orchestration | `automated-product-engineer` |
| architecture and codebase analysis | `architecture-building` |
| repository onboarding, documentation reconciliation, local skill adaptation, and staged modernization | `codebase-onboarding` |
| evidence-backed codebase audit and upgrade selection | `codebase-upgrade` |
| local correctness review | `code-review` |
| interaction and visual refinement | `design-polish` |
| tokens, components, and governed reuse | `design-system` |
| Figma-led delivery | `figma-to-app-feature` |
| Claude Design request and integration | `claude-design-to-app` |
| frontend, API, persistence, and cache work | `frontend-api-db` |
| Expo and React Native architecture, launch, auth, lifecycle, device capabilities, native QA, builds, updates, and release | `expo-native-app` |
| native Swift and iOS architecture, Xcode launch, Observation, concurrency, Apple auth, Keychain, persistence, capabilities, privacy, native QA, signing, TestFlight, and App Store delivery | `ios-native-app` |
| native Kotlin and Android architecture, Gradle launch, Compose and Views, ViewModel and Flow, coroutines, Credential Manager, Room, DataStore, WorkManager, capabilities, native QA, signing, and Play delivery | `android-native-app` |
| Kotlin Multiplatform product kernels, common source sets, generated contracts, Swift interop, native Android/iOS shells, incremental adoption, and parallel CI | `kotlin-multiplatform-app` |
| true parallel Next.js, native Android, and native iOS delivery through feature capsules, generated Kotlin/TypeScript policy, sibling lanes, semantic receipts, and contract epochs | `parallel-platform-development` |
| real-browser exploratory QA | `manual-ui-qa` |
| remote pull-request review | `pr-review` |
| branch, evidence, CI, and draft-PR workflow | `pr-workflow` |
| responsive behavior | `responsive-design` |
| changed-surface threat review | `security-review` |

The concise `SKILL.md` files route to references when a task needs more depth. The source library's codebase-pattern analysis, specification review, debugging, design artifact intake, state-precedence rules, focused testing, screenshot evidence, and retrospective fix-back are built into these skills rather than exposed as a catalog of generic prompts.

## Preserved supporting knowledge

- The complete Claude Design export contract and integration checklist remain under `skills/claude-design-to-app/references/`.
- The Figma workflow retains artifact intake, source precedence, state ownership, responsive pressure, design-system extraction, focused testing, manual QA, and delivery evidence.
- Architecture guidance retains encapsulation, extension over modification, typed boundaries, server-owned policy, failure contracts, and reviewable vertical slices.
- Product analytics guidance retains measurement-first event design, client/server authority, semantic timing, identity and dedupe behavior, privacy-safe properties, and focused instrumentation tests.
- Working case studies demonstrate UI state, server cache, transport, domain policy, repository ports, Supabase adapters, authorization, concurrency, optimistic updates, rollback, and browser verification.
- The codebase-upgrade catalog maps those working lessons to observable code signals, concrete anti-patterns, specialist ownership, reviewable upgrade slices, and the user decision required before broad changes.
- Codebase onboarding records repository-specific practices, inconsistencies, requirements, decisions, test order, and retrospectives in a durable local workspace and skill overlay. Repeated analysis preserves these human-owned artifacts.
- The product-engineering pattern atlas adds stable machine-readable IDs, product situations, failures, ownership rules, anti-patterns, focused proof, and specialist routing for state, races, retries, cross-tab work, offline queues, realtime echo, auth boundaries, webhooks, background jobs, uploads, rate limits, compensation, feature flags, component contracts, and evidence.
- Framework-light executable references and focused tests demonstrate the hard invariant for each implemented pattern without asking host applications to import the toolkit as runtime code.
- The state-management playbook covers shared counters, request cancellation, multi-window revision conflicts, chat, collaborative documents, realtime roles, and Supabase cookie-session debugging; the same guidance ships in the frontend and security skills.
- Templates preserve semantic tokens, enum-backed variants, component contracts, extension registries, hooks, focused tests, E2E and visual checks, CI, screenshot capture, retrospective, and pull-request structure.
- The native profile preserves project detection, development-build selection, OAuth and deep-link rules, lifecycle-aware sessions, offline conflict contracts, permissions, notification routing, EAS runtime compatibility, Maestro verification, and staged update recovery.
- The native iOS profile preserves Xcode project and Swift package detection, shared schemes, SwiftUI and UIKit boundaries, Observation state ownership, Swift concurrency migration, AuthenticationServices and Keychain contracts, lifecycle and offline recovery, capability and entitlement review, privacy manifests, Swift Testing and XCUI, signing, TestFlight, and App Store release evidence.
- The native Android profile preserves Gradle project and module detection, Compose and Views boundaries, state-holder and coroutine ownership, Credential Manager and App Link contracts, Room/DataStore/WorkManager persistence, process-death recovery, capability and permission review, Kotlin and device testing, signing, internal tracks, and staged Play release evidence.
- The Kotlin Multiplatform profile preserves shared-module, source-set, target, shell, token, component, scenario, Android plugin, and shared-UI detection; product-kernel and portable-runtime boundaries; small Swift facades; native projections; contract generation; incremental migration; compatibility windows; and independent shared, Android, iOS, server, performance, and release gates.
- The parallel-platform profile preserves feature-capsule and Next.js-shell detection; generated Kotlin and TypeScript policy; semantic receipt comparison; sibling contract, web, kernel, Android, and iOS lanes; explicit contract epochs; platform-native evidence; incremental adoption; and independent rollout and rollback.

## Deliberate exclusions

The public toolkit excludes product-specific database semantics, customer and tenant details, private URLs and credentials, historical tickets and incidents, internal analytics catalogs, feature-specific decisions, and third-party manuals that should be obtained from their maintainers. Editor commands that merely repeated a skill are represented by thin adapters so the maintained workflow has one source of truth.

This distinction matters: the toolkit aims for complete reusable decision knowledge, not a byte-for-byte copy of private or obsolete context. When a new source lesson changes a reusable engineering decision, add it to the owning skill or progressive reference and exercise it in a guide, template, or case study where practical.
