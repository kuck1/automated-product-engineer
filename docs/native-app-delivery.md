# Expo and React Native delivery

The native profile extends the same product-engineering system to iOS and Android. It treats the device runtime, native binary, JavaScript update, operating-system lifecycle, and server as separate owners with explicit compatibility boundaries.

## What the installer detects

Running `pnpm dlx automated-product-engineer` reads the target project's manifest, lockfile, app config, native folders, and EAS configuration. It records a `.automated-product-engineer/project-profile.json` containing:

- Expo, bare React Native, Next.js, or unknown platform;
- package manager and router;
- app name, scheme, iOS bundle identifier, and Android package;
- committed native directories and development-client status;
- detected auth, notification, secure-storage, query-cache, local-database, camera, location, and background-task capabilities;
- actionable configuration warnings.

Use `pnpm dlx automated-product-engineer doctor` to print the current profile. Use `--json` when another tool needs the structured result.

## Launch with one command

From an Expo project:

```bash
pnpm dlx automated-product-engineer launch
```

The launcher uses the project's lockfile to select pnpm, npm, Yarn, or Bun. It adds `--dev-client` when `expo-dev-client` is installed. Optional `--ios`, `--android`, `--web`, `--tunnel`, and `--clear` flags pass through deliberate launch choices without making them mandatory for ordinary work.

The launcher does not silently generate native projects, install modules, change schemes, or create credentials. Those operations can invalidate owned native work or require external accounts. The `expo-native-app` skill inspects the project and makes the needed change within the user's scope.

## Runtime model

| Layer | Owns | Requires a new binary? |
| --- | --- | --- |
| route and UI | navigation composition, interaction, rendering | no, if native dependencies/config are unchanged |
| JavaScript update | compatible JS and bundled assets | no, when runtime version matches |
| native runtime | native modules, plugins, permissions, entitlements | yes |
| operating system | lifecycle, permissions, background limits, links | platform verification required |
| server | identity, authorization, durable policy, sync | independently deployed and backward compatible |

Expo Go is useful for supported JavaScript exploration. Use a development build for custom native modules, stable OAuth redirects, push notifications, and production-like behavior. Use preview or store-distributed builds for final release evidence.

## Product architecture

- Expo Router or React Navigation owns route state and protected navigation boundaries.
- A session provider owns identity bootstrap and auth events.
- TanStack Query or the existing server-cache library owns remote snapshots and mutation reconciliation.
- Component state owns transient interaction.
- SecureStore owns small secrets when required; a local database owns substantial offline data.
- The server and database own permissions, canonical revisions, conflicts, and multi-user truth.
- Realtime subscriptions prompt canonical reconciliation and do not replace durable reads.

The installed native examples show lifecycle-aware session refresh, a versioned offline outbox, safe notification routing, and permission-state modeling.

## Auth and links

Native OAuth needs a stable custom scheme or universal/app link, an allowed redirect in the auth provider, and a development or release build. Secrets never belong in `EXPO_PUBLIC_*` variables. Supabase's project URL and publishable key can be public when database access is protected by grants and RLS; service-role keys remain server-only.

Verify cold and warm callback launches, cancellation, provider errors, process death, revoked sessions, background refresh, sign-out, account switching, and protected deep links. Google sign-in on iOS may create a current store-review requirement to provide Sign in with Apple; confirm the rule before submission.

## Native release model

Use development, preview/staging, and production build profiles. Give every store version a compatible runtime version. An update can change JavaScript and bundled assets only; native dependencies, plugins, permissions, entitlements, Expo SDK, or native configuration require a new build.

Test updates on the same runtime before production, promote the tested artifact or exact commit, use a gradual rollout when risk warrants it, monitor crashes and product signals, and keep both update rollback and store-binary recovery documented.

Authoritative references: [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/), [Expo authentication](https://docs.expo.dev/guides/authentication/), [Supabase React Native auth](https://supabase.com/docs/guides/auth/quickstarts/react-native), [EAS runtime versions](https://docs.expo.dev/eas-update/runtime-versions/), and [EAS deployment](https://docs.expo.dev/eas-update/deployment/).
