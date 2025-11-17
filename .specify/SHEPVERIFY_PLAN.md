# ShepVerify Implementation Plan

## Overview

This plan follows a **strict spec-driven approach**. Each task references official documentation and battle-tested patterns.

**Timeline:** 4 weeks
**Team Size:** 1 developer (you) + AI assistant
**Testing:** Continuous (TDD approach)

---

## Week 1: Foundation

### Day 1: Package Structure

**Goal:** Create `@sheplang/verifier` package with proper TypeScript setup

**Tasks:**

#### 1.1 Create Package Directory
```bash
cd sheplang/packages
mkdir verifier
cd verifier
```

#### 1.2 Initialize package.json
**Reference:** https://docs.npmjs.com/cli/v10/configuring-npm/package-json

```bash
pnpm init
```

Edit `package.json`:
```json
{
  "name": "@sheplang/verifier",
  "version": "0.1.0",
  "description": "Formal verification engine for ShepLang",
  "private": false,
  "type": "module",
  "main": "dist/src/index.js",
  "types": "dist/src/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/src/index.d.ts",
      "default": "./dist/src/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run --dir .",
    "test:watch": "vitest --dir .",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "@sheplang/language": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.6.3",
    "vitest": "^1.6.0",
    "rimraf": "^5.0.5"
  }
}
```

#### 1.3 Setup TypeScript
**Reference:** https://www.typescriptlang.org/docs/handbook/tsconfig-json.html

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "rootDir": ".",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "test"]
}
```

#### 1.4 Create Directory Structure
```bash
mkdir -p src/passes
mkdir -p src/solvers
mkdir -p src/utils
mkdir -p test
```

#### 1.5 Install Dependencies
```bash
pnpm install
```

#### 1.6 Update Root pnpm-workspace.yaml
**Reference:** https://pnpm.io/workspaces

Verify `sheplang/pnpm-workspace.yaml` includes:
```yaml
packages:
  - 'packages/*'
```

**Success Criteria:**
- ✅ `pnpm build` runs without errors
- ✅ Package appears in `pnpm list`
- ✅ TypeScript compilation works

---

### Day 2: Type System Foundation

**Goal:** Define type representations matching ShepLang's type system

**Tasks:**

#### 2.1 Define Core Types
**File:** `src/types.ts`

**Reference:** Study existing `@sheplang/language/src/types.ts`

```typescript
/**
 * Represents a type in the ShepLang type system.
 * 
 * ShepLang has a simple, constrained type system:
 * - Primitives: text, number, yes/no, datetime, id
 * - Model types: User, Product, etc.
 * - Nullable types: User | null (from database queries)
 * - Array types: [User]
 */
export type Type = 
  | { kind: 'text' }
  | { kind: 'number' }
  | { kind: 'yes/no' }
  | { kind: 'datetime' }
  | { kind: 'id' }
  | { kind: 'model'; name: string }
  | { kind: 'array'; elementType: Type }
  | { kind: 'nullable'; baseType: Type }
  | { kind: 'unknown' };  // For error recovery

/**
 * Diagnostic message produced by verification.
 */
export interface Diagnostic {
  /** Error, warning, or info */
  severity: 'error' | 'warning' | 'info';
  
  /** 1-indexed line number */
  line: number;
  
  /** 1-indexed column number */
  column: number;
  
  /** Human-readable message */
  message: string;
  
  /** Category of diagnostic */
  type: 'type-safety' | 'null-safety' | 'endpoint' | 'exhaustiveness';
  
  /** Optional code fix suggestion */
  suggestion?: string;
}

/**
 * Result of running verification.
 */
export interface VerificationResult {
  /** True if no errors found */
  passed: boolean;
  
  /** Errors that must be fixed */
  errors: Diagnostic[];
  
  /** Warnings that should be fixed */
  warnings: Diagnostic[];
  
  /** Informational messages */
  info: Diagnostic[];
  
  /** Summary statistics */
  summary: {
    totalChecks: number;
    errorCount: number;
    warningCount: number;
    /** Confidence score 0-100 */
    confidenceScore: number;
  };
}

/**
 * Type environment tracks types of variables in scope.
 */
export interface TypeEnvironment {
  variables: Map<string, Type>;
}
```

#### 2.2 Create Test File
**File:** `test/types.test.ts`

**Reference:** https://vitest.dev/guide/

```typescript
import { describe, it, expect } from 'vitest';
import type { Type } from '../src/types';

