# Tasks: Phase 1 - Foundation

**Plan:** [shepkit-ai-core.plan.md](../plans/shepkit-ai-core.plan.md)  
**Phase:** 1 of 4  
**Status:** Ready to Execute

---

## Task 1.1: Spec Review & Constitution Update ✅

**Status:** ✅ COMPLETE  
**Estimated Time:** 15 minutes  
**Actual Time:** 20 minutes

**Acceptance Criteria:**
- [x] Spec created and reviewed
- [x] Plan created and structured
- [x] Tasks broken down
- [x] Constitution alignment verified (scope.md)

**Artifacts:**
- [x] `.specify/specs/shepkit-ai-core.spec.md`
- [x] `.specify/plans/shepkit-ai-core.plan.md`
- [x] `.specify/tasks/phase1-foundation.tasks.md`

**Completed:** 2025-01-13

---

## Task 1.2: Install Dependencies & Environment Setup

**Status:** ⏭️ READY  
**Estimated Time:** 5 minutes  
**Dependencies:** None  
**Blocking:** Task 1.3+

### Objective
Add Vercel AI SDK dependencies and configure environment variables for ShepKit AI integration.

### Files to Modify

**1. `sheplang/shepkit/package.json`**
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

**2. `sheplang/shepkit/.env.example`**
```bash
# ... existing vars

# AI SDK Configuration
OPENAI_API_KEY=sk-...
SHEPKIT_AI_MODEL=gpt-4o
SHEPKIT_AI_MAX_TOKENS=4096
NEXT_PUBLIC_SHEPKIT_AI_ENABLED=true
```

**3. `sheplang/shepkit/.env.local` (create, gitignored)**
```bash
# Copy from .env.example and add real values
OPENAI_API_KEY=sk-proj-...
SHEPKIT_AI_MODEL=gpt-4o
SHEPKIT_AI_MAX_TOKENS=4096
NEXT_PUBLIC_SHEPKIT_AI_ENABLED=true
```

### Commands
```bash
cd sheplang/shepkit
pnpm install
```

### Validation Steps
- [ ] Run `pnpm install` successfully
- [ ] No dependency conflicts
- [ ] `.env.example` updated
- [ ] `.env.local` created and gitignored
- [ ] Environment variables load in dev mode

### Testing
```bash
# Verify install
cd sheplang/shepkit
pnpm list ai @ai-sdk/openai @ai-sdk/react zod

# Start dev server
pnpm dev

# Should start without errors
```

### Rollback Plan
```bash
# If issues occur
git restore sheplang/shepkit/package.json
pnpm install
```

### Notes
- OpenAI API key required (user must provide)
- Add to Vercel env vars for deployment
- Cost monitoring setup recommended

---

## Task 1.3: Create Core API Route

**Status:** ⏳ BLOCKED (waiting on 1.2)  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 1.2  
**Blocking:** Task 1.4, 1.5

### Objective
Implement `/api/ai/shepkit` route with mode detection, Zod validation, and ShepLang-aware system prompts.

### Files to Create

**1. `sheplang/shepkit/app/api/ai/shepkit/route.ts`**

