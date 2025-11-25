/**
 * API Route Parser for Slice 5
 * 
 * Parses Next.js App Router route handlers (route.ts files) to extract:
 * - HTTP method handlers (GET, POST, PUT, DELETE, etc.)
 * - Dynamic route parameters ([id], [...slug])
 * - Prisma operations (findMany, create, update, delete)
 * - Request body field extraction
 * 
 * Reference: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import {
  APIRoute,
  APIRouteParseResult,
  HTTPMethod,
  PrismaOperation,
  RouteParam
} from '../types/APIRoute';

/** Valid HTTP methods per Next.js App Router */
const HTTP_METHODS: HTTPMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

/**
 * Parse a single route.ts file to extract API route handlers
 */
export function parseRouteFile(filePath: string, basePath: string = '/api'): APIRoute[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const routes: APIRoute[] = [];
  const routePath = extractRoutePath(filePath, basePath);
  const routeParams = extractRouteParams(filePath);

  // Find exported functions matching HTTP methods
  ts.forEachChild(sourceFile, (node) => {
    const methodHandler = extractMethodHandler(node, sourceFile);
    if (methodHandler) {
      const route: APIRoute = {
        path: routePath,
        method: methodHandler.method,
        filePath,
        handlerName: methodHandler.name,
        params: routeParams,
        prismaOperation: methodHandler.prismaOperation,
        prismaModel: methodHandler.prismaModel,
        bodyFields: methodHandler.bodyFields,
        returnsJson: methodHandler.returnsJson,
        statusCode: methodHandler.statusCode
      };
      routes.push(route);
    }
  });

  return routes;
}

/**
 * Parse all route.ts files in a directory tree
 */
export function parseAPIRoutes(projectRoot: string): APIRouteParseResult {
  const routes: APIRoute[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Find all route.ts files under app/api/
  const apiDir = path.join(projectRoot, 'app', 'api');
  if (!fs.existsSync(apiDir)) {
    warnings.push('No app/api directory found');
    return { routes, errors, warnings };
  }

  const routeFiles = findRouteFiles(apiDir);
  
  for (const routeFile of routeFiles) {
    try {
      const fileRoutes = parseRouteFile(routeFile, '/api');
      routes.push(...fileRoutes);
    } catch (error) {
      errors.push(`Failed to parse ${routeFile}: ${error}`);
    }
  }

  if (routes.length === 0) {
    warnings.push('No API route handlers found');
  }

  return { routes, errors, warnings };
}

/**
 * Recursively find all route.ts/route.js files
 */
function findRouteFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...findRouteFiles(fullPath));
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract the API route path from file path
 * e.g., app/api/tasks/[id]/route.ts -> /api/tasks/:id
 */
export function extractRoutePath(filePath: string, basePath: string = '/api'): string {
  // Normalize to forward slashes
  const normalized = filePath.replace(/\\/g, '/');
  
  // Find the api/ segment and extract path after it
  const apiMatch = normalized.match(/\/api\/(.*)\/route\.(ts|js)$/);
  if (apiMatch) {
    const pathSegment = apiMatch[1];
    // Convert [param] to :param
    const converted = pathSegment
      .split('/')
      .map(segment => {
        // Handle catch-all routes [...slug] and [[...slug]]
        if (segment.startsWith('[[...') && segment.endsWith(']]')) {
          return ':' + segment.slice(5, -2) + '*';
        }
        if (segment.startsWith('[...') && segment.endsWith(']')) {
          return ':' + segment.slice(4, -1) + '+';
        }
        // Handle regular dynamic segments [id]
        if (segment.startsWith('[') && segment.endsWith(']')) {
          return ':' + segment.slice(1, -1);
        }
        return segment;
      })
      .join('/');
    
    return `${basePath}/${converted}`;
  }
  
  // Root api route: app/api/route.ts -> /api
  if (normalized.endsWith('/api/route.ts') || normalized.endsWith('/api/route.js')) {
    return basePath;
  }

  return basePath;
}

/**
 * Extract route parameters from file path
 */
