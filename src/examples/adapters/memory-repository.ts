import { demoOnboardings, demoReleases } from "../fixtures";
import type { Onboarding, Release } from "../contracts";
import type { ExampleRepository } from "../repository";

const clone = <T,>(value: T): T => structuredClone(value);

export class MemoryExampleRepository implements ExampleRepository {
  private releases = new Map(demoReleases.map((item) => [item.id, clone(item)]));
  private onboardings = new Map(demoOnboardings.map((item) => [item.id, clone(item)]));

  async listReleases(workspaceId: string) {
    return [...this.releases.values()].filter((item) => item.workspaceId === workspaceId).map(clone);
  }
  async getRelease(id: string) {
    const item = this.releases.get(id);
    return item ? clone(item) : null;
  }
  async saveRelease(release: Release) {
    this.releases.set(release.id, clone(release));
    return clone(release);
  }
  async listOnboardings(workspaceId: string) {
    return [...this.onboardings.values()].filter((item) => item.workspaceId === workspaceId).map(clone);
  }
  async getOnboarding(id: string) {
    const item = this.onboardings.get(id);
    return item ? clone(item) : null;
  }
  async saveOnboarding(onboarding: Onboarding) {
    this.onboardings.set(onboarding.id, clone(onboarding));
    return clone(onboarding);
  }
}
