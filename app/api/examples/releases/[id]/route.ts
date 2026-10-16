import { NextResponse } from "next/server";
import { getExampleService } from "@/src/examples/container";
import { updateReleaseSchema } from "@/src/examples/contracts";
import { apiError } from "@/src/examples/http";
import { requireActor } from "@/src/server/auth/actor";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const input = updateReleaseSchema.parse(await request.json());
    return NextResponse.json(await getExampleService().updateRelease(await requireActor(), id, input));
  } catch (error) {
    return apiError(error);
  }
}
