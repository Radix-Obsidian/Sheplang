# 📦 Dual Publishing - NPM + GitHub Packages

ShepLang packages are published to **BOTH** NPM and GitHub Packages for maximum accessibility.

---

## 🎯 Why Dual Publishing?

### NPM Registry
- ✅ **Maximum reach** - Standard for JavaScript ecosystem
- ✅ **Easy installation** - No auth needed for public packages
- ✅ **Better discovery** - Appears in npmjs.com search
- ✅ **Industry standard** - Expected by most developers

### GitHub Packages
- ✅ **Integrated with repo** - Shows on GitHub homepage
- ✅ **Version history** - Linked to releases
- ✅ **Professional look** - Proves production-ready
- ✅ **YC/investor friendly** - Shows polish

**Result:** Best of both worlds! 🎉

---

## 📥 Installation (Users)

### From NPM (Recommended - Easiest)

```bash
# Global installation
npm install -g sheplang

# Project installation
npm install @sheplang/language
npm install @adapters/sheplang-to-boba
```

**No authentication needed!**

### From GitHub Packages (Advanced)

See [INSTALL_FROM_GITHUB.md](./INSTALL_FROM_GITHUB.md) for GitHub Packages setup.

---

## 🚀 How Publishing Works

On every **tag push** (e.g., `v1.0.0-alpha`), GitHub Actions runs:

### 1. Test Job
- ✅ Build all packages
- ✅ Run all tests (must be 100% passing)
- ✅ Smoke test CLI

### 2. Publish to NPM (Parallel)
- 📦 Publishes to `registry.npmjs.org`
- 🔐 Uses `NPM_TOKEN` secret
- 🌍 Public access (`--access public`)

### 3. Publish to GitHub Packages (Parallel)
- 📦 Publishes to `npm.pkg.github.com`
- 🔐 Uses `GITHUB_TOKEN` (automatic)
- 🔒 Requires `packages: write` permission

**Both jobs run in parallel after tests pass!**

---

## 📦 Published Packages

### NPM Registry
- https://www.npmjs.com/package/sheplang
- https://www.npmjs.com/package/@sheplang/language
- https://www.npmjs.com/package/@adapters/sheplang-to-boba

### GitHub Packages
- https://github.com/Radix-Obsidian/Sheplang-BobaScript/packages

---

## 🔐 Required Secrets

### NPM_TOKEN
**Location:** GitHub Settings → Secrets → Actions

**How to create:**
```bash
# Login to NPM
npm login

# Create token
npm token create

# Copy token (npm_...)
```

**Add to GitHub:**
1. Go to: https://github.com/Radix-Obsidian/Sheplang-BobaScript/settings/secrets/actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Your token
5. Click "Add secret"

### GITHUB_TOKEN
✅ **Automatically provided** - No setup needed!

---

## 📊 Package Configuration

All `package.json` files include:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/Radix-Obsidian/Sheplang-BobaScript.git",
    "directory": "path/to/package"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

This allows:
- ✅ Publishing to both registries
- ✅ Public access on NPM
- ✅ Proper repository linking

---

## 🔄 Workflow Steps

### `.github/workflows/publish.yml`

```yaml
jobs:
  test:
    # Runs first - must pass
    
  publish-npm:
    needs: test
    # Publishes to NPM registry
    
  publish-github:
    needs: test
    # Publishes to GitHub Packages
```

**Key features:**
- Tests run once
- Publishing happens in parallel
- If either fails, both stop
- Automatic retry on transient errors

---

## ✅ Verification

After publishing, verify packages are live:

### NPM
```bash
npm view sheplang
npm view @sheplang/language
npm view @adapters/sheplang-to-boba
```

### GitHub Packages
Visit: https://github.com/Radix-Obsidian/Sheplang-BobaScript/packages

### Test Installation
```bash
# From NPM
npx sheplang@latest --version

# Should show latest version
```

---

## 🎯 Publishing Checklist

Before creating a release tag:

- [ ] All tests passing locally (`pnpm run verify`)
- [ ] Version bumped in all package.json files
- [ ] CHANGELOG.md updated
- [ ] NPM_TOKEN secret added to GitHub
- [ ] README.md reflects new version

**Then:**
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push --tags
```

Workflow will auto-publish to both registries!

---

## 🐛 Troubleshooting

### "NPM_TOKEN not found"
**Fix:** Add secret in GitHub Settings → Secrets → Actions

### "403 Forbidden" on NPM
**Fix:** Check token has correct permissions:
```bash
npm token list
```

### "Package already exists" on NPM
**Fix:** Bump version in package.json files

### GitHub Packages fails but NPM succeeds
**Fix:** Check `packages: write` permission in workflow

---

## 📚 Documentation

- **NPM Docs:** https://docs.npmjs.com/creating-and-publishing-an-organization-scoped-package
- **GitHub Packages Docs:** https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry
- **Main README:** [README.md](./README.md)
- **Install from GitHub:** [INSTALL_FROM_GITHUB.md](./INSTALL_FROM_GITHUB.md)

---

**Your packages reach developers everywhere!** 🌍✨
