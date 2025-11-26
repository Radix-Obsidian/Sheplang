import type { LangiumSharedCoreServices, LangiumCoreServices, Module, PartialLangiumCoreServices } from 'langium';
import { createDefaultCoreModule, createDefaultSharedCoreModule, inject } from 'langium';
import { ShepGeneratedModule, shepGeneratedSharedModule } from './generated/module.js';
import { ShepScopeComputation } from './shep-scope.js';

export type ShepAddedServices = {
  // Add custom services here if needed in future phases
};

export type ShepServices = LangiumCoreServices & ShepAddedServices;

/**
 * Custom module that registers ShepLang-specific services
 * including cross-file scope resolution
 */
export const ShepCustomModule: Module<ShepServices, PartialLangiumCoreServices> = {
  references: {
    ScopeComputation: (services) => new ShepScopeComputation(services)
  }
};

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
    ShepGeneratedModule,
    ShepCustomModule  // Register our custom scope computation
  ) as ShepServices;
  shared.ServiceRegistry.register(Shep);
  return { shared, Shep };
}
