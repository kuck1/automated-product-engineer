import { NextResponse } from "next/server";
import { getExampleService } from "@/src/examples/container";
import { apiError } from "@/src/examples/http";
import { requireActor } from "@/src/server/auth/actor";

export async function GET() {
  try {
    return NextResponse.json(await getExampleService().snapshot(await requireActor()));
  } catch (error) {
    return apiError(error);
  }
}
