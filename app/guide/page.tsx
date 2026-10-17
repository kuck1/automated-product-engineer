import { DeveloperGuide } from "@/src/guide/developer-guide";
import { SiteHeader } from "@/src/ui/components";

export default function DeveloperGuidePage() {
  return (
    <main className="guide-shell">
      <SiteHeader active="guide" />
      <div className="guide-page-content"><DeveloperGuide /></div>
    </main>
  );
}
