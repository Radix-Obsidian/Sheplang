import { createDefaultCoreModule, createDefaultSharedCoreModule, inject } from 'langium';
import { ShepGeneratedModule, shepGeneratedSharedModule } from './generated/module.js';
export function createShepServices(fileSystemProvider) {
    const shared = inject(createDefaultSharedCoreModule(fileSystemProvider), shepGeneratedSharedModule);
    const Shep = inject(createDefaultCoreModule({ shared }), ShepGeneratedModule);
    shared.ServiceRegistry.register(Shep);
    return { shared, Shep };
}
//# sourceMappingURL=shep-module.js.map