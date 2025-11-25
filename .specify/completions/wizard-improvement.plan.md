# ShepLang VS Code Extension - Wizard Improvement Plan

**Version:** 1.0  
**Date:** November 22, 2025  
**Status:** PLAN - Ready for Execution

---

## 🎯 Vision

Transform the ShepLang project wizard from a basic questionnaire into an exceptional user experience that:
- **Feels like a conversation** with an intelligent assistant
- **Adapts to user needs** based on their answers
- **Generates production-ready code** with 100% syntax validation
- **Teaches through structure** with inline guidance and documentation
- **Delivers the "wow" moment** when founders see their organized project

---

## 📊 Current State Analysis

### What Works ✅
- Basic wizard exists in `streamlinedImport.ts`
- ShepLang parser is production-ready
- Contextual keywords working perfectly
- 5 working examples to reference
- Phase 7 screen generation complete

### What Needs Improvement 🔧
- Wizard is too simple (minimal questions)
- No visual progress indicators
- No adaptive questioning
- No natural language parsing
- No real-time validation
- No inline documentation generation
- No welcome message after generation

---

## 🏗️ Architecture

### Component Hierarchy
```
ProjectWizard (main controller)
├── WebviewPanel (UI)
│   ├── Step1: ProjectType
│   ├── Step2: CoreFeatures
│   ├── Step3: DataModel
│   ├── Step4: UserRoles
│   ├── Step5: Integrations
│   └── Step6: Review
├── ScaffoldingAgent (AI orchestrator)
│   ├── PatternResearcher (web search)
│   ├── StructurePlanner
│   ├── FileGenerator
│   └── SyntaxValidator
└── ProgressPanel (feedback UI)
    ├── ProgressBar
    ├── LogViewer
    └── ValidationResults
```

### Data Flow
```
User Input → Questionnaire → Scaffolding Agent → File Generators → Syntax Validator → Project Files
     ↓            ↓                  ↓                   ↓                ↓              ↓
  Webview    State Store      Web Search         Templates         Parser        File System
```

---

## 📋 Implementation Phases

### Phase 1: Foundation (Day 1)
**Goal:** Set up types and basic wizard structure

**Tasks:**
1. Create `types.ts` with all interfaces ✅ DONE
2. Create `projectWizard.ts` skeleton
3. Set up webview panel with navigation
4. Implement state management
5. Add progress bar component

**Deliverables:**
- Type definitions complete
- Wizard opens and shows steps
- Navigation works (back/next/cancel)
- Progress bar updates

**Success Criteria:**
- Wizard displays all 6 steps
- State persists between steps
- No TypeScript errors

---

### Phase 2: Step Implementation (Day 2-3)
**Goal:** Build all 6 wizard steps with rich UI

**Step 1: Project Type**
- Visual cards with icons
- Project name input
- Custom description textarea
- Type-specific placeholders

**Step 2: Core Features**
- Dynamic feature inputs
- Add/remove functionality
- Type-specific placeholders
- Minimum 2, maximum 8 features

**Step 3: Data Model**
- Natural language textarea
- Entity parsing button
- Entity cards with fields
- Field type dropdowns
- Add/remove fields

**Step 4: User Roles**
- Role type selection
- Conditional role definition
- Checkbox group for roles
- Permission hints

**Step 5: Integrations**
- Categorized checkboxes
- Icons for each category
- Pre-selection based on project type
- "Skip for now" option

**Step 6: Review & Generate**
- Summary of all choices
- Edit links for each section
- Generate button (prominent)
- Cancel option

**Deliverables:**
- All 6 steps functional
- Data collection working
- UI polished and responsive

**Success Criteria:**
- Can complete entire wizard
- All data captured correctly
- UI feels professional

---

### Phase 3: AI Scaffolding Agent (Day 4)
**Goal:** Intelligent project generation with web research

**Components:**
1. **Pattern Researcher**
   - Web search for best practices
   - Extract folder structures
   - Identify common patterns

