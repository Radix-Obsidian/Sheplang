import type { LangiumSharedCoreServices, LangiumCoreServices } from 'langium';
export type ShepAddedServices = {};
export type ShepServices = LangiumCoreServices & ShepAddedServices;
export declare function createShepServices(fileSystemProvider: any): {
    shared: LangiumSharedCoreServices;
    Shep: ShepServices;
};
