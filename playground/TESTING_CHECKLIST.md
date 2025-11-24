# ShepLang Playground - Testing Checklist

**Version:** 1.0.0  
**Date:** November 23, 2025  
**Status:** Ready for Testing

---

## 🧪 Pre-Test Setup

- [ ] Development server running (`pnpm dev`)
- [ ] Browser DevTools open (F12)
- [ ] Network tab visible
- [ ] Console tab visible
- [ ] Clear browser cache if needed

---

## ✅ Milestone 1: Foundation Tests

### Editor Functionality
- [ ] Monaco editor loads successfully
- [ ] Default ShepLang code displays
- [ ] Can type in editor
- [ ] Syntax highlighting visible (keywords colored)
- [ ] Line numbers display
- [ ] Minimap visible on right side
- [ ] Code persists on page refresh (localStorage)

### Layout & UI
- [ ] Split pane divides editor and preview
- [ ] Can drag gutter to resize panes
- [ ] Header displays with logo/title
- [ ] Theme switcher toggles light/dark mode
- [ ] Status bar shows at bottom
- [ ] All elements responsive (no overflow)

### Examples Gallery
- [ ] "Examples" button visible
- [ ] Click opens examples gallery
- [ ] Three examples display (Hello World, Todo, Full-Stack)
- [ ] Click example loads code into editor
- [ ] "Hide Examples" closes gallery

### Theme Switching
- [ ] Toggle switches between light/dark
- [ ] All UI elements adapt to theme
- [ ] Theme persists on refresh
- [ ] No visual glitches during switch

---

## ✅ Milestone 2: Language Integration Tests

### Real-Time Analysis
- [ ] Network shows POST to `/api/analyze` after typing
- [ ] Debounce works (requests only after 500ms pause)
- [ ] Response shows diagnostics array
- [ ] Parse time displayed (~1ms)

### Error Detection
- [ ] Delete "app" from line 1
- [ ] Wait 500ms
- [ ] Red squiggly line appears
- [ ] Hover shows error message
- [ ] Error appears in status bar
- [ ] Error count increments

### Error Resolution
- [ ] Type "app HelloWorld" back
- [ ] Wait 500ms
- [ ] Red squiggly disappears
- [ ] Blue squiggly may appear (info)
- [ ] Status bar shows "No Problems" or "0 errors"

### Unclosed String Detection
- [ ] Type `"unclosed string` on any line
- [ ] Wait 500ms
- [ ] Red squiggly appears
- [ ] Hover shows "Unclosed string literal"
- [ ] Error listed in problems panel

### Status Bar Metrics
- [ ] Error count displays correctly
- [ ] Warning count displays (if any)
- [ ] Parse time shows (~1ms)
- [ ] Character count updates live
- [ ] Line count updates live
- [ ] Status changes (Analyzing → Ready/Error)

### Problems Panel
- [ ] Click "Show Problems" button
- [ ] Panel appears below editor
- [ ] Lists all diagnostics
- [ ] Filter buttons work (All, Errors, Warnings, Info)
- [ ] Shows correct counts
- [ ] Error badge shows on toggle button
- [ ] "Hide Problems" closes panel

---

## ✅ Milestone 3: Preview & Export Tests

### Preview Generation
- [ ] Preview panel shows on right side
- [ ] Network shows POST to `/api/preview`
- [ ] HTML generates after 1 second pause
- [ ] Preview displays in iframe
- [ ] Beautiful gradient design visible
- [ ] Application name displays correctly

### Preview Content Extraction
- [ ] Text elements from code appear in preview
- [ ] Buttons from code appear as styled buttons
- [ ] Views listed as badges
- [ ] Data models shown with icons
- [ ] Actions listed with indicators
- [ ] Empty state shows if no content

### Device Modes
- [ ] Click Mobile (📱) button
- [ ] Preview resizes to 375x667
- [ ] Click Tablet (📲) button
- [ ] Preview resizes to 768x1024
- [ ] Click Desktop (🖥️) button
- [ ] Preview fills available space
- [ ] Transitions are smooth (300ms)

