# Milestone 4: Quick Reference Implementation Guide

**Date:** November 23, 2025  
**Purpose:** Fast lookup for which files to modify for each improvement

---

## Component-to-File Mapping

### 1. Header & App Shell
**Primary File:** `components/Layout/Header.tsx`  
**Secondary:** `app/page.tsx` (lines ~130-135 for duplicate removal)

**What to Add:**
```tsx
// Header structure
- Left: Logo + "ShepLang Playground"
- Right: Mode chip ("Milestone 4" / "Lite")
- Optional under-title: Current example name
```

**Style Reference:** shadcn header (softer bg, consistent height)

---

### 2. Toolbar Controls
**File:** `app/page.tsx` (lines 105-135)

**What to Restructure:**
```tsx
// Left cluster
- Examples button
- Problems toggle (with badge)

// Right cluster  
- Current example chip
- Status icon
- "Live Preview" indicator
```

**Style Reference:** CodeSandbox toolbar density

---

### 3. Editor Pane Header
**File:** `components/Editor/MonacoEditorImproved.tsx`

**What to Add:**
```tsx
// Above editor
- Left: "main.shep" / example name
- Center: "ShepLang" badge
- Right: Analysis status ("Analyzing..." / "✓")
```

**Style Reference:** VS Code tab bar

---

### 4. Preview Pane Header
**File:** `components/Preview/PreviewPanel.tsx`

**What to Change:**
```tsx
// Header improvements
- Replace emojis with stroke icons
- Better structure: Title | Devices | Refresh
- Add gradient frame around content
```

**Style Reference:** CodeSandbox right panel

---

### 5. Split Pane Polish
**File:** `components/Layout/SplitPaneImproved.tsx`

**What to Adjust:**
```tsx
// Pane styling
- Background difference between panes
- Subtle borders
- Card-like padding

// Gutter
- Width: 6px (from 10px)
- Modern color
- Hover state
```

**Style Reference:** CodeSandbox frame

---

### 6. Problems Panel
**File:** `components/Problems/ProblemsPanel.tsx`

**What to Tighten:**
```tsx
// Spacing
- Compact header
- Smaller fonts for details
- Reduced padding

// Icons
- Severity icons (not emojis)
- Color coding (red/yellow/blue)
- Monospace line numbers

// Summary
- Single-line bar at top
```

**Style Reference:** VS Code problems panel

---

### 7. Status Bar
**File:** `components/Layout/StatusBar.tsx`

**What to Group:**
```tsx
// Left section
- Status + diagnostics summary

// Right section
- Metrics with separators (•)
- "Ln 12 • 273 chars • 1ms"
```

**Style Reference:** VS Code status bar

---

### 8. Examples Gallery
**File:** `components/Examples/ExamplesGallery.tsx`

**What to Grid-ify:**
```tsx
// Layout
- Responsive grid (1-3 columns)
- Card design
- Active state highlighting

// Cards
- Better typography
- Consistent spacing
- Optional: Code preview
```

**Style Reference:** shadcn playground examples

---

### 9. Iconography (All Files)

**Files to Update:**
- `PreviewPanel.tsx` - Device mode icons
- `ProblemsPanel.tsx` - Severity icons  
- `ExamplesGallery.tsx` - Category icons
- `StatusBar.tsx` - Status indicators

**Icon Library Options:**
1. Lucide React (recommended)
2. Heroicons
3. Custom SVG

**Replace All Emojis:**
- 📱 → Mobile icon
- 📲 → Tablet icon
- 🖥️ → Desktop icon
- ❌ → Error icon
- ⚠️ → Warning icon
- ℹ️ → Info icon

---

## File Change Checklist

### Phase 1: Shell & Navigation
- [ ] `components/Layout/Header.tsx` - Restructure
- [ ] `app/page.tsx` - Remove duplicate labels (line ~132)
- [ ] `app/page.tsx` - Restructure toolbar (lines 105-135)

### Phase 2: Pane Headers
- [ ] `components/Editor/MonacoEditorImproved.tsx` - Add header
- [ ] `components/Preview/PreviewPanel.tsx` - Upgrade header
- [ ] `components/Layout/SplitPaneImproved.tsx` - Polish styling

### Phase 3: Component Refinement
- [ ] `components/Problems/ProblemsPanel.tsx` - Tighten density
- [ ] `components/Layout/StatusBar.tsx` - Group sections
- [ ] `components/Examples/ExamplesGallery.tsx` - Grid layout

