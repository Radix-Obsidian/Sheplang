# ShepLang Strategic Plan V2
## "The Verification Layer for AI-Generated Code"

**Date:** November 26, 2025  
**Status:** Canonical - All ADE agents follow this  
**Version:** 2.0

---

## 🎯 Executive Summary

ShepLang is **not** an AI app builder competing with Lovable, v0, or Bolt.new on generation speed.

ShepLang is **the verification layer between AI and production** — the tool that proves AI-generated code is correct before it ships.

---

## 🏢 Startup Identity

### Mission
> **Enable anyone to ship verified software.**

### Vision
> A world where the quality of software isn't limited by who can write code — because AI writes it and ShepLang proves it's correct.

### One-Liner
> ShepLang lets non-technical founders ship AI-generated apps with the confidence of a senior engineering team.

### Category
> **Full-Stack AI Code Verification Platform**

---

## 🎪 The Product: Three Pillars

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SHEPLANG PRODUCT                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    PILLAR 1               PILLAR 2                PILLAR 3                 │
│    ─────────              ─────────               ─────────                │
│    LANGUAGE               VERIFICATION            DASHBOARD                │
│                                                                             │
│    ShepLang Grammar       ShepVerify Engine       ShepVerify UX            │
│    ShepThon Backend       4-Phase Analysis        VS Code Panel            │
│    Import Pipeline        Error Detection         Score Display            │
│    Transpiler             Fix Suggestions         AI Auto-Fix              │
│                                                                             │
│    "AI writes to         "We prove it's          "Founders SEE            │
│     this grammar"         correct"                the verification"        │
│                                                                             │
│    ──────────────────────────────────────────────────────────────────────  │
│                                                                             │
│    INVISIBLE TO USER      INVISIBLE TO USER       VISIBLE TO USER          │
│    (Infrastructure)       (Engine)                (Product Surface)         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Insight:** The Dashboard (Pillar 3) is what users interact with. It makes verification tangible.

---

## 🖥️ The ShepVerify Dashboard

### Purpose
The ShepVerify Dashboard is the **primary UX** for interacting with full-stack verification.
It transforms the VS Code extension from a "helper tool" into a **real-time verification cockpit**.

### Why This Matters

| Without Dashboard | With Dashboard |
|-------------------|----------------|
| "Extension says no errors" | "I see 78% verification score" |
| "I guess it works?" | "I see exactly what passed and failed" |
| "What does 'type safe' mean?" | "These 2 fields have type issues" |
| "How do I fix this?" | "[Fix with AI] button right there" |
| "Is it safe to ship?" | "Green checkmark = ship with confidence" |

### Dashboard Anatomy

```
──────────────────────────────────────────
              SHEPVERIFY
──────────────────────────────────────────

● SUMMARY
   Status: ⚠ Issues Detected
   Last Run: 2 minutes ago
   [ Re-run Verification ]

● VERIFICATION SCORE
   Overall: 78%  (● Yellow)
   ├── Frontend: 90%
   ├── Backend: 78%
   ├── Schema: 70%
   └── Flow: 95%

▼ PHASES
   ▼ Type Safety  (2 errors)
       ✖ Missing type guard for "email"
          src/app/register.shep:12
          [Fix with AI]  [Open File]

       ✖ Field "text" used as number
          src/actions/addTodo.shep:4
          [Fix with AI]  [Explain]

   ▼ Null Safety  (1 warning)
       ⚠ Potential null access: "user"
          src/components/Profile.shep:33
          [Explain]

   ▼ API Contracts  (1 critical)
       ✖ POST /todos missing backend route
          Linked UI Action: AddTodo
          [Fix with AI]  [Open File]

   ▼ Exhaustiveness  (Passed)
       ✔ All flows covered

▼ HISTORY
   ✔ 1:22 PM – Passed
   ✖ 12:47 PM – 3 Issues
   ✔ 12:10 PM – Passed
──────────────────────────────────────────
```

### Dashboard Features

1. **Verification Summary**
   - Project status badge (green/yellow/red)
   - Time of last run
   - Quick "Re-run verify" button