describe('Type System', () => {
  it('represents primitive types', () => {
    const textType: Type = { kind: 'text' };
    const numberType: Type = { kind: 'number' };
    
    expect(textType.kind).toBe('text');
    expect(numberType.kind).toBe('number');
  });
  
  it('represents model types', () => {
    const userType: Type = { kind: 'model', name: 'User' };
    
    expect(userType.kind).toBe('model');
    expect(userType.name).toBe('User');
  });
  
  it('represents nullable types', () => {
    const nullableUser: Type = {
      kind: 'nullable',
      baseType: { kind: 'model', name: 'User' }
    };
    
    expect(nullableUser.kind).toBe('nullable');
  });
  
  it('represents array types', () => {
    const userArray: Type = {
      kind: 'array',
      elementType: { kind: 'model', name: 'User' }
    };
    
    expect(userArray.kind).toBe('array');
  });
});
```

**Run test:**
```bash
pnpm test
```

**Success Criteria:**
- ✅ All tests pass
- ✅ TypeScript compiles without errors
- ✅ Type definitions are exported correctly

---

### Day 3-4: Type Inference

**Goal:** Implement type inference for ShepLang expressions

**Tasks:**

#### 3.1 Create Type Utilities
**File:** `src/utils/typeUtils.ts`

```typescript
import type { Type } from '../types';

/**
 * Check if two types are compatible for assignment.
 * 
 * Rules:
 * - Same primitive types are compatible
 * - Same model types are compatible
 * - nullable types are compatible with their base types
 * - Arrays are compatible if element types match
 */
export function isCompatible(expected: Type, actual: Type): boolean {
  // Exact match
  if (JSON.stringify(expected) === JSON.stringify(actual)) {
    return true;
  }
  
  // Nullable can accept base type
  if (expected.kind === 'nullable') {
    return isCompatible(expected.baseType, actual);
  }
  
  // Base type cannot accept nullable (must check explicitly)
  if (actual.kind === 'nullable') {
    return false;
  }
  
  // Array compatibility
  if (expected.kind === 'array' && actual.kind === 'array') {
    return isCompatible(expected.elementType, actual.elementType);
  }
  
  return false;
}

/**
 * Check if a type is nullable.
 */
export function isNullable(type: Type): boolean {
  return type.kind === 'nullable';
}

/**
 * Remove null from a nullable type.
 */
export function removeNull(type: Type): Type {
  if (type.kind === 'nullable') {
    return type.baseType;
  }
  return type;
}

/**
 * Make a type nullable.
 */
export function makeNullable(type: Type): Type {
  if (type.kind === 'nullable') {
    return type;  // Already nullable
  }
  return { kind: 'nullable', baseType: type };
}

/**
 * Format type as human-readable string.
 */
export function formatType(type: Type): string {
  switch (type.kind) {
    case 'text': return 'text';
    case 'number': return 'number';
    case 'yes/no': return 'yes/no';
    case 'datetime': return 'datetime';
    case 'id': return 'id';
    case 'model': return type.name;
    case 'array': return `[${formatType(type.elementType)}]`;
    case 'nullable': return `${formatType(type.baseType)} | null`;
    case 'unknown': return 'unknown';
  }
}
```

#### 3.2 Implement Type Inference
**File:** `src/solvers/typeInference.ts`

**Reference:** Study `@sheplang/language/src/mapper.ts` for AST structure

```typescript
import type { AppModel, TypeEnvironment, Type } from '../types';
import { formatType } from '../utils/typeUtils';

/**
 * Infer the type of a field value expression.
 * 
 * In ShepLang, field values are either:
 * - String literals (from op.fields values)
 * - Parameter references (from action params)
 */
export function inferFieldValueType(
  value: string,
  env: TypeEnvironment
): Type {
  // Check if it's a variable reference
  const varType = env.variables.get(value);
  if (varType) {
    return varType;
  }
  
  // Try to infer from literal value
  if (value === 'true' || value === 'false') {
    return { kind: 'yes/no' };
  }
  
  // Check if it's a number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return { kind: 'number' };
  }
  
  // Default to text (string literal)
  return { kind: 'text' };
}

/**
 * Build type environment from action parameters.
 */
