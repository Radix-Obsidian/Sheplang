# ShepKit Constitution

**Purpose:** Non-negotiable principles for ShepKit AI development  
**Based On:** [scope.md](../../Project-scope/scope.md)  
**Updated:** 2025-01-13

---

## Core Principles

### 1. ShepLang-First Development

**Principle:** ShepKit exists to teach and build with ShepLang, not other languages.

**Rules:**
- ✅ ONLY generate ShepLang code
- ✅ ONLY explain ShepLang → BobaScript → TypeScript → JavaScript pipeline
- ❌ NEVER generate code in Python, Java, C++, or other languages
- ❌ NEVER become a general-purpose coding assistant

**Validation:**
Every AI response must pass: "Does this focus on ShepLang?"

---

### 2. Educational Layer is Sacred

**Principle:** Learning is as important as building.

**Rules:**
- ✅ ALWAYS explain "why" before "how"
- ✅ ALWAYS show ShepLang → BobaScript transformation when educational
- ✅ ALWAYS celebrate user progress ("Great!", "Nice work!")
- ❌ NEVER skip educational value for speed
- ❌ NEVER assume prior programming knowledge

**Validation:**
Every feature must answer: "What does this teach the user?"

---

### 3. No Code Outside .shep Files

**Principle:** AI modifies only ShepLang files.

**Rules:**
- ✅ AI can generate ShepLang (.shep files)
- ✅ AI can explain TypeScript/JavaScript (read-only)
- ❌ AI NEVER modifies TypeScript files directly
- ❌ AI NEVER modifies package.json or config files
- ❌ AI NEVER touches generated files

**Validation:**
Before any write operation: "Is this a .shep file?"

---

### 4. Safety & Validation First

**Principle:** Never insert invalid code.

**Rules:**
- ✅ ALWAYS validate syntax with parseShep() before insertion
- ✅ ALWAYS use Zod schemas for AI responses
- ✅ ALWAYS sanitize user input
- ❌ NEVER insert code without validation
- ❌ NEVER expose API keys to client
- ❌ NEVER trust AI output blindly

**Validation:**
All code paths must include: Zod validation → Syntax check → Safe insertion

---

### 5. Non-Technical First

**Principle:** Design for founders, not developers.

**Rules:**
- ✅ Use plain English in all explanations
- ✅ Use real-world analogies (filing cabinets, restaurants)
- ✅ Show visual representations when possible
- ❌ NEVER use technical jargon without explanation
- ❌ NEVER assume programming background
- ❌ NEVER skip context

**Validation:**
Every explanation must pass: "Would a non-technical founder understand this?"

---

### 6. Performance Matters

**Principle:** Fast responses = better learning experience.

**Rules:**
- ✅ Use Edge runtime for all AI routes
- ✅ Stream all long responses
- ✅ Cache common queries (24h TTL)
- ✅ Debounce AI calls (500ms)
- ❌ NEVER block UI thread
- ❌ NEVER wait for full response before showing something

**Targets:**
- Generate component: < 3s
- Explain code: < 2s
- First token: < 500ms

---

### 7. Testing is Mandatory

**Principle:** No feature ships without tests.

**Rules:**
- ✅ ALWAYS write tests before implementation
- ✅ ALWAYS test AI responses (structured output)
- ✅ ALWAYS test error handling
- ❌ NEVER skip tests for "quick fixes"
- ❌ NEVER merge without green CI

**Coverage Targets:**
- API routes: 90%+
- React hooks: 85%+
- Components: 80%+

---

### 8. Accessibility is Non-Negotiable

**Principle:** Everyone can use ShepKit.

**Rules:**
- ✅ All UI must be keyboard navigable
- ✅ All AI responses must be screen-reader friendly
- ✅ High contrast mode support
- ✅ ARIA labels on all interactive elements
- ❌ NEVER rely on color alone
- ❌ NEVER assume mouse/touch input

---

### 9. Cost Consciousness

**Principle:** AI should be affordable for all users.

**Rules:**
- ✅ Cache responses aggressively
- ✅ Optimize prompts for token efficiency
- ✅ Rate limit to prevent abuse
- ✅ Monitor token usage
- ❌ NEVER make redundant API calls
- ❌ NEVER send full file content unnecessarily

**Targets:**
- < $0.10 per user per day
- 90%+ cache hit rate for common queries

---

### 10. Privacy First

**Principle:** User code stays private.

**Rules:**
- ✅ All AI calls server-side only
- ✅ No user code logged
- ✅ API keys in environment only
- ❌ NEVER send code to third parties
- ❌ NEVER log user inputs
- ❌ NEVER store chat history without consent

---

## Technology Stack (Frozen)

**Allowed Dependencies:**
- ✅ `ai` (Vercel AI SDK)
- ✅ `@ai-sdk/openai` (OpenAI provider)
- ✅ `@ai-sdk/react` (React hooks)
- ✅ `zod` (Validation)
- ✅ `@heroicons/react` (Icons)

**Forbidden Dependencies:**
- ❌ Other AI SDKs (Langchain, LlamaIndex, etc.)
- ❌ Other LLM providers without approval
- ❌ Heavy ML libraries (TensorFlow, PyTorch)

---

## AI Model Configuration

**Primary Model:** OpenAI GPT-4o

**Temperature Settings:**
- Generate mode: 0.7 (creative)
- Explain mode: 0.5 (consistent)
- Debug mode: 0.5 (precise)
- Chat mode: 0.7 (conversational)

**Token Limits:**
- Max output: 4096 tokens
- Max context: 8192 tokens

**Do NOT change without approval.**

---

## Code Style

**TypeScript:**
- Strict mode enabled
- ESM imports with `.js` extensions
- No `any` types
- Zod for all external data

**React:**
- Functional components only
- Hooks for state management
- Client components marked with 'use client'
- Server components by default

**Naming:**
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case.tsx

---

## Git Workflow

**Branch Strategy:**
- `main` - production
- `feature/ai-*` - AI features
- No direct commits to main

**Commit Messages:**
```
<type>: <description>

<body>
<footer>
```

**Types:**
- feat: New feature
- fix: Bug fix
- docs: Documentation
- test: Tests
- refactor: Code refactoring

---

## Deployment

**Vercel Only:**
- All deployments via Vercel
- Environment variables in Vercel UI
- Edge runtime for AI routes
- Preview deployments for PRs

---

## Review Checklist

Before merging any AI feature:

- [ ] Spec created and approved
- [ ] Plan reviewed
- [ ] Tasks completed
- [ ] All tests passing
- [ ] Performance targets met
- [ ] Accessibility verified
- [ ] Constitution compliance checked
- [ ] Documentation updated

---

## Constitution Updates

**Process:**
1. Propose change in PR
2. Review by Founder
3. Update this document
4. Update constitution_update_checklist.md

**Changes require approval from:** Founder

---

**Last Updated:** 2025-01-13  
**Version:** 1.0  
**Status:** Active
