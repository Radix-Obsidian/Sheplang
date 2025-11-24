# 🚀 ShepLang Extension - Production Packaging Guide

## 🎯 **Critical Production Issues Fixed**

### **Issue 1: Language Server Not Found**
**Error:** `Cannot find module 'vscode-languageclient/node'`  
**Cause:** .vscodeignore was excluding `node_modules/@goldensheepai/**`  
**Fixed:** ✅ Updated .vscodeignore to include compiled language package

### **Issue 2: Commands Not Working**
**Error:** "Command not found" in command palette  
**Cause:** Extension activation failing due to missing dependencies  
**Fixed:** ✅ Proper dependency bundling in VSIX package

### **Issue 3: Local File Dependency**
**Problem:** `"@goldensheepai/sheplang-language": "file:../sheplang/packages/language"`  
**Solution:** ✅ npm creates a symlink that gets included in VSIX properly

---

## 📦 **Production Packaging Workflow**

### **Step 1: Build Everything**
```bash
# From extension directory
cd c:\Users\autre\OneDrive\Desktop\Projects (Golden Sheep AI)\Sheplang\extension

# Build language package first
cd ../sheplang/packages/language
npm install
npm run build

# Build extension
cd ../../extension
npm install
npm run compile
```

### **Step 2: Test Locally Before Packaging**
```bash
# Test extension in development mode
npm run demo:open

# Verify:
# ✅ Syntax highlighting works
# ✅ Commands appear in palette
# ✅ Language server activates
# ✅ No errors in Extension Host output
```

### **Step 3: Create VSIX Package**
```bash
# Package extension
npm run package

# This creates: sheplang-vscode-X.X.X.vsix
```

### **Step 4: Test VSIX Package (CRITICAL)**
```bash
# Install VSIX in clean VS Code
code --install-extension sheplang-vscode-X.X.X.vsix

# Test in NEW VS Code window (not development mode):
code .

# Verify ALL features:
# ✅ Extension appears in Extensions panel
# ✅ Syntax highlighting works in .shep files
# ✅ Commands work in command palette
# ✅ No activation errors
# ✅ Language server starts properly
```

### **Step 5: Publish to Marketplace**
```bash
# Only after VSIX testing passes!
npm run publish
```

---

## 🔍 **What Gets Included in VSIX**

### **Included (MUST be in package):**
```
✅ out/                          # Compiled TypeScript
✅ syntaxes/                     # Grammar files
✅ language-configuration.json   # Language config
✅ node_modules/                 # ALL runtime dependencies
   ✅ @goldensheepai/sheplang-language/dist/  # Compiled language server
   ✅ vscode-languageclient/     # Language client
   ✅ vscode-languageserver/     # Language server protocol
   ✅ express/                   # Backend server
   ✅ socket.io/                 # Real-time communication
   ✅ All other dependencies in package.json
```

### **Excluded (from .vscodeignore):**
```
❌ src/                          # TypeScript sources
❌ .vscode/                      # Dev config
❌ test-resources/               # Test artifacts
❌ demo-workspace/               # Demo files
❌ .env                          # Secrets
❌ node_modules/**/test/         # Dependency tests
❌ node_modules/**/*.ts          # TS sources (keep .js)
```

---

## 🚨 **Critical Files Check**

### **Before Packaging, Verify These Exist:**
```bash
# Extension compiled output
✅ out/extension.js
✅ out/commands/*.js

# Language package compiled
✅ node_modules/@goldensheepai/sheplang-language/dist/index.js
✅ node_modules/@goldensheepai/sheplang-language/dist/language-server/main.js

# Grammar files
✅ syntaxes/sheplang.tmLanguage.json
✅ syntaxes/shepthon.tmLanguage.json

# Configuration
✅ language-configuration.json
✅ package.json
```

---

## 🧪 **Testing Checklist**

### **Local Development Testing:**
- [ ] Run `npm run compile` - no errors
- [ ] Run `npm run demo:open` - extension loads
- [ ] Open .shep file - syntax highlighting works
- [ ] Open command palette - ShepLang commands visible
- [ ] Execute `ShepLang: Show Output` - no errors
- [ ] Check Extension Host output - no activation errors

### **VSIX Package Testing (MANDATORY):**
- [ ] Create VSIX with `npm run package`
- [ ] Check VSIX size (should be 10-50MB with dependencies)
- [ ] Install in clean VS Code instance
- [ ] Restart VS Code completely
- [ ] Open any .shep file
- [ ] Verify syntax highlighting works
- [ ] Open command palette
- [ ] Test each ShepLang command
- [ ] Check for any errors in Extension Host

