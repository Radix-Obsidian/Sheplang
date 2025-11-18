import { describe, it, expect } from 'vitest';
import { checkEndpointValidation } from '../src/passes/endpointValidation.js';
import { parseShepThon } from '../src/solvers/shepthonParser.js';
import { parseShep } from '@sheplang/language';

describe('Endpoint Validation Pass', () => {
  describe('ShepThon Parser', () => {
    it('parses basic model definitions', () => {
      const shepthon = `
model User {
  name: string
  email: string
}
      `;
      
      const result = parseShepThon(shepthon);
      expect(result.models).toHaveLength(1);
      expect(result.models[0].name).toBe('User');
      expect(result.models[0].fields).toHaveLength(2);
      expect(result.models[0].fields[0]).toEqual({ name: 'name', type: 'string' });
    });

    it('parses GET endpoints', () => {
      const shepthon = `
model User {
  name: string
}

GET /users -> db.all("users")
      `;
      
      const result = parseShepThon(shepthon);
      expect(result.endpoints).toHaveLength(1);
      expect(result.endpoints[0]).toEqual({
        method: 'GET',
        path: '/users',
        returnType: { base: 'User', isArray: true }
      });
    });

    it('parses POST endpoints', () => {
      const shepthon = `
POST /users -> db.add("users", body)
      `;
      
      const result = parseShepThon(shepthon);
      expect(result.endpoints).toHaveLength(1);
      expect(result.endpoints[0].method).toBe('POST');
      expect(result.endpoints[0].path).toBe('/users');
    });

    it('parses DELETE endpoints', () => {
      const shepthon = `
DELETE /users/:id -> db.remove("users", id)
      `;
      
      const result = parseShepThon(shepthon);
      expect(result.endpoints).toHaveLength(1);
      expect(result.endpoints[0]).toEqual({
        method: 'DELETE',
        path: '/users/:id',
        params: ['id'],
        returnType: { base: 'void' }
      });
    });

    it('parses multiple endpoints', () => {
      const shepthon = `
model Todo {
  title: string
  done: boolean
}

GET /todos -> db.all("todos")
POST /todos -> db.add("todos", body)
DELETE /todos/:id -> db.remove("todos", id)
      `;
      
      const result = parseShepThon(shepthon);
      expect(result.endpoints).toHaveLength(3);
      expect(result.models).toHaveLength(1);
    });
  });

  describe('Validation', () => {
    it('allows valid call to existing endpoint', async () => {
      const shepthon = `
GET /users -> db.all("users")
      `;
      
      const sheplang = `
app TestApp

action loadUsers():
  call GET "/users"
      `;
      
      const { appModel } = await parseShep(sheplang);
      const backend = parseShepThon(shepthon);
      const diagnostics = checkEndpointValidation(appModel, backend);
      
      const errors = diagnostics.filter(d => d.severity === 'error');
      expect(errors).toHaveLength(0);
    });

    it('detects call to non-existent endpoint', async () => {
      const shepthon = `
GET /users -> db.all("users")
      `;
      
      const sheplang = `
app TestApp

action loadPosts():
  call GET "/posts"
      `;
      
      const { appModel } = await parseShep(sheplang);
      const backend = parseShepThon(shepthon);
      const diagnostics = checkEndpointValidation(appModel, backend);
      
      const errors = diagnostics.filter(d => d.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('Endpoint not found');
      expect(errors[0].message).toContain('GET /posts');
    });

    it('detects method mismatch', async () => {
      const shepthon = `
GET /users -> db.all("users")
      `;
      
      const sheplang = `
app TestApp

action createUser():
  call POST "/users"
      `;
      
      const { appModel } = await parseShep(sheplang);
      const backend = parseShepThon(shepthon);
      const diagnostics = checkEndpointValidation(appModel, backend);
      
      const errors = diagnostics.filter(d => d.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('Endpoint not found');
      expect(errors[0].message).toContain('POST /users');
    });

    it('validates load statements', async () => {
      const shepthon = `
model User {
  name: string
}

GET /users -> db.all("users")
      `;
      
      const sheplang = `
app TestApp

action loadUsers():
  load GET "/users" into users
      `;
      
      const { appModel } = await parseShep(sheplang);
      const backend = parseShepThon(shepthon);
      const diagnostics = checkEndpointValidation(appModel, backend);
      
      const errors = diagnostics.filter(d => d.severity === 'error');
      expect(errors).toHaveLength(0);
    });

    it('detects load from non-GET endpoint', async () => {
      const shepthon = `
POST /users -> db.add("users", body)
      `;
      
      const sheplang = `
app TestApp

action loadUsers():
  load POST "/users" into users
      `;
      
      const { appModel } = await parseShep(sheplang);
      const backend = parseShepThon(shepthon);
      const diagnostics = checkEndpointValidation(appModel, backend);
      
      const warnings = diagnostics.filter(d => d.severity === 'warning');
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].message).toContain('load');
      expect(warnings[0].message).toContain('GET');
    });

    it('provides helpful suggestions for missing endpoints', async () => {
      const shepthon = `
GET /users -> db.all("users")
GET /todos -> db.all("todos")
      `;
      
      const sheplang = `
app TestApp

action loadPosts():
  call GET "/post"
      `;
      
      const { appModel } = await parseShep(sheplang);
      const backend = parseShepThon(shepthon);
      const diagnostics = checkEndpointValidation(appModel, backend);
      
      const errors = diagnostics.filter(d => d.severity === 'error');
      expect(errors[0].suggestion).toBeDefined();
      expect(errors[0].suggestion).toContain('Available GET endpoints');
    });

    it('handles path parameters correctly', async () => {
      const shepthon = `
DELETE /users/:id -> db.remove("users", id)
      `;
      
      const sheplang = `
app TestApp

action deleteUser():
  call DELETE "/users/123"
      `;
      
      const { appModel } = await parseShep(sheplang);
      const backend = parseShepThon(shepthon);
      const diagnostics = checkEndpointValidation(appModel, backend);
      
      const errors = diagnostics.filter(d => d.severity === 'error');
      expect(errors).toHaveLength(0);
    });

    it('warns when no backend file provided', async () => {
      const sheplang = `
app TestApp

action loadUsers():
  call GET "/users"
      `;
      
      const { appModel } = await parseShep(sheplang);
      const backend = { models: [], endpoints: [] };
      const diagnostics = checkEndpointValidation(appModel, backend);
      
      const warnings = diagnostics.filter(d => d.severity === 'warning');
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].message).toContain('No backend defined');
    });
  });

  describe('Integration', () => {
    it('handles complex real-world scenario', async () => {
      const shepthon = `
model Todo {
  title: string
  done: boolean
}

GET /todos -> db.all("todos")
POST /todos -> db.add("todos", body)
DELETE /todos/:id -> db.remove("todos", id)
PUT /todos/:id -> db.update("todos", id, body)
      `;
      
      const sheplang = `
app MyTodos

data Todo:
  fields:
    title: text
    done: yes/no
  rules:
    - "title required"

view Dashboard:
  list Todo
  button "Add" -> CreateTodo

action CreateTodo(title):
  call POST "/todos"
  load GET "/todos" into todos
  show Dashboard

action DeleteTodo(todoId):
  call DELETE "/todos/1"
      `;
      
      const { appModel } = await parseShep(sheplang);
      const backend = parseShepThon(shepthon);
      const diagnostics = checkEndpointValidation(appModel, backend);
      
      const errors = diagnostics.filter(d => d.severity === 'error');
      expect(errors).toHaveLength(0);
    });
  });
});
