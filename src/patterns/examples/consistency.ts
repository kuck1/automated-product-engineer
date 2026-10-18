export type VersionedRecord<T> = { value: T; revision: number };

export class VersionConflict extends Error {
  constructor(public readonly currentRevision: number) {
    super(`Expected revision does not match current revision ${currentRevision}`);
  }
}

export class VersionedStore<T> {
  private record: VersionedRecord<T>;
  private operations = new Map<string, VersionedRecord<T>>();

  constructor(initial: T) {
    this.record = { value: initial, revision: 0 };
  }

  read(): VersionedRecord<T> {
    return structuredClone(this.record);
  }

  write(operationId: string, expectedRevision: number, update: (value: T) => T): VersionedRecord<T> {
    const replay = this.operations.get(operationId);
    if (replay) return structuredClone(replay);
    if (expectedRevision !== this.record.revision) throw new VersionConflict(this.record.revision);
    this.record = { value: update(structuredClone(this.record.value)), revision: this.record.revision + 1 };
    this.operations.set(operationId, structuredClone(this.record));
    return this.read();
  }
}

export type OutboxState = "queued" | "syncing" | "confirmed" | "conflicted" | "failed";
export type OutboxEntry<T> = { id: string; payload: T; state: OutboxState; attempts: number };

export class Outbox<T> {
  private entries: OutboxEntry<T>[] = [];

  enqueue(id: string, payload: T) {
    if (!this.entries.some((entry) => entry.id === id)) this.entries.push({ id, payload, state: "queued", attempts: 0 });
  }

  snapshot() {
    return structuredClone(this.entries);
  }

  async flush(send: (entry: OutboxEntry<T>) => Promise<"confirmed" | "conflicted">) {
    for (const entry of this.entries.filter((item) => item.state === "queued" || item.state === "failed")) {
      entry.state = "syncing";
      entry.attempts += 1;
      try {
        entry.state = await send(structuredClone(entry));
      } catch {
        entry.state = "failed";
      }
    }
    return this.snapshot();
  }
}

export type RealtimeMessage = { id?: string; clientNonce: string; text: string; createdAt?: string };

export function reconcileRealtimeMessages(current: RealtimeMessage[], incoming: RealtimeMessage) {
  const index = current.findIndex((message) =>
    (incoming.id && message.id === incoming.id) || message.clientNonce === incoming.clientNonce,
  );
  const next = [...current];
  if (index === -1) next.push(incoming);
  else next[index] = { ...next[index], ...incoming };
  return next.sort((a, b) => (a.createdAt ?? "~").localeCompare(b.createdAt ?? "~"));
}

export class LeaseTable {
  private leases = new Map<string, { owner: string; expiresAt: number }>();

  acquire(name: string, owner: string, now: number, ttl: number) {
    const current = this.leases.get(name);
    if (current && current.expiresAt > now && current.owner !== owner) return false;
    this.leases.set(name, { owner, expiresAt: now + ttl });
    return true;
  }

  owner(name: string, now: number) {
    const current = this.leases.get(name);
    return current && current.expiresAt > now ? current.owner : null;
  }
}

