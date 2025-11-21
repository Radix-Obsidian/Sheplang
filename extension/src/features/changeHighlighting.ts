/**
 * Change Highlighting for Live Preview
 * 
 * Battle-tested pattern from Vite HMR and VS Code Live Server
 * Highlights changed elements in browser preview with smooth animations
 */

import * as vscode from 'vscode';

export interface ChangeHighlight {
  selector: string;
  changeType: 'added' | 'modified' | 'removed';
  oldValue?: string;
  newValue?: string;
}

/**
 * Generate change highlighting client-side JavaScript
 * This gets injected into the browser preview
 */
export function getChangeHighlightScript(): string {
  return `
<script>
(function() {
  // Change tracking state
  let previousAST = null;
  let highlightTimeout = null;

  // Listen for AST updates from WebSocket
  if (window.socket) {
    window.socket.on('ast-update', (data) => {
      if (previousAST) {
        const changes = detectChanges(previousAST, data.ast);
        highlightChanges(changes);
      }
      previousAST = data.ast;
    });
  }

  /**
   * Detect what changed between ASTs
   */
  function detectChanges(oldAST, newAST) {
    const changes = [];

    // Compare entities
    if (oldAST.entities && newAST.entities) {
      const oldEntities = new Map(oldAST.entities.map(e => [e.name, e]));
      const newEntities = new Map(newAST.entities.map(e => [e.name, e]));

      // Added entities
      for (const [name, entity] of newEntities) {
        if (!oldEntities.has(name)) {
          changes.push({
            type: 'entity-added',
            name,
            selector: \`[data-entity="\${name}"]\`
          });
        }
      }

      // Modified entities
      for (const [name, newEntity] of newEntities) {
        const oldEntity = oldEntities.get(name);
        if (oldEntity && JSON.stringify(oldEntity) !== JSON.stringify(newEntity)) {
          changes.push({
            type: 'entity-modified',
            name,
            selector: \`[data-entity="\${name}"]\`
          });
        }
      }

      // Removed entities
      for (const [name] of oldEntities) {
        if (!newEntities.has(name)) {
          changes.push({
            type: 'entity-removed',
            name,
            selector: \`[data-entity="\${name}"]\`
          });
        }
      }
    }

    // Compare views
    if (oldAST.views && newAST.views) {
      const oldViews = new Map(oldAST.views.map(v => [v.name, v]));
      const newViews = new Map(newAST.views.map(v => [v.name, v]));

      for (const [name, newView] of newViews) {
        const oldView = oldViews.get(name);
        if (!oldView) {
          changes.push({
            type: 'view-added',
            name,
            selector: \`[data-view="\${name}"]\`
          });
        } else if (JSON.stringify(oldView) !== JSON.stringify(newView)) {
          changes.push({
            type: 'view-modified',
            name,
            selector: \`[data-view="\${name}"]\`
          });
        }
      }
    }

    return changes;
  }

  /**
   * Highlight changed elements in the DOM
   * Uses Vite-style pulsing border animation
   */
  function highlightChanges(changes) {
    // Clear previous highlights
    clearHighlights();

    // Apply new highlights
    changes.forEach(change => {
      const elements = document.querySelectorAll(change.selector);
      
      elements.forEach(element => {
        // Add highlight class based on change type
        if (change.type.includes('added')) {
          element.classList.add('shep-highlight-added');
        } else if (change.type.includes('modified')) {
          element.classList.add('shep-highlight-modified');
        } else if (change.type.includes('removed')) {
          element.classList.add('shep-highlight-removed');
        }

        // Add floating badge
        const badge = document.createElement('div');
        badge.className = 'shep-change-badge';
        badge.textContent = change.type.split('-')[1].toUpperCase();
        badge.style.cssText = \`
          position: absolute;
          top: -10px;
          right: -10px;
          background: \${getBadgeColor(change.type)};
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: bold;
          z-index: 10000;
          animation: slideIn 0.3s ease-out;
        \`;
        
        // Make parent positioned for badge placement
        const originalPosition = element.style.position;
        if (!originalPosition || originalPosition === 'static') {
          element.style.position = 'relative';
        }
        
        element.appendChild(badge);
      });
    });

    // Auto-remove highlights after 3 seconds
    highlightTimeout = setTimeout(clearHighlights, 3000);
  }

  /**
   * Get badge color based on change type
   */
  function getBadgeColor(type) {
    if (type.includes('added')) return '#10b981'; // Green
    if (type.includes('modified')) return '#3b82f6'; // Blue
    if (type.includes('removed')) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  }

  /**
   * Clear all highlights
   */
  function clearHighlights() {
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
      highlightTimeout = null;
    }

    document.querySelectorAll('.shep-highlight-added, .shep-highlight-modified, .shep-highlight-removed')
      .forEach(el => {
        el.classList.remove('shep-highlight-added', 'shep-highlight-modified', 'shep-highlight-removed');
      });

    document.querySelectorAll('.shep-change-badge')
      .forEach(badge => badge.remove());
  }

  // Inject CSS for highlights
  const style = document.createElement('style');
  style.textContent = \`
    @keyframes shepPulse {
      0% { box-shadow: 0 0 0 0 currentColor; }
      50% { box-shadow: 0 0 10px 3px currentColor; }
      100% { box-shadow: 0 0 0 0 currentColor; }
    }

    @keyframes slideIn {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .shep-highlight-added {
      border: 2px solid #10b981 !important;
      animation: shepPulse 1.5s ease-in-out infinite;
      color: #10b981;
    }

    .shep-highlight-modified {
      border: 2px solid #3b82f6 !important;
      animation: shepPulse 1.5s ease-in-out infinite;
      color: #3b82f6;
    }

    .shep-highlight-removed {
      border: 2px solid #ef4444 !important;
      animation: shepPulse 1.5s ease-in-out infinite;
      color: #ef4444;
      opacity: 0.5;
    }

    .shep-highlight-added *,
    .shep-highlight-modified *,
    .shep-highlight-removed * {
      pointer-events: auto !important;
    }
  \`;
  document.head.appendChild(style);
})();
</script>
`;
}

/**
 * Get decorator for VS Code editor (shows which lines changed)
 */
export function getEditorDecorations(
  document: vscode.TextDocument,
  previousContent: string
): vscode.DecorationOptions[] {
  const decorations: vscode.DecorationOptions[] = [];
  
  const currentLines = document.getText().split('\n');
  const previousLines = previousContent.split('\n');

  // Simple line-by-line diff
  const maxLines = Math.max(currentLines.length, previousLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    if (i >= previousLines.length) {
      // Added line
      decorations.push({
        range: new vscode.Range(i, 0, i, currentLines[i].length),
        renderOptions: {
          after: {
            contentText: ' ✨ NEW',
            color: '#10b981',
            fontWeight: 'bold'
          }
        }
      });
    } else if (i >= currentLines.length) {
      // Removed line (shouldn't happen in normal editing)
      continue;
    } else if (currentLines[i] !== previousLines[i]) {
      // Modified line
      decorations.push({
        range: new vscode.Range(i, 0, i, currentLines[i].length),
        renderOptions: {
          after: {
            contentText: ' ✏️ MODIFIED',
            color: '#3b82f6',
            fontWeight: 'bold'
          }
        }
      });
    }
  }

  return decorations;
}
