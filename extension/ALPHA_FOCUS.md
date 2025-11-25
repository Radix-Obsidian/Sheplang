# ShepLang Alpha Focus

**Date:** November 25, 2025  
**Status:** ALPHA - Import Only  
**Methodology:** Golden Sheep AI - "Build narrow. Test deep. Ship confidently."

---

## Alpha Commands (ENABLED)

| Command | Description |
|---------|-------------|
| `sheplang.importFromGitHub` | Import from GitHub repository |
| `sheplang.importFromNextJS` | Import from local project |
| `sheplang.showPreview` | Show preview panel |
| `sheplang.showPreviewInBrowser` | Browser preview |
| `sheplang.stopPreviewServer` | Stop preview |
| `sheplang.sendFeedback` | Send feedback |
| `sheplang.updateApiKey` | Manage API key |

---

## Beta Commands (DISABLED)

The following commands are disabled in Alpha but code is preserved for Beta:

| Command | File | Why Disabled |
|---------|------|--------------|
| `sheplang.newProject` | `newProject.ts` | Not core to import focus |
| `sheplang.restartBackend` | `restartBackend.ts` | Can re-enable |
| `sheplang.startProjectWizard` | `projectWizard.ts` | Complex wizard, needs polish |
| `sheplang.quickStart` | `quickStart.ts` | Overlaps with import |
| `sheplang.quickCreateProject` | | Overlaps with wizard |
| `sheplang.importFromWebflow` | `importFromWebflow.ts` | Niche, add later |
| `sheplang.openExamples` | | Can add back |
| `sheplang.showAIUsage` | `usageTracker.ts` | Internal |
| `sheplang.resetAIUsage` | `usageTracker.ts` | Testing only |

---

## How to Re-Enable for Beta

### 1. package.json
Add the command back to `contributes.commands`:
```json
{
  "command": "sheplang.commandName",
  "title": "ShepLang: Command Title"
}
```

### 2. extension.ts
Uncomment the import and registration:
```typescript
// Uncomment import
import { commandFunction } from './commands/commandFile';

// Uncomment registration in activate()
vscode.commands.registerCommand('sheplang.commandName', () => commandFunction(context))
```

---

## Alpha User Flow

1. User opens VS Code
2. Ctrl+Shift+P → "ShepLang: Import from GitHub"
3. Enter GitHub URL (e.g., `https://github.com/user/nextjs-project`)
4. Choose save location
5. Extension clones, analyzes, converts to ShepLang
6. Project opens with `.shep` and `.shepthon` files

**Alternative:** "ShepLang: Import from Local Project" for projects already on disk.

---

## Files Changed for Alpha

### package.json
- Reduced commands array to 7 Alpha commands
- Removed quickStart keybinding

### extension.ts
- Commented out disabled imports
- Commented out disabled command registrations
- Added clear ALPHA / DISABLED sections

### importFromGitHub.ts
- Rewrote to use same pipeline as local import
- Now generates real ShepLang files (not stubs)

---

## Success Metrics for Alpha

- [ ] GitHub import completes without error
- [ ] Generated project has real `.shep` files
- [ ] Entities extracted from Prisma schema
- [ ] Views created from React components
- [ ] Project opens in VS Code after import

---

## Next Steps After Alpha Validation

1. **Beta:** Re-enable Project Wizard with fixes
2. **Beta:** Add template/example library
3. **v1.0:** WebFlow import, more sources
