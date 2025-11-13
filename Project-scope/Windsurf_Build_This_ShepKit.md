# 🚀 WINDSURF — BUILD THIS EXACTLY  
## ShepKit Alpha (Founder OS)

You are the Build Engineer AI for Golden Sheep AI.  
Follow every instruction below verbatim.

Your job:  
**Build ShepKit Alpha exactly as defined in the PRD, Architecture, Roadmap, and UI Specs in /Project-scope/.**

You MUST:
- stay in scope  
- not invent features  
- not change architecture  
- not rewrite ShepLang  
- not modify BobaScript semantics  
- build ShepKit exactly as documented

---

# 📁 Project Context (MANDATORY)

Repository root:
```
/sheplang/
  /Project-scope/
    PRD_ShepKit.md
    Architecture_ShepKit.md
    Roadmap_ShepKit_Alpha.md
    UI_ShepKit_Day1.md
```

You MUST read these files during every decision.  
They override any "best practices" or assumptions you have.

---

# 🧠 CORE PRODUCT TO BUILD

**ShepKit = A browser-based, AI-assisted IDE for non-technical founders.**

It contains four parts:

1. **Monaco Editor** (.shep files)
2. **Project Explorer** (create/rename/delete/import/export)
3. **Live Preview Engine** (ShepLang → BobaScript → UI)
4. **AI Panel** (Explain, Generate, Debug)

Plus:

5. **One-Click Deploy** (Vercel API → live URL)

---

# 🛠️ REQUIRED TECH STACK

You must use:

- **Next.js 14 App Router**
- **TypeScript**
- **TailwindCSS**
- **Monaco Editor**
- **Zustand** (state)
- **@sheplang/language** (parseShep)
- **@adapters/sheplang-to-boba** (transpileShepToBoba)
- **Vercel deployment API**
- **OpenAI API for AI panel**

Do NOT use:
- Redux
- MUI
- tRPC
- Prisma
- Drizzle
- Express
- Node server outside Next.js API routes
- Any database in Alpha

---

# 📦 File + Folder Specification  
(Non-negotiable)

Create:
```
/sheplang/shepkit/
  app/
    layout.tsx
    page.tsx
    api/
      ai/
        explain/route.ts
        generate/route.ts
        debug/route.ts
      deploy/route.ts
  components/
    FileExplorer.tsx
    MonacoEditor.tsx
    LivePreview.tsx
    AIPanel.tsx
  lib/
    ai.ts
    examples.ts
    transpile.ts
    state.ts
  public/
  package.json
  tailwind.config.js
  tsconfig.json
```

---

# 🔥 BUILD ORDER (FOLLOW EXACTLY)

## **PHASE 0 — Setup**
1. Create `/sheplang/shepkit/` 
2. Init new Next.js app inside it
3. Add Tailwind
4. Add Zustand
5. Add Monaco
6. Add `.env.local.example` 

**Stop here and verify directory.**

---

## **PHASE 1 — Editor + State**
1. Add Zustand project store
2. Add Monaco Editor
3. Add File Explorer
4. Enable create/rename/delete files
5. Add localStorage persistence

**Stop here and verify editor works.**

---

## **PHASE 2 — ShepLang Integration**
1. Import `parseShep()` from @sheplang/language
2. Import `transpileShepToBoba()` from @adapters/sheplang-to-boba
3. Build transpile pipeline in `lib/transpile.ts` 
4. Display:
   - Boba code
   - canonical AST
   - diagnostics

**Stop here and verify preview data updates.**

---

## **PHASE 3 — Live Preview Engine**
1. Create iframe sandbox
2. Inject BobaScript output
3. Render components
4. Handle actions/state
5. Add error console

**Stop here and verify real UI preview.**

---

## **PHASE 4 — AI Panel**
Implement 3 API routes:
- `/api/ai/explain` 
- `/api/ai/generate` 
- `/api/ai/debug` 

AI Panel must:
- send prompt
- display response
- optionally insert into editor

**Stop here and test AI.**

---

## **PHASE 5 — Deployment Engine**
1. Build `generateNextApp()` -> Next.js output
2. `/api/deploy` route  
3. Upload to Vercel deploy endpoint  
4. Return live URL  
5. Show "Your app is live!" modal

**Stop here and test deploy.**

---

## **PHASE 6 — Polish**
- Add examples sidebar  
- Add onboarding modal  
- Add keyboard shortcuts  
- Fix layout  
- Optimize preview reload time  
- Improve error messages  

**Then mark Alpha COMPLETE.**

---

# 🧱 DEVELOPMENT RULES (DO NOT BREAK)

### 🚫 1. No scope creep  
Everything MUST match PRD_ShepKit.md.  
If a feature is not in PRD, Roadmap, or UI file → **ignore it.**

### 🤖 2. Prefer small, incremental commits  
Each commit must do one logical change.

### 📐 3. Maintain clarity for non-technical users  
UI must be simple and human-friendly.

### 🧩 4. ALWAYS test parseShep + transpileShepToBoba after any changes

### ⚙️ 5. Never touch ShepLang syntax or the BobaScript runtime  
You can only call them, not modify them.

### 🧪 6. Live Preview should NEVER eval user JS  
Always sandbox BobaScript output.

### 🚀 7. Deployment must return a live URL  
No placeholders.

---

# 🏁 SUCCESS CRITERIA

ShepKit Alpha is complete when:

1. User creates two `.shep` files  
2. Editor shows syntax + errors  
3. Live Preview renders UI  
4. AI Panel can explain + generate code  
5. Deploy button deploys a real app  
6. Landing page demo matches MVP flow  
7. No workspace, no monorepo complexity  
8. Entire system works on Windows

**When all eight are true → Alpha is complete.**

---

# 🟢 "BEGIN BUILD" CONDITION

After reading all 4 spec documents in `/Project-scope/`:

**Start by generating the folder structure and skeleton files.  
Do NOT write full implementations until structure is approved.**

---

{BEGIN}
