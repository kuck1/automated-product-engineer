# Device capabilities and permissions

Treat permission prompts and background execution as product states controlled partly by the operating system.

## Capability contract

For each camera, photos, location, contacts, microphone, notification, file, biometric, or background capability, define:

- the user outcome that justifies access;
- whether a native build/config change is required;
- iOS usage copy and Android permissions;
- when the app asks and the pre-permission explanation;
- limited, denied, blocked, revoked, unavailable, and interrupted states;
- settings recovery path;
- data minimization, retention, upload, and deletion behavior;
- emulator limitations and the required physical-device test;
- background and terminated behavior.

Ask in context, after an explicit user action when practical. A denied permission must leave a useful application. Do not loop the system prompt; once blocked, explain why and provide a settings action only when it helps.

## Notifications

Notifications are server-to-device delivery, not a durable inbox. Store meaningful events on the server, treat delivery receipts separately from product completion, validate notification payload routes, and fetch current authorized data after opening. Test foreground, background, and terminated receipt; permission denied; invalid token; duplicate delivery; account switching; and deep-link authorization.

Push notifications require a development or release build. Prefer a visible notification unless background execution is truly required; mobile operating systems do not guarantee arbitrary background work.

## Background work

Design background tasks as opportunistic and idempotent. Persist a cursor or checkpoint, cap work, handle expiration, and finish cleanly. The foreground path must recover even if the background task never runs.

Official references: [Push notification overview](https://docs.expo.dev/push-notifications/overview/), [Notification behavior](https://docs.expo.dev/push-notifications/what-you-need-to-know/), and [Sending notifications](https://docs.expo.dev/push-notifications/sending-notifications/).
