# VS Code Extension Battle Test Checklist

**Status:** Ready for Publishing ✅  
**Date:** November 23, 2025  
**Following:** Official VS Code Testing Documentation

---

## 🎯 **Core Functionality Tests**

### **1. Syntax Highlighting Test**
- [ ] Create new file: `test.shep`
- [ ] Verify file opens with ShepLang syntax highlighting
- [ ] Check keywords have correct colors:
  - `app` - purple/keyword color
  - `data` - blue/type color  
  - `view` - green/definition color
  - `action` - orange/function color
  - `text`, `button`, `list` - string colors
- [ ] Verify comments are grayed out
- [ ] Check strings have proper highlighting

### **2. Code Completion & Snippets Test**
- [ ] Open `.shep` file
- [ ] Type `app` + Tab → Verify full app snippet appears
- [ ] Type `data` + Tab → Verify data model snippet
- [ ] Type `view` + Tab → Verify view snippet with UI elements
- [ ] Type `action` + Tab → Verify action snippet
- [ ] Test completion suggestions appear automatically
- [ ] Verify snippet placeholders work (Tab through fields)

### **3. Real-Time Diagnostics Test**
- [ ] Write invalid syntax: `app` (no name)
- [ ] Verify red squiggles appear under error
- [ ] Check error message in Problems panel
- [ ] Test missing required fields in data/view/action
- [ ] Verify hover over error shows diagnostic details
- [ ] Test that fixing errors removes squiggles immediately

### **4. Language Server Features Test**
- [ ] Hover over `app` keyword → Verify tooltip appears
- [ ] Hover over `data` keyword → Check documentation shows
- [ ] Right-click → Test "Go to Definition" works
- [ ] Test "Find All References" on custom types
- [ ] Verify symbol navigation (Ctrl+Shift+O) shows app/data/view/action

### **5. Compilation Test**
- [ ] Write complete ShepLang code (TaskFlow example)
- [ ] Run command: `ShepLang: Compile` (Ctrl+Shift+P)
- [ ] Verify output folder is created
- [ ] Check generated TypeScript files exist
- [ ] Verify compilation completes without errors
- [ ] Test compilation with errors shows proper diagnostics

---

## 🚀 **Integration Tests**

### **6. Playground Integration Test**
- [ ] Open VS Code with extension active
- [ ] Open existing `.shep` file from playground examples
- [ ] Verify all features work together
- [ ] Test editing triggers real-time diagnostics
- [ ] Verify compilation works on complex examples

### **7. Performance Test**
- [ ] Open large `.shep` file (100+ lines)
- [ ] Verify syntax highlighting loads quickly
- [ ] Test diagnostics appear without lag
- [ ] Check completion is responsive
- [ ] Verify memory usage is reasonable

---

## 📋 **Publishing Readiness**

### **8. Package Verification**
- [ ] Check `package.json` has correct version
- [ ] Verify all dependencies are listed
- [ ] Check extension icon displays correctly
- [ ] Verify extension description is accurate
- [ ] Test extension loads without errors

### **9. VS Code Marketplace Requirements**
- [ ] Extension follows VS Code marketplace guidelines
- [ ] No hardcoded paths or dependencies
- [ ] All commands are properly registered
- [ ] Extension works on Windows, Mac, Linux
- [ ] Security scan passes (no vulnerabilities)

---

## 🔧 **Test Environment Setup**

### **Prerequisites**
- [ ] VS Code Insiders or Stable (latest)
- [ ] Disable all other extensions for clean testing
- [ ] Fresh VS Code instance (no cached extensions)
- [ ] Test on multiple platforms if possible

### **Test Files**
Create these test files in a temporary workspace:
- `syntax-test.shep` - For syntax highlighting tests
- `completion-test.shep` - For snippet tests  
- `error-test.shep` - For diagnostic tests
- `compile-test.shep` - For compilation tests

---

## ✅ **Pass/Fail Criteria**

### **Must Pass for Publishing:**
- All syntax highlighting works correctly
- Code completion and snippets function
- Real-time diagnostics appear for errors
- Compilation generates valid output
- Extension loads without crashes
- All core features work on target platforms

### **Nice to Have:**
- Advanced language server features
- Performance optimizations
- Additional tooling features

---

## 🚨 **Known Issues to Fix Before Publishing**

*(Update this section as issues are found)*

- [ ] Issue 1: Description
- [ ] Issue 2: Description
- [ ] Issue 3: Description

---

## 📝 **Test Results**

**Date:** ___________  
**Tester:** ___________  
**Environment:** ___________  

**Overall Status:** [ ] PASS [ ] FAIL

**Core Features:** [ ] PASS [ ] FAIL  
**Integration:** [ ] PASS [ ] FAIL  
**Performance:** [ ] PASS [ ] FAIL  
**Ready for Publish:** [ ] YES [ ] NO

---

**Notes:**
________________________________________________________________
________________________________________________________________
________________________________________________________________

---

## 🎯 **Next Steps After Battle Test**

1. **If PASS:** Proceed to publishing with `vsce publish`
2. **If FAIL:** Fix identified issues and retest
3. **Document:** Record any limitations or known issues
4. **Version:** Update package.json version if changes made

---

**Following Official VS Code Testing Documentation:**  
https://code.visualstudio.com/api/working-with-extensions/testing-extension
