# Playground Milestone 3: Preview & Export - Implementation Tasks

**Date:** 2025-11-23  
**Status:** READY TO START  
**Prerequisites:** Milestone 1 ✅ Complete, Milestone 2 ✅ Complete

## Task Overview

Implement live preview rendering and export functionality to allow users to visualize their ShepLang applications and export code for development.

## Detailed Tasks

### Task 3.1: Enhanced Preview Panel
- Replace placeholder preview with functional iframe
- Add device mode toggles (Mobile, Tablet, Desktop)
- Implement loading states
- Handle preview errors gracefully

**Acceptance Criteria:**
- Preview panel accepts HTML content
- Device modes render correctly
- Loading indicators show during generation
- Errors display helpful messages

### Task 3.2: Preview Generation API
- Create API endpoint for generating preview HTML
- Integrate with ShepLang compiler
- Generate standalone HTML from ShepLang code
- Include CSS and basic interactivity

**Acceptance Criteria:**
- API endpoint `/api/preview` responds
- Generates valid HTML from ShepLang
- Preview updates on valid code
- Handles compilation errors properly

### Task 3.3: Live Preview Integration
- Connect editor to preview API
- Update preview on successful analysis
- Implement debounced preview generation
- Add refresh button for manual updates

**Acceptance Criteria:**
- Preview updates automatically
- Debouncing prevents excessive calls
- Manual refresh works
- Preview shows current code state

### Task 3.4: Export Functionality
- Add "Export" button to UI
- Generate project brief from code
- Create ZIP download with full project structure
- Include README with setup instructions

**Acceptance Criteria:**
- Export button triggers download
- ZIP contains all necessary files
- Project structure follows conventions
- README is clear and helpful

### Task 3.5: Project Visualization (Optional)
- Add project structure tree view
- Show data models and views visually
- Display action flows
- Highlight relationships

**Acceptance Criteria:**
- Tree view shows project structure
- Visual elements are interactive
- Updates match current code
- Professional appearance

## Testing Checklist

### Battle Test #9: Preview Panel
- [ ] Preview panel renders HTML correctly
- [ ] Device modes work (mobile, tablet, desktop)
- [ ] Loading states display properly
- [ ] Errors are user-friendly

### Battle Test #10: Preview Generation
- [ ] API generates valid HTML
- [ ] Preview matches ShepLang definition
- [ ] CSS styles apply correctly
- [ ] Interactivity works (if applicable)

### Battle Test #11: Live Updates
- [ ] Preview updates on code changes
- [ ] Debouncing works (no lag)
- [ ] Manual refresh functions
- [ ] Preview syncs with editor

### Battle Test #12: Export
- [ ] Export button downloads ZIP
- [ ] ZIP contains correct files
- [ ] Project structure is valid
- [ ] README is comprehensive

## Dependencies

- ShepLang compiler package
- JSZip library for ZIP generation
- HTML/CSS template for preview
- Project brief template

## Time Estimate

- Task 3.1: 1 day
- Task 3.2: 2 days
- Task 3.3: 1 day
- Task 3.4: 1-2 days
- Task 3.5 (Optional): 1 day
- **Total:** 5-6 days

## Definition of Done

- All tasks implemented and tested
- All battle tests pass
- Preview shows live ShepLang visualization
- Export generates downloadable projects
- No regressions from previous milestones
- Documentation updated

## Success Criteria

- Users can see visual preview of their code
- Preview updates in real-time
- Users can export full projects
- Exported projects are immediately usable
- Professional user experience maintained