export function buildTypeEnvironment(
  params: AppModel['actions'][0]['params']
): TypeEnvironment {
  const variables = new Map<string, Type>();
  
  for (const param of params) {
    const type = parseTypeString(param.type);
    variables.set(param.name, type);
  }
  
  return { variables };
}

/**
 * Parse ShepLang type string to Type object.
 * 
 * Examples:
 * - "text" -> { kind: 'text' }
 * - "number" -> { kind: 'number' }
 * - "User" -> { kind: 'model', name: 'User' }
 */
export function parseTypeString(typeStr: string | undefined): Type {
  if (!typeStr) {
    return { kind: 'unknown' };
  }
  
  switch (typeStr) {
    case 'text':
    case 'string':
      return { kind: 'text' };
    case 'number':
      return { kind: 'number' };
    case 'yes/no':
    case 'bool':
    case 'boolean':
      return { kind: 'yes/no' };
    case 'datetime':
      return { kind: 'datetime' };
    case 'id':
      return { kind: 'id' };
    default:
      // Assume it's a model type
      return { kind: 'model', name: typeStr };
  }
}

/**
 * Get the type of a model field.
 */
export function getModelFieldType(
  modelName: string,
  fieldName: string,
  appModel: AppModel
): Type | null {
  const model = appModel.datas.find(d => d.name === modelName);
  if (!model) {
    return null;
  }
  
  const field = model.fields.find(f => f.name === fieldName);
  if (!field) {
    return null;
  }
  
  return parseTypeString(field.type);
}
```

#### 3.3 Write Tests
**File:** `test/typeInference.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { 
  inferFieldValueType, 
  buildTypeEnvironment,
  parseTypeString 
} from '../src/solvers/typeInference';
import type { TypeEnvironment } from '../src/types';

describe('Type Inference', () => {
  describe('parseTypeString', () => {
    it('parses primitive types', () => {
      expect(parseTypeString('text')).toEqual({ kind: 'text' });
      expect(parseTypeString('number')).toEqual({ kind: 'number' });
      expect(parseTypeString('yes/no')).toEqual({ kind: 'yes/no' });
    });
    
    it('parses model types', () => {
      expect(parseTypeString('User')).toEqual({ 
        kind: 'model', 
        name: 'User' 
      });
    });
  });
  
  describe('inferFieldValueType', () => {
    it('infers boolean literals', () => {
      const env: TypeEnvironment = { variables: new Map() };
      
      expect(inferFieldValueType('true', env)).toEqual({ kind: 'yes/no' });
      expect(inferFieldValueType('false', env)).toEqual({ kind: 'yes/no' });
    });
    
    it('infers number literals', () => {
      const env: TypeEnvironment = { variables: new Map() };
      
      expect(inferFieldValueType('123', env)).toEqual({ kind: 'number' });
      expect(inferFieldValueType('45.67', env)).toEqual({ kind: 'number' });
    });
    
    it('infers text literals', () => {
      const env: TypeEnvironment = { variables: new Map() };
      
      expect(inferFieldValueType('hello', env)).toEqual({ kind: 'text' });
    });
    
    it('looks up variable types', () => {
      const env: TypeEnvironment = { 
        variables: new Map([
          ['userName', { kind: 'text' }],
          ['userId', { kind: 'id' }]
        ])
      };
      
      expect(inferFieldValueType('userName', env)).toEqual({ kind: 'text' });
      expect(inferFieldValueType('userId', env)).toEqual({ kind: 'id' });
    });
  });
  
  describe('buildTypeEnvironment', () => {
    it('builds environment from parameters', () => {
      const params = [
        { name: 'name', type: 'text' },
        { name: 'age', type: 'number' }
      ];
      
      const env = buildTypeEnvironment(params);
      
      expect(env.variables.get('name')).toEqual({ kind: 'text' });
      expect(env.variables.get('age')).toEqual({ kind: 'number' });
    });
  });
});
```

**Run tests:**
```bash
pnpm test
```

**Success Criteria:**
- ✅ All type inference tests pass
- ✅ Type utilities work correctly
- ✅ Can infer types from literals and variables

---

### Day 5: Type Safety Pass

**Goal:** Implement Pass 1 - Type Safety Checking

**Tasks:**

#### 5.1 Implement Type Safety Checker
**File:** `src/passes/typeSafety.ts`

```typescript
import type { AppModel, Diagnostic, TypeEnvironment } from '../types';
import { 
  inferFieldValueType, 
  buildTypeEnvironment,
  parseTypeString,
  getModelFieldType
} from '../solvers/typeInference';
import { isCompatible, formatType } from '../utils/typeUtils';

