/**
 * Exhaustiveness Pass
 * 
 * Checks for incomplete branching and unreachable code
 * Part of Phase 4: Catches 10% of bugs (logic gaps)
 */

import type { AppModel } from '@sheplang/language';
import type { Diagnostic } from '../types.js';

/**
 * Check for exhaustiveness issues:
 * - Missing else branches
 * - Unreachable code after show statements
 * - Incomplete control flow
 * 
 * @param appModel - Parsed ShepLang application
 * @returns Array of diagnostics
 */
export function checkExhaustiveness(appModel: AppModel): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  
  // Check each action for exhaustiveness issues
  for (const action of appModel.actions) {
    // Check for missing else branches
    checkMissingElseBranches(action, diagnostics);
    
    // Check for unreachable code
    checkUnreachableCode(action, diagnostics);
  }
  
  return diagnostics;
}

/**
 * Check if action has if statements without else branches
 */
function checkMissingElseBranches(
  action: AppModel['actions'][0],
  diagnostics: Diagnostic[]
): void {
  for (const op of action.ops) {
    if (op.kind === 'if') {
      // Check if has else branch
      const hasElse = op.elseBranch && op.elseBranch.length > 0;
      
      if (!hasElse) {
        diagnostics.push({
          severity: 'warning',
          line: action.__location?.startLine ?? 1,
          column: action.__location?.startColumn ?? 1,
          message: `Incomplete branching: 'if' statement without 'else' branch`,
          type: 'exhaustiveness',
          suggestion: 'Consider adding an else branch to handle all cases'
        });
      }
      
      // Recursively check nested branches
      if (op.thenBranch) {
        checkBranchForMissingElse(op.thenBranch, action, diagnostics);
      }
      if (op.elseBranch) {
        checkBranchForMissingElse(op.elseBranch, action, diagnostics);
      }
    }
  }
}

/**
 * Check nested branches for missing else
 */
function checkBranchForMissingElse(
  branch: any[],
  action: AppModel['actions'][0],
  diagnostics: Diagnostic[]
): void {
  for (const op of branch) {
    if (op.kind === 'if') {
      const hasElse = op.elseBranch && op.elseBranch.length > 0;
      
      if (!hasElse) {
        diagnostics.push({
          severity: 'warning',
          line: action.__location?.startLine ?? 1,
          column: action.__location?.startColumn ?? 1,
          message: `Incomplete branching: nested 'if' without 'else' branch`,
          type: 'exhaustiveness',
          suggestion: 'Add else branch to handle all cases'
        });
      }
      
      // Continue recursion
      if (op.thenBranch) {
        checkBranchForMissingElse(op.thenBranch, action, diagnostics);
      }
      if (op.elseBranch) {
        checkBranchForMissingElse(op.elseBranch, action, diagnostics);
      }
    }
  }
}

/**
 * Check for unreachable code after terminal operations
 * Terminal operations: show
 */
function checkUnreachableCode(
  action: AppModel['actions'][0],
  diagnostics: Diagnostic[]
): void {
  const ops = action.ops;
  
  // Find first terminal operation (show)
  let terminalIndex = -1;
  for (let i = 0; i < ops.length; i++) {
    if (ops[i].kind === 'show') {
      terminalIndex = i;
      break;
    }
  }
  
  // Check if there's code after the terminal operation
  if (terminalIndex >= 0 && terminalIndex < ops.length - 1) {
    diagnostics.push({
      severity: 'warning',
      line: action.__location?.startLine ?? 1,
      column: action.__location?.startColumn ?? 1,
      message: `Unreachable code detected: statements after 'show' will never execute`,
      type: 'exhaustiveness',
      suggestion: 'Remove unreachable statements or restructure your logic'
    });
  }
  
  // Check if all branches in an if-else end with show
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (op.kind === 'if') {
      const thenEndsWithShow = branchEndsWithShow(op.thenBranch);
      const elseEndsWithShow = op.elseBranch ? branchEndsWithShow(op.elseBranch) : false;
      
      // If both branches end with show, any code after is unreachable
      if (thenEndsWithShow && elseEndsWithShow && i < ops.length - 1) {
        diagnostics.push({
          severity: 'warning',
          line: action.__location?.startLine ?? 1,
          column: action.__location?.startColumn ?? 1,
          message: `Unreachable code: all branches end with 'show', statements after will never execute`,
          type: 'exhaustiveness',
          suggestion: 'Remove unreachable statements after the if-else block'
        });
      }
    }
  }
}

/**
 * Check if a branch ends with a show statement
 */
function branchEndsWithShow(branch: any[] | undefined): boolean {
  if (!branch || branch.length === 0) return false;
  
  const lastOp = branch[branch.length - 1];
  
  // Direct show
  if (lastOp.kind === 'show') return true;
  
  // Nested if-else where both branches end with show
  if (lastOp.kind === 'if') {
    const thenEnds = branchEndsWithShow(lastOp.thenBranch);
    const elseEnds = lastOp.elseBranch ? branchEndsWithShow(lastOp.elseBranch) : false;
    return thenEnds && elseEnds;
  }
  
  return false;
}
