# ShepKit System Architecture
Technical Architecture for the Founder OS

---

## 1. Overview Diagram

```
ShepLang (.shep)
↓ parseShep
AppModel
↓ transpileShepToBoba
BobaScript AST
↓ render engine
UI Preview
↓ generateNextApp
Next.js Bundle
↓ Vercel Deploy
Live App URL
```

---

## 2. Components

### 2.1 ShepLang Parser
**Source:** `/sheplang/packages/language`  
**Function:** convert `.shep` → AppModel

### 2.2 BobaScript Transpiler
**Source:** `/adapters/sheplang-to-boba`  
**Function:** AppModel → `{ code, canonicalAst, diagnostics }` 

### 2.3 ShepKit (Next.js App)
**Location:** `/sheplang/shepkit/`  
**Stack:**
- Next.js 14 (app router)
- React 18
- Tailwind
- Zustand
- Monaco Editor
- Vite or Next bundler (TBD)

### 2.4 Live Preview Engine
Runs BobaScript output in an isolated sandbox iframe.

### 2.5 AI Layer
**APIs:**
- `/api/ai/explain` 
- `/api/ai/generate` 
- `/api/ai/debug` 

Uses OpenAI GPT-4.1 or GPT-4o-mini.

### 2.6 Deploy Service
**Path:** `/api/deploy`  
Does:
1. Generate Next.js project from ShepLang  
2. Send bundle to Vercel API  
3. Return production deploy URL  

### 2.7 Storage Layer
Phase 1: localStorage  
Phase 2: Supabase  
Phase 3: cloud sync across accounts  

---

## 3. Internal Data Model

```ts
interface Project {
  id: string;
  name: string;
  files: Record<string, string>;
  lastModified: number;
}

interface TranspileResult {
  code: string;
  canonicalAst: any;
  diagnostics: Diagnostic[];
}
```

---

## 4. ShepKit Modules

```
/shepkit/app/
  components/
    FileExplorer.tsx
    MonacoEditor.tsx
    LivePreview.tsx
    AIPanel.tsx
  api/
    ai/
    projects/
    deploy/
  lib/
    examples.ts
    ai.ts
    state.ts (Zustand)
    transpile.ts
```

---

## 5. Build Pipeline

1. User edits ShepLang
2. Editor triggers transpile
3. BobaScript AST updates → render
4. ShepKit re-renders preview
5. Deploy button generates Next.js project
6. Vercel pushes it live

---

## 6. Security Model

- iframe sandboxing
- isolated BobaScript runtime
- no eval
- rate-limited AI endpoints
- Supabase row-level security

---

## 7. Future Extensions

- Real-time collaboration
- Plugin system
- Native mobile export
- App templates marketplace
- Database schema designer
