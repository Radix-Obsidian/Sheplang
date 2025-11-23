/**
 * Phase 4-03: Advanced Validation - Code Generation
 * Generates validation code for frontend and backend
 */

import type { AppModel } from '@goldensheepai/sheplang-language';

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
}

/**
 * Generate frontend validation hook
 */
export function generateFrontendValidation(model: any): string {
  const modelName = model.name;
  const rules = extractValidationRules(model);
  
  if (rules.length === 0) {
    return '';
  }
  
  const validationChecks = rules.map(rule => generateValidationCheck(rule)).join('\n    ');
  
  return `// Auto-generated validation for ${modelName}
export function validate${modelName}(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  ${validationChecks}
  
  return {
    valid: errors.length === 0,
    errors
  };
}
`;
}

/**
 * Generate backend validation middleware
 */
export function generateBackendValidation(model: any): string {
  const modelName = model.name;
  const rules = extractValidationRules(model);
  
  if (rules.length === 0) {
    return '';
  }
  
  const validationChecks = rules.map(rule => generateValidationCheck(rule)).join('\n    ');
  
  return `// Auto-generated validation middleware for ${modelName}
export function validate${modelName}Middleware(req: any, res: any, next: any) {
  const errors: string[] = [];
  const data = req.body;
  
  ${validationChecks}
  
  if (errors.length > 0) {
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
 * Extract validation rules from data model
 */
function extractValidationRules(model: any): ValidationRule[] {
  const rules: ValidationRule[] = [];
  
  // Extract from fields
  model.fields.forEach((field: any) => {
    const fieldName = field.name;
    const fieldType = field.type?.base?.value || 'text';
    
    // Required check
    const isRequired = field.constraints?.some((c: any) => c.kind === 'required');
    if (isRequired) {
      rules.push({
        field: fieldName,
        rule: 'required',
        message: `${fieldName} is required`
      });
    }
    
    // Type-specific validation
    if (fieldType === 'email') {
      rules.push({
        field: fieldName,
        rule: 'email',
        message: `${fieldName} must be a valid email`
      });
    }
    
    if (fieldType === 'number') {
      rules.push({
        field: fieldName,
        rule: 'number',
        message: `${fieldName} must be a number`
      });
    }
    
    // Max constraint
    const maxConstraint = field.constraints?.find((c: any) => c.max);
    if (maxConstraint) {
      rules.push({
        field: fieldName,
        rule: `max:${maxConstraint.max}`,
        message: `${fieldName} must be less than ${maxConstraint.max}`
      });
    }
  });
  
  return rules;
}

/**
 * Generate validation check code
 */
function generateValidationCheck(rule: ValidationRule): string {
  switch (rule.rule) {
    case 'required':
      return `if (data.${rule.field} === undefined || data.${rule.field} === null || data.${rule.field} === '') {
      errors.push('${rule.message}');
    }`;
    
    case 'email':
      return `if (data.${rule.field} && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.${rule.field})) {
      errors.push('${rule.message}');
    }`;
    
    case 'number':
      return `if (data.${rule.field} && typeof data.${rule.field} !== 'number') {
      errors.push('${rule.message}');
    }`;
    
    default:
      if (rule.rule.startsWith('max:')) {
        const max = rule.rule.split(':')[1];
        return `if (data.${rule.field} && data.${rule.field} > ${max}) {
      errors.push('${rule.message}');
    }`;
      }
      return '';
  }
}
