# Grammar Analysis: Current State vs Phase 0 Requirements
**Date:** November 21, 2025  
**Task:** 1.1 (Analyze Current Grammar)  
**Reference:** `.specify/tasks/phase-0-tasks.md` (Task 1.1)

---

## Current Grammar State

**File:** `sheplang/packages/language/src/shep.langium`  
**Lines:** 129  
**Status:** Partial implementation

### Currently Supported

#### 1. Top-Level Declarations
- ✅ `app` declarations (AppDecl)
- ✅ `data` declarations (DataDecl)
- ✅ `view` declarations (ViewDecl)
- ✅ `action` declarations (ActionDecl)

#### 2. Data Types (TypeRef)
- ✅ `text`
- ✅ `number`
- ✅ `yes/no` (boolean)
- ✅ `id`
- ✅ `date`
- ✅ `email`
- ✅ Custom ID references

#### 3. Statements
- ✅ `add` (AddStmt)
- ✅ `show` (ShowStmt)
- ✅ `call` (CallStmt) - HTTP methods (GET, POST, PUT, PATCH, DELETE)
- ✅ `load` (LoadStmt) - HTTP methods (GET, POST, PUT, PATCH, DELETE)
- ✅ `update` (UpdateStmt)
- ✅ `delete` (DeleteStmt)
- ✅ `if/else` (IfStmt)
- ✅ `for` (ForStmt) - both foreach and range
- ✅ Assignment (AssignStmt)
- ✅ Raw statements (RawStmt)

#### 4. Expressions
- ✅ Binary operators (and, or, ==, !=, <, >, <=, >=, +, -, *, /, %)
- ✅ Unary operators (not, -)
- ✅ Literals (number, string, boolean)
- ✅ Identifiers
- ✅ Field access (object.field)
- ✅ Function calls

#### 5. Widgets (Basic)
- ✅ `list` widget
- ✅ `button` widget

---

## Phase 0 Requirements vs Current State

### ✅ ALREADY SUPPORTED (No Changes Needed)

1. **Basic Entity Parsing**
   - Data declarations with fields
   - Field types (text, number, yes/no, id, date, email)
   - Custom type references via ID

2. **Basic Flow Parsing**
   - Actions with parameters
   - Statements (add, show, call, load, update, delete, if, for, assign)
   - HTTP methods (GET, POST, PUT, PATCH, DELETE)

3. **Basic Screen Parsing**
   - View declarations
   - List and button widgets

4. **Expression System**
   - Full expression hierarchy with proper precedence
   - Binary and unary operators
   - Literals and identifiers

---

## ❌ GAPS: Phase 0 Requirements NOT YET SUPPORTED

### 1. Extended Entity Field Types

**Required per `.specify/specs/aivp-stack-architecture.spec.md`:**
- ❌ `money` (currency type)
- ❌ `image` (file/media type)
- ❌ `datetime` (timestamp type)
- ❌ `enum[...]` (enumeration type with values)
- ❌ `ref[Entity]` (entity reference type)
- ❌ `array` suffix (e.g., `ref[Entity][]`, `image[]`)
- ❌ `richtext` (rich text editor type)
- ❌ `file` (file upload type)

**Current:** Only 6 basic types (text, number, yes/no, id, date, email)

**Gap:** Need to extend TypeRef rule to support complex types

---

### 2. Field Constraints

**Required per `.specify/specs/aivp-stack-architecture.spec.md`:**
- ❌ `required` constraint
- ❌ `unique` constraint
- ❌ `max` constraint (max length)
- ❌ `default` constraint (default value)
- ❌ `optional` constraint

**Current:** No constraint support in FieldDecl

**Gap:** Need to extend FieldDecl to include constraint modifiers

---

### 3. Flow Definitions

**Required per `.specify/specs/shepapi-workflows.spec.md`:**
- ❌ `flows` section (separate from actions)
- ❌ `from` (which screen triggers this flow)
- ❌ `trigger` (what user action triggers it)
- ❌ `steps` (multi-step workflow)
- ❌ `integrations` (which third-party services are used)
- ❌ `rules` (business rule enforcement)
- ❌ `notifications` (email, push, real-time)

**Current:** No flow declarations; only basic actions

**Gap:** Need new FlowDecl rule with all flow components

