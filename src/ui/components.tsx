import Link from "next/link";
import { GitFork } from "lucide-react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { badgeTone, buttonTone, type BadgeTone, type ButtonTone } from "./recipes";

const siteNavigation = [
  { id: "releases", label: "Case Study #1", href: "/examples?view=releases" },
  { id: "onboarding", label: "Case Study #2", href: "/examples?view=onboarding" },
  { id: "quick-start", label: "Quick Start", href: "/quick-start" },
  { id: "guide", label: "Behind the scenes", href: "/guide" },
  { id: "library", label: "Complete Skill Library", href: "/library" },
] as const;

type SiteSection = typeof siteNavigation[number]["id"];

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="Automated Product Engineer home">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      {!compact && <span>Automated Product Engineer</span>}
    </Link>
  );
}

export function SiteHeader({ active }: { active?: SiteSection }) {
  return (
    <header className="site-header">
      <Brand />
      <nav aria-label="Primary navigation">
        {siteNavigation.map(item => (
          <Link aria-current={active === item.id ? "page" : undefined} href={item.href} key={item.id}>
            {item.label}
          </Link>
        ))}
      </nav>
      <a className="header-action" href="https://github.com/kuck1/automated-product-engineer-nextjs" target="_blank" rel="noreferrer">
        <GitFork size={15} /> Open Source on GitHub
      </a>
    </header>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={badgeTone[tone]}>{children}</span>;
}

export function Button({ tone = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  return <button className={`${buttonTone[tone]} ${className}`} {...props} />;
}

export function ButtonLink({ tone = "primary", className = "", children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { tone?: ButtonTone }) {
  return <a className={`${buttonTone[tone]} ${className}`} {...props}>{children}</a>;
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow"><span aria-hidden="true" />{children}</p>;
}
