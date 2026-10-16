# Claude Design export integration checklist

Use this checklist when a Claude Design export is already available.

## 1. Inventory before editing

- List every export file.
- Read `HANDOFF.md` first, then exact copy, config, tokens, reference component code, prototype state controls, `frames.json`, canonical images, and editable source.
- Render or open the prototype at several canonical desktop and mobile states.
- Record contradictions between handoff, prototype, code, and screenshots. Treat screenshots as the visual source of truth and the handoff as the behavior/data source unless the package says otherwise.
- Inspect repository and directory instructions before changing code.

## 2. Build the implementation contract

Map the export to the application in a short working note:

| Export contract | Application owner |
| --- | --- |
| layout and visual parts | existing components or new local component |
| semantic tokens | existing token, new token, or justified local value |
| copy and configuration | config/settings/copy module |
| eligibility and feature flag | server/client flag helpers |
| authoritative data | query/service/API |
| completion and reminders | database fields and mutation endpoint |
| analytics and timings | established event helper |
| routes and final navigation | application router |
| canonical states | fixture/query controls and tests |

Identify unresolved product choices separately. Ask only when a choice blocks correctness and cannot be inferred from explicit context.

## 3. Implement in application architecture

- Reuse existing primitives and semantic tokens before adding new ones.
- Keep server-side authorization, eligibility, persistence, and data computation authoritative.
- Gate all entry points, routes, and endpoints belonging exclusively to the feature.
- Avoid fetching or mutating feature data when the flag is off.
- Keep first-time, existing-user update, reminder, and replay state distinct.
- Treat a replay as presentation-only unless the product contract explicitly says otherwise.
- Make API failure recoverable; never trap the user behind a permanently blocking failed request.
- Keep intermediate mutations from invalidating and unmounting a still-active flow. Delay refreshes that alter eligibility until the user has reached a safe terminal state.
- Track dwell time from initial visibility and per-step visibility; flush the current step on transition, completion, dismissal, and unmount without double-counting.
- Use a single stable dialog/panel shell across steps and animate the changing content inside it.
- Apply reduced-motion behavior and respect existing motion libraries.

## 4. Create deterministic verification states

Prefer an existing design-system fixture route. Otherwise add development/test-only query parameters that do not alter production eligibility. Cover:

- every step;
- first-time and replay modes;
- boundary numbers and long copy;
- loading, error, retry, completion, and dismissed/reminder states;
- desktop and mobile viewports from `frames.json`.

Fixture behavior must be deterministic and must not write production state unless a test explicitly requests it.

## 5. Visual comparison

For each canonical frame:

1. Open the matching deterministic state at the exact viewport and device scale.
2. Capture a screenshot of the same region.
3. Create an overlay or pixel diff against the reference.
4. Inspect color, typography, line height, radii, border/shadow, geometry, wrapping, overflow, and icon rendering.
5. Fix the implementation; update a baseline only when the export or an explicit product decision changed.

Do not accept a snapshot merely because it is internally consistent. The supplied reference is the visual target.

## 6. Focused test matrix

- Eligibility: flag on/off, allowed/disallowed account or cohort, threshold boundaries.
- State machine: forward/back transitions, guards, final action, reopen/replay.
- Persistence: success, idempotency, stale state, request failure, retry.
- Lifecycle: intermediate refresh, route change, remount, final redirect, replay staying in place.
- Interaction: button/keyboard path, focus management, Escape/outside-click policy, dismiss/remind behavior.
- Analytics: open source, step view, action, elapsed time, completion, dismissal, error, no duplicate sends.
- Data: zero, pending, resolved, large values, missing data, server refresh.
- Responsive/UI: canonical desktop/mobile states and stable shell geometry.
- Isolation: unrelated users and flag-off paths retain their prior UI and requests.

## 7. Final review

- Compare final behavior to every acceptance criterion and open-decision resolution.
- Search for sample copy, hardcoded thresholds, remote assets, bypassed flags, client-authoritative security decisions, and fixture leakage.
- Run focused tests, visual checks, typecheck, lint, build, and the repository's required gates once stable.
- Report the export-to-app mapping, screenshots/diffs, validation, deviations approved by product, and any remaining external blocker.
