# 🔧 Alpha Readiness Fix Guide
**Estimated Time:** 8-12 hours total

---

## 🔴 Fix 1: Connect CallStmt to Bridge (4-6 hours)

### Step 1.1: Update types.ts (15 min)
**File:** `sheplang/packages/language/src/types.ts`

**Add new operation types:**
```typescript
export type AppModel = {
  name: string;
  __location?: SourceLocation;
  datas: { name: string; fields: { name: string; type: string }[]; rules: string[]; __location?: SourceLocation; }[];
  views: { name: string; list?: string; buttons: { label: string; action: string; __location?: SourceLocation }[]; __location?: SourceLocation; }[];
  actions: {
    name: string;
    params: { name: string; type?: string }[];
    ops: (
      | { kind: 'add'; data: string; fields: Record<string, string> }
      | { kind: 'show'; view: string }
      | { kind: 'raw'; text: string }
      // ADD THESE TWO:
      | { kind: 'call'; method: string; path: string; args?: any[] }
      | { kind: 'load'; method: string; path: string; target: string }
    )[];
    __location?: SourceLocation;
  }[];
};
```

---

### Step 1.2: Update mapper.ts (30 min)
**File:** `sheplang/packages/language/src/mapper.ts`

**Replace lines 135-142:**
```typescript
// CURRENT (BROKEN):
} else if (stmt.$type === 'CallStmt') {
  return { kind: 'raw', text: `call ${stmt.method} ${stmt.path}` };
} else if (stmt.$type === 'LoadStmt') {
  return { kind: 'raw', text: `load ${stmt.method} ${stmt.path} into ${stmt.target}` };
} else {
  return { kind: 'raw', text: stmt.text };
}

// REPLACE WITH:
} else if (stmt.$type === 'CallStmt') {
  return { 
    kind: 'call', 
    method: stmt.method, 
    path: stmt.path.replace(/['"]/g, ''),  // Remove quotes from string literal
    args: stmt.args?.map(arg => mapExpr(arg)) || []
  };
} else if (stmt.$type === 'LoadStmt') {
  return { 
    kind: 'load', 
    method: stmt.method, 
    path: stmt.path.replace(/['"]/g, ''),
    target: stmt.target
  };
} else {
  return { kind: 'raw', text: stmt.text };
}
```

---

### Step 1.3: Rebuild language package (5 min)
```bash
cd sheplang/packages/language
pnpm run build
```

---

### Step 1.4: Rebuild adapter (5 min)
```bash
cd adapters/sheplang-to-boba  
pnpm run build
```

---

## 🔴 Fix 2: Implement Action Execution (3-4 hours)

### Step 2.1: Add state to BobaRenderer (30 min)
**File:** `shepyard/src/preview/BobaRenderer.tsx`

**Add after line 90:**
```typescript
const [currentRoute, setCurrentRoute] = useState<string>('/');
const [actionLog, setActionLog] = useState<string[]>([]);
const navigateToLine = useWorkspaceStore((state) => state.navigateToLine);

// ADD THESE:
const [state, setState] = useState<Record<string, any>>({});
const [isExecutingAction, setIsExecutingAction] = useState(false);
```

---

### Step 2.2: Create handleAction function (1 hour)
**File:** `shepyard/src/preview/BobaRenderer.tsx`

