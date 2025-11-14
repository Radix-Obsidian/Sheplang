# ShepYard Phase 1: Manual Testing Guide

## What Was Built

Phase 1 implements a **examples sidebar + read-only code viewer** for ShepYard.

### Features Implemented

1. **Examples Registry** (`src/examples/exampleList.ts`)
   - Three example ShepLang apps with inline source:
     - Todo List
     - Dog Care Reminder
     - Multi-Screen Navigation

2. **Zustand Workspace Store** (`src/workspace/useWorkspaceStore.ts`)
   - Tracks active example selection
   - Methods: `setActiveExample()`, `clearActiveExample()`

3. **ShepCodeViewer Component** (`src/editor/ShepCodeViewer.tsx`)
   - Monaco editor in read-only mode
   - Clean syntax highlighting
   - Responsive layout

4. **Examples Sidebar** (`src/ui/ExamplesSidebar.tsx`)
   - Lists all available examples
   - Click to select
   - Visual active state (indigo highlight)

5. **Welcome Card** (`src/ui/WelcomeCard.tsx`)
   - Shown when no example is selected
   - Friendly introduction to ShepYard

6. **Automated Tests** (`src/test/App.test.tsx`)
   - 5 passing tests covering:
     - Examples sidebar rendering
     - Example selection
     - Active state styling
     - Code viewer display
     - State clearing

## Manual Testing Steps

### 1. Start the Dev Server

```bash
cd shepyard
pnpm dev
```

Open http://localhost:5173 in your browser.

### 2. Test Welcome State

- **Expected**: You should see the welcome card with the sheep emoji and instructions
- **Verify**: Left sidebar shows 3 examples, main area shows welcome message

### 3. Test Example Selection

- **Action**: Click "Todo List" in the sidebar
- **Expected**:
  - Sidebar button gets indigo highlight and border
  - Main area switches to show example header + code viewer
  - Monaco editor displays the todo.shep source code

### 4. Test Different Examples

- **Action**: Click "Dog Care Reminder"
- **Expected**: Code viewer updates to show dog-reminder.shep source
- **Action**: Click "Multi-Screen Navigation"
- **Expected**: Code viewer updates to show multi-screen.shep source

### 5. Test Read-Only Editor

- **Action**: Try to edit the code in the Monaco editor
- **Expected**: Editor should be read-only (no cursor, no edits allowed)

### 6. Test Responsive Layout

- **Action**: Resize browser window
- **Expected**: Layout should adapt, sidebar stays fixed width, editor fills remaining space

### 7. Verify Automated Tests

```bash
cd shepyard
pnpm test
```

**Expected**: All 5 tests pass

### 8. Verify Full Build

```bash
cd ..
pnpm run verify
```

**Expected**: All 6 verification steps pass (including ShepYard build)

## Success Criteria

✅ Examples sidebar displays 3 examples with names and descriptions  
✅ Clicking an example selects it (visual highlight)  
✅ Code viewer shows selected example's ShepLang source  
✅ Monaco editor is read-only (no editing allowed)  
✅ Welcome card displays when no example selected  
✅ All automated tests pass  
✅ Full `pnpm run verify` passes  
✅ No TypeScript errors  
✅ No console errors in browser  

## Next Steps (Phase 2)

After Phase 1 is validated:
- Wire up live preview pane (show BobaScript output)
- Add example file I/O (load from actual /examples folder)
- Implement AI explain/generate/fix modes
- Add one-click transpile + preview
