import { describe, it, expect } from 'vitest';
import { checkExhaustiveness } from '../src/passes/exhaustiveness.js';
import { parseShep } from '@sheplang/language';

describe('Exhaustiveness Pass', () => {
  describe('Basic Actions', () => {
    it('allows simple actions with show', async () => {
      const code = `
app TestApp

data User:
  fields:
    name: text

action createUser(name):
  add User with name
  show Dashboard

view Dashboard:
  list User
      `;
      
      const { appModel } = await parseShep(code);
      const diagnostics = checkExhaustiveness(appModel);
      
      const warnings = diagnostics.filter(d => d.severity === 'warning');
      expect(warnings).toHaveLength(0);
    });

    it('allows actions without show', async () => {
      const code = `
app TestApp

data User:
  fields:
    name: text

action createUser(name):
  add User with name

view Dashboard:
  list User
      `;
      
      const { appModel } = await parseShep(code);
      const diagnostics = checkExhaustiveness(appModel);
      
      const warnings = diagnostics.filter(d => d.severity === 'warning');
      expect(warnings).toHaveLength(0);
    });

    it('allows empty actions', async () => {
      const code = `
app TestApp

data User:
  fields:
    name: text

action emptyAction():
  show Dashboard

view Dashboard:
  list User
      `;
      
      const { appModel } = await parseShep(code);
      const diagnostics = checkExhaustiveness(appModel);
      
      const errors = diagnostics.filter(d => d.severity === 'error');
      expect(errors).toHaveLength(0);
    });
  });

  describe('Unreachable Code', () => {
    it('detects code after show statement', async () => {
      const code = `
app TestApp

data User:
  fields:
    name: text

action createUser(name):
  add User with name
  show Dashboard
  add User with name="Unreachable"

view Dashboard:
  list User
      `;
      
      const { appModel } = await parseShep(code);
      const diagnostics = checkExhaustiveness(appModel);
      
      const warnings = diagnostics.filter(d => d.severity === 'warning');
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].message.toLowerCase()).toContain('unreachable');
      expect(warnings[0].message).toContain('show');
    });

    it('allows multiple statements before show', async () => {
      const code = `
app TestApp

data User:
  fields:
    name: text
    emailAddress: text

action createUser(name, emailAddress):
  add User with name
  add User with emailAddress
  show Dashboard

view Dashboard:
  list User
      `;
      
      const { appModel } = await parseShep(code);
      const diagnostics = checkExhaustiveness(appModel);
      
      const warnings = diagnostics.filter(d => d.severity === 'warning');
      expect(warnings).toHaveLength(0);
    });

    it('allows actions ending with show', async () => {
      const code = `
app TestApp

data User:
  fields:
    name: text

action showDashboard():
  show Dashboard

view Dashboard:
  list User
      `;
      
      const { appModel } = await parseShep(code);
      const diagnostics = checkExhaustiveness(appModel);
      
      const warnings = diagnostics.filter(d => d.severity === 'warning');
      expect(warnings).toHaveLength(0);
    });
  });

  describe('Suggestions', () => {
    it('suggests removing unreachable code', async () => {
      const code = `
app TestApp

data User:
  fields:
    name: text

action testAction():
  show Dashboard
  add User with name="Unreachable"

view Dashboard:
  list User
      `;
      
      const { appModel } = await parseShep(code);
      const diagnostics = checkExhaustiveness(appModel);
      
      const warnings = diagnostics.filter(d => d.severity === 'warning');
      expect(warnings[0].suggestion).toBeDefined();
      expect(warnings[0].suggestion.toLowerCase()).toContain('remove');
    });
  });

  describe('Integration', () => {
    it('handles complete action workflow', async () => {
      const code = `
app TodoApp

data Todo:
  fields:
    title: text
    done: yes/no

action createTodo(title):
  add Todo with title, done=false
  show TodoList

view TodoList:
  list Todo
  button "Add" -> createTodo
      `;
      
      const { appModel } = await parseShep(code);
      const diagnostics = checkExhaustiveness(appModel);
      
      // No unreachable code
      const warnings = diagnostics.filter(d => d.severity === 'warning');
      expect(warnings).toHaveLength(0);
    });
  });
});
