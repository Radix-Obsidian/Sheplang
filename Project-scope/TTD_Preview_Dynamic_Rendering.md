# TTD: Preview Panel Dynamic Rendering

**Date:** November 17, 2025  
**Status:** APPROVED  
**Related PRD:** PRD_Preview_Dynamic_Rendering.md  
**Target File:** `extension/src/commands/preview.ts`

---

## 🎯 **Technical Overview**

Replace hardcoded todo-specific rendering logic with dynamic rendering based on the parsed AST structure that's already being sent to the webview.

**Key Insight:** The AST is already being passed to the webview (line 77-80). We just need to use it!

---

## 📋 **Technical Requirements**

### **TR-1: AST Structure Understanding**

**Source:** `sheplang/packages/language/src/types.ts`

```typescript
type AppModel = {
  name: string;              // App name
  datas: {                   // Array of data models
    name: string;            // Model name (e.g., "Message", "Counter")
    fields: {                // Array of fields
      name: string;          // Field name (e.g., "content", "value")
      type: string;          // Field type (e.g., "text", "number")
    }[];
    rules: string[];
  }[];
  views: {
    name: string;            // View name (e.g., "Welcome")
    list?: string;           // ✅ CRITICAL: Model to display
    buttons: {
      label: string;
      action: string;
    }[];
  }[];
  actions: {
    name: string;
    params: { name: string; type?: string }[];
    ops: any[];
  }[];
}
```

**Critical Property:** `view.list` tells us which model to display!

---

### **TR-2: Endpoint Naming Convention**

**Pattern Verified in All Examples:**

```javascript
// Model name → Endpoint path
"Message"  → "/messages"
"Counter"  → "/counters"
"Reminder" → "/reminders"
"Todo"     → "/todos"

// Formula
endpoint = "/" + modelName.toLowerCase() + "s"
```

**Verification:**
- ✅ `examples/01-hello-world.shepthon` line 8: `GET "/messages"`
- ✅ `examples/02-counter.shepthon` line 9: `GET "/counters"`
- ✅ `examples/04-dog-reminders.shepthon` line 10: `GET "/reminders"`
- ✅ `examples/todo.shepthon` line 9: `GET "/todos"`

---

### **TR-3: Field Type Formatting**

**Supported Types:**

```javascript
const formatFieldValue = (value, type) => {
  switch(type) {
    case 'text':
      return String(value || '');
    case 'number':
      return String(value || 0);
    case 'yes/no':
      return value ? '✓' : '○';
    case 'datetime':
      return new Date(value).toLocaleString();
    default:
      return String(value || '');
  }
};
```

---

## 🏗️ **Implementation Plan**

### **Phase 1: Helper Functions (Lines 523-620)**

Add these functions in the webview `<script>` section:

#### **Function 1: `getModelFromView(viewName)`**
```javascript
/**
 * Get the model name that a view displays
 * @param {string} viewName - Name of the view
 * @returns {string|null} Model name or null
 */
function getModelFromView(viewName) {
  if (!currentAST || !currentAST.views) return null;
  const view = currentAST.views.find(v => v.name === viewName);
  return view?.list || null;
}
```

**Location:** After line 540 (after console proxy setup)

---

#### **Function 2: `getModelByName(modelName)`**
```javascript
/**
 * Get model definition from AST
 * @param {string} modelName - Name of the model
 * @returns {object|null} Model definition or null
 */
function getModelByName(modelName) {
  if (!currentAST || !currentAST.datas) return null;
  return currentAST.datas.find(d => d.name === modelName);
}
```

**Location:** After `getModelFromView()`

---

#### **Function 3: `getEndpointPath(modelName)`**
```javascript
/**
 * Construct endpoint path from model name
 * Pattern: Message → /messages
 * @param {string} modelName - Name of the model
 * @returns {string} Endpoint path
 */
function getEndpointPath(modelName) {
  return '/' + modelName.toLowerCase() + 's';
}
```

**Location:** After `getModelByName()`

---

