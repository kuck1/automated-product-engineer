# Native Android integration templates

These files demonstrate boundaries rather than prescribe a new repository structure. Map package names, dependency injection, navigation, theme, version catalog, build logic, and adapters to the host app.

- `compose-app/WorkItemFeature.kt` shows immutable UI state, a screen-level ViewModel, lifecycle-aware collection, and a stateless screen.
- `compose-app/ProductDesignSystem.kt` shows semantic product roles layered on Material 3.
- `compose-app/AppEnvironment.kt` keeps repositories and platform adapters at composition.
- `compose-app/app/src/main/res/xml/network_security_config.xml` denies cleartext by default.
- `compose-app/.github/workflows/android.yml` shows a review gate for an existing project with a committed wrapper.

Do not copy literal package names, versions, signing values, or backend configuration. Do not commit signing secrets. Run the real module tests, lint, bundle, emulator journey, and physical-device checks described in the Android skill.
