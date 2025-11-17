# ShepVerify - Formal Verification Engine Specification

## Executive Summary

**Goal:** Build a formal verification engine that mathematically proves ShepLang code is crash-free before runtime.

**Moat:** This is only possible because ShepLang is constrained (20 keywords, statically typed, declarative). Traditional languages (Python/JS) cannot be verified.

**Impact:** Founders can ship AI-generated code with ZERO runtime errors.

---

## Architecture Overview

### Repo Structure

```
sheplang/
├── packages/
│   ├── language/          # ✅ Existing - AST parser
│   └── verifier/          # 🆕 NEW - Verification engine
└── extension/
    └── src/
        └── verification/  # 🆕 NEW - VS Code integration
```

### Component Diagram

```
┌─────────────────────────────────────────────────┐
│ VS Code Extension                               │
│                                                 │
│  ┌───────────────┐      ┌──────────────────┐  │
│  │ extension.ts  │─────▶│ verificationAPI  │  │
│  └───────────────┘      └──────────────────┘  │
│                                 │              │
│                                 ▼              │
│  ┌──────────────────────────────────────────┐ │
│  │ Diagnostics Provider (VS Code API)       │ │
│  │ - Green checkmarks                       │ │
│  │ - Inline error squiggles                 │ │
│  │ - Quick fixes                            │ │
│  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ @sheplang/verifier Package (NEW)                │
│                                                 │
│  ┌─────────────┐                               │
│  │ verify.ts   │ Main entry point              │
│  └─────────────┘                               │
│         │                                       │
│         ▼                                       │
│  ┌─────────────────────────────────────────┐  │
│  │ Pass 1: Type Safety (40% of bugs)      │  │
│  │ - Type inference                        │  │
│  │ - Type checking                         │  │
│  └─────────────────────────────────────────┘  │
│         │                                       │
│         ▼                                       │
│  ┌─────────────────────────────────────────┐  │
│  │ Pass 2: Null Safety (30% of bugs)      │  │
│  │ - Control flow analysis                 │  │
│  │ - Nullable type tracking                │  │
│  └─────────────────────────────────────────┘  │
│         │                                       │
│         ▼                                       │
│  ┌─────────────────────────────────────────┐  │
│  │ Pass 3: Endpoint Validation (20%)      │  │
│  │ - .shepthon file parsing                │  │
│  │ - API call validation                   │  │
│  └─────────────────────────────────────────┘  │
│         │                                       │
│         ▼                                       │
│  ┌─────────────────────────────────────────┐  │
│  │ Pass 4: Exhaustiveness (10%)           │  │
│  │ - Branch coverage                       │  │
│  │ - Missing case detection                │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ @sheplang/language (Existing)                   │
│ - parseShep() - Returns AST + AppModel          │
│ - Type definitions                              │
└─────────────────────────────────────────────────┘
```

---

## Phase 1: Package Setup (Week 1, Days 1-2)

### 1.1 Create Verifier Package

**Location:** `sheplang/packages/verifier/`

**Files to Create:**
```
verifier/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Public API
│   ├── types.ts              # Type definitions
│   ├── verify.ts             # Main orchestrator
│   ├── passes/
│   │   ├── typeSafety.ts
│   │   ├── nullSafety.ts
│   │   ├── endpoints.ts
│   │   └── exhaustiveness.ts
│   ├── solvers/
│   │   ├── typeInference.ts
│   │   └── constraints.ts
│   └── utils/
│       ├── diagnostics.ts
│       └── suggestions.ts
└── test/
    └── verify.test.ts
```

**package.json:**
```json
{
  "name": "@sheplang/verifier",
  "version": "0.1.0",
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
    "clean": "rimraf dist"
  },
  "dependencies": {
    "@sheplang/language": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "vitest": "^1.6.0",
    "rimraf": "^5.0.5"
  }
}
```

### 1.2 Update Extension to Use Verifier

**Add dependency to `extension/package.json`:**
```json
"dependencies": {
  "@sheplang/verifier": "file:../sheplang/packages/verifier",
  // ... existing deps
}
```

---

## Phase 2: Type System (Week 1, Days 3-5)

### 2.1 Type Representation

**File:** `verifier/src/types.ts`

Based on ShepLang's type system:
- Primitives: `text`, `number`, `yes/no`, `datetime`, `id`
- Model types: `User`, `Product`, etc.
- Nullable types: `User | null` (from database queries)
- Array types: `[User]`

