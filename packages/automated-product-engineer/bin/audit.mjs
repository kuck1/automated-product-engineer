import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
]);

const sourceExtensions = new Set([
  ".cjs",
  ".css",
  ".graphql",
  ".js",
  ".jsx",
  ".md",
  ".mjs",
  ".mts",
  ".scss",
  ".sql",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);

const maxFileBytes = 512_000;
const maxFiles = 2_000;

function readJson(file) {
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; }
}

function collectFiles(root) {
  const files = [];
  const visit = (directory) => {
    if (files.length >= maxFiles) return;
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (files.length >= maxFiles) return;
      if (entry.name.startsWith(".") && entry.name !== ".github") continue;
      if (ignoredDirectories.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile() && sourceExtensions.has(path.extname(entry.name)) && statSync(absolute).size <= maxFileBytes) files.push(absolute);
    }
  };
  visit(root);
  return files;
}

function corpus(project, files) {
  return files.map((file) => ({
    path: path.relative(project, file),
    text: readFileSync(file, "utf8"),
  }));
}

function matches(entries, pattern, filePattern = null) {
  return entries.filter((entry) => {
    pattern.lastIndex = 0;
    if (filePattern) filePattern.lastIndex = 0;
    return (!filePattern || filePattern.test(entry.path)) && pattern.test(entry.text);
  });
}

function evidence(entries, limit = 4) {
  return [...new Set(entries.map((entry) => entry.path))].slice(0, limit);
}

function isTestPath(file) {
  return /(?:^|\/)(?:__tests__|tests?|e2e)(?:\/|$)|\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(file);
}

function finding({ id, title, status, confidence, summary, action, skill, reference, example, evidence: paths = [], question, impact = "medium" }) {
  return { id, title, status, confidence, impact, summary, action, skill, reference, example, evidence: paths, question };
}