/**
 * Check type safety for all actions in the application.
 * 
 * Verifies:
 * 1. Action parameters match their declared types
 * 2. Field assignments in add statements match model field types
 * 3. All type conversions are valid
 * 
 * @param appModel - Parsed application model
 * @returns Array of diagnostics (errors/warnings)
 */
export function checkTypeSafety(appModel: AppModel): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  
  for (const action of appModel.actions) {
    // Build type environment from parameters
    const env = buildTypeEnvironment(action.params);
    
    // Check each operation
    for (const op of action.ops) {
      if (op.kind === 'add') {
        // Verify field types match model definition
        const model = appModel.datas.find(d => d.name === op.data);
        
        if (!model) {
          diagnostics.push({
            severity: 'error',
            line: action.__location?.startLine ?? 1,
            column: action.__location?.startColumn ?? 1,
            message: `Model '${op.data}' not found`,
            type: 'type-safety'
          });
          continue;
        }
        
        // Check each field assignment
        for (const [fieldName, fieldValue] of Object.entries(op.fields)) {
          const expectedType = getModelFieldType(op.data, fieldName, appModel);
          
          if (!expectedType) {
            diagnostics.push({
              severity: 'error',
              line: action.__location?.startLine ?? 1,
              column: action.__location?.startColumn ?? 1,
              message: `Field '${fieldName}' not found in model '${op.data}'`,
              type: 'type-safety'
            });
            continue;
          }
          
          const actualType = inferFieldValueType(fieldValue, env);
          
          if (!isCompatible(expectedType, actualType)) {
            diagnostics.push({
              severity: 'error',
              line: action.__location?.startLine ?? 1,
              column: action.__location?.startColumn ?? 1,
              message: `Type mismatch in field '${fieldName}': expected ${formatType(expectedType)}, got ${formatType(actualType)}`,
              type: 'type-safety',
              suggestion: `Ensure ${fieldValue} is of type ${formatType(expectedType)}`
            });
          }
        }
      }
    }
  }
  
  return diagnostics;
}
```

#### 5.2 Write Tests
**File:** `test/typeSafety.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { checkTypeSafety } from '../src/passes/typeSafety';
import { parseShep } from '@sheplang/language';

describe('Type Safety Pass', () => {
  it('accepts valid type assignments', async () => {
    const code = `
app TestApp

data User:
  fields:
    name: text
    age: number

action createUser(name: text, age: number):
  add User with name, age
    `;
    
    const { appModel } = await parseShep(code);
    const diagnostics = checkTypeSafety(appModel);
    
    expect(diagnostics).toHaveLength(0);
  });
  
  it('rejects type mismatches', async () => {
    const code = `
app TestApp

data User:
  fields:
    name: text
    age: number

action createUser(name: text, age: text):
  add User with name, age
    `;
    
    const { appModel } = await parseShep(code);
    const diagnostics = checkTypeSafety(appModel);
    
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0].message).toContain('Type mismatch');
  });
  
  it('catches unknown model references', async () => {
    const code = `
app TestApp

action test():
  add NonExistentModel with name: "test"
    `;
    
    const { appModel } = await parseShep(code);
    const diagnostics = checkTypeSafety(appModel);
    
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0].message).toContain('not found');
  });
});
```

**Run tests:**
```bash
pnpm test
```

**Success Criteria:**
- ✅ Type safety checker detects mismatches
- ✅ All tests pass
- ✅ Clear error messages

---

### Day 6-7: Main API + Integration

**Goal:** Create public API and integrate with extension

**Tasks:**

#### 6.1 Create Main Entry Point
**File:** `src/index.ts`

```typescript
export { checkTypeSafety } from './passes/typeSafety';
export type { Type, Diagnostic, VerificationResult, TypeEnvironment } from './types';
export { isCompatible, formatType, isNullable } from './utils/typeUtils';
export { inferFieldValueType, buildTypeEnvironment, parseTypeString } from './solvers/typeInference';

/**
 * Main verification function.
 * Currently only runs Pass 1 (Type Safety).
 * 
 * @param appModel - Parsed ShepLang application model
 * @returns Verification result with diagnostics
 */
