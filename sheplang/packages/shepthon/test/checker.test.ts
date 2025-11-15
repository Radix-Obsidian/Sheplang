/**
 * ShepThon Semantic Checker Tests
 * 
 * Tests semantic validation of ShepThon AST.
 */

import { describe, it, expect } from 'vitest';
import { parseShepThon } from '../src/parser.js';
import { checkShepThon } from '../src/checker.js';

describe('ShepThon Semantic Checker', () => {
  describe('Model Validation', () => {
    it('should pass for unique model names', () => {
      const source = `
        app TestApp {
          model User {
            id: id
            name: string
          }
          model Post {
            id: id
            title: string
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(true);
      expect(checkResult.diagnostics).toHaveLength(0);
    });

    it('should error on duplicate model names', () => {
      const source = `
        app TestApp {
          model User {
            id: id
          }
          model User {
            name: string
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(false);
      expect(checkResult.diagnostics).toHaveLength(1);
      expect(checkResult.diagnostics[0].severity).toBe('error');
      expect(checkResult.diagnostics[0].message).toContain('Duplicate model name');
    });

    it('should error on duplicate field names within model', () => {
      const source = `
        app TestApp {
          model User {
            id: id
            name: string
            name: string
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(false);
      expect(checkResult.diagnostics.some(d => 
        d.severity === 'error' && d.message.includes('Duplicate field name')
      )).toBe(true);
    });

    it('should error on invalid field type', () => {
      const source = `
        app TestApp {
          model User {
            id: id
            age: invalidType
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(false);
      expect(checkResult.diagnostics.some(d => 
        d.severity === 'error' && d.message.includes('Invalid type')
      )).toBe(true);
    });

    it('should allow all valid types', () => {
      const source = `
        app TestApp {
          model User {
            id: id
            name: string
            age: number
            active: bool
            createdAt: datetime
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(true);
    });

    it('should warn on id type used for non-id field', () => {
      const source = `
        app TestApp {
          model User {
            id: id
            userId: id
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.diagnostics.some(d => 
        d.severity === 'warning' && d.message.includes('type \'id\' but is not named \'id\'')
      )).toBe(true);
    });

    it('should warn on empty model', () => {
      const source = `
        app TestApp {
          model EmptyModel {
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.diagnostics.some(d => 
        d.severity === 'warning' && d.message.includes('has no fields')
      )).toBe(true);
    });
  });

  describe('Endpoint Validation', () => {
    it('should pass for unique endpoint method+path combinations', () => {
      const source = `
        app TestApp {
          model User { id: id }
          
          endpoint GET "/users" -> [User] {
            return db.User.findAll()
          }
          
          endpoint POST "/users" (name: string) -> User {
            return db.User.create({ name })
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(true);
    });

    it('should error on duplicate endpoint method+path', () => {
      const source = `
        app TestApp {
          model User { id: id }
          
          endpoint GET "/users" -> [User] {
            return db.User.findAll()
          }
          
          endpoint GET "/users" -> [User] {
            return db.User.findAll()
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(false);
      expect(checkResult.diagnostics.some(d => 
        d.severity === 'error' && d.message.includes('Duplicate endpoint')
      )).toBe(true);
    });

    it('should error on invalid return type', () => {
      const source = `
        app TestApp {
          endpoint GET "/test" -> InvalidType {
            return null
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(false);
      expect(checkResult.diagnostics.some(d => 
        d.severity === 'error' && d.message.includes('Invalid return type')
      )).toBe(true);
    });

    it('should allow model name as return type', () => {
      const source = `
        app TestApp {
          model User { id: id }
          
          endpoint GET "/user" -> User {
            return db.User.find()
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(true);
    });

    it('should error on invalid parameter type', () => {
      const source = `
        app TestApp {
          model User { id: id }
          
          endpoint POST "/users" (name: InvalidType) -> User {
            return null
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(false);
      expect(checkResult.diagnostics.some(d => 
        d.severity === 'error' && d.message.includes('Invalid parameter type')
      )).toBe(true);
    });

    it('should allow valid parameter types', () => {
      const source = `
        app TestApp {
          model User { id: id }
          
          endpoint POST "/users" (name: string, age: number, active: bool) -> User {
            return db.User.create({ name, age, active })
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(true);
    });
  });

  describe('Job Validation', () => {
    it('should pass for unique job names', () => {
      const source = `
        app TestApp {
          job "cleanup" every 1 hour {
            log("cleanup")
          }
          
          job "backup" every 1 day {
            log("backup")
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(true);
    });

    it('should error on duplicate job names', () => {
      const source = `
        app TestApp {
          job "cleanup" every 1 hour {
            log("cleanup")
          }
          
          job "cleanup" every 2 hours {
            log("cleanup again")
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(false);
      expect(checkResult.diagnostics.some(d => 
        d.severity === 'error' && d.message.includes('Duplicate job name')
      )).toBe(true);
    });

    it('should error on invalid schedule unit', () => {
      const source = `
        app TestApp {
          job "test" every 5 seconds {
            log("test")
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(false);
      expect(checkResult.diagnostics.some(d => 
        d.severity === 'error' && d.message.includes('Invalid schedule unit')
      )).toBe(true);
    });

    it('should allow valid schedule units (minutes, hours, days)', () => {
      const source = `
        app TestApp {
          job "job1" every 5 minutes {
            log("job1")
          }
          
          job "job2" every 2 hours {
            log("job2")
          }
          
          job "job3" every 1 day {
            log("job3")
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(true);
    });

    it('should warn on very frequent jobs', () => {
      const source = `
        app TestApp {
          job "frequent" every 1 minute {
            log("very frequent")
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.diagnostics.some(d => 
        d.severity === 'warning' && d.message.includes('very frequent')
      )).toBe(true);
    });

    it('should warn on very infrequent jobs', () => {
      const source = `
        app TestApp {
          job "rare" every 30 days {
            log("very rare")
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.diagnostics.some(d => 
        d.severity === 'warning' && d.message.includes('very infrequent')
      )).toBe(true);
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('should validate Dog Reminders example', () => {
      const source = `
        app DogReminders {
          model Reminder {
            id: id
            text: string
            time: datetime
            done: bool
          }
          
          endpoint GET "/reminders" -> [Reminder] {
            return db.Reminder.findAll()
          }
          
          endpoint POST "/reminders" (text: string, time: datetime) -> Reminder {
            let reminder = db.Reminder.create({ text, time })
            return reminder
          }
          
          job "mark-due-as-done" every 5 minutes {
            let due = db.Reminder.findAll()
            for r in due {
              db.Reminder.update(r.id, { done: true })
            }
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(true);
      expect(checkResult.diagnostics.filter(d => d.severity === 'error')).toHaveLength(0);
    });

    it('should accumulate multiple errors', () => {
      const source = `
        app TestApp {
          model User { id: id }
          model User { name: string }
          
          endpoint GET "/users" -> [User] {
            return db.User.findAll()
          }
          endpoint GET "/users" -> [User] {
            return db.User.findAll()
          }
          
          job "test" every 1 hour {
            log("test")
          }
          job "test" every 2 hours {
            log("test2")
          }
        }
      `;
      
      const parseResult = parseShepThon(source);
      expect(parseResult.app).toBeDefined();
      
      const checkResult = checkShepThon(parseResult.app!);
      expect(checkResult.valid).toBe(false);
      
      const errors = checkResult.diagnostics.filter(d => d.severity === 'error');
      expect(errors.length).toBeGreaterThanOrEqual(3); // Duplicate model, endpoint, job
    });
  });
});
