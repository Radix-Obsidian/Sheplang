/**
 * ShepLang Cross-File Scope Resolution
 * 
 * This module enables ShepLang to resolve references across multiple .shep files
 * in the same workspace. By default, Langium only exports top-level AST elements
 * to the global scope. Since ShepLang declarations are nested inside `app { }`,
 * we need a custom ScopeComputation to export them.
 * 
 * Architecture:
 * - computeExports: Exports DataDecl, ViewDecl, ActionDecl from all app blocks
 * - This enables cross-file reference resolution
 */

import type { AstNode, AstNodeDescription, LangiumDocument } from 'langium';
import { AstUtils, Cancellation, DefaultScopeComputation, interruptAndCheck } from 'langium';
import type { ShepFile, TopDecl } from './generated/ast.js';
import { isDataDecl, isViewDecl, isActionDecl, isFlowDecl, isJobDecl, isWorkflowDecl } from './generated/ast.js';

/**
 * Custom scope computation that exports nested declarations from app blocks
 * to the global scope, enabling cross-file reference resolution.
 */
export class ShepScopeComputation extends DefaultScopeComputation {
  
  /**
   * Override to export all declarations nested inside app { } blocks
   * to the global scope so they're visible across files.
   */
  override async computeExports(
    document: LangiumDocument,
    cancelToken = Cancellation.CancellationToken.None
  ): Promise<AstNodeDescription[]> {
    const exportedSymbols: AstNodeDescription[] = [];
    
    const shepFile = document.parseResult.value as ShepFile;
    if (!shepFile || !shepFile.app) {
      return exportedSymbols;
    }
    
    const appDecl = shepFile.app;
    
    // Export the app itself (so other files can reference it if needed)
    if (appDecl.name) {
      exportedSymbols.push(
        this.descriptions.createDescription(appDecl, appDecl.name, document)
      );
    }
    
    // Export all nested declarations (DataDecl, ViewDecl, ActionDecl, etc.)
    for (const decl of appDecl.decls || []) {
      await interruptAndCheck(cancelToken);
      const description = this.exportDeclaration(decl, document);
      if (description) {
        exportedSymbols.push(description);
      }
    }
    
    console.log(`[ShepScope] Exported ${exportedSymbols.length} symbols from ${document.uri.path}`);
    return exportedSymbols;
  }
  
  /**
   * Create an exported description for a TopDecl
   */
  private exportDeclaration(decl: TopDecl, document: LangiumDocument): AstNodeDescription | undefined {
    // Get the name based on declaration type
    let name: string | undefined;
    
    if (isDataDecl(decl)) {
      name = decl.name;
    } else if (isViewDecl(decl)) {
      name = decl.name;
    } else if (isActionDecl(decl)) {
      name = decl.name;
    } else if (isFlowDecl(decl)) {
      name = decl.name;
    } else if (isJobDecl(decl)) {
      name = decl.name;
    } else if (isWorkflowDecl(decl)) {
      name = decl.name;
    }
    
    if (name) {
      return this.descriptions.createDescription(decl, name, document);
    }
    
    return undefined;
  }
}
