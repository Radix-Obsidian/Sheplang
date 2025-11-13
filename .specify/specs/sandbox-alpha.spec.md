# Specification: ShepLang Sandbox Alpha (Playground)

**Phase:** 1 - Sandbox Alpha  
**Status:** Ready for Implementation  
**Location:** `/sheplang/playground/` (Vite-based)  
**Related:** [ROADMAP.md](../../Project-scope/ROADMAP.md)  
**Replaces:** ShepKit as initial launch target

---

## 1. Purpose

Build a small, stable, "wow-in-10-minutes" sandbox for ShepLang that:
- Feels like a mini IDE (editor + preview + AI helper)
- Runs entirely in the browser (no DB, no auth)
- Uses the existing ShepLang/BobaScript pipeline
- Lets a non-technical founder say: *"I typed ShepLang, clicked run, asked AI for help — and I built a real tiny app."*

**This replaces ShepKit as the first thing we ship.**

---

## 2. Scope

### ✅ In Scope for Sandbox Alpha

**Web app with:**
1. ShepLang editor (Monaco)
2. Live preview of compiled app
3. BobaScript / AST view (for debugging)
4. AI assistant (Vercel AI SDK) with:
   - Explain Code
   - Generate Component
   - Fix Error (basic)
5. Example selector (pre-loaded ShepLang snippets)
6. Client-side "Projects" saved in localStorage (no backend)
7. Share links (encode state in URL)

**Integration with existing packages:**
- `@sheplang/language` — parse ShepLang → AppModel
- `@adapters/sheplang-to-boba` — ShepLang → BobaScript
- `@sheplang/runtime` or existing preview runtime

**Simple deployment:**
- Built with Vite (existing setup)
- Deployed on Vercel as `sandbox.sheplang.dev`

### ❌ Out of Scope for Sandbox Alpha

*These belong to Phase 2 (ShepKit) / Phase 3 (Shepherd Studio):*

- User accounts / auth
- Database or Supabase integration
- Cloud project storage
- One-click production deploy
- Full file tree / workspace
- AI agents controlling Vercel or infrastructure
- Drag-and-drop UI builder
- Complex multi-page stateful apps

---

## 3. User Personas & Jobs

### Persona A: Non-technical founder

**Can't code (or barely).**  
Wants to see their idea as a working screen quickly.  
Needs AI to help them understand "what this code does".

**Jobs:**
- Start from an example and tweak it
- Ask AI "make this into a dog reminder app"
- Copy/share the result with friends, co-founders, or advisors

### Persona B: Design-minded builder

**Knows Figma / UX but not TS/React.**  
Comfortable reading simple pseudo-code.  
Wants a language that "reads like thought".

**Jobs:**
- Learn ShepLang through live experimentation
- Use Explain Mode to understand patterns
- Export code later for dev partners

---

## 4. UX Overview

### Layout

Desktop-first layout (mobile usable but not optimized):

```
┌───────────────────────────────────────────────────────────────┐
│  Top bar: Logo | Examples dropdown | Share button             │
├───────────────────────────────────────────────────────────────┤
│      Editor (ShepLang)      │    Preview & Outputs           │
│                             │                                │
│  [Monaco Editor]            │  ┌──────── Preview ────────┐   │
│                             │  │  Live UI                │   │
│                             │  └─────────────────────────┘   │
│                             │  ┌────── BobaScript ──────┐    │
│                             │  │ code view / copy       │    │
│                             │  └────────────────────────┘    │
├─────────────────────────────┴────────────────────────────────┤
│      AI Assistant Panel (collapsible right-side drawer)      │
└───────────────────────────────────────────────────────────────┘
```

### Core Flows

**1. Start from template**
- User opens sandbox → sees example loaded (e.g., "Minimal Todo")
- Types into editor → preview updates live

**2. Ask AI to explain**
- User clicks "Explain this code"
- AI panel shows explanation in plain language

**3. Generate new component**
- User types prompt: "Make a Dog Reminder screen with title + time fields"
- AI returns ShepLang snippet
- User clicks "Insert into editor" → snippet appended at cursor

