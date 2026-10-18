# Work-item product contract

A signed-in operator moves a work item through review without losing intent during retries, offline periods, or concurrent edits.

## Shared truth

The server owns authorization, valid transitions, canonical revision, and accepted operation IDs. The product kernel owns the same client-side projection, retry classification, optimistic state, and conflict explanation on both platforms. Native shells own layout, navigation, lifecycle, capability presentation, and accessibility.

## Completion

Android and iOS must pass the same scenario vector IDs, render loading/ready/submitting/queued/conflicted/failed states, preserve operation identity across retry, and expose the contract digest in diagnostics.
