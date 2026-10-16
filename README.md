# Automated Product Engineer for Next.js

An open-source prompt kit, architecture guide, and handoff contract for turning Figma or Claude Design work into production-ready Next.js features.

Design tools are excellent at defining intent, interaction, and visual direction. Production applications also need clear ownership across components, hooks, APIs, services, persistence, analytics, accessibility, responsive behavior, and tests. This repository connects those two worlds.

## What this gives you

- A concise prompt for requesting implementation-ready design output from Claude.
- A comprehensive export contract for complex features.
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

## Quick start

1. Copy [`prompts/claude-design-quick.md`](prompts/claude-design-quick.md) and fill in the bracketed product context.
2. Attach your Figma frames, screenshots, existing component links, and product rules.
3. Ask Claude for the complete offline handoff folder.
4. Audit the handoff using [`checklists/integration.md`](checklists/integration.md).
5. Map the export to your existing application using [`docs/architecture.md`](docs/architecture.md).
6. Implement the smallest stable visual contract first, then add hooks, APIs, persistence, analytics, and tests.
7. Capture deterministic demo evidence, run the retrospective, fix in-scope findings, and open a draft PR.

For multi-step, data-heavy, or permission-sensitive work, use [`prompts/claude-design-full-export.md`](prompts/claude-design-full-export.md).

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

- [`docs/how-to-use.md`](docs/how-to-use.md): workflow from brief to shipped feature.
- [`docs/architecture.md`](docs/architecture.md): responsibility across application layers.
- [`docs/design-system-blueprint.md`](docs/design-system-blueprint.md): tokens, component hierarchy, enum variants, catalog, accessibility, and governance.
- [`docs/state-and-data-architecture.md`](docs/state-and-data-architecture.md): local, URL, cache, database, controller, API, and service ownership.
- [`docs/testing-and-ci.md`](docs/testing-and-ci.md): component, hook, API, visual, E2E, manual QA, and CI strategy.
- [`docs/extensibility-and-encapsulation.md`](docs/extensibility-and-encapsulation.md): stable contracts, feature boundaries, registries, adapters, and safe extension points.
- [`docs/automated-delivery.md`](docs/automated-delivery.md): screenshot evidence and automated draft-PR workflow.
- [`docs/retrospective-fix-back.md`](docs/retrospective-fix-back.md): reflect, correct, reverify, and record durable lessons.
- [`prompts/`](prompts): short and comprehensive Claude Design requests.
- [`checklists/`](checklists): implementation and review gates.
- [`templates/design-export/`](templates/design-export): concrete HTML, token, handoff, and frame examples.
- [`templates/components/`](templates/components): enum-driven recipes, a decoupled view contract, and a typed extension registry.
- [`templates/state/`](templates/state): controller-hook example.
- [`templates/testing/`](templates/testing): Playwright visual and E2E examples.
- [`templates/ci/`](templates/ci): Playwright and GitHub Actions templates.
- [`templates/automation/`](templates/automation): deterministic demo capture, PR body, and draft-PR scripts.
- [`templates/retrospective/`](templates/retrospective): a concise retrospective and fix-back record.
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

This repository is documentation and templates. It does not install a backend, choose a database, or replace the conventions of your Next.js application. Adapt the contracts to your stack and risk level.

The repository validates its JSON, local Markdown links, HTML templates, and public-content boundaries in GitHub Actions. Run the same checks locally with:

```bash
python scripts/validate.py
```

## License

MIT. See [`LICENSE`](LICENSE).
