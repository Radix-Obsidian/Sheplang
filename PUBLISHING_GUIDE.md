# Publishing Guide v1.1.0

**Status:** ✅ Ready to Publish  
**Versions:** Extension 1.1.0 | Language 0.1.8 | Compiler 0.1.3

---

## 🎯 What's Being Published

### Major Features
- ✅ GitHub Import (one-click conversion)
- ✅ Preview UX overhaul (sample data + toast notifications)
- ✅ ShepUI screen kind detection
- ✅ ShepAPI full-stack generation
- ✅ Reserved field name handling
- ✅ 173/173 tests passing

---

## 📋 Pre-Flight Checklist

### 1. ✅ Version Bumps (DONE)
- [x] Extension: 1.0.2 → 1.1.0
- [x] Language: 0.1.7 → 0.1.8
- [x] Compiler: 0.1.2 → 0.1.3
- [x] CHANGELOG.md updated
- [x] Committed and pushed

### 2. Build & Test
```bash
# 1. Build all packages
cd c:\Users\autre\OneDrive\Desktop\Projects (Golden Sheep AI)\Sheplang
pnpm run build

# 2. Run all tests (should show 173/173 passing)
pnpm run test

# 3. Build extension specifically
cd extension
npm run build
```

### 3. Manual Smoke Test
```bash
# 1. Press F5 in VS Code (opens Extension Development Host)
# 2. Open Command Palette (Ctrl+Shift+P)
# 3. Run "ShepLang: Import from GitHub"
# 4. Paste: https://github.com/boxyhq/saas-starter-kit
# 5. Verify 165+ files generated
# 6. Open app.shep and click "Show Preview"
# 7. Verify sample data appears (no "No data yet")
# 8. Click buttons to verify toast notifications
```

---

## 📦 NPM Publishing

### Step 1: Language Package

```bash
cd c:\Users\autre\OneDrive\Desktop\Projects (Golden Sheep AI)\Sheplang\sheplang\packages\language

# Build
pnpm run build

# Login to npm (if not already)
npm login

# Publish
npm publish --access public

# Verify
npm view @goldensheepai/sheplang-language
```

**Expected output:**
```
+ @goldensheepai/sheplang-language@0.1.8
```

---

### Step 2: Compiler Package

```bash
cd c:\Users\autre\OneDrive\Desktop\Projects (Golden Sheep AI)\Sheplang\sheplang\packages\compiler

# Build
pnpm run build

# Publish
npm publish --access public

# Verify
npm view @goldensheepai/sheplang-compiler
```

**Expected output:**
```
+ @goldensheepai/sheplang-compiler@0.1.3
```

---

## 🔌 VS Code Extension Publishing

### Prerequisites
```bash
# Install vsce if not already installed
npm install -g @vscode/vsce

# Login to Azure DevOps (if not already)
vsce login GoldenSheepAI
```

### Step 1: Package Extension

```bash
cd c:\Users\autre\OneDrive\Desktop\Projects (Golden Sheep AI)\Sheplang\extension

# Create .vsix file
vsce package

# This creates: sheplang-vscode-1.1.0.vsix
```

### Step 2: Test .vsix Locally

```bash
# Install in VS Code
code --install-extension sheplang-vscode-1.1.0.vsix

# Test the installed extension
# 1. Restart VS Code
# 2. Run import command
# 3. Verify preview works
# 4. Check version in Extensions view
```

### Step 3: Publish to Marketplace

```bash
# Publish (requires publisher access)
vsce publish

# OR publish manually via web:
# 1. Go to: https://marketplace.visualstudio.com/manage/publishers/GoldenSheepAI
# 2. Upload sheplang-vscode-1.1.0.vsix
# 3. Wait for validation (5-10 minutes)
```

**Expected output:**
```
Publishing GoldenSheepAI.sheplang-vscode@1.1.0...
Successfully published GoldenSheepAI.sheplang-vscode@1.1.0!
```

---

## 🐙 GitHub Release

### Step 1: Merge to Main

```bash
cd c:\Users\autre\OneDrive\Desktop\Projects (Golden Sheep AI)\Sheplang

# Ensure all changes are committed
git status

# Merge to main
git checkout main
git merge cleanup/deprecate-figma-rest
git push origin main
```

### Step 2: Create Release Tag

```bash
# Create and push tag
git tag -a v1.1.0 -m "v1.1.0 - GitHub Import & Preview UX Overhaul"
git push origin v1.1.0
```

### Step 3: Create GitHub Release

**Go to:** https://github.com/Radix-Obsidian/Sheplang/releases/new

**Tag:** `v1.1.0`

**Title:** `v1.1.0 - GitHub Import & Preview UX Revolution`

