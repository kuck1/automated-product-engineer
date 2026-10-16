"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Clock3, Code2, Database, ExternalLink, Gauge, Layers3, LockKeyhole, RefreshCw, Server, ShieldCheck, Sparkles, Users, Workflow } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { ExampleSnapshot, Onboarding, OnboardingStage, Release, ReleaseStage } from "./contracts";
import { onboardingHealth, releaseReadiness } from "./service";
import { Badge, Brand, Button } from "@/src/ui/components";
import { architectureLayers, extensionRules, requestLifecycle, stateOwners, verificationLayers } from "./architecture-reference";

type View = "releases" | "onboarding" | "architecture";

const releaseActions: Partial<Record<ReleaseStage, { label: string; stage: ReleaseStage }[]>> = {
  building: [{ label: "Start validation", stage: "validating" }],
  validating: [{ label: "Mark ready", stage: "ready" }, { label: "Block release", stage: "blocked" }],
  blocked: [{ label: "Resume validation", stage: "validating" }],
  ready: [{ label: "Reopen validation", stage: "validating" }],
};

const onboardingActions: Partial<Record<OnboardingStage, { label: string; stage: OnboardingStage }[]>> = {
  discovery: [{ label: "Begin configuration", stage: "configuring" }],
  configuring: [{ label: "Begin training", stage: "training" }],
  training: [{ label: "Launch customer", stage: "live" }],
  at_risk: [{ label: "Return to configuration", stage: "configuring" }],
  live: [{ label: "Flag risk", stage: "at_risk" }],
};

async function fetchSnapshot() {
  const response = await fetch("/api/examples");
  if (!response.ok) throw new Error("Could not load the example workspace.");
  return response.json() as Promise<ExampleSnapshot>;
}

async function patchEntity<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message ?? "The update failed.");
  return result as T;
}

