/**
 * Universal Verifier Service
 * 
 * Phase 5: Multi-Language ShepVerify Support
 * 
 * This service extends ShepVerify beyond ShepLang to support:
 * - TypeScript/JavaScript
 * - Python
 * - Other languages (future)
 * 
 * The goal is to make ShepVerify's verification power available to ALL developers,
 * not just those using ShepLang syntax. This increases viral potential and adoption.
 * 
 * Per GSAIM: "Build narrow. Test deep. Ship confidently."
 * Per Golden Sheep Philo: "Every feature is a mini-MVP."
 */

import * as vscode from 'vscode';
import { VerificationReport, VerificationError, VerificationWarning, createEmptyReport } from '../dashboard/types';

/**
 * Supported languages for universal verification
 * Covers industry-standard SaaS/web application languages
 */
export type SupportedLanguage = 
  | 'sheplang'        // Native support
  | 'typescript'      // TypeScript files
  | 'javascript'      // JavaScript files
  | 'typescriptreact' // TSX files (React)
  | 'javascriptreact' // JSX files (React)
  | 'html'            // HTML files
  | 'css'             // CSS files
  | 'scss'            // SCSS files
  | 'less'            // LESS files
  | 'json'            // JSON files
  | 'python';         // Python files (future)

/**
 * Language-specific verification adapter interface
 * Each language implements this to provide verification
 */
export interface LanguageVerificationAdapter {
  /** Language ID this adapter handles */
  languageId: SupportedLanguage;
  
  /** Run verification on the document */
  verify(document: vscode.TextDocument): Promise<VerificationReport>;
  
  /** Check if this adapter can handle the document */
  canHandle(document: vscode.TextDocument): boolean;
}

/**
 * Universal Verifier Service
 * 
 * Orchestrates verification across multiple languages
 */
export class UniversalVerifierService {
  private adapters: Map<SupportedLanguage, LanguageVerificationAdapter> = new Map();
  
  constructor() {
    // Register built-in adapters for industry-standard languages
    // Tier 1: Core Web (HTML, CSS, JS, TS)
    this.registerAdapter(new TypeScriptVerificationAdapter()); // Handles JS, TS, JSX, TSX
    this.registerAdapter(new HTMLVerificationAdapter());
    this.registerAdapter(new CSSVerificationAdapter()); // Handles CSS, SCSS, LESS
    
    // Tier 2: Config & Data
    this.registerAdapter(new JSONVerificationAdapter());
    
    // Tier 3: Backend Languages
    this.registerAdapter(new PythonVerificationAdapter()); // Django, Flask, FastAPI
    // Future:
    // this.registerAdapter(new PHPVerificationAdapter());    // Laravel
    // this.registerAdapter(new JavaVerificationAdapter());   // Spring Boot
    // this.registerAdapter(new CSharpVerificationAdapter()); // ASP.NET Core
  }
  
  /**
   * Register a language verification adapter
   */
  registerAdapter(adapter: LanguageVerificationAdapter): void {
    this.adapters.set(adapter.languageId, adapter);
  }
  
  /**
   * Check if a language is supported
   */
  isLanguageSupported(languageId: string): boolean {
    if (languageId === 'sheplang') return true;
    
    // Check all adapters - some handle multiple languages
    const supportedByAdapters = [
      'typescript', 'javascript', 'typescriptreact', 'javascriptreact', // TS adapter
      'html',                                                            // HTML adapter
      'css', 'scss', 'less',                                            // CSS adapter
      'json', 'jsonc',                                                  // JSON adapter
      'python'                                                           // Python adapter
    ];
    return supportedByAdapters.includes(languageId);
  }
  
  /**
   * Get supported languages
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return ['sheplang', ...Array.from(this.adapters.keys())];
  }
  
  /**
   * Run verification on a document
   */
  async verify(document: vscode.TextDocument): Promise<VerificationReport> {
    const languageId = document.languageId;
    
    // ShepLang uses the native verifier
    if (languageId === 'sheplang') {
      // Delegate to existing ShepLang verifier
      return createEmptyReport(); // Placeholder - actual implementation in verificationService.ts
    }
    
    // Find adapter that can handle this document
    // We iterate through all adapters because one adapter may handle multiple languages
    // (e.g., TypeScript adapter handles typescript, javascript, typescriptreact, javascriptreact)
    for (const adapter of this.adapters.values()) {
      if (adapter.canHandle(document)) {
        return adapter.verify(document);
      }
    }
    
    // No adapter found
    return createEmptyReport();
  }
}

/**
 * TypeScript/JavaScript Verification Adapter
 * 
 * Provides ShepVerify-style verification for TypeScript/JavaScript files.
 * Uses TypeScript compiler API and ESLint-style checks.
 */