2. **Structure Planner**
   - Generate folder hierarchy
   - Plan file locations
   - Determine dependencies

3. **File Generator**
   - Entity files (.shep)
   - Flow files (.shep)
   - Screen files (.shep)
   - Integration files (.shep)
   - Config files

4. **Documentation Generator**
   - Folder READMEs
   - Project README
   - NEXT_STEPS.md
   - Inline comments

**Deliverables:**
- Scaffolding agent class
- Web search integration
- File generation working
- Documentation generated

**Success Criteria:**
- Generates valid ShepLang files
- Folder structure makes sense
- Documentation is helpful

---

### Phase 4: Syntax Validation (Day 5)
**Goal:** 100% valid generated code

**Components:**
1. **Parser Integration**
   - Use existing ShepLang parser
   - Validate each generated file
   - Collect diagnostics

2. **Error Reporting**
   - Show syntax errors
   - Suggest fixes
   - Link to problematic files

3. **Auto-Fix**
   - Common syntax issues
   - Reserved keyword conflicts
   - Missing required fields

**Deliverables:**
- Syntax validator class
- Error reporting UI
- Auto-fix for common issues

**Success Criteria:**
- 100% of generated files parse
- Clear error messages
- Auto-fix works

---

### Phase 5: Progress UI (Day 6)
**Goal:** Real-time feedback during generation

**Components:**
1. **Progress Panel**
   - Current step indicator
   - Progress bar
   - Log viewer
   - Validation results

2. **Status Messages**
   - "Researching patterns..."
   - "Creating entities..."
   - "Validating syntax..."
   - "✓ Project ready!"

3. **Error Handling**
   - Clear error messages
   - Recovery suggestions
   - Retry options

**Deliverables:**
- Progress panel component
- Real-time updates
- Error handling

**Success Criteria:**
- User sees progress clearly
- Errors are actionable
- Success feels rewarding

---

### Phase 6: Generated Project Structure (Day 7)
**Goal:** Perfect folder organization

**Structure:**
```
my-project/
├── .sheplang/
│   ├── project-config.json
│   └── project-config.md
├── entities/
│   ├── README.md
│   ├── User.shep
│   └── [others].shep
├── flows/
│   ├── README.md
│   ├── auth/
│   ├── [feature]/
│   └── webhooks/
├── screens/
│   ├── README.md
│   ├── dashboard/
│   ├── admin/
│   └── user/
├── integrations/
│   ├── README.md
│   └── [service].shep
├── config/
│   └── app.shep
├── README.md
└── NEXT_STEPS.md
```

**README Templates:**
- Explain folder purpose
- Show examples
- Guide next steps
- Link to documentation

**Deliverables:**
- Folder structure generator
- README templates
- NEXT_STEPS guide

**Success Criteria:**
- Structure is intuitive
- READMEs are helpful
- Easy to extend

---

### Phase 7: Testing & Polish (Day 8)
**Goal:** Production-ready quality

**Test Cases:**
1. SaaS Dashboard
   - Team management
   - Analytics
   - Billing

2. E-commerce Store
   - Products
   - Cart
   - Checkout

3. Content Platform
   - Articles
   - Authors
   - Comments

4. Custom Application
   - Free-form description
   - Parsed entities
   - Generated structure

**Polish Items:**
- Welcome message
- Keyboard shortcuts
- Tooltips
- Error messages
- Performance optimization

**Deliverables:**
- All test cases passing
- UX polished
- Performance acceptable

**Success Criteria:**
- Works for all project types
- No bugs or crashes
- Feels professional

---

### Phase 8: Documentation (Day 9)
**Goal:** Complete user guide

**Documents:**
1. User Guide
   - How to use wizard
   - Step-by-step walkthrough
   - Tips and tricks

2. Video Walkthrough
   - Screen recording
   - Narration
   - Upload to YouTube

3. API Documentation
   - For extension developers
   - Type definitions
   - Examples

