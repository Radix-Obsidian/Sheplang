/**
 * Phase 3-02: Extract API endpoints from CallStmt and LoadStmt
 * Analyzes actions to find all API calls and generates backend endpoints
 */

import type { AppModel, Statement } from '@goldensheepai/sheplang-language';

/**
 * Represents an API endpoint extracted from CallStmt/LoadStmt
 */
export interface ExtractedEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  fields: string[];
  actionName: string;
  hasPathParams: boolean;
  pathParams: string[];
}

/**
 * Extract unique API endpoints from all actions in the app
 */
export function extractEndpoints(app: AppModel): ExtractedEndpoint[] {
  const endpoints: ExtractedEndpoint[] = [];
  const seen = new Set<string>();

  // Iterate through all actions
  for (const action of app.actions) {
    // Check each operation in the action
    for (const op of action.ops) {
      if (op.kind === 'call' || op.kind === 'load') {
        const endpoint = extractEndpointFromStatement(op, action.name);
        
        // Create unique key for deduplication
        const key = `${endpoint.method} ${endpoint.path}`;
        
        if (!seen.has(key)) {
          seen.add(key);
          endpoints.push(endpoint);
        }
      }
    }
  }

  return endpoints;
}

/**
 * Extract endpoint details from a single CallStmt or LoadStmt
 */
function extractEndpointFromStatement(
  stmt: Extract<Statement, { kind: 'call' }> | Extract<Statement, { kind: 'load' }>,
  actionName: string
): ExtractedEndpoint {
  const method = stmt.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  const path = stmt.path;
  const fields = stmt.kind === 'call' ? stmt.fields : [];
  
  // Extract path parameters (e.g., /orders/:id)
  const pathParams = extractPathParameters(path);
  const hasPathParams = pathParams.length > 0;

  return {
    method,
    path,
    fields,
    actionName,
    hasPathParams,
    pathParams
  };
}

/**
 * Extract path parameters from a path string
 * Example: "/orders/:id/items/:itemId" -> ["id", "itemId"]
 */
function extractPathParameters(path: string): string[] {
  const paramRegex = /:(\w+)/g;
  const params: string[] = [];
  let match;

  while ((match = paramRegex.exec(path)) !== null) {
    params.push(match[1]);
  }

  return params;
}

/**
 * Determine the primary data model for an endpoint based on its path
 * Example: "/orders" or "/orders/:id" -> "Order"
 */
export function inferModelFromPath(path: string, app: AppModel): string | null {
  // Remove leading slash and path parameters
  const cleanPath = path.replace(/^\//, '').replace(/\/:.+$/, '');
  
  // Try to match with plural data model names
  for (const data of app.datas) {
    const pluralName = data.name.toLowerCase() + 's';
    if (cleanPath.toLowerCase() === pluralName) {
      return data.name;
    }
  }

  // Try to match with singular data model names
  for (const data of app.datas) {
    if (cleanPath.toLowerCase() === data.name.toLowerCase()) {
      return data.name;
    }
  }

  return null;
}

/**
 * Group endpoints by their base path for better organization
 * Example: ["/orders", "/orders/:id"] -> { "/orders": [...] }
 */
export function groupEndpointsByBasePath(endpoints: ExtractedEndpoint[]): Map<string, ExtractedEndpoint[]> {
  const groups = new Map<string, ExtractedEndpoint[]>();

  for (const endpoint of endpoints) {
    // Get base path (remove path parameters)
    const basePath = endpoint.path.replace(/\/:.+$/, '') || endpoint.path;
    
    if (!groups.has(basePath)) {
      groups.set(basePath, []);
    }
    
    groups.get(basePath)!.push(endpoint);
  }

  return groups;
}
