# 📦 Publishing ShepLang VSCode Extension

Complete guide for publishing the ShepLang VSCode extension to the Visual Studio Code Marketplace.

---

## 🎯 What Gets Published

The **ShepLang VSCode Extension** provides the complete AIVP (AI-Verified Programming) experience:

### Features
- ✅ **Syntax highlighting** for `.shep` and `.shepthon` files
- ✅ **Language Server** with IntelliSense, hover, go-to-definition
- ✅ **Live Preview** - See your app as you build it
- ✅ **Verification Engine** - Real-time error checking
- ✅ **ShepThon Backend** - Auto-start backend runtime
- ✅ **5 Project Templates** - HelloWorld, Counter, Contacts, Dog Reminders, Todo
- ✅ **Smart Error Recovery** - Helpful error messages

**Result:** Users get the ENTIRE ShepLang system in one click!

---

## 🔐 Step 1: Create VSCode Marketplace Publisher

### Create Publisher Account

1. Go to: https://marketplace.visualstudio.com/manage
2. Click **"Create publisher"**
3. **Publisher ID:** `golden-sheep-ai` (must match package.json)
4. **Publisher name:** Golden Sheep AI
5. **Click "Create"**

### Generate Personal Access Token (PAT)

1. Go to: https://dev.azure.com/YOUR_ORG/_usersSettings/tokens
2. Click **"New Token"**
3. **Name:** "VSCode Extension Publishing"
4. **Organization:** All accessible organizations
5. **Scopes:** Custom defined
   - ✅ **Marketplace: Manage** (this is the critical one!)
6. **Expiration:** 90 days or custom
7. Click **"Create"**
8. **Copy the token** (starts with `vsce_...`)

### Add Token to GitHub Secrets

1. Go to: https://github.com/Radix-Obsidian/Sheplang-BobaScript/settings/secrets/actions
2. Click **"New repository secret"**
3. **Name:** `VSCE_PAT`
4. **Secret:** Your token
5. Click **"Add secret"**

---

## 📝 Step 2: Verify Extension Configuration

### package.json Requirements

Verify these fields in `extension/package.json`:

```json
{
  "name": "sheplang-vscode",
  "displayName": "ShepLang - AI-Native Verified Programming",
  "publisher": "golden-sheep-ai",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.85.0"
  },
  "main": "./out/extension.js"
}
```

**✅ All set!** (Already configured)

### Required Files

- [x] `package.json` - Extension manifest
- [x] `README.md` - Extension description
- [x] `CHANGELOG.md` - Version history
- [x] `LICENSE` - MIT license
- [x] `media/icon.png` - Extension icon (128x128)
- [x] `.vscodeignore` - Files to exclude from package

---

## 🚀 Step 3: Publish Extension

### Option A: Automatic (via GitHub Actions) - Recommended

```bash
# Tag the extension release
git tag ext-v1.0.0 -m "Extension v1.0.0 - Initial marketplace release"
git push --tags

# GitHub Actions will automatically:
# 1. Build the extension
# 2. Package as .vsix
# 3. Publish to VSCode Marketplace
# 4. Create GitHub Release with .vsix file
```

**Workflow:** `.github/workflows/publish-extension.yml`

### Option B: Manual Publishing

```bash
cd extension

# Install dependencies
npm install

# Install vsce CLI
npm install -g @vscode/vsce

# Login to publisher
vsce login golden-sheep-ai

# Package extension
vsce package

# Publish to marketplace
vsce publish

# Or publish specific version
vsce publish 1.0.0
```

---

## 📦 What Happens on Publish

### 1. Build Process
- ✅ Install dependencies
- ✅ Compile TypeScript to JavaScript
- ✅ Bundle extension files
- ✅ Create `.vsix` package

### 2. Marketplace Publishing
- ✅ Upload to VSCode Marketplace
- ✅ Extension appears at: `https://marketplace.visualstudio.com/items?itemName=golden-sheep-ai.sheplang-vscode`
- ✅ Available in VSCode Extensions panel

### 3. GitHub Release
- ✅ Create release with tag
- ✅ Attach `.vsix` file for manual installation
- ✅ Generate release notes

---

## ✅ Verification

### Check Marketplace

1. Visit: https://marketplace.visualstudio.com/publishers/golden-sheep-ai
2. Verify "ShepLang" extension appears
3. Check version number matches

### Test Installation

```bash
# From marketplace (easiest)
1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search "ShepLang"
4. Click "Install"

# Or from command line
code --install-extension golden-sheep-ai.sheplang-vscode

# Or from .vsix file
code --install-extension sheplang-vscode-1.0.0.vsix
```

### Verify Features

1. Create a `.shep` file
2. Verify syntax highlighting works
3. Click "Show Preview" button
4. Create a new project: `Ctrl+Shift+P` → "ShepLang: New Project"
5. Open a `.shepthon` file → verify backend starts

---

## 🎯 Extension Versioning

### Version Format

Use semantic versioning for extensions:
- **Major.Minor.Patch** (e.g., `1.0.0`)

### When to Bump

- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features
- **Major** (1.0.0 → 2.0.0): Breaking changes

### Update Version

1. Update `extension/package.json`:
   ```json
   "version": "1.1.0"
   ```

2. Update `extension/CHANGELOG.md`:
   ```markdown
   ## [1.1.0] - 2025-11-18
   ### Added
   - New feature X
   ```

3. Create tag:
   ```bash
   git tag ext-v1.1.0 -m "Extension v1.1.0"
   git push --tags
   ```

---

## 📊 Post-Publishing

### Monitor Metrics

Visit: https://marketplace.visualstudio.com/manage/publishers/golden-sheep-ai

**Track:**
- Install count
- Rating & reviews
- Download stats
- User feedback

### Update Extension

For updates:
1. Make code changes
2. Bump version in `package.json`
3. Update `CHANGELOG.md`
4. Create new tag: `ext-v1.x.x`
5. Push tag → Auto-publish!

---

## 🐛 Troubleshooting

### "Publisher not found"

**Fix:** Create publisher at https://marketplace.visualstudio.com/manage

### "Invalid PAT"

**Fix:** Ensure token has "Marketplace: Manage" scope

### "Package missing files"

**Fix:** Check `.vscodeignore` isn't excluding required files

### "Version already exists"

**Fix:** Bump version number in `package.json`

---

## 📚 Documentation to Include

### extension/README.md

Should include:
- ✅ Feature overview
- ✅ Installation instructions
- ✅ Quick start guide
- ✅ Screenshots/GIFs
- ✅ Configuration options
- ✅ Known issues

### extension/CHANGELOG.md

Track all changes:
```markdown
## [1.0.0] - 2025-11-18
### Added
- Initial marketplace release
- Syntax highlighting for .shep and .shepthon
- Live preview functionality
- Language server with IntelliSense
- 5 project templates
```

---

## 🎉 Success Criteria

After publishing, users can:

1. **Find Extension:** Search "ShepLang" in VSCode Extensions
2. **Install Extension:** One-click install
3. **Use Immediately:** Create `.shep` file → auto-highlights
4. **Build Apps:** Use project templates
5. **Get Help:** README and docs in marketplace

**Result:** Complete AIVP system available to everyone! 🚀

---

## 📖 Resources

- **VSCode Publishing Docs:** https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- **vsce CLI:** https://github.com/microsoft/vscode-vsce
- **Marketplace Management:** https://marketplace.visualstudio.com/manage
- **Extension Guidelines:** https://code.visualstudio.com/api/references/extension-guidelines

---

**Your extension brings ShepLang to millions of VSCode users!** 🌍✨
