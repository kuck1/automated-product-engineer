import { Suspense } from "react";
import { ExampleWorkspace } from "@/src/examples/example-workspace";
import { getExampleService } from "@/src/examples/container";
import { requireActor } from "@/src/server/auth/actor";

export const dynamic = "force-dynamic";

export default async function ExamplesPage() {
  const snapshot = await getExampleService().snapshot(await requireActor());
  return <Suspense fallback={<div className="workspace-loading">Loading example workspace…</div>}><ExampleWorkspace initialSnapshot={snapshot} /></Suspense>;
}
