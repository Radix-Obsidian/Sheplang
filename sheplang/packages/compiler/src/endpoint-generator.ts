/**
 * Phase 3-02: Generate backend endpoint code
 * Creates Express route handlers with validation and database operations
 */

import type { AppModel } from '@goldensheepai/sheplang-language';
import type { ExtractedEndpoint } from './endpoint-extractor.js';
import { inferModelFromPath } from './endpoint-extractor.js';

/**
 * Generate Express route handler code for an endpoint
 */
export function generateEndpointHandler(
  endpoint: ExtractedEndpoint,
  app: AppModel
): string {
  const { method, path, fields, hasPathParams, pathParams } = endpoint;
  
  // Infer the data model from the path
  const modelName = inferModelFromPath(path, app);
  const modelLower = modelName ? modelName.toLowerCase() : 'item';
  
  // Convert path to Express route format (already has :param syntax)
  const expressPath = convertToExpressPath(path);
  
  // Generate the handler based on HTTP method
  switch (method) {
    case 'GET':
      return generateGetHandler(expressPath, modelLower, hasPathParams);
    case 'POST':
      return generatePostHandler(expressPath, modelLower, fields);
    case 'PUT':
      return generatePutHandler(expressPath, modelLower, fields, hasPathParams);
    case 'PATCH':
      return generatePatchHandler(expressPath, modelLower, fields, hasPathParams);
    case 'DELETE':
      return generateDeleteHandler(expressPath, modelLower, hasPathParams);
    default:
      return '';
  }
}

/**
 * Convert path to Express route format
 * Already uses :param syntax, just needs cleaning
 */
function convertToExpressPath(path: string): string {
  // Remove leading slash if present for consistency
  return path.startsWith('/') ? path.substring(1) : path;
}

/**
 * Generate GET request handler
 */
function generateGetHandler(
  path: string,
  modelName: string,
  hasPathParam: boolean
): string {
  if (hasPathParam) {
    // GET by ID
    return `
// GET ${path}
router.get('/${path}', async (req, res) => {
  try {
    const item = await prisma.${modelName}.findUnique({
      where: { id: req.params.id }
    });
    
    if (!item) {
      return res.status(404).json({ 
        error: '${modelName} not found',
        id: req.params.id 
      });
    }
    
    res.json(item);
  } catch (error: any) {
    console.error('Error fetching ${modelName}:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ${modelName}',
      message: error.message 
    });
  }
});`;
  } else {
    // GET all
    return `
// GET ${path}
router.get('/${path}', async (req, res) => {
  try {
    const items = await prisma.${modelName}.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching ${modelName}s:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ${modelName}s',
      message: error.message 
    });
  }
});`;
  }
}

/**
 * Generate POST request handler with validation
 */
function generatePostHandler(
  path: string,
  modelName: string,
  fields: string[]
): string {
  const validation = generateValidation(fields);
  const fieldsList = fields.length > 0 ? fields.join(', ') : 'req.body';
  const dataObject = fields.length > 0 
    ? `{ ${fields.join(', ')} }` 
    : 'req.body';

  return `
// POST ${path}
router.post('/${path}', async (req, res) => {
  try {
    ${validation}
    
    const item = await prisma.${modelName}.create({
      data: ${dataObject}
    });
    
    res.status(201).json(item);
  } catch (error: any) {
    console.error('Error creating ${modelName}:', error);
    res.status(500).json({ 
      error: 'Failed to create ${modelName}',
      message: error.message 
    });
  }
});`;
}

/**
 * Generate PUT request handler with validation
 */
function generatePutHandler(
  path: string,
  modelName: string,
  fields: string[],
  hasPathParam: boolean
): string {
  const validation = generateValidation(fields);
  const dataObject = fields.length > 0 
    ? `{ ${fields.join(', ')} }` 
    : 'req.body';

  return `
// PUT ${path}
router.put('/${path}', async (req, res) => {
  try {
    ${validation}
    
    const item = await prisma.${modelName}.update({
      where: { id: req.params.id },
      data: ${dataObject}
    });
    
    res.json(item);
  } catch (error: any) {
    console.error('Error updating ${modelName}:', error);
    res.status(500).json({ 
      error: 'Failed to update ${modelName}',
      message: error.message 
    });
  }
});`;
}

/**
 * Generate PATCH request handler with validation
 */
function generatePatchHandler(
  path: string,
  modelName: string,
  fields: string[],
  hasPathParam: boolean
): string {
  const validation = generateValidation(fields);
  const dataObject = fields.length > 0 
    ? `{ ${fields.join(', ')} }` 
    : 'req.body';

  return `
// PATCH ${path}
router.patch('/${path}', async (req, res) => {
  try {
    ${validation}
    
    const item = await prisma.${modelName}.update({
      where: { id: req.params.id },
      data: ${dataObject}
    });
    
    res.json(item);
  } catch (error: any) {
    console.error('Error updating ${modelName}:', error);
    res.status(500).json({ 
      error: 'Failed to update ${modelName}',
      message: error.message 
    });
  }
});`;
}

/**
 * Generate DELETE request handler
 */
function generateDeleteHandler(
  path: string,
  modelName: string,
  hasPathParam: boolean
): string {
  return `
// DELETE ${path}
router.delete('/${path}', async (req, res) => {
  try {
    await prisma.${modelName}.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting ${modelName}:', error);
    res.status(500).json({ 
      error: 'Failed to delete ${modelName}',
      message: error.message 
    });
  }
});`;
}

/**
 * Generate request validation code for fields
 */
function generateValidation(fields: string[]): string {
  if (fields.length === 0) {
    return '// No validation needed';
  }

  const destructure = `const { ${fields.join(', ')} } = req.body;`;
  const checks = fields.map(field => 
    `if (${field} === undefined || ${field} === null) {
      return res.status(400).json({ 
        error: 'Missing required field: ${field}' 
      });
    }`
  ).join('\n    ');

  return `${destructure}
    
    // Validate required fields
    ${checks}`;
}

/**
 * Generate complete router file with all endpoints for a base path
 */
export function generateRouterFile(
  basePath: string,
  endpoints: ExtractedEndpoint[],
  app: AppModel
): { path: string; content: string } {
  const modelName = inferModelFromPath(basePath, app);
  const routeName = basePath.replace(/^\//, '').replace(/\//g, '-');
  
  // Generate all handlers
  const handlers = endpoints.map(endpoint => 
    generateEndpointHandler(endpoint, app)
  ).join('\n');

  const content = `// Auto-generated by ShepLang - Phase 3-02
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
${handlers}

export default router;
`;

  return {
    path: `api/routes/${routeName}.ts`,
    content
  };
}
