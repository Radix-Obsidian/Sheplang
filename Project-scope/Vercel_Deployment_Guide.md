# 🚀 ShepKit Vercel Deployment Guide

**Production-Ready Deployment Configuration for ShepKit IDE**

This guide ensures ShepKit deploys perfectly to Vercel while ignoring the rest of the monorepo (language, CLI, adapters, runtime, transpiler).

---

## 📋 Prerequisites

- [x] Vercel account (free tier works)
- [x] GitHub repository connected to Vercel
- [x] Node.js 20.x locally (for testing)
- [x] pnpm 9.x installed

---

## 1️⃣ **Vercel Dashboard Configuration** (CRITICAL)

### Set Root Directory

> **This is mandatory. If you skip this, Vercel will fail to deploy.**

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **General**
2. Find **"Root Directory"**
3. Set it to: `sheplang/shepkit`
4. Click **Save**

**Why this matters:**
- Tells Vercel to deploy only the ShepKit Next.js app
- Ignores the language packages, CLI, and other monorepo components
- Prevents "No framework detected" errors

---

## 2️⃣ **vercel.json Configuration** ✅

Located at: `sheplang/shepkit/vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "pnpm install --frozen-lockfile && pnpm -w -r build && pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install --frozen-lockfile",
  "env": {
    "NEXT_PUBLIC_SHEPKIT_ENV": "production"
  }
}
```

**How this works:**

| Property | Purpose |
|----------|---------|
| `$schema` | Enables autocomplete & validation in VS Code |
| `framework: "nextjs"` | Tells Vercel this is a Next.js project |
| `buildCommand` | Builds workspace deps first, then ShepKit |
| `outputDirectory: ".next"` | Standard Next.js output location |
| `installCommand` | Deterministic dependency installation |
| `env` | Production environment variable |

**Build Pipeline:**
1. `pnpm install --frozen-lockfile` → Install all workspace dependencies
2. `pnpm -w -r build` → Build language packages, runtime, adapters, etc.
3. `pnpm build` → Build ShepKit Next.js app

---

## 3️⃣ **Package Configuration** ✅

### ShepKit package.json

Location: `sheplang/shepkit/package.json`

**Required `engines` field:**
```json
{
  "engines": {
    "node": "20.x",
    "pnpm": ">=9.0.0"
  }
}
```

This ensures Vercel uses the correct Node.js version and prevents build errors.

### Root package.json

Location: `Sheplang/package.json`

**Workspace structure** (defined in `pnpm-workspace.yaml`):
```yaml
packages:
  - sheplang/packages/*
  - adapters/*
  - sheplang/shepkit
  - sheplang/examples
  - sheplang/playground
```

This tells Vercel's pnpm installer how to resolve workspace packages like:
- `@sheplang/language`
- `@adapters/sheplang-to-boba`

---

## 4️⃣ **.npmrc Configuration** ✅

Location: `.npmrc` (repo root)

```
strict-peer-dependencies=false
auto-install-peers=true
```

**Purpose:** Solves 90% of workspace dependency conflicts on Vercel.

---

## 5️⃣ **TypeScript Path Resolution** ✅

Location: `sheplang/shepkit/tsconfig.json`

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@sheplang/language": ["../packages/language/src"],
      "@adapters/sheplang-to-boba": ["../../adapters/sheplang-to-boba/src"]
    }
  }
}
```

**Why this is needed:**
- Vercel cannot follow pnpm symlinks without explicit path mappings
- Maps workspace packages to their source directories
- Prevents "Module not found" errors during build

---

## 6️⃣ **Environment Variables**

### Add in Vercel Dashboard

**Settings** → **Environment Variables** → **Add New**

| Variable | Value | Scope |
|----------|-------|-------|
| `OPENAI_API_KEY` | `sk-...` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://...supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJh...` | Production, Preview |
| `SUPABASE_SERVICE_KEY` | `eyJh...` | Production only |
| `VERCEL_TOKEN` | (optional for deploy features) | Production only |
| `NEXT_PUBLIC_SHEPKIT_ENV` | `production` | Production |

**Security Notes:**
- ✅ Use `NEXT_PUBLIC_*` for client-side variables
- ❌ Never use `NEXT_PUBLIC_*` for API keys or secrets
- 🔒 Service keys should only be in Production scope

---

## 7️⃣ **Next.js Configuration**

Location: `sheplang/shepkit/next.config.cjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@sheplang/language', '@adapters/sheplang-to-boba'],
  output: 'standalone', // For Docker deployment
  experimental: {
    serverComponentsExternalPackages: ['@sheplang/language', '@adapters/sheplang-to-boba']
  }
};
```

