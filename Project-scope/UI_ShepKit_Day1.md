# ShepKit Day-1 UI — Wireframe Spec

---

## 1. Layout Overview

```
+-----------------------------------------------------------+
| File Explorer | Monaco Editor | AI Panel |
| (left pane) | (center pane) | (right pane) |
+-----------------------------------------------------------+
| Live Preview (bottom) |
+-----------------------------------------------------------+
```

---

## 2. File Explorer

**Actions:**
- New File  
- Delete File  
- Rename File  
- Import Project  
- Export Project  

**File items:**
```
main.shep
reminders.shep
auth.shep
```

---

## 3. Monaco Editor

**Features:**
- `.shep` syntax highlighting  
- Inline diagnostics  
- Code folding  
- Quick fixes from AI  
- Command palette:
  - "Explain code"
  - "Generate component"
  - "Debug error"

---

## 4. AI Panel

**Modes:**
1. Explain  
2. Generate  
3. Debug  
4. Improve  

**UI:**
```
[ User prompt input box ]
[ Submit button ]
[ AI output box ]
```

---

## 5. Live Preview

An iframe that:

- Receives BobaScript AST  
- Renders UI  
- Runs actions  
- Sends logs back  
- Shows runtime errors

---

## 6. Color / Typography Guidelines

- Background: neutral-900  
- Panels: neutral-800  
- Editor: dark theme (Monaco)  
- Preview: white background  
- Accent: #4ADE80 (green)  

---

## 7. Onboarding Modal

**Steps:**
1. Create your first component  
2. Preview it  
3. Use AI to add action  
4. Deploy your app  

---

## 8. Future UI Extensions

- Component tree view  
- State inspector  
- Action log  
- Real-time collaboration cursors  
- Visual layout editor
