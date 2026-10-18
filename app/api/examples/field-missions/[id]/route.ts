import { NextResponse } from "next/server";
import { updateFieldStopSchema } from "@/src/examples/contracts";
import { getExampleService } from "@/src/examples/container";
import { apiError } from "@/src/examples/http";
import { requireActor } from "@/src/server/auth/actor";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const input = updateFieldStopSchema.parse(await request.json());
    return NextResponse.json(await getExampleService().updateFieldStop(await requireActor(), id, input));
  } catch (error) {
    return apiError(error);
  }
}
