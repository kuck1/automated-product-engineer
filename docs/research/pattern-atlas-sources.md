# Pattern Atlas Research Notes

Research was limited to primary documentation and the toolkit's own working examples. These notes record decisions that affect the atlas; they are not a general survey.

## Agent instruction design

OpenAI's guidance describes skills as focused workflows with supporting resources and recommends progressive disclosure: keep the root document concise, then route to supporting material only when it applies. This supports a typed index plus focused family references instead of one expanding orchestration prompt.

Source: [Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)

## React state ownership

React recommends deriving values during render when they can be calculated from existing props or state, avoiding Effects that merely synchronize duplicate state. Its state-structure guidance favors grouping related state, avoiding contradictions, redundancy, duplication, and deeply nested shapes. The atlas therefore treats duplicated derived state as a first-class anti-pattern and makes the canonical owner explicit.

Sources: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect), [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)

## Remote data and optimistic work

TanStack Query documents optimistic updates as a transaction-like sequence: prevent an in-flight read from overwriting the optimistic result, snapshot prior state, apply the projection, roll back on error, and reconcile or invalidate afterward. The atlas separates this client projection from server-side concurrency and idempotency because cancellation cannot make a durable write safe.

Source: [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

## Web boundaries and authorization

Next.js documents Route Handlers as public endpoints and recommends treating them accordingly. Authentication guidance separates authentication, session management, and authorization, and places secure checks close to the data through a data-access layer. The atlas therefore treats UI visibility and proxy checks as convenience layers, while server services and storage enforce durable policy.

Sources: [Authentication](https://nextjs.org/docs/app/guides/authentication), [Backend for Frontend](https://nextjs.org/docs/app/guides/backend-for-frontend)

## Database authorization and sessions

Supabase documents grants and row-level policies as separate controls, recommends RLS on exposed tables, and warns that privileged service credentials bypass RLS and must stay server-side. Its SSR guidance stores sessions in cookies and uses PKCE. The atlas requires negative tenant and object tests and treats RLS as defense in depth rather than a replacement for product policy.

Sources: [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Server-Side Rendering](https://supabase.com/docs/guides/auth/server-side), [Securing your data](https://supabase.com/docs/guides/database/secure-data)

## Cross-tab and retry behavior

The Broadcast Channel API sends same-origin hints across browsing contexts, while Web Locks can select one local leader for origin-scoped work. Neither protects writes from another device, so the database still needs version or transaction rules. Stripe's idempotency model demonstrates why a stable operation key is needed for safe retry.

Sources: [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel), [Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API), [Idempotent requests](https://docs.stripe.com/api/idempotent_requests)

## Native identity

Expo recommends encrypted platform storage for sensitive auth material on iOS and Android rather than ordinary asynchronous storage. Native examples should therefore distinguish public configuration, secure local credentials, durable server policy, and lifecycle-aware session refresh.

Source: [Authentication with OAuth or OpenID providers](https://docs.expo.dev/guides/authentication/)

## Existing toolkit evidence

The Release Readiness, Onboarding Operations, and Field Relay examples already prove route-to-service-to-repository boundaries, optimistic state, revision checks, operation IDs, offline replay, and layered Supabase policy. The atlas generalizes those lessons while preserving their concrete source links and tests.

