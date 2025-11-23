# ShepLang VS Code Extension - Wizard Implementation Task

**Date:** November 22, 2025  
**Status:** 🚧 IN PROGRESS  
**Priority:** HIGH

---

## 🎯 Objective

Implement an exceptional multi-step wizard for creating new ShepLang projects that:
- Guides founders through 6 progressive steps
- Captures project requirements intelligently
- Generates well-organized monorepo structure
- Provides inline guidance and documentation
- Creates production-ready ShepLang code

---

## 📋 Implementation Phases

### Phase 1: Research & Setup ✅ COMPLETE
- [x] Research VS Code webview API
- [x] Study message passing patterns
- [x] Review existing wizard code
- [x] Understand ShepLang syntax patterns
- [x] Create type definitions

### Phase 2: Wizard UI (IN PROGRESS)
- [ ] Create webview panel with 6 steps
- [ ] Implement progress indicators
- [ ] Build step 1: Project Type selection
- [ ] Build step 2: Core Features input
- [ ] Build step 3: Data Model builder
- [ ] Build step 4: User Roles configuration
- [ ] Build step 5: Integrations selection
- [ ] Build step 6: Review & Generate
- [ ] Add navigation (back/next/cancel)
- [ ] Implement state persistence

### Phase 3: AI Scaffolding Agent
- [ ] Create scaffolding agent class
- [ ] Integrate web search for patterns
- [ ] Implement folder structure generator
- [ ] Add progress reporting
- [ ] Handle errors gracefully

### Phase 4: File Generators
- [ ] Entity file generator
- [ ] Flow file generator
- [ ] Screen file generator
- [ ] Integration file generator
- [ ] README generator
- [ ] Config file generator

### Phase 5: Syntax Validation
- [ ] Integrate ShepLang parser
- [ ] Validate generated files
- [ ] Report syntax errors
- [ ] Suggest fixes

### Phase 6: Documentation
- [ ] Generate folder READMEs
- [ ] Create NEXT_STEPS.md
- [ ] Add inline TODO comments
- [ ] Create project README

### Phase 7: Progress UI
- [ ] Build progress panel
- [ ] Show real-time logs
- [ ] Display validation results
- [ ] Add success/error indicators

### Phase 8: Testing
- [ ] Test with SaaS project type
- [ ] Test with E-commerce type
- [ ] Test with Content platform
- [ ] Test with Custom type
- [ ] Test error handling
- [ ] Test cancellation

### Phase 9: Polish
- [ ] Add welcome message
- [ ] Improve error messages
- [ ] Add tooltips and help text
- [ ] Optimize performance
- [ ] Add keyboard shortcuts

### Phase 10: Documentation
- [ ] Write user guide
- [ ] Create video walkthrough
- [ ] Document API
- [ ] Add examples

---

## 📁 Files to Create/Modify

### New Files
- `extension/src/wizard/types.ts` ✅ CREATED
- `extension/src/wizard/projectWizard.ts` (IN PROGRESS)
- `extension/src/wizard/scaffoldingAgent.ts`
- `extension/src/generators/entityGenerator.ts`
- `extension/src/generators/flowGenerator.ts`
- `extension/src/generators/screenGenerator.ts`
- `extension/src/generators/integrationGenerator.ts`
- `extension/src/generators/readmeGenerator.ts`
- `extension/src/ui/progressPanel.ts`
- `extension/src/validation/syntaxValidator.ts`

### Modified Files
- `extension/src/extension.ts` (register new command)
- `extension/package.json` (add command contribution)

---

## 🎨 Wizard Flow

```
Step 1: Project Type
├─ Mobile-first app 📱
├─ SaaS dashboard 💼
├─ E-commerce store 🛒
├─ Content platform 📰
└─ Custom application 🎯

Step 2: Core Features
├─ Feature 1: [input]
├─ Feature 2: [input]
└─ + Add more

Step 3: Data Model
├─ Natural language input
├─ Parse entities
└─ Define fields per entity

Step 4: User Roles
├─ Single user
├─ Multiple roles
└─ Team-based

Step 5: Integrations
├─ Payments (Stripe, PayPal)
├─ Email (SendGrid, Resend)
├─ Storage (S3, Cloudinary)
└─ Auth (Clerk, Auth0)

Step 6: Review & Generate
├─ Show summary
├─ Allow edits
└─ Generate project 🚀
```

---

## 📊 Success Criteria

### User Experience
- [ ] Wizard feels conversational, not interrogative
- [ ] Questions adapt based on previous answers
- [ ] Visual feedback shows progress clearly
- [ ] Review screen allows easy editing
- [ ] Generation shows real-time progress
- [ ] Founder immediately understands generated structure

### Technical
- [ ] All generated ShepLang files parse correctly
- [ ] Folder structure follows best practices
- [ ] README files provide clear guidance
- [ ] Syntax validation catches errors
- [ ] No breaking changes to existing code

### Production Ready
- [ ] Handles all project types correctly
- [ ] Error handling is comprehensive
- [ ] Performance is acceptable (<30s generation)
- [ ] Works on Windows, Mac, Linux
- [ ] Integrates with existing extension features

---

## 🚀 Next Steps

1. Complete `projectWizard.ts` implementation
2. Build scaffolding agent with web search
3. Create file generators for each type
4. Add syntax validation loop
5. Test with multiple project types
6. Polish UX and add welcome message

---

**Status:** Phase 1 complete, Phase 2 in progress  
**Estimated Completion:** 2-3 days  
**Blocker:** None
