import { describe, it, expect } from 'vitest';
import { transpile } from '../src/transpiler.js';
import type { AppModel } from '@goldensheepai/sheplang-language';

describe('Phase 1: Production Code Generation', () => {
  const todoApp: AppModel = {
    name: 'MyTodos',
    datas: [
      {
        name: 'Todo',
        fields: [
          { name: 'title', type: 'text', constraints: [] },
          { name: 'done', type: 'yes/no', constraints: [] }
        ],
        rules: ['user can update own items']
      }
    ],
    views: [
      {
        name: 'Dashboard',
        list: 'Todo',
        buttons: [
          { label: 'Add Task', action: 'CreateTodo' }
        ]
      }
    ],
    actions: [
      {
        name: 'CreateTodo',
        params: [{ name: 'title' }],
        ops: [
          {
            kind: 'add',
            data: 'Todo',
            fields: { title: 'title', done: 'false' }
          },
          {
            kind: 'show',
            view: 'Dashboard'
          }
        ]
      }
    ]
  };

  describe('React Component Generation', () => {
    it('should generate React components with .tsx extension', () => {
      const result = transpile(todoApp);
      const dashboardView = result.files.find(f => f.path === 'views/Dashboard.tsx');
      
      expect(dashboardView).toBeDefined();
      expect(dashboardView?.content).toContain('import { useState, useEffect } from \'react\';');
    });

    it('should include useState for data management', () => {
      const result = transpile(todoApp);
      const dashboardView = result.files.find(f => f.path === 'views/Dashboard.tsx');
      
      expect(dashboardView?.content).toContain('useState<Todo[]>([])');
      expect(dashboardView?.content).toContain('setTodos');
    });

    it('should include useEffect for data loading', () => {
      const result = transpile(todoApp);
      const dashboardView = result.files.find(f => f.path === 'views/Dashboard.tsx');
      
      expect(dashboardView?.content).toContain('useEffect');
      expect(dashboardView?.content).toContain('fetch(\'/api/todos\')');
    });

    it('should generate JSX with proper structure', () => {
      const result = transpile(todoApp);
      const dashboardView = result.files.find(f => f.path === 'views/Dashboard.tsx');
      
      expect(dashboardView?.content).toContain('return (');
      expect(dashboardView?.content).toContain('<div className="container mx-auto p-4">');
      expect(dashboardView?.content).toContain('</div>');
    });

    it('should include Tailwind CSS classes', () => {
      const result = transpile(todoApp);
      const dashboardView = result.files.find(f => f.path === 'views/Dashboard.tsx');
      
      expect(dashboardView?.content).toContain('className=');
      expect(dashboardView?.content).toContain('bg-blue-600');
      expect(dashboardView?.content).toContain('text-white');
    });

    it('should generate button handlers', () => {
      const result = transpile(todoApp);
      const dashboardView = result.files.find(f => f.path === 'views/Dashboard.tsx');
      
      expect(dashboardView?.content).toContain('const handleCreateTodo');
      expect(dashboardView?.content).toContain('onClick={() => handleCreateTodo()}');
    });

    it('should map entities to list items', () => {
      const result = transpile(todoApp);
      const dashboardView = result.files.find(f => f.path === 'views/Dashboard.tsx');
      
      expect(dashboardView?.content).toContain('todos.map((item) =>');
      expect(dashboardView?.content).toContain('<li key={item.id');
    });
  });

  describe('Action Generation', () => {
    it('should generate async functions', () => {
      const result = transpile(todoApp);
      const createTodoAction = result.files.find(f => f.path === 'actions/CreateTodo.ts');
      
      expect(createTodoAction).toBeDefined();
      expect(createTodoAction?.content).toContain('export async function CreateTodo');
    });

    it('should include proper type imports', () => {
      const result = transpile(todoApp);
      const createTodoAction = result.files.find(f => f.path === 'actions/CreateTodo.ts');
      
      expect(createTodoAction?.content).toContain('import type { Todo } from \'../models/Todo\';');
    });

    it('should generate fetch calls for entity creation', () => {
      const result = transpile(todoApp);
      const createTodoAction = result.files.find(f => f.path === 'actions/CreateTodo.ts');
      
      expect(createTodoAction?.content).toContain('fetch(\'/api/todos\', {');
      expect(createTodoAction?.content).toContain('method: \'POST\'');
      expect(createTodoAction?.content).toContain('headers: { \'Content-Type\': \'application/json\' }');
    });

    it('should include navigation redirects', () => {
      const result = transpile(todoApp);
      const createTodoAction = result.files.find(f => f.path === 'actions/CreateTodo.ts');
      
      expect(createTodoAction?.content).toContain('return { redirect:');
      expect(createTodoAction?.content).toContain('/dashboard');
    });

    it('should pass parameters correctly', () => {
      const result = transpile(todoApp);
      const createTodoAction = result.files.find(f => f.path === 'actions/CreateTodo.ts');
      
      expect(createTodoAction?.content).toContain('title: title');
    });

    it('should handle literal values', () => {
      const result = transpile(todoApp);
      const createTodoAction = result.files.find(f => f.path === 'actions/CreateTodo.ts');
      
      expect(createTodoAction?.content).toContain('done: "false"');
    });
  });

  describe('Model Generation', () => {
    it('should generate TypeScript interfaces', () => {
      const result = transpile(todoApp);
      const todoModel = result.files.find(f => f.path === 'models/Todo.ts');
      
      expect(todoModel).toBeDefined();
      expect(todoModel?.content).toContain('export interface Todo {');
    });

    it('should include id field', () => {
      const result = transpile(todoApp);
      const todoModel = result.files.find(f => f.path === 'models/Todo.ts');
      
      expect(todoModel?.content).toContain('id?: string;');
    });

    it('should map ShepLang types to TypeScript types', () => {
      const result = transpile(todoApp);
      const todoModel = result.files.find(f => f.path === 'models/Todo.ts');
      
      expect(todoModel?.content).toContain('title: string;');
      expect(todoModel?.content).toContain('done: boolean;');
    });

    it('should preserve rules as comments', () => {
      const result = transpile(todoApp);
      const todoModel = result.files.find(f => f.path === 'models/Todo.ts');
      
      expect(todoModel?.content).toContain('// rules:');
      expect(todoModel?.content).toContain('// - user can update own items');
    });
  });

  describe('Prisma Schema Generation', () => {
    it('should generate Prisma schema file', () => {
      const result = transpile(todoApp);
      const prismaSchema = result.files.find(f => f.path === 'prisma/schema.prisma');
      
      expect(prismaSchema).toBeDefined();
    });

    it('should include generator and datasource config', () => {
      const result = transpile(todoApp);
      const prismaSchema = result.files.find(f => f.path === 'prisma/schema.prisma');
      
      expect(prismaSchema?.content).toContain('generator client {');
      expect(prismaSchema?.content).toContain('provider = "prisma-client-js"');
      expect(prismaSchema?.content).toContain('datasource db {');
      expect(prismaSchema?.content).toContain('provider = "postgresql"');
    });

    it('should generate model definitions', () => {
      const result = transpile(todoApp);
      const prismaSchema = result.files.find(f => f.path === 'prisma/schema.prisma');
      
      expect(prismaSchema?.content).toContain('model Todo {');
    });

    it('should include id with uuid default', () => {
      const result = transpile(todoApp);
      const prismaSchema = result.files.find(f => f.path === 'prisma/schema.prisma');
      
      expect(prismaSchema?.content).toContain('id     String @id @default(uuid())');
    });

    it('should map ShepLang types to Prisma types', () => {
      const result = transpile(todoApp);
      const prismaSchema = result.files.find(f => f.path === 'prisma/schema.prisma');
      
      expect(prismaSchema?.content).toContain('title String');
      expect(prismaSchema?.content).toContain('done Boolean');
    });

    it('should include createdAt and updatedAt timestamps', () => {
      const result = transpile(todoApp);
      const prismaSchema = result.files.find(f => f.path === 'prisma/schema.prisma');
      
      expect(prismaSchema?.content).toContain('createdAt DateTime @default(now())');
      expect(prismaSchema?.content).toContain('updatedAt DateTime @updatedAt');
    });
  });

  describe('API Route Generation', () => {
    it('should generate API route files', () => {
      const result = transpile(todoApp);
      const todoRoutes = result.files.find(f => f.path === 'api/routes/todos.ts');
      
      expect(todoRoutes).toBeDefined();
    });

    it('should import Express and Prisma', () => {
      const result = transpile(todoApp);
      const todoRoutes = result.files.find(f => f.path === 'api/routes/todos.ts');
      
      expect(todoRoutes?.content).toContain('import { Router } from \'express\';');
      expect(todoRoutes?.content).toContain('import { PrismaClient } from \'@prisma/client\';');
    });

    it('should generate GET all route', () => {
      const result = transpile(todoApp);
      const todoRoutes = result.files.find(f => f.path === 'api/routes/todos.ts');
      
      expect(todoRoutes?.content).toContain('router.get(\'/\', async (req, res) =>');
      expect(todoRoutes?.content).toContain('prisma.todo.findMany');
    });

    it('should generate GET by ID route', () => {
      const result = transpile(todoApp);
      const todoRoutes = result.files.find(f => f.path === 'api/routes/todos.ts');
      
      expect(todoRoutes?.content).toContain('router.get(\'/:id\', async (req, res) =>');
      expect(todoRoutes?.content).toContain('prisma.todo.findUnique');
    });

    it('should generate POST create route', () => {
      const result = transpile(todoApp);
      const todoRoutes = result.files.find(f => f.path === 'api/routes/todos.ts');
      
      expect(todoRoutes?.content).toContain('router.post(\'/\', async (req, res) =>');
      expect(todoRoutes?.content).toContain('prisma.todo.create');
    });

    it('should generate PUT update route', () => {
      const result = transpile(todoApp);
      const todoRoutes = result.files.find(f => f.path === 'api/routes/todos.ts');
      
      expect(todoRoutes?.content).toContain('router.put(\'/:id\', async (req, res) =>');
      expect(todoRoutes?.content).toContain('prisma.todo.update');
    });

    it('should generate DELETE route', () => {
      const result = transpile(todoApp);
      const todoRoutes = result.files.find(f => f.path === 'api/routes/todos.ts');
      
      expect(todoRoutes?.content).toContain('router.delete(\'/:id\', async (req, res) =>');
      expect(todoRoutes?.content).toContain('prisma.todo.delete');
    });

    it('should include error handling', () => {
      const result = transpile(todoApp);
      const todoRoutes = result.files.find(f => f.path === 'api/routes/todos.ts');
      
      expect(todoRoutes?.content).toContain('try {');
      expect(todoRoutes?.content).toContain('catch (error)');
      expect(todoRoutes?.content).toContain('res.status(500)');
    });

    it('should export router', () => {
      const result = transpile(todoApp);
      const todoRoutes = result.files.find(f => f.path === 'api/routes/todos.ts');
      
      expect(todoRoutes?.content).toContain('export default router;');
    });
  });

  describe('API Server Generation', () => {
    it('should generate server.ts file', () => {
      const result = transpile(todoApp);
      const server = result.files.find(f => f.path === 'api/server.ts');
      
      expect(server).toBeDefined();
    });

    it('should import Express and middleware', () => {
      const result = transpile(todoApp);
      const server = result.files.find(f => f.path === 'api/server.ts');
      
      expect(server?.content).toContain('import express from \'express\';');
      expect(server?.content).toContain('import cors from \'cors\';');
    });

    it('should import all route files', () => {
      const result = transpile(todoApp);
      const server = result.files.find(f => f.path === 'api/server.ts');
      
      expect(server?.content).toContain('import todosRoutes from \'./routes/todos\';');
    });

    it('should configure middleware', () => {
      const result = transpile(todoApp);
      const server = result.files.find(f => f.path === 'api/server.ts');
      
      expect(server?.content).toContain('app.use(cors())');
      expect(server?.content).toContain('app.use(express.json())');
    });

    it('should mount route handlers', () => {
      const result = transpile(todoApp);
      const server = result.files.find(f => f.path === 'api/server.ts');
      
      expect(server?.content).toContain('app.use(\'/api/todos\', todosRoutes)');
    });

    it('should include health check endpoint', () => {
      const result = transpile(todoApp);
      const server = result.files.find(f => f.path === 'api/server.ts');
      
      expect(server?.content).toContain('app.get(\'/health\'');
      expect(server?.content).toContain('status: \'ok\'');
    });

    it('should start server on port', () => {
      const result = transpile(todoApp);
      const server = result.files.find(f => f.path === 'api/server.ts');
      
      expect(server?.content).toContain('app.listen(PORT');
      expect(server?.content).toContain('PORT = process.env.PORT || 3001');
    });
  });

  describe('Package.json Generation', () => {
    it('should generate package.json', () => {
      const result = transpile(todoApp);
      const pkg = result.files.find(f => f.path === 'package.json');
      
      expect(pkg).toBeDefined();
    });

    it('should be valid JSON', () => {
      const result = transpile(todoApp);
      const pkg = result.files.find(f => f.path === 'package.json');
      
      expect(() => JSON.parse(pkg!.content)).not.toThrow();
    });

    it('should include required dependencies', () => {
      const result = transpile(todoApp);
      const pkg = result.files.find(f => f.path === 'package.json');
      const pkgJson = JSON.parse(pkg!.content);
      
      expect(pkgJson.dependencies).toHaveProperty('@prisma/client');
      expect(pkgJson.dependencies).toHaveProperty('express');
      expect(pkgJson.dependencies).toHaveProperty('cors');
    });

    it('should include dev dependencies', () => {
      const result = transpile(todoApp);
      const pkg = result.files.find(f => f.path === 'package.json');
      const pkgJson = JSON.parse(pkg!.content);
      
      expect(pkgJson.devDependencies).toHaveProperty('prisma');
      expect(pkgJson.devDependencies).toHaveProperty('typescript');
      expect(pkgJson.devDependencies).toHaveProperty('@types/express');
    });

    it('should include npm scripts', () => {
      const result = transpile(todoApp);
      const pkg = result.files.find(f => f.path === 'package.json');
      const pkgJson = JSON.parse(pkg!.content);
      
      expect(pkgJson.scripts).toHaveProperty('dev');
      expect(pkgJson.scripts).toHaveProperty('build');
      expect(pkgJson.scripts).toHaveProperty('start');
      expect(pkgJson.scripts).toHaveProperty('postinstall');
    });
  });

  describe('Integration Tests', () => {
    it('should generate all expected files', () => {
      const result = transpile(todoApp);
      const expectedFiles = [
        'tsconfig.json',
        'models/Todo.ts',
        'prisma/schema.prisma',
        'actions/CreateTodo.ts',
        'views/Dashboard.tsx',
        'api/routes/todos.ts',
        'api/server.ts',
        'package.json',
        'index.ts'
      ];
      
      expectedFiles.forEach(file => {
        expect(result.files.some(f => f.path === file)).toBe(true);
      });
    });

    it('should generate code without syntax errors', () => {
      const result = transpile(todoApp);
      
      // Check that generated code doesn't have obvious syntax errors
      result.files.forEach(file => {
        expect(file.content).not.toContain('undefined');
        expect(file.content.trim()).not.toBe('');
        expect(file.content).not.toContain('[object Object]');
      });
    });

    it('should maintain consistent entity names across files', () => {
      const result = transpile(todoApp);
      
      const todoModel = result.files.find(f => f.path === 'models/Todo.ts');
      const todoRoutes = result.files.find(f => f.path === 'api/routes/todos.ts');
      const dashboard = result.files.find(f => f.path === 'views/Dashboard.tsx');
      
      expect(todoModel?.content).toContain('interface Todo');
      expect(todoRoutes?.content).toContain('prisma.todo');
      expect(dashboard?.content).toContain('Todo[]');
    });
  });
});