export function verify(appModel: import('@sheplang/language').AppModel): VerificationResult {
  const errors: Diagnostic[] = [];
  const warnings: Diagnostic[] = [];
  const info: Diagnostic[] = [];
  
  // Pass 1: Type Safety
  const typeDiagnostics = checkTypeSafety(appModel);
  for (const d of typeDiagnostics) {
    if (d.severity === 'error') errors.push(d);
    else if (d.severity === 'warning') warnings.push(d);
    else info.push(d);
  }
  
  const totalChecks = 1;  // Only 1 pass for now
  const errorCount = errors.length;
  const warningCount = warnings.length;
  const passed = errorCount === 0;
  
  // Confidence score: 100 if no errors, scaled down by warnings
  const confidenceScore = passed ? Math.max(90, 100 - warningCount * 5) : 0;
  
  return {
    passed,
    errors,
    warnings,
    info,
    summary: {
      totalChecks,
      errorCount,
      warningCount,
      confidenceScore
    }
  };
}
```

#### 6.2 Build and Test Package
```bash
pnpm build
pnpm test
```

#### 6.3 Add to Extension Dependencies
```bash
cd ../../extension
pnpm add @sheplang/verifier@workspace:*
```

**Success Criteria:**
- ✅ Package builds successfully
- ✅ All tests pass
- ✅ Extension can import verifier

---

## Week 2: Null Safety

### Day 8-9: Control Flow Analysis

**Reference:** https://en.wikipedia.org/wiki/Control-flow_analysis

**Tasks:**

#### 8.1 Implement Control Flow Graph
**File:** `src/solvers/controlFlow.ts`

```typescript
// Track types through if statements and conditionals
// Implementation follows Type State analysis patterns
```

#### 8.2 Type Refinement
```typescript
// if x exists -> x is non-null in then branch
// if x == null -> x is null in then branch
```

### Day 10-11: Null Check Detection

**File:** `src/passes/nullSafety.ts`

```typescript
export function checkNullSafety(appModel: AppModel): Diagnostic[];
```

### Day 12-14: Testing + Integration

- Write 20+ unit tests
- Test with real examples
- Integrate with main `verify()` function

**Success Criteria:**
- ✅ Detects null dereferences
- ✅ Understands type refinement
- ✅ All tests pass

---

## Week 3: Endpoint Validation + VS Code

### Day 15-16: Endpoint Parser

**File:** `src/solvers/endpointParser.ts`

Parse `.shepthon` files to extract endpoint definitions

### Day 17-18: API Call Validation

**File:** `src/passes/endpoints.ts`

Validate all API calls match defined endpoints

### Day 19: Basic Exhaustiveness

**File:** `src/passes/exhaustiveness.ts`

Check for missing else clauses, unhandled cases

### Day 20-21: VS Code Integration

**Reference:** https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics

**File:** `extension/src/verification/diagnosticProvider.ts`

- Create diagnostic provider
- Register with VS Code API
- Add status bar item
- Show green checkmarks / red squiggles

**Success Criteria:**
- ✅ Verification runs in VS Code
- ✅ Errors appear inline
- ✅ Status bar shows verification state

---

## Week 4: Polish + Documentation

### Day 22-23: Test All Examples

- Verify all 6 examples
- Intentionally break code
- Ensure verifier catches errors

### Day 24-25: Performance Optimization

- Profile verification time
- Optimize hot paths
- Add caching

### Day 26-27: Documentation

- Write README
- Add usage examples
- Create marketing materials

### Day 28: Launch Prep

- Final testing
- Demo video
- Blog post

**Success Criteria:**
- ✅ All examples verify successfully
- ✅ Performance <100ms per file
- ✅ Documentation complete
- ✅ Ready for demo

---

## Testing Strategy

### Continuous Testing

Run tests after every change:
```bash
pnpm test --watch
```

### Test Coverage

Aim for 80%+ coverage:
```bash
pnpm test --coverage
```

### Integration Tests

Test with real examples:
```bash
pnpm test:e2e
```

---

## Next Steps

1. **Review this plan**
2. **Start Day 1 tasks** (Package setup)
3. **Follow official docs** for each technology
4. **Write tests first** (TDD approach)
5. **Commit frequently** (atomic commits)

Let's build ShepVerify properly! 🔬🐑
