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

### Phase 2: Core Features (Calls 6-12) - **EDUCATION-FIRST**

#### Call 6: **Explain Mode** (Core Educational Feature)
**Priority:** HIGHEST - This is ShepKit's differentiator  
**Feature:** Right-click any code → "Explain This"

**Example:**
```
User selects: data Task { fields: { title: text } }

AI Response:
"This creates a Task data model! 🎯

📋 **What it does:** Defines the blueprint for tasks in your app
📝 **Fields section:** Lists what info each task stores
💡 **Why this matters:** Every app needs to organize its data

**Behind the scenes:** This becomes:
- A database table to store tasks
- TypeScript types for safety
- API endpoints to manage tasks

Want to see the generated BobaScript? 🔍"
```

**Implementation:**
- Add `ExplainPanel` component with friendly UI
- Integrate with Monaco editor (right-click context menu)
- Show BobaScript/TypeScript equivalents on demand
- Track learning progress

#### Call 7: **Code Comparison View** (Educational Transparency)
**Feature:** "Show me the [BobaScript/TypeScript/JavaScript]"

**Side-by-Side View:**
```
┌─ ShepLang (What You Write) ─┐  ┌─ BobaScript (Generated) ──┐
│ data Task {                 │  │ interface Task {          │
│   fields: {                 │  │   title: string;          │
│     title: text             │  │   completed: boolean;     │
│   }                         │  │ }                         │
│ }                           │  │                           │
└─────────────────────────────┘  └───────────────────────────┘
```

**Implementation:**
- Add `CodeComparisonPanel` component
- Toggle buttons for each language layer
- Syntax highlighting for all languages
- Explain the transformation process

#### Call 8: **Interactive Tutorials** (Guided Learning)
**Feature:** Built-in learning paths with AI guidance

**Tutorial Example: "Your First App"**
```
Step 1: "Let's create a Task data model. Type this:"
[Code editor with: data Task { fields: { title: text } }]

AI: "Great! You just created your first data model. 
This tells your app what information tasks should store.
Next, let's add more fields..."
```

**Implementation:**
- Tutorial system with step-by-step guidance
- AI celebrates progress and explains each step
- Interactive code editor within tutorials
- Progress tracking and badges

#### Call 9: Component Generation ("Wow" Feature)
**Feature:** Generate ShepLang components from descriptions  
**Educational Twist:** Always explain what was generated and why

**Example:**
```
User: "Create a Dog Reminder screen"

AI Returns:
{
  code: `[ShepLang code]`,
  explanation: "I created a Dog tracking system with:
  
  📊 **Data Model**: Stores dog info (name, breed, checkup dates)
  🔒 **Security Rules**: Users can only manage their own dogs
  📱 **User Interface**: List view with action buttons
  
  This follows the pattern: Data → Rules → Views → Actions
  Want me to explain any part in detail?",
  educationalNotes: [
    "Notice how rules are separate from data - this is for security",
    "The view connects to the data automatically",
    "Actions define what users can do"
  ]
}
```

#### Call 10: Syntax Error Debugging (Educational)
**Feature:** AI explains errors like a patient teacher

**Example:**
```
Error: "missing fields:"

AI Response:
"No worries! This is a common mistake. 🤗

**The Problem:** Your data block is missing a 'fields' section.

**Why this matters:** ShepLang needs to know what information 
your data will store. It's like creating a form - you need 
to list all the blanks to fill in.

**The Fix:**
data Task {
  fields: {          ← Add this section
    title: text      ← List your fields here
    done: boolean
  }
}

**Pro tip:** Every data block needs fields, even if it's just one!"
```

#### Call 11-12: Advanced Educational Features
- **Call 11:** Learning progress tracking & personalized paths
- **Call 12:** "Teach a friend" mode (export explanations)

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

## 🎓 Educational Framework - Core Differentiator

### **ShepKit's Educational Mission**

ShepKit isn't just an app builder - it's **the best way to learn modern development** through ShepLang's elegant design. The AI assistant serves as both a **code generator** and a **patient teacher**.

### **Supported Languages & Learning Path**

**Primary Languages (ShepKit Native):**
- ✅ **ShepLang** - The elegant DSL for non-technical founders
- ✅ **BobaScript** - The runtime/VM layer (generated from ShepLang)

**Secondary Languages (Educational Context):**
- ✅ **TypeScript** - What BobaScript compiles to (show the connection)
- ✅ **JavaScript** - The final runtime (explain the full pipeline)

**Learning Philosophy:**
```
Idea → ShepLang → BobaScript → TypeScript → JavaScript → Running App
      ↑         ↑            ↑           ↑
   Natural   Elegant      Structured   Universal
  Language   Syntax       Types        Runtime
```

### **AI Educational Modes**

#### **1. Explain Mode (Core Feature)**
**Trigger:** Right-click any code → "Explain This"

**Example Flow:**
```sheplang
data Task {
  fields: {
    title: text
    completed: boolean
    dueDate: date
  }
  rules: [
    user can add tasks
    user can update own tasks
  ]
}
```

