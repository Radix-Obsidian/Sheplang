# NPM & VS Code Marketplace Publishing Strategy

**Date:** November 23, 2025  
**Status:** 📋 **PLANNING PHASE**  
**Based on:** Official NPM and VS Code Marketplace Documentation

---

## 🎯 **Executive Summary**

This plan outlines the proper sequence for publishing ShepLang components to their respective channels:
1. **Language Package** → NPM Registry (first)
2. **VS Code Extension** → VS Code Marketplace (second)
3. **Version Management** → Semantic versioning across both platforms

---

## 📦 **Phase 1: NPM Package Publishing (@goldensheepai/sheplang-language)**

### **Current State Analysis**
- ✅ Package exists in `sheplang/packages/language/`
- ❌ Not configured for NPM publishing
- ❌ Extension uses local file dependency: `"file:../sheplang/packages/language"`
- ❌ Missing proper TypeScript declaration exports

### **Required Configuration (Based on Official TypeScript Docs)**

#### **1. package.json Updates**
```json
{
  "name": "@goldensheepai/sheplang-language",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

#### **2. TypeScript Build Configuration**
```json
// tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.ts", "**/*.spec.ts"]
}
```

#### **3. .npmignore Configuration**
```
src/
*.ts
!*.d.ts
tsconfig*.json
jest.config.js
.github/
.gitignore
```

#### **4. Build Scripts**
```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "prepublishOnly": "npm run build",
    "test": "npm run test && npm run build"
  }
}
```

### **Publishing Steps**
1. **Navigate to language package**: `cd sheplang/packages/language`
2. **Install dependencies**: `npm install`
3. **Build package**: `npm run build`
4. **Login to NPM**: `npm login`
5. **Publish**: `npm publish --access public`
6. **Verify**: `npm view @goldensheepai/sheplang-language`

---

## 🧩 **Phase 2: VS Code Extension Publishing**

### **Current State Analysis**
- ✅ Extension packaged successfully as `sheplang-vscode-1.0.1.vsix`
- ✅ Publisher exists: "GoldenSheepAI"
- ❌ Uses local file dependency (breaks in production)
- ❌ Cannot publish to marketplace with local dependency

### **Critical Fix Required**

#### **Update Extension Dependencies**
**Before:**
```json
"@goldensheepai/sheplang-language": "file:../sheplang/packages/language"
```

**After:**
```json
"@goldensheepai/sheplang-language": "^1.0.0"
```

### **Publishing Steps (Based on Official VS Code Docs)**

#### **1. Publisher Setup**
- ✅ Publisher already exists: "GoldenSheepAI"
- ✅ Personal Access Token required

#### **2. Extension Validation**
```bash
# Test with npm dependency
npm install
npm run compile
vsce package --no-dependencies
```

#### **3. Publishing Commands**
```bash
# Login to marketplace
vsce login GoldenSheepAI

# Publish extension
vsce publish
```

---

## 🔄 **Phase 3: Version Management Strategy**

### **Semantic Versioning Across Platforms**

#### **Version Coordination**
- **Language Package**: `@goldensheepai/sheplang-language@1.0.0`
- **VS Code Extension**: `sheplang-vscode@1.0.1` (sync major/minor, patch can differ)

#### **Update Process**
1. **Update language package**: `npm version patch/minor/major`
2. **Publish to NPM**: `npm publish`
3. **Update extension dependency**: `npm install @goldensheepai/sheplang-language@^1.0.0`
4. **Update extension version**: `npm version patch/minor/major`
5. **Publish to marketplace**: `vsce publish`

---

## 🧪 **Phase 4: Quality Assurance**

### **Pre-Publishing Checklist**

#### **NPM Package**
- [ ] TypeScript declarations generated correctly
- [ ] All dependencies properly declared
- [ ] .npmignore excludes source files
- [ ] Package installs cleanly in test project
- [ ] Types work in consumer project

#### **VS Code Extension**
- [ ] Extension loads without errors
- [ ] Syntax highlighting works
- [ ] Language server functionality works
- [ ] All commands execute properly
- [ ] No local file dependencies

### **Integration Testing**
```bash
# Test in clean environment
mkdir test-consumer
cd test-consumer
npm init -y
npm install @goldensheepai/sheplang-language
# Test types work

# Test extension locally
code --install-extension sheplang-vscode-1.0.1.vsix
# Verify all features work
```

---

## 🚨 **Critical Issues to Resolve**

### **1. Local File Dependency**
**Issue**: Extension uses `"file:../sheplang/packages/language"`  
**Impact**: Cannot publish to marketplace  
**Fix**: Publish language package to npm first, then update extension dependency

### **2. TypeScript Declarations**
**Issue**: Language package may not have proper `.d.ts` files  
**Impact**: Consumers won't get proper TypeScript support  
**Fix**: Configure TypeScript build with `declaration: true`

### **3. Version Synchronization**
**Issue**: Extension and language package versions may drift  
**Impact**: Compatibility issues for users  
**Fix**: Implement coordinated versioning strategy

---

## 📋 **Implementation Timeline**

### **Day 1: NPM Package Setup**
- Configure language package for NPM publishing
- Set up build scripts and TypeScript configuration
- Test local package installation

### **Day 2: NPM Publishing**
- Build and publish language package to NPM
- Verify package works in consumer projects

### **Day 3: Extension Update**
- Update extension to use NPM dependency
- Test extension functionality
- Package and test .vsix

### **Day 4: Marketplace Publishing**
- Publish extension to VS Code Marketplace
- Verify installation and functionality

---

## 🎯 **Success Criteria**

- ✅ Language package published to NPM with proper TypeScript support
- ✅ Extension published to VS Code Marketplace without local dependencies
- ✅ Both packages install and function correctly for end users
- ✅ Version management process established for future updates

---

## 📚 **References**

- **Official TypeScript Publishing Guide**: https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html
- **Official VS Code Publishing Guide**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- **NPM Publishing Documentation**: https://docs.npmjs.com/cli/v8/commands/npm-publish
- **Semantic Versioning**: https://semver.org/

---

**Next Steps:** Execute Phase 1 (NPM Package Configuration) immediately, then proceed with publishing sequence.