export function ExampleWorkspace({ initialSnapshot }: { initialSnapshot: ExampleSnapshot }) {
  const search = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const requested = search.get("view");
  const view: View = requested === "onboarding" || requested === "architecture" ? requested : "releases";
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const snapshotQuery = useQuery({ queryKey: ["example-snapshot"], queryFn: fetchSnapshot, initialData: initialSnapshot });

  const releaseMutation = useMutation({
    mutationFn: ({ release, stage }: { release: Release; stage: ReleaseStage }) => patchEntity<Release>(`/api/examples/releases/${release.id}`, { stage, expectedRevision: release.revision }),
    onMutate: async ({ release, stage }) => {
      await queryClient.cancelQueries({ queryKey: ["example-snapshot"] });
      const previous = queryClient.getQueryData<ExampleSnapshot>(["example-snapshot"]);
      queryClient.setQueryData<ExampleSnapshot>(["example-snapshot"], (current) => current ? { ...current, releases: current.releases.map((item) => item.id === release.id ? { ...item, stage, revision: item.revision + 1 } : item) } : current);
      setNotice(null);
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["example-snapshot"], context.previous);
      setNotice({ tone: "danger", text: error.message });
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<ExampleSnapshot>(["example-snapshot"], (current) => current ? { ...current, releases: current.releases.map((item) => item.id === saved.id ? saved : item) } : current);
      setNotice({ tone: "success", text: `${saved.name} moved to ${saved.stage}.` });
    },
  });

  const onboardingMutation = useMutation({
    mutationFn: ({ onboarding, stage }: { onboarding: Onboarding; stage: OnboardingStage }) => patchEntity<Onboarding>(`/api/examples/onboardings/${onboarding.id}`, { stage, expectedRevision: onboarding.revision }),
    onMutate: async ({ onboarding, stage }) => {
      await queryClient.cancelQueries({ queryKey: ["example-snapshot"] });
      const previous = queryClient.getQueryData<ExampleSnapshot>(["example-snapshot"]);
      queryClient.setQueryData<ExampleSnapshot>(["example-snapshot"], (current) => current ? { ...current, onboardings: current.onboardings.map((item) => item.id === onboarding.id ? { ...item, stage, revision: item.revision + 1 } : item) } : current);
      setNotice(null);
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["example-snapshot"], context.previous);
      setNotice({ tone: "danger", text: error.message });
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<ExampleSnapshot>(["example-snapshot"], (current) => current ? { ...current, onboardings: current.onboardings.map((item) => item.id === saved.id ? saved : item) } : current);
      setNotice({ tone: "success", text: `${saved.customer} moved to ${saved.stage.replace("_", " ")}.` });
    },
  });

  function navigate(next: View) {
    router.push(`/examples?view=${next}`, { scroll: false });
    setNotice(null);
  }

  const summary = useMemo(() => ({
    blocked: snapshotQuery.data.releases.filter((release) => release.stage === "blocked").length,
    ready: snapshotQuery.data.releases.filter((release) => release.stage === "ready").length,
    atRisk: snapshotQuery.data.onboardings.filter((item) => item.stage === "at_risk").length,
    seats: snapshotQuery.data.onboardings.reduce((sum, item) => sum + item.seats, 0),
  }), [snapshotQuery.data]);

  return (
    <main className="workspace-shell">
      <header className="workspace-header"><Brand /><Link href="/" className="workspace-back"><ArrowLeft size={15} /> Back to overview</Link><a href="https://github.com/kuck1/automated-product-engineer-nextjs" target="_blank" rel="noreferrer">Source <ExternalLink size={14} /></a></header>
      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <div><small>REFERENCE APPS</small><h1>Example workspace</h1><p>Two complete vertical slices sharing one system.</p></div>
          <nav aria-label="Example views">
            <button className={view === "releases" ? "active" : ""} onClick={() => navigate("releases")}><span><Gauge size={18} /> Release readiness</span><i>{snapshotQuery.data.releases.length}</i></button>
            <button className={view === "onboarding" ? "active" : ""} onClick={() => navigate("onboarding")}><span><Users size={18} /> Onboarding ops</span><i>{snapshotQuery.data.onboardings.length}</i></button>
            <button className={view === "architecture" ? "active" : ""} onClick={() => navigate("architecture")}><span><Layers3 size={18} /> Developer guide</span><i><Code2 size={13} /></i></button>
          </nav>
          <div className="demo-boundary"><span>DEMO MODE</span><p>Deterministic actor and isolated in-memory adapter. Add Supabase env vars to switch persistence.</p></div>
        </aside>
        <section className="workspace-main">
          <div className="workspace-title"><div><Badge tone="info">Interactive reference</Badge><h2>{view === "releases" ? "Release readiness" : view === "onboarding" ? "Customer onboarding operations" : "Developer guide"}</h2><p>{view === "releases" ? "A policy control tower for deciding what can ship." : view === "onboarding" ? "A customer journey board for moving accounts toward value." : "Explore the complete request path, boundaries, code, and delivery contract."}</p></div>{view !== "architecture" && <Button tone="secondary" onClick={() => snapshotQuery.refetch()} disabled={snapshotQuery.isFetching}><RefreshCw size={15} /> Refresh</Button>}</div>
          {notice && <div role="status" className={`notice notice-${notice.tone}`}>{notice.tone === "success" ? <Check size={17} /> : <AlertTriangle size={17} />}{notice.text}</div>}
          {view === "releases" && <ReleaseView releases={snapshotQuery.data.releases} summary={summary} pending={releaseMutation.isPending} onMove={(release, stage) => releaseMutation.mutate({ release, stage })} />}
          {view === "onboarding" && <OnboardingView onboardings={snapshotQuery.data.onboardings} summary={summary} pending={onboardingMutation.isPending} onMove={(onboarding, stage) => onboardingMutation.mutate({ onboarding, stage })} />}
          {view === "architecture" && <ArchitectureView />}
        </section>
      </div>
    </main>
  );
}

function ReleaseView({ releases, summary, pending, onMove }: { releases: Release[]; summary: { blocked: number; ready: number }; pending: boolean; onMove: (release: Release, stage: ReleaseStage) => void }) {
  return <section className="release-control-tower" aria-label="Release policy control tower">
    <div className="release-summary">
      <div><small>CYCLE</small><strong>October ship train</strong><span>Policy snapshot · deterministic demo</span></div>
      <Metric label="Candidates" value={releases.length} detail="In this train" />
      <Metric label="Blocked" value={summary.blocked} detail="Needs intervention" tone="danger" />
      <Metric label="Ready" value={summary.ready} detail="Policy complete" tone="success" />
    </div>
    <div className="release-table-shell">
      <div className="release-table-head" aria-hidden="true"><span>Release</span><span>Policy gates</span><span>Approvals</span><span>Readiness</span><span>Decision</span></div>
      <div className="release-rows">{releases.map((release) => {
        const readiness = releaseReadiness(release);
        return <article className="release-row" key={release.id}>
          <div className="release-identity"><Badge tone={release.stage === "blocked" ? "danger" : release.stage === "ready" ? "success" : "info"}>{release.stage}</Badge><h3>{release.name}</h3><p>{release.owner} · target {release.targetDate}</p></div>
          <div className="release-gates" aria-label={`${release.name} policy gates`}>{release.gates.map((gate) => <span className={`gate gate-${gate.status}`} key={gate.id}>{gate.status === "passing" ? <Check size={13} /> : gate.status === "failing" ? <AlertTriangle size={13} /> : <Clock3 size={13} />}{gate.label}{gate.required && <small>required</small>}</span>)}</div>
          <div className="release-approval"><strong>{release.approvals}/{release.requiredApprovals}</strong><span>{readiness.approvalsReady ? "Complete" : "Waiting"}</span></div>
          <div className="release-score"><div><strong>{readiness.score}</strong><small>/ 100</small></div><span><i style={{ width: `${readiness.score}%` }} /></span></div>
          <div className="release-actions">{releaseActions[release.stage]?.map((action) => <Button tone={action.stage === "blocked" ? "quiet" : "secondary"} disabled={pending} key={action.stage} onClick={() => onMove(release, action.stage)}>{action.label}<ArrowRight size={14} /></Button>)}</div>
        </article>;
      })}</div>
    </div>
    <p className="release-policy-note"><ShieldCheck size={15} /> Readiness is computed from required gates and approvals. The server repeats every check before accepting “ready.”</p>
  </section>;
}

