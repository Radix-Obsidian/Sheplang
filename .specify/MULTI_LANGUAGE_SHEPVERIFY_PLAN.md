# Multi-Language ShepVerify Support Plan

**Date:** November 27, 2025  
**Status:** ✅ TIER 1 & 2 COMPLETE - WIRED TO DASHBOARD  
**Priority:** HIGH - Viral Growth Strategy

---

## The Vision

> "ShepVerify should not be locked to ShepLang. The verification power should be available to ALL developers."

### Target Users

People who want to work around building, extending, debugging **Software as a Service (SaaS) applications**.

### Why This Matters

1. **Adoption Barrier Removal** - Developers don't need to learn ShepLang to experience ShepVerify
2. **Viral Potential** - TypeScript/Python developers can use ShepVerify immediately
3. **Market Expansion** - From "ShepLang users" to "ALL developers"
4. **Competitive Moat** - No other tool offers Lighthouse-style verification for code

### The Insight

ShepVerify's 4-phase verification (Type Safety, Null Safety, API Contracts, Exhaustiveness) is **language-agnostic in concept**. The same principles apply to:

- **TypeScript/JavaScript** - Type safety, null checks, React prop contracts
- **Python** - Type hints, None safety, function signatures
- **PHP** - Type declarations, null safety, Laravel contracts
- **Java** - Strong typing, null checks, Spring contracts
- **C#** - Type safety, nullable references, ASP.NET contracts

---

## Industry Research (Source: BrowserStack, StackOverflow 2025)

### Core Web Languages (Must Know)
- **HTML** - Structure (every website)
- **CSS** - Styling (every website)
- **JavaScript** - Interactivity (dominant browser language)

### Front-End Frameworks
- **React** - Most popular component library
- **Angular** - Enterprise-grade framework
- **Vue.js** - Progressive framework
- **Next.js** - React + SSR/SSG (SEO-friendly)

### Back-End Languages
- **JavaScript/TypeScript (Node.js)** - Full-stack JavaScript
- **Python** - Django, Flask, FastAPI
- **PHP** - Laravel (huge market share)
- **Java** - Spring Boot (enterprise)
- **C#** - ASP.NET Core (enterprise)

