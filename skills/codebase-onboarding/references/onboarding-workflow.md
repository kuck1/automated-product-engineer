# Onboarding workflow

## 1. Pin authority and scope

Identify the repository, exact branch or pull request, product owners, supported runtimes, production boundaries, release path, and what the user authorized. Preserve active work and existing delivery constraints.

## 2. Read before interpreting

Inventory and read `README`, `AGENTS`, contributing guides, product requirements, ADRs, architecture notes, API contracts, schema and migrations, design-system guidance, test strategy, CI, deployment files, security notes, runbooks, and incident records. Mark each document current, partially current, contradicted, or unverified. Never treat old prose as more authoritative than verified behavior without surfacing the conflict.

## 3. Map real journeys

Choose representative journeys: read, write, permission failure, concurrent edit, retry or offline recovery, and a responsive or native flow. Trace each across UI state, URL state, server cache, controller, route, service, database, auth, observability, and tests. Record each owner and handoff.

## 4. Inspect every active domain

Use the domain review matrix. For each domain record current pattern, evidence, strength, inconsistency, failure mode, target contract, responsible specialist, and smallest proof. Package names and directory structure are signals, not conclusions.

## 5. Reconcile docs and code

Classify conflicts:

- documentation promises behavior code does not provide;
- code implements an undocumented convention;
- two paths solve the same problem differently;
- tests preserve obsolete behavior;
- policy or authority is duplicated across client and server;
- production assumptions have no executable proof.

Resolve product-policy conflicts with the relevant owner. Resolve implementation inconsistencies through a selected upgrade slice.

## 6. Produce the local contract

Update the onboarding workspace and `project-engineering-context` skill. State verified facts with file evidence, distinguish rules from preferences, name exceptions and their owners, and link decisions to upgrade slices. Keep reusable knowledge in the shared skills; keep repository-specific paths, tools, and decisions locally.

## 7. Select and run the program

Order work by user harm, security and data risk, dependency, learning value, reversibility, and review size. Begin with a single product journey that proves the target pattern. Use the upgrade and feedback loop reference for each slice.

## 8. Hand off to the team

Commit the onboarding workspace and local skill overlay with the application. In the draft pull request, explain preserved patterns, selected upgrades, deferred work, exact evidence, rollback, and the next decision. The repository then carries its own operating context into every future agent session.
