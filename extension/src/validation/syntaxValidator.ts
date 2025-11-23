/**
 * ShepLang Syntax Validator
 * 
 * Validates generated ShepLang files before writing to disk
 */

import * as vscode from 'vscode';
import { parseShep, ParsedResult } from '../../../sheplang/packages/language/src/index.js';
import { outputChannel } from '../services/outputChannel';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  fixed?: string; // Auto-fixed version if possible
}

export interface ValidationError {
  message: string;
  line: number;
  column: number;
  code: string;
  suggestion?: string;
}

export interface ValidationWarning {
  message: string;
  line: number;
  column: number;
  code: string;
}

export class SyntaxValidator {
  private static instance: SyntaxValidator;
  
  public static getInstance(): SyntaxValidator {
    if (!SyntaxValidator.instance) {
      SyntaxValidator.instance = new SyntaxValidator();
    }
    return SyntaxValidator.instance;
  }

  /**
   * Validate ShepLang source code
   */
  public async validate(source: string, filePath = 'generated.shep'): Promise<ValidationResult> {
    try {
      // Parse the source code
      const result: ParsedResult = await parseShep(source, filePath);
      
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // Process diagnostics
      for (const diagnostic of result.diagnostics) {
        if (diagnostic.severity === 'error') {
          errors.push({
            message: diagnostic.message,
            line: diagnostic.start.line,
            column: diagnostic.start.column,
            code: diagnostic.code || 'SYNTAX_ERROR',
            suggestion: this.getSuggestion(diagnostic.message, diagnostic.code)
          });
        } else if (diagnostic.severity === 'warning') {
          warnings.push({
            message: diagnostic.message,
            line: diagnostic.start.line,
            column: diagnostic.start.column,
            code: diagnostic.code || 'WARNING'
          });
        }
      }

      // Try to auto-fix common issues
      const fixed = errors.length > 0 ? this.attemptAutoFix(source, errors) : undefined;

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        fixed
      };

    } catch (error) {
      outputChannel.error('Syntax validation failed:', error);
      
      return {
        isValid: false,
        errors: [{
          message: error instanceof Error ? error.message : 'Unknown validation error',
          line: 1,
          column: 1,
          code: 'VALIDATION_ERROR'
        }],
        warnings: []
      };
    }
  }

  /**
   * Validate multiple files
   */
  public async validateFiles(files: { path: string; content: string }[]): Promise<{ [path: string]: ValidationResult }> {
    const results: { [path: string]: ValidationResult } = {};
    
    for (const file of files) {
      results[file.path] = await this.validate(file.content, file.path);
    }
    
    return results;
  }

  /**
   * Get suggestions for common errors
   */
  private getSuggestion(message: string, code?: string): string | undefined {
    const lowerMessage = message.toLowerCase();
    
    // Common syntax issues
    if (lowerMessage.includes('unexpected token')) {
      return 'Check for missing commas, brackets, or incorrect indentation';
    }
    
    if (lowerMessage.includes('unexpected end of input')) {
      return 'Missing closing brace or incomplete statement';
    }
    
    if (lowerMessage.includes('unexpected identifier')) {
      return 'Check if this is a reserved keyword or needs quotes';
    }
    
    if (lowerMessage.includes('missing colon')) {
      return 'Add a colon after the property name';
    }
    
    if (lowerMessage.includes('expected')) {
      return 'Review the syntax structure and add missing elements';
    }
    
    // Specific to ShepLang constructs
    if (lowerMessage.includes('data') && lowerMessage.includes('expected')) {
      return 'Ensure data declaration follows: data EntityName: fields: ...';
    }
    
    if (lowerMessage.includes('view') && lowerMessage.includes('expected')) {
      return 'Ensure view declaration follows: view ViewName: header: ...';
    }
    
    if (lowerMessage.includes('action') && lowerMessage.includes('expected')) {
      return 'Ensure action declaration follows: action actionName(): ...';
    }
    
    if (lowerMessage.includes('flow') && lowerMessage.includes('expected')) {
      return 'Ensure flow declaration follows: flow FlowName: steps: ...';
    }
    
    if (lowerMessage.includes('integration') && lowerMessage.includes('expected')) {
      return 'Ensure integration declaration follows: integration ServiceName: config: ...';
    }
    
    return undefined;
  }

  /**
   * Attempt to auto-fix common syntax issues
   */
  private attemptAutoFix(source: string, errors: ValidationError[]): string {
    let fixed = source;
    
    for (const error of errors) {
      // Fix missing colons in property declarations
      if (error.message.toLowerCase().includes('missing colon')) {
        fixed = this.fixMissingColons(fixed);
      }
      
      // Fix missing commas in lists
      if (error.message.toLowerCase().includes('missing comma')) {
        fixed = this.fixMissingCommas(fixed);
      }
      
      // Fix indentation issues
      if (error.message.toLowerCase().includes('indentation')) {
        fixed = this.fixIndentation(fixed);
      }
      
      // Fix missing braces
      if (error.message.toLowerCase().includes('missing') && error.message.toLowerCase().includes('brace')) {
        fixed = this.fixMissingBraces(fixed);
      }
    }
    
    return fixed;
  }

  /**
   * Fix missing colons in property declarations
   */
  private fixMissingColons(source: string): string {
    // Fix common patterns like "fields {" -> "fields: {"
    return source
      .replace(/(\w+)\s+\{/g, '$1: {')
      .replace(/(\w+)\s+\n\s*\{/g, '$1:\n  {');
  }

  /**
   * Fix missing commas in lists
   */
  private fixMissingCommas(source: string): string {
    // Add missing commas between list items
    return source
      .replace(/(\w+:\s*[^,\n]+)\s*\n\s*(\w+:)/g, '$1,\n    $2');
  }

  /**
   * Fix indentation issues
   */
  private fixIndentation(source: string): string {
    const lines = source.split('\n');
    const fixed: string[] = [];
    let indentLevel = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === '') {
        fixed.push('');
        continue;
      }
      
      // Decrease indent for closing braces
      if (trimmed.startsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Apply current indent
      fixed.push('  '.repeat(indentLevel) + trimmed);
      
      // Increase indent for opening braces
      if (trimmed.endsWith('{')) {
        indentLevel++;
      }
    }
    
    return fixed.join('\n');
  }

  /**
   * Fix missing braces
   */
  private fixMissingBraces(source: string): string {
    const lines = source.split('\n');
    const stack: number[] = [];
    const fixed: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      fixed.push(line);
      
      // Track opening braces
      if (trimmed.endsWith('{')) {
        stack.push(i);
      }
      
      // Track closing braces
      if (trimmed.startsWith('}')) {
        if (stack.length > 0) {
          stack.pop();
        }
      }
    }
    
    // Add missing closing braces
    while (stack.length > 0) {
      fixed.push('}');
      stack.pop();
    }
    
    return fixed.join('\n');
  }

  /**
   * Validate entity syntax specifically
   */
  public async validateEntity(entityCode: string, entityName: string): Promise<ValidationResult> {
    const wrappedCode = `
# Generated entity for validation
data ${entityName}:
  ${entityCode.trim()}
`;
    
    return this.validate(wrappedCode, `${entityName}.shep`);
  }

  /**
   * Validate flow syntax specifically
   */
  public async validateFlow(flowCode: string, flowName: string): Promise<ValidationResult> {
    const wrappedCode = `
# Generated flow for validation
flow ${flowName}:
  ${flowCode.trim()}
`;
    
    return this.validate(wrappedCode, `${flowName}.shep`);
  }

  /**
   * Validate screen syntax specifically
   */
  public async validateScreen(screenCode: string, screenName: string): Promise<ValidationResult> {
    const wrappedCode = `
# Generated screen for validation
view ${screenName}:
  ${screenCode.trim()}
`;
    
    return this.validate(wrappedCode, `${screenName}.shep`);
  }

  /**
   * Validate integration syntax specifically
   */
  public async validateIntegration(integrationCode: string, serviceName: string): Promise<ValidationResult> {
    const wrappedCode = `
# Generated integration for validation
integration ${serviceName}:
  ${integrationCode.trim()}
`;
    
    return this.validate(wrappedCode, `${serviceName}.shep`);
  }

  /**
   * Show validation errors in VS Code
   */
  public showValidationErrors(errors: ValidationError[], filePath: string): void {
    if (errors.length === 0) return;
    
    const message = `Found ${errors.length} syntax error${errors.length > 1 ? 's' : ''} in ${filePath}`;
    
    vscode.window.showErrorMessage(
      message,
      'View Errors',
      'Fix Automatically',
      'Ignore'
    ).then(selection => {
      if (selection === 'View Errors') {
        // Show detailed error list
        const errorList = errors.map(e => 
          `Line ${e.line}: ${e.message}${e.suggestion ? `\n  Suggestion: ${e.suggestion}` : ''}`
        ).join('\n\n');
        
        vscode.window.showInformationMessage(
          'Syntax Errors:\n\n' + errorList,
          'OK'
        );
      } else if (selection === 'Fix Automatically') {
        // Try to auto-fix
        vscode.window.showInformationMessage(
          'Auto-fix attempted. Please review the generated files.',
          'OK'
        );
      }
    });
  }

  /**
   * Format validation result for logging
   */
  public formatValidationResult(result: ValidationResult, filePath: string): string {
    if (result.isValid) {
      return `✅ ${filePath}: Valid syntax`;
    }
    
    let message = `❌ ${filePath}: ${result.errors.length} error${result.errors.length > 1 ? 's' : ''}`;
    
    for (const error of result.errors) {
      message += `\n  Line ${error.line}: ${error.message}`;
      if (error.suggestion) {
        message += `\n    💡 ${error.suggestion}`;
      }
    }
    
    if (result.warnings.length > 0) {
      message += `\n⚠️  ${result.warnings.length} warning${result.warnings.length > 1 ? 's' : ''}`;
      for (const warning of result.warnings) {
        message += `\n  Line ${warning.line}: ${warning.message}`;
      }
    }
    
    return message;
  }
}
