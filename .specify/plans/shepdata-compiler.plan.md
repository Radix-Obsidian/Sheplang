# ShepData Compiler Implementation Plan
**Version:** 1.0 (Draft)  
**Date:** November 21, 2025  
**Status:** PLAN - Ready for Execution

---

## Overview

ShepData Compiler transforms entity specifications into:
- MongoDB schemas with proper indexing
- TypeScript types with full relationship inference
- ORM models (Mongoose, Prisma, etc.)
- Migration scripts
- GraphQL/REST type definitions

---

## Phase 1: Core Entity Parsing (Week 1)

### Goal
Parse ShepLang entity definitions into an intermediate model.

### Deliverables
- ✅ Entity parser (name, fields, relationships)
- ✅ Field type system (text, number, money, email, image, datetime, enum, ref, array)
- ✅ Constraint parser (required, unique, max length, default values)
- ✅ Relationship inference (1:1, 1:N, N:N)
- ✅ Validation of entity definitions

### Technical Approach
```typescript
// Input: ShepLang spec
entities:
  User:
    fields:
      - "email: email, required, unique"
      - "subscriptionTier: enum[Free, Pro, Enterprise], default=Free"

// Output: Intermediate model
interface EntityModel {
  name: string;
  fields: FieldModel[];
  relationships: RelationshipModel[];
  constraints: ConstraintModel[];
}

interface FieldModel {
  name: string;
  type: 'text' | 'number' | 'money' | 'email' | 'image' | 'datetime' | 'enum' | 'ref' | 'array';
  required: boolean;
  unique: boolean;
  default?: any;
  enumValues?: string[];
  maxLength?: number;
  refEntity?: string;
}
```

