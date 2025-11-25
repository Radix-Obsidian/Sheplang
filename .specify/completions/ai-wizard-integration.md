# AI-Powered Wizard Integration Spec

**Date:** November 20, 2025  
**Status:** ✅ IMPLEMENTED  
**Priority:** HIGH - Dramatically improves user confidence in import accuracy

---

## Implementation Status

**✅ COMPLETED** - All phases implemented with freemium model:
- Company API key (stored securely)
- User API key override (power users)
- 1 import/month free tier
- Usage tracking and limits
- AI interpretation with fallback
- Feedback collection system

See `AI_INTEGRATION_SETUP.md` for setup instructions.

---

## Problem

The current wizard has two critical UX issues:

1. **Free-form input misinterpretation**: When users describe their app in natural language (e.g., "It's just a sidebar component"), the system treats it as entity names, creating bogus data models.

2. **Limited code understanding**: The AST parsers are brittle and miss semantic meaning. A 35K-line component gets reduced to generic "Handleclick" actions without understanding the actual business logic.

**User feedback:** "I don't know if the wizard actually understood what I typed" - confidence issue.

---

## Solution: Anthropic Claude Integration

Use **Claude 3.5 Sonnet** (best code understanding) to:

1. **Interpret wizard inputs** - Understand natural language and extract structured data
2. **Analyze imported code** - Deeply understand component semantics beyond AST parsing
3. **Generate meaningful ShepLang** - Create code that reflects actual business logic

---

## Architecture

### When AI is Used

**ONLY during import + wizard flow:**
- User selects project folder
- Parser analyzes structure (existing)
- **NEW: Claude analyzes code semantics**
- Wizard asks questions
- **NEW: Claude interprets user answers**
- ShepLang generated with AI insights
- User edits/customizes (AI not involved)

