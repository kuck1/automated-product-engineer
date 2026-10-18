# Use the Toolkit from an AI Editor or Agent

The repository ships one conductor skill and focused specialist skills in the open Agent Skills format. The model first sees each skill's name and description, then loads the full `SKILL.md` and references only when relevant. This keeps routine prompts small while preserving detailed workflows.

## Install into a project

Run one command from the project you want the agent to work in:

```bash
pnpm dlx automated-product-engineer
```

The default install is universal and includes the complete local reference kit:

- 17 adaptive agent skills and discovery adapters for the supported agents.
- Architecture, state, design-system, testing, delivery, and retrospective guides.
- Integration checklists and copyable design, component, state, testing, CI, automation, and retrospective templates.
- Three working business-logic case studies, including an offline-first native field workflow, thin API routes, domain services, repositories, Supabase adapters and migrations, an interactive semantic-token system, and browser test examples.
- Executable Swift patterns plus native iOS guidance for Xcode, SwiftUI and UIKit, strict concurrency, AuthenticationServices and Keychain, persistence, capabilities, privacy, signing, TestFlight, and App Store delivery.
- Desktop and mobile evidence from the reference implementations.

The skills are copied to the supported agent locations. All non-runtime reference material is kept under `.automated-product-engineer/`. Its `INSTALLATION.md` gives the agent a map of the installed material. The host application does not import this folder at runtime.

### Optional controls

Most teams do not need flags. For a narrower installation:

```bash
pnpm dlx automated-product-engineer --target codex --only skills,docs
```

Use `--project ../another-app` when running outside the target project. Available parts are `skills`, `docs`, `templates`, and `examples`. The installer refuses to overwrite different existing files unless `--force` is supplied.

Supported targets:

| Target | Installed convention | Invocation |
| --- | --- | --- |
| default | Universal skill locations and thin adapters | Ask the active agent to use `automated-product-engineer` |
| `codex` | `.agents/skills/<name>/SKILL.md` | `$automated-product-engineer ...` |
| `claude` | `.claude/skills/<name>/SKILL.md` | `Use the automated-product-engineer skill ...` |
| `cursor` | `.ai/skills/` plus a Cursor rule and `/automated-product-engineer` command | `/automated-product-engineer` |
| `windsurf` | `.ai/skills/` plus a workspace rule | Ask Cascade to use `automated-product-engineer` |
| `copilot` | `.agents/skills/` plus a reusable prompt file | Run the `automated-product-engineer` prompt |
| `orca` | both Codex and Claude skill locations | Launch Codex or Claude Code in Orca and invoke the corresponding skill |
| `generic` | `.ai/skills/` plus `AI_WORKFLOW.md` | Attach or reference `AI_WORKFLOW.md` |

Review the installation diff and keep repository-specific commands, architecture, and permissions in the target project's own `AGENTS.md` or equivalent instructions.

Every installed skill uses adaptive intake. It inspects the repository and available source material first, asks only for missing decisions that affect the work, and generates one contextual request when another design tool or teammate must supply an artifact or answer.

### Onboard the repository

The zero-flag install offers to analyze the current codebase in an interactive terminal. Run the same workflow later with no configuration flags:

```bash
pnpm dlx automated-product-engineer onboard
```

Choose the product and engineering domains to review. The command creates `.automated-product-engineer/onboarding/` with refreshable static evidence and team-owned practices, requirements, inconsistencies, decisions, upgrade, test, and retrospective documents. It also installs `project-engineering-context`, which specializes every shared skill with the repository's accepted differences. Give that workspace to `codebase-onboarding` to validate the evidence, reconcile the documentation, and prepare the first three product-sized upgrade slices.

### Audit before upgrading

Run the read-only scanner when the request is to assess, modernize, or debug an existing application:

```bash
pnpm dlx automated-product-engineer audit --json
```

Give the report to the `codebase-upgrade` skill. It validates static signals against actual callers and data flow, maps confirmed evidence to a concrete pattern and anti-pattern, recommends no more than three reviewable upgrade slices, and asks the user which outcome to prioritize before it changes architecture.

## A good first request

```text
Use the automated-product-engineer skill to build [FEATURE] from [DESIGN, EXPORT, OR BRIEF].

Preserve the existing design system and application architecture. Establish the product and state contract, implement the smallest stable vertical slice, validate desktop and mobile behavior, capture demo screenshots, run the retrospective fix-back loop, and open a draft PR with current evidence. Do not merge.
```

For a narrower task, invoke the specialist directly:

```text
Use the responsive-design skill to fix this component across compact, intermediate, and wide containers.
```

```text
Use the frontend-api-db skill to add this durable preference with authorization, rollback, and cache reconciliation.
```

## Orca

Orca is an agent development environment that launches agents such as Codex and Claude Code rather than replacing their instruction systems. Install with `--target orca`, open the target repository in Orca, select the underlying agent, and invoke the skill using that agent's syntax. Orca can then provide the worktree, terminal, browser, diff, and review surface around the same workflow.

## Why the adapters differ

Codex and Claude Code support `SKILL.md` directories directly. Cursor uses project rules and commands. Windsurf uses workspace rules. GitHub Copilot supports repository instructions, prompt files, and agent skills. The adapters keep one canonical skill library and add only the thin discovery layer required by each tool.

Current format references:

- [OpenAI Agent Skills](https://developers.openai.com/api/docs/guides/tools-skills)
- [Anthropic Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Cursor project rules](https://docs.cursor.com/context/rules)
- [Cursor commands](https://docs.cursor.com/en/agent/chat/commands)
- [GitHub Copilot customizations](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/customization-cheat-sheet)
- [Orca documentation](https://www.onorca.dev/docs)
