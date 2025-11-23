/**
 * Phase 4-01: Workflow Orchestration - Code Generation
 * Generates workflow orchestration code
 */

import type { WorkflowDefinition, WorkflowStep } from './workflow-extractor';

/**
 * Generate workflow orchestration class
 */
export function generateWorkflowClass(workflow: WorkflowDefinition): string {
  const stepMethods = workflow.steps.map(step => generateStepMethod(step)).join('\n\n');
  
  return `// Auto-generated Workflow: ${workflow.name}
import { PrismaClient } from '@prisma/client';

export class ${workflow.name}Workflow {
  private prisma: PrismaClient;
  private state: Map<string, any>;
  
  constructor() {
    this.prisma = new PrismaClient();
    this.state = new Map();
  }
  
  async execute(input: any): Promise<any> {
    try {
      this.state.set('input', input);
      return await this.${workflow.initialStep}();
    } catch (error) {
      console.error('Workflow ${workflow.name} failed:', error);
      return await this.handleError(error);
    }
  }
  
${stepMethods}
  
  private async handleError(error: any): Promise<any> {
    console.error('Workflow error:', error);
    return {
      success: false,
      error: error.message,
      step: this.state.get('currentStep')
    };
  }
}
`;
}

/**
 * Generate individual step method
 */
function generateStepMethod(step: WorkflowStep): string {
  const [method, path] = step.action.split(' ');
  
  return `  private async ${step.name}(): Promise<any> {
    this.state.set('currentStep', '${step.name}');
    console.log('Executing step: ${step.name}');
    
    try {
      // Execute ${method} ${path}
      const response = await fetch('${path}', {
        method: '${method}',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state.get('input'))
      });
      
      if (!response.ok) {
        throw new Error(\`Step ${step.name} failed: \${response.statusText}\`);
      }
      
      const result = await response.json();
      this.state.set('${step.name}_result', result);
      
      ${step.onSuccess ? `return await this.${step.onSuccess}();` : 'return result;'}
    } catch (error) {
      ${step.onFailure ? `return await this.${step.onFailure}();` : 'throw error;'}
    }
  }`;
}

/**
 * Generate workflow router for Express
 */
export function generateWorkflowRouter(workflow: WorkflowDefinition): string {
  return `// Auto-generated Workflow Router: ${workflow.name}
import { Router } from 'express';
import { ${workflow.name}Workflow } from '../workflows/${workflow.name}';

const router = Router();

router.post('/${workflow.name.toLowerCase()}', async (req, res) => {
  try {
    const workflow = new ${workflow.name}Workflow();
    const result = await workflow.execute(req.body);
    
    if (result.success === false) {
      return res.status(500).json(result);
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('Workflow execution error:', error);
    res.status(500).json({
      error: 'Workflow execution failed',
      message: error.message
    });
  }
});

export default router;
`;
}
