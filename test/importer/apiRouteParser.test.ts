/**
 * Slice 5 Tests – API Route Parser
 * 
 * Tests the Next.js App Router route handler parsing:
 * - HTTP method handler extraction
 * - Dynamic route parameters
 * - Prisma operation detection
 * - Request body field extraction
 */

import { describe, it, expect } from 'vitest';
import { 
  parseRouteFile,
  parseAPIRoutes,
  extractRoutePath,
  extractRouteParams
} from '../../extension/src/parsers/apiRouteParser';
import * as path from 'path';

describe('API Route Parser – Slice 5', () => {
  const fixturesDir = path.join(__dirname, '../../test-import-fixtures');
  const nextjsFixture = path.join(fixturesDir, 'nextjs-prisma');
  
  describe('parseRouteFile', () => {
    it('parses GET handler with Prisma findMany', () => {
      const routePath = path.join(nextjsFixture, 'app', 'api', 'tasks', 'route.ts');
      const routes = parseRouteFile(routePath);
      
      // Should find GET handler
      const getRoute = routes.find(r => r.method === 'GET');
      expect(getRoute).toBeDefined();
      expect(getRoute!.path).toBe('/api/tasks');
      expect(getRoute!.prismaOperation).toBe('findMany');
      expect(getRoute!.prismaModel).toBe('task');
      expect(getRoute!.returnsJson).toBe(true);
    });
    
    it('parses POST handler with Prisma create', () => {
      const routePath = path.join(nextjsFixture, 'app', 'api', 'tasks', 'route.ts');
      const routes = parseRouteFile(routePath);
      
      // Should find POST handler
      const postRoute = routes.find(r => r.method === 'POST');
      expect(postRoute).toBeDefined();
      expect(postRoute!.path).toBe('/api/tasks');
      expect(postRoute!.prismaOperation).toBe('create');
      expect(postRoute!.bodyFields).toContain('title');
      expect(postRoute!.bodyFields).toContain('priority');
    });
    
    it('parses dynamic route segment [id]', () => {
      const routePath = path.join(nextjsFixture, 'app', 'api', 'tasks', '[id]', 'route.ts');
      const routes = parseRouteFile(routePath);
      
      // Should have dynamic parameter
      expect(routes.length).toBeGreaterThan(0);
      const route = routes[0];
      expect(route.params).toHaveLength(1);
      expect(route.params[0].name).toBe('id');
      expect(route.params[0].isCatchAll).toBe(false);
    });
    
    it('parses PUT handler with Prisma update', () => {
      const routePath = path.join(nextjsFixture, 'app', 'api', 'tasks', '[id]', 'route.ts');
      const routes = parseRouteFile(routePath);
      
      const putRoute = routes.find(r => r.method === 'PUT');
      expect(putRoute).toBeDefined();
      expect(putRoute!.prismaOperation).toBe('update');
      expect(putRoute!.path).toBe('/api/tasks/:id');
    });
    
    it('parses DELETE handler with Prisma delete', () => {
      const routePath = path.join(nextjsFixture, 'app', 'api', 'tasks', '[id]', 'route.ts');
      const routes = parseRouteFile(routePath);
      
      const deleteRoute = routes.find(r => r.method === 'DELETE');
      expect(deleteRoute).toBeDefined();
      expect(deleteRoute!.prismaOperation).toBe('delete');
    });
    
    it('handles multiple methods in same route file', () => {
      const routePath = path.join(nextjsFixture, 'app', 'api', 'tasks', 'route.ts');
      const routes = parseRouteFile(routePath);
      
      // Should find both GET and POST
      expect(routes.length).toBeGreaterThanOrEqual(2);
      expect(routes.map(r => r.method)).toContain('GET');
      expect(routes.map(r => r.method)).toContain('POST');
    });
  });
  
  describe('extractRoutePath', () => {
    it('converts [id] to :id', () => {
      const filePath = '/app/api/tasks/[id]/route.ts';
      const routePath = extractRoutePath(filePath);
      expect(routePath).toBe('/api/tasks/:id');
    });
    
    it('handles nested dynamic segments', () => {
      const filePath = '/app/api/users/[userId]/posts/[postId]/route.ts';
      const routePath = extractRoutePath(filePath);
      expect(routePath).toBe('/api/users/:userId/posts/:postId');
    });
    
    it('handles root api route', () => {
      const filePath = '/app/api/route.ts';
      const routePath = extractRoutePath(filePath);
      expect(routePath).toBe('/api');
    });
    
    it('handles catch-all routes [...slug]', () => {
      const filePath = '/app/api/files/[...path]/route.ts';
      const routePath = extractRoutePath(filePath);
      expect(routePath).toBe('/api/files/:path+');
    });
    
    it('handles optional catch-all [[...slug]]', () => {
      const filePath = '/app/api/docs/[[...slug]]/route.ts';
      const routePath = extractRoutePath(filePath);
      expect(routePath).toBe('/api/docs/:slug*');
    });
  });
  
  describe('extractRouteParams', () => {
    it('extracts single parameter', () => {
      const filePath = '/app/api/tasks/[id]/route.ts';
      const params = extractRouteParams(filePath);
      
      expect(params).toHaveLength(1);
      expect(params[0].name).toBe('id');
      expect(params[0].isCatchAll).toBe(false);
      expect(params[0].isOptional).toBe(false);
    });
    
    it('extracts multiple parameters', () => {
      const filePath = '/app/api/users/[userId]/posts/[postId]/route.ts';
      const params = extractRouteParams(filePath);
      
      expect(params).toHaveLength(2);
      expect(params[0].name).toBe('userId');
      expect(params[1].name).toBe('postId');
    });
    
    it('identifies catch-all parameters', () => {
      const filePath = '/app/api/files/[...path]/route.ts';
      const params = extractRouteParams(filePath);
      
      expect(params).toHaveLength(1);
      expect(params[0].name).toBe('path');
      expect(params[0].isCatchAll).toBe(true);
      expect(params[0].isOptional).toBe(false);
    });
    
    it('identifies optional catch-all parameters', () => {
      const filePath = '/app/api/docs/[[...slug]]/route.ts';
      const params = extractRouteParams(filePath);
      
      expect(params).toHaveLength(1);
      expect(params[0].name).toBe('slug');
      expect(params[0].isCatchAll).toBe(true);
      expect(params[0].isOptional).toBe(true);
    });
  });
  
  describe('parseAPIRoutes (full project)', () => {
    it('parses all routes in nextjs-prisma fixture', () => {
      const result = parseAPIRoutes(nextjsFixture);
      
      // Should find routes without errors
      expect(result.errors).toHaveLength(0);
      
      // Should find at least 5 routes (GET, POST for /tasks, GET, PUT, DELETE for /tasks/:id)
      expect(result.routes.length).toBeGreaterThanOrEqual(5);
      
      // Verify routes are properly structured
      for (const route of result.routes) {
        expect(route.path).toMatch(/^\/api\//);
        expect(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).toContain(route.method);
        expect(route.filePath).toBeTruthy();
      }
    });
    
    it('returns warning for missing api directory', () => {
      const result = parseAPIRoutes(path.join(fixturesDir, 'plain-react'));
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('api');
    });
  });
});
