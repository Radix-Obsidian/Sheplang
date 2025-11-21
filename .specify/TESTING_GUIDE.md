# ShepLang Importer Testing Guide

**Date:** November 20, 2025  
**Status:** Ready for testing  
**Import Limit:** 5 per month (alpha)

---

## 🔧 Fixes Applied

### 1. Double Cancel Button ✅
- **Issue:** Modal had "Cancel" button + implicit close = 2 cancel buttons
- **Fix:** Removed `modal: true` flag
- **Result:** Clean 2-button UI (Share Feedback / Add My Own API Key)

### 2. Import Limit Increased ✅
- **Was:** 1 import/month
- **Now:** 5 imports/month (alpha testing)
- **Cost:** Still well within $20/month budget (~$0.15/month for 5 imports)

### 3. API Key Management ✅
Added three new commands:
- `ShepLang: Show AI Import Usage` - View your usage stats
- `ShepLang: Reset AI Usage (Testing)` - Reset counter for testing
- `ShepLang: Update Anthropic API Key` - Change/add your API key

### 4. Debug Bypass ✅
- **Setting:** `sheplang.debugBypassLimits`
- **Purpose:** Test AI without hitting limits
- **Usage:** Enable in Settings → Search "bypass"

### 5. Settings Organization ✅
All ShepLang settings now properly organized:
- Auto Preview
- Trace Server
- Figma Access Token
- Anthropic API Key
- Debug Bypass Limits

---

## 🧪 How to Test Right Now

### Option 1: Reset Usage Counter (Fastest)

1. **Open Command Palette** (Ctrl+Shift+P)
2. **Run:** `ShepLang: Reset AI Usage (Testing)`
3. **Confirmation:** "✓ Usage counter reset. You can now test imports again."
4. **Test:** Run import command immediately

### Option 2: Enable Debug Bypass

1. **Open Settings** (Ctrl+,)
2. **Search:** `sheplang.debugBypassLimits`
3. **Check the box** to enable
4. **Reload Window** (Ctrl+Shift+P → "Reload Window")
5. **Test:** Unlimited imports while enabled

### Option 3: Add Your Own API Key

1. **Run Command:** `ShepLang: Update Anthropic API Key`
2. **Enter:** Your `sk-ant-...` key
3. **Result:** Unlimited imports permanently

---

## 📊 Check Your Usage

**Command:** `ShepLang: Show AI Import Usage`

Shows:
```
AI Import Usage:

This month (since Nov 1):
- Used: 1
- Remaining: 4

Resets on the 1st of each month.
```

---

## 🎯 Platforms to Test With

### ✅ Free Code Export (Test These!)

| Platform | Code Export | Free Tier | Best For | ShepLang Support |
|----------|-------------|-----------|----------|------------------|
| **Figma** | ✅ Manual | ✅ Free | UI designs | ✅ Planned |
| **v0 (Vercel)** | ✅ Copy code | ✅ Free | React components | ✅ Works as React |
| **Bolt.new** | ✅ Download zip | ✅ Free | Full-stack apps | ✅ Works as Next.js |
| **Replit** | ✅ Clone repo | ✅ Free | Web apps | ✅ Works as React |
| **Lovable** | ✅ Download | ✅ Limited free | MVPs | ✅ Works as Next.js |
| **Cursor (local)** | ✅ Native | ✅ Free | Any project | ✅ Works |

### ❌ Paid Export Required (Skip for Now)

| Platform | Code Export | Free Tier | Why Skip |
|----------|-------------|-----------|----------|
| **Webflow** | ❌ Paid only | ✅ Free (no export) | Need paid plan to export |
| **Bubble.io** | ❌ No export | ✅ Free | Cannot export code |
| **Framer** | ❌ Paid only | ✅ Free (no export) | Need paid plan |

---

## 🎬 Recommended Test Projects

### 1. **Figma Community Files** (Free, Immediate)

**Where:** https://www.figma.com/community/

**Good examples:**
- "Minimalist Dashboard" - Simple UI
- "Todo App UI" - Data-driven
- "Landing Page" - Static content
- "Mobile App Design" - Multi-screen

**How to import:**
1. Open Figma file
2. File → Export → Dev Mode → Copy CSS/HTML
3. Save as React component locally
4. Run ShepLang import on that folder

### 2. **v0.dev Generations** (AI + Code)

**Where:** https://v0.dev/

**Process:**
1. Describe app: "Create a todo list app"
2. v0 generates React code
3. Click "Copy Code"
4. Save locally as Next.js project
5. Run ShepLang import

**Advantage:** Already has clean React structure

### 3. **Bolt.new Projects** (Full Stack)

**Where:** https://bolt.new/

**Process:**
1. Describe app: "Build a task manager"
2. Bolt generates full stack
3. Click "Download Project"
4. Extract zip
5. Run ShepLang import

**Advantage:** Includes API routes and backend logic

