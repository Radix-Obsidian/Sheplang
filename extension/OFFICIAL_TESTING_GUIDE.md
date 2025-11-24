# 🧪 Official VS Code Extension Testing Guide

## 📚 **Based on Official VS Code Documentation**

**Sources:**
- [Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)

---

## 🎯 **Three Critical Issues Identified & Solved**

### **Issue 1: Marketplace Installing Old Version**
**Problem:** Marketplace serving broken v1.0.0 from 4 days ago  
**Solution:** Increment to v1.0.1 and republish with fixed dependencies

### **Issue 2: Language Icons Missing**
**Problem:** No icons in language selector like PowerShell has  
**Solution:** Add `icon` property with `light`/`dark` variants per official docs

### **Issue 3: Testing Workflow Issues**
**Problem:** Development vs production testing confusion  
**Solution:** Follow official VS Code testing best practices

---

## 🚀 **Official Publishing Workflow**

### **Step 1: Pre-Publish Validation**
```bash
# 1. Run production readiness test
npm run test:production

# 2. Create VSIX package
npm run package

# 3. Inspect VSIX contents (CRITICAL)
vsce ls sheplang-vscode-1.0.1.vsix

# Should show:
# ✅ node_modules/ included (10-50MB size)
# ✅ Grammar files included
# ✅ Language server included
# ✅ Icons included
```

### **Step 2: Local VSIX Testing**
```bash
# 1. Install VSIX in clean VS Code
code --install-extension sheplang-vscode-1.0.1.vsix

# 2. Open VS Code normally (NOT development mode)
code .

# 3. Test ALL features:
#    - Extension activates without errors
#    - Syntax highlighting works
#    - Language icons appear in selector
#    - Commands work in palette
#    - No "Cannot find module" errors
```

### **Step 3: Publish to Marketplace**
```bash
# Only after VSIX testing passes!
npm run publish

# OR with version increment (per official docs):
vsce publish patch  # Auto-increments 1.0.1 -> 1.0.2
```

---

## 🎨 **Language Icons Implementation (Per Official Docs)**

