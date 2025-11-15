# Phase 3: Shepyard-ShepThon Integration Plan

**Date:** January 15, 2025  
**Status:** 📋 PLANNING  
**Goal:** Integrate ShepThon runtime into Shepyard for full-stack development

---

## 📋 Planning Phase Complete

### Documents Reviewed ✅
- ✅ TTD_ShepThon_Core.md (Section C3 - Shepyard Integration)
- ✅ ShepThon-Usecases/04_frontend-integration.md
- ✅ PRD_ShepYard_Alpha.md
- ✅ SDD_Shepyard_CDS_Alpha.md
- ✅ ShepThon-Usecases/01_dog-reminders.md

### Current State Assessment ✅
**Shepyard (Current):**
- ✅ Phase 5 complete (Alpha Release)
- ✅ ShepLang editor with Monaco
- ✅ Live preview with BobaScript rendering
- ✅ Explain panel for code insights
- ✅ Example browser system
- ✅ 32 passing tests
- ❌ **No ShepThon integration**

**ShepThon (Phase 2 Complete):**
- ✅ Full runtime implemented (6 components)
- ✅ 256/257 tests passing
- ✅ Dog Reminders E2E working
- ✅ InMemoryDatabase, EndpointRouter, JobScheduler
- ✅ Ready for integration

---

## 🎯 Phase 3 Goals (From TTD C3)

### C3.1 Backend Loader ✅
**Requirement:** Load `.shepthon` files in Shepyard

Implementation needs:
1. ShepThon parser service (similar to transpilerService.ts)
2. ShepThon runtime bootstrapper
3. Example `.shepthon` files
4. Integration with Shepyard's example system

### C3.2 ShepLang Bridge ✅
**Requirement:** Connect ShepLang actions to ShepThon endpoints

Implementation needs:
1. `callShepThonEndpoint(method, path, body)` function
2. Bridge service that routes calls to runtime
3. Integration with ShepLang's `call` and `load` semantics
4. Error handling for backend calls

### C3.3 Backend Panel UI ✅
**Requirement:** Show ShepThon app structure in Shepyard

Implementation needs:
1. Backend panel component
2. Display: app name, models, endpoints, jobs
3. Integration with sidebar/tabs system
4. Real-time updates from AST

---

## 🏗️ Architecture Plan

### File Structure

```
shepyard/
├── src/
│   ├── services/
│   │   ├── transpilerService.ts (existing)
│   │   ├── shepthonService.ts (NEW - parser + runtime)
│   │   └── bridgeService.ts (NEW - ShepLang ↔ ShepThon)
│   ├── backend-panel/ (NEW)
│   │   ├── BackendPanel.tsx
│   │   ├── ModelsList.tsx
│   │   ├── EndpointsList.tsx
│   │   └── JobsList.tsx
│   ├── examples/
│   │   ├── exampleList.ts (UPDATE - add .shepthon examples)
│   │   └── shepthon/ (NEW)
│   │       └── dog-reminders.shepthon
│   └── test/
│       └── integration/ (NEW)
│           └── shepyard-shepthon.test.ts
```

### Component Dependencies

```
┌─────────────────────────────────────┐
│         Shepyard UI                 │
├─────────────────────────────────────┤
│  Editor  │  Preview  │  Backend    │
│          │           │  Panel      │
└─────┬────┴─────┬─────┴──────┬──────┘
      │          │            │
      ├──────────┼────────────┘
      │          │
┌─────▼──────────▼────────┐
│   Bridge Service        │
│  (ShepLang ↔ ShepThon)  │
└─────────────┬───────────┘
              │
┌─────────────▼───────────┐
│   ShepThon Service      │
│  (Parser + Runtime)     │
└─────────────┬───────────┘
              │
┌─────────────▼───────────┐
│   ShepThon Runtime      │
│  (from Phase 2)         │
└─────────────────────────┘
```

---

## 📝 Implementation Order

### Step 1: ShepThon Service (Parser + Runtime Loader)
**Goal:** Load and run `.shepthon` files in Shepyard

**Files to Create:**
- `src/services/shepthonService.ts`

