"use client";

import { Braces, Check, Code2, Database, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

const tiles = ["Typography", "Actions", "Data", "Architecture", "Quality", "Tokens"] as const;
const FLOW_PERIOD = 52_000;
const FLOW_SPEED = 2;

type ParticleSeed = {
  height: number;
  phase: number;
  duration: number;
  reach: number;
  size: number;
  drift: number;
  cool: boolean;
};

function noise(index: number, salt: number) {
  let value = Math.imul(index + 1, 374_761_393) ^ Math.imul(salt + 1, 668_265_263);
  value = Math.imul(value ^ (value >>> 13), 1_274_126_177);
  return ((value ^ (value >>> 16)) >>> 0) / 4_294_967_296;
}

function particleSeeds(count: number): ParticleSeed[] {
  return Array.from({ length: count }, (_, index) => ({
    height: noise(index, 1),
    phase: noise(index, 2),
    duration: 1_600 + noise(index, 3) * 2_200,
    reach: 30 + noise(index, 4) * 82,
    size: 0.6 + noise(index, 5) * 1.6,
    drift: (noise(index, 6) - 0.5) * 25,
    cool: noise(index, 7) > 0.38,
  }));
}

function sampleParticle(seed: ParticleSeed, elapsed: number, cardHeight: number) {
  const age = (((elapsed / seed.duration + seed.phase) % 1) + 1) % 1;
  const edge = Math.sin(Math.PI * seed.height);
  return {
    x: -3 + age ** 2.4 * seed.reach,
    y: (seed.height * 1.25 - 0.125) * cardHeight + Math.sin(age * Math.PI) * seed.drift,
    size: seed.size * (1 - age * 0.5),
    alpha: Math.min(1, Math.min(1, age * 18) * (1 - age) ** 1.6 * 2) * (0.15 + edge * 0.85),
    cool: seed.cool,
  };
}

function PreviewTile({ index, before }: { index: number; before: boolean }) {
  switch (index % tiles.length) {
    case 0:
      return (
        <div className="flow-typography">
          <small>{before ? "LOCAL TYPE OVERRIDES" : "SEMANTIC TYPE SCALE"}</small>
          <strong>{before ? "Looks close." : "Clear hierarchy."}</strong>
          <b>{before ? "Until it doesn’t." : "Built to adapt."}</b>
          <p>{before ? "14px / 15px / 16px" : "Display / body / label"}</p>
          <div><span>Aa</span><i>{before ? "Five one-off styles" : "One shared language"}</i></div>
        </div>
      );
    case 1:
      return (
        <div className="flow-actions">
          <small>{before ? "ONE-OFF CONTROLS" : "TYPED COMPONENTS"}</small>
          <button tabIndex={-1}><Sparkles size={15} /> {before ? "Another custom action" : "Create release"}</button>
          <div><span className="active">Overview</span><span>Activity</span></div>
          <p><Check size={13} /> {before ? "Hardcoded state" : "Enum-driven variants"}</p>
        </div>
      );
    case 2:
      return (
        <div className="flow-data">
          <small>{before ? "COMPONENT FETCH" : "SERVER CONTRACT"}</small>
          <header><Database size={17} /><span>{before ? "fetch('/api')" : "repository.list()"}</span></header>
          <div className="flow-bars">{[42, 70, 54, 88, 66, 94].map((height) => <i key={height} style={{ height: `${height}%` }} />)}</div>
          <footer><span>AUTH</span><span>VALIDATE</span><span>PERSIST</span></footer>
        </div>
      );
    case 3:
      return (
        <div className="flow-layers">
          <small>{before ? "TANGLED OWNERSHIP" : "VERTICAL SLICE"}</small>
          {[
            [Code2, before ? "Page + fetch + policy" : "Typed UI"],
            [Layers3, before ? "Shared mutable state" : "Domain service"],
            [Database, before ? "Direct table write" : "Repository adapter"],
          ].map(([Icon, label]) => {
            const TileIcon = Icon as typeof Code2;
            return <span key={String(label)}><TileIcon size={14} />{String(label)}</span>;
          })}
        </div>
      );
    case 4:
      return (
        <div className="flow-quality">
          <small>{before ? "HOPE IT WORKS" : "REVIEWABLE EVIDENCE"}</small>
          <ShieldCheck size={28} />
          <strong>{before ? "Manual spot check" : "Ready for review"}</strong>
          <span><Check size={12} /> Desktop + mobile</span>
          <span><Check size={12} /> E2E + visual CI</span>
        </div>
      );
    default:
      return (
        <div className="flow-tokens">
          <small>{before ? "HEX VALUES EVERYWHERE" : "SEMANTIC TOKENS"}</small>
          <strong>{before ? "Close enough?" : "One source of truth."}</strong>
          <div><i /><i /><i /><i /></div>
          <footer><span>{before ? "Copied → pasted" : "Tokens → components"}</span><Braces size={17} /></footer>
        </div>
      );
  }
}

function Stream({ before }: { before: boolean }) {
  return [0, 1, 2].map((copy) => (
    <div className="flow-set" key={copy}>
      {tiles.map((tile, index) => (
        <article className={`flow-card ${before ? "flow-card-before" : "flow-card-after"}`} key={`${copy}-${tile}`}>
          <PreviewTile index={index} before={before} />
        </article>
      ))}
    </div>
  ));
}

export function HeroPipeline() {
  const scene = useRef<HTMLDivElement>(null);
  const beforeTrack = useRef<HTMLDivElement>(null);
  const afterTrack = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const elapsed = useRef(16_000);

  useEffect(() => {
    const element = scene.current;
    const before = beforeTrack.current;
    const after = afterTrack.current;
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!element || !before || !after || !surface || !context) return;

    const seeds = particleSeeds(2_400);
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous: number | null = null;
    let visible = true;
    let disposed = false;
    let card = 248;
    let gap = 28;
    let scale = 1;
    let offsetY = 54;
    let dpr = 1;

    const active = () => !media.matches && visible && !document.hidden;

    function drawParticles() {
      context!.setTransform(dpr, 0, 0, dpr, 0, 0);
      context!.clearRect(0, 0, 176 * scale, element!.clientHeight);
      const beam = 36 * scale;
      const middle = offsetY + card / 2;
      const aura = context!.createRadialGradient(beam, middle, 0, beam, middle, card * 0.72);
      aura.addColorStop(0, "#85d9ff18");
      aura.addColorStop(1, "#85d9ff00");
      context!.fillStyle = aura;
      context!.fillRect(0, 0, 176 * scale, element!.clientHeight);
      context!.globalCompositeOperation = "lighter";
      const count = scale < 0.8 ? 900 : seeds.length;
      for (let index = 0; index < count; index += 1) {
        const particle = sampleParticle(seeds[index]!, elapsed.current, 248);
        const x = beam + particle.x * scale;
        const y = offsetY + particle.y * scale;
        const size = particle.size * scale;
        context!.globalAlpha = particle.alpha;
        context!.fillStyle = particle.cool ? "#a4eaff" : "#a991ff";
        context!.fillRect(x, y, Math.max(0.45, size), Math.max(0.45, size));
      }
      context!.globalAlpha = 1;
      const glow = context!.createLinearGradient(0, offsetY - 28 * scale, 0, offsetY + card + 28 * scale);
      glow.addColorStop(0, "#9deaff00");
      glow.addColorStop(0.18, "#7edfffbb");
      glow.addColorStop(0.5, "#f5fdff");
      glow.addColorStop(0.82, "#7edfffbb");
      glow.addColorStop(1, "#9deaff00");
      context!.fillStyle = glow;
      context!.shadowColor = "#64dfff";
      context!.shadowBlur = 14 * scale;
      context!.fillRect(beam - 0.65 * scale, offsetY - 28 * scale, 1.3 * scale, card + 56 * scale);
      context!.shadowBlur = 0;
      context!.globalCompositeOperation = "source-over";
    }

    function draw() {
      const cycle = (card + gap) * tiles.length;
      const phase = ((((elapsed.current * FLOW_SPEED) % FLOW_PERIOD) + FLOW_PERIOD) % FLOW_PERIOD) / FLOW_PERIOD;
      const offset = (phase - 1) * cycle;
      before!.style.transform = `translate3d(${offset}px,0,0)`;
      after!.style.transform = `translate3d(${offset}px,0,0)`;
      drawParticles();
    }

    function resize() {
      card = before!.querySelector<HTMLElement>(".flow-card")?.getBoundingClientRect().width || 248;
      gap = parseFloat(getComputedStyle(before!.firstElementChild!).columnGap) || 28;
      scale = card / 248;
      offsetY = (element!.clientHeight - card) / 2;
      dpr = Math.min(devicePixelRatio || 1, 2);
      surface!.width = Math.ceil(176 * scale * dpr);
      surface!.height = Math.ceil(element!.clientHeight * dpr);
      draw();
    }

    function tick(time: number) {
      if (disposed) return;
      if (!active()) {
        previous = null;
        frame = 0;
        return;
      }
      elapsed.current += Math.min(50, Math.max(0, previous === null ? 0 : time - previous));
      previous = time;
      draw();
      frame = requestAnimationFrame(tick);
    }

    function reconcile() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
      draw();
      element!.dataset.flowState = active() ? "running" : media.matches ? "reduced" : "paused";
      if (active()) frame = requestAnimationFrame(tick);
    }

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      reconcile();
    });
    resizeObserver.observe(element);
    intersectionObserver.observe(element);
    media.addEventListener("change", reconcile);
    document.addEventListener("visibilitychange", reconcile);
    resize();
    reconcile();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      media.removeEventListener("change", reconcile);
      document.removeEventListener("visibilitychange", reconcile);
    };
  }, []);

  return (
    <div className="pipeline" ref={scene} role="img" aria-label="Animated before and after comparison: disconnected interface code becomes a clean, production-ready system.">
      <div className="pipeline-labels" aria-hidden="true"><span>BEFORE · DISCONNECTED UI</span><span>AFTER · PRODUCTION SYSTEM</span></div>
      <p className="sr-only">Before: one-off styles, tangled ownership, and manual checks. After: semantic tokens, typed components, clean service boundaries, and reviewable evidence.</p>
      <div className="flow-after-window" aria-hidden="true"><div className="flow-track" ref={afterTrack}><Stream before={false} /></div></div>
      <div className="flow-before-window" aria-hidden="true"><div className="flow-track" ref={beforeTrack}><Stream before /></div></div>
      <div className="pipeline-seam" aria-hidden="true" />
      <canvas className="pipeline-dissolve" ref={canvas} aria-hidden="true" />
      <div className="pipeline-caption" aria-hidden="true">ONE CONTRACT · EVERY LAYER · EVIDENCE INCLUDED</div>
    </div>
  );
}
