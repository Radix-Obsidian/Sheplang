/**
 * AST Analyzer for Next.js Projects
 * 
 * High-level analyzer that combines React and Prisma parsing
 * to extract the app's semantic structure:
 * - Data models (entities)
 * - Views (pages/screens)
 * - Actions (handlers/API routes)
 * 
 * Output: Intermediate app model ready for ShepLang generation
 */

import * as path from 'path';
import { ReactComponent, JSXElement, parseReactProject } from './reactParser';
import { PrismaSchema, PrismaModel, parsePrismaSchema, findPrismaSchema } from './prismaParser';

export interface AppModel {
  appName: string;
  projectRoot: string;
  entities: Entity[];
  views: View[];
  actions: Action[];
  todos: string[];
}

export interface Entity {
  name: string;
  source: 'prisma' | 'inferred';
  fields: EntityField[];
}

export interface EntityField {
  name: string;
  type: string; // ShepLang type
  required: boolean;
}

export interface View {
  name: string;
  filePath: string;
  widgets: ViewWidget[];
}

export interface ViewWidget {
  kind: 'list' | 'button' | 'form' | 'input';
  entityName?: string; // For lists
  label?: string; // For buttons
  actionName?: string; // For buttons/forms
  fieldNames?: string[]; // For forms
}

export interface Action {
  name: string;
  source: 'handler' | 'api-route';
  parameters: string[];
  apiCalls: ActionAPICall[];
  todos: string[];
}

export interface ActionAPICall {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
}

/**
 * Analyze a Next.js project and extract app model
 */
export async function analyzeProject(projectRoot: string): Promise<AppModel> {
  const appModel: AppModel = {
    appName: inferAppName(projectRoot),
    projectRoot,
    entities: [],
    views: [],
    actions: [],
    todos: []
  };

  // Step 1: Extract entities from Prisma
  const prismaSchemaPath = findPrismaSchema(projectRoot);
  if (prismaSchemaPath) {
    const prismaSchema = parsePrismaSchema(prismaSchemaPath);
    if (prismaSchema) {
      appModel.entities = extractEntitiesFromPrisma(prismaSchema);
    }
  } else {
    appModel.todos.push('No Prisma schema found - entities will need to be defined manually');
  }

  // Step 2: Parse all React components
  const components = parseReactProject(projectRoot);

  // Step 3: Extract views from pages
  appModel.views = extractViewsFromComponents(components, appModel.entities);

  // Step 4: Extract actions from handlers and API calls
  appModel.actions = extractActionsFromComponents(components, appModel.entities);

  // Step 5: Infer missing entities from views
  inferMissingEntities(appModel);

  return appModel;
}

/**
 * Infer app name from project root
 */
