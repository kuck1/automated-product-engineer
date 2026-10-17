# Automated Product Engineer for Next.js

An open-source reference app and installable product-engineering system for turning Figma, Claude Design, product briefs, or existing flows into production-ready Next.js features.

[Explore the live reference site](https://automated-product-engineer-nextjs.vercel.app) · [Install from npm](https://www.npmjs.com/package/automated-product-engineer)

Design tools are excellent at defining intent, interaction, and visual direction. Production applications also need clear ownership across components, hooks, APIs, services, persistence, analytics, accessibility, responsive behavior, and tests. This repository connects those two worlds.

## What this gives you

- Adaptive intake in every skill: the agent inspects available context, asks only for decisions that materially affect the work, and generates a tailored handoff request when another tool or teammate must supply missing input.
- Concise and comprehensive Claude Design export contracts for focused and complex features.
- A dependency-free HTML prototype contract with deterministic states.
- Semantic token templates in JSON and CSS.
- A frame manifest for reproducible desktop and mobile references.
- Architecture principles for Next.js, React, hooks, APIs, services, and databases.
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

## Quick start

Run the reference application:

```bash
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:3100` for the landing page, `http://localhost:3100/system` for the interactive token and component tour, and `http://localhost:3100/examples` for two business-logic case studies.

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

That one command installs the 13 agent skills, adapters for common AI coding tools, architecture and design-system guides, integration checklists, implementation templates, two working full-stack case studies, Supabase examples, testing and CI patterns, screenshot automation, and retrospective fix-back material. Reference material lives under `.automated-product-engineer/` so it remains inspectable without being mixed into the host application's runtime source.

Use `--target`, `--project`, or `--only` only when you need a narrower or non-default installation. See [`docs/ai-editor-setup.md`](docs/ai-editor-setup.md) for those options.

Then ask:

```text
Use the automated-product-engineer skill to build this feature from the attached design. Carry it through architecture, implementation, QA, demo screenshots, retrospective fix-back, and a draft PR. Do not merge.
```

The default install works across Codex, Claude Code, Cursor, Windsurf, GitHub Copilot, Orca, and generic agents.

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
- [`src/ui/tokens.ts`](src/ui/tokens.ts): human-readable semantic token registry and swappable theme and shape presets.
- [`app/system/`](app/system): interactive design-system tour, live token playground, and hierarchy-based component catalog.
- [`supabase/migrations/`](supabase/migrations): normalized example schema, constraints, indexes, and row-level security.
- [`docs/reference-app-architecture.md`](docs/reference-app-architecture.md): the implementation's ownership and state contracts.
- [`docs/case-studies.md`](docs/case-studies.md): business rules, code paths, and learning goals for both examples.

- [`docs/how-to-use.md`](docs/how-to-use.md): workflow from brief to shipped feature.
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
