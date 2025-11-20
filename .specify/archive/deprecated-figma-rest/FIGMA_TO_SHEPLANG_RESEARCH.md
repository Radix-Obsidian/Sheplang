# 🎨 Figma to ShepLang - Official Integration Research

**Date:** November 17, 2025  
**Research Focus:** How to officially enable "Figma → ShepLang" conversion  
**Sources:** Figma Official Docs, Vercel v0, Anima, Builder.io, VS Code Integration

---

## 🎯 Executive Summary

**Goal:** Enable users to convert Figma designs into working ShepLang apps

**3 Official Approaches Found:**
1. **Figma Plugin** (like Anima, Builder.io) - Best for designers
2. **VS Code Extension + Figma REST API** (like official Figma for VS Code) - Best for developers
3. **Hybrid: Both** (recommended for maximum reach)

---

## 📚 How Existing Tools Do It

### 1. **Vercel v0** - AI-Powered Figma Import
**Source:** https://vercel.com/blog/working-with-figma-and-custom-design-systems-in-v0

**How It Works:**
- User selects Figma file/frame
- v0 extracts visual context from Figma
- Passes context + visuals to AI generation
- AI generates React/Next.js code with shadcn/ui

**Key Insights:**
- ✅ Break designs into smaller components (not whole pages)
- ✅ Separate: nav bars, sidebars, forms, custom UI components
- ✅ Each component in its own frame
- ✅ Iterative approach: individual components → test → combine
- ✅ AI learns design style over time
- ✅ Supports custom Tailwind config
- ✅ Can use any public npm packages

**Best Practices:**
```
❌ DON'T: Import entire landing page at once
✅ DO: Import button → test → import form → test → combine

Why: Reduces visual context overload for AI
```

---

### 2. **Anima** - Figma Plugin (1.5M+ installs)
**Source:** https://support.animaapp.com/en/articles/11721866-anima-figma-plugin-design-to-code-in-figma

**How It Works:**
- Figma plugin runs in **Dev Mode** or **Design Mode**
- User selects layer/frame/component
- Plugin generates code in real-time
- Supports React, Vue, HTML
- Supports CSS, Tailwind, Styled Components

**Key Features:**
- ✅ Automatic code generation from Figma designs
- ✅ Responsive code with Figma Auto-Layout support
- ✅ AI personalization for custom project needs
- ✅ Pixel-perfect, runnable code
- ✅ Copy code to clipboard
- ✅ Export multiple screens
- ✅ Works in Figma Dev Mode (official Figma partner)

**Technology:**
- **Figma Plugin API** - runs inside Figma
- **Custom code generator** - parses Figma nodes
- **Framework templates** - React/Vue/HTML

---

### 3. **Builder.io** - Multi-Path Figma Integration
**Source:** https://www.builder.io/c/docs/builder-figma-plugin

**How It Works:**
- Figma plugin with **2 export modes:**
  1. **Smart Export** - AI-powered (similar to v0)
  2. **Classic Export** - Direct node-to-code conversion

**Export Options:**
1. Import to Builder Platform (visual CMS)
2. Generate code with Visual Editor
3. Generate code with CLI

**Key Features:**
- ✅ AI code generation
- ✅ AI Auto-Layout
- ✅ Component Set Generation
- ✅ Custom Component Mapping
- ✅ Map Figma components to existing code components
- ✅ Supports any framework (React, Vue, Angular, etc.)

**Best Practices:**
- Use Figma Auto-Layout for best results
- Map components to existing design system
- Customize code output via CLI

---

### 4. **Official Figma for VS Code Extension**
**Source:** https://help.figma.com/hc/en-us/articles/15023121296151-Figma-for-VS-Code

**How It Works:**
- VS Code extension connects to Figma API
- Shows Figma designs inside VS Code
- Provides code snippets
- Allows inspection, comments, assets

**Key Features:**
- ✅ Inspect designs without leaving VS Code
- ✅ View code snippets (CSS, React, etc.)
- ✅ Auto-complete code suggestions
- ✅ Export assets
- ✅ View component properties
- ✅ Comment notifications in real-time
- ✅ Link code files to design components (Dev Resources)
- ✅ Run Figma plugins inside VS Code

**Integration Points:**
- Uses **Figma REST API** for design data
- Displays in VS Code sidebar
- Integrates with Dev Mode
- Can run third-party plugins

---

