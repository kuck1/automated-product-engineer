# Parity CI and release

Run independent jobs for contract validation, TypeScript policy tests, Next.js build, Kotlin host tests, Android lint/tests/build, Kotlin/Native framework link, Swift typecheck/native tests, and platform accessibility or journey evidence.

Kotlin and TypeScript each evaluate the canonical scenario vectors and write a JSON semantic receipt:

```json
{
  "featureDigest": "…",
  "vectorDigest": "…",
  "receipts": [
    { "id": "stale-write", "kind": "CONFLICT", "stage": "VALIDATING", "revision": 7 }
  ]
}
```

The convergence job downloads both artifacts, parses them, and requires deep equality. This catches transition drift, numeric differences, stale-write behavior, and a lane built against the wrong contract epoch.

Keep performance, accessibility, lifecycle, networking, storage, auth, background work, and UI behavior in platform gates. A shared scenario cannot prove a native capability.

Release platforms independently behind one semantic feature flag when product policy permits. Record which capsule digest each release contains. Roll back a platform artifact without rolling back the capsule unless the contract itself is unsafe.
