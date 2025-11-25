/**
 * Backend Correlator for Slice 5
 * 
 * Correlates frontend API calls (from React components) with
 * backend route handlers (from Next.js route.ts files).
 * 
 * This enables:
 * - Validation that frontend calls have matching backends
 * - Automatic ShepLang call/load generation
 * - ShepThon stub generation from correlated routes
 */

import { APICall } from './reactParser';
import { APIRoute, APICorrelation, EndpointMatch, HTTPMethod } from '../types/APIRoute';

/**
 * Correlate frontend API calls with backend routes
 */
export function correlateAPICalls(
  frontendCalls: FrontendCall[],
  backendRoutes: APIRoute[]
): APICorrelation {
  const matches: EndpointMatch[] = [];
  const matchedFrontend = new Set<number>();
  const matchedBackend = new Set<number>();

  // Try to match each frontend call to a backend route
  for (let i = 0; i < frontendCalls.length; i++) {
    const call = frontendCalls[i];
    let bestMatch: { route: APIRoute; confidence: number; warnings: string[] } | null = null;

    for (let j = 0; j < backendRoutes.length; j++) {
      const route = backendRoutes[j];
      const matchResult = matchEndpoint(call, route);

      if (matchResult.confidence > 0) {
        if (!bestMatch || matchResult.confidence > bestMatch.confidence) {
          bestMatch = { route, ...matchResult };
        }
      }
    }

    if (bestMatch) {
      matches.push({
        frontendCall: call,
        backendRoute: bestMatch.route,
        confidence: bestMatch.confidence,
        warnings: bestMatch.warnings
      });
      matchedFrontend.add(i);
      
      // Find and mark the matched backend route
      const backendIdx = backendRoutes.findIndex(r => 
        r.path === bestMatch!.route.path && r.method === bestMatch!.route.method
      );
      if (backendIdx >= 0) {
        matchedBackend.add(backendIdx);
      }
    }
  }

  // Collect unmatched calls and routes
  const unmatchedFrontend = frontendCalls.filter((_, i) => !matchedFrontend.has(i));
  const unmatchedBackend = backendRoutes.filter((_, i) => !matchedBackend.has(i));

  // Calculate overall confidence
  const confidence = frontendCalls.length > 0
    ? matches.reduce((sum, m) => sum + m.confidence, 0) / frontendCalls.length
    : 1.0;

  return {
    frontendCalls,
    backendRoutes,
    matches,
    unmatchedFrontend,
    unmatchedBackend,
    confidence
  };
}

/**
 * Extended frontend call with source information
 */
export interface FrontendCall {
  url: string;
  method: string;
  body?: any;
  sourceComponent: string;
  sourceHandler: string;
}

/**
 * Convert APICall from reactParser to FrontendCall
 */
export function toFrontendCall(
  apiCall: APICall,
  componentName: string,
  handlerName: string
): FrontendCall {
  return {
    url: apiCall.url,
    method: apiCall.method.toUpperCase(),
    body: apiCall.body,
    sourceComponent: componentName,
    sourceHandler: handlerName
  };
}

/**
 * Match a frontend call to a backend route
 */
function matchEndpoint(
  call: FrontendCall,
  route: APIRoute
): { confidence: number; warnings: string[] } {
  const warnings: string[] = [];
  let confidence = 0;

  // Check method match
  const callMethod = call.method.toUpperCase() as HTTPMethod;
  if (callMethod !== route.method) {
    return { confidence: 0, warnings: ['Method mismatch'] };
  }

  // Check path match
  const pathMatch = matchPath(call.url, route.path);
  if (!pathMatch.matches) {
    return { confidence: 0, warnings: ['Path mismatch'] };
  }

  // Base confidence for method + path match
  confidence = 0.7;

  // Boost confidence for exact path match
  if (pathMatch.exact) {
    confidence += 0.2;
  }

  // Check for body fields match (for POST/PUT/PATCH)
  if (['POST', 'PUT', 'PATCH'].includes(callMethod)) {
    if (route.bodyFields.length > 0) {
      // Body fields defined in backend
      confidence += 0.1;
    } else {
      warnings.push('Backend expects body but fields not detected');
    }
  }

  return { confidence: Math.min(confidence, 1.0), warnings };
}

interface PathMatchResult {
  matches: boolean;
  exact: boolean;
  params: Record<string, string>;
}

/**
 * Match a frontend URL path to a backend route path
 * 
 * Frontend: /api/tasks/123
 * Backend:  /api/tasks/:id
 */
