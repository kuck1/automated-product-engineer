# Expo and React Native support: implementation record

## Product thesis

Native support is a runtime and delivery capability, not a responsive web preset. The toolkit should let a product team begin with the business need while the agent makes the native boundaries explicit: installed binary, JavaScript update, operating-system lifecycle, server authority, and store release.

The first release therefore optimizes for three frequent jobs:

1. install the same product-engineering system with no required flags;
2. explain what kind of project and native runtime already exists;
3. launch the right local runtime with one command, without overwriting native work.

## Research and design decisions

- **Development builds are the production-like default for meaningful native work.** Expo Go remains useful for supported JavaScript exploration, while OAuth callbacks, push notifications, and custom native modules require a development or release build.
- **The native binary and JavaScript update are separate artifacts.** Runtime versions are the compatibility contract. Native modules, plugins, entitlements, permissions, and native configuration require a new compatible build.
- **OAuth is a lifecycle flow.** The template models app return, callback exchange, session restoration, foreground token refresh, cancellation, and protected-route bootstrap. Client secrets stay off the device.
- **Remote state is not global UI state.** TanStack Query owns server snapshots and reconciliation; context distributes stable dependencies and identity; local state owns transient interaction; a local database owns substantial offline data; the server owns durable multi-user truth.
- **Realtime events are invalidation hints.** A reconnect performs a canonical read before accepting new live events. This prevents late subscriptions and old account or route scopes from repainting the current screen.
- **Offline writes expose their actual state.** `saved on device`, `syncing`, `confirmed`, `conflicted`, and `failed` remain distinct. A client-generated operation ID and expected revision make retries and conflicts inspectable.
- **Launch must preserve owned native projects.** The CLI never runs prebuild, deletes `ios/` or `android/`, installs modules, creates credentials, or changes schemes as a side effect of launching.

## Implementation cycles

### Cycle 1: native knowledge and routing

Added the `expo-native-app` specialist and routed Expo or React Native work to it from the conductor. The skill covers project intake, launch decisions, navigation and protected routes, OAuth and links, state and offline ownership, device permissions, testing, builds, updates, and store delivery.

The first review found that generic native advice still left agents to infer the binary boundary. The revision makes the runtime choice mandatory at intake and requires simulator or device evidence instead of browser-only proof.

### Cycle 2: zero-flag detection and installation

The installer now reads dependencies, lockfiles, app configuration, native directories, EAS configuration, routers, and common capability packages. It writes a structured project profile and selects native or web examples automatically.

The first CLI test exposed a source-selection defect: the checkout preferred an incomplete package payload over repository sources. The fix selects repository sources during development and the prepared payload only inside the packed package.

Dynamic `app.config.*` files are detected without executing repository code. The doctor records that configuration as dynamic and asks Expo to resolve it instead of incorrectly claiming that the scheme is missing.

### Cycle 3: one-command launch

`automated-product-engineer launch` now chooses pnpm, npm, Yarn, or Bun from the project, starts Expo with `--dev-client` when installed, and supports iOS, Android, web, tunnel, and cache-clear choices. Bare React Native projects can start Metro or run iOS and Android through the same command. `--dry-run` makes command selection testable and inspectable.

The launcher deliberately refuses Expo-only flags for bare React Native and rejects web-only projects before invoking a package manager.

### Cycle 4: executable reference implementation

Added an Expo Router template with protected routes, a Supabase session provider, PKCE callback exchange, lifecycle-aware token refresh, TanStack Query, environment boundaries, EAS profiles, a Maestro auth flow, and an EAS workflow example. Added focused native patterns for versioned outboxes, lifecycle reconciliation, safe notification routes, and permission machines.

## Debug record

- Template prose embedded in JavaScript template literals initially contained unescaped backticks. `node --check` caught the syntax error before packaging; the adapters and installation guide were escaped and the CLI test now exercises the executable entry point.
- The official skill validator could not start because the machine Python environment lacks PyYAML. The same frontmatter and structural constraints were checked with Ruby Psych, and repository content validation remains part of the full gate.
- Package behavior is tested both from the repository and from the prepared npm payload so missing native references cannot pass unnoticed.

## Release evidence

The implementation is complete when:

- Expo, bare React Native, Next.js, and unknown fixtures select the correct profile and examples;
- repeated installation is stable;
- launch command selection is covered without starting a long-running Metro process;
- the packed tarball contains the native skill, references, docs, checklist, templates, and examples;
- content validation, unit tests, typecheck, lint, and production build pass;
- a clean temporary Expo fixture can install, run doctor, and resolve its launch command from the packed artifact.

## Next product cycle

Case studies should add native views only after the toolkit behavior is stable. Each one should demonstrate how little orchestration the product team performs while still exposing the real native contract behind the scenes: auth callback, offline queue, multi-user reconciliation, permission recovery, development build, and staged release.
