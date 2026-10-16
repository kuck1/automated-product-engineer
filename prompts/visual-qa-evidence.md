# Visual QA Evidence Prompt

Create a focused manual and automated UI verification plan for **[FEATURE]**.

List the user journeys, fixtures, viewports, and states that materially change layout or behavior. Include normal, empty, error, slow-network, long-content, permission, repeat-visit, and recovery cases.

For each check state:

- what the reviewer should do;
- what must be visible and operable;
- the screenshot or trace to capture;
- whether the evidence belongs in unit, integration, end-to-end, or visual regression coverage.

Inspect visual diffs before updating baselines. Classify each difference as a defect, intended change, stale baseline, environment mismatch, or flake.
