# PRD: Preview Panel Dynamic Rendering

**Date:** November 17, 2025  
**Status:** APPROVED  
**Priority:** P0 (Blocking tutorial examples)  
**Owner:** Extension Team

---

## 🎯 **Problem Statement**

The VS Code extension's preview panel is currently hardcoded to display todo-style applications. When users create examples with different data models (Messages, Counters, Reminders), the preview shows:
- ❌ Hardcoded "No tasks yet" message
- ❌ Hardcoded field names (`title`, `done`)
- ❌ Hardcoded endpoint calls (`/todos`)

This makes the preview non-functional for any app that isn't a todo list, breaking the tutorial examples.

---

## 🎯 **Goals**

### **Primary Goal**
Enable the preview panel to dynamically render any ShepLang application based on its parsed AST structure.

### **Success Criteria**
1. Preview correctly displays HelloWorld app (Message model with `content` field)
2. Preview correctly displays MyCounter app (Counter model with `value`, `label` fields)
3. Preview correctly displays DogReminders app (Reminder model with `message`, `time`, `done` fields)
4. Preview still correctly displays MyTodos app (backward compatible)
5. All CRUD operations work for all models

---

## 👥 **Users**

### **Primary Users**
- Tutorial learners using the 4 progressive examples
- Developers building new ShepLang applications

### **Use Cases**
1. **Tutorial Learner**: Opens `01-hello-world.shep`, expects to see messages, not tasks
2. **Developer**: Creates custom app with `Product` model, expects preview to show products
3. **Demo Presenter**: Shows different examples in sequence, each should look unique

---

## 📋 **Requirements**

### **Functional Requirements**

#### **FR-1: Dynamic Model Detection**
- MUST detect model name from AST (`view.list` property)
- MUST look up model definition in AST (`datas` array)
- MUST extract field names and types from model

#### **FR-2: Dynamic Endpoint Construction**
- MUST construct endpoint paths from model name
- Pattern: `Model` → `/{model.toLowerCase()}s`
- Examples: `Message` → `/messages`, `Counter` → `/counters`

#### **FR-3: Dynamic Empty State**
- MUST display model-specific empty message
- Format: "No {pluralName} yet. Click the button above to create one!"
- Examples: "No messages yet", "No counters yet", "No reminders yet"

#### **FR-4: Dynamic Field Rendering**
- MUST render all non-id fields from model
- MUST format fields based on type:
  - `text`: Display as string
  - `number`: Display as number
  - `yes/no`: Display as ✓ or ○
  - `datetime`: Display formatted with `toLocaleString()`

#### **FR-5: Dynamic CRUD Operations**
- MUST support GET for any model
- MUST support POST for any model
- MUST support DELETE for any model
- MUST use model-specific endpoints

#### **FR-6: Backward Compatibility**
- MUST still work with existing `todo.shep` example
- MUST maintain all current todo functionality (edit, toggle)
- MUST not break any existing user workflows

### **Non-Functional Requirements**

#### **NFR-1: Performance**
- Rendering MUST complete in < 100ms
- No visible lag when switching between examples

#### **NFR-2: Error Handling**
- MUST gracefully handle missing model definitions
- MUST log helpful errors to Output panel
- MUST not crash if AST structure is unexpected

#### **NFR-3: Maintainability**
- Code MUST be well-commented
- Functions MUST have single responsibility
- No code duplication

---

## 🚫 **Non-Goals**

### **Out of Scope for This Release**
- Complex pluralization (Person → People) - use simple +s
- Edit functionality for multi-field models - Phase 2
- Custom field formatters - use defaults
- Multiple views per app - render first view only
- Relationships between models - not supported yet

---

## 📊 **Metrics**

### **Success Metrics**
- ✅ 100% of tutorial examples render correctly
- ✅ 0 hardcoded model names in code
- ✅ 0 hardcoded field names in code
- ✅ 0 hardcoded endpoint paths in code

### **Performance Metrics**
- Render time < 100ms
- No memory leaks after multiple preview opens

---

## 🎨 **User Experience**

