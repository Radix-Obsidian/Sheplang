# ProblemsPanel Integration Patterns

## Overview

The `ProblemsPanel` component is fully reusable and can be integrated in multiple ways depending on your layout preferences. Here are the most common patterns.

---

## Pattern 1: Collapsible Bottom Panel (Current Implementation) ✅

**Best for:** VS Code-style IDE with multiple bottom panel tabs

### Layout
```
┌─────────────────────────────────────────────┐
│ Editor                  │   Preview          │
│                         │                    │
│                         │                    │
├─────────────────────────────────────────────┤
│ [Output] [Problems] [Terminal] [CLI]        │ ← Tabs
│ ─────────────────────────────────────────── │
│ ProblemsPanel content here...               │
│ - Errors displayed with auto-fix            │
│ - Collapsible/resizable                     │
└─────────────────────────────────────────────┘
│ ⚡ ShepThon Ready │ ⚠️ 2 Problems          │ ← StatusBar
└─────────────────────────────────────────────┘
```

### Implementation

**In `src/main.tsx`:**
```typescript
const [showBottomPanel, setShowBottomPanel] = useState(true);

return (
  <div className="h-screen flex flex-col">
    {/* Main content */}
    <div className="flex-1">
      <ResizableLayout
        leftPanel={<ProjectPanel />}
        centerPanel={<CodeEditor />}
        rightPanel={<PreviewPanel />}
      />
    </div>
    
    {/* Bottom Panel */}
    {showBottomPanel && (
      <div className="border-t">
        <BottomPanel 
          defaultTab={transpile.error ? 'problems' : 'output'}
          onClose={() => setShowBottomPanel(false)} 
        />
      </div>
    )}
    
    {/* StatusBar */}
    <StatusBar 
      onProblemsClick={() => setShowBottomPanel(true)}
    />
  </div>
);
```

**In `src/panel/ProblemsView.tsx`:**
```typescript
import { ProblemsPanel } from '../ui/ProblemsPanel';

export function ProblemsView() {
  return (
    <div className="h-full overflow-hidden">
      <ProblemsPanel showHeader={false} />
    </div>
  );
}
```

**Pros:**
- ✅ Space-efficient (can be hidden)
- ✅ Multiple tabs (Output, Terminal, etc.)
- ✅ Familiar to VS Code users
- ✅ Resizable height

**Cons:**
- ❌ Requires extra click to view
- ❌ More complex state management

---

## Pattern 2: Always-Visible Bottom Section (Your Suggestion)

**Best for:** Simple layout where errors are always visible

### Layout
```
┌─────────────────────────────────────────────┐
│ Editor                  │   Preview          │
│                         │                    │
│                         │                    │
├─────────────────────────────────────────────┤
│ Problems (always visible, fixed height)      │
│ - Errors displayed with auto-fix             │
│ - No tabs, dedicated space                   │
└─────────────────────────────────────────────┘
```

### Implementation

**In `src/main.tsx`:**
```typescript
import { ProblemsPanel } from './ui/ProblemsPanel';

export function App() {
  return (
    <div className="h-screen flex flex-col">
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Project Panel */}
        <div className="w-64 border-r">
          <ProjectPanel />
        </div>
        
        {/* Center: Editor */}
        <div className="flex-1">
          <ShepCodeViewer source={source} />
        </div>
        
        {/* Right: Preview */}
        <div className="flex-1 border-l">
          <BobaRenderer app={bobaApp} />
        </div>
      </div>
      
      {/* NEW: Problems Section - Always Visible */}
      <div className="h-48 border-t">
        <ProblemsPanel showHeader={true} />
      </div>
      
      {/* StatusBar */}
      <StatusBar />
    </div>
  );
}
```

**Pros:**
- ✅ Errors always visible
- ✅ Simpler state management
- ✅ No need to click to view
- ✅ Immediate feedback

**Cons:**
- ❌ Takes up screen space always
- ❌ No other bottom panel tabs
- ❌ Fixed height (unless you add resize logic)

---

