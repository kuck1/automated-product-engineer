# Executable Kotlin patterns

These framework-free Kotlin examples prove the invariants that an Android repository, Room transaction, worker, and ViewModel should preserve. They are references to adapt, not a runtime library.

```bash
gradle test
```

In a host Android project, use the committed wrapper (`./gradlew test`) and port the tests into the owning module. The examples cover:

- versioned and idempotent workflow changes;
- durable outbox retry, conflict, and acknowledgement;
- identity-scoped cache cleanup on account transitions.

The UI may optimistically project these operations, but the server and durable repository remain authoritative.