2. **Verification Score** (Lighthouse-style)
   - Overall score (0-100)
   - Frontend score
   - Backend score
   - Schema score
   - Flow integrity score

3. **Phase-by-Phase Breakdown**
   - Phase 1: Type Safety
   - Phase 2: Null Safety
   - Phase 3: API Contracts (ShepThon)
   - Phase 4: Exhaustiveness
   - Each phase shows: Errors, Warnings, Passed checks

4. **AI Auto-Fix Panel**
   - [Fix with AI] button per error
   - [Explain] for understanding
   - [Open File] for navigation

5. **Verification History**
   - List of runs with pass/fail status
   - Error/warning counts
   - Timestamp

---

## 🔧 Technical Architecture

### Focus Pyramid

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SHEPLANG FOCUS PYRAMID                               │
│                                                                             │
│                              ┌─────┐                                        │
│                              │ 10% │  EXECUTION                             │
│                              │     │  (Partner/Integrate)                   │
│                              │     │  • StackBlitz for preview              │
│                              │     │  • Vercel/Netlify for deploy           │
│                         ┌────┴─────┴────┐                                   │
│                         │      20%      │  GENERATION                       │
│                         │               │  (AI Integration)                 │
│                         │               │  • Streaming responses            │
│                         │               │  • Template library               │
│                    ┌────┴───────────────┴────┐                              │
│                    │           30%           │  LANGUAGE                    │
│                    │                         │  (Grammar + Transpiler)      │
│                    │                         │  • Expand grammar            │
│                    │                         │  • Import pipeline           │
│               ┌────┴─────────────────────────┴────┐                         │
│               │               40%                 │  VERIFICATION           │
│               │                                   │  + DASHBOARD            │
│               │                                   │  (The Moat + The UX)    │
│               │                                   │  • 4-phase verify       │
│               │                                   │  • Dashboard UI         │
│               │                                   │  • AI auto-fix          │
│               └───────────────────────────────────┘                         │
│                                                                             │
│                    THIS IS WHERE WE WIN                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dashboard Module Structure

```
extension/src/
  dashboard/
    index.ts                    # Dashboard entry point
    treeViewProvider.ts         # VS Code Tree View API
    dataAdaptor.ts              # VerificationReport → TreeItems
    renderers/
      summaryRenderer.ts        # Status banner
      scoreRenderer.ts          # Lighthouse-style scores
      phaseRenderer.ts          # Phase breakdown
      historyRenderer.ts        # Verification history
      fixRenderer.ts            # AI fix panel
```

### Data Model

```typescript
interface VerificationReport {
  status: 'passed' | 'failed' | 'warning';
  score: number;  // 0-100
  scores: {
    frontend: number;
    backend: number;
    schema: number;
    flow: number;
  };
  phases: {
    typeSafety: PhaseResult;
    nullSafety: PhaseResult;
    apiContracts: PhaseResult;
    exhaustiveness: PhaseResult;
  };
  history: HistoryEntry[];
}

interface PhaseResult {
  status: 'passed' | 'failed' | 'warning';
  passRate: number;  // 0-100
  errors: VerificationError[];
  warnings: VerificationWarning[];
  passed: number;
}

interface VerificationError {
  id: string;
  message: string;
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  fixable: boolean;
  suggestion?: string;
}

interface HistoryEntry {
  timestamp: string;
  status: 'passed' | 'failed' | 'warning';
  errors: number;
  warnings: number;
}
```

### Data Flow

```
ShepLang AST + ShepThon AST
         │
         ▼
   Unified Graph
         │
         ▼
ShepVerify 4-Phase Engine
         │
         ▼
 VerificationReport JSON
         │
         ▼
VS Code Dashboard Renderer
         │
         ▼
   User Sees Results
```

---

## 🆚 Competitive Positioning

### Market Map

