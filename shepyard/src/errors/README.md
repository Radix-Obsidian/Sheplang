# Smart Error Recovery System

## Overview

The Smart Error Recovery system provides founder-friendly error messages with actionable suggestions, auto-fixes, and code examples.

## Components

### ErrorPanel
The main error display component that shows all errors in a list with rich context.

```tsx
import { ErrorPanel } from './errors/SmartErrorRecovery';

<ErrorPanel
  suggestions={errorSuggestions}
  onApplyFix={(suggestion) => {
    // Apply the fix to the editor
  }}
  onJumpToLine={(line) => {
    // Jump to the error location
  }}
/>
```

### InlineErrorWidget
A compact inline error widget for displaying errors within Monaco editor.

### ShepCodeViewer with Error Markers
The code editor now supports error decorations:

```tsx
import { ShepCodeViewer } from './editor/ShepCodeViewer';

<ShepCodeViewer
  source={code}
  errorSuggestions={errorSuggestions}
/>
```

## Error Analysis Service

The `errorAnalysisService` converts raw transpiler errors into rich `ErrorSuggestion` objects:

```typescript
import { analyzeTranspilerErrors } from './services/errorAnalysisService';

const suggestions = analyzeTranspilerErrors(
  errorMessage,
  sourceCode,
  isShepThon
);
```

## Features

### 1. Did You Mean Suggestions
When a typo is detected, the system suggests correct keywords:

```
Unknown keyword 'endpoit'
💡 Did you mean: endpoint, end
```

### 2. Auto-Fix Actions
One-click fixes for common errors:

```typescript
{
  autoFix: {
    title: "Replace with 'endpoint'",
    description: "Change 'endpoit' to 'endpoint'",
    changes: [/* edit operations */]
  }
}
```

### 3. Code Examples
Contextual examples for each error type:

```typescript
{
  examples: [
    {
      title: 'GET endpoint',
      description: 'Fetch data from your backend',
      code: 'endpoint GET "/items" -> [Item] { ... }'
    }
  ]
}
```

### 4. Confidence Indicators
Shows how confident the system is about the suggestion:

```
⚡ 95% sure
```

### 5. Learn More Links
Direct links to documentation for deeper understanding.

## Error Types

The system recognizes several error types:

- **typo** - Misspelled keywords or identifiers
- **missing_token** - Missing required keywords (e.g., 'end')
- **syntax** - General syntax errors
- **unknown** - Unclassified errors

## Integration Points

### 1. Transpiler Service
`transpilerService.ts` now returns `errorDetails` with error message and source code.

### 2. Workspace Store
`useWorkspaceStore.ts` stores error details for analysis.

### 3. useTranspile Hook
Automatically analyzes errors during transpilation.

### 4. main.tsx
Displays rich error panel instead of simple error message.

## Future Enhancements

- [ ] Multi-error support (parse multiple errors from a single transpilation)
- [ ] Error history tracking
- [ ] AI-powered fix suggestions
- [ ] Integration with LSP for real-time diagnostics
- [ ] Quick fix code actions in Monaco editor
