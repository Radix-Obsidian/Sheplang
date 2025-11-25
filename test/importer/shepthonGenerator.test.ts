/**
 * Slice 5 Tests – ShepThon Generator
 * 
 * Tests deterministic ShepThon backend generation from:
 * - Parsed API routes
 * - Entity definitions
 * - Prisma operations
 */

import { describe, it, expect } from 'vitest';
import { 
  generateShepThonFromRoutes,
  generateShepLangActions
} from '../../extension/src/generators/shepthonRouteGenerator';
import { APIRoute } from '../../extension/src/types/APIRoute';
import { Entity } from '../../extension/src/types/Entity';

describe('ShepThon Generator – Slice 5', () => {
  // Sample routes for testing
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
      method: 'GET',
      filePath: 'app/api/tasks/[id]/route.ts',
      handlerName: 'GET',
      params: [{ name: 'id', segment: '[id]', isCatchAll: false, isOptional: false }],
      prismaOperation: 'findUnique',
      prismaModel: 'task',
      bodyFields: [],
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
      bodyFields: ['title', 'completed', 'priority'],
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

  // Sample entities
  const sampleEntities: Entity[] = [
    {
      name: 'Task',
      fields: [
        { name: 'id', type: 'number', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'completed', type: 'yes/no', required: true },
        { name: 'priority', type: 'text', required: true },
        { name: 'createdAt', type: 'date', required: true }
      ],
      relations: [],
      enums: []
    }
  ];

  describe('generateShepThonFromRoutes', () => {
    it('generates valid ShepThon file', () => {
      const result = generateShepThonFromRoutes(sampleRoutes, sampleEntities);

      expect(result.filename).toBe('backend.shepthon');
      expect(result.content).toBeTruthy();
      expect(result.models).toContain('tasks');
      expect(result.endpoints.length).toBe(5);
    });

    it('includes header comment', () => {
      const result = generateShepThonFromRoutes(sampleRoutes, sampleEntities);

      expect(result.content).toContain('# Auto-generated ShepThon backend');
      expect(result.content).toContain('Slice 5');
    });

    it('generates model definitions from entities', () => {
      const result = generateShepThonFromRoutes(sampleRoutes, sampleEntities);

      expect(result.content).toContain('model Task {');
      expect(result.content).toContain('title: String');
      expect(result.content).toContain('completed: Boolean');
    });

    it('maps field types correctly', () => {
      const result = generateShepThonFromRoutes(sampleRoutes, sampleEntities);

      // ShepLang types -> ShepThon types
      expect(result.content).toContain('id: Int');      // number -> Int
      expect(result.content).toContain('title: String'); // text -> String
      expect(result.content).toContain('completed: Boolean'); // yes/no -> Boolean
      expect(result.content).toContain('createdAt: DateTime'); // date -> DateTime
    });

    it('generates GET all endpoint', () => {
      const result = generateShepThonFromRoutes(sampleRoutes);

      expect(result.content).toContain('GET /api/tasks -> db.all("tasks")');
    });

    it('generates GET single endpoint with param', () => {
      const result = generateShepThonFromRoutes(sampleRoutes);

      expect(result.content).toContain('GET /api/tasks/:id -> db.get("tasks", params.id)');
    });

    it('generates POST endpoint with body', () => {
      const result = generateShepThonFromRoutes(sampleRoutes);

      expect(result.content).toContain('POST /api/tasks -> db.add("tasks", body)');
    });

    it('generates PUT endpoint with param and body', () => {
      const result = generateShepThonFromRoutes(sampleRoutes);

      expect(result.content).toContain('PUT /api/tasks/:id -> db.update("tasks", params.id, body)');
    });

    it('generates DELETE endpoint with param', () => {
      const result = generateShepThonFromRoutes(sampleRoutes);

      expect(result.content).toContain('DELETE /api/tasks/:id -> db.remove("tasks", params.id)');
    });

    it('handles empty routes gracefully', () => {
      const result = generateShepThonFromRoutes([]);

      expect(result.content).toBeTruthy();
      expect(result.endpoints).toHaveLength(0);
    });

    it('infers model from route when no entities', () => {
      const routesWithoutPrismaModel: APIRoute[] = [{
        path: '/api/users',
        method: 'GET',
        filePath: 'app/api/users/route.ts',
        handlerName: 'GET',
        params: [],
        bodyFields: [],
        returnsJson: true
      }];

      const result = generateShepThonFromRoutes(routesWithoutPrismaModel);

      expect(result.content).toContain('GET /api/users -> db.all("users")');
    });
  });

  describe('generateShepLangActions', () => {
    it('generates load action for GET all', () => {
      const getRoute: APIRoute[] = [{
        path: '/api/tasks',
        method: 'GET',
        filePath: 'route.ts',
        handlerName: 'GET',
        params: [],
        bodyFields: [],
        returnsJson: true
      }];

      const actions = generateShepLangActions(getRoute);

      expect(actions).toHaveLength(1);
      expect(actions[0].name).toBe('LoadTasks');
      expect(actions[0].operations[0]).toContain('load GET "/api/tasks" into tasks');
    });

    it('generates call action for POST', () => {
      const postRoute: APIRoute[] = [{
        path: '/api/tasks',
        method: 'POST',
        filePath: 'route.ts',
        handlerName: 'POST',
        params: [],
        bodyFields: ['title', 'priority'],
        returnsJson: true
      }];

      const actions = generateShepLangActions(postRoute);

      expect(actions).toHaveLength(1);
      expect(actions[0].name).toBe('CreateTask');
      expect(actions[0].operations[0]).toContain('call POST "/api/tasks" with title, priority');
    });

    it('generates call action for PUT', () => {
      const putRoute: APIRoute[] = [{
        path: '/api/tasks/:id',
        method: 'PUT',
        filePath: 'route.ts',
        handlerName: 'PUT',
        params: [{ name: 'id', segment: '[id]', isCatchAll: false, isOptional: false }],
        bodyFields: ['title'],
        returnsJson: true
      }];

      const actions = generateShepLangActions(putRoute);

      expect(actions).toHaveLength(1);
      expect(actions[0].name).toBe('UpdateTask');
      expect(actions[0].operations[0]).toContain('call PUT');
    });

    it('generates call action for DELETE', () => {
      const deleteRoute: APIRoute[] = [{
        path: '/api/tasks/:id',
        method: 'DELETE',
        filePath: 'route.ts',
        handlerName: 'DELETE',
        params: [{ name: 'id', segment: '[id]', isCatchAll: false, isOptional: false }],
        bodyFields: [],
        returnsJson: false
      }];

      const actions = generateShepLangActions(deleteRoute);

      expect(actions).toHaveLength(1);
      expect(actions[0].name).toBe('DeleteTask');
      expect(actions[0].operations[0]).toContain('call DELETE');
    });
  });
});
