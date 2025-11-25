/**
 * Import Analysis Aggregator for Slice 6
 * 
 * Combines outputs from all parsers into a unified ImportAnalysis
 * that can be displayed in the wizard panel.
 */

import {
  ImportAnalysis,
  DetectedItem,
  EntityDetails,
  ViewDetails,
  ActionDetails,
  RouteDetails
} from '../types/ImportWizard';
import { Entity } from '../types/Entity';
import { ReactComponent } from '../parsers/reactParser';
import { ProjectMapping, ShepLangAction, ShepLangView } from '../types/ViewAction';
import { APIRoute, APIRouteParseResult } from '../types/APIRoute';

let itemIdCounter = 0;

/**
 * Generate a unique item ID
 */
function generateId(prefix: string): string {
  return `${prefix}_${++itemIdCounter}`;
}

/**
 * Reset ID counter (for testing)
 */
export function resetIdCounter(): void {
  itemIdCounter = 0;
}

/**
 * Aggregate all parser results into ImportAnalysis
 */
export function aggregateAnalysis(
  projectName: string,
  projectRoot: string,
  entities: Entity[],
  components: ReactComponent[],
  projectMapping: ProjectMapping,
  routeResult: APIRouteParseResult
): ImportAnalysis {
  const warnings: string[] = [];
  
  // Convert entities
  const detectedEntities = entities.map(entity => entityToDetectedItem(entity));
  
  // Convert views
  const detectedViews = projectMapping.views.map(view => 
    viewToDetectedItem(view, components)
  );
  
  // Convert actions
  const detectedActions = projectMapping.actions.map(action => 
    actionToDetectedItem(action, routeResult.routes)
  );
  
  // Convert routes
  const detectedRoutes = routeResult.routes.map(route => 
    routeToDetectedItem(route)
  );
  
  // Collect warnings
  warnings.push(...projectMapping.warnings);
  warnings.push(...routeResult.warnings);
  warnings.push(...routeResult.errors);
  
  // Calculate overall confidence
  const allItems = [...detectedEntities, ...detectedViews, ...detectedActions, ...detectedRoutes];
  const overallConfidence = allItems.length > 0
    ? allItems.reduce((sum, item) => sum + item.confidence, 0) / allItems.length
    : 0.5;
  
  return {
    projectName,
    projectRoot,
    entities: detectedEntities,
    views: detectedViews,
    actions: detectedActions,
    routes: detectedRoutes,
    confidence: overallConfidence,
    warnings,
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Convert Entity to DetectedItem
 */
function entityToDetectedItem(entity: Entity): DetectedItem {
  // Higher confidence for entities with more fields and relations
  const fieldScore = Math.min(entity.fields.length / 5, 1) * 0.4;
  const relationScore = Math.min((entity.relations?.length || 0) / 2, 1) * 0.2;
  const baseConfidence = 0.4; // Base for having an entity at all
  
  const confidence = Math.min(baseConfidence + fieldScore + relationScore, 1);
  
  const details: EntityDetails = {
    kind: 'entity',
    fields: entity.fields.map(f => ({
      name: f.name,
      type: f.type,
      required: f.required
    })),
    relations: entity.relations?.map(r => ({
      name: r.name,
      target: r.target,
      type: r.type
    }))
  };
  
  return {
    id: generateId('entity'),
    originalName: entity.name,
    displayName: entity.name,
    type: 'entity',
    enabled: true,
    confidence,
    source: 'Prisma schema',
    details
  };
}

/**
 * Convert ShepLangView to DetectedItem
 */
function viewToDetectedItem(
  view: ShepLangView,
  components: ReactComponent[]
): DetectedItem {
  // Find matching component for source info
  const component = components.find(c => c.name === view.name);
  const source = component?.filePath || 'Component analysis';
  
  // Calculate confidence based on widgets and bindings
  const widgetScore = Math.min(view.widgets.length / 5, 1) * 0.3;
  const bindingScore = Math.min(view.bindings.length / 2, 1) * 0.2;
  const typeScore = view.kind === 'page' ? 0.2 : 0.1; // Pages more confident
  const baseConfidence = 0.3;
  
  const confidence = Math.min(baseConfidence + widgetScore + bindingScore + typeScore, 1);
  
  const details: ViewDetails = {
    kind: 'view',
    viewType: view.kind,
    route: view.route,
    widgets: view.widgets.map(w => w.type),
    bindings: view.bindings.map(b => `${b.variable}: ${b.entity}`)
  };
  
  return {
    id: generateId('view'),
    originalName: view.name,
    displayName: view.name,
    type: 'view',
    enabled: true,
    confidence,
    source,
    details
  };
}

/**
 * Convert ShepLangAction to DetectedItem
 */
function actionToDetectedItem(
  action: ShepLangAction,
  routes: APIRoute[]
): DetectedItem {
  // Find matching API route
  const matchingRoute = findMatchingRoute(action, routes);
  
  // Calculate confidence
  const opsScore = Math.min(action.operations.length / 3, 1) * 0.3;
  const routeScore = matchingRoute ? 0.3 : 0;
  const baseConfidence = 0.3;
  
  const confidence = Math.min(baseConfidence + opsScore + routeScore, 1);
  
  const details: ActionDetails = {
    kind: 'action',
    trigger: action.trigger,
    operations: action.operations.map(op => op.kind),
    apiEndpoint: matchingRoute?.path,
    method: matchingRoute?.method
  };
  
  return {
    id: generateId('action'),
    originalName: action.name,
    displayName: action.name,
    type: 'action',
    enabled: true,
    confidence,
    source: action.sourceHandler ? `Handler: ${action.sourceHandler}` : 'Action analysis',
    details
  };
}

/**
 * Find API route matching an action
 */
function findMatchingRoute(action: ShepLangAction, routes: APIRoute[]): APIRoute | undefined {
  // Look for call/load operations that reference an endpoint
  for (const op of action.operations) {
    if (op.kind === 'call' || op.kind === 'load') {
      const endpoint = op.endpoint;
      if (endpoint) {
        // Find matching route
        return routes.find(r => 
          r.path === endpoint || 
          endpoint.includes(r.path.split(':')[0]) // Handle dynamic params
        );
      }
    }
  }
  return undefined;
}

/**
 * Convert APIRoute to DetectedItem
 */
function routeToDetectedItem(route: APIRoute): DetectedItem {
  // Higher confidence for routes with Prisma operations
  const prismaScore = route.prismaOperation ? 0.3 : 0;
  const bodyScore = route.bodyFields.length > 0 ? 0.1 : 0;
  const paramsScore = route.params.length > 0 ? 0.1 : 0;
  const baseConfidence = 0.5;
  
  const confidence = Math.min(baseConfidence + prismaScore + bodyScore + paramsScore, 1);
  
  const details: RouteDetails = {
    kind: 'route',
    method: route.method,
    path: route.path,
    prismaOperation: route.prismaOperation,
    prismaModel: route.prismaModel,
    bodyFields: route.bodyFields
  };
  
  return {
    id: generateId('route'),
    originalName: `${route.method} ${route.path}`,
    displayName: `${route.method} ${route.path}`,
    type: 'route',
    enabled: true,
    confidence,
    source: route.filePath,
    details
  };
}

/**
 * Create empty analysis for projects with no detected items
 */
export function createEmptyAnalysis(
  projectName: string,
  projectRoot: string
): ImportAnalysis {
  return {
    projectName,
    projectRoot,
    entities: [],
    views: [],
    actions: [],
    routes: [],
    confidence: 0,
    warnings: ['No items detected - project may need manual configuration'],
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Get summary counts for display
 */
export function getAnalysisSummary(analysis: ImportAnalysis): {
  totalItems: number;
  entities: number;
  views: number;
  actions: number;
  routes: number;
  enabledItems: number;
} {
  const allItems = [
    ...analysis.entities,
    ...analysis.views,
    ...analysis.actions,
    ...analysis.routes
  ];
  
  return {
    totalItems: allItems.length,
    entities: analysis.entities.length,
    views: analysis.views.length,
    actions: analysis.actions.length,
    routes: analysis.routes.length,
    enabledItems: allItems.filter(i => i.enabled).length
  };
}

/**
 * Filter analysis to only enabled items
 */
export function filterEnabledItems(analysis: ImportAnalysis): ImportAnalysis {
  return {
    ...analysis,
    entities: analysis.entities.filter(e => e.enabled),
    views: analysis.views.filter(v => v.enabled),
    actions: analysis.actions.filter(a => a.enabled),
    routes: analysis.routes.filter(r => r.enabled)
  };
}
