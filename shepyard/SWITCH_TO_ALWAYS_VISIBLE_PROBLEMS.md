# Quick Switch: Always-Visible Problems Panel

## Overview

Quick guide to switch from the collapsible bottom panel to an always-visible problems section (as suggested in your example).

---

## Current Layout (Collapsible)

```
┌─────────────────────────────────────────────┐
│ Editor                  │   Preview          │
│                         │                    │
│                         │                    │
├─────────────────────────────────────────────┤
│ [Output][Problems][Terminal] ← Tabs         │
│ ─────────────────────────────────────────── │
│ (Content shown/hidden by user)              │
└─────────────────────────────────────────────┘
```

## New Layout (Always-Visible)

```
┌─────────────────────────────────────────────┐
│ Editor                  │   Preview          │
│                         │                    │
│                         │                    │
├─────────────────────────────────────────────┤
│ Problems (always visible, h-48)              │
│ - Errors + auto-fix                         │
│ - No tabs, dedicated                        │
└─────────────────────────────────────────────┘
```

---

## Changes Required

### File 1: `src/main.tsx`

**Find this section (around line 248-265):**

```typescript
{/* Bottom Panel */}
{showBottomPanel && (
  <>
    {/* Resize Handle */}
    <div
      onMouseDown={handleMouseDown}
      className="h-1 bg-vscode-border hover:bg-vscode-statusBar cursor-ns-resize transition-colors"
    />
    <div style={{ height: bottomPanelHeight }} className="border-t border-vscode-border">
      <BottomPanel 
        defaultTab={transpile.error ? 'problems' : 'output'}
        onClose={() => setShowBottomPanel(false)} 
      />
    </div>
  </>
)}

{/* Toggle Button (when collapsed) */}
{!showBottomPanel && (
  <button
    onClick={() => setShowBottomPanel(true)}
    className="h-6 bg-vscode-activityBar hover:bg-vscode-hover border-t border-vscode-border text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-center"
  >
    ▲ Show Panel
  </button>
)}
```

**Replace with:**

```typescript
{/* Problems Section - Always Visible */}
<div className="h-48 border-t border-gray-200 bg-gray-50">
  <ProblemsPanel showHeader={true} />
</div>
```

---

### File 2: `src/main.tsx` (cleanup state)

**Find this section (around line 208-210):**

```typescript
const [showBottomPanel, setShowBottomPanel] = React.useState(true);
const [bottomPanelHeight, setBottomPanelHeight] = React.useState(250);
const [isResizing, setIsResizing] = React.useState(false);
```

**Replace with:**

```typescript
// Removed: Bottom panel state (not needed for always-visible)
```

**And remove these handlers (around line 212-230):**

```typescript
const handleMouseDown = () => setIsResizing(true);

React.useEffect(() => {
  if (!isResizing) return;
  
  const handleMouseMove = (e: MouseEvent) => {
    const newHeight = window.innerHeight - e.clientY - 24;
    if (newHeight >= 100 && newHeight <= 600) {
      setBottomPanelHeight(newHeight);
    }
  };
  
  const handleMouseUp = () => setIsResizing(false);
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}, [isResizing]);
```

---

### File 3: `src/navigation/StatusBar.tsx`

**Find this section (around line 52-60):**

```typescript
{/* Problems - Clickable */}
<button
  onClick={onProblemsClick}
  className={`flex items-center space-x-1 hover:bg-vscode-hover px-2 py-0.5 rounded transition-colors ${
    problemCount > 0 ? 'text-red-400' : 'text-green-400'
  }`}
>
  <span>{problemCount > 0 ? '⚠️' : '✅'}</span>
  <span>{problemCount} {problemCount === 1 ? 'Problem' : 'Problems'}</span>
</button>
```

**Replace with (non-clickable since problems are always visible):**

```typescript
{/* Problems - Indicator only */}
<div className={`flex items-center space-x-1 px-2 py-0.5 ${
  problemCount > 0 ? 'text-red-400' : 'text-green-400'
}`}>
  <span>{problemCount > 0 ? '⚠️' : '✅'}</span>
  <span>{problemCount} {problemCount === 1 ? 'Problem' : 'Problems'}</span>
</div>
```

**And update the interface:**

```typescript
// BEFORE:
interface StatusBarProps {
  shepthonReady?: boolean;
  currentExample?: string;
  onProblemsClick?: () => void; // Remove this
}

// AFTER:
interface StatusBarProps {
  shepthonReady?: boolean;
  currentExample?: string;
}
```

**And in `main.tsx` StatusBar usage:**