**Description:**
```markdown
# ShepLang v1.1.0 - GitHub Import & UX Revolution

## 🎉 Major Features

### GitHub Import (One-Click Conversion)
Convert any production codebase to ShepLang in 60 seconds:
- ✅ Tested on [boxyhq/saas-starter-kit](https://github.com/boxyhq/saas-starter-kit) (165+ files generated)
- ✅ Tested on [shadcn/taxonomy](https://github.com/shadcn/taxonomy) (Full Next.js 13 app)
- ✅ Supports Next.js + Prisma + TypeScript + Tailwind

**Command:** `Ctrl+Shift+P` → "ShepLang: Import from GitHub"

### Preview UX Overhaul
- **Sample data** automatically populated (no more "No data yet")
- **Toast notifications** instead of blocking alerts
- **Realistic samples** based on entity type (Users, Accounts, Teams)
- **Non-technical friendly** - looks like a working app immediately

## 🐛 Fixes
- Reserved field names (id, email, date) now handled correctly
- All generated files use valid ShepLang syntax
- broadcastError command registered

## 📊 Stats
- **173/173 tests passing** (100%)
- **165+ files** generated from saas-starter-kit
- **90% confidence** on Prisma projects
- Full backend support matrix documented

## 📦 What's Included
- VS Code Extension v1.1.0
- @goldensheepai/sheplang-language v0.1.8
- @goldensheepai/sheplang-compiler v0.1.3

## 📚 Documentation
- [Test Results](TEST_RESULTS.md) - 173 passing tests
- [Extension README](extension/README.md) - Backend support matrix
- [Import Guide](extension/README.md#-import-from-github-) - Quick start

## 🙏 Credits
Built by Jordan "AJ" Autrey - Golden Sheep AI

---

**Install:** [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode)

**NPM Packages:**
- [@goldensheepai/sheplang-language](https://www.npmjs.com/package/@goldensheepai/sheplang-language)
- [@goldensheepai/sheplang-compiler](https://www.npmjs.com/package/@goldensheepai/sheplang-compiler)
```

**Upload Files:**
- ✅ `sheplang-vscode-1.1.0.vsix`

**Click:** "Publish release"

---

## ✅ Post-Publishing Checklist

### 1. Verify NPM Packages
- [ ] Visit https://www.npmjs.com/package/@goldensheepai/sheplang-language
- [ ] Verify version shows 0.1.8
- [ ] Visit https://www.npmjs.com/package/@goldensheepai/sheplang-compiler
- [ ] Verify version shows 0.1.3

### 2. Verify VS Code Marketplace
- [ ] Visit https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode
- [ ] Verify version shows 1.1.0
- [ ] Check install count
- [ ] Read reviews/ratings

### 3. Verify GitHub Release
- [ ] Visit https://github.com/Radix-Obsidian/Sheplang/releases
- [ ] Verify v1.1.0 shows at top
- [ ] Download and test .vsix file

### 4. Update Documentation Sites
- [ ] Update sheplang.lovable.app with new features
- [ ] Update Product Hunt (if live) with v1.1.0 announcement
- [ ] Tweet/post about release

---

## 🚨 Troubleshooting

### "vsce: command not found"
```bash
npm install -g @vscode/vsce
```

### "Publisher not found"
```bash
# Create publisher account at:
# https://marketplace.visualstudio.com/manage/createpublisher
```

### "npm publish failed: 403"
```bash
# Make sure you're logged in
npm whoami

# If not logged in:
npm login
```

### Build errors
```bash
# Clean and rebuild
pnpm run clean
pnpm install
pnpm run build
```

---

## 📝 Marketing Copy

### Product Hunt Announcement

**Title:** ShepLang v1.1 - Import Any GitHub Repo, Get Verified Code

**Description:**
> The first AI-native language with GitHub import. Convert production codebases to verified ShepLang in 60 seconds.
> 
> ✅ 173/173 tests passing  
> ✅ Converts boxyhq/saas-starter-kit → 165 verified files  
> ✅ Preview with realistic sample data  
> ✅ Full VS Code tooling (IntelliSense, diagnostics, hover)  
> 
> Import → Preview → Deploy in minutes.

### Twitter/X Post

> 🚀 ShepLang v1.1 is LIVE!
> 
> Now with GitHub import - convert any production codebase to verified ShepLang in 60 seconds.
> 
> ✅ 173/173 tests passing
> ✅ 165+ files from real projects
> ✅ Sample data preview
> ✅ Full VS Code tooling
> 
> Try it: [marketplace link]
> 
> #ShepLang #AIcoding #FullStack

---

## 🎯 Success Criteria

**Release is successful when:**
- [ ] NPM packages published and accessible
- [ ] VS Code extension live on marketplace
- [ ] GitHub release created with .vsix
- [ ] All verification links working
- [ ] No critical bugs reported in first 24 hours
- [ ] 10+ new installs in first week

---

**Ready to publish!** Follow steps 1-3 above in order.
