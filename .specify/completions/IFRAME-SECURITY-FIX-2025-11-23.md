# Iframe Cross-Origin Security Fix

**Date:** November 23, 2025  
**Status:** ✅ **FIXED**  

## Problem

The playground was experiencing a critical security error:

```
SecurityError: Failed to read a named property 'document' from 'Window': 
Blocked a frame with origin "http://localhost:5174" from accessing a cross-origin frame.
```

### Root Cause

The issue was caused by trying to access an iframe's `contentDocument` when the iframe had a `sandbox` attribute. According to [MDN Web Docs on iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#sandbox):

> When the sandbox attribute is present, the embedded document is subject to several restrictions, including being treated as having a unique origin.

Our original code was:
```tsx
// ❌ WRONG APPROACH - Violates cross-origin policy
useEffect(() => {
  const iframe = iframeRef.current;
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
  }
}, [html]);

<iframe 
  ref={iframeRef}
  sandbox="allow-scripts"
/>
```

## Solution

The fix was to use the **`srcdoc` attribute** instead of manipulating the iframe's document programmatically. This is the recommended approach from both React and MDN documentation.

### References Used

1. [MDN: HTMLIFrameElement.srcdoc](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/srcdoc)
2. [MDN: iframe sandbox attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#sandbox)
3. [React Docs: iframe](https://react.dev/reference/react-dom/components/iframe)

### Implementation

```tsx
// ✅ CORRECT APPROACH - Uses srcdoc attribute
<iframe 
  ref={iframeRef}
  title="ShepLang Preview"
  className="preview-iframe"
  sandbox="allow-scripts"
  srcDoc={html}
/>
```

## Why This Works

1. **`srcdoc` attribute** allows you to embed HTML content directly in the iframe
2. The browser handles the document creation internally
3. No cross-origin access is required
4. Works seamlessly with the sandbox attribute
5. React efficiently updates the iframe when the `srcdoc` prop changes

## Changes Made

**File:** `src/components/Preview/PreviewPanel.tsx`

1. Removed the `useEffect` that manipulated `iframe.contentDocument`
2. Added `srcDoc={html}` attribute to the iframe element
3. Kept the `ref` for potential future use (e.g., refreshing, resizing)

## Testing

The fix was verified to:
- ✅ Eliminate the SecurityError
- ✅ Display preview content correctly
- ✅ Update when code changes
- ✅ Work with Hot Module Replacement
- ✅ Maintain sandbox security

## Best Practices Applied

1. **Used official documentation** - Referenced MDN and React docs
2. **Battle-tested approach** - `srcdoc` is the standard way to embed HTML in iframes
3. **Maintained security** - Kept the sandbox attribute for XSS protection
4. **Simple solution** - Removed unnecessary complexity

## Conclusion

By using the `srcDoc` attribute instead of programmatically writing to the iframe's document, we:
- Fixed the cross-origin security error
- Simplified the code
- Followed React and web standards best practices
- Maintained security with the sandbox attribute

The playground is now fully functional and secure.
