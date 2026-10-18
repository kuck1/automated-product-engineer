# Automated Product Engineer for Web and Native

An open-source reference app and installable product-engineering system for turning Figma, Claude Design, product briefs, or existing flows into production-ready Next.js, Expo, React Native, SwiftUI, and UIKit features.

[Explore the live reference site](https://automated-product-engineer-nextjs.vercel.app) · [Install from npm](https://www.npmjs.com/package/automated-product-engineer)

Design tools are excellent at defining intent, interaction, and visual direction. Production applications also need clear ownership across components, hooks, APIs, services, persistence, analytics, accessibility, responsive behavior, and tests. This repository connects those two worlds.

## What this gives you

- Adaptive intake in every skill: the agent inspects available context, asks only for decisions that materially affect the work, and generates a tailored handoff request when another tool or teammate must supply missing input.
- Concise and comprehensive Claude Design export contracts for focused and complex features.
- A dependency-free HTML prototype contract with deterministic states.
- Semantic token templates in JSON and CSS.
- A frame manifest for reproducible desktop and mobile references.
- Architecture principles for Next.js, React, hooks, APIs, services, and databases.
- Native product architecture for Expo Router or React Navigation, OAuth and deep links, app lifecycle, offline work, device capabilities, EAS builds and updates, and store delivery.
- First-class native iOS architecture for SwiftUI or UIKit, Observation, Swift 6 concurrency, AuthenticationServices, Keychain, local persistence, Apple capabilities, Xcode testing, privacy manifests, signing, TestFlight, and App Store delivery.
- Encapsulation and extension-over-modification rules for stable, composable feature boundaries.
- A complete design-system blueprint with token layers, component hierarchy, enum-driven variants, slots, metadata, and change policy.
- Decoupled view/controller examples and typed state-machine patterns.
- Unit, visual, and E2E test templates plus a sharded GitHub Actions workflow.
- Automated desktop/mobile demo capture and draft-PR opening templates.
- A retrospective fix-back loop that turns implementation findings into verified corrections.
- A practical integration and verification checklist.
- An `AGENTS.md` you can adapt for coding agents working in your repository.
- A portable Agent Skills library with adapters for Codex, Claude Code, Cursor, Windsurf, GitHub Copilot, Orca, and generic builders.
- Progressive skill references with concrete architecture, race handling, review, persistence, responsive, security, QA, and PR-delivery examples.
- A read-only codebase audit that connects observed evidence to concrete patterns, anti-patterns, working examples, specialist skills, and a user-selected upgrade slice.
- Guided codebase onboarding that reconciles documentation and implementation, creates a project-owned engineering contract, adapts the skill system to local decisions, and generates a staged, testable modernization program.

## Quick start

Run the reference application:

```bash
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:3100` for the landing page, `http://localhost:3100/system` for the interactive token and component tour, and `http://localhost:3100/examples` for three business-logic case studies, including the offline-first Field Relay native example.

Then use the workflow in your own codebase:

1. Install the skills in your target repository.
2. Attach or link the available brief, Figma frames, screenshots, export, and product rules.
3. Invoke `automated-product-engineer` for the complete workflow or a specialist for a focused task.
4. Let the skill inspect the repository and source material before it asks for anything.
5. Answer only the material decisions it cannot infer. When Claude Design, Figma, or a teammate must provide something, the skill returns a filled-in request for that exact gap.
6. Review the resulting contract, then let the workflow implement, verify, capture evidence, run retrospective fix-back, and prepare the draft PR.

## Use it with your AI agent

From the root of another repository, install the complete toolkit:

```bash
pnpm dlx automated-product-engineer
```

That one command detects Next.js, Expo, bare React Native, native iOS, or Swift Package projects and installs 17 agent skills, adapters for common AI coding tools, platform-specific architecture guides and examples, integration checklists, implementation templates, Supabase patterns, testing and CI workflows, evidence capture, and retrospective fix-back material. Reference material lives under `.automated-product-engineer/` so it remains inspectable without being mixed into the host application's runtime source.

In an interactive terminal, the installer then offers to analyze the repository. It lets you choose review domains and creates a project-owned onboarding workspace plus a local skill overlay. Run the workflow directly or refresh its static evidence at any time:

```bash
pnpm dlx automated-product-engineer onboard
```

The command preserves accepted Markdown decisions and local skill guidance on reruns while updating `analysis.latest.json`.

Inspect an existing codebase before selecting a migration:

```bash
pnpm dlx automated-product-engineer audit
```

The audit reads source and configuration without executing application code. It separates high-confidence risks from upgrade opportunities and established patterns, cites the files that triggered each finding, points to a working example and owning skill, and ends with the decisions the agent should ask you to make. Use `--json` when an agent will consume the report directly.

Use `--target`, `--project`, or `--only` only when you need a narrower or non-default installation. See [`docs/ai-editor-setup.md`](docs/ai-editor-setup.md) for those options.

Then ask:

```text
Use the automated-product-engineer skill to build this feature from the attached design. Carry it through architecture, implementation, QA, demo screenshots, retrospective fix-back, and a draft PR. Do not merge.
```

The default install works across Codex, Claude Code, Cursor, Windsurf, GitHub Copilot, Orca, and generic agents.

### Expo and React Native

In an Expo project, the same zero-flag install records the detected router, package manager, app scheme, native projects, development client, EAS configuration, and native capabilities. Inspect the result or launch the app with:

```bash
pnpm dlx automated-product-engineer doctor
pnpm dlx automated-product-engineer launch
```

The launcher automatically uses the repository's package manager and adds Expo's development-client mode when detected. Optional `--ios`, `--android`, `--web`, `--tunnel`, and `--clear` flags remain available for deliberate platform or debugging choices.

### Swift and native iOS

In a native Apple project, the same install detects the workspace or project, shared schemes, bundle identifier, deployment target, Swift version, entitlements, privacy manifests, test sources, and Apple capability signals. The doctor explains missing shared schemes, privacy manifests, or test coverage, while launch opens the preferred workspace in Xcode:

```bash
pnpm dlx automated-product-engineer doctor
pnpm dlx automated-product-engineer launch
swift test --package-path .automated-product-engineer/ios/examples
```

The `ios-native-app` specialist routes native work through SwiftUI or UIKit ownership, strict concurrency, AuthenticationServices and Keychain, offline persistence, device capabilities, real simulator and device proof, signing, TestFlight, and App Store readiness.

## Recommended export

```text
feature-export/
  HANDOFF.md
  prototype.html
  components/
  copy/
  tokens/
    tokens.json
    tokens.css
  assets/
  frames/
  frames.json
```

The export is a **design and behavior contract**, not production code to paste. Rebuild it with your application's components, tokens, authorization, data access, persistence, analytics, and routing conventions.

## Repository map

- [`app/`](app): public product site, interactive examples, and thin API routes.
- [`src/examples/`](src/examples): full-stack case studies with UI state, server cache, domain services, authorization, repositories, and adapters.
- [`src/patterns/`](src/patterns): typed pattern registry plus executable references and focused tests for races, retries, offline work, trust boundaries, long-running work, and delivery controls.
- [`src/ui/tokens.ts`](src/ui/tokens.ts): human-readable semantic token registry and swappable theme and shape presets.
- [`app/system/`](app/system): interactive design-system tour, live token playground, and hierarchy-based component catalog.
- [`supabase/migrations/`](supabase/migrations): normalized example schema, constraints, indexes, and row-level security.
- [`docs/reference-app-architecture.md`](docs/reference-app-architecture.md): the implementation's ownership and state contracts.
- [`docs/case-studies.md`](docs/case-studies.md): business rules, code paths, and learning goals for all three examples.

- [`docs/how-to-use.md`](docs/how-to-use.md): workflow from brief to shipped feature.
- [`docs/codebase-upgrades.md`](docs/codebase-upgrades.md): evidence-backed repository audit, pattern mapping, and reviewable upgrade selection.
- [`docs/codebase-onboarding.md`](docs/codebase-onboarding.md): full repository baseline, local skill overlay, selectable modernization program, and retrospective feedback loop.
- [`docs/pattern-atlas.md`](docs/pattern-atlas.md): the high-level content architecture, stable IDs, product situations, proofs, and agent routing contract.
- [`docs/native-app-delivery.md`](docs/native-app-delivery.md): Expo and React Native project detection, launch, architecture, auth, lifecycle, native verification, builds, updates, and release.
- [`docs/native-ios-delivery.md`](docs/native-ios-delivery.md): native Swift and Xcode detection, architecture, capabilities, privacy, simulator and device proof, signing, TestFlight, and App Store delivery.
- [`docs/architecture.md`](docs/architecture.md): responsibility across application layers.
- [`docs/design-system-blueprint.md`](docs/design-system-blueprint.md): tokens, component hierarchy, enum variants, catalog, accessibility, and governance.
- [`docs/state-and-data-architecture.md`](docs/state-and-data-architecture.md): local, URL, cache, database, controller, API, and service ownership.
- [`docs/testing-and-ci.md`](docs/testing-and-ci.md): component, hook, API, visual, E2E, manual QA, and CI strategy.
- [`docs/extensibility-and-encapsulation.md`](docs/extensibility-and-encapsulation.md): stable contracts, feature boundaries, registries, adapters, and safe extension points.
- [`docs/automated-delivery.md`](docs/automated-delivery.md): screenshot evidence and automated draft-PR workflow.
- [`docs/retrospective-fix-back.md`](docs/retrospective-fix-back.md): reflect, correct, reverify, and record durable lessons.
- [`docs/ai-editor-setup.md`](docs/ai-editor-setup.md): install and invoke the workflow from supported editors and agent environments.
- [`docs/declassification-audit.md`](docs/declassification-audit.md): what reusable skill material was included or deliberately excluded.
- [`checklists/`](checklists): implementation and review gates.
- [`native/examples/`](native/examples): framework-light offline outbox, lifecycle reconciliation, notification routing, and permission patterns.
- [`native/case-studies/`](native/case-studies): portable native source for the Field Relay offline mission workflow.
- [`ios/examples/`](ios/examples): executable Swift concurrency, versioned-write, outbox, and identity-scope invariants.
- [`ios/case-studies/`](ios/case-studies): native Swift application notes for the Field Relay workflow.
- [`templates/native/`](templates/native): Expo Router auth shell, EAS profiles, and Maestro workflow templates.
- [`templates/ios/`](templates/ios): SwiftUI composition, Observation, semantic component, and privacy-manifest starting points.
- [`templates/design-export/`](templates/design-export): concrete HTML, token, handoff, and frame examples.
- [`templates/components/`](templates/components): enum-driven recipes, a decoupled view contract, and a typed extension registry.
- [`templates/state/`](templates/state): controller-hook example.
- [`templates/testing/`](templates/testing): Playwright visual and E2E examples.
- [`templates/ci/`](templates/ci): Playwright and GitHub Actions templates.
- [`templates/automation/`](templates/automation): deterministic demo capture, PR body, and draft-PR scripts.
- [`templates/retrospective/`](templates/retrospective): a concise retrospective and fix-back record.
- [`skills/`](skills): the conductor and specialist Agent Skills used by supported AI editors.
- [`AGENTS.md`](AGENTS.md): reusable coding-agent instructions.

## Principles

- Reuse the existing design system before adding primitives.
- Name tokens by meaning rather than raw values.
- Keep page composition, hooks, APIs, services, and persistence separate.
- Hide implementation details behind narrow contracts and add new behavior through intentional extension points.
- Keep authorization and durable product rules server-side.
- Make every meaningful state deterministic and reproducible.
- Verify desktop and mobile behavior before accepting visual baselines.
- Treat screenshots, a completed retrospective, and verified fix-back work as release evidence.
- Preserve human authority over product decisions, destructive operations, release, and production access.

## Scope

This repository includes a real reference implementation and a deterministic public demo. The example services run against an in-memory adapter by default and include a Supabase adapter plus RLS migration for integration into an authenticated application. Adapt the contracts to your stack and risk level; do not treat demo authentication as production authentication.

The repository validates its JSON, local Markdown links, HTML templates, and public-content boundaries in GitHub Actions. Run the same checks locally with:

```bash
pnpm verify
```

## License

MIT. See [`LICENSE`](LICENSE).
