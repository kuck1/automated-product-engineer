# Adoption and migration

## Start with a divergence hotspot

Inventory duplicated business rules, state machines, validation, models, API parsing, auth refresh, sync logic, analytics, and tokens across Android and iOS. Select one bounded rule with meaningful drift cost, strong characterization tests, few platform dependencies, and a reversible integration path.

Write shared scenario vectors before moving implementation. Build a KMP module beside the existing apps, reproduce current behavior, and connect one platform at a time behind a flag. Keep the old implementation until parity, observability, rollback, and performance evidence are accepted.

## Migration sequence

1. Reconcile product terminology and observable behavior.
2. Add canonical contracts and characterization tests.
3. Extract pure domain logic.
4. Introduce ports around platform dependencies.
5. Connect the Android shell and compare production-like fixtures.
6. Stabilize the Swift-exported facade, connect iOS, and compile Swift consumers.
7. Add cross-platform compatibility and native journey evidence.
8. Remove duplicate implementations only after rollout.

Do not begin with navigation, every database table, or a design-system rewrite. Grow the shared boundary through proven vertical slices. Retain native implementations where extraction increases coupling or hides meaningful OS behavior.