function matchPath(frontendUrl: string, backendPath: string): PathMatchResult {
  // Normalize URLs
  const frontendClean = normalizePath(frontendUrl);
  const backendClean = normalizePath(backendPath);

  // Exact match
  if (frontendClean === backendClean) {
    return { matches: true, exact: true, params: {} };
  }

  // Split into segments
  const frontendSegments = frontendClean.split('/').filter(Boolean);
  const backendSegments = backendClean.split('/').filter(Boolean);

  // Length check (allow catch-all to have fewer segments)
  const hasCatchAll = backendSegments.some(s => s.endsWith('+') || s.endsWith('*'));
  if (!hasCatchAll && frontendSegments.length !== backendSegments.length) {
    return { matches: false, exact: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < backendSegments.length; i++) {
    const backendSeg = backendSegments[i];
    const frontendSeg = frontendSegments[i];

    // Catch-all segment
    if (backendSeg.endsWith('+') || backendSeg.endsWith('*')) {
      const paramName = backendSeg.slice(1, -1);
      params[paramName] = frontendSegments.slice(i).join('/');
      return { matches: true, exact: false, params };
    }

    // Dynamic segment (e.g., :id)
    if (backendSeg.startsWith(':')) {
      const paramName = backendSeg.slice(1);
      if (frontendSeg) {
        params[paramName] = frontendSeg;
      }
      continue;
    }

    // Static segment must match exactly
    if (frontendSeg !== backendSeg) {
      return { matches: false, exact: false, params: {} };
    }
  }

  return { matches: true, exact: false, params };
}

/**
 * Normalize a URL path for comparison
 */
function normalizePath(urlPath: string): string {
  // Remove quotes
  let cleaned = urlPath.replace(/['"]/g, '');
  
  // Remove template literal markers
  cleaned = cleaned.replace(/`/g, '');
  
  // Handle template strings like `/api/tasks/${id}`
  // Convert to parameter format /api/tasks/:param
  cleaned = cleaned.replace(/\$\{[^}]+\}/g, ':param');
  
  // Remove query strings
  cleaned = cleaned.split('?')[0];
  
  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  
  // Ensure leading slash
  if (!cleaned.startsWith('/')) {
    cleaned = '/' + cleaned;
  }

  return cleaned;
}

/**
 * Extract all frontend API calls from parsed components
 */
export function extractAllAPICalls(
  components: { name: string; apiCalls: APICall[]; handlers: { function: string }[] }[]
): FrontendCall[] {
  const calls: FrontendCall[] = [];

  for (const component of components) {
    for (const apiCall of component.apiCalls) {
      calls.push({
        url: apiCall.url,
        method: apiCall.method.toUpperCase(),
        body: apiCall.body,
        sourceComponent: component.name,
        sourceHandler: component.handlers[0]?.function || 'unknown'
      });
    }
  }

  return calls;
}

/**
 * Generate correlation summary for debugging
 */
export function summarizeCorrelation(correlation: APICorrelation): string {
  const lines: string[] = [];

  lines.push(`API Correlation Summary:`);
  lines.push(`  Frontend calls: ${correlation.frontendCalls.length}`);
  lines.push(`  Backend routes: ${correlation.backendRoutes.length}`);
  lines.push(`  Matched: ${correlation.matches.length}`);
  lines.push(`  Overall confidence: ${(correlation.confidence * 100).toFixed(1)}%`);

  if (correlation.matches.length > 0) {
    lines.push('');
    lines.push('Matches:');
    for (const match of correlation.matches) {
      lines.push(`  ${match.frontendCall.method} ${match.frontendCall.url}`);
      lines.push(`    -> ${match.backendRoute.method} ${match.backendRoute.path}`);
      lines.push(`    Confidence: ${(match.confidence * 100).toFixed(0)}%`);
      if (match.warnings.length > 0) {
        lines.push(`    Warnings: ${match.warnings.join(', ')}`);
      }
    }
  }

  if (correlation.unmatchedFrontend.length > 0) {
    lines.push('');
    lines.push('Unmatched frontend calls:');
    for (const call of correlation.unmatchedFrontend) {
      lines.push(`  ${call.method} ${call.url} (${call.sourceComponent})`);
    }
  }

  if (correlation.unmatchedBackend.length > 0) {
    lines.push('');
    lines.push('Unmatched backend routes:');
    for (const route of correlation.unmatchedBackend) {
      lines.push(`  ${route.method} ${route.path}`);
    }
  }

  return lines.join('\n');
}
