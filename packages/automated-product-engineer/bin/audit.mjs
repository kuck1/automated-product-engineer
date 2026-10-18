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
  ".json",
  ".kt",
  ".kts",
  ".md",
  ".mjs",
  ".mts",
  ".scss",
  ".sql",
  ".swift",
  ".ts",
  ".tsx",
  ".toml",
  ".xml",
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

function finding({ id, patternId = id, title, status, confidence, summary, action, skill, reference, example, evidence: paths = [], question, impact = "medium" }) {
  return { id, patternId, title, status, confidence, impact, summary, action, skill, reference, example, evidence: paths, question };
}

export function auditProject(project, profile) {
  const manifest = readJson(path.join(project, "package.json")) ?? {};
  const dependencies = { ...(manifest.dependencies ?? {}), ...(manifest.devDependencies ?? {}) };
  const files = collectFiles(project).filter((file) => !path.relative(project, file).startsWith(`packages${path.sep}automated-product-engineer${path.sep}payload${path.sep}`));
  const entries = corpus(project, files);
  const source = entries.filter((entry) => /\.(?:[cm]?[jt]sx?|sql|swift|kt|kts|xml)$/.test(entry.path) && entry.path !== "packages/automated-product-engineer/bin/audit.mjs");
  const applicationSource = source.filter((entry) => !isTestPath(entry.path));
  const routeFiles = applicationSource.filter((entry) => /(?:^|\/)(?:app\/api|pages\/api|routes?|controllers?)(?:\/|\.)/i.test(entry.path));
  const clientFiles = applicationSource.filter((entry) => /(?:^|\/)(?:app|pages|src|components|hooks)(?:\/|\.)/i.test(entry.path) && !/(?:server|route|api|service|repository|migration)/i.test(entry.path));
  const testFiles = entries.filter((entry) => isTestPath(entry.path));
  const findings = [];

  if (["ios", "swift-package"].includes(profile.kind)) {
    const swiftSource = applicationSource.filter((entry) => entry.path.endsWith(".swift"));
    const swiftViews = swiftSource.filter((entry) => /\b(?:SwiftUI|View)\b/.test(entry.text));
    const observation = matches(swiftSource, /@Observable\b|\bObservableObject\b|@State\b|@Binding\b/);
    const isolation = matches(swiftSource, /\bactor\s+\w+|@MainActor\b|\bSendable\b/);
    const uncheckedSendable = matches(swiftSource, /@unchecked\s+Sendable/);
    const directViewNetworking = swiftViews.filter((entry) => /URLSession\.shared|\bURLSession\s*\(/.test(entry.text));
    const insecureCredentialStorage = matches(swiftSource, /UserDefaults[\s\S]{0,180}(?:token|secret|password|credential)|(?:token|secret|password|credential)[\s\S]{0,180}UserDefaults/i);
    const keychain = matches(swiftSource, /\b(?:SecItemAdd|SecItemCopyMatching|SecItemUpdate|SecItemDelete|Keychain)\b/);

    findings.push(finding({
      id: "ios-state-ownership", patternId: "state-owner-by-lifetime", title: observation.length ? "SwiftUI state ownership is visible" : "Make native state ownership explicit",
      status: observation.length ? "established" : "opportunity", confidence: observation.length ? "high" : "medium", impact: "high",
      summary: observation.length ? "The Swift source uses Observation or SwiftUI state wrappers. Verify that each value has one owner at the correct scene, feature, or view lifetime." : "The scan did not find a visible Observation or SwiftUI state contract. Trace one journey before adding shared mutable state.",
      action: "Classify transient presentation, navigation, feature coordination, remote snapshots, durable local work, secrets, and server policy; keep each in its owning layer.",
      skill: "ios-native-app + architecture-building", reference: "skills/ios-native-app/references/swiftui-architecture-and-state.md", example: "Swift WorkItem model and identity-scoped cache", evidence: evidence(observation),
      question: "Which native journey currently has the most state shared across screens, scenes, or devices?",
    }));

    if (uncheckedSendable.length) findings.push(finding({
      id: "ios-concurrency", patternId: "versioned-idempotent-write", title: "Verify unchecked Sendable assumptions", status: "risk", confidence: "high", impact: "high",
      summary: "The project opts mutable or imported types out of Swift's concurrency checks. A false synchronization assumption can reintroduce data races.",
      action: "Inspect each unchecked conformance, document its synchronization proof, and replace it with isolation or immutable transfer values where possible.",
      skill: "ios-native-app + code-review", reference: "skills/ios-native-app/references/swiftui-architecture-and-state.md", example: "Actor-isolated versioned store", evidence: evidence(uncheckedSendable),
      question: "May the first concurrency slice remove or prove these unchecked boundaries?",
    }));
    else findings.push(finding({
      id: "ios-concurrency", patternId: "latest-intent-wins", title: isolation.length ? "Swift concurrency boundaries are visible" : "Adopt explicit Swift concurrency ownership",
      status: isolation.length ? "established" : "opportunity", confidence: isolation.length ? "high" : "medium", impact: "high",
      summary: isolation.length ? "Actor, main-actor, or Sendable boundaries exist. Verify cancellation and enable complete checking before Swift 6 mode." : "No actor, main-actor, or Sendable boundary was visible in the Swift scan.",
      action: "Isolate UI models on MainActor, mutable shared resources in actors, and cross-isolation values as Sendable snapshots; prove an out-of-order response cannot win.",
      skill: "ios-native-app", reference: "skills/ios-native-app/references/swiftui-architecture-and-state.md", example: "Actor-isolated versioned store", evidence: evidence(isolation),
      question: "Which async journey is most likely to overlap, retry, or complete out of order?",
    }));

    if (directViewNetworking.length) findings.push(finding({
      id: "ios-network-boundary", patternId: "thin-server-boundary", title: "Move networking out of SwiftUI views", status: "risk", confidence: "high", impact: "high",
      summary: "A SwiftUI view appears to create or use URLSession directly, coupling rendering lifetime to transport and recovery policy.",
      action: "Inject a Sendable service protocol, keep cancellation explicit, normalize transport failures, and let a main-actor feature model project state for the view.",
      skill: "ios-native-app + architecture-building", reference: "skills/ios-native-app/references/networking-auth-and-security.md", example: "SwiftUI WorkItem feature template", evidence: evidence(directViewNetworking),
      question: "Should this view become the first service-boundary migration?",
    }));

    if (insecureCredentialStorage.length) findings.push(finding({
      id: "ios-secret-storage", patternId: "identity-scoped-cache", title: "Move credentials out of UserDefaults", status: "risk", confidence: "high", impact: "critical",
      summary: "A token, secret, password, or credential appears near UserDefaults usage. UserDefaults is not secret storage.",
      action: "Rotate exposed credentials when applicable, move minimal secrets to a Keychain adapter, and clear identity-scoped data on account transition.",
      skill: "ios-native-app + security-review", reference: "skills/ios-native-app/references/networking-auth-and-security.md", example: "IdentityScopedCache", evidence: evidence(insecureCredentialStorage),
      question: "Can the first security slice replace this storage and exercise restore, refresh, logout, and account switch?",
    }));
    else if (keychain.length) findings.push(finding({
      id: "ios-secret-storage", patternId: "identity-scoped-cache", title: "Keychain-backed secret storage", status: "established", confidence: "high", impact: "high",
      summary: "Keychain usage is present. Verify accessibility, access group, migration, deletion, and concurrent refresh behavior.",
      action: "Keep only minimal secrets in Keychain and exercise restore, expiry, revocation, logout, and account switching.",
      skill: "ios-native-app + security-review", reference: "skills/ios-native-app/references/networking-auth-and-security.md", example: "IdentityScopedCache", evidence: evidence(keychain),
      question: "Do you want the next pass to trace one complete session lifecycle?",
    }));

    findings.push(finding({
      id: "ios-privacy-manifest", patternId: "evidence-follows-owner", title: profile.xcode?.privacyManifests?.length ? "Privacy manifest is present" : "Add and reconcile the privacy manifest",
      status: profile.xcode?.privacyManifests?.length ? "established" : "opportunity", confidence: "high", impact: "high",
      summary: profile.xcode?.privacyManifests?.length ? "A PrivacyInfo.xcprivacy file was detected. Its declarations still need to match source, dependencies, analytics, retention, and App Store answers." : "No PrivacyInfo.xcprivacy file was detected for the native iOS project.",
      action: "Generate the privacy report and reconcile collected data, tracking domains, required-reason APIs, dependency manifests, product copy, and App Store disclosures.",
      skill: "ios-native-app + security-review", reference: "skills/ios-native-app/references/testing-signing-and-release.md", example: "Native iOS privacy manifest template", evidence: profile.xcode?.privacyManifests ?? [],
      question: "Should privacy inventory be part of the first native readiness slice?",
    }));
  }

  if (profile.kind === "android") {
    const kotlinSource = applicationSource.filter((entry) => entry.path.endsWith(".kt"));
    const composables = kotlinSource.filter((entry) => /@Composable\b/.test(entry.text));
    const stateOwners = matches(kotlinSource, /\bViewModel\b|\bStateFlow\b|collectAsStateWithLifecycle|rememberSaveable|remember\s*\{/);
    const directComposableNetworking = composables.filter((entry) => /(?:\b(?:OkHttpClient|Retrofit\.Builder|HttpURLConnection)\b|\bURL\s*\()/.test(entry.text));
    const unsafeScopes = matches(kotlinSource, /\bGlobalScope\b|CoroutineScope\s*\(\s*Dispatchers\.(?:IO|Default|Main)\s*\)/);
    const insecureCredentialStorage = matches(kotlinSource, /SharedPreferences[\s\S]{0,220}(?:token|secret|password|credential)|(?:token|secret|password|credential)[\s\S]{0,220}(?:SharedPreferences|getSharedPreferences)/i);
    const credentialBoundary = matches(kotlinSource, /\bCredentialManager\b|\bCreatePublicKeyCredentialRequest\b|\bGetCredentialRequest\b|\bKeyStore\b/);
    const hardcodedSigningSecrets = entries.filter((entry) => /build\.gradle(?:\.kts)?$/.test(entry.path) && /\b(?:storePassword|keyPassword)\s*(?:=\s*)?[\"'][^\"']+[\"']/.test(entry.text));
    const durableStorage = matches(kotlinSource, /@Database\b|@Dao\b|\bRoomDatabase\b|\bDataStore<|preferencesDataStore|\bWorkManager\b/);

    findings.push(finding({
      id: "android-state-ownership", patternId: "state-owner-by-lifetime", title: stateOwners.length ? "Android state ownership is visible" : "Make Android state ownership explicit",
      status: stateOwners.length ? "established" : "opportunity", confidence: stateOwners.length ? "high" : "medium", impact: "high",
      summary: stateOwners.length ? "The Kotlin source uses ViewModel, StateFlow, lifecycle-aware collection, or deliberately retained Compose state. Verify one owner for each screen, local element, durable record, and server snapshot." : "The scan did not find a visible screen-state contract. Trace one journey before adding shared mutable state.",
      action: "Keep element state local, hoist reusable UI state, expose immutable screen state from screen-level ViewModels, and keep durable or remote truth behind repositories.",
      skill: "android-native-app + architecture-building", reference: "skills/android-native-app/references/compose-architecture-and-state.md", example: "Kotlin versioned store and Compose WorkItem feature", evidence: evidence(stateOwners),
      question: "Which Android journey currently shares the most state across destinations, tasks, windows, or devices?",
    }));

    if (unsafeScopes.length) findings.push(finding({
      id: "android-concurrency", patternId: "latest-intent-wins", title: "Replace unowned coroutine scopes", status: "risk", confidence: "high", impact: "high",
      summary: "GlobalScope or an ad-hoc dispatcher scope appears in application code. Its work can outlive the owner, ignore cancellation, and apply stale results.",
      action: "Move UI work to viewModelScope or lifecycleScope, durable work to WorkManager, inject dispatchers at testable boundaries, and define overlap policy for every mutation.",
      skill: "android-native-app + code-review", reference: "skills/android-native-app/references/compose-architecture-and-state.md", example: "VersionedWorkItemStore and DurableOutbox", evidence: evidence(unsafeScopes),
      question: "May the first Android concurrency slice replace these scopes and prove cancellation plus out-of-order completion?",
    }));
    else findings.push(finding({
      id: "android-concurrency", patternId: "versioned-idempotent-write", title: "Define coroutine and mutation ownership", status: "opportunity", confidence: "medium", impact: "high",
      summary: "No high-confidence unowned scope was found. Static scanning still cannot prove cancellation, dispatcher ownership, replay safety, or stale-response handling.",
      action: "Trace one write through viewModelScope, repository, local transaction, network request, retry, canonical response, and process recreation.",
      skill: "android-native-app", reference: "skills/android-native-app/references/compose-architecture-and-state.md", example: "VersionedWorkItemStore and DurableOutbox", evidence: [],
      question: "Which Android write is most costly when it overlaps, retries, or resumes after process death?",
    }));

    if (directComposableNetworking.length) findings.push(finding({
      id: "android-network-boundary", patternId: "thin-server-boundary", title: "Move networking out of composables", status: "risk", confidence: "high", impact: "high",
      summary: "A composable appears to construct or use a network client directly, coupling recomposition and UI lifetime to transport and recovery policy.",
      action: "Inject a repository into a screen-level ViewModel, normalize failures at the data boundary, preserve cancellation, and render immutable UI state.",
      skill: "android-native-app + architecture-building", reference: "skills/android-native-app/references/networking-auth-and-security.md", example: "Compose WorkItem feature template", evidence: evidence(directComposableNetworking),
      question: "Should this screen become the first repository-boundary migration?",
    }));

    if (insecureCredentialStorage.length) findings.push(finding({
      id: "android-secret-storage", patternId: "identity-scoped-cache", title: "Move credentials out of SharedPreferences", status: "risk", confidence: "high", impact: "critical",
      summary: "A token, secret, password, or credential appears near SharedPreferences. Preference storage is not a credential boundary.",
      action: "Rotate exposed credentials when applicable, use Credential Manager for user credentials, keep server secrets off-device, protect only minimal local key material with Android Keystore, and clear identity-scoped data on account transition.",
      skill: "android-native-app + security-review", reference: "skills/android-native-app/references/networking-auth-and-security.md", example: "IdentityScopedCache", evidence: evidence(insecureCredentialStorage),
      question: "Can the first security slice replace this storage and exercise restore, refresh, logout, account switch, and process death?",
    }));
    else if (credentialBoundary.length) findings.push(finding({
      id: "android-secret-storage", patternId: "identity-scoped-cache", title: "Android credential boundary is visible", status: "established", confidence: "high", impact: "high",
      summary: "Credential Manager or Android Keystore usage is present. Verify server challenge validation, lifecycle recovery, key invalidation, logout, and account switching.",
      action: "Trace one complete credential lifecycle and keep identity-scoped caches and queued work aligned with the authenticated subject.",
      skill: "android-native-app + security-review", reference: "skills/android-native-app/references/networking-auth-and-security.md", example: "IdentityScopedCache", evidence: evidence(credentialBoundary),
      question: "Do you want the next pass to trace one complete Android session lifecycle?",
    }));

    if (hardcodedSigningSecrets.length) findings.push(finding({
      id: "android-signing-secrets", patternId: "evidence-follows-owner", title: "Remove signing secrets from Gradle source", status: "risk", confidence: "high", impact: "critical",
      summary: "A literal storePassword or keyPassword appears in a Gradle build file.",
      action: "Remove and rotate exposed credentials, load the upload-key material from protected local or CI secret storage, and verify it cannot enter the packaged artifact or logs.",
      skill: "android-native-app + security-review", reference: "skills/android-native-app/references/testing-signing-and-play-release.md", example: "Android release checklist", evidence: evidence(hardcodedSigningSecrets),
      question: "May the security slice remove and rotate these signing credentials now?",
    }));

    findings.push(finding({
      id: "android-durable-data", patternId: "durable-outbox", title: durableStorage.length ? "Android durable data primitives are visible" : "Choose explicit Android persistence owners",
      status: durableStorage.length ? "established" : "opportunity", confidence: durableStorage.length ? "high" : "medium", impact: "high",
      summary: durableStorage.length ? "Room, DataStore, or WorkManager is present. Verify each is used for the job it owns and that offline work reconciles with canonical server state." : "No Room, DataStore, or WorkManager boundary was visible in Kotlin source.",
      action: "Use DataStore for small settings, Room for relational or offline application data, and WorkManager for deferrable durable work. Give queued writes stable operation IDs and an explicit conflict policy.",
      skill: "android-native-app + frontend-api-db", reference: "skills/android-native-app/references/persistence-lifecycle-and-capabilities.md", example: "DurableOutbox", evidence: evidence(durableStorage),
      question: "Which data must remain correct after offline use, process death, retry, or account switching?",
    }));
  }

  if (profile.kind === "kotlin-multiplatform") {
    const commonSource = applicationSource.filter((entry) => /(?:^|\/)src\/commonMain\//.test(entry.path));
    const commonTests = entries.filter((entry) => /(?:^|\/)src\/commonTest\//.test(entry.path));
    const nativeSource = applicationSource.filter((entry) => /(?:^|\/)(?:androidApp|iosApp|src\/(?:androidMain|iosMain))\//.test(entry.path));
    const platformLeakage = commonSource.filter((entry) => /\b(?:android\.|androidx\.|platform\.(?:UIKit|Foundation)|java\.(?:io|nio|net))/.test(entry.text));
    const sharedPolicy = commonSource.filter((entry) => /\b\w*(?:Policy|Decision|StateMachine|Transition|Repository|UseCase|Controller)\b/.test(entry.text));
    const nativePolicyDuplication = nativeSource.filter((entry) => /\b(?:expectedRevision|INVALID_TRANSITION|STALE_REVISION|authorize|allowedTransitions|transitionPolicy)\b/i.test(entry.text));
    const swiftBridge = nativeSource.filter((entry) => entry.path.endsWith(".swift") && /@MainActor|ObservableObject|@Observable/.test(entry.text) && /subscribe|close|cancel/.test(entry.text));
    const tokenSource = entries.filter((entry) => /(?:^|\/)contracts\/tokens\/.*\.json$/.test(entry.path));
    const generatedKotlin = entries.filter((entry) => /GeneratedTokens\.kt$/.test(entry.path));
    const generatedSwift = entries.filter((entry) => /DesignTokens\.swift$/.test(entry.path));
    const scenarioVectors = entries.filter((entry) => /\.vectors\.json$/.test(entry.path));
    const componentContracts = entries.filter((entry) => /\.component\.json$/.test(entry.path));
    const featureCapsules = entries.filter((entry) => /(?:^|\/)contracts\/features\/.*\.feature\.json$/.test(entry.path));
    const generatedPolicy = entries.filter((entry) => /Generated\w*Policy\.kt$|(?:^|\/)src\/generated\/.*-policy\.ts$/.test(entry.path));
    const parityTools = entries.filter((entry) => /(?:compare-receipts|export-web-receipts)/.test(entry.path));
    const nextSurface = entries.filter((entry) => /(?:^|\/)webApp\/(?:package\.json|next\.config\.[cm]?[jt]s)$/.test(entry.path));
    const parallelWorkflow = entries.filter((entry) => /(?:^|\/)\.github\/workflows\/.*\.ya?ml$/.test(entry.path) && /semantic-parity/.test(entry.text) && /web-projection/.test(entry.text) && /android-projection/.test(entry.text) && /ios-projection/.test(entry.text));

    findings.push(finding({
      id: "kmp-product-kernel", patternId: "shared-product-kernel", title: sharedPolicy.length ? "Shared product kernel is visible" : "Create a platform-free product kernel",
      status: sharedPolicy.length ? "established" : "opportunity", confidence: sharedPolicy.length ? "high" : "medium", impact: "high",
      summary: sharedPolicy.length ? "Common sources contain product policy, transitions, repositories, use cases, or feature controllers. Verify every shared rule is deterministic and independent of platform lifecycle." : "The shared source set exists, but product policy and application orchestration were not visible in the static scan.",
      action: "Move only rules that must remain identical into pure common Kotlin. Keep platform composition, lifecycle, UI, capabilities, secure storage, and distribution in native shells.",
      skill: "kotlin-multiplatform-app + architecture-building", reference: "skills/kotlin-multiplatform-app/references/architecture-and-module-boundaries.md", example: "Product-kernel monorepo blueprint", evidence: evidence(sharedPolicy),
      question: "Which product rule creates the greatest cost when Android and iOS disagree?",
    }));

    if (platformLeakage.length) findings.push(finding({
      id: "kmp-platform-leakage", patternId: "ports-at-platform-edge", title: "Remove platform APIs from commonMain", status: "risk", confidence: "high", impact: "high",
      summary: "Common Kotlin imports Android, Apple, or JVM-only APIs. That couples product behavior to one target and weakens host-test coverage.",
      action: "Define a narrow capability interface in common code and implement it at the platform composition root. Reserve expect/actual for small construction facts that cannot be injected cleanly.",
      skill: "kotlin-multiplatform-app", reference: "skills/kotlin-multiplatform-app/references/architecture-and-module-boundaries.md", example: "Injected clock, identity, transport, repository, and telemetry ports", evidence: evidence(platformLeakage),
      question: "May the first KMP slice replace these imports with explicit platform ports?",
    }));

    findings.push(finding({
      id: "kmp-contract-projections", patternId: "generated-semantic-contracts", title: tokenSource.length && generatedKotlin.length && generatedSwift.length && componentContracts.length && scenarioVectors.length ? "Cross-platform contract projections are traceable" : "Generate platform projections from canonical contracts",
      status: tokenSource.length && generatedKotlin.length && generatedSwift.length && componentContracts.length && scenarioVectors.length ? "established" : "opportunity", confidence: "high", impact: "high",
      summary: tokenSource.length && generatedKotlin.length && generatedSwift.length ? "Canonical token sources and generated Kotlin and Swift projections are present. Component contracts and scenario vectors determine whether behavior is also traceable." : "The scan did not find one canonical token source projected into both native platforms.",
      action: "Keep product language, semantic tokens, component behavior, analytics, protocol schemas, and scenario vectors canonical; generate native representations with a source digest and reject drift in CI.",
      skill: "kotlin-multiplatform-app + design-system", reference: "skills/kotlin-multiplatform-app/references/tokens-components-and-shared-ui.md", example: "DTCG token compiler and component contracts", evidence: evidence([...tokenSource, ...generatedKotlin, ...generatedSwift, ...componentContracts, ...scenarioVectors]),
      question: "Which contract currently drifts most often between native platforms?",
    }));

    if (nativePolicyDuplication.length) findings.push(finding({
      id: "kmp-duplicate-policy", patternId: "shared-product-kernel", title: "Consolidate duplicated native product policy", status: "risk", confidence: "medium", impact: "high",
      summary: "Native shell code appears to repeat revision, transition, or authorization rules that belong to one product authority.",
      action: "Confirm each signal against behavior, move shared decisions into the kernel, and leave platform code responsible for presentation and capability adaptation.",
      skill: "kotlin-multiplatform-app + code-review", reference: "skills/kotlin-multiplatform-app/references/adoption-and-migration.md", example: "Contract-first strangler migration", evidence: evidence(nativePolicyDuplication),
      question: "Which duplicated policy can be characterized and moved without changing the native experience?",
    }));

    findings.push(finding({
      id: "kmp-swift-boundary", patternId: "small-swift-facade", title: swiftBridge.length ? "Small Swift feature facade is visible" : "Create an intentional Swift boundary",
      status: swiftBridge.length ? "established" : "opportunity", confidence: swiftBridge.length ? "high" : "medium", impact: "high",
      summary: swiftBridge.length ? "Swift adapts shared state through a main-actor observable model with explicit subscription cleanup." : "The scan did not find a lifecycle-owned Swift adapter for shared feature state.",
      action: "Export a small state, intent, subscription, and close facade. Keep most Kotlin declarations internal, expected failures as values, and add a Swift compile smoke test.",
      skill: "kotlin-multiplatform-app + ios-native-app", reference: "skills/kotlin-multiplatform-app/references/swift-interop-and-native-shells.md", example: "WorkItemController and WorkItemModel", evidence: evidence(swiftBridge),
      question: "Which feature should define the first stable Swift-facing facade?",
    }));

    findings.push(finding({
      id: "kmp-common-tests", patternId: "evidence-follows-owner", title: commonTests.length ? "Shared policy has common tests" : "Prove shared policy in commonTest",
      status: commonTests.length ? "established" : "opportunity", confidence: "high", impact: "high",
      summary: commonTests.length ? "Common tests exist for the product kernel. Native tests must still prove platform projection, lifecycle, accessibility, and capabilities." : "No commonTest source was found for the behavior claimed as shared.",
      action: "Run canonical scenario vectors against common policy and repositories, then test native adapters and critical journeys independently on Android and iOS.",
      skill: "kotlin-multiplatform-app + manual-ui-qa", reference: "skills/kotlin-multiplatform-app/references/testing-ci-and-release.md", example: "Parallel contract, host, Android, and iOS CI fan-out", evidence: evidence(commonTests),
      question: "Which shared race or failure scenario should become the first cross-platform vector?",
    }));

    if (profile.multiplatform?.hasNextShell) {
      findings.push(finding({
        id: "parallel-feature-capsule", patternId: "feature-capsule-protocol", title: featureCapsules.length && generatedPolicy.length >= 2 ? "Feature capsule projects into Kotlin and TypeScript" : "Create one generated feature capsule boundary",
        status: featureCapsules.length && generatedPolicy.length >= 2 ? "established" : "opportunity", confidence: "high", impact: "high",
        summary: featureCapsules.length && generatedPolicy.length >= 2 ? "A canonical feature contract and generated Kotlin and TypeScript policy are visible. Keep generated files disposable and bind every artifact to the capsule digest." : "Next.js and native shells exist, but the scan did not find one canonical feature capsule projected into both Kotlin and TypeScript.",
        action: "Freeze product vocabulary, states, intents, guards, failures, telemetry, and scenarios in one language-neutral capsule; generate both semantic runtimes and reject drift.",
        skill: "parallel-platform-development", reference: "skills/parallel-platform-development/references/feature-capsule-protocol.md", example: "Work item three-platform feature capsule", evidence: evidence([...featureCapsules, ...generatedPolicy, ...nextSurface]),
        question: "Which cross-platform feature creates the highest cost when web and native disagree?",
      }));

      findings.push(finding({
        id: "parallel-semantic-parity", patternId: "semantic-receipt-parity", title: parityTools.length >= 2 ? "Kotlin and TypeScript semantic receipts are compared" : "Add a semantic convergence gate",
        status: parityTools.length >= 2 ? "established" : "risk", confidence: "high", impact: "high",
        summary: parityTools.length >= 2 ? "Both semantic runtimes can publish normalized results for the same vectors. Native platform evidence remains separate." : "Three platform shells are present without a visible cross-runtime receipt comparison, so product-policy drift can pass compilation.",
        action: "Replay the canonical vectors in Kotlin and TypeScript, publish normalized receipts, and require parsed deep equality after independent platform jobs complete.",
        skill: "parallel-platform-development + code-review", reference: "skills/parallel-platform-development/references/parity-ci-and-release.md", example: "Semantic receipt convergence job", evidence: evidence(parityTools),
        question: "May the first convergence slice turn the highest-value feature into an executable parity oracle?",
      }));

      findings.push(finding({
        id: "parallel-independent-lanes", patternId: "sibling-platform-lanes", title: parallelWorkflow.length ? "Platform lanes converge without serial dependency" : "Make platform lanes independent siblings",
        status: parallelWorkflow.length ? "established" : "opportunity", confidence: "high", impact: "high",
        summary: parallelWorkflow.length ? "CI names independent web, shared, Android, and iOS lanes and joins them at semantic parity." : "The scan did not find independent web, Android, and iOS jobs joined by one convergence gate.",
        action: "Branch platform work from the same capsule commit, keep file ownership disjoint, publish receipts, and join only after every lane produces its own evidence.",
        skill: "parallel-platform-development + pr-workflow", reference: "skills/parallel-platform-development/references/parallel-operating-model.md", example: "Sibling platform CI fan-out", evidence: evidence(parallelWorkflow),
        question: "Which current platform dependency can be replaced by a generated contract or explicit receipt?",
      }));
    }
  }

  const services = matches(applicationSource, /\b(?:class|function|const)\s+\w*(?:Service|Repository)|\b(?:service|repository)\.[A-Za-z_]/i);
  const directRoutePersistence = matches(routeFiles, /(?:from\s+["']@?\/?(?:lib\/)?(?:supabase|prisma)|\b(?:prisma|supabase)\.(?:from|rpc|\w+\.(?:create|update|delete|upsert)))/i);
  if (routeFiles.length && directRoutePersistence.length) {
    findings.push(finding({
      id: "thin-server-boundaries", title: "Move durable policy out of route handlers", status: "risk", confidence: "high", impact: "high",
      patternId: "thin-server-boundary",
      summary: "One or more transport files appear to call persistence directly. That makes authorization, idempotency, and transaction policy easier to bypass or duplicate.",
      action: "Trace each route to an authenticated service contract, then keep the route responsible only for parsing, validation, delegation, and response normalization.",
      skill: "architecture-building + frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#thin-transport-server-owned-policy",
      example: "Release Readiness and Field Relay route → service → repository slices", evidence: evidence(directRoutePersistence),
      question: "Should the first upgrade isolate these writes behind services, or preserve the current boundary and document why it is safe?",
    }));
  } else if (routeFiles.length && services.length) {
    findings.push(finding({
      id: "thin-server-boundaries", title: "Thin transport and server-owned policy", status: "established", confidence: "medium",
      patternId: "thin-server-boundary",
      summary: "Transport and service or repository boundaries are both present. Verify that authorization and durable invariants stay below the route layer.",
      action: "Keep this boundary and add negative authorization and transaction tests when changing it.",
      skill: "architecture-building + frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#thin-transport-server-owned-policy",
      example: "Release Readiness and Field Relay route → service → repository slices", evidence: evidence([...routeFiles, ...services]),
      question: "Is there a specific mutation boundary you want reviewed more deeply?",
    }));
  } else if (routeFiles.length) {
    findings.push(finding({
      id: "thin-server-boundaries", title: "Make the server ownership boundary explicit", status: "opportunity", confidence: "medium", impact: "high",
      patternId: "thin-server-boundary",
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
      patternId: "state-owner-by-lifetime",
      summary: "Several client effects fetch remote data without a shared server-cache dependency. This commonly creates duplicate sources of truth, stale responses, and hand-built loading or retry behavior.",
      action: "Pilot one query-keyed read and mutation path with cancellation, rollback, canonical reconciliation, and identity-scoped cache cleanup.",
      skill: "frontend-api-db", reference: "skills/frontend-api-db/references/state-management-scenarios.md",
      example: "Top-bar points update and Release Readiness optimistic rollback", evidence: evidence(useEffectFetch),
      question: "Which remote workflow should become the first canonical query-cache slice?",
    }));
  } else if (queryUsage.length) {
    findings.push(finding({
      id: "server-state-cache", title: "Shared server cache", status: "established", confidence: "high",
      patternId: "optimistic-canonical-reconcile",
      summary: "A query-cache boundary is present. The next review should verify complete query keys, cancellation, rollback, and reconciliation across every affected surface.",
      action: "Trace one mutation through visible rows, detail views, aggregates, pagination, failure, and identity changes.",
      skill: "frontend-api-db", reference: "skills/frontend-api-db/references/state-management-scenarios.md",
      example: "Onboarding Operations and shared points", evidence: evidence(queryUsage),
      question: "Do you want the audit to follow one mutation across every cache surface?",
    }));
  } else if (["nextjs", "expo", "react-native"].includes(profile.kind)) {
    findings.push(finding({
      id: "server-state-cache", title: "Name the owner of remote state", status: "opportunity", confidence: "medium",
      patternId: "state-owner-by-lifetime",
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
      patternId: "versioned-idempotent-write",
      summary: "Mutation paths are present, but no revision, ETag, idempotency key, or client nonce was found by the static scan.",
      action: "Choose the writes that can be repeated or performed from two tabs or devices, then add expected-version and idempotency contracts at the authoritative boundary.",
      skill: "frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#versioned-writes-and-idempotent-replay",
      example: "Field Relay operation IDs and mission revision; Release Readiness expected revision", evidence: evidence(mutations),
      question: "Which write must never be duplicated or silently overwrite newer work?",
    }));
  } else if (revision.length || idempotency.length) {
    findings.push(finding({
      id: "concurrency-retry", title: "Versioned writes and replay safety", status: "established", confidence: "high",
      patternId: "versioned-idempotent-write",
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
      patternId: "object-tenant-authorization",
      summary: "A browser- or app-public environment name appears to contain a service role, secret, private key, or admin key marker.",
      action: "Rotate any exposed credential, keep privileged keys server-only, use publishable keys in clients, and enforce object and tenant access with service policy plus RLS.",
      skill: "security-review", reference: "skills/security-review/references/supabase-auth-sessions.md",
      example: "Field Relay publishable-key client plus server authorization and RLS", evidence: evidence(publicSecrets),
      question: "Can I prioritize a credential exposure and authorization trace before other upgrades?",
    }));
  } else if (supabaseUsage && rls.length) {
    findings.push(finding({
      id: "auth-data-boundary", title: "Layered Supabase authorization", status: "established", confidence: "high", impact: "high",
      patternId: "object-tenant-authorization",
      summary: "Supabase use and row-level security policies are both present.",
      action: "Verify each protected mutation also receives a server-verified actor and has negative cross-tenant tests; RLS should repeat, not replace, service authorization.",
      skill: "security-review + frontend-api-db", reference: "skills/security-review/references/supabase-auth-sessions.md",
      example: "All three case studies use actor-scoped services plus RLS", evidence: evidence(rls),
      question: "Which protected resource should receive the first cross-tenant test matrix?",
    }));
  } else if (supabaseUsage) {
    findings.push(finding({
      id: "auth-data-boundary", title: "Prove the Supabase authorization boundary", status: "opportunity", confidence: "medium", impact: "high",
      patternId: "object-tenant-authorization",
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
      patternId: "offline-outbox",
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
      patternId: "offline-outbox",
      summary: "Outbox, queue, sync, or reconciliation language is present.",
      action: "Exercise termination, duplicate replay, stale revision, identity change, and canonical confirmation before relying on the path.",
      skill: "expo-native-app + frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#honest-offline-work",
      example: "Field Relay offline mission workflow", evidence: evidence(outbox),
      question: "Should the next audit simulate reconnect and a conflicting second-device update?",
    }));
  }

  const synchronizationEffects = matches(clientFiles, /useEffect\s*\([\s\S]{0,500}?\bset[A-Z][A-Za-z0-9_]*\s*\(/)
    .filter((entry) => !/\b(?:IntersectionObserver|MutationObserver|ResizeObserver|requestAnimationFrame|addEventListener|setInterval|setTimeout)\b/.test(entry.text));
  if (synchronizationEffects.length) {
    findings.push(finding({
      id: "derived-state", patternId: "minimal-derived-state", title: "Review Effect-synchronized state", status: "opportunity", confidence: "medium",
      summary: "Client effects appear to write component state. Some may coordinate external systems, while others may copy values that can be derived during render and can drift.",
      action: "Classify each effect as external synchronization or duplicated state. Remove only the copies, keep irreducible facts, and derive projections or use a reducer for atomic transitions.",
      skill: "frontend-api-db + architecture-building", reference: "skills/codebase-upgrade/references/pattern-atlas.md#minimal-derived-state--store-facts-derive-projections",
      example: "deriveVisibleWork and its source-change test", evidence: evidence(synchronizationEffects),
      question: "Which copied value has caused the most stale UI or synchronization work?",
    }));
  }

  const identitySignals = matches(applicationSource, /\b(?:signOut|logout|onAuthStateChange|sessionChanged|switchWorkspace)\b/i);
  const cacheCleanup = matches(applicationSource, /\b(?:removeQueries|clear\s*\(|cancelQueries|resetQueries)\b/);
  if (identitySignals.length && !cacheCleanup.length && queryUsage.length) {
    findings.push(finding({
      id: "identity-cache", patternId: "identity-scoped-cache", title: "Clear protected cache state on identity changes", status: "opportunity", confidence: "medium", impact: "high",
      summary: "Auth or workspace identity changes and a query cache are present, but the scan did not find cancellation or removal of cached work near those paths.",
      action: "Trace logout and workspace switch, scope keys by authorized resource, cancel in-flight work, and remove sensitive snapshots before the next identity renders.",
      skill: "security-review + frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-atlas.md#identity-scoped-cache--clear-sensitive-projections-on-identity-change",
      example: "IdentityCache account-switch proof", evidence: evidence(identitySignals),
      question: "Should identity-switch cache isolation be proven before broader state upgrades?",
    }));
  }

  const webhookFiles = applicationSource.filter((entry) => /webhooks?|callbacks?/i.test(entry.path) || /\bwebhook\b/i.test(entry.text));
  const webhookVerification = matches(webhookFiles, /\b(?:signature|verifyWebhook|constructEvent|svix|timingSafeEqual)\b/i);
  const webhookDedupe = matches(webhookFiles, /\b(?:eventId|event_id|idempot|receipt|unique)\b/i);
  if (webhookFiles.length && (!webhookVerification.length || !webhookDedupe.length)) {
    findings.push(finding({
      id: "webhook-delivery", patternId: "webhook-inbox", title: "Verify and deduplicate webhook delivery", status: "opportunity", confidence: "medium", impact: "high",
      summary: "A webhook or callback path is present, but the static scan did not find both signature verification and a durable duplicate-delivery signal.",
      action: "Inspect the raw-body verification path, unique event receipt, retry response, processing status, and idempotency of downstream effects.",
      skill: "security-review + frontend-api-db", reference: "skills/codebase-upgrade/references/pattern-atlas.md#webhook-inbox--verify-then-deduplicate-external-events",
      example: "WebhookInbox bad-signature and duplicate tests", evidence: evidence(webhookFiles),
      question: "Which external event would cause the most damage if it were forged or delivered twice?",
    }));
  }

  const jobFiles = applicationSource.filter((entry) => /(?:^|\/)(?:jobs?|workers?|queues?)(?:\/|\.)/i.test(entry.path) || /\b(?:bullmq|inngest|trigger\.dev|temporal|background job)\b/i.test(entry.text));
  const jobStates = matches(jobFiles, /\bqueued\b[\s\S]{0,300}\brunning\b[\s\S]{0,300}\b(?:succeeded|completed|failed)\b/i);
  if (jobFiles.length && !jobStates.length) {
    findings.push(finding({
      id: "background-jobs", patternId: "durable-job-state-machine", title: "Give long-running work a durable lifecycle", status: "opportunity", confidence: "medium", impact: "high",
      summary: "Background job or worker code is present, but the scan did not find an explicit queued, running, and terminal state contract.",
      action: "Define durable job transitions, attempt identity, progress, retry classification, cancellation, and terminal output before adding more worker behavior.",
      skill: "frontend-api-db + architecture-building", reference: "skills/codebase-upgrade/references/pattern-atlas.md#durable-job-state-machine--give-work-a-lifecycle",
      example: "transitionJob invalid-transition tests", evidence: evidence(jobFiles),
      question: "Which long-running task most often becomes stuck, duplicated, or hard to explain to users?",
    }));
  }

  const uploadFiles = applicationSource.filter((entry) => /upload/i.test(entry.path) || /\b(?:FormData|multipart|presigned|signedUrl|signedURL)\b/.test(entry.text));
  const uploadControls = matches(uploadFiles, /\b(?:contentLength|file\.size|maxFile|checksum|etag|offset|resum|partNumber)\b/i);
  if (uploadFiles.length && !uploadControls.length) {
    findings.push(finding({
      id: "large-uploads", patternId: "resumable-upload", title: "Define upload validation and resume behavior", status: "opportunity", confidence: "medium", impact: "medium",
      summary: "Upload handling is present, but the scan did not find size, checksum, part, offset, or resume signals.",
      action: "Decide which uploads require direct transfer, authoritative checkpoints, checksum verification, restart recovery, and idempotent finalization.",
      skill: "frontend-api-db + security-review", reference: "skills/codebase-upgrade/references/pattern-atlas.md#resumable-upload--advance-confirmed-checkpoints",
      example: "advanceUploadCheckpoint monotonic progress tests", evidence: evidence(uploadFiles),
      question: "What file size and network conditions must the product support without starting over?",
    }));
  }

  const flagFiles = matches(applicationSource, /\b(?:featureFlag|feature_flag|isFeatureEnabled|flags?\.)\b/i);
  const serverFlagFiles = flagFiles.filter((entry) => routeFiles.some((route) => route.path === entry.path) || /(?:service|server|policy)/i.test(entry.path));
  if (flagFiles.length && !serverFlagFiles.length) {
    findings.push(finding({
      id: "feature-flags", patternId: "server-enforced-feature-flag", title: "Enforce flagged capabilities at the authority boundary", status: "opportunity", confidence: "medium", impact: "high",
      summary: "Feature-flag signals appear in application code, but the scan only found them in client-side paths.",
      action: "Trace every flagged mutation and repeat the actor- and tenant-aware decision in the server-owned service; document rollout compatibility and flag removal.",
      skill: "architecture-building + security-review", reference: "skills/codebase-upgrade/references/pattern-atlas.md#server-enforced-feature-flag--gate-authority-and-presentation",
      example: "canUseCapability direct-call tests", evidence: evidence(flagFiles),
      question: "Which hidden capability remains callable if a client bypasses the UI?",
    }));
  }

  const cssVariables = matches(entries, /--[a-z][a-z0-9-]+\s*:/i, /\.(?:css|scss)$/);
  const hardcodedColors = matches(entries, /#[0-9a-f]{6}\b/gi, /\.(?:[cm]?[jt]sx?|css|scss)$/);
  const components = applicationSource.filter((entry) => /(?:^|\/)(?:components|ui|design-system)(?:\/|\.)/i.test(entry.path));
  if (cssVariables.length && components.length) {
    findings.push(finding({
      id: "component-system", title: "Reusable tokens and component boundary", status: "established", confidence: "medium",
      patternId: "governed-component-contract",
      summary: "The repository contains semantic-looking CSS variables and a component or UI directory.",
      action: "Verify variants are typed, state coverage is deliberate, metadata or previews explain intended use, and feature code composes rather than forks the recipes.",
      skill: "design-system", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#components-as-product-infrastructure",
      example: "The reference component library and distinct case-study themes", evidence: evidence([...cssVariables, ...components]),
      question: "Which repeated visual or interaction pattern still gets rebuilt by product teams?",
    }));
  } else if (components.length || hardcodedColors.length >= 8) {
    findings.push(finding({
      id: "component-system", title: "Turn repeated UI into governed recipes", status: "opportunity", confidence: "medium",
      patternId: "governed-component-contract",
      summary: "Reusable UI files or repeated hard-coded colors are present, but the scan did not find a clear semantic-token boundary.",
      action: "Inventory repeated product patterns, extract semantic roles and typed variants, then document when to use each component with live states.",
      skill: "design-system", reference: "skills/codebase-upgrade/references/pattern-and-antipattern-catalog.md#components-as-product-infrastructure",
      example: "Component-library onboarding, token roles, and variant contracts", evidence: evidence([...components, ...hardcodedColors]),
      question: "Which UI pattern creates the most inconsistency or review churn today?",
    }));
  }

  const verificationScripts = ["test", "typecheck", "lint", "build"].filter((name) => manifest.scripts?.[name]);
  const browserTests = testFiles.filter((entry) => /(?:playwright|cypress|maestro|detox|e2e)/i.test(entry.path + entry.text));
  if (profile.kind === "kotlin-multiplatform") {
    const workflow = entries.filter((entry) => /(?:^|\/)\.github\/workflows\/.*\.ya?ml$/.test(entry.path));
    const gradleChecks = workflow.filter((entry) => /hostTest|assembleDebug|linkDebugFramework|xcodebuild/.test(entry.text));
    const multiplatformTests = entries.filter((entry) => /(?:^|\/)src\/(?:commonTest|androidHostTest|androidDeviceTest|iosTest)\//.test(entry.path) || /(?:Tests?|androidTest)(?:\/|\.)/.test(entry.path));
    findings.push(finding({
      id: "verification-evidence", title: gradleChecks.length && multiplatformTests.length ? "Parallel multiplatform verification" : "Build the multiplatform verification fan-out",
      status: gradleChecks.length && multiplatformTests.length ? "established" : "opportunity", confidence: "high", impact: "high", patternId: "evidence-follows-owner",
      summary: gradleChecks.length && multiplatformTests.length ? "CI and test sources cover shared or native compilation paths. Keep one gate per owner and publish evidence against the same commit." : "The static scan did not find both test sources and CI commands for shared, Android, and iOS paths.",
      action: "Gate contract drift, host tests, Android lint/tests/build, iOS framework and Swift compilation, API compatibility, performance budgets, and scenario parity independently.",
      skill: "kotlin-multiplatform-app + code-review", reference: "skills/kotlin-multiplatform-app/references/testing-ci-and-release.md", example: "Multiplatform product-kernel workflow", evidence: evidence([...workflow, ...multiplatformTests]),
      question: "Which platform gate currently gives the slowest or least trustworthy feedback?",
    }));
  } else if (verificationScripts.length >= 3 && testFiles.length && browserTests.length) {
    findings.push(finding({
      id: "verification-evidence", title: "Layered verification", status: "established", confidence: "high",
      patternId: "evidence-follows-owner",
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
      patternId: "evidence-follows-owner",
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
  const firstRecommendation = recommendations[0];
  return {
    schemaVersion: 2,
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
    currentSystemFeedback: {
      preserve: findings.filter((item) => item.status === "established").slice(0, 5).map((item) => item.title),
      observedFrictionOrRisk: recommendations.slice(0, 5).map((item) => ({ title: item.title, patternId: item.patternId, evidence: item.evidence })),
      unknowns: ["Static inspection cannot prove production traffic, external policy, runtime configuration, or user priorities; validate the selected path against callers and current behavior."],
      selectedPattern: firstRecommendation?.patternId ?? null,
      firstProof: firstRecommendation
        ? `Reproduce or test the failure described by ${firstRecommendation.title} at its owning boundary before implementation.`
        : "Select one established pattern and exercise its failure or race scenario before changing it.",
    },
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
    "Current system feedback:",
    `- Preserve: ${report.currentSystemFeedback.preserve.length ? report.currentSystemFeedback.preserve.join("; ") : "No established pattern was confirmed by the static scan."}`,
    `- Observed friction or risk: ${report.currentSystemFeedback.observedFrictionOrRisk.length ? report.currentSystemFeedback.observedFrictionOrRisk.map((item) => `${item.title} (${item.patternId})`).join("; ") : "No upgrade signal was selected."}`,
    `- Unknowns: ${report.currentSystemFeedback.unknowns.join(" ")}`,
    `- Selected pattern: ${report.currentSystemFeedback.selectedPattern ?? "none"}`,
    `- First proof: ${report.currentSystemFeedback.firstProof}`,
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
      lines.push(`  Pattern: ${item.patternId} · Skill: ${item.skill} · Example: ${item.example}`);
      if (item.evidence.length) lines.push(`  Evidence: ${item.evidence.join(", ")}`);
    }
    lines.push("");
  }
  lines.push("Decision for the user:", report.nextQuestion);
  lines.push("", "This audit is read-only and static. Validate every recommendation against the named code path before changing architecture.");
  return lines.join("\n");
}
