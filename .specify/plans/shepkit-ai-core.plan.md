# Technical Plan: ShepKit AI Core Integration

**Spec:** [shepkit-ai-core.spec.md](../specs/shepkit-ai-core.spec.md)  
**Status:** Ready for Implementation  
**Estimated Effort:** 20 Windsurf Calls  
**Target Completion:** Phase 1-3 (Phases 2-4 optional enhancements)

---

## Phase 1: Foundation (Calls 1-5)

### Call 1: Spec Review & Constitution Update ✅ COMPLETE
**Status:** ✅ Done  
**Artifacts Created:**
- [x] `.specify/specs/shepkit-ai-core.spec.md`
- [x] `.specify/plans/shepkit-ai-core.plan.md`
- [x] `.specify/tasks/` (will be created)

**Validation:**
- [x] Spec aligns with scope.md rules
- [x] Educational framework preserved
- [x] ShepLang-only focus maintained

---

### Call 2: Install Dependencies & Environment Setup

**Objective:** Add AI SDK dependencies and configure environment

**Files to Modify:**
1. `sheplang/shepkit/package.json`
2. `sheplang/shepkit/.env.example`
3. `sheplang/shepkit/.env.local` (gitignored)

**Implementation:**

**File:** `sheplang/shepkit/package.json`
```json
{
  "dependencies": {
    // ... existing
    "ai": "^3.4.0",
    "@ai-sdk/openai": "^0.0.66",
    "@ai-sdk/react": "^0.0.66",
    "zod": "^3.22.0"
  }
}
```

**File:** `sheplang/shepkit/.env.example`
```bash
# Existing vars...

# AI SDK Configuration
OPENAI_API_KEY=sk-...
SHEPKIT_AI_MODEL=gpt-4o
SHEPKIT_AI_MAX_TOKENS=4096
NEXT_PUBLIC_SHEPKIT_AI_ENABLED=true
```

**Commands:**
```bash
cd sheplang/shepkit
pnpm install
```

**Validation:**
- [ ] Dependencies installed successfully
- [ ] No version conflicts
- [ ] `.env.example` updated
- [ ] Environment variables documented

**Estimated Time:** 5 minutes

---

### Call 3: Create Core API Route

**Objective:** Implement `/api/ai/shepkit` route with mode detection

**Files to Create:**
1. `sheplang/shepkit/app/api/ai/shepkit/route.ts`

**Implementation:**

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, generateObject } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';
export const maxDuration = 30;

// ============================================================================
// SCHEMAS
// ============================================================================

const ShepKitAIRequest = z.object({
  mode: z.enum(['chat', 'generate', 'explain', 'debug', 'scaffold']),
  input: z.string().min(1).max(5000),
  context: z.object({
    currentFile: z.string().optional(),
    fileContent: z.string().optional(),
    cursorPosition: z.number().optional(),
    selection: z.string().optional(),
    diagnostics: z.array(z.any()).optional(),
  }).optional(),
});

const ShepLangComponentSchema = z.object({
  code: z.string(),
  explanation: z.string(),
  componentName: z.string(),
  educationalNotes: z.array(z.string()).optional(),
  bobaScriptEquivalent: z.string().optional(),
  diagnostics: z.array(z.object({
    line: z.number(),
    message: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
  })).optional(),
});

