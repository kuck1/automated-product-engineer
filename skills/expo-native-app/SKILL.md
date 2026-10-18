---
name: expo-native-app
description: Build, launch, debug, and deliver production Expo or React Native applications. Use when work touches native navigation, OAuth, deep links, app lifecycle, device capabilities, offline state, development builds, EAS updates, store builds, or native QA.
---

# Expo Native App

Treat iOS, Android, and web as distinct runtimes sharing a product contract. Do not infer native correctness from a responsive browser view or treat Expo Go as a production-equivalent host.

## Establish the native contract

Inspect `package.json`, app config, router, native directories, EAS configuration, environment handling, auth provider, storage, state libraries, native modules, permissions, deep links, notifications, tests, and release channels. Run `pnpm dlx automated-product-engineer doctor` when the toolkit is available.

Identify the target platforms and the exact runtime for this change:

- Expo Go for JavaScript-only exploration with supported modules.
- a development build when OAuth redirects, push notifications, custom native modules, or production-like schemes are involved;
- a preview or store build for release evidence;
- Expo web only as an additional platform, never as proof of iOS or Android behavior.

Read [project-intake-and-launch.md](references/project-intake-and-launch.md) when creating, adopting, launching, or debugging an app.

## Build through native boundaries

- Keep routes and layouts responsible for navigation composition, not domain policy.
- Put remote snapshots and mutations in a server-cache layer. Put durable cross-user policy on the server.
- Use local component or reducer state for transient interaction; use secure storage only for small sensitive values; use a local database for substantial offline data.
- Model foreground, background, terminated, offline, reconnecting, permission-denied, deep-link, interrupted-auth, and update/restart states when they affect the feature.
- Hide platform APIs behind narrow adapters when behavior differs across iOS, Android, and web.
- Configure native behavior through supported app config and config plugins. Preserve hand-edited native code when the repository intentionally owns native projects.
- Use safe-area, keyboard, text scaling, reduced motion, touch target, screen-reader, and platform navigation conventions as product requirements.

Read [navigation-auth-and-links.md](references/navigation-auth-and-links.md) for routing, protected screens, Google or Apple auth, session refresh, and deep links. Read [state-offline-and-realtime.md](references/state-offline-and-realtime.md) for client state, caching, offline writes, races, multi-window or multi-device updates, realtime subscriptions, and recovery. Read [device-capabilities.md](references/device-capabilities.md) when the feature uses notifications, camera, photos, location, files, background tasks, or other permissions.

## Prove the app in its real runtime

Run focused units and component tests first. Then install and open the appropriate development or preview build. Exercise cold start, warm resume, background/foreground transitions, network loss, retry, deep links, denied permissions, keyboard and input, rotation if supported, text scaling, and at least one physical-device path for hardware-dependent features. Inspect Metro, device, native crash, and network logs.

Read [testing-builds-and-release.md](references/testing-builds-and-release.md) before changing native dependencies, app config, runtime versions, updates, signing, EAS channels, store delivery, or release automation.

Capture the app version, native build identifiers, runtime version, commit, update ID or channel, device/OS, test identity, and evidence. A JavaScript update cannot repair missing native code; changes to native dependencies or configuration require a compatible new build.

## Delivery boundary

Prepare configuration, tests, build profiles, launch instructions, and review evidence within the user's authorized scope. Creating credentials, submitting to stores, publishing an update, changing a production channel, or rolling back users is an external release action and requires the user's authority.
