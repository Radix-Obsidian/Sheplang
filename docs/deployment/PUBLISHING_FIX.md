# 🔧 Publishing Fix - Why Packages Weren't Appearing

**Issue:** Packages not showing on NPM or GitHub Packages  
**Status:** ✅ FIXED  
**Date:** November 17, 2025

---

## ❌ What Went Wrong

### 1. Missing NPM_TOKEN Secret
**Problem:** Tag `v1.0.0-alpha` was pushed WITHOUT `NPM_TOKEN` in GitHub Secrets

**Result:**
- NPM publishing workflow ran
- Authentication failed (no token)
- Nothing published to NPM ❌

### 2. Wrong Package Scope for GitHub Packages
**Problem:** Package names didn't match GitHub organization

**Before (Wrong):**
- `@sheplang/language` ❌
- `@adapters/sheplang-to-boba` ❌

**GitHub Packages requires scopes to match:**
- Your GitHub org: `Radix-Obsidian`
- Required scope: `@radix-obsidian/*`

**Result:**
- GitHub Packages rejected the scope
- Nothing published to GitHub Packages ❌

---

## ✅ What Was Fixed

### 1. Package Names Renamed
Changed all packages to use `@radix-obsidian` scope:

**After (Correct):**
- `@radix-obsidian/sheplang-language` ✅
- `@radix-obsidian/sheplang-to-boba` ✅
- `sheplang` (CLI - unscoped is fine) ✅

### 2. Internal Dependencies Updated
Updated all `package.json` files to reference renamed packages:
- `sheplang/packages/cli/package.json`
- `adapters/sheplang-to-boba/package.json`

---

## 🚀 Complete Publishing Steps

### Step 1: Add NPM_TOKEN to GitHub Secrets

**Your token:** (Use the token you generated earlier with `npm token create`)

1. Go to: https://github.com/Radix-Obsidian/Sheplang-BobaScript/settings/secrets/actions
2. Click **"New repository secret"**
3. **Name:** `NPM_TOKEN`
4. **Value:** (Paste your NPM token here - starts with `npm_...`)
5. Click **"Add secret"**

### Step 2: Delete Old Tag

```bash
# Delete local tag
git tag -d v1.0.0-alpha

# Delete remote tag
git push --delete origin v1.0.0-alpha
```

### Step 3: Rebuild and Retag

```bash
# Make sure everything builds
cd sheplang
pnpm install
pnpm run build
pnpm run test

# Create new tag
cd ..
git tag -a v1.0.0-alpha -m "Alpha Release - NPM + GitHub Packages

- @radix-obsidian/sheplang-language
- @radix-obsidian/sheplang-to-boba
- sheplang (CLI)

128/128 tests passing, dual publishing configured."

# Push tag
git push --tags
```

### Step 4: Monitor Publishing

Watch the workflow:
https://github.com/Radix-Obsidian/Sheplang-BobaScript/actions

**Expected result:**
1. ✅ Test job passes (Ubuntu + Windows)
2. ✅ Publish to NPM succeeds
3. ✅ Publish to GitHub Packages succeeds

**Time:** ~5-10 minutes

---

## 📦 Where Packages Will Appear

### NPM Registry
- https://www.npmjs.com/package/sheplang
- https://www.npmjs.com/package/@radix-obsidian/sheplang-language
- https://www.npmjs.com/package/@radix-obsidian/sheplang-to-boba

**Installation:**
```bash
npm install -g sheplang
npm install @radix-obsidian/sheplang-language
npm install @radix-obsidian/sheplang-to-boba
```

### GitHub Packages
- https://github.com/orgs/Radix-Obsidian/packages?repo_name=Sheplang-BobaScript

**Installation:** (requires auth - see INSTALL_FROM_GITHUB.md)
```bash
# Configure registry
echo "@radix-obsidian:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Install
npm install @radix-obsidian/sheplang-language
```

---

## 🔍 Key Learnings

### GitHub Packages Scope Rules

**MUST MATCH:**
```
GitHub Org/User:  Radix-Obsidian
Package Scope:    @radix-obsidian/*
                  ↑ Must match exactly ↑
```

**Examples:**
- ✅ `@radix-obsidian/sheplang-language` (matches org)
- ❌ `@sheplang/language` (doesn't match)
- ❌ `@adapters/sheplang-to-boba` (doesn't match)

### NPM Requirements

**For public scoped packages:**
- Use `--access public` flag
- Or add to package.json: `"publishConfig": { "access": "public" }`
- Authenticate with valid `NPM_TOKEN`

### Workflow Order

**CRITICAL:** Add secrets BEFORE pushing tags!

1. ✅ Add `NPM_TOKEN` to GitHub Secrets
2. ✅ Verify package names match org scope
3. ✅ Push tag
4. ✅ Workflow runs and publishes

---

## ✅ Verification Checklist

After publishing, verify:

### NPM
```bash
npm view @radix-obsidian/sheplang-language
npm view @radix-obsidian/sheplang-to-boba
npm view sheplang
```

### GitHub
Visit: https://github.com/Radix-Obsidian/Sheplang-BobaScript

Should show: **"3 packages"** in right sidebar

### Test Installation
```bash
# From NPM (public - no auth needed)
npx sheplang@latest --version

# Should show: 1.0.0-alpha (or latest)
```

---

## 🎯 Updated Package Names

For documentation and communication:

**OLD (Don't use):**
- ~~`@sheplang/language`~~
- ~~`@adapters/sheplang-to-boba`~~

**NEW (Use these):**
- `@radix-obsidian/sheplang-language`
- `@radix-obsidian/sheplang-to-boba`
- `sheplang` (CLI unchanged)

---

## 📊 Publishing Status

| Platform | Status | URL |
|----------|--------|-----|
| **NPM** | ⏳ Pending setup | https://npmjs.com |
| **GitHub Packages** | ⏳ Pending publish | https://github.com/orgs/Radix-Obsidian/packages |
| **VSCode Marketplace** | 📋 Next phase | marketplace.visualstudio.com |

**After completing steps above:** All will be ✅

---

## 🐛 Troubleshooting

### "NPM_TOKEN not found"
**Fix:** Add secret in Step 1 above

### "403 Forbidden" on GitHub Packages
**Fix:** Verify package scope matches `@radix-obsidian`

### "Package already exists"
**Fix:** Bump version in package.json files

### Workflow still failing
**Check:** 
1. Secrets are added correctly
2. Package names use `@radix-obsidian` scope
3. All tests pass locally first

---

**Ready to publish!** Follow steps 1-4 above. 🚀
