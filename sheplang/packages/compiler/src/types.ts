export type { AppModel } from '@radix-obsidian/sheplang-language';

export type GenFile = { path: string; content: string };
export type GenResult = { appName: string; files: GenFile[] };