function OnboardingView({ onboardings, summary, pending, onMove }: { onboardings: Onboarding[]; summary: { atRisk: number; seats: number }; pending: boolean; onMove: (onboarding: Onboarding, stage: OnboardingStage) => void }) {
  const stages: { id: OnboardingStage; label: string; hint: string }[] = [
    { id: "discovery", label: "Discovery", hint: "Align outcomes" },
    { id: "configuring", label: "Configure", hint: "Connect systems" },
    { id: "training", label: "Training", hint: "Build habits" },
    { id: "live", label: "Live", hint: "Measure value" },
    { id: "at_risk", label: "Needs attention", hint: "Recover momentum" },
  ];
  return <section className="onboarding-journey" aria-label="Customer onboarding journey">
    <div className="journey-summary"><div><Sparkles size={17} /><span><strong>{onboardings.length}</strong> active journeys</span></div><div><Users size={17} /><span><strong>{summary.seats}</strong> seats in motion</span></div><div className={summary.atRisk ? "is-risk" : ""}><AlertTriangle size={17} /><span><strong>{summary.atRisk}</strong> account needs attention</span></div></div>
    <div className="journey-board">{stages.map((stage, stageIndex) => <section className={`journey-column journey-${stage.id}`} key={stage.id} aria-label={stage.label}>
      <header><span>{String(stageIndex + 1).padStart(2, "0")}</span><div><strong>{stage.label}</strong><small>{stage.hint}</small></div><i>{onboardings.filter((item) => item.stage === stage.id).length}</i></header>
      <div>{onboardings.filter((item) => item.stage === stage.id).map((onboarding) => {
        const health = onboardingHealth(onboarding);
        return <article className="journey-card" key={onboarding.id}>
          <div className="journey-card-head"><div><small>{onboarding.plan}</small><h3>{onboarding.customer}</h3><p>{onboarding.owner} · launch {onboarding.targetLaunchDate}</p></div><div className="health-ring" style={{ background: `conic-gradient(var(--mint) ${health.score * 3.6}deg, #293039 0)` }}><span>{health.score}</span></div></div>
          <div className="adoption"><span><b>{onboarding.weeklyActiveUsers}</b> / {onboarding.seats} weekly active</span><i><b style={{ width: `${Math.round(health.adoptionRatio * 100)}%` }} /></i></div>
          <div className="journey-milestones">{onboarding.milestones.map((milestone) => <span className={milestone.completed ? "complete" : ""} key={milestone.id} title={`${milestone.label} · ${milestone.dueDate}`}>{milestone.completed ? <Check size={11} /> : null}</span>)}</div>
          <p className="journey-progress-copy">{health.completed}/{health.total} milestones complete{health.overdue ? ` · ${health.overdue} overdue` : " · on schedule"}</p>
          <div className="journey-actions">{onboardingActions[onboarding.stage]?.map((action) => <Button tone="secondary" disabled={pending} key={action.stage} onClick={() => onMove(onboarding, action.stage)}>{action.label}<ArrowRight size={14} /></Button>)}</div>
        </article>;
      })}{onboardings.every((item) => item.stage !== stage.id) && <div className="journey-empty"><span /><p>No accounts here</p></div>}</div>
    </section>)}</div>
    <p className="journey-note">Scroll the journey horizontally. Customer health blends milestones, weekly adoption, and relationship recency.</p>
  </section>;
}

