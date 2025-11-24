# ShepLang Repository Cleanup Plan

**Date:** November 23, 2025  
**Status:** ✅ **PLANNED**

## Overview

Following the GOLDEN RULE workflow, we'll systematically clean up the root directory of the ShepLang repository to improve organization and maintainability. The plan involves:

1. **Identifying Unnecessary Files** - Test scripts and markdown files no longer needed
2. **Organizing Archive Structure** - Creating appropriate folders in the archive location
3. **Moving Files Safely** - Preserving git history while cleaning up
4. **Documenting Changes** - Ensuring all moves are well-documented

## Archive Location Structure

```
ShepLang-Archive/
├── test-scripts/       # Old test scripts
│   ├── phase1/
│   ├── phase2/
│   ├── phase3/
│   ├── phase4/
│   └── phase5/
├── documentation/      # Old markdown files
│   ├── specifications/
│   ├── reports/
│   └── planning/
└── experiments/        # Experimental code that didn't make it to production
```

## Files to Archive

### Root Test Scripts (Move to ShepLang-Archive/test-scripts/)

1. **Phase-specific tests**
   - `test-phase*.js` files - Group by phase number
   - `debug-phase*.js` files - Group by phase number

2. **Generic test scripts**
   - `test-*.js` files that don't relate to current testing workflow
   - `debug-*.js` files used for one-off debugging

3. **Legacy scripts**
   - `generate-app.js`
   - `simple-smoke-test.cjs`
   - `smoke-test-guide.md`
   - Various other standalone test scripts

### Documentation Files (Move to ShepLang-Archive/documentation/)

1. **Completed project reports**
   - `PHASE_1_COMPLETION_REPORT.md`
   - `DATABASE_INTEGRATION_COMPLETE.md`

2. **Planning documents superseded by newer versions**
   - Older specification documents
   - Historical planning files

### Rules for What to Keep

1. **Keep Active Development Files**
   - Core package source code
   - Current build and configuration files
   - Active example files
   - Important documentation like README.md

2. **Keep Critical Infrastructure Files**
   - Package manifest files (package.json, pnpm-workspace.yaml)
   - GitHub workflow files
   - Configuration files (.gitignore, tsconfig.json)

3. **Keep Current Documentation**
   - Files referenced in active documentation
   - Recent completion reports and implementation documents
   - Files used for current demonstration

## Implementation Plan

1. **Phase 1: Inventory**
   - Create a complete inventory of all files in the root directory
   - Categorize each file as keep/archive

2. **Phase 2: Archive Structure Setup**
   - Create the archive directory structure
   - Set up appropriate subdirectories for different file types

3. **Phase 3: File Migration**
   - Move test scripts to their appropriate locations
   - Move documentation files to their appropriate locations
   - Update any references to these files if needed

4. **Phase 4: Verification**
   - Verify that all essential functionality still works
   - Run tests to ensure nothing critical was removed
   - Check that repository structure is clean and logical

## Expected Results

After cleanup, the repository root should:
- Contain only essential files
- Have a cleaner directory structure
- Be more navigable for contributors
- Maintain all important functionality
- Have better organization of historical assets

## Impact Analysis

- No impact on active code or functionality
- Improved developer experience for new contributors
- Better focus on current development priorities
- Preserved historical artifacts in organized structure
- Cleaner GitHub repository presentation

## Execution Timeline

This cleanup can be executed as a single commit with comprehensive documentation of all moves to ensure clarity for all team members.

**Note:** Files will be moved, not deleted, to ensure preservation of all content.
