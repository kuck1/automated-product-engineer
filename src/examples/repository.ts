import type { Onboarding, Release } from "./contracts";

export interface ExampleRepository {
  listReleases(workspaceId: string): Promise<Release[]>;
  getRelease(id: string): Promise<Release | null>;
  saveRelease(release: Release): Promise<Release>;
  listOnboardings(workspaceId: string): Promise<Onboarding[]>;
  getOnboarding(id: string): Promise<Onboarding | null>;
  saveOnboarding(onboarding: Onboarding): Promise<Onboarding>;
}
