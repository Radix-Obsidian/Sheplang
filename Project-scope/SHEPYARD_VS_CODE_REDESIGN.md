# Shepyard VS Code-Style Redesign Plan

**Based on:** Official VS Code UX Guidelines + Windsurf IDE patterns  
**Goal:** Production-quality, professional IDE experience for non-technical founders

---

## 🎯 Issues to Fix

### Critical
1. **Backend Panel Empty** - Metadata not displaying (debug logs added)
2. **Read-Only Editor** - Can't edit code (need to enable Monaco editing)
3. **Panel Resizing Bugs** - Wrong panels moving, can't resize right panel
4. **Outdated Welcome** - Phase info is old and irrelevant

### UX/Design
5. **Harsh White Theme** - Need dark mode for eye comfort
6. **No Top Nav** - Missing menu bar like VS Code
7. **Basic Left Sidebar** - Need proper Explorer/file tree
8. **No Bottom Panel** - Missing Terminal/Output/Problems area

---

## 📐 VS Code Layout Architecture

### From Official Docs

```
┌─────────────────────────────────────────────────┐
│  Title Bar + Menu Bar                           │
├──┬───────────────────────────────────────────┬──┤
│  │                                           │  │
│A │         Editor Area                       │S │
│c │      (Monaco with tabs)                   │e │
│t │                                           │c │
│i │                                           │o │
│v │                                           │n │
│i │                                           │d │
│t │                                           │a │
│y │                                           │r │
│  │                                           │y │
│B │                                           │  │
│a │                                           │S │
│r │                                           │i │
│  │                                           │d │
│  │                                           │e │
│  │                                           │b │
│  │                                           │a │
│  │                                           │r │
│  │                                           │  │
├──┴───────────────────────────────────────────┴──┤
│         Panel (Terminal/Output/etc)             │
├─────────────────────────────────────────────────┤
│         Status Bar                              │
└─────────────────────────────────────────────────┘
```

**Key Components:**
1. **Title Bar** - Window controls, breadcrumbs
2. **Menu Bar** - File, Edit, View, Run, etc.
3. **Activity Bar** - Icons on far left (Explorer, Search, Git, etc.)
4. **Primary Sidebar** - Main sidebar (Explorer, file tree)
5. **Editor Area** - Monaco editor with tab groups
6. **Panel** - Bottom area (Terminal, Output, Problems, Debug Console)
7. **Status Bar** - Bottom status (line/col, language, errors)
8. **Secondary Sidebar** (optional) - Right sidebar (Chat in Windsurf)

---

## 🎨 VS Code Dark Theme

### Colors (from VS Code Dark+)
```css
Background: #1E1E1E
Sidebar: #252526
Activity Bar: #333333
Editor: #1E1E1E
Panel: #181818
Status Bar: #007ACC
Text: #D4D4D4
Borders: #3E3E3E
Selection: #264F78
Comments: #6A9955
Keywords: #569CD6
Strings: #CE9178
```

### Monaco Theme
```typescript
monaco.editor.defineTheme('shepyard-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [...],
  colors: {...}
});
```

---

## 🏗️ Implementation Plan

### Phase A: Dark Theme (1-2 hours)
**Priority: HIGH - User eye strain**

**Files to Create:**
- `src/themes/vscodeTheme.ts` - Theme definitions
- `src/themes/monacoTheme.ts` - Monaco configuration

**Files to Modify:**
- `tailwind.config.js` - Add dark mode colors
- `src/index.css` - Global dark styles
- `src/editor/ShepCodeViewer.tsx` - Apply Monaco theme
- All component files - Update class names

**Implementation:**
```typescript
// src/themes/vscodeTheme.ts
export const colors = {
  background: '#1E1E1E',
  sidebar: '#252526',
  activityBar: '#333333',
  editor: '#1E1E1E',
  panel: '#181818',
  statusBar: '#007ACC',
  text: '#D4D4D4',
  border: '#3E3E3E',
  selection: '#264F78',
};
```

---

### Phase B: Top Navigation (1 hour)
**Components needed:**

**1. Title Bar**
```tsx
// src/navigation/TitleBar.tsx
<div className="title-bar">
  <div className="app-icon">🐑</div>
  <div className="app-name">ShepYard Alpha</div>
  <div className="breadcrumbs">{activeFolders}</div>
  <div className="window-controls">{minimize/maximize/close}</div>
</div>
```

**2. Menu Bar**
```tsx
// src/navigation/MenuBar.tsx
<div className="menu-bar">
  <Menu label="File" items={[...]} />
  <Menu label="Edit" items={[...]} />
  <Menu label="View" items={[...]} />
  <Menu label="Run" items={[...]} />
  <Menu label="Help" items={[...]} />
</div>
```

---

### Phase C: Activity Bar + Explorer (2-3 hours)
**VS Code-style left sidebar**

