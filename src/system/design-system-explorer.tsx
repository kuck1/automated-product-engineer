"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Component,
  Copy,
  Layers3,
  LayoutGrid,
  Palette,
  RefreshCcw,
  SearchX,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Badge, Brand, Button, SectionEyebrow } from "@/src/ui/components";
import {
  semanticColorTokens,
  shapePresets,
  spacingTokens,
  themePresets,
  type ShapePresetName,
  type ThemePresetName,
} from "@/src/ui/tokens";

type DemoStyle = CSSProperties & Record<`--${string}`, string>;

type DensityName = "comfortable" | "compact";

function TokenCard({ token }: { token: typeof semanticColorTokens[number] }) {
  return (
    <article className="token-card">
      <div className="token-swatch" style={{ background: token.cssValue }} aria-hidden="true" />
      <div className="token-card-copy">
        <strong>{token.name}</strong>
        <span>{token.purpose}</span>
        <p>{token.guidance}</p>
      </div>
      <code>{token.variable}</code>
    </article>
  );
}

function CatalogSection({ id, eyebrow, title, summary, children }: { id: string; eyebrow: string; title: string; summary: string; children: ReactNode }) {
  return (
    <section className="system-catalog-section" id={id}>
      <header>
        <span>{eyebrow}</span>
        <div><h2>{title}</h2><p>{summary}</p></div>
      </header>
      {children}
    </section>
  );
}

function Specimen({ level, name, description, children }: { level: string; name: string; description: string; children: ReactNode }) {
  return (
    <article className="component-specimen">
      <header><span>{level}</span><div><h3>{name}</h3><p>{description}</p></div></header>
      <div className="component-stage">{children}</div>
    </article>
  );
}

