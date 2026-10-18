# Feature capsule protocol

A capsule is a reviewable directory that can be frozen before platform work begins:

```text
contracts/features/<feature>.feature.json
contracts/api/<feature>.openapi.yaml
contracts/scenarios/<feature>.vectors.json
contracts/components/<feature>.*.component.json
contracts/tokens/product.tokens.json
docs/product/<feature>.md
```

Include the actor, trigger, desired outcome, product language, entities, states, intents, allowed transitions, guards, authorization decisions, errors and recovery, analytics, flags, offline and concurrency rules, accessibility intent, and meaningful scenario vectors.

The compiler emits Kotlin and TypeScript policy, typed protocol declarations, documentation tables, and a manifest containing the source digest. Generators must be deterministic, fail on missing or unknown values, reject cycles, and never silently preserve handwritten edits.

Scenario vectors are examples with identity. Give each a stable ID and initial state, command, expected decision, canonical state, visible recovery, and telemetry when relevant. Add the smallest failing production case before fixing a parity defect.

Do not encode typography, platform navigation, control placement, or lifecycle mechanics in a feature state machine. Express shared intent and allow each native projection to honor its platform conventions.
