import { NextResponse } from "next/server";
import { getExampleService } from "@/src/examples/container";
import { updateOnboardingSchema } from "@/src/examples/contracts";
import { apiError } from "@/src/examples/http";
import { requireActor } from "@/src/server/auth/actor";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const input = updateOnboardingSchema.parse(await request.json());
    return NextResponse.json(await getExampleService().updateOnboarding(await requireActor(), id, input));
  } catch (error) {
    return apiError(error);
  }
}