export function auditProject(project, profile) {
  const manifest = readJson(path.join(project, "package.json")) ?? {};
  const dependencies = { ...(manifest.dependencies ?? {}), ...(manifest.devDependencies ?? {}) };
  const files = collectFiles(project).filter((file) => !path.relative(project, file).startsWith(`packages${path.sep}automated-product-engineer${path.sep}payload${path.sep}`));
  const entries = corpus(project, files);
  const source = entries.filter((entry) => /\.(?:[cm]?[jt]sx?|sql)$/.test(entry.path) && entry.path !== "packages/automated-product-engineer/bin/audit.mjs");
  const applicationSource = source.filter((entry) => !isTestPath(entry.path));
  const routeFiles = applicationSource.filter((entry) => /(?:^|\/)(?:app\/api|pages\/api|routes?|controllers?)(?:\/|\.)/i.test(entry.path));
  const clientFiles = applicationSource.filter((entry) => /(?:^|\/)(?:app|pages|src|components|hooks)(?:\/|\.)/i.test(entry.path) && !/(?:server|route|api|service|repository|migration)/i.test(entry.path));
  const testFiles = entries.filter((entry) => isTestPath(entry.path));
  const findings = [];

  const services = matches(applicationSource, /\b(?:class|function|const)\s+\w*(?:Service|Repository)|\b(?:service|repository)\.[A-Za-z_]/i);
  const directRoutePersistence = matches(routeFiles, /(?:from\s+["']@?\/?(?:lib\/)?(?:supabase|prisma)|\b(?:prisma|supabase)\.(?:from|rpc|\w+\.(?:create|update|delete|upsert)))/i);
  if (routeFiles.length && directRoutePersistence.length) {
    findings.push(finding({
      id: "thin-server-boundaries", title: "Move durable policy out of route handlers", status: "risk", confidence: "high", impact: "high",
      summary: "One or more transport files appear to call persistence directly. That makes authorization, idempotency, and transaction policy easier to bypass or duplicate.",
      action: "Trace each route to an authenticated service contract, then keep the route responsible only for parsing, validation, delegation, and response normalization.",
      skill: "architecture-building + frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#thin-transport-server-owned-policy",
      example: "Release Readiness and Field Relay route → service → repository slices", evidence: evidence(directRoutePersistence),
      question: "Should the first upgrade isolate these writes behind services, or preserve the current boundary and document why it is safe?",
    }));
  } else if (routeFiles.length && services.length) {
    findings.push(finding({
      id: "thin-server-boundaries", title: "Thin transport and server-owned policy", status: "established", confidence: "medium",
      summary: "Transport and service or repository boundaries are both present. Verify that authorization and durable invariants stay below the route layer.",
      action: "Keep this boundary and add negative authorization and transaction tests when changing it.",
      skill: "architecture-building + frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#thin-transport-server-owned-policy",
      example: "Release Readiness and Field Relay route → service → repository slices", evidence: evidence([...routeFiles, ...services]),
      question: "Is there a specific mutation boundary you want reviewed more deeply?",
    }));
  } else if (routeFiles.length) {
    findings.push(finding({
      id: "thin-server-boundaries", title: "Make the server ownership boundary explicit", status: "opportunity", confidence: "medium", impact: "high",
      summary: "API or route handlers exist, but a distinct service and repository contract was not visible in the static scan.",
      action: "Inspect the highest-risk mutation and decide where authorization, transactions, idempotency, and canonical DTO construction belong.",
      skill: "architecture-building + frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#thin-transport-server-owned-policy",
      example: "Field Relay atomic stop transition", evidence: evidence(routeFiles),
      question: "Which mutation is most costly when it races, retries, or partially fails?",
    }));
  }

  const useEffectFetch = matches(clientFiles, /useEffect\s*\([\s\S]{0,600}?\bfetch\s*\(/);
  const queryUsage = matches(applicationSource, /\b(?:useQuery|useMutation|QueryClient|queryOptions|useInfiniteQuery)\b/);
  if (useEffectFetch.length >= 2 && !dependencies["@tanstack/react-query"]) {
    findings.push(finding({
      id: "server-state-cache", title: "Replace duplicated effect-driven fetching", status: "risk", confidence: "high", impact: "high",
      summary: "Several client effects fetch remote data without a shared server-cache dependency. This commonly creates duplicate sources of truth, stale responses, and hand-built loading or retry behavior.",
      action: "Pilot one query-keyed read and mutation path with cancellation, rollback, canonical reconciliation, and identity-scoped cache cleanup.",
      skill: "frontend-api-db", reference: "skills/frontend-api-db/references/state-management-scenarios.md",
      example: "Top-bar points update and Release Readiness optimistic rollback", evidence: evidence(useEffectFetch),
      question: "Which remote workflow should become the first canonical query-cache slice?",
    }));
  } else if (queryUsage.length) {
    findings.push(finding({
      id: "server-state-cache", title: "Shared server cache", status: "established", confidence: "high",
      summary: "A query-cache boundary is present. The next review should verify complete query keys, cancellation, rollback, and reconciliation across every affected surface.",
      action: "Trace one mutation through visible rows, detail views, aggregates, pagination, failure, and identity changes.",
      skill: "frontend-api-db", reference: "skills/frontend-api-db/references/state-management-scenarios.md",
      example: "Onboarding Operations and shared points", evidence: evidence(queryUsage),
      question: "Do you want the audit to follow one mutation across every cache surface?",
    }));
  } else if (["nextjs", "expo", "react-native"].includes(profile.kind)) {
    findings.push(finding({
      id: "server-state-cache", title: "Name the owner of remote state", status: "opportunity", confidence: "medium",
      summary: "The app framework is detected, but the scan did not find a clear query-cache contract.",
      action: "Classify remote snapshots, navigation state, local interaction state, and durable truth before adding another shared-state mechanism.",
      skill: "frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#one-owner-per-state-class",
      example: "Onboarding Operations state ownership table", evidence: [],
      question: "Which state currently feels hardest to keep consistent across screens or components?",
    }));
  }

  const revision = matches(applicationSource, /\b(?:expectedRevision|revision|etag|if-match)\b/i);
  const idempotency = matches(applicationSource, /\b(?:idempotency|operationId|operation_id|clientNonce|client_nonce)\b/i);
  const mutations = matches(applicationSource, /\b(?:useMutation|PATCH|POST|PUT|DELETE|insert|update|upsert)\b/);
  if (mutations.length && !(revision.length || idempotency.length)) {
    findings.push(finding({
      id: "concurrency-retry", title: "Define concurrency and retry behavior", status: "opportunity", confidence: "medium", impact: "high",
      summary: "Mutation paths are present, but no revision, ETag, idempotency key, or client nonce was found by the static scan.",
      action: "Choose the writes that can be repeated or performed from two tabs or devices, then add expected-version and idempotency contracts at the authoritative boundary.",
      skill: "frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#versioned-writes-and-idempotent-replay",
      example: "Field Relay operation IDs and mission revision; Release Readiness expected revision", evidence: evidence(mutations),
      question: "Which write must never be duplicated or silently overwrite newer work?",
    }));
  } else if (revision.length || idempotency.length) {
    findings.push(finding({
      id: "concurrency-retry", title: "Versioned writes and replay safety", status: "established", confidence: "high",
      summary: "The codebase contains revision, ETag, idempotency, or client-nonce signals.",
      action: "Verify the check and write are atomic, duplicate replay returns the canonical result, and conflicts have a user recovery path.",
      skill: "frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#versioned-writes-and-idempotent-replay",
      example: "Field Relay locked RPC and chat nonce reconciliation", evidence: evidence([...revision, ...idempotency]),
      question: "Should the next pass exercise this contract across two tabs or devices?",
    }));
  }

  const publicSecrets = matches(clientFiles, /(?:NEXT_PUBLIC|EXPO_PUBLIC|VITE)_[A-Z0-9_]*(?:SERVICE_ROLE|SECRET|PRIVATE_KEY|ADMIN_KEY)/);
  const rls = matches(applicationSource, /enable\s+row\s+level\s+security|create\s+policy/i, /\.sql$/);
  const supabaseUsage = Boolean(dependencies["@supabase/supabase-js"] || dependencies["@supabase/ssr"] || matches(applicationSource, /createClient\s*\(/).length);
  if (publicSecrets.length) {
    findings.push(finding({
      id: "auth-data-boundary", title: "Remove privileged credentials from public configuration", status: "risk", confidence: "high", impact: "critical",
      summary: "A browser- or app-public environment name appears to contain a service role, secret, private key, or admin key marker.",
      action: "Rotate any exposed credential, keep privileged keys server-only, use publishable keys in clients, and enforce object and tenant access with service policy plus RLS.",
      skill: "security-review", reference: "skills/security-review/references/supabase-auth-sessions.md",
      example: "Field Relay publishable-key client plus server authorization and RLS", evidence: evidence(publicSecrets),
      question: "Can I prioritize a credential exposure and authorization trace before other upgrades?",
    }));
  } else if (supabaseUsage && rls.length) {
    findings.push(finding({
      id: "auth-data-boundary", title: "Layered Supabase authorization", status: "established", confidence: "high", impact: "high",
      summary: "Supabase use and row-level security policies are both present.",
      action: "Verify each protected mutation also receives a server-verified actor and has negative cross-tenant tests; RLS should repeat, not replace, service authorization.",
      skill: "security-review + frontend-api-db", reference: "skills/security-review/references/supabase-auth-sessions.md",
      example: "All three case studies use actor-scoped services plus RLS", evidence: evidence(rls),
      question: "Which protected resource should receive the first cross-tenant test matrix?",
    }));
  } else if (supabaseUsage) {
    findings.push(finding({
      id: "auth-data-boundary", title: "Prove the Supabase authorization boundary", status: "opportunity", confidence: "medium", impact: "high",
      summary: "Supabase is present, but the scan did not find row-level security policy definitions in the repository.",
      action: "Locate migrations and policies, then prove browser publishable-key access, server actor verification, and negative tenant/object behavior.",
      skill: "security-review + frontend-api-db", reference: "skills/security-review/references/supabase-auth-sessions.md",
      example: "Release, onboarding, and Field Relay RLS policies", evidence: [],
      question: "Are the database policies stored elsewhere, or should the upgrade add migration-owned RLS here?",
    }));
  }

  const localStorageRemote = matches(clientFiles, /(?:localStorage|AsyncStorage)[\s\S]{0,260}?(?:fetch|mutation|api|record|user|workspace)|(?:fetch|mutation|api|record|user|workspace)[\s\S]{0,260}?(?:localStorage|AsyncStorage)/i);
  const outbox = matches(applicationSource, /\b(?:outbox|queued|syncing|reconcile|reconciliation)\b/i);
  if (localStorageRemote.length && !outbox.length) {
    findings.push(finding({
      id: "offline-state-honesty", title: "Separate device-saved work from server-confirmed work", status: "opportunity", confidence: "medium", impact: "high",
      summary: "Local storage appears near remote records or mutations, but an explicit outbox and reconciliation contract was not found.",
      action: "Name queued, syncing, confirmed, conflicted, and failed states; persist operation IDs and expected versions; reconcile canonical data after reconnect.",
      skill: profile.kind === "expo" || profile.kind === "react-native" ? "expo-native-app + frontend-api-db" : "frontend-api-db",
      reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#honest-offline-work",
      example: "Field Relay device queue and server confirmation", evidence: evidence(localStorageRemote),
      question: "Which offline or recoverable action must survive termination without looking falsely complete?",
    }));
  } else if (outbox.length) {
    findings.push(finding({
      id: "offline-state-honesty", title: "Explicit offline and reconciliation states", status: "established", confidence: "medium", impact: "high",
      summary: "Outbox, queue, sync, or reconciliation language is present.",
      action: "Exercise termination, duplicate replay, stale revision, identity change, and canonical confirmation before relying on the path.",
      skill: "expo-native-app + frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#honest-offline-work",
      example: "Field Relay offline mission workflow", evidence: evidence(outbox),
      question: "Should the next audit simulate reconnect and a conflicting second-device update?",
    }));
  }

  const cssVariables = matches(entries, /--[a-z][a-z0-9-]+\s*:/i, /\.(?:css|scss)$/);
  const hardcodedColors = matches(entries, /#[0-9a-f]{6}\b/gi, /\.(?:[cm]?[jt]sx?|css|scss)$/);
  const components = applicationSource.filter((entry) => /(?:^|\/)(?:components|ui|design-system)(?:\/|\.)/i.test(entry.path));
  if (cssVariables.length && components.length) {
    findings.push(finding({
      id: "component-system", title: "Reusable tokens and component boundary", status: "established", confidence: "medium",
      summary: "The repository contains semantic-looking CSS variables and a component or UI directory.",
      action: "Verify variants are typed, state coverage is deliberate, metadata or previews explain intended use, and feature code composes rather than forks the recipes.",
      skill: "design-system", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#components-as-product-infrastructure",
      example: "The reference component library and distinct case-study themes", evidence: evidence([...cssVariables, ...components]),
      question: "Which repeated visual or interaction pattern still gets rebuilt by product teams?",
    }));
  } else if (components.length || hardcodedColors.length >= 8) {
    findings.push(finding({
      id: "component-system", title: "Turn repeated UI into governed recipes", status: "opportunity", confidence: "medium",
      summary: "Reusable UI files or repeated hard-coded colors are present, but the scan did not find a clear semantic-token boundary.",
      action: "Inventory repeated product patterns, extract semantic roles and typed variants, then document when to use each component with live states.",
      skill: "design-system", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#components-as-product-infrastructure",
      example: "Component-library onboarding, token roles, and variant contracts", evidence: evidence([...components, ...hardcodedColors]),
      question: "Which UI pattern creates the most inconsistency or review churn today?",
    }));
  }

  const verificationScripts = ["test", "typecheck", "lint", "build"].filter((name) => manifest.scripts?.[name]);
  const browserTests = testFiles.filter((entry) => /(?:playwright|cypress|maestro|detox|e2e)/i.test(entry.path + entry.text));
  if (verificationScripts.length >= 3 && testFiles.length && browserTests.length) {
    findings.push(finding({
      id: "verification-evidence", title: "Layered verification", status: "established", confidence: "high",
      summary: "Static, test, build, and browser or device evidence paths are present.",
      action: "Keep focused tests early, then run manual product QA and broad gates only after behavior and design stabilize.",
      skill: "manual-ui-qa + code-review", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#evidence-follows-ownership",
      example: "Case-study policy tests, browser journeys, responsive inspection, and retrospective fix-back", evidence: evidence(testFiles),
      question: "Which critical journey lacks failure, race, or compact-layout evidence?",
    }));
  } else {
    const missing = ["test", "typecheck", "lint", "build"].filter((name) => !manifest.scripts?.[name]);
    findings.push(finding({
      id: "verification-evidence", title: "Build a verification ladder", status: "opportunity", confidence: "high", impact: "high",
      summary: `The repository is missing ${missing.length ? missing.join(", ") : "browser or device journey"} evidence in the standard project contract.`,
      action: "Add the narrowest test at each owning layer, one integrated failure/recovery journey, and deterministic visual evidence for meaningful responsive states.",
      skill: "manual-ui-qa + code-review", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#evidence-follows-ownership",
      example: "Release policy units, Field Relay offline interaction, and mobile overflow proof", evidence: evidence(testFiles),
      question: "Which user journey would be most expensive to break without noticing?",
    }));
  }

  if (["expo", "react-native"].includes(profile.kind)) {
    const nativeRisks = profile.findings.filter((item) => ["scheme-missing", "auth-needs-dev-build", "push-needs-dev-build"].includes(item.code));
    findings.push(finding({
      id: "native-runtime", title: nativeRisks.length ? "Establish the real native runtime" : "Native runtime contract", status: nativeRisks.length ? "risk" : "established", confidence: "high", impact: "high",
      summary: nativeRisks.length ? nativeRisks.map((item) => item.message).join(" ") : "The project exposes a stable scheme or development-build signals for native capabilities.",
      action: "Use a development build for OAuth, push, and custom native modules; verify lifecycle, deep links, permissions, offline behavior, safe areas, keyboard, text scaling, updates, and release compatibility on devices.",
      skill: "expo-native-app", reference: "skills/expo-native-app/SKILL.md", example: "Field Relay native delivery contract", evidence: profile.configSource ? [profile.configSource] : [],
      question: "Which iOS or Android capability should be proven in a development build first?",
    }));
  }

  const priority = { risk: 0, opportunity: 1, established: 2 };
  const impact = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((a, b) => priority[a.status] - priority[b.status] || impact[a.impact] - impact[b.impact] || a.title.localeCompare(b.title));
  const recommendations = findings.filter((item) => item.status !== "established");
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    project,
    profile,
    scan: { filesRead: files.length, truncated: files.length >= maxFiles, maxFileBytes },
    summary: {
      risks: findings.filter((item) => item.status === "risk").length,
      opportunities: findings.filter((item) => item.status === "opportunity").length,
      established: findings.filter((item) => item.status === "established").length,
    },
    findings,
    nextQuestion: recommendations.length
      ? `Which upgrade should we design first: ${recommendations.slice(0, 3).map((item) => item.title).join(", ")}?`
      : "Which established pattern should we stress-test against a real failure or race scenario?",
  };
}

export function formatAudit(report) {
  const lines = [
    "Codebase upgrade audit",
    `Project: ${report.project}`,
    `Platform: ${report.profile.kind} · ${report.profile.router} · ${report.profile.packageManager}`,
    `Scan: ${report.scan.filesRead} source and documentation files${report.scan.truncated ? " (file limit reached)" : ""}`,
    `Summary: ${report.summary.risks} risks · ${report.summary.opportunities} opportunities · ${report.summary.established} established patterns`,
    "",
  ];
  for (const status of ["risk", "opportunity", "established"]) {
    const group = report.findings.filter((item) => item.status === status);
    if (!group.length) continue;
    lines.push(`${status === "risk" ? "Risks" : status === "opportunity" ? "Recommended upgrades" : "Patterns to preserve"}:`);
    for (const item of group) {
      lines.push(`- ${item.title} [${item.confidence} confidence]`);
      lines.push(`  ${item.summary}`);
      lines.push(`  Next: ${item.action}`);
      lines.push(`  Skill: ${item.skill} · Example: ${item.example}`);
      if (item.evidence.length) lines.push(`  Evidence: ${item.evidence.join(", ")}`);
    }
    lines.push("");
  }
  lines.push("Decision for the user:", report.nextQuestion);
  lines.push("", "This audit is read-only and static. Validate every recommendation against the named code path before changing architecture.");
  return lines.join("\n");
}
