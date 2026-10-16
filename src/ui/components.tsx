import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { badgeTone, buttonTone, type BadgeTone, type ButtonTone } from "./recipes";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="Automated Product Engineer home">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      {!compact && <span>Automated Product Engineer</span>}
    </Link>
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