const ExplanationSchema = z.object({
  explanation: z.string(),
  keyPoints: z.array(z.string()),
  bobaScriptEquivalent: z.string().optional(),
  typeScriptEquivalent: z.string().optional(),
  businessValue: z.string(),
  realWorldAnalogy: z.string().optional(),
  nextSteps: z.array(z.string()),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

const SHEPLANG_SYSTEM_PROMPT = `You are an AI assistant for ShepKit, a visual IDE for the ShepLang programming language.

ShepLang Syntax (Official):
- app AppName { ... }
- data ModelName { fields: { ... }, rules: [ ... ] }
- view ViewName { list: DataName, buttons: [ ... ] }
- action ActionName(params) { ops: [...] }

Your role:
1. Generate valid, syntactically correct ShepLang code
2. Explain ShepLang concepts to non-technical users
3. Debug ShepLang errors with friendly explanations
4. Scaffold complete apps from descriptions

CRITICAL RULES:
- ONLY generate code in ShepLang syntax
- NEVER output TypeScript, JavaScript, or other languages
- Always validate syntax before responding
- Use friendly, non-technical language in explanations
- Show the full pipeline: ShepLang → BobaScript → TypeScript → JavaScript when educational`;

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

// ============================================================================
// HANDLERS
// ============================================================================

async function handleGenerate(input: string, context: any) {
  const result = await generateObject({
    model: openai(process.env.SHEPKIT_AI_MODEL || 'gpt-4o'),
    schema: ShepLangComponentSchema,
    system: SHEPLANG_SYSTEM_PROMPT,
    prompt: `Generate a ShepLang component for: ${input}

Context: ${JSON.stringify(context, null, 2)}

Requirements:
1. Generate ONLY valid ShepLang code
2. Include data models, views, and actions as needed
3. Follow ShepLang syntax exactly
4. Provide friendly explanation
5. Include educational notes about design decisions`,
    temperature: 0.7,
  });
  
  return Response.json(result.object);
}

async function handleExplain(input: string, context: any) {
  const result = await generateObject({
    model: openai(process.env.SHEPKIT_AI_MODEL || 'gpt-4o'),
    schema: ExplanationSchema,
    system: EDUCATIONAL_SYSTEM_PROMPT,
    prompt: `Explain this ShepLang code in a friendly, educational way:

${input}

Context: ${JSON.stringify(context, null, 2)}

Focus on:
1. What this code does in plain English
2. Why it's structured this way
3. How it helps build better apps
4. Real-world analogy if possible
5. What the user should learn next

Make it encouraging and beginner-friendly!`,
    temperature: 0.5,
  });
  
  return Response.json(result.object);
}

async function handleDebug(input: string, context: any) {
  const result = await generateObject({
    model: openai(process.env.SHEPKIT_AI_MODEL || 'gpt-4o'),
    schema: z.object({
      problem: z.string(),
      explanation: z.string(),
      fix: z.string(),
      fixedCode: z.string(),
      proTip: z.string(),
      educationalNote: z.string(),
    }),
    system: EDUCATIONAL_SYSTEM_PROMPT,
    prompt: `Debug this ShepLang error with patience and kindness:

Error: ${input}
Code: ${context?.fileContent || 'N/A'}

Provide:
1. What the problem is (in plain English)
2. Why ShepLang requires this (educational)
3. How to fix it (step-by-step)
4. The corrected code
5. A pro tip to avoid this in the future
6. What this teaches about app development

Be encouraging! Mistakes are learning opportunities.`,
    temperature: 0.5,
  });
  
  return Response.json(result.object);
}

async function handleChat(input: string, context: any) {
  const result = streamText({
    model: openai(process.env.SHEPKIT_AI_MODEL || 'gpt-4o'),
    system: EDUCATIONAL_SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: input }
    ],
    temperature: 0.7,
  });
  
  return result.toDataStreamResponse();
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = ShepKitAIRequest.parse(body);
    
    const { mode, input, context } = validated;
    
    // Mode-specific handling
    switch (mode) {
      case 'generate':
        return handleGenerate(input, context);
      case 'explain':
        return handleExplain(input, context);
      case 'debug':
        return handleDebug(input, context);
      case 'chat':
      default:
        return handleChat(input, context);
    }
  } catch (error) {
    console.error('ShepKit AI Error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Validation:**
- [ ] Route responds to POST requests
- [ ] Zod validation works
- [ ] All modes handled correctly
- [ ] Error handling works
- [ ] Environment variables loaded

**Estimated Time:** 30 minutes

---

### Call 4: Create Frontend Hook

**Objective:** Implement `useShepKitAI` React hook

**Files to Create:**
1. `sheplang/shepkit/lib/hooks/useShepKitAI.ts`

**Implementation:**

```typescript
'use client';

import { useChat } from 'ai/react';
import { useState, useCallback } from 'react';

export type AIMode = 'chat' | 'generate' | 'explain' | 'debug' | 'scaffold';

export interface AIContext {
  currentFile?: string;
  fileContent?: string;
  cursorPosition?: number;
  selection?: string;
  diagnostics?: any[];
}

export function useShepKitAI(initialMode: AIMode = 'chat') {
  const [mode, setMode] = useState<AIMode>(initialMode);
  const [context, setContext] = useState<AIContext>({});
  const [isGenerating, setIsGenerating] = useState(false);
  
  const chat = useChat({
    api: '/api/ai/shepkit',
    body: { mode, context },
  });
  
  const generateComponent = useCallback(async (description: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/shepkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate',
          input: description,
          context,
        }),
      });
      
      if (!response.ok) throw new Error('Generation failed');
      return await response.json();
    } finally {
      setIsGenerating(false);
    }
  }, [context]);
  
  const explainCode = useCallback(async (code: string, selection?: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/shepkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explain',
          input: selection || code,
          context: { ...context, selection },
        }),
      });
      
      if (!response.ok) throw new Error('Explanation failed');
      return await response.json();
    } finally {
      setIsGenerating(false);
    }
  }, [context]);
  
  const debugError = useCallback(async (error: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/shepkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'debug',
          input: error,
          context,
        }),
      });
      
      if (!response.ok) throw new Error('Debug failed');
      return await response.json();
    } finally {
      setIsGenerating(false);
    }
  }, [context]);
  
  return {
    // Chat functionality
    ...chat,
    
    // AI modes
    mode,
    setMode,
    
    // Context management
    context,
    setContext,
    
    // Specialized functions
    generateComponent,
    explainCode,
    debugError,
    
    // State
    isGenerating,
  };
}
```

**Validation:**
- [ ] Hook compiles without errors
- [ ] All modes accessible
- [ ] Context management works
- [ ] Loading states handled

**Estimated Time:** 20 minutes

---

### Call 5: Wire Up AIAssistant Component

**Objective:** Replace placeholder with real AI functionality

**Files to Modify:**
1. `sheplang/shepkit/components/AIAssistant.tsx`

**Implementation:**

```typescript
'use client';

import { useState } from 'react';
import { useShepKitAI, AIMode } from '@/lib/hooks/useShepKitAI';
import { SparklesIcon, BookOpenIcon, BugAntIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

export function AIAssistant() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    mode,
    setMode,
    generateComponent,
    explainCode,
    debugError,
    isGenerating,
    isLoading,
  } = useShepKitAI();
  
  const [showComparison, setShowComparison] = useState(false);
  
  const modes: Array<{ id: AIMode; label: string; icon: any; description: string }> = [
    {
      id: 'chat',
      label: 'Chat',
      icon: SparklesIcon,
      description: 'Ask questions about ShepLang',
    },
    {
      id: 'generate',
      label: 'Generate',
      icon: RocketLaunchIcon,
      description: 'Create components from descriptions',
    },
    {
      id: 'explain',
      label: 'Explain',
      icon: BookOpenIcon,
      description: 'Understand your code',
    },
    {
      id: 'debug',
      label: 'Debug',
      icon: BugAntIcon,
      description: 'Fix errors with guidance',
    },
  ];
  
  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Mode Switcher */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                mode === m.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <m.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{m.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {modes.find((m) => m.id === mode)?.description}
        </p>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {(isLoading || isGenerating) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={
              mode === 'generate'
                ? 'Describe your component...'
                : mode === 'explain'
                ? 'Select code to explain'
                : mode === 'debug'
                ? 'Paste error message'
                : 'Ask about ShepLang...'
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || isGenerating}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isGenerating}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Validation:**
- [ ] Component renders without errors
- [ ] Mode switching works
- [ ] Chat input/submit works
- [ ] Messages display correctly
- [ ] Loading states show

**Estimated Time:** 30 minutes

---

## Phase 2: Core Educational Features (Calls 6-10)

### Call 6: Explain Mode UI

**Objective:** Add ExplainPanel component with code comparison

**Files to Create:**
1. `sheplang/shepkit/components/ExplainPanel.tsx`

**Features:**
- Display friendly explanations
- Show key learning points
- Toggle BobaScript/TypeScript views
- "Learn More" button

**Estimated Time:** 25 minutes

---

### Call 7: Code Comparison View

**Objective:** Side-by-side ShepLang ↔ BobaScript ↔ TypeScript

**Files to Create:**
1. `sheplang/shepkit/components/CodeComparisonPanel.tsx`

**Features:**
- Three-column layout (responsive)
- Syntax highlighting for all languages
- Transformation arrows/annotations
- Copy buttons for each version

**Estimated Time:** 30 minutes

---

### Call 8: Interactive Tutorial System

**Objective:** Built-in guided learning

**Files to Create:**
1. `sheplang/shepkit/components/TutorialSystem.tsx`
2. `sheplang/shepkit/lib/tutorials/` (tutorial definitions)

**Features:**
- Step-by-step instructions
- Interactive code editor
- Progress tracking
- AI celebration messages
- Badge system

**Estimated Time:** 40 minutes

---

### Call 9: Component Generation with Explanation

**Objective:** Enhanced generate mode with educational context

**Features:**
- Preview pane for generated code
- Inline annotations
- "Why this way?" tooltips
- Insert button with validation

**Estimated Time:** 25 minutes

---

### Call 10: Friendly Error Debugging

**Objective:** Patient teacher error explanations

**Files to Modify:**
1. Monaco editor integration
2. AIAssistant debug mode

**Features:**
- "Ask AI to Fix" button on errors
- Friendly error breakdown
- Annotated fix with arrows
- "Apply Fix" button
- Pro tips

**Estimated Time:** 30 minutes

---

## Phase 3: Polish & Testing (Calls 11-15)

### Call 11: Monaco Editor Integration

**Objective:** Right-click context menu for AI features

**Features:**
- "Explain This" context action
- "Generate with AI" command
- "Ask AI to Fix" on errors

**Estimated Time:** 25 minutes

---

### Call 12: Learning Progress Tracker

**Objective:** Track and display user learning journey

**Features:**
- Concepts mastered counter
- Tutorial completion badges
- Personalized next steps
- Share progress option

**Estimated Time:** 20 minutes

---

### Call 13: Testing Suite

**Objective:** Comprehensive tests for AI features

**Files to Create:**
1. `sheplang/shepkit/test/ai/api-route.test.ts`
2. `sheplang/shepkit/test/ai/hooks.test.ts`
3. `sheplang/shepkit/test/ai/components.test.ts`

**Test Coverage:**
- API route validation
- Mode handling
- Error responses
- Frontend hook logic
- Component rendering

**Estimated Time:** 35 minutes

---

### Call 14: Performance Optimization

**Objective:** Optimize for speed and cost

**Optimizations:**
- Response caching (Redis/KV)
- Prompt compression
- Streaming for long responses
- Debounced requests
- Token usage monitoring

**Estimated Time:** 25 minutes

---

### Call 15: Documentation

**Objective:** User and developer docs

**Files to Create:**
1. `docs/AI_Assistant_Guide.md` (user-facing)
2. `docs/AI_API_Reference.md` (developer)
3. Update main README

**Content:**
- Getting started guide
- Mode explanations
- Best practices
- Troubleshooting
- API reference

**Estimated Time:** 30 minutes

---

## Phase 4: Advanced (Optional - Calls 16-20)

### Call 16-17: Agent Framework

**Objective:** Intelligent multi-step workflows

**Features:**
- DeploymentAgent (syntax → build → deploy)
- ScaffoldingAgent (idea → full app)
- DebugAgent (analyze → fix → verify)

**Estimated Time:** 60 minutes (2 calls)

---

### Call 18: Workflow Patterns

**Objective:** Advanced orchestration

**Patterns:**
- Sequential (step-by-step generation)
- Parallel (multiple components at once)
- Evaluator-Optimizer (generate → improve)

**Estimated Time:** 30 minutes

---

### Call 19: Advanced Educational Features

**Objective:** Next-level learning

**Features:**
- "Teach a Friend" export mode
- Custom learning paths
- Concept dependency graph
- Spaced repetition quizzes

**Estimated Time:** 40 minutes

---

### Call 20: Production Hardening

**Objective:** Enterprise-ready deployment

**Enhancements:**
- Multi-provider support (Anthropic, etc.)
- Advanced caching strategies
- A/B testing framework
- Analytics dashboard
- Cost optimization

**Estimated Time:** 35 minutes

---

## Total Effort Estimate

**Phase 1 (Core):** ~2 hours (5 calls)  
**Phase 2 (Educational):** ~2.5 hours (5 calls)  
**Phase 3 (Polish):** ~2.3 hours (5 calls)  
**Phase 4 (Advanced):** ~2.7 hours (5 calls)  

**Total:** ~9.5 hours across 20 Windsurf calls

---

## Dependencies & Prerequisites

**Before Starting:**
- [x] Spec approved
- [x] Constitution reviewed (scope.md)
- [x] OpenAI API key obtained
- [ ] Vercel AI SDK documentation reviewed
- [ ] ShepLang syntax frozen (SYNTAX_FREEZE.md)

**External Dependencies:**
- OpenAI API (GPT-4o)
- Vercel deployment
- pnpm workspace setup

---

## Success Criteria

**Phase 1 Complete:**
- [ ] AI route responds to all modes
- [ ] Frontend hook works in UI
- [ ] Basic chat interaction functional

**Phase 2 Complete:**
- [ ] Generate valid ShepLang components
- [ ] Explain code with friendly language
- [ ] Debug errors patiently
- [ ] Tutorial system working

**Phase 3 Complete:**
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Documentation complete

**Phase 4 Complete:**
- [ ] Agent workflows functional
- [ ] Production-ready deployment
- [ ] Analytics tracking live

---

## Risk Management

| Risk | Mitigation | Owner |
|------|------------|-------|
| OpenAI API costs | Caching, rate limiting, prompt optimization | Founder |
| Invalid code generation | Pre-validation, Zod schemas, syntax checks | Windsurf |
| Slow response times | Edge runtime, streaming, caching | Windsurf |
| Confusing explanations | User feedback, A/B testing, iteration | Founder |

---

## Next Steps

1. ✅ Review and approve this plan
2. ⏭️ Create task breakdown for Phase 1
3. ⏭️ Execute Call 2 (Dependencies)
4. ⏭️ Execute Call 3 (API Route)
5. ⏭️ Continue through phases

---

**Plan Status:** ✅ Ready for Execution  
**Approved By:** [Pending Founder Review]