### **Production Readiness:**
- [ ] All tests pass
- [ ] No console errors
- [ ] Commands execute without errors
- [ ] Language server activates
- [ ] Syntax highlighting works
- [ ] No "Cannot find module" errors
- [ ] README.md is up to date
- [ ] CHANGELOG.md is updated
- [ ] Version number bumped in package.json

---

## 🛠️ **Dependency Management**

### **Runtime Dependencies (MUST be in dependencies):**
```json
{
  "@goldensheepai/sheplang-language": "file:../sheplang/packages/language",
  "vscode-languageclient": "^9.0.1",
  "vscode-languageserver": "^9.0.1",
  "express": "^4.18.2",
  "socket.io": "^4.6.0"
}
```

### **Development Dependencies (NOT in VSIX):**
```json
{
  "@types/vscode": "^1.85.0",
  "@vscode/vsce": "^2.22.0",
  "typescript": "^5.3.0"
}
```

### **Why Docker Is NOT Needed:**
- ✅ VS Code extensions run in Node.js environment
- ✅ All dependencies bundled in VSIX package
- ✅ No containerization needed for extension
- ✅ Users install extension, dependencies included
- ❌ Docker would add complexity without benefit
- ❌ Extensions can't run in containers

---

## 🔧 **Troubleshooting Production Issues**

### **Issue: "Cannot find module 'vscode-languageclient/node'"**
**Cause:** Dependency not included in VSIX  
**Fix:**
```bash
# Check .vscodeignore doesn't exclude node_modules
# Rebuild and repackage
npm install
npm run compile
npm run package
```

### **Issue: "Command not found"**
**Cause:** Extension not activating properly  
**Fix:**
```bash
# Check Extension Host output for real error
# View → Output → Extension Host
# Look for activation failure message
```

### **Issue: No Syntax Highlighting**
**Cause:** Grammar files not included in VSIX  
**Fix:**
```bash
# Verify grammar files exist
ls syntaxes/
# Should see: sheplang.tmLanguage.json, shepthon.tmLanguage.json

# Repackage if missing
npm run package
```

### **Issue: VSIX Too Large (>100MB)**
**Cause:** Including unnecessary files  
**Fix:**
```bash
# Check .vscodeignore excludes:
# - test files
# - TypeScript sources
# - Development tools

# Typical good size: 10-50MB
```

---

## 📊 **Package Size Breakdown**

**Typical VSIX size: ~15-30MB**
```
~5MB   - Compiled extension code (out/)
~2MB   - Language server (@goldensheepai/sheplang-language)
~3MB   - Language client (vscode-languageclient)
~2MB   - Express & dependencies
~3MB   - Socket.io & dependencies
~5MB   - Other runtime dependencies
~1MB   - Grammar files, configs, README
```

**If VSIX is >50MB:**
- ❌ Check if test files included
- ❌ Check if TypeScript sources included
- ❌ Check if dev dependencies included

---

## 🚀 **Quick Production Commands**

```bash
# Full production build & test workflow
cd extension

# 1. Build everything
npm run compile

# 2. Create VSIX
npm run package

# 3. Test VSIX locally
code --install-extension sheplang-vscode-1.0.0.vsix

# 4. Publish (only after testing!)
npm run publish
```

---

## ✅ **Final Checklist Before Publishing**

**Code Quality:**
- [ ] No TypeScript errors
- [ ] No console.error in production code
- [ ] All TODO/FIXME comments resolved
- [ ] Code formatted and linted

**Functionality:**
- [ ] All commands work
- [ ] Syntax highlighting perfect
- [ ] Language server activates
- [ ] No errors in Extension Host

**Documentation:**
- [ ] README.md accurate and complete
- [ ] CHANGELOG.md updated with new version
- [ ] Demo GIFs created and included
- [ ] Screenshots updated

**Testing:**
- [ ] Local development testing passed
- [ ] VSIX package testing passed
- [ ] Clean VS Code install tested
- [ ] All features verified working

**Packaging:**
- [ ] .vscodeignore correct
- [ ] .gitignore correct
- [ ] Version number bumped
- [ ] No secrets in package

**Marketplace:**
- [ ] Extension icon present
- [ ] Categories correct
- [ ] Keywords optimized
- [ ] License specified

---

*Ready for production deployment! 🚀*