## 🔧 Technical: How Figma API Works

### **Figma REST API**
**Source:** https://developers.figma.com/docs/rest-api/

**What You Get:**
```json
{
  "document": {
    "id": "0:0",
    "name": "My Design",
    "type": "DOCUMENT",
    "children": [
      {
        "id": "1:2",
        "name": "Page 1",
        "type": "CANVAS",
        "children": [
          {
            "id": "1:3",
            "name": "Frame",
            "type": "FRAME",
            "children": [...],
            "backgroundColor": {...},
            "layoutMode": "HORIZONTAL",
            "primaryAxisAlignItems": "CENTER",
            "counterAxisAlignItems": "CENTER",
            "paddingLeft": 16,
            "paddingRight": 16,
            ...
          }
        ]
      }
    ]
  }
}
```

**Key Capabilities:**
- ✅ Read access to Figma files
- ✅ Extract objects, layers, properties
- ✅ Render designs as images
- ✅ Access file versions
- ✅ GET/POST comments
- ✅ Access team projects

**Authentication:**
- OAuth2 (for user-facing apps)
- Personal Access Tokens (for scripts/tools)

**OpenAPI Spec:**
- Fully documented: https://github.com/figma/rest-api-spec
- TypeScript types available
- Language-agnostic

---

## 🛠️ How to Build a Figma Plugin

### **Official Figma Plugin Development**
**Source:** https://help.figma.com/hc/en-us/articles/360042786733-Create-a-plugin-for-development

**Plugin Templates:**
1. **Default** - Blank slate
2. **Run once** - No UI, single execution
3. **Custom UI** - Interactive UI with browser APIs
4. **Inspect** (Dev Mode) - Inspect designs
5. **Code Generator** (Dev Mode) - Generate code snippets

**Development Flow:**
```bash
# 1. Open Figma Desktop App
# 2. Figma Menu → Plugins → New Plugin
# 3. Select template (e.g., "Code Generator")
# 4. Figma creates plugin directory with:
#    - manifest.json
#    - code.ts (plugin logic)
#    - ui.html (if Custom UI)

# 5. Develop plugin
# 6. Test in Figma
# 7. Publish to Figma Community
```

**Plugin API Access:**
- Full node tree access
- Layer properties
- Styles, components, variables
- Auto-layout data
- Design tokens
- Export capabilities

**Where Plugins Run:**
- Figma Design Mode
- Figma Dev Mode
- FigJam
- Figma Slides

---

## 🎯 Three Paths for ShepLang

### **Option A: Figma Plugin → ShepLang**
**Implementation:** Build a Figma plugin (like Anima)

**How It Works:**
1. User opens Figma design
2. User runs "Export to ShepLang" plugin
3. Plugin parses Figma nodes
4. Plugin generates `.shep` code
5. User copies code or saves file
6. User opens in VS Code with ShepLang extension

**Pros:**
- ✅ Designers can use it directly in Figma
- ✅ No context switching
- ✅ Official Figma integration
- ✅ Can publish to Figma Community (visibility)
- ✅ 1.5M+ users already use design-to-code plugins

**Cons:**
- ⚠️ Requires Figma Desktop App to develop
- ⚠️ Plugin runs in sandbox (limited APIs)
- ⚠️ Separate codebase from VS Code extension

**Tech Stack:**
- TypeScript
- Figma Plugin API
- Node parser → ShepLang AST
- Code generation templates

---

### **Option B: VS Code Extension + Figma REST API**
**Implementation:** Extend ShepLang VS Code extension with Figma import

**How It Works:**
1. User gets Figma file URL or access token
2. User runs "Import from Figma" command in VS Code
3. Extension calls Figma REST API
4. Extension parses JSON response
5. Extension generates `.shep` file
6. File opens in editor

**Pros:**
- ✅ Developers already in VS Code
- ✅ Single codebase (part of ShepLang extension)
- ✅ Full Node.js APIs available
- ✅ Can integrate with ShepVerify
- ✅ Can show live preview immediately

**Cons:**
- ⚠️ Requires Figma API access token
- ⚠️ Less discoverable (not in Figma Community)
- ⚠️ Designers must leave Figma

**Tech Stack:**
- TypeScript
- Figma REST API client
- JSON parser → ShepLang AST
- VS Code Extension API

---

### **Option C: Hybrid (Both Plugin + Extension)**
**Implementation:** Build both, share core logic

