# 🐑 ShepYard - Creative Development Sandbox

**A local-first visual IDE for ShepLang development**

ShepYard is an interactive development environment for building applications with ShepLang. It provides a split-screen interface with live preview, code editing, and intelligent explanations—all running locally on your machine.

---

## ✨ Features

### 📝 Code Viewer
- Monaco editor with ShepLang syntax highlighting
- Read-only example browsing
- Clean, distraction-free interface

### 👁️ Live Preview
- Real-time BobaScript rendering
- Interactive component preview
- Route navigation testing
- Action logging

### 💡 Explain Panel
- Human-readable code explanations
- Component/route/data model analysis
- Complexity indicators
- Educational insights

### 🎨 Responsive UI
- Drag-to-resize panels
- Collapsible sidebars
- Auto-save panel preferences
- Focus mode for distraction-free coding

### 🛡️ Production-Ready
- Comprehensive error boundaries
- Graceful error recovery
- 32 passing tests
- Zero console errors

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (Install: `npm install -g pnpm`)

### Installation

```bash
# 1. Clone the repository (if not already)
cd Sheplang

# 2. Install dependencies
cd shepyard
pnpm install

# 3. Start the development server
pnpm dev
```

### Access ShepYard

Open your browser to: **http://localhost:5173**

That's it! 🎉

---

## 📖 Usage

### Browsing Examples

1. **Select an example** from the left sidebar
   - Todo List
   - Dog Care Reminder
   - Multi-Screen Navigation

2. **View the code** in the center panel (Monaco editor)

3. **See the live preview** on the right
   - Component rendering
   - Route navigation
   - Data models

4. **Read the explanation** below the preview
   - App summary
   - Component descriptions
   - Route information

### Customizing Your Workspace

**Resize Panels:**
- Drag the vertical bars between panels
- Panels automatically save your preferred sizes

**Hide/Show Panels:**
- Click "Hide Sidebar" to collapse the left panel
- Click "Hide Preview" to collapse the right panel
- Great for focusing on code!

**Collapse Sections:**
- Click "Live Preview" header to collapse/expand
- Click "Explain" header to collapse/expand

---

## 🏗️ Project Structure

```
shepyard/
├── src/
│   ├── editor/              # Monaco code viewer
│   ├── examples/            # ShepLang example apps
│   ├── errors/              # Error boundary components
│   ├── hooks/               # React hooks (useTranspile)
│   ├── layout/              # Resizable layout system
│   ├── preview/             # BobaScript renderer
│   ├── services/            # Transpiler & explain services
│   ├── test/                # Test suites (32 tests)
│   ├── ui/                  # UI components
│   ├── workspace/           # State management (Zustand)
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── dist/                    # Production build output
├── package.json             # Dependencies & scripts
├── vite.config.ts           # Vite configuration
├── vitest.config.ts         # Test configuration
└── tsconfig.json            # TypeScript config
```

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Building for Production

```bash
# Build optimized bundle
pnpm build

# Output: shepyard/dist/
# - index.html
# - assets/index-[hash].js  (~213 KB gzipped: 68 KB)
# - assets/index-[hash].css (~16 KB gzipped: 3.6 KB)
```

---

## 🧪 Testing

ShepYard has comprehensive test coverage across all phases:

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| Phase 1: Examples & UI | 5 | ✅ Pass |
| Phase 2: Live Preview | 7 | ✅ Pass |
| Phase 3: Explain Panel | 9 | ✅ Pass |
| Phase 4: Stability | 11 | ✅ Pass |
| **Total** | **32** | **100%** |

### Test Categories

- **Component Rendering** - UI components render correctly
- **Transpilation** - ShepLang → BobaScript conversion
- **Error Boundaries** - Graceful error handling
- **Edge Cases** - Null/undefined/malformed data
- **User Interactions** - Click, navigate, resize

---

## 📚 Architecture

### Data Flow

```
User selects example
       ↓
useTranspile hook triggers
       ↓
transpilerService calls adapter
       ↓
ShepLang → BobaScript (AST)
       ↓
BobaRenderer creates React elements
       ↓
explainService analyzes AST
       ↓
UI displays code + preview + explanation
```

### Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **State Management:** Zustand
- **Code Editor:** Monaco Editor
- **UI Layout:** react-resizable-panels
- **Error Handling:** react-error-boundary
- **Testing:** Vitest + Testing Library
- **Styling:** Tailwind CSS

---

## 🔗 Integration with CLI

ShepYard works alongside the ShepLang CLI. They share the same transpiler:

```bash
# CLI transpilation (still works!)
cd sheplang
pnpm run cli transpile examples/todo.shep

# ShepYard transpilation (browser-based)
cd shepyard
pnpm dev
# → Open http://localhost:5173
# → Click "Todo List" example
```

Both use the same `@adapters/sheplang-to-boba` package, ensuring consistency.

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Error: Port 5173 is already in use
# Solution: Kill the existing process or use a different port
pnpm dev --port 3000
```

### Monaco Editor Not Loading

```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

### Transpilation Errors

- Check that the example ShepLang code is valid
- Look at the browser console for detailed errors
- Try a different example to isolate the issue

### Build Failures

```bash
# Clear dist and rebuild
rm -rf dist
pnpm build
```

---

## 📝 Phase Completion Status

- ✅ **Phase 0:** Environment Setup
- ✅ **Phase 1:** Examples & Code Viewer
- ✅ **Phase 2:** Live Preview Renderer
- ✅ **Phase 3:** Explain Panel
- ✅ **Phase 4:** Stability Hardening
- ✅ **Phase 5:** Alpha Release ← **You are here!**

---

## 🚦 Verification

To verify everything is working:

```bash
# From the root of the Sheplang repo
cd Sheplang
pnpm run verify

# Expected output:
# [1/5] Building all packages... ✅
# [2/5] Running all tests... ✅
# [3/5] Transpiling example app... ✅
# [4/5] Starting dev server... ✅
# [5/5] Running explain and stats... ✅
# [6/6] Building ShepYard... ✅
# === VERIFY OK ===
```

---

## 📄 License

Part of the ShepLang ecosystem. See root repository for license details.

---

## 🙏 Acknowledgments

**Built with:**
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) - Layout system
- [react-error-boundary](https://github.com/bvaughn/react-error-boundary) - Error handling
- [Tailwind CSS](https://tailwindcss.com/) - Styling

**Special thanks to:**
- Brian Vaughn (React core team) for resizable-panels and error-boundary
- The ShepLang language design team
- All contributors and testers

---

## 🎯 What's Next?

Future enhancements (not in Alpha scope):
- **Editable code** with live updates
- **Real backend simulation** (ShepThon)
- **AI assistant integration**
- **Export/save functionality**
- **Multi-file support**
- **Deploy to production**

---

**🐑 Happy ShepLang Development!**

For issues, questions, or contributions, please refer to the main ShepLang repository.
