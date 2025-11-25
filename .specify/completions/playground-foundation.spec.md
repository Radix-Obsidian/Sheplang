# ShepLang Playground Foundation Specification

**Version:** 1.0  
**Date:** 2025-11-23  
**Status:** SPECIFICATION  

## Overview

This specification details the foundation components of the ShepLang Playground, a web-based development environment for editing, validating, and previewing ShepLang code. The foundation includes the project setup, layout, Monaco editor integration, and examples gallery.

## Technical Requirements

### Project Setup

1. **Framework:**
   - Next.js with TypeScript
   - React 18+
   - Node.js 18+

2. **Project Structure:**
   ```
   /playground
     /public
       /examples        # .shep example files
       /assets          # Images, logos, etc.
     /src
       /components
         /Editor        # Monaco editor components
         /Layout        # Layout components
         /Examples      # Examples gallery
       /pages
         /index.tsx     # Main playground page
       /styles          # CSS/SCSS files
       /utils           # Utility functions
     /tsconfig.json
     /package.json
     /next.config.js
   ```

3. **Dependencies:**
   - monaco-editor/react: ^4.6.0
   - react-split: ^2.0.14
   - typescript: ^5.3.0
   - next: ^14.0.0
   - Optional: tailwindcss for styling

### Layout Components

1. **Split Pane:**
   - Horizontal split by default (editor left, preview right)
   - Vertical split on mobile (editor top, preview bottom)
   - Resizable divider
   - Minimum sizes for both panels
   - Option to maximize either panel

2. **Responsive Design:**
   - Desktop: Side-by-side layout
   - Tablet: Side-by-side with modified proportions
   - Mobile: Stacked layout with tab switching

3. **Theme Support:**
   - Light and dark theme
   - Theme should match system preference by default
   - Manual theme toggle

### Monaco Editor Integration

1. **Editor Setup:**
   - Monaco Editor with TypeScript
   - ShepLang syntax definition based on extension
   - Default settings: line numbers, folding, minimap

2. **Syntax Highlighting:**
   - Keywords: app, data, view, action
   - Fields and properties
   - String literals
   - Comments

3. **Editor Features:**
   - Code folding
   - Line numbers
   - Minimap navigation
   - Theme switching

4. **Default Content:**
   - Simple ShepLang example on first load
   - Restore last edited code from localStorage

### Examples Gallery

1. **Example Files:**
   - Minimum 5 examples covering different ShepLang features
   - Simple to complex progression
   - Examples stored as static files

2. **Examples UI:**
   - Visual gallery with example titles and descriptions
   - Preview thumbnail if possible
   - One-click loading into editor
   - Categories for different types of examples

3. **Example Loading:**
   - Load examples into editor
   - Confirm before replacing unsaved work
   - Option to reset to default example

## User Interface Design

1. **Header:**
   - ShepLang logo
   - Playground title
   - Theme toggle
   - GitHub link

2. **Main Area:**
   - Split pane with editor and preview
   - Resizable divider
   - Full-width on larger screens

3. **Control Panel:**
   - Examples dropdown/gallery
   - Status indicator
   - Action buttons (analyze, share, etc.)

4. **Mobile Adaptations:**
   - Tab switching between editor and preview
   - Collapsible panels
   - Touch-friendly controls

## Success Criteria

1. **Usability:**
   - Editor loads within 2 seconds
   - Syntax highlighting correctly identifies all ShepLang elements
   - Split pane resizes smoothly
   - Examples load correctly

2. **Performance:**
   - First contentful paint < 1.5s
   - Editor responsiveness < 100ms
   - Smooth resizing without jank

3. **Compatibility:**
   - Works in Chrome, Firefox, Safari, Edge
   - Functions on iOS and Android browsers
   - Responsive from 320px to 4K resolution

4. **Technical:**
   - No TypeScript errors
   - No console errors
   - Passes Lighthouse performance benchmarks

## Constraints

1. **Browser Support:**
   - Modern browsers only (last 2 versions)
   - No IE support required

2. **Accessibility:**
   - WCAG 2.1 AA compliance
   - Keyboard navigation support
   - Screen reader compatibility

3. **Performance:**
   - Initial load < 3s on broadband
   - Total bundle size < 2MB

## References

1. Monaco Editor: https://microsoft.github.io/monaco-editor/
2. Next.js Documentation: https://nextjs.org/docs
3. ShepLang TextMate grammar from VS Code extension
4. ShepLang language package