```typescript
// BEFORE:
<StatusBar 
  shepthonReady={!!shepthonMetadata}
  currentExample={(activeExample || activeShepThonExample)?.name}
  onProblemsClick={() => setShowBottomPanel(true)} // Remove this
/>

// AFTER:
<StatusBar 
  shepthonReady={!!shepthonMetadata}
  currentExample={(activeExample || activeShepThonExample)?.name}
/>
```

---

## Complete Example (main.tsx)

Here's the complete relevant section after changes:

```typescript
import { ProblemsPanel } from './ui/ProblemsPanel';

function App() {
  // ... other code ...

  return (
    <ErrorBoundary FallbackComponent={GenericErrorFallback}>
      <div className="h-screen flex flex-col bg-vscode-bg">
        <TitleBar activePath={(activeExample || activeShepThonExample)?.name} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            <ResizableLayout
              leftPanel={leftPanel}
              centerPanel={centerPanel}
              rightPanel={rightPanel}
            />
          </div>
          
          {/* NEW: Problems Section - Always Visible */}
          <div className="h-48 border-t border-gray-200 bg-gray-50">
            <ProblemsPanel showHeader={true} />
          </div>
        </div>
        
        <StatusBar 
          shepthonReady={!!shepthonMetadata}
          currentExample={(activeExample || activeShepThonExample)?.name}
        />
      </div>
    </ErrorBoundary>
  );
}
```

---

## Optional: Add Resize Handle

If you want users to be able to resize the problems panel:

```typescript
const [problemsHeight, setProblemsHeight] = React.useState(192); // 48 * 4 = 192px
const [isResizing, setIsResizing] = React.useState(false);

const handleResizeStart = () => setIsResizing(true);

React.useEffect(() => {
  if (!isResizing) return;
  
  const handleMouseMove = (e: MouseEvent) => {
    const newHeight = window.innerHeight - e.clientY - 24; // 24 = statusbar height
    if (newHeight >= 100 && newHeight <= 600) {
      setProblemsHeight(newHeight);
    }
  };
  
  const handleMouseUp = () => setIsResizing(false);
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}, [isResizing]);

// In JSX:
<div 
  style={{ height: problemsHeight }}
  className="border-t border-gray-200 bg-gray-50 relative"
>
  {/* Resize handle */}
  <div
    onMouseDown={handleResizeStart}
    className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500 transition-colors z-10"
  />
  
  <ProblemsPanel showHeader={true} />
</div>
```

---

## Pros & Cons

### Pros of Always-Visible
✅ **Immediate feedback** - No need to click to see errors  
✅ **Simpler code** - Less state management  
✅ **Founder-friendly** - Always aware of code status  
✅ **No hidden issues** - Can't forget about errors  

### Cons of Always-Visible
❌ **Takes screen space** - Even when no errors  
❌ **No other tabs** - Lost Output, Terminal, CLI tabs  
❌ **Less flexible** - Can't maximize editor space  

---

## Hybrid Option

Keep both! Toggle between them:

```typescript
const [problemsMode, setProblemsMode] = React.useState<'always' | 'collapsible'>('always');

{problemsMode === 'always' ? (
  <div className="h-48 border-t">
    <ProblemsPanel showHeader={true} />
  </div>
) : (
  showBottomPanel && (
    <div className="h-64 border-t">
      <BottomPanel defaultTab="problems" />
    </div>
  )
)}

{/* Toggle button */}
<button onClick={() => setProblemsMode(prev => 
  prev === 'always' ? 'collapsible' : 'always'
)}>
  Toggle Mode
</button>
```

---

## Testing

After making changes:

1. **Start dev server:**
   ```bash
   cd shepyard
   pnpm run dev
   ```

2. **Verify:**
   - ✅ Problems section always visible at bottom
   - ✅ Shows "No problems detected" when clean
   - ✅ Shows errors with auto-fix when present
   - ✅ StatusBar still shows count
   - ✅ Auto-fix buttons work
   - ✅ Layout is responsive

3. **Test with error:**
   - Introduce typo: `endpoit GET "/users"`
   - Verify error appears immediately
   - Click auto-fix button
   - Verify fix applies and error clears

---

## Reverting Back

To revert to collapsible panel:

```bash
# Git revert (if committed)
git revert HEAD

# Or restore the files manually from PROBLEMS_PANEL_INTEGRATION_PATTERNS.md
```

---

## Summary

**3 files to modify:**
1. `src/main.tsx` - Replace bottom panel with always-visible section
2. `src/main.tsx` - Remove state/handlers (optional cleanup)
3. `src/navigation/StatusBar.tsx` - Make problems indicator non-clickable

**Total time:** ~5 minutes

**Result:** Problems are always visible, simpler code, more founder-friendly! ✅
