# ShepLang Playground Implementation Plan

**Version:** 1.0  
**Date:** 2025-11-23  
**Status:** PLAN - Ready for Execution

## Overview

Build a standalone ShepLang playground with real-time editing, syntax highlighting, compilation, and live preview. This implementation leverages our existing ShepLang language package rather than creating a separate WebAssembly parser.

## Architecture

```
ShepLang Editor (Monaco)
    ↓
ShepLang Parser (Backend API using existing language package)
    ↓
BobaScript IR Generation
    ↓
React/Node Code Generation
    ↓
Live Preview Panel
```

## Technology Stack

### Frontend Editor
- **Monaco Editor** - VS Code editor in browser
- **Custom Language Support** - ShepLang syntax highlighting
- **React** - UI framework
- **TypeScript** - Type safety
- **Next.js** - Framework for frontend + API routes

### Compilation Pipeline
- **ShepLang Parser (API)** - Parse source to AST using existing package
- **Mapper** - AST to BobaScript IR
- **Code Generator** - BobaScript to React/Node
- **Live Preview** - Generated app in iframe

### Infrastructure
- **Vercel** - Primary hosting
- **CDN** - Fast asset delivery

## Incremental Development & Testing Approach

Each feature will follow:
1. **Start small** - Begin with minimal implementation
2. **Visual verification** - Test visually before adding complexity
3. **Expand incrementally** - Add one feature at a time
4. **Test after each step** - Never proceed with broken code
5. **Document bugs** - Create issue tracking for each bug found

## Milestone 1: Foundation (4 days)

### Step 1: Basic Next.js Project Setup (1 day)
- Create Next.js project with TypeScript
- Install Monaco Editor dependency
- Set up basic project structure
- **BATTLE TEST:** Verify setup works

### Step 2: Initial Layout Components (1 day)
- Create `SplitPane.tsx` with resizable panels
- Add basic styling for editor and preview sections
- **BATTLE TEST:** Verify layout works

### Step 3: Monaco Editor Integration (1 day)
- Add Monaco editor component
- Implement basic ShepLang syntax definition
- Add default sample code
- **BATTLE TEST:** Verify editor works

### Step 4: Examples Gallery (1 day)
- Create examples component with basic examples
- Add example selection functionality
- Implement example loading into editor
- **BATTLE TEST:** Verify examples work

## Milestone 2: Analysis API (4 days)

### Step 1: Basic API Route (1 day)
- Create simple API endpoint that accepts code
- Return mock diagnostics initially
- **BATTLE TEST:** Verify API connectivity

### Step 2: ShepLang Parser Integration (1-2 days)
- Connect API to actual ShepLang language services
- Parse input code and return real diagnostics
- Handle parsing errors gracefully
- **BATTLE TEST:** Verify parsing

### Step 3: Monaco Diagnostics Integration (1 day)
- Display diagnostics as editor markers
- Add hover information for errors
- Implement problems panel
- **BATTLE TEST:** Verify error display

### Step 4: Status Bar and UI Feedback (1 day)
- Add status bar showing parsing status
- Implement loading indicators
- Add validation summary
- **BATTLE TEST:** Verify UI feedback

## Milestone 3: Preview & Export (5 days)

### Step 1: Basic Preview Panel (1 day)
- Create iframe-based preview component
- Add static HTML preview initially
- **BATTLE TEST:** Verify preview panel

### Step 2: Live Preview API (2 days)
- Create API endpoint for generating preview HTML
- Connect ShepLang code generation to preview
- Update preview on successful analysis
- **BATTLE TEST:** Verify live preview

### Step 3: Export Functionality (1-2 days)
- Add "Export to VS Code" button
- Create project brief generation
- Implement ZIP download option
- **BATTLE TEST:** Verify export

### Step 4: Project Visualization (1 day)
- Add project structure visualization
- Implement "Open in VS Code" deep link
- **BATTLE TEST:** Verify visualization

