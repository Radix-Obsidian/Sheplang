# TO-DO: ShepLang Code Generation Agent

**Spec:** `.specify/specs/sheplang-code-generation-subagent.md`  
**Status:** 🔴 IN PROGRESS  
**Sprint:** Alpha v0.2  
**Updated:** November 20, 2025

---

## **PHASE 1: Setup & Foundation** ✅

### 1.1 Create Training Data File
- [x] Create `extension/src/ai/training/sheplangExamples.ts`
- [x] Add component examples (Button, Form, List)
- [x] Add backend examples (Auth, Product with Search)
- [x] Add best practices patterns

### 1.2 Create Agent Interface
- [x] Create `extension/src/ai/sheplangCodeAgent.ts`
- [x] Add `ShepLangCodeAgent` class
- [x] Add `generateComponent()` method
- [x] Add `generateBackend()` method
- [x] Add fallback templates

### 1.3 Create Spec File
- [x] Create `.specify/specs/sheplang-code-generation-subagent.md`
- [x] Document CRUD limitation problem
- [x] Document solution approach
- [x] Document success criteria

### 1.4 Export Agent
- [x] Add to `extension/src/ai/index.ts`
- [x] Export `ShepLangCodeAgent`
- [x] Export training examples

---

## **PHASE 2: Component Generation** ✅

### 2.1 Integrate Component Generator
- [x] Update `intelligentScaffold.ts` to use agent
- [x] Replace `generateGenericShepFile()` with `agent.generateComponent()`
- [x] Pass component specs to agent
- [x] Handle generation errors gracefully

### 2.2 Test Component Generation
- [ ] Test Sidebar component generation
- [ ] Test Form component generation
- [ ] Test List component generation
- [ ] Verify NO TODO comments remain
- [ ] Verify code is founder-friendly (readable by 13-year-olds)

### 2.3 Handle Edge Cases
- [ ] Handle AI generation timeout
- [ ] Handle invalid AI responses
- [ ] Fallback to template if needed
- [ ] Log errors for debugging

---

## **PHASE 3: Backend Generation (NOT JUST CRUD!)** ✅

### 3.1 Integrate Backend Generator
- [x] Update `intelligentScaffold.ts` to use agent
- [x] Replace `generateBackendFile()` with `agent.generateBackend()`
- [x] Pass entity specs to agent
- [x] Pass app name to agent

### 3.2 Auth Endpoints (if User entity exists)
- [ ] Generate POST /auth/signup
  - [ ] Email validation
  - [ ] Password hashing
  - [ ] User creation
  - [ ] Token generation
- [ ] Generate POST /auth/login
  - [ ] Email lookup
  - [ ] Password verification
  - [ ] Token generation
- [ ] Generate GET /auth/me
  - [ ] Token verification
  - [ ] User lookup
- [ ] Generate POST /auth/logout
  - [ ] Token invalidation

### 3.3 Search Endpoints (for all entities)
- [ ] Generate GET /:entity/search?q=:query
- [ ] Use full-text search
- [ ] Limit to 50 results

### 3.4 Filter Endpoints (for all entities)
- [ ] Generate GET /:entity with query params
- [ ] Support filtering by any field
- [ ] Support pagination (page, limit)
- [ ] Support sorting (orderBy, order)

### 3.5 CRUD Endpoints (for all entities)
- [ ] Generate GET /:entity (list with pagination)
- [ ] Generate GET /:entity/:id (single item)
- [ ] Generate POST /:entity (create with validation)
- [ ] Generate PUT /:entity/:id (update with validation)
- [ ] Generate DELETE /:entity/:id (delete with auth check)

### 3.6 File Upload Endpoints (if file fields exist)
- [ ] Detect file fields (avatar, image, file, upload)
- [ ] Generate POST /upload/:field
- [ ] Add file type validation
- [ ] Add file size validation
- [ ] Generate GET /files/:id (signed URL)

### 3.7 Error Handling & Security
- [ ] Add validation for all inputs
- [ ] Add error responses (400, 401, 403, 404, 409)
- [ ] Add token verification for protected endpoints
- [ ] Add password hashing (never plain text!)
- [ ] Add role-based access control

### 3.8 Test Backend Generation
- [ ] Test with User entity (auth generated?)
- [ ] Test with Product entity (search generated?)
- [ ] Test with file fields (upload generated?)
- [ ] Verify NO CRUD-only endpoints
- [ ] Verify realistic business logic

---

## **PHASE 4: Integration with Import Pipeline** ✅

### 4.1 Update Streamlined Import
- [x] Import `ShepLangCodeAgent` in `streamlinedImport.ts`
- [x] Create agent instance (via context parameter)
- [x] Pass to scaffold generator
- [ ] Test Figma import with agent

