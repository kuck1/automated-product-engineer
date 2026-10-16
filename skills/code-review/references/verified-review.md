# Verified Working-Diff Review

## Pin the compare range

Record base SHA, head SHA, staged diff, unstaged diff, untracked files, changed-file list, and applicable repository instructions. If reviewing a branch, fetch its intended base and use a three-dot comparison. Do not silently include unrelated user changes.

Read full changed files and the closest callers. For boundary changes, inspect both sides: client and route, route and service, service and schema, component and controller, producer and consumer.

## Candidate matrix

| Angle | Questions |
| --- | --- |
| logic | Which input, state, or ordering produces the wrong result? |
| async | Can responses arrive out of order? Is cancellation or latest-intent handling correct? |
| state | Are URL, local, cache, and durable sources given explicit precedence? |
| contracts | Do DTO, schema, API, enum, and serialization assumptions agree? |
| authorization | Does the authoritative server boundary enforce object and operation access? |
| persistence | Are retries idempotent and migrations compatible with mixed versions? |
| UI | Are loading, empty, partial, error, keyboard, and responsive states reachable? |
| reuse | Does an established helper or component already own this behavior? |
| efficiency | Is work unbounded, repeated per row, or performed on every render? |
| tests | Which new contract or negative path is unproved? |

## Verify before reporting

For each candidate:

1. State the exact precondition and action.
2. Trace execution through the relevant branches.
3. Confirm no upstream validation, framework guarantee, or downstream check prevents it.
4. Confirm the change introduced or exposed it.
5. Identify the narrowest changed line that owns the problem.
6. Choose the smallest correction that preserves the surrounding design.

Classify the result as confirmed, plausible with a named missing fact, or refuted. Report confirmed findings and only high-value plausible findings. Drop style preferences, compiler output, broad rewrites, and pre-existing issues.

## Severity

- **Critical:** immediate compromise, destructive data loss, or system-wide outage on an ordinary path.
- **High:** common action causes incorrect authorization, durable corruption, or major feature failure.
- **Medium:** realistic edge case causes wrong behavior, stuck state, misleading UI, or material maintainability risk.
- **Low:** localized issue with limited impact; include only when the correction is clearly worthwhile.

## Finding shape

```text
[severity] Short violated contract — path/file.ts:42

When <specific state/input>, <execution path> produces <incorrect outcome> because
<changed behavior>. Correct it at <owning boundary> by <direction>.
```

A useful review can conclude that no actionable finding survived verification. Do not pad it.
