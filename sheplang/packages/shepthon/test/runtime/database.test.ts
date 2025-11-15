/**
 * InMemoryDatabase Tests
 * 
 * Comprehensive test suite for the in-memory database
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDatabase } from '../../src/runtime/database.js';

describe('InMemoryDatabase', () => {
  let db: InMemoryDatabase;

  beforeEach(() => {
    db = new InMemoryDatabase();
  });

  describe('Table Initialization', () => {
    it('should initialize a table', () => {
      db.initializeTable('Reminder');
      expect(db.hasTable('Reminder')).toBe(true);
    });

    it('should not overwrite existing table on re-initialization', () => {
      db.create('Reminder', { text: 'Test' });
      db.initializeTable('Reminder');
      expect(db.count('Reminder')).toBe(1);
    });

    it('should auto-create table on first operation', () => {
      db.create('User', { name: 'Alice' });
      expect(db.hasTable('User')).toBe(true);
    });
  });

  describe('Create Operations', () => {
    it('should create a record with auto-generated ID', () => {
      const record = db.create('Reminder', { text: 'Walk dog', time: new Date() });
      
      expect(record).toHaveProperty('id');
      expect(typeof record.id).toBe('string');
      expect(record.id).toMatch(/^r\d+[a-z0-9]+$/);
      expect(record.text).toBe('Walk dog');
    });

    it('should preserve provided ID', () => {
      const record = db.create('Reminder', { id: 'custom123', text: 'Test' });
      
      expect(record.id).toBe('custom123');
    });

    it('should store default values', () => {
      const record = db.create('Reminder', { 
        text: 'Walk dog', 
        time: new Date(), 
        done: false 
      });
      
      expect(record.done).toBe(false);
    });

    it('should create multiple records with unique IDs', () => {
      const r1 = db.create('Reminder', { text: 'First' });
      const r2 = db.create('Reminder', { text: 'Second' });
      
      expect(r1.id).not.toBe(r2.id);
    });

    it('should return a copy, not a reference', () => {
      const record = db.create('Reminder', { text: 'Original' });
      record.text = 'Modified';
      
      const retrieved = db.findById('Reminder', record.id);
      expect(retrieved.text).toBe('Original');
    });
  });

  describe('FindAll Operations', () => {
    it('should return empty array for empty table', () => {
      const results = db.findAll('Reminder');
      expect(results).toEqual([]);
    });

    it('should return all records in a table', () => {
      db.create('Reminder', { text: 'First' });
      db.create('Reminder', { text: 'Second' });
      db.create('Reminder', { text: 'Third' });
      
      const results = db.findAll('Reminder');
      expect(results).toHaveLength(3);
    });

    it('should not include records from other tables', () => {
      db.create('Reminder', { text: 'Reminder 1' });
      db.create('User', { name: 'Alice' });
      
      const reminders = db.findAll('Reminder');
      expect(reminders).toHaveLength(1);
      expect(reminders[0].text).toBe('Reminder 1');
    });

    it('should return copies, not references', () => {
      db.create('Reminder', { text: 'Original' });
      const results = db.findAll('Reminder');
      
      results[0].text = 'Modified';
      
      const freshResults = db.findAll('Reminder');
      expect(freshResults[0].text).toBe('Original');
    });
  });

  describe('FindById Operations', () => {
    it('should find a record by ID', () => {
      const created = db.create('Reminder', { text: 'Test' });
      const found = db.findById('Reminder', created.id);
      
      expect(found).not.toBeNull();
      expect(found.id).toBe(created.id);
      expect(found.text).toBe('Test');
    });

    it('should return null for non-existent ID', () => {
      const found = db.findById('Reminder', 'nonexistent');
      expect(found).toBeNull();
    });

    it('should return a copy, not a reference', () => {
      const created = db.create('Reminder', { text: 'Original' });
      const found = db.findById('Reminder', created.id);
      
      found.text = 'Modified';
      
      const refetch = db.findById('Reminder', created.id);
      expect(refetch.text).toBe('Original');
    });
  });

  describe('Find with Predicate Operations', () => {
    beforeEach(() => {
      db.create('Reminder', { text: 'Walk dog', done: false, time: new Date('2025-01-01') });
      db.create('Reminder', { text: 'Buy milk', done: true, time: new Date('2025-01-02') });
      db.create('Reminder', { text: 'Call mom', done: false, time: new Date('2025-01-03') });
    });

    it('should find records matching a simple predicate', () => {
      const results = db.find('Reminder', (r) => r.done === false);
      expect(results).toHaveLength(2);
    });

    it('should find records with complex predicate', () => {
      const cutoff = new Date('2025-01-02');
      const results = db.find('Reminder', (r) => !r.done && r.time < cutoff);
      
      expect(results).toHaveLength(1);
      expect(results[0].text).toBe('Walk dog');
    });

    it('should return empty array when no matches', () => {
      const results = db.find('Reminder', (r) => r.text === 'Nonexistent');
      expect(results).toEqual([]);
    });

    it('should return copies, not references', () => {
      const results = db.find('Reminder', (r) => r.done === false);
      results[0].done = true;
      
      const refetch = db.find('Reminder', (r) => r.done === false);
      expect(refetch).toHaveLength(2);
    });
  });

  describe('FindOne Operations', () => {
    beforeEach(() => {
      db.create('Reminder', { text: 'First', done: false });
      db.create('Reminder', { text: 'Second', done: false });
    });

    it('should find first matching record', () => {
      const result = db.findOne('Reminder', (r) => r.done === false);
      
      expect(result).not.toBeNull();
      expect(result.text).toBe('First');
    });

    it('should return null when no match', () => {
      const result = db.findOne('Reminder', (r) => r.done === true);
      expect(result).toBeNull();
    });
  });

  describe('Update Operations', () => {
    it('should update a record', () => {
      const created = db.create('Reminder', { text: 'Original', done: false });
      const updated = db.update('Reminder', created.id, { done: true });
      
      expect(updated).not.toBeNull();
      expect(updated.id).toBe(created.id);
      expect(updated.text).toBe('Original');
      expect(updated.done).toBe(true);
    });

    it('should preserve ID during update', () => {
      const created = db.create('Reminder', { text: 'Test' });
      const updated = db.update('Reminder', created.id, { id: 'newid', text: 'Updated' });
      
      expect(updated.id).toBe(created.id);
    });

    it('should return null for non-existent ID', () => {
      const updated = db.update('Reminder', 'nonexistent', { text: 'Updated' });
      expect(updated).toBeNull();
    });

    it('should persist updates', () => {
      const created = db.create('Reminder', { text: 'Original', done: false });
      db.update('Reminder', created.id, { done: true });
      
      const retrieved = db.findById('Reminder', created.id);
      expect(retrieved.done).toBe(true);
    });

    it('should merge updates with existing data', () => {
      const created = db.create('Reminder', { text: 'Test', done: false, priority: 1 });
      const updated = db.update('Reminder', created.id, { done: true });
      
      expect(updated.text).toBe('Test');
      expect(updated.priority).toBe(1);
      expect(updated.done).toBe(true);
    });
  });

  describe('Delete Operations', () => {
    it('should delete a record by ID', () => {
      const created = db.create('Reminder', { text: 'To delete' });
      const deleted = db.delete('Reminder', created.id);
      
      expect(deleted).toBe(true);
      expect(db.findById('Reminder', created.id)).toBeNull();
    });

    it('should return false for non-existent ID', () => {
      const deleted = db.delete('Reminder', 'nonexistent');
      expect(deleted).toBe(false);
    });

    it('should not affect other records', () => {
      const r1 = db.create('Reminder', { text: 'Keep' });
      const r2 = db.create('Reminder', { text: 'Delete' });
      
      db.delete('Reminder', r2.id);
      
      expect(db.findById('Reminder', r1.id)).not.toBeNull();
      expect(db.count('Reminder')).toBe(1);
    });
  });

  describe('DeleteWhere Operations', () => {
    beforeEach(() => {
      db.create('Reminder', { text: 'Task 1', done: true });
      db.create('Reminder', { text: 'Task 2', done: false });
      db.create('Reminder', { text: 'Task 3', done: true });
      db.create('Reminder', { text: 'Task 4', done: false });
    });

    it('should delete all matching records', () => {
      const count = db.deleteWhere('Reminder', (r) => r.done === true);
      
      expect(count).toBe(2);
      expect(db.count('Reminder')).toBe(2);
    });

    it('should return 0 when no matches', () => {
      const count = db.deleteWhere('Reminder', (r) => r.text === 'Nonexistent');
      expect(count).toBe(0);
    });

    it('should preserve non-matching records', () => {
      db.deleteWhere('Reminder', (r) => r.done === true);
      
      const remaining = db.findAll('Reminder');
      expect(remaining.every((r) => r.done === false)).toBe(true);
    });
  });

  describe('Count Operations', () => {
    it('should return 0 for empty table', () => {
      expect(db.count('Reminder')).toBe(0);
    });

    it('should count records in table', () => {
      db.create('Reminder', { text: 'First' });
      db.create('Reminder', { text: 'Second' });
      db.create('Reminder', { text: 'Third' });
      
      expect(db.count('Reminder')).toBe(3);
    });

    it('should update count after operations', () => {
      const r1 = db.create('Reminder', { text: 'Test' });
      expect(db.count('Reminder')).toBe(1);
      
      db.delete('Reminder', r1.id);
      expect(db.count('Reminder')).toBe(0);
    });
  });

  describe('Clear Operations', () => {
    it('should clear a table', () => {
      db.create('Reminder', { text: 'First' });
      db.create('Reminder', { text: 'Second' });
      
      db.clear('Reminder');
      
      expect(db.count('Reminder')).toBe(0);
      expect(db.findAll('Reminder')).toEqual([]);
    });

    it('should not affect other tables', () => {
      db.create('Reminder', { text: 'Reminder' });
      db.create('User', { name: 'Alice' });
      
      db.clear('Reminder');
      
      expect(db.count('User')).toBe(1);
    });

    it('should allow reuse after clear', () => {
      db.create('Reminder', { text: 'First' });
      db.clear('Reminder');
      
      const record = db.create('Reminder', { text: 'Second' });
      expect(db.count('Reminder')).toBe(1);
      expect(db.findById('Reminder', record.id)).not.toBeNull();
    });
  });

  describe('ClearAll Operations', () => {
    it('should clear all tables', () => {
      db.create('Reminder', { text: 'Reminder' });
      db.create('User', { name: 'Alice' });
      db.create('Task', { title: 'Task' });
      
      db.clearAll();
      
      expect(db.getTableNames()).toEqual([]);
    });
  });

  describe('Table Management', () => {
    it('should list table names', () => {
      db.create('Reminder', { text: 'Test' });
      db.create('User', { name: 'Alice' });
      
      const tables = db.getTableNames();
      expect(tables).toContain('Reminder');
      expect(tables).toContain('User');
      expect(tables).toHaveLength(2);
    });

    it('should check if table exists', () => {
      db.create('Reminder', { text: 'Test' });
      
      expect(db.hasTable('Reminder')).toBe(true);
      expect(db.hasTable('User')).toBe(false);
    });
  });

  describe('Export/Import Operations', () => {
    it('should export all data', () => {
      db.create('Reminder', { id: 'r1', text: 'First' });
      db.create('User', { id: 'u1', name: 'Alice' });
      
      const snapshot = db.export();
      
      expect(snapshot).toHaveProperty('Reminder');
      expect(snapshot).toHaveProperty('User');
      expect(snapshot.Reminder.r1.text).toBe('First');
      expect(snapshot.User.u1.name).toBe('Alice');
    });

    it('should import data', () => {
      const data = {
        Reminder: {
          r1: { id: 'r1', text: 'Imported' }
        }
      };
      
      db.import(data);
      
      const record = db.findById('Reminder', 'r1');
      expect(record).not.toBeNull();
      expect(record.text).toBe('Imported');
    });

    it('should export a copy, not a reference', () => {
      db.create('Reminder', { id: 'r1', text: 'Original' });
      const snapshot = db.export();
      
      snapshot.Reminder.r1.text = 'Modified';
      
      const record = db.findById('Reminder', 'r1');
      expect(record.text).toBe('Original');
    });

    it('should allow round-trip export/import', () => {
      db.create('Reminder', { id: 'r1', text: 'Test', done: false });
      db.create('User', { id: 'u1', name: 'Alice', age: 30 });
      
      const snapshot = db.export();
      
      const newDb = new InMemoryDatabase();
      newDb.import(snapshot);
      
      expect(newDb.count('Reminder')).toBe(1);
      expect(newDb.count('User')).toBe(1);
      expect(newDb.findById('Reminder', 'r1').text).toBe('Test');
      expect(newDb.findById('User', 'u1').name).toBe('Alice');
    });
  });

  describe('Dog Reminders Example', () => {
    it('should support Dog Reminders use case', () => {
      // Create reminders
      const r1 = db.create('Reminder', {
        text: 'Walk Milo',
        time: new Date('2025-01-01T10:00:00Z'),
        done: false
      });

      const r2 = db.create('Reminder', {
        text: 'Feed Milo',
        time: new Date('2025-01-01T18:00:00Z'),
        done: false
      });

      // GET /reminders
      const allReminders = db.findAll('Reminder');
      expect(allReminders).toHaveLength(2);

      // Find overdue reminders
      const now = new Date('2025-01-01T12:00:00Z');
      const overdue = db.find('Reminder', (r) => r.time <= now && !r.done);
      expect(overdue).toHaveLength(1);
      expect(overdue[0].text).toBe('Walk Milo');

      // Mark as done
      db.update('Reminder', r1.id, { done: true });

      // Verify update
      const updated = db.findById('Reminder', r1.id);
      expect(updated.done).toBe(true);

      // Check remaining undone
      const remaining = db.find('Reminder', (r) => !r.done);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].text).toBe('Feed Milo');
    });
  });
});
