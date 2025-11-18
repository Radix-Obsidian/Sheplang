# 📦 Installing ShepLang from GitHub Packages

ShepLang packages are published to **GitHub Packages**. Follow these steps to install.

---

## 🔐 Step 1: Authenticate with GitHub Packages

You need a GitHub Personal Access Token (PAT) to install packages.

### Create a Token:

1. Go to: https://github.com/settings/tokens/new
2. **Note:** "Install ShepLang packages"
3. **Expiration:** 90 days (or No expiration)
4. **Scopes:** Check `read:packages`
5. Click **"Generate token"**
6. Copy the token (starts with `ghp_...`)

### Configure npm:

```bash
# Add GitHub Packages authentication
echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN_HERE" >> ~/.npmrc

# Tell npm where to find @sheplang and @adapters packages
echo "@sheplang:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "@adapters:registry=https://npm.pkg.github.com" >> ~/.npmrc
```

**Replace `YOUR_TOKEN_HERE`** with your actual token!

---

## 📥 Step 2: Install ShepLang

### Global Installation (CLI)

```bash
npm install -g sheplang
```

### Project Installation

```bash
npm install @sheplang/language
npm install @adapters/sheplang-to-boba
```

---

## ✅ Step 3: Verify Installation

```bash
# Check CLI version
sheplang --version

# Should show: 0.1.3 (or latest)
```

---

## 🎯 Quick Start

```bash
# Create a new project
sheplang init my-app
cd my-app

# Run development server
sheplang dev

# Open http://localhost:3000
```

---

## 📦 Available Packages

All published to **GitHub Packages** (npm.pkg.github.com):

- **`sheplang`** - Main CLI tool
- **`@sheplang/language`** - Parser & grammar
- **`@adapters/sheplang-to-boba`** - Transpiler

---

## 🔍 Package URLs

View packages on GitHub:

- https://github.com/Radix-Obsidian/Sheplang-BobaScript/packages
- Click on any package to see versions and install instructions

---

## ⚠️ Troubleshooting

### "404 Not Found" Error

**Cause:** Missing authentication or wrong registry

**Fix:**
```bash
# Check your .npmrc
cat ~/.npmrc

# Should contain:
# //npm.pkg.github.com/:_authToken=ghp_...
# @sheplang:registry=https://npm.pkg.github.com
# @adapters:registry=https://npm.pkg.github.com
```

### "403 Forbidden" Error

**Cause:** Token doesn't have `read:packages` scope

**Fix:** Create a new token with correct scope (Step 1)

### "ENOTFOUND npm.pkg.github.com"

**Cause:** Network issue or incorrect registry URL

**Fix:** Check your internet connection and verify `.npmrc` syntax

---

## 🔐 Security Note

**Keep your token safe:**
- ✅ Store in `.npmrc` (not committed to git)
- ✅ Use environment variables in CI/CD
- ❌ Never commit tokens to repositories
- ❌ Never share tokens publicly

---

## 💡 For CI/CD (GitHub Actions)

GitHub Actions automatically have access:

```yaml
- name: Install ShepLang packages
  run: npm install @sheplang/language
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

No manual token needed!

---

## 📚 Documentation

- **Main README:** [README.md](./README.md)
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

**Questions?** Open an issue: https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues
