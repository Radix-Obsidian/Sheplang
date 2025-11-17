# 🐑 ShepLang Ultimate Alpha Plan

**Last Updated:** November 16, 2025  
**Status:** FINAL - No More Pivots  
**Timeline:** 3 Weeks to YC-Ready Alpha  
**Motto:** Revise and Update

---

## 🎯 Executive Summary

This is **THE PLAN**. No more repositioning. No more pivots. We're building an AI-native full-stack language with a VSCode extension that enables non-technical founders to build production applications using plain-language syntax with AI assistance.

**What We're Building:**
- ✅ VSCode Extension (Phase 1 Complete - Scaffolding Done)
- 🔧 ShepLang `call` → ShepThon Bridge (In Progress)
- 📝 Dog Reminders E2E Demo (Next)
- 🚀 Alpha Release (3 Weeks)

**The Vision (Clear & Final):**
ShepLang is the first AI-native full-stack language designed to be written by AI and understood by humans. Founders can use Cursor/Copilot to generate ShepLang code that they can actually read, modify, and maintain - solving the "AI code comprehension wall" that kills 80% of founder-built apps.

---

## 🏗️ Current State (Nov 16, 2025)

### ✅ What's Complete

**Core Language Infrastructure:**
- ShepLang parser (Langium-based) ✅
- ShepThon parser (custom hand-rolled) ✅
- BobaScript transpiler ✅
- ShepThon runtime with InMemoryDB ✅
- Mapper converting AST → AppModel ✅

**VSCode Extension - Phase 1:**
- Extension scaffold (41 files) ✅
- Package.json manifest ✅
- TextMate grammars (syntax highlighting) ✅
- LSP server foundation ✅
- Code completion (29 snippets) ✅
- Hover documentation ✅
- Error diagnostics ✅
- Commands (New Project, Preview placeholder, Restart Backend) ✅
- Bridge service scaffold ✅
- Runtime manager ✅
- Compiled successfully ✅

**Examples:**
- Dog Reminders (frontend + backend) ✅
- 4 other templates ✅

### 🔧 What's In Progress

**Critical Path Items:**
1. **Bridge Wiring** - Connect ShepLang `call` statements to ShepThon runtime
   - Status: bridgeService.callEndpoint() now implemented ✅
   - Remaining: Wire to preview/renderer
   
2. **Dog Reminders E2E** - Full flow from button click → API call → UI update
   - Status: Components exist, need integration testing

### ❌ What's Blocking YC Alpha

From `YC_ALPHA_READINESS_PLAN.md`:

**INCOMPLETE (Blocking YC):**
1. ❌ E2E Dog Reminders Demo
   - ShepLang frontend exists
   - ShepThon backend exists
   - Bridge service exists
   - **Missing:** Actual button → action → call → backend flow

2. ❌ Updated Documentation
   - README mentions nothing about ShepThon/Shepyard
   - Need marketplace-ready README
   - Need tutorial walkthrough

---

## 📅 3-Week Sprint Plan

### Week 1: Foundation & Bridge (Nov 17-23)

#### **Day 1-2: Bridge Integration & Dog Reminders E2E** 🔥 CRITICAL
**Goal:** Make Dog Reminders fully functional end-to-end

**Tasks:**
1. ✅ Implement bridgeService.callEndpoint() using ShepThon runtime
2. Wire extension preview command to:
   - Parse .shep file
   - Transpile to BobaScript
   - Load .shepthon backend if present
   - Render UI with working buttons
3. Test button click → action execution → API call → state update
4. Verify data persists in InMemoryDatabase
5. Document the flow with screenshots

**Acceptance Criteria:**
- Open dog-reminders.shep in VSCode
- Run "ShepLang: Show Preview"
- Click "Add Reminder"
- See new reminder in list
- Refresh preview - data persists
- Zero manual code changes needed

**Deliverable:** Screencast showing working E2E demo

---

#### **Day 3-4: LSP Enhancement & AI Context**
**Goal:** Make AI tools generate perfect ShepLang code

**Tasks:**
1. Enhance completion provider with semantic context
   - Inside `model` block → suggest field types
   - Inside `endpoint` block → suggest db operations
   - Inside `view` block → suggest UI components
2. Add signature help for endpoints
3. Implement document symbols for outline
4. Add "Go to Definition" for models/endpoints
5. Test with Cursor generating code