#### **Function 4: `formatFieldValue(value, type)`**
```javascript
/**
 * Format field value based on type
 * @param {any} value - Field value
 * @param {string} type - Field type (text, number, yes/no, datetime)
 * @returns {string} Formatted value
 */
function formatFieldValue(value, type) {
  if (value === null || value === undefined) return '';
  
  switch(type) {
    case 'yes/no':
      return value ? '✓' : '○';
    case 'datetime':
      return new Date(value).toLocaleString();
    case 'number':
      return String(value);
    case 'text':
    default:
      return String(value);
  }
}
```

**Location:** After `getEndpointPath()`

---

### **Phase 2: Replace `loadTodos()` Function (Lines 877-983)**

**Current Function Name:** `loadTodos()`  
**New Function Name:** `loadData()`  
**Location:** Replace entire function at lines 877-983

```javascript
/**
 * Load data from backend dynamically based on AST
 */
async function loadData() {
  console.log('[Webview] Loading data from backend...');
  
  // Get the first view (active view)
  if (!currentAST || !currentAST.views || currentAST.views.length === 0) {
    console.error('[Webview] No views in AST');
    return;
  }
  
  const view = currentAST.views[0];
  const modelName = view.list;
  
  if (!modelName) {
    console.log('[Webview] View has no list property, skipping data load');
    return;
  }
  
  const model = getModelByName(modelName);
  if (!model) {
    console.error('[Webview] Model not found:', modelName);
    return;
  }
  
  const endpoint = getEndpointPath(modelName);
  
  try {
    console.log('[Webview] Calling GET', endpoint);
    const items = await callBackend('GET', endpoint);
    console.log('[Webview] Loaded items:', items);
    
    renderItems(items, model, modelName);
  } catch (error) {
    console.error('[Webview] Failed to load data:', error);
    // Don't show toast on initial load failure - backend might not be ready
  }
}
```

---

### **Phase 3: Create `renderItems()` Function**

**Location:** After `loadData()` function (around line 920)

```javascript
/**
 * Render items in the list dynamically
 * @param {Array} items - Array of items from backend
 * @param {object} model - Model definition from AST
 * @param {string} modelName - Name of the model
 */
function renderItems(items, model, modelName) {
  const listDiv = document.querySelector('.list');
  if (!listDiv) {
    console.error('[Webview] List div not found');
    return;
  }
  
  listDiv.innerHTML = '';
  
  // Empty state
  if (!items || items.length === 0) {
    const pluralName = modelName.toLowerCase() + 's';
    listDiv.innerHTML = `<div class="list-item" style="color: var(--vscode-descriptionForeground); font-style: italic;">
      No ${pluralName} yet. Click the button above to create one!
    </div>`;
    return;
  }
  
  // Render each item
  items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.style.display = 'flex';
    itemDiv.style.alignItems = 'center';
    itemDiv.style.gap = '8px';
    
    // Fields container
    const fieldsContainer = document.createElement('div');
    fieldsContainer.style.flex = '1';
    fieldsContainer.style.display = 'flex';
    fieldsContainer.style.gap = '12px';
    fieldsContainer.style.flexWrap = 'wrap';
    
    // Render each field (skip id)
    model.fields.forEach(field => {
      if (field.name === 'id') return;
      
      const fieldContainer = document.createElement('div');
      fieldContainer.style.display = 'flex';
      fieldContainer.style.gap = '4px';
      
      // Field label
      const labelSpan = document.createElement('span');
      labelSpan.style.fontWeight = '500';
      labelSpan.style.color = 'var(--vscode-descriptionForeground)';
      labelSpan.textContent = field.name + ':';
      
      // Field value
      const valueSpan = document.createElement('span');
      const formattedValue = formatFieldValue(item[field.name], field.type);
      valueSpan.textContent = formattedValue;
      
      // Special styling for yes/no
      if (field.type === 'yes/no') {
        valueSpan.style.fontSize = '1.2em';
        valueSpan.style.color = item[field.name] ? 
          'var(--vscode-testing-iconPassed)' : 
          'var(--vscode-descriptionForeground)';
      }
      
      fieldContainer.appendChild(labelSpan);
      fieldContainer.appendChild(valueSpan);
      fieldsContainer.appendChild(fieldContainer);
    });
    
    // Edit button (placeholder for now)
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.style.background = 'transparent';
    editBtn.style.border = 'none';
    editBtn.style.cursor = 'pointer';
    editBtn.style.padding = '4px 8px';
    editBtn.style.fontSize = '14px';
    editBtn.style.opacity = '0.6';
    editBtn.style.transition = 'opacity 0.2s';
    editBtn.onmouseenter = () => { editBtn.style.opacity = '1'; };
    editBtn.onmouseleave = () => { editBtn.style.opacity = '0.6'; };
    editBtn.onclick = (e) => {
      e.stopPropagation();
      console.log('[Webview] Edit not yet implemented for:', modelName);
      showToast('✏️ Edit coming soon!', 'info');
    };
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.style.background = 'transparent';
    deleteBtn.style.border = 'none';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.padding = '4px 8px';
    deleteBtn.style.fontSize = '14px';
    deleteBtn.style.opacity = '0.6';
    deleteBtn.style.transition = 'opacity 0.2s';
    deleteBtn.onmouseenter = () => { deleteBtn.style.opacity = '1'; };
    deleteBtn.onmouseleave = () => { deleteBtn.style.opacity = '0.6'; };
    deleteBtn.onclick = async (e) => {
      e.stopPropagation();
      try {
        const endpoint = getEndpointPath(modelName);
        console.log('[Webview] Deleting:', endpoint + '/' + item.id);
        await callBackend('DELETE', endpoint + '/' + item.id);
        console.log('[Webview] ✅ Deleted');
        showToast('🗑️ Deleted!', 'success');
        await loadData();
      } catch (error) {
        console.error('[Webview] ❌ Delete failed:', error);
        showToast('❌ Error: ' + error.message, 'error');
      }
    };
    
    itemDiv.appendChild(fieldsContainer);
    itemDiv.appendChild(editBtn);
    itemDiv.appendChild(deleteBtn);
    listDiv.appendChild(itemDiv);
  });
}
```

