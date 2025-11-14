# ShepLang E2E Testing Pipeline Documentation

This document describes the End-to-End (E2E) testing pipeline for ShepLang, created as part of Phase 2.5 by the Integration Tester agent.

## Overview

The E2E pipeline ensures that the entire ShepLang system works correctly from end to end, testing:

1. The parser
2. The transpiler 
3. The runtime
4. The CLI interface

## Pipeline Components

### 1. E2E Tests (`test/e2e/run-e2e.mjs`)

Tests the full ShepLang workflow from source code to transpiled output, validating:
- File existence
- Content correctness
- Basic functionality

### 2. Snapshot Tests (`test/snapshots/snapshot-test.mjs`)

Ensures output stability by comparing generated code with approved snapshots:
- Detects unintended changes in compiler output
- Maintains baseline behavior
- Supports snapshot updates when intentional changes are made

### 3. CI Integration (`.github/workflows/e2e-tests.yml`)

GitHub Actions workflow that runs on push/PR to ensure quality:
- Runs on multiple Node.js versions (16.x, 18.x, 20.x)
- Installs dependencies
- Builds all packages
- Runs unit tests
- Runs E2E tests
- Runs snapshot tests
- Uploads artifacts for debugging

### 4. Pipeline Runner (`test/e2e/e2e-runner.js`)

Orchestrates the entire test suite:
- Runs unit tests
- Builds packages
- Runs E2E tests
- Runs snapshot tests
- Generates DX metrics
- Produces a consolidated report

## Usage

Run individual components:

```bash
# Run E2E tests only
pnpm test:e2e

# Run snapshot tests only
pnpm test:snapshots

# Run the full pipeline locally
pnpm test:all

# Run for CI with stricter failure conditions
pnpm test:ci
```

## Test Fixtures

- `test/fixtures/todo.test.shep` - Sample ShepLang file for testing
- `test/snapshots/baselines/*.snap` - Approved output snapshots

## Reports

The pipeline generates the following reports:

1. E2E test results (pass/fail)
2. Snapshot comparison results
3. DX metrics in `.shep/reports/dx-metrics.json`
4. Consolidated report in `.shep/reports/e2e/e2e-report.json`

## Adding New Tests

To add a new test case:

1. Add a ShepLang test file in `test/fixtures/`
2. Add a test case to `TEST_CASES` array in `run-e2e.mjs`
3. Generate initial snapshots with `pnpm test:snapshots --update`
4. Verify the test passes with `pnpm test:e2e`

## Troubleshooting

If tests fail:

1. Check `.shep/diffs/` for snapshot comparison failures
2. Look at CI artifacts for detailed logs
3. Run tests with `--verbose` flag for more output
4. Check `.shep/reports/` directory for detailed error reports