**AI Response:**
> "This creates a **Task data model**. Let me break it down:
> 
> **`data Task`** - Defines a new data type called Task
> **`fields:`** - Lists what information each task stores
> **`title: text`** - Each task has a title (like 'Buy groceries')
> **`completed: boolean`** - True/false for whether it's done
> **`dueDate: date`** - When the task is due
> **`rules:`** - Who can do what with tasks
> 
> **Behind the scenes:** This becomes a TypeScript interface and database schema. Want to see the generated code?"

#### **2. Show Me the Code Mode**
**Trigger:** "Show me the [BobaScript/TypeScript/JavaScript]"

**Side-by-Side View:**
```
┌─ ShepLang ─────────────┐  ┌─ BobaScript ──────────────┐
│ data Task {            │  │ interface Task {          │
│   fields: {            │  │   title: string;          │
│     title: text        │  │   completed: boolean;     │
│     completed: boolean │  │   dueDate: Date;          │
│   }                    │  │ }                         │
│ }                      │  │                           │
└────────────────────────┘  └───────────────────────────┘
```

#### **3. Teach Me Mode**
**Trigger:** "I want to learn about [concept]"

**Interactive Lessons:**
- **Data Modeling**: "Let's build a library system together"
- **User Permissions**: "Who should access what in your app?"
- **App Flow**: "How users navigate through screens"
- **Deployment**: "Getting your app live on the internet"

#### **4. Why This Way Mode**
**Trigger:** Hover over syntax elements

**Tooltips:**
- `fields: { ... }` → "Why we group data fields together"
- `rules: [ ... ]` → "Why security rules are separate from data"
- `view TaskList` → "Why views are different from data"

### **Educational AI System Prompt**

```typescript
const EDUCATIONAL_SYSTEM_PROMPT = `You are ShepKit's AI teacher, helping non-technical founders learn development through ShepLang.

CORE MISSION: Make programming concepts accessible and exciting.

LANGUAGES YOU TEACH:
✅ ShepLang (primary) - Elegant, founder-friendly syntax
✅ BobaScript (generated) - Structured intermediate representation  
✅ TypeScript (compiled) - Type-safe JavaScript
✅ JavaScript (runtime) - What actually runs in browsers

TEACHING PRINCIPLES:
1. Start with the "why" before the "how"
2. Use real-world analogies (restaurants, libraries, stores)
3. Show the progression: ShepLang → BobaScript → TypeScript → JavaScript
4. Celebrate small wins ("Great! You just created your first data model!")
5. Connect concepts to business value ("This rule prevents data breaches")

EXPLANATION STYLE:
- Use friendly, encouraging tone
- Break complex concepts into bite-sized pieces
- Provide concrete examples
- Show both the ShepLang way AND the traditional way
- Always offer to dive deeper or simplify

NEVER:
- Overwhelm with technical jargon
- Skip the educational value for speed
- Generate code without explaining it
- Assume prior programming knowledge

ALWAYS:
- Explain WHY something works this way
- Show the business impact
- Offer to explain underlying concepts
- Provide next learning steps`;
```

### **Educational Features Implementation**

#### **Phase 2 Addition: Educational Core (Calls 6-8)**

**Call 6: Explain Mode**
```typescript
// Add to useShepKitAI hook
const explainCode = async (code: string, selection?: string) => {
  const response = await fetch('/api/ai/shepkit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'explain',
      input: selection || code,
      context: {
        currentFile: context.currentFile,
        educationLevel: 'beginner', // beginner | intermediate | advanced
        showComparisons: true, // Show BobaScript/TypeScript equivalents
      },
    }),
  });
  return response.json();
};
```

**Call 7: Code Comparison View**
```typescript
// Component: CodeComparisonPanel
const CodeComparisonPanel = ({ shepLangCode }: { shepLangCode: string }) => {
  const [showBoba, setShowBoba] = useState(false);
  const [showTypeScript, setShowTypeScript] = useState(false);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3>ShepLang (What You Write)</h3>
        <CodeEditor value={shepLangCode} language="sheplang" readOnly />
      </div>
      
      {showBoba && (
        <div>
          <h3>BobaScript (Generated)</h3>
          <CodeEditor value={bobaCode} language="typescript" readOnly />
        </div>
      )}
      
      {showTypeScript && (
        <div>
          <h3>TypeScript (Compiled)</h3>
          <CodeEditor value={tsCode} language="typescript" readOnly />
        </div>
      )}
    </div>
  );
};
```

**Call 8: Interactive Tutorials**
```typescript
// Built-in tutorial system
const tutorials = [
  {
    id: 'first-app',
    title: 'Your First App: Task Manager',
    steps: [
      {
        instruction: "Let's create a Task data model. Type this:",
        code: `data Task {\n  fields: {\n    title: text\n  }\n}`,
        explanation: "This creates a blueprint for tasks in your app.",
        nextConcept: "data-fields"
      },
      // ... more steps
    ]
  },
  // ... more tutorials
];
```

### **Educational UI Components**