**Deliverables:**
- User guide written
- Video recorded
- API docs complete

**Success Criteria:**
- Founders can use wizard
- Video is clear
- Docs are comprehensive

---

## 🎨 UX Principles

### 1. Progressive Disclosure
- Start simple, add complexity
- Show advanced options only when needed
- Don't overwhelm with choices

### 2. Adaptive Questioning
- Questions change based on answers
- Skip irrelevant steps
- Pre-fill smart defaults

### 3. Visual Feedback
- Progress bar always visible
- Icons make options scannable
- Colors indicate status

### 4. Forgiving Design
- Allow editing before generation
- Easy to go back
- Clear cancel option

### 5. Celebrate Success
- Welcome message after generation
- Show what was created
- Guide next steps

---

## 🔧 Technical Decisions

### Why Webview?
- Rich UI capabilities
- Full HTML/CSS/JS control
- Native VS Code integration

### Why Not QuickPick?
- Limited UI flexibility
- Can't show complex forms
- No visual progress indicators

### State Management
- Store in webview state
- Persist with `getState()`/`setState()`
- Restore on panel reopen

### File Generation
- Use templates with placeholders
- Validate before writing
- Atomic operations (all or nothing)

### Error Handling
- Try/catch around all operations
- Clear error messages
- Recovery suggestions

---

## 📊 Success Metrics

### Quantitative
- [ ] 100% of generated files parse correctly
- [ ] <30 seconds generation time
- [ ] 0 crashes or errors
- [ ] Works on Windows, Mac, Linux

### Qualitative
- [ ] Founders feel "This wizard understood me"
- [ ] Generated structure makes perfect sense
- [ ] Easy to see where to add features
- [ ] Code is readable and understandable
- [ ] Want to keep building

---

## 🚀 Rollout Plan

### Week 1: Build
- Days 1-3: Foundation + Steps
- Days 4-5: AI Agent + Validation
- Days 6-7: Progress UI + Structure

### Week 2: Polish
- Days 8-9: Testing + Documentation
- Day 10: Internal testing
- Day 11: Beta release
- Day 12: Gather feedback

### Week 3: Launch
- Day 13-14: Fix issues
- Day 15: Public release
- Day 16-17: Monitor usage
- Day 18-19: Iterate based on feedback
- Day 20: Celebrate! 🎉

---

## 📝 Notes

### Feature Placeholders by Project Type

**Mobile-first:**
- "User authentication"
- "Social feed"
- "Push notifications"

**SaaS Dashboard:**
- "Manage team members"
- "Track analytics"
- "Process payments"

**E-commerce:**
- "Browse products"
- "Shopping cart"
- "Checkout process"

**Content Platform:**
- "Create articles"
- "Manage authors"
- "Comment system"

### Reserved Keywords to Avoid
- `text`, `data`, `email`, `name`, `status`, `job`, `action`, `states`
- Use prefixes: `userEmail`, `taskStatus`, `jobSchedule`

### Integration Pre-selections

**SaaS:** Stripe, SendGrid, Clerk  
**E-commerce:** Stripe, S3, SendGrid  
**Content:** Cloudinary, SendGrid  
**Mobile:** Clerk, S3, SendGrid

---

## 🎯 The 80/20 Magic

**Wizard Generates (80%):**
- Complete folder structure
- All entity definitions
- Core flow logic
- Main screens
- Integration configurations
- Comprehensive documentation

**Founder Customizes (20%):**
- Additional entity fields
- Custom validation rules
- UI styling preferences
- Extra flows for edge cases
- Advanced integration settings

**The key:** The 20% feels easy because the structure teaches them how!

---

**Status:** READY FOR IMPLEMENTATION  
**Estimated Timeline:** 2-3 weeks  
**Risk Level:** LOW (building on proven foundation)  
**Impact:** HIGH (game-changing UX)

---

**Next Step:** Begin Phase 1 implementation
