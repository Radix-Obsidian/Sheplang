# 🚀 Deploy ShepKit to Vercel

**Quick deployment guide for ShepKit IDE on Vercel**

---

## ⚡ TL;DR (For Experienced Users)

```bash
# 1. Set Root Directory in Vercel Dashboard
Root Directory = sheplang/shepkit

# 2. Add environment variables in Vercel
OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, etc.

# 3. Deploy
git push origin main
```

Done! Vercel auto-deploys.

---

## 📚 Complete Guides

### For First-Time Deployment
→ **Read:** `Project-scope/Vercel_Deployment_Guide.md`
- Detailed step-by-step instructions
- Environment variable configuration
- Troubleshooting common issues
- Build pipeline explanation

### Quick Reference
→ **Read:** `Project-scope/Deploy_Quick_Start.md`
- One-page command reference
- Quick fixes for common errors
- Build timeline
- Success checklist

---

## ✅ Pre-Deployment Checklist

Before you deploy, verify:

- [ ] **Vercel Dashboard:** Root Directory = `sheplang/shepkit`
- [ ] **Environment Variables:** Added in Vercel Dashboard
- [ ] **Local Build:** Test with `pnpm build` from `sheplang/shepkit`
- [ ] **No Root vercel.json:** Ensure no `vercel.json` at repo root
- [ ] **Git Connected:** Repository linked to Vercel

---

## 🔧 Key Files (Already Configured)

| File | Location | Status |
|------|----------|--------|
| `vercel.json` | `sheplang/shepkit/vercel.json` | ✅ Ready |
| `.npmrc` | `.npmrc` (root) | ✅ Ready |
| `package.json` | `sheplang/shepkit/package.json` | ✅ Has engines |
| `tsconfig.json` | `sheplang/shepkit/tsconfig.json` | ✅ Has paths |
| GitHub Actions | `.github/workflows/vercel-deploy.yml` | ✅ Automated |

---

## 🎯 Deploy Now

### Option 1: Auto-Deploy (Recommended)

```bash
git add .
git commit -m "feat: Ready for deployment"
git push origin main
```

Vercel will automatically build and deploy.

### Option 2: Manual Deploy

```bash
vercel --prod
```

### Option 3: Preview Deploy

```bash
vercel
```

---

## 📊 Expected Build Time

- **First build:** 5-7 minutes
- **Cached builds:** 1-2 minutes

---

## 🆘 Need Help?

1. **Build fails?** → Check deployment logs in Vercel Dashboard
2. **Module not found?** → See `Vercel_Deployment_Guide.md` troubleshooting section
3. **Environment variables?** → Verify they're added in Vercel Dashboard

---

## 🎉 Success!

Your ShepKit IDE is live when you see:
- ✅ Deployment status shows "Ready"
- ✅ Monaco editor loads
- ✅ No console errors
- ✅ AI features work (with env vars)

---

**Deploy with confidence! 🚀**

For detailed information, see:
- `Project-scope/Vercel_Deployment_Guide.md` - Full guide
- `Project-scope/Deploy_Quick_Start.md` - Quick reference
- `DOCKER.md` - Container deployment

**Last Updated:** 2025-01-13