---

### 4. Screen Definitions (Comprehensive)

**Required per `.specify/specs/shepui-screen-kinds.spec.md`:**
- ❌ Screen `kind` (feed, detail, wizard, dashboard, inbox, list)
- ❌ Screen `entity` reference
- ❌ Screen `layout` (container, row, column, list, if/else, text, button, input)
- ❌ Screen `filters` (for feed/list screens)
- ❌ Screen `realtime` features (WebSocket subscriptions)
- ❌ Screen `actions` (button click handlers)

**Current:** Only basic view with list and button widgets

**Gap:** Need comprehensive ScreenDecl rule with all screen features

---

### 5. Integration Declarations

**Required per `.specify/specs/integration-hub.spec.md`:**
- ❌ `integrations` section
- ❌ Integration name (Stripe, Elasticsearch, S3, SendGrid, Twilio, Slack, Redis)
- ❌ Action declarations (e.g., `createPaymentIntent(amount, currency)`)
- ❌ Parameter definitions
- ❌ Return types

**Current:** No integration declarations

**Gap:** Need new IntegrationDecl rule with action definitions

---

### 6. Advanced Features

**Required per `.specify/specs/sheplang-advanced-syntax.spec.md`:**
- ❌ State machines (enum with transitions)
- ❌ Background jobs (scheduled tasks)
- ❌ Webhooks (event subscriptions)
- ❌ Real-time subscriptions (WebSocket)
- ❌ Complex validations (multi-field, cross-entity)
- ❌ Computed properties (derived values)
- ❌ Event emissions

**Current:** No support for any advanced features

**Gap:** Need new rules for each advanced feature type

---

## Summary: Grammar Gaps

| Feature | Current | Needed | Priority |
|---------|---------|--------|----------|
| Extended field types | 6 types | 12+ types | HIGH |
| Field constraints | None | 5+ constraints | HIGH |
| Flow definitions | None | Complete FlowDecl | HIGH |
| Screen definitions | Basic | Comprehensive | HIGH |
| Integration declarations | None | Complete IntegrationDecl | HIGH |
| Advanced features | None | 6+ features | MEDIUM |

---

## Implementation Strategy

### Phase 0 Week 1 Tasks (Tasks 1.2-1.5)

**Task 1.2: Extend Grammar for Entity Types**
- Add `money`, `image`, `datetime`, `enum[...]`, `ref[Entity]`, `array` suffixes
- Add field constraints (required, unique, max, default, optional)
- Update TypeRef rule

**Task 1.3: Extend Grammar for Flows**
- Create FlowDecl rule
- Add flow components (from, trigger, steps, integrations, rules, notifications)
- Add to TopDecl

**Task 1.4: Extend Grammar for Screens**
- Create ScreenDecl rule with comprehensive layout support
- Add screen kinds (feed, detail, wizard, dashboard, inbox, list)
- Add filters, realtime, actions
- Add to TopDecl

**Task 1.5: Extend Grammar for Integrations**
- Create IntegrationDecl rule
- Add action declarations with parameters and return types
- Add to TopDecl

---

## References

**Spec Files:**
- `.specify/specs/aivp-stack-architecture.spec.md` — Entity types and patterns
- `.specify/specs/shepapi-workflows.spec.md` — Flow patterns
- `.specify/specs/shepui-screen-kinds.spec.md` — Screen types
- `.specify/specs/integration-hub.spec.md` — Integration patterns
- `.specify/specs/sheplang-advanced-syntax.spec.md` — Advanced features

**Langium Documentation:**
- https://langium.org/docs/grammar-language/
- https://langium.org/docs/langium-in-5-minutes/

**Current Grammar:**
- `sheplang/packages/language/src/shep.langium`

---

## Next Steps

1. ✅ Task 1.1: Grammar analysis (THIS FILE)
2. → Task 1.2: Extend grammar for entity types
3. → Task 1.3: Extend grammar for flows
4. → Task 1.4: Extend grammar for screens
5. → Task 1.5: Extend grammar for integrations
6. → Task 1.6: Test parser

---

**Status:** ANALYSIS COMPLETE  
**Date:** November 21, 2025  
**Next Task:** 1.2 (Extend Grammar for Entity Types)
