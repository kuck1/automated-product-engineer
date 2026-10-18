# Field Relay native reference

Field Relay is the Expo-native counterpart to the interactive case study. Start from `templates/native/expo-router`, then use these files for the mission domain, offline outbox, and field screen.

The complete contract is documented in `docs/case-studies/field-relay.md`. Keep the following boundaries when adapting it:

- route state selects a mission or stop;
- TanStack Query owns the canonical mission snapshot;
- a persistent local outbox owns unconfirmed operations;
- camera and location live behind permission-aware adapters;
- the service and Postgres RPC own authorization, transitions, evidence gates, revisions, and idempotency;
- realtime wakes a canonical read and never replaces it.

Use a development build for Google OAuth, camera/location verification, notifications, and stable schemes. Never place OAuth client secrets or a Supabase service-role key in the application.
