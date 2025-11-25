/**
 * API Route types for Slice 5 - API & Backend Correlation
 * 
 * These types represent parsed Next.js API route handlers and 
 * their correlation with frontend API calls.
 */

/**
 * HTTP methods supported in Next.js App Router route handlers
 */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Prisma operations detected in route handlers
 */
export type PrismaOperation = 
  | 'findMany'
  | 'findUnique'
  | 'findFirst'
  | 'create'
  | 'createMany'
  | 'update'
  | 'updateMany'
  | 'delete'
  | 'deleteMany'
  | 'upsert';

/**
 * Dynamic route parameter from file path (e.g., [id])
 */
export interface RouteParam {
  name: string;          // e.g., "id"
  segment: string;       // e.g., "[id]"
  isCatchAll: boolean;   // [...slug] or [[...slug]]
  isOptional: boolean;   // [[...slug]]
}

/**
 * Represents a parsed Next.js API route handler
 * Phase 4: Now includes handler body for faithful translation
 */
export interface APIRoute {
  /** Full path (e.g., "/api/tasks" or "/api/tasks/:id") */
  path: string;
  
  /** HTTP method (GET, POST, PUT, DELETE, etc.) */
  method: HTTPMethod;
  
  /** Original file path to route.ts */
  filePath: string;
  
  /** Handler function name (usually matches method name) */
  handlerName: string;
  
  /** Dynamic route parameters extracted from path */
  params: RouteParam[];
  
  /** Detected Prisma operation in handler body */
  prismaOperation?: PrismaOperation;
  
  /** Prisma model being operated on */
  prismaModel?: string;
  
  /** Expected request body fields (for POST/PUT/PATCH) */
  bodyFields: string[];
  
  /** Returns JSON response */
  returnsJson: boolean;
  
  /** Response status code (if explicitly set) */
  statusCode?: number;
  
  /** Phase 4: Full handler body for faithful translation */
  handlerBody?: string;
  
  /** Phase 4: Translated ShepThon code */
  translatedShepThon?: string;
}

/**
 * Result of parsing all API routes in a project
 */
export interface APIRouteParseResult {
  routes: APIRoute[];
  errors: string[];
  warnings: string[];
}

/**
 * ShepThon endpoint definition
 */
export interface ShepThonEndpoint {
  /** HTTP method */
  method: HTTPMethod;
  
  /** Endpoint path (e.g., "/api/tasks/:id") */
  path: string;
  
  /** ShepThon database operation */
  operation: 'db.all' | 'db.get' | 'db.add' | 'db.update' | 'db.remove';
  
  /** Model/table name */
  model: string;
  
  /** Whether the operation uses request body */
  usesBody: boolean;
  
  /** Whether the operation uses path parameter */
  usesParams: boolean;
}

/**
 * Correlation between frontend API call and backend route
 */
export interface EndpointMatch {
  /** Frontend API call from component */
  frontendCall: {
    url: string;
    method: string;
    body?: any;
    sourceComponent: string;
    sourceHandler: string;
  };
  
  /** Matched backend route */
  backendRoute: APIRoute;
  
  /** Match confidence (0-1) */
  confidence: number;
  
  /** Match warnings */
  warnings: string[];
}

/**
 * Full API correlation result for a project
 */
export interface APICorrelation {
  /** All frontend API calls found */
  frontendCalls: EndpointMatch['frontendCall'][];
  
  /** All backend routes parsed */
  backendRoutes: APIRoute[];
  
  /** Successfully matched pairs */
  matches: EndpointMatch[];
  
  /** Frontend calls without matching backend routes */
  unmatchedFrontend: EndpointMatch['frontendCall'][];
  
  /** Backend routes without matching frontend calls */
  unmatchedBackend: APIRoute[];
  
  /** Overall correlation confidence */
  confidence: number;
}

/**
 * ShepThon file generation result
 */
export interface ShepThonFile {
  /** File path to write (e.g., "backend.shepthon") */
  filename: string;
  
  /** Generated ShepThon content */
  content: string;
  
  /** Models included */
  models: string[];
  
  /** Endpoints included */
  endpoints: ShepThonEndpoint[];
}
