/**
 * Phase 5: Validation Engine - Code Generation Templates
 * Following Zod patterns for TypeScript validation
 * Reference: https://zod.dev/api
 */

import type { AppModel } from '@goldensheepai/sheplang-language';

export interface ValidationRule {
  field: string;
  type: string;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  pattern?: string;
}

/**
 * Extract validation rules from data model
 */
export function extractValidationRules(dataModel: any): ValidationRule[] {
  const rules: ValidationRule[] = [];
  
  if (!dataModel.fields) return rules;
  
  for (const field of dataModel.fields) {
    const rule: ValidationRule = {
      field: field.name,
      type: field.type || 'text'
    };
    
    if (field.constraints) {
      for (const constraint of field.constraints) {
        // New constraint structure has type and value properties
        if (constraint.type === 'required') {
          rule.required = true;
        } else if (constraint.type === 'max') {
          rule.max = parseInt(constraint.value);
        } else if (constraint.type === 'min') {
          rule.min = parseInt(constraint.value);
        } else if (constraint.type === 'minLength') {
          rule.minLength = parseInt(constraint.value);
        } else if (constraint.type === 'maxLength') {
          rule.maxLength = parseInt(constraint.value);
        } else if (constraint.type === 'email') {
          rule.email = constraint.value === true;
        } else if (constraint.type === 'pattern') {
          rule.pattern = constraint.value;
        }
      }
    }
    
    rules.push(rule);
  }
  
  return rules;
}

/**
 * Generate frontend validation hook using Zod
 */
export function generateFrontendValidation(modelName: string, rules: ValidationRule[]): string {
  const zodFields = rules.map(rule => {
    let validation = '';
    
    // Base type
    if (rule.type === 'email' || rule.email) {
      validation = 'z.string().email()';
    } else if (rule.type === 'number') {
      validation = 'z.number()';
      if (rule.min !== undefined) validation += `.min(${rule.min})`;
      if (rule.max !== undefined) validation += `.max(${rule.max})`;
    } else if (rule.type === 'yes/no') {
      validation = 'z.boolean()';
    } else {
      validation = 'z.string()';
      if (rule.minLength !== undefined) validation += `.min(${rule.minLength})`;
      if (rule.maxLength !== undefined) validation += `.max(${rule.maxLength})`;
      if (rule.pattern) validation += `.regex(new Regex(${rule.pattern}))`;
    }
    
    // Optional vs Required
    if (!rule.required) {
      validation += '.optional()';
    }
    
    return `  ${rule.field}: ${validation}`;
  }).join(',\n');
  
  return `// Auto-generated ${modelName} Validation
import { z } from 'zod';

export const ${modelName}Schema = z.object({
${zodFields}
});

export type ${modelName}Input = z.infer<typeof ${modelName}Schema>;

export function validate${modelName}(data: unknown) {
  return ${modelName}Schema.safeParse(data);
}

export function use${modelName}Validation() {
  const validate = (data: unknown) => {
    const result = ${modelName}Schema.safeParse(data);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0];
        if (field && typeof field === 'string') {
          errors[field] = err.message;
        }
      });
      return { success: false, errors };
    }
    
    return { success: true, data: result.data };
  };
  
  return { validate };
}
`;
}

/**
 * Generate backend validation middleware
 */
export function generateBackendValidation(modelName: string, rules: ValidationRule[]): string {
  const validations = rules.map(rule => {
    const checks: string[] = [];
    
    if (rule.required) {
      checks.push(`if (!data.${rule.field}) {
      errors.${rule.field} = '${rule.field} is required';
    }`);
    }
    
    if (rule.type === 'email' || rule.email) {
      checks.push(`if (data.${rule.field} && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.${rule.field})) {
      errors.${rule.field} = '${rule.field} must be a valid email';
    }`);
    }
    
    if (rule.type === 'number') {
      if (rule.min !== undefined) {
        checks.push(`if (data.${rule.field} !== undefined && data.${rule.field} < ${rule.min}) {
      errors.${rule.field} = '${rule.field} must be at least ${rule.min}';
    }`);
      }
      if (rule.max !== undefined) {
        checks.push(`if (data.${rule.field} !== undefined && data.${rule.field} > ${rule.max}) {
      errors.${rule.field} = '${rule.field} must be at most ${rule.max}';
    }`);
      }
    }
    
    if (rule.type === 'text' || rule.type === 'string') {
      if (rule.minLength !== undefined) {
        checks.push(`if (data.${rule.field} && data.${rule.field}.length < ${rule.minLength}) {
      errors.${rule.field} = '${rule.field} must be at least ${rule.minLength} characters';
    }`);
      }
      if (rule.maxLength !== undefined) {
        checks.push(`if (data.${rule.field} && data.${rule.field}.length > ${rule.maxLength}) {
      errors.${rule.field} = '${rule.field} must be at most ${rule.maxLength} characters';
    }`);
      }
    }
    
    return checks.join('\n    ');
  }).filter(Boolean).join('\n    ');
  
  return `// Auto-generated ${modelName} Validation Middleware
import { Request, Response, NextFunction } from 'express';

export interface ${modelName}ValidationErrors {
  [key: string]: string;
}

export function validate${modelName}(req: Request, res: Response, next: NextFunction) {
  const data = req.body;
  const errors: ${modelName}ValidationErrors = {};
  
  // Validation checks
  ${validations || '// No validation rules'}
  
  // If errors exist, return 400
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      errors 
    });
  }
  
  // Validation passed
  next();
}

export function validate${modelName}Partial(req: Request, res: Response, next: NextFunction) {
  const data = req.body;
  const errors: ${modelName}ValidationErrors = {};
  
  // Same validations but only for fields that are present
  ${validations.replace(/!data\./g, 'data.') || '// No validation rules'}
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      errors 
    });
  }
  
  next();
}
`;
}

/**
 * Generate validation for all models in app
 */
export function generateAppValidation(app: AppModel): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  
  for (const dataModel of app.datas) {
    const rules = extractValidationRules(dataModel);
    
    // Frontend validation
    files.push({
      path: `validation/${dataModel.name}Validation.ts`,
      content: generateFrontendValidation(dataModel.name, rules)
    });
    
    // Backend validation middleware
    files.push({
      path: `api/middleware/validate${dataModel.name}.ts`,
      content: generateBackendValidation(dataModel.name, rules)
    });
  }
  
  return files;
}
