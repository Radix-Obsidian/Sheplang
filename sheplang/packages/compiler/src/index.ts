export type { AppModel, GenFile, GenResult } from './types.js';
export { transpile } from './transpiler.js';
export { writeOut } from './fsio.js';
export { generateApp } from './generator.js';
export type { GeneratedApp } from './generator.js';
export { templateApiRoutes, templateApiPackageJson } from './api-templates.js';
export { templateModels, templateActions, templateViews, templateIndex, templateTsConfig } from './templates.js';