See implementation in [shepkit-ai-core.plan.md](../plans/shepkit-ai-core.plan.md#call-3-create-core-api-route)

### Key Features
- ✅ Edge runtime for fast responses
- ✅ Zod schema validation
- ✅ Mode detection (chat, generate, explain, debug, scaffold)
- ✅ ShepLang-aware system prompts
- ✅ Educational system prompts
- ✅ Structured responses (generateObject)
- ✅ Streaming support (streamText)
- ✅ Error handling with friendly messages

### Validation Steps
- [ ] Route accessible at `/api/ai/shepkit`
- [ ] POST requests validated with Zod
- [ ] All 5 modes work correctly
- [ ] Error responses are friendly
- [ ] Streaming works for chat mode
- [ ] Structured responses for generate/explain/debug

### Testing
```bash
# Test generate mode
curl -X POST http://localhost:3000/api/ai/shepkit \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "generate",
    "input": "Create a task manager",
    "context": {}
  }'

# Should return structured ShepLang component

# Test explain mode
curl -X POST http://localhost:3000/api/ai/shepkit \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "explain",
    "input": "data Task { fields: { title: text } }",
    "context": {}
  }'

# Should return friendly explanation

# Test validation error
curl -X POST http://localhost:3000/api/ai/shepkit \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "invalid"
  }'

# Should return 400 with Zod error
```

### Rollback Plan
```bash
# Delete route file
rm sheplang/shepkit/app/api/ai/shepkit/route.ts
```

### Notes
- System prompts are critical - must enforce ShepLang-only output
- Temperature tuned for each mode (0.7 generate, 0.5 explain/debug)
- Edge runtime required for Vercel deployment

---

## Task 1.4: Create Frontend Hook

**Status:** ⏳ BLOCKED (waiting on 1.3)  
**Estimated Time:** 20 minutes  
**Dependencies:** Task 1.3  
**Blocking:** Task 1.5

### Objective
Implement `useShepKitAI` React hook that wraps Vercel AI SDK's `useChat` with ShepKit-specific functionality.

### Files to Create

**1. `sheplang/shepkit/lib/hooks/useShepKitAI.ts`**

See implementation in [shepkit-ai-core.plan.md](../plans/shepkit-ai-core.plan.md#call-4-create-frontend-hook)

### Key Features
- ✅ Mode management (chat, generate, explain, debug, scaffold)
- ✅ Context management (current file, selection, diagnostics)
- ✅ Specialized functions (generateComponent, explainCode, debugError)
- ✅ Loading states (isGenerating, isLoading)
- ✅ Integration with useChat for streaming

### Validation Steps
- [ ] Hook compiles without TypeScript errors
- [ ] All modes accessible via setMode
- [ ] Context updates correctly
- [ ] Loading states toggle properly
- [ ] Functions return correct types

### Testing
Create test file: `sheplang/shepkit/test/hooks/useShepKitAI.test.ts`

```typescript
import { renderHook, act } from '@testing/library/react-hooks';
import { useShepKitAI } from '@/lib/hooks/useShepKitAI';

describe('useShepKitAI', () => {
  it('initializes with default mode', () => {
    const { result } = renderHook(() => useShepKitAI());
    expect(result.current.mode).toBe('chat');
  });
  
  it('changes mode correctly', () => {
    const { result } = renderHook(() => useShepKitAI());
    act(() => {
      result.current.setMode('generate');
    });
    expect(result.current.mode).toBe('generate');
  });
  
  // Add more tests...
});
```

### Rollback Plan
```bash
# Delete hook file
rm sheplang/shepkit/lib/hooks/useShepKitAI.ts
```

### Notes
- Hook must be client-side only ('use client')
- Context should be memoized to prevent unnecessary re-renders
- Error handling should be graceful

---

## Task 1.5: Wire Up AIAssistant Component

**Status:** ⏳ BLOCKED (waiting on 1.4)  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 1.4  
**Blocking:** Phase 2

### Objective
Replace placeholder AIAssistant with fully functional component using `useShepKitAI` hook.

### Files to Modify

**1. `sheplang/shepkit/components/AIAssistant.tsx`**

See implementation in [shepkit-ai-core.plan.md](../plans/shepkit-ai-core.plan.md#call-5-wire-up-aiassistant-component)

### Key Features
- ✅ Mode switcher UI (4 buttons with icons)
- ✅ Message display with streaming
- ✅ Input field with mode-specific placeholders
- ✅ Loading animations
- ✅ Responsive layout
- ✅ Tailwind CSS styling

### Validation Steps
- [ ] Component renders without errors
- [ ] Mode switching updates UI
- [ ] Chat messages display correctly
- [ ] Input placeholder changes with mode
- [ ] Loading states show animations
- [ ] Messages scroll automatically

### Testing

**Manual Testing:**
1. Open ShepKit in browser
2. Click each mode button - verify UI updates
3. Type in chat input - verify message sent
4. Wait for AI response - verify streaming
5. Switch modes mid-chat - verify behavior

**Unit Testing:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AIAssistant } from '@/components/AIAssistant';

describe('AIAssistant', () => {
  it('renders mode buttons', () => {
    render(<AIAssistant />);
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Generate')).toBeInTheDocument();
    expect(screen.getByText('Explain')).toBeInTheDocument();
    expect(screen.getByText('Debug')).toBeInTheDocument();
  });
  
  it('switches mode on button click', () => {
    render(<AIAssistant />);
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);
    expect(generateButton).toHaveClass('bg-blue-500');
  });
});
```

### Rollback Plan
```bash
# Restore original placeholder
git restore sheplang/shepkit/components/AIAssistant.tsx
```

### Notes
- Ensure Heroicons installed (@heroicons/react)
- Tailwind classes must match existing design system
- Accessibility: keyboard navigation, ARIA labels

---

## Phase 1 Summary

**Total Tasks:** 5  
**Completed:** 1  
**Remaining:** 4  
**Estimated Time:** ~1 hour 45 minutes  
**Blockers:** None (ready to proceed)

### Execution Order
1. ✅ Task 1.1: Spec Review (DONE)
2. ⏭️ Task 1.2: Dependencies (NEXT)
3. ⏭️ Task 1.3: API Route (AFTER 1.2)
4. ⏭️ Task 1.4: Frontend Hook (AFTER 1.3)
5. ⏭️ Task 1.5: AIAssistant Component (AFTER 1.4)

### Success Criteria (Phase 1)
- [ ] All dependencies installed
- [ ] API route responds to all modes
- [ ] Frontend hook works correctly
- [ ] AIAssistant UI functional
- [ ] Basic chat interaction working
- [ ] All tests passing

### Next Phase Unlock
Phase 2 (Educational Features) unlocks when:
- ✅ All Phase 1 tasks complete
- ✅ Manual testing confirms functionality
- ✅ No critical bugs

---

**Ready to Execute:** Task 1.2 (Install Dependencies)  
**Command:** Proceed with `pnpm install` in `sheplang/shepkit`
