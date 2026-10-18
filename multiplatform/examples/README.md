# Multiplatform pattern examples

These examples describe cross-platform contracts before any native screen is built. They are deliberately executable data: Android, iOS, server, and shared-kernel tests consume the same scenario IDs and expected outcomes.

- `parallel-feature-ledger.json` records ownership, dependency direction, native escape hatches, and the CI proof required for one feature.
- The runnable product-kernel blueprint lives in `templates/kotlin-multiplatform/`.
- Platform-specific edge patterns remain in `android/examples/` and `ios/examples/`.

Do not import the example directory into production. Copy the contract shape, replace its product vocabulary, and keep generated artifacts traceable to one source digest.
