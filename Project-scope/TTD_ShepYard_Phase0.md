TTD_ShepYard_Phase0.md
Spec-Driven Development (Spec-Kit compliant) — ShepYard / Creative Development Sandbox
Phase 0 Goal:
Establish the ShepYard foundation without modifying any ShepLang, BobaScript, or CLI code.
Create a new yard/ package that boots a local-only development server, loads a "hello world" screen, integrates with pnpm workspace, and passes pnpm verify.
This phase creates the safe container we will build the rest of the CDS inside.

📐 Phase 0 — Specification (What must exist)
This phase creates:
ComponentDescription
yard/ package
Root folder for the ShepYard Creative Development Sandbox
Dev server
Local-only Vite or React server (no Next.js, no networking)
Entry point
yard/src/main.tsx renders a basic UI shell
pnpm integration
pnpm dev:yard runs the local server
Workspace isolation
Does not touch any other packages
Verify compliance
Running pnpm run verify still succeeds
Hard requirements (Spec-Kit rules)
✔ No stubs unless explicitly marked "Temporary Stub — Remove in Phase 1."
✔ No changes to:
CLI
ShepLang parser
BobaScript transpiler
Runtime
Compiler
✔ No cloud dependencies
✔ Local-only execution
✔ 5-minute setup rule
✔ Zero red builds

🛠️ Phase 0 — Technical Tasks (What engineers/AI should implement)
Below is the exact task list that Windsurf/Cursor must follow.
No deviation. No inferred features. No expansions beyond this list.



Task 0.2 — Create new package /yard
Create folder:
/sheplang/yard/

Inside it create:
package.json
{
  "name": "@sheplang/yard",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.4.0"
  }
}

vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177,
  }
});

tsconfig.json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}


Task 0.3 — Create basic entrypoint UI
/yard/src/main.tsx
/yard/src/App.tsx

main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

App.tsx
export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>ShepYard (CDS) — Phase 0</h1>
      <p>Environment successfully bootstrapped.</p>
      <p>No language integration yet. This is the foundation shell.</p>
    </div>
  );
}


Task 0.4 — Add HTML entrypoint
/yard/index.html

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>ShepYard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>


Task 0.5 — Add workspace integration
Modify root pnpm-workspace.yaml:
packages:
  - "packages/*"
  - "adapters/*"
  - "yard"


Task 0.6 — Add command to root package.json
Add under "scripts":
"dev:yard": "pnpm --filter @sheplang/yard dev"


Task 0.7 — Update verify pipeline
Modify scripts/verify.js to ensure:
yard installs
yard builds (if build step exists)
yard dev server can be launched (synthetic check only)
Example check:
await exec("pnpm --filter @sheplang/yard install");

No preview or integration is tested yet.

Task 0.8 — Manual verification (required)
Engineer must validate:
pnpm install works at root
pnpm dev:yard opens a local server at localhost:5177
Page renders text from App.tsx
CLI commands still work:
pnpm --filter @sheplang/cli build examples/todo.shep
If anything breaks:
Stop → Fix → Re-run verify.

Task 0.9 — Produce PR
PR Title:
ShepYard Phase 0 — Environment Foundation
PR Checklist (must pass):
Yard boots locally
No modifications to existing language/compiler/transpiler
No new API dependencies
No cloud calls
Each new file contains real code
Verify pipeline is green
CLI untouched & functioning

📦 Deliverables for Phase 0
When this phase completes, we must have:
/yard/ package
Local dev server
Basic UI shell
No breakage in ShepLang or BobaScript
GREEN pnpm verify
Documentation update:
Add ShepYard Phase 0 Complete block to PRD

🧪 Phase 0 Test Suite
Automated
pnpm install success
pnpm dev:yard command exists
@sheplang/cli builds examples
Yard package builds (vite build)
Manual
Visit http://localhost:5177
See "ShepYard (CDS) — Phase 0"
Hot reload works
No console errors

🎯 End of TTD for Phase 0
When you are ready, I will generate:
Next Files Required for Real Spec-Driven Development:
1. SDD_Master.md
The Spec-Driven Development Constitution for your project.
Includes:
global rules
memory constraints
vocabulary
architecture truths
AI safety rails
what AI may / may not modify
2. SPEC-KIT_SETUP.md
Direct port of the Microsoft Spec-Kit setup for your repo.
Includes:
project rituals
spec hierarchy
how LLMs should consume specs
how you enforce phase locks
how code must be reviewed by AI
how to scale to ShepThon later
3. TTD Phase 1
"Workspace System + ShepLang Editor + Transpiler Wire-Up"

✔️ **If you want these, just say:
"Generate SDD + Spec-Kit Setup"**
