# Field Relay native case study

## Product outcome

Field Relay helps a relief team answer one urgent question: **what is the next safe stop, and has the delivery been verified?** A worker can follow an assigned route, record arrival, capture the required proof, and keep moving when connectivity is weak. The product tells the truth about whether work is saved only on the device or confirmed by the mission service.

This is a fictional product and deterministic demo. Its operating model is grounded in public emergency-management guidance; it is not an endorsed incident-command product.

## Domain research

FEMA describes resource tracking as a continuous process from request through completion. The tracker needs the resource destination, current status, ETA and logistics details, established communication channels, and a clear handoff to incident command. FEMA's Community Lifelines model emphasizes plain-language incident information and coordinated work to stabilize essential services. The logistics capability specifically covers essential commodities, equipment, services, and the movement of goods.

Those constraints shaped the product:

- a **mission** is an assigned operational slice, not an unbounded map;
- every **stop** has destination, priority, assignment, ETA, supply quantity, status, and evidence policy;
- stop transitions are explicit so the coordinator and field worker share the same status language;
- the app records the actual delivered quantity rather than treating route completion as proof of fulfillment;
- device-saved and server-confirmed work remain visibly different;
- the server rejects stale revisions so a second device cannot silently overwrite a changed mission;
- proof capture is scoped to the delivery need and requires an explicit permission/recovery path.

Primary references: [FEMA Resource Tracking](https://rtlt.preptoolkit.fema.gov/Public/Skillset/ViewFile/Skill-1008?a=False&p=1&s=FemaId&type=Pdf), [FEMA Community Lifelines](https://www.fema.gov/emergency-managers/practitioners/lifelines), and [FEMA Logistics and Supply Chain Management](https://emilms.fema.gov/is_2000/content/215.html).

## Experience specification

### Field worker

1. Google OAuth returns to the native scheme and restores the originally requested mission.
2. The route downloads for offline use with its revision and assigned workspace.
3. The current stop keeps priority, ETA, address, load, and required proof together.
4. `Start route`, `Arrived`, and `Capture proof & complete` are the only normal forward actions.
5. When offline, an action becomes `saved on device`; it is never labeled synced.
6. On reconnect or foreground resume, the app submits the idempotent operation and fetches the canonical mission.
7. A revision conflict pauses the queue and shows the current server state before retry.

### Coordinator

- sees status and quantities only after the server confirms them;
- can distinguish queued device work from confirmed delivery when presence is available;
- receives current mission progress without relying on notification delivery as the source of truth;
- retains an operation ID and revision trail for retry and conflict investigation.

## Ownership and implementation

| Concern | Owner |
| --- | --- |
| current sheet, input, pressed state | React Native component state |
| protected route and inbound destination | Expo Router |
| signed-in identity and refresh lifecycle | Supabase session provider |
| canonical mission snapshot | TanStack Query |
| durable offline operation | local outbox/database |
| camera and location access | narrow device adapters |
| workspace access, transitions, proof and quantity gates | domain service |
| version check and durable write | Postgres RPC under RLS |
| live event | invalidation hint followed by canonical read |

The demo API uses the same service contract with a deterministic memory adapter. The Supabase adapter maps the contract to `example_field_missions`, `example_field_stops`, and `save_example_field_stop`. The version update and stop update happen atomically so a failed stop write cannot advance the mission revision alone.

The native runtime uses a development build because the complete flow includes stable OAuth redirects, camera permission, and production-like app links. An EAS Update can ship compatible JavaScript changes only; native module, permission, plugin, or entitlement changes require a new compatible build.

## Development cycles

### Cycle 1 — state honesty

The first interaction design advanced the visible stop optimistically while offline. Review found that a success-looking state could imply server confirmation. The revision adds a persistent device queue count, explicit `saved on device` copy, disabled dependent actions, and a separate confirmation after reconciliation.

### Cycle 2 — persistence safety

The first Supabase adapter updated the mission revision and stop record in separate requests. A failure between them could leave a new revision with the old stop. The revision replaces that path with one Postgres function so both changes commit or neither does. Self-review then moved the transition, proof, quantity, and duplicate-operation checks into the locked transaction as durable safeguards against concurrent replay or direct RPC use.

### Cycle 3 — native proof

The web case study alone could only prove the domain and responsive presentation. The native delivery skill and reference sources add the actual proof contract: protected routing, OAuth callback, lifecycle refresh, permission recovery, offline outbox, simulator/device testing, EAS runtime version, and release evidence.

## QA scenarios

- cold launch into an assigned stop before and after authentication;
- background during Google OAuth and camera capture;
- location or camera denied, blocked, or revoked;
- offline arrival and completion, termination before sync, then relaunch;
- the same mission changed on another device before queue flush;
- duplicate operation replay after a timeout;
- sign-out or workspace switch while a queue exists;
- foreground after a long background interval;
- large text, screen reader, reduced motion, one-handed reach, sunlight contrast, and weak network;
- development, preview, and release builds with recorded runtime and update IDs.

## Publication record

The case study is publishable when domain tests, installer tests, content validation, typecheck, lint, build, desktop/mobile inspection, offline interaction, and packed-toolkit smoke tests pass. Google provider credentials, production Supabase secrets, app signing, EAS submission, and store publication remain environment-owned release actions.
