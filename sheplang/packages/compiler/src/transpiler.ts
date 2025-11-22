import type { GenFile, GenResult } from './types.js';
import type { AppModel } from '@goldensheepai/sheplang-language';
import { templateTsConfig, templateModels, templateActions, templateViews, templateIndex } from './templates.js';
import { templateApiRoutes, templateApiPackageJson } from './api-templates.js';

export function transpile(app: AppModel): GenResult {
  const files: GenFile[] = [];

  // tsconfig
  files.push({ path: 'tsconfig.json', content: templateTsConfig() });

  // models (includes Prisma schema)
  for (const f of templateModels(app)) files.push(f);
  
  // actions (frontend API calls)
  for (const f of templateActions(app)) files.push(f);
  
  // views (React components)
  for (const f of templateViews(app)) files.push(f);
  
  // API routes (Express backend)
  for (const f of templateApiRoutes(app)) files.push(f);
  
  // package.json for API
  files.push(templateApiPackageJson(app));
  
  // index
  files.push(templateIndex(app));

  return { appName: app.name, files };
}
