"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Check, Clock3, Database, RefreshCw, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { ExampleSnapshot, Onboarding, OnboardingStage, Release, ReleaseStage } from "./contracts";
import { onboardingHealth, releaseReadiness } from "./service";
import { Badge, Button, SiteHeader } from "@/src/ui/components";
import { ExampleReferenceKit } from "./example-reference-kit";
import { exampleReferenceKits } from "./reference-kits";
import { clientSystems, clientTokenStyle } from "./client-systems";

type View = "releases" | "onboarding";

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
  const queryClient = useQueryClient();
  const requested = search.get("view");
  const view: View = requested === "onboarding" ? requested : "releases";
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

  const summary = useMemo(() => ({
    blocked: snapshotQuery.data.releases.filter((release) => release.stage === "blocked").length,
    ready: snapshotQuery.data.releases.filter((release) => release.stage === "ready").length,
    atRisk: snapshotQuery.data.onboardings.filter((item) => item.stage === "at_risk").length,
    seats: snapshotQuery.data.onboardings.reduce((sum, item) => sum + item.seats, 0),
  }), [snapshotQuery.data]);

  return (
    <main className="workspace-shell">
      <SiteHeader />
      <div className="workspace-layout">
        <section className="workspace-main">
          <div className="workspace-title"><div><Badge tone="info">Sample client app · Interactive demo</Badge><h2>{view === "releases" ? "Release readiness" : "Customer onboarding operations"}</h2><p>{view === "releases" ? "A policy control tower for deciding what can ship." : "A customer journey board for moving accounts toward value."}</p></div><Button tone="secondary" onClick={() => snapshotQuery.refetch()} disabled={snapshotQuery.isFetching}><RefreshCw size={15} /> Refresh</Button></div>
          {notice && <div role="status" className={`notice notice-${notice.tone}`}>{notice.tone === "success" ? <Check size={17} /> : <AlertTriangle size={17} />}{notice.text}</div>}
          <ExampleReferenceKit key={view} kit={exampleReferenceKits[view]} />
          {view === "releases" && <ReleaseView releases={snapshotQuery.data.releases} summary={summary} pending={releaseMutation.isPending} onMove={(release, stage) => releaseMutation.mutate({ release, stage })} />}
          {view === "onboarding" && <OnboardingView onboardings={snapshotQuery.data.onboardings} summary={summary} pending={onboardingMutation.isPending} onMove={(onboarding, stage) => onboardingMutation.mutate({ onboarding, stage })} />}
        </section>
      </div>
    </main>
  );
}

function ReleaseView({ releases, summary, pending, onMove }: { releases: Release[]; summary: { blocked: number; ready: number }; pending: boolean; onMove: (release: Release, stage: ReleaseStage) => void }) {
  return <section className="release-control-tower" style={clientTokenStyle(clientSystems.releases.tokens)} aria-label="Release policy control tower">
    <div className="release-summary">
      <div><small>CHECKPOINT OS · CYCLE</small><strong>October ship train</strong><span>Live policy service · deterministic memory adapter</span></div>
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
  return <section className="onboarding-journey" style={clientTokenStyle(clientSystems.onboarding.tokens)} aria-label="Customer onboarding journey">
    <div className="journey-runtime"><Database size={16} /><span><strong>Clarity System</strong> · Live policy service · deterministic memory adapter</span></div>
    <div className="journey-summary"><div><Sparkles size={17} /><span><strong>{onboardings.length}</strong> active journeys</span></div><div><Users size={17} /><span><strong>{summary.seats}</strong> seats in motion</span></div><div className={summary.atRisk ? "is-risk" : ""}><AlertTriangle size={17} /><span><strong>{summary.atRisk}</strong> account needs attention</span></div></div>
    <div className="journey-board">{stages.map((stage, stageIndex) => <section className={`journey-column journey-${stage.id}`} key={stage.id} aria-label={stage.label}>
      <header><span>{String(stageIndex + 1).padStart(2, "0")}</span><div><strong>{stage.label}</strong><small>{stage.hint}</small></div><i>{onboardings.filter((item) => item.stage === stage.id).length}</i></header>
      <div>{onboardings.filter((item) => item.stage === stage.id).map((onboarding) => {
        const health = onboardingHealth(onboarding);
        return <article className="journey-card" key={onboarding.id}>
          <div className="journey-card-head"><div><small>{onboarding.plan}</small><h3>{onboarding.customer}</h3><p>{onboarding.owner} · launch {onboarding.targetLaunchDate}</p></div><div className="journey-health-ring" style={{ background: `conic-gradient(var(--journey-success) ${health.score * 3.6}deg, var(--journey-track) 0)` }}><span>{health.score}</span></div></div>
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


function Metric({ label, value, detail, tone = "neutral" }: { label: string; value: number; detail: string; tone?: "neutral" | "success" | "danger" }) {
  return <article className={`metric metric-${tone}`}><small>{label}</small><strong>{value}</strong><p>{detail}</p></article>;
}