**4. Fix error**
- If compile fails, error message shown near editor
- User clicks "Fix this error with AI"
- AI suggests corrected snippet or explains what's wrong

**5. Share**
- "Share" button encodes sandbox state into URL
- No backend; done by compressing + base64 encoding into query/hash

---

## 5. System Architecture

### High-level

**Frontend:** Vite + TypeScript (Vanilla or lightweight framework)  
**AI:** Vercel AI SDK (backend endpoint)  
**Language:** Use existing packages as dependencies  
**State:** Vanilla JS state or simple store  
**Storage:** localStorage for user projects  

```
[Browser UI]
     |  (useChat/useCompletion from AI SDK)
     v
[API route /api/ai/sandbox]  ← uses streamText/generateObject
     |  (prompts + ShepLang-aware instructions)
     v
[LLM Provider (OpenAI/GPT-4o)]
     |
     v
[Response streamed back to UI]

[Editor]
     |
     v
[@sheplang/language + @adapters/sheplang-to-boba + runtime]
     |
     v
[Preview + BobaScript output]
```

---

## 6. Detailed Requirements

### 6.1 Editor

**Use Monaco Editor in ShepLang mode.**

Key features:
- Basic syntax highlighting (keywords: `data`, `view`, `action`, `app`, etc.)
- Configurable font size
- Soft wrap off by default

Keyboard:
- `Ctrl+Enter` / `Cmd+Enter` = "Run / Focus Preview"
- `Ctrl+S` / `Cmd+S` = Save current project to localStorage

### 6.2 Preview

Uses the existing ShepLang → BobaScript pipeline to render UI.

Should:
- Show loading state while transpiling/rendering
- Show friendly error messages when transpile fails
- Reset cleanly if code becomes empty

Error panel:
- Display: error type, line/column if available, and short hint

### 6.3 BobaScript / AST View

Collapsible panel under preview.

Tabs:
- **BobaScript** (readonly text)
- **AST** (JSON pretty-printed)

Each tab has "Copy to clipboard" button.

### 6.4 Examples

Hardcoded list (no backend):

```typescript
interface SandboxExample {
  id: string;              // "01-minimal", "02-reminders"…
  name: string;            // "Minimal Todo"
  description: string;     // tooltip or short description
  source: string;          // ShepLang code
}
```

**Shipped examples:**
1. Minimal app (`app MyApp { ... }`)
2. Dog Reminder (data + view + action)
3. Simple multi-page (Home + Details)
4. App with state (list of todos)
5. Form example

**Behavior:**
- Selecting an example replaces current editor content (confirm if unsaved)

### 6.5 Project Storage (client-only)

Simple model:
```typescript
interface SandboxProject {
  id: string;
  name: string;
  code: string;
  updatedAt: string;
}
```

Store in localStorage under key `sheplang-sandbox-projects`.

Features:
- "Save as project" button
- Projects dropdown/modal (open, rename, delete)

### 6.6 AI Assistant (Vercel AI SDK)

#### API Route
`POST /api/ai/sandbox`

Input:
```typescript
type SandboxAiMode = 'explain' | 'generate_component' | 'fix_error';

interface SandboxAiRequest {
  mode: SandboxAiMode;
  code: string;          // current ShepLang
  error?: string;        // if mode === 'fix_error'
  prompt?: string;       // if mode === 'generate_component'
}
```

Output:
- Streamed text response (Markdown)
- For `generate_component`, must contain fenced ShepLang code block

#### Implementation
Use Vercel AI SDK:
- `streamText` from `ai` on server
- `useChat` or `useCompletion` from `ai/react` on client

System prompt must:
- Explain ShepLang syntax
- Enforce that `generate_component` returns only valid ShepLang
- For `explain`, answer in plain language for non-technical founders
- For `fix_error`, return explanation + corrected snippet

#### Frontend
AIAssistant panel as bottom or right drawer.

Features:
- Message history (simple chat list)
- Input box
- Buttons: "Explain this code", "Generate component", "Fix last error"
- For `generate_component`, show code block with "Insert into editor" button

### 6.7 Share Link (no backend)

"Share" button:
- Takes current code string
- Encodes as compact string (e.g., gzip + base64)
- Appends to URL as hash `#s=...` or query `?state=...`