### Back-End Frameworks
- **Express.js** (Node.js)
- **Django/Flask** (Python)
- **Laravel** (PHP)
- **Spring Boot** (Java)
- **ASP.NET Core** (C#)
- **Ruby on Rails** (Ruby)

---

## Implementation Tiers

### Tier 1: Core Web (MUST HAVE) ✅ COMPLETE

| Language | Status | Checks |
|----------|--------|--------|
| HTML | ✅ | Accessibility (alt, ARIA), SEO (title, meta) |
| CSS | ✅ | Best practices (!important), Performance |
| SCSS | ✅ | Same as CSS |
| LESS | ✅ | Same as CSS |
| JavaScript | ✅ | Type safety, null safety, exhaustiveness |
| TypeScript | ✅ | Same as JS + stricter checks |
| JSX (React) | ✅ | + React prop types |
| TSX (React) | ✅ | + React prop types |

### Tier 2: Config & Data ✅ COMPLETE

| Language | Status | Checks |
|----------|--------|--------|
| JSON | ✅ | Syntax validation, package.json checks |
| JSONC | ✅ | Same as JSON (with comments) |

### Tier 3: Backend Languages

| Language | Status | Framework Focus | Checks |
|----------|--------|-----------------|--------|
| Python | ✅ Implemented | Django, Flask, FastAPI | Type hints, None safety, PEP8, Best practices |
| PHP | ⬜ Planned | Laravel | Type declarations, null safety |
| Java | ⬜ Planned | Spring Boot | Strong typing, null checks |
| C# | ⬜ Planned | ASP.NET Core | Nullable references |
| Ruby | ⬜ Planned | Rails | Duck typing checks |
| Go | ⬜ Planned | Gin, Echo | nil checks, interface contracts |

---

## Detailed Implementation

### Phase 5A: TypeScript/JavaScript Support (Alpha) ✅ IMPLEMENTED

**Target:** TypeScript, JavaScript, TSX, JSX files

**Verification Phases:**

| Phase | ShepLang | TypeScript Equivalent |
|-------|----------|----------------------|
| Type Safety | Field type checking | `any` usage, type assertions |
| Null Safety | Optional field handling | Optional chaining, non-null assertions |
| API Contracts | Action/View contracts | React props, function signatures |
| Exhaustiveness | Enum/state coverage | Switch statements, union types |

### Phase 5A.1: HTML Support ✅ IMPLEMENTED

**Target:** HTML files

**Verification Phases:**

| Phase | ShepLang | HTML Equivalent |
|-------|----------|----------------|
| Type Safety | Field type checking | Accessibility (alt tags, ARIA) |
| Null Safety | Optional field handling | SEO (title, meta description) |
| API Contracts | Action/View contracts | Semantic HTML |
| Exhaustiveness | Enum/state coverage | Required attributes |

### Phase 5A.2: CSS Support ✅ IMPLEMENTED

**Target:** CSS, SCSS, LESS files

**Verification Phases:**

| Phase | ShepLang | CSS Equivalent |
|-------|----------|---------------|
| Type Safety | Field type checking | Best practices (!important, inline) |
| Null Safety | Optional field handling | Performance (selectors) |
| API Contracts | Action/View contracts | Naming conventions |
| Exhaustiveness | Enum/state coverage | Media queries |

**Implementation:**
- File: `extension/src/services/universalVerifier.ts` ✅ CREATED
- Adapter pattern for language-specific verification
- Reuses existing dashboard UI

**Checks to Implement:**
1. ❌ `any` type usage → Error
2. ❌ Type assertions to `any`/`unknown` → Error
3. ❌ Potential null access without `?.` → Error
4. ❌ Non-null assertions (`!`) → Warning
5. ❌ React components without typed props → Error
6. ❌ Switch without default → Warning
7. ❌ useEffect without dependency array → Warning

### Phase 5B: Python Support (Beta)

**Target:** Python files (.py)

**Verification Phases:**

| Phase | ShepLang | Python Equivalent |
|-------|----------|-------------------|
| Type Safety | Field type checking | Type hints, mypy-style checks |
| Null Safety | Optional field handling | None checks, Optional types |
| API Contracts | Action/View contracts | Function signatures, dataclasses |
| Exhaustiveness | Enum/state coverage | Match statements, Enum coverage |

**Implementation:**
- Requires Python AST parsing or integration with mypy
- Consider using Language Server Protocol for Python

### Phase 5C: Universal Dashboard

**Goal:** Single dashboard that works for ANY language

**Features:**
1. Auto-detect file language
2. Show language-specific verification
3. Same Lighthouse-style scoring
4. Same history tracking
5. Same "Ask AI" hints

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ShepVerify Dashboard                  │
│  (Same UI for all languages - Lighthouse-style scores)  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Universal Verifier Service                  │
│  - Routes to language-specific adapters                 │
│  - Normalizes results to VerificationReport             │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   ShepLang    │   │  TypeScript   │   │    Python     │
│   Adapter     │   │   Adapter     │   │   Adapter     │
│  (Native)     │   │  (Phase 5A)   │   │  (Phase 5B)   │
└───────────────┘   └───────────────┘   └───────────────┘
```

---

## User Experience

### For ShepLang Users (Current)
- No change - native verification continues to work
- Dashboard shows ShepLang-specific phases

### For TypeScript/JavaScript Users (New)
1. Install ShepLang extension
2. Open any `.ts`, `.tsx`, `.js`, `.jsx` file
3. ShepVerify dashboard automatically shows verification
4. Click errors to navigate to code
5. See "Ask AI" hints for fixes

### For Python Users (Future)
1. Same experience as TypeScript
2. Python-specific checks (type hints, None safety)

---

## Marketing Positioning

### Before (Current)
> "ShepLang - The AI-native programming language with built-in verification"

### After (Multi-Language)
> "ShepVerify - Lighthouse for your code. Works with TypeScript, Python, and more."

### Taglines
- "Ship verified code in ANY language"
- "The Lighthouse for AI-generated code"
- "100% verification coverage, 0% language lock-in"

---

## Competitive Analysis

| Tool | TypeScript | Python | Visual Dashboard | AI Hints |
|------|------------|--------|------------------|----------|
| **ShepVerify** | ✅ | 🔜 | ✅ | ✅ |
| ESLint | ✅ | ❌ | ❌ | ❌ |
| mypy | ❌ | ✅ | ❌ | ❌ |
| TypeScript Compiler | ✅ | ❌ | ❌ | ❌ |
| SonarQube | ✅ | ✅ | ✅ | ❌ |

**ShepVerify Differentiators:**
1. **Visual Dashboard** - Lighthouse-style scores, not just error lists
2. **AI Companion** - "Ask your IDE AI to fix this" hints
3. **4-Phase Model** - Structured verification, not just linting
4. **History Tracking** - See verification trends over time

---

## Implementation Roadmap

### Week 1: TypeScript Adapter (Alpha)
- [x] Create `universalVerifier.ts` with adapter pattern
- [x] Implement TypeScript adapter with basic checks
- [ ] Wire up to dashboard for TS/JS files
- [ ] Test with real TypeScript projects

### Week 2: Dashboard Integration
- [ ] Auto-detect language and show appropriate verification
- [ ] Update status bar for multi-language support
- [ ] Add language indicator to dashboard

### Week 3: Polish & Testing
- [ ] Test with Next.js projects
- [ ] Test with React projects
- [ ] Test with Node.js projects
- [ ] Gather feedback

### Week 4: Python Adapter (Beta)
- [ ] Research Python verification approaches
- [ ] Implement Python adapter
- [ ] Test with Django/FastAPI projects

---

## Success Metrics

### Adoption
- **Goal:** 1000+ TypeScript users using ShepVerify within 30 days
- **Metric:** Extension installs from TypeScript developers

### Engagement
- **Goal:** 50% of users verify non-ShepLang files
- **Metric:** Verification runs by language

### Viral Growth
- **Goal:** 10% of users share ShepVerify with others
- **Metric:** Referral tracking, social mentions

---

## Risks & Mitigations

### Risk: TypeScript compiler already does type checking
**Mitigation:** ShepVerify provides VISUAL dashboard + AI hints, not just errors

### Risk: Too many false positives
**Mitigation:** Start conservative, add checks gradually based on feedback

### Risk: Performance issues with large files
**Mitigation:** Debounce verification, cache results, incremental updates

---

## Golden Sheep Methodology Alignment

### VSD (Vertical Slice Delivery)
- Each language adapter is a complete vertical slice
- TypeScript adapter ships independently

### FSRT (Full-Stack Reality Testing)
- Test with REAL TypeScript/Python projects
- Not just unit tests

### ZPP (Zero-Placeholder Policy)
- No "TODO: implement later" in adapters
- Each check is fully functional

### EDD (Evidence-Driven Debugging)
- Research official TypeScript/Python docs
- Don't hallucinate verification rules

---

## Files Created

1. `extension/src/services/universalVerifier.ts` - Core service with TypeScript adapter
2. `.specify/MULTI_LANGUAGE_SHEPVERIFY_PLAN.md` - This plan document

---

## Next Steps

1. **Immediate:** Wire TypeScript adapter to dashboard
2. **This Week:** Test with real TypeScript projects
3. **Next Week:** Polish and release as "ShepVerify for TypeScript"
4. **Future:** Python adapter, more languages

---

*"ShepVerify: The Lighthouse for your code. Ship verified software in ANY language."*
