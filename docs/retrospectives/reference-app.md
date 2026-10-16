# Reference App Retrospective

## Outcome

The repository now demonstrates the delivery system as executable software: a product landing page, two business applications, a portable skills library, a layered API and persistence model, responsive visual evidence, and parallel CI gates.

## Findings fixed during delivery

- **Dependency freshness:** the source inspiration used an older Next.js release with known risk. The reference app was built on the current patched major instead of copying that dependency surface.
- **Framework-owned configuration:** an experimental typed-routes setting conflicted with Next.js 16 generated validators. Removing the redundant setting restored the framework's supported build path.
- **Validation scope:** the Markdown validator initially traversed generated dependencies. It now excludes generated and vendor directories and understands URL-encoded local paths.
- **Repository instructions:** Next.js development tooling tried to rewrite `AGENTS.md`. `agentRules` is disabled so the repository's human-authored operating contract remains stable.
- **Discoverability:** direct links into raw Markdown made the public system feel fragmented. `/library` now provides a browsable index for every skill and both Claude Design meta-prompts.
- **Deterministic browser tests:** shared in-memory demo state made journeys order-dependent. A test-only reset route restores known fixtures before each browser test.
- **Sandboxed browser execution:** local browser launch permissions differ from ordinary unit execution. The documented Playwright command uses the repository's pinned browser runtime, while CI installs Chromium explicitly.

## Durable guards

- Domain tests cover rejected and accepted transitions, stale revisions, readiness scoring, onboarding health, and launch eligibility.
- Browser tests cover optimistic rollback, canonical reconciliation, URL history, architecture visibility, the skills library, desktop visuals, mobile visuals, and horizontal overflow.
- CI separates content, code, and browser gates, gives each a five-minute ceiling, and uploads both the report and raw test evidence on failure.
- The production-facing demo uses synthetic data and a memory repository. The Supabase adapter and migration remain available as the authenticated persistence reference without requiring credentials to explore the app.

## Follow-up rule

When a new case study is added, it must reuse the service and repository contracts, add at least one guarded business transition, document its invariant, and include focused domain and browser evidence. It should extend the example system without adding feature-specific persistence logic to UI components.
