# Playground Commands

**⚠️ IMPORTANT: All playground commands must be run from THIS directory (`playground/`)**

## Development

```bash
# Start dev server at localhost:3000
pnpm dev
```

## Testing

```bash
# Run tests once
pnpm test

# Watch mode (auto-runs on changes)
pnpm test:watch

# With coverage report
pnpm test:coverage

# TypeScript type check
pnpm typecheck
```

## From Root Directory

If you're in the root `Sheplang/` directory, use these:

```bash
# Start playground dev server
pnpm run dev:playground

# Run playground tests
pnpm run test:playground

# Watch mode
pnpm run test:playground:watch

# Coverage
pnpm run test:playground:coverage
```

## Quick Start

```bash
# 1. Navigate here
cd playground

# 2. Start dev server
pnpm dev

# 3. In another terminal (also from playground/)
pnpm test:watch
```

## Current Status

- ✅ Dev server: http://localhost:3000
- ✅ Tests: 18/18 passing
- ✅ Build: Clean
- ✅ All examples working

## Troubleshooting

### "Command not found"
Make sure you're in the `playground/` directory:
```bash
pwd  # Should show: .../Sheplang/playground
```

### Dev server not starting
```bash
# Kill any existing process
# Then restart
pnpm dev
```

### Tests failing
```bash
# Clear cache and reinstall
rm -rf node_modules
pnpm install
pnpm test
```
