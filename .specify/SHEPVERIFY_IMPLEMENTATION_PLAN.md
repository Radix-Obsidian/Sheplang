# ShepVerify - Complete Implementation Plan

**Status:** Phases 1-2 Complete (20/20 tests), Phases 3-4 Pending  
**Goal:** 100% AIVP Manifesto Fulfillment

---

## Current Status

### ✅ Phase 1: Type Safety (COMPLETE)
**Coverage:** 40% of bugs  
**Tests:** 8/8 passing  
**File:** `src/passes/typeSafety.ts`

**Features Implemented:**
- Type inference for literals (`"text"` → `text`, `42` → `number`, `true` → `yes/no`)
- Field type validation in `add` statements
- Model reference resolution
- Parameter type checking
- Missing field warnings
- Unknown field detection

**Test Coverage:**
- ✅ Valid type assignments
- ✅ Type mismatches detected
- ✅ Unknown model references caught (parser level)
- ✅ Unknown field references caught
- ✅ Missing field warnings
- ✅ Literal type inference
- ✅ Parameter type inference
- ✅ Helpful error suggestions

---

### ✅ Phase 2: Null Safety (COMPLETE)
**Coverage:** 30% of bugs  
**Tests:** 6/6 passing  
**File:** `src/passes/nullSafety.ts`

**Features Implemented:**
- Nullable variable tracking from `load` operations
- Control flow analysis for null checks
- `if x exists` pattern recognition
- `if x != null` pattern recognition
- Nullable assignment validation
- Unchecked nullable warnings

**Test Coverage:**
- ✅ Potential null pointers detected
- ✅ Access after null check allowed
- ✅ Nullable assignment to non-nullable field caught
- ✅ Unchecked nullable variables warned
- ✅ `!= null` pattern handled
- ✅ Helpful suggestions provided

---

### 📋 Phase 3: Endpoint Validation (PENDING)
**Coverage:** 20% of bugs  
**Target Tests:** 15+ tests  
**File:** `src/passes/endpointValidation.ts` (to be created)

**Features to Implement:**

#### 1. ShepThon Parser
```typescript
// Parse .shepthon files into endpoint registry
interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  params: Record<string, string>; // path params
  returnType: Type;
}

function parseShepThonFile(content: string): Endpoint[] {
  // Parse model definitions
  // Extract endpoint declarations
  // Build typed endpoint registry
}
```

#### 2. Endpoint Registry
```typescript
interface EndpointRegistry {
  endpoints: Map<string, Endpoint>;
  
  // Query methods
  findEndpoint(method: string, path: string): Endpoint | undefined;
  validateCall(method: string, path: string): boolean;
  getReturnType(method: string, path: string): Type;
}
```

#### 3. Validation Rules
- ✅ `call` method matches endpoint method
- ✅ `call` path exists in ShepThon
- ✅ `load` method matches endpoint method
- ✅ `load` path exists and returns data
- ✅ Path parameters match endpoint definition
- ✅ Missing endpoints detected
- ✅ Method mismatch warnings

#### 4. Test Cases Needed
```typescript
// 1. Valid call to existing endpoint
it('allows valid API calls', () => {
  // ShepThon: GET /users
  // ShepLang: call GET "/users"
  // ✅ Should pass
});

// 2. Invalid method
it('detects method mismatch', () => {
  // ShepThon: GET /users
  // ShepLang: call POST "/users"
  // ❌ Should error
});

// 3. Missing endpoint
it('detects missing endpoints', () => {
  // ShepThon: (no /users endpoint)
  // ShepLang: call GET "/users"
  // ❌ Should error
});

// 4. Load with correct type
it('validates load return types', () => {
  // ShepThon: GET /users -> User[]
  // ShepLang: load GET "/users" into users
  // ✅ Should infer User[] type
});

// 5. Path parameters
it('validates path parameters', () => {
  // ShepThon: GET /users/:id
  // ShepLang: call GET "/users/123"
  // ✅ Should pass with parameter
});

// ... 10 more edge cases
```

---

### 📋 Phase 4: Exhaustiveness (PENDING)
**Coverage:** 10% of bugs  
**Target Tests:** 10+ tests  
**File:** `src/passes/exhaustiveness.ts` (to be created)

**Features to Implement:**

#### 1. Control Flow Graph
```typescript
interface ControlFlowNode {
  type: 'entry' | 'exit' | 'statement' | 'branch';
  statement?: any;
  branches?: ControlFlowNode[];
  next?: ControlFlowNode;
}

function buildCFG(action: AppModel['actions'][0]): ControlFlowNode {
  // Build control flow graph from action statements
}
```

#### 2. Branch Coverage Analysis
```typescript
function analyzeBranches(cfg: ControlFlowNode): {
  totalBranches: number;
  coveredBranches: number;
  uncoveredPaths: string[];
} {
  // Detect all possible execution paths
  // Identify unreachable code
  // Find missing branches
}
```

#### 3. Validation Rules
- ✅ All `if` branches covered
- ✅ Missing `else` branches detected
- ✅ Unreachable code warnings
- ✅ Dead code elimination suggestions
- ✅ Missing pattern matches
- ✅ Boolean condition exhaustiveness

