# Project-specific skill overlay

The onboarding command creates `project-engineering-context` in the installed agent skill directories. This overlay is the stable entry point for local differences.

## Keep in the overlay

- product vocabulary and canonical journeys;
- repository instructions and source-of-truth documents;
- runtime, package, test, and delivery commands;
- ownership and authority boundaries;
- state, API, database, auth, design-system, and testing conventions;
- approved exceptions, migration states, and forbidden patterns;
- links to current decisions and the selected upgrade program.

## Keep in shared skills

- reusable engineering principles;
- cross-repository patterns and anti-patterns;
- general test and review procedures;
- examples whose value does not depend on one repository.

## Precedence

Explicit user instructions and repository instructions win. The local overlay specializes shared skills where it records a verified repository decision. It cannot weaken security, falsify evidence, authorize release or merge, or override a more specific instruction.

## Update rule

After each completed slice, update the local overlay only when the accepted repository contract changed. Record reusable lessons separately for upstream skill improvement. This avoids silently turning one application's preference into a universal rule and avoids losing local choices when the toolkit is upgraded.
