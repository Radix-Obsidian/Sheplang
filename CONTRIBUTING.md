# Contributing to ShepLang

Thank you for your interest in contributing to ShepLang! This document provides guidelines for contributing to the project.

## 🎯 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repo (helps visibility!)

## 🚀 Getting Started

### 1. Fork the Repository

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Sheplang-BobaScript.git
cd Sheplang-BobaScript
```

### 2. Install Dependencies

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 3. Build and Test

```bash
# Build all packages
pnpm -w -r build

# Run all tests
pnpm -w -r test

# Run verification suite
pnpm run verify
```

## 📋 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

### 3. Test Your Changes

```bash
# Run tests
pnpm -w -r test

# Run verification
pnpm run verify

# Test specific package
pnpm --filter @sheplang/language test
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat(language): add support for async actions"

# Bug fix
git commit -m "fix(verifier): correct null safety check for optional fields"

# Documentation
git commit -m "docs: update installation instructions"
```

**Commit Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 🎨 Code Style

### TypeScript

- Use TypeScript strict mode
- Add type annotations for public APIs
- Use ESM imports with `.js` extensions
- No `any` types unless absolutely necessary

### Testing

- Use Vitest
- Test file pattern: `*.test.ts`
- Aim for 80%+ coverage

## 📞 Need Help?

- 💬 [GitHub Discussions](https://github.com/Radix-Obsidian/Sheplang-BobaScript/discussions)
- 🐛 [GitHub Issues](https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making ShepLang better!** 🐑✨