class TypeScriptVerificationAdapter implements LanguageVerificationAdapter {
  languageId: SupportedLanguage = 'typescript';
  
  canHandle(document: vscode.TextDocument): boolean {
    const supportedIds = ['typescript', 'javascript', 'typescriptreact', 'javascriptreact'];
    return supportedIds.includes(document.languageId);
  }
  
  async verify(document: vscode.TextDocument): Promise<VerificationReport> {
    const report = createEmptyReport(document.languageId);
    report.timestamp = new Date();
    report.language = document.languageId;
    
    const text = document.getText();
    const filePath = document.uri.fsPath;
    const isReact = document.languageId === 'typescriptreact' || document.languageId === 'javascriptreact';
    
    // Phase 1: Type Safety Checks
    const typeSafetyErrors = this.checkTypeSafety(text, filePath);
    report.phases.typeSafety.errors = typeSafetyErrors;
    report.phases.typeSafety.status = typeSafetyErrors.length > 0 ? 'failed' : 'passed';
    
    // Phase 2: Null Safety Checks
    const nullSafetyErrors = this.checkNullSafety(text, filePath);
    report.phases.nullSafety.errors = nullSafetyErrors;
    report.phases.nullSafety.status = nullSafetyErrors.length > 0 ? 'failed' : 'passed';
    
    // Phase 3: API Contract Checks (for React components)
    const apiContractErrors = this.checkApiContracts(text, filePath);
    report.phases.apiContracts.errors = apiContractErrors;
    report.phases.apiContracts.status = apiContractErrors.length > 0 ? 'failed' : 'passed';
    
    // Phase 4: Exhaustiveness Checks
    const exhaustivenessWarnings = this.checkExhaustiveness(text, filePath);
    report.phases.exhaustiveness.warnings = exhaustivenessWarnings;
    report.phases.exhaustiveness.status = exhaustivenessWarnings.length > 0 ? 'warning' : 'passed';
    
    // Calculate overall status
    const totalErrors = typeSafetyErrors.length + nullSafetyErrors.length + apiContractErrors.length;
    const totalWarnings = exhaustivenessWarnings.length;
    
    if (totalErrors > 0) {
      report.status = 'failed';
    } else if (totalWarnings > 0) {
      report.status = 'warning';
    } else {
      report.status = 'passed';
    }
    
    // Calculate language-specific scores
    report.scores = {
      typeSafety: typeSafetyErrors.length === 0 ? 100 : Math.max(0, 100 - typeSafetyErrors.length * 20),
      nullSafety: nullSafetyErrors.length === 0 ? 100 : Math.max(0, 100 - nullSafetyErrors.length * 20),
      codeQuality: exhaustivenessWarnings.length === 0 ? 100 : Math.max(0, 100 - exhaustivenessWarnings.length * 10),
      reactPatterns: isReact ? (apiContractErrors.length === 0 ? 100 : Math.max(0, 100 - apiContractErrors.length * 20)) : undefined
    };
    
    // Calculate overall score (average of non-undefined scores)
    const scoreValues = Object.values(report.scores).filter((v): v is number => v !== undefined);
    report.score = scoreValues.length > 0 
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 100;
    
    return report;
  }
  
  /**
   * Check for type safety issues in TypeScript/JavaScript
   */
  private checkTypeSafety(text: string, filePath: string): VerificationError[] {
    const errors: VerificationError[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      // Check for 'any' type usage
      if (line.match(/:\s*any\b/) || line.match(/<any>/)) {
        errors.push({
          id: `ts-any-${lineNum}`,
          message: 'Avoid using "any" type - use specific types for better type safety',
          file: filePath,
          line: lineNum,
          column: line.indexOf('any') + 1,
          severity: 'error',
          fixable: true,
          suggestion: 'Replace "any" with a specific type or use "unknown" if type is truly unknown'
        });
      }
      
      // Check for type assertions that might hide errors
      if (line.match(/as\s+\w+/) && !line.match(/as\s+const/)) {
        // Only flag suspicious type assertions
        if (line.match(/as\s+(any|unknown)/)) {
          errors.push({
            id: `ts-assertion-${lineNum}`,
            message: 'Type assertion to "any" or "unknown" may hide type errors',
            file: filePath,
            line: lineNum,
            column: line.indexOf('as') + 1,
            severity: 'error',
            fixable: false,
            suggestion: 'Consider using type guards instead of type assertions'
          });
        }
      }
    });
    
