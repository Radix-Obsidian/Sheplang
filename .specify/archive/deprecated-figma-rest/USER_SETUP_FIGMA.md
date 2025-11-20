# Your Setup Instructions - Figma Plugin Development

**What you need to do:** Set up Figma plugin development environment  
**Time needed:** 15 minutes  
**Requires:** Figma Desktop (you already have ✅)

---

## Step 1: Create Plugin Development Folder

### In Figma Desktop:

1. **Open Figma Desktop App**

2. **Go to Menu:**
   - Click: **Figma (top left)** → **Plugins** → **Development** → **New Plugin...**

3. **Configure Plugin:**
   - **Template:** Select **"With custom UI"**
   - **Plugin Name:** `ShepLang Export`
   - **Save Location:** `C:\Users\autre\Desktop\figma-shep-plugin`

4. **Figma will auto-generate:**
   ```
   figma-shep-plugin/
   ├── manifest.json      ← Plugin configuration
   ├── code.ts           ← Main logic (we'll replace this)
   ├── ui.html           ← Plugin UI (we'll replace this)
   └── tsconfig.json     ← TypeScript config
   ```

**Official Guide:** https://help.figma.com/hc/en-us/articles/360042786733-Create-a-plugin-for-development

---

## Step 2: Install Dependencies

### Open PowerShell/Terminal:

```powershell
cd C:\Users\autre\Desktop\figma-shep-plugin
npm init -y
npm install --save-dev @figma/plugin-typings typescript
```

**What this does:**
- `@figma/plugin-typings` - Official TypeScript types for Figma API
- `typescript` - TypeScript compiler

---

## Step 3: Get/Create Test Figma File

### Option A: Use Simple Test (Recommended)

**Create a new Figma file with:**

**Frame 1: "TaskList"**
- Add text: "My Tasks"
- Add rectangle (represents task card)
- Add another rectangle with text "Add Task" (represents button)

**Frame 2: "CreateTask"**
- Add text: "New Task"
- Add rectangle (represents input field)
- Add rectangle with text "Save" (represents button)

**Save as:** "ShepLang Test App"

### Option B: Use Community Template

1. Go to: https://www.figma.com/community/
2. Search: "todo app template" or "task list"
3. Click any simple template
4. Click "Duplicate" (saves to your Drafts)
5. Open the duplicated file

### What We Need:

- ✅ At least 2 frames (representing different screens)
- ✅ Some text elements
- ✅ Some rectangular components (buttons, cards)
- ✅ Simple, not super complex
- ✅ Frame names should be descriptive (e.g., "TaskList", "AddTask")

---

## Step 4: Enable Plugin in Your Test File

1. **Open your test Figma file**

2. **Run your plugin:**
   - Go to: **Figma Menu** → **Plugins** → **Development** → **ShepLang Export**

3. **Plugin opens in sidebar →** You'll see default UI (we'll replace this)

4. **Keep file open** - we'll use it for testing

---

## Step 5: Development Setup (Optional but Recommended)

### Enable TypeScript Watch Mode:

In `figma-shep-plugin` folder, add to `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  }
}
```

Run in separate terminal:
```powershell
cd C:\Users\autre\Desktop\figma-shep-plugin
npm run watch
```

**This auto-compiles TypeScript on save.**

---

## Step 6: Verify Setup

### Check that these exist:

- [x] `C:\Users\autre\Desktop\figma-shep-plugin\` folder
- [x] `manifest.json`, `code.ts`, `ui.html` files inside
- [x] `node_modules/@figma/plugin-typings` folder exists
- [x] Test Figma file is open
- [x] Plugin shows in Figma sidebar

### If everything checks out ✅

**You're ready!** Tell me and we'll start building the plugin code.

---

## FAQ: Do I Need...?

### ❌ **Figma API Token?**
**NO.** Plugins run inside Figma Desktop and have direct access. No authentication needed for development.

### ❌ **Figma Developer Account?**
**NO.** Your regular Figma account works. Development mode is free.

### ❌ **Publish to Figma Community?**
**NOT YET.** We'll test locally first. Publishing comes later after everything works.

### ✅ **Node.js?**
**YES.** For TypeScript compilation. You likely already have this.

### ✅ **Figma Desktop?**
**YES.** You already have this ✅

---

## Troubleshooting

### "New Plugin" option is grayed out

**Solution:** Make sure you're using **Figma Desktop**, not Figma in browser. Plugins can only be developed in the desktop app.

### Can't find the plugin in menu after creating

**Solution:**
1. Close and reopen Figma Desktop
2. Go to: Plugins → Development → [Your Plugin Name]

### TypeScript errors when running `npm run build`

**Solution:**
```powershell
npm install --save-dev @figma/plugin-typings
```

### Plugin doesn't update after code changes

**Solution:**
1. In Figma: Right-click on plugin → **"Reload Plugin"**
2. Or close plugin sidebar and reopen it

---

## What Happens Next

**Once you confirm setup is complete:**

1. **I'll create the plugin code** (code.ts and ui.html)
2. **You'll copy it** to your plugin folder
3. **We'll test** with your Figma file
4. **Iterate** until it exports correct JSON
5. **Verify** with our bridge package
6. **Test** end-to-end (Figma → .shep → running app)
7. **Add VS Code integration**
8. **Final testing** (100% pass)
9. **Commit** to monorepo

---

## Quick Reference

**Plugin Folder:** `C:\Users\autre\Desktop\figma-shep-plugin`

**Test in Figma:**
1. Make code changes
2. Save files
3. In Figma: Right-click plugin → Reload Plugin
4. Test functionality

**See Console Logs:**
- In Figma: Right-click plugin → Open Developer Console

**Official Figma Plugin Docs:**
- Main Guide: https://www.figma.com/plugin-docs/
- API Reference: https://www.figma.com/plugin-docs/api/api-reference/

---

**Status:** Waiting for your confirmation that setup is complete! 🚀

Let me know when you have:
- ✅ Plugin folder created
- ✅ Dependencies installed
- ✅ Test Figma file ready
- ✅ Plugin shows in Figma sidebar
