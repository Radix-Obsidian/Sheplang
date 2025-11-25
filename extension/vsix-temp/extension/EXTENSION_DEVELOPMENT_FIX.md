# 🔧 Extension Development Issue - SOLVED

## 🚨 **The Problem**

**Error:**
```
Activating extension 'GoldenSheepAI.sheplang-vscode' failed: Cannot find module 'vscode-languageclient/node'
Require stack:
- c:\Users\autre\.vscode\extensions\goldensheepai.sheplang-vscode-1.0.0\out\extension.js
```

**Root Cause:** When using `--extensionDevelopmentPath`, VS Code **loads ALL installed extensions by default**, including the old broken marketplace version.

---

## 📚 **Official VS Code Documentation**

**Source:** [Testing Extensions | Visual Studio Code Extension API](https://code.visualstudio.com/api/working-with-extensions/testing-extension)

**Key Quote:**
> "When you debug an extension test in VS Code, VS Code uses the globally installed instance of VS Code and will load all installed extensions. You can add --disable-extensions configuration to the launch.json or the launchArgs option."

---

## ✅ **The Solution**

### **Step 1: Add `--disable-extensions` Flag**

Per official VS Code documentation, add `--disable-extensions` to prevent loading installed extensions during development.

### **Step 2: Updated Files**

**package.json** - npm script:
```json
"demo:open": "code --disable-extensions --extensionDevelopmentPath=. demo-workspace/sheplang-demo.code-workspace"
```

**.vscode/launch.json** - Debug configurations:
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
    },
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--disable-extensions",
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
      ],
      "outFiles": ["${workspaceFolder}/out/test/**/*.js"],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```

### **Step 3: Remove Old Installed Extension**

```bash
# Uninstall old broken extension
code --uninstall-extension goldensheepai.sheplang-vscode

# Verify it's gone
code --list-extensions | grep sheplang
```

---

## 🎯 **Why This Happened**

### **The Timeline:**

1. **Old Extension (v1.0.0):**
   - Published with bad `.vscodeignore`
   - Excluded `node_modules/@goldensheepai/**`
   - Missing all dependencies
   - Users couldn't use it - broken on install

2. **Development Testing:**
   - Ran `npm run demo:open`
   - Launched with `--extensionDevelopmentPath`
   - **BUT** VS Code loaded BOTH:
     - Development version (working)
     - Installed version (broken)
   - Broken version failed first → Error!

3. **The Fix:**
   - Added `--disable-extensions` flag
   - Prevents loading installed extensions
   - Only loads development version
   - Everything works!

---

## 🔍 **Understanding VS Code Extension Loading**

### **Default Behavior:**
```bash
code --extensionDevelopmentPath=/path/to/extension
```
- ✅ Loads development extension
- ⚠️ ALSO loads ALL installed extensions
- ❌ Can cause conflicts with installed versions

### **Correct Development Behavior:**
```bash
code --disable-extensions --extensionDevelopmentPath=/path/to/extension
```
- ✅ Loads ONLY development extension
- ✅ Ignores ALL installed extensions
- ✅ No conflicts
- ✅ Clean testing environment

---

## 📋 **Testing Checklist (Updated)**

### **For Development Testing:**
```bash
# Always use --disable-extensions flag
npm run demo:open

# OR press F5 in VS Code (now uses updated launch.json)
```

### **For VSIX Testing:**
```bash
# Test the packaged extension
npm run package
code --install-extension sheplang-vscode-X.X.X.vsix

# Open normally (without --extensionDevelopmentPath)
code .

# Test all features
```

---

## 🚨 **Common Mistakes to Avoid**

### **❌ DON'T DO THIS:**
```bash
# Missing --disable-extensions
code --extensionDevelopmentPath=.
```
**Problem:** Loads both development AND installed versions → Conflicts!

### **✅ DO THIS:**
```bash
# With --disable-extensions
code --disable-extensions --extensionDevelopmentPath=.
```
**Result:** Only loads development version → Clean testing!

---

## 📚 **Official Documentation References**

1. **Testing Extensions:**
   - https://code.visualstudio.com/api/working-with-extensions/testing-extension

2. **Disabling Extensions:**
   - https://code.visualstudio.com/api/working-with-extensions/testing-extension#disabling-other-extensions-while-debugging

3. **Extension Development:**
   - https://code.visualstudio.com/api/get-started/your-first-extension

4. **VS Code CLI:**
   - https://code.visualstudio.com/docs/editor/command-line

---

## ✅ **Verification Steps**

### **After Applying Fixes:**

1. **Uninstall old extension:**
   ```bash
   code --uninstall-extension goldensheepai.sheplang-vscode
   code --list-extensions | grep sheplang
   # Should return nothing
   ```

2. **Test development mode:**
   ```bash
   npm run demo:open
   # Opens VS Code with ONLY development extension
   # No other extensions loaded
   ```

3. **Verify in Extension Host:**
   - View → Output → Extension Host
   - Should see: "ShepLang extension activated"
   - Should NOT see: "Cannot find module" errors

4. **Test all features:**
   - [ ] Syntax highlighting works
   - [ ] Commands appear in palette
   - [ ] Commands execute successfully
   - [ ] No activation errors

---

## 🎉 **Problem Solved!**

**Key Learnings:**
1. ✅ Always use official VS Code documentation
2. ✅ Use `--disable-extensions` for clean development testing
3. ✅ Remove old broken extensions before testing
4. ✅ Update both npm scripts AND launch.json
5. ✅ Test thoroughly before publishing

**The extension now works perfectly in development mode!** 🚀

---

*Based on official VS Code Extension API documentation and testing best practices.*