```
                    GENERATION QUALITY
                          HIGH
                           │
                           │      ┌───────────────┐
                           │      │   SHEPLANG    │
                           │      │  "Verified    │
                           │      │   Generation" │
                           │      └───────────────┘
                           │            ▲
                           │            │
    ┌──────────────────────┼────────────┼──────────────────────┐
    │                      │            │                      │
    │  ┌───────────────┐   │            │   ┌───────────────┐  │
LOW │  │   Replit      │   │            │   │   Lovable     │  │ HIGH
VERI│  │   Agent       │   │            │   │   v0, Bolt    │  │ GENERATION
FIC │  │               │   │            │   │               │  │ SPEED
    │  │ "Code helper" │   │            │   │ "Fast but     │  │
    │  └───────────────┘   │            │   │  unverified"  │  │
    │                      │            │   └───────────────┘  │
    └──────────────────────┼────────────┼──────────────────────┘
                           │            │
                           │  ┌───────────────┐
                           │  │  Traditional  │
                           │  │  Development  │
                           │  │  "Slow but    │
                           │  │   reliable"   │
                           │  └───────────────┘
                          LOW
                    VERIFICATION LEVEL
```

### Category Definition

> **"The Lighthouse + GitLens + Jest Explorer for AI-generated apps."**

Except bigger: **The world's first full-stack AI code verification dashboard.**

### What We're NOT
- ❌ Another AI app builder (competing on generation speed)
- ❌ A no-code platform (competing on visual editing)
- ❌ A code editor (competing on IDE features)
- ❌ A linter (just static analysis)

### What We ARE
- ✅ The verification layer for AI-generated code
- ✅ A language designed for AI to write AND prove correct
- ✅ The bridge between non-technical founders and production-ready software
- ✅ A visual dashboard that makes verification understandable

---

## 👥 Target Customers

### Primary: Non-Technical Founders

| Their Pain | Our Solution | Their Gain |
|------------|--------------|------------|
| "I can't tell if AI code is good" | Dashboard shows verification score | **Visual confidence** |
| "I'm scared to push to production" | Green = safe, Red = fix first | **Clear go/no-go signal** |
| "How do I fix this error?" | [Fix with AI] button | **One-click resolution** |
| "What does 'type safe' mean?" | Plain English explanations | **Understanding without expertise** |

### Secondary: Designers

| Their Pain | Our Solution | Their Gain |
|------------|--------------|------------|
| "I design but can't implement" | ShepLang + verification | **Design to verified code** |
| "I don't understand dev errors" | Dashboard with explanations | **Accessible feedback** |

### Tertiary: Developers

| Their Pain | Our Solution | Their Gain |
|------------|--------------|------------|
| "AI generates inconsistent code" | Grammar constrains output | **Reliable AI partner** |
| "Legacy codebase is a mess" | Import pipeline | **Clean up existing code** |
| "CI needs better checks" | Verification in pipeline | **Automated quality gate** |

---

## 💰 Business Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRICING TIERS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FREE TIER (Acquisition)                                                    │
│  ────────────────────────                                                   │
│  • Playground (unlimited)                                                   │
│  • VS Code extension (unlimited)                                            │
│  • Local verification (unlimited)                                           │
│  • Basic dashboard view                                                     │
│  • 5 AI imports/month                                                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRO ($29/month)                                                            │
│  ─────────────────                                                          │
│  • Everything in Free                                                       │
│  • Unlimited AI imports                                                     │
│  • AI Auto-Fix (unlimited)                                                  │
│  • Verification history (30 days)                                           │
│  • Premium templates                                                        │
│  • One-click deploy integration                                             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TEAM ($99/month)                                                           │
│  ────────────────                                                           │
│  • Everything in Pro                                                        │
│  • Team collaboration                                                       │
│  • Shared verification rules                                                │
│  • Team templates                                                           │
│  • API access                                                               │
│  • GitHub Action for CI/CD                                                  │
│  • Verification history (unlimited)                                         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ENTERPRISE (Custom)                                                        │
│  ───────────────────                                                        │
│  • Everything in Team                                                       │
│  • Custom verification rules                                                │
│  • Compliance reports (SOC2, HIPAA)                                         │
│  • On-prem deployment                                                       │
│  • Dedicated support                                                        │
│  • SLA guarantees                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📍 Implementation Roadmap