**Add after line 106:**
```typescript
// Import bridge at top of file
import { callShepThonEndpoint } from '../services/bridgeService';

// Add this function after click-to-navigate handler
const handleAction = useCallback(async (actionName: string, params: Record<string, any> = {}) => {
  // Find the action in app
  const action = app.actions?.find(a => a.name === actionName);
  if (!action) {
    console.error(`Action not found: ${actionName}`);
    return;
  }

  setIsExecutingAction(true);
  console.log(`[Action] Executing: ${actionName}`, params);

  try {
    // Execute each operation in the action
    for (const op of action.ops) {
      if (op.kind === 'call') {
        // Call ShepThon endpoint
        console.log(`[Action] Calling ${op.method} ${op.path}`);
        const result = await callShepThonEndpoint(op.method, op.path, params);
        console.log(`[Action] Result:`, result);
        
        // Log the action
        setActionLog(prev => [...prev, `${op.method} ${op.path} → Success`]);
        
      } else if (op.kind === 'load') {
        // Load data into state
        console.log(`[Action] Loading ${op.method} ${op.path} into ${op.target}`);
        const result = await callShepThonEndpoint(op.method, op.path, params);
        console.log(`[Action] Loaded:`, result);
        
        // Store in state
        setState(prev => ({
          ...prev,
          [op.target]: result
        }));
        
        setActionLog(prev => [...prev, `Loaded ${op.target}: ${Array.isArray(result) ? result.length : 1} items`]);
        
      } else if (op.kind === 'show') {
        // Navigate to view
        console.log(`[Action] Showing view: ${op.view}`);
        setCurrentRoute('/' + op.view);
        
      } else if (op.kind === 'add') {
        // Add operation (not yet implemented - would need backend)
        console.log(`[Action] Add to ${op.data}:`, op.fields);
        setActionLog(prev => [...prev, `Added to ${op.data}`]);
        
      } else if (op.kind === 'raw') {
        // Raw statement (log only)
        console.log(`[Action] Raw:`, op.text);
        setActionLog(prev => [...prev, op.text]);
      }
    }
    
    console.log(`[Action] ${actionName} completed`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Action] ${actionName} failed:`, errorMessage);
    setActionLog(prev => [...prev, `❌ Error: ${errorMessage}`]);
  } finally {
    setIsExecutingAction(false);
  }
}, [app, setCurrentRoute, setActionLog, setState]);
```

---

### Step 2.3: Wire buttons to actions (1 hour)
**File:** `shepyard/src/hooks/useTranspile.ts`

**Modify createBobaAppFromAst (around line 131-142):**
```typescript
// CURRENT:
...(viewData?.buttons?.map((button: any) => ({
  type: 'button',
  props: {
    className: 'mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700',
    ...(button.__location && {
      'data-shep-line': button.__location.startLine,
      'data-shep-end-line': button.__location.endLine,
      'data-shep-type': 'button'
    })
  },
  children: [button.label]
})) || [])

