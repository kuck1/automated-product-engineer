import { MemoryExampleRepository } from "./adapters/memory-repository";
import { ExampleService } from "./service";

const globalServices = globalThis as typeof globalThis & { exampleService?: ExampleService };

export function getExampleService() {
  if (!globalServices.exampleService) {
    globalServices.exampleService = new ExampleService(new MemoryExampleRepository());
  }
  return globalServices.exampleService;
}

export function resetExampleService() {
  globalServices.exampleService = new ExampleService(new MemoryExampleRepository());
  return globalServices.exampleService;
}
