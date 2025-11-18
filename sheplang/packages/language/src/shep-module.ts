import type { LangiumSharedCoreServices, LangiumCoreServices, Module } from 'langium';
import { createDefaultCoreModule, createDefaultSharedCoreModule, inject } from 'langium';
import { ShepGeneratedModule, shepGeneratedSharedModule } from './generated/module.js';

export type ShepAddedServices = {
  // Add custom services here if needed in future phases
};

export type ShepServices = LangiumCoreServices & ShepAddedServices;

export function createShepServices(fileSystemProvider: any): {
  shared: LangiumSharedCoreServices;
  Shep: ShepServices;
} {
  const shared = inject(
    createDefaultSharedCoreModule(fileSystemProvider),
    shepGeneratedSharedModule
  );
  const Shep = inject(
    createDefaultCoreModule({ shared }),
    ShepGeneratedModule
  ) as ShepServices;
  shared.ServiceRegistry.register(Shep);
  return { shared, Shep };
}
