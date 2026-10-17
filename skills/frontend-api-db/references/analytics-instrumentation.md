# Product Analytics Instrumentation

Instrument a product decision or observable behavior, not every render. Prefer durable database state when it already answers the question more reliably than a new event.

## Define the contract

Before editing, state the question or funnel step the signal answers. Search the existing event catalog, helpers, and production call sites before adding another event. Choose one authoritative capture side:

- client for an observed interaction, visibility threshold, or rendered exposure;
- server for an API-only outcome known only after the durable operation completes;
- database or query for historical state and current totals.

Do not fire the same semantic event from both client and server. If both layers need a signal, give each event a distinct meaning.

## Preserve meaning and privacy

Use a typed event name and constrained property contract. Prefer stable entity identifiers, enums, booleans, counts, content lengths, normalized route patterns, and stable error categories. Exclude names, contact details, free text, raw searches, notification content, query strings, fragments, signed URLs, access tokens, and raw exception messages that may contain user or infrastructure data.

Fire at the semantic moment:

- interaction when the user performs the action;
- impression only when the item satisfies the defined visibility threshold;
- exposure only after eligibility and the rendered condition are known;
- success only after the authoritative operation succeeds;
- failure from the branch that actually failed, with an error category that describes that operation.

Choose a dedupe lifetime that matches the claim: per surface visit, per panel opening, per entity and idempotent action, or none when repeated actions matter. Do not consume a one-time dedupe marker before user identity or eligibility resolves. Buffer early intent only when the implementation can later flush it once, in order, through the same eligibility guard.

Attach replay or rich diagnostic context only when it materially helps investigate actionable friction. Routine clicks and successful navigation do not justify the additional collection.

## Complete and verify the slice

Land the catalog entry, typed helper, real production call site, shared context, and focused tests together. Verify:

1. the exact event and property contract;
2. eligible, ineligible, missing-client, and delayed-identity behavior;
3. correct success, failure, visibility, and exposure timing;
4. intended exactly-once or repeat behavior;
5. absence of prohibited raw content;
6. a real production call site for every catalog entry.

Self-review the event name, helper, call site, and tests as one behavioral contract. An event helper without a production use, or a call site without a typed and privacy-safe contract, is incomplete.