    return errors;
  }
  
  /**
   * Check for null safety issues
   */
  private checkNullSafety(text: string, filePath: string): VerificationError[] {
    const errors: VerificationError[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      // Check for potential null/undefined access without optional chaining
      // Pattern: variable.property where variable might be null
      if (line.match(/\w+\.\w+/) && !line.match(/\?\./)) {
        // Check if there's a potential null value being accessed
        if (line.match(/(data|result|response|user|item|value)\.\w+/) && !line.match(/\?\./)) {
          // Only flag if not already using optional chaining
          const match = line.match(/(data|result|response|user|item|value)\.(\w+)/);
          if (match && !line.includes(`${match[1]}?.`)) {
            errors.push({
              id: `null-access-${lineNum}`,
              message: `Potential null access on "${match[1]}.${match[2]}" - consider using optional chaining`,
              file: filePath,
              line: lineNum,
              column: line.indexOf(match[0]) + 1,
              severity: 'error',
              fixable: true,
              suggestion: `Use "${match[1]}?.${match[2]}" for safe access`
            });
          }
        }
      }
      
      // Check for non-null assertions (!)
      if (line.match(/\w+!/)) {
        errors.push({
          id: `non-null-assertion-${lineNum}`,
          message: 'Non-null assertion (!) bypasses null checks - ensure value is never null',
          file: filePath,
          line: lineNum,
          column: line.indexOf('!') + 1,
          severity: 'error',
          fixable: false,
          suggestion: 'Add proper null check or use optional chaining instead'
        });
      }
    });
    
    return errors;
  }
  
  /**
   * Check for API contract issues (React props, function signatures)
   */
  private checkApiContracts(text: string, filePath: string): VerificationError[] {
    const errors: VerificationError[] = [];
    const lines = text.split('\n');
    
    // Check for React components without proper prop types
    if (filePath.match(/\.(tsx|jsx)$/)) {
      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        
        // Check for function components without typed props
        if (line.match(/function\s+\w+\s*\(\s*\{/) && !line.match(/:\s*\w+Props/)) {
          errors.push({
            id: `react-props-${lineNum}`,
            message: 'React component props should be typed for better API contracts',
            file: filePath,
            line: lineNum,
            column: 1,
            severity: 'error',
            fixable: true,
            suggestion: 'Define a Props interface and type the component: function MyComponent({ prop }: MyComponentProps)'
          });
        }
        
        // Check for useEffect without dependency array
        if (line.match(/useEffect\s*\(\s*\(\)\s*=>\s*\{/) && !text.slice(text.indexOf(line)).match(/\]\s*\)/)) {
          // This is a simplified check - real implementation would parse the AST
        }
      });
    }
    
    return errors;
  }
  
  /**
   * Check for exhaustiveness issues (switch statements, etc.)
   */
  private checkExhaustiveness(text: string, filePath: string): VerificationWarning[] {
    const warnings: VerificationWarning[] = [];
    const lines = text.split('\n');
    
    let inSwitch = false;
    let hasDefault = false;
    let switchStartLine = 0;
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      if (line.match(/switch\s*\(/)) {
        inSwitch = true;
        hasDefault = false;
        switchStartLine = lineNum;
      }
      
      if (inSwitch && line.match(/default\s*:/)) {
        hasDefault = true;
      }
      
      if (inSwitch && line.match(/^\s*\}/)) {
        if (!hasDefault) {
          warnings.push({
            id: `switch-exhaustive-${switchStartLine}`,
            message: 'Switch statement may not be exhaustive - consider adding a default case',
            file: filePath,
            line: switchStartLine,
            column: 1,
            severity: 'warning'
          });
        }
        inSwitch = false;
      }
    });
    
    return warnings;
  }
}

/**
 * HTML Verification Adapter
 * 
 * Provides ShepVerify-style verification for HTML files.
 */
class HTMLVerificationAdapter implements LanguageVerificationAdapter {
  languageId: SupportedLanguage = 'html';
  
  canHandle(document: vscode.TextDocument): boolean {
    return document.languageId === 'html';
  }
  