**NOT used for:**
- ShepLang authoring (VS Code's chat agents handle that)
- Runtime/compilation
- Debugging
- Any other extension features

### API Choice: Anthropic Claude

**Why Claude over GPT-4 or Groq:**
- **Best code understanding** - Claude 3.5 Sonnet excels at analyzing complex codebases
- **200K context window** - Can analyze entire large files (your 35K sidebar fits easily)
- **Structured outputs** - Reliable JSON extraction
- **Fast** - Comparable to GPT-4 Turbo, much faster than base GPT-4
- **Cost-effective** - $3/$15 per million tokens (input/output)

**Alternative considered: Groq**
- Pros: Extremely fast, cheap
- Cons: Limited context (8K-32K), weaker code understanding
- Verdict: Speed isn't critical for one-time import, understanding is

---

## Implementation Plan

### Phase 1: Infrastructure (30 min)

**Add Anthropic SDK:**
```bash
cd extension
pnpm add @anthropic-ai/sdk
```

**Environment setup:**
- Add `ANTHROPIC_API_KEY` to `.env` (user provides)
- Graceful fallback if no API key (current heuristics-only behavior)
- Show info message: "Want better import accuracy? Add your Anthropic API key in settings"

**Files to create:**
- `extension/src/ai/claudeClient.ts` - Anthropic client wrapper
- `extension/src/ai/importAnalyzer.ts` - AI-powered code analysis
- `extension/src/ai/wizardInterpreter.ts` - AI-powered input interpretation

---

### Phase 2: Code Analysis (1 hour)

**Goal:** Use Claude to extract semantic meaning from complex components.

**Current approach (brittle):**
```typescript
// reactParser.ts - Simple AST traversal
function extractHandlers(component) {
  // Finds "onClick" -> names it "Handleclick"
  // Misses: What does this actually do?
}
```

**AI-enhanced approach:**
```typescript
// importAnalyzer.ts
async function analyzeComponent(filePath: string, code: string) {
  const prompt = `
Analyze this React component and extract:

1. **Business purpose** - What does this component actually do?
2. **Main entities** - What data concepts does it work with?
3. **Key actions** - What are the meaningful user interactions?
4. **State management** - What state is tracked and why?

Component: ${filePath}
\`\`\`tsx
${code}
\`\`\`

Return JSON:
{
  "purpose": "string describing what this component does",
  "entities": ["concept1", "concept2"],
  "actions": [
    {
      "name": "ActionName",
      "trigger": "button click / form submit / etc",
      "description": "what this does"
    }
  ],
  "stateTracked": ["state1", "state2"]
}
`;

  const response = await claude.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }]
  });

  return JSON.parse(extractJSON(response.content[0].text));
}
```

**What this fixes:**
- Your sidebar component: AI understands it's a "navigation sidebar" not a data management app
- Actions: "Toggle navigation" not "Handleclick"
- Entities: None detected (it's UI-only) instead of bogus entities

---

### Phase 3: Wizard Input Interpretation (1 hour)

**Goal:** Understand natural language in wizard answers.

**Current approach (keyword matching):**
```typescript
// Detects "doesn't", "component", etc. to skip
const skipPhrases = ["doesn't", "component"];
```

**AI-enhanced approach:**
```typescript
// wizardInterpreter.ts
async function interpretEntityInput(userInput: string, projectContext: string) {
  const prompt = `
User was asked: "What are the main things or concepts in your app?"

User answered: "${userInput}"

Project context: ${projectContext}

Analyze this answer:
1. Is the user describing actual data entities/concepts? (Yes/No)
2. If yes, extract the entity names as a clean array
3. If no, explain why (e.g., "User is describing it's a UI component")

Return JSON:
{
  "hasEntities": boolean,
  "entities": string[] | null,
  "reasoning": "string explaining the interpretation"
}
`;

  const response = await claude.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }]
  });

  return JSON.parse(extractJSON(response.content[0].text));
}
```

**What this fixes:**
- User types: "It's just a sidebar component" → AI understands: `{ hasEntities: false, reasoning: "UI component, not a data app" }`
- User types: "customers, projects, tasks" → AI extracts: `{ hasEntities: true, entities: ["customers", "projects", "tasks"] }`
- User types: "I'm building a todo app for teams" → AI extracts: `{ hasEntities: true, entities: ["todo", "team"] }`

**Immediate feedback:**
```typescript
if (result.hasEntities) {
  vscode.window.showInformationMessage(
    `✓ Got it! Main concepts:\n${result.entities.join(', ')}\n\n(AI interpretation: ${result.reasoning})`
  );
} else {
  vscode.window.showInformationMessage(
    `✓ Understood: ${result.reasoning}`
  );
}
```

---

### Phase 4: Enhanced ShepLang Generation (1 hour)

**Goal:** Generate ShepLang that reflects actual semantics, not just syntax.

**Current generator:**
```sheplang
// Generic, unhelpful
action Handleclick(params):
  // TODO: Implement action logic
  show Dashboard
```

**AI-enhanced generator:**
```sheplang
// Semantic, meaningful
action ToggleSidebarNavigation():
  // Expands/collapses the navigation sidebar
  // Detected from: onClick handler in SidebarDemo.tsx
  // TODO: Implement toggle logic (e.g., update sidebar state)
  show MainView
```

**Implementation:**
```typescript
// shepGenerator.ts - Enhanced with AI insights
function generateActionBlock(action: Action, aiInsights?: AIAnalysis) {
  let output = '';
  
  const description = aiInsights?.actions.find(a => 
    a.name.toLowerCase().includes(action.name.toLowerCase())
  )?.description;
  
  if (description) {
    output += `// ${description}\n`;
  }
  
  // ... rest of generation
}
```

---

## User Experience Flow

### Without AI (Current - B grade)

1. Import sidebar component
2. Wizard asks: "What are the main things or concepts?"
3. User types: "It doesn't keep track of anything"
4. System creates entity: "It doesn't keep track of anything" ❌
5. Generated code is broken/useless
6. User loses confidence

### With AI (Target - A+ grade)

1. Import sidebar component
2. **AI analyzes**: "This is a responsive navigation sidebar component"
3. Wizard asks: "What are the main things or concepts?"
4. User types: "It doesn't keep track of anything, it's just a sidebar"
5. **AI interprets**: "User confirming it's a UI component, no data entities"
6. Popup: "✓ Understood: This is a UI component without data management" ✅
7. Generated code:
```sheplang
app ResponsiveSidebarComponent