### **Official Documentation Reference:**
From [Contribution Points - Languages](https://code.visualstudio.com/api/references/contribution-points):

> Contribute an icon which can be used as in file icon themes if theme does not contain an icon for the language

### **Implementation Added:**
```json
{
  "contributes": {
    "languages": [
      {
        "id": "sheplang",
        "aliases": ["ShepLang", "sheplang"],
        "extensions": [".shep"],
        "configuration": "./language-configuration.json",
        "icon": {
          "light": "./icons/sheplang-light.svg",
          "dark": "./icons/sheplang-dark.svg"
        }
      }
    ]
  }
}
```

### **Icons Created:**
- ✅ `icons/sheplang-light.svg` - Light theme icon
- ✅ `icons/sheplang-dark.svg` - Dark theme icon
- ✅ 16x16px SVG format (per best practices)
- ✅ Simple "S" monogram design

---

## 🧪 **Official Testing Best Practices**

### **Development Testing (Current Setup)**
```bash
# Per official docs - use --disable-extensions
npm run demo:open
# Equivalent to:
code --disable-extensions --extensionDevelopmentPath=. demo-workspace/sheplang-demo.code-workspace
```

**Why --disable-extensions?**
From [Testing Extensions - Disabling Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension#disabling-other-extensions-while-debugging):

> When you debug an extension test in VS Code, VS Code uses the globally installed instance of VS Code and will load all installed extensions. You can add --disable-extensions configuration

### **Launch Configuration (Updated)**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--disable-extensions",
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": ["${workspaceFolder}/out/**/*.js"],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```

### **Production Testing (VSIX)**
```bash
# 1. Package extension
npm run package

# 2. Test in clean environment
code --install-extension sheplang-vscode-1.0.1.vsix

# 3. Open normally (development mode vs production mode)
code .

# 4. Verify all features work
```

---

## 📊 **Testing Checklist (Official Standards)**

### **Development Mode Testing:**
- [ ] Extension activates without errors
- [ ] Syntax highlighting works in .shep files
- [ ] Language icons appear in selector
- [ ] Commands visible in command palette
- [ ] Commands execute successfully
- [ ] No errors in Extension Host output
- [ ] Extension Host shows: "ShepLang extension activated"

### **VSIX Package Testing:**
- [ ] Package size is reasonable (10-50MB with dependencies)
- [ ] VSIX installs without errors
- [ ] Extension appears in Extensions panel
- [ ] All features work in normal VS Code (not development mode)
- [ ] Language icons visible in language selector
- [ ] No "Cannot find module" errors
- [ ] No activation failures

### **Marketplace Readiness:**
- [ ] Version incremented (1.0.0 → 1.0.1)
- [ ] CHANGELOG.md updated
- [ ] README.md current
- [ ] All tests pass
- [ ] VSIX tested successfully
- [ ] No secrets in package
- [ ] Dependencies properly included

---

## 🚨 **Common Testing Mistakes (Per Official Docs)**

### **❌ DON'T DO THIS:**
```bash
# Missing --disable-extensions
code --extensionDevelopmentPath=.
# Problem: Loads installed extensions → conflicts!
```

### **✅ DO THIS:**
```bash
# With --disable-extensions
code --disable-extensions --extensionDevelopmentPath=.
# Result: Clean development environment
```

### **❌ DON'T DO THIS:**
```bash
# Skip VSIX testing
npm run publish directly
# Problem: Publish broken extension to marketplace
```

### **✅ DO THIS:**
```bash
# Full testing workflow
npm run test:production
npm run package
code --install-extension sheplang-vscode-1.0.1.vsix
# Test thoroughly
npm run publish
```

---

## 📦 **Package Inspection (Critical Step)**

### **Inspect VSIX Contents:**
```bash
# List VSIX contents
vsce ls sheplang-vscode-1.0.1.vsix

# Should include:
✅ out/                    # Compiled extension
✅ syntaxes/               # Grammar files
✅ icons/                  # Language icons
✅ language-configuration.json
✅ node_modules/           # ALL dependencies
  ✅ @goldensheepai/sheplang-language/
  ✅ vscode-languageclient/
  ✅ All other runtime deps
```

### **Package Size Analysis:**
```
Good size: 10-50MB (includes dependencies)
Too small: <5MB (missing dependencies)
Too large: >100MB (includes unnecessary files)
```

---

## 🎯 **Solution Summary**

### **✅ Issues Fixed:**

1. **Marketplace Version Issue:**
   - Incremented version to 1.0.1
   - Ready to publish fixed extension

2. **Language Icons Added:**
   - Created light/dark SVG icons
   - Added `icon` property to language contribution
   - Per official VS Code documentation

3. **Testing Workflow Standardized:**
   - Development testing with `--disable-extensions`
   - Production testing with VSIX package
   - Following official VS Code best practices

### **📋 Next Steps:**

1. **Test Development Mode:**
   ```bash
   npm run demo:open
   # Verify syntax highlighting, icons, commands
   ```

2. **Create and Test VSIX:**
   ```bash
   npm run package
   code --install-extension sheplang-vscode-1.0.1.vsix
   code .
   # Test all features in normal mode
   ```

3. **Publish to Marketplace:**
   ```bash
   npm run publish
   # Only after VSIX testing passes!
   ```

---

## 📚 **Official Documentation References**

1. **Testing Extensions:**
   - https://code.visualstudio.com/api/working-with-extensions/testing-extension

2. **Publishing Extensions:**
   - https://code.visualstudio.com/api/working-with-extensions/publishing-extension

3. **Language Contributions:**
   - https://code.visualstudio.com/api/references/contribution-points#contributes.languages

4. **Extension Manifest:**
   - https://code.visualstudio.com/api/references/extension-manifest

---

*All solutions based on official VS Code Extension API documentation.* 🚀