---

### **Phase 4: Update Function Calls**

#### **Change 1: Backend Status Listener (Line 560)**

**Current:**
```javascript
if (message.status === 'connected') {
  setTimeout(() => loadTodos(), 100);
}
```

**Replace with:**
```javascript
if (message.status === 'connected') {
  setTimeout(() => loadData(), 100);
}
```

---

#### **Change 2: Initial Empty State (Lines 730-732)**

**Current:**
```javascript
listDiv.innerHTML = `
  <div class="list-empty">No tasks yet. Click "Add Task" to create one!</div>
`;
```

**Replace with:**
```javascript
// Get model name for dynamic message
const modelName = view.list;
const pluralName = modelName ? modelName.toLowerCase() + 's' : 'items';

listDiv.innerHTML = `
  <div class="list-empty">No ${pluralName} yet. Click the button above to create one!</div>
`;
```

---

### **Phase 5: Remove Old Functions**

#### **Delete: `editTaskWithTitle()` (Lines 849-875)**
This function is todo-specific. Mark for Phase 2 implementation.

**Action:** Comment out for now, keep for reference.

---

## 🧪 **Testing Requirements**

### **Test 1: HelloWorld**
```javascript
// Open 01-hello-world.shep
// Expected AST:
{
  name: "HelloWorld",
  datas: [{
    name: "Message",
    fields: [{ name: "content", type: "text" }]
  }],
  views: [{
    name: "Welcome",
    list: "Message",  // ✅ This tells us what to load
    buttons: [...]
  }]
}

// Expected behavior:
// 1. Shows "No messages yet"
// 2. Calls GET /messages
// 3. Renders content field
// 4. Delete calls DELETE /messages/:id
```

### **Test 2: MyCounter**
```javascript
// Open 02-counter.shep
// Expected: Shows "No counters yet"
// Renders value and label fields
```

### **Test 3: DogReminders**
```javascript
// Open 04-dog-reminders.shep
// Expected: Shows "No reminders yet"
// Renders message, time (formatted), done (as ✓/○)
```

### **Test 4: Todo (Regression)**
```javascript
// Open todo.shep
// Expected: Everything works as before
// Shows "No todos yet"
// All existing functionality intact
```