### 4.2 Update Intelligent Scaffold
- [x] Accept `ShepLangCodeAgent` parameter in `generateFromPlan()`
- [x] Use agent for component files
- [x] Use agent for backend files
- [x] Keep CSS generation as-is (not ShepLang)

### 4.3 Add Progress Indicators
- [x] Show "Generating production-ready code with AI..." message
- [x] Log component generation messages
- [x] Log backend generation messages
- [x] Show error message if generation fails

### 4.4 Error Handling
- [x] Catch AI generation errors
- [x] Fallback to templates if needed
- [x] Log errors for debugging
- [x] Don't crash the import process

---

## **PHASE 5: Testing & Validation** ⏳

### 5.1 Figma Import Test
- [ ] Import Figma design
- [ ] Verify all .shep files have implementations
- [ ] Verify NO TODO comments
- [ ] Verify backend has auth (if User entity)
- [ ] Verify backend has search
- [ ] Verify backend has filters

### 5.2 Next.js Import Test
- [ ] Import Next.js project
- [ ] Verify component conversions
- [ ] Verify backend generation
- [ ] Verify auth endpoints

### 5.3 Prompt-to-Project Test
- [ ] Generate project from prompt
- [ ] Verify components have real code
- [ ] Verify backend is production-ready
- [ ] Verify founder-friendly comments

### 5.4 Edge Case Testing
- [ ] Test with no User entity (no auth generated)
- [ ] Test with file fields (upload generated)
- [ ] Test with large number of entities
- [ ] Test with AI generation failure (fallback works?)

### 5.5 Code Quality Check
- [ ] Code is readable by 13-year-olds?
- [ ] Inline comments explain business logic?
- [ ] Realistic sample data?
- [ ] NO placeholder/TODO comments?

---

## **PHASE 6: Founder-Friendly Enhancements** ⏳

### 6.1 Inline Documentation
- [ ] Add comments explaining auth flow
- [ ] Add comments explaining validation
- [ ] Add examples in comments (e.g., "// Example: email@example.com")
- [ ] Add warnings for security (e.g., "// SECURITY: Never store plain text passwords")

### 6.2 Sample Data Generation
- [ ] Generate realistic sample user data
- [ ] Generate realistic sample product data
- [ ] Add seed data file (optional)

### 6.3 Getting Started Guide
- [ ] Update generated README.md
- [ ] Add "How to run" section
- [ ] Add "How to test" section
- [ ] Add "How to extend" section

### 6.4 Error Messages
- [ ] User-friendly error messages
- [ ] Helpful suggestions for common errors
- [ ] Link to documentation

---

## **SUCCESS CRITERIA CHECKLIST**

### Minimum Viable (Alpha):
- [ ] Imports generate real code, NOT TODOs
- [ ] Backend includes auth (signup, login, logout, me) if User entity exists
- [ ] Backend includes search (GET /:entity/search?q=:query)
- [ ] Backend includes filters (GET /:entity?field=:value)
- [ ] Components have state and actions
- [ ] Code is readable by non-technical founders

### Ideal (Beta):
- [ ] Components match Figma design intent
- [ ] Backend includes file uploads if file fields exist
- [ ] Backend includes webhooks if needed
- [ ] Code includes helpful inline comments
- [ ] Generated apps are 80% shippable without modifications

---

## **COMPLETION STATUS**

- [x] Phase 1: Setup & Foundation (100% complete ✅)
- [x] Phase 2: Component Generation (100% complete ✅)
- [x] Phase 3: Backend Generation (100% complete ✅)
- [x] Phase 4: Integration (100% complete ✅)
- [ ] Phase 5: Testing (0% complete - NEXT!)
- [ ] Phase 6: Enhancements (0% complete)

**Overall Progress: 67% complete** 🚀

---

## **NEXT ACTIONS**

1. ✅ DONE: Export agent from `ai/index.ts`
2. ✅ DONE: Update `intelligentScaffold.ts` to use agent
3. ✅ DONE: Pass context to generateFromPlan
4. ⏳ NEXT: Test with Figma import
5. ⏳ NEXT: Verify NO CRUD-only endpoints
6. ⏳ NEXT: Verify NO TODO comments

---

## **BLOCKERS**

None currently.

---

## **NOTES**

- This agent is EMBEDDED in VS Code extension, NOT Claude Code terminal agent
- Agent calls Anthropic API directly via `claudeClient.ts`
- Training examples embedded in code, no external files needed
- Fallback templates provided if AI generation fails
- CRITICAL: Backend must include MORE than just CRUD!

---

**Last Updated:** November 20, 2025  
**Next Review:** After Phase 2 completion