On load:
- If URL contains state param, decode and set sandbox
- Otherwise, load default example or last project

---

## 7. Engineering Constraints

### DO NOT modify core language/CLI packages

Only add:
- New sandbox app folder
- AI route + AIAssistant component

### Language core must still pass:
- `pnpm -w -r build`
- `pnpm -w -r test`
- `pnpm run verify`

### TypeScript:
- `strict: true`
- No `any` unless justified and commented

### Folder Structure:
```
/sheplang/
  playground/           # Sandbox Alpha (existing Vite app)
    src/
      main.ts           # Entry point (existing)
      examples.ts       # Examples (existing)
      editor.ts         # NEW: Monaco wrapper
      preview.ts        # NEW: Preview panel
      ai-client.ts      # NEW: AI API calls
      storage.ts        # NEW: localStorage helpers
      share.ts          # NEW: URL encoding/decoding
    api/                # NEW: Backend for AI
      ai-handler.ts     # AI endpoint
    index.html          # Existing
    vite.config.ts      # Existing
```

---

## 8. Testing & Quality

### Unit tests for:
- AI route input validation (reject missing/invalid fields)
- Share link encoding/decoding
- localStorage operations

### Integration test:
- Given valid example, transpilation & preview should succeed

### Manual acceptance checklist:
- [ ] Can open sandbox, edit code, see preview
- [ ] AI "Explain" returns friendly explanation
- [ ] AI "Generate component" yields valid ShepLang 80%+ of time
- [ ] Share URL restores same code/session
- [ ] Examples load correctly
- [ ] Error messages are helpful

---

## 9. Metrics (Alpha-level)

Track (if possible without heavy analytics):
- **Time to first preview** (goal: < 10s from landing)
- **AI actions per session** (goal: > 3)
- **Share button usage** (goal: > 20% of sessions)

---

## 10. Success Criteria

### Phase 1 Complete When:
1. ✅ Sandbox deployed to Vercel
2. ✅ Can write ShepLang and see preview
3. ✅ AI assistant working (all 3 modes)
4. ✅ 5+ examples available
5. ✅ Share links functional
6. ✅ Projects save to localStorage
7. ✅ No backend required
8. ✅ Founder can go from idea → working demo in < 10 minutes

---

## 11. Non-Functional Requirements

### Performance
- First paint: < 2s
- Editor responsive (no lag while typing)
- Preview update: < 500ms after typing stops
- AI response first token: < 1s

### Accessibility
- Keyboard navigation for all features
- Screen reader friendly AI responses
- High contrast mode support

### Security
- API keys server-side only
- Input sanitization for AI prompts
- No eval() or dynamic code execution
- CSP headers configured

### Browser Support
- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)
- Mobile: Functional but not optimized

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API downtime | High | Graceful degradation, cache common responses |
| Invalid ShepLang from AI | Medium | Validate before insertion, user can edit |
| Complex apps don't preview | Low | Clear examples showing supported features |
| localStorage quota exceeded | Low | Limit project count, compress data |

---

## 13. Dependencies

### External
- OpenAI API key
- Vercel deployment
- pnpm workspace

### Internal
- `@sheplang/language`
- `@adapters/sheplang-to-boba`
- `@sheplang/runtime` (if exists)

---

## 14. Future Considerations (Phase 2)

*Not for Alpha, but keep in mind:*

- User accounts & cloud storage
- Export to Next.js project
- Deploy to production
- Backend data persistence
- Advanced AI agents
- Collaborative editing

---

## 15. Approval

**Reviewed By:**
- [ ] Founder
- [ ] Technical Lead (Windsurf)
- [ ] Constitution compliance

**Status:** Ready for Implementation  
**Next Step:** Create implementation plan

---

## Founder Takeaways

> You're NOT rebuilding ShepKit here. You're building a small, sharp, lovable sandbox that proves ShepLang is real and usable.

This is what you show:
- YC
- a16z
- Your friends
- Future users

And say: *"Here. This is how a non-technical founder builds a real app with their own language in 10 minutes."*

---

**Spec Version:** 1.0  
**Created:** 2025-01-13  
**Status:** Active
