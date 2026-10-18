"use client";

import { ArrowUpRight, Braces, FileText, Layers3, Palette, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ExampleReferenceKit as ReferenceKit } from "./reference-kits";

type Section = "brief" | "design" | "tokens" | "architecture" | "skills";

const sections: Array<{ id: Section; label: string; icon: typeof FileText }> = [
  { id: "brief", label: "App brief", icon: FileText },
  { id: "design", label: "Design system", icon: Palette },
  { id: "tokens", label: "Tokens", icon: Braces },
  { id: "architecture", label: "Architecture", icon: Layers3 },
  { id: "skills", label: "Skills", icon: Sparkles },
];

export function ExampleReferenceKit({ kit }: { kit: ReferenceKit }) {
  const [section, setSection] = useState<Section>("brief");

  return (
    <section className="example-reference-kit" aria-label={`${kit.name} reference kit`}>
      <header>
        <div><span className="reference-kit-badge">{kit.label} · {kit.systemName}</span><h3>Inspect how this client app was built.</h3><p>Product intent, visual rules, implementation boundaries, and the skills that guide this example.</p></div>
      </header>
      <div className="reference-kit-tabs" role="tablist" aria-label="Reference kit sections">
        {sections.map(({ id, label, icon: Icon }) => <button type="button" role="tab" aria-selected={section === id} className={section === id ? "active" : ""} key={id} onClick={() => setSection(id)}><Icon size={14} />{label}</button>)}
      </div>
      <div className="reference-kit-panel" role="tabpanel">
        {section === "brief" && <div className="reference-brief"><p className="reference-ownership"><strong>Client app</strong>{kit.summary}</p><dl>{kit.brief.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>}
        {section === "design" && <div className="reference-section"><div className="reference-section-heading"><small>CLIENT DESIGN LANGUAGE</small><h4>{kit.systemName}</h4><p>{kit.systemSummary}</p></div><div className="reference-design"><div className="reference-principles">{kit.principles.map(([name, detail], index) => <article key={name}><span>{String(index + 1).padStart(2, "0")}</span><strong>{name}</strong><p>{detail}</p></article>)}</div><div className="reference-components"><small>APP-SPECIFIC COMPONENT HIERARCHY</small>{kit.components.map((component, index) => <span key={component}><i>{index === 0 ? "Page" : index < 3 ? "Composition" : "Primitive"}</i>{component}</span>)}</div></div></div>}
        {section === "tokens" && <div className="reference-section"><div className="reference-section-heading"><small>CLIENT TOKEN LIBRARY</small><h4>{kit.systemName}</h4><p>The documentation stays in this site&apos;s design system while the swatches describe the client app below. The live app consumes the same typed registry.</p></div><div className="reference-tokens">{kit.tokens.map(token => <article key={token.name}><i style={{ background: token.value }} /><div><strong>{token.name}</strong><p>{token.purpose}</p></div><code>{token.variable}</code><span>{token.value}</span></article>)}</div></div>}
        {section === "architecture" && <div className="reference-architecture">{kit.architecture.map(([layer, detail, source], index) => <article key={layer}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{layer}</strong><p>{detail}</p><a href={`https://github.com/kuck1/automated-product-engineer-nextjs/blob/main/${source.path}`} target="_blank" rel="noreferrer" aria-label={`Open ${layer} source on GitHub`}><code>{source.label}</code><ArrowUpRight size={13} /></a></div></article>)}</div>}
        {section === "skills" && <div className="reference-skills">{kit.skills.map(skill => <Link href={`/library?skill=${skill.slug}#skills`} key={skill.slug}><div><small>RELEVANT SKILL</small><strong>{skill.name}</strong><p>{skill.use}</p></div><ArrowUpRight size={15} /></Link>)}</div>}
      </div>
    </section>
  );
}
