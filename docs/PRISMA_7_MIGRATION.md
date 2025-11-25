# Prisma Migration Guide for AST Importer

## Issue
Prisma 7.0 deprecated hardcoded `url` values in datasource blocks and introduced stricter validation in getDMMF(), causing schema parsing failures even for structure-only parsing.

## Solution Applied
1. **Downgraded to @prisma/internals v6.x** for stable schema parsing:
   ```bash
   pnpm add @prisma/internals@6
   ```

2. **Kept existing datasource format** for test fixtures:
   ```prisma
   datasource db {
     provider = "sqlite"
     url = "file:./dev.db"
   }
   ```

3. **Updated DMMF parsing logic** for compatibility:
   ```typescript
   // Check different possible locations for models (Prisma 6.x/7.x compatibility)
   const models = dmmf.models || dmmf.datamodel?.models || [];
   ```

## Real-World Impact
- Current implementation uses @prisma/internals v6.x for stability
- Prisma 7.0 support requires future investigation
- Existing Prisma schemas with hardcoded URLs work with v6.x
- Schema parsing is stable for entity extraction use case

## Future Migration Path
1. **Monitor Prisma 7.x stability** for getDMMF() API
2. **Investigate alternatives**:
   - Prisma config file support
   - getDMMF() options to skip datasource validation
   - Custom schema parsing for model structure only
3. **Upgrade when stable**: When Prisma 7.x provides stable schema-only parsing

## Current Status
- ✅ Schema parsing works with @prisma/internals v6.x
- ✅ All 32 tests passing across Slices 0-3
- ⚠️ Prisma 7.0 support deferred to future slices
- ✅ Entity extraction fully functional

---
*Implemented during Slice 3 with v6.x downgrade for stability*
