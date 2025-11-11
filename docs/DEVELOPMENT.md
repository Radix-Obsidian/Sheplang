# ShepLang Development Guide

This guide explains how to set up and use ShepLang development environment with pnpm.

## Getting Started

ShepLang uses pnpm for package management, which provides faster installs and better monorepo support. Follow these steps to get started:

### First-time Setup

We've created a simple setup script that handles everything for you:

```bash
# From the repository root:
node scripts/setup-pnpm.js
```

This will:
1. Install pnpm if it's not installed
2. Configure pnpm for optimal performance
3. Install dependencies
4. Optionally build the project

### Manual Setup

If you prefer to set things up manually:

1. Install pnpm:
   ```bash
   npm install -g pnpm
   ```
   
   Or on Windows PowerShell:
   ```powershell
   iwr https://get.pnpm.io/install.ps1 -useb | iex
   ```
   
   Or on macOS with Homebrew:
   ```bash
   brew install pnpm
   ```

2. Install dependencies:
   ```bash
   cd sheplang
   pnpm install
   ```

3. Build the project:
   ```bash
   pnpm build
   ```

## Daily Development Workflow

After setup, use these commands for development:

```bash
# Start dev server with HMR
pnpm dev examples/todo.shep

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Run the ShepLang CLI
pnpm shep <command>
```

## Troubleshooting pnpm Issues

If you encounter issues with pnpm, we've included several utilities to help:

### Check Environment

Verify your development environment is correctly set up:

```bash
pnpm check-env
```

This checks for:
- Node.js and pnpm versions
- Required project files
- Node modules installation

### Fix Installation Problems

If you have issues with dependencies or pnpm:

```bash
pnpm fix-install
```

This interactive utility will guide you through recovery options:
- Basic: Clears caches and retries installation
- Intermediate: Removes node_modules and lockfile, then reinstalls
- Thorough: Complete cleanup and fresh install

### Clean Slate

If you want to start with a completely clean environment:

```bash
pnpm fresh
```

This will:
1. Remove all node_modules folders in the workspace
2. Clear build caches
3. Perform a fresh installation

### Verify Lockfile

Ensure the lockfile is in sync with package.json:

```bash
pnpm verify-lockfile
```

## CI/CD Integration

Our CI pipelines are configured to work seamlessly with pnpm. The setup includes:

1. Installing pnpm in CI environments
2. Caching dependencies for faster builds
3. Strict lockfile verification
4. Parallel test execution

## Performance Tips

To optimize your development experience with pnpm:

1. **Use the Store**: pnpm's content-addressable store reduces disk usage and speeds up installs:
   ```bash
   pnpm store status
   ```

2. **Optimize Hoisting**: If you encounter compatibility issues with packages expecting node_modules structure:
   ```bash
   pnpm install --shamefully-hoist
   ```

3. **Use Offline Mode**: Speed up installs by using cached packages:
   ```bash
   pnpm install --prefer-offline
   ```

4. **Filter Commands**: Target specific packages for faster operations:
   ```bash
   pnpm --filter @sheplang/cli build
   ```

## Keeping pnpm Updated

Stay on the latest version for best performance and compatibility:

```bash
pnpm add -g pnpm
```

## Need Help?

If you need further assistance with pnpm or the development environment, you can:
1. Run `pnpm fix-install` for guided recovery
2. Check the [pnpm documentation](https://pnpm.io/)