### **Before (Current State)**
```
# User opens 01-hello-world.shep
Preview shows:
- Title: "Welcome" ✅
- Button: "Say Hello" ✅
- Empty message: "No tasks yet. Click 'Add Task'" ❌
- After click: Shows "No tasks yet" ❌
```

### **After (Desired State)**
```
# User opens 01-hello-world.shep
Preview shows:
- Title: "Welcome" ✅
- Button: "Say Hello" ✅
- Empty message: "No messages yet" ✅
- After click: Shows message with content field ✅
```

---

## 🏗️ **Technical Approach**

### **Architecture**
```
ShepLang File (.shep)
    ↓
Parser (@sheplang/language)
    ↓
AST (AppModel structure)
    ↓
Preview Panel (Webview)
    ↓
Dynamic Renderer (NEW)
    ↓
Display UI
```

### **Key Components**

1. **Model Inspector** - Extracts model info from AST
2. **Endpoint Builder** - Constructs dynamic endpoint paths
3. **Field Renderer** - Renders fields based on type
4. **Data Loader** - Loads data from backend dynamically

---

## 📅 **Timeline**

- **Spec Review:** Day 1 (Today)
- **Implementation:** Day 1 (2-3 hours)
- **Testing:** Day 1 (1 hour)
- **Documentation Update:** Day 1 (30 min)

**Total Time:** 4 hours (same day completion)

---

## ⚠️ **Risks & Mitigations**

### **Risk 1: Breaking Existing Todo Example**
**Mitigation:** Test todo example first, ensure backward compatibility

### **Risk 2: Unexpected AST Structure**
**Mitigation:** Add defensive checks, log errors, graceful degradation

### **Risk 3: Pluralization Edge Cases**
**Mitigation:** Start with simple +s, document limitations, enhance in Phase 2

---

## ✅ **Acceptance Criteria**

### **AC-1: HelloWorld Example**
- [ ] Opens without errors
- [ ] Shows "No messages yet" initially
- [ ] Button creates message via `/messages` POST
- [ ] Message displays `content` field
- [ ] Delete works via `/messages/:id` DELETE

### **AC-2: MyCounter Example**
- [ ] Opens without errors
- [ ] Shows "No counters yet" initially
- [ ] Button creates counter via `/counters` POST
- [ ] Counter displays `value` and `label` fields
- [ ] Delete works via `/counters/:id` DELETE

### **AC-3: DogReminders Example**
- [ ] Opens without errors
- [ ] Shows "No reminders yet" initially
- [ ] Button creates reminder via `/reminders` POST
- [ ] Reminder displays `message`, `time`, `done` fields
- [ ] Time is formatted with `toLocaleString()`
- [ ] Done shows as ✓ or ○
- [ ] Delete works via `/reminders/:id` DELETE

### **AC-4: Todo Example (Regression)**
- [ ] Opens without errors
- [ ] Shows "No todos yet" initially
- [ ] All existing functionality works unchanged
- [ ] Edit works
- [ ] Toggle works
- [ ] Delete works

### **AC-5: Code Quality**
- [ ] No hardcoded model names
- [ ] No hardcoded field names
- [ ] No hardcoded endpoints
- [ ] Functions are well-documented
- [ ] Console logs provide helpful debugging info

---

## 📝 **Documentation Updates**

### **User Documentation**
- Update example READMEs with screenshots
- Add note about dynamic preview

### **Developer Documentation**
- Document AST structure requirements
- Document field type support
- Document endpoint naming convention

---

## 🔄 **Future Enhancements (Phase 2)**

- Smart pluralization (Person → People)
- Edit forms for multi-field models
- Custom field formatters
- Multiple views support
- Relationship rendering
- Inline editing
- Drag-and-drop reordering

---

## 📚 **References**

- [AST Structure](../sheplang/packages/language/src/types.ts)
- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [Current Implementation](../extension/src/commands/preview.ts)
- [Verification Document](../extension/.specify/PREVIEW-DYNAMIC-RENDERING-VERIFICATION.md)

---

**Status:** READY FOR IMPLEMENTATION  
**Approval:** Required before proceeding to TTD

---

**Stakeholders:**
- ✅ Tutorial Examples Team
- ✅ Extension Development Team
- ✅ Language Design Team

**Next Step:** Create TTD (Technical Task Definition)