// AI Analysis: Navigation sidebar with collapsible menu
// No data entities detected - this is a pure UI component

view SidebarView:
  // Main navigation sidebar
  // TODO: Add navigation items and customize layout
  
action ToggleSidebar():
  // Expands/collapses the sidebar
  // TODO: Implement toggle animation
  show SidebarView
```
8. User sees accurate, meaningful scaffold ✅
9. **Confidence: 100%**

---

## Configuration

### Extension Settings

Add to `extension/package.json`:
```json
{
  "contributes": {
    "configuration": {
      "properties": {
        "sheplang.anthropicApiKey": {
          "type": "string",
          "default": "",
          "description": "Anthropic API key for AI-powered import analysis (optional but recommended)",
          "markdownDescription": "Get your API key from [console.anthropic.com](https://console.anthropic.com). AI improves import accuracy by understanding code semantics and natural language input."
        },
        "sheplang.useAIForImport": {
          "type": "boolean",
          "default": true,
          "description": "Use AI to analyze code and interpret wizard inputs (requires API key)"
        }
      }
    }
  }
}
```

### API Key Setup

**User flow:**
1. First import without API key
2. Info message: "Want better import accuracy? Configure your Anthropic API key"
3. Click "Configure" → Opens settings
4. User adds key from console.anthropic.com
5. Next import uses AI automatically

**Security:**
- API key stored in VS Code settings (encrypted by VS Code)
- Never logged or sent anywhere except Anthropic
- Clear messaging about data usage

---

## Cost Analysis

### Typical Import Cost

**35K-line sidebar component:**
- Input: ~35K characters ≈ 8,750 tokens
- Output: ~2K tokens (structured JSON)
- Cost: (8750 × $3 + 2000 × $15) / 1M = **$0.06 per import**

**Average project (5K lines):**
- Input: ~5K characters ≈ 1,250 tokens
- Output: ~1K tokens
- Cost: (1250 × $3 + 1000 × $15) / 1M = **$0.02 per import**

**For most users:** <$1/month even with frequent imports

---

## Fallback Strategy

**If no API key or API fails:**
1. Use current heuristic-based approach (what we have now)
2. Show message: "Import completed using basic analysis. For better accuracy, add your Anthropic API key in settings."
3. **No blocking, no errors** - graceful degradation

**This ensures:**
- Extension works out of the box
- AI is a UX enhancement, not a requirement
- Users can try it for free, then optionally upgrade experience

---

## Success Metrics

**Before (heuristics only):**
- Entity misinterpretation: 30-50% (your sidebar example)
- Generic action names: 80% ("Handleclick")
- User confidence: B grade

**After (with AI):**
- Entity accuracy: 95%+
- Meaningful action names: 90%+
- User confidence: A+ grade

**Qualitative goals:**
- User never questions if wizard understood them
- Generated code reflects actual business logic
- Immediate trust in the import tool

---

## Implementation Timeline

- **Phase 1 (Infrastructure):** 30 minutes
- **Phase 2 (Code Analysis):** 1 hour
- **Phase 3 (Wizard Interpretation):** 1 hour  
- **Phase 4 (Enhanced Generation):** 1 hour
- **Total:** 3.5 hours

**Testing:** 30 minutes with your sidebar component

**Total to production:** **4 hours**

---

## Next Steps

1. **Get Anthropic API key** (free $5 credit on sign-up)
2. **Implement Phase 1** (infrastructure)
3. **Test with your sidebar** (Phase 2 + 3)
4. **Polish and ship** (Phase 4)

**This transforms the wizard from "okay" to "magical" in one focused sprint.** 🚀

---

## Questions for User

1. **Do you have an Anthropic API key?** (Or should we use the $5 free credit?)
2. **Priority: High?** (Fix this before moving to other features?)
3. **Should AI be optional or required?** (I recommend optional with strong encouragement)

---

**Status:** Ready to implement once approved. This fixes the confidence issue and makes the import experience world-class.
