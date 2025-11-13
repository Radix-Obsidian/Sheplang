# 🧠 ShepKit AI Core - Technical Design Document

**Status:** In Development  
**Based On:** Official Vercel AI SDK Documentation (Verified 2025-01-13)  
**Target:** Transform ShepKit from static IDE → AI-assisted Creative Development Sandbox

---

## ⚠️ CRITICAL FINDING: RSC → UI SDK Migration

**OFFICIAL VERCEL RECOMMENDATION:**
> "AI SDK RSC is currently experimental. We recommend using AI SDK UI for production."  
> Source: https://ai-sdk.dev/docs/ai-sdk-rsc/overview

### Impact on Original Plan
Your original plan referenced AI SDK RSC docs. **These are now deprecated/experimental.** We will use **AI SDK UI** instead, which is:
- ✅ Production-ready
- ✅ Better maintained
- ✅ Simpler API
- ✅ Works with Next.js App Router (your current setup)

---

## 📚 Official Documentation Review (Verified)

### ✅ ESSENTIAL DOCS (Confirmed)

| Doc | Status | Why Critical for ShepKit |
|-----|--------|--------------------------|
| [Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) | ✅ VERIFIED | `generateObject` returns valid ShepLang AST/components. `streamObject` for real-time generation. |
| [Generative UI](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces) | ✅ VERIFIED | Use `useChat` + tools to create AI assistant panel with dynamic UI. |
| [useChat](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) | ✅ VERIFIED | Core React hook for chat state, streaming, tool calls. |
| [Getting Started: Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) | ✅ VERIFIED | Integration template for ShepKit (already uses App Router). |
| [Agents: Overview](https://ai-sdk.dev/docs/agents/overview) | ✅ VERIFIED | Agent class for building ShepLang agents. |
| [Agents: Workflows](https://ai-sdk.dev/docs/agents/workflows) | ✅ VERIFIED | Sequential, parallel, orchestrator patterns for complex tasks. |
| [streamText](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text) | ✅ VERIFIED | Stream AI responses in real-time. |

### ⚠️ DOCS TO REPLACE (RSC → UI)

| Original (RSC - Experimental) | Use Instead (UI - Production) |
|-------------------------------|-------------------------------|
| ~~AI SDK RSC: Generative UI State~~ | [AI SDK UI: Generative UI](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces) |
| ~~AI SDK RSC: Saving/Restoring States~~ | Use `onFinish` callback in `streamText` + database |
| ~~AI SDK RSC: Multistep Interfaces~~ | [Advanced: Multistep Interfaces](https://ai-sdk.dev/docs/advanced/multistep-interfaces) |
| ~~AI SDK RSC: Streaming React Components~~ | Use `useChat` + tool rendering |

### ❌ NOT NEEDED

- Express/Hono/Fastify docs (ShepKit uses Next.js)
- Pages Router docs (ShepKit uses App Router)
- SvelteKit/Nuxt/Expo docs (ShepKit is Next.js)

---

## 🏗️ ShepKit AI Architecture (Revised)

### Current ShepKit Stack
```
ShepLang (DSL) → BobaScript (runtime) → TypeScript/Next.js
         ↓
    Transpiler/Adapters
         ↓
    ShepKit IDE (Next.js App Router)
```

### New: AI-Enhanced Stack
```
User Input (Natural Language)
         ↓
ShepKit UI (AIAssistant Panel)
    - useChat hook
    - Tool-based interactions
    - Real-time streaming
         ↓
API Route: /api/ai/shepkit
    - Mode detection (chat, generate, debug, scaffold, deploy)
    - ShepLang-aware prompts
    - generateObject / streamText
    - Safety validation
         ↓
AI Provider (OpenAI/Anthropic/etc.)
         ↓
Structured Response
    - Valid ShepLang code
    - Diagnostics/errors
    - Scaffolding instructions
         ↓
ShepKit Editor
    - Insert generated code
    - Apply fixes
    - Update preview
```

---

## 🎯 Implementation Plan (20 Windsurf Calls)

### Phase 1: Foundation (Calls 1-5)

#### Call 1: Technical Specification
**Task:** Create detailed TTD for AI Core  
**Deliverable:** This document  
**Key Decisions:**
- Use AI SDK UI (not RSC)
- Support 5 modes: chat, generate, debug, scaffold, deploy
- Never modify code outside `.shep` files
- All LLM calls must return structured data (Zod schemas)

#### Call 2: Dependencies & Environment
**File:** `sheplang/shepkit/package.json`  
**Add:**
```json
{
  "dependencies": {
    "ai": "^3.4.0",
    "@ai-sdk/openai": "^0.0.66",
    "@ai-sdk/react": "^0.0.66",
    "zod": "^3.22.0"
  }
}
```

**File:** `sheplang/shepkit/.env.example`  
**Add:**
```bash
# AI SDK Configuration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-... # Optional

# ShepKit AI Settings
SHEPKIT_AI_MODEL=gpt-4o
SHEPKIT_AI_MAX_TOKENS=4096
```

**Docs to Update:**
- `Project-scope/Vercel_Deployment_Guide.md` (add AI env vars)
- `sheplang/shepkit/README.md` (AI setup instructions)

#### Call 3: Core API Route
**File:** `sheplang/shepkit/app/api/ai/shepkit/route.ts`  
**Template:**
```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, generateObject } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';
export const maxDuration = 30;

// Request schema
const ShepKitAIRequest = z.object({
  mode: z.enum(['chat', 'generate', 'debug', 'scaffold', 'deploy']),
  input: z.string(),
  context: z.object({
    currentFile: z.string().optional(),
    fileContent: z.string().optional(),
    cursorPosition: z.number().optional(),
    diagnostics: z.array(z.any()).optional(),
  }).optional(),
});

// ShepLang component schema
const ShepLangComponentSchema = z.object({
  code: z.string(),
  explanation: z.string(),
  componentName: z.string(),
  diagnostics: z.array(z.object({
    line: z.number(),
    message: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
  })).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const validated = ShepKitAIRequest.parse(body);
  
  const { mode, input, context } = validated;
  
  // Mode-specific handling
  switch (mode) {
    case 'generate':
      return handleGenerate(input, context);
    case 'debug':
      return handleDebug(input, context);
    case 'chat':
    default:
      return handleChat(input, context);
  }
}

async function handleGenerate(input: string, context: any) {
  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: ShepLangComponentSchema,
    system: SHEPLANG_SYSTEM_PROMPT,
    prompt: `Generate a ShepLang component for: ${input}`,
  });
  
  return Response.json(result.object);
}

async function handleChat(input: string, context: any) {
  const result = streamText({
    model: openai('gpt-4o'),
    system: SHEPLANG_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: input }],
  });
  
  return result.toDataStreamResponse();
}

const SHEPLANG_SYSTEM_PROMPT = `You are an AI assistant for ShepKit, a visual IDE for the ShepLang programming language.

ShepLang Syntax:
- app AppName { ... }
- data ModelName { fields: { ... }, rules: [ ... ] }
- view ViewName { list: DataName, buttons: [ ... ] }
- action ActionName(params) { ops }

Your role:
1. Generate valid, syntactically correct ShepLang code
2. Explain ShepLang concepts to non-technical users
3. Debug ShepLang errors with friendly explanations
4. Scaffold complete apps from descriptions

Rules:
- ONLY generate code in ShepLang syntax
- NEVER output TypeScript, JavaScript, or other languages
- Always validate syntax before responding
- Use friendly, non-technical language in explanations`;
```

**Official Source:**
- Based on: https://ai-sdk.dev/docs/getting-started/nextjs-app-router
- generateObject: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
- streamText: https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text

#### Call 4: Frontend Hook Setup
**File:** `sheplang/shepkit/lib/hooks/useShepKitAI.ts`  
**Template:**
```typescript
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export type AIMode = 'chat' | 'generate' | 'debug' | 'scaffold' | 'deploy';

export function useShepKitAI(initialMode: AIMode = 'chat') {
  const [mode, setMode] = useState<AIMode>(initialMode);
  const [context, setContext] = useState<any>({});
  
  const chat = useChat({
    api: '/api/ai/shepkit',
    body: { mode, context },
  });
  
  const generateComponent = async (description: string) => {
    setMode('generate');
    const response = await fetch('/api/ai/shepkit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'generate',
        input: description,
        context,
      }),
    });
    return response.json();
  };
  
  return {
    ...chat,
    mode,
    setMode,
    context,
    setContext,
    generateComponent,
  };
}
```

**Official Source:**
- useChat hook: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat

#### Call 5: Update AIAssistant Component
**File:** `sheplang/shepkit/components/AIAssistant.tsx`  
**Changes:**
- Replace placeholder with real `useShepKitAI` hook
- Add mode switcher (Chat, Generate, Debug, Scaffold)
- Add quick action buttons
- Add streaming message display
- Add code insertion button

---

### Phase 2: Core Features (Calls 6-12)

#### Call 6: Component Generation ("Wow" Feature)
**Feature:** Generate ShepLang components from descriptions  
**Example:**
```
User: "Create a Dog Reminder screen"

AI Returns:
{
  code: `
    data Dog {
      fields: {
        name: text
        breed: text
        nextCheckup: date
      }
      rules: [
        user can add dogs
        user can update own dogs
      ]
    }
    
    view DogReminder {
      list: Dog
      buttons: [
        "Add Dog" -> addDog()
        "Schedule Checkup" -> scheduleCheckup(dog)
      ]
    }
    
    action addDog() {
      ops: [
        add Dog { name, breed, nextCheckup }
        show DogReminder
      ]
    }
  `,
  explanation: "Created a Dog tracking system with...",
  componentName: "DogReminder"
}
```

**Implementation:**
- Add `GeneratePanel` component
- Add syntax validation before insertion
- Add preview pane
- Add "Insert to Editor" button

#### Call 7: Syntax Error Debugging
**Feature:** AI explains ShepLang errors in friendly language  
**Example:**
```
Error: "missing fields:"

AI Response:
"It looks like your data definition doesn't have a fields section. 
In ShepLang, every data block needs to define its fields. Try adding:

fields: {
  name: text
  ...
}

right after your data declaration."
```

**Implementation:**
- Hook into existing diagnostic system
- Pass errors to AI with context
- Display friendly explanations
- Suggest fixes

#### Call 8-12: Additional Features
- **Call 8:** Code explanation ("What does this do?")
- **Call 9:** Scaffolding (complete apps from prompts)
- **Call 10:** Best practices checker
- **Call 11:** Quick fixes automation
- **Call 12:** Chat history & context management

---

### Phase 3: Advanced (Calls 13-16)

#### Call 13-14: Agent Framework
**Use:** Build intelligent ShepLang agents  
**Based on:** https://ai-sdk.dev/docs/agents/overview

**Example Agent: DeploymentAgent**
```typescript
import { Agent } from 'ai';

const deploymentAgent = new Agent({
  model: openai('gpt-4o'),
  system: 'You help deploy ShepKit apps to production',
  tools: {
    checkSyntax: { ... },
    runTests: { ... },
    buildApp: { ... },
    deployToVercel: { ... },
  },
});

// Agent handles multi-step deployment workflow
const result = await deploymentAgent.execute({
  prompt: 'Deploy my app to production',
});
```

#### Call 15-16: Workflow Patterns
**Based on:** https://ai-sdk.dev/docs/agents/workflows

**Implement:**
1. **Sequential:** Syntax check → Build → Test → Deploy
2. **Routing:** Route questions to appropriate agent
3. **Evaluator-Optimizer:** Generate code → Evaluate → Improve

---

### Phase 4: Polish (Calls 17-20)

#### Call 17: Safety & Validation
- Add Zod schemas for all AI inputs/outputs
- Rate limiting
- Content filtering
- Cost monitoring

#### Call 18: Testing
**File:** `sheplang/shepkit/test/ai/`
- Test AI route returns valid structure
- Test generated ShepLang passes syntax check
- Test error handling
- Test streaming

#### Call 19: Documentation
**Create:**
- `docs/AI_Assistant_Guide.md` (user-facing)
- `docs/AI_API_Reference.md` (developer-facing)
- Update main README

#### Call 20: Performance Optimization
- Add response caching
- Implement streaming for all long operations
- Add loading states
- Optimize token usage

---

## 🎨 User Experience Flow

### Scenario 1: First-Time User
```
1. Opens ShepKit → sees AI Assistant panel
2. Clicks "Generate Component"
3. Types: "I need a task manager"
4. AI streams response in real-time
5. Preview pane shows generated ShepLang
6. User clicks "Insert" → code appears in editor
7. Live preview updates automatically
8. User deploys with one click
```

### Scenario 2: Debugging
```
1. User writes invalid ShepLang
2. Red squigglies appear
3. User clicks "Ask AI to Fix"
4. AI explains error in plain English
5. Suggests fix with "Apply" button
6. User clicks Apply → code fixed
7. Preview updates
```

### Scenario 3: Learning
```
1. User highlights ShepLang code
2. Clicks "Explain this"
3. AI provides friendly explanation:
   "This creates a data model called Task.
    The fields section defines what information
    each task will store..."
4. User asks follow-up questions
5. Chat-style conversation
```

---

## 🔒 Safety & Constraints

### Hard Rules (Never Break)
1. **ONLY generate ShepLang code** (never TS/JS/etc.)
2. **NEVER modify files outside `.shep` extension**
3. **ALWAYS validate syntax before insertion**
4. **NEVER expose API keys to client**
5. **ALWAYS use Zod validation for AI responses**

### Soft Rules (Guidelines)
1. Keep responses concise (non-technical users)
2. Provide examples with explanations
3. Suggest best practices
4. Warn about common mistakes
5. Celebrate successes ("Great! Your app is ready to deploy!")

---

## 📊 Success Metrics

### Phase 1 Success (Foundation)
- ✅ AI route returns structured data
- ✅ useChat hook works in UI
- ✅ Basic chat interaction functional

### Phase 2 Success (Core Features)
- ✅ Generate valid ShepLang components
- ✅ Explain syntax errors
- ✅ Insert code into editor
- ✅ Preview updates correctly

### Phase 3 Success (Advanced)
- ✅ Agent-based workflows
- ✅ Multi-step scaffolding
- ✅ End-to-end deployment

### Final Success (Production-Ready)
- ✅ Non-technical users build apps
- ✅ Zero TypeScript exposure
- ✅ < 3 clicks from idea → deployed app
- ✅ Friendly, ChatGPT-like UX

---

## 🚀 Deployment Considerations

### Environment Variables (Vercel)
```bash
OPENAI_API_KEY=sk-...
SHEPKIT_AI_MODEL=gpt-4o
SHEPKIT_AI_MAX_TOKENS=4096
NEXT_PUBLIC_SHEPKIT_AI_ENABLED=true
```

### Cost Monitoring
- Track tokens per request
- Set usage limits per user
- Alert on unusual patterns
- Consider caching for common queries

### Performance
- Use Edge runtime for AI routes
- Stream all LLM responses
- Cache system prompts
- Optimize for mobile

---

## 📚 Official Documentation References

All implementation decisions based on:

1. **AI SDK Core**
   - [Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)
   - [streamText](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text)
   - [generateObject](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-object)

2. **AI SDK UI** (Production-Ready)
   - [Generative UI](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)
   - [useChat](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
   - [useCompletion](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-completion)

3. **Next.js Integration**
   - [Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)

4. **Agents**
   - [Agent Overview](https://ai-sdk.dev/docs/agents/overview)
   - [Workflows](https://ai-sdk.dev/docs/agents/workflows)
   - [Building Agents](https://ai-sdk.dev/docs/agents/building-agents)

5. **Advanced**
   - [Multistep Interfaces](https://ai-sdk.dev/docs/advanced/multistep-interfaces)

---

## ✅ Final Validation

**All documentation verified against official sources: 2025-01-13**

**Key Changes from Original Plan:**
- ✅ Replaced RSC docs with AI SDK UI (production-ready)
- ✅ Confirmed all "essential" docs are correct
- ✅ Removed experimental/deprecated approaches
- ✅ Added concrete code examples from official docs
- ✅ Maintained 20-call budget
- ✅ Kept focus on non-technical users
- ✅ Ensured ShepLang-first approach

**This is the official, verified plan to follow "to the T."**

---

**Next Step:** Execute Phase 1, Call 2 (Dependencies & Environment)
