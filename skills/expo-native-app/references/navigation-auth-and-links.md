# Navigation, authentication, and links

## Navigation ownership

Use route groups and layouts for stacks, tabs, modals, and protected route boundaries. Keep session acquisition in one provider and render a deliberate bootstrap state while persisted credentials are restored. Preserve an inbound destination through sign-in only after validating it as an allowed in-app route.

Test:

- cold launch into a protected deep link;
- sign-in cancellation and provider error;
- app backgrounded during the provider flow;
- session restored after process death;
- token refresh during foreground use;
- revoked or expired session;
- sign-out from another device;
- account switching;
- back behavior after sign-in and sign-out.

## OAuth and Google sign-in

Use Authorization Code with PKCE or a provider SDK supported by the chosen auth service. Generate redirect URIs from the configured app scheme. Never embed an OAuth client secret in the application bundle. Exchange any flow that requires a secret on a trusted server.

Use a development build for stable OAuth redirects. Expo Go cannot represent the application's production scheme reliably. If Google sign-in is offered on iOS, evaluate the current App Store requirement for an equivalent Sign in with Apple option before submission.

For Supabase React Native sessions:

- use the public project URL and publishable/anon key in the client; never ship a service-role key;
- persist sessions in the repository's chosen supported storage adapter;
- keep `detectSessionInUrl` off for native clients and explicitly handle the callback;
- start token auto-refresh while the app is active and stop it in the background;
- authorize every row or operation with server policy and RLS; a valid session is identity, not object authorization.

SecureStore is appropriate for small secrets. Do not use it as a general offline database. Document platform backup and biometric invalidation behavior when it matters.

## Deep-link contract

Define one canonical route parser shared by OAuth callbacks, universal/app links, notifications, and external intents. Reject unknown or privileged destinations. Test custom schemes and associated domains/app links in a development or release build, including cold and warm launches.

Official references: [Expo authentication](https://docs.expo.dev/guides/authentication/), [Expo Router authentication](https://docs.expo.dev/router/advanced/authentication/), [Linking](https://docs.expo.dev/linking/into-other-apps/), [Supabase React Native auth](https://supabase.com/docs/guides/auth/quickstarts/react-native), and [Secure local data](https://docs.expo.dev/develop/user-interface/store-data/).