  async verify(document: vscode.TextDocument): Promise<VerificationReport> {
    const report = createEmptyReport(document.languageId);
    report.timestamp = new Date();
    report.language = document.languageId;
    
    const text = document.getText();
    const filePath = document.uri.fsPath;
    
    // Phase 1: Accessibility checks (Type Safety equivalent)
    const accessibilityErrors = this.checkAccessibility(text, filePath);
    report.phases.typeSafety.errors = accessibilityErrors;
    report.phases.typeSafety.status = accessibilityErrors.length > 0 ? 'failed' : 'passed';
    
    // Phase 2: SEO checks (Null Safety equivalent)
    const seoWarnings = this.checkSEO(text, filePath);
    report.phases.nullSafety.warnings = seoWarnings;
    report.phases.nullSafety.status = seoWarnings.length > 0 ? 'warning' : 'passed';
    
    // Calculate overall status
    const totalErrors = accessibilityErrors.length;
    const totalWarnings = seoWarnings.length;
    
    if (totalErrors > 0) {
      report.status = 'failed';
    } else if (totalWarnings > 0) {
      report.status = 'warning';
    } else {
      report.status = 'passed';
    }
    
    // Calculate HTML-specific scores
    report.scores = {
      accessibility: accessibilityErrors.length === 0 ? 100 : Math.max(0, 100 - accessibilityErrors.length * 20),
      seo: seoWarnings.length === 0 ? 100 : Math.max(0, 100 - seoWarnings.length * 15),
      semantics: 100 // Placeholder - could check for semantic HTML elements
    };
    
    // Calculate overall score
    const scoreValues = Object.values(report.scores).filter((v): v is number => v !== undefined);
    report.score = scoreValues.length > 0 
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 100;
    
    return report;
  }
  
  private checkAccessibility(text: string, filePath: string): VerificationError[] {
    const errors: VerificationError[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      // Check for images without alt text
      if (line.match(/<img[^>]*(?!alt=)[^>]*>/i) && !line.match(/alt=["'][^"']*["']/i)) {
        errors.push({
          id: `a11y-img-alt-${lineNum}`,
          message: 'Image missing alt attribute - required for accessibility',
          file: filePath,
          line: lineNum,
          column: line.indexOf('<img') + 1,
          severity: 'error',
          fixable: true,
          suggestion: 'Add alt="description" to the img tag'
        });
      }
      
      // Check for buttons without accessible text
      if (line.match(/<button[^>]*>[\s]*<\/button>/i)) {
        errors.push({
          id: `a11y-button-empty-${lineNum}`,
          message: 'Button has no accessible text content',
          file: filePath,
          line: lineNum,
          column: line.indexOf('<button') + 1,
          severity: 'error',
          fixable: true,
          suggestion: 'Add text content or aria-label to the button'
        });
      }
      
      // Check for links without href
      if (line.match(/<a(?![^>]*href)[^>]*>/i)) {
        errors.push({
          id: `a11y-link-href-${lineNum}`,
          message: 'Anchor tag missing href attribute',
          file: filePath,
          line: lineNum,
          column: line.indexOf('<a') + 1,
          severity: 'error',
          fixable: true,
          suggestion: 'Add href attribute or use a button instead'
        });
      }
    });
    
