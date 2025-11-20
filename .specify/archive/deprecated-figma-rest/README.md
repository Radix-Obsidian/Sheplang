# Deprecated: Figma REST Import Approach

**Date Deprecated:** November 20, 2025  
**Reason:** Strategic pivot to structured code imports (Figma Make, Lovable, Webflow)

## Why We Moved Away

The Figma REST API approach had fundamental limitations:

1. **No semantic meaning** - API only returns visual structure (frames, shapes, text)
2. **Heuristics don't scale** - Every design pattern needs custom detection
3. **Poor results** - UI kits, component libraries, non-standard designs all failed
4. **Hardcoding required** - Would need to hardcode for every design type

## The Better Path

**Figma Make** exports structured React/TypeScript code, which is perfect for our Next.js importer. No heuristics needed, works for any Figma Make project.

## What's Archived Here

- REST API research and specs
- Wizard implementations (concept reused in Next.js importer)
- Plugin specs (decided against manual tagging)
- Implementation details and debug logs

## Historical Context

This approach was valuable research that led us to the right solution. The wizard concept (semantic refinement after import) lives on in the Next.js importer.

## Migration

If you were using Figma REST import:
1. Recreate your design in Figma Make (or use existing)
2. Export code from Figma Make
3. Use our Next.js importer

## Questions?

See `.specify/STRATEGIC_PIVOT_IMPORT_FLOW.md` for the new strategy.
