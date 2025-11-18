/**
 * ShepThon Parser
 * 
 * Parses .shepthon backend files into endpoint registry
 * Used for validating API calls in ShepLang code
 */

export interface ShepThonModel {
  name: string;
  fields: Array<{ name: string; type: string }>;
}

export interface ShepThonEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  params?: string[];
  returnType?: { base: string; isArray?: boolean };
}

export interface ShepThonBackend {
  models: ShepThonModel[];
  endpoints: ShepThonEndpoint[];
}

/**
 * Parse a ShepThon backend file
 * 
 * @example
 * ```typescript
 * const shepthon = `
 * model User {
 *   name: string
 *   email: string
 * }
 * 
 * GET /users -> db.all("users")
 * POST /users -> db.add("users", body)
 * `;
 * 
 * const backend = parseShepThon(shepthon);
 * // backend.models = [{ name: 'User', fields: [...] }]
 * // backend.endpoints = [{ method: 'GET', path: '/users', ... }]
 * ```
 */
export function parseShepThon(content: string): ShepThonBackend {
  const models: ShepThonModel[] = [];
  const endpoints: ShepThonEndpoint[] = [];
  
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let currentModel: ShepThonModel | null = null;
  let inModelBlock = false;
  
  for (const line of lines) {
    // Model definition start: "model User {"
    if (line.startsWith('model ') && line.includes('{')) {
      const modelName = line.match(/model\s+(\w+)/)?.[1];
      if (modelName) {
        currentModel = { name: modelName, fields: [] };
        inModelBlock = true;
      }
    }
    // Model definition end: "}"
    else if (line === '}' && inModelBlock) {
      if (currentModel) {
        models.push(currentModel);
        currentModel = null;
      }
      inModelBlock = false;
    }
    // Model field: "name: string"
    else if (inModelBlock && line.includes(':')) {
      const [fieldName, fieldType] = line.split(':').map(s => s.trim());
      if (currentModel && fieldName && fieldType) {
        currentModel.fields.push({ 
          name: fieldName, 
          type: fieldType 
        });
      }
    }
    // Endpoint definition: "GET /users -> db.all("users")"
    else if (/^(GET|POST|PUT|DELETE|PATCH)\s+\//.test(line)) {
      const match = line.match(/^(GET|POST|PUT|DELETE|PATCH)\s+(\/[^\s]+)/);
      if (match) {
        const [, method, path] = match;
        
        // Extract path parameters (e.g., /users/:id)
        const params = (path.match(/:(\w+)/g) || []).map(p => p.slice(1));
        
        // Infer return type from method and path
        let returnType: ShepThonEndpoint['returnType'];
        if (method === 'GET') {
          // GET endpoints return arrays
          const modelName = extractModelNameFromPath(path);
          returnType = modelName 
            ? { base: modelName, isArray: true }
            : { base: 'any', isArray: true };
        } else if (method === 'POST') {
          // POST returns the created item
          const modelName = extractModelNameFromPath(path);
          returnType = modelName 
            ? { base: modelName }
            : { base: 'any' };
        } else {
          // DELETE, PUT, PATCH return void or updated item
          returnType = { base: 'void' };
        }
        
        endpoints.push({
          method: method as ShepThonEndpoint['method'],
          path,
          params: params.length > 0 ? params : undefined,
          returnType
        });
      }
    }
  }
  
  return { models, endpoints };
}

/**
 * Extract model name from endpoint path
 * Examples:
 *   /users -> User
 *   /todos -> Todo
 *   /users/:id -> User
 */
function extractModelNameFromPath(path: string): string | undefined {
  // Remove path parameters
  const cleanPath = path.replace(/:\w+/g, '').replace(/\//g, '');
  
  if (!cleanPath) return undefined;
  
  // Singularize and capitalize
  // users -> User, todos -> Todo
  let singular = cleanPath;
  if (singular.endsWith('s')) {
    singular = singular.slice(0, -1);
  }
  
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}

/**
 * Find an endpoint in the backend
 */
export function findEndpoint(
  backend: ShepThonBackend,
  method: string,
  path: string
): ShepThonEndpoint | undefined {
  return backend.endpoints.find(ep => {
    if (ep.method !== method) return false;
    
    // Exact match
    if (ep.path === path) return true;
    
    // Match with path parameters
    // /users/:id matches /users/123
    if (ep.path.includes(':')) {
      const epParts = ep.path.split('/');
      const pathParts = path.split('/');
      
      if (epParts.length !== pathParts.length) return false;
      
      return epParts.every((part, i) => {
        return part.startsWith(':') || part === pathParts[i];
      });
    }
    
    return false;
  });
}
