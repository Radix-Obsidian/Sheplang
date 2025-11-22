import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseShep } from '@goldensheepai/sheplang-language';
import { transpile } from '../src/transpiler.js';

describe('Phase 1 Integration Test', () => {
  it('should generate production-ready code from todo.shep example', async () => {
    // Read the actual todo.shep example
    const todoShep = readFileSync(
      join(__dirname, '../../../examples/todo.shep'),
      'utf-8'
    );

    // Parse it
    const parseResult = await parseShep(todoShep, 'todo.shep');
    expect(parseResult.success).toBe(true);
    expect(parseResult.diagnostics.filter(d => d.severity === 'error')).toHaveLength(0);

    // Transpile it
    const result = transpile(parseResult.appModel);
    expect(result.appName).toBe('MyTodos');

    // Verify all expected files are generated
    const filePaths = result.files.map(f => f.path);
    
    // TypeScript config
    expect(filePaths).toContain('tsconfig.json');
    
    // Models
    expect(filePaths).toContain('models/Todo.ts');
    expect(filePaths).toContain('prisma/schema.prisma');
    
    // Views
    expect(filePaths).toContain('views/Dashboard.tsx');
    
    // Actions
    expect(filePaths).toContain('actions/CreateTodo.ts');
    
    // API
    expect(filePaths).toContain('api/routes/todos.ts');
    expect(filePaths).toContain('api/server.ts');
    
    // Package
    expect(filePaths).toContain('package.json');
    
    // Index
    expect(filePaths).toContain('index.ts');
  });

  it('should generate valid React component with hooks', async () => {
    const todoShep = readFileSync(
      join(__dirname, '../../../examples/todo.shep'),
      'utf-8'
    );

    const parseResult = await parseShep(todoShep, 'todo.shep');
    const result = transpile(parseResult.appModel);
    
    const dashboardView = result.files.find(f => f.path === 'views/Dashboard.tsx');
    expect(dashboardView).toBeDefined();
    
    const content = dashboardView!.content;
    
    // Check for React imports
    expect(content).toContain("import { useState, useEffect } from 'react';");
    
    // Check for state management
    expect(content).toContain('useState');
    expect(content).toContain('setTodos');
    
    // Check for API call
    expect(content).toContain("fetch('/api/todos')");
    
    // Check for JSX return
    expect(content).toContain('return (');
    expect(content).toContain('</div>');
    
    // Check for Tailwind classes
    expect(content).toContain('className=');
    
    // Should not contain console.log placeholders
    expect(content).not.toContain('console.log("List Todo');
  });

  it('should generate valid Express routes with Prisma', async () => {
    const todoShep = readFileSync(
      join(__dirname, '../../../examples/todo.shep'),
      'utf-8'
    );

    const parseResult = await parseShep(todoShep, 'todo.shep');
    const result = transpile(parseResult.appModel);
    
    const todosRoute = result.files.find(f => f.path === 'api/routes/todos.ts');
    expect(todosRoute).toBeDefined();
    
    const content = todosRoute!.content;
    
    // Check for Express imports
    expect(content).toContain("import { Router } from 'express';");
    expect(content).toContain("import { PrismaClient } from '@prisma/client';");
    
    // Check for CRUD routes
    expect(content).toContain("router.get('/'");
    expect(content).toContain("router.get('/:id'");
    expect(content).toContain("router.post('/'");
    expect(content).toContain("router.put('/:id'");
    expect(content).toContain("router.delete('/:id'");
    
    // Check for Prisma calls
    expect(content).toContain('prisma.todo.findMany');
    expect(content).toContain('prisma.todo.findUnique');
    expect(content).toContain('prisma.todo.create');
    expect(content).toContain('prisma.todo.update');
    expect(content).toContain('prisma.todo.delete');
    
    // Check for error handling
    expect(content).toContain('try {');
    expect(content).toContain('catch (error)');
  });

  it('should generate valid Prisma schema', async () => {
    const todoShep = readFileSync(
      join(__dirname, '../../../examples/todo.shep'),
      'utf-8'
    );

    const parseResult = await parseShep(todoShep, 'todo.shep');
    const result = transpile(parseResult.appModel);
    
    const prismaSchema = result.files.find(f => f.path === 'prisma/schema.prisma');
    expect(prismaSchema).toBeDefined();
    
    const content = prismaSchema!.content;
    
    // Check for generator config
    expect(content).toContain('generator client {');
    expect(content).toContain('provider = "prisma-client-js"');
    
    // Check for datasource config
    expect(content).toContain('datasource db {');
    expect(content).toContain('provider = "postgresql"');
    expect(content).toContain('url      = env("DATABASE_URL")');
    
    // Check for model definition
    expect(content).toContain('model Todo {');
    expect(content).toContain('id     String @id @default(uuid())');
    expect(content).toContain('title String');
    expect(content).toContain('done Boolean');
    expect(content).toContain('createdAt DateTime @default(now())');
    expect(content).toContain('updatedAt DateTime @updatedAt');
  });

  it('should generate valid package.json with all dependencies', async () => {
    const todoShep = readFileSync(
      join(__dirname, '../../../examples/todo.shep'),
      'utf-8'
    );

    const parseResult = await parseShep(todoShep, 'todo.shep');
    const result = transpile(parseResult.appModel);
    
    const pkg = result.files.find(f => f.path === 'package.json');
    expect(pkg).toBeDefined();
    
    const pkgJson = JSON.parse(pkg!.content);
    
    // Check basic fields
    expect(pkgJson.name).toBe('mytodos-api');
    expect(pkgJson.version).toBe('1.0.0');
    
    // Check scripts
    expect(pkgJson.scripts).toHaveProperty('dev');
    expect(pkgJson.scripts).toHaveProperty('build');
    expect(pkgJson.scripts).toHaveProperty('start');
    expect(pkgJson.scripts).toHaveProperty('postinstall');
    
    // Check dependencies
    expect(pkgJson.dependencies).toHaveProperty('@prisma/client');
    expect(pkgJson.dependencies).toHaveProperty('express');
    expect(pkgJson.dependencies).toHaveProperty('cors');
    
    // Check devDependencies
    expect(pkgJson.devDependencies).toHaveProperty('prisma');
    expect(pkgJson.devDependencies).toHaveProperty('typescript');
    expect(pkgJson.devDependencies).toHaveProperty('@types/express');
    expect(pkgJson.devDependencies).toHaveProperty('@types/cors');
  });

  it('should generate action with proper API calls', async () => {
    const todoShep = readFileSync(
      join(__dirname, '../../../examples/todo.shep'),
      'utf-8'
    );

    const parseResult = await parseShep(todoShep, 'todo.shep');
    const result = transpile(parseResult.appModel);
    
    const createTodo = result.files.find(f => f.path === 'actions/CreateTodo.ts');
    expect(createTodo).toBeDefined();
    
    const content = createTodo!.content;
    
    // Check for type imports
    expect(content).toContain("import type { Todo } from '../models/Todo';");
    
    // Check for fetch call
    expect(content).toContain("fetch('/api/todos', {");
    expect(content).toContain("method: 'POST'");
    expect(content).toContain("headers: { 'Content-Type': 'application/json' }");
    
    // Check for parameter handling
    expect(content).toContain('title: title');
    
    // Check for navigation
    expect(content).toContain("return { redirect: '/dashboard' }");
    
    // Should not contain console.log placeholders
    expect(content).not.toContain('console.log("db.create"');
  });
});