**Acceptance Criteria:**
- Ask Cursor "Add priority field to Reminder model"
- AI generates correct syntax without errors
- Hover shows helpful docs
- Autocomplete suggests relevant options

**Deliverable:** AI-generated code compiles first try 80% of the time

---

#### **Day 5-6: Preview Panel Polish**
**Goal:** Production-quality preview experience

**Tasks:**
1. Implement live reload on file changes
2. Add loading states ("Starting backend...", "Saving...")
3. Error handling with friendly messages
4. Status bar showing backend health
5. "Restart Backend" command actually works
6. DevTools integration for debugging

**Acceptance Criteria:**
- Edit .shep file → preview updates <2 seconds
- Errors show helpful messages with suggestions
- Backend status visible at all times
- Can restart backend without reloading VSCode

**Deliverable:** Polished preview that feels native

---

#### **Day 7: Error Recovery & DX Polish**
**Goal:** Clear feedback when things go wrong

**Tasks:**
1. Smart error messages with "Did you mean?" suggestions
2. Diagnostics show in editor with red squiggles
3. Output channel logs helpful debugging info
4. Toast notifications for background operations
5. Keyboard shortcuts for common actions

**Acceptance Criteria:**
- Typo shows suggestion immediately
- Logs are clear and actionable
- Can fix errors without leaving editor

**Deliverable:** Founder-friendly error experience

---

### Week 2: Templates & Documentation (Nov 24-30)

#### **Day 8-10: Tutorial Templates**
**Goal:** 5 progressive examples guiding founders

**Templates to Create:**
1. **Hello World** (5 min) - Single view, static text, one button
2. **Counter** (10 min) - State management, increment/decrement
3. **Todo Local** (15 min) - Forms, lists, local state
4. **Message Board** (20 min) - First backend, GET/POST
5. **Dog Reminders** (30 min) - Full app, jobs, CRUD

**Each Template Includes:**
- Complete .shep and .shepthon files
- Inline comments explaining every concept
- README with learning objectives
- Video walkthrough (2-3 min)

**Deliverable:** "ShepLang: Create New Project" command with template picker

---

#### **Day 11-12: Documentation Blitz**
**Goal:** Comprehensive docs for marketplace

**Documents to Create:**
1. **README.md** (marketplace listing)
   - Problem: AI code comprehension wall
   - Solution: Human-readable AI-native language
   - Screenshots of extension in action
   - Quick start guide
   - Link to docs site

2. **GETTING_STARTED.md**
   - Installation steps
   - First project (Hello World)
   - Understanding syntax
   - Working with AI assistants

3. **LANGUAGE_REFERENCE.md**
   - All ShepLang keywords
   - All ShepThon keywords
   - Type system
   - Common patterns

4. **TROUBLESHOOTING.md**
   - Common errors and fixes
   - Backend connection issues
   - Extension not activating
   - AI generating wrong syntax

5. **AI_BEST_PRACTICES.md**
   - How to prompt Cursor/Copilot
   - Patterns that work well
   - When to write code manually

**Deliverable:** docs/ folder ready for mkdocs deployment

---

#### **Day 13-14: Shepyard Lite (Marketing Site)**
**Goal:** Demo site funneling to VSCode extension

**Shepyard Repositioning:**
- Strip to bare essentials: editor + read-only preview
- Load Dog Reminders as default example
- Non-editable code with hover annotations
- Animated preview showing key interactions
- CTAs: "Build This in VSCode", "Get Extension"
- Side-by-side comparison: React+Express vs ShepLang
- Testimonials (fictional but realistic)

**Technical:**
- Remove: File system, backend panel, project panel
- Keep: Monaco with syntax highlighting, preview pane
- Add: Highlight-on-click, animated demo, conversion tracking

**Deliverable:** shepyard.vercel.app as marketing landing page

---

### Week 3: Testing & Launch (Dec 1-7)

#### **Day 15-17: E2E Testing & Bug Fixes**
**Goal:** Rock-solid stability for alpha users

**Testing Checklist:**
- [ ] Fresh VSCode install → extension install → works
- [ ] All 5 templates load and run correctly
- [ ] Syntax highlighting works for all keywords
- [ ] Autocomplete triggers on all expected contexts
- [ ] Hover docs display for all keywords
- [ ] Preview updates on file save
- [ ] Backend starts automatically with .shepthon
- [ ] Dog Reminders full E2E flow works
- [ ] Errors show helpful diagnostics
- [ ] Works with Cursor (AI generates valid code)
- [ ] Works with GitHub Copilot
- [ ] Works on Windows, Mac, Linux

