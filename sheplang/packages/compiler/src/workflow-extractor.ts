/**
 * Phase 4-01: Workflow Orchestration - Extraction Module
 * Extracts workflow definitions from AppModel
 */

import type { AppModel } from '@goldensheepai/sheplang-language';

export interface WorkflowStep {
  name: string;
  action: string; // API call or operation
  onSuccess?: string; // Next step name
  onFailure?: string; // Error step name
}

export interface WorkflowDefinition {
  name: string;
  steps: WorkflowStep[];
  initialStep: string;
}

/**
 * Extract workflows from AppModel
 */
export function extractWorkflows(app: AppModel): WorkflowDefinition[] {
  const workflows: WorkflowDefinition[] = [];
  
  // For Phase 4-01, workflows are defined as special actions with step structure
  // We'll look for actions that have workflow-like patterns
  
  // Future: Add dedicated workflow syntax to grammar
  // For now, return empty array - will be populated when grammar is extended
  
  return workflows;
}

/**
 * Analyze an action to see if it contains workflow-like steps
 */
function isWorkflowAction(action: any): boolean {
  // Check if action has multiple sequential API calls
  // Check if action has error handling branches
  
  if (!action.ops || action.ops.length < 2) {
    return false;
  }
  
  // Count API calls
  const apiCalls = action.ops.filter((op: any) => 
    op.kind === 'call' || op.kind === 'load'
  );
  
  return apiCalls.length >= 2;
}

/**
 * Extract workflow steps from an action
 */
function extractStepsFromAction(action: any): WorkflowStep[] {
  const steps: WorkflowStep[] = [];
  
  action.ops.forEach((op: any, index: number) => {
    if (op.kind === 'call' || op.kind === 'load') {
      steps.push({
        name: `step${index + 1}`,
        action: `${op.method} ${op.path}`,
        onSuccess: index < action.ops.length - 1 ? `step${index + 2}` : undefined,
        onFailure: 'handleError'
      });
    }
  });
  
  return steps;
}