**Type Definition:**
```typescript
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
```

### 2.2 Type Inference

**File:** `verifier/src/solvers/typeInference.ts`

**Function Signature:**
```typescript
export function inferType(
  expr: any,
  env: TypeEnvironment
): Type;
```

**Rules:**
- String literals → `text`
- Number literals → `number`
- `true`/`false` → `yes/no`
- Variables → Look up in environment
- Model references → `model`
- Database queries (`load`) → `nullable<model>`

### 2.3 Type Checking

**File:** `verifier/src/passes/typeSafety.ts`

**Function Signature:**
```typescript
export function checkTypeSafety(
  appModel: AppModel
): Diagnostic[];
```

**Checks:**
1. Variable assignments match declared types
2. Function parameters match expected types
3. Property accesses are valid for model types
4. Arithmetic operations are on numbers
5. Comparisons are between compatible types

**Example Error:**
```typescript
{
  severity: 'error',
  line: 5,
  column: 10,
  message: 'Type mismatch: Cannot assign number to text',
  suggestion: 'Change type to number or convert value to text'
}
```

---

## Phase 3: Null Safety (Week 2)

### 3.1 Control Flow Analysis

**File:** `verifier/src/solvers/constraints.ts`

Track types through control flow:

```typescript
interface TypeEnvironment {
  variables: Map<string, Type>;
}

// Type refinement in conditionals
function refineTypes(
  condition: Expr,
  thenEnv: TypeEnvironment,
  elseEnv: TypeEnvironment
): void;
```

**Rules:**
- `if x exists` → `x` is non-null in then branch
- `if x != null` → `x` is non-null in then branch
- `if x == null` → `x` is null in then branch

### 3.2 Null Check Detection

**File:** `verifier/src/passes/nullSafety.ts`

**Function Signature:**
```typescript
export function checkNullSafety(
  appModel: AppModel
): Diagnostic[];
```

**Checks:**
1. Property access on nullable types requires null check
2. All code paths handle null cases
3. Database query results are checked before use

**Example Error:**
```typescript
{
  severity: 'error',
  line: 10,
  column: 5,
  message: 'Potential null pointer: user might be null',
  suggestion: `Add null check:
if user exists {
  show user.name
} else {
  show "User not found"
}`
}
```

---

## Phase 4: Endpoint Validation (Week 3)

### 4.1 Parse .shepthon Files

**File:** `verifier/src/solvers/endpointParser.ts`

**Function:**
```typescript
export interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  params: Record<string, Type>;
  returnType: Type;
}

export function parseEndpoints(
  shepthonFiles: string[]
): Endpoint[];
```

**Parse these patterns:**
```shepthon
endpoint GET "/users" -> [User]
endpoint POST "/users" (name: string, email: string) -> User
endpoint DELETE "/users/:id" -> void
```

### 4.2 Validate API Calls

**File:** `verifier/src/passes/endpoints.ts`

**Function:**
```typescript
export function checkEndpoints(
  appModel: AppModel,
  endpoints: Endpoint[]
): Diagnostic[];
```

**Checks:**
1. Endpoint exists (method + path match)
2. Request parameters match endpoint signature
3. Response type is used correctly

**Example Error:**
```typescript
{
  severity: 'error',
  line: 15,
  column: 3,
  message: 'Endpoint not found: POST /user',
  suggestion: `Did you mean:
  - POST /users (name: string, email: string) -> User
  - GET /users -> [User]`
}
```

---

## Phase 5: VS Code Integration (Week 3, Days 6-7)

### 5.1 Diagnostic Provider

**File:** `extension/src/verification/diagnosticProvider.ts`

**Use Official VS Code API:**
- Reference: https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics
- API: `vscode.languages.createDiagnosticCollection()`

**Implementation:**
```typescript
import * as vscode from 'vscode';
import { verify } from '@sheplang/verifier';
import { parseShep } from '@sheplang/language';

export class ShepVerificationProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  
  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('shepverify');
  }
  
  async verifyDocument(document: vscode.TextDocument): Promise<void> {
    if (document.languageId !== 'sheplang') return;
    
    try {
      const source = document.getText();
      const { appModel } = await parseShep(source, document.uri.fsPath);
      const result = verify(appModel);
      
      const diagnostics = result.errors.map(err => {
        const range = new vscode.Range(
          err.line - 1, err.column - 1,
          err.line - 1, err.column + 10
        );
        
        const diagnostic = new vscode.Diagnostic(
          range,
          err.message,
          vscode.DiagnosticSeverity.Error
        );
        
        // Add code action for quick fix
        if (err.suggestion) {
          diagnostic.code = {
            value: 'shepverify-fix',
            target: vscode.Uri.parse('command:shepverify.quickFix')
          };
        }
        
        return diagnostic;
      });
      
      this.diagnosticCollection.set(document.uri, diagnostics);
    } catch (error) {
      console.error('[ShepVerify] Verification failed:', error);
    }
  }
}
```

