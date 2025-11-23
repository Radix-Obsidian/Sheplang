# 🧪 ShepLang Smoke Test Guide

## Overview
This guide provides a comprehensive testing approach to verify all ShepLang functionality after our major updates including the Project Wizard, README updates, and type fixes.

## 🎯 Test Objectives
- Verify Project Wizard works end-to-end
- Test template generation and compilation
- Validate VS Code extension functionality
- Check basic ShepLang parsing and code generation
- Ensure no regressions in existing features

---

## 🚀 Phase 1: Quick Automated Tests (5 minutes)

### 1.1 Language Core Tests
```bash
cd sheplang
pnpm run test
```
**Expected:** All language tests pass (86/86)

### 1.2 Verification Engine Tests
```bash
cd sheplang/packages/verifier
pnpm run test
```
**Expected:** All verification tests pass (42/42)

### 1.3 Full-Stack Tests
```bash
cd sheplang
pnpm run test:integration
```
**Expected:** Full-stack integration tests pass (35/35)

---

## 🎯 Phase 2: Project Wizard Tests (10 minutes)

### 2.1 Extension Build Test
```bash
cd extension
npm run compile
```
**Expected:** No TypeScript compilation errors

### 2.2 Wizard Commands Test
1. Open VS Code
2. Open Command Palette (Ctrl+Shift+P)
3. Search for "ShepLang" commands
4. Verify these commands exist:
   - `ShepLang: Start Project Wizard`
   - `ShepLang: Quick Create Project`
   - `ShepLang: Test Wizard`
   - `ShepLang: Quick Test Wizard`

### 2.3 Quick Create Project Test
1. Run `ShepLang: Quick Create Project`
2. Enter project name: `test-smoke-app`
3. Select project type: `Mobile-first app`
4. **Expected:** Project created successfully with:
   - Basic folder structure
   - User entity with name, email, createdAt
   - Authentication feature
   - Dashboard feature
   - README.md file

---

## 🔍 Phase 3: Template Verification (15 minutes)

### 3.1 Generated Project Structure Check
Navigate to the created project and verify:
```
test-smoke-app/
├── README.md
├── package.json
├── src/
│   ├── entities/
│   │   └── User.shep
│   ├── flows/
│   │   └── Authentication.shep
│   ├── screens/
│   │   └── Dashboard.shep
│   └── integrations/
│       └── Auth.shep
└── docs/
    ├── SETUP.md
    └── API.md
```

### 3.2 ShepLang Syntax Validation
Test each generated file:

**User.shep:**
```sheplang
data User:
  fields:
    name: text (required)
    email: text (required)
    createdAt: date

action createUser(name, email):
  call POST "/users" with name, email
  load GET "/users" into users
  show UserList
```

### 3.3 Parser Test
```bash
cd extension
node -e "
const { parseShep } = require('../sheplang/packages/language/src/index.js');
parseShep('data User: name: text').then(result => {
  console.log('✅ Parser works:', result.success);
}).catch(err => console.error('❌ Parser failed:', err));
"
```

---

## 🌐 Phase 4: End-to-End Flow Test (20 minutes)

### 4.1 Complete Project Generation
1. Run `ShepLang: Start Project Wizard`
2. Complete all 6 steps:
   - **Step 1:** Project Overview (SaaS dashboard)
   - **Step 2:** Features (User auth, CRUD operations, Real-time updates)
   - **Step 3:** Data Model (User, Project, Task entities)
   - **Step 4:** User Roles (Admin, Member roles)
   - **Step 5:** Integrations (Stripe for payments, SendGrid for email)
   - **Step 6:** Technical (REST API, Real-time enabled, Vercel deployment)

3. **Expected:** Complete project with:
   - 3 entities with relationships
   - Authentication flows
   - Payment integration
   - Real-time features
   - Comprehensive documentation

### 4.2 Generated Code Quality Check
Verify generated code includes:
- ✅ Proper type annotations
- ✅ Error handling
- ✅ API validation
- ✅ Integration setup
- ✅ Documentation

