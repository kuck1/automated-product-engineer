"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Clock3, Code2, ExternalLink, Gauge, Layers3, RefreshCw, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { ExampleSnapshot, Onboarding, OnboardingStage, Release, ReleaseStage } from "./contracts";
import { onboardingHealth, releaseReadiness } from "./service";
import { Badge, Brand, Button } from "@/src/ui/components";

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
            <button className={view === "architecture" ? "active" : ""} onClick={() => navigate("architecture")}><span><Layers3 size={18} /> Architecture map</span><i><Code2 size={13} /></i></button>
          </nav>
          <div className="demo-boundary"><span>DEMO MODE</span><p>Deterministic actor and isolated in-memory adapter. Add Supabase env vars to switch persistence.</p></div>
        </aside>
        <section className="workspace-main">
          <div className="workspace-title"><div><Badge tone="info">Interactive reference</Badge><h2>{view === "releases" ? "Release readiness" : view === "onboarding" ? "Customer onboarding operations" : "Architecture map"}</h2><p>{view === "releases" ? "Business rules decide when a release can ship." : view === "onboarding" ? "Milestones, adoption, and contact recency determine health." : "Follow one action from component state to persistence."}</p></div><Button tone="secondary" onClick={() => snapshotQuery.refetch()} disabled={snapshotQuery.isFetching}><RefreshCw size={15} /> Refresh</Button></div>
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
  return <>
    <div className="metric-grid"><Metric label="Release candidates" value={releases.length} detail="Current cycle" /><Metric label="Blocked" value={summary.blocked} detail="Needs intervention" tone="danger" /><Metric label="Ready" value={summary.ready} detail="All policy passed" tone="success" /></div>
    <div className="record-list">{releases.map((release) => {
      const readiness = releaseReadiness(release);
      return <article className="record-card" key={release.id}>
        <div className="record-head"><div><Badge tone={release.stage === "blocked" ? "danger" : release.stage === "ready" ? "success" : "info"}>{release.stage}</Badge><h3>{release.name}</h3><p>{release.owner} · target {release.targetDate}</p></div><div className="score"><strong>{readiness.score}</strong><small>readiness</small></div></div>
        <div className="progress"><i style={{ width: `${readiness.score}%` }} /></div>
        <div className="gate-grid">{release.gates.map((gate) => <span className={`gate gate-${gate.status}`} key={gate.id}>{gate.status === "passing" ? <Check size={13} /> : gate.status === "failing" ? <AlertTriangle size={13} /> : <Clock3 size={13} />}{gate.label}{gate.required && <small>required</small>}</span>)}</div>
        <div className="record-footer"><span>{release.approvals}/{release.requiredApprovals} approvals</span><div>{releaseActions[release.stage]?.map((action) => <Button tone={action.stage === "blocked" ? "quiet" : "secondary"} disabled={pending} key={action.stage} onClick={() => onMove(release, action.stage)}>{action.label}<ArrowRight size={14} /></Button>)}</div></div>
      </article>;
    })}</div>
  </>;
}

function OnboardingView({ onboardings, summary, pending, onMove }: { onboardings: Onboarding[]; summary: { atRisk: number; seats: number }; pending: boolean; onMove: (onboarding: Onboarding, stage: OnboardingStage) => void }) {
  return <>
    <div className="metric-grid"><Metric label="Active accounts" value={onboardings.length} detail="In implementation" /><Metric label="Seats onboarding" value={summary.seats} detail="Across all accounts" /><Metric label="At risk" value={summary.atRisk} detail="Needs owner action" tone="danger" /></div>
    <div className="record-list">{onboardings.map((onboarding) => {
      const health = onboardingHealth(onboarding);
      return <article className="record-card" key={onboarding.id}>
        <div className="record-head"><div><Badge tone={onboarding.stage === "at_risk" ? "danger" : onboarding.stage === "live" ? "success" : "info"}>{onboarding.stage.replace("_", " ")}</Badge><h3>{onboarding.customer}</h3><p>{onboarding.owner} · {onboarding.plan} · {onboarding.seats} seats</p></div><div className="score"><strong>{health.score}</strong><small>health</small></div></div>
        <div className="progress"><i style={{ width: `${health.score}%` }} /></div>
        <div className="milestone-list">{onboarding.milestones.map((milestone) => <span className={milestone.completed ? "complete" : ""} key={milestone.id}><i>{milestone.completed && <Check size={12} />}</i><b>{milestone.label}</b><small>{milestone.dueDate}</small></span>)}</div>
        <div className="record-footer"><span>{onboarding.weeklyActiveUsers}/{onboarding.seats} weekly active · {health.overdue} overdue</span><div>{onboardingActions[onboarding.stage]?.map((action) => <Button tone="secondary" disabled={pending} key={action.stage} onClick={() => onMove(onboarding, action.stage)}>{action.label}<ArrowRight size={14} /></Button>)}</div></div>
      </article>;
    })}</div>
  </>;
}

function ArchitectureView() {
  const layers = [
    ["Interaction", "ExampleWorkspace", "URL navigation + local notices", "src/examples/example-workspace.tsx"],
    ["Server cache", "TanStack Query", "Optimistic intent + rollback", "src/examples/example-workspace.tsx"],
    ["Transport", "Route handlers", "Authenticate, validate, delegate", "app/api/examples"],
    ["Domain", "ExampleService", "Authorization + transition policy", "src/examples/service.ts"],
    ["Persistence", "ExampleRepository", "Memory or Supabase adapter", "src/examples/repository.ts"],
  ];
  return <div id="architecture" className="architecture-view"><div className="flow-diagram">{layers.map(([label, title, detail, path], index) => <div className="architecture-layer" key={label}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{label}</small><strong>{title}</strong><p>{detail}</p><code>{path}</code></div>{index < layers.length - 1 && <ArrowRight size={18} />}</div>)}</div><aside><h3>Why this boundary exists</h3><p>The page never imports Supabase. The API never decides business policy. The service never returns database records. Each seam can be tested and replaced independently.</p><a href="https://github.com/kuck1/automated-product-engineer-nextjs/blob/main/docs/reference-app-architecture.md" target="_blank" rel="noreferrer">Read the architecture decision <ExternalLink size={14} /></a></aside></div>;
}

function Metric({ label, value, detail, tone = "neutral" }: { label: string; value: number; detail: string; tone?: "neutral" | "success" | "danger" }) {
  return <article className={`metric metric-${tone}`}><small>{label}</small><strong>{value}</strong><p>{detail}</p></article>;
}