export function extractRouteParams(filePath: string): RouteParam[] {
  const params: RouteParam[] = [];
  const normalized = filePath.replace(/\\/g, '/');
  
  // Match all dynamic segments
  const segments = normalized.split('/');
  
  for (const segment of segments) {
    // Optional catch-all [[...slug]]
    if (segment.startsWith('[[...') && segment.endsWith(']]')) {
      params.push({
        name: segment.slice(5, -2),
        segment,
        isCatchAll: true,
        isOptional: true
      });
    }
    // Catch-all [...slug]
    else if (segment.startsWith('[...') && segment.endsWith(']')) {
      params.push({
        name: segment.slice(4, -1),
        segment,
        isCatchAll: true,
        isOptional: false
      });
    }
    // Regular dynamic segment [id]
    else if (segment.startsWith('[') && segment.endsWith(']')) {
      params.push({
        name: segment.slice(1, -1),
        segment,
        isCatchAll: false,
        isOptional: false
      });
    }
  }

  return params;
}

interface HandlerInfo {
  name: string;
  method: HTTPMethod;
  prismaOperation?: PrismaOperation;
  prismaModel?: string;
  bodyFields: string[];
  returnsJson: boolean;
  statusCode?: number;
}

/**
 * Extract HTTP method handler from AST node
 */
function extractMethodHandler(node: ts.Node, sourceFile: ts.SourceFile): HandlerInfo | null {
  // Check for exported function declaration: export async function GET()
  if (ts.isFunctionDeclaration(node) && node.name) {
    const name = node.name.text;
    if (HTTP_METHODS.includes(name as HTTPMethod) && isExported(node)) {
      return analyzeHandler(node, name as HTTPMethod, sourceFile);
    }
  }

  // Check for exported variable: export const GET = async () => {}
  if (ts.isVariableStatement(node) && isExported(node)) {
    const declaration = node.declarationList.declarations[0];
    if (declaration && ts.isIdentifier(declaration.name)) {
      const name = declaration.name.text;
      if (HTTP_METHODS.includes(name as HTTPMethod)) {
        if (declaration.initializer && 
            (ts.isArrowFunction(declaration.initializer) || 
             ts.isFunctionExpression(declaration.initializer))) {
          return analyzeHandler(declaration.initializer, name as HTTPMethod, sourceFile);
        }
      }
    }
  }

  return null;
}

/**
 * Check if a node has export modifier
 */
function isExported(node: ts.Node): boolean {
  if (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) {
    return node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
  }
  return false;
}

/**
 * Analyze handler body for Prisma operations and other details
 */
