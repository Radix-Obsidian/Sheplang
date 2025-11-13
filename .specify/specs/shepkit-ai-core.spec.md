# Specification: ShepKit AI Core Integration

**Status:** Draft  
**Owner:** Founder  
**Last Updated:** 2025-01-13  
**Related Docs:** [TTD_ShepKit_AI_Core.md](../../Project-scope/TTD_ShepKit_AI_Core.md)

---

## 1. Overview

### What Are We Building?

An AI-powered educational assistant integrated into ShepKit IDE that serves dual purposes:
1. **Code Generator**: Generates valid ShepLang components from natural language
2. **Patient Teacher**: Explains programming concepts through ShepLang's elegant design

### Why Are We Building This?

**Problem:** Non-technical founders struggle to learn app development because:
- Traditional IDEs assume programming knowledge
- No-code tools hide the underlying concepts (no learning happens)
- AI code generators produce code without explaining it
- Existing tools don't teach the "why" behind the code

**Solution:** ShepKit AI provides:
- Real-time code generation with friendly explanations
- Visual transparency (ShepLang → BobaScript → TypeScript → JavaScript)
- Interactive tutorials with AI guidance
- Patient error explanations that teach concepts
- Progress tracking and personalized learning paths

**Success Criteria:**
- Non-technical user can build and deploy a working app in < 30 minutes
- User can explain what their ShepLang code does in plain English
- 80%+ of generated code is inserted without modification
- Users feel they're "learning while building" (measured via surveys)

---

## 2. User Stories

### Primary Persona: Non-Technical Founder (Sarah)

**Story 1: First App Generation**
```
AS a non-technical founder
I WANT to describe my app idea in plain English
SO THAT I can see it come to life as working code

GIVEN I open ShepKit AI Assistant
WHEN I type "Create a dog reminder app"
THEN I see:
  - Generated ShepLang code with syntax highlighting
  - Friendly explanation of what was created
  - BobaScript/TypeScript comparison (optional toggle)
  - "Insert" button to add code to editor
  - Live preview of the working app
```

**Story 2: Learning Through Explanation**
```
AS a non-technical founder
I WANT to understand the code the AI generated
SO THAT I can learn programming concepts

GIVEN I have generated ShepLang code in my editor
WHEN I right-click and select "Explain This"
THEN I see:
  - Plain English explanation of what the code does
  - Visual breakdown of each section
  - Real-world analogy (e.g., "data is like a filing cabinet")
  - Option to see BobaScript/TypeScript equivalents
  - Suggested next learning step
```

**Story 3: Friendly Error Debugging**
```
AS a non-technical founder
I WANT syntax errors explained in friendly language
SO THAT I can fix them and learn from mistakes

GIVEN I write invalid ShepLang code
WHEN I click "Ask AI to Fix"
THEN I see:
  - What the error means in plain English
  - Why ShepLang requires this syntax
  - How to fix it with annotated code
  - "Apply Fix" button for automatic correction
  - Pro tip to avoid this mistake in the future
```

**Story 4: Interactive Learning Path**
```
AS a non-technical founder
I WANT guided tutorials to learn ShepLang
SO THAT I can build more complex apps independently

GIVEN I click "Start Tutorial" in AI Assistant
WHEN I select "Your First App: Task Manager"
THEN I see:
  - Step-by-step instructions with code examples
  - Interactive editor to practice
  - AI celebrates each completed step
  - Progress tracking and badges
  - Next recommended tutorial
```

### Secondary Persona: Learning Developer (Marcus)

**Story 5: Understanding the Stack**
```
AS a developer learning ShepLang
I WANT to see how ShepLang compiles to TypeScript
SO THAT I understand the full pipeline

GIVEN I write ShepLang code
WHEN I toggle "Show Me the Code" panel
THEN I see:
  - Side-by-side comparison (ShepLang ↔ BobaScript ↔ TypeScript)
  - Syntax highlighting for all languages
  - Arrows showing transformation steps
  - Explanation of why each transformation happens
```

---

## 3. Technical Requirements

### 3.1 Supported Languages

**Primary (Native):**
- ✅ ShepLang - Elegant DSL for founders
- ✅ BobaScript - Generated runtime layer

**Secondary (Educational Context):**
- ✅ TypeScript - Compilation target
- ✅ JavaScript - Final runtime

**Out of Scope:**
- ❌ Other programming languages (Python, Java, etc.)
- ❌ General-purpose coding assistance
- ❌ Non-ShepLang code generation

### 3.2 AI Capabilities

**Must Have:**
1. **Generate** - Create valid ShepLang components from descriptions
2. **Explain** - Break down ShepLang code in friendly language
3. **Debug** - Explain syntax errors with fixes
4. **Compare** - Show ShepLang → BobaScript → TypeScript transformations

