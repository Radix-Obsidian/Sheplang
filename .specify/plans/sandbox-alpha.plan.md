# Technical Plan: ShepLang Sandbox Alpha (Playground)

**Spec:** [sandbox-alpha.spec.md](../specs/sandbox-alpha.spec.md)  
**Status:** Ready for Implementation  
**Target:** 10-14 Windsurf Credits  
**Location:** `/sheplang/playground/` (Vite-based)

---

## 🔒 Critical Constraints

### NEVER Touch These Folders:
```
/sheplang/packages/language/
/sheplang/packages/compiler/
/sheplang/packages/transpiler/
/sheplang/packages/runtime/
/adapters/sheplang-to-boba/
/sheplang/packages/cli/
```

### Must Pass After Implementation:
```bash
pnpm -w -r build
pnpm -w -r test
pnpm run verify
```

### Sandbox Lives In ONE Place:
```
/sheplang/playground/     # Existing Vite app (enhance this)
```

---

## 📦 Implementation Overview

### Architecture
- **Frontend:** Vite + TypeScript
- **Editor:** Monaco with ShepLang syntax
- **Preview:** Uses existing transpiler pipeline
- **AI:** Vercel AI SDK with OpenAI (backend endpoint)
- **Storage:** localStorage only (no backend)
- **Share:** URL encoding (no database)

### Key Components
1. **SandboxEditor** - Monaco editor wrapper
2. **SandboxPreview** - Shows transpiled output
3. **AIAssistant** - Chat interface with 3 modes
4. **Examples** - 5 hardcoded templates
5. **Storage** - localStorage project management
6. **Share** - LZ-string URL compression

---

## 🎯 10-Step Build Plan

### Step 1: Verify Playground Setup
```bash
cd sheplang/playground
# Check existing setup
pnpm list
# Verify it runs
pnpm dev
```

### Step 2: Install Dependencies
```bash
cd playground
pnpm add ai @ai-sdk/openai zod
pnpm add monaco-editor lz-string
# Workspace packages already included
```

### Step 3-10: Component Implementation
See detailed implementation in tasks file.

---

## 📊 Credit Budget

| Component | Credits | Status |
|-----------|---------|--------|
| Setup | 1.5 | ⏳ |
| Editor | 1.5 | ⏳ |
| Preview | 2.0 | ⏳ |
| Examples | 0.5 | ⏳ |
| Storage | 0.5 | ⏳ |
| Share | 0.5 | ⏳ |
| AI UI | 1.5 | ⏳ |
| AI Route | 2.0 | ⏳ |
| Main Page | 2.0 | ⏳ |
| QA | 1.0 | ⏳ |
| **Total** | **13.0** | ✅ |

---

## 🔑 Critical Files

### Must Create:
```
sandbox/
  app/
    page.tsx                    # Main sandbox page
    api/ai/sandbox/route.ts     # AI endpoint
  components/
    SandboxEditor.tsx          # Monaco wrapper
    SandboxPreview.tsx         # Preview + BobaScript
    AIAssistant.tsx            # AI chat panel
  lib/
    examples.ts                # 5 hardcoded examples
    storage.ts                 # localStorage helpers
    share.ts                   # URL encode/decode
```

### Must NOT Touch:
- Any file in `/sheplang/packages/`
- Any file in `/adapters/`
- The CLI package

---

## ✅ Success Criteria

1. **Editor works:** Can type ShepLang, see syntax highlighting
2. **Preview works:** Shows transpiled result or errors
3. **AI works:** All 3 modes return useful responses
4. **Examples work:** Can load any of 5 examples
5. **Storage works:** Can save/load projects locally
6. **Share works:** URL contains compressed state
7. **No backend:** Everything client-side except AI
8. **Builds pass:** `pnpm -w -r build` still green

---

## 🚀 Deployment

### Local Development:
```bash
cd sheplang/sandbox
pnpm dev
# http://localhost:3000
```

### Production Deploy:
```bash
vercel --prod
# Set OPENAI_API_KEY in Vercel dashboard
```

### Domain:
- Primary: `sandbox.sheplang.dev`
- Fallback: Auto-generated Vercel URL

---

## ⚠️ Common Pitfalls to Avoid

1. **DO NOT modify language packages** - Use them as-is
2. **DO NOT create a backend** - localStorage only
3. **DO NOT add auth** - Not for Alpha
4. **DO NOT over-engineer** - Keep it simple
5. **DO NOT skip validation** - Zod on AI route

---

## 📝 Notes for Windsurf

### When Building:
1. Start with `create-next-app` for clean setup
2. Add to `pnpm-workspace.yaml` immediately
3. Test transpiler integration early
4. Keep AI prompts ShepLang-specific
5. Use streaming for better UX
6. Validate everything with Zod
7. Test share links thoroughly

### System Prompts:
- **Explain:** Friendly, non-technical, use analogies
- **Generate:** ONLY return ShepLang in code blocks
- **Fix:** Patient teacher explaining the error

---

## 🎯 Final Deliverable

**A working sandbox where:**
> "A non-technical founder can write ShepLang, see it work, get AI help, and share their creation — all in < 10 minutes"

---

**Plan Status:** Ready  
**Next Step:** Execute tasks  
**Time Estimate:** 3-4 hours  
**Credit Estimate:** 13 credits
