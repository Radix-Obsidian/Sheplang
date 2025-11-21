/**
 * Comprehensive Diagnostic System
 * 
 * Fully wired error detection with actionable fixes
 * Works for both preview and editor
 */

import * as vscode from 'vscode';
import { friendlyError, ShepError } from './errorOverlay';

export class DiagnosticsManager {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private currentErrors: Map<string, ShepError[]> = new Map();

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('sheplang');
  }

  /**
   * Analyze document and create diagnostics
   */
  public analyzeDocument(document: vscode.TextDocument): void {
    if (document.languageId !== 'sheplang') {
      return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const errors: ShepError[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    // Check for common errors
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i;

      // Error 1: Missing colon after declarations
      if (line.match(/^(data|view|action)\s+\w+\s*$/)) {
        const error = this.createDiagnostic(
          lineNumber,
          line.length,
          'Missing colon (:) after declaration',
          'MISSING_COLON',
          vscode.DiagnosticSeverity.Error,
          `Add a colon at the end: ${line.trim()}:`
        );
        diagnostics.push(error);

        errors.push({
          message: 'Looks like you forgot a colon',
          code: 'MISSING_COLON',
          location: {
            file: document.fileName,
            line: lineNumber + 1,
            column: line.length
          },
          suggestion: 'Add a colon (:) at the end of data, view, and action declarations.',
          fix: {
            description: 'Add the missing colon',
            code: `${line.trim()}:`
          }
        });
      }

      // Error 2: Invalid field type
      if (line.match(/^\s+\w+:\s+\w+/) && !line.match(/:\s+(text|number|yes\/no|date|time)/)) {
        const match = line.match(/:\s+(\w+)/);
        if (match) {
          const invalidType = match[1];
          const column = line.indexOf(invalidType);
          
          const error = this.createDiagnostic(
            lineNumber,
            column + invalidType.length,
            `Invalid field type "${invalidType}"`,
            'INVALID_TYPE',
            vscode.DiagnosticSeverity.Error,
            'Use: text, number, yes/no, date, or time'
          );
          diagnostics.push(error);

          errors.push({
            message: `"${invalidType}" isn't a supported field type`,
            code: 'INVALID_TYPE',
            location: {
              file: document.fileName,
              line: lineNumber + 1,
              column
            },
            suggestion: 'ShepLang supports: text, number, yes/no, date, and time',
            fix: {
              description: 'Change to a valid type',
              code: 'name: text\nage: number\nactive: yes/no\nbirthday: date\nappointed: time'
            }
          });
        }
      }

      // Error 3: Undefined entity reference
      const entityMatch = line.match(/list\s+(\w+)|add\s+(\w+)/);
      if (entityMatch) {
        const entityName = entityMatch[1] || entityMatch[2];
        if (!this.isEntityDefined(text, entityName)) {
          const column = line.indexOf(entityName);
          
          const error = this.createDiagnostic(
            lineNumber,
            column + entityName.length,
            `Entity "${entityName}" not found`,
            'ENTITY_NOT_FOUND',
            vscode.DiagnosticSeverity.Error,
            `Create a data ${entityName}: block first`
          );
          diagnostics.push(error);

          errors.push({
            message: `I can't find a data type called "${entityName}"`,
            code: 'ENTITY_NOT_FOUND',
            location: {
              file: document.fileName,
              line: lineNumber + 1,
              column
            },
            suggestion: `Make sure you've created the ${entityName} data type before using it.`,
            fix: {
              description: `Create the ${entityName} data type`,
              code: `data ${entityName}:\n  fields:\n    name: text\n    description: text`
            }
          });
        }
      }

      // Error 4: Undefined action reference
      const actionMatch = line.match(/button\s+"[^"]+"\s+->\s+(\w+)/);
      if (actionMatch) {
        const actionName = actionMatch[1];
        if (!this.isActionDefined(text, actionName)) {
          const column = line.indexOf(actionName);
          
          const error = this.createDiagnostic(
            lineNumber,
            column + actionName.length,
            `Action "${actionName}" not found`,
            'ACTION_NOT_FOUND',
            vscode.DiagnosticSeverity.Error,
            `Create an action ${actionName}(...): block`
          );
          diagnostics.push(error);

          errors.push({
            message: `The action "${actionName}" doesn't exist yet`,
            code: 'ACTION_NOT_FOUND',
            location: {
              file: document.fileName,
              line: lineNumber + 1,
              column
            },
            suggestion: `Create the ${actionName} action before referencing it in a button.`,
            fix: {
              description: `Create the ${actionName} action`,
              code: `action ${actionName}(params):\n  // TODO: Add logic here\n  show Dashboard`
            }
          });
        }
      }

      // Error 5: Missing fields keyword in data block
      if (line.match(/^data\s+\w+:/) && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (!nextLine.includes('fields:')) {
          const error = this.createDiagnostic(
            i + 1,
            nextLine.length,
            'Data block must have a "fields:" section',
            'MISSING_FIELDS',
            vscode.DiagnosticSeverity.Error,
            'Add "fields:" on the next line'
          );
          diagnostics.push(error);

          errors.push({
            message: 'Data types need a "fields:" section',
            code: 'MISSING_FIELDS',
            location: {
              file: document.fileName,
              line: i + 2,
              column: 0
            },
            suggestion: 'Add the "fields:" keyword and then list your fields below it.',
            fix: {
              description: 'Add fields section',
              code: '  fields:\n    name: text'
            }
          });
        }
      }

      // Error 6: Missing app declaration
      if (i === 0 && !line.startsWith('app ')) {
        const error = this.createDiagnostic(
          0,
          0,
          'ShepLang files must start with "app YourAppName"',
          'MISSING_APP',
          vscode.DiagnosticSeverity.Warning,
          'Add app declaration at the top'
        );
        diagnostics.push(error);

        errors.push({
          message: 'Every ShepLang file needs an app name',
          code: 'MISSING_APP',
          location: {
            file: document.fileName,
            line: 1,
            column: 0
          },
          suggestion: 'Start your file with "app YourAppName" on the first line.',
          fix: {
            description: 'Add app declaration',
            code: 'app MyApp'
          }
        });
      }
    }

    // Update diagnostics
    this.diagnosticCollection.set(document.uri, diagnostics);
    this.currentErrors.set(document.uri.toString(), errors);

    // Broadcast errors to preview if any
    if (errors.length > 0) {
      this.broadcastErrorsToPreview(errors[0]); // Show first error
    }
  }

  /**
   * Create a diagnostic with code action
   */
  private createDiagnostic(
    lineNumber: number,
    endColumn: number,
    message: string,
    code: string,
    severity: vscode.DiagnosticSeverity,
    suggestion: string
  ): vscode.Diagnostic {
    const range = new vscode.Range(
      new vscode.Position(lineNumber, 0),
      new vscode.Position(lineNumber, endColumn)
    );

    const diagnostic = new vscode.Diagnostic(range, message, severity);
    diagnostic.code = code;
    diagnostic.source = 'ShepLang';
    
    return diagnostic;
  }

  /**
   * Check if entity is defined in document
   */
  private isEntityDefined(text: string, entityName: string): boolean {
    const regex = new RegExp(`^data\\s+${entityName}:`, 'm');
    return regex.test(text);
  }

  /**
   * Check if action is defined in document
   */
  private isActionDefined(text: string, actionName: string): boolean {
    const regex = new RegExp(`^action\\s+${actionName}\\s*\\(`, 'm');
    return regex.test(text);
  }

  /**
   * Broadcast errors to browser preview
   */
  private broadcastErrorsToPreview(error: ShepError): void {
    // This will be called by the preview server
    // Storing for retrieval
    vscode.commands.executeCommand('sheplang.broadcastError', error);
  }

  /**
   * Get current errors for a document
   */
  public getErrors(uri: string): ShepError[] {
    return this.currentErrors.get(uri) || [];
  }

  /**
   * Clear diagnostics
   */
  public clear(): void {
    this.diagnosticCollection.clear();
    this.currentErrors.clear();
  }

  /**
   * Dispose
   */
  public dispose(): void {
    this.diagnosticCollection.dispose();
  }
}

/**
 * Register diagnostics
 */
export function registerDiagnostics(context: vscode.ExtensionContext): DiagnosticsManager {
  const diagnosticsManager = new DiagnosticsManager();

  // Analyze on open
  vscode.workspace.textDocuments.forEach(doc => {
    diagnosticsManager.analyzeDocument(doc);
  });

  // Analyze on change
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      diagnosticsManager.analyzeDocument(event.document);
    })
  );

  // Analyze on open
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => {
      diagnosticsManager.analyzeDocument(doc);
    })
  );

  context.subscriptions.push(diagnosticsManager);

  return diagnosticsManager;
}
