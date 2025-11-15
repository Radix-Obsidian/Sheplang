/**
 * Keyboard Shortcuts Hook
 * VS Code-style keyboard shortcuts
 */

import { useEffect } from 'react';

interface Shortcuts {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'Ctrl',
        e.shiftKey && 'Shift',
        e.altKey && 'Alt',
        e.metaKey && 'Meta',
        e.key.toUpperCase()
      ].filter(Boolean).join('+');

      const handler = shortcuts[key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Common VS Code shortcuts
export const VSCODE_SHORTCUTS = {
  TOGGLE_SIDEBAR: 'Ctrl+B',
  TOGGLE_PANEL: 'Ctrl+J',
  QUICK_OPEN: 'Ctrl+P',
  COMMAND_PALETTE: 'Ctrl+Shift+P',
  SAVE: 'Ctrl+S',
  NEW_FILE: 'Ctrl+N',
  CLOSE_EDITOR: 'Ctrl+W',
  TOGGLE_TERMINAL: 'Ctrl+`',
  FIND: 'Ctrl+F',
};