**How It Works:**
1. **Shared Core Package:** `@sheplang/figma-to-shep`
   - Parses Figma nodes → ShepLang AST
   - Handles layout → ShepLang view syntax
   - Converts components → ShepLang data models
   - TypeScript, framework-agnostic

2. **Figma Plugin:**
   - Uses core package
   - Runs in Figma
   - Targets designers

3. **VS Code Extension:**
   - Uses core package
   - Runs in VS Code
   - Targets developers

**Pros:**
- ✅ Best of both worlds
- ✅ Maximum reach (designers + developers)
- ✅ Shared conversion logic (DRY)
- ✅ Two launch channels (Figma Community + VS Code Marketplace)
- ✅ Product Hunt can showcase both

**Cons:**
- ⚠️ More initial development effort
- ⚠️ Two distribution channels to maintain

**Sheplang's Approach:** ⭐ This is what Builder.io and v0 do

---

## 🔄 Technical: Figma Node → ShepLang Conversion

### **Example: Figma Frame → ShepLang View**

**Figma JSON:**
```json
{
  "id": "1:3",
  "name": "ContactList",
  "type": "FRAME",
  "children": [
    {
      "id": "1:4",
      "name": "Title",
      "type": "TEXT",
      "characters": "Contacts"
    },
    {
      "id": "1:5",
      "name": "ContactCard",
      "type": "COMPONENT",
      "children": [...]
    }
  ],
  "layoutMode": "VERTICAL",
  "primaryAxisAlignItems": "MIN",
  "counterAxisAlignItems": "MIN",
  "paddingTop": 20,
  "paddingBottom": 20,
  "itemSpacing": 10
}
```

**Generated ShepLang:**
```shep
view ContactList:
  list Contact
  button "Add Contact" action addContact
```

### **Mapping Strategy:**

| Figma Node Type | ShepLang Construct |
|-----------------|-------------------|
| FRAME with list | `view` with `list` |
| TEXT | View title or field label |
| BUTTON (component) | `button` with `action` |
| INPUT (component) | Infer from data model |
| AUTO_LAYOUT vertical | Default ShepLang view layout |
| COMPONENT_SET | Data model variations |

### **AI-Assisted Conversion:**
- Use AI to infer semantic meaning (like v0)
- Figma layer names → ShepLang identifiers
- Button text → action names
- Form fields → data fields
- List components → data models

---

## 🚀 Recommended Implementation Plan

### **Phase 1: Core Package (4 weeks)**
Create `@sheplang/figma-to-shep` library

**Functionality:**
- Parse Figma JSON (REST API response)
- Identify patterns:
  - Forms → `data` models
  - Lists → `view` with `list`
  - Buttons → `action` triggers
  - Fields → `data` fields with types
- Generate ShepLang AST
- Export `.shep` code

**Tech:**
- TypeScript
- Figma REST API types
- Pattern matching algorithms
- Code generation templates

---

### **Phase 2: VS Code Extension Integration (2 weeks)**
Add "Import from Figma" to ShepLang VS Code extension

**Features:**
1. Command: `ShepLang: Import from Figma`
2. Input: Figma file URL or File ID
3. Auth: Prompt for Figma Personal Access Token (store in VS Code settings)
4. Process:
   - Call Figma REST API
   - Use `@sheplang/figma-to-shep` core package
   - Generate `.shep` file
   - Open in editor
5. Optional: AI enhancement with OpenAI API

**UX:**
```
1. User: Cmd+Shift+P → "Import from Figma"
2. VS Code: "Enter Figma file URL or ID"
3. User: https://figma.com/file/abc123...
4. VS Code: Calls Figma API
5. VS Code: Generates app.shep
6. VS Code: Opens file with ShepLang syntax highlighting
7. User: Edits and runs
```

---

### **Phase 3: Figma Plugin (4 weeks)**
Build standalone Figma plugin

**Features:**
1. Plugin UI in Figma
2. Select frame/component
3. Click "Export to ShepLang"
4. Preview generated code
5. Copy to clipboard or download `.shep` file
6. Link to ShepLang VS Code extension

**Publishing:**
- Figma Community
- Free plugin
- Drive VS Code extension installs

---

### **Phase 4: AI Enhancement (2 weeks)**
Improve conversion with AI

**AI Tasks:**
- Infer semantic meaning from layer names
- Generate action logic from button labels
- Suggest data types from field names
- Create realistic placeholder data
- Optimize layout for mobile/desktop