### 5.2 Status Bar Item

**Show verification status:**
```typescript
┌──────────────────────────────────┐
│ ✅ ShepVerify: 0 errors          │  ← Green when passing
│ ⚠️  ShepVerify: 3 warnings       │  ← Yellow when warnings
│ ❌ ShepVerify: 5 errors          │  ← Red when errors
└──────────────────────────────────┘
```

### 5.3 Register in Extension

**File:** `extension/src/extension.ts`

```typescript
import { ShepVerificationProvider } from './verification/diagnosticProvider';

export function activate(context: vscode.ExtensionContext) {
  // ... existing activation code
  
  // Register verification provider
  const verificationProvider = new ShepVerificationProvider();
  
  // Verify on save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(doc => {
      verificationProvider.verifyDocument(doc);
    })
  );
  
  // Verify on open
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => {
      verificationProvider.verifyDocument(doc);
    })
  );
  
  // Verify on change (debounced)
  let verifyTimeout: NodeJS.Timeout;
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      clearTimeout(verifyTimeout);
      verifyTimeout = setTimeout(() => {
        verificationProvider.verifyDocument(event.document);
      }, 500);
    })
  );
}
```

---

## Testing Strategy

### Unit Tests (Per Pass)

**Example:** `verifier/test/typeSafety.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { checkTypeSafety } from '../src/passes/typeSafety';
import { parseShep } from '@sheplang/language';

describe('Type Safety Pass', () => {
  it('accepts matching types', async () => {
    const code = `
      app TestApp
      
      action test(name: text):
        show name
    `;
    
    const { appModel } = await parseShep(code);
    const diagnostics = checkTypeSafety(appModel);
    
    expect(diagnostics).toHaveLength(0);
  });
  
  it('rejects type mismatches', async () => {
    const code = `
      app TestApp
      
      action test(name: text):
        let count: number = name
    `;
    
    const { appModel } = await parseShep(code);
    const diagnostics = checkTypeSafety(appModel);
    
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('Cannot assign text to number');
  });
});
```

### Integration Tests (Golden Files)

**Test real examples:**
```typescript
describe('ShepVerify E2E', () => {
  it('verifies todo.shep without errors', async () => {
    const code = readFileSync('../../examples/03-todo.shep', 'utf-8');
    const { appModel } = await parseShep(code);
    const result = verify(appModel);
    
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('catches null dereference in ecommerce.shep', async () => {
    // Intentionally break example
    const code = readFileSync('../../examples/05-ecommerce-store.shep', 'utf-8');
    // ... modify to add null dereference
    
    const { appModel } = await parseShep(code);
    const result = verify(appModel);
    
    expect(result.passed).toBe(false);
    expect(result.errors.some(e => e.type === 'null-safety')).toBe(true);
  });
});
```

---

## Success Criteria

### Pass 1 Complete When:
- ✅ 15+ unit tests passing
- ✅ Infers types for all ShepLang expressions
- ✅ Catches type mismatches in actions
- ✅ Error messages are clear and helpful
- ✅ Less than 5% false positives

### Pass 2 Complete When:
- ✅ 20+ unit tests passing
- ✅ Detects null dereferences in examples
- ✅ Understands if statement type refinement
- ✅ Suggests fixes for all null errors
- ✅ Handles both `if x exists` and `if x != null`

### Pass 3 Complete When:
- ✅ Parses .shepthon files correctly
- ✅ Validates all API calls in examples
- ✅ Catches parameter type mismatches
- ✅ Suggests closest matching endpoint
- ✅ Works with all HTTP methods (GET/POST/PUT/DELETE)

### Final Integration Complete When:
- ✅ All passes run in sequence
- ✅ All 6 examples verify successfully (or fail with expected errors)
- ✅ VS Code shows green checkmarks
- ✅ Performance: <100ms for typical file
- ✅ Zero false negatives (no unsafe code passes)

