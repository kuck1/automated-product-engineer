# Delivery Lifecycle

Use these stages as evidence gates. The conductor owns progression and the run record; specialist workers own non-overlapping boundaries. A changed or rebased SHA invalidates affected evidence.

## Intake and contract

1. **Intake and provenance** — Pin the request, design sources, issue, acceptance criteria, repository, exact base, existing work, dependencies, authority, and missing information.
2. **Product and design contract** — Write explicit stories and a visible-state matrix; resolve or escalate material ambiguity.
3. **Architecture and risk contract** — Define boundaries, state ownership, persistence, authorization, migrations, integrations, rollout, rollback, and test seams.
4. **Work allocation** — Choose the smallest reviewable dependency graph, isolate write-heavy work, assign non-overlapping ownership, and name one conductor.

## Build and verify

5. **Test-driven implementation** — Prove risky seams with focused failing tests, build the smallest stable vertical slice, and commit coherent changes.
6. **Automated verification** — Run focused tests while iterating; after behavior stabilizes, run the full required checks plus risk-based API, database, visual, accessibility, security, and Playwright coverage.
7. **Independent review** — Review correctness, simplification, architecture, and security from a fresh context. Fix each issue at the owning boundary and rerun invalidated evidence.
8. **Manual browser QA** — Use a real authenticated agent-controlled browser session, separate from Playwright. Exercise accepted stories through visible controls, inspect console/network/server behavior, test persistence and failure paths, drag through responsive transitions, and capture evidence on the exact release SHA.

## Learn, fix, and hand off

9. **Implementation retrospective** — Record what shipped, scope changes, data/state flow, defects, architectural and operational findings, feature lessons, pipeline lessons, immediate improvements, and future work. Ground each finding in evidence.
10. **Retrospective fix-back** — Fix the highest-impact issues that are safe and in scope, especially correctness, security, authorization, data integrity, primary-flow, runtime, accessibility, responsive, and repeatable pipeline defects. Add regression coverage and repeat the affected manual paths.
11. **Knowledge synchronization** — Update the living feature guide with final current truth and promote reusable delivery lessons into shared documentation, tests, runbooks, or skills. Preserve the retrospective as history.
12. **Deferred work** — Put important non-blocking work in a durable backlog with impact, evidence, safe-to-defer reasoning, revisit trigger, dependencies, and acceptance criteria. Do not create speculative cleanup tickets without evidence.
13. **Release and handoff** — With required human authority, promote one exact SHA, verify the environment, observe the result, and post the authorized issue-tracker or team-channel handoff with PRs, test link, screenshots, short video, QA evidence, retrospective, current docs, and deferred tickets.

## Evidence rules

- Every gate records the exact SHA, command or scenario, result, artifact link, owner, and timestamp needed for another operator to resume.
- Playwright proves repeatable automated paths; manual QA explores the actual browser experience. Neither substitutes for the other.
- A visual baseline update is not a passing gate until the diff is inspected and the suite passes normally.
- A bug found manually closes only after reproduction, the smallest practical regression test, a boundary-level fix, automated verification, deployment of the new SHA, and manual retest.
- Merge, production promotion, destructive data work, secrets, material product/design decisions, and external messaging remain human-gated unless a narrower standing policy explicitly authorizes them.