#### 4. Test Cases Needed
```typescript
// 1. Complete if-else
it('allows complete if-else', () => {
  // if condition:
  //   do A
  // else:
  //   do B
  // ✅ All branches covered
});

// 2. Missing else branch
it('warns about missing else', () => {
  // if condition:
  //   do A
  // ⚠️ Missing else - what if condition is false?
});

// 3. Unreachable code
it('detects unreachable code', () => {
  // add User with name="Test"
  // show Dashboard
  // add User with name="Unreachable"  // ❌ After show
});

// 4. Boolean exhaustiveness
it('checks boolean conditions', () => {
  // if done == true:
  //   show Complete
  // ⚠️ Missing: what if done == false?
});

// ... 6 more edge cases
```

---

## Implementation Timeline

### Week 1-2: Phase 3 (Endpoint Validation)

**Day 1-2: ShepThon Parser**
- Parse model definitions
- Extract endpoints (GET, POST, DELETE, etc.)
- Build return type inference
- **Deliverable:** `parseShepThon()` function

**Day 3-4: Endpoint Registry**
- Build endpoint lookup system
- Path parameter matching
- Method validation
- **Deliverable:** `EndpointRegistry` class

**Day 5-7: Validation Pass**
- Implement `checkEndpointValidation()`
- Validate `call` statements
- Validate `load` statements
- Type inference for loaded data
- **Deliverable:** `src/passes/endpointValidation.ts`

**Day 8-10: Tests**
- Write 15+ test cases
- Edge cases for all validation rules
- Integration with verify()
- **Deliverable:** `test/endpointValidation.test.ts`

### Week 3-4: Phase 4 (Exhaustiveness)

**Day 11-13: Control Flow Graph**
- Build CFG from action statements
- Handle branching (if/else)
- Handle sequential flow
- **Deliverable:** `buildCFG()` function

**Day 14-16: Branch Analysis**
- Detect all execution paths
- Identify uncovered branches
- Find unreachable code
- **Deliverable:** `analyzeBranches()` function

**Day 17-19: Validation Pass**
- Implement `checkExhaustiveness()`
- Branch coverage warnings
- Unreachable code detection
- **Deliverable:** `src/passes/exhaustiveness.ts`

**Day 20-22: Tests**
- Write 10+ test cases
- Edge cases for control flow
- Integration with verify()
- **Deliverable:** `test/exhaustiveness.test.ts`

### Week 5: Integration & Polish

**Day 23-24: Wire Phases 3-4 into verify()**
- Update `src/index.ts`
- Add to verification pipeline
- Update confidence scoring

**Day 25-26: Full Test Suite**
- Run all 45+ tests
- Fix any integration issues
- Ensure 100% pass rate

**Day 27-28: Documentation**
- Update README
- Add usage examples
- API documentation

**Final Deliverable:** 100% ShepVerify with 45+ passing tests

---

## File Structure (After Completion)

```
sheplang/packages/verifier/
├── src/
│   ├── index.ts                              # Main entry, verify()
│   ├── types.ts                              # Type definitions
│   ├── passes/
│   │   ├── typeSafety.ts                     # ✅ Phase 1
│   │   ├── nullSafety.ts                     # ✅ Phase 2
│   │   ├── endpointValidation.ts             # 📋 Phase 3
│   │   └── exhaustiveness.ts                 # 📋 Phase 4
│   ├── solvers/
│   │   ├── typeInference.ts                  # ✅ Type system
│   │   ├── controlFlow.ts                    # ✅ Flow analysis
│   │   ├── shepthonParser.ts                 # 📋 Parse .shepthon
│   │   └── cfg.ts                            # 📋 Control flow graph
│   └── utils/
│       ├── typeUtils.ts                      # ✅ Type helpers
│       └── endpointRegistry.ts               # 📋 Endpoint lookup
└── test/
    ├── typeSafety.test.ts                    # ✅ 8 tests
    ├── nullSafety.test.ts                    # ✅ 6 tests
    ├── integration.test.ts                   # ✅ 6 tests
    ├── endpointValidation.test.ts            # 📋 15 tests
    ├── exhaustiveness.test.ts                # 📋 10 tests
    ├── typeInference.test.ts                 # ✅ (helper tests)
    ├── controlFlow.test.ts                   # ✅ (helper tests)
    └── types.test.ts                         # ✅ (helper tests)
```

**Target:** 45+ tests passing (currently 20/45)

---

## Success Criteria

### Phase 3 Complete When:
- ✅ Can parse `.shepthon` files
- ✅ Endpoint registry built
- ✅ All `call` statements validated
- ✅ All `load` statements validated
- ✅ 15+ tests passing
- ✅ Catches 20% of bugs (endpoint mismatches)

### Phase 4 Complete When:
- ✅ Control flow graph built
- ✅ Branch coverage analyzed
- ✅ Unreachable code detected
- ✅ 10+ tests passing
- ✅ Catches 10% of bugs (logic gaps)

### AIVP Manifesto Complete When:
- ✅ All 4 phases implemented
- ✅ 45+ tests passing
- ✅ Catches 100% of targeted bug classes
- ✅ "System proves it correct" → TRUE
- ✅ "Launch without fear" → ACHIEVABLE

---

## Next Steps

1. **Create Phase 3 implementation branch**
   ```bash
   git checkout -b feature/endpoint-validation
   ```

2. **Start with ShepThon parser**
   - File: `src/solvers/shepthonParser.ts`
   - Parse model definitions
   - Extract endpoint signatures

3. **Build incrementally with TDD**
   - Write test first
   - Implement feature
   - Verify passes
   - Repeat

4. **Merge when Phase 3 complete**
   - All 15 tests passing
   - Integration verified
   - Documentation updated

**Estimated Time:** 4 weeks to 100% completion