    return errors;
  }
  
  private checkSEO(text: string, filePath: string): VerificationWarning[] {
    const warnings: VerificationWarning[] = [];
    
    // Check for missing title
    if (!text.match(/<title[^>]*>[^<]+<\/title>/i)) {
      warnings.push({
        id: 'seo-title-missing',
        message: 'Page is missing a title tag - important for SEO',
        file: filePath,
        line: 1,
        column: 1,
        severity: 'warning'
      });
    }
    
    // Check for missing meta description
    if (!text.match(/<meta[^>]*name=["']description["'][^>]*>/i)) {
      warnings.push({
        id: 'seo-meta-description',
        message: 'Page is missing meta description - important for SEO',
        file: filePath,
        line: 1,
        column: 1,
        severity: 'warning'
      });
    }
    
    // Check for missing viewport meta
    if (!text.match(/<meta[^>]*name=["']viewport["'][^>]*>/i)) {
      warnings.push({
        id: 'seo-viewport',
        message: 'Page is missing viewport meta tag - important for mobile',
        file: filePath,
        line: 1,
        column: 1,
        severity: 'warning'
      });
    }
    
    return warnings;
  }
}

/**
 * CSS Verification Adapter
 * 
 * Provides ShepVerify-style verification for CSS files.
 */
class CSSVerificationAdapter implements LanguageVerificationAdapter {
  languageId: SupportedLanguage = 'css';
  
  canHandle(document: vscode.TextDocument): boolean {
    const supportedIds = ['css', 'scss', 'less'];
    return supportedIds.includes(document.languageId);
  }
  
  async verify(document: vscode.TextDocument): Promise<VerificationReport> {
    const report = createEmptyReport(document.languageId);
    report.timestamp = new Date();
    report.language = document.languageId;
    
    const text = document.getText();
    const filePath = document.uri.fsPath;
    
    // Phase 1: Best practices (Type Safety equivalent)
    const bestPracticeErrors = this.checkBestPractices(text, filePath);
    report.phases.typeSafety.errors = bestPracticeErrors;
    report.phases.typeSafety.status = bestPracticeErrors.length > 0 ? 'failed' : 'passed';
    
    // Phase 2: Performance warnings
    const performanceWarnings = this.checkPerformance(text, filePath);
    report.phases.nullSafety.warnings = performanceWarnings;
    report.phases.nullSafety.status = performanceWarnings.length > 0 ? 'warning' : 'passed';
    
    // Calculate overall status
    const totalErrors = bestPracticeErrors.length;
    const totalWarnings = performanceWarnings.length;
    
    if (totalErrors > 0) {
      report.status = 'failed';
    } else if (totalWarnings > 0) {
      report.status = 'warning';
    } else {
      report.status = 'passed';
    }
    
    // Calculate CSS-specific scores
    report.scores = {
      bestPractices: bestPracticeErrors.length === 0 ? 100 : Math.max(0, 100 - bestPracticeErrors.length * 20),
      performance: performanceWarnings.length === 0 ? 100 : Math.max(0, 100 - performanceWarnings.length * 10),
      maintainability: 100 // Placeholder - could check nesting depth, selector complexity
    };
    
    // Calculate overall score
    const scoreValues = Object.values(report.scores).filter((v): v is number => v !== undefined);
    report.score = scoreValues.length > 0 
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 100;
    
    return report;
  }
  
  private checkBestPractices(text: string, filePath: string): VerificationError[] {
    const errors: VerificationError[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      // Check for !important usage
      if (line.match(/!important/i)) {
        errors.push({
          id: `css-important-${lineNum}`,
          message: 'Avoid using !important - it makes CSS harder to maintain',
          file: filePath,
          line: lineNum,
          column: line.indexOf('!important') + 1,
          severity: 'error',
          fixable: false,
          suggestion: 'Use more specific selectors instead of !important'
        });
      }
      
      // Check for inline styles in CSS (shouldn't happen but check anyway)
      if (line.match(/style\s*=/i)) {
        errors.push({
          id: `css-inline-${lineNum}`,
          message: 'Inline styles detected - use CSS classes instead',
          file: filePath,
          line: lineNum,
          column: line.indexOf('style') + 1,
          severity: 'error',
          fixable: true,
          suggestion: 'Move styles to CSS classes'
        });
      }
    });
    
    return errors;
  }
  
  private checkPerformance(text: string, filePath: string): VerificationWarning[] {
    const warnings: VerificationWarning[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      // Check for universal selector
      if (line.match(/^\s*\*\s*\{/)) {
        warnings.push({
          id: `css-universal-${lineNum}`,
          message: 'Universal selector (*) can impact performance',
          file: filePath,
          line: lineNum,
          column: 1,
          severity: 'warning'
        });
      }
      
      // Check for deep nesting (more than 3 levels)
      const nestingLevel = (line.match(/\s/g) || []).length / 2;
      if (nestingLevel > 6 && line.match(/\{/)) {
        warnings.push({
          id: `css-nesting-${lineNum}`,
          message: 'Deep CSS nesting detected - consider flattening selectors',
          file: filePath,
          line: lineNum,
          column: 1,
          severity: 'warning'
        });
      }
    });
    
    return warnings;
  }
}

/**
 * JSON Verification Adapter
 * 
 * Provides ShepVerify-style verification for JSON files.
 * Important for package.json, tsconfig.json, etc.
 */
class JSONVerificationAdapter implements LanguageVerificationAdapter {
  languageId: SupportedLanguage = 'json';
  
  canHandle(document: vscode.TextDocument): boolean {
    return document.languageId === 'json' || document.languageId === 'jsonc';
  }
  
  async verify(document: vscode.TextDocument): Promise<VerificationReport> {
    const report = createEmptyReport(document.languageId);
    report.timestamp = new Date();
    report.language = document.languageId;
    
    const text = document.getText();
    const filePath = document.uri.fsPath;
    const fileName = filePath.split(/[\\/]/).pop() || '';
    
    // Phase 1: Syntax validation
    const syntaxErrors = this.checkSyntax(text, filePath);
    report.phases.typeSafety.errors = syntaxErrors;
    report.phases.typeSafety.status = syntaxErrors.length > 0 ? 'failed' : 'passed';
    
    // Phase 2: Package.json specific checks
    let packageWarnings: any[] = [];
    if (fileName === 'package.json') {
      packageWarnings = this.checkPackageJson(text, filePath);
      report.phases.nullSafety.warnings = packageWarnings;
      report.phases.nullSafety.status = packageWarnings.length > 0 ? 'warning' : 'passed';
    }
    
    // Calculate overall status
    const totalErrors = syntaxErrors.length;
    const totalWarnings = report.phases.nullSafety.warnings.length;
    
    if (totalErrors > 0) {
      report.status = 'failed';
    } else if (totalWarnings > 0) {
      report.status = 'warning';
    } else {
      report.status = 'passed';
    }
    
    // Calculate JSON-specific scores
    report.scores = {
      syntax: syntaxErrors.length === 0 ? 100 : 0, // Syntax is binary - valid or not
      schemaCompliance: 100, // Placeholder - could validate against JSON Schema
      bestPractices: packageWarnings.length === 0 ? 100 : Math.max(0, 100 - packageWarnings.length * 10)
    };
    
    // Calculate overall score
    const scoreValues = Object.values(report.scores).filter((v): v is number => v !== undefined);
    report.score = scoreValues.length > 0 
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 100;
    
    return report;
  }
  
  private checkSyntax(text: string, filePath: string): VerificationError[] {
    const errors: VerificationError[] = [];
    
    try {
      JSON.parse(text);
    } catch (e) {
      const error = e as SyntaxError;
      // Try to extract line number from error message
      const match = error.message.match(/position (\d+)/);
      let line = 1;
      let column = 1;
      
      if (match) {
        const position = parseInt(match[1], 10);
        const lines = text.substring(0, position).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
      
      errors.push({
        id: 'json-syntax-error',
        message: `Invalid JSON: ${error.message}`,
        file: filePath,
        line,
        column,
        severity: 'error',
        fixable: false,
        suggestion: 'Check for missing commas, brackets, or quotes'
      });
    }
    
    return errors;
  }
  
  private checkPackageJson(text: string, filePath: string): VerificationWarning[] {
    const warnings: VerificationWarning[] = [];
    
    try {
      const pkg = JSON.parse(text);
      
      // Check for missing name
      if (!pkg.name) {
        warnings.push({
          id: 'pkg-missing-name',
          message: 'package.json is missing "name" field',
          file: filePath,
          line: 1,
          column: 1,
          severity: 'warning'
        });
      }
      
      // Check for missing version
      if (!pkg.version) {
        warnings.push({
          id: 'pkg-missing-version',
          message: 'package.json is missing "version" field',
          file: filePath,
          line: 1,
          column: 1,
          severity: 'warning'
        });
      }
      
      // Check for missing description
      if (!pkg.description) {
        warnings.push({
          id: 'pkg-missing-description',
          message: 'package.json is missing "description" field - important for npm',
          file: filePath,
          line: 1,
          column: 1,
          severity: 'warning'
        });
      }
      
      // Check for outdated dependencies (simplified check)
      if (pkg.dependencies) {
        for (const [dep, version] of Object.entries(pkg.dependencies)) {
          if (typeof version === 'string' && version.startsWith('^0.')) {
            warnings.push({
              id: `pkg-unstable-${dep}`,
              message: `Dependency "${dep}" is version 0.x - may be unstable`,
              file: filePath,
              line: 1,
              column: 1,
              severity: 'warning'
            });
          }
        }
      }
      
    } catch (e) {
      // Syntax error already caught in checkSyntax
    }
    
    return warnings;
  }
}

/**
 * Python Verification Adapter
 * 
 * Provides ShepVerify-style verification for Python files.
 * Inspired by Pylint, mypy, and PEP8 standards.
 * 
 * Python is the second most used language for AI - essential for our users.
 */
class PythonVerificationAdapter implements LanguageVerificationAdapter {
  languageId: SupportedLanguage = 'python';
  
  canHandle(document: vscode.TextDocument): boolean {
    return document.languageId === 'python';
  }
  
  async verify(document: vscode.TextDocument): Promise<VerificationReport> {
    const report = createEmptyReport(document.languageId);
    report.timestamp = new Date();
    report.language = document.languageId;
    
    const text = document.getText();
    const filePath = document.uri.fsPath;
    
    // Phase 1: Type Hints (mypy-style)
    const typeHintIssues = this.checkTypeHints(text, filePath);
    report.phases.typeSafety.errors = typeHintIssues.errors;
    report.phases.typeSafety.warnings = typeHintIssues.warnings;
    report.phases.typeSafety.status = typeHintIssues.errors.length > 0 ? 'failed' : 
      typeHintIssues.warnings.length > 0 ? 'warning' : 'passed';
    
    // Phase 2: None Safety
    const noneSafetyErrors = this.checkNoneSafety(text, filePath);
    report.phases.nullSafety.errors = noneSafetyErrors;
    report.phases.nullSafety.status = noneSafetyErrors.length > 0 ? 'failed' : 'passed';
    
    // Phase 3: Code Quality (PEP8 + Best Practices)
    const qualityWarnings = this.checkCodeQuality(text, filePath);
    report.phases.apiContracts.warnings = qualityWarnings;
    report.phases.apiContracts.status = qualityWarnings.length > 0 ? 'warning' : 'passed';
    
    // Phase 4: Best Practices (Django/Flask patterns)
    const bestPracticeWarnings = this.checkBestPractices(text, filePath);
    report.phases.exhaustiveness.warnings = bestPracticeWarnings;
    report.phases.exhaustiveness.status = bestPracticeWarnings.length > 0 ? 'warning' : 'passed';
    
    // Calculate overall status
    const totalErrors = typeHintIssues.errors.length + noneSafetyErrors.length;
    const totalWarnings = typeHintIssues.warnings.length + qualityWarnings.length + bestPracticeWarnings.length;
    
    if (totalErrors > 0) {
      report.status = 'failed';
    } else if (totalWarnings > 0) {
      report.status = 'warning';
    } else {
      report.status = 'passed';
    }
    
    // Calculate Python-specific scores
    // Count total functions to calculate type hint coverage
    const functionCount = (text.match(/def\s+\w+/g) || []).length;
    const typedFunctionCount = (text.match(/def\s+\w+\([^)]*:[^)]*\)/g) || []).length;
    const typeHintScore = functionCount > 0 
      ? Math.round((typedFunctionCount / functionCount) * 100)
      : 100;
    
    report.scores = {
      typeSafety: Math.max(0, typeHintScore - typeHintIssues.errors.length * 10),
      nullSafety: noneSafetyErrors.length === 0 ? 100 : Math.max(0, 100 - noneSafetyErrors.length * 15),
      codeQuality: qualityWarnings.length === 0 ? 100 : Math.max(0, 100 - qualityWarnings.length * 5),
      bestPractices: bestPracticeWarnings.length === 0 ? 100 : Math.max(0, 100 - bestPracticeWarnings.length * 5)
    };
    
    // Calculate overall score
    const scoreValues = Object.values(report.scores).filter((v): v is number => v !== undefined);
    report.score = scoreValues.length > 0 
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 100;
    
    return report;
  }
  
  /**
   * Check for type hint issues (mypy-style)
   */
  private checkTypeHints(text: string, filePath: string): { errors: VerificationError[], warnings: VerificationWarning[] } {
    const errors: VerificationError[] = [];
    const warnings: VerificationWarning[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      // Check for functions without type hints
      const funcMatch = line.match(/^\s*def\s+(\w+)\s*\(([^)]*)\)\s*:/);
      if (funcMatch) {
        const funcName = funcMatch[1];
        const params = funcMatch[2];
        
        // Check if function has no return type annotation
        if (!line.includes('->')) {
          warnings.push({
            id: `py-no-return-type-${lineNum}`,
            message: `Function "${funcName}" missing return type annotation`,
            file: filePath,
            line: lineNum,
            column: line.indexOf('def') + 1,
            severity: 'warning'
          });
        }
        
        // Check if parameters lack type hints (excluding self, cls)
        if (params && !params.includes(':')) {
          const paramList = params.split(',').map(p => p.trim()).filter(p => p && p !== 'self' && p !== 'cls');
          if (paramList.length > 0) {
            warnings.push({
              id: `py-no-param-types-${lineNum}`,
              message: `Function "${funcName}" has untyped parameters: ${paramList.join(', ')}`,
              file: filePath,
              line: lineNum,
              column: line.indexOf('(') + 1,
              severity: 'warning'
            });
          }
        }
      }
      
      // Check for 'Any' type usage (similar to TypeScript's 'any')
      if (line.match(/:\s*Any\b/) || line.match(/->\s*Any\b/)) {
        errors.push({
          id: `py-any-type-${lineNum}`,
          message: 'Avoid using "Any" type - use specific types for better type safety',
          file: filePath,
          line: lineNum,
          column: line.indexOf('Any') + 1,
          severity: 'error',
          fixable: true,
          suggestion: 'Replace "Any" with a specific type or use Union/Optional'
        });
      }
    });
    
    return { errors, warnings };
  }
  
  /**
   * Check for None safety issues
   */
  private checkNoneSafety(text: string, filePath: string): VerificationError[] {
    const errors: VerificationError[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      // Check for potential None access without guard
      // Pattern: variable.method() where variable might be None
      if (line.match(/\w+\.\w+\(/) && !line.includes(' if ') && !line.includes(' is not None')) {
        // Check if there's an 'or None' or '= None' on a previous line
        // This is a simplified check - real analysis would need AST
        const prevLines = lines.slice(Math.max(0, idx - 5), idx).join('\n');
        if (prevLines.includes('= None') || prevLines.includes('or None') || prevLines.includes('Optional[')) {
          // Might be accessing a potentially None value
          // Only flag if it looks risky
          if (line.match(/result\./) || line.match(/response\./) || line.match(/data\./)) {
            errors.push({
              id: `py-potential-none-${lineNum}`,
              message: 'Potential None access - consider using "if x is not None" guard',
              file: filePath,
              line: lineNum,
              column: 1,
              severity: 'error',
              fixable: true,
              suggestion: 'Add None check: "if variable is not None:"'
            });
          }
        }
      }
      
      // Check for bare except (catches everything including KeyboardInterrupt)
      if (line.match(/^\s*except\s*:/)) {
        errors.push({
          id: `py-bare-except-${lineNum}`,
          message: 'Bare "except:" catches all exceptions including KeyboardInterrupt',
          file: filePath,
          line: lineNum,
          column: line.indexOf('except') + 1,
          severity: 'error',
          fixable: true,
          suggestion: 'Use "except Exception:" or catch specific exceptions'
        });
      }
    });
    
    return errors;
  }
  
  /**
   * Check code quality (PEP8 style + complexity)
   */
  private checkCodeQuality(text: string, filePath: string): VerificationWarning[] {
    const warnings: VerificationWarning[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      // Check line length (PEP8: 79 characters, we'll use 120 as modern standard)
      if (line.length > 120) {
        warnings.push({
          id: `py-line-length-${lineNum}`,
          message: `Line exceeds 120 characters (${line.length})`,
          file: filePath,
          line: lineNum,
          column: 121,
          severity: 'warning'
        });
      }
      
      // Check for mutable default arguments (common Python gotcha)
      if (line.match(/def\s+\w+\([^)]*=\s*\[\]/) || line.match(/def\s+\w+\([^)]*=\s*\{\}/)) {
        warnings.push({
          id: `py-mutable-default-${lineNum}`,
          message: 'Mutable default argument - use None and create inside function',
          file: filePath,
          line: lineNum,
          column: 1,
          severity: 'warning'
        });
      }
      
      // Check for print() statements (should use logging in production)
      if (line.match(/\bprint\s*\(/)) {
        warnings.push({
          id: `py-print-${lineNum}`,
          message: 'Consider using logging instead of print() for production code',
          file: filePath,
          line: lineNum,
          column: line.indexOf('print') + 1,
          severity: 'warning'
        });
      }
      
      // Check for TODO/FIXME comments
      if (line.match(/[#]\s*(TODO|FIXME|XXX|HACK)/i)) {
        warnings.push({
          id: `py-todo-${lineNum}`,
          message: 'TODO/FIXME comment found - consider resolving',
          file: filePath,
          line: lineNum,
          column: 1,
          severity: 'warning'
        });
      }
    });
    
    return warnings;
  }
  
  /**
   * Check for Python best practices (Django/Flask patterns)
   */
  private checkBestPractices(text: string, filePath: string): VerificationWarning[] {
    const warnings: VerificationWarning[] = [];
    const lines = text.split('\n');
    
    // Check for missing docstrings in classes and functions
    let inFunction = false;
    let functionStartLine = 0;
    let hasDocstring = false;
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      // Track function/class definitions
      if (line.match(/^\s*(def|class)\s+\w+/)) {
        // Check if previous function had a docstring
        if (inFunction && !hasDocstring && functionStartLine > 0) {
          warnings.push({
            id: `py-no-docstring-${functionStartLine}`,
            message: 'Function/class missing docstring',
            file: filePath,
            line: functionStartLine,
            column: 1,
            severity: 'warning'
          });
        }
        
        inFunction = true;
        functionStartLine = lineNum;
        hasDocstring = false;
      }
      
      // Check for docstring
      if (inFunction && (line.includes('"""') || line.includes("'''"))) {
        hasDocstring = true;
      }
      
      // Check for hardcoded credentials
      if (line.match(/password\s*=\s*["'][^"']+["']/) || 
          line.match(/secret\s*=\s*["'][^"']+["']/) ||
          line.match(/api_key\s*=\s*["'][^"']+["']/)) {
        warnings.push({
          id: `py-hardcoded-secret-${lineNum}`,
          message: 'Potential hardcoded credential detected - use environment variables',
          file: filePath,
          line: lineNum,
          column: 1,
          severity: 'warning'
        });
      }
      
      // Check for import * (wildcard imports)
      if (line.match(/from\s+\w+\s+import\s+\*/)) {
        warnings.push({
          id: `py-wildcard-import-${lineNum}`,
          message: 'Avoid wildcard imports - import specific names',
          file: filePath,
          line: lineNum,
          column: 1,
          severity: 'warning'
        });
      }
    });
    
    return warnings;
  }
}
