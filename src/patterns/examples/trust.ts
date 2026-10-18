export type Actor = { id: string; tenantId: string; roles: string[] };
export type Resource = { id: string; tenantId: string; ownerId: string };

export function authorizeResource(actor: Actor | null, resource: Resource, action: "read" | "update" | "delete") {
  if (!actor) return false;
  if (actor.tenantId !== resource.tenantId) return false;
  if (action === "read") return true;
  return actor.id === resource.ownerId || actor.roles.includes("admin");
}

export type WebhookReceipt = { eventId: string; acceptedAt: number; status: "accepted" | "duplicate" };

export class WebhookInbox {
  private receipts = new Map<string, WebhookReceipt>();

  accept(eventId: string, signatureVerified: boolean, now: number): WebhookReceipt {
    if (!signatureVerified) throw new Error("Unverified webhook signature");
    const existing = this.receipts.get(eventId);
    if (existing) return { ...existing, status: "duplicate" };
    const receipt: WebhookReceipt = { eventId, acceptedAt: now, status: "accepted" };
    this.receipts.set(eventId, receipt);
    return receipt;
  }
}

export function canUseCapability(input: {
  enabled: boolean;
  actor: Actor | null;
  tenantId: string;
  requiredRole?: string;
}) {
  if (!input.enabled || !input.actor || input.actor.tenantId !== input.tenantId) return false;
  return !input.requiredRole || input.actor.roles.includes(input.requiredRole);
}