### Phase 4: Consistency
- [ ] All component files - Replace emojis
- [ ] All component files - Normalize typography
- [ ] Create style guide documentation

### Phase 5: Production
- [ ] `next.config.js` - Optimization settings
- [ ] Various - Performance improvements
- [ ] Various - Accessibility fixes

### Phase 6: Deployment
- [ ] `vercel.json` - Deployment config
- [ ] `app/layout.tsx` - Analytics integration
- [ ] Main website - CTA integration

---

## Priority Levels

### 🔴 Critical (Must Have)
1. Header restructure
2. Toolbar cleanup
3. Editor pane header
4. Preview header polish
5. Icon normalization

### 🟡 Important (Should Have)
6. Problems panel density
7. Status bar grouping
8. Examples gallery grid
9. Split pane polish
10. Typography consistency

### 🟢 Nice to Have
11. Gradient frames
12. Mini code previews
13. Resizable problems panel
14. Advanced animations

---

## Quick Testing Checklist

After each component change:

### Visual
- [ ] Light mode ✓
- [ ] Dark mode ✓
- [ ] Mobile ✓
- [ ] Desktop ✓

### Functional
- [ ] No console errors
- [ ] All clicks work
- [ ] No regressions

### Comparison
- [ ] Matches reference
- [ ] Screenshot captured

---

## Common Patterns

### Adding Component Header
```tsx
// Template
<div className="component-container">
  {/* New header */}
  <div className="flex items-center justify-between px-4 py-2 border-b">
    <div className="flex items-center gap-2">
      {/* Left content */}
    </div>
    <div className="flex items-center gap-2">
      {/* Right content */}
    </div>
  </div>
  
  {/* Existing content */}
  <div className="flex-1">
    {children}
  </div>
</div>
```

### Consistent Card Styling
```tsx
className="rounded-lg border bg-card p-4 shadow-sm"
```

### Icon Replacement Pattern
```tsx
// Before
<span>📱</span>

// After (using Lucide)
import { Smartphone } from 'lucide-react'
<Smartphone className="h-4 w-4" />
```

### Grid Layout Pattern
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

---

## File Dependencies

### If you change Header.tsx
→ May need to update `app/page.tsx` (context passing)

### If you change MonacoEditorImproved.tsx  
→ May need to update `app/page.tsx` (props/callbacks)

### If you change PreviewPanel.tsx
→ Verify `app/page.tsx` integration still works

### If you add icon library
→ Update `package.json` and all icon usage

---

## Performance Notes

### Lazy Loading Candidates
- Monaco Editor (already lazy)
- Examples gallery (if large)
- Preview iframe content

### Bundle Size Targets
- Initial JS: <100KB
- Total JS: <500KB
- Initial CSS: <50KB

### Performance Checks After Each Phase
```bash
npm run build
# Check .next/analyze output
```

---

## Accessibility Quick Wins

### Always Include
- ARIA labels on icon buttons
- Keyboard navigation support
- Focus indicators
- Color contrast >4.5:1

### Common Fixes
```tsx
// Icon button
<button aria-label="Toggle device mode">
  <Smartphone />
</button>

// Keyboard nav
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    onClick()
  }
}}
```

---

## Visual References

### Keep These Open While Working
1. [CodeSandbox Playground](https://codesandbox.io)
2. [shadcn Playground](https://ui.shadcn.com)
3. [StackBlitz Editor](https://stackblitz.com)
4. VS Code (for status bar, problems panel)

### Screenshot Each Phase
- Before/after comparisons
- Light and dark mode
- Mobile and desktop
- Document in completion files

---

## Common Tailwind Patterns

### Spacing Scale (Use Consistently)
- `p-2` - Dense (problems list items)
- `p-3` - Compact (small cards)
- `p-4` - Standard (cards, sections)
- `p-6` - Spacious (major areas)

### Text Sizes (Use Consistently)
- `text-xs` - Metadata, line numbers
- `text-sm` - Body text, list items
- `text-base` - Subheadings, important text
- `text-lg` - Main headings

### Border Radius (Use Consistently)
- `rounded` - Small elements (4px)
- `rounded-md` - Cards (6px)
- `rounded-lg` - Panels (8px)

---

## When to Ask for Help

### Stop and Check If:
- Making changes to >3 files at once
- Introducing new dependencies
- Breaking existing functionality
- Not sure which approach to take
- Performance noticeably degraded

### Get Confirmation Before:
- Major structural changes
- Adding new libraries
- Changing build configuration
- Modifying API routes

---

**This guide is your quick reference - bookmark it and keep it open during implementation!**
