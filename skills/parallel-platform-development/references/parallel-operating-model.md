# Parallel operating model

Freeze a capsule commit and create sibling lanes from it:

| Lane | Owns | Produces |
| --- | --- | --- |
| Contract | Product meaning and generators | Capsule digest and projections |
| Server | Authority and persistence | API/provider evidence |
| Shared kernel | Native deterministic behavior | Kotlin artifact and receipts |
| Next.js | Web composition and runtime | Web artifact and receipts |
| Android | Compose, lifecycle, capabilities | APK/AAB and device evidence |
| iOS | Swift facade, SwiftUI/UIKit, capabilities | App/framework and simulator evidence |
| Design | Tokens, behavior, responsive intent | Contract updates and visual references |
| Quality | Scenario, integration, accessibility, performance | Independent evidence |
| Documentation | Decisions, adoption, operations | Current operator and developer guidance |

Platform lanes are siblings. Android must not wait for iOS, iOS must not wait for Next.js, and Next.js must not become the accidental reference implementation. Each lane may begin after the capsule and required generated projections are stable.

Record a projection receipt with platform, capsule digest, source revision, artifact digest, supported capability envelope, scenario result, focused tests, native evidence, and explicit deviations. The convergence gate rejects mixed capsule digests, missing evidence, undocumented deviations, and generated drift.

Use one integration branch per feature capsule. Merge the contract first, then independent platform changes in any order when compatibility is additive. For breaking changes, support old and new contract epochs during a declared migration window.
