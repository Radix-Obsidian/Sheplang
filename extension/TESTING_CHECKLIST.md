# ✅ Extension Testing Checklist

## 🎯 **What Just Happened**

**Problem:** Your OLD published extension (v1.0.0) was broken because it was packaged with the bad .vscodeignore that excluded dependencies.

**Fixed:** 
- ✅ Uninstalled broken old extension
- ✅ Fixed .vscodeignore to include dependencies
- ✅ Rebuilt everything properly
- ✅ Opening development mode for testing

---

## 🧪 **Test in Development Mode (NOW)**

When the new VS Code window opens with your extension loaded:

### **Test 1: Extension Activates**
- [ ] Check bottom right - "ShepLang" should appear in status bar
- [ ] Check Output panel (View → Output → Extension Host)
- [ ] Should see: "ShepLang extension activated" or similar
- [ ] Should NOT see: "Cannot find module" errors

### **Test 2: Syntax Highlighting**
- [ ] Open any `.shep` file in demo-workspace
- [ ] Keywords should be colored (`app`, `data`, `view`, `action`)
- [ ] Strings should be green
- [ ] Types should be colored
- [ ] Comments should be gray

### **Test 3: Commands Work**
- [ ] Open Command Palette (Ctrl+Shift+P)
- [ ] Type "ShepLang"
- [ ] Should see ALL commands:
  - ShepLang: Show Preview
  - ShepLang: New Project
  - ShepLang: Show Output
  - ShepLang: Restart Backend
  - etc.
- [ ] Try running "ShepLang: Show Output"
- [ ] Should NOT get "Command not found" error

### **Test 4: Language Server Working**
- [ ] Hover over keywords in .shep file
- [ ] Should see tooltips/information
- [ ] Type something and check for autocomplete
- [ ] No errors in Extension Host output

---

## 📦 **If Development Mode Works**

### **Next: Create Production VSIX**

```bash
# 1. Run production test
npm run test:production

# Should see: 🎉 ALL TESTS PASSED!

# 2. Create VSIX package
npm run package

# Creates: sheplang-vscode-1.0.0.vsix (or higher version)
```

### **Test VSIX Before Publishing**

```bash
# 1. Close ALL VS Code windows

# 2. Install the NEW VSIX
code --install-extension sheplang-vscode-1.0.0.vsix

# 3. Open VS Code normally (NOT development mode)
code .

# 4. Run ALL tests above again in normal mode
```

---

## 🚨 **Troubleshooting**

### **If extension still doesn't activate:**

Check Extension Host output:
1. View → Output
2. Select "Extension Host" from dropdown
3. Look for actual error message
4. Share the error if still broken

### **If "Cannot find module" error persists:**

```bash
# Rebuild everything from scratch
cd c:\Users\autre\OneDrive\Desktop\Projects (Golden Sheep AI)\Sheplang\extension

# Clean and rebuild
rm -rf node_modules out
cd ../sheplang/packages/language
rm -rf node_modules dist
npm install
npm run build

cd ../../extension
npm install
npm run compile
npm run test:production
```

---

## 📊 **Success Criteria**

**Development mode works when:**
- ✅ No activation errors
- ✅ Syntax highlighting perfect
- ✅ All commands visible in palette
- ✅ Commands execute without errors
- ✅ No errors in Extension Host

**VSIX package works when:**
- ✅ Extension installs without errors
- ✅ All features work in normal VS Code (not development mode)
- ✅ File size is reasonable (10-50MB)
- ✅ No "Cannot find module" errors

---

## 🚀 **Publishing Workflow**

**Only publish after BOTH tests pass:**

```bash
# 1. Development mode test ✅
npm run demo:open

# 2. Production readiness test ✅
npm run test:production

# 3. Create VSIX ✅
npm run package

# 4. Install and test VSIX ✅
code --install-extension sheplang-vscode-X.X.X.vsix

# 5. Publish to marketplace
npm run publish
```

---

*Test thoroughly before publishing! 🧪*
