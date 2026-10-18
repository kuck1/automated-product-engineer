# Project intake and launch

Use this reference to decide what kind of native project exists and how to run it without erasing intentional native work.

## Detect before changing

Inspect:

- `package.json`: Expo SDK, React Native, Expo Router or React Navigation, `expo-dev-client`, native modules, state, auth, and test libraries;
- `app.json`, `app.config.*`: scheme, slug, project ID, runtime version, plugins, permissions, bundle identifier, Android package, and environment-derived values;
- `ios/` and `android/`: whether native projects are committed and contain manual changes;
- `eas.json`: development, preview, staging, production, simulator, and E2E profiles;
- route entry points and root providers;
- lockfile and existing scripts.

Classify the project as managed/CNG Expo, Expo with committed native projects, or bare React Native. `expo prebuild --clean` regenerates native projects; do not run it over owned native changes without establishing that regeneration is the repository's intended workflow.

## Launch decision

Use the repository's package manager.

- Ordinary Expo start: `pnpm expo start`.
- Development client: `pnpm expo start --dev-client`.
- Restrictive network: add `--tunnel`; prefer LAN for normal speed.
- Compile locally: `pnpm expo run:ios` or `pnpm expo run:android` after native prerequisites are installed.
- Clear Metro only for evidence of a stale cache: add `--clear` and record why.

The toolkit command `pnpm dlx automated-product-engineer launch` selects the development client automatically when it is installed. `--ios`, `--android`, `--web`, `--tunnel`, and `--clear` are optional.

## Startup debugging ladder

1. Confirm Node and package-manager versions match the repository.
2. Install from the lockfile and run Expo doctor if the project uses it.
3. Confirm Metro starts without configuration or transform errors.
4. Confirm the installed binary's runtime includes every imported native module.
5. Confirm the device can reach Metro; use tunnel only when LAN is blocked.
6. Confirm app scheme and deep-link host for auth or inbound routes.
7. Separate JavaScript exceptions, native crashes, signing failures, and network failures; each has a different owner.

Do not “fix” a runtime mismatch by deleting native directories, lockfiles, or credentials. Capture the failing command, platform, build/runtime identifiers, first causal error, and the smallest reversible correction.

Official references: [Start developing](https://docs.expo.dev/get-started/start-developing/), [Development builds](https://docs.expo.dev/develop/development-builds/introduction/), and [Use a development build](https://docs.expo.dev/develop/development-builds/use-development-builds/).