**Should Have:**
5. **Tutorial** - Guided interactive learning paths
6. **Scaffold** - Generate complete apps from high-level descriptions
7. **Optimize** - Suggest ShepLang best practices

**Nice to Have:**
8. **Chat** - General Q&A about ShepLang concepts
9. **Deploy** - Guide through deployment process
10. **Test** - Generate test cases for ShepLang components

### 3.3 Educational Requirements

**Core Principles:**
- ✅ Always explain "why" before "how"
- ✅ Use real-world analogies (restaurants, libraries, filing cabinets)
- ✅ Show full pipeline: Idea → ShepLang → BobaScript → TS → JS → App
- ✅ Celebrate small wins ("Great! You just created your first data model!")
- ✅ Never assume prior programming knowledge

**Learning Pathways:**
1. **Beginner**: From Idea to App (5 tutorials)
2. **Intermediate**: Building Real Apps (5 tutorials)
3. **Advanced**: Understanding the Stack (5 tutorials)

**Success Metrics:**
- Time spent in Explain mode (target: 40%+ of sessions)
- Tutorial completion rate (target: 70%+)
- Code comparison usage (target: 50%+ of sessions)
- Self-reported learning confidence (target: 4.5/5 stars)

### 3.4 Safety Constraints

**Hard Rules (Never Break):**
1. ONLY generate ShepLang code (never TypeScript/JavaScript/etc.)
2. NEVER modify files outside `.shep` extension
3. ALWAYS validate syntax before insertion
4. NEVER expose API keys to client
5. ALWAYS use Zod schemas for AI responses

**Soft Rules (Guidelines):**
1. Keep responses concise (< 200 words per explanation)
2. Use emojis sparingly (1-2 per response)
3. Provide examples with every explanation
4. Suggest best practices when relevant
5. Link to documentation for deep dives

### 3.5 Performance Requirements

**Response Times:**
- Generate component: < 3 seconds
- Explain code: < 2 seconds
- Debug error: < 2 seconds
- Stream first token: < 500ms

**Quality Metrics:**
- Generated code compiles: 95%+
- Explanations rated helpful: 85%+
- Suggested fixes work: 90%+
- Code inserted without edits: 80%+

---

## 4. Architecture

### 4.1 System Components

```
┌─────────────────────────────────────────────────┐
│          ShepKit IDE (Next.js App)              │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Monaco Editor (.shep files)             │  │
│  │  - Syntax highlighting                   │  │
│  │  - Right-click → "Explain This"          │  │
│  │  - Error diagnostics                     │  │
│  └──────────────────────────────────────────┘  │
│                    ↕                            │
│  ┌──────────────────────────────────────────┐  │
│  │  AI Assistant Panel                      │  │
│  │  - Mode switcher (Generate/Explain/etc.) │  │
│  │  - useChat hook (streaming)              │  │
│  │  - Code comparison view                  │  │
│  │  - Tutorial system                       │  │
│  └──────────────────────────────────────────┘  │
│                    ↕                            │
│  ┌──────────────────────────────────────────┐  │
│  │  Live Preview                            │  │
│  │  - Renders generated app                 │  │
│  │  - Updates in real-time                  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────────┐
│     API Route: /api/ai/shepkit                  │
│                                                 │
│  - Mode detection (generate/explain/debug)     │
│  - Request validation (Zod schemas)            │
│  - ShepLang-aware system prompts              │
│  - Safety checks (syntax validation)           │
│  - Response streaming                          │
└─────────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────────┐
│     Vercel AI SDK                               │
│                                                 │
│  - streamText (for chat/explanations)          │
│  - generateObject (for components)             │
│  - Tool calls (syntax validation, transpile)   │
└─────────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────────┐
│     AI Provider (OpenAI GPT-4o)                 │
└─────────────────────────────────────────────────┘
```

### 4.2 Data Flow

**Example: Generate Component**

```
1. User types: "Create a dog reminder app"
   ↓
2. Frontend: useShepKitAI.generateComponent()
   ↓
3. POST /api/ai/shepkit
   { mode: 'generate', input: '...', context: {...} }
   ↓
4. API Route validates with Zod
   ↓
5. generateObject() with ShepLangComponentSchema
   ↓
6. OpenAI returns structured JSON:
   {
     code: "data Dog { fields: { name: text... }}",
     explanation: "Created a dog tracking system...",
     educationalNotes: [...]
   }
   ↓
7. API validates syntax (parseShep)
   ↓
8. Return Response.json(validated)
   ↓
9. Frontend displays:
   - Code in syntax-highlighted editor
   - Explanation panel
   - "Insert" button
   - Preview pane
```