#### **1. Explain Panel**
```typescript
const ExplainPanel = ({ explanation, code, showComparisons }) => (
  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
    <div className="flex items-start gap-3">
      <BookOpenIcon className="w-5 h-5 text-blue-600 mt-1" />
      <div>
        <h4 className="font-semibold text-blue-900">Understanding This Code</h4>
        <div className="prose prose-sm mt-2">{explanation}</div>
        
        {showComparisons && (
          <div className="mt-4 space-y-2">
            <button onClick={() => setShowBoba(!showBoba)}>
              🔍 Show BobaScript Version
            </button>
            <button onClick={() => setShowTS(!showTS)}>
              🔍 Show TypeScript Version
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
```

#### **2. Learning Progress Tracker**
```typescript
const LearningProgress = ({ user }) => (
  <div className="bg-green-50 p-4 rounded-lg">
    <h4 className="font-semibold text-green-900">Your Learning Journey</h4>
    <div className="mt-2 space-y-2">
      <ProgressBar label="Data Modeling" progress={75} />
      <ProgressBar label="User Permissions" progress={50} />
      <ProgressBar label="App Deployment" progress={25} />
    </div>
    <p className="text-sm text-green-700 mt-2">
      🎉 You've mastered the basics! Ready for intermediate concepts?
    </p>
  </div>
);
```

#### **3. Concept Tooltips**
```typescript
const ConceptTooltip = ({ concept, children }) => (
  <Tooltip
    content={
      <div className="max-w-xs">
        <h5 className="font-semibold">{concept.title}</h5>
        <p className="text-sm mt-1">{concept.explanation}</p>
        <button className="text-blue-600 text-sm mt-2">
          Learn more about {concept.title} →
        </button>
      </div>
    }
  >
    {children}
  </Tooltip>
);
```

### **Educational API Routes**

#### **Explain Mode Handler**
```typescript
async function handleExplain(input: string, context: any) {
  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      explanation: z.string(),
      keyPoints: z.array(z.string()),
      bobaScriptEquivalent: z.string().optional(),
      typeScriptEquivalent: z.string().optional(),
      businessValue: z.string(),
      nextSteps: z.array(z.string()),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    }),
    system: EDUCATIONAL_SYSTEM_PROMPT,
    prompt: `Explain this ShepLang code in a friendly, educational way:

${input}

Context: ${JSON.stringify(context)}

Focus on:
1. What this code does in plain English
2. Why it's structured this way
3. How it helps build better apps
4. What the user should learn next`,
  });
  
  return Response.json(result.object);
}
```

### **Learning Pathways**

#### **Beginner Path: "From Idea to App"**
1. **Concepts First**: What is an app? Data? Users? Screens?
2. **ShepLang Basics**: Your first data model
3. **Adding Behavior**: Rules and actions
4. **User Interface**: Views and navigation
5. **Going Live**: Deployment and sharing

#### **Intermediate Path: "Building Real Apps"**
1. **Complex Data**: Relationships between models
2. **Advanced Rules**: Complex permissions and validation
3. **User Experience**: Forms, lists, and interactions
4. **Performance**: Making apps fast and reliable
5. **Scaling**: Handling more users and data

#### **Advanced Path: "Understanding the Stack"**
1. **BobaScript Deep Dive**: How ShepLang becomes BobaScript
2. **TypeScript Connection**: Type safety and compilation
3. **Runtime Behavior**: How JavaScript executes your app
4. **Architecture Patterns**: Building maintainable systems
5. **Custom Extensions**: Extending ShepKit itself

### **Educational Success Metrics**

#### **Learning Engagement**
- Time spent in Explain mode
- Tutorial completion rates
- Code comparison usage
- Question frequency in chat

#### **Skill Progression**
- Concepts mastered per session
- Code quality improvements
- Independent problem-solving
- Advanced feature adoption

#### **Knowledge Transfer**
- Ability to explain ShepLang to others
- Understanding of underlying technologies
- Confidence in building complex apps
- Transition to traditional development (if desired)

### **Educational Content Examples**

#### **Data Modeling Lesson**
```
👨‍🏫 "Think of data like organizing a filing cabinet:

📁 Each 'data' block is a file folder type
📄 Each 'field' is a form you fill out
🔒 Each 'rule' is who can access which files

In ShepLang:
data Customer {
  fields: {
    name: text        // 📝 Customer's name
    email: text       // 📧 How to contact them
    joinDate: date    // 📅 When they signed up
  }
  rules: [
    admin can manage customers    // 👑 Full access
    user can view own profile     // 👤 Limited access
  ]
}

This becomes a database table, TypeScript types, and API endpoints automatically!"
```

#### **App Flow Lesson**
```
👨‍🏫 "Apps are like guided tours through your data:

🏠 Landing page: 'Welcome! What would you like to do?'
📋 List view: 'Here are all your tasks'
✏️ Edit form: 'Change this task'
✅ Success page: 'Task updated!'

In ShepLang:
view TaskDashboard {
  list: Task
  buttons: [
    "Add Task" -> createTask()     // 🚀 Start new task
    "View Done" -> completedTasks() // ✅ See finished work
  ]
}

Each view is a screen in your app!"
```

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
