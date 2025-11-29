# Contributing to ShepLang

Thank you for your interest in contributing to ShepLang! We're building this **with the community, for the community**. Whether you're a vibe coder, a seasoned dev, or just curious about AI-assisted development, there's a place for you here.

**Our mission:** Enable anyone to ship verified software.

---

## 📋 Table of Contents

- [Ways to Contribute](#-ways-to-contribute)
- [Safe Zones (Where to Start)](#-safe-zones-where-to-start)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Code Style](#-code-style)
- [Need Help?](#-need-help)

---

## 🎯 Ways to Contribute

**You don't have to write code to contribute!**

| Type | Examples | Skill Level |
|------|----------|-------------|
| 🐛 **Bug Reports** | Found something broken? Tell us! | Any |
| 💡 **Ideas** | Feature suggestions, use cases | Any |
| 📝 **Documentation** | Fix typos, improve guides, add examples | Beginner |
| 🎨 **Examples** | Add `.shep` example files | Beginner |
| 🔧 **Code** | Bug fixes, new features | Intermediate+ |
| 🌍 **Spread the Word** | Blog posts, talks, tweets | Any |
| ⭐ **Star the Repo** | Helps visibility! | Any |

---

## 🟢 Safe Zones (Where to Start)

These areas are **safe for beginners** - you won't break anything critical.

### Easy Wins (No Approval Needed)
| Area | What to Do |
|------|-----------|
| `examples/` | Add new `.shep` example files |
| `docs/` | Fix typos, improve explanations |
| `playground-vite/src/components/` | UI improvements |
| `test/` | Add more test cases |
| README files | Clarify setup instructions |

### Coordinate First (Ping maintainers)
| Area | Why |
|------|-----|
| `sheplang/packages/language/src/shep.langium` | Grammar changes affect everything |
| `sheplang/packages/verifier/src/` | Core verification logic |
| `extension/src/dashboard/` | Dashboard architecture |

### 🏷️ Look for These Labels
- [`good first issue`](https://github.com/Radix-Obsidian/Sheplang/labels/good%20first%20issue) - Perfect for first-time contributors
- [`help wanted`](https://github.com/Radix-Obsidian/Sheplang/labels/help%20wanted) - We'd love community help
- [`documentation`](https://github.com/Radix-Obsidian/Sheplang/labels/documentation) - No code required

---

## 🚀 Getting Started

### 1. Fork the Repository

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Sheplang.git
cd Sheplang
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

- 💬 [GitHub Discussions](https://github.com/Radix-Obsidian/Sheplang/discussions) - Ask questions, share ideas
- 🐛 [GitHub Issues](https://github.com/Radix-Obsidian/Sheplang/issues) - Report bugs, request features
- 🐦 [@ShepLangAI](https://twitter.com/ShepLangAI) - Follow for updates

### Response Times
- **Issues:** We try to respond within 48 hours
- **PRs:** Initial review within 1 week
- **Questions:** Usually same day in Discussions

---

## 🙏 Recognition

We use [All Contributors](https://allcontributors.org/) to recognize everyone who helps - not just code contributions!

Every contributor gets:
- Listed in our README
- Credited in release notes
- Our eternal gratitude 🐑

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

**ShepLang is open core:** The core language, verifier, and extension are MIT-licensed and will always be free. Future team/enterprise features may be proprietary, but we'll never move an open source feature to a paid tier.

---

## 🤝 Our Promise to Contributors

1. **Your work stays open** - Features you contribute to open source will never be moved to paid tiers
2. **Credit where due** - You'll always be recognized for your contributions
3. **No gatekeeping** - We welcome contributors of all skill levels
4. **Honest feedback** - We'll tell you if we can't accept something, and why

---

**Thank you for making ShepLang better!** 🐑✨

*Built by the community, for the community.*