### 4.3 Technology Stack

**Dependencies (New):**
```json
{
  "ai": "^3.4.0",
  "@ai-sdk/openai": "^0.0.66",
  "@ai-sdk/react": "^0.0.66",
  "zod": "^3.22.0"
}
```

**Environment Variables:**
```bash
OPENAI_API_KEY=sk-...
SHEPKIT_AI_MODEL=gpt-4o
SHEPKIT_AI_MAX_TOKENS=4096
NEXT_PUBLIC_SHEPKIT_AI_ENABLED=true
```

---

## 5. Integration Points

### 5.1 Existing ShepKit Components

**Monaco Editor Integration:**
- Add right-click context menu: "Explain This"
- Add command palette: "Ask AI to Fix Error"
- Add inline code actions: "Generate with AI"

**AIAssistant Component:**
- Currently placeholder
- Will be replaced with full useShepKitAI implementation

**Live Preview:**
- Already renders ShepLang → compiled output
- No changes needed (AI-generated code flows through existing pipeline)

### 5.2 Existing ShepLang Infrastructure

**Parser (@sheplang/language):**
- Used for syntax validation before insertion
- Used for extracting AST for explanations

**Transpiler (@adapters/sheplang-to-boba):**
- Used for "Show BobaScript" feature
- Already handles ShepLang → BobaScript transformation

**Compiler (@sheplang/compiler):**
- Used for TypeScript output display
- Already handles BobaScript → TypeScript transformation

---

## 6. Non-Functional Requirements

### 6.1 Accessibility
- All AI responses must be screen-reader friendly
- Keyboard shortcuts for all AI actions
- High contrast mode support

### 6.2 Security
- API keys stored in environment variables only
- All AI responses sanitized for XSS
- Rate limiting on AI endpoints (10 requests/minute/user)
- Content filtering for inappropriate prompts

### 6.3 Scalability
- Edge runtime for AI routes (fast global response)
- Response caching for common queries (24 hour TTL)
- Streaming for all long operations
- Debounced AI calls (500ms delay)

### 6.4 Monitoring
- Track AI request latency
- Log failed generations
- Monitor token usage
- Alert on unusual patterns

---

## 7. Out of Scope

**Explicitly NOT Included:**
- ❌ Multi-language code generation (only ShepLang)
- ❌ General-purpose coding assistance
- ❌ AI-powered debugging of runtime errors (only syntax)
- ❌ Custom AI model training
- ❌ Voice-based interactions
- ❌ Collaborative AI sessions (multiple users)
- ❌ AI-generated UI designs (only code)

---

## 8. Success Metrics

### 8.1 Adoption Metrics
- 80%+ of users try AI assistant within first session
- 60%+ use Explain mode at least once
- 40%+ complete at least one tutorial

### 8.2 Quality Metrics
- 95%+ generated code compiles successfully
- 85%+ explanations rated "helpful" or "very helpful"
- 90%+ suggested fixes resolve the error
- 80%+ generated code inserted without modification

### 8.3 Learning Metrics
- 70%+ tutorial completion rate
- Users progress through 3+ learning levels on average
- 4.5/5 stars average for "I feel I'm learning" question

### 8.4 Performance Metrics
- < 3s component generation response time
- < 2s explanation response time
- < 500ms time to first token
- 99.5%+ API uptime

---

## 9. Dependencies

**External:**
- OpenAI API (GPT-4o access)
- Vercel AI SDK (v3.4.0+)
- Stable internet connection

**Internal:**
- @sheplang/language (parser)
- @adapters/sheplang-to-boba (transpiler)
- @sheplang/compiler (TypeScript output)
- Monaco editor integration

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API downtime | High | Fallback to cached responses, graceful degradation |
| Generated invalid code | High | Pre-validation with parseShep, Zod schemas |
| High token costs | Medium | Implement caching, rate limiting, prompt optimization |
| Confusing explanations | Medium | User feedback loop, A/B testing of prompts |
| Users over-rely on AI | Low | Encourage tutorial completion, show learning progress |

---

## 11. Open Questions

1. Should we support multiple AI providers (Anthropic, etc.)? **Decision: Start with OpenAI, add others in Phase 2**
2. How detailed should explanations be? **Decision: User preference toggle (concise/detailed)**
3. Should AI suggest app ideas? **Decision: Nice-to-have for Phase 2**
4. Offline mode support? **Decision: Out of scope for now**

---

## 12. Approval

**Reviewed By:**
- [ ] Founder (Product Owner)
- [ ] Technical Lead (Windsurf AI Agent)
- [ ] Security Review (scope.md compliance)

**Approved:** [Pending]  
**Next Step:** Create Technical Plan
