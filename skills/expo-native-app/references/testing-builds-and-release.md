# Testing, builds, updates, and release

## Evidence ladder

1. Pure domain tests for policy, merge, queue, and conflict behavior.
2. React Native Testing Library tests for component behavior and accessibility.
3. Router integration tests for protected and deep-linked flows.
4. A development build workout on the relevant simulator/emulator.
5. Physical-device testing for permissions, camera, notifications, biometrics, performance, and real network transitions.
6. Maestro or the repository's E2E runner against installable iOS and Android artifacts.
7. Preview/TestFlight/Play testing on the same native runtime intended for production.

Record device model, OS, app version, build number/version code, runtime version, commit, EAS build/update ID, environment, identity, and fixture.

## Build vs update decision

A new native build is required when native dependencies, plugins, permissions, entitlements, app config that affects native projects, Expo SDK, or native code changes. An EAS Update can carry compatible JavaScript and assets only. Runtime versions prevent an update from loading into an incompatible binary.

Use separate development, preview/staging, and production channels. Test an update on a build with the same runtime before production. Promote the tested artifact or exact commit. Roll out gradually when impact warrants it, monitor crashes and product signals, and keep the rollback command and owner in the release record.

## Release gates

- app scheme, universal/app links, and auth callbacks work in release-like builds;
- secrets and service credentials are absent from the bundle and logs;
- permissions and privacy manifests match actual use;
- icons, splash, versioning, bundle/package IDs, signing, and store metadata are correct;
- offline, resume, update, and failure recovery are verified;
- accessibility, text scaling, safe areas, keyboard, reduced motion, and touch targets pass;
- staged update and store-binary rollback paths are documented;
- production update channels are protected where the platform supports it.

Official references: [Expo unit testing](https://docs.expo.dev/develop/unit-testing/), [Maestro on EAS Workflows](https://docs.expo.dev/eas/workflows/examples/e2e-tests/), [Runtime versions](https://docs.expo.dev/eas-update/runtime-versions/), [Deploy updates](https://docs.expo.dev/eas-update/deployment/), and [Rollbacks](https://docs.expo.dev/eas-update/rollbacks/).