**Features:**
```typescript
interface ShepThonService {
  // Parse .shepthon source
  parseShepThon(source: string): ParseResult
  
  // Bootstrap runtime
  createRuntime(ast: ShepThonApp): ShepThonRuntime
  
  // Get current runtime
  getCurrentRuntime(): ShepThonRuntime | null
  
  // Extract metadata for UI
  getAppMetadata(ast: ShepThonApp): AppMetadata
}

interface AppMetadata {
  name: string
  models: ModelInfo[]
  endpoints: EndpointInfo[]
  jobs: JobInfo[]
}
```

**Integration:**
- Import from `@sheplang/shepthon` (Phase 2 package)
- Handle parse errors gracefully
- Cache runtime instance
- Provide metadata for UI

---

### Step 2: Bridge Service (ShepLang ↔ ShepThon)
**Goal:** Allow ShepLang to call ShepThon endpoints

**Files to Create:**
- `src/services/bridgeService.ts`

**Features:**
```typescript
interface BridgeService {
  // Main bridge function (TTD requirement)
  callShepThonEndpoint(
    method: HttpMethod,
    path: string,
    body?: any
  ): Promise<any>
  
  // Initialize with runtime
  setRuntime(runtime: ShepThonRuntime): void
  
  // Check if backend is loaded
  hasBackend(): boolean
}
```

**Integration:**
- Uses ShepThonRuntime from shepthonService
- Handles errors with user-friendly messages
- Logs calls for debugging
- Returns JSON data for ShepLang state

**Usage Example:**
```typescript
// In ShepLang action handler:
const reminders = await bridge.callShepThonEndpoint('GET', '/reminders');
// Set to component state
```

---

### Step 3: Backend Panel UI
**Goal:** Show ShepThon app structure in Shepyard

**Files to Create:**
- `src/backend-panel/BackendPanel.tsx` (main container)
- `src/backend-panel/ModelsList.tsx` (models display)
- `src/backend-panel/EndpointsList.tsx` (endpoints display)
- `src/backend-panel/JobsList.tsx` (jobs display)

**Features:**
```typescript
interface BackendPanelProps {
  metadata: AppMetadata | null
  onStartJobs: () => void
  onStopJobs: () => void
}
```

**UI Design:**
```
┌─────────────────────────────┐
│  Backend (DogReminders)     │
├─────────────────────────────┤
│  📦 Models (1)              │
│    • Reminder               │
│      - id: id               │
│      - text: string         │
│      - time: datetime       │
│      - done: bool           │
├─────────────────────────────┤
│  🌐 Endpoints (2)           │
│    • GET /reminders         │
│      → [Reminder]           │
│    • POST /reminders        │
│      (text, time) → Reminder│
├─────────────────────────────┤
│  ⏰ Jobs (1)                │
│    • mark-due-as-done       │
│      every 5 minutes        │
│      [Start] [Stop]         │
└─────────────────────────────┘
```

**Integration:**
- Add to Shepyard's panel system
- Subscribe to shepthonService updates
- Display real-time job status
- Handle empty state (no backend loaded)

---

### Step 4: Example Integration
**Goal:** Add Dog Reminders `.shepthon` example

**Files to Create:**
- `src/examples/shepthon/dog-reminders.shepthon`

**Content:**
```shepthon
app DogReminders {
  model Reminder {
    id: id
    text: string
    time: datetime
    done: bool = false
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
```

**Files to Update:**
- `src/examples/exampleList.ts` - Add shepthon examples

**Integration:**
- Detect `.shepthon` file extension
- Load with shepthonService instead of transpilerService
- Show backend panel when `.shepthon` loaded
- Hide backend panel when `.shep` loaded

---

### Step 5: E2E Integration Test
**Goal:** Verify full stack works

**Files to Create:**
- `test/integration/shepyard-shepthon.test.ts`

**Test Scenarios:**
```typescript
describe('Shepyard-ShepThon Integration', () => {
  it('should load .shepthon file', () => {})
  it('should parse ShepThon and create runtime', () => {})
  it('should display backend metadata in UI', () => {})
  it('should call GET endpoint via bridge', () => {})
  it('should call POST endpoint via bridge', () => {})
  it('should start/stop jobs', () => {})
  it('should handle parse errors gracefully', () => {})
  it('should handle runtime errors gracefully', () => {})
})
```