export function DesignSystemExplorer() {
  const [themeName, setThemeName] = useState<ThemePresetName>("violet");
  const [shapeName, setShapeName] = useState<ShapePresetName>("balanced");
  const [density, setDensity] = useState<DensityName>("comfortable");
  const theme = themePresets[themeName];
  const shape = shapePresets[shapeName];
  const demoStyle: DemoStyle = {
    "--accent": theme.accent,
    "--accent-strong": theme.strong,
    "--demo-tint": theme.tint,
    "--radius-sm": shape.sm,
    "--radius": shape.md,
    "--radius-lg": shape.lg,
  };

  return (
    <main className="design-system-shell">
      <header className="workspace-header system-topbar">
        <Brand />
        <Link className="workspace-back" href="/"><ArrowLeft size={15} /> Back to overview</Link>
        <Link href="/library">Skills &amp; prompts <ArrowRight size={14} /></Link>
      </header>

      <section className="system-tour-hero">
        <div>
          <SectionEyebrow>DESIGN SYSTEM TOUR</SectionEyebrow>
          <h1>See the rules.<br /><span>Feel the system.</span></h1>
        </div>
        <div className="system-tour-intro">
          <p>Start with meaning, then inspect implementation. Every token explains the job it performs, and every component shows where it belongs.</p>
          <nav aria-label="Design system sections">
            <a href="#foundations"><Palette size={15} /> Foundations</a>
            <a href="#primitives"><Component size={15} /> Components</a>
            <a href="#patterns"><LayoutGrid size={15} /> Patterns</a>
          </nav>
        </div>
      </section>

      <section className="system-tour-map" aria-label="Design system hierarchy">
        <div><span>01</span><Palette size={18} /><strong>Foundations</strong><small>Tokens give choices meaning.</small></div>
        <i><ArrowRight size={16} /></i>
        <div><span>02</span><Component size={18} /><strong>Primitives</strong><small>Small parts share those rules.</small></div>
        <i><ArrowRight size={16} /></i>
        <div><span>03</span><Layers3 size={18} /><strong>Compositions</strong><small>Parts communicate together.</small></div>
        <i><ArrowRight size={16} /></i>
        <div><span>04</span><Sparkles size={18} /><strong>Patterns</strong><small>Reusable product decisions.</small></div>
      </section>

      <div className="system-tour-layout">
        <aside className="system-tour-nav">
          <p>TOUR CONTENTS</p>
          <a href="#foundations"><span>01</span><div><strong>Foundations</strong><small>Color, type, space, shape</small></div></a>
          <a href="#playground"><span>02</span><div><strong>Token playground</strong><small>Swap semantic decisions</small></div></a>
          <a href="#primitives"><span>03</span><div><strong>Primitives</strong><small>Buttons, badges, fields</small></div></a>
          <a href="#compositions"><span>04</span><div><strong>Compositions</strong><small>Notices and panels</small></div></a>
          <a href="#patterns"><span>05</span><div><strong>Patterns</strong><small>Product-level flows</small></div></a>
          <div className="tour-principle"><CircleDot size={15} /><p><strong>Name the purpose.</strong> Raw values are implementation details; semantic roles are the API.</p></div>
        </aside>

        <div className="system-tour-content">
          <CatalogSection id="foundations" eyebrow="01 · FOUNDATIONS" title="Tokens you can understand at a glance." summary="A token is a named product decision. Use its meaning to choose it; use its implementation name when you need to change it.">
            <div className="token-callout"><Palette size={19} /><div><strong>Read this as a sentence</strong><p>“This button uses <em>Primary action</em>” is more durable than “this button is purple.” The color can change without changing the component’s intent.</p></div></div>
            <div className="token-grid">{semanticColorTokens.map(token => <TokenCard key={token.variable} token={token} />)}</div>
            <div className="foundation-row">
              <article className="type-specimen"><span>TYPOGRAPHY</span><h3>Clear hierarchy without a type maze.</h3><p>One sans-serif family, four intentional levels, and relaxed body copy keep the system readable.</p><div><strong>Display</strong><i>52–96 / 1.06</i></div><div><strong>Section</strong><i>34–58 / 1.08</i></div><div><strong>Body</strong><i>16 / 1.70</i></div><div><strong>Label</strong><i>10 / 1.40</i></div></article>
              <article className="spacing-specimen"><span>SPACING</span><h3>Space describes relationships.</h3>{spacingTokens.map(([name, value, purpose], index) => <div key={name}><i style={{ width: `${18 + index * 15}%` }} /><strong>{name}</strong><b>{value}</b><small>{purpose}</small></div>)}</article>
            </div>
          </CatalogSection>

          <CatalogSection id="playground" eyebrow="02 · TOKEN PLAYGROUND" title="Change the system, not every component." summary="Swap semantic decisions here. The preview updates because each component consumes the same stable token contract.">
            <div className={`token-playground density-${density}`} style={demoStyle}>
              <div className="playground-controls">
                <fieldset><legend>Brand expression</legend>{Object.entries(themePresets).map(([key, option]) => <button type="button" aria-pressed={themeName === key} className={themeName === key ? "active" : ""} onClick={() => setThemeName(key as ThemePresetName)} key={key}><i style={{ background: option.accent }} /><span><strong>{option.label}</strong><small>{option.note}</small></span><Check size={14} /></button>)}</fieldset>
                <fieldset><legend>Shape language</legend>{Object.entries(shapePresets).map(([key, option]) => <button type="button" aria-pressed={shapeName === key} className={shapeName === key ? "active" : ""} onClick={() => setShapeName(key as ShapePresetName)} key={key}><i className="shape-preview" style={{ borderRadius: option.lg }} /><span><strong>{option.label}</strong><small>{option.note}</small></span><Check size={14} /></button>)}</fieldset>
                <fieldset><legend>Information density</legend><div className="segmented-control"><button type="button" aria-pressed={density === "comfortable"} className={density === "comfortable" ? "active" : ""} onClick={() => setDensity("comfortable")}>Comfortable</button><button type="button" aria-pressed={density === "compact"} className={density === "compact" ? "active" : ""} onClick={() => setDensity("compact")}>Compact</button></div></fieldset>
              </div>
              <div className="playground-preview">
                <header><div><span>LIVE COMPONENT PREVIEW</span><h3>Release approval</h3></div><Badge tone="success"><CheckCircle2 size={11} /> Ready</Badge></header>
                <p>Checkout is ready for the final production review. Every required gate has passed.</p>
                <div className="preview-field"><label htmlFor="release-note">Release note</label><input id="release-note" defaultValue="Improve checkout conversion" /><small>Visible to the release team.</small></div>
                <div className="preview-notice"><CheckCircle2 size={17} /><div><strong>All checks passed</strong><p>Design QA, tests, and security review are complete.</p></div></div>
                <div className="preview-actions"><Button tone="primary">Approve release</Button><Button tone="secondary">View evidence</Button></div>
                <footer><span style={{ background: theme.accent }} /><p><strong>{theme.label} + {shape.label} + {density}</strong><small>The components did not change. Their semantic tokens did.</small></p></footer>
              </div>
            </div>
          </CatalogSection>

          <CatalogSection id="primitives" eyebrow="03 · PRIMITIVES" title="The smallest useful interface pieces." summary="Primitives carry one focused responsibility. They are organized by what people do with them, not by arbitrary file structure.">
            <div className="component-grid">
              <Specimen level="ACTION" name="Buttons" description="One primary action per region; quieter alternatives preserve hierarchy."><div className="specimen-line"><Button>Primary action</Button><Button tone="secondary">Secondary</Button><Button tone="quiet">Quiet action</Button></div><small>primary · secondary · quiet</small></Specimen>
              <Specimen level="STATUS" name="Badges" description="Short, scannable state labels that always include words."><div className="specimen-line"><Badge>Draft</Badge><Badge tone="info">In review</Badge><Badge tone="success">Complete</Badge><Badge tone="warning">At risk</Badge><Badge tone="danger">Failed</Badge></div><small>neutral · info · success · warning · danger</small></Specimen>
              <Specimen level="INPUT" name="Text field" description="A visible label, useful hint, and a clear focus state form one control."><div className="preview-field specimen-field"><label htmlFor="project-name">Project name</label><input id="project-name" placeholder="e.g. Mobile checkout" /><small>Use a name teammates will recognize.</small></div></Specimen>
              <Specimen level="FEEDBACK" name="Status indicator" description="Pair color with an icon and language so meaning never depends on color alone."><div className="status-list"><span><i className="status-dot status-violet" /> Active</span><span><CheckCircle2 size={14} /> Complete</span><span><AlertTriangle size={14} /> Needs attention</span></div></Specimen>
            </div>
          </CatalogSection>

          <CatalogSection id="compositions" eyebrow="04 · COMPOSITIONS" title="Primitives working as one clear thought." summary="Compositions group related primitives without taking ownership of product data, routing, or network behavior.">
            <div className="composition-grid">
              <article className="notice-demo"><span><CheckCircle2 size={19} /></span><div><strong>Ready to share</strong><p>The preview matches the approved design at desktop and mobile sizes.</p></div><Button tone="quiet">View proof</Button></article>
              <article className="notice-demo warning"><span><AlertTriangle size={19} /></span><div><strong>One check needs attention</strong><p>Resolve the accessibility note before requesting final review.</p></div><Button tone="quiet">Open check</Button></article>
              <article className="panel-demo"><header><div><Badge tone="info">Review</Badge><h3>Design system update</h3></div><button aria-label="Copy reference"><Copy size={15} /></button></header><p>New semantic tokens and reusable components are ready for product review.</p><footer><span>Updated 4 minutes ago</span><Button>Review changes</Button></footer></article>
            </div>
          </CatalogSection>

          <CatalogSection id="patterns" eyebrow="05 · PATTERNS" title="Repeat product decisions, not just pixels." summary="Patterns combine components, state, and guidance into a reusable answer for a recurring workflow.">
            <div className="pattern-grid">
              <article><span>APPROVAL</span><div className="pattern-icon"><CheckCircle2 size={21} /></div><h3>Guarded action</h3><p>Explain readiness, surface remaining checks, and make the irreversible action unmistakable.</p><ul><li>State is visible before the action</li><li>Failure remains recoverable</li><li>Confirmation matches consequence</li></ul></article>
              <article><span>EMPTY STATE</span><div className="pattern-icon"><Box size={21} /></div><h3>First useful outcome</h3><p>Explain the value, give one focused next step, and show enough context to build confidence.</p><ul><li>Outcome before mechanics</li><li>One primary call to action</li><li>Helpful example included</li></ul></article>
              <article><span>PROGRESSIVE DISCLOSURE</span><div className="pattern-icon"><Layers3 size={21} /></div><h3>Simple first, depth nearby</h3><p>Lead with the recommended path and reveal expert controls only when they are requested.</p><ul><li>Defaults carry product judgment</li><li>Advanced choices stay accessible</li><li>Changing course preserves work</li></ul></article>
              <article><span>ASYNC RECOVERY</span><div className="pattern-icon"><RefreshCcw size={21} /></div><h3>Recover without losing intent</h3><p>Keep the user&apos;s work visible while a failed request explains what happened and how to continue.</p><ul><li>Pending state names the action</li><li>Retry preserves entered work</li><li>Rollback restores truthful state</li></ul></article>
              <article><span>REVIEW EVIDENCE</span><div className="pattern-icon"><ClipboardCheck size={21} /></div><h3>Proof beside the decision</h3><p>Put screenshots, checks, and unresolved risk next to the approval they are meant to support.</p><ul><li>Evidence matches the current revision</li><li>Failures link to useful context</li><li>Approval scope stays explicit</li></ul></article>
              <article><span>PERMISSIONS</span><div className="pattern-icon"><ShieldCheck size={21} /></div><h3>Explain unavailable actions</h3><p>Show relevant information while making the permission boundary and the next useful path clear.</p><ul><li>Server remains authoritative</li><li>Disabled controls explain why</li><li>Fallback avoids dead ends</li></ul></article>
              <article><span>SEARCH &amp; FILTERS</span><div className="pattern-icon"><SearchX size={21} /></div><h3>Return to a known view</h3><p>Keep filters understandable, make active constraints visible, and provide one reliable reset.</p><ul><li>URL reflects shareable state</li><li>Empty results name the cause</li><li>Reset clears every constraint</li></ul></article>
              <article><span>DESTRUCTIVE ACTION</span><div className="pattern-icon"><Trash2 size={21} /></div><h3>Confirm the consequence</h3><p>Reserve interruption for consequential changes and state exactly what will be removed or retained.</p><ul><li>Trigger language is specific</li><li>Confirmation repeats the object</li><li>Undo exists when feasible</li></ul></article>
            </div>
            <div className="pattern-prompt-link"><div><strong>Need implementation-ready instructions?</strong><p>Use the copy-ready prompt library for tokens, HTML prototypes, component contracts, full-stack boundaries, QA, and PR evidence.</p></div><Link className="button button-secondary" href="/library#prompts">Browse 12 prompts <ArrowRight size={14} /></Link></div>
          </CatalogSection>
        </div>
      </div>
    </main>
  );
}
