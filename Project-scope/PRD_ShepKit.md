# ShepKit — Product Requirements Document (PRD)
Founder OS for Non-Technical Builders

---

## 1. Summary
ShepKit is a visual, AI-assisted development environment for non-technical founders.  
It uses:
- **ShepLang** → human-readable app language  
- **BobaScript** → execution-safe JS runtime  
- **One-Click Deploy** → real Vercel deployment  
- **AI Co-Builder** → explain, generate, debug

ShepKit is the "Lovable for Non-Technical Founders" — a creation environment that teaches, builds, previews, and deploys real applications without requiring programming knowledge.

---

## 2. Users
### Primary
- Non-technical founders  
- Designers  
- Idea-stage builders

### Secondary
- Educators  
- Students  
- Hackathon teams

---

## 3. Goals
1. Reduce time-to-first-working-app to **< 10 minutes**
2. Enable idea-to-live-deployment in **1 hour**
3. Remove developer overhead (no Node, pnpm, bundlers)
4. Provide a safe learning environment powered by Explain Mode
5. Allow gradual expansion from simple to advanced apps

---

## 4. Core Features
### 4.1 Editor
- Monaco-based editor  
- Syntax highlighting for `.shep`  
- Inline error squiggles  
- AI suggestions  
- Command palette actions

### 4.2 Project Explorer
- Create / rename / delete `.shep` files  
- Multi-file support  
- Save to localStorage  
- Export/Import project JSON  

### 4.3 Visual Live Preview
- Real-time ShepLang → BobaScript → UI render  
- Shows:
  - Components
  - State changes
  - Actions and responses  
- Hot reload < 150ms

### 4.4 AI Co-Builder
- Explain code  
- Generate component  
- Debug syntax errors  
- Suggest improvements  
- Convert natural language → ShepLang

### 4.5 Built-in Examples
- 01 – Minimal App
- 02 – State + Actions
- 03 – Routes
- 04 – CRUD
- 05 – Templates

### 4.6 One-Click Deploy
- Transpile project → Next.js app  
- Vercel API integration  
- Returns live URL  
- Exports full code bundle

---

## 5. Non-Goals (for Alpha)
- Drag-and-drop UI builder  
- Multi-user collaboration  
- Database table designer  
- Marketplace  
- Mobile native output  

---

## 6. Requirements Matrix

| Feature | Alpha | Beta | GA |
|--------|-------|------|-----|
| Monaco Editor | ✅ | Polished | Advanced |
| AI Co-Builder | Basic | Multi-agent | Full |
| Live Preview | Basic | Advanced | Component-level |
| Deploy | Basic | Templates | Integrated DB |
| File System | Basic | Cloud | Repo Sync |

---

## 7. Metrics
- Time-to-first-preview < 20s  
- Time-to-first-app < 10 minutes  
- Transpile errors < 3%  
- Deploy success rate > 95%  
- Daily returning users > 25%

---

## 8. Risks
- Parser stability  
- Preview latency  
- AI reliability  
- Next.js deploy adapter errors  
- Unclear mental model for beginners  

---

## 9. Appendices
- ShepLang spec (SYNTAX_FREEZE.md)  
- BobaScript specification  
- Compiler tests  
- Playground examples
