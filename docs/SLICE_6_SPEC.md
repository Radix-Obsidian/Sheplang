# Slice 6 Spec – Wizard + UX Integration

**Date:** November 24, 2025  
**Status:** ✅ Complete (107/107 tests passing)  
**Goal:** Feed analyzer output into semantic wizard with rename/disable per item

---

## Reference

- Existing wizard infrastructure: `extension/src/wizard/`
- Suggestion panel patterns: `suggestionPanel.ts`
- VS Code WebView API: Official documentation

---

## Goals

### Primary
1. **Show analyzer output** – Display detected entities, views, actions with confidence scores
2. **Rename items** – Allow users to rename entities/views/actions before codegen
3. **Disable items** – Let users exclude items from generation
4. **Persist choices** – Flow user choices into the codegen pipeline

### Acceptance Criteria
- Import wizard panel shows all detected items from Slices 2-5
- Users can rename any entity, view, or action
- Users can disable/enable items with checkbox
- Choices persist and flow into ShepLang/ShepThon generation
- `pnpm test:importer` passes with new wizard tests

---

## Implementation Plan

### 1. Types (`extension/src/types/ImportWizard.ts`)

```typescript
interface ImportAnalysis {
  entities: DetectedItem[];
  views: DetectedItem[];
  actions: DetectedItem[];
  apiRoutes: DetectedItem[];
  confidence: number;
}

interface DetectedItem {
  id: string;
  originalName: string;
  displayName: string;
  type: 'entity' | 'view' | 'action' | 'route';
  enabled: boolean;
  confidence: number;
  source: string;
  details?: Record<string, any>;
}

interface WizardChoices {
  items: Map<string, ItemChoice>;
  appName: string;
  appType: string;
}

interface ItemChoice {
  enabled: boolean;
  renamedTo?: string;
}
```

### 2. Import Wizard Panel (`extension/src/wizard/importWizardPanel.ts`)

VS Code WebView panel that:
- Displays analysis results in categorized sections
- Shows confidence badges (high/medium/low)
- Provides inline rename inputs
- Has enable/disable checkboxes
- Confirm/Cancel buttons

### 3. Analysis Aggregator (`extension/src/services/importAnalysisAggregator.ts`)

Combines outputs from all parsers:
- React parser (components, state, handlers)
- Entity extractor (Prisma models, heuristic entities)
- View mapper (views, actions, widgets)
- API route parser (routes, methods, Prisma ops)
- Backend correlator (matched/unmatched calls)

### 4. Codegen Integration

Update generators to accept filtered/renamed items:
- `generateShepLangData()` → Filter disabled entities
- `generateShepLangViewCode()` → Use renamed views/actions
- `generateShepThonFromRoutes()` → Respect route choices

---

## UI Design

### Panel Layout

```
┌─────────────────────────────────────────────────────────┐
│  📦 Import Analysis - MyApp                              │
│  Overall Confidence: 87%                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 ENTITIES (3)                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑ Task                    [Edit Name]    92% ✓  │   │
│  │   Fields: id, title, completed, priority        │   │
│  │   Source: Prisma schema                          │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑ User                    [Edit Name]    90% ✓  │   │
│  │   Fields: id, email, name, createdAt            │   │
│  │   Source: Prisma schema                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  🖼️ VIEWS (2)                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑ TaskList                [Edit Name]    85% ✓  │   │
│  │   Widgets: list, button, input                  │   │
│  │   Source: app/components/TaskList.tsx           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ⚡ ACTIONS (4)                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑ AddTask                 [Edit Name]    78%    │   │
│  │   Trigger: click                                │   │
│  │   API: POST /api/tasks                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  🔌 API ROUTES (5)                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑ GET /api/tasks          [tasks]        95% ✓  │   │
│  │   Operation: db.all                              │   │
│  │   Model: task                                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  [Cancel]                    [Generate ShepLang →]       │
└─────────────────────────────────────────────────────────┘
```

### Confidence Badges

| Score | Color | Label |
|-------|-------|-------|
| ≥80%  | Green | High confidence |
| 60-79% | Orange | Medium confidence |
| <60%  | Gray | Low confidence |

---

## Test Cases

### importWizardPanel.test.ts
1. Panel renders with analysis data
2. Enable/disable item updates state
3. Rename item updates displayName
4. Generate button sends correct choices
5. Cancel button closes panel

### importAnalysisAggregator.test.ts
1. Aggregates parser outputs correctly
2. Assigns unique IDs to items
3. Calculates overall confidence
4. Handles empty parser results

### Integration
1. Full flow: fixture → analysis → wizard → codegen
2. Renamed items appear in generated code
3. Disabled items excluded from output

---

## Files

```
extension/src/
├── wizard/
│   └── importWizardPanel.ts      # NEW: WebView panel
├── services/
│   └── importAnalysisAggregator.ts # NEW: Combine parsers
└── types/
    └── ImportWizard.ts           # NEW: Wizard types

test/importer/
└── importWizard.test.ts          # NEW: Wizard tests
```

---

## Success Metrics

1. ✅ All existing 90 tests pass
2. ✅ New wizard tests pass (target: 10-15)
3. ✅ Users can rename and disable items
4. ✅ Choices flow into generated code
5. ✅ Documentation updated

---

*Built following Golden Sheep AI Methodology™ – Vertical Slice Delivery*