// REPLACE WITH:
...(viewData?.buttons?.map((button: any) => ({
  type: 'button',
  props: {
    className: 'mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer',
    onClick: () => {
      // Execute the button's action
      const actionName = button.action;
      if (window.bobaActionHandler) {
        window.bobaActionHandler(actionName, {});
      }
    },
    ...(button.__location && {
      'data-shep-line': button.__location.startLine,
      'data-shep-end-line': button.__location.endLine,
      'data-shep-type': 'button'
    })
  },
  children: [button.label]
})) || [])
```

---

### Step 2.4: Expose handleAction globally (15 min)
**File:** `shepyard/src/preview/BobaRenderer.tsx`

**Add useEffect:**
```typescript
// Add after handleAction definition
useEffect(() => {
  // Expose action handler globally so buttons can call it
  (window as any).bobaActionHandler = handleAction;
  
  return () => {
    delete (window as any).bobaActionHandler;
  };
}, [handleAction]);
```

---

### Step 2.5: Display state in UI (30 min)
**File:** `shepyard/src/preview/BobaRenderer.tsx`

**Add before the closing div (around line 227):**
```typescript
{/* State Debug Panel */}
{Object.keys(state).length > 0 && (
  <div className="border-t border-gray-300 bg-gray-50 p-4">
    <h3 className="font-semibold text-gray-700 mb-2">Loaded Data</h3>
    <div className="max-h-48 overflow-y-auto">
      {Object.entries(state).map(([key, value]) => (
        <div key={key} className="mb-2 p-2 bg-white rounded border border-gray-200">
          <div className="font-mono text-sm text-indigo-600">{key}</div>
          <div className="text-xs text-gray-600 font-mono">
            {Array.isArray(value) ? (
              <div>{value.length} items: {JSON.stringify(value, null, 2)}</div>
            ) : (
              <div>{JSON.stringify(value, null, 2)}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## 🔴 Fix 3: Add InitApp Auto-Execution (1 hour)

### Step 3.1: Auto-run InitApp action
**File:** `shepyard/src/preview/BobaRenderer.tsx`

**Add useEffect:**
```typescript
// Auto-execute InitApp action if it exists
useEffect(() => {
  if (app && app.actions) {
    const initAction = app.actions.find(a => a.name === 'InitApp');
    if (initAction && handleAction) {
      console.log('[App] Auto-executing InitApp');
      handleAction('InitApp', {});
    }
  }
}, [app, handleAction]);
```

---

## 🟡 Fix 4: Error Display (1 hour)

### Step 4.1: Add error state
**File:** `shepyard/src/preview/BobaRenderer.tsx`

**Add state:**
```typescript
const [apiError, setApiError] = useState<string | null>(null);
```

**Update handleAction:**
```typescript
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[Action] ${actionName} failed:`, errorMessage);
  setApiError(errorMessage);  // ADD THIS
  setActionLog(prev => [...prev, `❌ Error: ${errorMessage}`]);
}
```

**Add error display:**
```typescript
{/* Error Display */}
{apiError && (
  <div className="border-t border-red-300 bg-red-50 p-4">
    <div className="flex justify-between items-center">
      <h3 className="font-semibold text-red-700">⚠️ Error</h3>
      <button
        onClick={() => setApiError(null)}
        className="text-sm text-red-600 hover:text-red-800"
      >
        Dismiss
      </button>
    </div>
    <div className="mt-2 text-sm text-red-600 font-mono">{apiError}</div>
  </div>
)}
```

---

## 🟡 Fix 5: Loading States (1 hour)

**Add loading indicator:**
```typescript
{isExecutingAction && (
  <div className="fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg">
    <div className="flex items-center gap-2">
      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
      <span>Executing action...</span>
    </div>
  </div>
)}
```

---

## Testing Checklist

### After Fix 1-3 (Core Functionality):
```bash
# 1. Rebuild everything
cd sheplang/packages/language && pnpm run build
cd ../../../adapters/sheplang-to-boba && pnpm run build  
cd ../../shepyard && pnpm run build && pnpm run dev

# 2. Open browser
# 3. Load "Dog Reminders (Backend)"
# 4. Load "Dog Reminders (Frontend)"
# 5. Open console
# 6. Check for:
```

**Expected Console Output:**
```
[ShepThon] Loaded successfully: DogReminders
[App] Auto-executing InitApp
[Action] Executing: InitApp
[Action] Executing: LoadReminders
[Action] Loading GET /reminders into reminders
[Bridge] Calling GET /reminders
[Bridge] GET /reminders → Success []
[Action] Loaded: []
[Action] LoadReminders completed
[Action] InitApp completed
```

**Expected UI:**
- ✅ "Loaded Data" panel shows `reminders: [] (0 items)`
- ✅ No errors in console
- ✅ Action log shows "Loaded reminders: 0 items"

### Test POST (manual):
```javascript
// In console:
window.bobaActionHandler('AddReminder', { 
  text: 'Walk the dog', 
  time: new Date() 
});
```

**Expected:**
- ✅ POST called
- ✅ Reminder created
- ✅ LoadReminders auto-executes
- ✅ State updates to show 1 reminder

---

## Estimated Timeline

| Task | Time | Status |
|------|------|--------|
| Fix 1: Types & Mapper | 1 hour | 🔴 Critical |
| Fix 2: Action Execution | 3 hours | 🔴 Critical |
| Fix 3: InitApp Auto-run | 1 hour | 🔴 Critical |
| Fix 4: Error Display | 1 hour | 🟡 Important |
| Fix 5: Loading States | 1 hour | 🟡 Important |
| Testing & Debugging | 2 hours | 🔴 Critical |
| **Total** | **9 hours** | |

**Start:** Today 3pm  
**End:** Today 12am (midnight)  
**Alpha Ready:** Tomorrow

---

## Success Criteria

After all fixes:
- ✅ Dog Reminders E2E works
- ✅ User can add reminder via console
- ✅ Reminders appear in preview
- ✅ No console errors
- ✅ Bridge integration complete
- ✅ State management working
- ✅ Ready for real user testing
