# Native reference patterns

These framework-light examples isolate the decisions that make mobile products reliable. Adapt them behind the host application's router, query client, local database, and server contracts.

- `versioned-outbox.ts`: offline intents with idempotency, expected revisions, confirmed results, and explicit conflicts.
- `lifecycle-reconcile.ts`: decide when a foregrounded app must invalidate or fully resynchronize.
- `notification-route.ts`: parse notification payloads into a small allowlisted navigation contract.
- `permission-machine.ts`: model permission education, system prompts, denial, settings recovery, and usable fallback.

The Expo Router template under `templates/native/expo-router/` demonstrates protected navigation, Supabase session lifecycle, Google OAuth in a development build, and a query provider. The Maestro and EAS templates under `templates/native/testing/` provide installable-artifact verification.

The server remains authoritative. These examples make local intent durable and observable without pretending that an offline queue, notification delivery, or optimistic paint is canonical success.
