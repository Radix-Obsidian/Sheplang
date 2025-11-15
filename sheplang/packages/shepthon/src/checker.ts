/**
 * ShepThon Semantic Checker
 * 
 * Validates ShepThon AST for:
 * - Model name uniqueness
 * - Endpoint path+method uniqueness
 * - Job name uniqueness
 * - Type validity
 * - Field name uniqueness within models
 * 
 * Returns structured diagnostics for errors/warnings.
 */

import type {
  ShepThonApp,
  ModelDefinition,
  EndpointDefinition,
  JobDefinition,
  FieldDefinition,
  Diagnostic
} from './types.js';

/**
 * Checker result with diagnostics
 */
export interface CheckResult {
  valid: boolean;
  diagnostics: Diagnostic[];
}

/**
 * Valid ShepThon types
 */
const VALID_TYPES = new Set([
  'string',
  'number',
  'bool',
  'datetime',
  'id'
]);

/**
 * Valid job schedule units
 */
const VALID_SCHEDULE_UNITS = new Set([
  'minutes',
  'minute',
  'hours',
  'hour',
  'days',
  'day'
]);

/**
 * Check a ShepThon application for semantic errors
 * 
 * @param app - Parsed ShepThon application
 * @returns Check result with diagnostics
 * 
 * @example
 * const parseResult = parseShepThon(source);
 * if (parseResult.app) {
 *   const checkResult = checkShepThon(parseResult.app);
 *   if (!checkResult.valid) {
 *     console.error('Validation errors:', checkResult.diagnostics);
 *   }
 * }
 */
export function checkShepThon(app: ShepThonApp): CheckResult {
  const diagnostics: Diagnostic[] = [];

  // Check model name uniqueness
  checkModelNameUniqueness(app.models, diagnostics);

  // Check each model's fields
  for (const model of app.models) {
    checkModelFields(model, diagnostics);
  }

  // Check endpoint uniqueness (method + path)
  checkEndpointUniqueness(app.endpoints, diagnostics);

  // Check endpoint types and references
  for (const endpoint of app.endpoints) {
    checkEndpointTypes(endpoint, app.models, diagnostics);
  }

  // Check job name uniqueness
  checkJobNameUniqueness(app.jobs, diagnostics);

  // Check job schedules
  for (const job of app.jobs) {
    checkJobSchedule(job, diagnostics);
  }

  return {
    valid: diagnostics.filter(d => d.severity === 'error').length === 0,
    diagnostics
  };
}

/**
 * Check that all model names are unique
 */
function checkModelNameUniqueness(models: ModelDefinition[], diagnostics: Diagnostic[]): void {
  const seen = new Map<string, ModelDefinition>();

  for (const model of models) {
    const existing = seen.get(model.name);
    if (existing) {
      diagnostics.push({
        severity: 'error',
        message: `Duplicate model name '${model.name}'. Model names must be unique.`,
        line: 0,
        column: 0
      });
    } else {
      seen.set(model.name, model);
    }
  }
}

/**
 * Check model fields for uniqueness and valid types
 */
function checkModelFields(model: ModelDefinition, diagnostics: Diagnostic[]): void {
  const seen = new Map<string, FieldDefinition>();

  for (const field of model.fields) {
    // Check field name uniqueness within model
    const existing = seen.get(field.name);
    if (existing) {
      diagnostics.push({
        severity: 'error',
        message: `Duplicate field name '${field.name}' in model '${model.name}'. Field names must be unique within a model.`,
        line: 0,
        column: 0
      });
    } else {
      seen.set(field.name, field);
    }

    // Check field type validity
    if (!VALID_TYPES.has(field.type)) {
      diagnostics.push({
        severity: 'error',
        message: `Invalid type '${field.type}' for field '${field.name}' in model '${model.name}'. Valid types are: ${Array.from(VALID_TYPES).join(', ')}.`,
        line: 0,
        column: 0
      });
    }

    // Warning: 'id' type should typically only be used for id field
    if (field.type === 'id' && field.name !== 'id') {
      diagnostics.push({
        severity: 'warning',
        message: `Field '${field.name}' has type 'id' but is not named 'id'. This is unusual. Consider using 'string' or renaming the field.`,
        line: 0,
        column: 0
      });
    }
  }

  // Check that model has at least one field
  if (model.fields.length === 0) {
    diagnostics.push({
      severity: 'warning',
      message: `Model '${model.name}' has no fields. Consider adding fields or removing the model.`,
      line: 0,
      column: 0
    });
  }
}