**1. Activity Bar** (icon strip on far left)
```tsx
// src/activity-bar/ActivityBar.tsx
const activities = [
  { id: 'explorer', icon: '📁', label: 'Explorer' },
  { id: 'search', icon: '🔍', label: 'Search' },
  { id: 'source-control', icon: '🌿', label: 'Source Control' },
  { id: 'backend', icon: '⚡', label: 'Backend' },
  { id: 'extensions', icon: '📦', label: 'Extensions' },
];
```

**2. Explorer View** (file tree)
```tsx
// src/sidebar/ExplorerView.tsx
<div className="explorer">
  <TreeView
    items={fileTree}
    onSelect={handleFileSelect}
    onExpand={handleExpand}
  />
</div>
```

**File Tree Structure:**
```
Sheplang/
├─📁 screens/          (ShepLang .shep files)
│  ├─ todo-list.shep
│  ├─ dog-care.shep
│  └─ multi-screen.shep
├─📁 backend/          (ShepThon .shepthon files)
│  └─ dog-reminders.shepthon
├─📁 data/             (Models/schemas)
│  └─ Reminder
└─📁 examples/         (Built-in examples)
```

---

### Phase D: Bottom Panel (2 hours)
**Terminal, Output, Problems, Debug Console**

**1. Panel Container**
```tsx
// src/panel/BottomPanel.tsx
const panels = [
  { id: 'output', label: 'Output', icon: '📤' },
  { id: 'terminal', label: 'Terminal', icon: '⌨️' },
  { id: 'problems', label: 'Problems', icon: '⚠️' },
  { id: 'backend-logs', label: 'Backend Logs', icon: '🔍' },
];
```

**2. Terminal View**
```tsx
// src/panel/TerminalView.tsx
<div className="terminal">
  <div className="terminal-toolbar">
    <button>+ New Terminal</button>
    <button>Split Terminal</button>
    <button>Kill Terminal</button>
  </div>
  <div className="terminal-content">
    {/* xterm.js integration (future) */}
    <div className="mock-terminal">
      $ pnpm dev<br/>
      Server running at http://localhost:3000
    </div>
  </div>
</div>
```

**3. Output View**
```tsx
// src/panel/OutputView.tsx
<div className="output">
  <select className="output-channel">
    <option>ShepLang Transpiler</option>
    <option>ShepThon Runtime</option>
    <option>Build</option>
  </select>
  <div className="output-content">
    {logs.map(log => <div key={log.id}>{log.message}</div>)}
  </div>
</div>
```

**4. Problems View**
```tsx
// src/panel/ProblemsView.tsx
<div className="problems">
  <div className="problems-toolbar">
    <span>0 Errors, 0 Warnings</span>
    <button>Clear All</button>
  </div>
  <div className="problems-list">
    {problems.map(p => (
      <div className="problem-item" key={p.id}>
        <span className={`severity ${p.severity}`}>{p.icon}</span>
        <span className="message">{p.message}</span>
        <span className="file">{p.file}:{p.line}</span>
      </div>
    ))}
  </div>
</div>
```

---

### Phase E: Editable Monaco (30 min)
**Make the editor actually editable!**

```tsx
// src/editor/ShepCodeViewer.tsx
<MonacoEditor
  value={source}
  onChange={handleChange}  // ← Add this!
  readOnly={false}         // ← Change from true!
  theme="shepyard-dark"
  onMount={handleEditorMount}
/>
```

**Also need:**
- State management for edited content
- Save/discard changes UI
- Dirty indicator in tabs

---

### Phase F: Fix Panel Resizing (1 hour)
**Current bug: Wrong panels resize**

**Root cause:** `react-resizable-panels` configuration

**Fix:**
```tsx
// src/main.tsx
<PanelGroup direction="horizontal">
  <Panel id="sidebar" defaultSize={20} minSize={15} maxSize={40}>
    <ProjectPanel />
  </Panel>
  
  <PanelResizeHandle />
  
  <Panel id="editor" defaultSize={60} minSize={30}>
    <EditorArea />
  </Panel>
  
  <PanelResizeHandle />
  
  <Panel id="preview" defaultSize={20} minSize={15} maxSize={40}>
    <PreviewPanel />
  </Panel>
</PanelGroup>

<PanelResizeHandle direction="vertical" />

<Panel id="bottom-panel" defaultSize={25} minSize={10} maxSize={50}>
  <BottomPanel />
</Panel>
```

**Key fixes:**
- Add unique `id` prop to each Panel
- Set proper `minSize` and `maxSize`
- Correct `direction` on resize handles
- Nested PanelGroups for horizontal + vertical

---

### Phase G: Status Bar (30 min)
**Bottom status strip**

```tsx
// src/status-bar/StatusBar.tsx
<div className="status-bar">
  <div className="status-left">
    <span className="item">⚡ ShepThon Ready</span>
    <span className="item">⚠️ 0 Problems</span>
  </div>
  
  <div className="status-right">
    <span className="item">Ln 16, Col 5</span>
    <span className="item">Spaces: 2</span>
    <span className="item">UTF-8</span>
    <span className="item">ShepLang</span>
    <button className="item">🔔 Notifications</button>
  </div>
</div>
```