function analyzeHandler(
  node: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression,
  method: HTTPMethod,
  sourceFile: ts.SourceFile
): HandlerInfo {
  const info: HandlerInfo = {
    name: method,
    method,
    bodyFields: [],
    returnsJson: false
  };

  if (!node.body) {
    return info;
  }

  // Track variables assigned from request.json() for two-step destructuring
  const bodyVariables = new Set<string>();

  // First pass: find request.json() assignments
  const findBodyVars = (n: ts.Node) => {
    // Pattern: const body = await request.json()
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) {
      if (n.initializer && ts.isAwaitExpression(n.initializer)) {
        const awaitExpr = n.initializer;
        if (ts.isCallExpression(awaitExpr.expression)) {
          const callExpr = awaitExpr.expression;
          if (ts.isPropertyAccessExpression(callExpr.expression)) {
            if (callExpr.expression.name.text === 'json') {
              bodyVariables.add(n.name.text);
            }
          }
        }
      }
    }
    ts.forEachChild(n, findBodyVars);
  };
  findBodyVars(node.body);

  // Visit all nodes in the function body
  const visit = (n: ts.Node) => {
    // Look for Prisma operations: prisma.model.operation()
    if (ts.isCallExpression(n)) {
      const prismaInfo = extractPrismaOperation(n, sourceFile);
      if (prismaInfo) {
        info.prismaOperation = prismaInfo.operation;
        info.prismaModel = prismaInfo.model;
      }

      // Check for Response.json() calls
      if (ts.isPropertyAccessExpression(n.expression)) {
        const text = n.expression.getText(sourceFile);
        if (text === 'Response.json') {
          info.returnsJson = true;
        }
      }
    }

    // Pattern 1: Direct destructuring from request.json()
    // const { title, priority } = await request.json()
    if (ts.isAwaitExpression(n) && ts.isCallExpression(n.expression)) {
      const callExpr = n.expression;
      if (ts.isPropertyAccessExpression(callExpr.expression)) {
        const propAccess = callExpr.expression;
        if (propAccess.name.text === 'json') {
          const parent = n.parent;
          if (ts.isVariableDeclaration(parent) && ts.isObjectBindingPattern(parent.name)) {
            parent.name.elements.forEach(element => {
              if (ts.isBindingElement(element) && element.name && ts.isIdentifier(element.name)) {
                info.bodyFields.push(element.name.text);
              }
            });
          }
        }
      }
    }

    // Pattern 2: Two-step destructuring
    // const body = await request.json()
    // const { title, priority } = body
    if (ts.isVariableDeclaration(n) && ts.isObjectBindingPattern(n.name)) {
      if (n.initializer && ts.isIdentifier(n.initializer)) {
        const varName = n.initializer.text;
        if (bodyVariables.has(varName)) {
          n.name.elements.forEach(element => {
            if (ts.isBindingElement(element) && element.name && ts.isIdentifier(element.name)) {
              info.bodyFields.push(element.name.text);
            }
          });
        }
      }
    }

    // Look for explicit status codes in Response constructor
    if (ts.isNewExpression(n) || ts.isCallExpression(n)) {
      const text = n.getText(sourceFile);
      const statusMatch = text.match(/status:\s*(\d+)/);
      if (statusMatch) {
        info.statusCode = parseInt(statusMatch[1]);
      }
    }

    ts.forEachChild(n, visit);
  };

  visit(node.body);

  return info;
}

interface PrismaInfo {
  operation: PrismaOperation;
  model: string;
}

/**
 * Extract Prisma operation from a call expression
 * Matches patterns like: prisma.task.findMany()
 */
function extractPrismaOperation(
  node: ts.CallExpression,
  sourceFile: ts.SourceFile
): PrismaInfo | null {
  // Check for prisma.model.operation() pattern
  if (!ts.isPropertyAccessExpression(node.expression)) {
    return null;
  }

  const propAccess = node.expression;
  const operationName = propAccess.name.text;

  // Check if this is a valid Prisma operation
  const prismaOps: PrismaOperation[] = [
    'findMany', 'findUnique', 'findFirst',
    'create', 'createMany',
    'update', 'updateMany',
    'delete', 'deleteMany',
    'upsert'
  ];

  if (!prismaOps.includes(operationName as PrismaOperation)) {
    return null;
  }

  // Check for prisma.model pattern
  if (ts.isPropertyAccessExpression(propAccess.expression)) {
    const modelAccess = propAccess.expression;
    // Check if the object is likely "prisma"
    if (ts.isIdentifier(modelAccess.expression)) {
      const objName = modelAccess.expression.text.toLowerCase();
      if (objName === 'prisma' || objName.includes('prisma')) {
        return {
          operation: operationName as PrismaOperation,
          model: modelAccess.name.text
        };
      }
    }
  }

  return null;
}

/**
 * Generate a summary of parsed routes for debugging
 */
export function summarizeRoutes(result: APIRouteParseResult): string {
  const lines: string[] = [];
  
  lines.push(`Found ${result.routes.length} API routes:`);
  
  for (const route of result.routes) {
    const prismaInfo = route.prismaOperation 
      ? ` (${route.prismaModel}.${route.prismaOperation})`
      : '';
    lines.push(`  ${route.method} ${route.path}${prismaInfo}`);
  }

  if (result.warnings.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    result.warnings.forEach(w => lines.push(`  - ${w}`));
  }

  if (result.errors.length > 0) {
    lines.push('');
    lines.push('Errors:');
    result.errors.forEach(e => lines.push(`  - ${e}`));
  }

  return lines.join('\n');
}