## Milestone 4: Deployment & Analytics (4 days)

### Step 1: Production Optimization (1 day)
- Bundle optimization
- Performance improvements
- Cross-browser testing
- **BATTLE TEST:** Verify production build

### Step 2: Analytics Integration (1 day)
- Add basic usage analytics
- Implement error tracking
- Create performance monitoring
- **BATTLE TEST:** Verify analytics

### Step 3: Vercel Deployment (1 day)
- Configure Vercel project
- Set up environment variables
- Deploy to staging URL
- **BATTLE TEST:** Verify deployment

### Step 4: Landing Page Integration (1 day)
- Add "Try ShepLang" button to main site
- Create deep links to examples
- Add SEO and social sharing
- **BATTLE TEST:** Verify integration

## Directory Structure

```
/sheplang
  /extension              # Existing VS Code extension
  /sheplang/packages      # Existing language package
  /playground             # NEW Next.js-based playground
    /public
      /examples           # .shep example files
      /assets             # Images, etc.
    /src
      /components
        /Editor           # Monaco editor components
        /Preview          # Preview panel components
        /Layout           # Layout components
        /Common           # Shared UI components
      /hooks              # React hooks for editor, analysis, etc.
      /services
        /analyzer.ts      # Wrapper for ShepLang analysis API
        /preview.ts       # Preview generation service
        /exporter.ts      # Export functionality
      /pages
        /index.tsx        # Main playground page
        /api
          /analyze.ts     # Analysis API endpoint
          /preview.ts     # Preview generation endpoint
          /export.ts      # Export API endpoint
      /types              # TypeScript type definitions
      /utils              # Utility functions
    /tests                # Test files
    /next.config.js       # Next.js configuration
    /package.json         # Dependencies
```

## Success Criteria

### Functional Requirements
- ✅ Real-time ShepLang parsing
- ✅ Syntax highlighting for all ShepLang constructs
- ✅ Live preview of generated apps
- ✅ Error handling and display
- ✅ Mobile responsive design

### Performance Requirements
- ✅ <500ms parse time for typical specs
- ✅ <2s compilation time
- ✅ Smooth editor experience
- ✅ Fast initial load (<3s)

### User Experience
- ✅ Intuitive split-panel layout
- ✅ Clear error messages
- ✅ Helpful examples library
- ✅ Easy sharing/export

## Testing Framework

For each battle test, we'll create a Verification Checklist:

```markdown
## Battle Test #X: Feature Name
**Date:** YYYY-MM-DD
**Tester:** [Name]

### Visual Tests
- [ ] Test item 1
- [ ] Test item 2

### Functionality Tests
- [ ] Test item 3
- [ ] Test item 4

### Edge Cases
- [ ] Test item 5
- [ ] Test item 6

### Performance Checks
- [ ] Test item 7
- [ ] Test item 8

### Issues Found
1. [Issue description]
2. [Issue description]

### Resolution Plan
- [ ] Fix for issue 1
- [ ] Fix for issue 2

### Screenshot Evidence
[Screenshots or recordings]
```

## Go/No-Go Decision Points

After each milestone, we'll have a formal Go/No-Go decision point where we:
1. Review all battle tests
2. Fix any critical issues
3. Decide to either proceed or fix more issues
4. Document lessons learned

## Integration with Existing ShepLang Code

The key to successful implementation is properly integrating with the existing language package:

```typescript
// In playground/package.json
{
  "dependencies": {
    "@goldensheepai/sheplang-language": "file:../sheplang/packages/language",
    // other deps...
  }
}
```

## Next Steps

1. Start with Milestone 1: Foundation
2. Create project structure
3. Implement core components
4. Set up battle testing framework
5. Proceed to Milestone 2 only after all tests pass

**Status:** Ready for implementation  
**Timeline:** 17 days to MVP (4+4+5+4)  
**Dependencies:** ShepLang language package