## Pattern 3: Floating/Modal Panel

**Best for:** Minimal UI with on-demand error display

### Layout
```
┌─────────────────────────────────────────────┐
│                                              │
│    Editor                    Preview        │
│                                              │
│         ┌─────────────────────┐             │
│         │ Problems Panel      │ ← Floating  │
│         │ (draggable/modal)   │             │
│         └─────────────────────┘             │
│                                              │
└─────────────────────────────────────────────┘
```

### Implementation

```typescript
const [showProblemsModal, setShowProblemsModal] = useState(false);

return (
  <>
    <div className="h-screen">
      {/* Main layout */}
      <MainContent />
      
      {/* StatusBar with problems indicator */}
      <StatusBar 
        onProblemsClick={() => setShowProblemsModal(true)}
      />
    </div>
    
    {/* Floating Problems Modal */}
    {showProblemsModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[80vh] w-full m-4">
          <ProblemsPanel 
            showHeader={true}
            onClose={() => setShowProblemsModal(false)}
          />
        </div>
      </div>
    )}
  </>
);
```

**Pros:**
- ✅ Maximum screen space when not viewing errors
- ✅ Focus on errors when needed
- ✅ Can be draggable

**Cons:**
- ❌ Overlays content
- ❌ Requires modal state management

---

## Pattern 4: Sidebar Integration

**Best for:** Wide screens with dedicated right sidebar

### Layout
```
┌────────────────────────────────────────────┐
│ Project │ Editor        │ Preview │Problems│
│  Tree   │               │         │        │
│         │               │         │ [List] │
│         │               │         │ [of]   │
│         │               │         │ [Errs] │
└────────────────────────────────────────────┘
```

### Implementation

```typescript
<div className="h-screen flex">
  {/* Left sidebar */}
  <div className="w-64">
    <ProjectPanel />
  </div>
  
  {/* Main content */}
  <div className="flex-1 flex">
    <div className="flex-1">
      <ShepCodeViewer />
    </div>
    <div className="flex-1">
      <PreviewPanel />
    </div>
  </div>
  
  {/* Right sidebar: Problems */}
  <div className="w-80 border-l">
    <ProblemsPanel showHeader={true} />
  </div>
</div>
```

**Pros:**
- ✅ Always visible
- ✅ Good use of wide screens
- ✅ Doesn't steal vertical space

**Cons:**
- ❌ Takes horizontal space
- ❌ Not ideal for narrow screens

---

## Pattern 5: Inline Error Display

**Best for:** Minimal, focused error view directly in editor area

### Layout
```
┌─────────────────────────────────────────────┐
│ Editor                  │   Preview          │
│                         │                    │
│ ▼ 2 Problems            │                    │
│ ├─ Unknown keyword...   │                    │
│ └─ Missing end...       │                    │
└─────────────────────────────────────────────┘
```

### Implementation

```typescript
<div className="editor-area">
  {/* Editor with inline problems */}
  <div className="flex-1">
    <ShepCodeViewer />
  </div>
  
  {/* Inline problems (collapsible) */}
  {transpile.error && (
    <div className="max-h-32 overflow-auto border-t">
      <ProblemsPanel showHeader={false} />
    </div>
  )}
</div>
```

**Pros:**
- ✅ Contextual to editor
- ✅ Only shows when errors exist
- ✅ Doesn't affect preview

**Cons:**
- ❌ Limited space
- ❌ May overlap editor content

---

## Pattern 6: Hybrid (Current + Always-Visible)

**Best for:** Maximum flexibility

### Layout
```
┌─────────────────────────────────────────────┐
│ Editor                  │   Preview          │
│                         │                    │
├─────────────────────────────────────────────┤
│ Quick problems summary (1 line)              │ ← Always visible
├─────────────────────────────────────────────┤
│ [Output] [Problems] [Terminal]               │ ← Collapsible detail
│ Detailed problems panel...                   │
└─────────────────────────────────────────────┘
```

### Implementation