function inferAppName(projectRoot: string): string {
  const dirName = path.basename(projectRoot);
  
  // Clean up common suffixes
  let cleaned = dirName
    .replace(/-app$/, '')
    .replace(/-web$/, '')
    .replace(/-frontend$/, '')
    .replace(/-client$/, '');
  
  // PascalCase
  return cleaned
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Extract entities from Prisma schema
 */
function extractEntitiesFromPrisma(schema: PrismaSchema): Entity[] {
  return schema.models.map(model => ({
    name: model.name,
    source: 'prisma' as const,
    fields: model.fields.map(field => ({
      name: field.name,
      type: field.shepType,
      required: field.required
    }))
  }));
}

/**
 * Extract views from React components
 */
function extractViewsFromComponents(components: ReactComponent[], entities: Entity[]): View[] {
  const views: View[] = [];

  // Only process pages (not regular components)
  const pages = components.filter(c => c.type === 'page');

  for (const page of pages) {
    const view: View = {
      name: sanitizeViewName(page.name),
      filePath: page.filePath,
      widgets: []
    };

    // Extract widgets from JSX elements
    for (const element of page.elements) {
      if (element.kind === 'list' && element.mapEntityHint) {
        // Match list to entity
        const entity = findEntityByName(element.mapEntityHint, entities);
        view.widgets.push({
          kind: 'list',
          entityName: entity?.name || element.mapEntityHint
        });
      } else if (element.kind === 'button' && element.text) {
        // Infer action name from button text
        const actionName = inferActionName(element.text);
        view.widgets.push({
          kind: 'button',
          label: element.text,
          actionName
        });
      } else if (element.kind === 'form') {
        view.widgets.push({
          kind: 'form',
          actionName: 'HandleFormSubmit' // Generic, will be refined in wizard
        });
      }
    }

    views.push(view);
  }

  return views;
}

/**
 * Extract actions from components
 */
function extractActionsFromComponents(components: ReactComponent[], entities: Entity[]): Action[] {
  const actions: Action[] = [];
  const seenActions = new Set<string>();

  for (const component of components) {
    // Extract from handlers
    for (const handler of component.handlers) {
      if (!seenActions.has(handler.name)) {
        const action: Action = {
          name: pascalCase(handler.name),
          source: 'handler',
          parameters: [], // Will be inferred from API calls
          apiCalls: [],
          todos: []
        };

        // Find API calls made by this handler
        const handlerCalls = component.apiCalls.filter(
          call => call.inHandler === handler.name
        );
        
        action.apiCalls = handlerCalls.map(call => ({
          method: call.method,
          path: call.path
        }));

        // Infer parameters from API path or method
        if (action.apiCalls.length > 0) {
          const firstCall = action.apiCalls[0];
          if (firstCall.method === 'POST' || firstCall.method === 'PUT') {
            // Infer entity from path
            const entity = inferEntityFromAPIPath(firstCall.path, entities);
            if (entity) {
              action.parameters = entity.fields.map(f => f.name);
            } else {
              action.todos.push('TODO: Define parameters for this action');
            }
          }
        }

        actions.push(action);
        seenActions.add(handler.name);
      }
    }

    // Extract from API calls (without explicit handlers)
    for (const apiCall of component.apiCalls) {
      if (!apiCall.inHandler) {
        const actionName = inferActionNameFromAPICall(apiCall);
        if (!seenActions.has(actionName)) {
          actions.push({
            name: actionName,
            source: 'api-route',
            parameters: [],
            apiCalls: [{
              method: apiCall.method,
              path: apiCall.path
            }],
            todos: ['TODO: Define parameters and logic for this action']
          });
          seenActions.add(actionName);
        }
      }
    }
  }

  return actions;
}

/**
 * Infer missing entities from views (e.g., lists without Prisma models)
 */
function inferMissingEntities(appModel: AppModel) {
  for (const view of appModel.views) {
    for (const widget of view.widgets) {
      if (widget.kind === 'list' && widget.entityName) {
        const exists = appModel.entities.some(e => e.name === widget.entityName);
        if (!exists) {
          appModel.entities.push({
            name: widget.entityName,
            source: 'inferred',
            fields: [
              { name: 'id', type: 'text', required: true },
              { name: 'name', type: 'text', required: true }
            ]
          });
          appModel.todos.push(`TODO: Define fields for inferred entity "${widget.entityName}"`);
        }
      }
    }
  }
}

/**
 * Find entity by name (fuzzy match)
 */
function findEntityByName(name: string, entities: Entity[]): Entity | undefined {
  // Exact match
  const exact = entities.find(e => e.name.toLowerCase() === name.toLowerCase());
  if (exact) return exact;

  // Plural/singular match
  const singular = name.endsWith('s') ? name.slice(0, -1) : name;
  const plural = name.endsWith('s') ? name : name + 's';
  
  return entities.find(e => 
    e.name.toLowerCase() === singular.toLowerCase() ||
    e.name.toLowerCase() === plural.toLowerCase()
  );
}

/**
 * Sanitize view name (remove 'Page', 'View' suffixes, PascalCase)
 */
function sanitizeViewName(name: string): string {
  let cleaned = name
    .replace(/Page$/, '')
    .replace(/View$/, '')
    .replace(/Component$/, '');
  
  return pascalCase(cleaned);
}

/**
 * Infer action name from button text
 */
function inferActionName(buttonText: string): string {
  // Common patterns
  const patterns = [
    { regex: /add|create|new/i, prefix: 'Create' },
    { regex: /edit|update|modify/i, prefix: 'Update' },
    { regex: /delete|remove/i, prefix: 'Delete' },
    { regex: /view|show|see/i, prefix: 'View' },
    { regex: /submit|save/i, prefix: 'Submit' },
    { regex: /cancel/i, prefix: 'Cancel' }
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(buttonText)) {
      return pattern.prefix + 'Entity';
    }
  }

  // Fallback: clean up button text
  return pascalCase(buttonText);
}

/**
 * Infer action name from API call
 */
function inferActionNameFromAPICall(apiCall: { method: string; path: string }): string {
  const pathParts = apiCall.path.split('/').filter(p => p && !p.startsWith(':'));
  const resource = pathParts[pathParts.length - 1] || 'Item';
  const resourceSingular = resource.endsWith('s') ? resource.slice(0, -1) : resource;

  const methodMap: Record<string, string> = {
    'GET': 'Load',
    'POST': 'Create',
    'PUT': 'Update',
    'PATCH': 'Update',
    'DELETE': 'Delete'
  };

  const verb = methodMap[apiCall.method] || 'Handle';
  return verb + pascalCase(resourceSingular);
}

/**
 * Infer entity from API path
 */
function inferEntityFromAPIPath(apiPath: string, entities: Entity[]): Entity | undefined {
  const pathParts = apiPath.split('/').filter(p => p && !p.startsWith(':'));
  const resource = pathParts[pathParts.length - 1];
  
  if (!resource) return undefined;
  
  return findEntityByName(resource, entities);
}

/**
 * Convert string to PascalCase
 */
function pascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(w => w)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}
