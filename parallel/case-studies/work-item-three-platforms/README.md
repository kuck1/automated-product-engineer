# Work item across three platforms

The runnable template demonstrates a small but complete parallel slice:

1. `work-item.feature.json` declares the legal transitions.
2. `work-item.vectors.json` identifies executable cases.
3. `compile-feature.mjs` emits Kotlin and TypeScript policy carrying the same source digest.
4. KMP owns native product behavior while Android and iOS remain native projections.
5. Next.js uses the generated TypeScript projection.
6. Kotlin host tests and the web exporter emit normalized receipts.
7. CI compares those receipts only after contract, web, shared, Android, and iOS lanes succeed independently.

This is deliberately a narrow feature. The mechanism scales by adding capsules; it should not grow into one global state machine or a shared rendering framework.
