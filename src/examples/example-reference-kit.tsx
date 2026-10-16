"use client";

import { ArrowUpRight, Boxes, Braces, FileText, Layers3, Palette } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/src/ui/components";
import type { ExampleReferenceKit as ReferenceKit } from "./reference-kits";

type Section = "brief" | "design" | "tokens" | "architecture" | "prompts";

const sections: Array<{ id: Section; label: string; icon: typeof FileText }> = [
  { id: "brief", label: "App brief", icon: FileText },
  { id: "design", label: "Design system", icon: Palette },
  { id: "tokens", label: "Tokens", icon: Braces },
  { id: "architecture", label: "Architecture", icon: Layers3 },
  { id: "prompts", label: "Prompts", icon: Boxes },
];

export function ExampleReferenceKit({ kit }: { kit: ReferenceKit }) {
  const [section, setSection] = useState<Section>("brief");

  return (
    <section className="example-reference-kit" aria-label={`${kit.name} reference kit`}>
      <header>
        <div><Badge tone="info">{kit.label} reference kit</Badge><h3>Inspect how this client app was built.</h3><p>Product intent, visual rules, implementation boundaries, and reusable prompts for this example.</p></div>
        <Link href="/system">Open our shared system <ArrowUpRight size={14} /></Link>
      </header>
      <div className="reference-kit-tabs" role="tablist" aria-label="Reference kit sections">
        {sections.map(({ id, label, icon: Icon }) => <button type="button" role="tab" aria-selected={section === id} className={section === id ? "active" : ""} key={id} onClick={() => setSection(id)}><Icon size={14} />{label}</button>)}
      </div>
      <div className="reference-kit-panel" role="tabpanel">
        {section === "brief" && <div className="reference-brief"><p className="reference-ownership"><strong>Client app</strong>{kit.summary}</p><dl>{kit.brief.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>}
        {section === "design" && <div className="reference-design"><div className="reference-principles">{kit.principles.map(([name, detail], index) => <article key={name}><span>{String(index + 1).padStart(2, "0")}</span><strong>{name}</strong><p>{detail}</p></article>)}</div><div className="reference-components"><small>APP-SPECIFIC COMPONENT HIERARCHY</small>{kit.components.map((component, index) => <span key={component}><i>{index === 0 ? "Page" : index < 3 ? "Composition" : "Primitive"}</i>{component}</span>)}</div></div>}
        {section === "tokens" && <div className="reference-tokens">{kit.tokens.map(token => <article key={token.name}><i style={{ background: token.value }} /><div><strong>{token.name}</strong><p>{token.purpose}</p></div><code>{token.variable}</code><span>{token.value}</span></article>)}</div>}
        {section === "architecture" && <div className="reference-architecture">{kit.architecture.map(([layer, detail, source], index) => <article key={layer}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{layer}</strong><p>{detail}</p><code>{source}</code></div></article>)}</div>}
        {section === "prompts" && <div className="reference-prompts">{kit.prompts.map(prompt => <Link href={`/library?prompt=${prompt.slug}#prompts`} key={prompt.slug}><div><small>RELEVANT PROMPT</small><strong>{prompt.name}</strong><p>{prompt.use}</p></div><ArrowUpRight size={15} /></Link>)}</div>}
      </div>
    </section>
  );
}