---

## 📊 **Code Locations**

### **File:** `extension/src/commands/preview.ts`

| Section | Lines | Action |
|---------|-------|--------|
| Helper Functions | After 540 | ADD 4 new functions |
| loadTodos() | 877-983 | REPLACE with loadData() |
| renderItems() | After loadData() | ADD new function |
| Backend Status | 560 | UPDATE function call |
| Initial Render | 730-732 | UPDATE empty message |
| editTaskWithTitle() | 849-875 | COMMENT OUT |

---

## ⚠️ **Constraints**

### **C-1: VS Code API**
- MUST use only official VS Code Webview API
- Reference: https://code.visualstudio.com/api/extension-guides/webview
- No custom or experimental APIs

### **C-2: Backward Compatibility**
- MUST not break existing todo example
- All current functionality must work

### **C-3: Performance**
- Rendering must complete in < 100ms
- No DOM thrashing

### **C-4: Error Handling**
- All functions must check for null/undefined
- Errors must be logged to console
- No crashes allowed

---

## 🔧 **Development Guidelines**

### **Coding Style**
```javascript
// ✅ Good: Descriptive names, JSDoc comments
/**
 * Get model definition from AST
 * @param {string} modelName - Name of the model
 * @returns {object|null} Model definition or null
 */
function getModelByName(modelName) {
  if (!currentAST || !currentAST.datas) return null;
  return currentAST.datas.find(d => d.name === modelName);
}

// ❌ Bad: No comments, unclear name
function getM(n) {
  return currentAST.datas.find(d => d.name === n);
}
```

### **Console Logging**
```javascript
// ✅ Good: Descriptive, includes context
console.log('[Webview] Loading data from backend...');
console.log('[Webview] Calling GET', endpoint);
console.log('[Webview] Loaded items:', items);

// ❌ Bad: No context
console.log('loading');
console.log(items);
```

### **Error Handling**
```javascript
// ✅ Good: Check before use, log errors
if (!currentAST || !currentAST.views) {
  console.error('[Webview] No views in AST');
  return;
}

// ❌ Bad: Assume data exists
const view = currentAST.views[0];  // May crash!
```

---

## 📝 **Implementation Checklist**

- [ ] Add 4 helper functions after line 540
- [ ] Replace `loadTodos()` with `loadData()` at lines 877-983
- [ ] Add `renderItems()` function after `loadData()`
- [ ] Update backend status listener at line 560
- [ ] Update initial render at lines 730-732
- [ ] Comment out `editTaskWithTitle()` at lines 849-875
- [ ] Test HelloWorld example
- [ ] Test MyCounter example
- [ ] Test DogReminders example
- [ ] Test Todo example (regression)
- [ ] Verify console logs are helpful
- [ ] Verify no crashes on missing data
- [ ] Verify render performance < 100ms

---

## ✅ **Verification Steps**

1. **Build Extension**
   ```bash
   cd extension
   pnpm run compile
   ```

2. **Test in VS Code**
   - Press F5 to launch Extension Development Host
   - Open each example file
   - Open preview (Ctrl+Shift+P)
   - Verify rendering
   - Test CRUD operations

3. **Check Console**
   - Open Debug Console (Ctrl+Shift+Y)
   - Look for `[Webview]` logs
   - Verify no errors

4. **Performance Check**
   - Use Chrome DevTools (Help → Toggle Developer Tools)
   - Check rendering time
   - Verify < 100ms

---

## 📚 **References**

### **Official Documentation**
- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [VS Code API Reference](https://code.visualstudio.com/api/references/vscode-api)

### **Internal Documentation**
- [AST Types](../sheplang/packages/language/src/types.ts)
- [Verification Doc](../extension/.specify/PREVIEW-DYNAMIC-RENDERING-VERIFICATION.md)
- [PRD](./PRD_Preview_Dynamic_Rendering.md)

---

**Status:** READY FOR IMPLEMENTATION  
**Estimated Time:** 2-3 hours  
**Risk Level:** Low

**Next Step:** Begin implementation following this TTD
