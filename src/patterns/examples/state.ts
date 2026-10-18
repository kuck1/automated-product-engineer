export function deriveVisibleWork<T extends { completed: boolean }>(items: T[], showCompleted: boolean) {
  const visible = showCompleted ? items : items.filter((item) => !item.completed);
  return { visible, remaining: items.filter((item) => !item.completed).length };
}

export class LatestIntent {
  private current = 0;

  begin() {
    this.current += 1;
    return this.current;
  }

  isCurrent(token: number) {
    return token === this.current;
  }
}

type OptimisticMutationOptions<T, TResult> = {
  read: () => T;
  project: (current: T) => T;
  commit: (value: T) => void;
  mutate: () => Promise<TResult>;
  reconcile: (result: TResult) => T;
};

export async function runOptimisticMutation<T, TResult>(options: OptimisticMutationOptions<T, TResult>) {
  const previous = options.read();
  options.commit(options.project(previous));
  try {
    const result = await options.mutate();
    const canonical = options.reconcile(result);
    options.commit(canonical);
    return canonical;
  } catch (error) {
    options.commit(previous);
    throw error;
  }
}

export class IdentityCache<T> {
  private entries = new Map<string, T>();

  private key(identity: string, resource: string) {
    return `${identity}:${resource}`;
  }

  set(identity: string, resource: string, value: T) {
    this.entries.set(this.key(identity, resource), value);
  }

  get(identity: string, resource: string) {
    return this.entries.get(this.key(identity, resource));
  }

  removeIdentity(identity: string) {
    const prefix = `${identity}:`;
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) this.entries.delete(key);
    }
  }
}

