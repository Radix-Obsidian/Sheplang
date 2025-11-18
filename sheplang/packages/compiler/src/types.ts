export type { AppModel } from '@goldensheepai/sheplang-language';

export type GenFile = { path: string; content: string };
export type GenResult = { appName: string; files: GenFile[] };