**Bug Triage:**
- P0 (blocks basic usage) - Fix immediately
- P1 (affects common workflows) - Fix before launch
- P2 (minor issues) - Document as known issues

**Deliverable:** Zero P0 bugs, <5 P1 bugs

---

#### **Day 18-19: Demo Video & Marketing Materials**
**Goal:** Compelling assets for marketplace & social

**Demo Video (3 min):**
- [0:00-0:30] Problem: Founder with messy AI-generated code
- [0:30-1:00] Solution: ShepLang shows clean, readable syntax
- [1:00-2:00] Walkthrough: Create project, AI adds feature, preview works
- [2:00-2:30] Results: Working app, understandable code
- [2:30-3:00] CTA: Install extension, try templates

**Screenshots for Marketplace:**
1. Code editor with syntax highlighting
2. Autocomplete in action
3. Preview panel showing Dog Reminders
4. Error diagnostic with helpful message
5. AI (Cursor) generating ShepLang code

**Social Media Assets:**
- Twitter thread (7 tweets) with demo gif
- LinkedIn post with problem/solution narrative
- Reddit post for r/SideProject, r/nocode
- Indie Hackers post with technical details

**Deliverable:** Launch kit ready for distribution

---

#### **Day 20-21: Marketplace Publication & Launch**
**Goal:** Extension live on VSCode marketplace

**Pre-Launch Checklist:**
- [ ] Package.json metadata complete
- [ ] Changelog written
- [ ] README polished
- [ ] Screenshots high-quality
- [ ] Demo video uploaded
- [ ] Publisher account verified
- [ ] Extension packaged with `vsce package`
- [ ] Tested packaged .vsix locally

**Launch Day:**
1. Publish to marketplace (morning)
2. Post to social media (scheduled throughout day)
3. Submit to Indie Hackers, Reddit (evening)
4. Email personal network
5. Post in founder Slack communities
6. Monitor marketplace analytics

**Support Setup:**
- GitHub repo for issues
- Support email alias
- Discord server for community
- Template responses for common questions

**Deliverable:** Extension published, initial users onboarded

---

## 🧪 Alpha User Testing (Week 4+)

### Goals
- 10 alpha users onboarded
- Detailed feedback collected
- Critical bugs fixed within 24 hours
- Weekly group feedback sessions

### Success Metrics
- ✅ 7/10 complete Dog Reminders tutorial independently
- ✅ 5/10 build custom app beyond tutorials
- ✅ 8/10 report code is more understandable than AI-generated JS/Python
- ✅ Task completion time decreases 20% between first/second project

### Feedback Loop
- Daily feedback review
- Rapid iteration cycle (ship updates daily if needed)
- Document success/failure patterns
- Refine tutorials based on observed usage

---

## 🏗️ Technical Architecture (Reference)

### Component Overview

```
VSCode Extension (Node.js)
├── Extension Host
│   ├── Commands (preview, new project, restart)
│   ├── Runtime Manager (manages ShepThon process)
│   └── Bridge Service (frontend ↔ backend communication)
│
├── Language Client
│   └── LSP Server (separate process)
│       ├── Parser (ShepLang/ShepThon)
│       ├── Completion Provider
│       ├── Hover Provider
│       ├── Diagnostic Provider
│       └── Symbol Provider
│
└── Webview (isolated context)
    ├── BobaScript Renderer
    ├── UI Components
    └── Message Handler (talks to extension host)

ShepThon Runtime (child process)
├── In-Memory Database
├── HTTP Router (endpoints)
├── Job Scheduler
└── Expression Evaluator
```

### Data Flow

**Opening a File:**
1. User opens `app.shep`
2. VSCode activates extension
3. Extension starts LSP server
4. LSP server parses file, provides diagnostics
5. Editor shows syntax highlighting + error squiggles

**Running Preview:**
1. User runs "ShepLang: Show Preview"
2. Extension creates webview panel
3. Extension parses .shep file → AST
4. Extension checks for .shepthon file
5. If found, starts ShepThon runtime as child process
6. Extension sends AST to webview via postMessage
7. Webview renders using BobaScript renderer
8. When user clicks button:
   - Renderer looks up action in AST
   - Finds `call` statement
   - Invokes bridge service
   - Bridge calls runtime.callEndpoint()
   - Runtime executes endpoint logic
   - Returns result to bridge
   - Bridge returns to renderer
   - Renderer updates UI