function ArchitectureView() {
  const [activeId, setActiveId] = useState<(typeof architectureLayers)[number]["id"]>("interaction");
  const active = architectureLayers.find((layer) => layer.id === activeId) ?? architectureLayers[0];
  return <article id="architecture" className="developer-guide">
    <header className="guide-intro"><div><span>COMPLETE IMPLEMENTATION GUIDE</span><h3>One action. Every boundary. No missing middle.</h3><p>This page contains the architecture decision, real source excerpts, state model, extension rules, and verification contract. Follow the same path when adding a vertical slice.</p></div><dl><div><dt>5</dt><dd>explicit boundaries</dd></div><div><dt>2</dt><dd>replaceable adapters</dd></div><div><dt>1</dt><dd>policy authority</dd></div></dl></header>
    <nav className="guide-nav" aria-label="Developer guide sections"><a href="#guide-layers">Layers</a><a href="#guide-lifecycle">Request lifecycle</a><a href="#guide-state">State ownership</a><a href="#guide-extension">Extension</a><a href="#guide-verification">Verification</a></nav>

    <section className="guide-section" id="guide-layers"><div className="guide-heading"><span>01 / LAYERS</span><div><h3>Explore the source by responsibility.</h3><p>Select a layer to see what it owns, why the boundary exists, and the code that implements it.</p></div></div>
      <div className="layer-explorer"><div className="layer-stack">{architectureLayers.map((layer, index) => <button className={active.id === layer.id ? "active" : ""} key={layer.id} onClick={() => setActiveId(layer.id)} aria-pressed={active.id === layer.id}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{layer.label}</small><strong>{layer.title}</strong><p>{layer.detail}</p></div><ArrowRight size={16} /></button>)}</div>
        <div className="source-reader"><header><div><span>{active.label}</span><strong>{active.title}</strong></div><code>{active.path}</code></header><p>{active.why}</p><pre><code>{active.code}</code></pre><footer><LockKeyhole size={14} /> Stable contracts keep this layer independently testable and replaceable.</footer></div>
      </div>
    </section>

    <section className="guide-section" id="guide-lifecycle"><div className="guide-heading"><span>02 / REQUEST LIFECYCLE</span><div><h3>Trace a mutation end to end.</h3><p>The happy path and failure path use the same six steps. Optimism improves speed; the server still owns truth.</p></div></div><ol className="lifecycle-grid">{requestLifecycle.map(([title, detail], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><Workflow size={18} /><strong>{title}</strong><p>{detail}</p></li>)}</ol></section>

    <section className="guide-section" id="guide-state"><div className="guide-heading"><span>03 / STATE</span><div><h3>Give every state one owner.</h3><p>UI state, navigation, cached server state, durable records, and identity have different lifetimes and authorities.</p></div></div><div className="state-table"><div className="state-table-head"><span>State class</span><span>What lives there</span><span>Owner</span></div>{stateOwners.map(([kind, content, owner]) => <div key={kind}><strong>{kind}</strong><p>{content}</p><code>{owner}</code></div>)}</div></section>

    <section className="guide-section guide-split" id="guide-extension"><div><div className="guide-heading"><span>04 / EXTENSION</span><div><h3>Extend contracts, not conditionals.</h3><p>New capability enters through one stable seam. Existing layers remain closed to unrelated details.</p></div></div><div className="extension-list">{extensionRules.map(([change, rule]) => <div key={change}><Sparkles size={16} /><span><strong>{change}</strong><p>{rule}</p></span></div>)}</div></div><aside className="production-rules"><h3>Boundary rules</h3><ul><li><Check size={14} /> Pages compose; they do not query databases.</li><li><Check size={14} /> Routes authenticate, validate, delegate, normalize.</li><li><Check size={14} /> Services own authorization and business policy.</li><li><Check size={14} /> Repositories expose domain-shaped capabilities.</li><li><Check size={14} /> Adapters translate vendor records at the edge.</li></ul><div><Server size={18} /><span><strong>Auth before policy</strong><p>The server resolves an actor. The service verifies actor-to-workspace ownership for every record.</p></span></div><div><Database size={18} /><span><strong>RLS as defense in depth</strong><p>Supabase policies repeat tenant isolation below the application service.</p></span></div></aside></section>

    <section className="guide-section" id="guide-verification"><div className="guide-heading"><span>05 / VERIFICATION</span><div><h3>Evidence follows the architecture.</h3><p>Test the responsibility at the narrowest useful layer, then prove the integrated experience in a real browser.</p></div></div><div className="verification-grid">{verificationLayers.map(([layer, evidence], index) => <article key={layer}><span>{String(index + 1).padStart(2, "0")}</span><ShieldCheck size={20} /><h4>{layer}</h4><p>{evidence}</p></article>)}</div><div className="guide-finish"><Code2 size={20} /><div><strong>Definition of done</strong><p>A typed contract, thin route, policy service, adapter-backed repository, explicit client state, failure UX, focused tests, reviewed screenshots, green CI, and a reviewable pull request.</p></div></div></section>
  </article>;
}

function Metric({ label, value, detail, tone = "neutral" }: { label: string; value: number; detail: string; tone?: "neutral" | "success" | "danger" }) {
  return <article className={`metric metric-${tone}`}><small>{label}</small><strong>{value}</strong><p>{detail}</p></article>;
}
