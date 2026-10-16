import { NextResponse } from "next/server";
import { resetExampleService } from "@/src/examples/container";
import { requireActor } from "@/src/server/auth/actor";

export async function POST() {
  if (process.env.EXAMPLES_ALLOW_RESET === "false") {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Not found." } }, { status: 404 });
  }
  await requireActor();
  resetExampleService();
  return NextResponse.json({ ok: true });
}