---

## Implementation Timeline

### Week 1: Package Setup + Type Safety
- **Day 1-2:** Create `@sheplang/verifier` package structure
- **Day 3-4:** Implement type inference
- **Day 5:** Implement type checking
- **Day 6-7:** Testing + error messages

**Deliverable:** Type safety pass catches 40% of bugs

### Week 2: Null Safety
- **Day 1-2:** Control flow analysis
- **Day 3-4:** Nullable type tracking + refinement
- **Day 5:** Null check detection
- **Day 6-7:** Testing + integration

**Deliverable:** Null safety pass catches 30% of bugs

### Week 3: Endpoint Validation + VS Code
- **Day 1-2:** .shepthon parser
- **Day 3-4:** API call validation
- **Day 5:** Exhaustiveness checking (basic)
- **Day 6-7:** VS Code integration + polish

**Deliverable:** Full verification in VS Code

### Week 4: Testing + Documentation
- **Day 1-2:** Test all 6 examples
- **Day 3-4:** Intentionally break code, verify catches errors
- **Day 5:** Performance optimization
- **Day 6-7:** Documentation + marketing materials

**Deliverable:** Production-ready ShepVerify

---

## Official Resources to Use

### VS Code Extension API
- **Diagnostics:** https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics
- **Code Actions:** https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-code-actions
- **Status Bar:** https://code.visualstudio.com/api/extension-guides/status-bar

### TypeScript
- **Official Handbook:** https://www.typescriptlang.org/docs/handbook/intro.html
- **Type Inference:** https://www.typescriptlang.org/docs/handbook/type-inference.html

### Testing (Vitest)
- **Getting Started:** https://vitest.dev/guide/
- **API Reference:** https://vitest.dev/api/

### Langium (Already in use)
- **AST Documentation:** https://langium.org/docs/grammar-language/
- **Type System:** https://langium.org/docs/reference/type-system/

---

## Non-Goals (What We're NOT Doing)

### ❌ Advanced Type Theory
- No dependent types
- No higher-kinded types
- No effect systems
- No linear types

### ❌ Full Theorem Proving
- Not using Coq, Lean, or Agda
- Not proving algorithmic correctness
- Not verifying performance properties

### ❌ Symbolic Execution
- Not exploring all possible execution paths
- Not using SAT/SMT solvers (unless needed later)

### ❌ Overfitting to Current Examples
- Design for ShepLang the language, not just current 6 examples
- Plan for future features (loops, functions, modules)

---

## Risk Mitigation

### Risk 1: Performance
**Problem:** Verification might be slow (>1 second per file)
**Mitigation:** 
- Start with simple linear passes
- Profile and optimize hot paths
- Cache verification results
- Run incrementally (only re-verify changed actions)

### Risk 2: False Positives
**Problem:** Verification rejects safe code
**Mitigation:**
- Start conservative, refine rules iteratively
- Provide escape hatches (e.g., `@verified-safe` comment)
- Collect user feedback on warnings

### Risk 3: False Negatives
**Problem:** Verification accepts unsafe code
**Mitigation:**
- Write adversarial tests (try to break verifier)
- Test with intentionally broken examples
- Start overly conservative, relax rules carefully

### Risk 4: Complexity Explosion
**Problem:** Verification becomes too complex to maintain
**Mitigation:**
- Keep each pass under 500 lines of code
- Use functional programming (pure functions)
- Write extensive tests
- Document all algorithms

---

## Future Enhancements (Post-MVP)

### Phase 2.0: Exhaustiveness Checking
- Verify all enum values are handled
- Detect unreachable code
- Check all error cases are addressed

### Phase 3.0: Security Analysis
- Detect SQL injection vulnerabilities
- Check for XSS in user input
- Validate authentication requirements

### Phase 4.0: Performance Analysis
- Detect N+1 queries
- Find expensive operations in loops
- Suggest indexing strategies

### Phase 5.0: AI Training Loop
- Log verification failures + fixes
- Build dataset of (prompt → verified code)
- Train custom model for ShepLang generation

---

## Conclusion

ShepVerify is the **moat** that makes ShepLang defensible. It's only possible because we control the language design.

**The Pitch:**
> "Other AI tools help you write code faster. ShepLang makes sure that code actually works."

**Success Metric:**
> "Zero runtime errors in production for all ShepLang apps"

Let's build it. 🔬🐑