### Phase 1: Dashboard MVP (Weeks 1-2)
**Detailed TODOs:** `.specify/STEP1_DASHBOARD_MVP_TODOS.md`

| Slice | Description | Status |
|-------|-------------|--------|
| 1 | Dashboard Shell & Tree View Registration | ✅ |
| 2 | Summary Banner Section | ✅ |
| 3 | Verification Score Display | ✅ |
| 4 | Phase Breakdown (Type Safety & Null Safety) | ✅ |
| 5 | Phase Breakdown (API Contracts & Exhaustiveness) | ✅ |
| 6 | History Section | ✅ |
| 7 | Real-Time Updates & Status Bar | ✅ |

### Phase 2: AI Companion Strategy (PIVOTED)
**Status:** ✅ **COMPLETE - Strategic pivot applied**

**Key Discovery (Nov 26, 2025):**  
IDE AI (Copilot/Claude/Cursor) already understands ShepLang syntax and can fix errors!

**Strategic Decision:**  
- ❌ ~~Build our own AI fixer~~ - REMOVED
- ✅ Let IDE AI handle fixes (Copilot, Claude, Cursor, Windsurf)
- ✅ Focus 100% on **verification** (our unique moat)
- ✅ Keep Wizard's Anthropic integration (Command Palette generation)

**What This Means:**
- ShepVerify = **Verification layer** (proves code is correct)
- IDE AI = **Fix layer** (suggests corrections)
- We **complement** AI, we don't **compete** with it

**Benefits:**
- Saves months of AI development time
- Reduces API costs significantly
- Tighter focus on verification (moat)
- Works with ANY IDE AI the user prefers

### Phase 3: Polish & History (Week 5)
**Status:** ✅ **MOSTLY COMPLETE**

| Feature | Status | Notes |
|---------|--------|-------|
| Verification history storage | ✅ | `HistoryService` with globalState |
| History view in dashboard | ✅ | Last 10 runs shown |
| Score trend visualization | ⬜ | Optional enhancement |
| Status bar integration | ✅ | Shows errors/warnings/verified |
| Keyboard shortcuts | ✅ | Ctrl+Shift+R (rerun), Ctrl+Shift+D (dashboard) |
| getParent() fix | ✅ | TreeDataProvider now complete |

### Phase 4: Execution Integration (Week 6)
- [ ] Template generator for Vite projects
- [ ] StackBlitz/CodeSandbox preview embed
- [ ] One-click deploy preparation

---

## 📊 Success Metrics

### Product Metrics
- **Verification runs/day** — Are users running verification?
- **Fix acceptance rate** — Do users trust AI fixes?
- **Time to green** — How fast can users get to passing verification?
- **Deploy after verify** — Do users ship after getting green?

### Business Metrics
- **Free → Pro conversion** — Is the dashboard driving upgrades?
- **Pro retention** — Are paying users staying?
- **Time in extension** — Are users engaged with the dashboard?

---

## 🎯 Key Differentiators

1. **Only AI-native language with compile-time verification**
   - Grammar designed for AI consistency
   - 4-phase verification catches bugs before runtime

2. **Visual verification dashboard**
   - Lighthouse-style scores
   - Phase-by-phase breakdown
   - AI-powered fixes

3. **Full-stack verification**
   - Frontend (ShepLang)
   - Backend (ShepThon)
   - API contracts verified end-to-end

4. **Import existing projects**
   - Bring React/Next.js into verified world
   - Migration path for existing founders

---

## 📚 Reference Documents

- **PRD Details:** This document, Section "ShepVerify Dashboard"
- **TTD Details:** Behavior specs in this document
- **SDD Details:** Technical implementation in this document
- **Grammar Spec:** `sheplang/packages/language/src/shep.langium`
- **Verification Engine:** `sheplang/packages/verifier/`
- **Extension:** `extension/src/`

---

## ✅ Canonical Status

This document is the **source of truth** for:
- Product direction
- Technical architecture
- Business model
- Implementation priorities

All ADE agents, development decisions, and roadmap discussions should reference this document.

---

*Last Updated: November 26, 2025*
*Author: Jordan "AJ" Autrey / Golden Sheep AI*
