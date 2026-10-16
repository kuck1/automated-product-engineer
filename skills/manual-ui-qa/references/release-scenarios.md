# Manual Release Scenarios

## Choose combinations by risk

Do not exhaustively multiply every input. Cover representative combinations across:

| Dimension | Examples |
| --- | --- |
| entry | clean URL, deep link, back/forward, notification or external link |
| identity | authorized owner, collaborator, wrong tenant, signed out |
| data | empty, one item, dense, long text, duplicate, stale, partial |
| network | normal, slow, rejected, timeout, retry, out-of-order response |
| interaction | pointer, keyboard, repeated click, cancel/reopen, refresh |
| viewport | compact, transition widths, wide, short-height window |
| persistence | optimistic pending, success, rollback, hard refresh, second surface |

Prioritize combinations that cross authority, persistence, navigation, or asynchronous boundaries.

## Observe more than pixels

Keep console and network panels visible when practical. Confirm request method, payload shape, status, response, duplicate calls, cache behavior, and whether errors reach observability. Check focus order, accessible names, Escape, outside click, scroll ownership, safe areas, and the final reachable item.

## Evidence record

For each important scenario record:

```text
SHA / environment / URL / viewport
Test identity and seeded data namespace
Starting state
Actions
Expected result
Observed result
Console, network, or server evidence
Screenshot or short clip
Cleanup performed
```

Never place passwords, tokens, private customer data, or sensitive request bodies in evidence.

## Defect closure

A manually discovered defect is closed only after it is reproduced, assigned to the owning boundary, protected by the smallest practical regression test, fixed, verified by focused automation, deployed at a new exact SHA, and manually retested along the original and adjacent paths.

Classify blockers separately from environment failures, stale fixtures, and automation-control mistakes. Explicitly report untested scope.