**E2E Workflow:**
1. Load dog-reminders.shepthon
2. Runtime initialized
3. Backend panel shows models/endpoints/jobs
4. Call GET /reminders → returns []
5. Call POST /reminders → creates reminder
6. Call GET /reminders → returns [reminder]
7. Start jobs → job runs periodically
8. Verify reminders updated

---

## 🔧 Technical Considerations

### Import Strategy
**Challenge:** Shepyard is outside sheplang workspace

**Solution:**
```typescript
// In shepthonService.ts
import { parseShepThon } from '../../../sheplang/packages/shepthon/dist/parser.js';
import { ShepThonRuntime } from '../../../sheplang/packages/shepthon/dist/runtime/index.js';
```

**Alternative:** Add to package.json
```json
{
  "dependencies": {
    "@sheplang/shepthon": "workspace:*"
  }
}
```

### State Management
**Current:** Shepyard uses Zustand for state

**Integration:**
```typescript
interface ShepyardStore {
  // Existing ShepLang state
  currentExample: Example | null
  bobaCode: string | null
  
  // NEW ShepThon state
  shepthonRuntime: ShepThonRuntime | null
  backendMetadata: AppMetadata | null
  jobsRunning: boolean
  
  // Actions
  loadShepThonExample: (source: string) => void
  callEndpoint: (method, path, body) => Promise<any>
  startJobs: () => void
  stopJobs: () => void
}
```

### Error Handling
**Parse Errors:**
- Show in explain panel (similar to ShepLang)
- Display human-readable message
- Don't crash UI

**Runtime Errors:**
- Catch in bridge service
- Show error in preview panel
- Log to console for debugging

**No Backend Loaded:**
- Show empty state in backend panel
- Disable bridge calls
- Clear UI when switching to .shep file

---

## 🎓 Integration Patterns

### Pattern 1: Service Layer
```typescript
// shepthonService.ts handles ShepThon specifics
const runtime = await shepthonService.createRuntime(ast);

// bridgeService.ts provides clean API
const data = await bridge.callShepThonEndpoint('GET', '/reminders');
```

### Pattern 2: UI Components
```typescript
// BackendPanel.tsx - Container
<BackendPanel metadata={metadata} />

// Sub-components for each section
<ModelsList models={metadata.models} />
<EndpointsList endpoints={metadata.endpoints} />
<JobsList jobs={metadata.jobs} />
```

### Pattern 3: Example Detection
```typescript
// In example loader
if (example.filename.endsWith('.shepthon')) {
  // Load as backend
  const runtime = await shepthonService.load(example.content);
  showBackendPanel();
} else if (example.filename.endsWith('.shep')) {
  // Load as frontend
  const boba = await transpilerService.load(example.content);
  hideBackendPanel();
}
```

---

## ✅ Success Criteria (From TTD D)

1. ✅ **ShepThon can describe at least one non-trivial app (Dog Reminders)**
   - dog-reminders.shepthon example loads
   - Backend panel shows all metadata

2. ✅ **Shepyard can use ShepThon to serve real responses**
   - Bridge service working
   - Endpoints callable via bridge
   - Data flows correctly

3. ✅ **ShepLang screens can call ShepThon endpoints**
   - `callShepThonEndpoint()` available
   - Future: ShepLang actions can use it
   - (ShepLang syntax updates are Phase 4)

4. ✅ **Founders can see their backend model/endpoint/job map from the UI**
   - Backend panel implemented
   - Shows models, endpoints, jobs
   - Real-time updates

5. ✅ **The entire system is dev-only and does not introduce infra complexity**
   - In-memory only (Phase 2 guarantee)
   - No external services
   - Local-first architecture

---

## 📊 Estimated Scope

### Files to Create (9 new files)
1. `src/services/shepthonService.ts` (~200 lines)
2. `src/services/bridgeService.ts` (~150 lines)
3. `src/backend-panel/BackendPanel.tsx` (~200 lines)
4. `src/backend-panel/ModelsList.tsx` (~100 lines)
5. `src/backend-panel/EndpointsList.tsx` (~100 lines)
6. `src/backend-panel/JobsList.tsx` (~100 lines)
7. `src/examples/shepthon/dog-reminders.shepthon` (~50 lines)
8. `test/integration/shepyard-shepthon.test.ts` (~300 lines)
9. `Project-scope/PHASE3_COMPLETION_SUMMARY.md` (this file)