**Key settings:**
- `transpilePackages`: Bundles workspace dependencies
- `output: 'standalone'`: Optimizes for containerized deployment
- `serverComponentsExternalPackages`: Prevents bundling server-only packages

---

## 8️⃣ **Build Verification (Local)**

Test the build locally before deploying:

```bash
# From repo root
cd sheplang/shepkit

# Install dependencies
pnpm install --frozen-lockfile

# Build workspace dependencies
pnpm -w -r build

# Build ShepKit
pnpm build

# Start production server
pnpm start
```

Visit `http://localhost:3000` to verify.

---

## 9️⃣ **Deployment Methods**

### Method 1: Automatic (Recommended)

Push to GitHub:
```bash
git add .
git commit -m "feat: Configure Vercel deployment"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Run the build pipeline
3. Deploy to production

### Method 2: Manual CLI

From repo root:
```bash
vercel --prod
```

### Method 3: Preview Deployments

```bash
# Deploy preview
vercel

# Deploy to specific branch
git checkout feature/new-feature
git push
# Vercel auto-deploys preview
```

---

## 🔟 **Guaranteed-Green Build Pipeline**

When Vercel builds, you'll see:

```
Installing dependencies...
✓ pnpm install --frozen-lockfile

Building workspace root...
✓ Building @sheplang/language...
✓ Building @adapters/sheplang-to-boba...
✓ Building @sheplang/runtime...
✓ Building @sheplang/transpiler...
✓ Building @sheplang/compiler...

Building ShepKit...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build

Done! Production build completed.
```

---

## 🐛 **Troubleshooting**

### Error: "No Next.js version detected"

**Solution:** Verify root directory is set to `sheplang/shepkit` in Vercel dashboard.

### Error: "Module not found: '@sheplang/language'"

**Solutions:**
1. Check `tsconfig.json` has proper paths
2. Verify `pnpm-workspace.yaml` includes workspace packages
3. Ensure `.npmrc` exists at repo root
4. Check `buildCommand` builds workspace packages first

### Error: "Invalid nodeVersion"

**Solution:** Add `engines.node: "20.x"` to `sheplang/shepkit/package.json`

### Build timeout

**Solutions:**
1. Upgrade Vercel plan (Free tier: 10min, Pro: 45min)
2. Optimize build command
3. Cache workspace builds

### Environment variables not working

**Solutions:**
1. Check variable names match exactly (case-sensitive)
2. Verify scope (Production vs Preview)
3. Redeploy after adding variables

---

## 📊 **Build Performance**

**Expected build times:**

| Environment | First Build | Cached Build |
|-------------|-------------|--------------|
| Local | 2-3 min | 30-60 sec |
| Vercel Free | 5-7 min | 1-2 min |
| Vercel Pro | 3-5 min | 30-60 sec |

**Cache optimization:**
- Vercel caches `node_modules` and `.next` between builds
- Workspace packages are rebuilt only when changed
- Use `--frozen-lockfile` to prevent dependency changes

---

## 🎯 **Best Practices**

### DO ✅
- Set Root Directory in Vercel Dashboard
- Use `--frozen-lockfile` for deterministic builds
- Test builds locally before deploying
- Use environment variables for secrets
- Keep `vercel.json` in ShepKit directory only
- Use pnpm 9.x for consistency

### DON'T ❌
- Put `vercel.json` in repo root
- Hardcode API keys in code
- Skip the workspace build step
- Use different Node versions locally vs Vercel
- Modify `node_modules` manually

---

## 📚 **Official Resources**

- [Vercel Monorepos](https://vercel.com/docs/monorepos)
- [Vercel Project Configuration](https://vercel.com/docs/concepts/projects/project-configuration)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [pnpm Workspaces](https://pnpm.io/workspaces)

---

## ✅ **Deployment Checklist**

- [ ] Root Directory set to `sheplang/shepkit` in Vercel
- [ ] `vercel.json` exists in `sheplang/shepkit/`
- [ ] No `vercel.json` in repo root
- [ ] `engines.node: "20.x"` in ShepKit package.json
- [ ] `.npmrc` exists at repo root
- [ ] TypeScript paths configured in `tsconfig.json`
- [ ] Environment variables added in Vercel Dashboard
- [ ] Local build test passed
- [ ] Git repository connected to Vercel
- [ ] First deployment successful

---

## 🎉 **Success Indicators**

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ No "Module not found" errors
- ✅ ShepKit IDE loads at your Vercel URL
- ✅ Monaco editor renders correctly
- ✅ AI features work (with proper env vars)
- ✅ Deploy button works (with Vercel token)

---

**Last Updated:** 2025-01-13
**Maintained By:** ShepLang Team
**Vercel Support:** https://vercel.com/support
