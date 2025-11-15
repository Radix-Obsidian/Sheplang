/**
 * Monaco Editor Theme Configuration
 * VS Code Dark+ theme for Monaco
 */

import type * as Monaco from 'monaco-editor';
import { vscodeColors, syntaxColors } from './vscodeTheme';

export const monacoThemeDefinition: Monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: syntaxColors.comment.slice(1) },
    { token: 'keyword', foreground: syntaxColors.keyword.slice(1), fontStyle: 'bold' },
    { token: 'string', foreground: syntaxColors.string.slice(1) },
    { token: 'number', foreground: syntaxColors.number.slice(1) },
    { token: 'function', foreground: syntaxColors.function.slice(1) },
    { token: 'variable', foreground: syntaxColors.variable.slice(1) },
    { token: 'type', foreground: syntaxColors.type.slice(1) },
    { token: 'operator', foreground: syntaxColors.operator.slice(1) },
  ],
  colors: {
    'editor.background': vscodeColors.editorBackground,
    'editor.foreground': vscodeColors.editorForeground,
    'editor.lineHighlightBackground': '#2A2A2A',
    'editorLineNumber.foreground': vscodeColors.editorLineNumber,
    'editorCursor.foreground': vscodeColors.editorCursor,
    'editor.selectionBackground': vscodeColors.editorSelection,
    'editor.inactiveSelectionBackground': vscodeColors.editorInactiveSelection,
    'editorWidget.background': vscodeColors.sidebarBackground,
    'editorWidget.border': vscodeColors.border,
  },
};

export function registerMonacoTheme(monaco: typeof Monaco) {
  monaco.editor.defineTheme('shepyard-dark', monacoThemeDefinition);
}