### 4. **Replit Templates** (Instant)

**Where:** https://replit.com/templates

**Process:**
1. Search: "Next.js" or "React"
2. Fork a template (free)
3. File → Download as Zip
4. Extract locally
5. Run ShepLang import

**Advantage:** Known working codebases

### 5. **Your Own Projects** (Real Test)

**Best options:**
- Next.js apps
- Create React App projects
- Vite + React apps
- Any React TypeScript project

---

## 🔍 What to Look For During Testing

### AI Interpretation Quality

**Good AI response:**
```
✓ Understood: This is a UI component without data management
```

**Generated code should have:**
- No bogus entities from misinterpreted sentences
- Clean action names (not "HandleClick")
- Proper TODOs where needed
- Correct view structure

### Bad AI Response (Bug)

If you see:
- Generic "✓ Got it!" without details
- Entities created from explanatory sentences
- No AI feedback popup at all
- Axios errors in console

**Report these!** This means AI didn't run properly.

---

## 🐛 Known Issues (Fixed)

### ~~1. Double Cancel Button~~ ✅ FIXED
- Was: Two cancel buttons in limit message
- Now: Clean 2-button UI

### ~~2. Only 1 Import Limit~~ ✅ FIXED
- Was: 1 import/month too restrictive for testing
- Now: 5 imports/month

### ~~3. No Way to Reset Usage~~ ✅ FIXED
- Was: Had to wait until month reset
- Now: Command to reset instantly

### ~~4. Debug Bypass Not Working~~ ✅ FIXED
- Was: Setting existed but wasn't checked properly
- Now: Works correctly (check code in usageTracker.ts)

### ~~5. No API Key Update Command~~ ✅ FIXED
- Was: Had to manually edit settings.json
- Now: Command palette command with password input

---

## 📝 Testing Checklist

Before reporting a bug, verify:

- [ ] You ran `npm run compile` after latest changes
- [ ] You reloaded VS Code window (Ctrl+Shift+P → Reload Window)
- [ ] You checked AI usage (should show 5 remaining if reset)
- [ ] The .env file has your actual API key
- [ ] You selected a valid React/Next.js project folder
- [ ] The project has a package.json file

---

## 🚨 Report These Issues

### Critical Bugs:
1. **No AI feedback popup** - AI didn't run
2. **Axios errors in console** - API call failed
3. **Limit not resetting** - Counter stuck
4. **Import crashes** - Extension error

### Console Logs to Share:
- Open: View → Output → Select "ShepLang"
- Copy any errors
- Share in GitHub issue

### Information to Include:
1. Which platform you imported from (v0, Bolt, Figma, etc.)
2. Project structure (Next.js, CRA, Vite, etc.)
3. What AI feedback you saw (or didn't see)
4. Generated .shep file (if any)
5. Console errors (if any)

---

## 💡 Pro Tips

### Fastest Test Cycle:
1. Enable debug bypass (one-time)
2. Test with v0.dev (instant code generation)
3. Import same project repeatedly with different answers
4. Compare AI interpretation accuracy

### Best Real-World Test:
1. Use your actual Figma sidebar project
2. Answer naturally: "It's just a sidebar"
3. Verify no bogus entities created
4. Check action names are meaningful

### Budget-Friendly:
- 5 imports/month uses ~$0.15 of your $20 budget
- You can test 5 different platforms per month
- Or test same platform 5 times to verify consistency

---

## 🎯 Success Criteria

**AI Integration Works If:**
1. ✅ You see specific AI feedback popup ("Understood: ...")
2. ✅ Generated code has no bogus entities
3. ✅ Action names are meaningful (not generic HandleClick)
4. ✅ No Axios errors in console
5. ✅ Usage counter increments correctly

**Limit System Works If:**
1. ✅ Counter shows 5 remaining after reset
2. ✅ Blocks import after 5 uses
3. ✅ Shows friendly message with feedback options
4. ✅ Reset command works instantly
5. ✅ Debug bypass allows unlimited when enabled

---

## 📞 Quick Commands Reference

```
Ctrl+Shift+P:
  - ShepLang: Import from Next.js/React Project
  - ShepLang: Show AI Import Usage
  - ShepLang: Reset AI Usage (Testing)
  - ShepLang: Update Anthropic API Key
  - Reload Window

Settings (Ctrl+,):
  - sheplang.debugBypassLimits
  - sheplang.anthropicApiKey
  - sheplang.autoPreview
```

---

## 🚀 Start Testing Now!

1. **Reset usage:** Run "Reset AI Usage" command
2. **Pick a platform:** Try v0.dev (fastest)
3. **Generate code:** Describe a simple app
4. **Import:** Run ShepLang import command
5. **Verify:** Check AI feedback and generated code

---

**Last Updated:** November 20, 2025  
**Next Review:** After 10 test imports across platforms

Happy testing! 🐑✨
