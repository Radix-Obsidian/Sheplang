# 🧪 Manual Testing Checklist

## ✅ Automated Status: **PASSED** (5/5 tests)
- Core files exist ✅
- Package.json files valid ✅  
- Extension commands registered ✅
- README updated to v1.1.9 ✅
- Wizard types exist ✅

---

## 🎯 Quick Manual Tests (15 minutes)

### 1. VS Code Extension Test
1. Open VS Code
2. Go to Extensions → Search "ShepLang"
3. **If not installed:** Install from local folder
4. **If already installed:** Reload VS Code

### 2. Command Palette Test
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "ShepLang"
3. **Expected:** See these commands:
   - `ShepLang: Start Project Wizard` 🚀
   - `ShepLang: Quick Create Project` ⚡
   - `ShepLang: Test Wizard` 🧪
   - `ShepLang: Quick Test Wizard` ⚡

### 3. Quick Create Project Test
1. Run `ShepLang: Quick Create Project`
2. Enter project name: `test-manual-app`
3. Select: `Mobile-first app`
4. **Expected:** 
   - Success notification appears
   - New folder created in workspace
   - Option to open project or view README

### 4. Generated Project Verification
Navigate to `test-manual-app/` and check:
```
📁 test-manual-app/
├── 📄 README.md
├── 📄 package.json
├── 📁 src/
│   ├── 📄 entities/User.shep
│   ├── 📄 flows/Authentication.shep
│   ├── 📄 screens/Dashboard.shep
│   └── 📄 integrations/Auth.shep
└── 📁 docs/
    ├── 📄 SETUP.md
    └── 📄 API.md
```

### 5. ShepLang Syntax Check
Open `src/entities/User.shep` and verify:
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

---

## 🎯 Full Wizard Test (20 minutes)

### 1. Start Complete Wizard
1. Run `ShepLang: Start Project Wizard`
2. Click "Start Wizard" at welcome screen

### 2. Step-by-Step Completion
**Step 1 - Project Overview:**
- Select: `SaaS dashboard`
- Enter name: `my-saas-app`
- Enter description: `A test SaaS application`

**Step 2 - Core Features:**
- Select: `User authentication`, `Dashboard`, `Real-time updates`

**Step 3 - Data Model:**
- Add `User` entity with: `name`, `email`, `plan`
- Add `Project` entity with: `title`, `description`, `userId`

**Step 4 - User Roles:**
- Select: `Multiple roles`
- Add: `Admin` (all permissions), `Member` (read-only)

**Step 5 - Integrations:**
- Add: `Stripe` (payments)
- Add: `SendGrid` (email)

**Step 6 - Technical:**
- API Style: `REST`
- Real-time: `Yes`
- Deployment: `Vercel`

### 3. Generation Progress
- Watch progress panel updates
- Should see real-time feedback
- Completion notification should appear

### 4. Generated Project Quality
Check the generated project has:
- ✅ Multiple entities with relationships
- ✅ Authentication flows
- ✅ Payment integration setup
- ✅ Real-time features enabled
- ✅ Comprehensive documentation

---

## 🔍 Regression Tests (10 minutes)

### 1. Todo App Template
1. Create new project: `test-todo-regression`
2. Use Quick Create with `Mobile-first app`
3. Verify it matches our original working version:
   - Todo entity with `title`, `completed` fields
   - Basic CRUD actions
   - Dashboard screen
   - Authentication integration

### 2. Syntax Validation
1. Open any `.shep` file
2. Check for syntax highlighting (if working)
3. Verify no obvious syntax errors

---

## 📊 Expected Results

### ✅ Should Work
- All commands appear in palette
- Quick create completes in <30 seconds
- Full wizard completes in <2 minutes
- Generated projects have correct structure
- Progress panel shows real-time updates

### ⚠️ Might Have Issues
- Syntax highlighting (still in development)
- Error messages might be generic
- Some edge cases in wizard validation

### ❌ Should Be Fixed
- Commands not appearing
- Generation failing completely
- Generated code with syntax errors
- Extension crashes

---

## 🐛 Troubleshooting

### If Commands Don't Appear:
1. Reload VS Code (`Ctrl+R`)
2. Check extension is enabled
3. Open Developer Tools → Console for errors

### If Generation Fails:
1. Check output channel: `View → Output → ShepLang`
2. Look for error messages
3. Verify workspace folder is open

### If Generated Code Has Errors:
1. Check entity field types in wizard
2. Verify template files exist
3. Check scaffolding agent logs

---

## 📝 Report Results

Copy this template and fill in your results:

```
## Manual Test Results - [Date]

### VS Code Extension
- Commands appear: ✅/❌
- Extension loads: ✅/❌
- No console errors: ✅/❌

### Quick Create Project
- Command works: ✅/❌
- Project created: ✅/❌
- File structure correct: ✅/❌
- Time to complete: [seconds]

### Full Wizard
- All steps work: ✅/❌
- Progress panel updates: ✅/❌
- Generated project quality: ✅/❌
- Time to complete: [minutes]

### Generated Code
- Syntax looks correct: ✅/❌
- All files present: ✅/❌
- Documentation generated: ✅/❌

### Issues Found:
1. [Description]
2. [Description]

### Overall Status: ✅ READY FOR USERS / ⚠️ MINOR ISSUES / ❌ NEEDS FIXES
```

---

## 🚀 Next Steps

**If all tests pass:**
1. 🎉 Ready for broader testing
2. Document any minor issues found
3. Consider beta testing with users
4. Plan release notes

**If issues found:**
1. 🔧 Fix critical issues first
2. 🧪 Re-run failed tests
3. 📝 Update documentation
4. 🔄 Test again

---

**Remember:** The goal is to ensure the Project Wizard provides a smooth, professional experience for users creating their first ShepLang projects!
