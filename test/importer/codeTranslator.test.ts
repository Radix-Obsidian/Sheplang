/**
 * Phase 2 Tests – Code Translator
 * 
 * Tests the JavaScript/TypeScript to ShepLang translation.
 * Following Golden Sheep Methodology: "Test deep."
 */

import { describe, it, expect } from 'vitest';
import { 
  translateFunctionBody, 
  generateShepLangCode,
  TranslatedStatement 
} from '../../extension/src/parsers/codeTranslator';

describe('Code Translator – Phase 2', () => {
  
  describe('fetch() translation', () => {
    it('translates GET fetch to load statement', () => {
      const body = `fetch('/api/tasks')`;
      const result = translateFunctionBody(body);
      
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.statements).toHaveLength(1);
      expect(result.statements[0].kind).toBe('call');
      
      const stmt = result.statements[0] as any;
      expect(stmt.method).toBe('GET');
      expect(stmt.path).toBe('/api/tasks');
    });
    
    it('translates POST fetch with body', () => {
      const body = `
        fetch('/api/tasks', {
          method: 'POST',
          body: JSON.stringify({ title, priority })
        })
      `;
      const result = translateFunctionBody(body);
      
      expect(result.statements).toHaveLength(1);
      const stmt = result.statements[0] as any;
      expect(stmt.kind).toBe('call');
      expect(stmt.method).toBe('POST');
      expect(stmt.path).toBe('/api/tasks');
      expect(stmt.fields).toContain('title');
      expect(stmt.fields).toContain('priority');
    });
    
    it('translates DELETE fetch', () => {
      const body = `fetch('/api/tasks/123', { method: 'DELETE' })`;
      const result = translateFunctionBody(body);
      
      const stmt = result.statements[0] as any;
      expect(stmt.method).toBe('DELETE');
    });
  });
  
  describe('setState translation', () => {
    it('translates setState to set statement', () => {
      const body = `setTitle('')`;
      const result = translateFunctionBody(body);
      
      expect(result.statements).toHaveLength(1);
      expect(result.statements[0].kind).toBe('set');
      
      const stmt = result.statements[0] as any;
      expect(stmt.variable).toBe('title');
      expect(stmt.value).toBe("''");
    });
    
    it('translates setTasks with array', () => {
      const body = `setTasks([...tasks, newTask])`;
      const result = translateFunctionBody(body);
      
      expect(result.statements[0].kind).toBe('set');
      const stmt = result.statements[0] as any;
      expect(stmt.variable).toBe('tasks');
    });
  });
  
  describe('if statement translation', () => {
    it('translates simple if statement', () => {
      const body = `
        if (!title.trim()) {
          return;
        }
      `;
      const result = translateFunctionBody(body);
      
      expect(result.statements).toHaveLength(1);
      expect(result.statements[0].kind).toBe('if');
      
      const ifStmt = result.statements[0] as any;
      expect(ifStmt.condition).toContain('not');
      expect(ifStmt.then).toHaveLength(1);
      expect(ifStmt.then[0].kind).toBe('return');
    });
    
    it('translates if-else statement', () => {
      const body = `
        if (response.ok) {
          setSuccess(true);
        } else {
          setError('Failed');
        }
      `;
      const result = translateFunctionBody(body);
      
      const ifStmt = result.statements[0] as any;
      expect(ifStmt.then).toHaveLength(1);
      expect(ifStmt.else).toHaveLength(1);
    });
  });
  
  describe('return statement translation', () => {
    it('translates empty return', () => {
      const body = `return`;
      const result = translateFunctionBody(body);
      
      expect(result.statements[0].kind).toBe('return');
      expect((result.statements[0] as any).value).toBeUndefined();
    });
    
    it('translates return with value', () => {
      const body = `return response.data`;
      const result = translateFunctionBody(body);
      
      expect(result.statements[0].kind).toBe('return');
      expect((result.statements[0] as any).value).toBe('response.data');
    });
  });
  
  describe('router navigation translation', () => {
    it('translates router.push to show', () => {
      const body = `router.push('/dashboard')`;
      const result = translateFunctionBody(body);
      
      expect(result.statements).toHaveLength(1);
      expect(result.statements[0].kind).toBe('show');
      expect((result.statements[0] as any).view).toBe('Dashboard');
    });
  });
  
  describe('console and preventDefault handling', () => {
    it('skips console.log statements', () => {
      const body = `console.log('debug')`;
      const result = translateFunctionBody(body);
      
      expect(result.statements).toHaveLength(0);
      expect(result.confidence).toBe(1);
    });
    
    it('skips preventDefault', () => {
      const body = `e.preventDefault()`;
      const result = translateFunctionBody(body);
      
      expect(result.statements).toHaveLength(0);
    });
  });
  
  describe('ShepLang code generation', () => {
    it('generates call statement', () => {
      const statements: TranslatedStatement[] = [{
        kind: 'call',
        method: 'POST',
        path: '/api/tasks',
        fields: ['title', 'priority']
      }];
      
      const code = generateShepLangCode(statements);
      expect(code).toContain('call POST "/api/tasks" with title, priority');
    });
    
    it('generates if statement with indentation', () => {
      const statements: TranslatedStatement[] = [{
        kind: 'if',
        condition: 'not title.trim()',
        then: [{ kind: 'return' }]
      }];
      
      const code = generateShepLangCode(statements);
      expect(code).toContain('if not title.trim():');
      expect(code).toContain('  return');
    });
    
    it('generates set statement', () => {
      const statements: TranslatedStatement[] = [{
        kind: 'set',
        variable: 'title',
        value: '""'
      }];
      
      const code = generateShepLangCode(statements);
      expect(code).toBe('set title to ""');
    });
  });
  
  describe('complex function translation', () => {
    it('translates a realistic handler function', () => {
      const body = `
        e.preventDefault();
        if (!title.trim()) {
          setError('Title required');
          return;
        }
        fetch('/api/tasks', {
          method: 'POST',
          body: JSON.stringify({ title })
        });
        setTitle('');
      `;
      
      const result = translateFunctionBody(body);
      
      // Should have: if, call, set (e.preventDefault skipped)
      expect(result.statements.length).toBeGreaterThanOrEqual(3);
      expect(result.confidence).toBeGreaterThan(0.5);
      
      // Generate code and verify structure
      const code = generateShepLangCode(result.statements);
      expect(code).toContain('if');
      expect(code).toContain('call POST');
      expect(code).toContain('set title');
    });
  });
  
  describe('confidence scoring', () => {
    it('returns high confidence for fully translated code', () => {
      const body = `setTitle('')`;
      const result = translateFunctionBody(body);
      
      expect(result.confidence).toBe(1);
      expect(result.rawCount).toBe(0);
    });
    
    it('returns lower confidence for partially translated code', () => {
      const body = `
        someUnknownFunction();
        setTitle('');
      `;
      const result = translateFunctionBody(body);
      
      expect(result.confidence).toBeLessThan(1);
      expect(result.rawCount).toBeGreaterThan(0);
    });
  });
  
  describe('Phase 3: End-to-end faithful translation', () => {
    it('translates a production-like submit handler faithfully', () => {
      const body = `
        e.preventDefault();
        if (!title.trim()) {
          setError('Title is required');
          return;
        }
        fetch('/api/tasks', {
          method: 'POST',
          body: JSON.stringify({ title, priority })
        });
        setTitle('');
        setError('');
      `;
      
      const result = translateFunctionBody(body);
      const code = generateShepLangCode(result.statements);
      
      // Should have high confidence
      expect(result.confidence).toBeGreaterThan(0.7);
      
      // Should have the key statements
      expect(code).toContain('if not');  // if statement
      expect(code).toContain('set error to');  // setError
      expect(code).toContain('return');  // return
      expect(code).toContain('call POST "/api/tasks"');  // fetch
      expect(code).toContain('with title, priority');  // body fields
      expect(code).toContain('set title to');  // setTitle('')
    });
    
    it('translates delete handler with await', () => {
      const body = `
        await fetch('/api/tasks/' + id, { method: 'DELETE' });
        setTasks(tasks.filter(t => t.id !== id));
      `;
      
      const result = translateFunctionBody(body);
      const code = generateShepLangCode(result.statements);
      
      expect(code).toContain('call DELETE');
      expect(code).toContain('set tasks to');
    });
    
    it('preserves conditional logic in translation', () => {
      const body = `
        if (response.ok) {
          setSuccess(true);
        } else {
          setError('Failed');
        }
      `;
      
      const result = translateFunctionBody(body);
      const code = generateShepLangCode(result.statements);
      
      expect(code).toContain('if response.ok:');
      expect(code).toContain('set success to true');
      expect(code).toContain('else:');
      expect(code).toContain('set error to');
    });
  });
});
