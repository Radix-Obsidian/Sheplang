# ⚡ ShepKit Deploy Quick Start

**One-Page Reference for Deploying ShepKit to Vercel**

---

## 🚀 First-Time Setup (Do Once)

### 1. Vercel Dashboard Settings
```
Project → Settings → General → Root Directory = sheplang/shepkit
```

### 2. Environment Variables
```
Settings → Environment Variables → Add:
- OPENAI_API_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY (Production only)
```

### 3. Connect GitHub
```
Import Project → Select Repository → Deploy
```

---

## 📦 Deploy Commands

### Auto-Deploy (Push to GitHub)
```bash
git add .
git commit -m "your message"
git push origin main
```
**Vercel auto-deploys on every push to main.**

### Manual Deploy
```bash
# From repo root
vercel --prod
```

### Preview Deploy
```bash
vercel
```

---

## 🧪 Test Build Locally

```bash
# From repo root
cd sheplang/shepkit

# Clean install
pnpm install --frozen-lockfile

# Build workspace dependencies
pnpm -w -r build

# Build ShepKit
pnpm build

# Test production
pnpm start
# → http://localhost:3000
```

---

## 🔧 Files You Need

### ✅ Configured Files

| File | Status | Location |
|------|--------|----------|
| `vercel.json` | ✅ Ready | `sheplang/shepkit/vercel.json` |
| `.npmrc` | ✅ Ready | `.npmrc` (root) |
| `package.json` | ✅ Has engines | `sheplang/shepkit/package.json` |
| `tsconfig.json` | ✅ Has paths | `sheplang/shepkit/tsconfig.json` |
| `pnpm-workspace.yaml` | ✅ Defined | Root |

### ❌ Don't Create

- ❌ No `vercel.json` at repo root
- ❌ Don't modify `node_modules`
- ❌ Don't hardcode secrets

---

## 🐛 Quick Fixes

### Error: "No framework detected"
```
Fix: Set Root Directory to sheplang/shepkit in Vercel Dashboard
```

### Error: "Module not found: @sheplang/language"
```
Fix: Ensure buildCommand includes: pnpm -w -r build
```

### Error: "Build timeout"
```
Fix: Upgrade Vercel plan or optimize build
```

### Changes not deploying
```
Fix: Check deployment logs in Vercel Dashboard
Force redeploy: vercel --prod --force
```

---

## 📊 Build Timeline

```
1. Install deps         [~30s]
2. Build language       [~45s]
3. Build adapters       [~20s]
4. Build runtime        [~30s]
5. Build ShepKit        [~90s]
6. Deploy              [~15s]
────────────────────────────
Total: ~3-5 minutes
```

---

## ✅ Success Checklist

- [ ] Vercel Root Directory = `sheplang/shepkit`
- [ ] Environment variables added
- [ ] Build passes locally
- [ ] Git pushed to main
- [ ] Deployment shows "Ready"
- [ ] Live URL loads ShepKit IDE
- [ ] Monaco editor works
- [ ] No console errors

---

## 🆘 Get Help

- **Build Logs:** Vercel Dashboard → Deployments → View Logs
- **Support:** https://vercel.com/support
- **Full Guide:** See `Vercel_Deployment_Guide.md`

---

**Deploy with confidence! 🎉**
