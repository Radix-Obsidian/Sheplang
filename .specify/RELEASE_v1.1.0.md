# Release v1.1.0 - GitHub Import & Preview UX Overhaul

**Release Date:** November 25, 2025  
**Status:** Ready to Publish

---

## 🎉 What's New

### 🔄 GitHub Import (Major Feature)
- **One-click conversion** of production codebases to ShepLang
- **Verified on real projects:** boxyhq/saas-starter-kit, shadcn/taxonomy
- **165+ files generated** from a single GitHub URL
- **Full-stack output:** models, views, actions, workflows, jobs, integrations

### 🎨 Preview UX Overhaul
- **Sample data automatically shown** - no more confusing "No data yet" messages
- **Context-aware samples** - realistic data based on entity type (Users, Teams, Accounts)
- **Toast notifications** instead of blocking alerts
- **Non-technical founder friendly** - looks like a working app immediately

### 🐛 Critical Fixes
- **Reserved field names** - `id`, `email`, `date` now handled correctly
- **Valid ShepLang syntax** - all generated files conform to grammar
- **broadcastError command** - registered to fix console warnings

---

## 📦 Version Bumps

| Package | Old Version | New Version |
|---------|-------------|-------------|
| **VS Code Extension** | 1.0.2 | **1.1.0** |
| **@goldensheepai/sheplang-language** | 0.1.7 | **0.1.8** |
| **@goldensheepai/sheplang-compiler** | 0.1.2 | **0.1.3** |

---

## 📊 Test Results

- ✅ **173/173 tests passing** (100% pass rate)
- ✅ Entity extraction tests
- ✅ React parser tests
- ✅ View mapper tests
- ✅ Integration tests
- ✅ Backend correlation tests

**View full results:** [TEST_RESULTS.md](../TEST_RESULTS.md)

---

## 🔧 Backend Support

| Backend Type | Support Level |
|-------------|---------------|
| Prisma ORM | ✅ 90% confidence |
| React Component State | ✅ 50% confidence |
| Combined | ✅ 70% confidence |

---

## 📝 Publishing Checklist

### 1. Version Bumps
- [ ] Update `extension/package.json` to `1.1.0`
- [ ] Update `sheplang/packages/language/package.json` to `0.1.8`
- [ ] Update `sheplang/packages/compiler/package.json` to `0.1.3`
- [ ] Update `extension/CHANGELOG.md`

### 2. Build & Test
- [ ] `pnpm run build` (all packages)
- [ ] `pnpm run test` (173 tests should pass)
- [ ] Manual smoke test with GitHub import

### 3. NPM Publishing
- [ ] `cd sheplang/packages/language && npm publish`
- [ ] `cd sheplang/packages/compiler && npm publish`

### 4. VS Code Extension
- [ ] `cd extension && vsce package`
- [ ] `vsce publish`

### 5. GitHub Release
- [ ] Merge branch to `main`
- [ ] Create release tag `v1.1.0`
- [ ] Upload `.vsix` file
- [ ] Copy release notes

---

## 🚀 Release Notes (for GitHub)

```markdown
# ShepLang v1.1.0 - GitHub Import & UX Revolution

## 🎉 Major Features

### GitHub Import (One-Click Conversion)
Convert any production codebase to ShepLang in 60 seconds:
- ✅ Tested on boxyhq/saas-starter-kit (165+ files generated)
- ✅ Tested on shadcn/taxonomy (Full Next.js 13 app)
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
- 173/173 tests passing (100%)
- 165+ files generated from saas-starter-kit
- 90% confidence on Prisma projects
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
```

---

## 📝 CHANGELOG Entry

```markdown
## [1.1.0] - 2025-11-25

### Added
- GitHub import feature - convert production codebases to ShepLang
- Sample data generation for preview (context-aware based on entity type)
- Toast notifications for better UX
- TEST_RESULTS.md with 173 passing tests
- Backend support matrix documentation
- ShepUI screen kind detection (form, dashboard, feed, detail, inbox)
- ShepAPI generation (workflows, jobs, integrations, realtime)

### Fixed
- Reserved field name handling (id, email, date, etc.)
- Generated files now use valid ShepLang syntax
- broadcastError command registration
- Preview UX for non-technical founders

### Changed
- Extension version bump to 1.1.0
- Language package bump to 0.1.8
- Compiler package bump to 0.1.3
```

---

## 🎯 Marketing Copy (Product Hunt)

**Headline:**
> ShepLang v1.1 - Import Any GitHub Repo, Get Verified Code

**Description:**
> The first AI-native language with GitHub import. Convert production codebases to verified ShepLang in 60 seconds.
> 
> ✅ 173/173 tests passing
> ✅ Converts boxyhq/saas-starter-kit → 165 verified files
> ✅ Preview with realistic sample data
> ✅ Full VS Code tooling (IntelliSense, diagnostics, hover)
> 
> Import → Preview → Deploy in minutes.

---

## ⚠️ Known Limitations

- GraphQL backends not yet supported (Prisma only)
- MongoDB/Mongoose not yet supported
- Large projects (500+ components) may take 2-3 minutes to import

---

## 🔮 Future Enhancements

- GraphQL schema parsing
- MongoDB/Mongoose support
- Batch import (multiple repos)
- AI-powered code refinement suggestions
- Deployment integration (Vercel, Netlify)

---

**Ready to publish!** Follow the checklist above.