```typescript
<div className="h-screen flex flex-col">
  {/* Main content */}
  <div className="flex-1">
    <MainLayout />
  </div>
  
  {/* Quick problems summary - Always visible */}
  <div className="h-8 border-t bg-gray-50 px-4 flex items-center justify-between">
    <ProblemsCounter 
      onClick={() => setShowDetail(true)}
    />
    <span className="text-xs text-gray-500">
      Click for details
    </span>
  </div>
  
  {/* Detailed bottom panel - Collapsible */}
  {showDetail && (
    <div className="h-64 border-t">
      <BottomPanel defaultTab="problems" />
    </div>
  )}
</div>
```

**Pros:**
- ✅ Best of both worlds
- ✅ Quick glance + detailed view
- ✅ Flexible

**Cons:**
- ❌ Most complex implementation

---

## Comparison Table

| Pattern | Visibility | Space Usage | Complexity | Best For |
|---------|-----------|-------------|------------|----------|
| **Collapsible Panel** ✅ | On-demand | Efficient | Medium | VS Code-style IDE |
| **Always-Visible** | Always | Medium | Low | Simple apps |
| **Floating/Modal** | On-demand | Maximum | Medium | Minimal UI |
| **Sidebar** | Always | Medium | Low | Wide screens |
| **Inline** | Conditional | Low | Low | Editor-focused |
| **Hybrid** | Both | Flexible | High | Power users |

---

## Switching Implementations

### From Current (Collapsible) to Always-Visible

**Step 1:** Remove BottomPanel complexity in `main.tsx`

```typescript
// BEFORE:
{showBottomPanel && (
  <BottomPanel defaultTab="problems" />
)}

// AFTER:
<div className="h-48 border-t">
  <ProblemsPanel showHeader={true} />
</div>
```

**Step 2:** Update StatusBar (optional)

```typescript
// Remove click handler since problems are always visible
<StatusBar 
  // onProblemsClick={() => ...} // Remove this
/>
```

**Step 3:** Add resize handle (optional)

```typescript
const [problemsHeight, setProblemsHeight] = useState(192); // 48 * 4

<div 
  style={{ height: problemsHeight }}
  className="border-t relative"
>
  {/* Resize handle */}
  <div 
    className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500"
    onMouseDown={handleResizeStart}
  />
  
  <ProblemsPanel showHeader={true} />
</div>
```

---

## Recommended Approach

### For ShepYard (Current)
**Pattern 1: Collapsible Bottom Panel** ✅

**Rationale:**
- Professional IDE experience
- Space-efficient for tutorials/examples
- Multiple tabs for different concerns
- Familiar to developers

### For Production Apps
**Pattern 6: Hybrid** or **Pattern 2: Always-Visible**

**Rationale:**
- Founders need immediate error feedback
- Simpler mental model
- Always aware of code state
- Less clicking needed

---

## Code Reusability

All patterns use the same `ProblemsPanel` component:

```typescript
// Core component stays the same
<ProblemsPanel 
  showHeader={boolean}
  onClose={() => void}
  className={string}
/>
```

**Just change the layout wrapper!**

---

## Quick Start: Your Suggested Pattern

To implement the always-visible bottom section (Pattern 2):

```typescript
// In src/main.tsx, replace the bottom panel section:

{/* REMOVE this: */}
{showBottomPanel && (
  <div className="h-64">
    <BottomPanel />
  </div>
)}

{/* ADD this: */}
<div className="h-48 border-t border-gray-200">
  <ProblemsPanel showHeader={true} />
</div>
```

That's it! The ProblemsPanel will now be always visible.

---

## Documentation

- **ProblemsPanel API:** See `src/ui/ProblemsPanel.tsx`
- **Full Integration:** See `PROBLEMS_PANEL_INTEGRATION.md`
- **Auto-Fix System:** See `AUTO_FIX_IMPLEMENTATION.md`

---

**Recommendation:** Start with **Pattern 1** (current implementation) for development, then consider **Pattern 2** (always-visible) for production if founders prefer immediate feedback.

Both patterns are production-ready and fully functional! 🎉
