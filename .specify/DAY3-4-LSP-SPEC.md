# Day 3-4: LSP Enhancement & AI Context

**Goal:** Make AI tools generate perfect ShepLang code  
**Success Metric:** AI-generated code compiles 80%+ of the time  
**Status:** 🎯 IN PROGRESS  

---

## Objective

VSCode's Language Server Protocol (LSP) provides code intelligence features like autocomplete, hover docs, and go-to-definition. By enhancing our LSP with **semantic context**, AI tools like Cursor and Copilot will generate valid ShepLang code consistently.

---

## Current State

### ✅ What Works
- Basic LSP server running (`extension/src/server/server.ts`)
- Syntax highlighting (via TextMate grammar)
- Basic diagnostics (parse errors shown)

### ❌ What's Missing
- **Context-aware completions** - No suggestions inside blocks
- **Hover documentation** - No help text on keywords
- **Signature help** - No parameter hints
- **Document symbols** - No outline view
- **Go to Definition** - Can't jump to model/endpoint definitions

**Impact:** AI tools don't have enough context to generate correct code.

---

## Tasks (Spec-Driven)

### ✅ SPEC T3.1: Context-Aware Completions
**What:** Suggest relevant items based on cursor position  
**Why:** AI tools use completion context to generate valid syntax  
**Success:** Type "data" inside app block → autocomplete suggests model template

**Implementation:**
- Read AST at cursor position
- Determine block context (app, data, view, action, endpoint)
- Return relevant suggestions

**Test:**
```sheplang
app MyApp
  |  ← Cursor here, suggest: data, view, action
  
data Todo:
  fields:
    |  ← Cursor here, suggest: title: text, done: yes/no, id: id
```

**Estimate:** 3 hours

---

### ✅ SPEC T3.2: Hover Documentation
**What:** Show helpful docs when hovering over keywords  
**Why:** Users understand syntax without leaving editor  
**Success:** Hover over "data" → tooltip shows "Define a data model with fields"

**Implementation:**
- Map keywords to documentation strings
- Return `Hover` response with markdown content

**Test:**
- Hover `data` → "Define a data model with fields and optional rules"
- Hover `view` → "Define a UI view with widgets like lists and buttons"
- Hover `action` → "Define an action triggered by user interaction"

**Estimate:** 2 hours

---

### ✅ SPEC T3.3: Signature Help
**What:** Show parameter hints for actions and endpoints  
**Why:** Users know what parameters are required  
**Success:** Type "action MyAction(" → shows parameter template

**Implementation:**
- Detect function call context
- Return `SignatureHelp` with parameter info

**Test:**
```sheplang
action CreateTodo(title: text, done: yes/no)
                  ↑ Shows: parameter 1 of 2
```

**Estimate:** 2 hours

---

### ✅ SPEC T3.4: Document Symbols (Outline)
**What:** Populate VSCode's outline view with data/view/action items  
**Why:** Navigate large files easily  
**Success:** Outline shows all data models, views, actions

**Implementation:**
- Walk AST and collect `DataDecl`, `ViewDecl`, `ActionDecl`
- Return `DocumentSymbol[]` with names and ranges

**Test:**
Open file → Outline panel shows:
```
📦 MyApp
  📄 Todo (data)
  🎨 Dashboard (view)
  ⚡ CreateTodo (action)
```

**Estimate:** 2 hours

---

### ✅ SPEC T3.5: Go to Definition
**What:** Jump to model/view/action definition when clicking reference  
**Why:** Navigate codebase quickly  
**Success:** Click "Todo" in "list Todo" → jumps to "data Todo:"

**Implementation:**
- Resolve reference to declaration in AST
- Return `Location` with file and range

**Test:**
```sheplang
data Todo:
  fields:
    title: text

view Dashboard:
  list Todo  ← Ctrl+Click → jumps to "data Todo:"
```

**Estimate:** 3 hours

---

## Files to Modify

### 1. `extension/src/server/completion.ts`
**What:** Context-aware completion provider  
**Current:** Returns empty array  
**Target:** Returns relevant completions based on cursor position

### 2. `extension/src/server/hover.ts`
**What:** Hover documentation provider  
**Current:** Returns null  
**Target:** Returns markdown docs for keywords

### 3. `extension/src/server/signature.ts` (NEW)
**What:** Signature help provider  
**Current:** Doesn't exist  
**Target:** Shows parameter hints

### 4. `extension/src/server/symbols.ts` (NEW)
**What:** Document symbols provider  
**Current:** Doesn't exist  
**Target:** Populates outline view

### 5. `extension/src/server/definition.ts` (NEW)
**What:** Go to definition provider  
**Current:** Doesn't exist  
**Target:** Resolves references to declarations

### 6. `extension/src/server/server.ts`
**What:** LSP server entry point  
**Current:** Handles diagnostics only  
**Target:** Registers all new providers

---

## Testing Strategy

### Manual Testing
1. Open `examples/todo.shep`
2. Place cursor inside `app` block
3. Type → autocomplete shows data/view/action
4. Hover over `data` → tooltip appears
5. Check outline → shows Todo, Dashboard, CreateTodo
6. Ctrl+Click on "Todo" reference → jumps to definition

### AI Testing (Cursor)
1. Open new `.shep` file
2. Type `app MyApp`
3. Ask Cursor: "Add a Task model with title and done fields"
4. Verify: AI generates valid `data Task:` block with correct syntax
5. Ask Cursor: "Add a ListView for Task"
6. Verify: AI generates valid `view` block with `list Task`

**Success Criteria:** 8/10 AI requests generate valid, compilable code

---

## Implementation Order

1. **T3.2 Hover Docs** (easiest, immediate value)
2. **T3.1 Completions** (most AI impact)
3. **T3.4 Document Symbols** (navigation)
4. **T3.5 Go to Definition** (navigation)
5. **T3.3 Signature Help** (nice-to-have)

**Total Estimated Time:** 12 hours

---

## Dependencies

### Required Packages
- `vscode-languageserver` (✅ already installed)
- `vscode-languageserver-textdocument` (✅ already installed)
- `@sheplang/language` (✅ for AST parsing)

### No Additional Dependencies Needed ✅

---

## Success Metrics

### Before (Current)
- AI success rate: ~30% (blind guessing)
- User has to manually fix syntax
- No context hints
- No navigation

### After (Target)
- AI success rate: 80%+ (context-aware)
- AI generates valid code first try
- Hover docs guide users
- Outline + Go-to-Definition for navigation

---

## Risks & Mitigation

### Risk 1: AST Parsing Performance
**Issue:** Parsing on every keystroke may lag  
**Mitigation:** Cache parsed AST, debounce completions

### Risk 2: Incomplete Documentation
**Issue:** Hover docs may be unclear  
**Mitigation:** Use examples in tooltips, test with real users

### Risk 3: AI Still Generates Wrong Syntax
**Issue:** LSP may not provide enough context  
**Mitigation:** Add `.cursorrules` file with syntax examples

---

## Next Steps

1. ✅ Create this spec
2. ⏭️ Implement T3.2 (Hover Docs) - **START HERE**
3. Test hover manually
4. Move to T3.1 (Completions)
5. Test with Cursor AI
6. Iterate based on results

---

**Ready to implement. Starting with T3.2 Hover Docs.**