/**
 * Check that endpoint method+path combinations are unique
 */
function checkEndpointUniqueness(endpoints: EndpointDefinition[], diagnostics: Diagnostic[]): void {
  const seen = new Map<string, EndpointDefinition>();

  for (const endpoint of endpoints) {
    const key = `${endpoint.method} ${endpoint.path}`;
    const existing = seen.get(key);
    
    if (existing) {
      diagnostics.push({
        severity: 'error',
        message: `Duplicate endpoint '${key}'. Each method+path combination must be unique.`,
        line: 0,
        column: 0
      });
    } else {
      seen.set(key, endpoint);
    }
  }
}

/**
 * Check endpoint return types and parameter types
 */
function checkEndpointTypes(
  endpoint: EndpointDefinition,
  models: ModelDefinition[],
  diagnostics: Diagnostic[]
): void {
  const modelNames = new Set(models.map(m => m.name));

  // Check return type
  const returnType = endpoint.returnType.type;
  if (!VALID_TYPES.has(returnType) && !modelNames.has(returnType)) {
    diagnostics.push({
      severity: 'error',
      message: `Invalid return type '${returnType}' for endpoint '${endpoint.method} ${endpoint.path}'. Must be a valid type or model name.`,
      line: 0,
      column: 0
    });
  }

  // Check parameter types
  for (const param of endpoint.parameters) {
    if (!VALID_TYPES.has(param.type) && !modelNames.has(param.type)) {
      diagnostics.push({
        severity: 'error',
        message: `Invalid parameter type '${param.type}' for parameter '${param.name}' in endpoint '${endpoint.method} ${endpoint.path}'. Must be a valid type or model name.`,
        line: 0,
        column: 0
      });
    }
  }
}

/**
 * Check that job names are unique
 */
function checkJobNameUniqueness(jobs: JobDefinition[], diagnostics: Diagnostic[]): void {
  const seen = new Map<string, JobDefinition>();

  for (const job of jobs) {
    const existing = seen.get(job.name);
    if (existing) {
      diagnostics.push({
        severity: 'error',
        message: `Duplicate job name '${job.name}'. Job names must be unique.`,
        line: 0,
        column: 0
      });
    } else {
      seen.set(job.name, job);
    }
  }
}

/**
 * Check job schedule validity
 */
function checkJobSchedule(job: JobDefinition, diagnostics: Diagnostic[]): void {
  const { every, unit } = job.schedule;

  // Check unit is valid
  if (!VALID_SCHEDULE_UNITS.has(unit)) {
    diagnostics.push({
      severity: 'error',
      message: `Invalid schedule unit '${unit}' for job '${job.name}'. Valid units are: minutes, hours, days.`,
      line: 0,
      column: 0
    });
  }

  // Check interval is positive
  if (every <= 0) {
    diagnostics.push({
      severity: 'error',
      message: `Invalid schedule interval '${every}' for job '${job.name}'. Interval must be a positive number.`,
      line: 0,
      column: 0
    });
  }

  // Warning: very frequent jobs
  if (unit === 'minutes' && every < 5) {
    diagnostics.push({
      severity: 'warning',
      message: `Job '${job.name}' runs every ${every} minute(s). This is very frequent. Consider increasing the interval.`,
      line: 0,
      column: 0
    });
  }

  // Warning: very infrequent jobs (for dev/testing purposes)
  if (unit === 'days' && every > 7) {
    diagnostics.push({
      severity: 'warning',
      message: `Job '${job.name}' runs every ${every} day(s). This is very infrequent. Consider if this is intentional.`,
      line: 0,
      column: 0
    });
  }
}

/**
 * Export all validation functions for testing
 */
export {
  checkModelNameUniqueness,
  checkModelFields,
  checkEndpointUniqueness,
  checkEndpointTypes,
  checkJobNameUniqueness,
  checkJobSchedule,
  VALID_TYPES,
  VALID_SCHEDULE_UNITS
};
