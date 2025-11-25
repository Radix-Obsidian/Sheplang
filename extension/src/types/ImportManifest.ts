/**
 * Import Manifest – structured output from project detection
 * 
 * Consumed by analyzers and the semantic wizard.
 * All paths are relative to project root for portability.
 */

export interface ImportManifest {
  /** Project name from package.json or derived */
  projectName: string;
  
  /** Root directory of the analyzed project */
  projectRoot: string;
  
  /** Framework detection with confidence */
  framework: FrameworkDetection;
  
  /** TypeScript configuration presence */
  typescript: {
    enabled: boolean;
    configPath?: string;
  };
  
  /** Prisma ORM detection */
  prisma: {
    enabled: boolean;
    schemaPath?: string;
    clientVersion?: string;
  };
  
  /** Source directories to scan */
  sourcePaths: {
    app?: string;        // Next.js App Router
    pages?: string;      // Next.js Pages Router
    src?: string;        // Vite/React source
    components?: string; // Common components folder
  };
  
  /** API directories for route detection */
  apiPaths: {
    nextjs?: string;     // app/api/ or pages/api/
    express?: string;    // Custom Express routes
  };
  
  /** Detection confidence scores (0-1) */
  confidence: {
    framework: number;
    typescript: number;
    prisma: number;
    overall: number;
  };
  
  /** Unsupported features detected */
  unsupported: string[];
  
  /** Metadata */
  detectedAt: string;
  shepLangVersion: string;
}

export interface FrameworkDetection {
  type: 'nextjs' | 'vite' | 'react' | 'express' | 'unknown';
  version?: string;
  router?: 'app' | 'pages' | 'custom';
  confidence: number;
}
