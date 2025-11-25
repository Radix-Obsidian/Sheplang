/**
 * Slice 5 Tests – Backend Correlator
 * 
 * Tests correlation between frontend API calls and backend routes:
 * - Path matching (exact and dynamic)
 * - Method matching
 * - Confidence scoring
 * - Unmatched detection
 */

import { describe, it, expect } from 'vitest';
import { 
  correlateAPICalls,
  FrontendCall,
  summarizeCorrelation
} from '../../extension/src/parsers/backendCorrelator';
import { APIRoute } from '../../extension/src/types/APIRoute';

describe('Backend Correlator – Slice 5', () => {
  // Sample backend routes (simulating parsed routes)
  const sampleRoutes: APIRoute[] = [
    {
      path: '/api/tasks',
      method: 'GET',
      filePath: 'app/api/tasks/route.ts',
      handlerName: 'GET',
      params: [],
      prismaOperation: 'findMany',
      prismaModel: 'task',
      bodyFields: [],
      returnsJson: true
    },
    {
      path: '/api/tasks',
      method: 'POST',
      filePath: 'app/api/tasks/route.ts',
      handlerName: 'POST',
      params: [],
      prismaOperation: 'create',
      prismaModel: 'task',
      bodyFields: ['title', 'priority'],
      returnsJson: true
    },
    {
      path: '/api/tasks/:id',
      method: 'PUT',
      filePath: 'app/api/tasks/[id]/route.ts',
      handlerName: 'PUT',
      params: [{ name: 'id', segment: '[id]', isCatchAll: false, isOptional: false }],
      prismaOperation: 'update',
      prismaModel: 'task',
      bodyFields: ['title', 'completed'],
      returnsJson: true
    },
    {
      path: '/api/tasks/:id',
      method: 'DELETE',
      filePath: 'app/api/tasks/[id]/route.ts',
      handlerName: 'DELETE',
      params: [{ name: 'id', segment: '[id]', isCatchAll: false, isOptional: false }],
      prismaOperation: 'delete',
      prismaModel: 'task',
      bodyFields: [],
      returnsJson: false
    }
  ];

  describe('correlateAPICalls', () => {
    it('matches exact path GET call', () => {
      const frontendCalls: FrontendCall[] = [{
        url: '/api/tasks',
        method: 'GET',
        sourceComponent: 'TaskList',
        sourceHandler: 'handleRefresh'
      }];

      const result = correlateAPICalls(frontendCalls, sampleRoutes);

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].backendRoute.method).toBe('GET');
      expect(result.matches[0].backendRoute.path).toBe('/api/tasks');
      expect(result.matches[0].confidence).toBeGreaterThan(0.8);
    });

    it('matches POST call with body', () => {
      const frontendCalls: FrontendCall[] = [{
        url: '/api/tasks',
        method: 'POST',
        body: { title: 'Test', priority: 'high' },
        sourceComponent: 'TaskList',
        sourceHandler: 'handleAddTask'
      }];

      const result = correlateAPICalls(frontendCalls, sampleRoutes);

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].backendRoute.method).toBe('POST');
      expect(result.matches[0].confidence).toBeGreaterThan(0.7);
    });

    it('matches dynamic path parameter', () => {
      const frontendCalls: FrontendCall[] = [{
        url: '/api/tasks/123',
        method: 'PUT',
        sourceComponent: 'TaskList',
        sourceHandler: 'handleUpdate'
      }];

      const result = correlateAPICalls(frontendCalls, sampleRoutes);

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].backendRoute.path).toBe('/api/tasks/:id');
      expect(result.matches[0].backendRoute.method).toBe('PUT');
    });

    it('matches template literal URL', () => {
      const frontendCalls: FrontendCall[] = [{
        url: '`/api/tasks/${id}`',
        method: 'DELETE',
        sourceComponent: 'TaskList',
        sourceHandler: 'handleDelete'
      }];

      const result = correlateAPICalls(frontendCalls, sampleRoutes);

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].backendRoute.method).toBe('DELETE');
    });

    it('detects unmatched frontend calls', () => {
      const frontendCalls: FrontendCall[] = [{
        url: '/api/users',
        method: 'GET',
        sourceComponent: 'UserList',
        sourceHandler: 'handleLoad'
      }];

      const result = correlateAPICalls(frontendCalls, sampleRoutes);

      expect(result.matches).toHaveLength(0);
      expect(result.unmatchedFrontend).toHaveLength(1);
      expect(result.unmatchedFrontend[0].url).toBe('/api/users');
    });

    it('detects unmatched backend routes', () => {
      const frontendCalls: FrontendCall[] = [{
        url: '/api/tasks',
        method: 'GET',
        sourceComponent: 'TaskList',
        sourceHandler: 'handleLoad'
      }];

      const result = correlateAPICalls(frontendCalls, sampleRoutes);

      // POST, PUT, DELETE routes should be unmatched
      expect(result.unmatchedBackend.length).toBeGreaterThan(0);
    });

    it('does not match wrong HTTP method', () => {
      const frontendCalls: FrontendCall[] = [{
        url: '/api/tasks',
        method: 'DELETE',  // No DELETE on /api/tasks (only on /api/tasks/:id)
        sourceComponent: 'TaskList',
        sourceHandler: 'handleBadDelete'
      }];

      const result = correlateAPICalls(frontendCalls, sampleRoutes);

      expect(result.matches).toHaveLength(0);
      expect(result.unmatchedFrontend).toHaveLength(1);
    });

    it('calculates overall confidence', () => {
      const frontendCalls: FrontendCall[] = [
        {
          url: '/api/tasks',
          method: 'GET',
          sourceComponent: 'TaskList',
          sourceHandler: 'handleLoad'
        },
        {
          url: '/api/tasks',
          method: 'POST',
          sourceComponent: 'TaskList',
          sourceHandler: 'handleAdd'
        }
      ];

      const result = correlateAPICalls(frontendCalls, sampleRoutes);

      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });

    it('handles empty inputs gracefully', () => {
      const emptyResult = correlateAPICalls([], []);
      expect(emptyResult.matches).toHaveLength(0);
      expect(emptyResult.confidence).toBe(1.0);  // No calls = 100% matched

      const noBackend = correlateAPICalls([{
        url: '/api/test',
        method: 'GET',
        sourceComponent: 'Test',
        sourceHandler: 'test'
      }], []);
      expect(noBackend.matches).toHaveLength(0);
      expect(noBackend.unmatchedFrontend).toHaveLength(1);
    });
  });

  describe('summarizeCorrelation', () => {
    it('generates readable summary', () => {
      const frontendCalls: FrontendCall[] = [
        {
          url: '/api/tasks',
          method: 'GET',
          sourceComponent: 'TaskList',
          sourceHandler: 'handleLoad'
        }
      ];

      const result = correlateAPICalls(frontendCalls, sampleRoutes);
      const summary = summarizeCorrelation(result);

      expect(summary).toContain('Frontend calls: 1');
      expect(summary).toContain('Backend routes: 4');
      expect(summary).toContain('Matched: 1');
      expect(summary).toContain('GET /api/tasks');
    });
  });
});