**AI Code Generation:**
1. User asks Cursor "Add priority field"
2. Cursor requests completion from LSP
3. LSP analyzes context (inside model block)
4. LSP returns field type suggestions
5. Cursor generates code using suggestions
6. User accepts code
7. LSP validates new code
8. Diagnostics show any errors

---

## 🚨 Risk Mitigation

### Known Risks & Contingencies

**Risk:** Bridge communication fails (CORS, networking)  
**Mitigation:** Implement proxy in extension host, test thoroughly

**Risk:** Preview performance degrades with large apps  
**Mitigation:** Virtual scrolling, lazy loading, simplified preview mode option

**Risk:** AI tools don't generate good ShepLang despite LSP  
**Mitigation:** Enhanced snippets, prompt engineering guide, community examples

**Risk:** Users struggle with installation  
**Mitigation:** Video walkthrough, detailed troubleshooting guide, community support

**Risk:** Backend runtime crashes or leaks memory  
**Mitigation:** Implement restart command, add memory limits, log errors clearly

---

## 📊 Success Criteria

### Alpha Launch (Week 3)
- [ ] Extension published on VSCode marketplace
- [ ] 10 alpha users onboarded
- [ ] Dog Reminders E2E demo works flawlessly
- [ ] All 5 templates functional
- [ ] Documentation complete
- [ ] Demo video live
- [ ] Zero P0 bugs

### First Month (Weeks 4-7)
- [ ] 50+ extension installs
- [ ] 5+ custom apps built by users
- [ ] <10 open bugs (all P2 or lower)
- [ ] 4.0+ average marketplace rating
- [ ] 3+ positive testimonials
- [ ] Active community (Discord/GitHub)

### YC Application Ready (Week 8)
- [ ] 100+ installs
- [ ] 10+ working applications built
- [ ] Case study: founder built app start-to-finish
- [ ] Clear metrics: time saved, comprehension improved
- [ ] Traction evidence: growth chart, user quotes

---

## 🎯 Immediate Next Steps (Next 48 Hours)

### Priority 1: Bridge Wiring (DONE ✅)
- [x] Implement bridgeService.callEndpoint() using runtime
- [ ] Wire extension preview to use bridge
- [ ] Test Dog Reminders E2E flow
- [ ] Document with screenshots

### Priority 2: Extension Preview Command
- [ ] Create webview with BobaRenderer
- [ ] Load parsed AST into webview
- [ ] Handle button clicks → action execution
- [ ] Test with all 5 templates

### Priority 3: Testing & Validation
- [ ] Fresh VSCode install test
- [ ] All templates load correctly
- [ ] Dog Reminders full flow works
- [ ] Record screencast

---

## 📝 Notes & Context

### Why This Plan is Final

We've been iterating and pivoting. Now we have:
1. Clear technical vision (AI-native language for founders)
2. Working infrastructure (parsers, runtime, extension scaffold)
3. Concrete use case (Dog Reminders E2E)
4. Defined timeline (3 weeks to alpha)
5. Success metrics (user testing, marketplace metrics)

The only changes from here are **"revise and update"** - refinements and improvements, not pivots.

### Moat Strategy

**Short-term moat:** First-mover advantage in AI-native full-stack languages
**Medium-term moat:** Community-built templates and patterns
**Long-term moat:** Network effects from AI training data (Cursor learns ShepLang patterns)

### What We're NOT Building (Yet)

- ❌ Cloud deployment (future)
- ❌ Real databases (using InMemoryDB for alpha)
- ❌ Authentication/auth (future)
- ❌ Production hosting (future)
- ❌ Collaboration features (future)
- ❌ Mobile app (future)

Focus is 100% on the local development experience and VSCode extension.

---

## 🏁 Definition of Done

**Alpha is complete when:**
1. Extension published on marketplace ✅
2. Dog Reminders E2E works flawlessly ✅
3. 5 templates functional ✅
4. Documentation comprehensive ✅
5. 10 alpha users successfully onboarded ✅
6. Demo video published ✅
7. Shepyard marketing site live ✅
8. Zero P0 bugs ✅
9. AI tools generate valid code 80%+ of time ✅
10. Founders report code is understandable ✅

**Then we iterate based on user feedback. No more pivots. Just revise and update.**

---

**"Revise and update. No more pivots. Build the moat."**

🐑 Let's ship this.
