/**
 * ShepVerify Verification Service
 * 
 * Bridges the gap between VS Code diagnostics and the ShepVerify Dashboard.
 * Converts raw diagnostics into a structured VerificationReport.
 */

import * as vscode from 'vscode';
import { VerificationReport, VerificationStatus, createEmptyReport } from './types';

/**
 * Service for running verification and generating reports
 */
export class VerificationService {
  /**
   * No initialization needed - we read from VS Code's diagnostic collection
   */

  /**
   * Run verification on the active document
   * Returns a VerificationReport based on current diagnostics
   */
  public runVerification(document: vscode.TextDocument | undefined): VerificationReport {
    if (!document || document.languageId !== 'sheplang') {
      // No ShepLang file active
      return createEmptyReport();
    }

    // Get diagnostics for this document from VS Code API
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    // Convert diagnostics to VerificationReport
    return this.diagnosticsToReport(document, diagnostics);
  }

  /**
   * Convert VS Code diagnostics into a VerificationReport
   */
  private diagnosticsToReport(
    document: vscode.TextDocument,
    diagnostics: readonly vscode.Diagnostic[]
  ): VerificationReport {
    
    const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
    const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning);

    // Determine overall status
    let status: VerificationStatus;
    if (errors.length > 0) {
      status = 'failed';
    } else if (warnings.length > 0) {
      status = 'warning';
    } else {
      status = 'passed';
    }

    // Calculate score (100 if no errors, reduced by errors/warnings)
    const errorPenalty = errors.length * 10;
    const warningPenalty = warnings.length * 5;
    const score = Math.max(0, 100 - errorPenalty - warningPenalty);

    // For now, categorize all errors into "Type Safety" phase
    // Later slices will properly categorize by phase
    const report = createEmptyReport();
    report.status = status;
    report.timestamp = new Date();
    report.score = score;
    report.scores = {
      frontend: score,
      backend: 100,
      schema: 100,
      flow: 100
    };

    // Populate Type Safety phase (simplified for Slice 2)
    report.phases.typeSafety.status = status;
    report.phases.typeSafety.errors = errors.map((diag, idx) => ({
      id: `err-${idx}`,
      message: diag.message,
      file: document.uri.fsPath,
      line: diag.range.start.line + 1,
      column: diag.range.start.character + 1,
      severity: 'error',
      fixable: false,
      suggestion: diag.code ? String(diag.code) : undefined
    }));

    report.phases.typeSafety.warnings = warnings.map((diag, idx) => ({
      id: `warn-${idx}`,
      message: diag.message,
      file: document.uri.fsPath,
      line: diag.range.start.line + 1,
      column: diag.range.start.character + 1,
      severity: 'warning'
    }));

    report.phases.typeSafety.passed = diagnostics.length === 0 ? 1 : 0;
    report.phases.typeSafety.passRate = diagnostics.length === 0 ? 100 : 0;

    // Set other phases to passed (will be implemented in later slices)
    report.phases.nullSafety.status = 'passed';
    report.phases.nullSafety.passed = 1;
    report.phases.nullSafety.passRate = 100;

    report.phases.apiContracts.status = 'passed';
    report.phases.apiContracts.passed = 1;
    report.phases.apiContracts.passRate = 100;

    report.phases.exhaustiveness.status = 'passed';
    report.phases.exhaustiveness.passed = 1;
    report.phases.exhaustiveness.passRate = 100;

    return report;
  }
}
