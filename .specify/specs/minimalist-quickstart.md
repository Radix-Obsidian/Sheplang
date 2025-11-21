# Minimalist Quick Start Specification

## Vision
Replace heavy onboarding with instant value delivery. Users should be coding in ShepLang within 10 seconds.

## Philosophy
- **No tutorials** - Learn by doing
- **No webviews** - Native VS Code UI only
- **No blocking** - Everything is optional
- **AI-first** - Let AI do the heavy lifting

## Two Paths to ShepLang

### Path 1: Import → ShepLang
1. User selects "Import Existing Project"
2. AI analyzes their Next.js/React/HTML code
3. Generates equivalent ShepLang structure
4. Opens main file with live preview

### Path 2: Prompt → ShepLang (ShepImpromptu)
1. User selects "Describe Your Project"
2. Types natural language description
3. AI generates complete file structure:
   - Data models (`.shep`)
   - Backend (`.shepthon` if needed)
   - README
   - .gitignore
4. Opens main file with live preview

## Implementation

### Entry Points
- **First launch**: Simple notification with "Get Started" button
- **Command Palette**: `Ctrl+Shift+S` → "ShepLang: Quick Start"
- **Welcome page**: Removed (too heavy)

### Backend Detection
Automatically detects existing backend by checking for:
- `backend.shepthon`
- `package.json` (Node.js)
- `requirements.txt` (Python)
- `pages/api/*` (Next.js)
- Other common backend indicators

If no backend detected, asks: "Would you like AI to generate a backend?"

### File Generation
```
ProjectName/
├── ProjectName.shep       # Main ShepLang file
├── backend.shepthon        # Backend (if requested)
├── README.md              # Auto-generated docs
└── .gitignore            # Standard ignores
```

### Live Preview
- Auto-starts after generation
- Shows in browser (not webview)
- Real-time updates as user edits
- Errors appear inline

## AI Project Analysis

### Input: "I need a task manager with team collaboration"

### Output Structure:
```sheplang
app TaskManager

data Task:
  fields:
    title: text
    description: text
    assignedTo: text
    dueDate: date
    completed: yes/no
    teamId: text

data Team:
  fields:
    name: text
    members: text

view Dashboard:
  list Task
  list Team
  button "New Task" -> CreateTask
  button "Create Team" -> CreateTeam

action CreateTask(title, description, assignedTo, dueDate):
  add Task with title, description, assignedTo, dueDate
  show Dashboard

action CreateTeam(name):
  add Team with name
  show Dashboard
```

## Benefits vs Old Onboarding

| Old (Heavy) | New (Minimalist) |
|-------------|------------------|
| 600+ lines of onboarding code | 200 lines total |
| Webview with HTML/CSS | Native VS Code UI |
| Multi-step wizard | Single choice |
| Tutorial-focused | Action-focused |
| 2-3 minutes to start | 10 seconds to code |
| Developer vs Founder paths | Universal path |

## Success Metrics
- Time to first line of ShepLang code: < 10 seconds
- Number of clicks to start: 2-3 max
- Code generation accuracy: 90%+
- User drop-off rate: < 10%

## Future Enhancements
- **Template Library**: Pre-built apps (SaaS, E-commerce, etc.)
- **Import from URL**: Analyze live websites
- **Figma Import**: Design to ShepLang
- **Team Sharing**: Share projects via link

## References
- GitHub Copilot: No onboarding, just works
- Prettier: Zero config, instant value
- ESLint: Optional setup, not required
- Cursor: AI-first, minimal UI

## Status
✅ **IMPLEMENTED** - Ready for testing