### Files to Update (2 files)
1. `src/examples/exampleList.ts` (~20 lines added)
2. `src/main.tsx` or store (~50 lines added)

**Total Estimated Lines:** ~1,270 new lines + 70 updated lines

### Test Coverage Target
- Unit tests: 15-20 tests for services
- Integration tests: 8-10 tests for E2E workflow
- **Total:** ~25-30 new tests

---

## 🚀 Implementation Strategy

### Approach: Incremental + Tested
**Phase 2 Proven Formula:**
1. Build one component at a time
2. Test immediately after implementation
3. Verify integration before moving on
4. Commit after each complete feature

### Order of Implementation
```
Day 1: Services Layer
├─ shepthonService.ts (parse + runtime)
├─ Test shepthonService
├─ bridgeService.ts (endpoint calls)
└─ Test bridgeService

Day 2: UI Layer
├─ BackendPanel.tsx (container)
├─ ModelsList.tsx
├─ EndpointsList.tsx
├─ JobsList.tsx
└─ Test UI components

Day 3: Integration
├─ dog-reminders.shepthon example
├─ Update exampleList.ts
├─ Wire to Shepyard store
└─ E2E integration test

Day 4: Polish + Verify
├─ Error handling
├─ Empty states
├─ Documentation
└─ pnpm run verify GREEN
```

---

## 🔍 Risk Assessment

### Low Risk ✅
- **ShepThon Runtime:** Already tested (256/257 tests passing)
- **Shepyard Architecture:** Stable (Phase 5 complete)
- **Service Pattern:** Proven with transpilerService.ts
- **Example System:** Already working

### Medium Risk ⚠️
- **Import Strategy:** Shepyard outside workspace
  - **Mitigation:** Test imports early, add to package.json if needed
- **State Management:** Zustand integration
  - **Mitigation:** Follow existing patterns in Shepyard
- **UI Panel System:** New panel type
  - **Mitigation:** Study existing preview/explain panels

### Zero Risk 🛡️
- **Breaking Changes:** None - additive only
- **Locked Packages:** Not modifying any
- **Shepyard Phases 1-5:** Already complete, won't touch

---

## 📋 Pre-Implementation Checklist

Before coding:
- ✅ TTD Section C3 fully understood
- ✅ Usecase 04 (frontend-integration) reviewed
- ✅ ShepThon Phase 2 complete and verified
- ✅ Shepyard Phase 5 complete and working
- ✅ Architecture plan documented
- ✅ File structure planned
- ✅ Implementation order defined
- ✅ Success criteria clear
- ✅ Test strategy defined

---

## 🎯 Definition of Done

Phase 3 is complete when:
1. ✅ shepthonService.ts working (parse + runtime)
2. ✅ bridgeService.ts working (endpoint calls)
3. ✅ Backend panel UI implemented
4. ✅ Dog Reminders `.shepthon` example loads
5. ✅ GET /reminders works via bridge
6. ✅ POST /reminders works via bridge
7. ✅ Jobs can be started/stopped
8. ✅ Backend metadata displays in UI
9. ✅ 25+ integration tests passing
10. ✅ `pnpm run verify` GREEN
11. ✅ No breaking changes to Shepyard or ShepThon
12. ✅ Phase 3 completion summary written

---

## 🔗 References

### Specifications
- TTD_ShepThon_Core.md (Section C3)
- ShepThon-Usecases/04_frontend-integration.md
- PRD_ShepYard_Alpha.md
- SDD_Shepyard_CDS_Alpha.md

### Existing Code
- Shepyard transpilerService.ts (pattern reference)
- Shepyard example system (integration reference)
- ShepThon Phase 2 runtime (backend implementation)

### External Resources
- (Will research as needed during implementation)

---

**Status:** ✅ PLAN COMPLETE - Ready for Implementation  
**Next Step:** Implement shepthonService.ts  
**Confidence:** HIGH (proven patterns from Phase 2 + Shepyard Phase 5)