### Preview Updates
- [ ] Change code in editor
- [ ] Wait 1 second
- [ ] Preview updates automatically
- [ ] Loading indicator shows briefly
- [ ] "Live" badge displays when ready
- [ ] Manual refresh button works

### Preview Error Handling
- [ ] Create invalid code
- [ ] Preview handles gracefully
- [ ] Error message displays if needed
- [ ] No console errors (except analytics blocks)

---

## 🔍 Integration Tests

### Full Workflow Test
1. [ ] Open playground
2. [ ] Load "Hello World" example
3. [ ] Preview generates automatically
4. [ ] Modify code (add button)
5. [ ] Wait for analysis (500ms)
6. [ ] Wait for preview (1000ms)
7. [ ] New button appears in preview
8. [ ] No errors in console
9. [ ] All metrics update correctly

### Error Workflow Test
1. [ ] Delete "app" declaration
2. [ ] Wait 500ms
3. [ ] Red squiggly appears
4. [ ] Status bar shows error
5. [ ] Click "Show Problems"
6. [ ] Error listed in problems panel
7. [ ] Add "app" back
8. [ ] Wait 500ms
9. [ ] Error clears everywhere
10. [ ] Preview regenerates

### Theme + Device Mode Test
1. [ ] Switch to dark theme
2. [ ] All UI adapts
3. [ ] Switch to mobile preview
4. [ ] Preview resizes
5. [ ] Switch back to light theme
6. [ ] Preview remains mobile
7. [ ] Everything functions correctly

---

## 🎯 Performance Tests

### No Lag
- [ ] Type continuously for 30 seconds
- [ ] No lag or stuttering
- [ ] Editor remains responsive
- [ ] Debounce prevents API spam

### API Performance
- [ ] Analysis completes in <10ms
- [ ] Preview generates in <100ms
- [ ] No memory leaks (check DevTools)
- [ ] Network requests reasonable

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Edge
- [ ] Works in Firefox
- [ ] Works in Safari (if available)

---

## 🐛 Edge Cases

### Empty Code
- [ ] Delete all code
- [ ] Status shows appropriate message
- [ ] Preview shows empty state
- [ ] No errors thrown

### Very Long Code
- [ ] Paste 500+ lines of code
- [ ] Editor handles smoothly
- [ ] Analysis completes
- [ ] Preview generates
- [ ] No performance issues

### Rapid Theme Switching
- [ ] Toggle theme rapidly 5 times
- [ ] No visual glitches
- [ ] Everything remains functional

### Rapid Device Mode Switching
- [ ] Click all device modes rapidly
- [ ] Transitions smooth
- [ ] No broken states

---

## ✅ Final Verification

### No Console Errors
- [ ] Check console for errors
- [ ] Only acceptable: analytics blocks (ERR_BLOCKED_BY_CLIENT)
- [ ] No React warnings
- [ ] No network errors (except analytics)

### All Features Working
- [ ] Editor: ✅
- [ ] Analysis: ✅
- [ ] Diagnostics: ✅
- [ ] Status Bar: ✅
- [ ] Problems Panel: ✅
- [ ] Preview: ✅
- [ ] Device Modes: ✅
- [ ] Examples: ✅
- [ ] Theme Switching: ✅

### Ready for Production
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] UI polished
- [ ] Documentation complete

---

## 📊 Test Results

**Date Tested:** _______________  
**Tested By:** _______________  
**Browser:** _______________  
**Pass Rate:** _____/_____ (___%)

**Critical Issues Found:** _______________  
**Minor Issues Found:** _______________  
**Status:** [ ] PASS [ ] FAIL [ ] NEEDS WORK

---

## 🎉 Success Criteria

For the playground to be considered production-ready:
- ✅ All Milestone 1 tests pass
- ✅ All Milestone 2 tests pass
- ✅ All Milestone 3 tests pass
- ✅ No critical bugs
- ✅ Performance acceptable
- ✅ Cross-browser compatible

**If all criteria met:** READY FOR DEPLOYMENT 🚀