### Success Criteria
- ✅ Parse all field types correctly
- ✅ Infer relationships from `ref[Entity]` syntax
- ✅ Validate constraints (e.g., can't have unique on array)
- ✅ Handle nested arrays and references
- ✅ 100% test coverage for parser

### Dependencies
- ShepLang parser (already exists)
- TypeScript compiler API

---

## Phase 2: MongoDB Schema Generation (Week 2)

### Goal
Generate MongoDB schemas with proper indexing and validation.

### Deliverables
- ✅ MongoDB schema generator
- ✅ Index strategy (unique, compound, text search)
- ✅ Validation rules (min/max, enum, custom)
- ✅ Relationship handling (ObjectId refs, population)
- ✅ Timestamps (createdAt, updatedAt)

### Technical Approach
```typescript
// Input: EntityModel
// Output: MongoDB schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  subscriptionTier: {
    type: String,
    enum: ['Free', 'Pro', 'Enterprise'],
    default: 'Free'
  },
  listings: [{
    type: Schema.Types.ObjectId,
    ref: 'Listing'
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ subscriptionTier: 1 });
userSchema.index({ createdAt: -1 });
```

### Success Criteria
- ✅ Generate valid MongoDB schemas
- ✅ Create appropriate indexes for filtering/sorting
- ✅ Handle relationships with proper refs
- ✅ Add timestamps automatically
- ✅ Validate generated schemas with Mongoose

### Dependencies
- Phase 1: Entity parsing
- Mongoose library

---

## Phase 3: TypeScript Type Generation (Week 2)

### Goal
Generate TypeScript types with full relationship inference.

### Deliverables
- ✅ Type generator for entities
- ✅ Relationship types (1:1, 1:N, N:N)
- ✅ Optional/required field inference
- ✅ Enum type generation
- ✅ Nested type generation

### Technical Approach
```typescript
// Generated TypeScript types

interface User {
  _id: ObjectId;
  email: string;
  subscriptionTier: 'Free' | 'Pro' | 'Enterprise';
  listings: Listing[];
  createdAt: Date;
  updatedAt: Date;
}

interface UserInput {
  email: string;
  subscriptionTier?: 'Free' | 'Pro' | 'Enterprise';
  listings?: ObjectId[];
}

interface UserPopulated {
  _id: ObjectId;
  email: string;
  subscriptionTier: 'Free' | 'Pro' | 'Enterprise';
  listings: Listing[]; // Populated
  createdAt: Date;
  updatedAt: Date;
}
```

### Success Criteria
- ✅ Generate types for all entities
- ✅ Create Input types for mutations
- ✅ Create Populated types for queries
- ✅ Handle optional fields correctly
- ✅ Generate enum types

### Dependencies
- Phase 1: Entity parsing

---

## Phase 4: ORM Model Generation (Week 3)

### Goal
Generate Mongoose models with helper methods.

### Deliverables
- ✅ Model class generation
- ✅ Static methods (findById, find, create, update, delete)
- ✅ Instance methods (save, populate, toJSON)
- ✅ Query helpers (pagination, filtering, sorting)
- ✅ Relationship population helpers

### Technical Approach
```typescript
// Generated Mongoose model

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    return User.findById(id);
  }
  
  static async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ email });
  }
  
  static async create(data: UserInput): Promise<User> {
    return User.create(data);
  }
  
  static async update(id: string, data: Partial<UserInput>): Promise<User> {
    return User.findByIdAndUpdate(id, data, { new: true });
  }
  
  static async delete(id: string): Promise<void> {
    await User.findByIdAndDelete(id);
  }
  
  static async findWithListings(id: string): Promise<UserPopulated> {
    return User.findById(id).populate('listings');
  }
  
  static async paginate(page: number, limit: number) {
    return User.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }
}
```

### Success Criteria
- ✅ Generate CRUD methods
- ✅ Create relationship population helpers
- ✅ Add pagination/filtering/sorting
- ✅ Include validation hooks
- ✅ Generate query builders

### Dependencies
- Phase 2: MongoDB schema generation
- Phase 3: TypeScript type generation

---

## Phase 5: Migration Script Generation (Week 3)

### Goal
Generate database migration scripts for schema changes.

### Deliverables
- ✅ Migration script generator
- ✅ Schema version tracking
- ✅ Up/down migration functions
- ✅ Data transformation helpers
- ✅ Rollback support

### Technical Approach
```typescript
// Generated migration script

export const migration_20251121_add_subscription = {
  version: '20251121_001',
  description: 'Add subscription tier to users',
  
  async up(db: Db) {
    // Add new field with default
    await db.collection('users').updateMany(
      {},
      { $set: { subscriptionTier: 'Free' } }
    );
    
    // Create index
    await db.collection('users').createIndex({ subscriptionTier: 1 });
  },
  
  async down(db: Db) {
    // Remove field
    await db.collection('users').updateMany(
      {},
      { $unset: { subscriptionTier: '' } }
    );
    
    // Drop index
    await db.collection('users').dropIndex('subscriptionTier_1');
  }
};
```

### Success Criteria
- ✅ Generate valid migration scripts
- ✅ Support up/down migrations
- ✅ Track migration history
- ✅ Handle data transformations
- ✅ Support rollbacks

### Dependencies
- Phase 2: MongoDB schema generation

---

## Phase 6: GraphQL/REST Type Definitions (Week 4)

### Goal
Generate GraphQL schemas and REST API types.

### Deliverables
- ✅ GraphQL type generator
- ✅ REST API input/output types
- ✅ Query/mutation definitions
- ✅ Pagination types
- ✅ Error types

### Technical Approach
```typescript
// Generated GraphQL schema

type User {
  id: ID!
  email: String!
  subscriptionTier: SubscriptionTier!
  listings: [Listing!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum SubscriptionTier {
  Free
  Pro
  Enterprise
}

input UserInput {
  email: String!
  subscriptionTier: SubscriptionTier
}

type Query {
  user(id: ID!): User
  users(page: Int, limit: Int): [User!]!
}

type Mutation {
  createUser(input: UserInput!): User!
  updateUser(id: ID!, input: UserInput!): User!
  deleteUser(id: ID!): Boolean!
}
```

### Success Criteria
- ✅ Generate valid GraphQL schemas
- ✅ Create REST API types
- ✅ Include pagination types
- ✅ Generate error types
- ✅ Support both GraphQL and REST

### Dependencies
- Phase 3: TypeScript type generation

---

## Phase 7: Integration & Testing (Week 4)

### Goal
Integrate all components and test end-to-end.

### Deliverables
- ✅ Integrated ShepData compiler
- ✅ End-to-end tests
- ✅ Example output verification
- ✅ Performance benchmarks
- ✅ Documentation

### Technical Approach
```typescript
// End-to-end test

const spec = `
entities:
  User:
    fields:
      - "email: email, required, unique"
      - "listings: ref[Listing][], default=[]"
`;

const compiler = new ShepDataCompiler();
const output = compiler.compile(spec);

// Verify all outputs
expect(output.mongooseSchema).toBeDefined();
expect(output.typescriptTypes).toBeDefined();
expect(output.models).toBeDefined();
expect(output.migrations).toBeDefined();
expect(output.graphqlSchema).toBeDefined();
```

### Success Criteria
- ✅ All phases integrated
- ✅ 100% test coverage
- ✅ Performance acceptable (< 1s for typical spec)
- ✅ Documentation complete
- ✅ Ready for production use

### Dependencies
- All previous phases

---

## Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1: Entity Parsing | 1 week | Week 1 | Week 1 |
| Phase 2: MongoDB Schemas | 1 week | Week 2 | Week 2 |
| Phase 3: TypeScript Types | 1 week | Week 2 | Week 2 |
| Phase 4: ORM Models | 1 week | Week 3 | Week 3 |
| Phase 5: Migrations | 1 week | Week 3 | Week 3 |
| Phase 6: GraphQL/REST | 1 week | Week 4 | Week 4 |
| Phase 7: Integration & Testing | 1 week | Week 4 | Week 4 |
| **Total** | **4 weeks** | **Week 1** | **Week 4** |

---

## Success Criteria (Overall)

- ✅ Parse all ShepLang entity types
- ✅ Generate valid MongoDB schemas
- ✅ Generate type-safe TypeScript types
- ✅ Generate Mongoose models with helpers
- ✅ Generate migration scripts
- ✅ Generate GraphQL and REST types
- ✅ 100% test coverage
- ✅ Performance: < 1s for typical spec
- ✅ Documentation complete
- ✅ Ready for ShepAPI compiler integration

---

**Status:** PLAN - Ready for execution
