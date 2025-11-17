# VSCode Extension Setup Guide

## ✅ What Was Created

### Directory Structure
```
extension/
├── src/
│   ├── extension.ts              # ✅ Entry point with activation
│   ├── server/
│   │   ├── server.ts            # ✅ LSP server
│   │   ├── completions.ts       # ✅ Code completion
│   │   ├── hover.ts             # ✅ Hover documentation
│   │   ├── diagnostics.ts       # ✅ Error detection
│   │   └── verification.ts      # ✅ ShepVerify placeholder
│   ├── commands/
│   │   ├── preview.ts           # ✅ Preview command
│   │   ├── newProject.ts        # ✅ New project from template
│   │   └── restartBackend.ts    # ✅ Restart backend
│   ├── providers/
│   │   ├── previewProvider.ts   # ✅ Preview webview provider
│   │   └── definitionProvider.ts # ✅ Go to definition
│   └── services/
│       ├── bridgeService.ts     # ✅ Frontend-backend bridge
│       ├── runtimeManager.ts    # ✅ ShepThon runtime lifecycle
│       └── verificationService.ts # ✅ Verification engine
├── syntaxes/
│   ├── sheplang.tmLanguage.json # ✅ ShepLang syntax highlighting
│   └── shepthon.tmLanguage.json # ✅ ShepThon syntax highlighting
├── snippets/
│   ├── sheplang.json            # ✅ ShepLang code snippets
│   └── shepthon.json            # ✅ ShepThon code snippets
├── .vscode/
│   ├── launch.json              # ✅ Debug configuration
│   └── tasks.json               # ✅ Build tasks
├── media/
│   └── icon.png                 # ✅ Extension icon (placeholder)
├── package.json                  # ✅ Extension manifest
├── tsconfig.json                 # ✅ TypeScript config
├── language-configuration.json   # ✅ Language features
├── .vscodeignore                # ✅ Package exclusions
├── .gitignore                   # ✅ Git exclusions
├── README.md                    # ✅ Extension documentation
└── SETUP.md                     # ✅ This file
```

## 🚀 Quick Start

### Step 1: Install Dependencies

From the **monorepo root** (`/sheplang`):

```bash
cd sheplang
pnpm install
```

This installs dependencies for ALL packages including the extension.

### Step 2: Build the Extension

From `/extension`:

```bash
cd ../extension
pnpm run compile
```

This compiles TypeScript to JavaScript in the `out/` directory.

### Step 3: Open in VSCode

```bash
code .
```

Open the extension folder in VSCode.

### Step 4: Run Extension

1. Press **F5** (or click **Run > Start Debugging**)
2. A new "Extension Development Host" window opens
3. Test the extension:
   - Create a `.shep` file
   - Type `app` and see syntax highlighting
   - Try code completion (Ctrl+Space)
   - Hover over keywords
   - Run command: "ShepLang: New Project"

## 🧪 Testing Features

### Syntax Highlighting
1. Create `test.shep`:
```sheplang
app HelloWorld {
  model Message {
    text: string
  }

  view Home:
    show "Hello, World!"
    button "Click" -> SayHi

  action SayHi:
    show "Hi there!"
}
```

2. Keywords should be colored
3. Strings should be green
4. Comments should be gray

### Code Completion
1. Type `m` and press **Ctrl+Space**
2. Should see `model` completion
3. Select it and tab to fill snippet

### Hover Documentation
1. Hover over keyword like `app`, `model`, `view`
2. Should see documentation popup

### Commands
- **Ctrl+Shift+P** → "ShepLang: New Project"
- Should show template picker
- Select template and folder
- Project files created

## 📦 Package for Distribution

### Build VSIX

```bash
pnpm run package
```

Creates `sheplang-0.1.0.vsix` file.

### Install VSIX

```bash
code --install-extension sheplang-0.1.0.vsix
```

## 🔧 Development Workflow

### Watch Mode

Terminal 1 - Compile on save:
```bash
pnpm run watch
```

Terminal 2 - Run extension:
```bash
# Press F5 in VSCode
```

### Reload Extension

After making changes:
1. In Extension Development Host window
2. Press **Ctrl+R** (Windows/Linux) or **Cmd+R** (Mac)
3. Extension reloads with new changes

## 🐛 Troubleshooting

### "Cannot find module @sheplang/language"

**Solution:** Build the language package first:

```bash
cd sheplang/packages/language
pnpm run build
```

### "Extension not activating"

**Check:**
1. `out/` directory exists and has `.js` files
2. Run `pnpm run compile` if missing
3. Check Debug Console for errors

### Syntax highlighting not working

**Check:**
1. File extension is `.shep` or `.shepthon`
2. Language ID is correct in bottom-right of VSCode
3. Reload window: Ctrl+Shift+P → "Reload Window"

## 📝 Next Steps (Phase 2)

Current implementation is **scaffolding only**. Phase 2 will add:

1. **Live Preview**
   - Webview with BobaScript runtime
   - Real-time transpilation
   - Live updates as you type

2. **ShepThon Runtime**
   - Auto-start backend when opening `.shepthon`
   - Execute endpoints
   - Show job status in status bar

3. **ShepVerify Engine**
   - Cross-file type checking
   - Security policy verification
   - Performance hints

4. **Enhanced LSP**
   - Semantic tokens
   - Rename refactoring
   - Find references
   - Code actions (quick fixes)

## 🎯 Success Criteria

You know it's working when:

- ✅ Syntax highlighting for `.shep` and `.shepthon` files
- ✅ Code completion shows keywords and snippets
- ✅ Hover shows documentation
- ✅ "New Project" command creates project files
- ✅ No errors in Debug Console
- ✅ Extension activates when opening `.shep` file

## 🆘 Need Help?

1. Check Debug Console: **View > Debug Console**
2. Check Output: **View > Output** → Select "ShepLang Language Server"
3. Report issue: https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues

---

**Created:** Nov 16, 2025
**Status:** Phase 1 Complete (Scaffolding)
**Next:** Phase 2 (Runtime Integration)