---

## 📦 Component Architecture

### New Components to Create

```
src/
├── themes/
│   ├── vscodeTheme.ts           (color definitions)
│   └── monacoTheme.ts           (Monaco config)
├── navigation/
│   ├── TitleBar.tsx             (window title)
│   ├── MenuBar.tsx              (File/Edit/View)
│   └── Menu.tsx                 (dropdown menu)
├── activity-bar/
│   ├── ActivityBar.tsx          (icon strip)
│   └── ActivityButton.tsx       (individual icon)
├── sidebar/
│   ├── Sidebar.tsx              (container)
│   ├── ExplorerView.tsx         (file tree)
│   ├── SearchView.tsx           (search UI)
│   ├── SourceControlView.tsx    (git UI - future)
│   └── BackendView.tsx          (ShepThon panel)
├── panel/
│   ├── BottomPanel.tsx          (container)
│   ├── TerminalView.tsx         (mock terminal)
│   ├── OutputView.tsx           (logs)
│   ├── ProblemsView.tsx         (errors/warnings)
│   └── BackendLogsView.tsx      (ShepThon logs)
├── status-bar/
│   └── StatusBar.tsx            (bottom status)
├── editor/
│   ├── EditorArea.tsx           (tab groups)
│   ├── EditorTabs.tsx           (tab bar)
│   └── EditorTab.tsx            (single tab)
└── main.tsx                     (layout composition)
```

---

## 🎨 Design System

### Typography
```css
--font-family: 'Segoe UI', 'Ubuntu', 'Roboto', sans-serif;
--font-mono: 'Cascadia Code', 'Fira Code', 'Monaco', monospace;
--font-size-sm: 12px;
--font-size-base: 13px;
--font-size-lg: 14px;
```

### Spacing
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
```

### Borders
```css
--border: 1px solid var(--border-color);
--border-radius: 3px;
```

---

## 🔧 Technical Implementation

### 1. Dark Theme Toggle
```tsx
// src/themes/ThemeProvider.tsx
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 2. Keyboard Shortcuts
```typescript
// src/shortcuts/useShortcuts.ts
const shortcuts = {
  'Ctrl+S': saveFile,
  'Ctrl+P': openQuickOpen,
  'Ctrl+Shift+P': openCommandPalette,
  'Ctrl+B': toggleSidebar,
  'Ctrl+J': togglePanel,
  'Ctrl+`': toggleTerminal,
};
```

### 3. File Tree State
```typescript
// src/workspace/fileTree.ts
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  expanded?: boolean;
}
```

---

## ✅ Success Criteria

### Functionality
- ✅ Dark theme enabled by default
- ✅ Editor is editable (not read-only)
- ✅ Backend Panel shows metadata
- ✅ Panel resizing works correctly
- ✅ All VS Code-style panels present
- ✅ Professional appearance

### UX
- ✅ Comfortable dark colors (not harsh white)
- ✅ Clear navigation hierarchy
- ✅ Familiar VS Code patterns
- ✅ Founder-friendly labels
- ✅ Responsive layout

### Performance
- ✅ Build time < 5 seconds
- ✅ No console errors
- ✅ Smooth panel transitions
- ✅ Monaco loads quickly

---

## 📋 Implementation Order

### Sprint 1: Dark Theme + Debugging (2-3 hours)
1. Fix Backend Panel metadata bug ✅ (debug logs added)
2. Implement dark theme (colors, Monaco, Tailwind)
3. Test and verify dark mode

### Sprint 2: Layout Structure (3-4 hours)
4. Create Title Bar + Menu Bar
5. Build Activity Bar (icon strip)
6. Fix panel resizing bugs
7. Add Status Bar

### Sprint 3: Sidebar Enhancement (2-3 hours)
8. Redesign Explorer with file tree
9. Improve Backend View
10. Add Search view placeholder

### Sprint 4: Bottom Panel (2-3 hours)
11. Create Panel container
12. Implement Output view (logs)
13. Implement Problems view
14. Add mock Terminal view

### Sprint 5: Editor Improvements (1-2 hours)
15. Make Monaco editable
16. Add tab management
17. Show dirty indicators
18. Remove outdated welcome message

### Sprint 6: Polish & Test (1-2 hours)
19. Keyboard shortcuts
20. Theme toggle button
21. Final testing
22. Documentation

**Total Estimated Time:** 12-16 hours

---

## 🎯 Immediate Next Steps

1. **Test the debug logs** - Refresh browser, click "Dog Reminders", check Backend tab
2. **Implement dark theme** - Most impactful for UX
3. **Fix panel resizing** - Critical usability bug
4. **Make editor editable** - Core functionality

---

**Goal:** Transform Shepyard from prototype to production-quality VS Code-style IDE for founders! 🚀
