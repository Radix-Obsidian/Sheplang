# Deprecations

## Figma REST Import (Deprecated November 2025)

**Status:** Removed in v1.0.0-alpha

### What Changed

The Figma REST API import feature has been removed in favor of a better approach.

### Why

The Figma REST API only provides visual structure (frames, shapes, text) without semantic meaning. This meant:
- Heuristics failed on UI kits and component libraries
- Results required extensive manual cleanup
- Couldn't handle diverse design patterns
- Would need hardcoding for every new design type

### Better Alternative: Figma Make + Next.js Importer

**Use Figma Make instead:**
1. Design your prototype in Figma Make (with AI)
2. Export as React/TypeScript code
3. Import to ShepLang using "Import from Next.js/React"

**Benefits:**
- Structured, semantic code
- No heuristics needed
- Works for any Figma Make project
- Clean ShepLang output

### Other Supported Import Sources

ShepLang supports imports from multiple no-code/low-code platforms:

- ✅ **Figma Make** (React/TypeScript export)
- ✅ **Lovable** (Next.js projects)
- ✅ **v0.dev** (Vercel AI projects)
- ✅ **Bolt.new** (StackBlitz projects)
- ✅ **Builder.io** (React exports)
- ✅ **Framer** (React code)
- 🔨 **Webflow** (HTML/CSS export - coming soon)

### Migration

If you were using Figma REST import:
1. Recreate your design in Figma Make (or use existing)
2. Export code from Figma Make (.zip file with React/TypeScript)
3. Use "ShepLang: Import from Next.js/React Project" command

### Questions?

Open an issue or join our discussions at: https://github.com/Radix-Obsidian/Sheplang-BobaScript/discussions
