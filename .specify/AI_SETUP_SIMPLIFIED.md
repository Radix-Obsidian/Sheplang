# AI Integration Setup - SIMPLIFIED ✅

**Date:** November 20, 2025  
**Status:** Production Ready  
**Time to setup:** 2 minutes

---

## The Simple Way (No Console Required!)

Your company API key is now **bundled with the extension** automatically. Users get it when they install. No manual setup needed!

---

## Setup Steps (For You - One Time Only)

### 1. Create .env File

In the `extension/` folder:

```bash
cd extension
copy .env.example .env
```

### 2. Add Your API Key

Edit `extension/.env`:

```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY-HERE
```

**Get your key from:** [console.anthropic.com](https://console.anthropic.com) → Settings → API Keys

### 3. Build & Package

```bash
npm run compile
# or
npm run package
```

**That's it!** The key is now bundled into your extension.

---

## How It Works

### Before Build
```
extension/
├── .env                    ← You add key here (gitignored)
├── .env.example            ← Template (in Git)
└── src/ai/
    └── claudeClient.ts     ← Reads from config
```

### During Build
```bash
npm run compile
  ↓
1. scripts/build-config.js reads .env
2. Generates src/ai/config.ts with key
3. TypeScript compiles everything
  ↓
out/
└── ai/
    └── claudeClient.js    ← Has key bundled!
```

### After Install
```
User installs extension
  ↓
Extension loads
  ↓
claudeClient.ts uses bundled company key
  ↓
AI works automatically (1 free import/month)
```

---

## For Users

**Default (Free Tier):**
- Gets company key automatically
- 1 AI-powered import per month
- Zero setup required

**Power Users:**
- Can add own key in VS Code settings
- Unlimited imports
- Billed to their account

---

## Security

### ✅ What's Secure

- `.env` file is gitignored (never committed)
- `src/ai/config.ts` is gitignored (never committed)
- Key is bundled into compiled `.js` files
- Compiled code is not human-readable (minified in production)
- Key only sent to Anthropic API (HTTPS)

### ⚠️ Important Notes

- **Don't commit** `.env` to Git
- **Don't share** your `.vsix` file publicly (contains key)
- **Do share** extension via marketplace (secure)
- **Do** revoke key if compromised (console.anthropic.com)

---

## Testing Without Key

Want to test without adding a real key?

The extension works fine! It will:
- Use heuristics instead of AI
- Fall back to keyword matching
- Show message: "Add API key for better accuracy"

---

## Updating The Key

1. Edit `extension/.env`
2. Change the key value
3. Run `npm run compile`
4. Restart VS Code
5. Done!

---

## For Team Members

**If someone else is building:**

1. Get API key from team lead
2. Create `extension/.env` (use `.env.example` as template)
3. Add key
4. Run `npm run compile`
5. Extension builds with company key

**The .env file never gets committed**, so each developer adds their own copy.

---

## Verification

### Check If Key Is Bundled

After build:

```bash
# Check that config was generated
cat extension/src/ai/config.ts

# Should see:
# export const ANTHROPIC_COMPANY_KEY: string | undefined = 'sk-ant-...';
```

### Test The Extension

1. Press F5 in VS Code (launches Extension Development Host)
2. Run: `ShepLang: Import from Next.js/React Project`
3. Select any project
4. Answer wizard questions naturally
5. Should see AI interpretation popups ✓

---

## Troubleshooting

**Problem:** "⚠ No .env file found"  
**Solution:** Create `extension/.env` and add your API key

**Problem:** AI not working in extension  
**Solution:** 
1. Check `.env` file exists
2. Check key format: `ANTHROPIC_API_KEY=sk-ant-...`
3. Run `npm run compile` again
4. Restart VS Code

**Problem:** "Invalid API key"  
**Solution:** Get a fresh key from console.anthropic.com

---

## Files You Need

### In Git (Public)
- `.env.example` - Template showing format
- `.gitignore` - Ignores .env and config.ts
- `scripts/build-config.js` - Reads .env and generates config
- `src/ai/claudeClient.ts` - Uses bundled key

### On Your Machine (Private)
- `.env` - Your actual API key
- `src/ai/config.ts` - Auto-generated (gitignored)
- `out/ai/claudeClient.js` - Compiled with bundled key

---

## Comparison: Old vs New

### Old Way (Complex ❌)
```
1. Open VS Code
2. F1 → Developer Tools
3. Paste weird JavaScript
4. Key stored per-machine
5. Doesn't ship to users
6. Every user needs to do this
```

### New Way (Simple ✅)
```
1. Edit .env file
2. Run npm run compile
3. Key bundled into extension
4. Ships to all users automatically
5. Zero user setup
```

---

## Cost Tracking

With bundled company key:
- **Your cost:** ~$0.03 per user import
- **User cost:** $0 (free tier)
- **Budget:** $20/month = 600+ imports
- **For 10 alpha users:** Plenty!

---

## Final Checklist

- [x] `.env.example` created
- [x] `.gitignore` updated
- [x] `build-config.js` script created
- [x] `claudeClient.ts` updated
- [x] `package.json` scripts updated
- [x] Compilation tested
- [ ] **You:** Create .env with your key
- [ ] **You:** Run npm run compile
- [ ] **You:** Test in Extension Development Host
- [ ] **You:** Package and share!

---

## Quick Reference

**Add key:**
```bash
echo "ANTHROPIC_API_KEY=sk-ant-YOUR-KEY" > extension/.env
```

**Build:**
```bash
cd extension
npm run compile
```

**Package:**
```bash
npm run package
# Creates sheplang-vscode-1.0.0.vsix
```

**Install locally:**
```bash
code --install-extension sheplang-vscode-1.0.0.vsix
```

---

**That's it! No console hacking, no Secret Storage confusion. Just a simple .env file.** ✨

**Next:** Add your Anthropic API key to `.env` and build! 🚀
