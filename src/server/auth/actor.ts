import type { Actor } from "@/src/examples/contracts";

/**
 * The public demo is intentionally isolated to one synthetic workspace. A real
 * deployment should replace this adapter with Supabase Auth token validation;
 * services still receive the same server-owned Actor contract.
 */
export async function requireActor(): Promise<Actor> {
  return { id: "user_demo_owner", workspaceId: "workspace_demo", role: "owner" };
}