**AI Provider:**
- OpenAI GPT-4
- Claude (Anthropic)
- Or ShepLang's own AI if building

---

## 📊 Market Validation

### **Existing Market:**
- **Anima:** 1.5M+ installs
- **Builder.io:** Top Figma plugin
- **v0:** High Product Hunt success
- **Locofy, Teleporthq, Codejet:** Active competitors

### **Opportunity:**
- ✅ No one does "Figma → Verified Code"
- ✅ ShepLang's verification is unique differentiator
- ✅ "Design → Working App (No Bugs)" is compelling
- ✅ Designers want code that works

### **Positioning:**
```
Anima: Figma → React/HTML
v0: Figma → Next.js (AI)
Builder.io: Figma → Any framework

ShepLang: Figma → Verified App (No Runtime Errors) ⭐
```

---

## ✅ Recommendations

### **Immediate (Feb 2026 Alpha Launch):**
1. **Skip Figma integration for Alpha**
   - Focus: Core language + VS Code extension
   - Reason: Alpha pilots don't need Figma import yet

### **Post-Alpha (Q2 2026):**
2. **Build Phase 1: Core Package**
   - Create `@sheplang/figma-to-shep`
   - Publish to NPM
   - Test with simple examples

3. **Build Phase 2: VS Code Extension**
   - Add "Import from Figma" command
   - Test with real Figma files
   - Beta test with users

4. **Build Phase 3: Figma Plugin**
   - Develop standalone plugin
   - Publish to Figma Community
   - Launch on Product Hunt (separate from main launch)

### **Positioning for Product Hunt:**
- **Alpha Launch (Feb 2026):** ShepLang language + VS Code
- **Figma Launch (Q2 2026):** "Figma to ShepLang" as separate launch
  - "Turn Figma designs into verified apps"
  - Dual listing: Figma Community + Product Hunt
  - Drives users to ShepLang ecosystem

---

## 🎯 Success Metrics

### **VS Code Extension:**
- 100+ Figma imports in first month
- 80%+ success rate (no errors)
- 50+ positive reviews mentioning Figma

### **Figma Plugin:**
- 10,000+ installs in first 3 months
- Featured in Figma Community
- Top 10 in "Figma to Code" category

### **Combined:**
- 30%+ of new ShepLang users come via Figma
- "Figma to ShepLang" becomes known workflow
- Design agencies adopt ShepLang

---

## 📚 Official Resources

### **Figma:**
- REST API Docs: https://developers.figma.com/docs/rest-api/
- Plugin API: https://developers.figma.com/docs/plugins/
- OpenAPI Spec: https://github.com/figma/rest-api-spec
- Dev Mode Guide: https://help.figma.com/hc/en-us/articles/15023124644247

### **Examples:**
- Anima Plugin: https://www.figma.com/community/plugin/857346721138427857
- Builder.io Plugin: https://www.figma.com/community/plugin/747985167520967365
- Figma for VS Code: https://marketplace.visualstudio.com/items?itemName=figma.figma-vscode-extension
- v0 Blog: https://vercel.com/blog/working-with-figma-and-custom-design-systems-in-v0

### **Technical Guides:**
- Build First Plugin: https://help.figma.com/hc/en-us/articles/4407260620823
- Evil Martians Deep Dive: https://evilmartians.com/chronicles/figma-plugin-api-dive-into-advanced-algorithms-and-data-structures

---

## 🎉 Conclusion

**Yes, "Figma to ShepLang" is 100% possible using official methods.**

**Three proven approaches:**
1. Figma Plugin (like Anima)
2. VS Code Extension + REST API (like Figma for VS Code)
3. Both (like Builder.io, v0)

**Recommendation:**
- Start with **VS Code Extension** (simpler, same codebase)
- Add **Figma Plugin** later for maximum reach
- Use **Shared Core Package** to avoid duplication

**Unique Angle:**
- "Figma → Verified Code (No Runtime Errors)"
- Leverage ShepLang's 100% verification as differentiator
- Market as "Design to Working App (Actually Works)"

**Timeline:**
- Alpha (Feb 2026): Skip Figma integration
- Post-Alpha (Q2 2026): Build Figma integration
- Launch as separate Product Hunt moment

---

**Status: RESEARCH COMPLETE ✅**

*All approaches backed by official documentation and proven by market leaders.*
