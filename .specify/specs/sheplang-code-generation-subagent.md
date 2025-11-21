# ShepLang Code Generation Subagent

**Status:** 🔴 NOT STARTED  
**Priority:** 🔥 CRITICAL  
**Target:** Alpha v0.2  
**Date:** November 20, 2025

---

## **PROBLEM STATEMENT**

### **Current State (BAD):**
- ❌ Empty scaffold files with TODOs
- ❌ **CRUD-only endpoints** - Too basic!
- ❌ No business logic - Founders can't ship!

### **Desired State (GOOD):**
- ✅ Real, runnable ShepLang implementations
- ✅ **Production-ready endpoints** (auth, search, uploads, webhooks)
- ✅ Jumpstart business logic for non-technical founders

---

## **WHY CRUD IS NOT ENOUGH**

**CRUD only gives:**
```shepthon
GET /items -> db.all("items")
POST /items -> db.add("items", body)
```

**Real apps need:**
```shepthon
// Authentication
POST /auth/signup -> auth.register(body)
POST /auth/login -> auth.login(body.email, body.password)
GET /auth/me -> auth.getCurrentUser(headers.token)

// Search & Filters
GET /items/search?q=:query -> search.fullText("items", query.q)
GET /items?category=:cat -> db.filter("items", {"category": query.cat})

// File uploads
POST /upload/avatar -> storage.upload(body.file, "avatars")

// Webhooks
POST /webhooks/stripe -> stripe.handleWebhook(body)
```

---

## **SOLUTION APPROACH**

### **Embedded AI Agent (RECOMMENDED)**

NOT Claude Code agents (those only work in Claude Code IDE).

Instead: **Embedded AI in VS Code extension** that calls Anthropic API with specialized prompts.

```typescript
// extension/src/ai/sheplangCodeAgent.ts
export class ShepLangCodeAgent {
  async generateComponent(spec: ComponentSpec): Promise<string> {
    const prompt = buildPromptWithExamples(spec);
    return await callClaude(this.context, prompt, 2048);
  }
  
  async generateBackend(entities: Entity[]): Promise<string> {
    const prompt = buildBackendPromptWithExamples(entities);
    return await callClaude(this.context, prompt, 4096);
  }
}
```

---

## **TRAINING DATA STRUCTURE**

See: `extension/src/ai/training/sheplangExamples.ts`

Contains:
- Component examples (Button, Form, List)
- Backend examples (Auth, Search, CRUD++)
- Best practices and patterns

---

## **ACTIONABLE TO-DO LIST**

### **Phase 1: Setup & Foundation**
- [ ] 1.1 Create training data file (`sheplangExamples.ts`)
- [ ] 1.2 Create agent interface (`sheplangCodeAgent.ts`)
- [ ] 1.3 Add component generation prompts
- [ ] 1.4 Add backend generation prompts

### **Phase 2: Component Generation**
- [ ] 2.1 Implement `generateComponent()` method
- [ ] 2.2 Test with Sidebar example
- [ ] 2.3 Test with Form example
- [ ] 2.4 Test with List example

### **Phase 3: Backend Generation (NOT JUST CRUD!)**
- [ ] 3.1 Implement `generateBackend()` method
- [ ] 3.2 Generate auth endpoints (signup, login, logout, me)
- [ ] 3.3 Generate search endpoints
- [ ] 3.4 Generate filter endpoints
- [ ] 3.5 Generate upload endpoints (if file fields exist)
- [ ] 3.6 Add validation and error handling

### **Phase 4: Integration**
- [ ] 4.1 Update `streamlinedImport.ts` to use agent
- [ ] 4.2 Update `intelligentScaffold.ts` to use agent
- [ ] 4.3 Add progress indicators

### **Phase 5: Testing**
- [ ] 5.1 Test Figma import with agent
- [ ] 5.2 Verify all files have real implementations
- [ ] 5.3 Verify backend has more than just CRUD

### **Phase 6: Founder-Friendly**
- [ ] 6.1 Add inline comments explaining logic
- [ ] 6.2 Generate realistic sample data
- [ ] 6.3 Add "Getting Started" guide

---

## **SUCCESS CRITERIA**

### **Minimum Viable:**
- [ ] No TODO comments - real implementations
- [ ] Backend includes auth (not just CRUD!)
- [ ] Backend includes search and filters
- [ ] Components have state and actions
- [ ] Code readable by 13-year-olds

---

## **WHY THIS APPROACH**

**NOT Claude Code Agents:**
- Only work in Claude Code IDE
- Not portable to VS Code users

**YES Embedded AI Agent:**
- Works in VS Code extension
- Portable for all users
- We control training data
- Versioned with extension

---

See full implementation details in:
- `extension/src/ai/sheplangCodeAgent.ts`
- `extension/src/ai/training/sheplangExamples.ts`
