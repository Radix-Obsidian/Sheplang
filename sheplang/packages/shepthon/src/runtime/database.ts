/**
 * InMemoryDatabase - Simple in-memory data store for ShepThon Alpha
 * 
 * Pattern: Key-Value Store with Table Namespacing
 * Reference: https://www.webdevtutor.net/blog/typescript-in-memory-database
 * 
 * Features:
 * - Table-based storage (one table per model)
 * - Auto-generated IDs (UUID-style)
 * - CRUD operations (create, findAll, find, update, delete)
 * - Predicate-based queries
 * - Immutability (returns copies, not references)
 */

/**
 * Generate a simple unique ID for records
 * Format: "r<timestamp><random>"
 * Example: "r1731646800123abc"
 */
function generateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `r${timestamp}${random}`;
}

/**
 * Deep clone an object to prevent reference sharing
 * Preserves Date objects (unlike JSON.stringify)
 */
function deepClone<T>(obj: T): T {
  // Handle null/undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle primitives
  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T;
  }

  // Handle plain objects
  const cloned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned as T;
}

/**
 * InMemoryDatabase stores data in tables (one per model)
 * Each table is a map of ID → record
 */
export class InMemoryDatabase {
  private tables: Record<string, Record<string, any>> = {};

  /**
   * Initialize a table for a model (called during runtime bootstrap)
   */
  initializeTable(modelName: string): void {
    if (!this.tables[modelName]) {
      this.tables[modelName] = {};
    }
  }

  /**
   * Create a new record in a table
   * Automatically generates an ID if not provided
   * 
   * @example
   * db.create('Reminder', { text: "Walk dog", time: new Date() })
   * // → { id: "r1731646800123abc", text: "Walk dog", time: Date, done: false }
   */
  create(modelName: string, data: any): any {
    this.ensureTable(modelName);

    // Auto-generate ID if not provided
    const id = data.id || generateId();
    const record = { ...data, id };

    // Store the record
    this.tables[modelName][id] = deepClone(record);

    // Return a copy
    return deepClone(record);
  }

  /**
   * Find all records in a table
   * 
   * @example
   * db.findAll('Reminder')
   * // → [{ id: "r123", ... }, { id: "r456", ... }]
   */
  findAll(modelName: string): any[] {
    this.ensureTable(modelName);

    const table = this.tables[modelName];
    return Object.values(table).map(deepClone);
  }

  /**
   * Find a single record by ID
   * Returns null if not found
   * 
   * @example
   * db.findById('Reminder', 'r123')
   * // → { id: "r123", text: "Walk dog", ... }
   */
  findById(modelName: string, id: string): any | null {
    this.ensureTable(modelName);

    const record = this.tables[modelName][id];
    return record ? deepClone(record) : null;
  }

  /**
   * Find records matching a predicate function
   * 
   * @example
   * db.find('Reminder', r => r.done === false && r.time <= new Date())
   * // → [{ id: "r123", done: false, ... }]
   */
  find(modelName: string, predicate: (item: any) => boolean): any[] {
    this.ensureTable(modelName);

    const table = this.tables[modelName];
    const matches = Object.values(table).filter(predicate);
    return matches.map(deepClone);
  }

  /**
   * Find first record matching a predicate
   * Returns null if no match found
   * 
   * @example
   * db.findOne('Reminder', r => r.id === 'r123')
   * // → { id: "r123", ... } or null
   */
  findOne(modelName: string, predicate: (item: any) => boolean): any | null {
    this.ensureTable(modelName);

    const table = this.tables[modelName];
    const match = Object.values(table).find(predicate);
    return match ? deepClone(match) : null;
  }

  /**
   * Update a record by ID
   * Merges the updates with existing data
   * Returns the updated record or null if not found
   * 
   * @example
   * db.update('Reminder', 'r123', { done: true })
   * // → { id: "r123", text: "Walk dog", done: true, ... }
   */
  update(modelName: string, id: string, updates: any): any | null {
    this.ensureTable(modelName);

    const record = this.tables[modelName][id];
    if (!record) {
      return null;
    }

    // Merge updates (preserve ID)
    const updated = { ...record, ...updates, id };
    this.tables[modelName][id] = updated;

    return deepClone(updated);
  }

  /**
   * Delete a record by ID
   * Returns true if deleted, false if not found
   * 
   * @example
   * db.delete('Reminder', 'r123')
   * // → true
   */
  delete(modelName: string, id: string): boolean {
    this.ensureTable(modelName);

    if (this.tables[modelName][id]) {
      delete this.tables[modelName][id];
      return true;
    }
    return false;
  }

  /**
   * Delete all records matching a predicate
   * Returns the number of records deleted
   * 
   * @example
   * db.deleteWhere('Reminder', r => r.done === true)
   * // → 5 (deleted 5 records)
   */
  deleteWhere(modelName: string, predicate: (item: any) => boolean): number {
    this.ensureTable(modelName);

    const table = this.tables[modelName];
    const idsToDelete = Object.values(table)
      .filter(predicate)
      .map((record) => record.id);

    idsToDelete.forEach((id) => delete table[id]);
    return idsToDelete.length;
  }

  /**
   * Count records in a table
   * 
   * @example
   * db.count('Reminder')
   * // → 10
   */
  count(modelName: string): number {
    this.ensureTable(modelName);
    return Object.keys(this.tables[modelName]).length;
  }

  /**
   * Clear all records from a table (useful for tests)
   * 
   * @example
   * db.clear('Reminder')
   */
  clear(modelName: string): void {
    this.ensureTable(modelName);
    this.tables[modelName] = {};
  }

  /**
   * Clear all tables (useful for tests)
   * 
   * @example
   * db.clearAll()
   */
  clearAll(): void {
    this.tables = {};
  }

  /**
   * Get all table names
   * 
   * @example
   * db.getTableNames()
   * // → ['Reminder', 'User']
   */
  getTableNames(): string[] {
    return Object.keys(this.tables);
  }

  /**
   * Check if a table exists
   */
  hasTable(modelName: string): boolean {
    return modelName in this.tables;
  }

  /**
   * Ensure a table exists (create if it doesn't)
   */
  private ensureTable(modelName: string): void {
    if (!this.tables[modelName]) {
      this.tables[modelName] = {};
    }
  }

  /**
   * Export all data (useful for debugging or persistence)
   * 
   * @example
   * const snapshot = db.export();
   * // Later: db.import(snapshot)
   */
  export(): Record<string, Record<string, any>> {
    return deepClone(this.tables);
  }

  /**
   * Import data from a snapshot (useful for testing or loading fixtures)
   * 
   * @example
   * db.import({ Reminder: { r123: { id: "r123", ... } } })
   */
  import(data: Record<string, Record<string, any>>): void {
    this.tables = deepClone(data);
  }
}
