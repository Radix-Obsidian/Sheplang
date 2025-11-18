import type { GenFile, GenResult } from './types.js';
import type { AppModel } from '@radix-obsidian/sheplang-language';
import { templateTsConfig, templateModels, templateActions, templateViews, templateIndex } from './templates.js';

export function transpile(app: AppModel): GenResult {
  const files: GenFile[] = [];

  // tsconfig
  files.push({ path: 'tsconfig.json', content: templateTsConfig() });

  // models
  for (const f of templateModels(app)) files.push(f);
  // actions
  for (const f of templateActions(app)) files.push(f);
  // views
  for (const f of templateViews(app)) files.push(f);
  // index
  files.push(templateIndex(app));

  return { appName: app.name, files };
}
