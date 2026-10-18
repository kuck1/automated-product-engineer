import { featureContractDigest } from "../generated/work-item-policy";
import { WorkItemPanel } from "./work-item-panel";

export default function Page() {
  return (
    <main>
      <p className="eyebrow">NEXT.JS PROJECTION · {featureContractDigest.slice(0, 12)}</p>
      <h1>One product decision.<br />Three native experiences.</h1>
      <p className="lede">This surface consumes the same transition policy and scenario oracle as Android and iOS while keeping React composition, accessibility, and interaction native to the web.</p>
      <WorkItemPanel />
    </main>
  );
}
