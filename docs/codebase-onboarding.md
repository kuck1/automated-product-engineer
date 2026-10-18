# Onboard an Existing Codebase

The onboarding workflow turns the toolkit from a generic library into a repository-specific operating system. It does not rewrite application code during installation. It builds a static evidence packet, asks which engineering domains matter, creates a team-owned documentation workspace, and installs a local skill overlay that makes every later specialist respect the repository's accepted decisions.

## Start with one command

Run the normal zero-flag install:

```bash
pnpm dlx automated-product-engineer
```

In an interactive terminal, the installer asks whether to analyze the current codebase. Answering yes opens a compact domain chooser. The same workflow can be started or refreshed later with:

```bash
pnpm dlx automated-product-engineer onboard
```

When no interactive terminal is available, `onboard` includes every review domain so CI and coding agents do not block on a prompt.

## What the command creates

The command writes `.automated-product-engineer/onboarding/`:

| Artifact | Purpose |
| --- | --- |
| `analysis.latest.json` | Refreshable static profile, documentation inventory, and audit evidence |
| `CURRENT_PRACTICES.md` | Verified local conventions, owners, evidence, and exceptions |
| `INCONSISTENCIES.md` | Conflicts between documentation, code, runtime behavior, and tests |
| `PRODUCT_REQUIREMENTS.md` | Canonical journeys, rules, failures, and acceptance evidence |
| `DECISIONS.md` | Accepted local choices and rejected alternatives |
| `UPGRADE_PROGRAM.md` | Selected, ordered, reversible modernization slices |
| `TEST_STRATEGY.md` | Characterization, focused, UI, integration, E2E, native, and operational proof |
| `RETROSPECTIVES.md` | Results, debugging paths, and code, documentation, and skill fix-back |

It also creates `project-engineering-context` in the selected agent skill directories. That overlay points every shared specialist at the accepted local contract. Rerunning onboarding refreshes JSON evidence and preserves the Markdown and skill files so team decisions are not erased.

## Review domains

Onboarding can inspect product requirements, architecture, state management, API and service contracts, database design, authentication and security, design systems and semantic tokens, responsive and native behavior, testing and CI, delivery and observability, and documentation. The generated scan is a starting hypothesis. The `codebase-onboarding` skill reads all relevant documentation, traces real user journeys, validates findings against callers and runtime behavior, and exposes contradictions before it recommends changes.

## Upgrade order

The workflow keeps implementation product-sized and testable:

1. Document the product requirement and current behavior.
2. Add characterization or a focused UI contract test before structural changes when it protects a meaningful interaction.
3. Add proof at the owning domain, service, repository, schema, auth, or component boundary.
4. Implement one reversible vertical slice.
5. Add E2E coverage after the requirement and cross-boundary contract are stable.
6. Inspect the real browser or native runtime and run the appropriate gates.
7. Update current practices, decisions, local skill guidance, and the retrospective from evidence.

The user chooses priorities that affect product behavior, authority, data lifetime, security, compatibility, or recovery. Once a slice is selected, the agent can proceed through safe, reversible implementation, testing, documentation, commits, and a draft pull request. Destructive migrations, production access, release, and merge remain explicit human decisions.

## Keeping knowledge current

Repository-specific decisions stay in `project-engineering-context`; general patterns stay in the shared skill library. After each slice, the retrospective decides whether a lesson belongs in application code, tests, local documentation, the local overlay, or an upstream shared skill. This feedback loop prevents documentation drift while avoiding a private fork of the entire skill library.