---

## 🧪 Phase 5: Regression Tests (10 minutes)

### 5.1 Todo App Template Test
1. Create new project: `test-todo-regression`
2. Generate basic todo app
3. Verify it matches our original working version:
   - Entity: Todo with title, completed fields
   - Actions: createTodo, completeTodo, deleteTodo
   - Screen: Dashboard with todo list
   - Backend: REST endpoints for CRUD operations

### 5.2 Syntax Validation Test
```bash
# Test our syntax validator
cd extension
node -e "
const { SyntaxValidator } = require('./src/validation/syntaxValidator.js');
const validator = new SyntaxValidator();
validator.validate('data User: name: text').then(result => {
  console.log('✅ Syntax validation works:', result.success);
});
"
```

---

## 📊 Phase 6: Performance & Integration (5 minutes)

### 6.1 Extension Performance
- Measure extension startup time
- Check command response time
- Verify memory usage is reasonable

### 6.2 Wizard Progress Tracking
- Run wizard and verify progress panel updates correctly
- Check real-time feedback during generation
- Verify error handling works

---

## ✅ Success Criteria

### Must Pass
- [ ] All automated tests pass (163/163)
- [ ] Extension compiles without errors
- [ ] Wizard commands are accessible
- [ ] Quick create project works
- [ ] Generated projects have correct structure
- [ ] ShepLang syntax validation works

### Should Pass
- [ ] Full wizard workflow completes
- [ ] Progress panel shows real-time updates
- [ ] Generated code compiles/runs
- [ ] Documentation is generated correctly
- [ ] No regressions in existing features

### Nice to Have
- [ ] Performance is acceptable (<5s for project creation)
- [ ] Error messages are helpful
- [ ] Generated code follows best practices

---

## 🐛 Common Issues & Solutions

### Issue: TypeScript compilation errors
**Solution:** Check tsconfig.json and import paths
**File:** `extension/tsconfig.json`

### Issue: Wizard commands not showing
**Solution:** Verify commands are registered in package.json and extension.ts
**Files:** `extension/package.json`, `extension/src/extension.ts`

### Issue: Generated code has syntax errors
**Solution:** Check entity field types and templates
**Files:** `extension/src/generators/*.ts`

### Issue: Progress panel not updating
**Solution:** Verify GenerationProgress interface and callback handlers
**Files:** `extension/src/ui/progressPanel.ts`, `extension/src/wizard/types.ts`

---

## 📝 Test Results Template

```
## Smoke Test Results - [Date]

### Phase 1: Automated Tests
- Language Core: ✅/❌ (86/86 passing)
- Verification Engine: ✅/❌ (42/42 passing)
- Full-Stack Integration: ✅/❌ (35/35 passing)

### Phase 2: Project Wizard
- Extension Build: ✅/❌
- Commands Available: ✅/❌
- Quick Create: ✅/❌

### Phase 3: Template Verification
- Project Structure: ✅/❌
- Syntax Validation: ✅/❌
- Parser Test: ✅/❌

### Phase 4: End-to-End Flow
- Complete Wizard: ✅/❌
- Code Quality: ✅/❌

### Phase 5: Regression Tests
- Todo App Template: ✅/❌
- Syntax Validator: ✅/❌

### Phase 6: Performance
- Extension Performance: ✅/❌
- Progress Tracking: ✅/❌

### Issues Found:
1. [Issue description]
2. [Issue description]

### Overall Status: ✅ READY / ❌ NEEDS FIXES
```

---

## 🚀 Next Steps After Testing

1. **If all tests pass:** Ready for broader testing and user feedback
2. **If issues found:** Fix critical issues first, then re-run smoke tests
3. **Document findings:** Update test suite with any new test cases needed
4. **Prepare for release:** Update version numbers and changelog

---

**Remember:** The goal is to catch integration issues early and ensure a smooth user experience with the new Project Wizard and updated features!
